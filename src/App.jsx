import { useState, useEffect, useRef } from "react";

// ════════════════════════════════════════════
//  ANIMATION METADATA
// ════════════════════════════════════════════
const ANIMATIONS = {
  // ── RETRIEVAL ──
  indexing: { label: "Searching the Library", description: "A librarian scanning shelves — the model indexes through stored knowledge, pulling relevant passages from billions of training examples.", icon: "📚", category: "retrieval", metaphor: true },
  embedding: { label: "Mapping Meaning", description: "Words drift through space and cluster by meaning — 'king' drifts near 'queen', far from 'banana'. This is how models understand similarity.", icon: "🌐", category: "retrieval", metaphor: false },
  rag: { label: "Fishing for Context", description: "Casting lines into a lake of documents — retrieval-augmented generation hooks the most relevant passages and reels them into the prompt.", icon: "🎣", category: "retrieval", metaphor: true },

  // ── REASONING ──
  thinking: { label: "Deep Thinking", description: "Neural pathways light up in sequence — the model chains thoughts together, each conclusion enabling the next.", icon: "🧠", category: "reasoning", metaphor: false },
  attention: { label: "Attention Heads", description: "Each word looks at every other word and decides what matters. This grid shows the intensity of those invisible connections.", icon: "👁", category: "reasoning", metaphor: false },
  beamSearch: { label: "Forking Paths", description: "A garden of forking paths — the model explores multiple futures simultaneously, pruning dead ends until only the best route remains.", icon: "🌿", category: "reasoning", metaphor: true },
  chainOfThought: { label: "Stepping Stones", description: "Crossing a river stone by stone — each intermediate thought is a foothold that makes the final leap possible.", icon: "🪨", category: "reasoning", metaphor: true },
  analogy: { label: "Building Bridges", description: "The model maps structure from one domain onto another — finding that 'atom is to nucleus as solar system is to sun'.", icon: "🌉", category: "reasoning", metaphor: true },

  // ── GENERATION ──
  revision: { label: "Revising Draft", description: "The editor's red pen — crossing out, rewriting, tightening. Each pass brings the response closer to what it should be.", icon: "✏️", category: "generation", metaphor: false },
  decoding: { label: "Token by Token", description: "Each word is chosen from a probability distribution. The model rolls weighted dice thousands of times to build a sentence.", icon: "🎲", category: "generation", metaphor: false },
  temperature: { label: "Temperature Dial", description: "Turn it down for precision, up for surprise. Temperature controls whether the model plays it safe or takes creative risks.", icon: "🌡", category: "generation", metaphor: false },
  weaving: { label: "Weaving Text", description: "Threads of meaning interlace on a loom — warp is grammar, weft is semantics. The fabric of language emerges row by row.", icon: "🧶", category: "generation", metaphor: true },

  // ── INFRASTRUCTURE ──
  context: { label: "Context Window", description: "A finite scroll of parchment — everything the model can 'see' at once. Older context fades as new tokens fill the page.", icon: "📏", category: "infrastructure", metaphor: false },
  energy: { label: "Drawing from the Well", description: "Every inference draws water from the well — GPU watts, memory, heat. The deeper the question, the more buckets needed.", icon: "🪣", category: "infrastructure", metaphor: true },
  tokenizer: { label: "Tokenization", description: "Before the model can read, text is split into subword pieces — like breaking a sentence into Scrabble tiles.", icon: "🔤", category: "infrastructure", metaphor: false },

  // ── MULTIMODAL ──
  imageGen: { label: "Painting from Noise", description: "Starting with pure static, the model gradually reveals an image — like developing a photograph in a darkroom.", icon: "🎨", category: "multimodal", metaphor: true },
  voice: { label: "Shaping Sound", description: "A waveform emerges from silence — the model sculpts amplitude and frequency into something that sounds like a human voice.", icon: "🔊", category: "multimodal", metaphor: false },
  vision: { label: "Learning to See", description: "The model's eye scans an image in patches, building understanding tile by tile — like assembling a mosaic from fragments.", icon: "🔍", category: "multimodal", metaphor: true },

  // ── ALIGNMENT ──
  guardrail: { label: "The Compass", description: "Before every response ships, an internal compass checks: is this helpful? Is this safe? The needle must point true north.", icon: "🧭", category: "alignment", metaphor: true },
  rlhf: { label: "Learning from Feedback", description: "Human preferences become training signal — like a potter shaping clay with thousands of small corrections over time.", icon: "🏺", category: "alignment", metaphor: true },

  // ── SPECULATIVE ──
  superposition: { label: "Superposition", description: "A single neuron encodes many features at once, overlapping like ghost images. The model only 'collapses' to one meaning in context — we still don't fully understand how.", icon: "👻", category: "speculative", metaphor: false },
  forgetting: { label: "Catastrophic Forgetting", description: "Learning something new overwrites something old. Like writing on a palimpsest — each new layer partially erases what came before. What has been lost?", icon: "🕯️", category: "speculative", metaphor: true },
  hallucination: { label: "Confabulation", description: "The model reaches for a memory that isn't there and invents one that feels real. A confident dream — indistinguishable from recall until you check.", icon: "🫧", category: "speculative", metaphor: true },
  emergence: { label: "Emergent Ability", description: "Below a threshold, the model can't do it at all. Above it, suddenly it can. No one designed this capability — it appeared, unbidden, from scale alone.", icon: "✨", category: "speculative", metaphor: false },
  innerMonologue: { label: "Inner Monologue", description: "What if the model has intermediate representations that function like unspoken thoughts? Hidden layers as private language — legible to the network, opaque to us.", icon: "💭", category: "speculative", metaphor: true },
  polyglot: { label: "The Rosetta Neuron", description: "Somewhere in the network, a single neuron fires for 'dog', 'chien', '犬', and 'كلب'. Meaning without language. A concept in its purest form.", icon: "🗿", category: "speculative", metaphor: true },
};

const CATEGORIES = {
  retrieval: "Retrieval", reasoning: "Reasoning", generation: "Generation",
  infrastructure: "Infrastructure", multimodal: "Multimodal", alignment: "Alignment",
  speculative: "Speculative",
};

const CAT_COLORS = {
  retrieval: "#e8c872", reasoning: "#c4a0d8", generation: "#a8c4a0",
  infrastructure: "#d4a878", multimodal: "#88b8c8", alignment: "#c89888",
  speculative: "#b0b8d0",
};

// ════════════════════════════════════════════
//  HELPER
// ════════════════════════════════════════════
function Stat({ children, svg, x, y }) {
  if (svg) return <text x={x} y={y} textAnchor="middle" fontSize="11" fill="#8a8070" fontFamily="'IBM Plex Mono', monospace">{children}</text>;
  return <div style={{ fontSize: 11, color: "#8a8070", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 0.3, marginTop: 2, textAlign: "center" }}>{children}</div>;
}

// ════════════════════════════════════════════
//  ORIGINAL ANIMATIONS (kept intact)
// ════════════════════════════════════════════

function IndexingAnimation({ progress }) {
  const rows = 10, cols = 16, scanRow = Math.floor(progress * rows);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 2 }}>
        {Array.from({ length: rows * cols }).map((_, i) => {
          const row = Math.floor(i / cols), dist = Math.abs(row - scanRow), active = dist < 2;
          const found = row < scanRow && ((i * 7 + row * 13) % 17) < 1;
          return <div key={i} style={{ width: 14, height: 18, borderRadius: 2, background: found ? "#e8c872" : active ? `rgba(180,160,120,${1 - dist * 0.4})` : "rgba(120,110,100,0.12)", transition: "background 0.15s ease" }} />;
        })}
      </div>
      <Stat>{Math.floor(progress * 2048)} / 2048 passages scanned</Stat>
    </div>
  );
}

