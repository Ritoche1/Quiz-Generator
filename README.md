# 🧠 Quiz Generator

<div align="center">

**An AI-powered educational platform for creating, sharing, and competing in personalized quizzes**

[![Made with Next.js](https://img.shields.io/badge/Made%20with-Next.js-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Powered by Mistral AI](https://img.shields.io/badge/Powered%20by-Mistral%20AI-FF6B35?style=for-the-badge)](https://mistral.ai/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)

[🚀 Live Demo](https://quiz.ritoche.site) • [📖 Documentation](#documentation) • [🐛 Report Bug](https://github.com/ritoche1/quiz-generator/issues) • [✨ Request Feature](https://github.com/ritoche1/quiz-generator/issues)

</div>

---

## ✨ What is Quiz Generator?

Quiz Generator is a **comprehensive educational platform** that transforms learning into an engaging, social experience. Powered by **Mistral AI**, it goes far beyond simple quiz creation to offer a complete ecosystem for education and competition.

### 🎯 Key Highlights

- **🤖 AI-Powered Quiz Creation**: Generate intelligent quizzes on any topic using Mistral AI
- **👥 Social Learning**: Connect with friends, compete on leaderboards, and share knowledge
- **📊 Advanced Analytics**: Track progress, streaks, and performance with detailed statistics
- **🎨 Modern Interface**: Beautiful, responsive design with glass morphism effects
- **🔒 Secure & Scalable**: Built with modern architecture and best practices

> **🏆 Perfect for**: Students, educators, teams, and anyone who loves learning and friendly competition!

## 📋 Table of Contents

- [✨ What is Quiz Generator?](#-what-is-quiz-generator)
- [🚀 Features](#-features)
- [📸 Screenshots](#-screenshots)
- [🛠️ Tech Stack](#️-tech-stack)
- [⚡ Quick Start](#-quick-start)
- [🔧 Installation](#-installation)
- [🌍 Environment Setup](#-environment-setup)
- [📁 Project Structure](#-project-structure)
- [🧪 Testing](#-testing)
- [📚 API Documentation](#-api-documentation)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)

## 🚀 Features

### 🎓 **Smart Quiz Generation**
- **AI-Powered Content**: Create quizzes on any topic using advanced Mistral AI
- **Multiple Languages**: Support for various languages and localization
- **Difficulty Levels**: Easy, Medium, and Hard difficulty settings
- **Custom Topics**: Generate quizzes on virtually any subject matter

### 👥 **Social Learning Platform**
- **Friends System**: Send friend requests, build your learning network
- **Real-time Notifications**: Stay updated on friend activities and system events
- **Global Leaderboards**: Compete with users worldwide across difficulty levels
- **User Profiles**: Track personal statistics, streaks, and achievements

### 🎨 **Modern User Experience**
- **Glass Morphism Design**: Beautiful, modern interface with stunning visual effects
- **Responsive Layout**: Perfect experience on desktop, tablet, and mobile
- **Dark/Light Themes**: Adaptive design that works in any environment
- **Smooth Animations**: Engaging transitions and micro-interactions

### 📊 **Advanced Analytics & Tracking**
- **Detailed Statistics**: Track quiz attempts, scores, and improvement over time
- **Streak Tracking**: Monitor daily learning streaks and consistency
- **Performance Analytics**: Understand strengths and areas for improvement
- **Export Capabilities**: Generate PDF reports and worksheets

### 🛠️ **Quiz Management**
- **Quiz Editor**: Create custom quizzes with preview functionality
- **Public/Private Settings**: Control quiz visibility and sharing
- **Quiz History**: Access and replay previous quizzes
- **Template System**: Use existing quizzes as templates for new ones

### 🔒 **Security & Privacy**
- **JWT Authentication**: Secure token-based user authentication
- **Protected Routes**: Proper access control for authenticated features
- **Data Privacy**: Secure handling of user data and quiz content
- **Usage Limits**: Built-in rate limiting to prevent abuse

## 📸 Screenshots

<div align="center">

### 🏠 Homepage - AI Quiz Generation
![Quiz Generation](assets/homepage.png)

### 🎯 Interactive Quiz Taking
![Quiz Interface](assets/quiz.png)

### 🏆 Global Leaderboards
![Leaderboards](assets/leaderboard.png)

### 👤 User Profile & Statistics
![Profile](assets/profile.png)

</div>

## 🛠️ Tech Stack

### **Frontend**
- **⚛️ Next.js 15** - React framework with App Router
- **🎨 Tailwind CSS** - Utility-first CSS framework
- **✨ Glass Morphism** - Modern UI design system
- **📱 Responsive Design** - Mobile-first approach

### **Backend**
- **⚡ FastAPI** - High-performance Python API framework
- **🤖 Mistral AI** - Advanced AI for quiz generation
- **🐘 PostgreSQL** - Robust relational database
- **🔐 JWT Authentication** - Secure token-based auth

### **DevOps & Infrastructure**
- **🐳 Docker & Docker Compose** - Containerized deployment
- **🧪 Jest** - Comprehensive testing framework
- **📊 Analytics** - Built-in performance tracking

## ⚡ Quick Start

Get up and running in less than 5 minutes!

### Prerequisites
- 🐳 **Docker & Docker Compose** ([Install Docker](https://docs.docker.com/get-docker/))
- 🔑 **Mistral AI API Key** ([Get your key](https://console.mistral.ai/))

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/ritoche1/quiz-generator.git
cd quiz-generator
```

### 2️⃣ Set Up Environment Variables
```bash
# Set up frontend environment
cp quiz-generator/.env.example quiz-generator/.env

# Set up backend environment  
cp quiz-generator-backend/.env.example quiz-generator-backend/.env

# Edit both files with your Mistral AI API key
nano quiz-generator/.env
nano quiz-generator-backend/.env
```

### 3️⃣ Launch with Docker
```bash
# Build and start all services
docker-compose up --build -d

# View logs (optional)
docker-compose logs -f
```

### 4️⃣ Access the Application
- **🌐 Frontend**: http://localhost:83
- **🚀 API Backend**: http://localhost:5000
- **📊 API Docs**: http://localhost:5000/docs

That's it! 🎉 Your Quiz Generator is now running!

## 🔧 Installation

### 🐳 Docker Deployment (Recommended)

Docker provides the easiest and most reliable deployment method.

```bash
# Clone repository
git clone https://github.com/ritoche1/quiz-generator.git
cd quiz-generator

# Set up environment files (REQUIRED before running Docker)
cp quiz-generator/.env.example quiz-generator/.env
cp quiz-generator-backend/.env.example quiz-generator-backend/.env

# Edit both files with your Mistral AI API key
# You must configure both files before running docker-compose!

# Deploy with Docker
docker-compose up --build -d
```

**Services:**
- **Frontend**: http://localhost:83
- **Backend API**: http://localhost:5000  
- **Database**: PostgreSQL (internal network)

### 💻 Local Development

For development with hot reload:

**🎯 Method 1: Full Local Development**
```bash
# 1. Set up environment files
cp quiz-generator/.env.example quiz-generator/.env.local
cp quiz-generator-backend/.env.example quiz-generator-backend/.env

# Edit the files with your Mistral AI API key and settings

# 2. Backend (Terminal 1)
cd quiz-generator-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 5000

# 3. Frontend (Terminal 2)
cd quiz-generator
npm install
npm run dev  # Runs on http://localhost:3000
```

**🐳 Method 2: Hybrid (Database in Docker, Apps Local)**
```bash
# Start only the database
docker-compose up postgres -d

# Set up environment files for local development
cp quiz-generator/.env.example quiz-generator/.env.local
cp quiz-generator-backend/.env.example quiz-generator-backend/.env

# Update backend .env DATABASE_URL to: 
# DATABASE_URL=postgresql+asyncpg://quizuser:quizpass@localhost:5432/quizdb

# Then follow Method 1 for backend and frontend
```

> 💡 **Pro Tip**: Use Method 2 for the best development experience - you get hot reload for both frontend and backend, but don't need to set up PostgreSQL locally!

## 🌍 Environment Setup

The project uses **separate environment configurations** for frontend and backend components. **You must configure both before running Docker**.

### ⚠️ **IMPORTANT: No Root .env File**
Unlike many projects, this one **does NOT use a root `.env` file**. Each component has its own environment configuration that must be set up separately.

### 📁 Environment Files Structure
```
📦 Quiz-Generator/
├── .env.example                    # 👈 Reference only - not used by Docker
│
├── 🎨 quiz-generator/              # Frontend Directory
│   ├── .env.example                # 👈 Frontend config template  
│   └── .env                        # 👈 Your frontend config (REQUIRED for Docker)
│
└── ⚡ quiz-generator-backend/      # Backend Directory
    ├── .env.example                # 👈 Backend config template
    └── .env                        # 👈 Your backend config (REQUIRED for Docker)
```

### 🚨 **Required Setup Before Running Docker**
```bash
# You MUST run these commands before docker-compose up:

# 1. Copy frontend environment template
cp quiz-generator/.env.example quiz-generator/.env

# 2. Copy backend environment template  
cp quiz-generator-backend/.env.example quiz-generator-backend/.env

# 3. Edit BOTH files with your actual Mistral AI API key
nano quiz-generator/.env           # Add your MISTRAL_API_KEY
nano quiz-generator-backend/.env   # Add your MISTRAL_API_KEY
```

### 🔧 Configuration Details

#### 🎨 Frontend Environment (`quiz-generator/.env`)
```env
# Mistral AI configuration (Required)
MISTRAL_API_KEY=your_mistral_api_key_here

# Connection to backend API
NEXT_PUBLIC_BASE_URL=http://localhost:5000

# App version (displayed in footer)  
VERSION=1.0.0
```

#### ⚡ Backend Environment (`quiz-generator-backend/.env`)
```env
# Mistral AI configuration (Required)
MISTRAL_API_KEY=your_mistral_api_key_here

# Server configuration
BASE_URL=http://localhost:5000
JWT_SECRET=your_super_secret_jwt_key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database configuration (Docker internal)
DATABASE_URL=postgresql+asyncpg://quizuser:quizpass@postgres:5432/quizdb
```

### 🔑 Getting Your Mistral AI API Key

1. Visit [Mistral AI Console](https://console.mistral.ai/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Generate a new API key
5. Copy and paste it into **BOTH** environment files

### ⚙️ Environment Variables Explanation

| Variable | Purpose | Used In | Required | Example |
|----------|---------|---------|----------|---------|
| `MISTRAL_API_KEY` | Mistral AI API key for quiz generation | Both | ✅ Yes | `A8ZIs6at7BnAoL...` |
| `NEXT_PUBLIC_BASE_URL` | Frontend → Backend connection URL | Frontend | ✅ Yes | `http://localhost:5000` |
| `BASE_URL` | Backend internal configuration | Backend | ✅ Yes | `http://localhost:5000` |
| `JWT_SECRET` | JWT token signing secret | Backend | ✅ Yes | `wonderful_key` |
| `DATABASE_URL` | PostgreSQL connection string | Backend | ✅ Yes | `postgresql+asyncpg://...` |
| `VERSION` | App version (shown in footer) | Frontend | ❌ No | `1.0.0` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT token expiration | Backend | ❌ No | `30` |

### 🛡️ Security Notes

> ⚠️ **Important**: 
> - **Never commit `.env` files** to version control (they're in `.gitignore`)
> - **`NEXT_PUBLIC_BASE_URL`** is exposed to the browser - don't include secrets
> - **Use different `JWT_SECRET`** values for development and production
> - **Both environment files need `MISTRAL_API_KEY`** for the system to work

### 🚀 Docker vs Local Development

#### For Docker Deployment:
- Configure `quiz-generator/.env` and `quiz-generator-backend/.env`
- Docker Compose automatically uses these files via `env_file` directives
- **Both files are required** before running `docker-compose up`

#### For Local Development:
- Frontend: Use `quiz-generator/.env.local` (Next.js convention)
- Backend: Use `quiz-generator-backend/.env`
- Database: Use Docker or local PostgreSQL instance

## 📁 Project Structure

```
📦 Quiz-Generator/
├── 🐳 docker-compose.yml          # Multi-service Docker configuration
├── 📄 CHANGELOG.md                # Detailed version history
├── 📋 README.md                   # You are here!
├── 🔧 DATABASE_RESET_INSTRUCTIONS.md
├── 🌍 .env.example               # Reference template (not used by Docker)
├── 📸 assets/                     # Screenshots and images
│
├── 🎨 quiz-generator/             # Next.js Frontend Application
│   ├── 🐳 Dockerfile             # Frontend container configuration
│   ├── 📦 package.json           # Node.js dependencies
│   ├── ⚙️ next.config.mjs        # Next.js configuration
│   ├── 🎨 tailwind.config.js     # Tailwind CSS configuration
│   ├── 🧪 jest.config.js         # Testing configuration
│   ├── 🌍 .env.example           # Frontend environment template
│   ├── 🌍 .env                   # Your frontend configuration (REQUIRED)
│   ├── 🌍 .env.local             # Local development configuration
│   │
│   ├── 📁 src/
│   │   ├── 📱 app/                # Next.js App Router pages
│   │   │   ├── 🏠 page.js         # Homepage - Quiz generation
│   │   │   ├── 👤 profile/        # User profile & statistics
│   │   │   ├── 👥 friends/        # Social features
│   │   │   ├── 🏆 leaderboard/    # Global rankings
│   │   │   ├── 🔍 browse/         # Discover quizzes
│   │   │   └── ✏️ editor/         # Quiz creation tool
│   │   │
│   │   ├── 🧩 components/         # Reusable React components
│   │   │   ├── 🎯 QuizGenerator.js
│   │   │   ├── 📊 Navigation.js
│   │   │   ├── 🎨 AppShell.js
│   │   │   └── 🔧 TemplatePickerModal.js
│   │   │
│   │   ├── 🎨 styles/             # Global styling
│   │   │   └── globals.css        # Tailwind + custom styles
│   │   │
│   │   └── 🧪 __tests__/          # Frontend unit tests
│   │       ├── page.test.js
│   │       └── QuizGenerator.test.js
│   │
│   └── 📁 public/                 # Static assets
│       └── 🎭 favicon.ico
│
├── ⚡ quiz-generator-backend/     # FastAPI Backend Application
│   ├── 🐳 Dockerfile             # Backend container configuration
│   ├── 📦 requirements.txt       # Python dependencies
│   ├── 🚀 main.py                # FastAPI application entry point
│   ├── 🌍 .env.example           # Backend environment template
│   ├── 🌍 .env                   # Your backend configuration (REQUIRED)
│   │
│   ├── 📁 app/                    # Application modules
│   │   ├── 🛣️ routers/           # API route handlers
│   │   │   ├── 🔐 auth.py         # Authentication endpoints
│   │   │   ├── 🎯 generator.py    # Quiz generation
│   │   │   ├── 👥 friends.py      # Social features
│   │   │   ├── 📊 scores.py       # Score tracking
│   │   │   └── 🔔 notifications.py
│   │   │
│   │   └── 🔧 services/           # Business logic
│   │       ├── 🤖 mistral_service.py
│   │       └── 📝 quiz_service.py
│   │
│   ├── 📊 crud/                   # Database operations
│   │   ├── user_crud.py
│   │   ├── quiz_crud.py
│   │   └── score_crud.py
│   │
│   ├── 🗄️ database/              # Database configuration
│   │   ├── database.py
│   │   └── models.py              # SQLAlchemy models
│   │
│   └── 📋 schemas/                # Pydantic schemas
│       ├── quiz.py
│       ├── score.py
│       └── friend.py
└── 
```

### 🏗️ Architecture Overview

```mermaid
graph TB
    User[👤 User] --> Frontend[🎨 Next.js Frontend]
    Frontend --> API[⚡ FastAPI Backend]
    API --> DB[(🐘 PostgreSQL)]
    API --> AI[🤖 Mistral AI]
    
    Frontend --> Docker1[🐳 Container 1]
    API --> Docker2[🐳 Container 2]
    DB --> Docker3[🐳 Container 3]
```

## 🧪 Testing

### 🎯 Frontend Testing
```bash
# Navigate to frontend directory
cd quiz-generator

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### 🧪 Backend Testing
```bash
# Navigate to backend directory
cd quiz-generator-backend

# Run backend tests
python -m pytest

# Run with coverage
python -m pytest --cov=app
```

### 🐳 Docker Testing
Tests are automatically run during the Docker build process to ensure stability.

## 📚 API Documentation

### 🚀 Interactive API Docs
- **Swagger UI**: http://localhost:5000/docs
- **ReDoc**: http://localhost:5000/redoc

### 🔑 Key Endpoints

#### 🎯 Quiz Generation
```http
POST /generate/quiz
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "topic": "JavaScript Fundamentals",
  "difficulty": "medium",
  "language": "English",
  "num_questions": 10
}
```

#### 👥 Social Features
```http
GET /friends/list          # Get friend list
POST /friends/request      # Send friend request  
GET /leaderboard/{difficulty}  # Get leaderboard
```

#### 📊 User Statistics
```http
GET /scores/user/history   # Get quiz history
GET /auth/me              # Get current user info
```

## 🤝 Contributing

We love contributions! Here's how you can help make Quiz Generator even better:

### 🐛 Reporting Bugs
1. Check [existing issues](https://github.com/ritoche1/quiz-generator/issues)
2. Create a [new issue](https://github.com/ritoche1/quiz-generator/issues/new) with:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### ✨ Suggesting Features
1. Check [existing feature requests](https://github.com/ritoche1/quiz-generator/issues?q=is%3Aissue+label%3Aenhancement)
2. Create a new issue with the `enhancement` label
3. Describe the feature and its benefits

### 🔧 Contributing Code

```bash
# 1. Fork the repository
git fork https://github.com/ritoche1/quiz-generator.git

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/quiz-generator.git
cd quiz-generator

# 3. Create a feature branch
git checkout -b feature/amazing-new-feature

# 4. Set up development environment
cp quiz-generator/.env.example quiz-generator/.env.local
cp quiz-generator-backend/.env.example quiz-generator-backend/.env
# Edit with your configurations

# 5. Make your changes
# ... code changes ...

# 6. Test your changes
cd quiz-generator && npm test          # Frontend tests
cd ../quiz-generator-backend && python -m pytest  # Backend tests

# 7. Commit with conventional commits
git commit -m "feat: add amazing new feature"

# 8. Push and create PR
git push origin feature/amazing-new-feature
```

### 📝 Development Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed  
- Use conventional commit messages
- Ensure all tests pass before submitting PR
- Set up both environment files for complete testing

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Antoine Descamps (Ritoche1)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

## 🙏 Acknowledgments

### 🤖 **Powered by Mistral AI**
Special thanks to [Mistral AI](https://mistral.ai/) for providing the incredible AI capabilities that make intelligent quiz generation possible.

### 🛠️ **Built with Amazing Tools**
- [Next.js](https://nextjs.org/) - The React Framework for Production
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python Web Framework  
- [Tailwind CSS](https://tailwindcss.com/) - Utility-First CSS Framework
- [PostgreSQL](https://www.postgresql.org/) - Powerful Open Source Database
- [Docker](https://www.docker.com/) - Containerization Platform

### 💡 **Inspiration**
This project was inspired by the desire to make learning more engaging, social, and accessible to everyone through the power of AI.

---

<div align="center">

### 🌟 **Star this repository if you found it helpful!**

[![GitHub stars](https://img.shields.io/github/stars/ritoche1/quiz-generator?style=social)](https://github.com/ritoche1/quiz-generator/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/ritoche1/quiz-generator?style=social)](https://github.com/ritoche1/quiz-generator/network/members)

**[🚀 Try it now](https://quiz.ritoche.site)** • **[📖 Documentation](#)** • **[💬 Discord](https://discord.gg/your-server)**

---

**Made with ❤️ by [Ritoche1](https://github.com/ritoche1/ritoche1)**

*Transforming education through AI, one quiz at a time* ✨

</div>
