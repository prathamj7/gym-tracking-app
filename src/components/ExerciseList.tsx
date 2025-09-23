import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Calendar, Clock, Dumbbell, Hash, Trash2, Weight, Pencil, Search, X, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useMemo, useState } from "react";
import { ExerciseForm } from "@/components/ExerciseForm";

const EXERCISE_CATEGORIES: Array<string> = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Core",
  "Cardio",
  "Other",
];

export function ExerciseList() {
  const [category, setCategory] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "weight" | "sets" | "reps">("date");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editing, setEditing] = useState<any | null>(null);

  const queryArgs = useMemo(() => {
    return {
      category: category === "ALL" ? null : category,
      startDate: null,
      endDate: null,
      sortBy,
    };
  }, [category, sortBy]);

  const exercises = useQuery(api.exercises.listFiltered, queryArgs);
  const removeExercise = useMutation(api.exercises.remove);

  // Enhanced filtering with search
  const filteredAndSortedExercises = useMemo(() => {
    if (!exercises) return [];
    
    let filtered = exercises.filter((exercise) => {
      const searchLower = searchTerm.toLowerCase().trim();
      return (
        exercise.name.toLowerCase().includes(searchLower) ||
        exercise.category.toLowerCase().includes(searchLower) ||
        (exercise.notes && exercise.notes.toLowerCase().includes(searchLower))
      );
    });

    // Sort by date (most recent first) as secondary sort
    return filtered.sort((a, b) => {
      if (!a.performedAt && !b.performedAt) return 0;
      if (!a.performedAt) return 1;
      if (!b.performedAt) return -1;
      return new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime();
    });
  }, [exercises, searchTerm]);

  const handleDelete = async (id: string) => {
    try {
      await removeExercise({ id: id as any });
      toast.success("Exercise deleted successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(`Failed to delete exercise: ${errorMessage}`);
      console.error("Delete failed:", error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const resetFilters = () => {
    setCategory("ALL");
    setSortBy("date");
    setSearchTerm("");
  };

  // Enhanced loading state
  if (exercises === undefined) {
    return (
      <div className="space-y-4">
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-10 bg-muted rounded animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
          </div>
        </Card>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading exercises...</p>
        </div>
      </div>
    );
  }

  // Enhanced empty state
  if (exercises.length === 0) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    disabled
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory} disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    {EXERCISE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Sort by</Label>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)} disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date (newest)</SelectItem>
                    <SelectItem value="weight">Total weight</SelectItem>
                    <SelectItem value="sets">Sets</SelectItem>
                    <SelectItem value="reps">Reps</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Dumbbell className="h-12 w-12 text-muted-foreground" />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium">No exercises yet</h3>
            <p className="text-sm text-muted-foreground">
              Start your fitness journey by adding your first exercise!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  {EXERCISE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Sort by</Label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date (newest)</SelectItem>
                  <SelectItem value="weight">Total weight</SelectItem>
                  <SelectItem value="sets">Sets</SelectItem>
                  <SelectItem value="reps">Reps</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={resetFilters}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {filteredAndSortedExercises.length === 0 && searchTerm ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No exercises found</h3>
          <p className="text-muted-foreground">
            No exercises match your search "{searchTerm}". Try a different search term.
          </p>
        </motion.div>
      ) : filteredAndSortedExercises.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Dumbbell className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No matching workouts</h3>
          <p className="text-muted-foreground">
            Try adjusting filters or log a new exercise.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedExercises.map((exercise, index) => (
            <motion.div
              key={exercise._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold">{exercise.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{exercise.category}</Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(exercise.performedAt)}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setEditing({
                          _id: exercise._id,
                          name: exercise.name,
                          category: exercise.category,
                          sets: exercise.sets,
                          reps: exercise.reps,
                          weight: exercise.weight,
                          duration: exercise.duration,
                          notes: exercise.notes,
                          performedAt: exercise.performedAt,
                        })
                      }
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(exercise._id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-4 text-sm">
                    {typeof exercise.sets === "number" && (
                      <div className="flex items-center gap-1">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{exercise.sets}</span>
                        <span className="text-muted-foreground">sets</span>
                      </div>
                    )}
                    {typeof exercise.reps === "number" && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{exercise.reps}</span>
                        <span className="text-muted-foreground">reps</span>
                      </div>
                    )}
                    {typeof exercise.weight === "number" && (
                      <div className="flex items-center gap-1">
                        <Weight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{exercise.weight}</span>
                        <span className="text-muted-foreground">kg</span>
                      </div>
                    )}
                    {typeof exercise.duration === "number" && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{exercise.duration}</span>
                        <span className="text-muted-foreground">min</span>
                      </div>
                    )}
                  </div>
                  {exercise.notes && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">{exercise.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      {/* Edit Modal */}
      {editing && (
        <ExerciseForm
          onClose={() => setEditing(null)}
          existing={editing}
        />
      )}
    </div>
  );
}