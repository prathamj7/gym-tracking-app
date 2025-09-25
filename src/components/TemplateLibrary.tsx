/**
 * Template Library Component
 * 
 * Main interface for browsing and managing workout templates:
 * - Browse pre-built templates by category
 * - View user's personal templates
 * - Create new templates
 * - Start workouts from templates
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Clock, Dumbbell, TrendingUp, Star, User } from "lucide-react";
import { useWorkoutTemplates, WorkoutTemplate } from "@/hooks/use-workout-templates";
import { cn } from "@/lib/utils";

interface TemplateLibraryProps {
  onStartWorkout?: (template: WorkoutTemplate) => void;
  onCreateTemplate?: () => void;
}

export function TemplateLibrary({
  onStartWorkout,
  onCreateTemplate,
}: TemplateLibraryProps) {
  const {
    allTemplates,
    userTemplates,
    getTemplatesByCategory,
    getPreBuiltTemplates,
    getUserOwnTemplates, 
    getPopularTemplates,
    getRecentlyUsedTemplates,
    categories,
    difficulties,
    templateLimit,
    canCreateTemplate,
    isPremium,
    isLoading,
    trackTemplateUsage,
  } = useWorkoutTemplates();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);

  const handleStartWorkout = async (template: WorkoutTemplate) => {
    await trackTemplateUsage(template._id);
    onStartWorkout?.(template);
  };

  const filteredTemplates = selectedCategory === "all" 
    ? getPreBuiltTemplates()
    : getTemplatesByCategory(selectedCategory);

  const popularTemplates = getPopularTemplates();
  const recentTemplates = getRecentlyUsedTemplates();
  const userOwnTemplates = getUserOwnTemplates();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Dumbbell className="h-12 w-12 mx-auto text-gray-400 animate-pulse" />
          <p className="mt-2 text-gray-500">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workout Templates</h2>
          <p className="text-gray-600">Choose from pre-built workouts or create your own</p>
        </div>
        <Button 
          onClick={onCreateTemplate}
          disabled={!canCreateTemplate}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Template
          {!isPremium && (
            <Badge variant="secondary" className="ml-1">
              {userTemplates.length}/{templateLimit}
            </Badge>
          )}
        </Button>
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="popular" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            Popular
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="mine" className="flex items-center gap-1">
            <User className="h-4 w-4" />
            My Templates
          </TabsTrigger>
        </TabsList>

        {/* Browse Templates */}
        <TabsContent value="browse" className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              All Templates
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template._id}
                template={template}
                onStart={handleStartWorkout}
                onViewDetails={setSelectedTemplate}
              />
            ))}
          </div>
        </TabsContent>

        {/* Popular Templates */}
        <TabsContent value="popular" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularTemplates.map((template) => (
              <TemplateCard
                key={template._id}
                template={template}
                onStart={handleStartWorkout}
                onViewDetails={setSelectedTemplate}
                showUsageCount
              />
            ))}
          </div>
        </TabsContent>

        {/* Recent Templates */}
        <TabsContent value="recent" className="space-y-4">
          {recentTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentTemplates.map((template) => (
                <TemplateCard
                  key={template._id}
                  template={template}
                  onStart={handleStartWorkout}
                  onViewDetails={setSelectedTemplate}
                  showLastUsed
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">No recent templates</p>
              <p className="text-sm text-gray-400">Start using templates to see them here</p>
            </div>
          )}
        </TabsContent>

        {/* User Templates */}
        <TabsContent value="mine" className="space-y-4">
          {userOwnTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userOwnTemplates.map((template) => (
                <TemplateCard
                  key={template._id}
                  template={template}
                  onStart={handleStartWorkout}
                  onViewDetails={setSelectedTemplate}
                  isUserTemplate
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">No custom templates yet</p>
              <Button 
                onClick={onCreateTemplate}
                disabled={!canCreateTemplate}
                className="mt-4"
              >
                Create Your First Template
              </Button>
              {!canCreateTemplate && (
                <p className="text-xs text-gray-400 mt-2">
                  Template limit reached. Upgrade to Premium for unlimited templates.
                </p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Template Details Modal */}
      {selectedTemplate && (
        <TemplateDetailsModal
          template={selectedTemplate}
          isOpen={!!selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onStart={handleStartWorkout}
        />
      )}
    </div>
  );
}

// Template Card Component
interface TemplateCardProps {
  template: WorkoutTemplate;
  onStart: (template: WorkoutTemplate) => void;
  onViewDetails: (template: WorkoutTemplate) => void;
  showUsageCount?: boolean;
  showLastUsed?: boolean;
  isUserTemplate?: boolean;
}

function TemplateCard({
  template,
  onStart,
  onViewDetails,
  showUsageCount = false,
  showLastUsed = false,
  isUserTemplate = false,
}: TemplateCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card className="group hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{template.name}</CardTitle>
            <CardDescription className="text-sm">
              {template.description}
            </CardDescription>
          </div>
          {isUserTemplate && (
            <Badge variant="outline" className="text-xs">
              Custom
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <Badge className={cn("text-xs", getDifficultyColor(template.difficulty))}>
            {template.difficulty}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {template.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDuration(template.estimatedDuration)}
            </div>
            <div className="flex items-center gap-1">
              <Dumbbell className="h-4 w-4" />
              {template.exercises.length} exercises
            </div>
          </div>

          {/* Usage Stats */}
          {showUsageCount && template.usageCount && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="h-3 w-3" />
              Used {template.usageCount} times
            </div>
          )}

          {showLastUsed && template.lastUsed && (
            <div className="text-xs text-gray-500">
              Last used {new Date(template.lastUsed).toLocaleDateString()}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onStart(template)}
              className="flex-1"
            >
              Start Workout
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewDetails(template)}
            >
              Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Template Details Modal
interface TemplateDetailsModalProps {
  template: WorkoutTemplate;
  isOpen: boolean;
  onClose: () => void;
  onStart: (template: WorkoutTemplate) => void;
}

function TemplateDetailsModal({
  template,
  isOpen,
  onClose,
  onStart,
}: TemplateDetailsModalProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {template.name}
            <Badge className={cn("text-xs", getDifficultyColor(template.difficulty))}>
              {template.difficulty}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {template.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Info */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <Clock className="h-5 w-5 mx-auto text-gray-600" />
              <p className="text-sm font-medium mt-1">{formatDuration(template.estimatedDuration)}</p>
              <p className="text-xs text-gray-500">Duration</p>
            </div>
            <div className="text-center">
              <Dumbbell className="h-5 w-5 mx-auto text-gray-600" />
              <p className="text-sm font-medium mt-1">{template.exercises.length}</p>
              <p className="text-xs text-gray-500">Exercises</p>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="text-xs">
                {template.category}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">Category</p>
            </div>
          </div>

          {/* Exercise List */}
          <div>
            <h4 className="font-medium mb-3">Exercises</h4>
            <div className="space-y-2">
              {template.exercises
                .sort((a, b) => a.order - b.order)
                .map((exercise, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h5 className="font-medium">{exercise.name}</h5>
                      <p className="text-sm text-gray-600">{exercise.category}</p>
                      {exercise.notes && (
                        <p className="text-xs text-gray-500 mt-1">{exercise.notes}</p>
                      )}
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium">
                        {exercise.targetSets} × {exercise.targetReps}
                      </p>
                      {exercise.targetWeight && (
                        <p className="text-gray-600">{exercise.targetWeight}kg</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {Math.floor(exercise.restTime / 60)}:{(exercise.restTime % 60).toString().padStart(2, '0')} rest
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Action */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => onStart(template)}
              className="flex-1"
            >
              Start This Workout
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TemplateLibrary;