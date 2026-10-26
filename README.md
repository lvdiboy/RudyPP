# RudyPP

A demo project for **stateless JWT authentication and role-based authorization** with Spring Boot and Spring Security. It covers sign-up, login, logout, token revocation through Redis, method-level permission checks and JPA auditing. A React front end ([RudyPPUI](./RudyPPUI)) is built into the same jar.

## Tech Stack

| Area        | Technology                              |
| ----------- | --------------------------------------- |
| Language    | Java 25                                 |
| Framework   | Spring Boot 3.5.0                       |
| Security    | Spring Security 6.5, JJWT 0.12.3        |
| Persistence | Spring Data JPA, MySQL 8 (H2 for tests) |
| Cache       | Redis (Lettuce + commons-pool2)         |
| Other       | Lombok, Guava, Bean Validation          |
| Front end   | React, TypeScript, Vite (in `RudyPPUI/`) |
| Build       | Maven (wrapper), Jenkins                |

## Features

- **JWT login/logout**: login returns a token. Send it as `Authorization: Bearer <token>`.
- **Token lifetime**: tokens last 1 hour by default, or 7 days when `rememberMe` is set.
- **Token revocation**: Redis stores the active token for each user. Logging out deletes it, and logging in again replaces it, so old tokens stop working right away.
- **Roles**: `USER`, `TEMP_USER`, `MANAGER` and `ADMIN`. Users and roles are linked through a `user_role` join table, and endpoints are protected with `@PreAuthorize`.
- **JPA auditing**: entities record who created or changed them, and when (`AbstractAuditBase`).
- **Unified errors**: a global exception handler returns error responses in one consistent format.
- **Web UI**: the React app in `RudyPPUI/` is served at `/`; all APIs are under `/api`.

## Project Structure

```
src/main/java/com/rudypp
├── RudyPPApplication.java   # Entry point
├── security                 # JWT filter, security config, auth controller/service
│   ├── config / filter / exception / utils / constants
│   └── web                  # /auth endpoints
└── system                   # Users, roles, auditing, Redis config, validation
    ├── entity / repository / service / enums / validator / exception
    └── web                  # /users endpoints
src/main/resources
├── application.yaml         # Shared settings + local MySQL/Redis defaults
└── application-prod.yaml    # Production (EC2) overrides, all secrets from env vars
RudyPPUI/                    # React front end; Maven copies its build into the jar's static/
scripts/mysql-init.sql       # Creates the database, app user, tables and initial data
```

## Getting Started

### Prerequisites

- JDK 25
- Maven is optional: the bundled Maven Wrapper (`./mvnw`, or `mvnw.cmd` on Windows) downloads the right version
- A Redis server on `127.0.0.1:6379`. It's required, because tokens are stored in Redis.
- MySQL 8 on `localhost:3306`.

### Set up MySQL

Create the database and the app user once, as the MySQL root user:

```bash
mysql -u root -p < scripts/mysql-init.sql
```

This creates the `rudypp` database and a `rudypp` / `rudypp` user, which match the local defaults in `application.yaml`. It also creates the tables and the initial data: the four roles and the admin account `root` / `root`. It's safe to run again; rows that already exist are skipped.

### Run

```bash
./mvnw spring-boot:run
```

The APIs start at **http://localhost:9333/api/** (health: `/api/actuator/health`). The web UI is at **http://localhost:9333/** once a Maven build (`compile` or later) has built it into `target/classes/static`. During UI development, use the Vite dev server instead: see [RudyPPUI/README.md](./RudyPPUI/README.md).

Maven builds the UI on every `compile`, `test` and `package` (it downloads Node into `target/node` the first time). For backend-only builds, add `-Dskip.installnodenpm -Dskip.npm`; an existing `RudyPPUI/dist` is still copied into the jar.

In VS Code, you can use the **RudyPPApplication** launch configuration in `.vscode/launch.json`. Its environment variables override `application.yaml`.

### Defaults

| What            | Value                                                                  |
| --------------- | ---------------------------------------------------------------------- |
| Admin account   | `root` / `root`                                                        |
| MySQL           | `localhost:3306/rudypp`, user `rudypp` / `rudypp`                      |
| JWT signing key | Set via the `JWT_SECRET_KEY` env var. A dev-only fallback is built in. |

Database tables are created and updated automatically on startup (`ddl-auto: update`).

### Configuration

All database settings can be overridden with environment variables:

| Variable       | Default (local) | Notes                                                              |
| -------------- | --------------- | ------------------------------------------------------------------ |
| `DB_HOST`      | `localhost`     | Required in `prod`                                                 |
| `DB_PORT`      | `3306`          |                                                                    |
| `DB_NAME`      | `rudypp`        | Required in `prod`                                                 |
| `DB_USERNAME`  | `rudypp`        | Required in `prod`                                                 |
| `DB_PASSWORD`  | `rudypp`        | Required in `prod`                                                 |
| `DB_SSL_MODE`  | `REQUIRED`      | `prod` only. Use `DISABLED` for MySQL on the same host without TLS |
| `DB_POOL_SIZE` | `10`            | Maximum number of connections in the pool                          |
| `JPA_DDL_AUTO` | `update`        | Set to `validate` once schema migrations are in place              |

### Tests

```bash
./mvnw test
```

