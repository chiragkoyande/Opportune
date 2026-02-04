import { memo } from 'react';
import {
    Code2,
    Terminal,
    Braces,
    Laptop,
    Rocket,
    Trophy,
    Lightbulb,
    Zap,
    GitBranch,
    Coffee,
    Hash,
    Cpu,
    Globe,
    Sparkles
} from 'lucide-react';

interface FloatingIcon {
    id: number;
    Icon: React.ElementType;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
    color: string;
}

// Pre-defined floating icons for coding/hackathon theme - more visible now
const floatingIcons: FloatingIcon[] = [
    { id: 1, Icon: Code2, x: 5, y: 12, size: 32, duration: 12, delay: 0, color: 'text-hackathon' },
    { id: 2, Icon: Terminal, x: 88, y: 8, size: 36, duration: 15, delay: -3, color: 'text-primary' },
    { id: 3, Icon: Braces, x: 12, y: 70, size: 28, duration: 14, delay: -5, color: 'text-internship' },
    { id: 4, Icon: Laptop, x: 92, y: 60, size: 34, duration: 13, delay: -2, color: 'text-contest' },
    { id: 5, Icon: Rocket, x: 50, y: 5, size: 40, duration: 16, delay: -7, color: 'text-hackathon' },
    { id: 6, Icon: Trophy, x: 78, y: 75, size: 32, duration: 11, delay: -1, color: 'text-primary' },
    { id: 7, Icon: Lightbulb, x: 8, y: 40, size: 30, duration: 17, delay: -4, color: 'text-accent' },
    { id: 8, Icon: Zap, x: 95, y: 30, size: 28, duration: 10, delay: -6, color: 'text-contest' },
    { id: 9, Icon: GitBranch, x: 22, y: 85, size: 30, duration: 14, delay: -3, color: 'text-internship' },
    { id: 10, Icon: Coffee, x: 72, y: 15, size: 26, duration: 13, delay: -8, color: 'text-muted-foreground' },
    { id: 11, Icon: Hash, x: 38, y: 78, size: 24, duration: 18, delay: -1, color: 'text-hackathon' },
    { id: 12, Icon: Cpu, x: 62, y: 45, size: 28, duration: 12, delay: -9, color: 'text-primary' },
    { id: 13, Icon: Globe, x: 3, y: 55, size: 32, duration: 15, delay: -10, color: 'text-internship' },
    { id: 14, Icon: Sparkles, x: 82, y: 50, size: 26, duration: 11, delay: -5, color: 'text-accent' },
];

const FloatingIcons = memo(() => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[5]">
            {/* Floating Icons */}
            {floatingIcons.map((item) => {
                const IconComponent = item.Icon;
                return (
                    <div
                        key={item.id}
                        className={`absolute ${item.color} opacity-30 dark:opacity-25`}
                        style={{
                            left: `${item.x}%`,
                            top: `${item.y}%`,
                            animation: `float-icon ${item.duration}s ease-in-out infinite`,
                            animationDelay: `${item.delay}s`,
                        }}
                    >
                        <IconComponent
                            size={item.size}
                            strokeWidth={1.5}
                            className="drop-shadow-lg"
                        />
                    </div>
                );
            })}

            {/* Large floating code symbols */}
            <div
                className="absolute left-[18%] top-[25%] text-hackathon/40 dark:text-hackathon/30"
                style={{ animation: 'float-slow 10s ease-in-out infinite' }}
            >
                <span className="font-mono text-5xl font-bold drop-shadow-lg">{`{ }`}</span>
            </div>

            <div
                className="absolute right-[12%] top-[50%] text-internship/40 dark:text-internship/30"
                style={{ animation: 'float-reverse 12s ease-in-out infinite' }}
            >
                <span className="font-mono text-4xl font-bold drop-shadow-lg">{`< />`}</span>
            </div>

            <div
                className="absolute left-[42%] bottom-[15%] text-contest/40 dark:text-contest/30"
                style={{ animation: 'float-slow 11s ease-in-out infinite', animationDelay: '-3s' }}
            >
                <span className="font-mono text-3xl font-bold drop-shadow-lg">{`[ ]`}</span>
            </div>

            <div
                className="absolute right-[35%] top-[12%] text-primary/35 dark:text-primary/25"
                style={{ animation: 'float-reverse 9s ease-in-out infinite', animationDelay: '-5s' }}
            >
                <span className="font-mono text-4xl font-bold drop-shadow-lg">{`( )`}</span>
            </div>

            {/* Glowing orbs - more visible */}
            <div
                className="absolute left-[25%] top-[15%] w-48 h-48 bg-hackathon/20 dark:bg-hackathon/15 rounded-full blur-3xl"
                style={{ animation: 'pulse-slow 8s ease-in-out infinite' }}
            />
            <div
                className="absolute right-[15%] top-[35%] w-56 h-56 bg-internship/20 dark:bg-internship/15 rounded-full blur-3xl"
                style={{ animation: 'pulse-slow 10s ease-in-out infinite', animationDelay: '-3s' }}
            />
            <div
                className="absolute left-[45%] bottom-[25%] w-44 h-44 bg-contest/20 dark:bg-contest/15 rounded-full blur-3xl"
                style={{ animation: 'pulse-slow 7s ease-in-out infinite', animationDelay: '-5s' }}
            />
            <div
                className="absolute left-[60%] top-[10%] w-40 h-40 bg-primary/15 dark:bg-primary/10 rounded-full blur-3xl"
                style={{ animation: 'pulse-slow 9s ease-in-out infinite', animationDelay: '-2s' }}
            />
        </div>
    );
});

FloatingIcons.displayName = 'FloatingIcons';

export default FloatingIcons;
