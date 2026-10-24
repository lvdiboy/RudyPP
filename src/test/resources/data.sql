-- Initial data for the tests; keep it in sync with the initial data in scripts/mysql-init.sql (root / root).
-- Runs after Hibernate creates the tables (spring.jpa.defer-datasource-initialization=true).
-- Several test contexts share one in-memory H2 database, so each statement only inserts rows that are missing.
INSERT INTO role (name, description, created_by, updated_by)
SELECT r.name, r.description, 'system', 'system'
FROM (SELECT 'USER' AS name, 'User' AS description
      UNION ALL SELECT 'TEMP_USER', 'Temporary user'
      UNION ALL SELECT 'MANAGER', 'Manager'
      UNION ALL SELECT 'ADMIN', 'Admin') AS r
WHERE NOT EXISTS (SELECT 1 FROM role WHERE role.name = r.name);

INSERT INTO users (user_name, full_name, password, enabled, created_by, updated_by)
SELECT 'root', 'admin', '$2a$10$NjtkP0kzmgNtQxpojh9oAu5E.crklJkeQImksbLUUCOlNsFpTU5P2', TRUE, 'system', 'system'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_name = 'root');

INSERT INTO user_role (user_id, role_id, created_by, updated_by)
SELECT u.id, r.id, 'system', 'system'
FROM users u JOIN role r ON r.name = 'ADMIN'
WHERE u.user_name = 'root'
  AND NOT EXISTS (SELECT 1 FROM user_role ur WHERE ur.user_id = u.id AND ur.role_id = r.id);
