# Emergency RLS Lockdown

This migration is an emergency lockdown for Security Advisor findings on sensitive `public` tables.

It enables Row Level Security and adds deny-all policies for the `anon` and `authenticated` roles.

Expected impact: client-side reads and writes against these tables may fail until proper allow policies are added.

This change is intentionally minimal and does not add application-specific access rules.
