import { memo } from 'react';
import {
  Code2,
  Terminal,
  Braces,
  Rocket,
  Trophy,
  Lightbulb,
  Zap,
  GitBranch,
  Coffee,
  Hash,
  Sparkles,
  Star,
  Briefcase,
  GraduationCap,
  Building2,
  Laptop,
  Cpu,
  Globe,
} from 'lucide-react';

// Background floating elements covering the complete webpage
const BackgroundElements = memo(() => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* ============================================================
          Left Flank Floating Icons
          ============================================================ */}
      <div
        className="absolute left-[2%] top-[12%] text-hackathon/40"
        style={{ animation: 'float-icon 14s ease-in-out infinite' }}
      >
        <Code2 size={40} strokeWidth={1.75} />
      </div>

      <div
        className="absolute left-[4%] top-[26%] text-job/40"
        style={{ animation: 'float-icon 18s ease-in-out infinite', animationDelay: '-2s' }}
      >
        <Briefcase size={36} strokeWidth={1.75} />
      </div>

      <div
        className="absolute left-[3%] top-[40%] text-internship/40"
        style={{ animation: 'float-icon 16s ease-in-out infinite', animationDelay: '-5s' }}
      >
        <GraduationCap size={36} strokeWidth={1.75} />
      </div>

      <div
        className="absolute left-[5%] top-[54%] text-contest/40"
        style={{ animation: 'float-icon 15s ease-in-out infinite', animationDelay: '-8s' }}
      >
        <Terminal size={36} strokeWidth={1.75} />
      </div>

      <div
        className="absolute left-[2%] top-[68%] text-primary/40"
        style={{ animation: 'float-icon 17s ease-in-out infinite', animationDelay: '-3s' }}
      >
        <Trophy size={34} strokeWidth={1.75} />
      </div>

      <div
        className="absolute left-[4%] top-[82%] text-job/40"
        style={{ animation: 'float-icon 19s ease-in-out infinite', animationDelay: '-11s' }}
      >
        <Building2 size={32} strokeWidth={1.75} />
      </div>

      <div
        className="absolute left-[3%] top-[94%] text-hackathon/35"
        style={{ animation: 'float-icon 13s ease-in-out infinite', animationDelay: '-6s' }}
      >
        <Laptop size={32} strokeWidth={1.75} />
      </div>

      {/* ============================================================
          Right Flank Floating Icons
          ============================================================ */}
      <div
        className="absolute right-[2%] top-[14%] text-primary/40"
        style={{ animation: 'float-icon 15s ease-in-out infinite', animationDelay: '-4s' }}
      >
        <Rocket size={42} strokeWidth={1.75} />
      </div>

      <div
        className="absolute right-[4%] top-[28%] text-contest/40"
        style={{ animation: 'float-icon 12s ease-in-out infinite', animationDelay: '-7s' }}
      >
        <Zap size={34} strokeWidth={1.75} />
      </div>

      <div
        className="absolute right-[3%] top-[44%] text-hackathon/40"
        style={{ animation: 'float-icon 16s ease-in-out infinite', animationDelay: '-1s' }}
      >
        <Lightbulb size={36} strokeWidth={1.75} />
      </div>

      <div
        className="absolute right-[5%] top-[58%] text-internship/40"
        style={{ animation: 'float-icon 17s ease-in-out infinite', animationDelay: '-9s' }}
      >
        <GitBranch size={34} strokeWidth={1.75} />
      </div>

      <div
        className="absolute right-[2%] top-[72%] text-accent/40"
        style={{ animation: 'float-icon 20s ease-in-out infinite', animationDelay: '-5s' }}
      >
        <Cpu size={32} strokeWidth={1.75} />
      </div>

      <div
        className="absolute right-[4%] top-[86%] text-internship/40"
        style={{ animation: 'float-icon 14s ease-in-out infinite', animationDelay: '-10s' }}
      >
        <Globe size={32} strokeWidth={1.75} />
      </div>

      {/* ============================================================
          Mid-Depth Floating Elements
          ============================================================ */}
      <div
        className="absolute left-[13%] top-[22%] text-contest/30"
        style={{ animation: 'float-slow 22s ease-in-out infinite', animationDelay: '-3s' }}
      >
        <Braces size={30} strokeWidth={1.75} />
      </div>

      <div
        className="absolute right-[14%] top-[36%] text-primary/30"
        style={{ animation: 'float-reverse 19s ease-in-out infinite', animationDelay: '-8s' }}
      >
        <Hash size={30} strokeWidth={1.75} />
      </div>

      <div
        className="absolute left-[11%] top-[58%] text-hackathon/30"
        style={{ animation: 'float-icon 24s ease-in-out infinite', animationDelay: '-12s' }}
      >
        <Coffee size={28} strokeWidth={1.75} />
      </div>

      <div
        className="absolute right-[12%] top-[76%] text-accent/30"
        style={{ animation: 'float-slow 21s ease-in-out infinite', animationDelay: '-4s' }}
      >
        <Sparkles size={28} strokeWidth={1.75} />
      </div>

      {/* ============================================================
          Large Floating Code Syntax Symbols
          ============================================================ */}
      <div
        className="absolute left-[7%] top-[32%] text-hackathon/20 select-none"
        style={{ animation: 'float-slow 26s ease-in-out infinite' }}
      >
        <span className="font-mono text-6xl font-bold">{`{`}</span>
      </div>

      <div
        className="absolute right-[7%] top-[48%] text-internship/20 select-none"
        style={{ animation: 'float-reverse 23s ease-in-out infinite', animationDelay: '-7s' }}
      >
        <span className="font-mono text-6xl font-bold">{`}`}</span>
      </div>

      <div
        className="absolute left-[5%] top-[74%] text-contest/20 select-none"
        style={{ animation: 'float-slow 22s ease-in-out infinite', animationDelay: '-5s' }}
      >
        <span className="font-mono text-5xl font-bold">{`<`}</span>
      </div>

      <div
        className="absolute right-[6%] top-[80%] text-primary/20 select-none"
        style={{ animation: 'float-reverse 25s ease-in-out infinite', animationDelay: '-11s' }}
      >
        <span className="font-mono text-5xl font-bold">{`/>`}</span>
      </div>

      {/* ============================================================
          Atmospheric Glowing Orbs Across Entire Viewport
          ============================================================ */}
      <div
        className="absolute left-[5%] top-[10%] w-80 h-80 bg-primary/10 rounded-full blur-[110px]"
        style={{ animation: 'pulse-slow 14s ease-in-out infinite' }}
      />
      <div
        className="absolute right-[8%] top-[25%] w-88 h-88 bg-accent/10 rounded-full blur-[120px]"
        style={{ animation: 'pulse-slow 16s ease-in-out infinite', animationDelay: '-4s' }}
      />
      <div
        className="absolute left-[12%] top-[45%] w-72 h-72 bg-hackathon/10 rounded-full blur-[100px]"
        style={{ animation: 'pulse-slow 13s ease-in-out infinite', animationDelay: '-7s' }}
      />
      <div
        className="absolute right-[10%] top-[60%] w-76 h-76 bg-internship/10 rounded-full blur-[110px]"
        style={{ animation: 'pulse-slow 15s ease-in-out infinite', animationDelay: '-2s' }}
      />
      <div
        className="absolute left-[15%] top-[75%] w-80 h-80 bg-job/10 rounded-full blur-[110px]"
        style={{ animation: 'pulse-slow 17s ease-in-out infinite', animationDelay: '-9s' }}
      />
      <div
        className="absolute right-[18%] top-[85%] w-68 h-68 bg-contest/10 rounded-full blur-[100px]"
        style={{ animation: 'pulse-slow 12s ease-in-out infinite', animationDelay: '-6s' }}
      />

      {/* ============================================================
          Ambient Sparkles & Micro Stars
          ============================================================ */}
      <div
        className="absolute left-[20%] top-[25%] text-primary/40"
        style={{ animation: 'float-icon 9s ease-in-out infinite', animationDelay: '-2s' }}
      >
        <Sparkles size={22} strokeWidth={1.75} />
      </div>
      <div
        className="absolute right-[22%] top-[50%] text-accent/40"
        style={{ animation: 'float-icon 11s ease-in-out infinite', animationDelay: '-6s' }}
      >
        <Star size={20} strokeWidth={1.75} />
      </div>
      <div
        className="absolute left-[24%] top-[70%] text-hackathon/40"
        style={{ animation: 'float-icon 10s ease-in-out infinite', animationDelay: '-4s' }}
      >
        <Sparkles size={24} strokeWidth={1.75} />
      </div>
      <div
        className="absolute right-[26%] top-[88%] text-job/40"
        style={{ animation: 'float-icon 12s ease-in-out infinite', animationDelay: '-8s' }}
      >
        <Star size={20} strokeWidth={1.75} />
      </div>
    </div>
  );
});

BackgroundElements.displayName = 'BackgroundElements';

export default BackgroundElements;
