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

import { ThreeDDumbbell } from "@/components/ThreeDDumbbell";
import { ThreeDPlate } from "@/components/ThreeDPlate";
import { ThreeDFootprint } from "@/components/ThreeDFootprint";

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
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <Dumbbell className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">FitTracker</span>
              <div className="flex gap-4 ml-6">
                <ThreeDDumbbell />
                <ThreeDPlate />
                <ThreeDFootprint />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => setShowDownload(true)} className="hidden sm:inline-flex hover:bg-primary/10 transition">
                Download Progress <span className="ml-2">📥</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowLibrary(true)} className="hidden sm:inline-flex hover:bg-primary/10 transition">
                Exercise Library
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowProgress(true)} className="hidden sm:inline-flex hover:bg-primary/10 transition">
                Progress Chart
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowUser(true)} title="View Profile" className="hover:bg-primary/10 transition">
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
          {/* Welcome Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-rose-500 bg-clip-text text-transparent">
                Welcome back, {firstName}!
              </h1>
              <p className="mt-1 text-foreground/90 font-semibold">Track your progress and stay motivated</p>
            </div>
            <div className="flex gap-4 flex-wrap sm:flex-nowrap">
              <Button onClick={() => setShowExerciseForm(true)} size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary via-rose-600 to-rose-700 shadow-lg hover:scale-105 transition-transform font-semibold">
                <Plus className="mr-2 h-5 w-5" />
                Log Exercise
              </Button>
              <Button onClick={() => setShowCompare(true)} variant="outline" size="lg" className="w-full sm:w-auto hover:bg-primary/10 transition font-semibold">
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
        {showCompare && <CompareModal onClose={() => setShowCompare(false)} />}
        {showDownload && <DownloadModal onClose={() => setShowDownload(false)} />}
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
        {showProgress && <ProgressModal onClose={() => setShowProgress(false)} />}
        {showUser && <UserProfileModal onClose={() => setShowUser(false)} />}
      </AnimatePresence>
    </div>
  );
}
