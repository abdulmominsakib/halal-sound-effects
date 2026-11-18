---
name: halal-sound-effects
description: Add halal (non-musical, natural-source) sound effects to an app or a motion graphics / video project. 110 sounds mapped to actions such as tap, toggle, select, success, error, navigation, modals, chat, ringtone, delete, upload, Quran page turn, tasbih counter, prayer and suhoor alarms, plus whooshes, logo stings, impacts and risers for video. Use when the user wants to add sound effects, UI or interaction sounds, audio feedback, click or tap sounds, notification sounds or ringtones to a Flutter, React Native, Expo, iOS, Android or web app; when they want sound effects for animations, Lottie / Rive, promo videos or motion graphics; especially for Muslim or Islamic apps; or when they mention halal sounds or sounds without music.
---

# Halal Sound Effects

Natural-source sound effects (water, stone, wood, wind, sand, birds, paper, cloth) with no instruments, melodies, chimes or bells, from https://github.com/abdulmominsakib/halal-sound-effects. Every sound was generated in several variations and reviewed for hidden tones, hum and noise.

## Source of truth

Fetch the manifest first. It lists every sound with its category, the action it is for, where to use it, its length, whether it loops, a suggested haptic, and its download URLs:

```
https://cdn.jsdelivr.net/gh/abdulmominsakib/halal-sound-effects@main/sounds.json
```

Each entry looks like this: `sounds.<name> = { category, file, description, use, duration, loop?, haptic?, url, raw }`. `categories.<category>` gives a title, description and the list of sound names in it. Read the manifest to choose sounds: the overview below is only a summary.

| Category | Sounds |
|---|---|
| `app/interaction` | `tap`, `toggle_on`, `toggle_off`, `select`, `long_press`, `swipe`, `drag_start`, `drop`, `slider_tick`, `keyboard_tap`, `pull_release`, `scroll_edge` |
| `app/feedback` | `success`, `error`, `warning`, `goal_reached`, `info`, `denied`, `achievement`, `unlock`, `lock`, `copy`, `undo` |
| `app/navigation` | `page_forward`, `page_back`, `tab_switch`, `modal_open`, `modal_close`, `sheet_up`, `sheet_down`, `expand`, `collapse`, `menu_open` |
| `app/messaging` | `send`, `receive`, `notification`, `mention`, `reaction`, `typing` (loop), `call_incoming` (loop), `call_connected`, `call_end`, `voice_record_start`, `voice_record_stop` |
| `app/content` | `delete`, `refresh`, `trash_empty`, `save`, `favorite`, `share`, `add`, `download_complete`, `upload_complete`, `search`, `camera_shutter`, `loading_loop` (loop) |
| `app/islamic` | `page_turn`, `counter_tick`, `counter_round`, `prayer_reminder`, `quran_open`, `quran_close`, `bookmark`, `prayer_mat`, `qibla_found`, `dua_complete`, `wudu_reminder`, `iftar`, `suhoor_alarm` |
| `app/system` | `app_launch`, `sign_in`, `sign_out`, `payment_success`, `timer_end`, `alarm_gentle`, `connection_lost`, `connection_restored`, `low_battery`, `screenshot` |
| `motion/transitions` | `whoosh_short`, `whoosh_medium`, `whoosh_long`, `swish_fast`, `slide_in`, `slide_out`, `zoom_in`, `zoom_out`, `sand_wipe`, `page_curl` |
| `motion/reveals` | `logo_reveal_water`, `logo_reveal_wind`, `logo_reveal_sand`, `text_appear`, `calligraphy_write`, `shimmer`, `pop_in`, `pop_out`, `unveil` |
| `motion/impacts` | `impact_soft`, `impact_deep`, `impact_water`, `bounce`, `thud_wood`, `snap` |
| `motion/risers` | `riser_wind`, `riser_water`, `riser_sand`, `downer_wind`, `breath_in`, `breath_out` |

## Workflow (apps)

1. **Find the actions.** Read the app's code and list the real interaction points: buttons, toggles, form submits, API errors, navigation, chat, deletes, counters, timers. Map each one to a manifest sound. Show the user this map before wiring anything, and leave out sounds the app doesn't need. Fewer, well-placed sounds beat a sound on everything.
2. **Bundle the files.** Download only the mapped sounds into the app's assets. Don't stream them at play time, because UI sounds must play instantly and offline. Use each sound's `url` (jsDelivr), save it under its sound name, and keep the MIT license notice. Examples:
   - Flutter: `assets/sounds/<name>.mp3`, plus an `assets:` entry in `pubspec.yaml`
   - React Native / Expo: `assets/sounds/<name>.mp3`
   - Web: `public/sounds/<name>.mp3`
   - iOS (native): add the files to the app bundle. Android (native): `res/raw/<name>.mp3`
   ```bash
   curl -sL https://cdn.jsdelivr.net/gh/abdulmominsakib/halal-sound-effects@main/sounds.json -o /tmp/sounds.json
   for s in tap success error counter_tick; do
     curl -sL --create-dirs -o "assets/sounds/$s.mp3" "$(jq -r ".sounds.$s.url" /tmp/sounds.json)"
   done
   ```
3. **Create one sound service.** Write a single `SoundService` / `useSound` module that preloads the sounds once and exposes `play(action)`. Don't scatter player code across widgets or components.
4. **Wire the call sites.** Add `play(action)` at the mapped points. Pair it with the manifest's `haptic` hint where the platform supports it.
5. **Add a setting.** Add a "Sound effects" on/off toggle, saved with the app's existing settings store and on by default unless the user says otherwise. If the app already has a settings screen, put the toggle there.

