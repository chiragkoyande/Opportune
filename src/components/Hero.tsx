import { ArrowRight, Rocket, Trophy, Briefcase, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FloatingParticles from './FloatingParticles';
import CursorSparkles from './CursorSparkles';
import TypingAnimation from './TypingAnimation';
import TiltCard from './TiltCard';

const Hero = () => {
  return (
    <section className="relative overflow-hidden py-20 md:py-32 bg-mesh noise-bg">
      {/* Background Effects - Animated Blobs */}
      <div className="absolute inset-0 bg-grid-pattern opacity-50" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-radial from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl animate-blob" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-gradient-radial from-accent/15 via-accent/5 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '-2s' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial from-hackathon/10 via-hackathon/3 to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '-4s' }} />
      
      {/* Floating Particles */}
      <FloatingParticles />
      
      {/* Cursor Sparkles */}
      <CursorSparkles />
      
      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary animate-fade-in">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Opportunity Discovery</span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 font-display text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
            <TypingAnimation text="Never Miss an" speed={70} delay={300} />
            <span className="block mt-2 text-gradient">
              <TypingAnimation text="Opportunity Again" speed={70} delay={1400} />
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mb-10 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Discover hackathons, internships, and coding contests from 
            <span className="text-foreground font-medium"> 50+ platforms</span> — all in one place.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Button 
              size="lg" 
              className="group bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90 shadow-glow font-semibold text-base px-8 h-12"
              onClick={() => document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Opportunities
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-border bg-card shadow-card-hover hover:bg-secondary font-semibold text-base px-8 h-12"
              onClick={() => document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Zap className="mr-2 h-4 w-4 text-accent" />
              View Trending
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-gradient">500+</p>
              <p className="text-sm text-muted-foreground mt-1">Opportunities</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-gradient">50+</p>
              <p className="text-sm text-muted-foreground mt-1">Platforms</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl font-bold text-gradient">24/7</p>
              <p className="text-sm text-muted-foreground mt-1">Updates</p>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-20 grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          <FeatureCard
            icon={<Rocket className="h-6 w-6" />}
            title="Hackathons"
            description="MLH, Devfolio, ETHIndia & more. Build, learn, and win prizes."
            color="hackathon"
            delay="0.8s"
          />
          <FeatureCard
            icon={<Briefcase className="h-6 w-6" />}
            title="Internships"
            description="FAANG, startups, remote opportunities. Launch your career."
            color="internship"
            delay="1s"
          />
          <FeatureCard
            icon={<Trophy className="h-6 w-6" />}
            title="Coding Contests"
            description="LeetCode, Codeforces, CodeChef. Sharpen your skills."
            color="contest"
            delay="1.2s"
          />
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'hackathon' | 'internship' | 'contest';
  delay: string;
}

const FeatureCard = ({ icon, title, description, color, delay }: FeatureCardProps) => {
  const colorClasses = {
    hackathon: 'from-hackathon to-hackathon/70 shadow-[0_0_25px_-5px_hsl(var(--hackathon)/0.3)]',
    internship: 'from-internship to-internship/70 shadow-[0_0_25px_-5px_hsl(var(--internship)/0.3)]',
    contest: 'from-contest to-contest/70 shadow-[0_0_25px_-5px_hsl(var(--contest)/0.3)]',
  };

  const textColors = {
    hackathon: 'text-hackathon',
    internship: 'text-internship',
    contest: 'text-contest',
  };

  return (
    <TiltCard
      className="animate-fade-in-up"
      style={{ animationDelay: delay }}
      tiltMaxAngle={12}
    >
      <div className="group relative rounded-2xl border border-border bg-card p-6 overflow-hidden h-full card-hover">
        {/* Glow effect on hover */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-500 bg-gradient-to-br ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]}`} />
        
        <div className="relative z-10">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colorClasses[color]} mb-4 transform-gpu`}>
            <span className="text-white">
              {icon}
            </span>
          </div>
          <h3 className={`mb-2 font-display text-xl font-bold ${textColors[color]}`}>
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </TiltCard>
  );
};

export default Hero;