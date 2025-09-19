import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";

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

      // Parse optional numeric fields safely
      const setsStr = (formData.get("sets") as string) || "";
      const repsStr = (formData.get("reps") as string) || "";
      const weightStr = (formData.get("weight") as string) || "";
      const durationStr = (formData.get("duration") as string) || "";

      const sets = setsStr.trim() === "" ? undefined : Number(setsStr);
      const reps = repsStr.trim() === "" ? undefined : Number(repsStr);
      const weight = weightStr.trim() === "" ? undefined : Number(weightStr);
      const duration = durationStr.trim() === "" ? undefined : Number(durationStr);

      if (existing) {
        // Update flow
        await updateExercise({
          id: existing._id as any,
          name: formData.get("name") as string,
          category: formData.get("category") as string,
          sets,
          reps,
          weight,
          duration,
          notes: ((formData.get("notes") as string) || undefined) as any,
          performedAt,
        } as any);
        toast("Exercise updated successfully!");
      } else {
        // Create flow
        const result = await createExercise({
          name: formData.get("name") as string,
          category: formData.get("category") as string,
          sets,
          reps,
          weight,
          duration,
          notes: (formData.get("notes") as string) || undefined,
          performedAt,
        } as any);

        if (result?.isNewPR) {
          const dim = result.dimension === "weight" ? "weight" : "duration";
          const emoji = dim === "weight" ? "🏆" : "⏱️";
          toast(`${emoji} New PR achieved!`);
        } else {
          toast("Exercise logged successfully!");
        }
      }
      onClose();
    } catch (error) {
      toast(existing ? "Failed to update exercise. Please try again." : "Failed to log exercise. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sets">Sets</Label>
                  <Input
                    id="sets"
                    name="sets"
                    type="number"
                    min="1"
                    placeholder="3"
                    defaultValue={typeof existing?.sets === "number" ? existing.sets : undefined}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reps">Reps</Label>
                  <Input
                    id="reps"
                    name="reps"
                    type="number"
                    min="1"
                    placeholder="10"
                    defaultValue={typeof existing?.reps === "number" ? existing.reps : undefined}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="60"
                    defaultValue={typeof existing?.weight === "number" ? existing.weight : undefined}
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
                </div>
              </div>

              <div className="space-y-2">
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