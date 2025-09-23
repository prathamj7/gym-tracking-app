import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Activity, Calendar, Dumbbell, TrendingUp, Flame, Target, Weight, Clock } from "lucide-react";
import { useQuery } from "convex/react";

export function StatsCards() {
  const stats = useQuery(api.exercises.getStats);
  const exercises = useQuery(api.exercises.getAll);

  // Enhanced loading state with better skeleton
  if (stats === undefined || exercises === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Enhanced calculations with null safety and better metrics
  const totalExercises = exercises?.length || 0;
  const totalWorkouts = stats?.totalWorkouts || 0;
  const recentWorkouts = stats?.recentWorkouts || 0;
  const categoriesCount = stats?.categoriesCount || 0;
  const currentStreak = stats?.currentStreak || 0;
  const longestStreak = stats?.longestStreak || 0;

  // Calculate total volume and average weight
  const totalWeight = exercises
    ?.filter(ex => ex.weight && ex.sets && ex.reps)
    ?.reduce((sum, ex) => sum + (ex.weight! * ex.sets * ex.reps), 0) || 0;

  const avgWeight = totalExercises > 0 ? Math.round(totalWeight / totalExercises) : 0;

  // Calculate weekly trend
  const lastWeekExercises = exercises?.filter(ex => 
    ex.performedAt && new Date(ex.performedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  )?.length || 0;

  const previousWeekExercises = exercises?.filter(ex => 
    ex.performedAt && 
    new Date(ex.performedAt) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) &&
    new Date(ex.performedAt) <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  )?.length || 0;

  const weeklyTrend = previousWeekExercises > 0 
    ? Math.round(((lastWeekExercises - previousWeekExercises) / previousWeekExercises) * 100)
    : lastWeekExercises > 0 ? 100 : 0;

  const statsData = [
    {
      title: "Total Workouts",
      value: totalWorkouts.toString(),
      icon: Dumbbell,
      color: "text-blue-600",
      description: `${totalExercises} exercises logged`,
    },
    {
      title: "This Week",
      value: recentWorkouts.toString(),
      icon: Calendar,
      color: "text-green-600",
      description: weeklyTrend !== 0 ? `${weeklyTrend > 0 ? '+' : ''}${weeklyTrend}% vs last week` : "No change from last week",
    },
    {
      title: "Categories",
      value: categoriesCount.toString(),
      icon: Activity,
      color: "text-purple-600",
      description: "Different exercise types",
    },
    {
      title: "Avg Volume",
      value: avgWeight > 0 ? `${avgWeight}kg` : "0kg",
      icon: Weight,
      color: "text-orange-600",
      description: "Per exercise session",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* Enhanced Streaks Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: statsData.length * 0.1 }}
        className="md:col-span-2 lg:col-span-2"
      >
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Workout Streaks
            </CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔥</span>
                <span className="font-medium">Current Streak:</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-orange-600">{currentStreak}</span>
                <span className="text-sm text-muted-foreground ml-1">days</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏅</span>
                <span className="font-medium">Best Streak:</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-amber-600">{longestStreak}</span>
                <span className="text-sm text-muted-foreground ml-1">days</span>
              </div>
            </div>
            {currentStreak > 0 && (
              <div className="mt-3 p-2 bg-orange-50 rounded-lg border border-orange-100">
                <p className="text-sm text-orange-700 text-center">
                  {currentStreak === 1 
                    ? "Great start! Keep it going! 💪" 
                    : currentStreak < 7 
                    ? "You're building momentum! 🚀"
                    : currentStreak < 30
                    ? "Amazing consistency! 🌟"
                    : "You're a fitness legend! 👑"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}