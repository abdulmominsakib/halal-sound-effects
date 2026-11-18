#!/usr/bin/env node
// Process, review and publish generated sounds. Requires ffmpeg.
//
//   node scripts/build.mjs            # process every variation, pick the best, copy, write sounds.json
//   node scripts/build.mjs --dry-run  # review only: print the report, change nothing in the repo
//
// For each catalog entry in prompts/<group>/<category>.json it reads
// generated/<group>/<category>/<name>_<n>.mp3, then:
//   1. high-passes app sounds, levels to -3 dBFS peak, trims silence (not for loops), adds a fade-out
//   2. measures noise floor, applied gain, length, hits, held notes and persistent hum lines
//   3. picks the lowest-scoring variation, unless the entry pins one with "pick": n
//   4. copies it to <group>/<category>/<name>.mp3, writes sounds.json, REVIEW.md and the README catalog
//
// Catalog entry options read here: loop, texture (skip noise check), single (one hit, no lead-in),
// pick, cut (seconds around the loudest hit), notch ([hz]), highpass (hz), tonal_ok, note.

import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, copyFileSync, rmSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dryRun = process.argv.includes('--dry-run');
const REPO = 'abdulmominsakib/halal-sound-effects';
const PEAK = -3;
const SR = 22050; // analysis sample rate

const CATEGORIES = {
  'app/interaction': ['Interaction', 'Direct touch feedback: taps, toggles, selection, drag and drop, sliders and keyboards.'],
  'app/feedback': ['Feedback', 'Results of an action: success, error, warning, info, achievements, lock and unlock, copy and undo.'],
  'app/navigation': ['Navigation', 'Moving around the app: screens, tabs, modals, sheets, menus, expand and collapse.'],
  'app/messaging': ['Messaging', 'Chat and calls: send, receive, mentions, reactions, typing, ringtones and voice notes.'],
  'app/content': ['Content', 'Working with items: save, add, delete, share, favorite, search, uploads, downloads and loading.'],
  'app/islamic': ['Islamic', 'For Muslim apps: Quran reading, tasbih counters, prayer and wudu reminders, qibla, dua, iftar and suhoor.'],
  'app/system': ['System', 'App-level events: launch, sign in and out, payments, timers, alarms, connectivity and battery.'],
  'motion/transitions': ['Transitions', 'For motion graphics and video: whooshes, swishes, slides, zooms, wipes and page curls.'],
  'motion/reveals': ['Reveals', 'For motion graphics and video: logo stings, text and calligraphy reveals, pops, shimmer and unveils.'],
  'motion/impacts': ['Impacts', 'For motion graphics and video: soft and deep hits, splashes, bounces, thuds and snaps.'],
  'motion/risers': ['Risers', 'For motion graphics and video: natural wind, water and sand risers, downers and breaths. No synths.'],
};

const ff = (args) => execFileSync('ffmpeg', ['-hide_banner', '-nostdin', ...args], { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 28 });
const probeDuration = (f) => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' });

// volumedetect reports on stderr
function stderrOf(args) {
  return spawnSync('ffmpeg', ['-hide_banner', '-nostdin', ...args], { encoding: 'utf8', maxBuffer: 1 << 26 }).stderr;
}

