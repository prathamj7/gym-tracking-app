import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Trophy, Sparkles } from "lucide-react";

function formatDate(ts: number) {
  if (!ts) return "-";
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PRList() {
  const prs = useQuery(api.exercises.getPRs);

  if (!prs) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Personal Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-4 bg-muted rounded w-1/3 mb-3" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Personal Records
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {prs.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground text-center">
              No PRs yet. Log workouts to start setting records! 🏆
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground border-b">
                      <th className="text-left px-4 py-3 font-medium">Exercise</th>
                      <th className="text-left px-4 py-3 font-medium">PR</th>
                      <th className="text-left px-4 py-3 font-medium">Achieved On</th>
                      <th className="text-left px-4 py-3 font-medium">Badge</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prs.map((row, idx) => {
                      const isRecent = row.performedAt >= recentCutoff;
                      const prLabel =
                        row.type === "weight"
                          ? `${row.value} ${row.unit}${row.reps ? ` × ${row.reps}` : ""}`
                          : `${row.value} ${row.unit}`;
                      return (
                        <tr key={`${row.name}-${idx}`} className="border-t hover:bg-muted/20">
                          <td className="px-4 py-3 font-medium">{row.name}</td>
                          <td className="px-4 py-3">{prLabel}</td>
                          <td className="px-4 py-3">{formatDate(row.performedAt)}</td>
                          <td className="px-4 py-3">
                            {isRecent ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-1 text-xs text-primary">
                                <Sparkles className="h-3 w-3" />
                                New
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="block sm:hidden space-y-3 p-4">
                {prs.map((row, idx) => {
                  const isRecent = row.performedAt >= recentCutoff;
                  const prLabel =
                    row.type === "weight"
                      ? `${row.value} ${row.unit}${row.reps ? ` × ${row.reps}` : ""}`
                      : `${row.value} ${row.unit}`;
                  return (
                    <motion.div
                      key={`${row.name}-${idx}`}
                      className="bg-muted/20 rounded-lg p-4 border border-border/50"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-base">{row.name}</h4>
                        {isRecent && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-1 text-xs text-primary">
                            <Sparkles className="h-3 w-3" />
                            New PR
                          </span>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-primary mb-1">{prLabel}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(row.performedAt)}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
