# 🚀 Nouvelles Features Dentismart

## Date d'implémentation: 2025-12-02

Ce document décrit les 3 nouvelles features différenciantes ajoutées au MVP Dentismart.

---

## 1. 📡 Radar des Patients Perdus

### Description
Identifie automatiquement les patients qui n'ont pas visité le cabinet depuis plus de 12 mois et permet de lancer une campagne de réactivation ciblée.

### Accès
- **URL**: `/dashboard/radar`
- **Lien**: Depuis le dashboard principal, carte "Radar patients perdus"

### Fonctionnalités
- ✅ Détection automatique des patients inactifs (>12 mois sans visite)
- ✅ Affichage de la dernière visite et du nombre de mois écoulés
- ✅ Sélection multiple de patients avec cases à cocher
- ✅ Bouton "Tout sélectionner/désélectionner"
- ✅ Envoi de messages SMS de réactivation en masse
- ✅ Filtrage automatique par cabinet (multi-tenant)

### API
- **Route**: `POST /api/radar/reactivate`
- **Payload**: `{ patientIds: string[], messageTemplate?: string }`
- **Réponse**: `{ success: boolean, count: number, message: string }`

### Template de message par défaut
```
Bonjour {prenom}, cela fait longtemps que nous ne vous avons pas vu !
Nous serions ravis de prendre soin de votre santé dentaire.
Contactez-nous pour prendre rendez-vous.
```

### Sécurité
- ✅ Vérification de l'authentification
- ✅ Vérification du cabinet_id (RLS)
- ✅ Validation que tous les patients appartiennent au cabinet

---

## 2. ⏰ Annulations Last-Minute

### Description
Propose automatiquement les créneaux annulés en dernière minute (<48h) à des patients "flexibles" qui acceptent les rendez-vous de dernière minute.

### Migration SQL requise
```sql
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS accepts_short_notice boolean NOT NULL DEFAULT false;
```

### Fonctionnalités

#### A) Marquage des patients flexibles
- ✅ Nouveau champ "Accepte les créneaux de dernière minute" dans le formulaire patient
- ✅ Case à cocher lors de la création d'un patient
- ✅ Stocké dans la colonne `accepts_short_notice` (booléen)

#### B) Proposition de créneaux
- ✅ Bouton "⏰ Proposer créneau" apparaît automatiquement sur les rendez-vous:
  - Status = `cancelled`
  - Date du rendez-vous dans les 48 prochaines heures
- ✅ Envoi automatique de SMS aux patients flexibles du cabinet
- ✅ Limite par défaut: 5 patients maximum par créneau
- ✅ Message personnalisé avec date/heure du créneau disponible

### API
- **Route**: `POST /api/rendezvous/last-minute-notify`
- **Payload**: `{ rendezVousId: string, maxRecipients?: number }`
- **Réponse**: `{ success: boolean, count: number, message: string }`

### Template de message
```
Bonjour {prenom}, un créneau s'est libéré le {date et heure}.
Si vous êtes intéressé(e), contactez-nous rapidement !
```

### Sécurité
- ✅ Vérification que le RDV est bien annulé
- ✅ Vérification que le RDV est dans moins de 48h
- ✅ Sélection des patients flexibles du même cabinet uniquement
- ✅ Respect des RLS multi-tenant

---

## 3. 📊 Score de Santé du Cabinet

### Description
Affiche un score global de 0 à 100 basé sur le taux de no-shows des 6 derniers mois. Plus le taux est bas, plus le score est élevé.

### Emplacement
- **Page**: Dashboard principal (`/dashboard`)
- **Position**: Entre les stats et les actions rapides

### Calcul du score
```
Période: 6 derniers mois
no_show_rate = (count(status='no_show') / count(total rdv)) * 100
score = max(0, 100 - round(no_show_rate))
```

### Interprétation
- **90-100** 🟢 : Excellent ! Taux de no-show très faible
- **75-89** 🟠 : Bon ! Continuez vos efforts
- **50-74** 🟠 : À améliorer. Pensez aux rappels SMS
- **0-49** 🔴 : Attention ! Taux élevé, action recommandée

### Affichage
- ✅ Score en gros (ex: 82/100)
- ✅ Taux de no-show en pourcentage (ex: 18.0%)
- ✅ Période affichée ("6 derniers mois")
- ✅ Message contextuel selon le score
- ✅ Couleur adaptative (vert/orange/rouge)

