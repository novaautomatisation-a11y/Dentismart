
# Dentismart - Solution SaaS Multi-Tenant pour Cabinets Dentaires

Solution suisse pour cabinets dentaires et médicaux : réduction des rendez-vous non honorés, augmentation des avis Google 5★ et allègement de la charge du secrétariat.

## 🚀 PHASE 1 - Structure, Auth et Dashboard (Terminée)

### Technologies
- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Supabase (Postgres + Auth + RLS)
- **Database**: Supabase Postgres (multi-tenant avec `cabinet_id`)
- **Auth**: Supabase Auth (email + mot de passe)



---

## 📦 Installation et Configuration

### 1. Installer les dépendances

```bash

npm install




```

### 2. Configurer Supabase

1. Créez un projet sur [Supabase](https://app.supabase.com)
2. Copiez `.env.local.example` vers `.env.local`
3. Remplissez les variables d'environnement :



```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_publique
```


**Où trouver ces valeurs ?**
- Dashboard Supabase → Settings → API
- `URL` : Project URL
- `anon public` : anon / public key

### 3. Exécuter le schema SQL




Dans le SQL Editor de Supabase, exécutez le script SQL fourni (`schema_sql`) pour créer :
- Tables : `cabinets`, `profiles`, `dentistes`, `patients`, `rendez_vous`, `messages`
- Row Level Security (RLS) policies pour isolation multi-tenant stricte

---


## 🧪 Tester l'Application en Local



### Lancer le serveur de développement


```bash
npm run dev
```

L'application sera accessible sur **http://localhost:3000**

### Créer des données de test

**Via Supabase Dashboard (Table Editor) :**

1. **Créer un cabinet** (table `cabinets`)
   - `name`: "Cabinet Dentaire de Genève"
   - `address`: "Rue du Rhône 1, 1204 Genève"
   - `phone`: "+41 22 123 45 67"

2. **Créer un utilisateur** (Authentication → Users)
   - Email: `test@dentismart.ch`
   - Password: `Test1234!`
   - Copiez l'`id` de l'utilisateur créé

3. **Créer un profil** (table `profiles`)
   - `id`: [ID de l'utilisateur copié]
   - `cabinet_id`: [ID du cabinet créé]
   - `role`: "owner"

4. **Créer un dentiste** (table `dentistes`)
   - `cabinet_id`: [ID du cabinet]
   - `full_name`: "Dr. Marie Dupont"
   - `speciality`: "Orthodontie"
   - `is_active`: true

5. **Créer des patients** (table `patients`)
   - `cabinet_id`: [ID du cabinet]
   - `dentiste_id`: [ID du dentiste]
   - `first_name`: "Jean"
   - `last_name`: "Martin"
   - `phone`: "+41 79 123 45 67"
   - `email`: "jean.martin@example.ch"
   - `language`: "fr"

6. **Créer des rendez-vous** (table `rendez_vous`)
   - `cabinet_id`: [ID du cabinet]
   - `dentiste_id`: [ID du dentiste]
   - `patient_id`: [ID du patient]
   - `starts_at`: [Date d'aujourd'hui ou demain au format ISO]
   - `status`: "scheduled"
   - `notes`: "Contrôle annuel"

**Exemple de date ISO pour aujourd'hui à 14h00 :**
```
2025-11-30T14:00:00+01:00
```

---

## ✅ Tester le Login et le Dashboard

### 1. Tester `/login`











1. Ouvrir **http://localhost:3000/login**
2. Saisir les identifiants :
   - Email: `test@dentismart.ch`
   - Password: `Test1234!`
3. Cliquer sur "Se connecter"
4. ✅ Vous devez être redirigé vers `/dashboard`


### 2. Tester `/dashboard`







Une fois connecté, vous devez voir :

- **Nom du cabinet** : "Cabinet Dentaire de Genève"
- **Rôle** : "Propriétaire"
- **3 statistiques** :
  - 📊 **Patients total** : Nombre de patients dans votre cabinet
  - 📅 **Rendez-vous aujourd'hui** : Nombre de RDV pour aujourd'hui
  - 🗓️ **Rendez-vous demain** : Nombre de RDV pour demain

### 3. Vérifier l'isolation multi-tenant

**Test de sécurité RLS :**

1. Créer un **2ème cabinet** dans Supabase
2. Créer un **2ème utilisateur** lié au 2ème cabinet
3. Ajouter des **patients/rendez-vous** au 2ème cabinet
4. Se connecter avec le 1er utilisateur (`test@dentismart.ch`)
5. ✅ Vérifier que seuls les patients/rendez-vous du **cabinet 1** sont visibles
6. Se déconnecter et se connecter avec le 2ème utilisateur
7. ✅ Vérifier que seuls les patients/rendez-vous du **cabinet 2** sont visibles

**Résultat attendu** : Isolation totale, impossible de voir les données d'un autre cabinet.

---

## 📁 Structure du Projet

```
dentismart/
├── app/
│   ├── layout.tsx              # Layout racine
│   ├── page.tsx                # Redirect vers /dashboard
│   ├── globals.css             # Styles globaux Tailwind
│   ├── login/
│   │   └── page.tsx            # Page de connexion
│   └── dashboard/
│       └── page.tsx            # Dashboard principal (Server Component)
│
├── components/
│   └── dashboard/
│       ├── StatsCard.tsx       # Carte de statistique
│       └── LogoutButton.tsx    # Bouton déconnexion
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Client Supabase (navigateur)
│   │   └── server.ts           # Client Supabase (serveur + cookies)
│   └── types/
│       └── database.types.ts   # Types TypeScript du schema
│
├── middleware.ts               # Protection routes + refresh session
├── .env.local.example          # Template variables d'environnement
└── package.json
```

---

## 🔐 Sécurité Multi-Tenant

### Isolation par `cabinet_id`

- **Toutes les tables métier** contiennent `cabinet_id`
- **Row Level Security (RLS)** active sur toutes les tables
- **Policies RLS** vérifient automatiquement que `auth.uid()` appartient au même cabinet
- **Impossible de contourner** : RLS appliqué au niveau PostgreSQL

### Bonnes pratiques

✅ **TOUJOURS utiliser** `createClient()` côté serveur pour bénéficier des RLS
✅ **JAMAIS exposer** `SUPABASE_SERVICE_ROLE_KEY` côté client
✅ **JAMAIS contourner** les RLS dans le code applicatif
✅ **TOUJOURS filtrer** par `cabinet_id` dans les requêtes (sécurité defense-in-depth)

---

## 🎯 Prochaine Étape : PHASE 2

**PHASE 2 ajoutera :**
- 📋 Gestion des patients (liste + CRUD)
- 📅 Gestion des rendez-vous (liste + CRUD + changement statut)
- 📱 Envoi de SMS de rappel via Twilio
- 🔔 Route API `/api/rendezvous/send-reminder`

**Pour passer à PHASE 2** : Demandez explicitement à poursuivre après avoir validé PHASE 1.

---

## 📞 Support

Pour toute question sur Dentismart, contactez l'équipe de développement.

**Licence** : Propriétaire - © 2025 Dentismart
