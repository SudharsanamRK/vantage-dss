import { motion } from "framer-motion";

export default function HealthGauge({ score }) {
  const color = score > 50 ? "#3b82f6" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center p-10 glass rounded-[2.5rem]">
      <svg className="w-56 h-56 transform -rotate-90">
        <circle
          cx="112"
          cy="112"
          r="100"
          stroke="#1e293b"
          strokeWidth="12"
          fill="transparent"
        />

        <motion.circle
          cx="112"
          cy="112"
          r="100"
          stroke={color}
          strokeWidth="12"
          fill="transparent"
          strokeDasharray="628"
          strokeLinecap="round"
          initial={{ strokeDashoffset: 628 }}
          animate={{
            strokeDashoffset: 628 - (628 * score) / 100
          }}
          transition={{
            duration: 1.5,
            ease: "easeOut"
          }}
        />
      </svg>

      <div className="absolute flex flex-col items-center">
        <span className="text-6xl font-black italic text-white leading-none">
          {score}
        </span>

        <span className="mt-2 text-[10px] font-bold text-slate-500 tracking-[0.4em] uppercase">
          Integrity Index
        </span>
      </div>
    </div>
  );
}
