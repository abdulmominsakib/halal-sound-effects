#!/usr/bin/env node
// Generate sound effects with the ElevenLabs Sound Generation API.
// Requires Node 18+. Reads ELEVENLABS_API_KEY from .env (key needs Sound Effects access).
//
// Catalog mode (default): reads prompts/**/*.json and writes
//   generated/<catalog path>/<name>_<n>.mp3, e.g. generated/app/interaction/tap_1.mp3
// Clips that already exist are skipped, so reruns only fill gaps.
//
//   node scripts/generate.mjs                          # every catalog under prompts/
//   node scripts/generate.mjs prompts/motion           # one folder
//   node scripts/generate.mjs prompts/app/feedback.json --only unlock,lock --force
//
// Single prompt mode:
//   node scripts/generate.mjs --prompt "soft bamboo knock" [-n name] [-d 1.5] [-i 0.5] [-c 3] [--loop]
//
// Catalog entry: { name, prompt, duration?, influence?, count? (default 2), loop?, ...metadata }

import { readFile, writeFile, mkdir, readdir, stat, rm } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const promptsDir = join(root, 'prompts');
const outRoot = join(root, 'generated');
const API = 'https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128';

async function loadEnv() {
  let text;
  try { text = await readFile(join(root, '.env'), 'utf8'); } catch { return; }
  for (const line of text.split('\n')) {
    if (line.trim().startsWith('#')) continue;
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}

const exists = (p) => stat(p).then(() => true, () => false);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findCatalogs(target) {
  const s = await stat(target);
  if (s.isFile()) return [target];
  const out = [];
  for (const e of await readdir(target, { withFileTypes: true })) {
    const p = join(target, e.name);
    if (e.isDirectory()) out.push(...await findCatalogs(p));
    else if (e.name.endsWith('.json')) out.push(p);
  }
  return out.sort();
}

async function request(job, apiKey) {
  const body = { text: job.prompt };
  if (job.duration) body.duration_seconds = Number(job.duration);
  if (job.influence !== undefined && job.influence !== '') body.prompt_influence = Number(job.influence);
  if (job.loop) body.loop = true;

  for (let attempt = 1; ; attempt++) {
    let res;
    try {
      res = await fetch(API, {
        method: 'POST',
        headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(90_000),
      });
    } catch (e) {
      if (attempt < 4) { await sleep(2000 * attempt); continue; }
      throw new Error(`network error: ${e.message}`);
    }
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    const text = (await res.text()).slice(0, 300);
    // 429 = rate / concurrency limit, 5xx = transient. Anything else is final.
    if ((res.status === 429 || res.status >= 500) && attempt < 5) {
      await sleep(3000 * attempt);
      continue;
    }
    throw new Error(`${res.status} ${text}`);
  }
}

async function main() {
  await loadEnv();
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    console.error('ELEVENLABS_API_KEY is missing. Set it in .env.');
    process.exit(1);
  }

  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      prompt: { type: 'string', short: 'p' },
      name: { type: 'string', short: 'n' },
      duration: { type: 'string', short: 'd' },
      influence: { type: 'string', short: 'i' },
      count: { type: 'string', short: 'c' },
      loop: { type: 'boolean' },
      only: { type: 'string' },
      force: { type: 'boolean' },
      jobs: { type: 'string', short: 'j', default: '3' },
    },
  });

  // Each task = one API call that writes one file.
  const tasks = [];
  if (values.prompt) {
    const base = (values.name || values.prompt).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 50);
    const count = Number(values.count || 1);
    for (let i = 1; i <= count; i++) {
      tasks.push({ job: { ...values, loop: values.loop }, file: join(outRoot, `${base}${count > 1 ? `_${i}` : ''}.mp3`) });
    }
  } else {
    const only = values.only ? new Set(values.only.split(',').map((s) => s.trim())) : null;
    const targets = positionals.length ? positionals.map((p) => resolve(p)) : [promptsDir];
    for (const t of targets) {
      for (const catalog of await findCatalogs(t)) {
        const rel = relative(promptsDir, catalog).replace(/\.json$/, '');
        const dir = join(outRoot, rel);
        for (const job of JSON.parse(await readFile(catalog, 'utf8'))) {
          if (only && !only.has(job.name)) continue;
          for (let i = 1; i <= (job.count ?? 2); i++) tasks.push({ job, file: join(dir, `${job.name}_${i}.mp3`) });
        }
      }
    }
  }

  const todo = [];
  for (const t of tasks) {
    if (values.force) await rm(t.file, { force: true });
    else if (await exists(t.file)) continue;
    todo.push(t);
  }
  console.log(`${tasks.length} clips in scope, ${tasks.length - todo.length} already exist, generating ${todo.length}`);

  let failed = 0, done = 0, next = 0;
  async function worker() {
    while (next < todo.length) {
      const { job, file } = todo[next++];
      try {
        const audio = await request(job, apiKey);
        await mkdir(dirname(file), { recursive: true });
        await writeFile(file, audio);
        console.log(`[${++done}/${todo.length}] saved ${relative(root, file)}`);
      } catch (e) {
        failed++;
        console.error(`[failed] ${relative(root, file)}: ${e.message}`);
        if (/quota|credits|missing_permissions|invalid_api_key/i.test(e.message)) {
          console.error('Stopping: this error will repeat for every clip.');
          next = todo.length;
        }
      }
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, Number(values.jobs)) }, worker));
  console.log(`done: ${done} saved, ${failed} failed`);
  if (failed) process.exit(1);
}

main();
