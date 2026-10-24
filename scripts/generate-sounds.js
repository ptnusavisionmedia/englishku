// Synthesises the app's cartoon sound effects as small mono 16-bit WAV files in assets/sounds.
// Run: node scripts/generate-sounds.js   (no audio library needed; everything is computed here)
const fs = require('fs');
const path = require('path');

const SR = 22050;
const TAU = Math.PI * 2;
const outDir = path.join(__dirname, '..', 'assets', 'sounds');

const track = (seconds) => new Float32Array(Math.ceil(seconds * SR));

/** One pitched voice with an optional exponential pitch slide. */
function tone(buf, { t = 0, f, f2 = f, d, wave = 'sine', vol = 0.5, attack = 0.004, decay }) {
  const start = Math.floor(t * SR);
  const n = Math.floor(d * SR);
  const k = decay ?? 4.5 / d;
  let phase = 0;
  for (let i = 0; i < n && start + i < buf.length; i++) {
    const p = i / n;
    const time = i / SR;
    phase += (TAU * f * Math.pow(f2 / f, p)) / SR;
    let s;
    if (wave === 'tri') s = (2 / Math.PI) * Math.asin(Math.sin(phase));
    else if (wave === 'soft') s = Math.sin(phase) + 0.25 * Math.sin(3 * phase);
    else s = Math.sin(phase);
    const env =
      Math.min(1, time / attack) * Math.exp(-time * k) * Math.min(1, (n - i) / (SR * 0.01));
    buf[start + i] += s * env * vol;
  }
}

/** Glassy bell: a few inharmonic partials with a shared decay. */
function bell(buf, { t = 0, f, d = 0.4, vol = 0.4 }) {
  [
    [1, 1],
    [2.76, 0.35],
    [5.4, 0.12],
  ].forEach(([m, a]) => tone(buf, { t, f: f * m, d, vol: vol * a, attack: 0.002, decay: 7 / d }));
}

/** Airy whoosh / click made of low-passed noise. */
function noise(buf, { t = 0, d, vol = 0.3, from = 0.05, to = 0.5 }) {
  const start = Math.floor(t * SR);
  const n = Math.floor(d * SR);
  let y = 0;
  for (let i = 0; i < n && start + i < buf.length; i++) {
    const p = i / n;
    const cutoff = from + (to - from) * Math.sin(p * Math.PI);
    y += cutoff * (Math.random() * 2 - 1 - y);
    buf[start + i] += y * Math.sin(p * Math.PI) * vol * 2;
  }
}

function save(name, buf) {
  let peak = 0;
  for (const v of buf) peak = Math.max(peak, Math.abs(v));
  const gain = peak > 0 ? 0.85 / peak : 1;
  const data = Buffer.alloc(44 + buf.length * 2);
  data.write('RIFF', 0);
  data.writeUInt32LE(36 + buf.length * 2, 4);
  data.write('WAVEfmt ', 8);
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20);
  data.writeUInt16LE(1, 22);
  data.writeUInt32LE(SR, 24);
  data.writeUInt32LE(SR * 2, 28);
  data.writeUInt16LE(2, 32);
  data.writeUInt16LE(16, 34);
  data.write('data', 36);
  data.writeUInt32LE(buf.length * 2, 40);
  buf.forEach((v, i) =>
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v * gain)) * 32767), 44 + i * 2),
  );
  fs.writeFileSync(path.join(outDir, `${name}.wav`), data);
  console.log(
    `${name}.wav  ${(buf.length / SR).toFixed(2)}s  ${(data.length / 1024).toFixed(0)} KB`,
  );
}

