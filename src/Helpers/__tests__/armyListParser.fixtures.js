// Real Warhammer 40,000 app exports, used by the parser tests.
//
// PORTED FILE. Copied from `src/lib/army-list/parse.fixtures.ts` in the
// wargaming-streamer-saas repository. Keep it in step with that file so a parser
// fix made there can be checked against the same exports here.

// Real Warhammer 40,000 app exports, used as parser fixtures. Indentation is
// significant: the model-count heuristic reads bullet nesting, so these must be
// kept byte-for-byte as the app produces them.

// Title format, lowercase "points", "Attached Units" grouping. App v2.1.1.
export const BARK_AT_THE_MOON = `Bark at the Moon (1990 points)

Space Marines
Space Wolves
Strike Force (2000 points)
Legends of Saga and Song and Saga of the Beastslayer (3 Detachment Points)
Purge the Foe

Attached Units
Attached Unit 1

Logan Grimnar (110 points)
• Attached as: Leader (Character)
  • Warlord
  • 1x Axe Morkai
    1x Storm bolter
    1x Tyrnak and Fenrir

Wolf Guard Terminators (165 points)
• Attached as: Bodyguard
  • 1x Wolf Guard Terminator Pack Leader
    • 1x Twin lightning claws
  • 4x Wolf Guard Terminator
    • 1x Assault cannon
      3x Master-crafted power weapon
      1x Power fist
      3x Storm Shield

Attached Unit 2

Ragnar Blackmane (100 points)
• Attached as: Leader (Character)
  • 1x Bolt Pistol
    1x Frostfang

Wolf Guard Headtakers (170 points)
• Attached as: Bodyguard
  • 6x Wolf Guard Headtaker
    • 6x Heavy bolt pistol
      6x Master-crafted power weapon
      6x Storm Shield

Attached Unit 3

Arjac Rockfist (105 points)
• Attached as: Leader (Character)
  • 1x Foehammer

Wolf Guard Terminators (175 points)
• Attached as: Bodyguard
  • 1x Wolf Guard Terminator Pack Leader
    • 1x Relic greataxe
  • 4x Wolf Guard Terminator
    • 1x Assault cannon
      3x Master-crafted power weapon
      1x Power fist
      3x Storm Shield


CHARACTERS

Bjorn the Fell-Handed (160 points)
  • 1x Heavy flamer
    1x Helfrost cannon
    1x Trueclaw

Murderfang (150 points)
  • 1x Heavy flamer
    1x Murderclaws
    1x Storm bolter

Wolf Guard Battle Leader (80 points)
  • 1x Plasma pistol
    1x Thunder hammer
  • Enhancement: Wolf-touched


BATTLELINE

Blood Claws (135 points)
  • 1x Blood Claw Pack Leader
    • 1x Plasma pistol
      1x Power weapon
  • 9x Blood Claw
    • 9x Astartes chainsword
      9x Bolt pistol

Blood Claws (135 points)
  • 1x Blood Claw Pack Leader
    • 1x Plasma pistol
      1x Power weapon
  • 9x Blood Claw
    • 9x Astartes chainsword
      9x Bolt pistol

Intercessor Squad (80 points)
  • 1x Intercessor Sergeant
    • 1x Bolt pistol
      1x Bolt rifle
      1x Close combat weapon
  • 4x Intercessor
    • 1x Astartes grenade launcher
      4x Bolt pistol
      4x Bolt rifle
      4x Close combat weapon


OTHER DATASHEETS

Gladiator Lancer (160 points)
  • 1x Armoured hull
    2x Fragstorm grenade launcher
    1x Icarus rocket pod
    1x Ironhail heavy stubber
    1x Lancer laser destroyer

Scout Squad (65 points)
  • 1x Scout Sergeant
    • 1x Astartes chainsword
      1x Bolt pistol
      1x Close combat weapon
  • 4x Scout
    • 4x Bolt pistol
      4x Close combat weapon
      2x Combat knife
      1x Heavy bolter
      1x Scout sniper rifle

Wulfen with Storm Shields (200 points)
  • 10x Wulfen
    • 6x Death Totem
      4x Stormfrag auto-launcher
      10x Thunder hammer

Exported with App Version: v2.1.1 (132), Data Version: v895`;

