> **Note:** This is the project's original README, translated. Some details are out of date (for example, the project now uses Java 25 and MySQL instead of JDK 17 and H2). See the main [README](../README.md) for current information.

## Preface

[Spring Security](https://spring.io/projects/spring-security) is a very powerful framework in the Spring family for authentication and access control. It's easy to extend to meet a system's security needs.

However, Spring Security is harder to learn than many other technologies, such as JPA. Many beginners find it hard to write a working demo on their own just from videos or documentation, and some give up.

Both the onboarding project when I joined my company and the project I'm working on now use Spring Security, which shows it's a solid choice for authentication and authorization. I hadn't built those parts of earlier projects myself, so I wasn't very familiar with it. I took some time to learn it and built a simple demo. The demo mainly uses **Spring Security** and **Spring Boot**, all on the latest stable versions. It also uses JPA.

My time and skills are limited, so there's surely plenty of room for improvement. If you're interested, help improve it. PRs are welcome.

## About the Project

Spring Security JWT Guide is a sample authentication and authorization project based on Spring Boot and Spring Security. It shows how to build a modern, stateless authentication system with JWT (JSON Web Token). It uses Java 25 and Spring Boot 3.5.0, together with Redis, to provide full user authentication, authorization and session management.

**Backend tech stack:**

- Core framework: Spring Boot 3.5.0
- Security framework: Spring Security 6.5.0
- ORM: JPA
- Database: H2 in-memory database (for the demo)
- Cache: Redis
- JWT library: JJWT

**What you can learn from this project:**

1. Login, logout and permission checks with Spring Security + JWT
2. JPA auditing, and how to map a many-to-many relationship through a join table

## To-do

- [x] Upgrade Spring Boot to 3.x and the JDK to 17.
- [x] Add H2 in-memory database support so the project starts without MySQL. After startup, open [http://localhost:9333/api/h2-console](http://localhost:9333/api/h2-console) (user name: root, password: 123456).
- [x] Refactor exception handling and improve the error response format.
- [x] Add a role table and link users to roles through a role_user table.
- [x] Restructure the files.
- [x] Add JPA auditing.
- [x] Logout: Redis stores the token (key: user id, value: token), and logging out deletes it.
- [x] Logging in again invalidates the token from the previous login (so unexpired old tokens can't be used): a new login replaces the token stored in Redis.

## How to Run the Project

1. Get the RudyPP source code.
2. Open the project and wait for Maven to download the dependencies. IntelliJ IDEA is recommended; make sure the Lombok plugin is installed.
3. Install Redis and check the Redis settings in `application.yaml`.
4. Run the project, for example with `mvn spring-boot:run` in the project root. The tables are created automatically (see JPA if this is new to you).

## Login Page

The project includes a simple login / sign-up page. After startup it opens [http://localhost:9333/api/](http://localhost:9333/api/) in the system's default browser; you can also open it manually.

- **Log in**: the default admin account is `root / root`. With "Remember me" checked the token lasts 7 days, otherwise 1 hour.
- **Sign up**: user name, full name (2-15 Chinese characters, letters or digits; cannot be all digits) and password. After signing up, the page switches to the login form.
- **After login**: see the current user's roles, token and expiry time, list users, and log out.

To stop the browser from opening automatically, set `app.open-browser` to `false` in `application.yaml`.

## Testing

### Sign up

**URL:**

`POST http://localhost:9333/api/users/sign-up`

**RequestBody:**

```json
{ "userName": "123456", "fullName": "shuangkou", "password": "123456" }
```

![Sign up](./images/sign-up.png)

New users get two roles by default: USER and MANAGER.

### Log in

**URL:**

`POST http://localhost:9333/api/auth/login`

**RequestBody:**

```json
{ "username": "123456", "password": "123456", "rememberMe": true }
```

![Log in](./images/login.png)

### Log out

**URL:**

`POST http://localhost:9333/api/auth/logout`

![Log out](./images/logout.png)

### Access a protected resource with a valid token

Send a GET request to `/api/users`. This endpoint requires:

```java
@PreAuthorize("hasAnyRole('ROLE_USER','ROLE_MANAGER','ROLE_ADMIN')")
```

![Access resources that require authentication](./images/access-resources-that-require-authentication.png)

### Access without a token or with an invalid token

Send a GET request to `/api/users` without a token, or with an invalid one.

![Access resources that require authentication without token or with invalid token](./images/access-resources-that-require-authentication2.png)

### Valid token but not enough permission

Send a DELETE request to `/api/users?username=xxx` with a valid token that doesn't have enough permission.

![Not enough permission](./images/not-have-enough-permission.png)
