# Quiz Generator

Quiz Generator powered by Mistral AI. This project allows you to generate customized quizzes based on a topic, language, and difficulty level. It consists of two parts:

- **Frontend:** A Next.js application located in [quiz-generator](quiz-generator/), which manages the user interface and quiz display logic.
- **Backend:** A FastAPI REST API located in [quiz-generator-backend](quiz-generator-backend/), which communicates with Mistral AI to generate quiz content and connects to a Postgres database.

> **Note:** Docker is now required for deployment due to the Postgres database integration.

## Table of Contents

- [Overview](#overview)
- [Environment Variables](#environment-variables)
- [Setup Instructions](#setup-instructions)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [Project Features](#project-features)
- [Project Architecture](#project-architecture)
- [Installation and Launch](#installation-and-launch)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Contribution](#contribution)
- [License](#license)

## Overview

Quiz Generator is an interactive quiz generator that leverages Mistral AI to create personalized questionnaires. The backend now uses a Postgres database (configured in Docker) and additional environment variables to enhance the configuration.

## Environment Variables

Create a `.env` file in the project root with the following (adjust as needed):

```env
MISTRAL_API_KEY=your_api_key_here
BASE_URL=http://localhost:5000
DATABASE_URL=postgresql+asyncpg://quizuser:quizpass@postgres:5432/quizdb
```

## Setup Instructions

1. **Clone the Repository**  
   Clone this repository to your local machine.

2. **Prerequisites**  
   - [Docker](https://www.docker.com/get-started) and Docker Compose are required.
   - Ensure you have [Node.js](https://nodejs.org) (v18 or higher) installed.
   - Python is bundled with our Docker images so a local Python installation is not required unless you choose to run the backend locally.

3. **Install Dependencies**  
   Dependencies are installed during the Docker build process.

## Usage

### Using Docker

Since Docker is required for both the backend (with Postgres) and the frontend, follow these steps:

1. Make sure Docker is installed and running.
2. From the project root, build and run the containers:

   ```bash
   docker-compose up --build -d
   ```

   - **Frontend:** Accessible on port **83**
   - **Backend:** Accessible on port **5000**
   - **Postgres Database:** Configured as part of the Docker stack (service name “postgres”)

## Technologies Used

- **Frontend:** Next.js, React, Tailwind CSS, Jest & React Testing Library  
  *(Entry Point: page.js)*

- **Backend:** FastAPI, uvicorn, Python Dotenv, Mistralai (Mistral AI client), Postgres  
  *(Implementation: main.py)*

- **Containerization:** Docker and Docker Compose

## Project Features

- **Customized Quiz Generation:** Create quizzes based on topics, languages, and difficulty levels.
- **Dynamic User Interface:** Responsive UI built with Next.js and styled with Tailwind CSS.
- **Backend API:** FastAPI backend that communicates with Mistral AI and uses Postgres for data storage.
- **Automated Testing:** Frontend tests are set up using Jest.
- **Error Handling & Feedback:** User-friendly error messages with visual feedback on answer submissions.

## Project Architecture

- **Frontend:**  
  Developed with Next.js, with the entry point at page.js.

- **Backend:**  
  Implemented with FastAPI and configured to work with a Postgres database via Docker. See main.py for details.

## Installation and Launch

### Launch with Docker

1. Make sure Docker and Docker Compose are installed and running.
2. From the project root directory, run:

   ```bash
   docker-compose up --build -d
   ```

   The containers will start:
   
   - Frontend on port **83**
   - Backend on port **5000**
   - Postgres is available on its configured internal network

## Project Structure

```
Quiz-Generator/
├── .gitignore
├── .env                     # Environment variables file
├── docker-compose.yml
├── README.md
├── next.config.mjs           # Next.js configuration
├── jest.config.js            # Jest configuration
├── jest.setup.js             # Jest setup
├── package.json              # Project dependencies and scripts
├── postcss.config.mjs        # PostCSS configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── quiz-generator/           # Next.js Frontend
│   ├── Dockerfile            # Frontend Dockerfile (includes tests)
│   ├── package.json
│   ├── next.config.mjs
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.js
│   │   │   └── layout.js
│   │   ├── components/
│   │   │   ├── QuizGenerator.js
│   │   │   ├── QuizQuestion.js
│   │   │   └── QuizRecap.js
│   │   └── __tests__/         # Frontend unit tests
│   │       ├── page.test.js
│   │       ├── QuizGenerator.test.jsx
│   │       └── QuizQuestion.test.js
│   └── styles/               
└── quiz-generator-backend/   # FastAPI Backend
    ├── Dockerfile            # Backend Dockerfile
    ├── main.py
    └── README.md
```

## Testing

### Frontend Testing

To run frontend tests locally:

1. Navigate to the quiz-generator folder.
2. Execute:

   ```bash
   npm test
   ```

The Dockerfile for the frontend also runs tests as part of its build process to ensure stable builds.

## Contribution

Contributions are welcome! Please submit an issue or pull request for any improvements or fixes.

## License

This project is licensed under the MIT License.
<<<<<<< HEAD
```
=======
>>>>>>> cec3c49e93a5791bdc6861b93696202c1543f897
