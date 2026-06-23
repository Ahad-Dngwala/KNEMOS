'use client'
import Link from 'next/link'
import { useState } from 'react'

const VERSIONS = [
  {
    version: 'v3.0',
    title: 'The Apple-Tier Overhaul',
    tag: 'Latest',
    type: 'Major UI/UX Update',
    date: 'June 2026',
    items: [
      { n: '01', title: 'Fluid Dark Mode', desc: 'Seamlessly toggle between Light and Dark mode using next-themes and Lucide icons in the navbar. Entire UI inverts perfectly.' },
      { n: '02', title: 'Native Page Transitions', desc: 'Framer Motion AnimatePresence now wraps the app router, causing routes to slide and fade in buttery smooth.' },
      { n: '03', title: 'Scroll Reveals & CountUp', desc: 'Added whileInView motion triggers to all major sections, plus a spring-animated CountUp module for live stats.' },
      { n: '04', title: 'Product Showcase Reel', desc: 'A gorgeous new 16:9 cinematic video container on the homepage to showcase KNEMOS in action.' },
      { n: '05', title: 'Interactive Pricing', desc: 'Pricing page now features an animated Monthly/Yearly toggle with 3D rolling price changes.' },
    ]
  },
  {
    version: 'v2.8',
    title: 'Premium UX Overhaul',
    tag: null,
    type: 'Major UI/UX Update',
    date: 'June 2026',
    items: [
      {
        n: '01',
        title: 'Interactive Hero Terminal',
        desc: 'Added a highly customized sleek, monochrome terminal simulation replacing static hero text.',
      },
      {
        n: '02',
        title: 'Magnetic Actions',
        desc: 'CTA buttons now implement Framer Motion spring physics, smoothly tracking mouse movements.',
      },
      {
        n: '03',
        title: 'Infinite Tech Marquee',
        desc: 'A seamless horizontally scrolling marquee added beneath the hero showcasing core technical pillars.',
      },
      {
        n: '04',
        title: 'Feature Glare Cards',
        desc: 'Implemented dynamic radial-gradient glare tracking on hover for all feature cards.',
      },
      {
        n: '05',
        title: 'Custom Cursor Spotlight & Scroll Line',
        desc: 'Replaced standard pointer with a global inverted-color cursor spotlight and fused native scrollbars into a custom scroll progress line.',
      },
    ]
  },
  {
    version: 'v2.7',
    title: 'First-Run Setup & UX Polish',
    tag: null,
    type: 'Major UX Update',
    date: 'June 2026',
    items: [
      {
        n: '01',
        title: 'First-Run Dependency Wizard',
        desc: 'Brand new guided setup overlay that appears on the very first launch. Checks for VC++ Redistributable, Python, Ollama, Wolfram Engine, and Tesseract OCR individually. Users can download each one with a single click and mark them as installed.',
      },
      {
        n: '02',
        title: 'Real-Time Boot Log Terminal',
        desc: 'The loading screen now shows a live, drip-fed terminal log of what is actually happening during startup — from port scanning to ChromaDB warm-up to WebSocket readiness — so users know exactly what the engine is doing.',
      },
      {
        n: '03',
        title: 'Fixed Open Logs & Restart Backend',
        desc: 'Both buttons on the error screen now correctly use the Tauri v2 shell API. "Open Logs" opens the knemos_backend.log file directly in Notepad. "Restart Backend" properly re-invokes the sidecar and reloads the UI with loading feedback.',
      },
      {
        n: '04',
        title: 'Hardened Sidecar Path Resolution',
        desc: 'The Rust backend launcher now searches 8 different candidate paths for backend.exe before giving up, including the NSIS install directory, resources folder, and sibling directories. Removed the hardcoded developer path that broke all fresh installs.',
      },
      {
        n: '05',
        title: 'Extension ZIP 404 Fix',
        desc: 'The Chrome Extension download was returning a 404 because the .zip file was excluded by the root .gitignore pattern. Force-tracked it using git add -f so it now uploads correctly to Vercel and serves without errors.',
      },
    ],
  },
  {
    version: 'v2.6',
    title: 'Security & Core UX Overhaul',
    tag: null,
    type: 'Critical Update',
    date: 'June 2026',
    items: [
      {
        n: '01',
        title: 'Deep Focus Visual Countdown',
        desc: 'Added a massive live countdown timer to the Deep Work overlay, accurately reflecting global settings (1m, 5m, 15m). When the timer hits zero, the session gracefully exits and all minimized windows are restored — fixing an infinite watchdog loop.',
      },
      {
        n: '02',
        title: 'Dynamic IPC Token Resolution',
        desc: 'Rewired the Rust IPC initialization to scan both LocalAppData and Roaming %APPDATA% paths for the .jwt_token, permanently eliminating 401 Unauthorized errors on fresh installs of any user.',
      },
      {
        n: '03',
        title: 'Production CORS Hardening',
        desc: 'Patched the FastAPI backend to strictly whitelist http://tauri.localhost origins only, securing the local IPC loop and fixing network rejections in PyInstaller production builds.',
      },
      {
        n: '04',
        title: 'Smart Download Redirect Engine',
        desc: 'The marketing site now routes authenticated users through a seamless next.config.ts redirect directly to the versioned GitHub Release .exe without exposing raw URLs.',
      },
    ],
  },
  {
    version: 'v2.5',
    title: 'Production Hardening',
    tag: null,
    type: 'Major Core Update',
    date: 'June 2026',
    items: [
      {
        n: '01',
        title: 'Architecture Rewrite (@dnd-kit)',
        desc: 'Replaced HTML5 drag-and-drop with a global overlay-driven architecture for fluid cross-workspace dragging.',
      },
      {
        n: '02',
        title: 'Scheduler & Telemetry Optimization',
        desc: 'Eliminated event loop blocking and SQLite spam via ahead-of-time process caching and MD5 payload deduplication. System latency dropped to ~15ms.',
      },
      {
        n: '03',
        title: 'Dynamic Contrast & Typography',
        desc: 'Integrated semantic CSS tokens (--ink, --bg-panel) ensuring perfect contrast on hover states while maintaining the strict monochrome identity.',
      },
      {
        n: '04',
        title: 'True Memory Metrics',
        desc: 'Multi-process apps like Chrome are now fully aggregated via psutil executable mapping, showing accurate total RAM usage.',
      },
      {
        n: '05',
        title: 'Inference Stability',
        desc: 'Replaced aggressive Ollama polling banners with graceful, demand-driven inference feedback to prevent UI blocking.',
      },
    ],
  },
]

