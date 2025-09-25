/**
 * Workout Templates React Hook
 * 
 * Custom hook for managing workout templates in the frontend:
 * - Fetching templates (all, by category, user templates)
 * - Creating, updating, deleting templates
 * - Template usage tracking
 * - Template limit checking for free users
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "./use-auth";
import { useSubscriptionTier } from "./use-subscription";

export interface TemplateExercise {
  name: string;
  category: string;
  targetSets: number;
  targetReps: string;
  targetWeight?: number;
  restTime: number;
  notes?: string;
  order: number;
}

export interface WorkoutTemplate {
  _id: Id<"workoutTemplates">;
  name: string;
  description?: string;
  category: string;
  difficulty: string;
  estimatedDuration: number;
  exercises: TemplateExercise[];
  isPreBuilt: boolean;
  createdBy?: Id<"users">;
  lastUsed?: number;
  usageCount?: number;
  _creationTime: number;
}

export interface CreateTemplateData {
  name: string;
  description?: string;
  category: string;
  difficulty: string;
  estimatedDuration: number;
  exercises: TemplateExercise[];
}

export interface UpdateTemplateData {
  name?: string;
  description?: string;
  category?: string;
  difficulty?: string;
  estimatedDuration?: number;
  exercises?: TemplateExercise[];
}

export const useWorkoutTemplates = () => {
  const { isAuthenticated } = useAuth();
  const { tier: subscriptionTier, isPremium } = useSubscriptionTier();

  // Queries
  const allTemplates = useQuery(
    api.workoutTemplates.getAllTemplates,
    isAuthenticated ? {} : "skip"
  );

  const userTemplates = useQuery(
    api.workoutTemplates.getUserTemplates,
    isAuthenticated ? {} : "skip"
  );

  const userTemplateCount = useQuery(
    api.workoutTemplates.getUserTemplateCount,
    isAuthenticated ? {} : "skip"
  );

  // Mutations
  const createTemplateMutation = useMutation(api.workoutTemplates.createTemplate);
  const updateTemplateMutation = useMutation(api.workoutTemplates.updateTemplate);
  const deleteTemplateMutation = useMutation(api.workoutTemplates.deleteTemplate);
  const trackUsageMutation = useMutation(api.workoutTemplates.trackTemplateUsage);
  const seedTemplatesMutation = useMutation(api.workoutTemplates.seedPreBuiltTemplates);

  // Template limit logic
  const templateLimit = isPremium ? Infinity : 3;
  const canCreateTemplate = (userTemplateCount || 0) < templateLimit;

  // Helper functions
  const getTemplatesByCategory = (category: string) => {
    if (!allTemplates) return [];
    return allTemplates.filter(template => template.category === category);
  };

  const getPreBuiltTemplates = () => {
    if (!allTemplates) return [];
    return allTemplates.filter(template => template.isPreBuilt);
  };

  const getUserOwnTemplates = () => {
    return userTemplates || [];
  };

  const getPopularTemplates = () => {
    if (!allTemplates) return [];
    return [...allTemplates]
      .filter(template => template.isPreBuilt)
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, 6);
  };

  const getRecentlyUsedTemplates = () => {
    if (!allTemplates) return [];
    return [...allTemplates]
      .filter(template => template.lastUsed)
      .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))
      .slice(0, 5);
  };

  // Actions
  const createTemplate = async (data: CreateTemplateData) => {
    if (!canCreateTemplate) {
      throw new Error(`Free users can create up to ${templateLimit} templates. Upgrade to Premium for unlimited templates.`);
    }
    
    return await createTemplateMutation(data);
  };

  const updateTemplate = async (id: Id<"workoutTemplates">, updates: UpdateTemplateData) => {
    return await updateTemplateMutation({ id, ...updates });
  };

  const deleteTemplate = async (id: Id<"workoutTemplates">) => {
    return await deleteTemplateMutation({ id });
  };

  const trackTemplateUsage = async (templateId: Id<"workoutTemplates">) => {
    return await trackUsageMutation({ templateId });
  };

  const seedPreBuiltTemplates = async () => {
    return await seedTemplatesMutation({});
  };

  // Template categories and difficulty levels
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

  // Loading states
  const isLoading = allTemplates === undefined || userTemplates === undefined;

  return {
    // Data
    allTemplates: allTemplates || [],
    userTemplates: userTemplates || [],
    userTemplateCount: userTemplateCount || 0,
    
    // Helper functions
    getTemplatesByCategory,
    getPreBuiltTemplates,
    getUserOwnTemplates,
    getPopularTemplates,
    getRecentlyUsedTemplates,
    
    // Actions
    createTemplate,
    updateTemplate,
    deleteTemplate,
    trackTemplateUsage,
    seedPreBuiltTemplates,
    
    // Template metadata
    categories,
    difficulties,
    
    // Limits and permissions
    templateLimit,
    canCreateTemplate,
    isPremium,
    
    // Loading states
    isLoading,
  };
};

// Hook for fetching a specific template
export const useWorkoutTemplate = (templateId: Id<"workoutTemplates"> | null) => {
  const { isAuthenticated } = useAuth();
  
  const template = useQuery(
    api.workoutTemplates.getTemplate,
    templateId && isAuthenticated ? { id: templateId } : "skip"
  );

  return {
    template,
    isLoading: template === undefined && templateId !== null,
  };
};

// Hook for fetching templates by category
export const useTemplatesByCategory = (category: string) => {
  const { isAuthenticated } = useAuth();
  
  const templates = useQuery(
    api.workoutTemplates.getTemplatesByCategory,
    isAuthenticated && category ? { category } : "skip"
  );

  return {
    templates: templates || [],
    isLoading: templates === undefined,
  };
};

export default useWorkoutTemplates;