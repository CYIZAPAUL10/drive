# ELVAIS runbook

## Every day
Open the admin Overview. It should show "All emails have been sent" and a Background job that ran
in the last 5 minutes. A red box means something needs attention (see below).

## Background job (reminders and email retries)
The site has a protected web address that sends the 30-minute reminders and retries failed emails:

    GET https://YOUR-DOMAIN/api/cron/notifications
    Header:  Authorization: Bearer <CRON_SECRET from the host's settings>

It must be called every 5 minutes. Setup with cron-job.org (free) [VERIFY the current screens and limits]:
1. Create an account, then a new cron job.
2. URL: the address above. Schedule: every 5 minutes.
3. Under advanced settings, add the request header `Authorization` with the value `Bearer ` followed by the secret.
4. Turn on the failure notification so you get an email if the job stops responding.
5. Run it once by hand. A good answer looks like {"reminders":0,"due":0,"sent":0,...}.
A wrong or missing header returns 401: the secret is checked, so keep it private.

## An alert email failed (red box on Overview)
1. Call or WhatsApp the customers listed. They have not been told about their request.
2. Check the sending service (Resend): is the API key valid, is the daily limit reached (free plan: 100 a day [VERIFY]), is the sending domain still verified?
3. After fixing it, the next job run retries once. If it already gave up, contact the customer directly.

## Lost admin password
On the computer that has the project, run: npm run admin:password
It asks for the new password twice and signs out every open session.

## Rotating a secret
Change it in the host's settings and restart. Changing AUTH_SECRET signs everyone out, which is fine.