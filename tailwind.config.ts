import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        hackathon: {
          DEFAULT: "hsl(var(--hackathon))",
          foreground: "hsl(var(--hackathon-foreground))",
          glow: "hsl(var(--hackathon-glow))",
        },
        internship: {
          DEFAULT: "hsl(var(--internship))",
          foreground: "hsl(var(--internship-foreground))",
          glow: "hsl(var(--internship-glow))",
        },
        contest: {
          DEFAULT: "hsl(var(--contest))",
          foreground: "hsl(var(--contest-foreground))",
          glow: "hsl(var(--contest-glow))",
        },
        urgent: {
          DEFAULT: "hsl(var(--urgent))",
          foreground: "hsl(var(--urgent-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px hsl(var(--primary) / 0.25)',
        'glow': '0 0 30px -5px hsl(var(--primary) / 0.3)',
        'glow-lg': '0 0 50px -10px hsl(var(--primary) / 0.4)',
        'glow-accent': '0 0 30px -5px hsl(var(--accent) / 0.3)',
        'card': '0 20px 40px -15px hsl(42 50% 40% / 0.12)',
        'card-hover': '0 30px 60px -15px hsl(42 50% 40% / 0.18)',
        'warm': '0 10px 40px -10px hsl(42 95% 50% / 0.2)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { transform: "scale(0.9)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-left": {
          from: { transform: "translateX(-100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "blur-in": {
          from: { filter: "blur(10px)", opacity: "0" },
          to: { filter: "blur(0)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "fade-in-up": "fade-in-up 0.8s ease-out forwards",
        "scale-in": "scale-in 0.4s ease-out forwards",
        "slide-in-right": "slide-in-right 0.5s ease-out forwards",
        "slide-in-left": "slide-in-left 0.5s ease-out forwards",
        "blur-in": "blur-in 0.6s ease-out forwards",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': 'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--primary) / 0.12), transparent)',
        'card-shine': 'linear-gradient(105deg, transparent 40%, hsl(var(--primary) / 0.08) 45%, hsl(var(--primary) / 0.15) 50%, hsl(var(--primary) / 0.08) 55%, transparent 60%)',
        'mesh-gradient': 'radial-gradient(at 40% 20%, hsl(42 95% 70% / 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsl(28 95% 65% / 0.12) 0px, transparent 50%), radial-gradient(at 0% 50%, hsl(320 75% 70% / 0.08) 0px, transparent 50%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;