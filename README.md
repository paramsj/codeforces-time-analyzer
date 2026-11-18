# Codeforces Time Tale Backend

A Node.js/Express backend that fetches Codeforces user submission data, processes it, and generates humorous/funny comparisons about time spent on competitive programming using AI.

## What It Does

1. **Fetch User Data**: Takes a Codeforces username and retrieves their solved problems, ratings, and yearly submission patterns
2. **Calculate Total Time**: Sums up `predicted_time_seconds` from a FastAPI backend to get total time spent
3. **AI-Generated Roasts**: Uses Groq's Llama model to generate witty, programmer-specific comparisons about the time invested
4. **Range Filtering**: Optional min/max rating filter to focus on problems within a specific difficulty range
5. **Rating/Year Analytics**: Counts problems solved per rating tier and per year

## API Endpoints

### `GET /`
Welcome message.

### `POST /api/v1/home/prediction`
Get predictions for a Codeforces user.

**Request body:**
```json
{
  "username": "paramj"
}
```

**Response:** Contains `totalSeconds`, `funny` (AI-generated roast), `ratingCounts`, and yearly problem counts.

### `POST /api/v1/home/prediction/range`
Get predictions for a Codeforces user with rating range filter.

**Request body:**
```json
{
  "username": "paramj",
  "minRating": 1000,
  "maxRating": 2000
}
```

## AI Integration

The app currently uses **Groq's Llama model** to generate witty, programmer-specific comparisons about the time invested (via the `GROQ_API_KEY` environment variable).

**Note:** Google Gemini support exists in the codebase (`utils/funnyResponse.js`) but is not currently wired into the request flow (the import is commented out in `controllers/home.controllers.js`). If you wish to enable Gemini, you would need to uncomment the Gemini import and remove the Groq import in that file.

If the `GROQ_API_KEY` is not set, the app falls back to hardcoded humorous responses from `fallBack.js`.

## Environment Variables

Create a `.env` file in the root directory:

```
PORT=5000
FASTAPI_URL=https://your-fastapi-server.com
TIME_TALE_GET_TOKEN=your_bearer_token_here
GROQ_API_KEY=your_groq_key_here       # required for AI roasts
```

## Project Structure

```
├── app.js              # Express app setup (CORS, JSON parser)
├── Dockerfile          # Docker configuration (node:20)
├── index.js            # Entry point (dotenv + server start)
├── .gitignore          # git exclusions
├── .dockerignore     # Docker build context exclusions
├── package.json        # Dependencies (express, cors, groq-sdk, axios, dotenv)
├── routes/
│   └── home.routes.js  # API routes
├── controllers/
│   └── home.controllers.js # Main business logic
└── utils/
    ├── processSubmissions.js    # Codeforces API fetcher
    ├── processSubmissionsinRange.js # Codeforces API fetcher with rating filter
    ├── getPrimaryKey.js         # Problem key generator
    ├── fallBack.js              # Fallback funny responses
    ├── funnyResponse.js         # AI roast generator
    ├── GroqResponse.js          # Groq API wrapper
    ├── ApiError.js              # Custom error class
    └── ApiResponse.js           # Response wrapper
```

## Development

```bash
# Install dependencies
npm install

# Start development server
node index.js

# Or with nodemon (if configured)
npx nodemon index.js
```

## Docker Build

```bash
docker build -t cf-time-tale-backend .
docker run -p 5000:5000 --env-file .env cf-time-tale-backend
```

The `.dockerignore` file excludes `node_modules`, logs, temp files, and git metadata to keep build context light.
