'use client'

const pipeline = [
  { step: '01', name: 'Collection', detail: 'pywin32 / watchdog' },
  { step: '02', name: 'Embeddings', detail: 'all-MiniLM-L6-v2' },
  { step: '03', name: 'Clustering', detail: 'HDBSCAN density AI' },
  { step: '04', name: 'Analytics', detail: 'Wolfram Engine' },
]

export const HowItWorks = () => (
  <section id="how-it-works" className="bg-white dark:bg-black py-20 px-6 transition-colors duration-300">
    <div className="max-w-6xl mx-auto">
      
      <h2 className="text-5xl font-[100] text-center mb-[60px] tracking-[-1px] font-display text-black dark:text-white">
        Architecture Pipeline
      </h2>

      <div className="relative flex justify-between max-w-[900px] mx-auto mb-[100px]">
        {/* The connecting line */}
        <div className="absolute top-[20px] left-0 right-0 h-[2px] bg-black dark:bg-white z-0"></div>

        {pipeline.map((p) => (
          <div key={p.step} className="relative text-center flex-1 group cursor-default">
            {/* The Dot */}
            <div className="w-[40px] h-[40px] bg-white dark:bg-black border-2 border-black dark:border-white mx-auto mb-[30px] relative z-10 transition-all duration-300 group-hover:bg-black dark:group-hover:bg-white group-hover:rotate-45"></div>
            
            <h4 className="text-lg font-medium mb-2 tracking-[0.5px] text-black dark:text-white">{p.name}</h4>
            <p className="text-sm text-[#666] dark:text-[#aaa]">{p.detail}</p>
          </div>
        ))}
      </div>

    </div>
  </section>
)
