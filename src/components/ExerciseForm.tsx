import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Plus, X, Trash2 } from "lucide-react";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";

interface Set {
  id: string;
  reps: number | string;
  weight: number | string;
  notes: string;
}

interface ExerciseFormProps {
  onClose: () => void;
  // Added: initial values support
  initialName?: string;
  initialCategory?: string;
  // Added: editing support
  existing?: {
    _id: string;
    name: string;
    category: string;
    sets?: number;
    reps?: number;
    weight?: number;
    setsData?: Array<{
      reps: number;
      weight?: number;
      notes?: string;
    }>;
    duration?: number;
    notes?: string;
    performedAt: number;
  };
}

const EXERCISE_CATEGORIES = [
  "Chest",
  "Back", 
  "Shoulders",
  "Arms",
  "Legs",
  "Core",
  "Cardio",
  "Other"
];

export function ExerciseForm({ onClose, initialName, initialCategory, existing }: ExerciseFormProps) {
  const createExercise = useMutation(api.exercises.create);
  const updateExercise = useMutation(api.exercises.update);
  const [isLoading, setIsLoading] = useState(false);

  // State for managing multiple sets
  const [sets, setSets] = useState<Set[]>(() => {
    if (existing?.setsData && existing.setsData.length > 0) {
      // Load existing sets data
      return existing.setsData.map((set, index) => ({
        id: `set-${index}`,
        reps: set.reps,
        weight: set.weight || '',
        notes: set.notes || '',
      }));
    } else if (existing?.reps || existing?.weight) {
      // Convert legacy format to new format
      return [{
        id: 'set-0',
        reps: existing.reps || '',
        weight: existing.weight || '',
        notes: '',
      }];
    } else {
      // Start with one empty set
      return [{
        id: 'set-0',
        reps: '',
        weight: '',
        notes: '',
      }];
    }
  });

  // Functions to manage sets
  const addSet = () => {
    const newSet: Set = {
      id: `set-${Date.now()}`,
      reps: '',
      weight: '',
      notes: '',
    };
    setSets([...sets, newSet]);
  };

  const removeSet = (id: string) => {
    if (sets.length > 1) {
      setSets(sets.filter(set => set.id !== id));
    }
  };

  const updateSet = (id: string, field: keyof Set, value: string | number) => {
    setSets(sets.map(set => 
      set.id === id ? { ...set, [field]: value } : set
    ));
  };

  // Add: safe formatter for date input default value
  const toDateInputValue = (ts?: number) => {
    if (typeof ts === "number" && Number.isFinite(ts)) {
      const d = new Date(ts);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    }
    return new Date().toISOString().slice(0, 10);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const dateStr = formData.get("date") as string | null;
      const exerciseName = formData.get("name") as string;
      const category = formData.get("category") as string;

      // Validate required fields
      if (!exerciseName?.trim()) {
        throw new Error("Exercise name is required");
      }
      if (!category) {
        throw new Error("Category is required");
      }

      // Use selected date with current local time
      const now = new Date();
      let performedAtDate = dateStr ? new Date(dateStr) : new Date(existing ? existing.performedAt : Date.now());
      if (dateStr) {
        performedAtDate.setHours(
          now.getHours(),
          now.getMinutes(),
          now.getSeconds(),
          now.getMilliseconds()
        );
      }
      const performedAt = performedAtDate.getTime();

      // Process sets data
      const validSets = sets.filter(set => {
        const reps = typeof set.reps === 'string' ? parseInt(set.reps) : set.reps;
        return !isNaN(reps) && reps > 0;
      });

      if (validSets.length === 0) {
        throw new Error("Please enter at least one valid set with reps");
      }

      // Convert sets to the format expected by the API
      const setsData = validSets.map(set => {
        const reps = typeof set.reps === 'string' ? parseInt(set.reps) : set.reps;
        const weight = typeof set.weight === 'string' ? 
          (set.weight.trim() === '' ? undefined : parseFloat(set.weight)) : 
          set.weight;
        
        if (isNaN(reps) || reps <= 0) {
          throw new Error("All sets must have valid reps (positive integer)");
        }
        if (weight !== undefined && (isNaN(weight) || weight < 0)) {
          throw new Error("Weight must be a non-negative number");
        }

        return {
          reps,
          weight,
          notes: typeof set.notes === 'string' ? set.notes.trim() || undefined : undefined,
        };
      });

      // Get duration for cardio exercises
      const durationStr = (formData.get("duration") as string) || "";
      const duration = durationStr.trim() === "" ? undefined : Number(durationStr);
      if (duration !== undefined && (isNaN(duration) || duration <= 0)) {
        throw new Error("Duration must be a positive number");
      }

      const notes = (formData.get("notes") as string) || "";

      if (existing) {
        // Editing existing exercise
        const result = await updateExercise({
          id: existing._id as any,
          name: exerciseName.trim(),
          category,
          setsData,
          duration,
          notes: notes.trim() || undefined,
          performedAt,
        });
        
        toast.success("Exercise updated successfully!");
      } else {
        // Creating new exercise
        console.log("Creating exercise with data:", {
          name: exerciseName.trim(),
          category,
          setsData,
          duration,
          notes: notes.trim() || undefined,
          performedAt,
        });
        const result = await createExercise({
          name: exerciseName.trim(),
          category,
          setsData,
          duration,
          notes: notes.trim() || undefined,
          performedAt,
        });

        if (result?.isNewPR) {
          const prType = result.dimension === "weight" ? "weight" : "time";
          toast.success(`🎉 New ${prType} PR for ${exerciseName}!`, {
            duration: 4000,
          });
        } else {
          const action = result?.isNewEntry ? "logged" : "added to existing entry";
          toast.success(`Exercise ${action} successfully!`);
        }
      }
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(`Failed to ${existing ? 'update' : 'create'} exercise: ${errorMessage}`);
      console.error("Exercise operation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm sm:max-w-md my-4 mx-2 sm:mx-0"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-bold">{existing ? "Edit Exercise" : "Log Exercise"}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Exercise Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Bench Press"
                  required
                  defaultValue={
                    typeof existing?.name === "string"
                      ? existing.name
                      : typeof initialName === "string"
                        ? initialName
                        : undefined
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={
                    existing
                      ? toDateInputValue(existing.performedAt)
                      : new Date().toISOString().slice(0, 10)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" required defaultValue={existing?.category || initialCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXERCISE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sets Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Sets</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSet}
                    className="h-8 px-3 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Set
                  </Button>
                </div>

                <div className="space-y-2">
                  {sets.map((set, index) => (
                    <motion.div
                      key={set.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-12 gap-2 items-center bg-muted/20 p-3 rounded-lg border"
                    >
                      <div className="col-span-2 text-sm font-medium text-center">
                        Set {index + 1}
                      </div>
                      
                      <div className="col-span-3">
                        <Label htmlFor={`reps-${set.id}`} className="sr-only">Reps</Label>
                        <Input
                          id={`reps-${set.id}`}
                          type="number"
                          min="1"
                          placeholder="Reps"
                          value={set.reps}
                          onChange={(e) => updateSet(set.id, 'reps', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>

                      <div className="col-span-1 text-center text-xs text-muted-foreground">
                        ×
                      </div>

                      <div className="col-span-4">
                        <Label htmlFor={`weight-${set.id}`} className="sr-only">Weight</Label>
                        <Input
                          id={`weight-${set.id}`}
                          type="number"
                          step="0.5"
                          min="0"
                          placeholder="Weight (kg)"
                          value={set.weight}
                          onChange={(e) => updateSet(set.id, 'weight', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>

                      <div className="col-span-2 flex justify-end">
                        {sets.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSet(set.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>

                      {/* Set Notes - Full width below the main row */}
                      <div className="col-span-12 mt-1">
                        <Label htmlFor={`notes-${set.id}`} className="sr-only">Set Notes</Label>
                        <Input
                          id={`notes-${set.id}`}
                          placeholder="Set notes (optional)"
                          value={set.notes}
                          onChange={(e) => updateSet(set.id, 'notes', e.target.value)}
                          className="h-7 text-xs"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Duration for cardio exercises */}
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (min) - Optional for cardio</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min="1"
                  placeholder="30"
                  defaultValue={typeof existing?.duration === "number" ? existing.duration : undefined}
                />
              </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    min="1"
                    placeholder="30"
                    defaultValue={typeof existing?.duration === "number" ? existing.duration : undefined}
                />
              </div>              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Add any notes about your workout..."
                  rows={3}
                  defaultValue={existing?.notes || undefined}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                <Plus className="mr-2 h-4 w-4" />
                {isLoading ? (existing ? "Saving..." : "Logging...") : (existing ? "Save Changes" : "Log Exercise")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}