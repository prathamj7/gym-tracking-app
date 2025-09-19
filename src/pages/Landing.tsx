import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Activity, BarChart3, Dumbbell, Target, TrendingUp, Users, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";

export default function Landing() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof document !== "undefined" ? document.documentElement.classList.contains("dark") : true
  );

  const quotes = [
    "Small steps, big results.",
    "Consistency beats intensity.",
    "Progress, not perfection.",
    "Strong today, stronger tomorrow.",
  ];

  useEffect(() => {
    const id = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  // Sync local state with current document theme on mount
  useEffect(() => {
    const hasDark = document.documentElement.classList.contains("dark");
    setIsDark(hasDark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    const theme = next ? "dark" : "light";
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", next);
  };

  const features = [
    {
      icon: Dumbbell,
      title: "Exercise Logging",
      description: "Easily log your workouts with detailed tracking of sets, reps, and weights."
    },
    {
      icon: BarChart3,
      title: "Progress Analytics", 
      description: "Visualize your fitness journey with comprehensive stats and insights."
    },
    {
      icon: Target,
      title: "Goal Setting",
      description: "Set and track your fitness goals to stay motivated and focused."
    },
    {
      icon: TrendingUp,
      title: "Performance Tracking",
      description: "Monitor your improvements over time with detailed progress reports."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-900 text-zinc-100 relative overflow-hidden">
      {/* Background Fitness Imagery + Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1920&auto=format&fit=crop"
          alt="Fitness background"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/70 to-black/80" />
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div
              className="flex cursor-pointer items-center gap-2"
              onClick={() => navigate("/")}
            >
              <Dumbbell className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold tracking-tight">TrackFit</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Toggle theme"
                onClick={toggleTheme}
                className="border-white/20 text-white"
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              {!isLoading && (
                <Button
                  onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
                  variant={isAuthenticated ? "default" : "outline"}
                  className={isAuthenticated ? "" : "border-white/20 text-white"}
                >
                  {isAuthenticated ? "Dashboard" : "Get Started"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2"
          >
            <div className="space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur">
                <Activity className="h-4 w-4 text-primary" />
                Track smarter. Grow stronger.
              </span>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
                Own Your
                <span className="block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Fitness Journey
                </span>
              </h1>

              <p className="mx-auto max-w-2xl text-lg text-white/70">
                Log workouts to any date, analyze progress, and compare performance—
                all in a clean, real‑time dashboard.
              </p>

              {/* Rotating motivational quote */}
              <div className="min-h-6">
                <motion.p
                  key={quoteIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35 }}
                  className="text-sm text-primary/80"
                >
                  "{quotes[quoteIndex]}"
                </motion.p>
              </div>

              <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
                    className="px-8 py-6 text-lg"
                  >
                    <span className="inline-flex items-center">
                      <Activity className="mr-2 h-5 w-5" />
                      {isAuthenticated ? "Go to Dashboard" : "Start Tracking"}
                    </span>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/auth")}
                    className="border-white/20 px-8 py-6 text-lg text-white hover:bg-white/10"
                  >
                    Join Now
                  </Button>
                </motion.div>
              </div>

              {/* Momentum progress */}
              <div className="mx-auto mt-8 max-w-xl lg:mx-0">
                <div className="mb-2 text-xs uppercase tracking-wider text-white/60">Momentum</div>
                <div className="h-2 w-full overflow-hidden rounded-full border border-white/10 bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: "20%" }}
                    animate={{ width: ["20%", "78%", "42%", "70%"] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
                <div className="mt-2 text-xs text-white/60">
                  Keep moving—your future self will thank you.
                </div>
              </div>
            </div>

            {/* Visual Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.7 }}
              className="relative hidden lg:block"
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                <img
                  src="/ashu_gym_logo_bg.png"
                  alt="Fitness Illustration"
                  className="mx-auto w-full max-w-lg rounded-xl object-cover"
                />
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white/5 py-24 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="mb-16 space-y-4 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-white/70">
              Comprehensive tools to track, analyze, and improve your performance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
              >
                <Card className="h-full border-white/10 bg-black/40 backdrop-blur transition-transform">
                  <CardContent className="space-y-4 p-8 text-center">
                    <motion.div
                      className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15"
                      whileHover={{ rotate: 6, scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 200, damping: 12 }}
                    >
                      <feature.icon className="h-6 w-6 text-primary" />
                    </motion.div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-white/70">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="space-y-16 text-center"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Join Thousands of Fitness Enthusiasts
              </h2>
              <p className="text-xl text-white/70">
                Start your fitness tracking journey today
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                { number: "10K+", label: "Active Users", icon: Users },
                { number: "500K+", label: "Workouts Logged", icon: Activity },
                { number: "95%", label: "Goal Achievement", icon: Target },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.08, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="space-y-2 text-center"
                >
                  <stat.icon className="mx-auto mb-4 h-8 w-8 text-primary" />
                  <div className="text-4xl font-bold">{stat.number}</div>
                  <div className="text-white/70">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-b from-primary/20 to-primary/10 py-24 text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="text-3xl font-bold sm:text-4xl text-white">
              Ready to Transform Your Fitness?
            </h2>
            <p className="text-xl text-white/80">
              Start tracking your workouts today and see the difference it makes.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-8"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate("/auth")}
                className="px-8 py-6 text-lg"
              >
                Get Started For Free
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              <span className="font-semibold">TrackFit</span>
            </div>
            <p className="text-sm text-white/60">
              © 2025 TrackFit. Built with ❤️ for fitness freaks.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}