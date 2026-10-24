# RudyPP

A demo project for **stateless JWT authentication and role-based authorization** with Spring Boot and Spring Security. It covers sign-up, login, logout, token revocation through Redis, method-level permission checks and JPA auditing, and it comes with a simple login page.

## Tech Stack

| Area        | Technology                                |
| ----------- | ----------------------------------------- |
| Language    | Java 25                                   |
| Framework   | Spring Boot 3.5.0                         |
| Security    | Spring Security 6.5, JJWT 0.12.3          |
| Persistence | Spring Data JPA, H2 in-memory database    |
| Cache       | Redis (Lettuce + commons-pool2)           |
| Other       | Lombok, Guava, Bean Validation            |
| Build       | Maven                                     |

## Features

- **JWT login/logout**: login returns a token. Send it as `Authorization: Bearer <token>`.
- **Token lifetime**: tokens last 1 hour by default, or 7 days when `rememberMe` is set.
- **Token revocation**: Redis stores the active token for each user. Logging out deletes it, and logging in again replaces it, so old tokens stop working right away.
- **Roles**: `USER`, `TEMP_USER`, `MANAGER` and `ADMIN`. Users and roles are linked through a `user_role` join table, and endpoints are protected with `@PreAuthorize`.
- **JPA auditing**: entities record who created or changed them, and when (`AbstractAuditBase`).
- **Unified errors**: a global exception handler returns error responses in one consistent format.
- **Login page**: a static login, sign-up and home page served by the app.

## Project Structure

```
src/main/java/com/rudypp
├── RudyPPApplication.java   # Entry point; creates the default admin user
├── security                 # JWT filter, security config, auth controller/service
│   ├── config / filter / exception / utils / constants
│   └── web                  # /auth endpoints
└── system                   # Users, roles, auditing, Redis config, validation
    ├── entity / repository / service / enums / validator / exception
    └── web                  # /users endpoints
src/main/resources
├── application.yaml         # Server, H2, JPA and Redis settings
└── static/                  # Login & home pages (HTML/CSS/JS)
```

## Getting Started

### Prerequisites

- JDK 25
- Maven 3.9+
- A Redis server on `127.0.0.1:6379`. It's required, because tokens are stored in Redis.

### Run

```bash
mvn spring-boot:run
```

The app starts at **http://localhost:9333/api/** and opens it in your default browser. To stop the browser from opening, set `app.open-browser: false` in `application.yaml` or `APP_OPEN_BROWSER=false`.

In VS Code, you can use the **RudyPPApplication** launch configuration in `.vscode/launch.json`. Its environment variables override `application.yaml`.

### Defaults

| What                | Value                                                         |
| ------------------- | ------------------------------------------------------------- |
| Admin account       | `root` / `root`                                               |
| H2 console          | http://localhost:9333/api/h2-console (`root` / `123456`, JDBC URL `jdbc:h2:mem:jwt-demo`) |
| JWT signing key     | Set via the `JWT_SECRET_KEY` env var. A dev-only fallback is built in. |

Database tables are created automatically on startup (`ddl-auto: update`). H2 runs in memory, so all data is lost when the app restarts.

### Tests

```bash
mvn test
```

Some tests need Redis to be running.

## API

All paths are relative to `http://localhost:9333/api`.

| Method   | Path                    | Access                          | Description                         |
| -------- | ----------------------- | ------------------------------- | ----------------------------------- |
| `POST`   | `/users/sign-up`        | Public                          | Register (new users get `USER` + `MANAGER`) |
| `POST`   | `/auth/login`           | Public                          | Log in, returns a JWT               |
| `POST`   | `/auth/logout`          | Authenticated                   | Log out and revoke the token        |
| `GET`    | `/users`                | `USER`, `MANAGER`, `ADMIN`      | List users (paged)                  |
| `PUT`    | `/users`                | `ADMIN`                         | Update a user                       |
| `DELETE` | `/users?username=xxx`   | `ADMIN`                         | Delete a user                       |

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

- [docs/SpringSecurity介绍.md](./docs/SpringSecurity介绍.md): an introduction to Spring Security (in Chinese)

## Author

**Rudy Lyu** (lvdiboy@gmail.com)
