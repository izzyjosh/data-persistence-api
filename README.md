# Data Persistence API

A small TypeScript + Express API that classifies a person by name using the Genderize, Agify, and Nationalize services, then persists the result in PostgreSQL with TypeORM.

## Features

- Accepts a `name` and validates it with Zod
- Fetches gender, age, and country data from external APIs
- Stores the computed profile in PostgreSQL
- Returns the existing record when the same name is submitted again
- Uses structured JSON success and error responses

## Tech Stack

- Node.js
- Express
- TypeScript
- TypeORM
- PostgreSQL
- Zod
- Pino / pino-http

## Requirements

- Node.js 18+
- PostgreSQL database
- A valid database connection URL

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
```

3. Start the development server:

```bash
npm run dev
```

4. Build the project:

```bash
npm run build
```

5. Start the compiled app:

```bash
npm start
```

## Available Scripts

- `npm run dev` - start the app with `nodemon` and `ts-node`
- `npm run build` - compile TypeScript to `dist/`
- `npm start` - run the compiled app from `dist/app.js`
- `npm run lint` - run ESLint

## API

### `GET /`

Health-style welcome route.

**Response**

```json
{
  "status": "success",
  "message": "Welcome to the Genderize API Processing Service!"
}
```

### `POST /api/profiles`

Classifies a person by name and stores the result if it does not already exist.

**Request body**

```json
{
  "name": "Alice"
}
```

**Success responses**

- `201 Created` when a new profile is saved
- `200 OK` when the profile already exists

**Example response for a new profile**

```json
{
  "status": "success",
  "data": {
    "id": "018f3f7c-2a2c-7b5d-9d7c-4e3f8b5d1a10",
    "name": "Alice",
    "gender": "female",
    "gender_probability": 0.98,
    "sample_size": 1234,
    "age": 29,
    "age_group": "adult",
    "country": "US",
    "country_probability": 0.71,
    "created_at": "2026-04-14T20:00:00.000Z"
  }
}
```

**Example response when the profile already exists**

```json
{
  "status": "success",
  "message": "Profile already exists",
  "data": {
    "id": "018f3f7c-2a2c-7b5d-9d7c-4e3f8b5d1a10",
    "name": "Alice",
    "gender": "female",
    "gender_probability": 0.98,
    "sample_size": 1234,
    "age": 29,
    "age_group": "adult",
    "country": "US",
    "country_probability": 0.71,
    "created_at": "2026-04-14T20:00:00.000Z"
  }
}
```

## Validation and Errors

The request body is validated before classification runs.

- `400 Bad Request` - missing body, missing `name`, or empty `name`
- `422 Unprocessable Entity` - `name` is not a string
- `502 Bad Gateway` - one of the external classification APIs fails
- `500 Internal Server Error` - unexpected server or database error

## Project Structure

- `src/app.ts` - app bootstrap, middleware, and route registration
- `src/routes/` - API routes
- `src/controllers/` - request handlers
- `src/services/` - classification and persistence logic
- `src/models/` - TypeORM entities
- `src/utils/` - validation, logging, and response helpers
- `src/config/` - environment and database configuration

## Notes

- The app uses TypeORM with PostgreSQL for persistence.
- Duplicate names are handled idempotently: the existing profile is returned instead of creating a new row.
- The database schema is configured for local development with TypeORM synchronization.