// WTC "+++" header block, "pts" units. Chaos Daemons.
export const CHAOS_DAEMONS_WTC = `+++++++++++++++++++++++++++++++++++++++++++++++
+ FACTION KEYWORD: Chaos - Chaos Daemons
+ DETACHMENT: Shadow Legion, Warptide (First Prince of Chaos)
+ FORCE DISPOSITION: Reconnaissance
+ TOTAL ARMY POINTS: 2000pts
+
+ WARLORD: Char1: Be'lakor
+ ENHANCEMENT: Fade to Darkness (on Char2: Bloodthirster)
+ NUMBER OF UNITS: 14
+ SECONDARY: - Bring It Down: (2x4) + (1x6) - Assassination: 4 Characters
+++++++++++++++++++++++++++++++++++++++++++++++

CHARACTER

Be'lakor (390 pts)
• 1x Betraying Shades
• 1x The Blade of Shadows
• Warlord

Bloodthirster (350 pts)
• 1x Hellfire breath
• 1x Great axe of Khorne
• Fade to Darkness (+30 pts)

Lord of Change (300 pts)
• 1x Bolt of Change
• 1x Staff of Tzeentch
• 1x Rod of sorcery

BATTLELINE

Blue Horrors (125 pts)
• 10x Blue Horror
    • 10x Blue claws
    • 10x Coruscating Blue flames

Plaguebearers (115 pts)
• 1x Plagueridden
    • 1x Plaguesword
• 9x Plaguebearer
    • 9x Plaguesword
    • Instrument of Chaos, Daemonic Icon

Plaguebearers (115 pts)
• 1x Plagueridden
    • 1x Plaguesword
• 9x Plaguebearer
    • 9x Plaguesword
    • Instrument of Chaos, Daemonic Icon

OTHER DATASHEETS

Beasts of Nurgle (70 pts)
• 1x Beast of Nurgle
    • 1x Putrid appendages

Beasts of Nurgle (70 pts)
• 1x Beast of Nurgle
    • 1x Putrid appendages

Chaos Lord in Terminator Armour (85 pts)
• 1x Combi-weapon
• 1x Power fist

Flamers (65 pts)
• 1x Pyrocaster
    • 1x Flamer mouths
    • 1x Flickering Flames
• 2x Flamer
    • 2x Flamer mouths
    • 2x Flickering Flames

Flesh Hounds (75 pts)
• 1x Gore Hound
    • 1x Burning roar
    • 1x Gore-drenched fangs
    • Collar of Khorne
• 4x Flesh Hound
    • 4x Gore-drenched fangs
    • 4x Collar of Khorne

Screamers (80 pts)
• 3x Screamer
    • 3x Lamprey bite

Screamers (80 pts)
• 3x Screamer
    • 3x Lamprey bite

Screamers (80 pts)
• 3x Screamer
    • 3x Lamprey bite`;