const sounds = {
  tap: (b) => {
    tone(b, { f: 720, f2: 520, d: 0.09, wave: 'tri', vol: 0.55 });
    tone(b, { f: 1500, d: 0.04, vol: 0.15 });
  },
  pop: (b) => tone(b, { f: 300, f2: 950, d: 0.12, vol: 0.6 }),
  tab: (b) => {
    tone(b, { f: 880, d: 0.06, wave: 'tri', vol: 0.45 });
    tone(b, { t: 0.045, f: 1175, d: 0.08, wave: 'tri', vol: 0.45 });
  },
  swipe: (b) => noise(b, { d: 0.22, vol: 0.4, from: 0.04, to: 0.4 }),
  back: (b) => tone(b, { f: 640, f2: 380, d: 0.11, vol: 0.55 }),
  toggle: (b) => {
    tone(b, { f: 1000, d: 0.035, wave: 'soft', vol: 0.35 });
    tone(b, { t: 0.03, f: 700, d: 0.06, wave: 'soft', vol: 0.35 });
  },
  heart: (b) => {
    tone(b, { f: 520, f2: 780, d: 0.09, vol: 0.5 });
    tone(b, { t: 0.09, f: 660, f2: 1040, d: 0.14, vol: 0.5 });
  },
  correct: (b) =>
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      bell(b, { t: i * 0.075, f, d: 0.35, vol: 0.5 }),
    ),
  // Soft, friendly "boop-boop": never harsh for small children.
  wrong: (b) => {
    tone(b, { f: 330, f2: 240, d: 0.22, vol: 0.5, decay: 9 });
    tone(b, { t: 0.2, f: 260, f2: 190, d: 0.3, vol: 0.45, decay: 8 });
  },
  star: (b) => {
    bell(b, { f: 1568, d: 0.6, vol: 0.55 });
    tone(b, { f: 2350, d: 0.3, vol: 0.12, decay: 10 });
  },
  win: (b) => {
    [392, 523.25, 659.25, 783.99].forEach((f, i) => bell(b, { t: i * 0.13, f, d: 0.45, vol: 0.5 }));
    [523.25, 659.25, 783.99, 1046.5].forEach((f) => bell(b, { t: 0.55, f, d: 1.0, vol: 0.28 }));
  },
  badge: (b) =>
    [659, 784, 988, 1175, 1319, 1568, 1976, 2349].forEach((f, i) =>
      bell(b, { t: i * 0.06, f, d: 0.3, vol: 0.38 }),
    ),
  flip: (b) => {
    noise(b, { d: 0.06, vol: 0.3, from: 0.15, to: 0.6 });
    tone(b, { f: 260, f2: 180, d: 0.06, vol: 0.4 });
  },
  match: (b) => {
    bell(b, { f: 784, d: 0.3, vol: 0.5 });
    bell(b, { t: 0.09, f: 1175, d: 0.4, vol: 0.5 });
  },
  tile: (b) => {
    tone(b, { f: 950, f2: 700, d: 0.04, vol: 0.5 });
    tone(b, { f: 480, d: 0.06, vol: 0.25 });
  },
  'rec-start': (b) => {
    tone(b, { f: 520, f2: 620, d: 0.08, vol: 0.5 });
    tone(b, { t: 0.09, f: 780, f2: 900, d: 0.12, vol: 0.5 });
  },
  'rec-stop': (b) => {
    tone(b, { f: 780, f2: 640, d: 0.08, vol: 0.5 });
    tone(b, { t: 0.09, f: 520, f2: 420, d: 0.12, vol: 0.5 });
  },
  intro: (b) => {
    tone(b, { f: 280, f2: 1250, d: 0.35, vol: 0.4, decay: 3 });
    [659.25, 783.99, 1046.5, 1318.5].forEach((f, i) =>
      bell(b, { t: 0.38 + i * 0.1, f, d: 0.6, vol: 0.45 }),
    );
  },
  logout: (b) =>
    [783.99, 659.25, 523.25].forEach((f, i) => bell(b, { t: i * 0.12, f, d: 0.4, vol: 0.45 })),
};

const lengths = {
  wrong: 0.6,
  match: 0.55,
  swipe: 0.25,
  win: 1.7,
  badge: 0.9,
  intro: 1.4,
  star: 0.65,
  logout: 0.8,
  correct: 0.7,
};

fs.mkdirSync(outDir, { recursive: true });
for (const [name, make] of Object.entries(sounds)) {
  const buf = track(lengths[name] ?? 0.4);
  make(buf);
  save(name, buf);
}
