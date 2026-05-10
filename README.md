# 🏢 Taoman Admin - Plateforme d'Administration

Plateforme web moderne et complète pour la gestion administrative du groupe Taoman. Construite avec React 19, Vite, Tailwind CSS et Material Symbols Icons.

## 📋 Features

✅ **Authentification & Autorisation**
- Système de connexion sécurisé
- Gestion des permissions par rôle
- Persistance de session

✅ **Dashboard Complet**
- Vue d'ensemble en temps réel
- Statistiques et KPIs
- Graphiques interactifs (Recharts)

✅ **Gestion Clients**
- Annuaire des clients
- Historique des interactions
- Profils détaillés

✅ **Gestion Devis**
- Création et suivi des devis
- Statuts et historique
- Export et archivage

✅ **Gestion Contenu**
- CMS intégré
- Gestion des pages web
- Médiathèque

✅ **Tâches & Projets**
- Gestion des tâches
- Suivi de progression
- Assignation d'équipe

✅ **Messaging**
- Système de notifications
- Chat interne
- Conversations privées

✅ **Calendrier & Agenda**
- Calendrier interactif
- Gestion des événements
- Rappels

✅ **Portefeuille d'Investissements**
- Suivi des investissements
- Calcul de ROI
- Analyse de risque

✅ **Sauvegardes & Restauration**
- Sauvegarde automatique
- Restauration de données
- Historique des sauvegardes

✅ **Journaux d'Activité**
- Logs détaillés des actions
- Traçabilité complète
- Filtrage avancé

✅ **Rapports**
- Génération de rapports
- Export multi-formats
- Historique

✅ **Thème Sombre/Clair**
- Mode système automatique
- Basculement manuel
- Persistance des préférences

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Setup

```bash
# Installation des dépendances
npm install

# Démarrage en développement
npm run dev

# Build pour production
npm run build

# Preview du build
npm run preview

# Linting
npm run lint
```

## 📁 Structure du Projet

```
src/
├── App.jsx                    # Route principale
├── main.jsx                   # Point d'entrée
├── components/
│   ├── layout/
│   │   ├── Header.jsx        # Barre supérieure
│   │   └── Sidebar.jsx       # Navigation latérale
│   └── ui/
│       ├── Modal.jsx         # Composant modal
│       └── Confirm.jsx       # Dialogue de confirmation
├── context/
│   ├── AuthContext.jsx       # Contexte d'authentification
│   ├── ThemeContext.jsx      # Contexte de thème
│   └── AppContext.jsx        # État global
├── pages/
│   ├── Dashboard.jsx
│   ├── Clients.jsx
│   ├── Devis.jsx
│   ├── Contenu.jsx
│   ├── Medias.jsx
│   ├── Statistiques.jsx      # Statistiques enrichies
│   ├── Rapports.jsx          # Gestion des rapports
│   ├── Logs.jsx              # Journaux d'activité
│   ├── Notification.jsx
│   ├── Parametres.jsx
│   ├── Login.jsx
│   ├── Jobs.jsx              # Gestion des tâches
│   ├── Messages.jsx          # System de messagerie
│   ├── Calendar.jsx          # Calendrier
│   ├── Investments.jsx       # Portefeuille d'investissements
│   └── Backup.jsx            # Sauvegardes
└── styles/
    └── globals.css           # Styles globaux

public/
└── favicon.svg

Configuration
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── eslint.config.js
```

## 🎨 Design System