// Title format, capital "Points", comma thousands, "◦" sub-bullets, flattened
// character bullets. App v2.1.0.
export const LOGAN_STEEL_CHAIR = `Logan Grimnar with the steel chair (2,000 Points)

Space Marines
Space Wolves
Legends of Saga and Song and Saga of the Great Wolf (3 Detachment Points)
Take and Hold
Strike Force (2,000 Points)

ATTACHED UNITS

Attached unit 1

Logan Grimnar (110 Points)
  • Attached as: Leader (Character)
  • Warlord
  • 1x Axe Morkai
  • 1x Storm bolter
  • 1x Tyrnak and Fenrir

Wolf Guard Terminators (200 Points)
  • Attached as: Bodyguard ()
  • Enhancements: Fierce Example (Upgrade)
  • 1x Wolf Guard Terminator Pack Leader
     ◦ 1x Relic greataxe
  • 4x Wolf Guard Terminator
     ◦ 1x Assault cannon
     ◦ 3x Master-crafted power weapon
     ◦ 1x Power fist
     ◦ 3x Storm Shield

Attached unit 2

Wolf Guard Battle Leader (90 Points)
  • Attached as: Leader (Character)
  • 1x Storm Shield
  • 1x Thunder hammer
  • Enhancements: Skjald's Foretelling

Wolf Guard Headtakers (170 Points)
  • Attached as: Bodyguard ()
  • 6x Wolf Guard Headtaker
     ◦ 6x Heavy bolt pistol
     ◦ 6x Paired master-crafted power weapons

Attached unit 3

Wolf Priest (70 Points)
  • Attached as: Leader (Character)
  • 1x Absolvor bolt pistol
  • 1x Crozius arcanum

Wolf Guard Headtakers (170 Points)
  • Attached as: Bodyguard ()
  • 6x Wolf Guard Headtaker
     ◦ 6x Heavy bolt pistol
     ◦ 6x Master-crafted power weapon
     ◦ 6x Storm Shield

Attached unit 4

Arjac Rockfist (105 Points)
  • Attached as: Leader (Character)
  • 1x Foehammer

Wolf Guard Terminators (360 Points)
  • Attached as: Bodyguard ()
  • Enhancements: Fierce Example (Upgrade)
  • 1x Wolf Guard Terminator Pack Leader
     ◦ 1x Relic greataxe
  • 9x Wolf Guard Terminator
     ◦ 2x Assault cannon
     ◦ 7x Master-crafted power weapon
     ◦ 2x Power fist
     ◦ 7x Storm Shield

CHARACTERS

Bjorn the Fell-Handed (160 Points)
  • 1x Heavy flamer
  • 1x Helfrost cannon
  • 1x Trueclaw

Lieutenant with Combi-weapon (85 Points)
  • 1x Combi-weapon
  • 1x Paired combat blades

OTHER DATASHEETS

Land Raider Redeemer (250 Points)
  • 1x Armoured tracks
  • 2x Flamestorm cannon
  • 1x Hunter-killer missile
  • 1x Multi-melta
  • 1x Storm bolter
  • 1x Twin assault cannon

Repulsor Executioner (230 Points)
  • 1x Armoured hull
  • 1x Heavy laser destroyer
  • 1x Heavy onslaught gatling cannon
  • 1x Icarus rocket pod
  • 1x Ironhail heavy stubber
  • 1x Repulsor Executioner defensive array
  • 1x Twin Icarus ironhail heavy stubber
  • 1x Twin heavy bolter

Exported with App Version: v2.1.0 (3), Data Version: v895`;

// Title format, single faction line (no chapter), "Force Dispositions" line,
// a "Bodyguard (Battleline)" annotation. World Eaters.
export const WORLD_EATERS = `berserker (1990 points)

World Eaters
Strike Force (2000 points)
Berzerker Warband (3 Detachment Points)
Force Dispositions: Purge the Foe

Attached Units
Attached Unit 1

Slaughterbound (100 points)
• Attached as: Leader (Character)
  • 1x Lacerator and daemonic claw

Exalted Eightbound (140 points)
• Attached as: Bodyguard
  • 1x Exalted Eightbound Champion
    • 1x Chainblades
  • 2x Exalted Eightbound
    • 2x Chainblades

Attached Unit 2

Khârn the Betrayer (115 points)
• Attached as: Leader (Character)
  • 1x Gorechild
    1x Plasma pistol

Khorne Berzerkers (180 points)
• Attached as: Bodyguard (Battleline)
  • 1x Khorne Berzerker Champion
    • 1x Chainblade
      1x Icon of Khorne
      1x Plasma pistol
  • 9x Khorne Berzerker
    • 7x Bolt pistol
      7x Chainblade
      2x Khornate eviscerator
      2x Plasma pistol


CHARACTERS

Daemon Prince of Khorne (200 points)
  • Warlord
  • 1x Hellforged weapons
    1x Infernal cannon

Lord Invocatus (110 points)
  • 1x Bladed horn
    1x Bolt pistol
    1x Coward's Bane

Master of Executions (60 points)
  • 1x Axe of dismemberment
    1x Bolt pistol


OTHER DATASHEETS

Chaos Spawn (95 points)
  • 2x Chaos Spawn
    • 2x Hideous mutations

Chaos Terminators (175 points)
  • 1x World Eaters Terminator Champion
    • 1x Accursed weapon
      1x Combi-bolter
  • 4x World Eaters Terminator
    • 1x Chainfist
      3x Combi-bolter
      3x Power fist
      1x Reaper autocannon

Jakhals (65 points)
  • 1x Jakhal Pack Leader
    • 1x Autopistol
      1x Chainblades
  • 1x Dishonoured
    • 1x Skullsmasher and mangler
  • 8x Jakhal
    • 8x Autopistol
      7x Chainblades
      1x Icon of Khorne
      1x Mauler chainblade

Exported with App Version: v2.0.5 (128), Data Version: v886`;

