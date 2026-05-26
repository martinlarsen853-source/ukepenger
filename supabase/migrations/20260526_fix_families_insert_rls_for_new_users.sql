-- The old policy required the user to already have a profile in the family
-- before inserting it — impossible for brand-new users (chicken-and-egg).
-- New policy: allow INSERT when the user has no family yet, OR is already
-- a member of that specific family (idempotent re-creation edge case).
DROP POLICY IF EXISTS "families: insert members" ON families;

CREATE POLICY "families: insert members" ON families
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      -- New user: no profile exists yet → allow creating their first family
      NOT EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
          AND family_id IS NOT NULL
      )
      OR
      -- Existing member: profile already points to this family
      id IN (
        SELECT family_id FROM profiles
        WHERE user_id = auth.uid()
      )
    )
  );
