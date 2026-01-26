

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email
    ON users (email);



CREATE UNIQUE INDEX IF NOT EXISTS idx_roles_name
    ON roles(name);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role_id
    ON user_roles (user_id, role_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_role_id_user_id
    ON user_roles (role_id, user_id);
