-- Migration 002: Ajout des colonnes pour rôles, branding, campagnes, waitlist et copilot
-- Date: 2025-12-04
-- Description: Étend le schéma existant pour supporter les phases 2 et 3

-- ============================================================================
-- ÉTAPE 1: Étendre la table profiles pour les infos utilisateur et préférences UI
-- ============================================================================
alter table public.profiles
  add column if not exists full_name text,
  add column if not exists role text check (role in ('owner', 'dentist', 'assistant')),
  add column if not exists avatar_url text,
  add column if not exists locale text default 'fr-CH',
  add column if not exists timezone text default 'Europe/Zurich',
  add column if not exists ui_preferences jsonb default '{}'::jsonb;

-- Index pour améliorer les performances des requêtes par rôle
create index if not exists profiles_role_idx on public.profiles (role);

-- ============================================================================
-- ÉTAPE 2: Étendre la table cabinets pour le branding
-- ============================================================================
alter table public.cabinets
  add column if not exists logo_url text,
  add column if not exists primary_color text default '#0EA5E9',
  add column if not exists default_locale text default 'fr-CH';

-- ============================================================================
-- ÉTAPE 3: Table campaigns pour les campagnes de communication
-- ============================================================================
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null references public.cabinets(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  type text not null check (type in ('reactivation', 'last_minute', 'reminder', 'review')),
  channel text not null check (channel in ('sms', 'whatsapp', 'email')),
  message_template text not null,
  status text not null default 'draft' check (status in ('draft', 'running', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

-- Index pour améliorer les performances
create index if not exists campaigns_cabinet_id_idx on public.campaigns (cabinet_id);
create index if not exists campaigns_status_idx on public.campaigns (status);
create index if not exists campaigns_type_idx on public.campaigns (type);

-- ============================================================================
-- ÉTAPE 4: Table campaign_recipients pour les destinataires de campagnes
-- ============================================================================
create table if not exists public.campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  cabinet_id uuid not null references public.cabinets(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  rendez_vous_id uuid references public.rendez_vous(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'delivered', 'failed', 'responded')),
  last_status_at timestamptz not null default now()
);

-- Index pour améliorer les performances
create index if not exists campaign_recipients_campaign_id_idx on public.campaign_recipients (campaign_id);
create index if not exists campaign_recipients_cabinet_id_idx on public.campaign_recipients (cabinet_id);
create index if not exists campaign_recipients_patient_id_idx on public.campaign_recipients (patient_id);
create index if not exists campaign_recipients_status_idx on public.campaign_recipients (status);

-- ============================================================================
-- ÉTAPE 5: Table waitlist pour la liste d'attente intelligente
-- ============================================================================
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null references public.cabinets(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  preferred_days text[], -- ['monday', 'wednesday', 'friday']
  preferred_times text[], -- ['morning', 'afternoon', 'evening']
  priority int default 1 check (priority >= 1 and priority <= 5),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index pour améliorer les performances
create index if not exists waitlist_cabinet_id_idx on public.waitlist (cabinet_id);
create index if not exists waitlist_patient_id_idx on public.waitlist (patient_id);
create index if not exists waitlist_priority_idx on public.waitlist (priority desc);

-- ============================================================================
-- ÉTAPE 6: Table copilot_queries pour logger les requêtes IA
-- ============================================================================
create table if not exists public.copilot_queries (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null references public.cabinets(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  query_text text not null,
  response_summary text,
  created_at timestamptz default now()
);

-- Index pour améliorer les performances
create index if not exists copilot_queries_cabinet_id_idx on public.copilot_queries (cabinet_id);
create index if not exists copilot_queries_user_id_idx on public.copilot_queries (user_id);
create index if not exists copilot_queries_created_at_idx on public.copilot_queries (created_at desc);

-- ============================================================================
-- ÉTAPE 7: Table patient_scores pour le scoring IA (V2 - optionnel)
-- ============================================================================
create table if not exists public.patient_scores (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null references public.cabinets(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  risk_score int check (risk_score >= 0 and risk_score <= 100),
  churn_score int check (churn_score >= 0 and churn_score <= 100),
  last_computed_at timestamptz not null default now(),
  unique(cabinet_id, patient_id)
);

-- Index pour améliorer les performances
create index if not exists patient_scores_cabinet_id_idx on public.patient_scores (cabinet_id);
create index if not exists patient_scores_patient_id_idx on public.patient_scores (patient_id);
create index if not exists patient_scores_risk_idx on public.patient_scores (risk_score desc);

-- ============================================================================
-- ÉTAPE 8: Row Level Security (RLS) Policies
-- ============================================================================

-- Activer RLS sur toutes les nouvelles tables
alter table public.campaigns enable row level security;
alter table public.campaign_recipients enable row level security;
alter table public.waitlist enable row level security;
alter table public.copilot_queries enable row level security;
alter table public.patient_scores enable row level security;

-- Policy pour campaigns: l'utilisateur ne voit que les campagnes de son cabinet
create policy "Users can view campaigns from their cabinet"
  on public.campaigns for select
  using (
    cabinet_id in (
      select cabinet_id from public.profiles where id = auth.uid()
    )
  );

create policy "Users can insert campaigns in their cabinet"
  on public.campaigns for insert
  with check (
    cabinet_id in (
      select cabinet_id from public.profiles where id = auth.uid()
    )
  );

create policy "Users can update campaigns in their cabinet"
  on public.campaigns for update
  using (
    cabinet_id in (
      select cabinet_id from public.profiles where id = auth.uid()
    )
  );

-- Policy pour campaign_recipients
create policy "Users can view campaign recipients from their cabinet"
  on public.campaign_recipients for select
  using (
    cabinet_id in (
      select cabinet_id from public.profiles where id = auth.uid()
    )
  );

create policy "Users can insert campaign recipients in their cabinet"
  on public.campaign_recipients for insert
  with check (
    cabinet_id in (
      select cabinet_id from public.profiles where id = auth.uid()
    )
  );

-- Policy pour waitlist
create policy "Users can view waitlist from their cabinet"
  on public.waitlist for select
  using (
    cabinet_id in (
      select cabinet_id from public.profiles where id = auth.uid()
    )
  );

create policy "Users can insert into waitlist in their cabinet"
  on public.waitlist for insert
  with check (
    cabinet_id in (
      select cabinet_id from public.profiles where id = auth.uid()
    )
  );

create policy "Users can update waitlist in their cabinet"
  on public.waitlist for update
  using (
    cabinet_id in (
      select cabinet_id from public.profiles where id = auth.uid()
    )
  );

create policy "Users can delete from waitlist in their cabinet"
  on public.waitlist for delete
  using (
    cabinet_id in (
      select cabinet_id from public.profiles where id = auth.uid()
    )
  );

-- Policy pour copilot_queries
create policy "Users can view their copilot queries"
  on public.copilot_queries for select
  using (
    cabinet_id in (
      select cabinet_id from public.profiles where id = auth.uid()
    )
  );

create policy "Users can insert copilot queries"
  on public.copilot_queries for insert
  with check (
    cabinet_id in (
      select cabinet_id from public.profiles where id = auth.uid()
    )
  );

-- Policy pour patient_scores
create policy "Users can view patient scores from their cabinet"
  on public.patient_scores for select
  using (
    cabinet_id in (
      select cabinet_id from public.profiles where id = auth.uid()
    )
  );

create policy "Users can insert patient scores in their cabinet"
  on public.patient_scores for insert
  with check (
    cabinet_id in (
      select cabinet_id from public.profiles where id = auth.uid()
    )
  );

create policy "Users can update patient scores in their cabinet"
  on public.patient_scores for update
  using (
    cabinet_id in (
      select cabinet_id from public.profiles where id = auth.uid()
    )
  );

-- ============================================================================
-- ÉTAPE 9: Trigger pour updated_at sur waitlist
-- ============================================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists waitlist_updated_at on public.waitlist;
create trigger waitlist_updated_at
  before update on public.waitlist
  for each row
  execute function public.handle_updated_at();

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================
