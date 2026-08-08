# ✦ TasteForge AI

**Food that understands you.**

TasteForge AI is a modern, personalized food intelligence web application built with a stunning Neobrutalist design system. It learns your preferences, respects your dietary safety rules, and uses AI to generate the perfect meal recommendation tailored to your unique palate.

## ✨ Key Features

- **🧠 Taste DNA Engine**: A living map of your appetite. Track your spice tolerance, flavor preferences (sweet, savory, texture, health), allergies, and dietary restrictions.
- **🤖 Generative AI Integration**: Powered by the **Google Gemini 1.5 Flash API**, TasteForge dynamically matches your Taste DNA and current mood with the perfect dish, offering personalized reasoning for every pick.
- **🛡️ Hard-Filter Safety**: Allergens and strict diets are rigorously filtered out before any AI or algorithmic ranking occurs. You'll never see a recommendation that conflicts with your safety rules.
- **☁️ Hybrid Database Architecture**: 
  - **Offline-First (Edge)**: Fully functional in local storage. Create an account, build your Taste DNA, and generate recommendations completely locally with zero server latency.
  - **Cloud Sync**: Log in with Google (Firebase Auth) to instantly sync your profile, saved meals, and order history across devices via Firestore.
- **🎨 Custom Neobrutalism UI**: A visually striking interface built from scratch using pure CSS variables and modern layout techniques, without relying on heavy UI libraries.

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 + TypeScript
- **Architecture**: Next.js Server Components pattern (via Vinext & Vite)
- **Styling**: Vanilla CSS (Custom Neobrutalism Design System)
- **Authentication**: Firebase Authentication + Local Storage Fallback
- **Database**: Firebase Firestore (Cloud) + Browser Local Storage (Offline Edge)
- **AI Engine**: Google Gemini 1.5 Flash API + Custom Rule-Based TypeScript Fallback

## 🚀 Getting Started

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/nandu123-1/TasteForgeAI.git
cd TasteForgeAI
npm install
```

### 2. Environment Variables

Create a `.env` file in the root of the project. To enable the AI features, you just need to provide a Gemini API key. The app will gracefully fall back to a local rule-based algorithm if this is not provided.

```env
# To enable live Generative AI recommendations
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# (Optional) To enable Google Sign-in and Cloud Sync
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. Run the Development Server

Start the local server:

```bash
npm run dev
```

Navigate to `http://localhost:3000` to start exploring your Taste DNA!

## 📸 Screenshots

*(Add screenshots of your Dashboard, AI Food Lab, and Taste DNA here!)*

## 📄 License

This project is open-source and available for educational and demonstration purposes.
