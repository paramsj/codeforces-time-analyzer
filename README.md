# Codeforces Time Tale Backend

A Node.js/Express backend that fetches Codeforces user submission data, processes it, and generates humorous/funny comparisons about time spent on competitive programming using AI.

## What It Does

1. **Fetch User Data**: Takes a Codeforces username and retrieves their solved problems, ratings, and yearly submission patterns
2. **Calculate Total Time**: Sums up `predicted_time_seconds` from a FastAPI backend to get total time spent
3. **AI-Generated Roasts**: Uses Google's Gemini or Groq's Llama models to generate witty, programmer-specific comparisons about the time invested
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

The app supports two AI providers (configure via environment variables):

| Provider | Env Variable | Model |
|---|---|---|
| Google Gemini | `GEMINI_API_KEY` | `gemini-2.5-flash-lite` |
| Groq/Llama | `GROQ_API_KEY` | `llama-3.3-70b-versatile` |

If neither API key is set, the app falls back to hardcoded humorous responses.

## Environment Variables

Create a `.env` file in the root directory:

```
PORT=5000
FASTAPI_URL=https://your-fastapi-server.com
TIME_TALE_GET_TOKEN=your_bearer_token_here
GEMINI_API_KEY=your_gemini_key_here   # optional, for Gemini roasts
GROQ_API_KEY=your_groq_key_here       # optional, for Groq roasts
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

## License

MIT