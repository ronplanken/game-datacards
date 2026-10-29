ALTER TABLE public.user_datasources DROP CONSTRAINT IF EXISTS valid_game_system;
ALTER TABLE public.user_datasources
  ADD CONSTRAINT valid_game_system
  CHECK (game_system IS NULL OR game_system IN (
    '40k-11e', '40k-10e', '40k', 'aos', 'starcraft-tmg', 'blank', 'necromunda', 'basic', 'horus-heresy', 'other'
  ));

ALTER TABLE public.user_templates DROP CONSTRAINT IF EXISTS valid_template_game_system;
ALTER TABLE public.user_templates
  ADD CONSTRAINT valid_template_game_system
  CHECK (game_system IS NULL OR game_system IN (
    '40k-11e', '40k-10e', '40k', 'aos', 'starcraft-tmg', 'blank', 'necromunda', 'basic', 'horus-heresy', 'other'
  ));
