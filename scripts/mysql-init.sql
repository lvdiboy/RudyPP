-- Creates the RudyPP database, the application user, the tables and the initial data
-- (roles and the default admin account root / root).
-- Run as the MySQL root user, locally or on the EC2 host:
--   mysql -u root -p < scripts/mysql-init.sql
-- On EC2, replace the password below with a strong one first, and do not commit it.
-- Safe to run more than once: existing tables, roles and users are left untouched.

SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS rudypp
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- 'localhost' covers MySQL on the same machine as the app.
-- If the app connects from another host, create the user for that host instead (e.g. 'rudypp'@'10.0.%').
CREATE USER IF NOT EXISTS 'rudypp'@'localhost' IDENTIFIED BY 'rudypp';

GRANT ALL PRIVILEGES ON rudypp.* TO 'rudypp'@'localhost';
FLUSH PRIVILEGES;

USE rudypp;

-- ---------------------------------------------------------------------------
-- Tables
-- Generated from the JPA entities by Hibernate (MySQLDialect), including its
-- constraint names, so spring.jpa.hibernate.ddl-auto=update sees them as up to date.
-- If an entity changes, regenerate this section rather than editing it by hand.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS role (
    created_at  datetime(6),
    id          bigint NOT NULL AUTO_INCREMENT,
    updated_at  datetime(6),
    created_by  varchar(255),
    description varchar(255),
    name        varchar(255),
    updated_by  varchar(255),
    PRIMARY KEY (id)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS users (
    enabled    boolean DEFAULT TRUE,
    created_at datetime(6),
    id         bigint NOT NULL AUTO_INCREMENT,
    updated_at datetime(6),
    created_by varchar(255),
    full_name  varchar(255) NOT NULL,
    password   varchar(255) NOT NULL,
    updated_by varchar(255),
    user_name  varchar(255) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT UKk8d0f2n7n88w1a16yhua64onx UNIQUE (user_name)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS user_role (
    created_at datetime(6),
    id         bigint NOT NULL AUTO_INCREMENT,
    role_id    bigint,
    updated_at datetime(6),
    user_id    bigint,
    created_by varchar(255),
    updated_by varchar(255),
    PRIMARY KEY (id),
    CONSTRAINT FKa68196081fvovjhkek5m97n3y FOREIGN KEY (role_id) REFERENCES role (id),
    CONSTRAINT FKj345gk1bovqvfame88rcx7yyx FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------------
-- Initial data
-- Each insert only runs when the row is missing.
-- ---------------------------------------------------------------------------

-- Roles: must match com.rudypp.system.enums.RoleType
INSERT INTO role (name, description, created_at, updated_at, created_by, updated_by)
SELECT r.name, r.description, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system'
FROM (SELECT 'USER' AS name, 'User' AS description
      UNION ALL SELECT 'TEMP_USER', 'Temporary user'
      UNION ALL SELECT 'MANAGER', 'Manager'
      UNION ALL SELECT 'ADMIN', 'Admin') AS r
WHERE NOT EXISTS (SELECT 1 FROM role WHERE role.name = r.name);

-- Default admin account: root / root (BCrypt hash of "root").
-- Change this password after the first login, especially on EC2.
INSERT INTO users (user_name, full_name, password, enabled, created_at, updated_at, created_by, updated_by)
SELECT 'root', 'admin', '$2a$10$NjtkP0kzmgNtQxpojh9oAu5E.crklJkeQImksbLUUCOlNsFpTU5P2', TRUE,
       UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_name = 'root');

-- Give root the ADMIN role
INSERT INTO user_role (user_id, role_id, created_at, updated_at, created_by, updated_by)
SELECT u.id, r.id, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system'
FROM users u
         JOIN role r ON r.name = 'ADMIN'
WHERE u.user_name = 'root'
  AND NOT EXISTS (SELECT 1 FROM user_role ur WHERE ur.user_id = u.id AND ur.role_id = r.id);