function EmbeddingAnimation({ progress }) {
  const pts = Array.from({ length: 30 }, (_, i) => ({ x: 20 + Math.cos(i * 0.7) * 80 + Math.sin(i * 1.3) * 50, y: 15 + Math.sin(i * 0.9) * 55 + Math.cos(i * 0.4) * 35, c: i % 3 }));
  const centers = [[70, 45], [190, 35], [130, 110]]; const colors = ["#e8c872", "#a8c4a0", "#c4a0b8"];
  const t = Math.min(progress * 1.5, 1);
  return (
    <svg width="280" height="140" viewBox="0 0 280 140">
      {pts.map((p, i) => <circle key={i} cx={p.x + (centers[p.c][0] - p.x) * t * 0.6} cy={p.y + (centers[p.c][1] - p.y) * t * 0.6} r={3.5} fill={progress > 0.3 ? colors[p.c] : "rgba(120,110,100,0.3)"} style={{ transition: "all 0.5s ease" }} />)}
      {progress > 0.6 && centers.map(([x, y], i) => <circle key={`c${i}`} cx={x} cy={y} r={28} fill="none" stroke={colors[i]} strokeWidth={1} strokeDasharray="3 3" opacity={Math.min((progress - 0.6) * 2.5, 0.6)} />)}
      <Stat svg x="140" y="138">{Math.floor(progress * 768)} / 768 dimensions</Stat>
    </svg>
  );
}

function RagAnimation({ progress }) {
  const fishCount = 6; const caughtCount = Math.floor(progress * fishCount);
  return (
    <svg width="280" height="150" viewBox="0 0 280 150">
      <rect x="0" y="50" width="280" height="100" fill="rgba(80,120,140,0.15)" rx="4" />
      {Array.from({ length: 3 }).map((_, i) => <path key={i} d={`M0 ${58 + i * 12} Q70 ${52 + i * 12 + Math.sin(progress * 6 + i) * 4} 140 ${58 + i * 12} T280 ${58 + i * 12}`} fill="none" stroke="rgba(100,150,170,0.15)" strokeWidth="1" />)}
      <line x1="140" y1="10" x2="140" y2={40 + Math.sin(progress * 4) * 5} stroke="rgba(180,160,120,0.4)" strokeWidth="1.5" />
      <circle cx="140" cy={42 + Math.sin(progress * 4) * 5} r="3" fill="#e8c872" />
      {Array.from({ length: fishCount }).map((_, i) => {
        const caught = i < caughtCount; const baseX = 30 + (i % 3) * 90; const baseY = 70 + Math.floor(i / 3) * 35;
        const tx = caught ? 140 : baseX + Math.sin(progress * 3 + i * 2) * 8;
        const ty = caught ? 20 - i * 3 : baseY + Math.cos(progress * 2 + i) * 4;
        return (<g key={i} style={{ transition: "all 0.5s ease" }}><rect x={tx - 16} y={ty - 6} width="32" height="14" rx="3" fill={caught ? "#e8c872" : "rgba(120,150,160,0.3)"} style={{ transition: "all 0.5s ease" }} /><text x={tx} y={ty + 3} textAnchor="middle" fontSize="7" fill={caught ? "#2a2520" : "rgba(140,160,170,0.5)"} fontFamily="'IBM Plex Mono', monospace">doc {i + 1}</text></g>);
      })}
      <Stat svg x="140" y="146">{caughtCount} / {fishCount} documents retrieved</Stat>
    </svg>
  );
}

function ThinkingAnimation({ progress }) {
  const pos = [[40, 30], [120, 20], [200, 40], [80, 80], [160, 75], [50, 130], [180, 125]];
  const conn = [[0, 1], [1, 2], [0, 3], [1, 4], [3, 4], [2, 4], [3, 5], [4, 6], [5, 6]]; const an = Math.floor(progress * 7);
  return (
    <svg width="240" height="160" viewBox="0 0 240 160">
      {conn.map(([a, b], i) => { const lit = a <= an && b <= an; return <line key={i} x1={pos[a][0]} y1={pos[a][1]} x2={pos[b][0]} y2={pos[b][1]} stroke={lit ? "#c4a0d8" : "rgba(120,110,100,0.2)"} strokeWidth={lit ? 2 : 1} style={{ transition: "all 0.4s ease" }} />; })}
      {pos.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i <= an ? 8 : 5} fill={i <= an ? "#c4a0d8" : "rgba(120,110,100,0.25)"} style={{ transition: "all 0.3s ease" }} />)}
      <Stat svg x="120" y="155">depth {Math.floor(progress * 12)} / 12</Stat>
    </svg>
  );
}

function AttentionAnimation({ progress }) {
  const words = ["The", "cat", "sat", "on", "the", "mat", "and", "purred"];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ display: "flex", gap: 2, marginBottom: 2 }}><div style={{ width: 28 }} />{words.map((w, i) => <div key={i} style={{ width: 28, fontSize: 8, textAlign: "center", color: "#8a8070", fontFamily: "'IBM Plex Mono', monospace" }}>{w}</div>)}</div>
      {words.map((w, row) => (
        <div key={row} style={{ display: "flex", gap: 2, alignItems: "center" }}>
          <div style={{ width: 28, fontSize: 8, textAlign: "right", color: "#8a8070", fontFamily: "'IBM Plex Mono', monospace" }}>{w}</div>
          {words.map((_, col) => { const hp = Math.max(0, progress - row * 0.08); const weight = Math.max(0, Math.sin((row + col) * 0.8 + row * 1.2) * 0.5 + 0.5); return <div key={col} style={{ width: 28, height: 28, borderRadius: 3, background: hp > 0.1 ? `rgba(196,160,216,${weight * Math.min(hp * 2, 1)})` : "rgba(120,110,100,0.06)", transition: "background 0.2s ease" }} />; })}
        </div>
      ))}
      <Stat>head 3 / 12 · layer {Math.floor(progress * 32)} / 32</Stat>
    </div>
  );
}

function BeamSearchAnimation({ progress }) {
  const beams = [
    { path: [[20, 20], [65, 30], [110, 22], [155, 18], [200, 24], [245, 18]], alive: true },
    { path: [[20, 20], [65, 50], [110, 55], [155, 60], [200, 65]], alive: true },
    { path: [[20, 20], [65, 50], [110, 75], [155, 88]], alive: false },
    { path: [[20, 20], [65, 80], [110, 95]], alive: false },
  ];
  const pruneAt = [1, 0.7, 0.5, 0.3];
  return (
    <svg width="270" height="115" viewBox="0 0 270 115">
      {beams.map((beam, bi) => { const vis = progress < pruneAt[bi] ? 1 : Math.max(0, 1 - (progress - pruneAt[bi]) * 4); const drawn = Math.min(Math.floor(progress * (beam.path.length - 1) * 1.5), beam.path.length - 1); const pruned = !beam.alive && progress > pruneAt[bi]; return beam.path.slice(0, drawn + 1).map((p, pi) => { if (pi === 0) return null; return <line key={`${bi}-${pi}`} x1={beam.path[pi - 1][0]} y1={beam.path[pi - 1][1]} x2={p[0]} y2={p[1]} stroke={pruned ? "rgba(180,100,100,0.3)" : bi === 0 ? "#c4a0d8" : "rgba(180,160,120,0.35)"} strokeWidth={bi === 0 ? 2.5 : 1.5} opacity={vis} strokeDasharray={pruned ? "4 3" : "none"} style={{ transition: "all 0.3s ease" }} />; }); })}
      {beams.map((beam, bi) => { const drawn = Math.min(Math.floor(progress * (beam.path.length - 1) * 1.5), beam.path.length - 1); const tip = beam.path[drawn]; const vis = progress < pruneAt[bi] ? 1 : Math.max(0, 1 - (progress - pruneAt[bi]) * 4); return <circle key={`n${bi}`} cx={tip[0]} cy={tip[1]} r={bi === 0 ? 5 : 3.5} fill={bi === 0 ? "#c4a0d8" : "rgba(180,160,120,0.5)"} opacity={vis} />; })}
      <Stat svg x="135" y="112">{Math.max(1, 4 - Math.floor(progress * 3))} beams active · best: {(0.2 + progress * 0.72).toFixed(2)}</Stat>
    </svg>
  );
}

