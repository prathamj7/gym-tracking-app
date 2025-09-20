import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { useMemo, useState } from "react";

export function ExerciseCompare() {
  const names = useQuery(api.exercises.listNames);
  const [name, setName] = useState<string>("");
  const [date1, setDate1] = useState<string>("");
  const [date2, setDate2] = useState<string>("");

  const ready = name && date1 && date2;
  const compareArgs = useMemo(() => {
    if (!ready) return undefined;
    return {
      name,
      date1: new Date(date1).getTime(),
      date2: new Date(date2).getTime(),
    };
  }, [name, date1, date2, ready]);

  const result = useQuery(api.exercises.compareByNameAndDates, compareArgs as any);

  const statBlock = (title: string, value: string | number) => (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{title}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );

  // Fix: use reps for volume consistently (weight x reps) and handle undefined safely
  const volume = (e: any | null) => (e ? (e.weight || 0) * (e.reps || 0) : 0);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg text-primary">Compare Exercise by Date</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label>Exercise</Label>
            <Select value={name} onValueChange={setName}>
              <SelectTrigger>
                <SelectValue placeholder="Select exercise" />
              </SelectTrigger>
              <SelectContent>
                {(names ?? []).map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Date A</Label>
            <Input type="date" value={date1} onChange={(e) => setDate1(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Date B</Label>
            <Input type="date" value={date2} onChange={(e) => setDate2(e.target.value)} />
          </div>
        </div>

        {ready && result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2"
          >
            <Card className="border">
              <CardContent className="p-4 space-y-2">
                <div className="text-sm text-muted-foreground">Date A</div>
                {result.first ? (
                  <div className="grid grid-cols-2 gap-3">
                    {statBlock("Sets", result.first.sets ?? 0)}
                    {statBlock("Reps", result.first.reps ?? 0)}
                    {statBlock("Weight (kg)", result.first.weight ?? 0)}
                    {statBlock("Volume", volume(result.first))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No entry found</div>
                )}
              </CardContent>
            </Card>

            <Card className="border">
              <CardContent className="p-4 space-y-2">
                <div className="text-sm text-muted-foreground">Difference</div>
                <div className="grid grid-cols-2 gap-3">
                  {statBlock(
                    "Sets",
                    (result.second?.sets ?? 0) - (result.first?.sets ?? 0)
                  )}
                  {statBlock(
                    "Reps",
                    (result.second?.reps ?? 0) - (result.first?.reps ?? 0)
                  )}
                  {statBlock(
                    "Weight (kg)",
                    (result.second?.weight ?? 0) - (result.first?.weight ?? 0)
                  )}
                  {statBlock(
                    "Volume",
                    volume(result.second) - volume(result.first)
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border">
              <CardContent className="p-4 space-y-2">
                <div className="text-sm text-muted-foreground">Date B</div>
                {result.second ? (
                  <div className="grid grid-cols-2 gap-3">
                    {statBlock("Sets", result.second.sets ?? 0)}
                    {statBlock("Reps", result.second.reps ?? 0)}
                    {statBlock("Weight (kg)", result.second.weight ?? 0)}
                    {statBlock("Volume", volume(result.second))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No entry found</div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}