// Title format, "◦" bullets, a multi-model character (Grimaldus + servitors).
// Black Templars.
export const IRONSTORM = `Ironstorm + MH (1,990 Points)

Space Marines
Black Templars
Ironstorm Spearhead and Marshal's Household (3 Detachment Points)
Priority Assets
Strike Force (2,000 Points)

ATTACHED UNITS

Attached unit 1

Chaplain Grimaldus (110 Points)
  • Attached as: Leader (Character)
  • 1x Chaplain Grimaldus
     • Warlord
     ◦ 1x Artificer crozius
     ◦ 1x Plasma pistol
  • 3x Cenobyte Servitor
     ◦ 3x Close combat weapon

Apothecary (40 Points)
  • Attached as: Support (Character)
  • 1x Absolvor bolt pistol
  • 1x Close combat weapon
  • 1x Reductor pistol

Sword Brethren Squad (245 Points)
  • Attached as: Bodyguard ()
  • Enhancements: Fervent Exemplars (Upgrade)
  • 9x Sword Brother
     ◦ 6x Heavy bolt pistol
     ◦ 9x Master-crafted power weapon
     ◦ 1x Plasma pistol
     ◦ 2x Pyre pistol

CHARACTERS

Techmarine (85 Points)
  • 1x Forge bolter
  • 1x Grav-pistol
  • 1x Omnissian power axe
  • 1x Servo-arm
  • Enhancements: Target Augury Web

OTHER DATASHEETS

Infiltrator Squad (110 Points)
  • 1x Infiltrator Sergeant
     ◦ 1x Bolt pistol
     ◦ 1x Close combat weapon
     ◦ 1x Marksman bolt carbine
  • 4x Infiltrator
     ◦ 4x Bolt pistol
     ◦ 4x Close combat weapon
     ◦ 1x Helix Gauntlet
     ◦ 1x Infiltrator Comms Array
     ◦ 4x Marksman bolt carbine

Exported with App Version: v2.1.0 (3), Data Version: v895`;