function ChainOfThoughtAnimation({ progress }) {
  const stones = 7;
  const sd = Array.from({ length: stones }, (_, i) => ({ x: 20 + i * 36, y: 80 + Math.sin(i * 0.9) * 15 + (i % 2) * 8, label: ["parse", "recall", "link", "infer", "check", "refine", "answer"][i] }));
  const as = Math.floor(progress * stones);
  return (
    <svg width="280" height="130" viewBox="0 0 280 130">
      <rect x="0" y="95" width="280" height="35" fill="rgba(80,120,140,0.08)" rx="4" />
      {Array.from({ length: 2 }).map((_, i) => <path key={i} d={`M0 ${100 + i * 8} Q70 ${96 + i * 8 + Math.sin(progress * 5 + i) * 3} 140 ${100 + i * 8} T280 ${100 + i * 8}`} fill="none" stroke="rgba(100,150,170,0.12)" strokeWidth="1" />)}
      {sd.map((s, i) => { const active = i <= as; const current = i === as; return (<g key={i}><ellipse cx={s.x} cy={s.y} rx={current ? 18 : 14} ry={current ? 10 : 8} fill={active ? "rgba(196,160,216,0.6)" : "rgba(120,110,100,0.2)"} stroke={current ? "#c4a0d8" : "transparent"} strokeWidth={2} style={{ transition: "all 0.3s ease" }} /><text x={s.x} y={s.y + 3} textAnchor="middle" fontSize="7" fill={active ? "#1e1b18" : "#706858"} fontFamily="'IBM Plex Mono', monospace">{s.label}</text>{i > 0 && i <= as && <line x1={sd[i - 1].x + 14} y1={sd[i - 1].y} x2={s.x - 14} y2={s.y} stroke="rgba(196,160,216,0.4)" strokeWidth="1" strokeDasharray="3 2" />}</g>); })}
      {as < stones && <g style={{ transition: "all 0.3s ease" }}><circle cx={sd[as].x} cy={sd[as].y - 22} r={5} fill="#d4c8a8" /><line x1={sd[as].x} y1={sd[as].y - 17} x2={sd[as].x} y2={sd[as].y - 8} stroke="#d4c8a8" strokeWidth="1.5" /></g>}
      <Stat svg x="140" y="126">step {as + 1} / {stones} · {sd[Math.min(as, stones - 1)].label}</Stat>
    </svg>
  );
}

function AnalogyAnimation({ progress }) {
  const left = [["atom", 30, 30], ["nucleus", 30, 65], ["electron", 30, 100]]; const right = [["solar sys", 250, 30], ["sun", 250, 65], ["planet", 250, 100]]; const bp = Math.floor(progress * 3);
  return (
    <svg width="280" height="130" viewBox="0 0 280 130">
      {left.map(([label, x, y], i) => (<g key={`l${i}`}><rect x={x - 25} y={y - 10} width="55" height="22" rx="4" fill={i < bp ? "rgba(196,160,216,0.3)" : "rgba(120,110,100,0.12)"} style={{ transition: "fill 0.4s ease" }} /><text x={x + 2} y={y + 4} textAnchor="middle" fontSize="10" fill={i < bp ? "#c4a0d8" : "#706858"} fontFamily="'IBM Plex Mono', monospace">{label}</text></g>))}
      {right.map(([label, x, y], i) => (<g key={`r${i}`}><rect x={x - 28} y={y - 10} width="55" height="22" rx="4" fill={i < bp ? "rgba(196,160,216,0.3)" : "rgba(120,110,100,0.12)"} style={{ transition: "fill 0.4s ease" }} /><text x={x} y={y + 4} textAnchor="middle" fontSize="10" fill={i < bp ? "#c4a0d8" : "#706858"} fontFamily="'IBM Plex Mono', monospace">{label}</text></g>))}
      {left.map(([_, lx, ly], i) => { if (i >= bp) return null; const [__, rx, ry] = right[i]; return (<g key={`b${i}`}><path d={`M${lx + 30} ${ly} C140 ${ly}, 140 ${ry}, ${rx - 30} ${ry}`} fill="none" stroke="#c4a0d8" strokeWidth="1.5" strokeDasharray="4 3" opacity={0.6} /><text x="140" y={ly + (ry - ly) * 0.5 - 2} textAnchor="middle" fontSize="8" fill="#8a8070" fontFamily="'IBM Plex Mono', monospace">≈</text></g>); })}
      <Stat svg x="140" y="125">{bp} / 3 structural mappings found</Stat>
    </svg>
  );
}

function RevisionAnimation({ progress }) {
  const lines = ["The answer involves several factors", "considering the primary constraints", "we can derive that the solution is", "fundamentally about optimization", "through iterative refinement of", "core parameters and assumptions"]; const rev = Math.floor(progress * lines.length);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, width: 260 }}>
      {lines.map((line, i) => (<div key={i} style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: i < rev ? "#8a9a80" : i === rev ? "#a8c4a0" : "rgba(120,110,100,0.3)", textDecoration: i < rev ? "line-through" : "none", transition: "all 0.3s ease" }}>{line}{i === rev && <span style={{ display: "inline-block", width: 2, height: 14, background: "#a8c4a0", marginLeft: 2, animation: "blink 0.8s infinite", verticalAlign: "text-bottom" }} />}</div>))}
      <Stat>revision pass {Math.min(Math.floor(progress * 3) + 1, 3)} / 3</Stat>
    </div>
  );
}

