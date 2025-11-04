# 🧩 Assign Flow

🚀 **Live Demo:** [Assign Flow on Vercel](https://assignflow-dash-main.vercel.app/)

A clean, responsive dashboard for a student-assignment management system with clear **role-based functionality**.

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Overview

Assign Flow is a modern web application designed to streamline assignment management for educational institutions. It provides a seamless experience for both students and professors to manage assignments, track submissions, and monitor progress.

### Key Highlights

- **Role-Based Access Control**: Separate dashboards for students and admins (professors)
- **Real-Time Updates**: Live tracking of assignment submissions
- **Responsive Design**: Works seamlessly across all devices
- **Secure Authentication**: Powered by Supabase Auth
- **Double Verification Flow**: Students confirm submissions with a two-step process

## ✨ Features

### 👩‍🎓 Student Features

- ✅ View assignments assigned to them only
- 📅 Check due dates and progress
- ✅ Mark assignments as completed via double-verification flow
- 📊 Track overall progress visually
- 🔗 Access Google Drive submission links

### 👨‍🏫 Admin Features

- ➕ Create and manage assignments
- 📝 Add details, due dates, and Google Drive submission links
- 👥 View each student's progress on their assignments
- 📈 See submission analytics via progress bars
- 🗑️ Edit and delete assignments

## 🛠️ Tech Stack

| Category | Technology Used |
|-----------|-----------------|
| **Frontend** | React.js 18.3, TypeScript, Tailwind CSS |
| **UI Components** | Radix UI, shadcn/ui |
| **State Management** | React Query (TanStack Query) |
| **Routing** | React Router DOM v6 |
| **Backend** | Supabase (Authentication & Database) |
| **Form Handling** | React Hook Form, Zod |
| **Build Tool** | Vite 5.4 |
| **Deployment** | Vercel |
| **Version Control** | Git & GitHub |

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, pnpm, or bun
- A Supabase account and project

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/Assign_Flow.git
cd Assign_Flow/assignflow-main/assignflow-dash-main
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://supabase.com/dashboard/project/afgpbqezmxyduoatvmqg
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmZ3BicWV6bXh5ZHVvYXR2bXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzM2ODAsImV4cCI6MjA3NzQwOTY4MH0._66fmdOW2nzfuFYaFi7X3V9NRZxz9e2Mp4icgV5rn6g
```

4. **Run the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at `http://localhost:8080`

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development mode
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
assignflow-dash-main/
│
├── public/                 # Static assets
│   └── University.jpg      # Background images
│
├── src/
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # Supabase client configuration
│   ├── pages/              # Page components
│   │   ├── AdminAssignments.tsx
│   │   ├── Auth.tsx
│   │   ├── Dashboard.tsx
│   │   └── StudentAssignments.tsx
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
│
├── supabase/               # Supabase configuration
│   ├── migrations/         # Database migrations
│   └── config.toml         # Supabase project config
│
├── components.json         # shadcn/ui component config
├── eslint.config.js        # ESLint configuration
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
├── .env                    # Environment variables (not in git)
└── README.md               # Project documentation
```

## 🔐 Environment Variables

The following environment variables are required:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anonymous/public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### How to Get Supabase Credentials

1. Go to [Supabase](https://supabase.com) and create an account
2. Create a new project
3. Go to Project Settings → API
4. Copy the `Project URL` and `anon/public` key
5. Add them to your `.env` file

## 🚢 Deployment

### Deploy to Vercel

The easiest way to deploy is using Vercel:

1. **Install Vercel CLI** (if not already installed)

```bash
npm i -g vercel
```

2. **Login to Vercel**

```bash
vercel login
```

3. **Deploy to production**

```bash
vercel --prod
```

4. **Set Environment Variables in Vercel**

- Go to your project settings on Vercel
- Navigate to Environment Variables
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
- Redeploy your application

### Manual Build

To build the project manually:

```bash
npm run build
```

The built files will be in the `dist/` directory, ready to be deployed to any static hosting service.

## 🗄️ Database Setup

The project uses Supabase for database management. The database schema includes:

- **assignments** table: Stores assignment information
- **submissions** table: Tracks student submissions
- **user_roles** table: Manages user roles (student/admin)

Migrations are located in `supabase/migrations/`. Apply them through the Supabase dashboard or CLI.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Your Name**

- GitHub: https://github.com/sonyypandranki

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com) for the UI component library
- [Vercel](https://vercel.com) for deployment hosting

---

⭐ If you found this project helpful, please consider giving it a star!

