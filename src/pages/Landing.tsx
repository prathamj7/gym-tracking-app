import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Dumbbell,
  Target,
  TrendingUp,
  Users,
  Sun,
  Moon,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";

export default function Landing() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : true
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
      description:
        "Log your workouts quickly with detailed tracking of sets, reps, and weights.",
    },
    {
      icon: BarChart3,
      title: "Progress Analytics",
      description: "Visualize your journey with stats, charts, and insights.",
    },
    {
      icon: Target,
      title: "Goal Setting",
      description:
        "Set fitness milestones and track them to stay motivated and consistent.",
    },
    {
      icon: TrendingUp,
      title: "Performance Tracking",
      description:
        "Monitor your improvements with reports tailored to your growth.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-900 text-zinc-100 relative overflow-hidden">
      {/* Background */}
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
                {isDark ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              {!isLoading && (
                <Button
                  onClick={() =>
                    navigate(isAuthenticated ? "/dashboard" : "/auth")
                  }
                  variant={isAuthenticated ? "default" : "outline"}
                  className={isAuthenticated ? "" : "border-white/20 text-white"}
                >
                  {isAuthenticated ? "Dashboard" : "Sign In"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
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
                Track, analyze, and improve your workouts—all in one clean,
                real-time dashboard. No clutter, just results.
              </p>
              <motion.p
                key={quoteIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="text-sm text-primary/80"
              >
                "{quotes[quoteIndex]}"
              </motion.p>
              <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <Button
                  size="lg"
                  onClick={() =>
                    navigate(isAuthenticated ? "/dashboard" : "/auth")
                  }
                  className="px-8 py-6 text-lg"
                >
                  {isAuthenticated ? "Go to Dashboard" : "Start Free Today"}
                </Button>
                {!isAuthenticated && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/auth")}
                    className="border-white/20 px-8 py-6 text-lg text-white hover:bg-white/10"
                  >
                    Join Community
                  </Button>
                )}
              </div>
            </div>
            {/* Visual */}
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
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
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
              Tools to help you track smarter, stay consistent, and achieve more.
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
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 12,
                      }}
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

      {/* Stats */}
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
                A growing community that logs, learns, and levels up together.
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

      {/* Pricing Section - Free and Paid Versions */}
      <section id="pricing" className="py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Simple Pricing</h2>
          <p className="text-gray-400 mb-12">
            Start free, upgrade anytime for full access
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="p-8 border border-gray-700 rounded-2xl shadow-lg bg-gray-900">
              <h3 className="text-2xl font-semibold mb-4">Free</h3>
              <p className="text-3xl font-bold mb-6">
                ₹0 <span className="text-lg">/year</span>
              </p>
              <ul className="text-left space-y-3 mb-6 text-gray-300">
                <li>✔ Log Workouts</li>
                <li>✔ Basic Progress Tracking</li>
                <li>✔ Access to Exercise Library</li>
              </ul>
              <button onClick={() => navigate("/dashboard")} className="w-full bg-gray-700 hover:bg-gray-800 py-3 rounded-xl font-semibold">
                Get Started
              </button>
            </div>
            {/* Premium Plan */}
            <div className="p-8 border-2 border-red-500 rounded-2xl shadow-xl bg-gray-900 relative">
              <span className="absolute top-0 right-0 bg-red-500 text-white text-sm px-3 py-1 rounded-bl-lg">
                Best Value
              </span>
              <h3 className="text-2xl font-semibold mb-4">Premium</h3>
              <p className="text-3xl font-bold mb-6">
                ₹2000 <span className="text-lg">/year</span>
              </p>
              <ul className="text-left space-y-3 mb-6 text-gray-300">
                <li>✔ Everything in Free</li>
                <li>✔ Unlimited Progress Charts</li>
                <li>✔ Streaks & Personal Records</li>
                <li>✔ Advanced Analytics & Insights</li>
                <li>✔ AI-Powered Workout Suggestions</li>
              </ul>
              <button onClick={() => navigate("/premium")} className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl font-semibold">
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-black/50 py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl mb-12">
            What Our Users Say
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: "Alex P.",
                text: "TrackFit made tracking my workouts effortless. I've never been more consistent.",
              },
              {
                name: "Riya S.",
                text: "The analytics keep me motivated. I love seeing my progress visualized.",
              },
              {
                name: "Marcus L.",
                text: "Finally, an app that’s clean, fast, and actually built for lifters.",
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur"
              >
                <Star className="mx-auto h-6 w-6 text-primary mb-4" />
                <p className="text-white/80 mb-4">“{t.text}”</p>
                <div className="text-sm font-semibold text-white/70">
                  – {t.name}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-b from-primary/20 to-primary/10 py-24 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl font-bold sm:text-4xl text-white mb-6"
        >
          Ready to Transform Your Fitness?
        </motion.h2>
        <p className="text-xl text-white/80 mb-8">
          Start free today. No credit card required.
        </p>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => navigate("/auth")}
          className="px-8 py-6 text-lg"
        >
          Get Started For Free
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            <span className="font-semibold">TrackFit</span>
          </div>
          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} TrackFit. Built with ❤️ for fitness enthusiasts.
          </p>
        </div>
      </footer>
    </div>
  );
}
