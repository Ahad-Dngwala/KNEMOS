import Link from 'next/link'

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-[#fafafa] py-24 px-6 relative text-black">
      <Link href="/" className="absolute top-8 left-8 text-xs font-bold tracking-[2px] uppercase hover:text-[#888] transition-colors flex items-center gap-2">
        <span>←</span> Back to Home
      </Link>
      
      <div className="max-w-4xl mx-auto mt-8">
        <div className="text-center mb-16 relative">
          <h1 className="text-6xl font-[100] tracking-[-2px] font-display text-black mb-4">Documentation</h1>
          <div className="w-[30px] h-[30px] border border-black rotate-45 mx-auto"></div>
        </div>

        <div className="space-y-16">
          
          <section className="bg-white border border-black p-10">
            <h2 className="text-3xl font-[100] tracking-[-1px] font-display mb-6">Overview</h2>
            <p className="text-sm text-[#444] leading-relaxed mb-4">
              Modern operating systems were designed 30 years ago around files and folders. Today, knowledge workers live across 40+ browser tabs, multiple IDEs, local files, terminal sessions, and messaging apps simultaneously.
            </p>
            <p className="text-sm text-[#444] leading-relaxed">
              <strong>KNEMOS</strong> is a local-first AI productivity system that acts as a cognitive layer between the user and their computer. It automatically clusters your entire digital workspace into intelligent semantic groups, makes your screen history searchable in natural language, and measures your cognitive performance using Wolfram Language analytics.
            </p>
          </section>

          <section className="bg-[#f5f5f5] border border-black p-10">
            <h2 className="text-2xl font-bold tracking-[1px] uppercase mb-6">Step-by-Step Guide (For Beginners)</h2>
            <p className="text-sm text-[#444] leading-relaxed mb-8">Follow these instructions to get your KNEMOS productivity system up and running in minutes, even if you don't know how to code.</p>
            
            <div className="space-y-8">
              <div className="relative pl-8 border-l-2 border-black">
                <div className="absolute left-[-9px] top-0 bg-black text-white w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded-full">1</div>
                <h3 className="font-bold text-lg mb-2">Download & Install the Desktop App</h3>
                <p className="text-sm text-[#666] leading-relaxed">Sign up or Log in to this website. Once authenticated, navigate to the Downloads section and download `KNEMOS-Setup.exe`. Double-click the file to install it on your Windows computer. This will install both the visible UI and the invisible AI brain.</p>
              </div>

              <div className="relative pl-8 border-l-2 border-black">
                <div className="absolute left-[-9px] top-0 bg-black text-white w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded-full">2</div>
                <h3 className="font-bold text-lg mb-2">Open KNEMOS & Let it Boot</h3>
                <p className="text-sm text-[#666] leading-relaxed">Launch KNEMOS from your Start Menu. The very first time it boots, it may take a few minutes to silently install the local AI models (Tesseract OCR & ChromaDB vectors) on your computer. You will see a dark loading screen. Do not close it.</p>
              </div>

              <div className="relative pl-8 border-l-2 border-black">
                <div className="absolute left-[-9px] top-0 bg-black text-white w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded-full">3</div>
                <h3 className="font-bold text-lg mb-2">Copy your Secret Authentication Token</h3>
                <p className="text-sm text-[#666] leading-relaxed">Once the dashboard opens, navigate to the <strong>Settings</strong> panel (the gear icon). Scroll to the bottom and find the "Auth Token" section. Click the button to copy your unique, randomly-generated secure token to your clipboard.</p>
              </div>

              <div className="relative pl-8 border-l-2 border-black">
                <div className="absolute left-[-9px] top-0 bg-black text-white w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded-full">4</div>
                <h3 className="font-bold text-lg mb-2">Install the Chrome Extension</h3>
                <p className="text-sm text-[#666] leading-relaxed">To allow KNEMOS to track what browser tabs you use (so it can calculate your Focus Score), install the KNEMOS Extension in Google Chrome. Open the extension, paste the token you copied in Step 3, and click "Connect".</p>
              </div>

              <div className="relative pl-8 border-l-2 border-black">
                <div className="absolute left-[-9px] top-0 bg-black text-white w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded-full">5</div>
                <h3 className="font-bold text-lg mb-2">Start Focusing!</h3>
                <p className="text-sm text-[#666] leading-relaxed">You are all set! Group your tabs and apps into a "Workspace" in the desktop app. Click "Activate Deep Focus" to instantly blackout distractions. Any apps not in your workspace will automatically be minimized to keep you on track!</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-[1px] uppercase mb-6 border-b border-[#E0E0E0] pb-4">Core Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-[#E0E0E0] p-8 hover:border-black transition-colors">
                <div className="text-3xl font-display mb-4">01</div>
                <h3 className="font-bold mb-2">Semantic Workspace Clustering</h3>
                <p className="text-sm text-[#666] leading-relaxed">AI automatically groups your browser tabs, VS Code windows, terminal sessions, and local folders into named semantic workspaces—no manual tagging or folder creation required.</p>
              </div>
              <div className="bg-white border border-[#E0E0E0] p-8 hover:border-black transition-colors">
                <div className="text-3xl font-display mb-4">02</div>
                <h3 className="font-bold mb-2">Memory Lane</h3>
                <p className="text-sm text-[#666] leading-relaxed">Periodically captures screenshots, runs OCR, generates embeddings, and indexes everything into ChromaDB. Search your entire workspace history in natural language.</p>
              </div>
              <div className="bg-white border border-[#E0E0E0] p-8 hover:border-black transition-colors">
                <div className="text-3xl font-display mb-4">03</div>
                <h3 className="font-bold mb-2">Wolfram Intelligence Layer</h3>
                <p className="text-sm text-[#666] leading-relaxed">Computational analytics providing deep productivity forecasts, context-switch tracking, and memory relationship graphs natively via Wolfram Engine.</p>
              </div>
              <div className="bg-white border border-[#E0E0E0] p-8 hover:border-black transition-colors">
                <div className="text-3xl font-display mb-4">04</div>
                <h3 className="font-bold mb-2">RAM Recovery Engine</h3>
                <p className="text-sm text-[#666] leading-relaxed">Intelligently hibernates inactive workspaces and calculates live RAM/CPU savings, tracking efficiency through the local backend.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-[1px] uppercase mb-6 border-b border-[#E0E0E0] pb-4">AI Pipeline</h2>
            <div className="bg-black text-white p-8 space-y-6 font-mono text-sm">
              <div>
                <strong className="text-[#00C896]">Step 1 — Data Collection</strong>
                <p className="text-[#888] mt-1">psutil + pywin32 + watchdog + mss + Chrome Extension</p>
              </div>
              <div>
                <strong className="text-[#00C896]">Step 2 — Semantic Embeddings</strong>
                <p className="text-[#888] mt-1">mxbai-embed-large (via Ollama). High-fidelity semantic vectors.</p>
              </div>
              <div>
                <strong className="text-[#00C896]">Step 3 — Clustering</strong>
                <p className="text-[#888] mt-1">HDBSCAN. Semantically related resources → workspace clusters.</p>
              </div>
              <div>
                <strong className="text-[#00C896]">Step 4 — Workspace Naming</strong>
                <p className="text-[#888] mt-1">Ollama + Qwen2.5-7B (standard) / Qwen2.5-3B (low-end).</p>
              </div>
              <div>
                <strong className="text-[#00C896]">Step 5 — Memory Indexing</strong>
                <p className="text-[#888] mt-1">Tesseract OCR + ChromaDB. Searchable vector memory.</p>
              </div>
              <div>
                <strong className="text-[#00C896]">Step 6 — Workflow Analytics</strong>
                <p className="text-[#888] mt-1">Wolfram Language. Cognitive Focus Score + predictions.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold tracking-[1px] uppercase mb-6 border-b border-[#E0E0E0] pb-4">Technology Stack</h2>
            <div className="bg-white border border-[#E0E0E0] overflow-hidden">
              <table className="w-full text-left text-sm">
                <tbody>
                  <tr className="border-b border-[#E0E0E0]"><th className="p-4 bg-[#f5f5f5] w-1/3 border-r border-[#E0E0E0]">Desktop Shell</th><td className="p-4">Tauri v2 (Rust-native backend)</td></tr>
                  <tr className="border-b border-[#E0E0E0]"><th className="p-4 bg-[#f5f5f5] w-1/3 border-r border-[#E0E0E0]">AI Backend</th><td className="p-4">FastAPI, Python 3.11, APScheduler, WebSockets</td></tr>
                  <tr className="border-b border-[#E0E0E0]"><th className="p-4 bg-[#f5f5f5] w-1/3 border-r border-[#E0E0E0]">AI / ML</th><td className="p-4">mxbai-embed-large, HDBSCAN, Ollama + Qwen2.5</td></tr>
                  <tr className="border-b border-[#E0E0E0]"><th className="p-4 bg-[#f5f5f5] w-1/3 border-r border-[#E0E0E0]">Vector DB & OCR</th><td className="p-4">ChromaDB, Tesseract</td></tr>
                  <tr className="border-b border-[#E0E0E0]"><th className="p-4 bg-[#f5f5f5] w-1/3 border-r border-[#E0E0E0]">System Monitor</th><td className="p-4">pywin32, psutil, watchdog, mss</td></tr>
                  <tr><th className="p-4 bg-[#f5f5f5] w-1/3 border-r border-[#E0E0E0]">Auth & Web</th><td className="p-4">Supabase Auth, Next.js 15, TailwindCSS</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="text-center p-12 bg-[#f5f5f5] border border-[#E0E0E0]">
            <h3 className="text-xl font-bold mb-4 text-black">Privacy First</h3>
            <p className="text-sm text-[#666] max-w-2xl mx-auto">
              No screenshots, embeddings, or workspace data are ever transmitted externally. The cloud only handles authentication and app updates. Everything else runs purely on 127.0.0.1.
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
