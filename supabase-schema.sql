create extension if not exists "pgcrypto";

create table public.cabinets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  phone text,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  cabinet_id uuid not null references public.cabinets (id) on delete restrict,
  role text not null check (role in ('owner', 'staff')),
  created_at timestamptz not null default now()
);

create index profiles_cabinet_id_idx on public.profiles (cabinet_id);

create table public.dentistes (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null references public.cabinets (id) on delete cascade,
  full_name text not null,
  speciality text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index dentistes_cabinet_id_idx on public.dentistes (cabinet_id);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null references public.cabinets (id) on delete cascade,
  dentiste_id uuid references public.dentistes (id) on delete set null,
  first_name text not null,
  last_name text not null,
  phone text not null,
  email text,
  language text,
  created_at timestamptz not null default now()
);

create index patients_cabinet_id_idx on public.patients (cabinet_id);
create index patients_phone_idx on public.patients (phone);

create table public.rendez_vous (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null references public.cabinets (id) on delete cascade,
  dentiste_id uuid not null references public.dentistes (id) on delete restrict,
  patient_id uuid not null references public.patients (id) on delete restrict,
  starts_at timestamptz not null,
  status text not null check (status in ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index rendez_vous_cabinet_id_idx on public.rendez_vous (cabinet_id);
create index rendez_vous_starts_at_idx on public.rendez_vous (starts_at);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null references public.cabinets (id) on delete cascade,
  patient_id uuid references public.patients (id) on delete set null,
  rendez_vous_id uuid references public.rendez_vous (id) on delete set null,
  channel text not null check (channel in ('sms', 'whatsapp')),
  type text not null check (type in ('reminder', 'review_request', 'other')),
  direction text not null check (direction in ('outbound', 'inbound')),
  body text not null,
  status text not null check (status in ('queued', 'sent', 'delivered', 'failed', 'received')),
  provider_message_id text,
  sent_at timestamptz,
  received_at timestamptz,
  created_at timestamptz not null default now()
);

create index messages_cabinet_id_idx on public.messages (cabinet_id);
create index messages_patient_id_idx on public.messages (patient_id);
create index messages_rdv_id_idx on public.messages (rendez_vous_id);

alter table public.cabinets enable row level security;
alter table public.profiles enable row level security;
alter table public.dentistes enable row level security;
alter table public.patients enable row level security;
alter table public.rendez_vous enable row level security;
alter table public.messages enable row level security;

create policy "select_profiles_same_cabinet" on public.profiles for select using (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.cabinet_id = profiles.cabinet_id
  )
);

create policy "update_own_profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "select_own_cabinet" on public.cabinets for select using (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.cabinet_id = cabinets.id
  )
);

create policy "select_dentistes_same_cabinet" on public.dentistes for select using (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.cabinet_id = dentistes.cabinet_id
  )
);

create policy "insert_dentistes_same_cabinet" on public.dentistes for insert with check (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.cabinet_id = dentistes.cabinet_id
  )
);

create policy "update_dentistes_same_cabinet" on public.dentistes for update using (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.cabinet_id = dentistes.cabinet_id
  )
) with check (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.cabinet_id = dentistes.cabinet_id
  )
);

create policy "delete_dentistes_same_cabinet" on public.dentistes for delete using (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.cabinet_id = dentistes.cabinet_id
  )
);

create policy "select_patients_same_cabinet" on public.patients for select using (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.cabinet_id = patients.cabinet_id
  )
);

create policy "insert_patients_same_cabinet" on public.patients for insert with check (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.cabinet_id = patients.cabinet_id
  )
);

create policy "update_patients_same_cabinet" on public.patients for update using (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.cabinet_id = patients.cabinet_id
  )
) with check (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.cabinet_id = patients.cabinet_id
  )
);

create policy "delete_patients_same_cabinet" on public.patients for delete using (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.cabinet_id = patients.cabinet_id
  )
);

create policy "select_rdv_same_cabinet" on public.rendez_vous for select using (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.cabinet_id = rendez_vous.cabinet_id
  )
);

create policy "insert_rdv_same_cabinet" on public.rendez_vous for insert with check (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.cabinet_id = rendez_vous.cabinet_id
  )
);

create policy "update_rdv_same_cabinet" on public.rendez_vous for update using (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.cabinet_id = rendez_vous.cabinet_id
  )
) with check (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.cabinet_id = rendez_vous.cabinet_id
  )
);

create policy "delete_rdv_same_cabinet" on public.rendez_vous for delete using (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.cabinet_id = rendez_vous.cabinet_id
  )
);

create policy "select_messages_same_cabinet" on public.messages for select using (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.cabinet_id = messages.cabinet_id
  )
);

create policy "insert_messages_same_cabinet" on public.messages for insert with check (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.cabinet_id = messages.cabinet_id
  )
);

create policy "update_messages_same_cabinet" on public.messages for update using (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.cabinet_id = messages.cabinet_id
  )
) with check (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.cabinet_id = messages.cabinet_id
  )
);

create policy "delete_messages_same_cabinet" on public.messages for delete using (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.cabinet_id = messages.cabinet_id
  )
);
