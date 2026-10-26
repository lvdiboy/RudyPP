# RudyPP API

A reference for the REST API served by the Spring Boot app. The examples are real responses,
captured on 2026-10-26 from the packaged jar.

## Base URLs

| Environment           | API base                                     | Web UI                  |
| --------------------- | -------------------------------------------- | ----------------------- |
| Local backend         | `http://localhost:9333/api`                  | `http://localhost:9333/` |
| Local UI development  | `/api` via the Vite proxy on `localhost:5173` | `http://localhost:5173/` |
| EC2 (production)      | `http://<ec2-host>:9333/api`                 | `http://<ec2-host>:9333/` |

Frontend code calls relative `/api/...` URLs, so the same code works in every environment.

## Endpoints

| Method   | Path                                 | Access                     | Success                         |
| -------- | ------------------------------------ | -------------------------- | ------------------------------- |
| `POST`   | `/api/users/sign-up`                 | Public                     | `200`, empty body               |
| `POST`   | `/api/auth/login`                    | Public                     | `200`, token in `Authorization` header |
| `POST`   | `/api/auth/logout`                   | Any signed-in user         | `200`, empty body               |
| `GET`    | `/api/users?pageNum=0&pageSize=10`   | `USER`, `MANAGER`, `ADMIN` | `200`, page of users            |
| `PUT`    | `/api/users`                         | `ADMIN`                    | `200`, empty body               |
| `DELETE` | `/api/users?username={userName}`     | `ADMIN`                    | `200`, empty body               |
| `GET`    | `/api/actuator/health`               | Public                     | `200` `{"status":"UP",...}`     |

Several endpoints return `200` with **no body**. Don't call `response.json()` on them.

## Authentication

1. Call `POST /api/auth/login`. The token is in the `Authorization` **response header** and
   already starts with `Bearer `. CORS exposes this header to browsers.
2. Send it back unchanged in the `Authorization` request header on protected calls.

```text
Authorization: Bearer eyJ0eXAiOiJKV1Qi...
```

- **Lifetime**: 1 hour, or 7 days with `"rememberMe": true`. There is no refresh endpoint;
  log in again when the token expires.
- **One active token per user**: Redis stores it. The token stops working before its expiry
  when the user logs out, logs in again elsewhere, has their password changed, is disabled, or is
  deleted.
- **Claims** (base64 payload, for display only; the server checks the signature):
  `sub` = user name, `exp` = expiry (epoch seconds), `rol` = comma-separated roles such as
  `ROLE_USER,ROLE_MANAGER`.
- **Roles**: `USER`, `TEMP_USER`, `MANAGER`, `ADMIN`. New sign-ups get `USER` and `MANAGER`. The
  seeded `root` account has `ADMIN` only.
- A missing, malformed, expired or revoked token gives `401`.

## Requests and responses

### Sign up: `POST /api/users/sign-up`

```json
{ "userName": "alice", "fullName": "Alice Doe", "password": "secret1" }
```

| Field      | Rules                                                                                           |
| ---------- | ----------------------------------------------------------------------------------------------- |
| `userName` | Required, not blank, unique                                                                     |
| `password` | Required, not blank                                                                             |
| `fullName` | Required. 2–15 characters: letters, digits, Chinese characters, spaces, `.` or `'`. Not all digits, no trailing space |

Success: `200`, empty body. Errors: `400` code `1001` (name taken) or `1003` (validation).

### Log in: `POST /api/auth/login`

```json
{ "username": "alice", "password": "secret1", "rememberMe": false }
```

Note the field is **`username`** here but **`userName`** everywhere else.

```http
HTTP/1.1 200
Authorization: Bearer eyJ0eXAiOiJK...

{"redirect":"/"}
```

`redirect` is a hint left over from the old static pages; the React app does its own
navigation. Wrong credentials or a disabled user give `401` with code `1006`.

### Log out: `POST /api/auth/logout`