// WTC "+++" header block but NO section headers: units follow the block
// directly, each with a "Nx" model count, a "CharN:" slot on characters, and
// weapons trailing the points on the same line. T'au Empire.
export const TAU_MONTKA = `+++++++++++++++++++++++++++++++++++++++++++++++
+ FACTION KEYWORD: Xenos - T'au Empire
+ DETACHMENT: Mont'ka (Killing Blow)
+ TOTAL ARMY POINTS: 2000pts
+
+ WARLORD: Char4: Commander in Enforcer Battlesuit
+ ENHANCEMENT: Strategic Conqueror (on Char2: Commander in Coldstar Battlesuit)
& Strike Swiftly (on Char3: Commander in Coldstar Battlesuit)
& Exemplar of the Mont'ka (on Char4: Commander in Enforcer Battlesuit)
+ NUMBER OF UNITS: 18
+ SECONDARY: - Bring It Down: (6x2) + (6x4) - Assassination: 4 Characters
+++++++++++++++++++++++++++++++++++++++++++++++

Char2: 1x Commander in Coldstar Battlesuit (110 pts): 2x Gun Drone, 3x Burst cannon, High-output burst cannon, Battlesuit fists
Enhancement: Strategic Conqueror (+15 pts)

Char3: 1x Commander in Coldstar Battlesuit (120 pts): 2x Gun Drone, 3x Burst cannon, High-output burst cannon, Battlesuit fists
Enhancement: Strike Swiftly (+25 pts)

Char4: 1x Commander in Enforcer Battlesuit (90 pts): Warlord, Gun Drone, Shield Drone, Cyclic ion blaster, 3x Missile pod, Battlesuit fists
Enhancement: Exemplar of the Mont'ka (+10 pts)

Char1: 2x The Twin Lance (185 pts)
• 1x Ri'Lantar: MV15 Gun Drone, Twin pulse blaster, Fusion eliminator, Twin pulse blaster, Shardstorm burst system, XV pulse pistol
• 1x Ri'Locai: MV15 Gun Drone, Twin pulse blaster, Ion scattercannon, Twin pulse blaster, Shardstorm burst system, XV pulse pistol

2x Broadside Battlesuits (170 pts)
• 1x Broadside Shas’vre: Marker Drone, Shield Drone, Weapon support system, Crushing bulk, Heavy rail rifle, Seeker missile
• 1x Broadside Shas’ui: 2x Shield Drone, Weapon support system, Crushing bulk, Heavy rail rifle, Seeker missile

2x Broadside Battlesuits (170 pts)
• 1x Broadside Shas’vre: Marker Drone, Shield Drone, Weapon support system, Crushing bulk, Heavy rail rifle, Seeker missile
• 1x Broadside Shas’ui: 2x Shield Drone, Weapon support system, Crushing bulk, Heavy rail rifle, Seeker missile

3x Crisis Fireknife Battlesuits (120 pts)
• 1x Crisis Fireknife Shas’vre: Gun Drone, Shield Drone, 2x Missile pod, Battlesuit fists
• 2x Crisis Fireknife Shas’ui: 2 with Gun Drone, Shield Drone, Battlesuit fists, 2x Missile pod

3x Crisis Starscythe Battlesuits (110 pts)
• 1x Crisis Starscythe Shas’vre: Gun Drone, Shield Drone, 2x Burst cannon, Battlesuit fists
• 2x Crisis Starscythe Shas’ui: 2 with Gun Drone, Shield Drone, 2x Burst cannon, Battlesuit fists

3x Crisis Starscythe Battlesuits (110 pts)
• 1x Crisis Starscythe Shas’vre: Gun Drone, Shield Drone, 2x Burst cannon, Battlesuit fists
• 2x Crisis Starscythe Shas’ui: 2 with Gun Drone, Shield Drone, 2x Burst cannon, Battlesuit fists

1x Ghostkeel Battlesuit (160 pts): Ghostkeel fists, Cyclic ion raker, Twin fusion blaster

10x Kroot Carnivores (65 pts)
• 1x Long-quill: Close combat weapon, Kroot pistol, Kroot carbine
• 1x Kroot Carnivore: Close combat weapon, Tanglebomb launcher
• 8x Kroot Carnivores: 8 with Close combat weapon, Kroot rifle

10x Pathfinder Team (90 pts)
• 9x Pathfinders
    6 with Close combat weapon, Pulse carbine, Pulse pistol
    3 with Close combat weapon, Ion rifle, Pulse pistol
• 1x Pathfinder Shas'ui: Gun Drone, Marker Drone, Grav-inhibitor drone, Close combat weapon, Pulse carbine, Pulse pistol, Semi-automatic grenade launcher

10x Pathfinder Team (90 pts)
• 9x Pathfinders
    6 with Close combat weapon, Pulse carbine, Pulse pistol
    3 with Close combat weapon, Ion rifle, Pulse pistol
• 1x Pathfinder Shas'ui: Gun Drone, Marker Drone, Recon drone, Drone burst cannon, Close combat weapon, Pulse carbine, Pulse pistol, Semi-automatic grenade launcher, Drone burst cannon

10x Pathfinder Team (90 pts)
• 9x Pathfinders
    6 with Close combat weapon, Pulse carbine, Pulse pistol
    3 with Close combat weapon, Ion rifle, Pulse pistol
• 1x Pathfinder Shas'ui: Gun Drone, Marker Drone, Recon drone, Drone burst cannon, Close combat weapon, Pulse carbine, Pulse pistol, Semi-automatic grenade launcher, Drone burst cannon

1x Piranhas (60 pts): Armoured hull, 2x Twin pulse carbine, Piranha fusion blaster, 2x Seeker missile

1x Piranhas (60 pts): Armoured hull, 2x Twin pulse carbine, Piranha fusion blaster, 2x Seeker missile

5x Stealth Battlesuits (100 pts)
• 4x Stealth Shas'ui
    3 with Battlesuit fists, Burst cannon
    1 with Battlesuit fists, Fusion blaster
• 1x Stealth Shas'vre: Homing beacon, Marker Drone, Battlesuit fists, Pulse pistol, Fusion blaster

5x Stealth Battlesuits (100 pts)
• 4x Stealth Shas'ui
    3 with Battlesuit fists, Burst cannon
    1 with Battlesuit fists, Fusion blaster
• 1x Stealth Shas'vre: Homing beacon, Marker Drone, Battlesuit fists, Pulse pistol, Fusion blaster`;

