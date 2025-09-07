# Code de la Route Pro

Une application web complète de préparation à l'examen du permis de conduire français, développée avec React et TypeScript.

![Dashboard](https://github.com/user-attachments/assets/c26308bd-8b30-46bc-ab6b-8a399e774141)

## ✨ Fonctionnalités

### 🎯 **Examen Blanc**
- 40 questions chronométrées selon la répartition officielle ETG
- Timer de 20 secondes par question avec auto-soumission
- Conditions réelles d'examen (pas de feedback immédiat)
- Répartition thématique conforme aux 10 thèmes ETG officiels

![Quiz Interface](https://github.com/user-attachments/assets/542304e5-2d06-4e18-a377-c5262d0748a7)

### 🚗 **Reconnaissance de Marques**
- Quiz de reconnaissance des logos automobiles
- Intégration avec l'API GitHub pour les logos de marques
- Interface similaire à l'examen blanc

### 📊 **Statistiques et Suivi**
- Analyse des performances par thème
- Historique des tentatives
- Calcul du score de passage (35/40)
- Statistiques détaillées de progression

### 🎨 **Design HUD Moderne**
- Interface "Heads-Up Display" sombre
- Effets de glass morphism
- Accents bleu électrique avec effets de glow
- Design responsive pour mobile et desktop

## 🛠️ Technologies Utilisées

- **React 18** avec Create React App
- **TypeScript** pour la sécurité des types
- **styled-components** pour le styling
- **react-router-dom** pour le routing
- **react-feather** pour les icônes
- **Context API + useReducer** pour la gestion d'état

## 📋 Architecture des Données

### Base de Questions
- 50+ questions couvrant tous les thèmes ETG officiels
- Format conforme au schéma `QuizQuestion`
- Support des questions à choix multiples
- Explications détaillées pour chaque question

### Répartition Thématique ETG
- Circulation Routière (8 questions - 20%)
- Conducteur (6 questions - 15%)
- Route (5 questions - 12.5%)
- Autres Usagers (4 questions - 10%)
- Réglementation Générale (4 questions - 10%)
- Précautions Diverses (3 questions - 7.5%)
- Éléments Mécaniques & Sécurité (3 questions - 7.5%)
- Équipements de Sécurité (3 questions - 7.5%)
- Règle de Circulation (2 questions - 5%)
- Environnement (2 questions - 5%)

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 14+ 
- npm ou yarn

### Installation
```bash
# Cloner le repository
git clone https://github.com/Ritoche1/Quiz-Generator.git
cd Quiz-Generator/code-de-la-route-pro

# Installer les dépendances
npm install

# Démarrer l'application en développement
npm start
```

L'application sera disponible sur `http://localhost:3000`

### Build de Production
```bash
# Créer le build de production
npm run build

# Les fichiers seront générés dans le dossier /build
```

## 📁 Structure du Projet

```
code-de-la-route-pro/
├── public/                     # Fichiers statiques
├── src/
│   ├── assets/                 # Images et icônes
│   ├── components/             # Composants React
│   │   ├── ui/                 # Composants UI réutilisables
│   │   └── layout/             # Composants de mise en page
│   ├── context/                # Contextes React (state management)
│   ├── data/                   # Base de données des questions
│   │   └── database.json       # 50+ questions ETG
│   ├── hooks/                  # Hooks personnalisés
│   ├── pages/                  # Pages de l'application
│   ├── styles/                 # Thème et styles globaux
│   ├── types/                  # Définitions TypeScript
│   ├── utils/                  # Fonctions utilitaires
│   └── App.tsx                 # Composant principal
├── package.json
└── README.md
```

## 🎯 Utilisation

### Examen Blanc
1. Cliquez sur "Examen Blanc" depuis le dashboard
2. Répondez aux 40 questions chronométrées
3. Consultez vos résultats avec la répartition thématique
4. Révisez vos erreurs avec les explications détaillées

### Reconnaissance de Marques
1. Cliquez sur "Reconnaissance de Marques"
2. Identifiez les logos automobiles présentés
3. Testez vos connaissances des marques internationales

### Suivi des Performances
- Consultez vos statistiques dans la section dédiée
- Analysez votre progression dans le temps
- Identifiez vos points forts et axes d'amélioration

## 🔧 Fonctionnalités Techniques

### Gestion d'État
- **React Context API** pour l'état global
- **useReducer** pour la logique complexe
- **localStorage** pour la persistance locale

### Hooks Personnalisés
- `useLocalStorage` - Persistance automatique
- `useTimer` - Gestion du timer 20 secondes

### Algorithmes
- Sélection aléatoire des questions selon la répartition ETG
- Calcul intelligent du score avec analyse thématique
- Génération automatique de quiz de marques automobiles

## 🎨 Système de Design

### Palette de Couleurs
- **Bleu Électrique**: `#00D4FF` (accent principal)
- **Fond Sombre**: `#0A0A0B` (arrière-plan)
- **Succès**: `#00FF88`
- **Erreur**: `#FF4444`

### Effets Visuels
- Glass morphism avec `backdrop-filter: blur(20px)`
- Ombres incrustées pour l'effet HUD
- Effets de glow sur les éléments interactifs

## 📱 Responsive Design

L'application est entièrement responsive et optimisée pour:
- 📱 **Mobile** (320px+)
- 📱 **Tablette** (768px+)  
- 🖥️ **Desktop** (1024px+)

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Tests de couverture
npm run test:coverage
```

## 🚀 Déploiement

L'application est prête pour le déploiement sur :
- **Vercel** (recommandé)
- **Netlify**
- **GitHub Pages**
- Tout serveur statique

```bash
npm run build
# Déployer le contenu du dossier /build
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- Questions basées sur le programme officiel ETG français
- Logos automobiles via l'API GitHub publique
- Design inspiré par les interfaces HUD modernes

---

**Développé avec ❤️ pour aider à la préparation du permis de conduire français**