# RoleplayAssess — AI Customer Service Training Platform

A voice-powered roleplay assessment tool for telecom store executives. Practice real customer scenarios with an AI customer (powered by Claude), get scored instantly across 5 performance criteria, and improve your customer service skills.

🌐 **Live Demo**: https://ai-roleplay-42kd-phnpnuqsb-vijays-projects-cd1cd2c8.vercel.app/home-screen

---

## 🎯 Features

- **3 Roleplay Scenarios** — SIM Replacement (Beginner), Bill Dispute (Intermediate), New Connection (Advanced)
- **Voice Input** — Speak your responses using OpenAI Whisper STT (works on Chrome, Firefox, Safari, Edge — desktop & mobile)
- **AI Customer** — Claude (Anthropic) plays a realistic, emotionally authentic Indian telecom customer who never breaks character or guides you
- **AI Voice Output** — ElevenLabs TTS with 6 voice options for natural AI speech
- **AI Scoring** — Claude evaluates your performance across 5 criteria: Communication, Empathy, Process Adherence, Problem Resolution, Professionalism
- **Protocol Checklist** — Real-time tracking of 7 service protocol steps
- **Session History** — All sessions saved locally (and optionally to Supabase)
- **Mobile Compatible** — Mic and audio playback work on mobile Chrome and Safari

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── home-screen/          # Scenario selection & session history
│   ├── roleplay-screen/      # Live roleplay with voice controls
│   ├── score-screen/         # AI evaluation results & feedback
│   └── api/
│       ├── chat/             # Claude AI chat controller
│       ├── evaluate/         # Claude evaluation controller
│       ├── tts/              # ElevenLabs TTS controller
│       └── whisper/          # OpenAI Whisper STT controller
├── backend/
│   ├── models/               # Scenario & protocol data models
│   └── services/             # Prompt engineering (server-side only)
├── frontend/
│   ├── hooks/                # useSpeechRecognition, useSpeechSynthesis, useTimer
│   └── services/             # HTTP clients for API routes (chat, tts, evaluate, storage)
├── lib/
│   └── supabase/             # Supabase client & session service
└── types/                    # Shared TypeScript interfaces
```

**Separation of Concerns:**
- `backend/` — server-side only (prompt building, data models). Never imported by client components directly.
- `frontend/` — client-side hooks and services. Never call AI APIs directly — always via `/api/` routes.
- `app/api/` — Next.js API route controllers. All API keys stay server-side.

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- API keys (see below)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd <project-folder>
npm install
```

### 2. Configure Environment Variables


```bash
cp  .env.local
```

Required keys:


 `ANTHROPIC_API_KEY` | Claude AI for chat & evaluation |
| `OPENAI_API_KEY` | Whisper speech-to-text | 

| `ELEVENLABS_API_KEY` | Text-to-speech voices | 

Optional (for cloud session storage):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

> ⚠️ **Security**: API keys are only used server-side in `/api/` routes. They are never exposed to the browser. Do NOT prefix AI keys with `NEXT_PUBLIC_`.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:4028](http://localhost:4028)

### 4. Build for Production

```bash
npm run build
npm run start
```

---

## 🎮 How to Use

1. **Home Screen** — Select a scenario (Beginner → Advanced), review the customer persona, then click **Start Roleplay**
2. **Roleplay Screen** — The AI customer speaks first. Tap **Tap to Speak** to record your response, tap **Tap to Send** when done. The AI responds in real-time.
3. **Score Screen** — End the session anytime. Claude evaluates your performance and shows detailed feedback across 5 criteria.

### Mobile Usage
- Allow microphone permission when prompted
- Works on Chrome (Android), Safari (iOS 14.1+), and Firefox Mobile
- Audio plays automatically after each AI response

---





## 🔒 Security Notes

- All AI API keys (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`) are server-side only
- No secrets are exposed in client-side code or `NEXT_PUBLIC_` variables
- Session data is stored in `localStorage` by default (no PII sent to external services)
- Supabase integration is optional and uses Row Level Security (RLS)

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| AI Chat | Anthropic Claude (claude-sonnet-4-5) |
| Speech-to-Text | OpenAI Whisper (whisper-1) |
| Text-to-Speech | ElevenLabs (eleven_multilingual_v2) |
| Database (optional) | Supabase |
| Icons | Lucide React |

---

## 📝 Available Scripts

```bash
npm run dev        # Start development server (port 4028)
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
npm run format     # Format with Prettier
```