// Compact WTC export whose characters name the unit they join on a "Leading:"
// line, and whose enhancements sit on an unlabelled "(+N pts)" line. Adepta
// Sororitas.
export const SORORITAS_LEADING = `+++++++++++++++++++++++++++++++++++++++++++++++
+ FACTION KEYWORD: Imperium - Adepta Sororitas
+ DETACHMENT: Hallowed Martyrs
+ TOTAL ARMY POINTS: 1000pts
+
+ WARLORD: Char1: Canoness with Jump Pack
+ NUMBER OF UNITS: 6
+++++++++++++++++++++++++++++++++++++++++++++++

Char1: 1x Canoness with Jump Pack (80 pts): Blessed Halberd
Enhancement: Divine Aspect (+5 pts)
Leading: Zephyrim Squad

Char2: 1x Palatine (60 pts): Palatine blade
Leading: Battle Sisters Squad

5x Zephyrim Squad (100 pts)
• 1x Zephyrim Superior: Power weapon, Bolt pistol
• 4x Zephyrim: Zephyrim pistol, Sacred banner

10x Battle Sisters Squad (105 pts)
• 1x Sister Superior: Plasma pistol, Power weapon
• 9x Battle Sister: Boltgun, Close combat weapon

Char3: 1x Canoness (70 pts): Blessed halberd
Leading: Battle Sisters Squad

10x Battle Sisters Squad (105 pts)
• 1x Sister Superior: Plasma pistol, Power weapon
• 9x Battle Sister: Boltgun, Close combat weapon`;

// A locale export that separates thousands with a space instead of a comma,
// with an ALLIED UNITS section (the Warhound sits past the 2000 point battle
// size, which is why the title total exceeds the Strike Force line).
export const RED_GEAR_SPACED_POINTS = `Red gear (1\u00a0995 Points)

Tonight on red gear - Kharn gets impaled by a rhino, the lads slaughter each other in gladiatorial combat, and Angron lifts a warhound titan.

World Eaters
Brazen Engines, Butchers of Khorne, and Vessels of Wrath (3 Detachment Points)
Force Dispositions: Disruption, Priority Assets, Purge the Foe
Strike Force (2\u00a0000 Points)

CHARACTERS

Angron (350 Points)
  • 1x Samni’arius and Spinegrinder

Khârn the Betrayer (115 Points)
  • 1x Gorechild
  • 1x Plasma pistol

BATTLELINE

Khorne Berzerkers (345 Points)
  • 1x Khorne Berzerker Champion
     ◦ 1x Chainblade
     ◦ 1x Icon of Khorne
     ◦ 1x Plasma pistol
  • 19x Khorne Berzerker
     ◦ 19x Bolt pistol
     ◦ 19x Chainblade

DEDICATED TRANSPORTS

Chaos Rhino (85 Points)
  • 1x Armoured tracks
  • 1x Combi-bolter

ALLIED UNITS

Chaos Warhound Titan (1\u00a0100 Points)
  • 1x Warhound feet
  • 1x Warhound plasma blastgun
  • 1x Warhound vulcan mega-bolter

Exported with App Version: v2.0.5 (2), Data Version: v886`;
