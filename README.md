# ⚽ Turf Split — Game Dues Tracker

A sleek, fast, and simple React application to manage turf games, split costs, log cash and UPI payments, and track who still owes money.

## ✨ Features

- **Authentication**: Email & password authentication powered by Supabase.
- **Game Management**: Create and track football/turf games with total booking costs and played dates.
- **Payment Tracking**:
  - Support for **Cash**, **UPI**, **Pay Later**, and **Split** (between pairs).
  - One-click payment settling for "Pay Later" players.
- **Automatic Breakdown**:
  - Real-time calculations of total collected vs. turf cost.
  - Automatic computation of pending amounts and organizer surplus ("My cut").
- **Clean & Responsive UI**: Built with Tailwind CSS and Radix UI primitives.

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm

### 2. Installation

```sh
npm install
```

### 3. Environment Variables

Create a `.env` file in the project root (or verify your existing one):

```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
```

### 4. Running Locally

```sh
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### 5. Building for Production

```sh
npm run build
```

## 🛠️ Tech Stack

- **React 19**
- **Vite**
- **TypeScript**
- **Tailwind CSS v4**
- **Supabase** (Database & Auth)
- **Lucide React** (Icons)
- **Sonner** (Toast notifications)
