# Deploying daily-check

This requires the Supabase CLI logged into your account — I can't deploy it
for you since that needs your own Supabase auth, not the project's service
role key.

## One-time setup

```bash
npm install -g supabase
supabase login
supabase link --project-ref hcvwgblgykikcodmkpvm
```

## Deploy

```bash
supabase functions deploy daily-check
```

## Schedule it

Run `supabase/sql/003_daily_check_cron.sql` in the SQL Editor, after
replacing `PROJECT_URL` and `SERVICE_ROLE_KEY` with your actual values from
Settings -> API.

## Test it manually before relying on the schedule

```bash
curl -i --request POST 'https://hcvwgblgykikcodmkpvm.supabase.co/functions/v1/daily-check' \
  --header 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY'
```

Expect a JSON body like:

```json
{"success":true,"expiredTrials":0,"expiredSubscriptions":0,"trialWarningsChecked":0,"subscriptionWarningsChecked":0}
```
