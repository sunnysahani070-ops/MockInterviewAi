# 🤖 MockMate AI — AI-Powered Mock Interview Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Authentication-6C47FF?style=flat&logo=clerk)](https://clerk.com/)
[![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=flat&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=flat&logo=google)](https://aistudio.google.com/)

> **Ace your next tech interview with personalized AI coaching, real-time voice transcription, and instant performance feedback.**

MockMate AI is a full-stack, placement-ready mock interview web application. Built with Next.js 14 App Router, Google Gemini 2.5 Flash, Clerk Authentication, and Neon Serverless PostgreSQL, it creates tailor-made interview rounds for any job role, tech stack, and experience level.

---

## 🌟 Key Features

- 🧠 **Smart Question Generation**: Creates targeted interview questions and model answers using Google Gemini 2.5 Flash.
- 🎙️ **Voice & Audio Interface**: Hands-free answer recording with Web Speech-to-Text (`webkitSpeechRecognition`) and question audio readout via TTS.
- 📹 **Realistic Interview Simulation**: Live webcam mirror and device check to simulate real-world technical interviews.
- 📊 **AI Evaluation & Scoring**: Instant ratings (1–10) and actionable improvement feedback compared against ideal model answers.
- 🔐 **Secure Authentication**: Authentication and session management powered by Clerk Core 3 with protected routes.
- 🗄️ **Data Persistence**: Stores interview history, questions, answers, and scores in a Neon Serverless PostgreSQL database managed with Drizzle ORM.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components & Server Actions)
- **Frontend**: [React 18](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/)
- **Authentication**: [Clerk](https://clerk.com/) (`@clerk/nextjs` v7)
- **Database**: [Neon](https://neon.tech/) Serverless PostgreSQL
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **AI Engine**: [Google Gemini AI](https://aistudio.google.com/) (`gemini-2.5-flash`)
- **Speech & Media**: Web Speech API (`webkitSpeechRecognition` + `window.speechSynthesis`), `react-webcam`

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/sunnysahani070-ops/MockInterviewAi.git
cd MockInterviewAi
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Google Gemini API Key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Neon PostgreSQL Database URL
NEXT_PUBLIC_DRIZZLE_DB_URL=your_neon_postgres_url
```

### 4. Push Database Schema

```bash
npm run db:push
```

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
├── app/
│   ├── (auth)/                          # Clerk Sign-in / Sign-up pages
│   ├── dashboard/                       # Protected dashboard & interview pages
│   │   ├── interview/[interviewId]/     # Setup, device check & tips
│   │   │   ├── start/                   # Live question answering & audio recording
│   │   │   └── feedback/                # Score report & AI review
│   │   └── page.jsx                     # Dashboard home & interview history
│   ├── api/fetchUserData/               # API route for user answer history
│   └── layout.js                        # Root layout with ClerkProvider
├── components/ui/                       # Reusable UI primitives
├── utils/
│   ├── db.js                            # Drizzle database connection
│   ├── schema.js                        # Database table schema
│   └── GeminiAIModal.js                 # Gemini AI initialization (gemini-2.5-flash)
├── middleware.js                        # Route-level authentication middleware
└── drizzle.config.js                    # Drizzle configuration
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.