## Playback rules

- Preload every sound at startup. Use a low-latency player: a sound pool or low-latency mode on mobile, an `AudioBuffer` on web.
- Mix with other audio, never interrupt it. Don't stop the user's Quran recitation, podcast or music. On iOS use the `ambient` audio session category, which also respects the silent switch. On Android don't request audio focus for UI sounds.
- Respect the device: obey silent / Do Not Disturb and the in-app toggle, and play UI sounds at a modest volume (about 0.5–0.7).
- Don't overuse them. No sound on scroll, on every keystroke, or on screen load. Throttle repeated taps to one sound per ~60 ms, but let `counter_tick` play on every count.
- Web browsers block audio until the user interacts, so create or resume the `AudioContext` on the first tap.
- Prefer `goal_reached` over `success` when a counter or streak finishes, and play `counter_round` every 33 counts, so two sounds never play together.
- Sounds with `loop: true` (`typing`, `call_incoming`, `loading_loop`) must be played on a looping player and stopped explicitly: when typing stops, the call is answered, or loading ends. Never put them in a one-shot pool.

## Workflow (motion graphics and video)

For animations, promo videos, onboarding videos, social clips, or Lottie / Rive animations, use the `motion/*` categories, plus app sounds where an on-screen UI action is shown.
- **Timing:** a whoosh peaks in its middle, so start it a little before the motion. Impacts, pops and snaps hit on their first frame. A riser leads into an impact or a `logo_reveal_*`, and a `downer_wind` or `breath_out` lets the moment settle.
- **Video editors:** download the files and place them on the timeline.
- **Lottie / Rive / code-driven animations:** play the sound from code at the animation's marker or state change, using the same sound service as the app.
- **Halal rule:** no music bed under the video. For atmosphere, use the repo's `white_sounds/` ambience loops (rain, forest, stream, wind and so on) at a low volume.

## Platform snippets

**Flutter** ([`audioplayers`](https://pub.dev/packages/audioplayers); `AudioPool` gives low-latency, overlapping playback):

```dart
import 'package:audioplayers/audioplayers.dart';

class SoundService {
  SoundService._();
  static final instance = SoundService._();
  static const _actions = ['tap', 'success', 'error', 'counter_tick']; // only the mapped ones
  final _pools = <String, AudioPool>{};
  bool enabled = true;

  Future<void> init() async {
    await AudioPlayer.global.setAudioContext(AudioContextConfig(
      respectSilence: true, focus: AudioContextConfigFocus.mixWithOthers,
    ).build());
    for (final a in _actions) {
      _pools[a] = await AudioPool.createFromAsset(path: 'sounds/$a.mp3', maxPlayers: 3);
    }
  }

  void play(String action) {
    if (enabled) _pools[action]?.start(volume: 0.6);
  }
}
```

**React Native / Expo** (`expo-audio`):

```ts
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

const files = { tap: require('../assets/sounds/tap.mp3'), success: require('../assets/sounds/success.mp3') };
const players = Object.fromEntries(Object.entries(files).map(([k, f]) => [k, createAudioPlayer(f)]));
setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' });

export function play(action: keyof typeof files, enabled = true) {
  const p = players[action];
  if (!enabled || !p) return;
  p.volume = 0.6;
  p.seekTo(0);
  p.play();
}
```

**Web** (Web Audio API):

```ts
const ctx = new AudioContext();
const buffers = new Map<string, AudioBuffer>();
export async function preload(actions: string[]) {
  await Promise.all(actions.map(async (a) => {
    const res = await fetch(`/sounds/${a}.mp3`);
    buffers.set(a, await ctx.decodeAudioData(await res.arrayBuffer()));
  }));
}
export function play(action: string, volume = 0.6) {
  const buf = buffers.get(action);
  if (!buf || localStorage.getItem('sfx') === 'off') return;
  if (ctx.state === 'suspended') ctx.resume();
  const src = ctx.createBufferSource();
  const gain = ctx.createGain();
  gain.gain.value = volume;
  src.buffer = buf;
  src.connect(gain).connect(ctx.destination);
  src.start();
}
```

## Notification and alarm sounds (`prayer_reminder`, `notification`, `suhoor_alarm`, `alarm_gentle`, `wudu_reminder`, `iftar`, `call_incoming`)

The OS plays system notifications, not your app's player, so the file has to be in a format and place the platform accepts:
- **iOS:** convert to `.caf` or `.wav` (under 30s) in the app bundle, and set the file name as the notification's `sound`.
  ```bash
  afconvert -f caff -d LEI16 prayer_reminder.mp3 prayer_reminder.caf
  ```
- **Android:** put the file in `res/raw/prayer_reminder.mp3` and set it on the **notification channel** (from Android 8 on, a channel's sound can't change after it's created, so use a new channel ID if you change it).
- With `flutter_local_notifications`, use `RawResourceAndroidNotificationSound('prayer_reminder')` and `DarwinNotificationDetails(sound: 'prayer_reminder.caf')`.

## Halal guideline

Every sound in this set is non-musical. When you add sounds the set doesn't cover, keep to natural sources (water, wood, stone, wind, sand, birds, paper, cloth). Don't add instruments, bells, chimes tuned to notes, melodies, jingles or synth risers, and don't replace these sounds with the platform's default chimes. If the set has no fitting sound, pick the closest sound and tell the user, rather than adding a musical one.