### Tokens Tailwind Custom
- **Couleurs primaires**: Primary (#003d9b), Secondary (#43617b), Tertiary (#7b2600)
- **Surfaces**: Surface, Surface Container (low, high, highest)
- **Espacement**: xs (4px), sm (8px), md (16px), lg (24px), xl (32px), xxl (64px)
- **Typographie**: Display, Headline, Body, Label avec variantes

### Dark Mode
- Support complet du dark mode avec Tailwind CSS
- Classe `.dark` sur l'élément root
- Basculement automatique par préférences système
- Persistance des préférences utilisateur

## 🔐 Authentification

### Identifiants de Test
```
Email: admin@taoman-groupe.com
Mot de passe: admin123
```

### Flux d'Authentification
1. Connexion → validation → stockage localStorage
2. Vérification au chargement de l'app
3. Redirection automatique si session expirée
4. Déconnexion → suppression des données locales

## 🌐 Routes

```
/login                 # Connexion
/                      # Dashboard
/clients               # Gestion Clients
/devis                 # Gestion Devis
/contenu               # Gestion Contenu
/medias                # Médiathèque
/statistiques          # Statistiques
/rapports              # Rapports
/logs                  # Journaux
/notifications         # Notifications
/jobs                  # Tâches
/messages              # Messages
/calendar              # Calendrier
/investments           # Investissements
/backup                # Sauvegardes
/parametres            # Paramètres
```

## 📦 Dépendances Principales

```json
{
  "react": "^19.2.5",
  "react-dom": "^19.2.5",
  "react-router-dom": "^6.20.0",
  "clsx": "^2.0.0",
  "recharts": "^2.10.0",
  "tailwindcss": "^3.4.0"
}
```

## 🛠️ Technologies

- **Frontend**: React 19
- **Build**: Vite
- **Styling**: Tailwind CSS 3
- **Routing**: React Router v6
- **Charts**: Recharts
- **Icons**: Material Symbols Outlined
- **Utilities**: clsx
- **Linting**: ESLint

## 🔧 Configuration

### Tailwind CSS
- Couleurs custom basées sur Material Design 3
- Tokens d'espacement et de typographie
- Dark mode avec classe
- Animations personnalisées

### Vite
- HMR activé en développement
- Optimisation automatique des imports
- CSS modules supportés
- TypeScript prêt (avec config optionnelle)

## 📝 Conventions

### Nommage
- **Pages**: PascalCase (Dashboard.jsx)
- **Composants**: PascalCase (Header.jsx)
- **Hooks**: camelCase avec préfixe "use" (useAuth)
- **Fichiers CSS**: globals.css, [component].module.css

### Styling
- Classes Tailwind CSS en priorité
- clsx pour la logique conditionnelle
- Custom tokens Tailwind pour les variables
- Dark mode avec `.dark:` prefix

### Contextes
- AuthContext: Authentification et utilisateur
- ThemeContext: Gestion du thème
- AppContext: État global (notifications, modals, data)

## 📚 Documentation

### Composants UI

#### Modal
```jsx
import Modal from "./components/ui/Modal";

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Titre"
  size="md"  // sm, md, lg, xl
>
  <p>Contenu du modal</p>
</Modal>
```

#### Confirm
```jsx
import Confirm from "./components/ui/Confirm";

<Confirm
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirmation"
  message="Êtes-vous sûr?"
  onConfirm={handleConfirm}
  variant="primary"  // primary, danger, warning
/>
```

### Hooks Personnalisés

#### useAuth
```jsx
const { user, login, logout, hasPermission } = useAuth();
```

#### useTheme
```jsx
const { mode, resolvedTheme, setTheme } = useTheme();
```

#### useApp
```jsx
const { notifications, addNotification, openModal } = useApp();
```

## 🚀 Déploiement

### Production Build
```bash
npm run build
# Génère un dossier `dist/` prêt pour le déploiement
```

### Environnement
Créez un fichier `.env` à la racine:
```
VITE_API_URL=https://api.taoman-groupe.com
VITE_AUTH_TOKEN_KEY=taoman-admin-token
```

## 📞 Support & Contribution

Pour les questions ou contributions:
1. Consultez la documentation du projet
2. Vérifiez les issues existantes
3. Créez une nouvelle issue si nécessaire
4. Suivez les conventions de code

## 📄 Licence

© 2026 Taoman Groupe. Tous droits réservés.
