// Hollywood-trailer intro sound design, synthesised live with the Web Audio API
// (no audio files, nothing to license). Big, dark and cinematic:
//   riser + "suck-back" silence → massive BRAAM with sub drop and long tail →
//   heavy whoosh-hits with taiko-like thuds → dark metallic ticks →
//   low power surge → tension drone with heartbeat pulses → reverse swell into
//   the final title hit.
//
// Browsers keep audio suspended until the visitor interacts with the page;
// every cue checks that the context is running, so nothing piles up while
// blocked. Call fx.unlock() from any click/tap/key to start sound.

export function createSfx() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  let ctx;
  try {
    ctx = new AC();
  } catch {
    return null;
  }

  const master = ctx.createGain();
  master.gain.value = 0.85;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.knee.value = 10;
  comp.ratio.value = 5;
  comp.attack.value = 0.002;
  comp.release.value = 0.3;
  master.connect(comp).connect(ctx.destination);

  // long, dark cinematic hall
  const reverb = ctx.createConvolver();
  reverb.buffer = impulse(ctx, 4.8, 2.2);
  const darken = ctx.createBiquadFilter();
  darken.type = 'lowpass';
  darken.frequency.value = 4200;
  const wet = ctx.createGain();
  wet.gain.value = 0.42;
  reverb.connect(darken).connect(wet).connect(master);

  const noise = noiseBuffer(ctx, 3);
  const satCurve = saturation(2.2);

  let muted = false;
  const live = () => ctx.state === 'running' && !muted;
  const now = () => ctx.currentTime + 0.012;

  const out = (node, { pan = 0, send = 0.35 } = {}) => {
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
    if (p.pan) p.pan.value = pan;
    node.connect(p);
    p.connect(master);
    if (send) {
      const s = ctx.createGain();
      s.gain.value = send;
      p.connect(s).connect(reverb);
    }
    return p;
  };
  const noiseSrc = (t, dur) => {
    const s = ctx.createBufferSource();
    s.buffer = noise;
    s.loop = true;
    s.start(t, Math.random() * 2);
    s.stop(t + dur + 0.1);
    return s;
  };
  const env = (g, t, a, peak, d) => {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  };
  const osc = (type, f, t, dur) => {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    o.start(t);
    o.stop(t + dur);
    return o;
  };

  // low "taiko" thud with a click on top
  const thud = (t, size = 1, pan = 0) => {
    const o = osc('sine', 110 * (1.1 - size * 0.25), t, 1.4);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.45);
    const g = ctx.createGain();
    env(g, t, 0.004, 0.75 * size, 0.9);
    o.connect(g);
    out(g, { pan: pan * 0.3, send: 0.45 });
    const n = noiseSrc(t, 0.12);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1800;
    const ng = ctx.createGain();
    env(ng, t, 0.002, 0.35 * size, 0.08);
    n.connect(lp).connect(ng);
    out(ng, { pan, send: 0.5 });
  };

  // the BRAAM: distorted low brass cluster opening then closing, sub drop, boom tail
  const braam = (t, level = 1) => {
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.Q.value = 2;
    lp.frequency.setValueAtTime(260, t);
    lp.frequency.exponentialRampToValueAtTime(1600 * level, t + 0.18);
    lp.frequency.exponentialRampToValueAtTime(140, t + 3.6);
    const pre = ctx.createGain();
    pre.gain.value = 0.55;
    const drive = ctx.createWaveShaper();
    drive.curve = satCurve;
    drive.oversample = '2x';
    const g = ctx.createGain();
    env(g, t, 0.035, 0.36 * level, 3.8);
    pre.connect(drive);
    drive.connect(lp);
    lp.connect(g);
    out(g, { send: 0.6 });
    [43.65, 43.9, 65.4, 87.3, 87.9, 130.8].forEach((f, i) => {
      const o = osc(i % 2 ? 'square' : 'sawtooth', f, t, 4.2);
      o.frequency.setValueAtTime(f * 0.97, t);
      o.frequency.exponentialRampToValueAtTime(f, t + 0.25);
      o.connect(pre);
    });
    // sub drop
    const sub = osc('sine', 140, t, 2.4);
    sub.frequency.exponentialRampToValueAtTime(28, t + 1.1);
    const sg = ctx.createGain();
    env(sg, t, 0.006, 1.0 * level, 2.0);
    sub.connect(sg);
    out(sg, { send: 0.08 });
    // impact boom + metallic shimmer in the tail
    const n = noiseSrc(t, 3.2);
    const nlp = ctx.createBiquadFilter();
    nlp.type = 'lowpass';
    nlp.frequency.setValueAtTime(3800, t);
    nlp.frequency.exponentialRampToValueAtTime(120, t + 2.8);
    const ng = ctx.createGain();
    env(ng, t, 0.003, 0.7 * level, 2.6);
    n.connect(nlp).connect(ng);
    out(ng, { send: 0.75 });
    [311, 466, 698].forEach((f, i) => {
      const o = osc('sine', f, t, 3);
      const og = ctx.createGain();
      env(og, t + 0.05, 0.3, 0.025 * level, 2.4 - i * 0.4);
      o.connect(og);
      out(og, { pan: [-0.5, 0.5, 0][i], send: 0.9 });
    });
  };

  const fx = {
    ctx,
    get running() {
      return ctx.state === 'running';
    },
    unlock() {
      if (ctx.state !== 'running') ctx.resume?.();
    },
    setMuted(m) {
      muted = m;
      master.gain.setTargetAtTime(m ? 0 : 0.85, ctx.currentTime, 0.05);
    },

    /** Energy line racing in: rising tension swell, cut to silence ("suck-back") before the hit. */
    riser(dur = 0.72) {
      if (!live()) return;
      const t = now();
      const n = noiseSrc(t, dur);
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 2;
      bp.frequency.setValueAtTime(180, t);
      bp.frequency.exponentialRampToValueAtTime(4800, t + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.5, t + dur - 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur - 0.01);
      n.connect(bp).connect(g);
      out(g, { send: 0.3 });
      // rising string-like cluster
      [110, 110.7, 164.8].forEach((f) => {
        const o = osc('sawtooth', f, t, dur);
        o.frequency.exponentialRampToValueAtTime(f * 4, t + dur - 0.05);
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(400, t);
        lp.frequency.exponentialRampToValueAtTime(3000, t + dur);
        const og = ctx.createGain();
        og.gain.setValueAtTime(0.0001, t);
        og.gain.exponentialRampToValueAtTime(0.05, t + dur - 0.06);
        og.gain.exponentialRampToValueAtTime(0.0001, t + dur - 0.01);
        o.connect(lp).connect(og);
        out(og, { send: 0.3 });
      });
    },

    /** The flash: the main trailer hit. */
    hit(level = 1) {
      if (!live()) return;
      braam(now(), level);
    },

    /** A blade flying in: heavy whoosh landing on a thud. */
    whooshHit(pan = 0, size = 1) {
      if (!live()) return;
      const t = now();
      const n = noiseSrc(t, 0.6);
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 1.6;
      bp.frequency.setValueAtTime(2600, t);
      bp.frequency.exponentialRampToValueAtTime(320, t + 0.42);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.55 * size, t + 0.2);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.48);
      n.connect(bp).connect(g);
      const p = out(g, { pan, send: 0.4 });
      if (p.pan) p.pan.linearRampToValueAtTime(0, t + 0.42);
      thud(t + 0.4, size, pan);
    },

    /** Letters locking in: dark metallic tick. */
    tick(pan = 0, i = 0) {
      if (!live()) return;
      const t = now();
      const o = osc('triangle', 520 - i * 30, t, 0.5);
      const o2 = osc('sine', (520 - i * 30) * 2.71, t, 0.5);
      const g = ctx.createGain();
      env(g, t, 0.002, 0.11, 0.32);
      o.connect(g);
      o2.connect(g);
      out(g, { pan, send: 0.6 });
    },

    /** Cable drawing + bolt: low power surge with a growl, ending on a crack. */
    surge(dur = 0.9) {
      if (!live()) return;
      const t = now();
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.Q.value = 6;
      lp.frequency.setValueAtTime(120, t);
      lp.frequency.exponentialRampToValueAtTime(1400, t + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + dur * 0.9);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.25);
      lp.connect(g);
      out(g, { send: 0.45 });
      [55, 55.5, 82.4].forEach((f) => {
        const o = osc('sawtooth', f, t, dur + 0.3);
        o.frequency.linearRampToValueAtTime(f * 1.5, t + dur);
        o.connect(lp);
      });
      // crack at the end (bolt)
      const c = t + dur - 0.05;
      const n = noiseSrc(c, 0.3);
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 1800;
      const ng = ctx.createGain();
      env(ng, c, 0.002, 0.4, 0.22);
      n.connect(hp).connect(ng);
      out(ng, { send: 0.6 });
      thud(c, 0.6);
    },

    /** Tension drone with heartbeat pulses while the counter fills. */
    drone() {
      if (!live()) return null;
      const t = now();
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 180;
      lp.Q.value = 3;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.14, t + 1);
      lp.connect(g);
      out(g, { send: 0.5 });
      const base = [41.2, 41.5, 61.7, 82.4];
      const oscs = base.map((f, i) => {
        const o = ctx.createOscillator();
        o.type = i === 3 ? 'triangle' : 'sawtooth';
        o.frequency.value = f;
        o.connect(lp);
        o.start(t);
        return o;
      });
      // heartbeat: two low pulses per beat, speeding up with the level
      let level = 0;
      let alive = true;
      let next = t + 0.4;
      const beat = () => {
        if (!alive) return;
        if (live() && ctx.currentTime > next - 0.15) {
          thud(next, 0.35 + level * 0.35);
          thud(next + 0.18, 0.22 + level * 0.25);
          next += 0.9 - level * 0.45;
        }
        timer = setTimeout(beat, 60);
      };
      let timer = setTimeout(beat, 60);
      return {
        set(v) {
          level = v;
          const k = ctx.currentTime;
          lp.frequency.setTargetAtTime(180 + v * 900, k, 0.2);
          oscs.forEach((o, i) => o.frequency.setTargetAtTime(base[i] * (1 + v * 0.12), k, 0.3));
        },
        stop(after = 0) {
          alive = false;
          clearTimeout(timer);
          const k = ctx.currentTime + after;
          g.gain.cancelScheduledValues(k);
          g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), k);
          g.gain.exponentialRampToValueAtTime(0.0001, k + 0.4);
          oscs.forEach((o) => o.stop(k + 0.5));
        },
      };
    },

    /** Camera punching through the logo: reverse swell into the final title hit. */
    exit() {
      if (!live()) return;
      const t = now();
      const n = noiseSrc(t, 1.1);
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 1.2;
      bp.frequency.setValueAtTime(300, t);
      bp.frequency.exponentialRampToValueAtTime(6000, t + 0.95);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.6, t + 0.92);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.0);
      n.connect(bp).connect(g);
      out(g, { send: 0.4 });
      braam(t + 1.0, 1.15);
    },

    close(after = 6) {
      setTimeout(() => ctx.close?.(), after * 1000);
    },
  };
  return fx;
}

function noiseBuffer(ctx, seconds) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function impulse(ctx, seconds, decay) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

function saturation(k) {
  const n = 1024;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = Math.tanh(k * x) / Math.tanh(k);
  }
  return curve;
}
