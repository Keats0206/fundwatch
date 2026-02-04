# Adding a new fund (login + Supabase)

When you add a new fund to log in (e.g. Mantis Ventures), you need it in **two** places:

1. **FUND_CREDENTIALS** in `.env.local` – so login accepts username/password and sets the fund cookie.
2. **Supabase `funds` table** – so the app can load the fund name and show it in the UI. If you use Supabase for data, funds are read from the DB; if the fund isn’t there, login still works but the header may show the raw fund id until you add it.

## Add the fund to Supabase

In the Supabase **SQL Editor**, run:

```sql
insert into public.funds (id, name) values ('mantis-ventures', 'Mantis Ventures') on conflict (id) do nothing;
```

Use your fund’s `id` (e.g. `mantis-ventures`) and `name` (e.g. `Mantis Ventures`). Then restart your app (or just refresh); the fund name should appear and login will work end-to-end.

## Mantis Ventures login

- **URL:** `/login`
- **Username:** `mantisventures` (no hyphen)
- **Password:** `mantis-ventures-secret` (or whatever you set in FUND_CREDENTIALS)

After changing `.env.local`, restart the dev server so the new credentials are loaded.
