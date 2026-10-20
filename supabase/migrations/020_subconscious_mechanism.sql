-- The subconscious mechanism the interpretation names for a dream — what the dream appears to
-- be *doing* psychologically (wish-fulfilment, anxiety rehearsal, compensation, ...), as
-- opposed to which symbols it holds. Stored as one JSONB object, { label, explanation },
-- parallel to how cultural_references keeps its structured entries. Nullable: every reading
-- produced before prompt 2.4.0 has none.

ALTER TABLE interpretations
  ADD COLUMN IF NOT EXISTS subconscious_mechanism JSONB;

-- 008_grants.sql grants interpretations table-wide to `authenticated`, which covers columns
-- added later; RLS still restricts every write to the user's own row. No new grant is needed.

COMMENT ON COLUMN interpretations.subconscious_mechanism IS
  'The psychological function the dream appears to perform, as { "label": string, "explanation": string }. NULL for readings produced before prompt 2.4.0.';
