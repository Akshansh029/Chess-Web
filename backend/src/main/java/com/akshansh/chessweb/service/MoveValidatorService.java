package com.akshansh.chessweb.service;

import com.akshansh.chessweb.model.entity.GameSession;
import com.akshansh.chessweb.model.dto.RequestMoveDto;
import com.akshansh.chessweb.model.dto.MoveRequest;
import com.akshansh.chessweb.model.dto.MoveResult;
import com.akshansh.chessweb.model.entity.MoveDto;
import com.akshansh.chessweb.model.enums.Color;
import com.akshansh.chessweb.model.enums.GameStatus;
import com.github.bhlangonijr.chesslib.*;
import com.github.bhlangonijr.chesslib.move.Move;
import com.github.bhlangonijr.chesslib.move.MoveList;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class MoveValidatorService {

    public MoveResult validate(GameSession session, MoveRequest request, UUID playerId){

        if(session.getStatus() != GameStatus.ACTIVE){
            return invalid("GAME_NOT_ACTIVE");
        }

        Color color = resolveColor(session, playerId);
        if (color == null) {
            return invalid("PLAYER_NOT_IN_GAME");
        }

        if(!session.getCurrentTurn().equals(color)){
            return invalid("NOT_YOUR_TURN");
        }

        Board board = new Board();
        if (session.getMoveDtoHistory() != null && !session.getMoveDtoHistory().isEmpty()) {
            for (MoveDto historyMoveDto : session.getMoveDtoHistory()) {
                Move m = buildMove(historyMoveDto);
                if (m != null) {
                    board.doMove(m);
                }
            }
        } else {
            board.loadFromFen(session.getCurrentFen());
        }

        RequestMoveDto dto = request.getMove();
        Move move = buildMove(board, dto);
        if (move == null) {
            return invalid("MALFORMED_MOVE");
        }

        List<Move> legalMoves = board.legalMoves();
        if (!legalMoves.contains(move)) {
            return invalid("ILLEGAL_MOVE");
        }

        boolean capture = isCapture(board, move);
        boolean enPassant = isEnPassant(board, move);

        board.doMove(move);

        return MoveResult.builder()
                .valid(true)
                .newFen(board.getFen())
                .san(buildSan(session.getCurrentFen(), move))
                .pieceMoved(dto.getTo())
                .capture(capture || enPassant)
                .check(board.isKingAttacked())
                .checkmate(board.isMated())
                .stalemate(board.isStaleMate())
                .insufficientMaterial(board.isInsufficientMaterial())
                .repetition(board.isRepetition())
                .castling(isCastling(dto))
                .enPassant(enPassant)
                .promotion(dto.getPromotionPiece() != null)
                .build();
    }

    private String buildSan(String fenBefore, Move move) {
        try {
            MoveList moveList = new MoveList(fenBefore);
            moveList.add(move);
            return moveList.toSan().trim(); // e.g. "1. e4" → trim to just "e4"
        } catch (Exception e) {
            return move.getFrom().toString().toLowerCase()
                    + move.getTo().toString().toLowerCase();
        }
    }

    private Move buildMove(Board board, RequestMoveDto requestMoveDto) {
        try {
            Square from = Square.fromValue(requestMoveDto.getFrom().toUpperCase()); // "e2" → E2
            Square to   = Square.fromValue(requestMoveDto.getTo().toUpperCase());   // "e4" → E4

            if (requestMoveDto.getPromotionPiece() != null && !requestMoveDto.getPromotionPiece().isEmpty()) {
                Side side = board.getPiece(from).getPieceSide();
                String symbol = requestMoveDto.getPromotionPiece().toUpperCase();
                Piece promo;
                if (side == Side.WHITE) {
                    promo = Piece.fromFenSymbol(symbol);
                } else {
                    promo = Piece.fromFenSymbol(symbol.toLowerCase());
                }
                return new Move(from, to, promo);
            }

            return new Move(from, to);
        } catch (Exception e) {
            return null;
        }
    }

    private boolean isCapture(Board board, Move move) {
        Piece targetPiece = board.getPiece(move.getTo());
        if (targetPiece == null || targetPiece.equals(Piece.NONE)) return false;

        Side movingSide = board.getSideToMove();
        return !targetPiece.getPieceSide().equals(movingSide);
    }

    private Color resolveColor(GameSession session, UUID playerId) {
        if (playerId.equals(session.getWhitePlayerId())) return Color.WHITE;
        if (playerId.equals(session.getBlackPlayerId())) return Color.BLACK;
        return null;
    }

    private MoveResult invalid(String reason) {
        return MoveResult.builder().valid(false).rejectionReason(reason).build();
    }

    private Move buildMove(MoveDto moveDto) {
        try {
            Square from = Square.fromValue(moveDto.getFromSquare().toUpperCase());
            Square to   = Square.fromValue(moveDto.getToSquare().toUpperCase());

            if (moveDto.getPromotionPiece() != null) {
                boolean isWhite = moveDto.getColor() == Color.WHITE;
                String symbol = "";
                switch (moveDto.getPromotionPiece()) {
                    case Q: symbol = "q"; break;
                    case R: symbol = "r"; break;
                    case B: symbol = "b"; break;
                    case N: symbol = "n"; break;
                    default: break;
                }
                if (isWhite) {
                    symbol = symbol.toUpperCase();
                }
                Piece promo = Piece.fromFenSymbol(symbol);
                return new Move(from, to, promo);
            }

            return new Move(from, to);
        } catch (Exception e) {
            return null;
        }
    }

    private boolean isCastling(RequestMoveDto dto) {
        // Castling is always king moving exactly 2 squares horizontally
        return dto.getFrom().charAt(0) == 'e' &&
                (dto.getTo().equals("g1") || dto.getTo().equals("c1") ||
                        dto.getTo().equals("g8") || dto.getTo().equals("c8"));
    }

    private boolean isEnPassant(Board board, Move move) {
        Piece movingPiece = board.getPiece(move.getFrom());
        if (movingPiece == null || movingPiece.equals(Piece.NONE)) return false;

        // Must be a pawn
        if (!movingPiece.getPieceType().equals(PieceType.PAWN)) return false;

        // Must move diagonally
        boolean isDiagonal = !move.getFrom().getFile().equals(move.getTo().getFile());
        if (!isDiagonal) return false;

        // Destination square must be empty
        boolean destinationEmpty = board.getPiece(move.getTo()).equals(Piece.NONE);
        if (!destinationEmpty) return false;

        Square epTarget = board.getEnPassantTarget();
        return move.getTo().equals(epTarget);
    }
}