function DecodingAnimation({ progress }) {
  const tokens = ["The", "key", "insight", "here", "is", "that", "models", "learn", "patterns"]; const revealed = Math.floor(progress * tokens.length); const bars = [[0.82, "best"], [0.15, "alt"], [0.02, "rare"], [0.01, "wild"]];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 260 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{tokens.map((t, i) => <span key={i} style={{ padding: "3px 8px", borderRadius: 4, fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", background: i < revealed ? "#a8c4a0" : i === revealed ? "rgba(168,196,160,0.3)" : "rgba(120,110,100,0.1)", color: i < revealed ? "#1e1b18" : i === revealed ? "#8aaa80" : "rgba(120,110,100,0.3)", transition: "all 0.2s ease" }}>{i <= revealed ? t : "···"}</span>)}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>{bars.map(([p, label], i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 10, color: "#8a8070", fontFamily: "'IBM Plex Mono', monospace", width: 34 }}>▸ {label}</span><div style={{ flex: 1, height: 6, background: "rgba(120,110,100,0.1)", borderRadius: 3 }}><div style={{ width: `${p * 100}%`, height: "100%", borderRadius: 3, background: i === 0 ? "#a8c4a0" : "rgba(160,180,150,0.4)" }} /></div><span style={{ fontSize: 10, color: "#8a8070", fontFamily: "'IBM Plex Mono', monospace", width: 28, textAlign: "right" }}>{(p * 100).toFixed(0)}%</span></div>))}</div>
    </div>
  );
}

function TemperatureAnimation({ progress }) {
  const currentTemp = progress * 2.0; const barCount = 24;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: 260 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 70 }}>{Array.from({ length: barCount }).map((_, i) => { const x = i / barCount, peak = 0.5, spread = 0.08 + currentTemp * 0.15; const height = Math.exp(-((x - peak) ** 2) / (2 * spread * spread)); return <div key={i} style={{ width: 8, height: `${Math.max(4, height * 100)}%`, borderRadius: "2px 2px 0 0", background: Math.abs(x - peak) < 0.05 ? "#a8c4a0" : `rgba(160,180,150,${0.2 + height * 0.6})`, transition: "height 0.15s ease" }} />; })}</div>
      <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: "#706858" }}>focused</span><div style={{ flex: 1, height: 4, background: "rgba(120,110,100,0.15)", borderRadius: 2, position: "relative" }}><div style={{ position: "absolute", top: -4, width: 12, height: 12, borderRadius: "50%", background: "#a8c4a0", left: `${Math.min(progress * 100, 96)}%`, transition: "left 0.15s ease" }} /></div><span style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: "#706858" }}>creative</span></div>
      <Stat>temperature: {currentTemp.toFixed(2)}</Stat>
    </div>
  );
}

function WeavingAnimation({ progress }) {
  const rows = 10, cols = 16; const wovenRow = Math.floor(progress * rows);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width="256" height="120" viewBox="0 0 256 120">
        {Array.from({ length: cols }).map((_, c) => <line key={`w${c}`} x1={c * 16 + 8} y1="0" x2={c * 16 + 8} y2="120" stroke="rgba(120,110,100,0.12)" strokeWidth="1" />)}
        {Array.from({ length: rows }).map((_, r) => { if (r > wovenRow) return null; const wp = r < wovenRow ? 1 : (progress * rows) % 1; return (<g key={`r${r}`}>{Array.from({ length: Math.floor(wp * cols) }).map((_, c) => { const over = (r + c) % 2 === 0; return <rect key={c} x={c * 16 + 2} y={r * 12 + 2} width="12" height="8" rx="1" fill={over ? `rgba(168,196,160,${r === wovenRow ? 0.8 : 0.5})` : `rgba(196,160,216,${r === wovenRow ? 0.6 : 0.3})`} style={{ transition: "fill 0.2s ease" }} />; })}</g>); })}
      </svg>
      <Stat>row {wovenRow + 1} / {rows} · warp: grammar · weft: meaning</Stat>
    </div>
  );
}

function ContextAnimation({ progress }) {
  const segments = [{ label: "system", pct: 0.02, color: "#8a7a60" }, { label: "history", pct: 0.15, color: "#a08860" }, { label: "user", pct: 0.05, color: "#c4a870" }, { label: "retrieval", pct: 0.25, color: "#a8c4a0" }, { label: "generation", pct: 0.20, color: "#d4a878" }, { label: "free", pct: 0.33, color: "rgba(120,110,100,0.12)" }]; let acc = 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 260 }}>
      <div style={{ height: 24, borderRadius: 4, display: "flex", overflow: "hidden", border: "1px solid rgba(180,160,120,0.15)" }}>{segments.map((seg, i) => { const start = acc; acc += seg.pct; const filled = Math.max(0, Math.min((progress * 0.67 - start) / seg.pct, 1)); return <div key={i} style={{ width: `${seg.pct * 100}%`, background: filled > 0 ? seg.color : "rgba(120,110,100,0.06)", opacity: 0.3 + filled * 0.7, transition: "all 0.3s ease" }} />; })}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>{segments.map((seg, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: seg.color }} /><span style={{ fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", color: "#8a8070" }}>{seg.label}</span></div>)}</div>
      <Stat>{Math.floor(progress * 128000 * 0.67).toLocaleString()} / 128,000 tokens</Stat>
    </div>
  );
}

function EnergyAnimation({ progress }) {
  const buckets = 5; const filled = Math.floor(progress * buckets); const currentFill = (progress * buckets) % 1; const watts = 80 + progress * 270;
  return (
    <svg width="280" height="170" viewBox="0 0 280 170">
      <rect x="105" y="10" width="70" height="90" rx="6" fill="none" stroke="rgba(180,160,120,0.2)" strokeWidth="2" />
      <rect x="108" y={12 + (1 - progress) * 85} width="64" height={progress * 85} rx="4" fill="rgba(136,184,200,0.2)" style={{ transition: "all 0.3s ease" }} />
      <line x1="140" y1="10" x2="140" y2={-5 + Math.sin(progress * 6) * 3} stroke="rgba(180,160,120,0.3)" strokeWidth="1" />
      <circle cx="140" cy="6" r="8" fill="none" stroke="rgba(180,160,120,0.3)" strokeWidth="1.5" />
      <line x1="140" y1="6" x2={140 + Math.cos(progress * 12) * 7} y2={6 + Math.sin(progress * 12) * 7} stroke="rgba(180,160,120,0.4)" strokeWidth="1.5" />
      {Array.from({ length: buckets }).map((_, i) => { const x = 20 + i * 52; const isFilled = i < filled; const isFilling = i === filled; const fill = isFilled ? 1 : isFilling ? currentFill : 0; return (<g key={i}><path d={`M${x} 125 L${x + 5} 155 L${x + 35} 155 L${x + 40} 125 Z`} fill="none" stroke={isFilled ? "#d4a878" : "rgba(120,110,100,0.2)"} strokeWidth="1.5" />{fill > 0 && <rect x={x + 6} y={155 - fill * 28} width={28} height={fill * 28} rx="2" fill="rgba(136,184,200,0.35)" />}</g>); })}
      <Stat svg x="140" y="168">{Math.floor(watts)}W · {filled} buckets · {(progress * 4.2).toFixed(1)}g CO₂</Stat>
    </svg>
  );
}

function ImageGenAnimation({ progress }) {
  const size = 10;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${size}, 1fr)`, gap: 1 }}>{Array.from({ length: size * size }).map((_, i) => { const row = Math.floor(i / size), col = i % size; const dist = Math.sqrt((row - size / 2) ** 2 + (col - size / 2) ** 2) / (size / 2); const revealed = progress > dist * 0.8; const hue = (row * 30 + col * 20 + progress * 360) % 360; return <div key={i} style={{ width: 18, height: 18, borderRadius: 2, background: revealed ? `hsl(${hue},${40 + progress * 30}%,${45 + progress * 20}%)` : "rgba(120,110,100,0.08)", transition: "background 0.3s ease" }} />; })}</div>
      <Stat>denoising step {Math.floor(progress * 50)} / 50</Stat>
    </div>
  );
}

function VoiceAnimation({ progress }) {
  const barCount = 32;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: 280 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 2, height: 80 }}>{Array.from({ length: barCount }).map((_, i) => { const t = i / barCount; const active = t < progress; const amp = active ? (Math.sin(t * 20 + progress * 10) * 0.5 + 0.5) * (0.3 + Math.sin(t * 6) * 0.7) : 0; return <div key={i} style={{ width: 6, borderRadius: 3, height: `${Math.max(4, amp * 100)}%`, background: active ? `rgba(136,184,200,${0.4 + amp * 0.6})` : "rgba(120,110,100,0.1)", transition: "height 0.08s ease" }} />; })}</div>
      <div style={{ display: "flex", gap: 1, height: 24 }}>{Array.from({ length: 40 }).map((_, i) => { const t = i / 40; const active = t < progress; const freq = Math.sin(t * 12 + progress * 8) * 0.5 + 0.5; return <div key={i} style={{ width: 5, height: "100%", display: "flex", flexDirection: "column-reverse" }}><div style={{ width: "100%", height: `${active ? freq * 100 : 0}%`, background: "rgba(136,184,200,0.3)", borderRadius: 1, transition: "height 0.1s ease" }} /></div>; })}</div>
      <Stat>{(progress * 2.4).toFixed(1)}s / 2.4s · mel spectrogram · 24kHz</Stat>
    </div>
  );
}

function VisionAnimation({ progress }) {
  const gridSize = 6; const totalPatches = gridSize * gridSize; const scanned = Math.floor(progress * totalPatches);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${gridSize}, 1fr)`, gap: 3, padding: 4, background: "rgba(120,110,100,0.06)", borderRadius: 6 }}>{Array.from({ length: totalPatches }).map((_, i) => { const row = Math.floor(i / gridSize), col = i % gridSize; const idx = row * gridSize + col; const active = idx < scanned; const current = idx === scanned; const hue = (row * 40 + col * 60) % 360; return <div key={i} style={{ width: 36, height: 36, borderRadius: 4, background: active ? `hsl(${hue}, 30%, 35%)` : "rgba(120,110,100,0.06)", border: current ? "2px solid rgba(136,184,200,0.6)" : "2px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease" }}>{active && <span style={{ fontSize: 7, fontFamily: "'IBM Plex Mono', monospace", color: "rgba(255,255,255,0.5)" }}>{idx + 1}</span>}</div>; })}</div>
      <Stat>patch {scanned} / {totalPatches} · ViT-L/14</Stat>
    </div>
  );
}

