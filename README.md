<div align="center">

# 🌿 Halal Sound Effects

**Free, non-musical UI sound effects for apps, games and motion graphics.**<br>
110 action-mapped sounds made only from nature (water, stone, wood, wind, sand, birds and paper), with no instruments, melodies, chimes or bells.

[![License: MIT](https://img.shields.io/badge/license-MIT-2ea44f)](LICENSE)
[![Sounds](https://img.shields.io/badge/sounds-110%20%2B%20classic%20set-0a7ea4)](#-sound-catalog)
[![Format](https://img.shields.io/badge/format-MP3%20·%2044.1kHz-6e56cf)](#-technical-specifications)
[![jsDelivr](https://data.jsdelivr.com/v1/package/gh/abdulmominsakib/halal-sound-effects/badge)](https://www.jsdelivr.com/package/gh/abdulmominsakib/halal-sound-effects)
[![Agent skill](https://img.shields.io/badge/agent%20skill-Claude%20Code-d97757)](#-add-it-with-an-ai-coding-agent)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](#-contributing)

**[▶ Listen to every sound](https://abdulmominsakib.github.io/halal-sound-effects/)** · [Quick start](#-quick-start) · [Catalog](#-sound-catalog) · [Motion & video](#-motion-graphics--video) · [Agent skill](#-add-it-with-an-ai-coding-agent) · [sounds.json](sounds.json)

</div>

---

**Assalamu alaikum** 🌙 This is a sound library for developers and designers who want their apps to feel alive without music. Every interaction a typical app has (taps, toggles, success, errors, navigation, chat, uploads, alarms) has a sound here. So do Muslim-app moments: Quran page turns, tasbih counters, qibla found, prayer, wudu, iftar and suhoor reminders. All of them are free under the MIT license and served from a CDN.

> *"And in the earth are signs for those who are certain [in faith]."* (Quran 51:20)

## Contents

- [Why natural sounds?](#-why-natural-sounds)
- [Features](#-features)
- [Quick start](#-quick-start)
- [Folder layout](#-folder-layout)
- [Sound catalog](#-sound-catalog)
- [Motion graphics & video](#-motion-graphics--video)
- [Add it with an AI coding agent](#-add-it-with-an-ai-coding-agent)
- [Playback best practices](#-playback-best-practices)
- [How the sounds are made](#%EF%B8%8F-how-the-sounds-are-made)
- [Classic collection](#-classic-collection)
- [White noise & ambience](#-white-noise--ambience)
- [Technical specifications](#-technical-specifications)
- [Contributing](#-contributing)

## 🎯 Why natural sounds?

Many Muslims avoid musical instruments and melodies, and most UI sound kits are built from exactly those: chimes, marimbas, synth blips and jingles. This collection is built only from natural, non-musical sources (the tap of wood, a drop of water, a gust of wind, a page turning). Those sounds are respectful, calm and pleasant for any audience, Muslim or not.

## 🌟 Features

- **110 action-mapped sounds:** 79 app sounds and 31 motion graphics / video sounds, each named after the action it's for (`tap`, `success`, `modal_open`, `counter_tick`, `riser_wind`…)
- **No music, by design:** no instruments, melodies, tuned chimes, bells or synths. Each sound was checked for hidden musical tones.
- **Reviewed, not just generated:** each sound was made in 2–8 variations, and the best was picked after checks for tones, hum, noise, extra hits and lag ([REVIEW.md](REVIEW.md))
- **App-ready:** leveled to a −3 dB peak, trimmed so taps start instantly, mono 44.1 kHz MP3, about 1.8 MB for all 110
- **Machine-readable:** [`sounds.json`](sounds.json) lists every sound's file, use, length, loop flag, suggested haptic and CDN link
- **Free CDN:** every file is served by jsDelivr, so you can hot-link or download it
- **Works everywhere:** Flutter, React Native / Expo, Swift / Kotlin, web, Unity, game engines and video editors
- **AI agent skill:** install the skill and ask Claude Code to add sounds to your app

## 🚀 Quick start

**1. Pick sounds** in the [catalog](#-sound-catalog), or [listen to them all](https://abdulmominsakib.github.io/halal-sound-effects/).

**2. Download them into your project:**

```bash
for s in tap success error toggle_on; do
  curl -sL --create-dirs -o "assets/sounds/$s.mp3" \
    "$(curl -sL https://cdn.jsdelivr.net/gh/abdulmominsakib/halal-sound-effects@main/sounds.json | jq -r ".sounds.$s.url")"
done
```

Or clone everything:

```bash
git clone --depth 1 https://github.com/abdulmominsakib/halal-sound-effects.git
```

**3. Play them.**

<details>
<summary><b>Web</b> (Web Audio API)</summary>

```js
const ctx = new AudioContext();
const cache = {};
async function play(name) {
  if (ctx.state === 'suspended') await ctx.resume();
  cache[name] ??= fetch(`/sounds/${name}.mp3`).then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b));
  const src = ctx.createBufferSource();
  src.buffer = await cache[name];
  src.connect(ctx.destination);
  src.start();
}
button.addEventListener('click', () => play('tap'));
```
</details>

<details>
<summary><b>Flutter</b> (audioplayers)</summary>

```dart
final pool = await AudioPool.createFromAsset(path: 'sounds/tap.mp3', maxPlayers: 3);
ElevatedButton(onPressed: () { pool.start(volume: 0.6); /* ... */ }, child: const Text('Save'));
```
</details>

<details>
<summary><b>React Native / Expo</b> (expo-audio)</summary>

```ts
import { useAudioPlayer } from 'expo-audio';
const tap = useAudioPlayer(require('./assets/sounds/tap.mp3'));
<Pressable onPress={() => { tap.seekTo(0); tap.play(); }} />
```
</details>

The [agent skill](skills/halal-sound-effects/SKILL.md) has full sound-service examples for Flutter, Expo and the web, plus notification-sound setup for iOS and Android.

## 📂 Folder layout

```
app/
├── interaction/   taps, toggles, select, drag & drop, sliders, keyboards
├── feedback/      success, error, warning, info, achievements, lock/unlock, copy, undo
├── navigation/    screens, tabs, modals, bottom sheets, menus, expand/collapse
├── messaging/     send, receive, mentions, reactions, typing, ringtone, voice notes
├── content/       save, add, delete, share, favorite, search, uploads, downloads, loading
├── islamic/       Quran reading, tasbih, prayer & wudu reminders, qibla, dua, iftar, suhoor
└── system/        launch, sign in/out, payments, timers, alarms, connectivity, battery
motion/
├── transitions/   whooshes, swishes, slides, zooms, sand wipe, page curl
├── reveals/       logo stings, text & calligraphy reveals, pops, shimmer, unveil
├── impacts/       soft & deep hits, splashes, bounces, thuds, snaps
└── risers/        wind, water & sand risers, downers, breaths
```

## 🔊 Sound catalog

Click a name to open the file, or [listen to everything on one page](https://abdulmominsakib.github.io/halal-sound-effects/). Every file is also on the CDN:

```
https://cdn.jsdelivr.net/gh/abdulmominsakib/halal-sound-effects@main/<folder>/<sound>.mp3
```

Sounds marked **loop** repeat seamlessly (typing indicator, ringtone, loading). App sounds are high-passed at 120 Hz for phone speakers; motion sounds keep their full low end for video.

<!-- catalog:start -->
### 📱 App sounds (79)

#### Interaction `app/interaction/`

Direct touch feedback: taps, toggles, selection, drag and drop, sliders and keyboards.

| Sound | What it is | Where to use it | Length |
|---|---|---|---|
| [`tap`](app/interaction/tap.mp3) | A single tiny water droplet | Buttons, list items, tabs, chips, cards | 0.45s |
| [`toggle_on`](app/interaction/toggle_on.mp3) | A small pebble dropped into shallow water | Switches and checkboxes turning on | 0.48s |
| [`toggle_off`](app/interaction/toggle_off.mp3) | A pebble lifted out of water | Switches and checkboxes turning off | 0.23s |
| [`select`](app/interaction/select.mp3) | A fingertip tick on a dry leaf | Selecting an option, radio buttons, picking a list item in multi-select | 0.09s |
| [`long_press`](app/interaction/long_press.mp3) | A slow press into wet sand | Long-press menus, press-and-hold to confirm | 0.49s |
| [`swipe`](app/interaction/swipe.mp3) | A hand brushing quickly across smooth sand | Swipe actions on list rows, dismissing cards | 0.42s |
| [`drag_start`](app/interaction/drag_start.mp3) | A pebble lifted from gravel | Picking up an item to drag or reorder | 0.38s |
| [`drop`](app/interaction/drop.mp3) | A pebble set down on sand | Dropping a dragged item into place, reorder complete | 0.39s |
| [`slider_tick`](app/interaction/slider_tick.mp3) | A grain of sand landing on a leaf | Slider and picker detents, scroll wheel ticks | 0.11s |
| [`keyboard_tap`](app/interaction/keyboard_tap.mp3) | A fingertip tap on smooth wood | Custom in-app keyboards, PIN pads, number pads | 0.14s |
| [`pull_release`](app/interaction/pull_release.mp3) | A bent reed springing back | Releasing pull-to-refresh, elastic overscroll release | 0.12s |
| [`scroll_edge`](app/interaction/scroll_edge.mp3) | A muffled bump against wet sand | Reaching the end of a list or carousel | 0.32s |

#### Feedback `app/feedback/`

Results of an action: success, error, warning, info, achievements, lock and unlock, copy and undo.

| Sound | What it is | Where to use it | Length |
|---|---|---|---|
| [`success`](app/feedback/success.mp3) | A bright water drop with a short ripple | Save complete, form submitted, task completed | 0.51s |
| [`error`](app/feedback/error.mp3) | A small stone into soft mud, dull thud | Validation errors, failed requests, wrong input | 0.28s |
| [`warning`](app/feedback/warning.mp3) | A brief soft gust of wind through grass | Before destructive actions, unsaved changes, low storage | 0.68s |
| [`goal_reached`](app/feedback/goal_reached.mp3) | A water drop with a slow spreading ripple | Streak or daily goal reached, dhikr count completed | 1s |
| [`info`](app/feedback/info.mp3) | A neutral water drop in a small cave | Tooltips, hints, neutral toasts, onboarding tips | 0.38s |
| [`denied`](app/feedback/denied.mp3) | Two quick dull taps on wet wood | Action not allowed, disabled button pressed, wrong PIN | 0.11s |
| [`achievement`](app/feedback/achievement.mp3) | A joyful splash with falling droplets | Badges, level up, big milestones, first-time completion | 0.83s |
| [`unlock`](app/feedback/unlock.mp3) | A stone slab sliding open | Unlocking a feature, premium unlocked, biometric unlock | 0.59s |
| [`lock`](app/feedback/lock.mp3) | A stone lid settling closed | Locking content, app lock enabled, private mode | 0.28s |
| [`copy`](app/feedback/copy.mp3) | Two crisp paper rustles | Copied to clipboard, duplicated item | 0.48s |
| [`undo`](app/feedback/undo.mp3) | A breeze pulled backwards | Undo, revert, restore from trash | 0.48s |

#### Navigation `app/navigation/`

Moving around the app: screens, tabs, modals, sheets, menus, expand and collapse.

| Sound | What it is | Where to use it | Length |
|---|---|---|---|
| [`page_forward`](app/navigation/page_forward.mp3) | A soft airy swish moving forward | Pushing a new screen, next step in a wizard, next onboarding page | 0.39s |
| [`page_back`](app/navigation/page_back.mp3) | A soft airy swish moving back | Back navigation, previous step, dismissing a pushed screen | 0.36s |
| [`tab_switch`](app/navigation/tab_switch.mp3) | A pebble rolling one notch on stone | Switching bottom tabs or segmented controls | 0.11s |
| [`modal_open`](app/navigation/modal_open.mp3) | A gentle rising breeze | Opening dialogs, popups, full-screen modals | 0.6s |
| [`modal_close`](app/navigation/modal_close.mp3) | A gentle falling breeze | Closing dialogs, popups, dismissing modals | 0.48s |
| [`sheet_up`](app/navigation/sheet_up.mp3) | Soft cotton cloth sliding up | Bottom sheets and drawers opening | 0.38s |
| [`sheet_down`](app/navigation/sheet_down.mp3) | Soft cotton cloth settling down | Bottom sheets and drawers closing | 0.38s |
| [`expand`](app/navigation/expand.mp3) | A large leaf unfurling | Expanding accordions, show more, opening a details panel | 0.6s |
| [`collapse`](app/navigation/collapse.mp3) | A leaf folding closed | Collapsing accordions, show less, closing a details panel | 0.48s |
| [`menu_open`](app/navigation/menu_open.mp3) | A small bird's wings lifting off | Opening menus, popovers, the side drawer | 0.4s |

#### Messaging `app/messaging/`

Chat and calls: send, receive, mentions, reactions, typing, ringtones and voice notes.

| Sound | What it is | Where to use it | Length |
|---|---|---|---|
| [`send`](app/messaging/send.mp3) | A quick airy breeze whoosh moving away | Message sent, item shared, comment posted | 0.27s |
| [`receive`](app/messaging/receive.mp3) | A soft droplet landing in a basin | Incoming chat message while the conversation is open | 0.21s |
| [`notification`](app/messaging/notification.mp3) | A single songbird chirp | New in-app notification, reminder, badge update | 0.6s |
| [`mention`](app/messaging/mention.mp3) | Two quick bright bird chirps | You were mentioned or replied to, direct message | 0.6s |
| [`reaction`](app/messaging/reaction.mp3) | A tiny water bubble pop | Like, react, emoji reaction, upvote | 0.48s |
| [`typing`](app/messaging/typing.mp3) | Light fingertip taps on wood (loop) | Typing indicator while the other person types, loops while visible | 2.25s · loop |
| [`call_incoming`](app/messaging/call_incoming.mp3) | Calm repeating water drops (loop) | Incoming voice or video call ringtone, loops until answered | 3s · loop |
| [`call_connected`](app/messaging/call_connected.mp3) | A soft splash of a stream starting | Call answered or connected | 0.51s |
| [`call_end`](app/messaging/call_end.mp3) | A single muted stone tap | Call ended, left a voice room | 0.15s |
| [`voice_record_start`](app/messaging/voice_record_start.mp3) | A bubble rising and popping | Start recording a voice note | 0.24s |
| [`voice_record_stop`](app/messaging/voice_record_stop.mp3) | A short soft drip ending | Stop recording a voice note | 0.44s |

#### Content `app/content/`

Working with items: save, add, delete, share, favorite, search, uploads, downloads and loading.

| Sound | What it is | Where to use it | Length |
|---|---|---|---|
| [`delete`](app/content/delete.mp3) | Water swirling down a stone basin | Delete, remove, clear, archive | 0.45s |
| [`refresh`](app/content/refresh.mp3) | A short stream trickle over pebbles | Pull to refresh, sync complete, reload content | 0.68s |
| [`trash_empty`](app/content/trash_empty.mp3) | Dry leaves swept and crumpled | Empty trash, clear all, delete many items | 0.47s |
| [`save`](app/content/save.mp3) | A stone placed firmly on stone | Save, apply changes, settings stored | 0.24s |
| [`favorite`](app/content/favorite.mp3) | A quick soft wing flap | Favorite, bookmark an item, add to wishlist | 0.26s |
| [`share`](app/content/share.mp3) | A breeze carrying a leaf away | Opening the share sheet, link shared | 0.6s |
| [`add`](app/content/add.mp3) | A pebble dropped into a clay bowl | Add to list, add to cart, create new item | 0.34s |
| [`download_complete`](app/content/download_complete.mp3) | Water filling a small cup | Download finished, offline content ready | 0.43s |
| [`upload_complete`](app/content/upload_complete.mp3) | A bubble rising and releasing | Upload finished, backup complete, post published | 0.6s |
| [`search`](app/content/search.mp3) | Leaves being parted | Opening search, filters applied | 0.42s |
| [`camera_shutter`](app/content/camera_shutter.mp3) | A quick dry twig snap | Taking a photo, screenshot, scan captured | 0.08s |
| [`loading_loop`](app/content/loading_loop.mp3) | A steady gentle stream (loop) | Long loading, processing or syncing; loops until done | 4s · loop |

#### Islamic `app/islamic/`

For Muslim apps: Quran reading, tasbih counters, prayer and wudu reminders, qibla, dua, iftar and suhoor.

| Sound | What it is | Where to use it | Length |
|---|---|---|---|
| [`page_turn`](app/islamic/page_turn.mp3) | A soft paper page turn | Quran, hadith and book readers, mushaf page swipes | 0.6s |
| [`counter_tick`](app/islamic/counter_tick.mp3) | Two stone tasbih beads clicking | Tasbih / dhikr counter increment, steppers | 0.48s |
| [`counter_round`](app/islamic/counter_round.mp3) | Several tasbih beads sliding together | Completing a round of 33 in a tasbih counter | 0.64s |
| [`prayer_reminder`](app/islamic/prayer_reminder.mp3) | A gentle stream with a breeze through leaves | Salah time reminders, scheduled local notifications | 2.47s |
| [`quran_open`](app/islamic/quran_open.mp3) | A book cover gently opened | Opening the mushaf or a book, starting a reading session | 0.31s |
| [`quran_close`](app/islamic/quran_close.mp3) | A book gently closed | Closing the mushaf or a book, ending a reading session | 0.16s |
| [`bookmark`](app/islamic/bookmark.mp3) | A cloth ribbon laid between pages | Bookmarking an ayah, page or hadith | 0.48s |
| [`prayer_mat`](app/islamic/prayer_mat.mp3) | A prayer rug unrolled | Starting a prayer, prayer mode on, marking a prayer as prayed | 0.54s |
| [`qibla_found`](app/islamic/qibla_found.mp3) | A clear drop into a deep well | Compass aligned with the qibla | 0.73s |
| [`dua_complete`](app/islamic/dua_complete.mp3) | A long soft breeze through palm leaves | Finishing a dua, adhkar or reading session | 1.89s |
| [`wudu_reminder`](app/islamic/wudu_reminder.mp3) | Water flowing into a basin | Wudu reminders, ablution guide steps | 1.37s |
| [`iftar`](app/islamic/iftar.mp3) | Water poured into a clay cup | Iftar time, fast completed, Ramadan countdown finished | 1.37s |
| [`suhoor_alarm`](app/islamic/suhoor_alarm.mp3) | Early birds waking by a stream | Suhoor and tahajjud alarms, gentle wake-up | 2.78s |

#### System `app/system/`

App-level events: launch, sign in and out, payments, timers, alarms, connectivity and battery.

| Sound | What it is | Where to use it | Length |
|---|---|---|---|
| [`app_launch`](app/system/app_launch.mp3) | A soft breeze swelling and settling | Splash screen, first launch, app ready | 1.14s |
| [`sign_in`](app/system/sign_in.mp3) | A wooden door latch opening | Signed in, account created, welcome back | 0.39s |
| [`sign_out`](app/system/sign_out.mp3) | A wooden door closing gently | Signed out, session ended | 0.24s |
| [`payment_success`](app/system/payment_success.mp3) | Two coins placed on a wooden table | Payment complete, sadaqah or zakat donation sent, purchase confirmed | 0.61s |
| [`timer_end`](app/system/timer_end.mp3) | Three steady water drops | Timer or countdown finished, focus session over | 0.98s |
| [`alarm_gentle`](app/system/alarm_gentle.mp3) | A soft dawn chorus slowly rising | Wake-up alarms, scheduled reminders that need attention | 4.87s |
| [`connection_lost`](app/system/connection_lost.mp3) | A breeze dying out | Went offline, connection lost, sync paused | 0.72s |
| [`connection_restored`](app/system/connection_restored.mp3) | A small stream starting to flow | Back online, connection restored, sync resumed | 0.77s |
| [`low_battery`](app/system/low_battery.mp3) | Slow water drips running dry | Low battery, storage almost full, quota almost reached | 0.89s |
| [`screenshot`](app/system/screenshot.mp3) | A quick soft paper snap | Screenshot captured, share card created | 0.26s |

### 🎬 Motion graphics & video (31)

#### Transitions `motion/transitions/`

For motion graphics and video: whooshes, swishes, slides, zooms, wipes and page curls.

| Sound | What it is | Where to use it | Length |
|---|---|---|---|
| [`whoosh_short`](motion/transitions/whoosh_short.mp3) | A short fast air whoosh | Quick cuts, icons flying in, fast UI animations | 0.39s |
| [`whoosh_medium`](motion/transitions/whoosh_medium.mp3) | A medium sweeping air whoosh | Scene transitions, cards sweeping across, title cards | 1.2s |
| [`whoosh_long`](motion/transitions/whoosh_long.mp3) | A long slow wind sweep | Slow scene changes, opening shots, chapter transitions | 2.26s |
| [`swish_fast`](motion/transitions/swish_fast.mp3) | A very fast thin swish | Text flicks, quick swipes, fast motion blur moments | 0.32s |
| [`slide_in`](motion/transitions/slide_in.mp3) | Fabric sliding in | Panels, lower thirds and captions sliding in | 0.6s |
| [`slide_out`](motion/transitions/slide_out.mp3) | Fabric sliding out | Panels, lower thirds and captions sliding out | 0.55s |
| [`zoom_in`](motion/transitions/zoom_in.mp3) | Wind rushing closer | Camera push-ins, zooming into a detail | 0.86s |
| [`zoom_out`](motion/transitions/zoom_out.mp3) | Wind pulling away | Camera pull-backs, zooming out to an overview | 0.9s |
| [`sand_wipe`](motion/transitions/sand_wipe.mp3) | A sweep of blowing sand | Wipe transitions, revealing the next scene | 0.76s |
| [`page_curl`](motion/transitions/page_curl.mp3) | A large paper page flipping | Page-curl transitions, storybook and calendar flips | 0.71s |

#### Reveals `motion/reveals/`

For motion graphics and video: logo stings, text and calligraphy reveals, pops, shimmer and unveils.

| Sound | What it is | Where to use it | Length |
|---|---|---|---|
| [`logo_reveal_water`](motion/reveals/logo_reveal_water.mp3) | A deep drop with a wide ripple | Logo stings, intro and outro cards, app splash videos | 1.57s |
| [`logo_reveal_wind`](motion/reveals/logo_reveal_wind.mp3) | A gust sweeping in, then calm | Logo stings, intro cards, title reveals | 2.01s |
| [`logo_reveal_sand`](motion/reveals/logo_reveal_sand.mp3) | Sand pouring, then scattered by wind | Logo stings, desert or heritage themed reveals | 2.69s |
| [`text_appear`](motion/reveals/text_appear.mp3) | A quick pen stroke on paper | Words or captions appearing, kinetic typography | 0.4s |
| [`calligraphy_write`](motion/reveals/calligraphy_write.mp3) | A reed qalam writing on paper | Arabic calligraphy animations, handwriting reveals, signatures | 2.29s |
| [`shimmer`](motion/reveals/shimmer.mp3) | Delicate trickling fine sand | Highlights, glows, sparkle or shine effects without chimes | 1.2s |
| [`pop_in`](motion/reveals/pop_in.mp3) | A quick water bubble pop | Icons, stickers and badges popping into view | 0.25s |
| [`pop_out`](motion/reveals/pop_out.mp3) | A soft suction pop | Icons, stickers and badges disappearing | 0.48s |
| [`unveil`](motion/reveals/unveil.mp3) | A cloth pulled away | Product reveals, before/after, unveiling a feature | 0.68s |

#### Impacts `motion/impacts/`

For motion graphics and video: soft and deep hits, splashes, bounces, thuds and snaps.

| Sound | What it is | Where to use it | Length |
|---|---|---|---|
| [`impact_soft`](motion/impacts/impact_soft.mp3) | A sack of sand landing | Elements landing, soft hits on beat-free edits | 0.55s |
| [`impact_deep`](motion/impacts/impact_deep.mp3) | A large stone dropped on earth | Title slams, big reveals, dramatic emphasis | 0.9s |
| [`impact_water`](motion/impacts/impact_water.mp3) | A big stone splashing into a lake | Splash transitions, water-themed emphasis | 1.48s |
| [`bounce`](motion/impacts/bounce.mp3) | A pebble bouncing twice on wood | Bouncy UI animations, elements settling with a bounce | 0.48s |
| [`thud_wood`](motion/impacts/thud_wood.mp3) | A soft wooden block thud | Blocks stacking, boxes landing, step-by-step builds | 0.11s |
| [`snap`](motion/impacts/snap.mp3) | A crisp branch snap | Snapping into place, hard cuts, emphasis on a word | 0.23s |

#### Risers `motion/risers/`

For motion graphics and video: natural wind, water and sand risers, downers and breaths. No synths.

| Sound | What it is | Where to use it | Length |
|---|---|---|---|
| [`riser_wind`](motion/risers/riser_wind.mp3) | Wind building to a strong gust | Building anticipation before a reveal or a big moment | 2.95s |
| [`riser_water`](motion/risers/riser_water.mp3) | Rushing water swelling | Building anticipation, water-themed intros | 3.38s |
| [`riser_sand`](motion/risers/riser_sand.mp3) | A rising sandstorm hiss | Building anticipation, desert-themed intros | 2.57s |
| [`downer_wind`](motion/risers/downer_wind.mp3) | A strong gust fading to stillness | After a reveal, endings, calming down after a peak | 3s |
| [`breath_in`](motion/risers/breath_in.mp3) | A calm deep inhale of air through leaves | A beat before a reveal, mindfulness and breathing animations | 1.75s |
| [`breath_out`](motion/risers/breath_out.mp3) | A calm long exhale of breeze | Relaxing after a peak, breathing exercises, outros | 2.15s |

<!-- catalog:end -->

## 🎬 Motion graphics & video

The `motion/` sounds are for motion graphics, app promo videos, onboarding animations, Lottie / Rive animations, presentations and social clips. Use them in After Effects, Premiere Pro, DaVinci Resolve, Final Cut, CapCut or any other editor.

- **Line them up on the visual:** a whoosh peaks in its middle, so start it a little before the motion. Impacts, pops and snaps hit on their first frame.
- **Build a reveal:** a riser leads into an impact or a logo sting, and then a downer or `breath_out` lets the moment settle.
- **Islamic content:** `calligraphy_write` (a reed qalam on paper) suits Arabic calligraphy animations. `page_curl` and `page_turn` suit Quran and book content.
- **Keep it halal:** don't put a music bed under them. For atmosphere, use the [white noise & ambience](#-white-noise--ambience) loops at a low volume.
- **In-app animations:** the same files work for Lottie or Rive animations inside an app. Play them from code at the animation's marker.

## 🤖 Add it with an AI coding agent

This repo ships an agent skill, [`skills/halal-sound-effects/SKILL.md`](skills/halal-sound-effects/SKILL.md), for Claude Code and other agents that read skills. With it installed, the agent will:
- read your app and map its real actions to sounds, showing you the map before changing anything;
- download only the sounds you need into your assets;
- build one sound service for Flutter, React Native / Expo, native iOS / Android or web;
- add a setting to turn sounds off;
- set up looping sounds, and notification sounds for prayer and suhoor alarms.

Install it with the [skills CLI](https://github.com/vercel-labs/skills):

```bash
npx skills add abdulmominsakib/halal-sound-effects
```

Or copy it into Claude Code's skills folder:

```bash
curl -sL --create-dirs -o ~/.claude/skills/halal-sound-effects/SKILL.md https://raw.githubusercontent.com/abdulmominsakib/halal-sound-effects/main/skills/halal-sound-effects/SKILL.md
```

Then ask: *"Add halal sound effects to this app."*

## 🎧 Playback best practices

- **Preload and bundle.** Ship sounds with the app instead of streaming them, so they play instantly and offline.
- **Don't interrupt other audio.** Mix with it, so a user's Quran recitation or podcast keeps playing. On iOS use the `ambient` audio session; on Android don't take audio focus for UI sounds.
- **Respect the user.** Follow the silent switch and Do Not Disturb, add an in-app on/off setting, and play at a modest volume (0.5–0.7).
- **Less is more.** No sound on scrolling, every keystroke or screen load. Save sounds for meaningful moments.
- **Pair with haptics.** Each sound in `sounds.json` has a suggested haptic (`light`, `selection`, `success`…).

## 🛠️ How the sounds are made

Every sound in `app/` and `motion/` was generated with the ElevenLabs Sound Effects API from the prompts in [`prompts/`](prompts/). Each prompt names a natural source and says "no music". The pipeline then reviewed and picked the best version of each sound.

1. Put `ELEVENLABS_API_KEY=...` in `.env`. The key needs **Sound Effects** access.
2. Generate. Clips that already exist are skipped, so reruns only fill gaps:
   ```bash
   node scripts/generate.mjs
   ```
   Pass a folder or file (`prompts/motion`) to limit it. Add `--only name1,name2 --force` to redo specific sounds.
3. Review and publish. This picks the best variation of each sound, writes it into `app/` and `motion/`, and updates `sounds.json`, `REVIEW.md` and the catalog in this README:
   ```bash
   node scripts/build.mjs
   ```
   Use `--dry-run` to see the review without changing anything.

To add a sound, add an entry to the right `prompts/<group>/<category>.json` file (`name`, `description`, `use`, `prompt`, `duration`), then run both steps. `.env` and `generated/` are git-ignored. The build needs Node 18+ and ffmpeg.

## 📁 Classic collection

The original hand-picked set of 28 short sounds, kept as it was. Some of them, such as `stone_chime` and the glass clinks, have a ringing tone. If you want to avoid all tonal sounds, use the `app/` set instead.

### 🖱️ Tap & Click Sounds
Gentle interaction feedback for buttons, links, and app elements.

```
tap_click/
├── light_wooden_knock.mp3
├── stone_pebble_tap.mp3
├── two_wooden_taps.mp3
├── bamboo_knock_1.mp3
├── bamboo_knock_2.mp3
└── low_hollow_knock.mp3
```

### ✅ Success & Confirmation
Positive feedback sounds for successful actions and confirmations.

```
success_confirmation/
├── crystal_glass_clink.mp3
├── ceramic_bowl_tap.mp3
├── stone_chime.mp3
├── glass_tap_sparkle_1.mp3
└── glass_tap_sparkle_2.mp3
```

### ⚠️ Error & Alert
Subtle notification sounds for errors, warnings, and alerts.

```
error_alert/
├── low_wooden_thud.mp3
├── two_muted_knocks.mp3
├── downward_stone_tap.mp3
├── spark_crackle.mp3
└── hollow_shell_tap.mp3
```

### 🔔 Notifications
Gentle notification sounds for messages, updates, and reminders.

```
notification/
├── water_drop.mp3
├── bird_chirp.mp3
├── cricket_chirp.mp3
├── dolphin_click_1.mp3
└── dolphin_click_2.mp3
```

### 🔄 Transition & Loading
Smooth transition sounds for loading states, page changes, and animations.

```
transition_loading/
├── soft_whoosh.mp3
├── gentle_whoosh.mp3
├── rustling_leaves.mp3
├── sand_pour_1.mp3
├── sand_pour_2.mp3
├── upward_swoosh.mp3
└── swipe_effect.mp3
```

<details>
<summary><b>Direct download links for the classic collection</b></summary>

### 🖱️ Tap & Click Sounds
- [light_wooden_knock.mp3](tap_click/light_wooden_knock.mp3) - Gentle wooden knock sound
- [stone_pebble_tap.mp3](tap_click/stone_pebble_tap.mp3) - Natural stone pebble tap
- [two_wooden_taps.mp3](tap_click/two_wooden_taps.mp3) - Two consecutive wooden taps
- [bamboo_knock_1.mp3](tap_click/bamboo_knock_1.mp3) - First bamboo knock variation
- [bamboo_knock_2.mp3](tap_click/bamboo_knock_2.mp3) - Second bamboo knock variation
- [low_hollow_knock.mp3](tap_click/low_hollow_knock.mp3) - Low hollow knock sound

### ✅ Success & Confirmation
- [crystal_glass_clink.mp3](success_confirmation/crystal_glass_clink.mp3) - Crystal glass clinking sound
- [ceramic_bowl_tap.mp3](success_confirmation/ceramic_bowl_tap.mp3) - Ceramic bowl tap
- [stone_chime.mp3](success_confirmation/stone_chime.mp3) - Natural stone chime
- [glass_tap_sparkle_1.mp3](success_confirmation/glass_tap_sparkle_1.mp3) - First glass sparkle variation
- [glass_tap_sparkle_2.mp3](success_confirmation/glass_tap_sparkle_2.mp3) - Second glass sparkle variation

### ⚠️ Error & Alert
- [low_wooden_thud.mp3](error_alert/low_wooden_thud.mp3) - Low wooden thud sound
- [two_muted_knocks.mp3](error_alert/two_muted_knocks.mp3) - Two muted knock sounds
- [downward_stone_tap.mp3](error_alert/downward_stone_tap.mp3) - Downward stone tap
- [spark_crackle.mp3](error_alert/spark_crackle.mp3) - Spark crackle effect
- [hollow_shell_tap.mp3](error_alert/hollow_shell_tap.mp3) - Hollow shell tap

### 🔔 Notifications
- [water_drop.mp3](notification/water_drop.mp3) - Gentle water drop sound
- [bird_chirp.mp3](notification/bird_chirp.mp3) - Natural bird chirp
- [cricket_chirp.mp3](notification/cricket_chirp.mp3) - Cricket chirping sound
- [dolphin_click_1.mp3](notification/dolphin_click_1.mp3) - First dolphin click variation
- [dolphin_click_2.mp3](notification/dolphin_click_2.mp3) - Second dolphin click variation

### 🔄 Transition & Loading
- [soft_whoosh.mp3](transition_loading/soft_whoosh.mp3) - Soft whoosh transition
- [gentle_whoosh.mp3](transition_loading/gentle_whoosh.mp3) - Gentle whoosh effect
- [rustling_leaves.mp3](transition_loading/rustling_leaves.mp3) - Rustling leaves sound
- [sand_pour_1.mp3](transition_loading/sand_pour_1.mp3) - First sand pour variation
- [sand_pour_2.mp3](transition_loading/sand_pour_2.mp3) - Second sand pour variation
- [upward_swoosh.mp3](transition_loading/upward_swoosh.mp3) - Upward swoosh effect
- [swipe_effect.mp3](transition_loading/swipe_effect.mp3) - Swipe transition effect

</details>

## 🌊 White noise & ambience

Long, continuous background loops for focus, sleep, meditation, or as atmosphere under videos.

- [Airplane](white_sounds/airplane/airplane.mp3)
- [Bubbles](white_sounds/bubbles/bubbles.mp3)
- [Campfire](white_sounds/campfire/campfire.mp3)
- [Coffeeshop](white_sounds/coffeeshop/coffeeshop.mp3)
- [Desert](white_sounds/desert/desert.mp3)
- [Fire](white_sounds/fire/fire.mp3)
- [Fireplace](white_sounds/fireplace/fireplace.mp3)
- [Forest](white_sounds/forest/forest.mp3)
- **Keyboard**
  - [backspace.mp3](white_sounds/keyboard/backspace.mp3)
  - [key-01.mp3](white_sounds/keyboard/key-01.mp3)
  - [key-02.mp3](white_sounds/keyboard/key-02.mp3)
  - [key-03.mp3](white_sounds/keyboard/key-03.mp3)
  - [key-04.mp3](white_sounds/keyboard/key-04.mp3)
  - [key-05.mp3](white_sounds/keyboard/key-05.mp3)
  - [space.mp3](white_sounds/keyboard/space.mp3)
- [Leaves](white_sounds/leaves/leaves.mp3)
- [Ocean Waves](white_sounds/ocean-waves/ocean-waves.mp3)
- [Rain and Thunder](white_sounds/rain-and-thunder/rain-and-thunder.mp3)
- [Rain Low](white_sounds/rain-low/rain-low.mp3)
- [Rain on Umbrella](white_sounds/rain-on-umbrella/rain-on-umbrella.mp3)
- [Rain Tent](white_sounds/rain-tent/rain-tent.mp3)
- [River Stream](white_sounds/river-stream/river-stream.mp3)
- [Space Engine](white_sounds/space-engine/space-engine.mp3)
- [Summer Nights](white_sounds/summer-nights/summer-nights.mp3)
- [Thunderstorm](white_sounds/thunderstorm/thunderstorm.mp3)
- [Train](white_sounds/train/train.mp3)
- [Tropical Forest](white_sounds/tropical-forest/tropical-forest.mp3)
- [Underwater](white_sounds/underwater/underwater.mp3)
- [Washing Machine](white_sounds/washing-machine/washing-machine.mp3)
- [Water Stream](white_sounds/water-stream/water-stream.mp3)
- [Waterfall](white_sounds/waterfall/waterfall.mp3)
- [Waves](white_sounds/waves/waves.mp3)
- [Wind](white_sounds/wind/wind.mp3)
- [Wind Howling](white_sounds/wind-howling/wind-howling.mp3)

## 📊 Technical specifications

**`app/` and `motion/`** (generated and reviewed)
- **Format:** MP3, 128 kbps, mono, 44.1 kHz
- **Level:** −3 dBFS peak; app sounds high-passed at 120 Hz
- **Duration:** most UI sounds 0.1–0.6s; reminders, alarms, loops and motion sounds 1–5s
- **Total:** 110 sounds (79 app, 31 motion), about 1.8 MB

**Classic collection**
- **Format:** MP3, 44.1 kHz, 16-bit
- **Duration:** 0.2–0.7s
- **Total:** 28 sound effects, plus the white noise and ambience loops

## 🤝 Contributing

Contributions are warmly welcome. The Prophet Muhammad ﷺ said: *"The best of people are those who are most beneficial to people."*

1. **Fork** the repository and create a branch (`git checkout -b feature/new-sound`)
2. **Add a sound**, either by adding a prompt to `prompts/` and running the [pipeline](#%EF%B8%8F-how-the-sounds-are-made), or by adding a recorded file with a matching `prompts/` entry
3. **Test** it in a real app or video
4. **Open a pull request** that says what the sound is and where it's meant to be used

**Sound guidelines**
- Natural sources only: water, wood, stone, wind, sand, leaves, birds, paper, cloth
- No instruments, melodies, tuned chimes, bells, jingles or synth risers
- UI sounds short (under 0.7s), starting right on the sound with no lead-in
- Consistent level (−3 dB peak) and descriptive, action-based file names

Ideas, bug reports and sound requests are welcome as [issues](../../issues).

## 📄 License

MIT. Free for personal and commercial apps, games and videos. See [LICENSE](LICENSE). Attribution is appreciated, but not required.

## 🙏 Acknowledgments

- **Alhamdulillah**: all praise is due to Allah for the beauty of natural sounds
- Sounds in `app/` and `motion/` were generated with [ElevenLabs](https://elevenlabs.io) Sound Effects
- Thanks to everyone who uses, shares and contributes to this collection

---

<div align="center">

**"Whoever guides someone to goodness will have a reward like the one who did it."** (Prophet Muhammad ﷺ)

Made with duas for better user experiences. If this helps you, please ⭐ the repo so others can find it.

</div>
