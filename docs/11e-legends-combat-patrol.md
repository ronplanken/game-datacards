# 11th-edition Legends and Combat Patrol

The 11e loader reads `VITE_DATASOURCE_11TH_URL/index.json` (schema version 1).
The index lists ordinary faction files, optional `legends` companions and
`combatPatrol` faction files. Paths are relative to the configured datasource
root. Referenced files must load successfully and agree with the index's
faction ID and data version; a failed or partial fetch does not replace the
cached dataset.

An actual 404 for the index supports older ordinary 11e data using the existing
29-faction list. It does not silently substitute 10th-edition patrols. A server,
network or schema error is an update failure, not evidence of missing Legends.

## Browsing

- Ordinary 11e browsing merges companion Legends datasheets by faction ID.
  `isLegends` is retained and mapped to the existing `legends` display/filter
  property, including the card editor and printed Legends marker.
- `40k-11e-cp` is a separate datasource choice on desktop and mobile. Each patrol
  is a separate selectable entry named `<faction> - <patrol>` with the patrol
  detachment ID as its browse identity.
- Patrol entries contain only referenced roster cards, stratagems, enhancements
  and detachment rule groups. Ordinary core stratagems, parent factions and
  allies are not mixed into them. `sourceFactionId` and `sourceFactionName`
  retain faction provenance; cards keep `source: "40k-11e"` for the renderer.
- `patrolCount` represents roster units, not models. Lists show the quantity and
  Warlord status without changing the datasheet's name or profile.
- Patrol card URLs include `cardId` to distinguish source variants that share
  a name. Legacy name-only URLs remain readable.
- Mode-wide mission/rulebook references remain in `companions`; this change
  does not assign a particular mission to a patrol or add a mission browser.

The 11e cache schema is version 2. Old caches refresh automatically even when
the language is unchanged. Ordinary 11e and Combat Patrol have separate cache
keys, and a retired selected patrol index falls back to the first available
entry. 10th edition remains selectable independently.

## Release order

1. Publish the updated datasources-pipeline outputs, including `gdc/index.json`,
   `gdc/legends/*.json`, and the rebuilt `gdc/combatpatrol/*.json` files.
   For current source 946, reprocessing baseline 925 to target 946 produces
   the updated outputs and change reports using the new parser.
2. Release the app integration. The existing `VITE_DATASOURCE_11TH_URL` should
   point to the directory containing that index; no additional URL is needed.

The source-946 dataset contains 12 Ork Legends cards and 24 patrols / 107 roster
cards. This is verified source coverage, not a claim of complete Legends
coverage for every faction. No archived 10th-edition data is relabelled.

## Checks

Focused tests cover indexed discovery, Legends filtering, patrol reference
resolution, localization, roster display metadata, same-name URL selection,
cache migration, failed updates and mobile system selection. The production
build also requires network access for the app's existing Google Fonts import.
