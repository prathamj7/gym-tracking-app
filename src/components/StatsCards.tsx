import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Activity, Calendar, Dumbbell, TrendingUp } from "lucide-react";
import { useQuery } from "convex/react";

export function StatsCards() {
  const stats = useQuery(api.exercises.getStats);

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Total Workouts",
      value: stats.totalWorkouts,
      icon: Dumbbell,
      color: "text-primary",
    },
    {
      title: "This Week",
      value: stats.recentWorkouts,
      icon: Calendar,
      color: "text-primary",
    },
    {
      title: "Categories",
      value: stats.categoriesCount,
      icon: Activity,
      color: "text-primary",
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
            </CardContent>
          </Card>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: statsData.length * 0.1 }}
      >
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Streaks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-base">
              <span className="mr-2">🔥</span>
              <span className="font-medium">Current Streak:</span>{" "}
              <span className="font-bold">{stats.currentStreak}</span> days
            </div>
            <div className="text-base">
              <span className="mr-2">🏅</span>
              <span className="font-medium">Longest Streak:</span>{" "}
              <span className="font-bold">{stats.longestStreak}</span> days
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}