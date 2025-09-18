import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Calendar, Clock, Dumbbell, Hash, Trash2, Weight } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useMemo, useState } from "react";

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

  const handleDelete = async (id: string) => {
    try {
      await removeExercise({ id: id as any });
      toast("Exercise deleted successfully!");
    } catch (error) {
      toast("Failed to delete exercise. Please try again.");
      console.error(error);
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
  };

  if (!exercises) {
    return (
      <div className="space-y-4">
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </Card>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/4 mb-4"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-muted rounded w-16"></div>
                <div className="h-6 bg-muted rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {exercises.length === 0 ? (
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
          {exercises.map((exercise, index) => (
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
                      onClick={() => handleDelete(exercise._id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{exercise.sets}</span>
                      <span className="text-muted-foreground">sets</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{exercise.reps}</span>
                      <span className="text-muted-foreground">reps</span>
                    </div>
                    {exercise.weight && (
                      <div className="flex items-center gap-1">
                        <Weight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{exercise.weight}</span>
                        <span className="text-muted-foreground">lbs</span>
                      </div>
                    )}
                    {exercise.duration && (
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
    </div>
  );
}