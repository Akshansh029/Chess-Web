-- =============================================================================
-- V1__init_schema.sql
-- Live Chess — Initial Schema
-- Flyway migration: run once on fresh DB
-- =============================================================================


-- =============================================================================
-- EXTENSIONS
-- =============================================================================

-- Required for gen_random_uuid() used as UUID defaults
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =============================================================================
-- ENUMS
-- Defined before tables so columns can reference them.
-- Use ALTER TYPE ... ADD VALUE to extend later — never recreate.
-- =============================================================================

CREATE TYPE game_status AS ENUM (
    'WAITING',        -- created, waiting for second player
    'ACTIVE',         -- both players joined, game in progress
    'ENDED',          -- game finished (any reason)
    'ABANDONED'       -- player disconnected and never came back
);

CREATE TYPE game_result AS ENUM (
    'WHITE_WON',
    'BLACK_WON',
    'DRAW'
);

CREATE TYPE termination_reason AS ENUM (
    'CHECKMATE',
    'RESIGNATION',
    'TIMEOUT',
    'STALEMATE',
    'INSUFFICIENT_MATERIAL',  -- e.g. King vs King
    'FIFTY_MOVE_RULE',
    'REPETITION',
    'DRAW_ACCEPTED',       -- both players agreed to draw
    'ABANDONED'
);

CREATE TYPE piece_color AS ENUM (
    'WHITE',
    'BLACK'
);

-- Piece codes follow standard chess notation
CREATE TYPE piece_type AS ENUM (
    'P',   -- Pawn
    'N',   -- Knight
    'B',   -- Bishop
    'R',   -- Rook
    'Q',   -- Queen
    'K'    -- King
);


-- =============================================================================
-- TABLE: users
-- Core identity table. One row per registered player.
-- =============================================================================