### Sécurité
- ✅ Calcul côté serveur (Server Component)
- ✅ Filtrage automatique par cabinet_id (RLS)

---

## 🗂️ Fichiers créés/modifiés

### Migrations SQL
- `supabase-migrations-features.sql` - Migration pour accepts_short_notice

### FEATURE 1: Radar patients perdus
- `app/dashboard/radar/page.tsx` - Page principale du radar
- `components/radar/RadarPatientsList.tsx` - Composant liste avec sélection
- `app/api/radar/reactivate/route.ts` - API d'envoi de campagne

### FEATURE 2: Annulations last-minute
- `app/api/rendezvous/last-minute-notify/route.ts` - API de notification
- `components/patients/PatientForm.tsx` - Ajout toggle accepts_short_notice
- `components/rendezvous/RendezVousList.tsx` - Ajout bouton "Proposer créneau"

### FEATURE 3: Score de santé
- `components/dashboard/HealthScore.tsx` - Composant d'affichage du score
- `app/dashboard/page.tsx` - Ajout calcul score + affichage composant

---

## 🧪 Instructions de test

### Prérequis
1. **Exécuter les migrations SQL** dans Supabase SQL Editor:
   ```bash
   cat supabase-migrations-features.sql
   # Copier le contenu et l'exécuter dans Supabase
   ```

### Test 1: Radar patients perdus
1. Créer des patients de test
2. Créer des rendez-vous "completed" datant de plus de 12 mois
3. Aller sur `/dashboard/radar`
4. Vérifier que les patients apparaissent dans la liste
5. Sélectionner des patients
6. Cliquer sur "Lancer campagne réactivation"
7. Vérifier dans la table `messages` que les lignes ont été créées avec `type='reactivation'`

### Test 2: Annulations last-minute
1. Créer un patient avec "Accepte les créneaux de dernière minute" coché
2. Créer un rendez-vous pour demain (dans moins de 48h)
3. Changer le status du RDV à "Annulé"
4. Aller sur `/rendezvous`
5. Vérifier que le bouton "⏰ Proposer créneau" apparaît
6. Cliquer sur le bouton
7. Vérifier la confirmation avec le nombre de patients notifiés
8. Vérifier dans `messages` que les lignes ont été créées avec `type='last_minute_offer'`

### Test 3: Score de santé
1. Créer des rendez-vous de test avec différents status
2. Créer quelques RDV avec `status='no_show'` dans les 6 derniers mois
3. Aller sur `/dashboard`
4. Vérifier que le Score Dentismart s'affiche
5. Vérifier que le taux de no-show est correct
6. Vérifier la couleur (vert/orange/rouge) selon le score

---

## 🔐 Sécurité & Multi-tenant

Toutes les features respectent le modèle multi-tenant:

✅ **RLS activées** sur toutes les tables
✅ **Filtrage par cabinet_id** dans toutes les requêtes
✅ **Vérification d'authentification** dans toutes les API routes
✅ **Validation côté serveur** des permissions
✅ **Pas de clés secrètes** exposées côté client

---

## 📈 Prochaines étapes

### Intégration Twilio (optionnel)
Les messages sont actuellement créés avec `status='queued'` dans la table `messages`.
Pour activer l'envoi réel via Twilio:

1. Créer un compte Twilio
2. Obtenir Account SID et Auth Token
3. Créer une fonction worker ou cron job qui:
   - Lit les messages avec `status='queued'`
   - Envoie via Twilio
   - Met à jour `status='sent'` et `sent_at`

### Améliorations possibles
- 🔜 Statistiques avancées par dentiste
- 🔜 Filtres personnalisables sur le radar (6/12/18 mois)
- 🔜 Templates de messages personnalisables par cabinet
- 🔜 Historique des campagnes envoyées
- 🔜 Taux de réponse et de conversion

---

## 🐛 Support

Pour tout problème:
1. Vérifier que les migrations SQL sont exécutées
2. Vérifier les RLS dans Supabase
3. Consulter les logs serveur (console)
4. Vérifier l'authentification et le cabinet_id

---

**Dentismart** - Gestion moderne pour cabinets dentaires 🦷✨
