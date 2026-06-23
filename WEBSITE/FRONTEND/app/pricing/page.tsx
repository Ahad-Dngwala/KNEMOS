import Link from 'next/link'

const CHECK = '○'
const CROSS = '×'
const DASH = '—'

const features = [
  { category: 'Core Intelligence', label: 'Local AI (Qwen2.5)', free: CHECK, business: CHECK, enterprise: CHECK },
  { category: 'Core Intelligence', label: 'Wolfram Engine Integration', free: CHECK, business: CHECK, enterprise: CHECK },
  { category: 'Core Intelligence', label: 'Semantic Memory System', free: CHECK, business: CHECK, enterprise: CHECK },
  { category: 'Core Intelligence', label: 'Browser Extension', free: CHECK, business: CHECK, enterprise: CHECK },
  { category: 'Core Intelligence', label: 'Workspace Automation', free: CHECK, business: CHECK, enterprise: CHECK },
  { category: 'Analytics', label: 'Focus Analytics & Heatmaps', free: CHECK, business: CHECK, enterprise: CHECK },
  { category: 'Analytics', label: 'Deep Focus Timer', free: CHECK, business: CHECK, enterprise: CHECK },
  { category: 'Analytics', label: 'Focus Grade System (S–D)', free: CHECK, business: CHECK, enterprise: CHECK },
  { category: 'Analytics', label: 'Session Stability Scores', free: CHECK, business: CHECK, enterprise: CHECK },
  { category: 'Teams', label: 'Multi-user Workspaces', free: CROSS, business: CHECK, enterprise: CHECK },
  { category: 'Teams', label: 'Shared Analytics Dashboard', free: CROSS, business: CHECK, enterprise: CHECK },
  { category: 'Teams', label: 'Cloud Sync', free: CROSS, business: CHECK, enterprise: CHECK },
  { category: 'Teams', label: 'Admin Controls', free: CROSS, business: CHECK, enterprise: CHECK },
  { category: 'Enterprise', label: 'Org-wide Deployment', free: CROSS, business: CROSS, enterprise: CHECK },
  { category: 'Enterprise', label: 'Centralized Policies', free: CROSS, business: CROSS, enterprise: CHECK },
  { category: 'Enterprise', label: 'Advanced Admin Tooling', free: CROSS, business: CROSS, enterprise: CHECK },
  { category: 'Enterprise', label: 'Priority Support SLAs', free: CROSS, business: CROSS, enterprise: CHECK },
  { category: 'Enterprise', label: 'Enterprise Onboarding', free: CROSS, business: DASH, enterprise: CHECK },
]

export default function PricingPage() {
  const categories = [...new Set(features.map(f => f.category))]

  return (
    <main className="min-h-screen bg-background py-24 px-6 relative text-foreground transition-colors duration-300">
      <Link href="/" className="absolute top-8 left-8 text-xs font-bold tracking-[2px] uppercase text-foreground/50 hover:text-foreground transition-colors flex items-center gap-2">
        <span>←</span> Back to Home
      </Link>
      
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-[100] tracking-[-2px] font-display mb-4 text-foreground">Pricing</h1>
          <p className="text-foreground/60 max-w-xl mx-auto text-sm leading-relaxed">
            All core intelligence features are free, forever. KNEMOS is local-first by design —
            your data never leaves your machine.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-background border border-border overflow-hidden rounded-md">

          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] border-b-2 border-border">
            <div className="p-6 border-r border-border">
              <span className="text-xs font-bold tracking-[2px] uppercase text-foreground/50">Features</span>
            </div>
            
            {/* Free */}
            <div className="p-6 border-r border-border text-center bg-foreground/5">
              <div className="text-xs font-bold tracking-[2px] uppercase text-foreground/50 mb-2">Free</div>
              <div className="text-3xl font-[100] font-display text-foreground">$0</div>
              <div className="text-xs text-foreground/50 mt-1">forever</div>
              <Link href="/signup" className="mt-4 block text-center text-xs font-bold uppercase tracking-[2px] border border-border px-4 py-2 hover:bg-foreground hover:text-background transition-colors text-foreground">
                Get Started
              </Link>
            </div>

            {/* Business */}
            <div className="p-6 border-r border-border text-center bg-foreground text-background">
              <div className="text-xs font-bold tracking-[2px] uppercase text-background/50 mb-2">Business</div>
              <div className="text-3xl font-[100] font-display h-[36px] flex items-center justify-center">TBA</div>
              <div className="text-xs text-background/50 mt-1">per user / mo</div>
              <button disabled className="mt-4 block w-full text-center text-xs font-bold uppercase tracking-[2px] border border-background/20 px-4 py-2 text-background/50 cursor-not-allowed">
                Coming Soon
              </button>
            </div>

            {/* Enterprise */}
            <div className="p-6 text-center bg-foreground/5">
              <div className="text-xs font-bold tracking-[2px] uppercase text-foreground/50 mb-2">Enterprise</div>
              <div className="text-3xl font-[100] font-display text-foreground h-[36px] flex items-center justify-center">Custom</div>
              <div className="text-xs text-foreground/50 mt-1">contact us</div>
              <button disabled className="mt-4 block w-full text-center text-xs font-bold uppercase tracking-[2px] border border-border px-4 py-2 text-foreground/50 cursor-not-allowed">
                Contact Us
              </button>
            </div>
          </div>

          {/* Feature Rows */}
          {categories.map((cat, catIdx) => (
            <div key={cat}>
              {/* Category Header */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr] bg-border/20 border-b border-border">
                <div className="px-6 py-3 border-r border-border col-span-4">
                  <span className="text-[10px] font-bold tracking-[2px] uppercase text-foreground/50">{cat}</span>
                </div>
              </div>

              {/* Feature Rows in category */}
              {features.filter(f => f.category === cat).map((feature, i) => (
                <div key={feature.label} className={`grid grid-cols-[2fr_1fr_1fr_1fr] border-b ${catIdx === categories.length - 1 && i === features.filter(f => f.category === cat).length - 1 ? '' : 'border-border/50'}`}>
                  <div className="px-6 py-4 border-r border-border/50 text-sm text-foreground/80">{feature.label}</div>
                  <div className="px-6 py-4 border-r border-border/50 text-center text-sm bg-foreground/5">
                    <span className={feature.free === CHECK ? 'text-foreground font-bold' : 'text-foreground/30'}>{feature.free}</span>
                  </div>
                  <div className="px-6 py-4 border-r border-border/50 text-center text-sm bg-foreground text-background">
                    <span className={feature.business === CHECK ? 'text-background font-bold' : feature.business === DASH ? 'text-background/40' : 'text-background/40'}>{feature.business}</span>
                  </div>
                  <div className="px-6 py-4 text-center text-sm bg-foreground/5">
                    <span className={feature.enterprise === CHECK ? 'text-foreground font-bold' : 'text-foreground/30'}>{feature.enterprise}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}

        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-xs text-foreground/50 max-w-lg mx-auto leading-relaxed">
            KNEMOS is fully local-first. All intelligence features work offline with no subscription required. 
            Business and Enterprise tiers add team collaboration and cloud capabilities.
          </p>
        </div>
      </div>
    </main>
  )
}