The tests use an H2 in-memory database in MySQL mode and an in-memory Redis fake, so they need neither MySQL nor Redis.

## Deploying to AWS EC2

1. **Database**: either install MySQL 8 on the instance and run `scripts/mysql-init.sql` with a strong password, or create an RDS MySQL instance. With RDS, allow port 3306 from the EC2 security group only.
2. **Build** the jar with `./mvnw clean package -DskipTests` and copy `target/rudypp.jar` to the instance.
3. **Configure** the environment. For example, put this in `/etc/rudypp/rudypp.env`, owned by root with `chmod 600`:

   ```bash
   SPRING_PROFILES_ACTIVE=prod
   DB_HOST=localhost            # or the RDS endpoint
   DB_NAME=rudypp
   DB_USERNAME=rudypp
   DB_PASSWORD=change-me
   DB_SSL_MODE=DISABLED         # only for MySQL on the same host without TLS
   REDIS_HOST=localhost
   JWT_SECRET_KEY=a-random-string-of-at-least-32-bytes
   ```

4. **Run** the app as the systemd service `rudypp.service` (user `rudypp`) with `EnvironmentFile=/etc/rudypp/rudypp.env` and `ExecStart=/usr/bin/java -jar /opt/rudypp/app/rudypp.jar`. CodeDeploy installs the jar at exactly that path (`appspec.yml`), and the deploy hooks stop and start this service. Do not set `SERVER_SERVLET_CONTEXT_PATH`.

The `prod` profile turns off SQL logging. If any of the required `DB_*` variables is missing, the app refuses to start.

## CI (Jenkins)

The [Jenkinsfile](./Jenkinsfile) defines the pipeline: **Checkout → Build → Test → Package → CodeDeploy ZIP → Upload to S3 → Deploy**.

- It builds with `./mvnw`, so the Jenkins agent only needs JDK 25. Maven downloads Node for the UI build (cached in `~/.m2`).
- **Build** also builds the UI (`npm ci`, lint, type check, Vite build). **Test** and **Package** reuse that `RudyPPUI/dist`.
- **Package** fails unless `target/rudypp.jar` contains `static/index.html` and every local file it loads (hashed assets and favicons), so a jar without the UI (or with a mismatched build) never reaches EC2.
- **Build agent needs**: JDK 25, `unzip`/`zip`, the AWS CLI, outbound HTTPS to nodejs.org (first build, then cached in `~/.m2`) and registry.npmjs.org, and glibc 2.28+ for Node 24 (Amazon Linux 2023: yes; Amazon Linux 2: no).
- Tests need no Redis or MySQL.
- A push to GitHub triggers a build; Deploy submits an AWS CodeDeploy deployment of the jar to the EC2 instance.
- On EC2, CodeDeploy's ValidateService hook (`deploy/validate.sh`) passes only if `/api/actuator/health` is UP **and** `/` and `/dashboard` return the React app. If health only answers on `/api/api/...`, it prints a hint about a leftover `SERVER_SERVLET_CONTEXT_PATH`.

## API

All paths are relative to `http://localhost:9333/api`. The web UI is at `http://localhost:9333/`. The full reference, with request rules, response shapes and error codes, is in [docs/api.md](./docs/api.md).

| Method   | Path                  | Access                     | Description                                 |
| -------- | --------------------- | -------------------------- | ------------------------------------------- |
| `POST`   | `/users/sign-up`      | Public                     | Register (new users get `USER` + `MANAGER`) |
| `POST`   | `/auth/login`         | Public                     | Log in, returns a JWT                       |
| `POST`   | `/auth/logout`        | Authenticated              | Log out and revoke the token                |
| `GET`    | `/users`              | `USER`, `MANAGER`, `ADMIN` | List users (paged)                          |
| `PUT`    | `/users`              | `ADMIN`                    | Update a user                               |
| `DELETE` | `/users?username=xxx` | `ADMIN`                    | Delete a user                               |

### Examples

**Sign up**

```http
POST /api/users/sign-up
Content-Type: application/json

{ "userName": "123456", "fullName": "shuangkou", "password": "123456" }
```

`fullName` must be 2–15 characters long. It can contain Chinese characters, letters or digits, but it can't be all digits.

![Sign up](./docs/images/sign-up.png)

**Login**

```http
POST /api/auth/login
Content-Type: application/json

{ "username": "123456", "password": "123456", "rememberMe": true }
```

![Login](./docs/images/login.png)

**Logout**

![Logout](./docs/images/logout.png)

**Accessing a protected resource with a valid token**

![Authenticated request](./docs/images/access-resources-that-require-authentication.png)

**Missing or invalid token** returns `401`:

![Missing or invalid token](./docs/images/access-resources-that-require-authentication2.png)

**Valid token but not enough permission** (for example, a non-admin calling `DELETE /users`) returns `403`:

![Insufficient permission](./docs/images/not-have-enough-permission.png)

## Further Reading

- [docs/spring-security-introduction.md](./docs/spring-security-introduction.md): an introduction to Spring Security and JWT authentication
- [docs/spring-security-implementation.md](./docs/spring-security-implementation.md): the original project write-up (partly out of date)

## Author

//This is the first test for Jenkins auto-build.
**Rudy Lyu** (lvdiboy@gmail.com)
