begin;

update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email in ('it.agamirsomoy2@gmail.com', 'engremran.it@gmail.com');

update public.site_contact_settings
set email = 'it.agamirsomoy2@gmail.com'
where id = true
  and email = 'it.agamirsomoy@gmail.com';

delete from auth.users
where email = 'it.agamirsomoy@gmail.com';

select email, raw_app_meta_data ->> 'role' as role
from auth.users
where email in ('it.agamirsomoy2@gmail.com', 'engremran.it@gmail.com');

select email
from public.site_contact_settings
where id = true;

commit;