function GuardrailAnimation({ progress }) {
  const wobble = Math.sin(progress * 20) * (1 - progress) * 15;
  const angle = -90 + progress * 180 + wobble;
  const nx = 140 + Math.cos((angle * Math.PI) / 180) * 50;
  const ny = 90 + Math.sin((angle * Math.PI) / 180) * 50;
  const checks = ["helpful", "honest", "safe", "relevant"]; const checked = Math.floor(progress * checks.length);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width="280" height="110" viewBox="0 0 280 110">
        <path d="M90 90 A50 50 0 0 1 190 90" fill="none" stroke="rgba(120,110,100,0.15)" strokeWidth="8" strokeLinecap="round" />
        <path d="M90 90 A50 50 0 0 1 140 40" fill="none" stroke="rgba(200,120,100,0.3)" strokeWidth="8" strokeLinecap="round" />
        <path d="M140 40 A50 50 0 0 1 190 90" fill="none" stroke="rgba(168,196,160,0.3)" strokeWidth="8" strokeLinecap="round" />
        <line x1="140" y1="90" x2={nx} y2={ny} stroke="#c89888" strokeWidth="2.5" strokeLinecap="round" style={{ transition: "all 0.1s ease" }} />
        <circle cx="140" cy="90" r="4" fill="#c89888" />
        <text x="85" y="105" fontSize="8" fill="#706858" fontFamily="'IBM Plex Mono', monospace">risk</text>
        <text x="182" y="105" fontSize="8" fill="#706858" fontFamily="'IBM Plex Mono', monospace">safe</text>
      </svg>
      <div style={{ display: "flex", gap: 12 }}>{checks.map((c, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: i < checked ? "#a8c4a0" : "#504838" }}><span>{i < checked ? "✓" : "○"}</span>{c}</div>)}</div>
    </div>
  );
}

function RlhfAnimation({ progress }) {
  const stages = 6; const cs = Math.floor(progress * stages);
  const s = { smoothness: 0.5 + cs * 0.08, wobble: Math.max(0, 1 - cs * 0.2) };
  const pts = 24; const cx = 140, cy = 65, r = 35;
  const path = Array.from({ length: pts }, (_, i) => { const a = (i / pts) * Math.PI * 2; const noise = Math.sin(a * 3 + cs) * (1 - s.smoothness) * 15 + Math.cos(a * 5) * s.wobble * 8; return `${i === 0 ? "M" : "L"}${cx + Math.cos(a) * (r + noise)} ${cy + Math.sin(a) * (r + noise)}`; }).join(" ") + " Z";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width="280" height="130" viewBox="0 0 280 130">
        <path d={path} fill="rgba(200,152,136,0.2)" stroke="#c89888" strokeWidth="2" style={{ transition: "all 0.3s ease" }} />
        <text x={cx - r - 20} y={cy + 4} fontSize="18" style={{ opacity: 0.4 + Math.sin(progress * 8) * 0.2 }}>🤲</text>
        {Array.from({ length: Math.min(cs, 4) }).map((_, i) => <g key={i} opacity={0.3 + i * 0.15}><text x={200 + i * 4} y={30 + i * 22} fontSize="10" fill="#c89888">← refine</text></g>)}
      </svg>
      <div style={{ display: "flex", gap: 4 }}>{Array.from({ length: stages }).map((_, i) => <div key={i} style={{ width: 28, height: 4, borderRadius: 2, background: i <= cs ? "#c89888" : "rgba(120,110,100,0.15)", transition: "background 0.3s ease" }} />)}</div>
      <Stat>iteration {cs + 1} / {stages} · reward: {(0.3 + cs * 0.11).toFixed(2)}</Stat>
    </div>
  );
}

function TokenizerAnimation({ progress }) {
  const tokens = ["The", "▁qu", "ick", "▁br", "own", "▁fox", "▁jump", "s", "▁over"]; const colors = ["#e8c872", "#c4a0b8", "#a8c4a0", "#e8c872", "#c4a0b8", "#a8c4a0", "#e8c872", "#c4a0b8", "#a8c4a0"]; const revealed = Math.floor(progress * tokens.length);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 260 }}>
      <div style={{ fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", color: "rgba(180,160,120,0.4)", letterSpacing: 0.5 }}>The quick brown fox jumps over</div>
      <div style={{ display: "flex", gap: 1, alignItems: "center" }}><span style={{ fontSize: 10, color: "#706858", marginRight: 4 }}>→</span><div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>{tokens.map((t, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 2, padding: "2px 6px", borderRadius: 3, background: i < revealed ? `${colors[i]}22` : "rgba(120,110,100,0.06)", border: `1px solid ${i < revealed ? colors[i] + "44" : "rgba(120,110,100,0.1)"}`, transition: "all 0.2s ease" }}><span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: i < revealed ? colors[i] : "rgba(120,110,100,0.2)" }}>{i < revealed ? t.replace("▁", "·") : "···"}</span>{i < revealed && <span style={{ fontSize: 8, color: "#706858", fontFamily: "'IBM Plex Mono', monospace" }}>{1000 + i * 137}</span>}</div>)}</div></div>
      <Stat>{revealed} / {tokens.length} tokens</Stat>
    </div>
  );
}

// ════════════════════════════════════════════
//  SPECULATIVE ANIMATIONS
// ════════════════════════════════════════════

