package com.akshansh.chessweb.service;

import com.akshansh.chessweb.model.entity.GameSession;
import com.akshansh.chessweb.model.dto.MoveDto;
import com.akshansh.chessweb.model.dto.MoveRequest;
import com.akshansh.chessweb.model.dto.MoveResult;
import com.akshansh.chessweb.model.entity.MoveRecord;
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

    public MoveResult validate(GameSession session, MoveRequest request){

        if(session.getStatus() != GameStatus.ACTIVE){
            return invalid("GAME_NOT_ACTIVE");
        }

        Color color = resolveColor(session, request.getPlayerId());
        if (color == null) {
            return invalid("PLAYER_NOT_IN_GAME");
        }

        if(!session.getCurrentTurn().equals(color)){
            return invalid("NOT_YOUR_TURN");
        }

        Board board = new Board();
        if (session.getMoveRecordHistory() != null && !session.getMoveRecordHistory().isEmpty()) {
            for (MoveRecord historyMoveRecord : session.getMoveRecordHistory()) {
                Move m = buildMove(historyMoveRecord);
                if (m != null) {
                    board.doMove(m);
                }
            }
        } else {
            board.loadFromFen(session.getCurrentFen());
        }

        MoveDto dto = request.getMove();
        Move move = buildMove(dto);
        if (move == null) {
            return invalid("MALFORMED_MOVE");
        }

        List<Move> legalMoves = board.legalMoves();
        if (!legalMoves.contains(move)) {
            return invalid("ILLEGAL_MOVE");
        }

        board.doMove(move);

        return MoveResult.builder()
                .valid(true)
                .newFen(board.getFen())
                .san(buildSan(session.getCurrentFen(), move))
                .pieceMoved(dto.getTo())
                .capture(isCapture(board, move) || isEnPassant(board, move))
                .check(board.isKingAttacked())
                .checkmate(board.isMated())
                .stalemate(board.isStaleMate())
                .insufficientMaterial(board.isInsufficientMaterial())
                .repetition(board.isRepetition())
                .castling(isCastling(dto))
                .enPassant(isEnPassant(board, move))
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

    private Move buildMove(MoveDto dto) {
        try {
            Square from = Square.fromValue(dto.getFrom().toUpperCase()); // "e2" → E2
            Square to   = Square.fromValue(dto.getTo().toUpperCase());   // "e4" → E4

            if (dto.getPromotionPiece() != null) {
                // Promotion: e.g. "e7" → "e8" with "Q"
                Piece promo = Piece.fromFenSymbol(dto.getPromotionPiece());
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

    private Move buildMove(MoveRecord moveRecord) {
        try {
            Square from = Square.fromValue(moveRecord.getFromSquare().toUpperCase());
            Square to   = Square.fromValue(moveRecord.getToSquare().toUpperCase());

            if (moveRecord.getPromotionPiece() != null && !moveRecord.getPromotionPiece().toString().isEmpty()) {
                Piece promo = Piece.fromFenSymbol(moveRecord.getPromotionPiece().toString());
                return new Move(from, to, promo);
            }

            return new Move(from, to);
        } catch (Exception e) {
            return null;
        }
    }

    private boolean isCastling(MoveDto dto) {
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
