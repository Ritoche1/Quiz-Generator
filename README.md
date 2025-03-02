# Quiz Generator

Quiz Generator powered by Mistral AI. This project allows you to generate customized quizzes based on a topic, language and difficulty level, using FastAPI for the backend and Next.js for the frontend.

## Table of Contents

- [Presentation](#presentation)
- [Setup Instructions](#setup-instructions)
- [Usage Guide](#usage-guide)
- [Technologies Used](#technologies-used)
- [Project Features](#project-features)
- [How It Integrates with Mistral AI's Technology](#how-it-integrates-with-mistral-ais-technology)
- [Project Architecture](#project-architecture)
- [Prerequisites](#prerequisites)
- [Installation and Launch](#installation-and-launch)
  - [Local Launch](#local-launch)
  - [Launch with Docker](#launch-with-docker)
- [Project Structure](#project-structure)
- [Frontend Testing](#frontend-testing)
- [Contribution](#contribution)
- [License](#license)

## Presentation

This project is an interactive quiz generator that leverages Mistral AI to create personalized questionnaires. It consists of two distinct parts:

- **Frontend**: A Next.js application located in the [quiz-generator](quiz-generator/) folder, which manages the user interface and quiz display logic.
- **Backend**: A REST API built with FastAPI located in the [quiz-generator-backend](quiz-generator-backend/) folder, which communicates with the Mistral API to generate questions.

## Setup Instructions

1. **Clone the Repository**  
   Clone this repository to your local machine.

2. **Prerequisites**  
   - Ensure you have [Node.js](https://nodejs.org) (v18 or higher) and [Python 3.11](https://www.python.org/downloads/) installed.
   - Install Docker and Docker Compose if you prefer containerized deployment.
   - Create a `.env` file at the root with your Mistral API key:
     ```env
     MISTRAL_API_KEY=your_api_key_here
     ```

3. **Install Dependencies**  
   - For the backend, navigate to quiz-generator-backend and run:
     ```bash
     pip install -r requirements.txt
     ```
   - For the frontend, navigate to quiz-generator and run:
     ```bash
     npm install
     ```

## Usage Guide

1. **Running Locally**  
   - **Backend:**  
     Navigate to quiz-generator-backend and start the FastAPI server:
     ```bash
     python -m uvicorn main:app --host 0.0.0.0 --port 5000
     ```
   - **Frontend:**  
     Navigate to quiz-generator and run:
     ```bash
     npm run dev
     ```
     Open [http://localhost:83](http://localhost:83) in your browser.

2. **Using Docker**  
   Build and run the containers using Docker Compose:
   ```bash
   docker-compose up --build -d
   ```
   The frontend is accessible on port **83** and the backend on port **5000**.

## Technologies Used

- **Frontend:**  
  Next.js, React, Tailwind CSS, Jest & React Testing Library  
  (See src/app/page.js for the entry point and src/styles/globals.css for styling.)

- **Backend:**  
  FastAPI, uvicorn, Python Dotenv, Mistralai (Mistral AI client)  
  (See main.py for the FastAPI implementation.)

- **Containerization:**  
  Docker and Docker Compose

## Project Features

- **Customized Quiz Generation:**  
  Create quizzes based on topic and difficulty selections.

- **Dynamic User Interface:**  
  Responsive UI built with Next.js and styled with Tailwind CSS.

- **Backend API:**  
  FastAPI powered backend that communicates with Mistral AI to generate quiz content.

- **Automated Testing:**  
  Frontend tests using Jest ensure reliability before deployment.

- **Error Handling & Feedback:**  
  User-friendly error messages and visual feedback on answer submissions.

## How It Integrates with Mistral AI's Technology

The backend interacts with Mistral AI using the `mistralai` client. When a quiz is requested, the backend sends a prompt that includes the desired difficulty and topic to Mistral AI's API. The response is then parsed and presented dynamically on the frontend. This integration is outlined in main.py.

## Project Architecture

- **Frontend:**  
  Developed with Next.js, with the entry point at page.js.

- **Backend:**  
  Implemented with FastAPI. Refer to main.py.

## Prerequisites

- Node.js (v18 or higher) for the frontend.
- Python 3.11 for the backend.
- Docker and Docker Compose (optional, for containerized deployment).

## Installation and Launch

### Local Launch

1. **Backend**  
   - Navigate to the quiz-generator-backend folder:
     ```bash
     cd quiz-generator-backend
     ```
   - Install the dependencies:
     ```bash
     pip install -r requirements.txt
     ```
   - Start the server:
     ```bash
     python -m uvicorn main:app --host 0.0.0.0 --port 5000
     ```

2. **Frontend**  
   - Navigate to the quiz-generator folder:
     ```bash
     cd quiz-generator
     ```
   - Install the dependencies:
     ```bash
     npm install
     ```
   - Run tests:
     ```bash
     npm test
     ```
   - Start the application:
     ```bash
     npm run dev
     ```

### Launch with Docker

1. Make sure Docker is installed and running.
2. Use Docker Compose from the project root:
   ```bash
   docker-compose up --build -d
   ```
   The frontend will be available on port **83** and the backend on port **5000**.

## Project Structure

```
Quiz-Generator/
├── .gitignore
├── docker-compose.yml
├── README.md
├── next.config.mjs              # Next.js configuration
├── jest.config.js               # Jest configuration
├── jest.setup.js                # Jest setup
├── package.json                 # Dependencies and scripts
├── postcss.config.mjs           # PostCSS configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── quiz-generator/              # Next.js Frontend
│   ├── Dockerfile               # Frontend Dockerfile (includes tests)
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
│   │   └── __tests__/           # Frontend unit tests
│   │       ├── page.test.js
│   │       ├── QuizGenerator.test.jsx
│   │       └── QuizQuestion.test.js
│   └── styles/                  
└── quiz-generator-backend/      # FastAPI Backend
    ├── Dockerfile               # Backend Dockerfile
    ├── main.py
    └── README.md
```

## Frontend Testing

The frontend tests are executed using Jest and React Testing Library. To run tests locally, navigate to the quiz-generator folder and run:

```bash
npm test
```

The Dockerfile for the frontend also runs tests during the build process to ensure a stable build.

## Contribution

Contributions are welcome!  
Please submit an issue or a pull request for any improvements or fixes.

## License

This project is licensed under the MIT License.