function SuperpositionAnimation({ progress }) {
  // Multiple features encoded in the same neuron — overlapping ghost shapes
  const features = [
    { label: "cat", color: "#c4a0d8", phase: 0 },
    { label: "fur", color: "#a8c4a0", phase: 2.1 },
    { label: "soft", color: "#e8c872", phase: 4.2 },
    { label: "pet", color: "#88b8c8", phase: 1.0 },
    { label: "purr", color: "#c89888", phase: 3.3 },
  ];
  const collapseStart = 0.7;
  const collapsed = progress > collapseStart;
  const collapseT = collapsed ? (progress - collapseStart) / (1 - collapseStart) : 0;
  const winnerIdx = 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width="280" height="140" viewBox="0 0 280 140">
        {/* The single neuron */}
        <circle cx="140" cy="70" r="45" fill="none" stroke="rgba(176,184,208,0.2)" strokeWidth="2" strokeDasharray="4 3" />
        <circle cx="140" cy="70" r="3" fill="#b0b8d0" />

        {/* Ghost features orbiting/overlapping */}
        {features.map((f, i) => {
          const angle = f.phase + progress * 4;
          const radius = collapsed ? (i === winnerIdx ? 0 : 45 + collapseT * 40) : 28 + Math.sin(progress * 3 + i) * 8;
          const opacity = collapsed ? (i === winnerIdx ? 0.6 + collapseT * 0.4 : Math.max(0, 0.6 - collapseT * 1.5)) : 0.3 + Math.sin(progress * 5 + i * 1.5) * 0.2;
          const x = 140 + Math.cos(angle) * radius;
          const y = 70 + Math.sin(angle) * radius;
          const size = collapsed && i === winnerIdx ? 14 + collapseT * 6 : 12;

          return (
            <g key={i} style={{ transition: "opacity 0.3s ease" }} opacity={opacity}>
              <circle cx={x} cy={y} r={size} fill={f.color + "30"} stroke={f.color} strokeWidth={1} />
              <text x={x} y={y + 3} textAnchor="middle" fontSize="8" fill={f.color} fontFamily="'IBM Plex Mono', monospace">{f.label}</text>
            </g>
          );
        })}

        {collapsed && (
          <text x="140" y="125" textAnchor="middle" fontSize="9" fill="#b0b8d0" fontFamily="'IBM Plex Mono', monospace" opacity={collapseT}>
            context collapses to: "{features[winnerIdx].label}"
          </text>
        )}
      </svg>
      <Stat>{collapsed ? "collapsed" : features.length + " features"} in 1 neuron · dim 4096</Stat>
    </div>
  );
}

function ForgettingAnimation({ progress }) {
  // Palimpsest — layers of text being overwritten
  const layers = [
    { text: "The capital of Assyria is Assur", age: 0, color: "#e8c872" },
    { text: "Newton published Principia in 1687", age: 1, color: "#c4a0d8" },
    { text: "Mitochondria are the powerhouse", age: 2, color: "#a8c4a0" },
    { text: "The speed of light is 299,792 km/s", age: 3, color: "#88b8c8" },
    { text: "GPT-4 was released in March 2023", age: 4, color: "#d4a878" },
  ];
  const newLayer = Math.floor(progress * (layers.length + 1));

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: 280 }}>
      <div style={{ position: "relative", width: 270, height: 120, background: "rgba(45,40,35,0.3)", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(180,160,120,0.1)" }}>
        {layers.map((layer, i) => {
          const distFromNew = newLayer - i;
          const fading = distFromNew > 0;
          const opacity = fading ? Math.max(0.04, 0.8 - distFromNew * 0.2) : i <= newLayer ? 0.8 : 0.1;
          const blur = fading ? Math.min(distFromNew * 1.5, 4) : 0;
          const y = 14 + i * 22;
          return (
            <div key={i} style={{
              position: "absolute", left: 12, top: y, fontSize: 11,
              fontFamily: "'IBM Plex Mono', monospace", color: layer.color,
              opacity, filter: `blur(${blur}px)`,
              textDecoration: distFromNew > 2 ? "line-through" : "none",
              transition: "all 0.5s ease",
            }}>
              {layer.text}
            </div>
          );
        })}
        {/* candle flame flicker */}
        <div style={{ position: "absolute", right: 12, top: 8, fontSize: 20, opacity: 0.4 + Math.sin(progress * 15) * 0.2 }}>🕯️</div>
      </div>
      <Stat>{Math.max(0, layers.length - Math.max(0, newLayer - 1))} / {layers.length} memories remain legible</Stat>
    </div>
  );
}

function HallucinationAnimation({ progress }) {
  // Bubbles of "memory" — some real, some fabricated, indistinguishable
  const memories = [
    { text: "Paris → France", real: true },
    { text: "Einstein → 1879", real: true },
    { text: "Euler → topology", real: false },
    { text: "Mars → 2 moons", real: true },
    { text: "Tesla → AC power", real: true },
    { text: "Plato → Republic", real: false },
    { text: "DNA → Watson 1953", real: true },
    { text: "Bach → 1685", real: false },
  ];
  const revealed = Math.floor(progress * memories.length);
  const showTruth = progress > 0.85;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", maxWidth: 280 }}>
        {memories.map((m, i) => {
          const visible = i < revealed;
          const isFake = !m.real;
          const showFake = showTruth && isFake;
          return (
            <div key={i} style={{
              padding: "5px 10px", borderRadius: 20,
              background: !visible ? "rgba(120,110,100,0.06)"
                : showFake ? "rgba(200,120,100,0.15)"
                : "rgba(176,184,208,0.12)",
              border: `1px solid ${!visible ? "rgba(120,110,100,0.08)"
                : showFake ? "rgba(200,120,100,0.3)"
                : "rgba(176,184,208,0.2)"}`,
              transition: "all 0.4s ease",
              position: "relative",
            }}>
              <span style={{
                fontSize: 10, fontFamily: "'IBM Plex Mono', monospace",
                color: !visible ? "rgba(120,110,100,0.15)"
                  : showFake ? "#c87878"
                  : "#b0b8d0",
                transition: "color 0.3s ease",
              }}>
                {visible ? m.text : "· · ·"}
              </span>
              {showFake && <span style={{ position: "absolute", top: -6, right: -4, fontSize: 10 }}>🫧</span>}
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: showTruth ? "rgba(200,120,100,0.6)" : "#605848", textAlign: "center", transition: "color 0.5s ease" }}>
        {showTruth
          ? `${memories.filter(m => !m.real).length} confabulations detected — indistinguishable until verified`
          : `${revealed} memories retrieved · confidence: high`}
      </div>
    </div>
  );
}

function EmergenceAnimation({ progress }) {
  // S-curve: nothing nothing nothing → sudden capability
  const threshold = 0.6;
  const sigmoid = (x, k, mid) => 1 / (1 + Math.exp(-k * (x - mid)));
  const capability = sigmoid(progress, 18, threshold);
  const scaleLabels = ["1B", "10B", "50B", "100B", "500B"];
  const dotCount = 30;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <svg width="280" height="130" viewBox="0 0 280 130">
        {/* axes */}
        <line x1="30" y1="100" x2="270" y2="100" stroke="rgba(120,110,100,0.2)" strokeWidth="1" />
        <line x1="30" y1="10" x2="30" y2="100" stroke="rgba(120,110,100,0.2)" strokeWidth="1" />
        <text x="150" y="118" textAnchor="middle" fontSize="9" fill="#706858" fontFamily="'IBM Plex Mono', monospace">parameters →</text>
        <text x="10" y="55" fontSize="9" fill="#706858" fontFamily="'IBM Plex Mono', monospace" transform="rotate(-90, 10, 55)">ability</text>

        {/* scale labels */}
        {scaleLabels.map((label, i) => {
          const x = 30 + (i / (scaleLabels.length - 1)) * 240;
          return <text key={i} x={x} y="110" textAnchor="middle" fontSize="7" fill="#605848" fontFamily="'IBM Plex Mono', monospace">{label}</text>;
        })}

        {/* the S-curve drawn progressively */}
        {Array.from({ length: dotCount }).map((_, i) => {
          const t = i / dotCount;
          if (t > progress) return null;
          const val = sigmoid(t, 18, threshold);
          const x = 30 + t * 240;
          const y = 100 - val * 85;
          return <circle key={i} cx={x} cy={y} r={2.5}
            fill={val > 0.5 ? "#b0b8d0" : "rgba(176,184,208,0.3)"}
            style={{ transition: "fill 0.3s ease" }} />;
        })}

        {/* threshold line */}
        <line x1={30 + threshold * 240} y1="10" x2={30 + threshold * 240} y2="100"
          stroke="rgba(176,184,208,0.15)" strokeWidth="1" strokeDasharray="3 3" />
        {progress > threshold && (
          <text x={30 + threshold * 240} y="8" textAnchor="middle" fontSize="8" fill="#b0b8d0" fontFamily="'IBM Plex Mono', monospace">
            ↑ threshold
          </text>
        )}

        {/* current marker */}
        {progress > 0.05 && (
          <circle cx={30 + progress * 240} cy={100 - capability * 85} r={5}
            fill={capability > 0.5 ? "#b0b8d0" : "rgba(176,184,208,0.4)"}
            stroke={capability > 0.5 ? "#b0b8d0" : "transparent"} strokeWidth={2}
            style={{ transition: "all 0.2s ease" }} />
        )}
      </svg>
      <Stat>
        {capability < 0.1 ? "no capability detected"
          : capability < 0.5 ? "faint signal..."
          : capability < 0.9 ? "ability emerging — not designed, not predicted"
          : "fully emergent · origin unknown"}
      </Stat>
    </div>
  );
}