const COMMITS = [
  { hash: 'f91a680', msg: 'Add first-run dependency setup overlay, real-time boot logs, fix Open Logs + Restart Backend' },
  { hash: '19c906b', msg: 'Force add zip file ignoring gitignore' },
  { hash: 'd5f7ede', msg: 'Update docs with beginner guide and latest v2.6 release notes' },
  { hash: '73ce25a', msg: 'Fix React TS errors and add Deep Focus timer UI' },
  { hash: 'f1b3592', msg: 'Fix: remove hardcoded user path, add robust multi-location sidecar search' },
  { hash: '8e6af60', msg: 'Update project name from KnemOS to KNEMOS, added Brand logo' },
  { hash: 'a913105', msg: 'Integrate Wolfram Engine analytics' },
  { hash: '699778e', msg: 'Desktop: migrate drag & polish UI styles' },
  { hash: 'b5f8b51', msg: 'Add Tauri dialog/fs plugins, auth, and UI updates' },
  { hash: '6285296', msg: 'Add WebSocket, onboarding, analytics & DnD fixes' },
]

const ROADMAP = [
  { title: 'Focus Streak Notifications', desc: 'Native Windows toast notifications showing daily focus streaks and productivity summaries.', status: 'Planned' },
  { title: 'Mobile Companion App', desc: 'iOS & Android app syncing your Focus Score and memory timeline via a local WiFi bridge.', status: 'Planned' },
  { title: 'Multi-Monitor Support', desc: 'Full multi-screen workspace awareness — KNEMOS tracks activity across all connected monitors simultaneously.', status: 'In Progress' },
  { title: 'GPT-4o Integration (Optional)', desc: 'Cloud LLM fallback option for users who want more powerful AI responses while maintaining local-first defaults.', status: 'Exploring' },
  { title: 'Weekly Productivity Reports', desc: 'Beautiful auto-generated PDF reports of your weekly focus patterns, top distractions, and improvement trends.', status: 'Planned' },
  { title: 'Custom Workspace Themes', desc: 'Per-workspace color themes — different accent colors for your "Design" vs "Coding" vs "Research" workspaces.', status: 'Planned' },
]

