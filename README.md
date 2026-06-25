# Instagram Clone Backend

A TypeScript REST API for an Instagram-style social application. It provides JWT authentication, user follow relationships, image posts backed by Azure Blob Storage, password-reset email delivery through Mailgun, Socket.IO events, and interactive OpenAPI documentation.

> This project is under development and is not production-ready.

## Features

- User registration, login, logout, and password management
- JWT authentication through a bearer token or `access_token` cookie
- User profiles, followers, following, follow, and unfollow operations
- Multi-image post creation using multipart uploads
- Azure Blob Storage image upload and signed download URLs
- Socket.IO rooms, typing indicators, and message events
- Zod request validation
- Swagger UI and OpenAPI JSON documentation

## Technology

- Node.js, TypeScript, Express 5
- MongoDB and Mongoose
- Socket.IO
- Azure Blob Storage
- Mailgun
- Zod
- Swagger/OpenAPI
- SWC

## Prerequisites

- Node.js 22 or later
- npm
- MongoDB database
- Azure Storage account
- Mailgun account

## Local Setup

1. Clone the repository:

   ```sh
   git clone https://github.com/rahulranjan937/instagram-clone-backend.git
   cd instagram-clone-backend
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Create the environment file:

   ```sh
   cp .env.example .env
   ```

4. Configure `.env`:

   ```dotenv
   PORT=3333
   NODE_ENV=development
   HOST=http://localhost:3333

   MONGODB_URI=mongodb://localhost:27017/instagram-clone
   JWT_SECRET=replace-with-a-secure-secret

   AZURE_STORAGE_CONNECTION_STRING=replace-with-your-connection-string

   MAILGUN_API_KEY=replace-with-your-api-key
   MAILGUN_DOMAIN=replace-with-your-mailgun-domain
   FROM_EMAIL=Instagram Clone <noreply@example.com>
   ```

5. Start the development server:

   ```sh
   npm run dev
   ```

The API runs at `http://localhost:3333` unless `PORT` is changed.

## API Documentation

After starting the server:

- Swagger UI: [http://localhost:3333/api-docs/](http://localhost:3333/api-docs/)
- OpenAPI JSON: [http://localhost:3333/api-docs.json](http://localhost:3333/api-docs.json)
- Status endpoint: [http://localhost:3333/](http://localhost:3333/)

Swagger documents request bodies, responses, multipart uploads, path parameters, and all protected endpoints.

For protected requests, use either:

```http
Authorization: Bearer <JWT>
```

or the `access_token` cookie set by the registration and login endpoints. Swagger UI supports bearer authorization through its **Authorize** button.

## API Overview

| Method   | Endpoint                        | Authentication | Description                        |
| -------- | ------------------------------- | -------------- | ---------------------------------- |
| `GET`    | `/`                             | Public         | Check server status                |
| `POST`   | `/api/auth/register`            | Public         | Register a user                    |
| `POST`   | `/api/auth/login`               | Public         | Log in                             |
| `POST`   | `/api/auth/forgotpassword`      | Public         | Request a password-reset email     |
| `POST`   | `/api/auth/resetpassword`       | Public         | Reset a password with a token      |
| `GET`    | `/api/auth/changepassword`      | Required       | Change the current password        |
| `POST`   | `/api/auth/logout`              | Required       | Log out                            |
| `GET`    | `/api/user/:username`           | Required       | Get a user profile                 |
| `GET`    | `/api/user/:username/followers` | Required       | Get a user's followers             |
| `GET`    | `/api/user/:username/following` | Required       | Get users followed by a user       |
| `GET`    | `/api/user/:username/follow`    | Required       | Follow a user                      |
| `GET`    | `/api/user/:username/unfollow`  | Required       | Unfollow a user                    |
| `POST`   | `/api/post/create`              | Required       | Create a post with images          |
| `GET`    | `/api/post`                     | Required       | Get the authenticated user's posts |
| `GET`    | `/api/post/:id`                 | Required       | Get a post                         |
| `DELETE` | `/api/post/:id/delete`          | Required       | Delete a post and its images       |

The implementation currently uses `GET` with a JSON body for password changes and `GET` for follow/unfollow actions. Clients must match these methods.

## Post Uploads

`POST /api/post/create` accepts `multipart/form-data`:

- `caption`: post caption
- `images`: one or more image files

The upload middleware accepts files in memory and stores them in the Azure Blob Storage `images` container.

## Available Commands

```sh
npm run dev       # Start the development server with automatic restarts
npm run build     # Compile TypeScript sources into dist/
npm start         # Run the compiled application
npm run lint      # Run ESLint
npm run lint:fix  # Run ESLint with automatic fixes
npx tsc --noEmit  # Run a full TypeScript type check
```

## Production Build

```sh
npm run build
npm start
```

The build command clears and regenerates `dist/` using SWC.

## Docker

The repository contains Docker and Compose configuration, but the current `Dockerfile` uses Node.js 18. The installed Azure Storage dependency requires Node.js 22 or later, so update the Docker base images before using the container workflow. The Compose configuration maps the API to port `3000` and Nginx to port `80`.

## Socket.IO Events

The server currently handles:

- `setup`
- `join chat`
- `typing`
- `stop typing`
- `new message`

It emits `connected`, `typing`, `stop typing`, and `message received`.

## License

Licensed under the terms in [LICENSE.md](LICENSE.md).

## Author

[Rahul Ranjan](https://github.com/rahulranjandev)
