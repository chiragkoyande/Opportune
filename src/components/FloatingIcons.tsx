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
    Bug,
    Database,
    Cpu,
    Wifi,
    Binary
} from 'lucide-react';

interface FloatingIcon {
    id: number;
    Icon: React.ElementType;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
    opacity: number;
    rotate: number;
}

// Pre-defined floating icons for coding/hackathon theme
const floatingIcons: FloatingIcon[] = [
    { id: 1, Icon: Code2, x: 5, y: 15, size: 24, duration: 20, delay: 0, opacity: 0.15, rotate: -15 },
    { id: 2, Icon: Terminal, x: 85, y: 10, size: 28, duration: 25, delay: -5, opacity: 0.12, rotate: 10 },
    { id: 3, Icon: Braces, x: 15, y: 75, size: 22, duration: 22, delay: -8, opacity: 0.18, rotate: -8 },
    { id: 4, Icon: Laptop, x: 90, y: 65, size: 26, duration: 18, delay: -3, opacity: 0.14, rotate: 5 },
    { id: 5, Icon: Rocket, x: 50, y: 5, size: 30, duration: 24, delay: -10, opacity: 0.2, rotate: 45 },
    { id: 6, Icon: Trophy, x: 75, y: 85, size: 24, duration: 20, delay: -2, opacity: 0.16, rotate: -12 },
    { id: 7, Icon: Lightbulb, x: 10, y: 45, size: 20, duration: 26, delay: -7, opacity: 0.15, rotate: 15 },
    { id: 8, Icon: Zap, x: 92, y: 35, size: 22, duration: 19, delay: -4, opacity: 0.18, rotate: -20 },
    { id: 9, Icon: GitBranch, x: 25, y: 90, size: 24, duration: 23, delay: -6, opacity: 0.13, rotate: 8 },
    { id: 10, Icon: Coffee, x: 70, y: 20, size: 20, duration: 21, delay: -9, opacity: 0.12, rotate: -5 },
    { id: 11, Icon: Bug, x: 40, y: 80, size: 18, duration: 28, delay: -1, opacity: 0.1, rotate: 25 },
    { id: 12, Icon: Database, x: 60, y: 50, size: 22, duration: 17, delay: -11, opacity: 0.08, rotate: -10 },
    { id: 13, Icon: Cpu, x: 3, y: 60, size: 26, duration: 25, delay: -12, opacity: 0.14, rotate: 0 },
    { id: 14, Icon: Wifi, x: 80, y: 45, size: 20, duration: 22, delay: -8, opacity: 0.1, rotate: 12 },
    { id: 15, Icon: Binary, x: 35, y: 25, size: 18, duration: 30, delay: -5, opacity: 0.08, rotate: -18 },
];

const FloatingIcons = memo(() => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {floatingIcons.map((item) => {
                const IconComponent = item.Icon;
                return (
                    <div
                        key={item.id}
                        className="absolute animate-float-icon text-primary/20 dark:text-primary/15"
                        style={{
                            left: `${item.x}%`,
                            top: `${item.y}%`,
                            opacity: item.opacity,
                            animationDuration: `${item.duration}s`,
                            animationDelay: `${item.delay}s`,
                            transform: `rotate(${item.rotate}deg)`,
                        }}
                    >
                        <IconComponent
                            size={item.size}
                            strokeWidth={1.5}
                            className="drop-shadow-sm"
                        />
                    </div>
                );
            })}

            {/* Animated code brackets floating */}
            <div className="absolute left-[20%] top-[30%] animate-float-slow opacity-10 text-hackathon">
                <span className="font-mono text-4xl font-bold">{`{ }`}</span>
            </div>
            <div className="absolute right-[15%] top-[55%] animate-float-reverse opacity-10 text-internship">
                <span className="font-mono text-3xl font-bold">{`< />`}</span>
            </div>
            <div className="absolute left-[45%] bottom-[20%] animate-float-slow opacity-8 text-contest">
                <span className="font-mono text-2xl font-bold">{`[ ]`}</span>
            </div>

            {/* Glowing orbs */}
            <div className="absolute left-[30%] top-[20%] w-32 h-32 bg-hackathon/10 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute right-[20%] top-[40%] w-40 h-40 bg-internship/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '-2s' }} />
            <div className="absolute left-[50%] bottom-[30%] w-36 h-36 bg-contest/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '-4s' }} />
        </div>
    );
});

FloatingIcons.displayName = 'FloatingIcons';

export default FloatingIcons;
