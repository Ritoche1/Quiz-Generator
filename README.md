# Quiz Generator

Quiz Generator powered by Mistral AI. This project allows you to generate customized quizzes based on a topic and difficulty level, using FastAPI for the backend and Next.js for the frontend.

## Table of Contents

- [Presentation](#presentation)
- [Features](#features)
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

## Features

- Generation of customized quizzes based on topic and difficulty.
- Responsive user interface powered by Next.js and Tailwind CSS ([src/styles/globals.css](quiz-generator/src/styles/globals.css)).
- Communication with a third-party API (Mistral AI) to retrieve dynamic quiz content.
- CORS support to facilitate communication between the frontend and backend.
- A `/ping` endpoint to check backend availability.

## Project Architecture

- **Frontend**: Developed with Next.js. The entry point is located in [quiz-generator/src/app/page.js](quiz-generator/src/app/page.js).
- **Backend**: Implemented with FastAPI. The main file is [quiz-generator-backend/main.py](quiz-generator-backend/main.py).

## Prerequisites

- Node.js (version 18 or higher) for the frontend.
- Python 3.11 for the backend.
- Docker and Docker Compose (optional, for running the entire project in containers).
- **Environment Configuration:** Ensure you have a `.env` file at the root of the project with your `MISTRAL_API_KEY`. For example:

```env
  MISTRAL_API_KEY=your_api_key_here
```

## Installation and Launch

### Local Launch

1. **Backend**  
   - Navigate to the `quiz-generator-backend` folder:
     
     ```bash
     cd quiz-generator-backend
     ```
   - Install the Python dependencies:
     
     ```bash
     pip install -r requirements.txt
     ```
   - Start the FastAPI server:
     
     ```bash
     python -m uvicorn main:app --host 0.0.0.0 --port 5000
     ```

2. **Frontend**  
   - Navigate to the quiz-generator folder:
     
     ```bash
     cd quiz-generator
     ```
   - Install the Node.js dependencies:
     
     ```bash
     npm install
     ```
   - Run tests to verify the proper functioning of the frontend:
     
     ```bash
     npm test
     ```
   - Start the Next.js application:
     
     ```bash
     npm run dev
     ```

### Launch with Docker

The project includes a [docker-compose.yml](http://_vscodecontentref_/0) file at the root along with Dockerfiles for each part. The construction of the Frontend image now includes running tests.  
Thus, during the image build, if any tests fail, the build will be interrupted.

1. Ensure that Docker is installed and running.
2. For the Backend, the Dockerfile is located in [quiz-generator-backend](http://_vscodecontentref_/1).
3. For the Frontend, the Dockerfile in [quiz-generator](http://_vscodecontentref_/2) includes the following steps:
   - Installation of Node.js dependencies.
   - Execution of tests via `npm run test` (if tests fail, the build fails).
   - Launching the application with `npm run dev`.

4. Launch all services with Docker Compose:
   
   ```bash
   docker-compose up --build -d
   ```


> The Frontend service will be accessible on port **3000** and the Backend on port **5000**.

## Project Structure

```
Quiz-Generator/
├── .gitignore
├── docker-compose.yml
├── README.md
├── next.config.mjs              # Next.js configuration
├── jest.config.js               # Jest configuration
├── jest.setup.js                # Jest setup
├── package.json                 # Dependencies and scripts (build, dev, test, etc.)
├── postcss.config.mjs           # PostCSS configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── quiz-generator/              # Next.js Frontend
│   ├── Dockerfile               # Dockerfile for the frontend (tests included)
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
└── quiz-generator-backend/      # FastAPI Backend
    ├── Dockerfile               # Dockerfile for the backend
    ├── main.py
    └── README.md
```

## Frontend Testing

The frontend unit tests are executed with Jest and React Testing Library. To run tests locally, navigate to the quiz-generator folder and execute:

```bash
npm test
```

In the frontend Dockerfile, the command `RUN npm run test` is executed during the build to ensure that the image is only built if all tests pass.

## Contribution

Contributions are welcome!
Please submit an issue or a pull request for any improvements or fixes.

## License

This project is licensed under the MIT License.