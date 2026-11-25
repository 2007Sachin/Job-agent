-- No auth.users rows are inserted here. The in-app demo catalog lives in src/lib/catalog.ts
-- so a fresh browser can search without a database.
-- After you sign up, the client upserts public.profiles from onboarding.

-- Optional illustration of a usage cap row shape (skipped: needs a real user id).
-- insert into public.usage_daily (user_id, day, kind, count) values ('…', current_date, 'llm', 0);
