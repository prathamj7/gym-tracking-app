/**
 * Template Form Component
 * 
 * Simple form for creating new workout templates
 */

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Dumbbell } from "lucide-react";
import { useWorkoutTemplates } from "@/hooks/use-workout-templates";

interface TemplateFormProps {
  open: boolean;
  onClose: () => void;
}

interface Exercise {
  name: string;
  category: string;
  targetSets: number;
  targetReps: string;
  targetWeight?: number;
  restTime: number;
  notes?: string;
}

export function TemplateForm({ open, onClose }: TemplateFormProps) {
  const { createTemplate, isLoading } = useWorkoutTemplates();
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: "", category: "Other", targetSets: 3, targetReps: "8-12", restTime: 60, notes: "" }
  ]);

  const categories = [
    "Push/Pull/Legs",
    "Upper/Lower", 
    "Full Body",
    "Body Part Split",
    "Strength Program",
    "Quick Workout",
    "Custom"
  ];

  const difficulties = ["Beginner", "Intermediate", "Advanced"];

  const addExercise = () => {
    setExercises([...exercises, { name: "", category: "Other", targetSets: 3, targetReps: "8-12", restTime: 60, notes: "" }]);
  };

  const removeExercise = (index: number) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((_, i) => i !== index));
    }
  };

  const updateExercise = (index: number, field: keyof Exercise, value: string | number | undefined) => {
    const updated = exercises.map((exercise, i) => 
      i === index ? { ...exercise, [field]: value } : exercise
    );
    setExercises(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!templateName.trim() || !category || !difficulty) {
      alert("Please fill in all required fields");
      return;
    }

    const validExercises = exercises.filter(ex => ex.name.trim());
    if (validExercises.length === 0) {
      alert("Please add at least one exercise");
      return;
    }

    try {
      await createTemplate({
        name: templateName.trim(),
        description: description.trim() || undefined,
        category,
        difficulty,
        estimatedDuration: validExercises.length * 8, // rough estimate
        exercises: validExercises.map((ex, index) => ({
          name: ex.name.trim(),
          category: ex.category,
          targetSets: ex.targetSets,
          targetReps: ex.targetReps,
          ...(ex.targetWeight !== undefined && { targetWeight: ex.targetWeight }),
          restTime: ex.restTime,
          notes: ex.notes?.trim() || undefined,
          order: index + 1
        }))
      });
      
      // Reset form
      setTemplateName("");
      setDescription("");
      setCategory("");
      setDifficulty("");
      setExercises([{ name: "", category: "Other", targetSets: 3, targetReps: "8-12", restTime: 60, notes: "" }]);
      onClose();
    } catch (error) {
      console.error("Failed to create template:", error);
      alert("Failed to create template. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Dumbbell className="h-5 w-5 text-primary" />
            Create New Template
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a custom workout template that you can reuse for your training sessions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Template Name *</Label>
              <Input
                id="name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., My Push Day"
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this workout..."
                rows={2}
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Category *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="bg-muted/50 border-border text-foreground">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-foreground hover:bg-muted/50">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Difficulty *</Label>
                <Select value={difficulty} onValueChange={setDifficulty} required>
                  <SelectTrigger className="bg-muted/50 border-border text-foreground">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {difficulties.map((diff) => (
                      <SelectItem key={diff} value={diff} className="text-foreground hover:bg-muted/50">
                        {diff}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Exercises */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-foreground text-base font-medium">Exercises</Label>
              <Button
                type="button"
                onClick={addExercise}
                size="sm"
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
                Add Exercise
              </Button>
            </div>

            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <div key={index} className="p-4 border border-border rounded-lg bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-foreground font-medium">Exercise {index + 1}</Label>
                    {exercises.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeExercise(index)}
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Input
                      value={exercise.name}
                      onChange={(e) => updateExercise(index, "name", e.target.value)}
                      placeholder="Exercise name (e.g., Bench Press)"
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    />
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <Select 
                        value={exercise.category} 
                        onValueChange={(value) => updateExercise(index, "category", value)}
                      >
                        <SelectTrigger className="bg-background border-border text-foreground">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border">
                          <SelectItem value="Chest" className="text-foreground hover:bg-muted/50">Chest</SelectItem>
                          <SelectItem value="Back" className="text-foreground hover:bg-muted/50">Back</SelectItem>
                          <SelectItem value="Shoulders" className="text-foreground hover:bg-muted/50">Shoulders</SelectItem>
                          <SelectItem value="Arms" className="text-foreground hover:bg-muted/50">Arms</SelectItem>
                          <SelectItem value="Legs" className="text-foreground hover:bg-muted/50">Legs</SelectItem>
                          <SelectItem value="Core" className="text-foreground hover:bg-muted/50">Core</SelectItem>
                          <SelectItem value="Other" className="text-foreground hover:bg-muted/50">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Input
                        type="number"
                        value={exercise.targetSets}
                        onChange={(e) => updateExercise(index, "targetSets", parseInt(e.target.value) || 1)}
                        placeholder="Sets"
                        min="1"
                        max="10"
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                      />
                      
                      <Input
                        value={exercise.targetReps}
                        onChange={(e) => updateExercise(index, "targetReps", e.target.value)}
                        placeholder="Reps"
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                      />
                      
                      <Input
                        type="number"
                        value={exercise.targetWeight !== undefined ? exercise.targetWeight : ""}
                        onChange={(e) => updateExercise(index, "targetWeight", e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="Weight (kg) - optional"
                        step="0.5"
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                      />
                      
                      <Input
                        type="number"
                        value={exercise.restTime}
                        onChange={(e) => updateExercise(index, "restTime", parseInt(e.target.value) || 60)}
                        placeholder="Rest (sec)"
                        min="30"
                        max="300"
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  <Input
                    value={exercise.notes || ""}
                    onChange={(e) => updateExercise(index, "notes", e.target.value)}
                    placeholder="Notes (optional)"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-border text-foreground hover:bg-muted/50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? "Creating..." : "Create Template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}