CREATE TABLE users (
                       id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
                       username            VARCHAR(50)     NOT NULL,
                       email               VARCHAR(255)    NOT NULL,
                       password_hash       VARCHAR(255)    NOT NULL,   -- bcrypt hash, never plaintext
                       elo_rating          INTEGER         NOT NULL DEFAULT 800,
                       is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
                       created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
                       last_login_at       TIMESTAMPTZ,               -- NULL until first login

                       CONSTRAINT uq_users_username    UNIQUE (username),
                       CONSTRAINT uq_users_email       UNIQUE (email),

    -- ELO floor: no one can drop below 100 no matter how many games they lose
                       CONSTRAINT chk_users_elo_min    CHECK (elo_rating >= 100),
    -- ELO ceiling: practical upper bound
                       CONSTRAINT chk_users_elo_max    CHECK (elo_rating <= 3500),

    -- Username rules: 3–32 chars, alphanumeric + underscores only
                       CONSTRAINT chk_users_username_length    CHECK (LENGTH(username) >= 3),
                       CONSTRAINT chk_users_username_chars     CHECK (username ~ '^[a-zA-Z0-9_]+$'),

    -- Basic email format sanity check
                       CONSTRAINT chk_users_email_format       CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- =============================================================================
-- TABLE: refresh_tokens
-- Stores long-lived refresh tokens for JWT auth.
-- One row per active device/session. Multiple rows allowed per user.
-- =============================================================================

CREATE TABLE refresh_tokens (
                                id              UUID        DEFAULT gen_random_uuid()  NOT NULL,
                                token_hash      VARCHAR(64)                            NOT NULL,  -- SHA-256 hex of the raw refresh token
                                user_id         UUID                                   NOT NULL,  -- FK to your users table
                                family_id       UUID                                   NOT NULL,  -- groups the rotation chain; used for reuse detection
                                used            BOOLEAN     DEFAULT FALSE              NOT NULL,  -- flipped to TRUE once this token is rotated out
                                expires_at      TIMESTAMPTZ                              NOT NULL,  -- absolute expiry of this refresh token
                                created_at      TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP NOT NULL,

                                CONSTRAINT pk_refresh_tokens
                                    PRIMARY KEY (id),

                                CONSTRAINT uq_refresh_tokens_token_hash
                                    UNIQUE (token_hash),

                                CONSTRAINT fk_refresh_tokens_user
                                    FOREIGN KEY (user_id) REFERENCES users (id)
                                        ON DELETE CASCADE
);

-- Fast lookup by token_hash on every /auth/refresh call
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens (token_hash);

-- Fast family-wide invalidation on reuse detection
CREATE INDEX idx_refresh_tokens_family_id  ON refresh_tokens (family_id);

-- Fast per-user invalidation on "logout all devices"
CREATE INDEX idx_refresh_tokens_user_id    ON refresh_tokens (user_id);


-- =============================================================================
-- TABLE: games
-- One row per chess game (live or completed).
-- Created when a player creates a lobby. Updated when game ends.
-- =============================================================================

CREATE TABLE games (
                       id                  UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
                       white_player_id     UUID                NOT NULL,
                       black_player_id     UUID,               -- NULL until second player joins (WAITING state)
                       status              game_status         NOT NULL DEFAULT 'WAITING',
                       result              game_result,        -- NULL while game is ongoing
                       termination_reason  termination_reason, -- NULL while game is ongoing
                       pgn                 TEXT,               -- Full PGN notation. NULL until game ends.
                       final_fen           TEXT,               -- Board position at game end. NULL until game ends.
                       total_moves         INTEGER,            -- Half-moves (plies). NULL until game ends.
                       started_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
                       ended_at            TIMESTAMPTZ,        -- NULL until game ends

                       CONSTRAINT fk_games_white_player    FOREIGN KEY (white_player_id)
                           REFERENCES users (id) ON DELETE RESTRICT,
                       CONSTRAINT fk_games_black_player    FOREIGN KEY (black_player_id)
                           REFERENCES users (id) ON DELETE RESTRICT,

    -- A player cannot play against themselves
                       CONSTRAINT chk_games_different_players
                           CHECK (black_player_id IS NULL OR white_player_id <> black_player_id),

    -- result and termination_reason must both be set or both be null
                       CONSTRAINT chk_games_result_consistency
                           CHECK (
                               (result IS NULL AND termination_reason IS NULL) OR
                               (result IS NOT NULL AND termination_reason IS NOT NULL)
                               ),

    -- ended_at only makes sense when the game has ended
                       CONSTRAINT chk_games_ended_at_requires_status
                           CHECK (ended_at IS NULL OR status IN ('ENDED', 'ABANDONED')),

    -- ended_at must be after started_at
                       CONSTRAINT chk_games_ended_after_started
                           CHECK (ended_at IS NULL OR ended_at > started_at)
);

-- Find all games a specific user played (as either color)
CREATE INDEX idx_games_white_player ON games (white_player_id);
CREATE INDEX idx_games_black_player ON games (black_player_id);

-- Lobby query: quickly find all open games
CREATE INDEX idx_games_status ON games (status)
    WHERE status = 'WAITING';

-- Sort/filter by recency
CREATE INDEX idx_games_started_at ON games (started_at DESC);

-- =============================================================================
-- TABLE: moves
-- One row per half-move (ply) in a game.
-- Append-only. Never updated after insert.
-- =============================================================================

CREATE TABLE moves (
                       id                  BIGSERIAL       PRIMARY KEY,  -- sequential, fast for append-only
                       game_id             UUID            NOT NULL,
                       move_number         INTEGER         NOT NULL,   -- 1-based full move number (both colors share)
                       color               piece_color     NOT NULL,   -- whose move this is
                       from_square         CHAR(2)         NOT NULL,   -- e.g. 'e2'
                       to_square           CHAR(2)         NOT NULL,   -- e.g. 'e4'
                       piece               piece_type      NOT NULL,   -- piece that moved
                       promotion_piece     piece_type,                 -- NULL unless pawn promoted
                       san_notation        VARCHAR(10)     NOT NULL,   -- e.g. 'Nf3', 'O-O', 'exd5+'
                       fen_after           TEXT            NOT NULL,   -- full board FEN after this move
                       is_capture          BOOLEAN         NOT NULL DEFAULT FALSE,
                       is_check            BOOLEAN         NOT NULL DEFAULT FALSE,
                       is_checkmate        BOOLEAN         NOT NULL DEFAULT FALSE,
                       is_castling         BOOLEAN         NOT NULL DEFAULT FALSE,
                       played_at           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

                       CONSTRAINT fk_moves_game    FOREIGN KEY (game_id)
                           REFERENCES games (id) ON DELETE CASCADE,

    -- A move number + color combination must be unique within a game
    -- (you can't have two "move 5 white" entries)
                       CONSTRAINT uq_moves_game_turn
                           UNIQUE (game_id, move_number, color),

    -- Promotion piece only valid when a pawn reaches the back rank
                       CONSTRAINT chk_moves_promotion_requires_pawn
                           CHECK (promotion_piece IS NULL OR piece = 'P'),

    -- A pawn can't promote to itself or a King
                       CONSTRAINT chk_moves_promotion_piece_valid
                           CHECK (promotion_piece IS NULL OR promotion_piece IN ('Q', 'R', 'B', 'N')),

    -- Square format: letter a-h + digit 1-8
                       CONSTRAINT chk_moves_from_square   CHECK (from_square ~ '^[a-h][1-8]$'),
                       CONSTRAINT chk_moves_to_square     CHECK (to_square   ~ '^[a-h][1-8]$'),

    -- Can't move to the same square you started on
                       CONSTRAINT chk_moves_different_squares
                           CHECK (from_square <> to_square),

    -- Checkmate implies check
                       CONSTRAINT chk_moves_checkmate_implies_check
                           CHECK (NOT is_checkmate OR is_check),

    -- move_number must be positive
                       CONSTRAINT chk_moves_number_positive
                           CHECK (move_number >= 1)
);

-- The most common query: fetch all moves for a game in order
CREATE INDEX idx_moves_game_id_ordered
    ON moves (game_id, move_number ASC, color ASC);