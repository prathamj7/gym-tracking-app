import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  BarChart3,
  Dumbbell,
  Target,
  TrendingUp,
  Users,
  Star,
  Zap,
  Trophy,
  Timer,
  Heart,
  Flame,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";

export default function Landing() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Slideshow images for hero visual
  const slideshowImages = [
    "/ashu_gym_logo_bg.png",
    "/ashu_logging.png",
    "/ashu_happy.png",
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % slideshowImages.length);
    }, 2000); // every 2 seconds
    return () => clearInterval(intervalId);
  }, []);

  const quotes = [
    "Every rep counts, every set matters. 💪",
    "The only bad workout is the one you didn't do.",
    "Track your progress, transform your body.",
    "Strength doesn't come from comfort zones.",
    "Your body can do it. It's your mind you need to convince.",
    "Champions train, legends never stop.",
    "Progress is impossible without tracking your journey.",
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
      title: "Smart Exercise Logging",
      description:
        "Log workouts with AI-powered form suggestions and automatic weight progression tracking.",
      highlight: "AI-Powered",
      color: "text-primary"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Visualize strength gains, volume trends, and predict your next PR breakthrough.",
      highlight: "Predictive",
      color: "text-blue-400"
    },
    {
      icon: Target,
      title: "Precision Goal Setting",
      description:
        "Set SMART fitness goals with milestone tracking and adaptive target adjustments.",
      highlight: "SMART Goals",
      color: "text-green-400"
    },
    {
      icon: TrendingUp,
      title: "Performance Insights",
      description:
        "Get personalized recommendations based on your training patterns and recovery data.",
      highlight: "Personalized",
      color: "text-yellow-400"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-black to-zinc-900 text-zinc-100 relative overflow-hidden transition-colors duration-500">{" "}
      {/* Enhanced Background Layers */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1920&auto=format&fit=crop"
          alt="Fitness background"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-transparent" />
        
        {/* Floating Fitness Icons */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-20 text-primary/30"
        >
          <Dumbbell className="h-16 w-16" />
        </motion.div>
        
        <motion.div
          animate={{ 
            y: [0, 15, 0],
            rotate: [0, -3, 0]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-40 right-32 text-red-400/20"
        >
          <Trophy className="h-12 w-12" />
        </motion.div>
        
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            x: [0, 5, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-40 left-32 text-primary/25"
        >
          <Target className="h-14 w-14" />
        </motion.div>
        
        <motion.div
          animate={{ 
            rotate: [0, 360]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-60 right-20 text-red-500/15"
        >
          <Timer className="h-10 w-10" />
        </motion.div>
        
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-60 right-40 text-primary/20"
        >
          <Heart className="h-8 w-8" />
        </motion.div>

        {/* Original gradient elements */}
        <div className="absolute left-1/2 top-24 -translate-x-1/2 h-[38rem] w-[36rem] rounded-full bg-primary/15 blur-[120px] opacity-85" />
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-[30rem] w-[30rem] rounded-full bg-red-900/20 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-lg shadow-lg transition-all">
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
              {!isLoading && (
                <Button
                  onClick={() =>
                    navigate(isAuthenticated ? "/dashboard" : "/auth")
                  }
                  variant={isAuthenticated ? "default" : "outline"}
                  className={`transition-colors ${
                    isAuthenticated
                      ? "bg-gradient-to-r from-rose-600 to-primary shadow-lg"
                      : "border-white/20 text-white hover:bg-primary/10"
                  }`}
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
            className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2"
          >
            <div className="space-y-7 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-gradient-to-r from-primary/10 via-rose-900/20 to-black/20 px-3 py-1 text-xs text-white/80 backdrop-blur shadow">
                <Activity className="h-4 w-4 text-primary" />
                Track smarter. Grow stronger.
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                Own Your
                <span className="block bg-gradient-to-r from-primary to-rose-700 bg-clip-text text-transparent">
                  Fitness Journey
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-base sm:text-lg text-zinc-200/80">
                Track, analyze, and improve your workouts—all in one clean, real-time dashboard.
                No clutter, just results.
              </p>
              <motion.div
                key={quoteIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-primary/10 to-rose-900/10 border border-primary/20 rounded-lg p-4 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="h-4 w-4 text-primary" />
                  <span className="text-xs text-primary/80 font-medium">MOTIVATION</span>
                </div>
                <p className="text-sm text-zinc-200 font-medium italic">
                  "{quotes[quoteIndex]}"
                </p>
              </motion.div>
              <div className="flex flex-col items-center gap-3 sm:gap-4 sm:flex-row lg:justify-start">
                <Button
                  size="lg"
                  onClick={() =>
                    navigate(isAuthenticated ? "/dashboard" : "/auth")
                  }
                  className="w-full sm:w-auto bg-gradient-to-r from-primary via-rose-500 to-rose-600 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg shadow-xl hover:scale-105 transition-transform font-semibold"
                >
                  {isAuthenticated ? "Go to Dashboard" : "Start Free Today"}
                </Button>
                {!isAuthenticated && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/auth")}
                    className="w-full sm:w-auto border-white/20 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg text-white hover:bg-white/10 font-semibold hover:scale-105 transition-transform"
                  >
                    Join Community
                  </Button>
                )}
              </div>
              
              {/* Animated Workout Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="grid grid-cols-3 gap-2 sm:gap-4 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/10"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.2, duration: 0.6, type: "spring" }}
                    className="flex items-center justify-center mb-2"
                  >
                    <Flame className="h-5 w-5 text-red-400 mr-1" />
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5, duration: 0.5 }}
                      className="text-2xl font-bold text-primary"
                    >
                      2.5K+
                    </motion.span>
                  </motion.div>
                  <p className="text-xs text-zinc-400">Workouts Tracked</p>
                </div>
                
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.4, duration: 0.6, type: "spring" }}
                    className="flex items-center justify-center mb-2"
                  >
                    <Trophy className="h-5 w-5 text-yellow-400 mr-1" />
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.7, duration: 0.5 }}
                      className="text-2xl font-bold text-primary"
                    >
                      856
                    </motion.span>
                  </motion.div>
                  <p className="text-xs text-zinc-400">PRs Set</p>
                </div>
                
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.6, duration: 0.6, type: "spring" }}
                    className="flex items-center justify-center mb-2"
                  >
                    <Zap className="h-5 w-5 text-blue-400 mr-1" />
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.9, duration: 0.5 }}
                      className="text-2xl font-bold text-primary"
                    >
                      127
                    </motion.span>
                  </motion.div>
                  <p className="text-xs text-zinc-400">Active Users</p>
                </div>
              </motion.div>
            </div>
            {/* Visual Slideshow */}
            <div className="relative mx-auto hidden lg:block rounded-3xl overflow-hidden w-full max-w-lg aspect-[4/5]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={slideshowImages[currentImageIndex]}
                  src={slideshowImages[currentImageIndex]}
                  alt="Fitness Illustration"
                  className="rounded-xl object-cover w-full h-full scale-105"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  style={{ position: "absolute", top: 0, left: 0 }}
                />
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Workout Preview */}
      <section className="py-16 bg-gradient-to-b from-black/50 to-transparent">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-rose-700 bg-clip-text text-transparent">
              See Your Progress In Action
            </h2>
            <p className="text-lg text-zinc-300">Real-time analytics that motivate you to push harder</p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Workout Progress Ring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-black/60 to-zinc-900/80 border border-primary/20 rounded-2xl p-6 backdrop-blur-sm hover:border-primary/40 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Today's Progress</h3>
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-zinc-700"
                  />
                  <motion.circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    className="text-primary"
                    initial={{ strokeDasharray: "0 251.32" }}
                    whileInView={{ strokeDasharray: "188.49 251.32" }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    viewport={{ once: true }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">75%</span>
                </div>
              </div>
              <p className="text-sm text-zinc-400 text-center">3 of 4 exercises completed</p>
            </motion.div>

            {/* Live Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-black/60 to-zinc-900/80 border border-primary/20 rounded-2xl p-6 backdrop-blur-sm hover:border-primary/40 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Live Stats</h3>
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Current Set</span>
                  <span className="text-white font-medium">Set 3/4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Weight</span>
                  <motion.span 
                    className="text-primary font-bold"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                  >
                    185 lbs
                  </motion.span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Rest Timer</span>
                  <motion.span 
                    className="text-yellow-400 font-medium"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    1:23
                  </motion.span>
                </div>
              </div>
            </motion.div>

            {/* Achievement Unlock */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-black/60 to-zinc-900/80 border border-yellow-500/30 rounded-2xl p-6 backdrop-blur-sm hover:border-yellow-500/50 transition-all group relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-primary/10"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Achievement!</h3>
                  <Trophy className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: 2 }}
                    className="mb-3"
                  >
                    <span className="text-3xl">🏆</span>
                  </motion.div>
                  <h4 className="text-sm font-bold text-yellow-400 mb-1">New PR!</h4>
                  <p className="text-xs text-zinc-400">Bench Press: 185 lbs</p>
                  <p className="text-xs text-primary mt-2">+10 lbs from last week</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="my-12 h-0.5 w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

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
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-primary to-rose-700 bg-clip-text text-transparent">
              Everything You Need
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-300">
              Tools to help you track smarter, stay consistent, and achieve more.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.09, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -4, scale: 1.05, boxShadow: '0 8px 32px #fb7185DD' }}
                className="transition-transform group hover:shadow-lg"
              >
                <Card className="h-full border border-primary/30 bg-black/70 backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:bg-black/80 group">
                  <CardContent className="space-y-4 p-8 text-center">
                    <motion.div
                      className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-tr from-primary/30 to-rose-500/15 group-hover:from-primary/50 group-hover:to-rose-500/25 transition-all duration-300"
                      whileHover={{ rotate: 12, scale: 1.1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 15,
                      }}
                    >
                      <feature.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors duration-300" />
                    </motion.div>
                    
                    <div>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-white group-hover:text-primary transition-colors duration-300">
                          {feature.title}
                        </h3>
                      </div>
                      <div className="mb-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${feature.color} bg-white/5 border border-current/20`}>
                          {feature.highlight}
                        </span>
                      </div>
                      <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    {/* Animated progress indicator */}
                    <motion.div
                      className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-rose-500"
                        initial={{ width: "0%" }}
                        whileInView={{ width: "100%" }}
                        transition={{ delay: index * 0.2 + 0.5, duration: 1.5, ease: "easeOut" }}
                        viewport={{ once: true }}
                      />
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="my-12 h-0.5 w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

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
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-primary to-rose-700 bg-clip-text text-transparent">
                Join Thousands of Fitness Enthusiasts
              </h2>
              <p className="text-xl text-gray-300">
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
                  <stat.icon className="mx-auto mb-4 h-9 w-9 text-primary shadow-xl" />
                  <div className="text-4xl font-bold text-gray-100">{stat.number}</div>
                  <div className="text-gray-300">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="my-12 h-0.5 w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

      {/* Pricing Section - Free and Paid Versions */}
      <section id="pricing" className="py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-rose-700 bg-clip-text text-transparent">Simple Pricing</h2>
          <p className="text-gray-400 mb-12">
            Start free, upgrade anytime for full access
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <motion.div
              whileHover={{ scale: 1.04, boxShadow: '0 8px 32px #fbbf24cc' }}
              className="transition-transform"
            >
              <div className="p-8 border border-gray-700 rounded-2xl shadow-lg bg-gray-900 hover:border-primary/60 hover:shadow-xl transition-all">
                <h3 className="text-2xl font-semibold mb-4">Free</h3>
                <p className="text-3xl font-bold mb-6">
                  ₹0 <span className="text-lg">/year</span>
                </p>
                <ul className="text-left space-y-3 mb-6 text-gray-300">
                  <li>✔ Log Workouts</li>
                  <li>✔ Basic Progress Tracking</li>
                  <li>✔ Access to Exercise Library</li>
                  <li>✔ Exercise Comparison</li>
                  <li>✔ Download Progress</li>
                </ul>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full bg-gradient-to-r from-gray-700 to-black hover:bg-gradient-to-l hover:from-primary hover:to-rose-600 py-3 rounded-xl font-semibold transition"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
            {/* Premium Plan */}
            <motion.div
              whileHover={{ scale: 1.07, boxShadow: '0 16px 48px #ff5277cc' }}
              className="transition-transform "
            >
              <div className="p-8 border-2 border-red-500 rounded-2xl shadow-xl bg-gray-900 relative glow-premium">
                <span className="absolute top-0 right-0 bg-red-500 text-white text-sm px-3 py-1 rounded-bl-lg font-bold shadow-md ring-4 ring-primary/30">
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
                <button
                  onClick={() => navigate("/premium")}
                  className="w-full bg-gradient-to-r from-red-600 via-primary to-primary/80 hover:from-primary hover:to-rose-600 py-3 rounded-xl font-semibold shadow-md transition"
                >
                  Upgrade to Premium
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="my-10 h-0.5 w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>

      {/* Testimonials */}
      <section className="bg-black/50 py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl mb-12 bg-gradient-to-r from-primary to-rose-700 bg-clip-text text-transparent">
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
                className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-bl group hover:scale-105 hover:shadow-2xl transition-transform"
              >
                <Star className="mx-auto h-6 w-6 text-primary mb-4 group-hover:text-rose-400 transition-colors" />
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
          className="text-3xl font-bold sm:text-4xl text-white mb-6 flex items-center justify-center gap-3"
        >
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            💪
          </motion.span>
          Ready to Transform Your Fitness?
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
          >
            🔥
          </motion.span>
        </motion.h2>
        <p className="text-xl text-white/80 mb-8">
          Join thousands who've already started their fitness transformation.
          <br />
          <span className="text-primary font-semibold">Start free today. No credit card required.</span>
        </p>
        <motion.div className="relative">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary to-red-600 rounded-lg blur-lg opacity-75"
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.75, 0.9, 0.75]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/auth")}
            className="relative px-8 py-6 text-lg bg-gradient-to-r from-primary via-rose-500 to-red-600 shadow-2xl hover:scale-105 transition-all duration-300 font-bold"
          >
            <Zap className="h-5 w-5 mr-2" />
            Get Started For Free
            <Flame className="h-5 w-5 ml-2" />
          </Button>
        </motion.div>
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
