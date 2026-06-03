CREATE TABLE user_verification (
                                   id                UUID         NOT NULL DEFAULT gen_random_uuid(),
                                   email             VARCHAR(255) NOT NULL,
                                   verification_code VARCHAR(255) NOT NULL,
                                   expires_at        TIMESTAMP    NOT NULL,

                                   CONSTRAINT pk_user_verification PRIMARY KEY (id)
);