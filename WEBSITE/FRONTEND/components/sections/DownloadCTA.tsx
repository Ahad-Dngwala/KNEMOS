import Link from 'next/link'

export const DownloadCTA = () => (
  <section className="bg-white dark:bg-black py-24 px-6 relative border-t-2 border-black dark:border-white transition-colors duration-300">
    <div className="max-w-6xl mx-auto">
      
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2px_2fr] gap-[60px] items-center">
        
        {/* Left Side */}
        <div>
          <h2 className="text-6xl font-[100] tracking-[-2px] mb-8 font-display text-black dark:text-white">
            Get Started
          </h2>
          <div className="w-[40px] h-[40px] border-2 border-black dark:border-white rotate-45 mb-8"></div>
          <div className="space-y-4">
            <div>
              <h4 className="text-xs tracking-[2px] uppercase font-bold text-black dark:text-white mb-1">Platform</h4>
              <p className="text-sm text-[#666] dark:text-[#aaa]">Windows 10/11</p>
            </div>
            <div>
              <h4 className="text-xs tracking-[2px] uppercase font-bold text-black dark:text-white mb-1">License</h4>
              <p className="text-sm text-[#666] dark:text-[#aaa]">MIT Open Source</p>
            </div>
            <div>
              <h4 className="text-xs tracking-[2px] uppercase font-bold text-black dark:text-white mb-1">Dependencies</h4>
              <p className="text-sm text-[#666] dark:text-[#aaa]">Ollama · Tesseract OCR</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-[2px] h-full bg-black dark:bg-[#333]"></div>

        {/* Right Side */}
        <div className="bg-[#f8f8f8] dark:bg-[#111] p-12 border border-black dark:border-[#333] relative">
          <div className="absolute top-0 left-0 w-full h-[5px] bg-black dark:bg-white"></div>
          
          <h3 className="text-3xl font-[100] tracking-[-1px] font-display text-black dark:text-white mb-6">
            Ready to end tab hell?
          </h3>
          <p className="text-sm text-[#666] dark:text-[#999] mb-12 leading-relaxed">
            All AI processing runs on <strong>localhost</strong>. No data ever leaves your machine. 
            Experience a truly private, semantic workspace operating system.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <Link
              href="/download"
              className="cta-button"
            >
              Download Now
            </Link>
            <a
              href="https://github.com/Ahad-Dngwala/KNEMOS"
              className="inline-flex items-center text-xs tracking-[2px] uppercase font-bold text-black dark:text-white hover:text-[#666] dark:hover:text-[#aaa] transition-colors"
            >
              View GitHub <span>→</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  </section>
)
