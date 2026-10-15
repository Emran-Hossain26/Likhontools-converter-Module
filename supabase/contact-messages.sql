create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  first_name text not null check (char_length(trim(first_name)) between 1 and 100),
  last_name text not null check (char_length(trim(last_name)) between 1 and 100),
  email text not null check (char_length(email) between 3 and 320),
  phone text check (phone is null or char_length(phone) <= 40),
  company_name text check (company_name is null or char_length(company_name) <= 160),
  subject text not null check (char_length(trim(subject)) between 1 and 200),
  message text not null check (char_length(trim(message)) between 1 and 10000),
  is_read boolean not null default false
);

create table if not exists public.site_contact_settings (
  id boolean primary key default true check (id),
  email text not null default 'it.agamirsomoy2@gmail.com',
  phone text not null default '+8801924437817',
  address text not null default 'বাংলাদেশ',
  ad_email text not null default '',
  support_message text not null default ''
);

create table if not exists public.site_social_links (
  id text primary key,
  label text not null default 'Social Link',
  url text not null default '',
  icon_key text not null default 'website',
  is_active boolean not null default true,
  order_index integer not null default 0
);

insert into public.site_contact_settings (id, phone)
values (true, '+8801924437817')
on conflict (id) do nothing;

insert into public.site_social_links (id, label, url, icon_key, is_active, order_index)
values
  ('facebook', 'Facebook', 'https://facebook.com/', 'facebook', true, 0),
  ('youtube', 'YouTube', 'https://youtube.com/', 'youtube', true, 1),
  ('linkedin', 'LinkedIn', 'https://linkedin.com/', 'linkedin', true, 2),
  ('email', 'Email', 'mailto:it.agamirsomoy2@gmail.com', 'email', true, 3),
  ('website', 'Blog / Website', 'https://likhontools.com', 'website', true, 4)
on conflict (id) do nothing;

alter table public.site_contact_settings
  alter column email set default 'it.agamirsomoy2@gmail.com';

update public.site_contact_settings
set email = 'it.agamirsomoy2@gmail.com'
where id = true
  and email = 'it.agamirsomoy@gmail.com';

alter table public.contact_messages enable row level security;
alter table public.site_contact_settings enable row level security;
alter table public.site_social_links enable row level security;

create or replace function public.is_site_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role' = 'admin', false);
$$;

grant execute on function public.is_site_admin() to authenticated;
grant insert on public.contact_messages to anon, authenticated;
grant select, update on public.contact_messages to authenticated;
grant select on public.site_contact_settings to anon, authenticated;
grant insert, update on public.site_contact_settings to authenticated;
grant select on public.site_social_links to anon, authenticated;
grant insert, update, delete on public.site_social_links to authenticated;

drop policy if exists "Visitors can submit contact messages" on public.contact_messages;
drop policy if exists "Site admins can read contact messages" on public.contact_messages;
drop policy if exists "Site admins can mark contact messages read" on public.contact_messages;
drop policy if exists "Anyone can read public contact settings" on public.site_contact_settings;
drop policy if exists "Site admins can create contact settings" on public.site_contact_settings;
drop policy if exists "Site admins can update contact settings" on public.site_contact_settings;
drop policy if exists "Anyone can read public social links" on public.site_social_links;
drop policy if exists "Site admins can manage social links" on public.site_social_links;

create policy "Visitors can submit contact messages"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (
    char_length(trim(first_name)) between 1 and 100
    and char_length(trim(last_name)) between 1 and 100
    and char_length(trim(subject)) between 1 and 200
    and char_length(trim(message)) between 1 and 10000
  );

create policy "Site admins can read contact messages"
  on public.contact_messages
  for select
  to authenticated
  using (public.is_site_admin());

create policy "Site admins can mark contact messages read"
  on public.contact_messages
  for update
  to authenticated
  using (public.is_site_admin())
  with check (public.is_site_admin());

create policy "Anyone can read public contact settings"
  on public.site_contact_settings
  for select
  to anon, authenticated
  using (true);

create policy "Site admins can create contact settings"
  on public.site_contact_settings
  for insert
  to authenticated
  with check (public.is_site_admin());

create policy "Site admins can update contact settings"
  on public.site_contact_settings
  for update
  to authenticated
  using (public.is_site_admin())
  with check (public.is_site_admin());

create policy "Anyone can read public social links"
  on public.site_social_links
  for select
  to anon, authenticated
  using (is_active = true);

create policy "Site admins can manage social links"
  on public.site_social_links
  for all
  to authenticated
  using (public.is_site_admin())
  with check (public.is_site_admin());

notify pgrst, 'reload schema';