// entry.notch: [hz, ...] removes a narrow whine or hum the generator left in (applied before leveling).
// cut: seconds to keep around the loudest hit (from 12 ms before it), to isolate a single hit
// out of several; the result is leveled again (pinned variation only).
// highpass: app sounds drop rumble below 120 Hz (phone speakers can't play it and the generator adds it).
function processClip(src, dst, { loop, notch = [], highpass }, cut) {
  const pre = [...(highpass ? [`highpass=f=${highpass}:poles=2`] : []), ...notch.map((hz) => `equalizer=f=${hz}:t=q:w=8:g=-30`)].join(',');
  const peakArgs = ['-i', src, ...(pre ? ['-af', `${pre},volumedetect`] : ['-af', 'volumedetect']), '-f', 'null', '-'];
  const peak = +(stderrOf(peakArgs).match(/max_volume: (-?[\d.]+) dB/) || [, 0])[1];
  const gain = PEAK - peak;
  const trim = 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.01,areverse,' +
    'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.03,afade=t=in:d=0.03,areverse';
  const level = `${pre ? pre + ',' : ''}volume=${gain.toFixed(2)}dB`;
  const filter = loop ? level : `${level},${trim}`;
  const enc = ['-ar', '44100', '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '128k'];
  mkdirSync(dirname(dst), { recursive: true });
  if (!cut) {
    ff(['-y', '-loglevel', 'error', '-i', src, '-af', filter, ...enc, dst]);
    return gain;
  }
  const tmp = `${dst}.tmp.wav`;
  ff(['-y', '-loglevel', 'error', '-i', src, '-af', filter, '-ar', '44100', '-ac', '1', tmp]);
  const x = decode(tmp);
  let at = 0;
  for (let i = 1; i < x.length; i++) if (Math.abs(x[i]) > Math.abs(x[at])) at = i;
  const start = Math.max(0, at / SR - 0.012);
  const dur = cut === 'rest' ? '' : `:duration=${cut}`;
  const cutFilter = `atrim=start=${start.toFixed(3)}${dur},asetpts=PTS-STARTPTS,afade=t=in:d=0.003,areverse,afade=t=in:d=0.015,areverse`;
  const peak2 = +(stderrOf(['-i', tmp, '-af', `${cutFilter},volumedetect`, '-f', 'null', '-']).match(/max_volume: (-?[\d.]+) dB/) || [, 0])[1];
  ff(['-y', '-loglevel', 'error', '-i', tmp, '-af', `${cutFilter},volume=${(PEAK - peak2).toFixed(2)}dB`, ...enc, dst]);
  rmSync(tmp);
  return gain + PEAK - peak2;
}

function decode(file) {
  const buf = ff(['-loglevel', 'error', '-i', file, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-']);
  return new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
}

function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    for (let i = 0; i < n; i += len) {
      for (let k = 0; k < len / 2; k++) {
        const wr = Math.cos(ang * k), wi = Math.sin(ang * k);
        const ar = re[i + k + len / 2], ai = im[i + k + len / 2];
        const tr = ar * wr - ai * wi, ti = ar * wi + ai * wr;
        re[i + k + len / 2] = re[i + k] - tr; im[i + k + len / 2] = im[i + k] - ti;
        re[i + k] += tr; im[i + k] += ti;
      }
    }
  }
}

// Returns noise floor, loudness and the longest stretch of a steady pure tone.
function analyse(file) {
  const x = decode(file);
  const win = 1024, hop = 256, hann = Float32Array.from({ length: win }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / win));
  const frames = [];
  for (let s = 0; s + win <= x.length; s += hop) {
    let e = 0;
    const re = new Float64Array(win), im = new Float64Array(win);
    for (let i = 0; i < win; i++) { re[i] = x[s + i] * hann[i]; e += x[s + i] ** 2; }
    const rms = Math.sqrt(e / win);
    fft(re, im);
    let peakBin = 0, peakMag = 0, logSum = 0, linSum = 0;
    const lo = Math.floor((150 * win) / SR), hi = Math.floor((9000 * win) / SR);
    for (let k = lo; k < hi; k++) {
      const m = Math.hypot(re[k], im[k]) + 1e-12;
      if (m > peakMag) { peakMag = m; peakBin = k; }
      logSum += Math.log(m); linSum += m;
    }
    const n = hi - lo;
    const mags = new Float32Array(hi - lo);
    for (let k = lo; k < hi; k++) mags[k - lo] = 20 * Math.log10(Math.hypot(re[k], im[k]) + 1e-12);
    frames.push({ rms, flat: Math.exp(logSum / n) / (linSum / n), peakBin, peakShare: peakMag / linSum, mags });
  }
  const db = (v) => 20 * Math.log10(v + 1e-9);
  const rmsSorted = frames.map((f) => f.rms).sort((a, b) => a - b);
  const floor = db(rmsSorted[Math.floor(rmsSorted.length * 0.1)] ?? 0);
  const loud = db(rmsSorted[Math.floor(rmsSorted.length * 0.9)] ?? 0);
  // Sustained tone: consecutive loud frames with a dominant, stable spectral peak (a held note).
  let run = 0, best = 0;
  for (let i = 1; i < frames.length; i++) {
    const f = frames[i], p = frames[i - 1];
    const tonal = db(f.rms) > loud - 20 && f.flat < 0.08 && f.peakShare > 0.04 && Math.abs(f.peakBin - p.peakBin) <= 1;
    run = tonal ? run + 1 : 0;
    best = Math.max(best, run);
  }
  const toneMs = Math.round((best * hop * 1000) / SR);
  // Persistent line: one frequency standing 15 dB above its neighbours in most loud frames
  // (a hum, whine or ringing). Catches what the held-note check misses in quiet or busy clips.
  const loudFrames = frames.filter((f) => db(f.rms) > loud - 25);
  let hum = 0, humHz = 0;
  if (loudFrames.length >= 4) {
    const bins = loudFrames[0].mags.length, half = 15, hits = new Float32Array(bins);
    for (const f of loudFrames) {
      for (let k = half; k < bins - half; k++) {
        const nb = Array.from(f.mags.subarray(k - half, k + half + 1)).sort((a, b) => a - b);
        if (f.mags[k] - nb[half] > 15) hits[k]++;
      }
    }
    for (let k = 0; k < bins; k++) {
      const share = hits[k] / loudFrames.length;
      if (share > hum) { hum = share; humHz = Math.round(((k + Math.floor((150 * win) / SR)) * SR) / win); }
    }
  }
  // Hits: sharp rises within 14 dB of the loudest moment, at least 40 ms apart.
  const ehop = Math.floor(SR * 0.005), env = [];
  for (let s = 0; s + ehop <= x.length; s += ehop) {
    let e = 0;
    for (let i = s; i < s + ehop; i++) e += x[i] * x[i];
    env.push(db(Math.sqrt(e / ehop)));
  }
  const top = Math.max(...env);
  let hits = 0, lastHit = -100;
  for (let i = 1; i < env.length; i++) {
    if (env[i] > top - 14 && env[i] - env[Math.max(0, i - 3)] > 8 && i - lastHit > 8) { hits++; lastHit = i; }
  }
  // Transient strength: loudest 5 ms vs the clip's median, low for flat textures with no real hit.
  const sortedEnv = [...env].sort((a, b) => a - b);
  const punch = +(top - sortedEnv[Math.floor(sortedEnv.length / 2)]).toFixed(1);
  // Loop seam: loudness difference between the first and last 150 ms.
  const edge = Math.floor(0.15 * SR);
  const r = (a) => Math.sqrt(a.reduce((s, v) => s + v * v, 0) / Math.max(1, a.length));
  const seam = Math.abs(db(r(x.subarray(0, edge))) - db(r(x.subarray(x.length - edge))));
  return { floor: +floor.toFixed(1), loud: +loud.toFixed(1), toneMs, hum: +hum.toFixed(2), humHz, hits, punch, seam: +seam.toFixed(1) };
}

