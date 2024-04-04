-- migrate:up
create table if not exists users(
    username varchar(45) UNIQUE NOT NULL,
    email varchar(255) UNIQUE NOT NULL,
    password varchar(255) NOT NULL,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    user_id char(26) PRIMARY KEY,
    KEY idx_username_email(username, email)
)ENGINE=INNODB;

-- migrate:down
drop table users;
