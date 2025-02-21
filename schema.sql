-- Create programs table
create table if not exists public.programs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  owner_id uuid references auth.users(id)
);

-- Enable RLS
alter table public.programs enable row level security;

-- Create phases table
create table if not exists public.phases (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  program_id uuid references public.programs(id) on delete cascade,
  name text not null,
  sequence integer not null,
  description text
);

-- Enable RLS
alter table public.phases enable row level security;

-- Create milestones table
create table if not exists public.milestones (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  phase_id uuid references public.phases(id) on delete cascade,
  name text not null,
  sequence integer not null,
  is_required boolean default true,
  completed_at timestamp with time zone
);

-- Enable RLS
alter table public.milestones enable row level security;

-- Create requests table
create table if not exists public.requests (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  program_id uuid references public.programs(id) on delete cascade,
  physician text not null,
  institution text not null,
  country text not null,
  owner uuid references auth.users(id),
  current_phase uuid references public.phases(id)
);

-- Enable RLS
alter table public.requests enable row level security;

-- Create tasks table
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  milestone_id uuid references public.milestones(id) on delete cascade,
  title text not null,
  due_date timestamp with time zone,
  assignee uuid references auth.users(id),
  completed_at timestamp with time zone
);

-- Enable RLS
alter table public.tasks enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Enable read access for authenticated users" on public.programs;
drop policy if exists "Enable insert for authenticated users" on public.programs;
drop policy if exists "Enable read access for authenticated users" on public.phases;
drop policy if exists "Enable insert for authenticated users" on public.phases;
drop policy if exists "Enable read access for authenticated users" on public.milestones;
drop policy if exists "Enable insert for authenticated users" on public.milestones;
drop policy if exists "Enable read access for authenticated users" on public.requests;
drop policy if exists "Enable insert for authenticated users" on public.requests;
drop policy if exists "Enable read access for authenticated users" on public.tasks;
drop policy if exists "Enable insert for authenticated users" on public.tasks;

-- Create RLS policies for programs
create policy "Enable read access for authenticated users" on public.programs
  for select using (auth.role() = 'authenticated');

create policy "Enable insert for authenticated users" on public.programs
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users" on public.programs
  for update using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users" on public.programs
  for delete using (auth.role() = 'authenticated');

-- Create RLS policies for phases
create policy "Enable read access for authenticated users" on public.phases
  for select using (auth.role() = 'authenticated');

create policy "Enable insert for authenticated users" on public.phases
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users" on public.phases
  for update using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users" on public.phases
  for delete using (auth.role() = 'authenticated');

-- Create RLS policies for milestones
create policy "Enable read access for authenticated users" on public.milestones
  for select using (auth.role() = 'authenticated');

create policy "Enable insert for authenticated users" on public.milestones
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users" on public.milestones
  for update using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users" on public.milestones
  for delete using (auth.role() = 'authenticated');

-- Create RLS policies for requests
create policy "Enable read access for authenticated users" on public.requests
  for select using (auth.role() = 'authenticated');

create policy "Enable insert for authenticated users" on public.requests
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users" on public.requests
  for update using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users" on public.requests
  for delete using (auth.role() = 'authenticated');

-- Create RLS policies for tasks
create policy "Enable read access for authenticated users" on public.tasks
  for select using (auth.role() = 'authenticated');

create policy "Enable insert for authenticated users" on public.tasks
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users" on public.tasks
  for update using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users" on public.tasks
  for delete using (auth.role() = 'authenticated');