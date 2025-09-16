import { Button } from "@/components/ui/button";
import { ExerciseForm } from "@/components/ExerciseForm";
import { ExerciseList } from "@/components/ExerciseList";
import { StatsCards } from "@/components/StatsCards";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, LogOut, Plus, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ExerciseCompare } from "@/components/ExerciseCompare";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showExerciseForm, setShowExerciseForm] = useState(false);

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
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span>{user.name || user.email || "User"}</span>
              </div>
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
                Welcome back, {user.name || "Fitness Enthusiast"}!
              </h1>
              <p className="text-muted-foreground mt-1">
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
          </div>

          {/* Stats Cards */}
          <StatsCards />

          {/* Compare Exercises */}
          <ExerciseCompare />

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
          <ExerciseForm onClose={() => setShowExerciseForm(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}