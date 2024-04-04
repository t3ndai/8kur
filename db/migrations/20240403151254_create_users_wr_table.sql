-- migrate:up
CREATE TABLE IF NOT EXISTS users_wr(
    users_wr_id char(26) PRIMARY KEY,
    user_id char(26) NOT NULL,
    wr_id char(26) NOT NULL,

    KEY idx_users_wr(user_id, wr_id),

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (wr_id)
        REFERENCES web_resources(wr_id)
        ON DELETE CASCADE
)ENGINE=INNODB;

-- migrate:down
drop table users_wr;

