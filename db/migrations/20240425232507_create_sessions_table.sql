-- migrate:up
CREATE TABLE IF NOT EXISTS sessions (
    session_id char(128) PRIMARY KEY,
    expires_at timestamp,
    user_id char(26),

    FOREIGN KEY (user_id)
        REFERENCES users(user_id) 
        ON DELETE CASCADE
)ENGINE=INNODB;

-- migrate:down
drop table sessions
