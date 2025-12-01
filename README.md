# Dentismart - Solution SaaS Multi-Tenant pour Cabinets Dentaires

Solution suisse pour cabinets dentaires et médicaux : réduction des rendez-vous non honorés, augmentation des avis Google 5★ et allègement de la charge du secrétariat grâce à des automatisations intelligentes.

## 🚀 Technologies

- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Supabase (Postgres + Auth + RLS)
- **Database**: Supabase Postgres (multi-tenant avec `cabinet_id`)
- **Auth**: Supabase Auth (email + mot de passe)
- **Messaging**: Twilio (SMS) - À venir
- **Automation**: n8n - À venir

## 📦 Installation Rapide

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd dentismart
npm install
```

### 2. Configurer Supabase

1. Créez un projet sur [Supabase](https://app.supabase.com)
2. Copiez `.env.local.example` vers `.env.local`
3. Remplissez les variables d'environnement :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_publique
```

4. Dans le SQL Editor de Supabase, exécutez le fichier `supabase-schema.sql`

### 3. Créer des données de test

Via le **Table Editor** de Supabase, créez :
1. Un **cabinet** (table `cabinets`)
2. Un **utilisateur** (Authentication ou via SQL)
3. Un **profil** (table `profiles`) liant l'utilisateur au cabinet
4. Un **dentiste** (table `dentistes`)
5. Des **patients** (table `patients`)
6. Des **rendez-vous** (table `rendez_vous`) pour aujourd'hui et demain

### 4. Lancer l'application

```bash
npm run dev
```

Ouvrez **http://localhost:3000** et connectez-vous !

## 🔐 Sécurité Multi-Tenant

### Architecture

- **Isolation stricte** : Chaque cabinet est totalement isolé via `cabinet_id`
- **Row Level Security (RLS)** : Policies PostgreSQL au niveau de la base
- **Vérification automatique** : Les RLS vérifient que l'utilisateur appartient au bon cabinet
- **Impossible de contourner** : La sécurité est au niveau base de données, pas applicatif

### Bonnes pratiques

✅ Toujours utiliser `createClient()` côté serveur pour les RLS
✅ Jamais exposer `SUPABASE_SERVICE_ROLE_KEY` côté client
✅ Jamais contourner les RLS dans le code
✅ Toujours filtrer par `cabinet_id`

## 📁 Structure du Projet

```
dentismart/
├── app/                        # App Router Next.js
│   ├── layout.tsx              # Layout racine
│   ├── page.tsx                # Page d'accueil (redirect)
│   ├── globals.css             # Styles globaux
│   ├── login/
│   │   └── page.tsx            # Page de connexion
│   └── dashboard/
│       └── page.tsx            # Dashboard avec statistiques
│
├── components/                 # Composants réutilisables
│   └── dashboard/
│       ├── StatsCard.tsx       # Carte de statistique
│       └── LogoutButton.tsx    # Bouton déconnexion
│
├── lib/                        # Librairies et utilitaires
│   ├── supabase/
│   │   ├── client.ts           # Client Supabase (navigateur)
│   │   └── server.ts           # Client Supabase (serveur + RLS)
│   └── types/
│       └── database.types.ts   # Types TypeScript de la DB
│
├── middleware.ts               # Protection des routes
├── supabase-schema.sql         # Schema SQL à exécuter
├── .env.local.example          # Template des variables
└── package.json
```

## ✨ Fonctionnalités

### PHASE 1 (Actuelle) ✅
- ✅ Authentification sécurisée multi-tenant
- ✅ Dashboard avec statistiques en temps réel
  - Nombre total de patients du cabinet
  - Rendez-vous aujourd'hui
  - Rendez-vous demain
- ✅ Isolation totale des données par cabinet
- ✅ Row Level Security (RLS)

### PHASE 2 (À venir) 🔜
- 📋 Gestion des patients (liste + CRUD)
- 📅 Gestion des rendez-vous (liste + CRUD + changement statut)
- 📱 Envoi automatique de rappels SMS via Twilio
- 🔔 Route API `/api/rendezvous/send-reminder`
- ⭐ Demandes d'avis Google automatisées

## 🧪 Tests

### Tester l'isolation multi-tenant

1. Créer 2 cabinets différents dans Supabase
2. Créer 2 utilisateurs liés à chaque cabinet
3. Ajouter des patients/rendez-vous dans chaque cabinet
4. Se connecter avec le 1er utilisateur → vérifier qu'il ne voit QUE les données du cabinet 1
5. Se connecter avec le 2ème utilisateur → vérifier qu'il ne voit QUE les données du cabinet 2

✅ **Résultat attendu** : Isolation totale, impossible de voir les données d'un autre cabinet.

## 🚢 Déploiement

### Vercel (Recommandé)

1. Créez un compte sur [Vercel](https://vercel.com)
2. Importez votre repo GitHub
3. Ajoutez les variables d'environnement :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Déployez !

### Autres options

- Railway
- DigitalOcean App Platform
- AWS Amplify
- Netlify

## 📞 Support

Pour toute question technique ou fonctionnelle, contactez l'équipe de développement.

## 📄 Licence

Propriétaire - © 2025 Dentismart

---

**Développé avec ❤️ en Suisse**