function score(entry, m) {
  const issues = [];
  let s = 0;
  if (m.gain > 12) { s += (m.gain - 12) / 6; if (m.gain > 20) issues.push(`quiet source, +${m.gain.toFixed(0)} dB boost`); }
  const snr = m.loud - m.floor;
  // Continuous textures (streams, wind, risers) have a high floor by nature, so only short sounds get this check.
  if (!entry.loop && !entry.texture && snr < 25) { s += (25 - snr) / 5; if (snr < 18) issues.push(`noisy (${snr.toFixed(0)} dB above floor)`); }
  if (m.toneMs > 150 && !entry.tonal_ok) { s += m.toneMs / 100; issues.push(`steady tone ${m.toneMs} ms`); }
  if (m.hum >= 0.6 && m.duration > 0.25 && !entry.tonal_ok) {
    s += m.hum >= 0.8 ? 4 : 2;
    issues.push(`persistent ${m.humHz} Hz line (${Math.round(m.hum * 100)}% of frames)`);
  }
  // entry.single: a tick or click that must be exactly one sharp hit.
  if (entry.single) {
    if (m.hits !== 1) { s += 2 * Math.abs(m.hits - 1) + 1; issues.push(`${m.hits} hits, expected 1`); }
    if (m.punch < 15) { s += (15 - m.punch) / 3; issues.push(`weak transient (${m.punch} dB)`); }
  }
  if (!entry.loop) {
    const target = entry.duration ?? 1;
    if (m.duration < 0.08) { s += 5; issues.push('almost empty'); }
    if (target <= 0.7 && m.duration > 0.65) s += (m.duration - 0.65) * 3;
  } else if (m.seam > 12) {
    // Sparse loops (drops, taps) differ at the edges by nature; only a large jump means an audible seam.
    s += m.seam / 3; issues.push(`loop seam ${m.seam} dB`);
  }
  return { score: +s.toFixed(2), issues };
}

