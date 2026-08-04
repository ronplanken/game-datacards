-- Migration 022: Make user_datasources.data nullable
--
-- The edit/publish workflow (migration 011) introduced edit_data and
-- published_data columns. The legacy data column is only populated
-- when a datasource is published, so new (unpublished) datasources
-- should be allowed to have NULL data.

ALTER TABLE public.user_datasources ALTER COLUMN data DROP NOT NULL;
