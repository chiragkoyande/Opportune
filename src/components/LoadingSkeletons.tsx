import { Rocket, Briefcase, Zap, Sparkles, TrendingUp, Users, Award } from 'lucide-react';
import { useEffect, useState } from 'react';

// Skeleton card that mimics the opportunity card structure
const SkeletonCard = ({ index }: { index: number }) => {
    const gradients = [
        'from-hackathon/20 to-hackathon/5',
        'from-internship/20 to-internship/5',
        'from-contest/20 to-contest/5',
    ];
    const gradient = gradients[index % 3];

    return (
        <div
            className={`
        relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm
        h-full animate-pulse
      `}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Top gradient accent */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />

            <div className="p-5">
                {/* Header skeleton */}
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-24 rounded-full bg-secondary/80" />
                        <div className="h-6 w-16 rounded-full bg-secondary/60" />
                    </div>
                    <div className="flex gap-1">
                        <div className="h-8 w-8 rounded-full bg-secondary/50" />
                        <div className="h-8 w-8 rounded-full bg-secondary/50" />
                    </div>
                </div>

                {/* Title skeleton */}
                <div className="h-6 w-3/4 rounded-lg bg-secondary/70 mb-2" />
                <div className="h-4 w-1/2 rounded bg-secondary/50 mb-3" />

                {/* Description skeleton */}
                <div className="space-y-2 mb-4">
                    <div className="h-3 w-full rounded bg-secondary/40" />
                    <div className="h-3 w-5/6 rounded bg-secondary/40" />
                </div>

                {/* Meta info skeleton */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <div className="h-6 w-24 rounded-full bg-secondary/50" />
                    <div className="h-6 w-20 rounded-full bg-secondary/50" />
                    <div className="h-6 w-28 rounded-full bg-secondary/50" />
                </div>

                {/* Tags skeleton */}
                <div className="flex gap-2 mb-5">
                    <div className="h-6 w-16 rounded-full bg-secondary/40" />
                    <div className="h-6 w-20 rounded-full bg-secondary/40" />
                    <div className="h-6 w-14 rounded-full bg-secondary/40" />
                </div>

                {/* Buttons skeleton */}
                <div className="flex gap-2">
                    <div className="h-10 flex-1 rounded-lg bg-secondary/50" />
                    <div className="h-10 flex-1 rounded-lg bg-secondary/70" />
                </div>
            </div>
        </div>
    );
};

// Fun facts/tips that rotate while loading
const loadingTips = [
    { icon: Rocket, text: 'Did you know? The average hackathon has 500+ participants!', color: 'text-hackathon' },
    { icon: TrendingUp, text: 'Pro tip: Apply to hackathons in your timezone for better team coordination', color: 'text-internship' },
    { icon: Users, text: 'Fun fact: Teams of 3-4 members win 60% of hackathons', color: 'text-contest' },
    { icon: Award, text: 'Tip: Focus on solving real problems, not just building cool tech', color: 'text-hackathon' },
    { icon: Sparkles, text: 'Did you know? India hosts 1000+ hackathons annually!', color: 'text-internship' },
    { icon: Briefcase, text: 'Pro tip: 40% of internships lead to full-time offers', color: 'text-contest' },
    { icon: Zap, text: 'Fun fact: Competitive programmers solve 5x faster than average devs', color: 'text-hackathon' },
    { icon: TrendingUp, text: 'Tip: Start your submissions early - last-minute bugs are real!', color: 'text-internship' },
];

// Stats that show while loading
const loadingStats = [
    { label: 'Active Hackathons', value: '50+', icon: Rocket },
    { label: 'Open Internships', value: '100+', icon: Briefcase },
    { label: 'Live Contests', value: '25+', icon: Zap },
];

interface LoadingSkeletonsProps {
    count?: number;
    showTips?: boolean;
}

const LoadingSkeletons = ({ count = 6, showTips = true }: LoadingSkeletonsProps) => {
    const [currentTip, setCurrentTip] = useState(0);

    // Rotate tips every 3 seconds
    useEffect(() => {
        if (!showTips) return;
        const interval = setInterval(() => {
            setCurrentTip((prev) => (prev + 1) % loadingTips.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [showTips]);

    const tip = loadingTips[currentTip];
    const TipIcon = tip.icon;

    return (
        <div className="space-y-8">
            {/* Loading Stats Bar */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-8">
                {loadingStats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="flex items-center gap-3 px-4 py-2 rounded-xl bg-secondary/30 border border-border/30 animate-pulse"
                            style={{ animationDelay: `${idx * 200}ms` }}
                        >
                            <Icon className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Rotating Tips */}
            {showTips && (
                <div className="mx-auto max-w-lg mb-8">
                    <div
                        key={currentTip}
                        className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-card/80 border border-border/50 backdrop-blur-sm animate-fade-in"
                    >
                        <div className={`p-2 rounded-lg bg-secondary/50`}>
                            <TipIcon className={`h-5 w-5 ${tip.color}`} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {tip.text}
                        </p>
                    </div>
                </div>
            )}

            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="text-sm text-muted-foreground animate-pulse">
                    Fetching fresh opportunities...
                </p>
            </div>

            {/* Skeleton Cards Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: count }).map((_, index) => (
                    <SkeletonCard key={index} index={index} />
                ))}
            </div>
        </div>
    );
};

export default LoadingSkeletons;
