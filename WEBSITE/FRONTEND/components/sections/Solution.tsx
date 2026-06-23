'use client'
import { motion } from 'framer-motion'


export const Solution = () => (
  <section className="bg-white dark:bg-black py-12 px-6 transition-colors duration-300">
    <div className="max-w-6xl mx-auto">
      <div className="w-full h-px bg-black dark:bg-[#333] mb-16"></div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-[1fr_2px_1fr] gap-[60px] items-center"
      >

        {/* Left Side */}
        <div className="text-right pr-5">
          <h2 className="text-6xl font-[100] tracking-[-2px] mb-8 relative inline-block font-display text-black dark:text-white">
            KNEMOS
            <br />
            understands.
            <div className="absolute left-[-40px] top-1/2 w-[30px] h-[30px] bg-black dark:bg-white -translate-y-1/2"></div>
          </h2>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-[2px] h-[300px] bg-black dark:bg-[#333] justify-self-center"></div>

        {/* Right Side */}
        <div className="pl-5">
          <p className="text-lg leading-[2] mb-8 text-black dark:text-white/80">
            KNEMOS reads every open window, browser tab, and file path.
            It groups them into named semantic workspaces automatically —
            no setup, no folders, no manual tagging.
          </p>
          
          <div className="inline-block px-5 py-2.5 border border-black dark:border-white text-xs tracking-[1px] uppercase relative text-white dark:text-black bg-black dark:bg-white">
            Zero Configuration
            <div className="absolute -bottom-[5px] -right-[5px] w-full h-full bg-black dark:bg-[#333] -z-10"></div>
          </div>
        </div>

      </motion.div>
    </div>
  </section>
)