Send the token in the header and no body. Success: `200`, empty body. The token is revoked
immediately.

### List users: `GET /api/users?pageNum=0&pageSize=10`

`pageNum` is **zero-based** (default `0`), and `pageSize` defaults to `10`. The response is a Spring
`Page`:

```json
{
  "content": [
    { "userName": "root", "fullName": "admin" },
    { "userName": "lvdiboy", "fullName": "dilyu" }
  ],
  "pageable": { "pageNumber": 0, "pageSize": 2, "offset": 0, "paged": true, "unpaged": false,
                "sort": { "empty": true, "sorted": false, "unsorted": true } },
  "totalElements": 3,
  "totalPages": 2,
  "number": 0,
  "size": 2,
  "numberOfElements": 2,
  "first": true,
  "last": false,
  "empty": false,
  "sort": { "empty": true, "sorted": false, "unsorted": true }
}
```

For paging UI, use `content`, `number`, `size`, `totalElements`, `totalPages`, `first` and
`last`. Each user has only `userName` and `fullName`; roles and the enabled flag are not returned.

### Update a user: `PUT /api/users` (ADMIN)

```json
{ "userName": "alice", "fullName": "Alice Smith", "password": "newSecret", "enabled": false }
```

`userName` is required and identifies the user. The other fields are optional, and only the ones
present (non-null) change. Changing `password`, or setting `enabled` to `false`, revokes the
user's current token. `fullName` is **not** validated here, unlike sign-up.

Success: `200`, empty body. Unknown user: `404` code `1004`.

### Delete a user: `DELETE /api/users?username=alice` (ADMIN)

The query parameter is lowercase `username`. Success: `200`, empty body, and the user's token is
revoked. Unknown user: `404` code `1004`.

## Errors

Business and validation errors return JSON:

```json
{
  "code": 1003,
  "message": "Method argument validation failed",
  "status": 400,
  "timestamp": "2026-10-26T01:17:16.4373314",
  "path": "/api/users/sign-up",
  "data": {
    "userName": "must not be blank",
    "fullName": "Invalid full name",
    "password": "must not be blank"
  }
}
```

| `code` | HTTP  | `message`                         | `data`                                            |
| ------ | ----- | --------------------------------- | ------------------------------------------------- |
| `1001` | `400` | User name already exists          | `{ "username:": "<name>" }`                       |
| `1002` | `404` | Role not found                    | `{ "roleName": "<role>" }`                        |
| `1003` | `400` | Method argument validation failed | One entry per invalid field: `{ "<field>": "<reason>" }` |
| `1004` | `404` | User not found                    | `{ "username:": "<name>" }`                       |
| `1006` | `401` | Wrong user name or password       | `{ "detail": "<reason>" }`                        |

- **Key typo**: the `data` key for `1001` and `1004` really is `"username:"`, with a trailing
  colon.
- **Timestamp**: `timestamp` is the server's local time, with no time zone.
- **Security errors have no JSON body**: a missing, invalid or expired token, and a missing role,
  produce a bare status with an empty body. Client code must handle a non-JSON error body and fall
  back to the HTTP status.
- **Code `1005`** ("Token verification failed") is defined but not currently returned.

### Known issue: 403 arrives as 401

A signed-in user without the required role (for example a `USER` calling `PUT /api/users`)
should get `403`, but currently gets **`401` with an empty body**. The access-denied handler
calls `sendError(403)`. The container then forwards to `/error`, which Spring Security doesn't
permit, so that forward is rejected as unauthenticated. The same forward is why security error
bodies are empty.

Possible fix (not applied): permit error dispatches in `SecurityConfiguration`, for example
`.dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()`. Until then, a `401` on a request that
carried a valid token can mean "not allowed".

## Not available yet

- No current-user or profile endpoint; read the user name and roles from the token claims.
- No token refresh endpoint.
- No journal, project or learning-progress APIs. The UI uses sample data for those.