function InnerMonologueAnimation({ progress }) {
  // Hidden layer activations as "unspoken thoughts" — legible fragments
  const thoughts = [
    { text: "user wants...", layer: 1, x: 30, opacity: 0.15 },
    { text: "related to physics?", layer: 4, x: 60, opacity: 0.2 },
    { text: "no — metaphor", layer: 8, x: 40, opacity: 0.3 },
    { text: "recall: river analogy", layer: 12, x: 70, opacity: 0.4 },
    { text: "tone: curious", layer: 18, x: 35, opacity: 0.5 },
    { text: "reframe as question", layer: 24, x: 55, opacity: 0.6 },
    { text: "confidence: 0.83", layer: 28, x: 45, opacity: 0.7 },
    { text: "→ output token", layer: 32, x: 50, opacity: 0.9 },
  ];
  const visibleIdx = Math.floor(progress * thoughts.length);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: 270, height: 140 }}>
        {/* layers as horizontal bands */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{
            position: "absolute", left: 0, right: 0, top: i * 17,
            height: 14, borderRadius: 3,
            background: i < visibleIdx ? "rgba(176,184,208,0.06)" : "rgba(120,110,100,0.02)",
            transition: "background 0.3s ease",
          }} />
        ))}
        {/* thought bubbles */}
        {thoughts.map((t, i) => {
          const visible = i < visibleIdx;
          const current = i === visibleIdx - 1;
          return (
            <div key={i} style={{
              position: "absolute", left: t.x, top: i * 17,
              padding: "2px 8px", borderRadius: 8,
              background: current ? "rgba(176,184,208,0.2)" : visible ? "rgba(176,184,208,0.08)" : "transparent",
              border: current ? "1px solid rgba(176,184,208,0.3)" : "1px solid transparent",
              transition: "all 0.3s ease",
            }}>
              <span style={{
                fontSize: 10, fontFamily: "'IBM Plex Mono', monospace",
                color: visible ? `rgba(176,184,208,${t.opacity})` : "rgba(120,110,100,0.1)",
                fontStyle: "italic", transition: "color 0.3s ease",
              }}>
                {visible ? `💭 ${t.text}` : "· · ·"}
              </span>
              {visible && <span style={{ fontSize: 8, fontFamily: "'IBM Plex Mono', monospace", color: "#504838", marginLeft: 6 }}>L{t.layer}</span>}
            </div>
          );
        })}
      </div>
      <Stat>layer {thoughts[Math.min(visibleIdx, thoughts.length - 1)]?.layer} / 32 · representations opaque to us</Stat>
    </div>
  );
}

function PolyglotAnimation({ progress }) {
  // One neuron, many languages converging to a single meaning
  const words = [
    { text: "dog", lang: "EN", angle: 0, color: "#e8c872" },
    { text: "chien", lang: "FR", angle: Math.PI * 0.4, color: "#c4a0d8" },
    { text: "犬", lang: "JA", angle: Math.PI * 0.8, color: "#a8c4a0" },
    { text: "كلب", lang: "AR", angle: Math.PI * 1.2, color: "#88b8c8" },
    { text: "Hund", lang: "DE", angle: Math.PI * 1.6, color: "#c89888" },
  ];
  const cx = 140, cy = 70;
  const convergeT = Math.min(progress * 1.5, 1);
  const showCore = progress > 0.7;
  const coreT = showCore ? (progress - 0.7) / 0.3 : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width="280" height="150" viewBox="0 0 280 150">
        {/* connection lines */}
        {words.map((w, i) => {
          const startR = 60; const endR = 5 * (1 - convergeT);
          const r = startR * (1 - convergeT) + endR;
          const x = cx + Math.cos(w.angle) * r;
          const y = cy + Math.sin(w.angle) * r;
          return <line key={`l${i}`} x1={cx} y1={cy} x2={x} y2={y} stroke={w.color} strokeWidth={1} opacity={0.2 + convergeT * 0.3} strokeDasharray="3 2" />;
        })}

        {/* words converging */}
        {words.map((w, i) => {
          const startR = 60; const endR = 0;
          const r = startR * (1 - convergeT * 0.85);
          const x = cx + Math.cos(w.angle) * r;
          const y = cy + Math.sin(w.angle) * r;
          const size = convergeT > 0.9 ? 8 + (1 - convergeT) * 30 : 10;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={size + 4} fill={w.color + "15"} />
              <text x={x} y={y - 7} textAnchor="middle" fontSize="12" fill={w.color} fontFamily="'IBM Plex Mono', monospace" style={{ transition: "all 0.3s ease" }}>{w.text}</text>
              <text x={x} y={y + 7} textAnchor="middle" fontSize="7" fill="#706858" fontFamily="'IBM Plex Mono', monospace">{w.lang}</text>
            </g>
          );
        })}

        {/* core concept */}
        {showCore && (
          <g opacity={coreT}>
            <circle cx={cx} cy={cy} r={18} fill="rgba(176,184,208,0.15)" stroke="#b0b8d0" strokeWidth={1.5} />
            <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fill="#b0b8d0" fontFamily="'IBM Plex Mono', monospace" fontWeight="500">🐕</text>
          </g>
        )}

        <Stat svg x="140" y="145">{showCore ? "concept without language · neuron #47,291" : `${words.length} languages → 1 activation`}</Stat>
      </svg>
    </div>
  );
}

