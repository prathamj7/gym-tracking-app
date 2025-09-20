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
import { useQuery } from "convex/react";
import { PRList } from "@/components/PRList";
import { CompareModal } from "@/components/dashboard/CompareModal";
import { DownloadModal } from "@/components/dashboard/DownloadModal";
import { LibraryModal } from "@/components/dashboard/LibraryModal";
import { ProgressModal } from "@/components/dashboard/ProgressModal";
import { UserProfileModal } from "@/components/dashboard/UserProfileModal";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [prefill, setPrefill] = useState<{ name?: string; category?: string } | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const firstName = (user.name ?? "").trim().split(" ")[0] || "Friend";
  const daysSinceSignup = Math.max(
    0,
    Math.floor((Date.now() - (user._creationTime ?? Date.now())) / (24 * 60 * 60 * 1000))
  ) + 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                <Dumbbell className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">FitTracker</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => setShowDownload(true)} className="hidden sm:inline-flex">
                Download Progress <span className="ml-2">📥</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowLibrary(true)} className="hidden sm:inline-flex">
                Exercise Library
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowProgress(true)} className="hidden sm:inline-flex">
                Progress Chart
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUser(true)}
                title="View Profile"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Welcome Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back, {firstName}!
              </h1>
              <p className="mt-1 text-foreground">
                Track your progress and stay motivated
              </p>
            </div>
            <Button
              onClick={() => setShowExerciseForm(true)}
              size="lg"
              className="w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Log Exercise
            </Button>
            <Button
              onClick={() => setShowCompare(true)}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Compare
            </Button>
          </div>

          {/* Stats Cards */}
          <StatsCards />

          {/* Personal Records */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-6">Personal Records</h2>
            <PRList />
          </div>

          {/* Exercise List */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-6">Recent Workouts</h2>
            <ExerciseList />
          </div>
        </motion.div>
      </main>

      {/* Exercise Form Modal */}
      <AnimatePresence>
        {showExerciseForm && (
          <ExerciseForm
            onClose={() => {
              setShowExerciseForm(false);
              setPrefill(null);
            }}
            initialName={prefill?.name}
            initialCategory={prefill?.category}
          />
        )}
      </AnimatePresence>

      {/* Compare Modal */}
      {showCompare && (
        <CompareModal onClose={() => setShowCompare(false)} />
      )}

      {/* Download Modal */}
      {showDownload && (
        <DownloadModal onClose={() => setShowDownload(false)} />
      )}

      {/* Exercise Library Modal */}
      {showLibrary && (
        <LibraryModal
          onClose={() => setShowLibrary(false)}
          onSelectExercise={({ name, category }) => {
            setShowLibrary(false);
            setPrefill({ name, category });
            setShowExerciseForm(true);
          }}
        />
      )}

      {/* Progress Chart Modal */}
      {showProgress && (
        <ProgressModal onClose={() => setShowProgress(false)} />
      )}

      {/* User Profile Modal */}
      {showUser && (
        <UserProfileModal onClose={() => setShowUser(false)} />
      )}
    </div>
  );
}