export default function UpdatesPage() {
  const [activeVersion, setActiveVersion] = useState('v3.0')

  const current = VERSIONS.find(v => v.version === activeVersion) ?? VERSIONS[0]

  return (
    <main className="min-h-screen bg-background py-24 px-6 relative text-foreground transition-colors duration-300">
      <Link href="/" className="absolute top-8 left-8 text-xs font-bold tracking-[2px] uppercase text-foreground/50 hover:text-foreground transition-colors flex items-center gap-2">
        <span>←</span> Back to Home
      </Link>

      <div className="max-w-5xl mx-auto mt-8">
        {/* Header */}
        <div className="text-center mb-16 relative">
          <h1 className="text-6xl font-[100] tracking-[-2px] font-display text-foreground mb-4">Release Updates</h1>
          <div className="w-[30px] h-[30px] border border-foreground rotate-45 mx-auto" />
        </div>

        {/* Version Switcher Tabs */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
          {VERSIONS.map(v => (
            <button
              key={v.version}
              onClick={() => setActiveVersion(v.version)}
              className={`flex-shrink-0 px-5 py-2 text-xs font-bold tracking-[2px] uppercase border transition-all ${
                activeVersion === v.version
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-foreground border-border hover:border-foreground'
              }`}
            >
              {v.version} {v.tag && <span className="ml-1 opacity-60">★</span>}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8">
          {/* Left: Release detail */}
          <div className="space-y-8">
            {/* Version Card */}
            <div className="bg-background border border-foreground p-10 relative">
              {current.tag && (
                <div className="absolute top-0 right-0 bg-foreground text-background px-4 py-1 text-xs font-bold tracking-[2px] uppercase">
                  {current.tag}
                </div>
              )}
              <h2 className="text-3xl font-[100] tracking-[-1px] font-display mb-1">{current.version} — {current.title}</h2>
              <div className="flex items-center gap-4 mb-8">
                <p className="text-xs text-[#888] tracking-widest uppercase">{current.type}</p>
                <span className="text-[#CCC]">·</span>
                <p className="text-xs text-[#888]">{current.date}</p>
              </div>

              <div className="space-y-6 text-sm text-foreground/80 leading-relaxed">
                {current.items.map(item => (
                  <div key={item.n} className="flex gap-4 group">
                    <span className="text-foreground font-bold flex-shrink-0 w-8 group-hover:text-foreground/50 transition-colors">{item.n}</span>
                    <div>
                      <strong className="text-foreground">{item.title}</strong>
                      <p className="mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Commit Log */}
            <div>
              <h3 className="text-xl font-bold tracking-[1px] uppercase mb-6 border-b border-border pb-4 text-foreground">Commit Log</h3>
              <div className="space-y-1">
                {COMMITS.map((commit, idx) => (
                  <a
                    key={idx}
                    href={`https://github.com/Ahad-Dngwala/KNEMOS/commit/${commit.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 py-3 border-b border-border/50 hover:bg-foreground/5 transition-colors px-3 group"
                  >
                    <span className="font-mono text-xs bg-foreground/5 border border-border px-2 py-1 text-foreground/60 flex-shrink-0 group-hover:border-foreground transition-colors">
                      {commit.hash}
                    </span>
                    <span className="text-sm text-foreground group-hover:underline">{commit.msg}</span>
                    <span className="ml-auto text-foreground/30 group-hover:text-foreground transition-colors flex-shrink-0">↗</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-black text-white dark:bg-[#111] p-8 transition-colors duration-300">
              <div className="text-xs uppercase tracking-[2px] font-bold mb-6 opacity-50">Project Stats</div>
              <div className="space-y-5">
                {[
                  { label: 'Total Versions', value: '4' },
                  { label: 'Commits', value: '50+' },
                  { label: 'Components', value: '55+' },
                  { label: 'API Endpoints', value: '25+' },
                  { label: 'Languages', value: 'Py · Rust · TS' },
                ].map(s => (
                  <div key={s.label} className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="text-xs text-white/50">{s.label}</span>
                    <span className="text-sm font-bold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What's Next */}
            <div className="bg-background border border-border p-6">
              <div className="text-xs uppercase tracking-[2px] font-bold mb-1 text-foreground">What&apos;s Next</div>
              <p className="text-xs text-foreground/50 mb-5">Upcoming features in development</p>
              <div className="space-y-3">
                {[
                  { label: 'Focus Streak Notifications', status: 'Planned' },
                  { label: 'Weekly PDF Reports', status: 'Planned' },
                  { label: 'Multi-Monitor Support', status: 'In Progress' },
                  { label: 'Custom Workspace Themes', status: 'Planned' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-foreground/80">{item.label}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.status === 'In Progress' ? 'bg-foreground text-background' : 'bg-foreground/5 text-foreground/50'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Download CTA */}
            <div className="bg-background border border-border p-6 text-center">
              <div className="text-xs uppercase tracking-[2px] font-bold mb-2 text-foreground">Get the Latest</div>
              <p className="text-xs text-foreground/60 mb-5">Download KNEMOS {VERSIONS[0].version} for Windows</p>
              <Link
                href="/download"
                className="block w-full bg-foreground text-background text-xs font-bold tracking-[2px] uppercase py-3 hover:opacity-80 transition-colors"
              >
                Download Now
              </Link>
            </div>
          </div>
        </div>

        {/* Roadmap Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold tracking-[1px] uppercase mb-2 border-b border-border pb-4 text-foreground">
            Product Roadmap
          </h3>
          <p className="text-sm text-foreground/50 mb-8">Features we are actively planning or building next.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ROADMAP.map(item => (
              <div
                key={item.title}
                className="bg-background border border-border p-6 transition-all duration-300 group hover:border-foreground hover:ring-1 hover:ring-foreground"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 flex-shrink-0 ${
                    item.status === 'In Progress'
                      ? 'bg-foreground text-background'
                      : item.status === 'Exploring'
                      ? 'bg-foreground/5 text-foreground/50'
                      : 'border border-border text-foreground/50'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-foreground/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}
