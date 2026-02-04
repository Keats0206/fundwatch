"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  intensity?: "subtle" | "medium" | "strong";
};

export function ShinyText({ children, className, delay = 0, intensity = "medium" }: Props) {
  const opacityMap = {
    subtle: 0.2,
    medium: 0.4,
    strong: 0.6,
  };

  return (
    <span className={cn("relative inline-block", className)}>
      <span className="relative z-10">{children}</span>
      <motion.span
        className="absolute inset-0 pointer-events-none"
        initial={{ x: "-100%", opacity: 0 }}
        animate={{ x: "200%", opacity: [0, opacityMap[intensity], 0] }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatDelay: 1.5,
          delay,
          ease: "easeInOut",
        }}
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
          filter: "blur(8px)",
        }}
      />
      <motion.span
        className="absolute inset-0 pointer-events-none"
        initial={{ x: "-100%", opacity: 0 }}
        animate={{ x: "200%", opacity: [0, opacityMap[intensity] * 0.6, 0] }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatDelay: 1.5,
          delay: delay + 0.3,
          ease: "easeInOut",
        }}
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
          filter: "blur(4px)",
        }}
      />
    </span>
  );
}
