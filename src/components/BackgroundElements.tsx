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
    Star
} from 'lucide-react';

// Background floating elements for the opportunities section
const BackgroundElements = memo(() => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Left side floating icons */}
            <div
                className="absolute left-[3%] top-[25%] text-hackathon/25"
                style={{ animation: 'float-icon 15s ease-in-out infinite' }}
            >
                <Code2 size={40} strokeWidth={1.5} />
            </div>
            <div
                className="absolute left-[5%] top-[55%] text-internship/25"
                style={{ animation: 'float-icon 18s ease-in-out infinite', animationDelay: '-5s' }}
            >
                <Terminal size={36} strokeWidth={1.5} />
            </div>
            <div
                className="absolute left-[2%] top-[80%] text-contest/25"
                style={{ animation: 'float-icon 12s ease-in-out infinite', animationDelay: '-8s' }}
            >
                <Trophy size={32} strokeWidth={1.5} />
            </div>

            {/* Right side floating icons */}
            <div
                className="absolute right-[3%] top-[30%] text-primary/25"
                style={{ animation: 'float-icon 16s ease-in-out infinite', animationDelay: '-3s' }}
            >
                <Rocket size={38} strokeWidth={1.5} />
            </div>
            <div
                className="absolute right-[5%] top-[60%] text-hackathon/25"
                style={{ animation: 'float-icon 14s ease-in-out infinite', animationDelay: '-6s' }}
            >
                <Lightbulb size={34} strokeWidth={1.5} />
            </div>
            <div
                className="absolute right-[2%] top-[85%] text-internship/25"
                style={{ animation: 'float-icon 17s ease-in-out infinite', animationDelay: '-10s' }}
            >
                <GitBranch size={30} strokeWidth={1.5} />
            </div>

            {/* Scattered floating elements */}
            <div
                className="absolute left-[15%] top-[40%] text-contest/20"
                style={{ animation: 'float-slow 20s ease-in-out infinite', animationDelay: '-7s' }}
            >
                <Braces size={28} strokeWidth={1.5} />
            </div>
            <div
                className="absolute right-[18%] top-[45%] text-primary/20"
                style={{ animation: 'float-reverse 18s ease-in-out infinite', animationDelay: '-4s' }}
            >
                <Zap size={26} strokeWidth={1.5} />
            </div>
            <div
                className="absolute left-[12%] top-[70%] text-hackathon/20"
                style={{ animation: 'float-icon 22s ease-in-out infinite', animationDelay: '-12s' }}
            >
                <Coffee size={24} strokeWidth={1.5} />
            </div>
            <div
                className="absolute right-[14%] top-[75%] text-accent/20"
                style={{ animation: 'float-slow 19s ease-in-out infinite', animationDelay: '-9s' }}
            >
                <Hash size={28} strokeWidth={1.5} />
            </div>

            {/* Large floating code symbols */}
            <div
                className="absolute left-[8%] top-[35%] text-hackathon/15"
                style={{ animation: 'float-slow 25s ease-in-out infinite' }}
            >
                <span className="font-mono text-6xl font-bold">{`{`}</span>
            </div>
            <div
                className="absolute right-[8%] top-[50%] text-internship/15"
                style={{ animation: 'float-reverse 22s ease-in-out infinite', animationDelay: '-8s' }}
            >
                <span className="font-mono text-6xl font-bold">{`}`}</span>
            </div>
            <div
                className="absolute left-[6%] top-[65%] text-contest/15"
                style={{ animation: 'float-slow 20s ease-in-out infinite', animationDelay: '-4s' }}
            >
                <span className="font-mono text-5xl font-bold">{`<`}</span>
            </div>
            <div
                className="absolute right-[6%] top-[72%] text-primary/15"
                style={{ animation: 'float-reverse 23s ease-in-out infinite', animationDelay: '-11s' }}
            >
                <span className="font-mono text-5xl font-bold">{`/>`}</span>
            </div>

            {/* Glowing orbs in background - full page */}
            <div
                className="absolute left-[10%] top-[20%] w-64 h-64 bg-hackathon/10 rounded-full blur-[100px]"
                style={{ animation: 'pulse-slow 12s ease-in-out infinite' }}
            />
            <div
                className="absolute right-[15%] top-[40%] w-72 h-72 bg-internship/10 rounded-full blur-[100px]"
                style={{ animation: 'pulse-slow 15s ease-in-out infinite', animationDelay: '-5s' }}
            />
            <div
                className="absolute left-[20%] top-[60%] w-56 h-56 bg-contest/10 rounded-full blur-[100px]"
                style={{ animation: 'pulse-slow 10s ease-in-out infinite', animationDelay: '-8s' }}
            />
            <div
                className="absolute right-[25%] top-[75%] w-48 h-48 bg-primary/10 rounded-full blur-[100px]"
                style={{ animation: 'pulse-slow 14s ease-in-out infinite', animationDelay: '-3s' }}
            />
            <div
                className="absolute left-[40%] top-[85%] w-60 h-60 bg-accent/10 rounded-full blur-[100px]"
                style={{ animation: 'pulse-slow 11s ease-in-out infinite', animationDelay: '-7s' }}
            />

            {/* Sparkle elements */}
            <div
                className="absolute left-[25%] top-[30%] text-primary/30"
                style={{ animation: 'float-icon 8s ease-in-out infinite', animationDelay: '-2s' }}
            >
                <Sparkles size={20} strokeWidth={1.5} />
            </div>
            <div
                className="absolute right-[28%] top-[55%] text-accent/30"
                style={{ animation: 'float-icon 10s ease-in-out infinite', animationDelay: '-6s' }}
            >
                <Star size={18} strokeWidth={1.5} />
            </div>
            <div
                className="absolute left-[30%] top-[78%] text-hackathon/30"
                style={{ animation: 'float-icon 9s ease-in-out infinite', animationDelay: '-4s' }}
            >
                <Sparkles size={22} strokeWidth={1.5} />
            </div>
        </div>
    );
});

BackgroundElements.displayName = 'BackgroundElements';

export default BackgroundElements;
