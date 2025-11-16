# UtopiaHire - AI-Powered Career Architect

An AI-powered career assistant platform for job seekers featuring AI interview practice, resume analysis, and job matching.

## Features

- 🎯 **AI Interview Practice** - Practice interviews with real-time facial expression and body language analysis
- 📄 **Resume Reviewer** - Get comprehensive AI-powered resume analysis with actionable feedback
- 💼 **Job Matcher** - Find personalized job matches based on your skills and preferences
- 🎙️ **Speech Recognition** - Voice-enabled interview responses
- 📊 **Performance Analytics** - Detailed feedback on interview performance

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI/ML**: 
  - TensorFlow.js for face landmark detection
  - MediaPipe for gesture and posture analysis
  - Google Gemini for interview analysis
- **Document Processing**: PDF.js and Mammoth for resume parsing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Add your API keys to the `.env` file:
   - `GEMINI_API_KEY` - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - `ELEVENLABS_API_KEY` - Get from [ElevenLabs](https://elevenlabs.io/)
   - `JSEARCH_API_KEY` - Get from [RapidAPI JSearch](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch)
   - `ADZUNA_APP_ID` and `ADZUNA_API_KEY` - Get from [Adzuna](https://developer.adzuna.com/)

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
UtopiaHire/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── ai-interviewer/
│   │   ├── resume-reviewer/
│   │   ├── job-matcher/
│   │   └── api/         # API routes
│   ├── components/      # Reusable React components
│   ├── utils/           # Utility functions
│   ├── services/        # Service layer (AI, API calls)
│   └── data/            # Static data
├── public/              # Static assets
└── package.json
```

## Environment Variables

See `.env.example` for all required environment variables.

## License

Private project - All rights reserved
