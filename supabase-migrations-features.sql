-- ============================================================================
-- MIGRATIONS SQL POUR LES 3 NOUVELLES FEATURES DENTISMART
-- ============================================================================
-- Date: 2025-12-02
-- Features: Radar patients perdus, Annulations last-minute, Score santé cabinet
-- ============================================================================

-- FEATURE 2: Annulations last-minute
-- Ajouter une colonne pour identifier les patients flexibles (acceptent créneaux dernière minute)
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS accepts_short_notice boolean NOT NULL DEFAULT false;

-- Créer un index pour optimiser la recherche des patients flexibles
CREATE INDEX IF NOT EXISTS patients_short_notice_idx
ON public.patients (cabinet_id, accepts_short_notice)
WHERE accepts_short_notice = true;

-- ============================================================================
-- VERIFICATION DES COLONNES EXISTANTES
-- ============================================================================

-- Vérifier que toutes les colonnes nécessaires existent déjà
-- (Ces colonnes devraient déjà exister d'après le schéma de base)

-- Table patients: first_name, last_name, phone, email, language, cabinet_id, dentiste_id
-- Table rendez_vous: cabinet_id, dentiste_id, patient_id, starts_at, status, notes
-- Table messages: cabinet_id, patient_id, rendez_vous_id, channel, type, direction, body, status

-- ============================================================================
-- RLS POLICIES (déjà en place, on vérifie juste)
-- ============================================================================

-- Les RLS doivent déjà être activées sur toutes les tables
-- Vérification rapide (pas besoin de recréer si déjà présentes)

DO $$
BEGIN
  -- Vérifier que RLS est activé sur patients
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'patients'
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Vérifier que RLS est activé sur rendez_vous
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'rendez_vous'
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.rendez_vous ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Vérifier que RLS est activé sur messages
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'messages'
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ============================================================================
-- COMMENTAIRES SUR LES NOUVELLES COLONNES
-- ============================================================================

COMMENT ON COLUMN public.patients.accepts_short_notice IS
'Indique si le patient accepte d''être contacté pour des créneaux de dernière minute (< 48h)';

-- ============================================================================
-- FIN DES MIGRATIONS
-- ============================================================================

-- Afficher un résumé
SELECT
  'Migration terminée ✅' as status,
  'Colonne accepts_short_notice ajoutée à patients' as detail_1,
  'Index patients_short_notice_idx créé' as detail_2,
  'RLS vérifiées sur toutes les tables' as detail_3;
