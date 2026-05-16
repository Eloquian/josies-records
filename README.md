# Josie's Record Catalogue

Photo a vinyl label → AI reads it → Discogs enriches it → Save to Google Sheets.

## Stack
- **Frontend**: React + Vite
- **Functions**: Netlify serverless
- **AI**: Gemini 2.5 Flash (vision)
- **Catalogue**: Discogs API
- **Storage**: Google Sheets

## Deploy to Netlify

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create josies-records --public --push
```

### 2. Connect to Netlify
- Go to netlify.com → Add new site → Import from GitHub
- Select your repo
- Build command: `npm run build`
- Publish directory: `dist`

### 3. Set Environment Variables
In Netlify → Site settings → Environment variables, add:

| Key | Value |
|-----|-------|
| `GEMINI_API_KEY` | Your Gemini API key from Google AI Studio |
| `DISCOGS_TOKEN` | Your Discogs developer token |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Entire contents of service account JSON (one line) |
| `SPREADSHEET_ID` | `1jEKXGWGJ9YL6iRj8Q3YlClSvnK1UunVe-_pDBNfSwrA` |
| `SHEET_NAME` | `Catalogue` |

### 4. Ensure Sheet Headers
Make sure row 1 of the "Catalogue" sheet has these headers:
```
Timestamp | Artist | Title | Label | Catalogue No. | Year | Country | Format | Speed | Genre | Style | Source | Source ID | Source URL | Estimated Value | Condition | Notes
```

### 5. Share the Sheet
The Google Sheet must be shared with the service account email:
```
josies-records@josies-records.iam.gserviceaccount.com
```
Give it **Editor** access.

## Local Development
```bash
npm install
cp .env.example .env.local
# Fill in .env.local with real values
netlify dev
```

## Adding New Catalogue Sources
Create a new function or extend `identify.js` with additional lookup sources.
The architecture is designed so each source is self-contained.