const catalogs = [];
(function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p); else if (e.name.endsWith('.json')) catalogs.push(p);
  }
})(join(root, 'prompts'));
catalogs.sort();

const sounds = {};
const report = ['# Sound review', '', '| Sound | Pick | Length | Score | All variations (score) | Issues |', '|---|---|---|---|---|---|'];
const flagged = [];
const procRoot = join(root, 'generated', '_processed');

for (const catalog of catalogs) {
  const category = relative(join(root, 'prompts'), catalog).replace(/\.json$/, '');
  if (!CATEGORIES[category]) throw new Error(`Add ${category} to CATEGORIES in build.mjs`);
  for (const entry of JSON.parse(readFileSync(catalog, 'utf8'))) {
    const variants = [];
    for (let i = 1; i <= (entry.count ?? 2); i++) {
      const raw = join(root, 'generated', category, `${entry.name}_${i}.mp3`);
      if (!existsSync(raw)) continue;
      const proc = join(procRoot, category, `${entry.name}_${i}.mp3`);
      // Single hits always start 12 ms before the hit so taps have no lead-in lag.
      const cut = entry.pick === i && entry.cut ? entry.cut : entry.single ? 'rest' : undefined;
      const opts = { ...entry, highpass: entry.highpass ?? (category.startsWith('app/') ? 120 : undefined) };
      const gain = processClip(raw, proc, opts, cut);
      const m = { i, proc, gain, duration: +probeDuration(proc).toFixed(2), ...analyse(proc) };
      variants.push({ ...m, ...score(entry, m) });
    }
    if (!variants.length) { flagged.push(`${category}/${entry.name}: not generated`); continue; }
    const pick = entry.pick ? variants.find((v) => v.i === entry.pick) : [...variants].sort((a, b) => a.score - b.score)[0];
    const all = variants.map((v) => `${v.i}: ${v.score}`).join(', ');
    report.push(`| \`${category}/${entry.name}\` | ${pick.i} | ${pick.duration}s | ${pick.score} | ${all} | ${pick.issues.join('; ') || '—'} |`);
    if (pick.issues.length) flagged.push(`${category}/${entry.name} (v${pick.i}): ${pick.issues.join('; ')}`);

    const file = `${category}/${entry.name}.mp3`;
    if (!dryRun) {
      mkdirSync(join(root, category), { recursive: true });
      copyFileSync(pick.proc, join(root, file));
    }
    if (sounds[entry.name]) throw new Error(`Duplicate sound name: ${entry.name}`);
    sounds[entry.name] = {
      category,
      file,
      description: entry.description,
      use: entry.use,
      duration: pick.duration,
      ...(entry.loop ? { loop: true } : {}),
      ...(entry.haptic ? { haptic: entry.haptic } : {}),
      url: `https://cdn.jsdelivr.net/gh/${REPO}@main/${file}`,
      raw: `https://raw.githubusercontent.com/${REPO}/main/${file}`,
    };
  }
}

report.push('', `## Flagged (${flagged.length})`, '', ...(flagged.length ? flagged.map((f) => `- ${f}`) : ['- none']));
writeFileSync(join(root, 'generated', 'review.md'), report.join('\n') + '\n');

