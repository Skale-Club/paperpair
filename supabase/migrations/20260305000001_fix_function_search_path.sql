-- Fix: Function Search Path Mutable warning on public.set_updated_at_user_ai_keys
--
-- The Security Advisor flags functions whose search_path is not fixed because a
-- malicious user could potentially shadow system objects by creating objects in
-- a schema that appears earlier in the search path.
--
-- Fix: recreate the function with `SET search_path = ''` so that the search
-- path is locked to an empty string, forcing all references to be fully
-- qualified. The trigger itself doesn't need to change.

CREATE OR REPLACE FUNCTION public.set_updated_at_user_ai_keys()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
