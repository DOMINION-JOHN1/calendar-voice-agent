# 🗓️ Voice Scheduling Agent

A real-time voice assistant that schedules calendar events through natural conversation. Talk to the agent, provide your meeting details, and it creates a real Google Calendar event — all via voice.

![Voice Scheduling Agent](https://img.shields.io/badge/Status-Live-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![VAPI](https://img.shields.io/badge/VAPI-Voice_AI-6c5ce7) ![Google Calendar](https://img.shields.io/badge/Google_Calendar-API-4285F4)

## 🚀 Deployed URL

> **Live Demo**: [https://calendar-voice-agent.vercel.app/](https://calendar-voice-agent.vercel.app/)
>
> **How to test**: Click the link → Click "Start Conversation" → Allow microphone → Speak with the agent
> *Example phrase: "Schedule an interview with John for Feb 28th at 11 AM"*

---

## ✨ Features

- **Real-time Voice Conversation** — Powered by VAPI with WebRTC streaming
- **Ultra-natural Voice** — OpenAI TTS ("Alloy") for highly reliable and natural speech
- **Smart Date Parsing** — Understands "tomorrow", "next Tuesday", "3pm", etc.
- **Google Calendar Integration** — Creates real events on your calendar instantly
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
│  • STT (Deepgram Nova-2)                                │
│  • LLM (Google Gemini 2.0 Flash)                        │
│  • TTS (OpenAI Alloy)                                   │
│  • Function Calling (createCalendarEvent)               │
└──────────────┬──────────────────────────────────────────┘
               │ POST /api/vapi/webhook (tool-calls)
               ▼
┌─────────────────────────────────────────────────────────┐
│            Next.js API Route (Vercel Serverless)         │
│  • Receives tool-calls from VAPI                        │
│  • Dispatches to createCalendarEvent handler            │
│  • Returns confirmation back to VAPI                    │
└──────────────┬──────────────────────────────────────────┘
               │ googleapis (JWT auth via Service Account)
               ▼
┌─────────────────────────────────────────────────────────┐
│              Google Calendar API                         │
│  • Authenticates silently on the server                 │
│  • Inserts event with parsed title, date, time          │
│  • Returns the public Google Calendar URL               │
└─────────────────────────────────────────────────────────┘
```

### Conversation Flow

1. **Agent greets** the user and asks for their name
2. **Asks for date** — understands natural language
3. **Asks for time** — converts 12hr to 24hr automatically
4. **Asks for title** (optional) — suggests a default like "Meeting with [name]"
5. **Confirms details** — reads back all information to ensure accuracy
6. **Creates event** — triggers the VAPI tool-call webhook to the Next.js API
7. **Hangs up & Confirms** — tells the user the event was created and ends the call

---

## � Calendar Integration Explained

### How It Works

This project uses the **Google Calendar API** with a **Service Account** for backend authentication. This design pattern was chosen for several specific reasons:

1. **No OAuth Friction** — Users visiting the site do not need to sign in with Google or grant calendar permissions. The agent uses a pre-authenticated service account that has been granted permission to write to a specific master calendar.
2. **Secure Key Management** — The connection to Google happens entirely server-side (in the Next.js API routes). The Service Account JSON keys are stored as SECURE environment variables in Vercel.
3. **Data Formatting** — The VAPI LLM strictly enforces the formatting of the date (`YYYY-MM-DD`) and time (`HH:MM`). When the webhook receives this payload, the backend converts these strings into strict ISO 8601 DateTime strings tailored to the proper timezone (e.g., Africa/Lagos) before passing them to the `googleapis.calendar.events.insert` method.

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Voice Orchestration** | [VAPI](https://vapi.ai) — Handles WebRTC and routing |
| **Speech-to-Text** | Deepgram Nova-2 — Lightning-fast transcription |
| **Logic (LLM)** | Google Gemini 2.0 Flash — Extracted prompt adherence |
| **Text-to-Speech** | OpenAI ("Alloy") — Highly stable and responsive TTS |
| **Frontend/Backend** | Next.js 15 (App Router) — Deployed on Vercel |
| **Calendar Backend** | Google Calendar API (Service Account JWT) |

---

## � Proof of Execution

### 1. The Voice Scheduling Agent UI
The beautifully designed, glassmorphic UI where the conversation starts.
<img width="900" alt="Voice Agent Website" src="./public/assets/website.png">

### 2. VAPI Dashboard (Transcripts & Successful Tool Call)
The VAPI call logs show the AI confirming the date, time, and title, followed by the successful execution of the `CreateCalendarEvent` tool.
<img width="900" alt="VAPI Call Log Tool Execution" src="./public/assets/vapi-log.png">

### 3. Vercel Serverless Function Logs
The Next.js backend logs confirm receiving the webhook and successfully authenticating with the Google Calendar API to generate the event ID.
<img width="900" alt="Vercel Function Webhook Success" src="./public/assets/vercel-log.png">

### 4. Google Calendar Success
The final result: The event appears instantly on the target Google Calendar.
<img width="900" alt="Google Calendar Event Created" src="./public/assets/calendar.png">

---

## � Run Locally

### Prerequisites
- Node.js 18+
- VAPI Account (Public Key)
- Google Cloud Service Account (Email & Private Key)

### Setup
```bash
git clone https://github.com/YOUR_USERNAME/valkara-ai-voice-scheduler.git
cd valkara-ai-voice-scheduler
npm install
```

Create a `.env.local` file:
```bash
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=your_email@gmail.com
```

### Run
```bash
npm run dev
```
Open `http://localhost:3000`. 
*(Note: To test the webhook locally, you will need to utilize a service like ngrok to expose your localhost to VAPI for the POST request).*

---
## 📝 License
MIT
