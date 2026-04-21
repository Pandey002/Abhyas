# 🏛️ Abhyas: The AI Flashcard Sanctuary

**Abhyas** (अभ्यास - *Sanskrit for "Deliberate Practice"*) is a premium, AI-native spaced-repetition platform designed to transform complex academic documents into a structured, manageable knowledge base.

![Abhyas Dashboard](https://raw.githubusercontent.com/Pandey002/Abhyas/main/public/icon.png)

## 🚀 The Vision
Education isn't about collecting PDFs; it's about mastering their contents. Abhyas shatters the "Passive Reading" habit by using Generative AI to extract the core conceptual DNA of any text, presenting it in an academia-themed interface designed for focus and long-term retention.

---

## ✨ Key Features

### 🧠 Intelligent AI Extraction
Powered by **Google Gemini 1.5 Flash**, Abhyas analyzes your documents and generates context-aware flashcards:
*   **Quick Dive (10 Cards)**: Focuses strictly on essential "Core Pillars."
*   **Deep Dive (25-30 Cards)**: Explores nuances, edge cases, and complex relationships.

### 📊 Strict SM-2 Tracking Matrix
Adheres to a mathematically rigorous version of the **SM-2 Spaced Repetition Algorithm**:
*   **Dynamic Status Mapping**: Cards are explicitly tracked as `not_started`, `shaky`, or `mastered`.
*   **Forget-Proof Progress**: Unlike other apps, "Percentage Reviewed" remains persistent even if you forget a card, ensuring you hit that 100% milestone with confidence.

### 🏺 Premium "Archivum" Dashboard
*   **Aggregate Mastery**: A centralized Donut Chart visualizing your knowledge standing across the entire library.
*   **Study Progress vs. Mastery**: Distinct dual-tracking bars for each deck (Coral for Visibility, Green for Mastery).
*   **Library Streak**: Personal persistence tracker stored in Supabase to keep your daily habits alive.

### 🎨 Academia Aesthetics
*   **Academic Sanctuary UI**: Smooth parchment tones, deep navy accents, and vibrant coral highlights.
*   **Animated Review Stages**: Fluid card transitions, academic-symbol background overlays, and celebratory confetti upon session completion.

---

## 🛠️ Tech Stack
*   **Core**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions)
*   **Intelligence**: [Google Gemini AI](https://ai.google.dev/)
*   **Persistence**: [Supabase](https://supabase.com/) (PostgreSQL + RLS)
*   **Icons & Design**: [Lucide React](https://lucide.dev/), [Canvas Confetti](https://www.kirilv.com/canvas-confetti/)
*   **Deployment**: [Vercel](https://vercel.com/)

---

## 🚦 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Pandey002/Abhyas.git
cd Abhyas
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Database Schema
Run the SQL migration found in `supabase/schema.sql` inside your Supabase SQL editor to set up the `decks`, `flashcards`, and `global_settings` tables.

### 5. Run it locally
```bash
npm run dev
```

---

## ⚖️ License
Distributed under the MIT License. See `LICENSE` for more information.

---

## 🤝 Contact
Designed & Developed by **Pandey002**
Project Link: [https://github.com/Pandey002/Abhyas](https://github.com/Pandey002/Abhyas)
