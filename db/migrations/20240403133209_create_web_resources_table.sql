-- migrate:up
CREATE TABLE IF NOT EXISTS web_resources(
    wr_id char(26) PRIMARY KEY,
    url varchar(255) NOT NULL UNIQUE,
    description varchar(140) NOT NULL,
    body json,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    last_update timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

)ENGINE=INNODB;

-- migrate:down
drop table web_resources;
