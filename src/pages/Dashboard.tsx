import { Button } from "@/components/ui/button";
import { ExerciseForm } from "@/components/ExerciseForm";
import { ExerciseList } from "@/components/ExerciseList";
import { StatsCards } from "@/components/StatsCards";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, LogOut, Plus, User } from "lucide-react";
import { BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { PRList } from "@/components/PRList";
import { CompareModal } from "@/components/dashboard/CompareModal";
import { DownloadModal } from "@/components/dashboard/DownloadModal";
import { LibraryModal } from "@/components/dashboard/LibraryModal";
import { ProgressModal } from "@/components/dashboard/ProgressModal";
import { UserProfileModal } from "@/components/dashboard/UserProfileModal";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Centralized modal state
  const [modals, setModals] = useState({
    exerciseForm: false,
    compare: false,
    download: false,
    library: false,
    user: false,
    progress: false,
  });
  
  const [prefill, setPrefill] = useState<{ name?: string; category?: string } | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Centralized modal management
  const openModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
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
      user: false,
      progress: false,
    });
    setPrefill(null);
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
      <header className="border-b bg-card shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                <Dumbbell className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">FitTracker</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openModal('download')}
                className="hidden sm:inline-flex hover:bg-primary/10 transition"
                title="Download Progress (Ctrl+D)"
              >
                Download Progress <span className="ml-2">📥</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openModal('library')}
                className="hidden sm:inline-flex hover:bg-primary/10 transition"
                title="Exercise Library (Ctrl+L)"
              >
                Exercise Library
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openModal('progress')}
                className="hidden sm:inline-flex hover:bg-primary/10 transition"
                title="Progress Chart (Ctrl+P)"
              >
                Progress Chart
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openModal('user')}
                title="View Profile"
                className="hover:bg-primary/10 transition"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="hover:bg-primary/10 transition">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-card rounded-xl shadow-md mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-10"
        >
          {/* Welcome Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-rose-500 bg-clip-text text-transparent">
                Welcome back, {firstName}!
              </h1>
              <p className="mt-1 text-foreground/90 font-semibold">
                Track your progress and stay motivated
              </p>
            </div>
            <div className="flex gap-4 flex-wrap sm:flex-nowrap">
              <Button
                onClick={() => openModal('exerciseForm')}
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-primary via-rose-600 to-rose-700 shadow-lg hover:scale-105 transition-transform font-semibold"
                title="Log Exercise (Ctrl+E)"
              >
                <Plus className="mr-2 h-5 w-5" />
                Log Exercise
              </Button>
              <Button
                onClick={() => openModal('compare')}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto hover:bg-primary/10 transition font-semibold"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Compare
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <StatsCards />

          {/* Personal Records */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-rose-500 bg-clip-text text-transparent">
              Personal Records
            </h2>
            <PRList />
          </div>

          {/* Exercise List */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-rose-500 bg-clip-text text-transparent">
              Recent Workouts
            </h2>
            <ExerciseList />
          </div>
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
        {modals.user && <UserProfileModal onClose={() => closeModal('user')} />}
      </AnimatePresence>
    </div>
  );
}
