# Quiz-Generator

Quiz Generator powered by Mistral AI. Ce projet permet de générer des quiz personnalisés en fonction d'un sujet et d'une difficulté, en utilisant FastAPI pour le backend et Next.js pour le frontend.

## Table des Matières

- [Présentation](#présentation)
- [Fonctionnalités](#fonctionnalités)
- [Architecture du Projet](#architecture-du-projet)
- [Prérequis](#prérequis)
- [Installation et Lancement](#installation-et-lancement)
  - [Lancement en Local](#lancement-en-local)
  - [Lancement avec Docker](#lancement-avec-docker)
- [Structure du Projet](#structure-du-projet)
- [Tests Frontend](#tests-frontend)
- [Contribution](#contribution)
- [Licence](#licence)

## Présentation

Ce projet est un générateur de quiz interactif qui tire parti de l'IA Mistral pour créer des questionnaires personnalisés. Il se compose de deux parties distinctes :

- **Frontend** : Une application Next.js se trouvant dans le dossier [quiz-generator](quiz-generator/), qui gère l'interface utilisateur et la logique d'affichage des quiz.
- **Backend** : Une API REST réalisée avec FastAPI se trouvant dans le dossier [quiz-generator-backend](quiz-generator-backend/), qui communique avec l'API de Mistral pour générer les questions.

## Fonctionnalités

- Génération de quiz personnalisés selon le sujet et la difficulté.
- Interface utilisateur réactive via Next.js et Tailwind CSS ([src/styles/globals.css](quiz-generator/src/styles/globals.css)).
- Communication avec une API tierce (Mistral AI) pour récupérer le contenu dynamique des quiz.
- Support de CORS pour faciliter la communication entre le frontend et le backend.
- Exposition d'un point de contrôle `/ping` pour vérifier la disponibilité du backend.

## Architecture du Projet

- **Frontend** : Développé avec Next.js. Le point d'entrée se trouve dans [quiz-generator/src/app/page.js](quiz-generator/src/app/page.js).
- **Backend** : Implémenté avec FastAPI. Le fichier principal est [quiz-generator-backend/main.py](quiz-generator-backend/main.py).

## Prérequis

- Node.js (version 18 ou supérieure) pour le frontend.
- Python 3.11 pour le backend.
- Docker et Docker Compose (facultatif, pour exécuter l'ensemble du projet en conteneur).

## Installation et Lancement

### Lancement en Local

1. **Backend**  
   - Rendez-vous dans le dossier `quiz-generator-backend` :
     
     ```bash
     cd quiz-generator-backend
     ```
   - Installez les dépendances Python :
     
     ```bash
     pip install fastapi uvicorn mistralai
     ```
   - Lancez le serveur FastAPI :
     
     ```bash
     uvicorn main:app --host 0.0.0.0 --port 5000
     ```

2. **Frontend**  
   - Rendez-vous dans le dossier [quiz-generator](quiz-generator/) :
     
     ```bash
     cd quiz-generator
     ```
   - Installez les dépendances Node :
     
     ```bash
     npm install
     ```
   - Lancez les tests pour vérifier le bon fonctionnement du frontend :
     
     ```bash
     npm test
     ```
   - Lancez l'application Next.js :
     
     ```bash
     npm run dev
     ```

### Lancement avec Docker

Le projet fournit un fichier [docker-compose.yml](docker-compose.yml) à la racine ainsi que des Dockerfile pour chaque partie. La construction de l'image Frontend intègre désormais l'exécution des tests.  
Ainsi, lors de la construction de l'image, si les tests échouent, le build sera interrompu.

1. Assurez-vous que Docker est installé et en cours d'exécution.
2. Pour le Backend, le Dockerfile se trouve dans `quiz-generator-backend/`.
3. Pour le Frontend, le Dockerfile dans `quiz-generator/` inclut les étapes suivantes :
   - Installation des dépendances Node.
   - Exécution des tests via `npm run test` (si les tests échouent, le build échoue).
   - Démarrage de l'application avec `npm run dev`.

4. Lancez l'ensemble des services avec Docker Compose :
   
   ```bash
   docker-compose up --build -d
   ```

Le service Frontend sera accessible sur le port 3000 et le Backend sur le port 5000.

## Structure du Projet

```
Quiz-Generator/
├── .gitignore
├── docker-compose.yml
├── README.md
├── next.config.mjs              # Configuration Next.js
├── jest.config.js               # Configuration de Jest
├── jest.setup.js                # Setup pour Jest
├── package.json                 # Dépendances et scripts (build, dev, test, etc.)
├── postcss.config.mjs           # Configuration PostCSS
├── tailwind.config.js           # Configuration Tailwind CSS
├── quiz-generator/              # Frontend Next.js
│   ├── Dockerfile               # Dockerfile pour le frontend (tests inclus)
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
│   │   └── __tests__/         # Tests unitaires frontend
│   │       ├── page.test.js
│   │       ├── QuizGenerator.test.jsx
│   │       └── QuizQuestion.test.js
│   └── styles/                  
└── quiz-generator-backend/      # Backend FastAPI
    ├── Dockerfile               # Dockerfile pour le backend
    ├── main.py
    └── README.md
```

## Tests Frontend

Les tests unitaires du frontend sont exécutés avec Jest et React Testing Library. Pour lancer vos tests localement, rendez-vous dans le dossier `quiz-generator` et exécutez :

```bash
npm test
```

Dans le Dockerfile du frontend, la commande `RUN npm run test` est exécutée pendant le build pour s'assurer que l'image ne sera construite que si l'ensemble des tests passent.

## Contribution

Les contributions sont les bienvenues !  
Merci de soumettre une "issue" ou un "pull request" pour toute amélioration ou correction.

## Licence

Ce projet est sous licence MIT.