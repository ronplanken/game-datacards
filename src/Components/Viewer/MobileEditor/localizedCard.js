/**
 * Language projection for the mobile card editor.
 *
 * Multi-language datasources (40k-11e) store every displayable string as a
 * language-keyed object: `{ en: "Leader", de: "Anführer", ... }`. The mobile
 * editor's section components all read and write plain strings, so rather than
 * teaching each of them about language keys, the editor edits a *projection* of
 * the card:
 *
 *   project(card)  ->  the same card with every localized field resolved to a
 *                      plain string in the active card language
 *   merge(view)    ->  that view folded back into language-keyed shape, with
 *                      every other language left untouched
 *
 * The projection carries the original language maps along in a `__i18n` sidecar
 * on the object that owns each field. That is what makes the round trip safe
 * under structural edits: when a section deletes weapon 0 or reorders the
 * abilities, each surviving item takes its own language map with it, so nothing
 * is merged back into the wrong entry's translations.
 *
 * Fields the datasource keeps as plain strings (a unit's `name`, a weapon's
 * numeric stats, an enhancement's eligibility keywords) are simply absent from
 * the spec and pass through both directions untouched.
 */

import { localize, setLocalizedFieldSeeded } from "../../../Helpers/localization.helpers";

// Sidecar key holding the pre-projection language maps for one object's fields.
export const I18N_KEY = "__i18n";

// Spec leaf tokens.
const TEXT = "text";
// A field that is cleared to `null` rather than to an empty string: the points
// tier restrictions, where `null` is what the datasource stores for a tier that
// applies to every detachment / faction (and what the points helpers test for).
const TEXT_OR_NULL = "textOrNull";
// An array whose *entries* are themselves localized strings (keywords, unit
// composition lines, wargear sentences). Entries project to `{ name }` objects
// so each one can carry its own sidecar; the sections that render them already
// accept that shape.
const TEXT_LIST = "textList";

const isPlainObject = (value) => value != null && typeof value === "object" && !Array.isArray(value);

const NAMED = { name: TEXT };
const NAMED_WITH_DESCRIPTION = { name: TEXT, description: TEXT };
const WEAPONS = {
  each: {
    profiles: { each: NAMED },
    abilities: { each: NAMED_WITH_DESCRIPTION },
  },
};

/**
 * Which fields of an 11th edition unit are language-keyed.
 *
 * `name` and `subname` are deliberately absent: the datasource loader already
 * resolves a card's top-level name to a plain string (see `get40k11eData`) and
 * the renderers read it raw, so projecting it would be a no-op on the way in
 * and would risk turning it into an object on the way out.
 */
const UNIT_11E = {
  stats: { each: NAMED },
  rangedWeapons: WEAPONS,
  meleeWeapons: WEAPONS,
  abilities: {
    core: { each: NAMED },
    faction: { each: NAMED },
    other: { each: NAMED_WITH_DESCRIPTION },
    wargear: { each: NAMED_WITH_DESCRIPTION },
    special: { each: NAMED_WITH_DESCRIPTION },
    primarch: { each: { name: TEXT, abilities: { each: NAMED_WITH_DESCRIPTION } } },
    damaged: { range: TEXT, description: TEXT },
  },
  // Keywords are localized; `factions` are plain strings matched in English.
  keywords: TEXT_LIST,
  composition: TEXT_LIST,
  wargear: TEXT_LIST,
  wargearOptions: { each: { instruction: TEXT, options: { each: NAMED } } },
  loadout: TEXT,
  transport: TEXT,
  leader: TEXT,
  points: { each: { keyword: TEXT, detachment: TEXT_OR_NULL, faction: TEXT_OR_NULL } },
};

const STRATAGEM_11E = {
  detachment: TEXT,
  type: TEXT,
  when: TEXT,
  target: TEXT,
  effect: TEXT,
  restrictions: TEXT,
};

// `keywords` / `excludes` stay out of the spec: the list builder matches an
// enhancement's eligibility against English keywords, so they are plain strings.
const ENHANCEMENT_11E = {
  detachment: TEXT,
  description: TEXT,
};

const RULE_11E = {
  detachment: TEXT,
  rules: { each: { title: TEXT, text: TEXT } },
};

const SPEC_BY_11E_CARD_TYPE = {
  unit: UNIT_11E,
  stratagem: STRATAGEM_11E,
  enhancement: ENHANCEMENT_11E,
  rule: RULE_11E,
};

/**
 * Classify an 11th edition card as "unit" | "stratagem" | "enhancement" | "rule".
 *
 * The editor has to agree with itself about what a card is twice over — once to
 * pick its localization spec and once to pick its editor sections — and a card
 * resolved against a mismatched spec would silently mis-merge its text. So both
 * go through this one function.
 *
 * The `cardType` stamped on a card is authoritative: the datasource loader sets
 * `DataCard` / `stratagem` / `enhancement` (`get40k11eData`), and the viewer's
 * unit list sets `rule` when it turns army and detachment rules into cards
 * (`ViewerUnitList`). The shape checks below are the fallback for cards stored
 * before those existed, and for hand-built test data.
 */
