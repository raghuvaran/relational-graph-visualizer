CREATE TABLE IF NOT EXISTS "user" (
    uuid UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    last_name VARCHAR(50) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role (
    uuid UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    label VARCHAR(50) NOT NULL,
    last_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_role (
    user_uuid UUID NOT NULL REFERENCES "user"(uuid),
    role_uuid UUID NOT NULL REFERENCES role(uuid),
    last_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rank (
    uuid UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    level INT NOT NULL,
    last_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_rank (
    user_uuid UUID NOT NULL REFERENCES "user"(uuid),
    role_uuid UUID NOT NULL REFERENCES rank(uuid)
);

INSERT INTO "user"(last_name, first_name) VALUES ('nick', 'hwang'), ('raghu', 'chowda');
INSERT INTO role(label) VALUES ('developer'), ('administrator');
INSERT INTO rank(level) VALUES (5), (26);

