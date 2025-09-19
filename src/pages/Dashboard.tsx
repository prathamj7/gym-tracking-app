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
import { ExerciseCompare } from "@/components/ExerciseCompare";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PRList } from "@/components/PRList";
import { ExerciseLibrary } from "@/components/ExerciseLibrary";
import { useMemo } from "react";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [prefill, setPrefill] = useState<{ name?: string; category?: string } | null>(null);
  const setProfile = useMutation(api.users.setProfile);

  // Load exercise names for dropdown
  const names = useQuery(api.exercises.listNames);

  // Prepare export queries (only when inputs are present)
  const rowsByDate = useQuery(
    api.exercises.listByDate,
    selectedDate ? ({ date: new Date(selectedDate).getTime() } as any) : undefined,
  );

  const rowsByExercise = useQuery(
    api.exercises.listByExerciseName,
    selectedExercise ? ({ name: selectedExercise } as any) : undefined,
  );

  // CSV generator
  const downloadCsv = (rows: any[], filename: string) => {
    if (!rows || rows.length === 0) {
      toast("No entries found to download.");
      return;
    }
    const header = ["Name", "Category", "Sets", "Reps", "Weight(kg)", "Duration(min)", "Notes", "Performed At"];
    const csvRows = rows.map((e) => {
      const performed = new Date(e.performedAt).toLocaleString();
      return [
        e.name,
        e.category,
        e.sets,
        e.reps,
        e.weight ?? "",
        e.duration ?? "",
        (e.notes ?? "").toString().replace(/\n/g, " ").replace(/,/g, ";"),
        performed,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
    });
    const csv = [header.join(","), ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast("Download started.");
  };

  const handleDownloadByDate = () => {
    if (!selectedDate) {
      toast("Please select a date first.");
      return;
    }
    const dateStr = selectedDate;
    downloadCsv(rowsByDate || [], `fittracker_by_date_${dateStr}.csv`);
  };

  const handleDownloadByExercise = () => {
    if (!selectedExercise) {
      toast("Please select an exercise first.");
      return;
    }
    const safeName = selectedExercise.replace(/\\s+/g, "_");
    downloadCsv(rowsByExercise || [], `fittracker_by_exercise_${safeName}.csv`);
  };

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
                <span className="text-xl font-bold">TrackFit</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => setShowDownload(true)} className="hidden sm:inline-flex">
                Download Progress <span className="ml-2">📥</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowLibrary(true)} className="hidden sm:inline-flex">
                Exercise Library
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
      <AnimatePresence>
        {showCompare && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCompare(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl"
            >
              <ExerciseCompare />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Added: Download Modal */}
      <AnimatePresence>
        {showDownload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDownload(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <div className="bg-card border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b">
                  <h3 className="text-lg font-semibold">Download Progress</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowDownload(false)}>
                    Close
                  </Button>
                </div>
                <div className="p-5 space-y-6">
                  {/* Option 1: Download by Date */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Download by Date</div>
                        <div className="text-sm text-muted-foreground">
                          Select a date to download all exercises logged on that day.
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button className="w-full" onClick={handleDownloadByDate}>
                          Download CSV
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t my-2" />

                  {/* Option 2: Download by Exercise */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Download by Exercise</div>
                        <div className="text-sm text-muted-foreground">
                          Choose an exercise to download all your logged entries for it.
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Exercise</Label>
                        <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select exercise" />
                          </SelectTrigger>
                          <SelectContent>
                            {(names ?? []).map((n) => (
                              <SelectItem key={n} value={n}>
                                {n}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button className="w-full" onClick={handleDownloadByExercise}>
                          Download CSV
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise Library Modal */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowLibrary(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl"
            >
              <ExerciseLibrary
                onClose={() => setShowLibrary(false)}
                onSelectExercise={({ name, category }) => {
                  setShowLibrary(false);
                  setPrefill({ name, category });
                  setShowExerciseForm(true);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Profile Modal */}
      <AnimatePresence>
        {showUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowUser(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <div className="bg-card border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b">
                  <h3 className="text-lg font-semibold">Your Profile</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowUser(false)}>
                    Close
                  </Button>
                </div>
                <div className="p-5">
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget as HTMLFormElement);
                      const fName = (fd.get("firstName") as string || "").trim();
                      const lName = (fd.get("lastName") as string || "").trim();
                      const ageStr = (fd.get("age") as string || "").trim();
                      const weightStr = (fd.get("weight") as string || "").trim();
                      const age = ageStr ? Number(ageStr) : undefined;
                      const weight = weightStr ? Number(weightStr) : undefined;

                      try {
                        await setProfile({
                          firstName: fName || (user.name ?? "").split(" ")[0] || "",
                          lastName:
                            lName ||
                            (user.name ?? "")
                              .split(" ")
                              .slice(1)
                              .join(" ")
                              .trim() ||
                            "",
                          age,
                          weight,
                        } as any);
                        toast("Profile saved");
                        setShowUser(false);
                      } catch (err) {
                        console.error(err);
                        toast("Failed to save profile");
                      }
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>First name</Label>
                        <Input
                          name="firstName"
                          defaultValue={(user.name ?? "").split(" ")[0] || ""}
                          placeholder="First name"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Last name</Label>
                        <Input
                          name="lastName"
                          defaultValue={(user.name ?? "").split(" ").slice(1).join(" ") || ""}
                          placeholder="Last name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Age</Label>
                        <Input
                          name="age"
                          type="number"
                          min="0"
                          defaultValue={typeof (user as any).age === "number" ? (user as any).age : undefined}
                          placeholder="e.g., 28"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Current weight (kg)</Label>
                        <Input
                          name="weight"
                          type="number"
                          min="0"
                          step="0.1"
                          defaultValue={typeof (user as any).weight === "number" ? (user as any).weight : undefined}
                          placeholder="e.g., 70"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label>Email</Label>
                      <Input value={user.email ?? ""} disabled />
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Working out since: <span className="font-medium">{daysSinceSignup}</span> days
                    </div>

                    <div className="pt-2">
                      <Button type="submit" className="w-full">
                        Save
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}