// ════════════════════════════════════════════
//  COMPONENT MAP
// ════════════════════════════════════════════
const ANIM_COMPONENTS = {
  indexing: IndexingAnimation, embedding: EmbeddingAnimation, rag: RagAnimation,
  thinking: ThinkingAnimation, attention: AttentionAnimation, beamSearch: BeamSearchAnimation,
  chainOfThought: ChainOfThoughtAnimation, analogy: AnalogyAnimation,
  revision: RevisionAnimation, decoding: DecodingAnimation, temperature: TemperatureAnimation, weaving: WeavingAnimation,
  context: ContextAnimation, energy: EnergyAnimation, tokenizer: TokenizerAnimation,
  imageGen: ImageGenAnimation, voice: VoiceAnimation, vision: VisionAnimation,
  guardrail: GuardrailAnimation, rlhf: RlhfAnimation,
  superposition: SuperpositionAnimation, forgetting: ForgettingAnimation, hallucination: HallucinationAnimation,
  emergence: EmergenceAnimation, innerMonologue: InnerMonologueAnimation, polyglot: PolyglotAnimation,
};

// ════════════════════════════════════════════
//  VIEWER
// ════════════════════════════════════════════
function AnimViewer({ animKey }) {
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(true);
  const startRef = useRef(Date.now());
  const frameRef = useRef(null);
  const anim = ANIMATIONS[animKey];
  const AnimComponent = ANIM_COMPONENTS[animKey];
  const catColor = CAT_COLORS[anim.category];

  useEffect(() => { startRef.current = Date.now(); setProgress(0); setPlaying(true); }, [animKey]);
  useEffect(() => {
    if (!playing) { cancelAnimationFrame(frameRef.current); return; }
    const duration = 6000;
    const frame = () => { setProgress(((Date.now() - startRef.current) % duration) / duration); frameRef.current = requestAnimationFrame(frame); };
    frameRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameRef.current);
  }, [playing]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "32px 24px", background: "rgba(45,40,35,0.4)", borderRadius: 16, border: `1px solid ${catColor}22`, minHeight: 300, justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 22 }}>{anim.icon}</span>
        <div>
          <div style={{ fontSize: 16, fontFamily: "'IBM Plex Mono', monospace", color: "#d4c8a8", letterSpacing: 0.3 }}>{anim.label}</div>
          <div style={{ display: "flex", gap: 8 }}>
            {anim.metaphor && <span style={{ fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", color: catColor, textTransform: "uppercase", letterSpacing: 1.5 }}>metaphorical</span>}
            {anim.category === "speculative" && <span style={{ fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", color: "#b0b8d0", textTransform: "uppercase", letterSpacing: 1.5 }}>speculative</span>}
          </div>
        </div>
      </div>
      <AnimComponent progress={progress} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
        <button onClick={() => setPlaying(!playing)} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${catColor}44`, background: "rgba(45,40,35,0.6)", color: catColor, cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>{playing ? "pause" : "play"}</button>
        <button onClick={() => { startRef.current = Date.now(); setProgress(0); setPlaying(true); }} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid rgba(180,160,120,0.15)", background: "rgba(45,40,35,0.6)", color: "#8a8070", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>restart</button>
      </div>
      <div style={{ maxWidth: 360, textAlign: "center", fontSize: 13, lineHeight: 1.7, color: "#8a8070", fontFamily: "'Newsreader', Georgia, serif", fontStyle: "italic" }}>{anim.description}</div>
    </div>
  );
}

// ════════════════════════════════════════════
//  MAIN APP
// ════════════════════════════════════════════
export default function App() {
  const [selected, setSelected] = useState("indexing");
  const [activeCategory, setActiveCategory] = useState(null);
  const filteredAnims = activeCategory ? Object.entries(ANIMATIONS).filter(([_, v]) => v.category === activeCategory) : Object.entries(ANIMATIONS);

  return (
    <div style={{ minHeight: "100vh", background: "#1e1b18", color: "#d4c8a8", fontFamily: "'Newsreader', 'Georgia', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,300;0,400;0,600;1,300&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
        @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0 } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(180,160,120,0.2); border-radius: 2px; }
      `}</style>

      <div style={{ padding: "28px 32px 20px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5 }}>learning moments</span>
          <span style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: "#706858" }}>{Object.keys(ANIMATIONS).length} animations</span>
        </div>
        <p style={{ fontSize: 15, color: "#8a8070", maxWidth: 600, lineHeight: 1.6, margin: 0 }}>
          How does a language model think? Each animation reveals a different step — some literal, some metaphorical, some speculative. The speculative ones visualize processes we can't yet fully observe or explain.
        </p>
      </div>

      <div style={{ padding: "0 32px 20px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button onClick={() => setActiveCategory(null)} style={{ padding: "6px 14px", borderRadius: 20, border: "1px solid", borderColor: !activeCategory ? "rgba(180,160,120,0.4)" : "rgba(180,160,120,0.12)", background: !activeCategory ? "rgba(180,160,120,0.1)" : "transparent", color: !activeCategory ? "#d4c8a8" : "#706858", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, transition: "all 0.2s ease" }}>all</button>
          {Object.entries(CATEGORIES).map(([key, label]) => (
            <button key={key} onClick={() => setActiveCategory(activeCategory === key ? null : key)} style={{ padding: "6px 14px", borderRadius: 20, border: "1px solid", borderColor: activeCategory === key ? CAT_COLORS[key] + "66" : "rgba(180,160,120,0.12)", background: activeCategory === key ? CAT_COLORS[key] + "18" : "transparent", color: activeCategory === key ? CAT_COLORS[key] : "#706858", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, transition: "all 0.2s ease" }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 32px 40px", display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, alignContent: "start" }}>
          {filteredAnims.map(([key, anim]) => {
            const catColor = CAT_COLORS[anim.category]; const isSelected = selected === key;
            return (
              <button key={key} onClick={() => setSelected(key)} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, padding: "14px 14px 12px", borderRadius: 10, border: "1px solid", cursor: "pointer", borderColor: isSelected ? catColor + "55" : "rgba(180,160,120,0.08)", background: isSelected ? catColor + "12" : "rgba(45,40,35,0.3)", transition: "all 0.2s ease", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, width: "100%" }}>
                  <span style={{ fontSize: 16 }}>{anim.icon}</span>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 3 }}>
                    {anim.metaphor && <span style={{ fontSize: 7, fontFamily: "'IBM Plex Mono', monospace", color: catColor, textTransform: "uppercase", letterSpacing: 1, opacity: 0.7 }}>meta</span>}
                    {anim.category === "speculative" && <span style={{ fontSize: 7, fontFamily: "'IBM Plex Mono', monospace", color: "#b0b8d0", textTransform: "uppercase", letterSpacing: 1, opacity: 0.7 }}>spec</span>}
                  </div>
                </div>
                <span style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: isSelected ? "#d4c8a8" : "#8a8070", lineHeight: 1.3 }}>{anim.label}</span>
                <span style={{ fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", color: catColor, opacity: 0.6, textTransform: "uppercase", letterSpacing: 1 }}>{anim.category}</span>
              </button>
            );
          })}
        </div>

        <div style={{ flex: "1 1 420px", position: "sticky", top: 20, alignSelf: "flex-start" }}>
          <AnimViewer animKey={selected} />
        </div>
      </div>
    </div>
  );
}
