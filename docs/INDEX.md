---
title: Documentation Index
description: Table of contents for all Game Datacards documentation files
---

# Documentation Index

## Data Formats

| File | Description |
|------|-------------|
| [card-data-formats.md](card-data-formats.md) | JSON schemas for all card types (40k 10e DataCards, Stratagems, Enhancements, Rules; AoS Warscrolls, Spells) |
| [warhammer-40k-11e-format.md](warhammer-40k-11e-format.md) | Multi-language 40k 11th edition (40k-11e) datasource format, per-field English fallback, the dedicated renderset and `<k>`/`<ul>`/`■` markup, the shared keyword glossary (`keywords.json`) that drives keyword/ability hover tooltips, and how it is wired in as a built-in datasource |
| [custom-datasource-format.md](custom-datasource-format.md) | JSON format for creating and sharing custom datasources, including validation limits and all game system card schemas |
| [starcraft-tmg.md](starcraft-tmg.md) | Starcraft TMG base system: unit schema, ability badges, Models / Supply tiers, weapon tables, starter datasource |

## Custom Datasource

| File | Description |
|------|-------------|
| [custom datasource/datasource-schema-architecture.md](custom%20datasource/datasource-schema-architecture.md) | Canonical reference for the custom datasource schema (card types, weapons, abilities, metadata, glossary). |
| [custom datasource/keyword-glossary.md](custom%20datasource/keyword-glossary.md) | Datasource-level keyword glossary — define `One Shot`, `Anti-`, etc. once and the weapon/ability renderers for 40k-10e, AoS, and Starcraft TMG expand them into styled tags, hover tooltips, and explanation rows. Entries declare which scopes they apply to. |

## Features

| File | Description |
|------|-------------|
| [40k-11e-card-editing.md](40k-11e-card-editing.md) | How the 11th edition card editor edits language-keyed fields in place for the active card language (with per-field English fallback), which fields stay plain, and the optional show/hide flags |
| [welcome-wizard-v2.md](welcome-wizard-v2.md) | Onboarding wizard (v2.0.0): 9-step flow, game system selection, interactive demos, component architecture |
| [release-notifications.md](release-notifications.md) | How shipped changes reach users: quiet release notes in the notification bell for fixes (patch bump), the full What's New wizard for notable features (minor bump), and how the issue-to-PR pipeline routes between them |
| [listforge-direct-read-import.md](listforge-direct-read-import.md) | ListForge/NewRecruit roster import with match and direct-read modes, format mapping reference |
| [listforge-url-import.md](listforge-url-import.md) | One-click import via URL hash fragment with gzip-compressed JSON payload from ListForge |

## Components

| File | Description |
|------|-------------|
| [draggable-tree-component.md](draggable-tree-component.md) | TreeViewDemo drag-and-drop component used in the Welcome Wizard workspace step |

## Infrastructure

| File | Description |
|------|-------------|
| [self-hosted-migration.md](self-hosted-migration.md) | Migration guide from Supabase Cloud to self-hosted Coolify (18 migrations, edge functions, auth setup) |

## LLM Documentation

| File | Description |
|------|-------------|
| [/llms.txt](../public/llms.txt) | Compact llms.txt with project overview, game systems, and links to data format docs |
| [/llms-full.txt](../public/llms-full.txt) | Full llms.txt with all data format and import documentation inlined |
