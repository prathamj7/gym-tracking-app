import { Button } from "@/components/ui/button";
import { ExerciseForm } from "@/components/ExerciseForm";
import { ExerciseList } from "@/components/ExerciseList";
import { StatsCards } from "@/components/StatsCards";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription, usePremiumAccess, useSubscriptionTier } from "@/hooks/use-subscription";
import { PremiumBadge, TrialBanner } from "@/components/premium/PremiumComponents";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, LogOut, Plus, User, Download, BookOpen, TrendingUp, Activity, Target, Zap, Menu, X, LayoutTemplate } from "lucide-react";
import { BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { PRList } from "@/components/PRList";
import { CompareModal } from "@/components/dashboard/CompareModal";
import { DownloadModal } from "@/components/dashboard/DownloadModal";
import { LibraryModal } from "@/components/dashboard/LibraryModal";
import { ProgressModal } from "@/components/dashboard/ProgressModal";
import { UserProfileModal } from "@/components/dashboard/UserProfileModal";
import { TemplateForm } from "@/components/TemplateForm";
import { TemplateSeedButton } from "@/components/TemplateSeedButton";
import { TemplateLibrary } from "@/components/TemplateLibrary";


export default function Dashboard() {
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  const { subscription } = useSubscription();
  const { hasPremium } = usePremiumAccess();
  const navigate = useNavigate();
  
  // Centralized modal state
  const [modals, setModals] = useState({
    exerciseForm: false,
    compare: false,
    download: false,
    library: false,
    templates: false,
    templateForm: false,
    user: false,
    progress: false,
  });
  
  const [prefill, setPrefill] = useState<{ name?: string; category?: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Centralized modal management
  const openModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
    setMobileMenuOpen(false); // Close mobile menu when opening modal
  };

  const closeModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    if (modalName === 'exerciseForm') {
      setPrefill(null); // Clear prefill when closing exercise form
    }
  };

  const closeAllModals = () => {
    setModals({
      exerciseForm: false,
      compare: false,
      download: false,
      library: false,
      templates: false,
      templateForm: false,
      user: false,
      progress: false,
    });
    setPrefill(null);
    setMobileMenuOpen(false);
  };

  // Add keyboard shortcut for closing modals
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAllModals();
      }
      // Quick shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'e':
            event.preventDefault();
            openModal('exerciseForm');
            break;
          case 'l':
            event.preventDefault();
            openModal('library');
            break;
          case 'p':
            event.preventDefault();
            openModal('progress');
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const handleLibrarySelect = ({ name, category }: { name: string; category: string }) => {
    closeModal('library');
    setPrefill({ name, category });
    openModal('exerciseForm');
  };

  const handleStartWorkoutFromTemplate = (template: any) => {
    closeModal('templates');
    // For now, we'll just prefill the first exercise from the template
    if (template.exercises && template.exercises.length > 0) {
      const firstExercise = template.exercises[0];
      setPrefill({ name: firstExercise.name, category: firstExercise.category });
      openModal('exerciseForm');
    }
  };

  const handleCreateTemplate = () => {
    closeModal('templates');
    openModal('templateForm');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const firstName = (user.name ?? "").trim().split(" ")[0] || "Friend";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="relative border-b border-border/50 backdrop-blur-xl bg-card/80 shadow-2xl">
        {/* Subtle animated background pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-rose-500/5 opacity-30"></div>
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-0 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl"
            animate={{
              x: [0, 20, 0],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-0 right-1/3 w-24 h-24 bg-rose-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, -15, 0],
              y: [0, 15, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Section */}
            <motion.div 
              className="flex items-center gap-3 group cursor-pointer"
              onClick={() => navigate("/")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <Dumbbell className="h-8 w-8 text-primary group-hover:text-rose-500 transition-colors duration-300" />
                <motion.div
                  className="absolute inset-0 bg-primary/20 rounded-full blur-lg"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-primary via-rose-500 to-rose-600 bg-clip-text text-transparent">
                  FitTracker
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Your Fitness Journey
                </span>
              </div>
            </motion.div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3">
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openModal('download')}
                    className="group relative overflow-hidden bg-gradient-to-r from-card via-card/90 to-card/80 hover:from-primary/10 hover:via-primary/5 hover:to-transparent border border-border/50 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm"
                    title="Download Progress (Ctrl+D)"
                  >
                    <Download className="h-4 w-4 mr-2 text-primary group-hover:text-rose-500 transition-colors" />
                    <span className="font-medium">Download</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openModal('library')}
                    className="group relative overflow-hidden bg-gradient-to-r from-card via-card/90 to-card/80 hover:from-primary/10 hover:via-primary/5 hover:to-transparent border border-border/50 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm"
                    title="Exercise Library (Ctrl+L)"
                  >
                    <BookOpen className="h-4 w-4 mr-2 text-primary group-hover:text-rose-500 transition-colors" />
                    <span className="font-medium">Library</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openModal('templates')}
                    className="group relative overflow-hidden bg-gradient-to-r from-card via-card/90 to-card/80 hover:from-primary/10 hover:via-primary/5 hover:to-transparent border border-border/50 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm"
                    title="Workout Templates (Ctrl+T)"
                  >
                    <LayoutTemplate className="h-4 w-4 mr-2 text-primary group-hover:text-rose-500 transition-colors" />
                    <span className="font-medium">Templates</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openModal('progress')}
                    className="group relative overflow-hidden bg-gradient-to-r from-card via-card/90 to-card/80 hover:from-primary/10 hover:via-primary/5 hover:to-transparent border border-border/50 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm"
                    title="Progress Chart (Ctrl+P)"
                  >
                    <TrendingUp className="h-4 w-4 mr-2 text-primary group-hover:text-rose-500 transition-colors" />
                    <span className="font-medium">Progress</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  </Button>
                </motion.div>
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="group relative overflow-hidden bg-gradient-to-r from-card via-card/90 to-card/80 hover:from-primary/10 hover:via-primary/5 hover:to-transparent border border-border/50 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm"
                  >
                    <motion.div
                      animate={{ rotate: mobileMenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {mobileMenuOpen ? (
                        <X className="h-4 w-4 text-primary group-hover:text-rose-500 transition-colors" />
                      ) : (
                        <Menu className="h-4 w-4 text-primary group-hover:text-rose-500 transition-colors" />
                      )}
                    </motion.div>
                  </Button>
                </motion.div>
              </div>

              {/* Separator */}
              <div className="hidden lg:block w-px h-6 bg-border/50"></div>

              {/* User Actions */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openModal('user')}
                  title="View Profile"
                  className="group relative overflow-hidden bg-gradient-to-r from-card via-card/90 to-card/80 hover:from-primary/10 hover:via-primary/5 hover:to-transparent border border-border/50 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm"
                >
                  <User className="h-4 w-4 mr-2 text-primary group-hover:text-rose-500 transition-colors" />
                  <span className="font-medium hidden sm:inline">Profile</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut} 
                  className="group relative overflow-hidden bg-gradient-to-r from-card via-card/90 to-card/80 hover:from-destructive/10 hover:via-destructive/5 hover:to-transparent border border-border/50 hover:border-destructive/30 transition-all duration-300 backdrop-blur-sm"
                >
                  <LogOut className="h-4 w-4 mr-2 text-muted-foreground group-hover:text-destructive transition-colors" />
                  <span className="font-medium hidden sm:inline text-muted-foreground group-hover:text-destructive transition-colors">Sign Out</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-destructive/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden border-b border-border/50 backdrop-blur-xl bg-card/90 shadow-lg overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      openModal('download');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start group relative overflow-hidden bg-gradient-to-r from-card via-card/90 to-card/80 hover:from-primary/10 hover:via-primary/5 hover:to-transparent border border-border/50 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm"
                  >
                    <Download className="h-4 w-4 mr-2 text-primary group-hover:text-rose-500 transition-colors" />
                    <span className="font-medium">Download</span>
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      openModal('library');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start group relative overflow-hidden bg-gradient-to-r from-card via-card/90 to-card/80 hover:from-primary/10 hover:via-primary/5 hover:to-transparent border border-border/50 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm"
                  >
                    <BookOpen className="h-4 w-4 mr-2 text-primary group-hover:text-rose-500 transition-colors" />
                    <span className="font-medium">Library</span>
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      openModal('templates');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start group relative overflow-hidden bg-gradient-to-r from-card via-card/90 to-card/80 hover:from-primary/10 hover:via-primary/5 hover:to-transparent border border-border/50 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm"
                  >
                    <LayoutTemplate className="h-4 w-4 mr-2 text-primary group-hover:text-rose-500 transition-colors" />
                    <span className="font-medium">Templates</span>
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      openModal('progress');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start group relative overflow-hidden bg-gradient-to-r from-card via-card/90 to-card/80 hover:from-primary/10 hover:via-primary/5 hover:to-transparent border border-border/50 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm"
                  >
                    <TrendingUp className="h-4 w-4 mr-2 text-primary group-hover:text-rose-500 transition-colors" />
                    <span className="font-medium">Progress Chart</span>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trial Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <TrialBanner />
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 bg-card rounded-xl shadow-md mt-4 sm:mt-6 lg:mt-8 mx-4 sm:mx-6 lg:mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-10"
        >
          {/* Welcome Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <motion.h1 
                  className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-rose-500 to-rose-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Welcome back, {firstName}!
                </motion.h1>
                <PremiumBadge tier={subscription?.tier || "free"} />
              </div>
              <motion.p 
                className="mt-2 text-foreground/80 font-medium text-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Ready to crush your fitness goals? 💪
              </motion.p>
            </div>
            <motion.div 
              className="flex gap-4 flex-wrap sm:flex-nowrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => openModal('exerciseForm')}
                  size="lg"
                  className="group relative overflow-hidden w-full sm:w-auto bg-gradient-to-r from-primary via-rose-600 to-rose-700 hover:from-primary/90 hover:via-rose-500 hover:to-rose-600 shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold text-lg px-8 py-3 border-0"
                  title="Log Exercise (Ctrl+E)"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <Zap className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="relative z-10">Log Exercise</span>
                  <motion.div
                    className="absolute inset-0 bg-white/10 rounded-lg blur-xl"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => openModal('compare')}
                  variant="outline"
                  size="lg"
                  className="group relative overflow-hidden w-full sm:w-auto bg-gradient-to-r from-card via-card/90 to-card/80 hover:from-primary/10 hover:via-primary/5 hover:to-transparent border-2 border-primary/30 hover:border-primary/50 transition-all duration-300 font-semibold text-lg px-8 py-3 backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <Target className="mr-3 h-5 w-5 text-primary group-hover:text-rose-500 group-hover:scale-110 transition-all duration-300" />
                  <span className="relative z-10 text-primary group-hover:text-rose-500 transition-colors">Compare</span>
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative"
          >
            {/* Subtle background decoration */}
            <div className="absolute -top-4 -right-4 opacity-10">
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Dumbbell className="h-16 w-16 text-primary" />
              </motion.div>
            </div>
            
            
            {/* Temporary Template Seeding Button - Remove after seeding database */}
            <div className="mb-6">
              <TemplateSeedButton />
            </div>
            
            <StatsCards />
          </motion.div>

          {/* Personal Records */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Target className="h-8 w-8 text-primary" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 bg-primary/20 rounded-full blur-lg"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-rose-500 to-rose-600 bg-clip-text text-transparent">
                Personal Records
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-primary/50 via-transparent to-transparent"></div>
            </div>
            <PRList />
          </motion.div>

          {/* Exercise List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <motion.div
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Activity className="h-8 w-8 text-primary" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 bg-primary/20 rounded-full blur-lg"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-rose-500 to-rose-600 bg-clip-text text-transparent">
                Recent Workouts
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-primary/50 via-transparent to-transparent"></div>
            </div>
            <ExerciseList />
          </motion.div>
        </motion.div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {modals.exerciseForm && (
          <ExerciseForm
            onClose={() => closeModal('exerciseForm')}
            initialName={prefill?.name}
            initialCategory={prefill?.category}
          />
        )}
        {modals.compare && <CompareModal onClose={() => closeModal('compare')} />}
        {modals.download && <DownloadModal onClose={() => closeModal('download')} />}
        {modals.library && (
          <LibraryModal
            onClose={() => closeModal('library')}
            onSelectExercise={handleLibrarySelect}
          />
        )}
        {modals.progress && <ProgressModal onClose={() => closeModal('progress')} />}
        {modals.templates && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-card border border-border/50 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden backdrop-blur-xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Workout Templates</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => closeModal('templates')}
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <TemplateLibrary
                  onStartWorkout={handleStartWorkoutFromTemplate}
                  onCreateTemplate={handleCreateTemplate}
                />
              </div>
            </div>
          </div>
        )}
        {modals.user && <UserProfileModal onClose={() => closeModal('user')} />}
        {modals.templateForm && (
          <TemplateForm
            open={modals.templateForm}
            onClose={() => closeModal('templateForm')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
