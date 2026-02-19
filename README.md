# 🗓️ Voice Scheduling Agent

A real-time AI voice assistant that schedules calendar events through natural conversation. Talk to the agent, provide your meeting details, and it creates a real Google Calendar event — all via voice.

![Voice Scheduling Agent](https://img.shields.io/badge/Status-Live-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![VAPI](https://img.shields.io/badge/VAPI-Voice_AI-6c5ce7) ![ElevenLabs](https://img.shields.io/badge/ElevenLabs-TTS-blue) ![Google Calendar](https://img.shields.io/badge/Google_Calendar-API-4285F4)

## 🚀 Deployed URL

> **Live Demo**: [Your Vercel URL here]
>
> **How to test**: Click the link → Click "Start Conversation" → Allow microphone → Speak with the agent

---

## ✨ Features

- **Real-time Voice Conversation** — Powered by VAPI with WebRTC streaming
- **Ultra-natural Voice** — ElevenLabs TTS for human-like speech quality
- **Smart Date Parsing** — Understands "tomorrow", "next Tuesday", "3pm", etc.
- **Google Calendar Integration** — Creates real events on your calendar
- **Live Transcript** — See the conversation in real-time as you speak
- **Premium Dark UI** — Glassmorphism design with animated voice orb

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User's Browser                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Next.js Frontend (Vercel)                       │   │
│  │  • VAPI Web SDK (@vapi-ai/web)                   │   │
│  │  • Voice Orb UI + Transcript Panel               │   │
│  └──────────────┬───────────────────────────────────┘   │
│                 │ WebRTC Audio Stream                     │
└─────────────────┼───────────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────────────┐
│                  VAPI Cloud                              │
│  • STT (Speech-to-Text)                                 │
│  • LLM (Google Gemini 2.0 Flash)                        │
│  • TTS (ElevenLabs)                                     │
│  • Tool/Function orchestration                          │
└──────────────┬──────────────────────────────────────────┘
               │ POST /api/vapi/webhook (tool-calls)
               ▼
┌─────────────────────────────────────────────────────────┐
│            Next.js API Route (Vercel Serverless)         │
│  • Receives tool-calls from VAPI                        │
│  • Dispatches to createCalendarEvent                    │
│  • Returns result string back to VAPI                   │
└──────────────┬──────────────────────────────────────────┘
               │ googleapis (JWT auth)
               ▼
┌─────────────────────────────────────────────────────────┐
│              Google Calendar API                         │
│  • Service Account authentication (no user OAuth)       │
│  • Creates event with title, date, time                 │
│  • Returns event link                                   │
└─────────────────────────────────────────────────────────┘
```

### Conversation Flow

1. **Agent greets** the user and asks for their name
2. **Asks for date** — understands natural language ("next Monday", "Feb 25th")
3. **Asks for time** — converts 12hr to 24hr automatically
4. **Asks for title** (optional) — suggests a default if skipped
5. **Confirms details** — reads back all information
6. **Creates event** — calls the webhook → Google Calendar API
7. **Confirms success** — tells the user the event was created

---

## 📂 Project Structure

```
valkara-ai/
├── src/
│   ├── app/
│   │   ├── api/vapi/webhook/
│   │   │   └── route.ts          # VAPI webhook handler
│   │   ├── globals.css           # Design system (dark glassmorphism)
│   │   ├── layout.tsx            # Root layout with SEO
│   │   └── page.tsx              # Main page
│   ├── components/
│   │   ├── VoiceAgent.tsx        # Voice orb + waveform + transcript
│   │   └── EventCard.tsx         # Event confirmation card
│   ├── hooks/
│   │   └── useVapi.ts            # VAPI Web SDK React hook
│   └── lib/
│       ├── assistant.ts          # VAPI assistant configuration
│       └── calendar.ts           # Google Calendar service
├── .env.example                  # Environment variable template
├── .env.local                    # Your local env (git-ignored)
├── package.json
└── README.md
```

---

## 🔧 Local Development

### Prerequisites

- Node.js 18+
- npm
- A [VAPI account](https://vapi.ai) (free, $10 credit)
- A Google Cloud project with Calendar API enabled
- An [ElevenLabs account](https://elevenlabs.io) (for premium voice)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/valkara-ai-voice-scheduler.git
cd valkara-ai-voice-scheduler
npm install
```

### 2. Set Up VAPI

1. Go to [dashboard.vapi.ai](https://dashboard.vapi.ai)
2. Copy your **Public Key** from the API Keys section
3. (Optional) Go to **Provider Keys** → Add your **ElevenLabs API Key** for premium voices
4. (Optional) Go to **Provider Keys** → Add your **Google Gemini API Key** under Google provider

### 3. Set Up Google Calendar (Service Account)

The Google Calendar API is **free** — no paid GCP account needed.

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project (or use existing) → Enable **Google Calendar API**
3. Go to **IAM & Admin → Service Accounts** → Create a service account
4. Click the service account → **Keys tab** → **Add Key → Create New Key → JSON**
5. Download the JSON file — you need `client_email` and `private_key`
6. Go to [Google Calendar](https://calendar.google.com) → **Settings ⚙️** → Your calendar → **Share with specific people** → Add the `client_email` → Set **"Make changes to events"**
7. In the same settings page, scroll to **Integrate calendar** → Copy the **Calendar ID**

### 4. Configure Environment Variables

Create `.env.local`:

```bash
# VAPI
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key

# Google Calendar
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=your_email@gmail.com
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → Click **Start Conversation** → Allow microphone.

> **Note**: For local development, the webhook URL will be `http://localhost:3000/api/vapi/webhook`. This works because the URL is dynamically set from the browser's origin when the call starts. However, VAPI needs to reach your server — for local testing, use [ngrok](https://ngrok.com) to tunnel your localhost.

---

## 🚀 Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/valkara-ai-voice-scheduler)

### Manual Deploy

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your repository
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_VAPI_PUBLIC_KEY`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
   - `GOOGLE_CALENDAR_ID`
4. Deploy!

The webhook URL will automatically be `https://your-app.vercel.app/api/vapi/webhook`.

---

## 📅 Calendar Integration Explained

### How It Works

This project uses **Google Calendar API** with a **Service Account** for server-to-server authentication. This approach was chosen because:

1. **No user login required** — The service account acts on behalf of the calendar owner
2. **No OAuth flow needed** — Simplifies the UX (users just talk, no Google sign-in)
3. **Server-side only** — Credentials never leave the server (Next.js API route)
4. **Free tier** — Google Calendar API has generous free limits

### Authentication Flow

```
VAPI Agent → "User wants to schedule meeting at 3pm tomorrow"
         ↓
VAPI sends tool-call webhook → POST /api/vapi/webhook
         ↓
API Route extracts: { name, date, startTime, endTime, title }
         ↓
calendar.ts authenticates via JWT (service account credentials)
         ↓
googleapis.calendar.events.insert() → Creates the event
         ↓
Returns event link → VAPI reads confirmation to user
```

### Security

- Service account credentials are stored as **environment variables** (never in client code)
- The `.gitignore` excludes all `.json` key files and `.env` files
- The webhook endpoint only processes valid VAPI tool-call payloads

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Voice Platform | [VAPI](https://vapi.ai) — Real-time voice AI orchestration |
| Text-to-Speech | [ElevenLabs](https://elevenlabs.io) — Ultra-natural voice synthesis |
| LLM | [Google Gemini 2.0 Flash](https://ai.google.dev) — Fast, accurate intent extraction |
| Frontend | [Next.js 15](https://nextjs.org) — React framework with App Router |
| Calendar | [Google Calendar API](https://developers.google.com/calendar) — Free, service account auth |
| Deployment | [Vercel](https://vercel.com) — Serverless hosting |
| Styling | Vanilla CSS — Dark glassmorphism design system |

---

## 📸 Screenshots / Demo

> _Add screenshots or a Loom video link here showing:_
> 1. _The landing page with the voice orb_
> 2. _A conversation in progress with live transcript_
> 3. _The event confirmation card_
> 4. _The created event in Google Calendar_

---

## 📝 License

MIT
# calendar-voice-agent
