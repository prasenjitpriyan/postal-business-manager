'use client';

import { motion } from 'motion/react';

export interface TimelineStep {
  step: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface TimelineRevealProps {
  steps: TimelineStep[];
}

export function TimelineReveal({ steps }: TimelineRevealProps) {
  return (
    <div className="relative max-w-4xl mx-auto py-10 px-4">
      {/* Central animated vertical line */}
      <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-linear-to-b from-blue-500 via-indigo-500 to-cyan-500 opacity-30 -translate-x-1/2" />

      <div className="space-y-12 relative">
        {steps.map((item, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <motion.div
              key={`timeline-${idx}-${item.step}`}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: idx * 0.15, ease: 'easeOut' }}
              className={`flex flex-col md:flex-row items-start md:items-center ${
                isEven ? 'md:flex-row-reverse' : ''
              } gap-6 md:gap-12 relative`}
            >
              {/* Content Card */}
              <div className="w-full md:w-1/2">
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-md hover:border-blue-500/30 transition-all shadow-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400">
                      {item.step}
                    </span>
                    <h4 className="text-lg font-bold text-white">{item.title}</h4>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>

              {/* Node Badge on Timeline */}
              <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-slate-950 border-2 border-blue-500 flex items-center justify-center shadow-[0_0_15px_#3b82f6] z-10">
                {item.icon ? (
                  <div className="text-blue-400 w-5 h-5 flex items-center justify-center">{item.icon}</div>
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
                )}
              </div>

              {/* Empty Spacer Column for Desktop Alternate Layout */}
              <div className="hidden md:block w-1/2" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