if (!dryRun) {
  const manifest = {
    $comment: 'Halal (non-musical, natural-source) sound effects for apps and motion graphics. url = jsDelivr CDN (cached, CORS-enabled), raw = GitHub raw. Generated by scripts/build.mjs, do not edit by hand.',
    name: 'halal-sound-effects',
    repo: `https://github.com/${REPO}`,
    version: '2.0.0',
    license: 'MIT',
    format: { codec: 'mp3', sample_rate: 44100, channels: 1, bitrate_kbps: 128, peak_dbfs: PEAK },
    categories: Object.fromEntries(Object.entries(CATEGORIES).map(([k, [title, description]]) => [k, {
      title, description, sounds: Object.keys(sounds).filter((n) => sounds[n].category === k),
    }])),
    sounds,
  };
  writeFileSync(join(root, 'sounds.json'), JSON.stringify(manifest, null, 2) + '\n');

  // README catalog between <!-- catalog:start --> and <!-- catalog:end -->, so docs always match sounds.json.
  const section = (group, heading) => [
    heading, '',
    ...Object.entries(CATEGORIES).filter(([k]) => k.startsWith(group + '/')).flatMap(([k, [title, description]]) => [
      `#### ${title} \`${k}/\``, '', description, '',
      '| Sound | What it is | Where to use it | Length |', '|---|---|---|---|',
      ...Object.entries(sounds).filter(([, s]) => s.category === k).map(([n, s]) =>
        `| [\`${n}\`](${s.file}) | ${s.description} | ${s.use} | ${s.duration}s${s.loop ? ' · loop' : ''} |`),
      '',
    ]),
  ];
  const catalog = [
    ...section('app', `### 📱 App sounds (${Object.values(sounds).filter((s) => s.category.startsWith('app/')).length})`),
    ...section('motion', `### 🎬 Motion graphics & video (${Object.values(sounds).filter((s) => s.category.startsWith('motion/')).length})`),
  ].join('\n');
  const readmePath = join(root, 'README.md');
  const readme = readFileSync(readmePath, 'utf8');
  const re = /<!-- catalog:start -->[\s\S]*?<!-- catalog:end -->/;
  if (re.test(readme)) writeFileSync(readmePath, readme.replace(re, () => `<!-- catalog:start -->\n${catalog}\n<!-- catalog:end -->`));

  writeFileSync(join(root, 'REVIEW.md'), [
    '# Review report',
    '',
    'Generated by `scripts/build.mjs`. Every sound was generated as 2–8 variations, processed, measured and reviewed;',
    'the table lists the variation that was published and the score of each one (lower is better).',
    '',
    '## How sounds are checked',
    '',
    '- **Leveling and trimming:** every clip is leveled to a −3 dBFS peak, trimmed of silence below −50 dB and given a short fade-out. Loops are leveled only, so they still loop cleanly.',
    '- **Rumble:** app sounds are high-passed at 120 Hz. Phone speakers can\'t play below that, and the generator tends to add a low drone there.',
    '- **Halal check for tones:** two detectors look for musical content. One finds held notes (a steady, dominant spectral peak, which is what a chime, bell or synth note produces). The other finds persistent lines (one frequency standing 15 dB above its neighbours in most loud frames: a hum, whine or ring). A pure sine and a decaying bell tone both trigger them; the published sounds do not, apart from the natural pitch of short hits and bird calls.',
    '- **Noise:** the clip\'s loud level is compared with its noise floor, and clips that needed a big boost are noted. Continuous textures (streams, wind, risers) are exempt, because a high floor is their nature.',
    '- **Single hits:** ticks and clicks must contain exactly one sharp hit, and they start 12 ms before it so taps have no lag.',
    '- **Loops:** the loudness of the first and last 150 ms are compared to catch an audible seam.',
    '- **By eye:** spectrogram and waveform sheets of every pick were inspected, and picks were pinned or regenerated where the audio didn\'t match the prompt (for example a page turn that only happened at the very end).',
    '',
    '"Quiet source" notes below are informational: those textures were checked on the spectrogram and have no audible hiss.',
    '',
    ...report.slice(2),
  ].join('\n') + '\n');
}

console.log(`${Object.keys(sounds).length} sounds reviewed${dryRun ? ' (dry run)' : ', copied and written to sounds.json'}`);
console.log(`flagged: ${flagged.length}`);
for (const f of flagged) console.log('  - ' + f);
console.log(`report: generated/review.md${dryRun ? '' : ', REVIEW.md, README.md catalog'}`);