export function classify11eCard(card) {
  switch (card?.cardType) {
    case "DataCard":
      return "unit";
    case "stratagem":
      return "stratagem";
    case "enhancement":
      return "enhancement";
    case "rule":
      return "rule";
    default:
      break;
  }

  if (Array.isArray(card?.stats) || card?.rangedWeapons || card?.meleeWeapons) return "unit";
  if (card?.when !== undefined || card?.effect !== undefined) return "stratagem";
  if (Array.isArray(card?.rules)) return "rule";
  if (card?.description !== undefined) return "enhancement";
  return "unit";
}

/**
 * The localization spec for a card, or `null` when the card needs no projection.
 *
 * Only 40k-11e ships language-keyed data today; every other source edits its
 * plain strings directly.
 */
export function getLocalizationSpec(card, gameSystem) {
  const source = card?.source || gameSystem;
  if (source !== "40k-11e") return null;
  if (!card) return null;
  return SPEC_BY_11E_CARD_TYPE[classify11eCard(card)];
}

/**
 * Resolve every localized field of `card` to a plain string in `language`,
 * keeping the original language maps in `__i18n` sidecars for {@link mergeCard}.
 */
export function projectCard(card, spec, language = "en") {
  if (!card || !spec) return card;
  return projectObject(card, spec, language);
}

/**
 * Fold an edited projection back into language-keyed shape, preserving every
 * language the user was not editing.
 */
export function mergeCard(view, spec, language = "en") {
  if (!view || !spec) return view;
  return mergeObject(view, spec, language);
}

function projectObject(value, spec, language) {
  if (!isPlainObject(value)) return value;

  const out = { ...value };
  const sidecar = {};

  for (const [key, fieldSpec] of Object.entries(spec)) {
    if (!(key in value)) continue;
    const current = value[key];

    if (fieldSpec === TEXT || fieldSpec === TEXT_OR_NULL) {
      out[key] = localize(current, language);
      sidecar[key] = current;
      continue;
    }

    if (fieldSpec === TEXT_LIST) {
      if (!Array.isArray(current)) continue;
      out[key] = current.map((entry) => ({
        name: localize(entry, language),
        [I18N_KEY]: { name: entry },
      }));
      continue;
    }

    if (fieldSpec?.each) {
      if (!Array.isArray(current)) continue;
      out[key] = current.map((item) => projectObject(item, fieldSpec.each, language));
      continue;
    }

    out[key] = projectObject(current, fieldSpec, language);
  }

  if (Object.keys(sidecar).length > 0) {
    out[I18N_KEY] = sidecar;
  }
  return out;
}

function mergeObject(view, spec, language) {
  if (!isPlainObject(view)) return view;

  const { [I18N_KEY]: sidecar, ...out } = view;

  for (const [key, fieldSpec] of Object.entries(spec)) {
    if (!(key in out)) continue;
    const edited = out[key];

    if (fieldSpec === TEXT || fieldSpec === TEXT_OR_NULL) {
      const original = sidecar?.[key];
      const text = edited == null ? "" : String(edited);

      // Coverage is uneven across the 11e data, so a field with only English
      // text projects as that English fallback. Writing it back unchanged would
      // silently stamp a copy of it into the active language on every save, so
      // an untouched field is restored exactly as it came in.
      if (isUnchanged(original, text, language)) {
        out[key] = original;
        continue;
      }

      // An unrestricted points tier is stored as null, not as an empty string.
      if (fieldSpec === TEXT_OR_NULL && text.trim() === "") {
        out[key] = null;
        continue;
      }
      // A field the datasource omits (a stratagem's restrictions, a new
      // ability's description) stays omitted until it actually has text, so
      // cleared fields do not leave empty language objects behind.
      if (original == null && text === "") {
        delete out[key];
        continue;
      }
      out[key] = setLocalizedFieldSeeded(original, language, text);
      continue;
    }

    if (fieldSpec === TEXT_LIST) {
      if (!Array.isArray(edited)) continue;
      out[key] = edited.map((entry) => mergeTextListEntry(entry, language));
      continue;
    }

    if (fieldSpec?.each) {
      if (!Array.isArray(edited)) continue;
      out[key] = edited.map((item) => mergeObject(item, fieldSpec.each, language));
      continue;
    }

    out[key] = mergeObject(edited, fieldSpec, language);
  }

  return out;
}

// An entry added by a section arrives as a bare string (StringListSection seeds
// new rows with ""), one that came from the card as a projected `{ name }`
// object carrying its language map.
function mergeTextListEntry(entry, language) {
  if (isPlainObject(entry)) {
    const original = entry[I18N_KEY]?.name;
    const text = entry.name ?? "";
    if (isUnchanged(original, text, language)) return original;
    return setLocalizedFieldSeeded(original, language, text);
  }
  return setLocalizedFieldSeeded(null, language, entry ?? "");
}

// True when the edited text still reads exactly as the projection did, i.e. the
// user did not touch this field.
function isUnchanged(original, text, language) {
  return original !== undefined && localize(original, language) === text;
}
