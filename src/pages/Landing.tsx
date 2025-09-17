import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Activity, BarChart3, Dumbbell, Target, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";

export default function Landing() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [quoteIndex, setQuoteIndex] = useState(0);

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
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">FitTracker</span>
            </div>
            <div className="flex items-center gap-4">
              {!isLoading && (
                <Button
                  onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
                  variant={isAuthenticated ? "default" : "outline"}
                >
                  {isAuthenticated ? "Dashboard" : "Get Started"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
          >
            <div className="space-y-4 text-center lg:text-left">
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
                Track Your
                <span className="text-primary block">Fitness Journey</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Simple, powerful exercise tracking to help you reach your fitness goals.
                Log workouts, monitor progress, and stay motivated.
              </p>
              {/* Rotating motivational quote */}
              <div className="h-6">
                <motion.p
                  key={quoteIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.4 }}
                  className="text-sm text-primary/80"
                >
                  "{quotes[quoteIndex]}"
                </motion.p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center lg:justify-start"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
                  className="text-lg px-8 py-6"
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
                  className="text-lg px-8 py-6"
                >
                  Learn More
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="hidden lg:block"
            >
              <img
                src="/logo_bg.png"
                alt="Fitness Illustration"
                className="w-full max-w-lg mx-auto rounded-xl border"
              />
            </motion.div>
          </motion.div>

          {/* Gentle animated progress indicator */}
          <div className="mt-10 max-w-xl mx-auto lg:mx-0">
            <div className="mb-2 text-sm text-muted-foreground">Momentum</div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: "20%" }}
                animate={{ width: ["20%", "80%", "40%", "70%"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Keep moving—your future self will thank you.
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything You Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools to track, analyze, and improve your fitness performance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
              >
                <Card className="h-full transition-transform">
                  <CardContent className="p-8 text-center space-y-4">
                    <motion.div
                      className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto"
                      whileHover={{ rotate: 6, scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 200, damping: 12 }}
                    >
                      <feature.icon className="h-6 w-6 text-primary" />
                    </motion.div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center space-y-16"
          >
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Join Thousands of Fitness Enthusiasts
              </h2>
              <p className="text-xl text-muted-foreground">
                Start your fitness tracking journey today
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { number: "10K+", label: "Active Users", icon: Users },
                { number: "500K+", label: "Workouts Logged", icon: Activity },
                { number: "95%", label: "Goal Achievement", icon: Target },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  viewport={{ once: true }}
                  className="text-center space-y-2"
                >
                  <stat.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                  <div className="text-4xl font-bold">{stat.number}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="text-3xl sm:text-4xl font-bold">
              Ready to Transform Your Fitness?
            </h2>
            <p className="text-xl opacity-90">
              Start tracking your workouts today and see the difference it makes.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate("/auth")}
                className="text-lg px-8 py-6"
              >
                Get Started Free
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              <span className="font-semibold">FitTracker</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 FitTracker. Built with ❤️ for fitness enthusiasts.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}