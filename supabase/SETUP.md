# Supabase setup

## Connect the app

The project URL and publishable key are stored locally in `.env.local`, which is ignored by Git. Never put a Supabase `service_role` or secret key in a `VITE_*` variable or browser code.

## Create the contact tables

In the Supabase Dashboard, open **SQL Editor**, paste the contents of `contact-messages.sql`, and run it. The script is safe to rerun and creates the contact inbox, the shared public contact details, and their row-level security policies:

- Visitors may submit messages.
- Only authenticated users with `app_metadata.role` set to `admin` may read messages or change their read status.
- Visitors can read the public contact email, phone number, and address; only admins can change them.

If the contact form cannot send or the inbox says a table is missing (`PGRST205`), this SQL has not been applied to the Supabase project used by the site. Run `contact-messages.sql` in that project's SQL Editor. It is safe to rerun; afterward refresh the contact page and admin inbox. Messages submitted before the table existed were not stored, so submit them again after setup.

## Enable admin accounts

In **Authentication → Users**, create these two users and set their passwords there:

- `it.agamirsomoy2@gmail.com`
- `engremran.it@gmail.com`

Then run this SQL to grant both accounts the trusted admin role:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email in ('it.agamirsomoy2@gmail.com', 'engremran.it@gmail.com');

select email, raw_app_meta_data ->> 'role' as role
from auth.users
where email in ('it.agamirsomoy2@gmail.com', 'engremran.it@gmail.com');
```

The verification query should show `admin` for both users. The app checks the trusted `app_metadata` role, and the table's RLS policies enforce the same role on the database. Do not grant admin through editable `user_metadata`. If a user does not appear in the result, create that user in **Authentication → Users** first and rerun the SQL.

If sign-in fails, verify the email and password and confirm the account exists under **Authentication → Users**, then run the role SQL above. If the account is already signed in but reports no admin permission, sign out and back in after setting the role.

## Remove the obsolete email

The former address `it.agamirsomoy@gmail.com` is not an admin or contact address. The contact-table setup script migrates the public contact email to `it.agamirsomoy2@gmail.com` when it finds the former default. After creating both valid admin accounts, run [remove-obsolete-admin-email.sql](./remove-obsolete-admin-email.sql) in the Supabase SQL Editor. It grants the admin role to the two valid accounts, changes the public contact email, and deletes only the Auth user with the obsolete email.

Run the contact-table setup script first. The verification queries in the removal script should show the two valid admin emails and the new contact email. The app's publishable key cannot delete Auth users, so this must be run in the Supabase Dashboard. The script does not delete contact messages submitted by visitors.

## Publish contact information

Sign in at `/admin`, edit the email, phone, and address under **SEO, brand & contact**, and choose **Save changes**. These details are saved to Supabase and displayed on the public contact page. The supplied phone number is prefilled and can be changed there.

After changing `.env.local`, restart the Vite dev server. Once deployed, set the same two `VITE_SUPABASE_*` variables in the hosting provider's environment settings and redeploy.
