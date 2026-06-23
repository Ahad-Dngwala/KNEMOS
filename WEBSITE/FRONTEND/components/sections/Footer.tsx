'use client'
import Image from 'next/image'

export const Footer = () => (
  <footer className="bg-white dark:bg-black border-t-2 border-black dark:border-[#333] pt-16 overflow-hidden flex flex-col justify-between relative transition-colors duration-300">
    
    <div className="max-w-6xl mx-auto w-full px-6 flex flex-col md:flex-row items-start justify-between gap-12 mb-20">
      
      {/* Brand */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Image src="/KNEMOS.png" alt="KNEMOS Logo" width={32} height={32} className="w-8 h-8 object-contain dark:invert" />
          <div className="w-[10px] h-[10px] bg-black dark:bg-white"></div>
          <span className="text-2xl font-bold tracking-[-1px] font-display text-black dark:text-white">KNEMOS</span>
        </div>
        <p className="text-xs text-[#666] tracking-[0.5px] max-w-xs leading-relaxed">
          The local-first semantic operating system. <br />
          Built for deep work.
        </p>
      </div>

      {/* Links Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-xs font-bold tracking-[1px] uppercase text-black dark:text-white">
        <div className="flex flex-col gap-4">
          <span className="text-[#888] mb-2">Product</span>
          <a href="/download" className="hover:text-[#666] transition-colors flex items-center gap-2 group">
            Download <span className="opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">→</span>
          </a>
          <a href="#features" className="hover:text-[#666] transition-colors flex items-center gap-2 group">
            Features <span className="opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">→</span>
          </a>
          <a href="#how-it-works" className="hover:text-[#666] transition-colors flex items-center gap-2 group">
            Architecture <span className="opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">→</span>
          </a>
        </div>
        
        <div className="flex flex-col gap-4">
          <span className="text-[#888] mb-2">Resources</span>
          <a href="https://github.com/Ahad-Dngwala/KNEMOS" target="_blank" className="hover:text-[#666] transition-colors flex items-center gap-2 group">
            GitHub <span className="opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">↗</span>
          </a>
          <a href="https://github.com/Ahad-Dngwala/KNEMOS/wiki" target="_blank" className="hover:text-[#666] transition-colors flex items-center gap-2 group">
            Documentation <span className="opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">↗</span>
          </a>
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-[#888] mb-2">Account</span>
          <a href="/auth" className="hover:text-[#666] transition-colors flex items-center gap-2 group">
            Sign In <span className="opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">→</span>
          </a>
        </div>
      </div>
    </div>

    {/* Big Animated Typography Footer */}
    <div className="relative w-full border-t border-black/10 dark:border-white/10 pt-4 pb-2 bg-black dark:bg-white text-white dark:text-black overflow-hidden group">
      
      {/* Marquee Wrapper */}
      <div className="flex whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused] transition-all cursor-default">
        {/* We render the word twice to create a seamless loop. 
            Because we translateX(-50%), the first half must perfectly match the second half. */}
        <div className="flex items-center gap-16 px-8">
          <h1 className="text-[12vw] font-[100] tracking-[-5px] leading-none font-display">
            KNEMOS
          </h1>
          <div className="w-4 h-4 md:w-8 md:h-8 bg-white dark:bg-black rotate-45"></div>
          <h1 className="text-[12vw] font-[100] tracking-[-5px] leading-none font-display">
            WORKSPACE
          </h1>
          <div className="w-4 h-4 md:w-8 md:h-8 bg-white dark:bg-black rotate-45"></div>
          <h1 className="text-[12vw] font-[100] tracking-[-5px] leading-none font-display text-[#888]">
            SEMANTIC
          </h1>
          <div className="w-4 h-4 md:w-8 md:h-8 bg-white dark:bg-black rotate-45"></div>
          <h1 className="text-[12vw] font-[100] tracking-[-5px] leading-none font-display">
            KNEMOS
          </h1>
          <div className="w-4 h-4 md:w-8 md:h-8 bg-white dark:bg-black rotate-45"></div>
          <h1 className="text-[12vw] font-[100] tracking-[-5px] leading-none font-display">
            WORKSPACE
          </h1>
          <div className="w-4 h-4 md:w-8 md:h-8 bg-white dark:bg-black rotate-45"></div>
          <h1 className="text-[12vw] font-[100] tracking-[-5px] leading-none font-display text-[#888]">
            SEMANTIC
          </h1>
          <div className="w-4 h-4 md:w-8 md:h-8 bg-white dark:bg-black rotate-45"></div>
        </div>
      </div>
      
    </div>
    
  </footer>
)
