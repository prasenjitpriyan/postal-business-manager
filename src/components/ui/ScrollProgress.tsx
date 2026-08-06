'use client';

import { motion, useScroll, useSpring } from 'motion/react';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 via-indigo-500 to-cyan-400 z-50 origin-left shadow-[0_0_10px_#3b82f6]"
      style={{ scaleX }}
    />
  );
}
