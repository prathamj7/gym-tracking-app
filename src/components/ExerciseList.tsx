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
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(10);

  // Use recent query for main display (shows most recent exercises by date)
  const recentData = useQuery(api.exercises.listRecent, { limit, offset: 0 });
  
  // Use filtered query only when filters are applied
  const filteredQueryArgs = useMemo(() => {
    if (!showFilters && category === "ALL" && !searchTerm) {
      return "skip"; // Don't run the filtered query when not needed
    }
    return {
      category: category === "ALL" ? null : category,
      startDate: null,
      endDate: null,
      sortBy,
    };
  }, [category, sortBy, showFilters, searchTerm]);

  const filteredExercises = useQuery(
    api.exercises.listFiltered, 
    filteredQueryArgs === "skip" ? "skip" : filteredQueryArgs
  );
  const removeExercise = useMutation(api.exercises.remove);

  // Determine which data source to use and apply filtering
  const filteredAndSortedExercises = useMemo(() => {
    // If filters are active, use filtered exercises; otherwise use recent exercises
    const sourceExercises = showFilters || category !== "ALL" || searchTerm 
      ? filteredExercises 
      : recentData?.exercises;

    if (!sourceExercises) return [];
    
    let filtered = sourceExercises.filter((exercise: any) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase().trim();
      return (
        exercise.name.toLowerCase().includes(searchLower) ||
        exercise.category.toLowerCase().includes(searchLower) ||
        (exercise.notes && exercise.notes.toLowerCase().includes(searchLower))
      );
    });

    // For recent data, it's already sorted by date; for filtered data, apply sorting
    if (showFilters || category !== "ALL" || searchTerm) {
      return filtered.sort((a: any, b: any) => {
        if (!a.performedAt && !b.performedAt) return 0;
        if (!a.performedAt) return 1;
        if (!b.performedAt) return -1;
        return new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime();
      });
    }

    return filtered;
  }, [recentData?.exercises, filteredExercises, searchTerm, showFilters, category]);

  // Load more functionality
  const handleLoadMore = () => {
    setLimit(prev => prev + 10);
  };

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
    setShowFilters(false);
    setLimit(10); // Reset to initial limit
  };

  // Enhanced loading state
  if (recentData === undefined && filteredExercises === undefined) {
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
  const hasAnyExercises = (recentData?.exercises && recentData.exercises.length > 0) || 
                        (filteredExercises && filteredExercises.length > 0);

  if (!hasAnyExercises) {
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
      {/* Toggle Filters Button */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={() => {
            setShowFilters(!showFilters);
            if (!showFilters) {
              // When showing filters, enable filtering mode
              setSearchTerm("");
              setCategory("ALL");
            }
          }}
          className="mb-2"
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
        {(searchTerm || category !== "ALL") && (
          <span className="text-sm text-muted-foreground">
            Showing filtered results
          </span>
        )}
      </div>

      {/* Collapsible Filters */}
      {showFilters && (
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
      )}

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
                          setsData: exercise.setsData,
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
                  {/* Display new setsData format */}
                  {exercise.setsData && exercise.setsData.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Hash className="h-4 w-4" />
                        <span>{exercise.setsData.length} sets</span>
                      </div>
                      <div className="space-y-2">
                        {exercise.setsData.map((set, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg text-sm">
                            <span className="font-medium min-w-[3rem]">Set {index + 1}:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{set.reps}</span>
                              <span className="text-muted-foreground">reps</span>
                            </div>
                            {typeof set.weight === "number" && (
                              <div className="flex items-center gap-1">
                                <Weight className="h-3 w-3 text-muted-foreground" />
                                <span className="font-medium">{set.weight}</span>
                                <span className="text-muted-foreground">kg</span>
                              </div>
                            )}
                            {set.notes && (
                              <div className="flex-1 text-xs text-muted-foreground italic">
                                "{set.notes}"
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {typeof exercise.duration === "number" && (
                        <div className="flex items-center gap-1 text-sm pt-2 border-t">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{exercise.duration}</span>
                          <span className="text-muted-foreground">min</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Fallback to legacy format for backward compatibility */
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
                  )}
                  {exercise.notes && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">{exercise.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
          
          {/* Load More Button - only show when using recent data and there are more exercises */}
          {!showFilters && !searchTerm && category === "ALL" && recentData && recentData.hasMore && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center pt-4"
            >
              <Button 
                variant="outline" 
                onClick={handleLoadMore}
                className="px-8"
              >
                Load More
              </Button>
            </motion.div>
          )}
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