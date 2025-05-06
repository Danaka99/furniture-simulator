# Furniture Simulator Backend

A Node.js backend service for the Furniture Simulator application, built with TypeScript and MongoDB.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/furniture_simulator
   NODE_ENV=development
   ```

4. Build the TypeScript code:
   ```bash
   npm run build
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

## API Endpoints

### Furniture

- GET `/api/furniture` - Get all furniture items
- POST `/api/furniture` - Create a new furniture item
- GET `/api/furniture/:id` - Get a specific furniture item by ID

## Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot-reload
- `npm run build` - Build the TypeScript code
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Project Structure

```
src/
  ├── controllers/     # Request handlers
  ├── models/         # Database models
  ├── routes/         # API routes
  └── index.ts        # Application entry point
```
