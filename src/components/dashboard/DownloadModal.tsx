import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

export function DownloadModal({ onClose }: { onClose: () => void }) {
  const names = useQuery(api.exercises.listNames);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedExercise, setSelectedExercise] = useState<string>("");

  const rowsByDate = useQuery(
    api.exercises.listByDate,
    selectedDate ? ({ date: new Date(selectedDate).getTime() } as any) : undefined
  );
  const rowsByExercise = useQuery(
    api.exercises.listByExerciseName,
    selectedExercise ? ({ name: selectedExercise } as any) : undefined
  );

  const downloadCsv = (rows: any[], filename: string) => {
    if (!rows || rows.length === 0) {
      toast("No entries found to download.");
      return;
    }
    const header = ["Name", "Category", "Sets", "Reps", "Weight(kg)", "Duration(min)", "Notes", "Performed At"];
    const csvRows = rows.map((e) => {
      const performed = new Date(e.performedAt).toLocaleString();
      return [
        e.name,
        e.category,
        e.sets,
        e.reps,
        e.weight ?? "",
        e.duration ?? "",
        (e.notes ?? "").toString().replace(/\n/g, " ").replace(/,/g, ";"),
        performed,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
    });
    const csv = [header.join(","), ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast("Download started.");
  };

  const handleDownloadByDate = () => {
    if (!selectedDate) {
      toast("Please select a date first.");
      return;
    }
    const dateStr = selectedDate;
    downloadCsv(rowsByDate || [], `fittracker_by_date_${dateStr}.csv`);
  };

  const handleDownloadByExercise = () => {
    if (!selectedExercise) {
      toast("Please select an exercise first.");
      return;
    }
    const safeName = selectedExercise.replace(/\s+/g, "_");
    downloadCsv(rowsByExercise || [], `fittracker_by_exercise_${safeName}.csv`);
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
        className="w-full max-w-2xl"
      >
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h3 className="text-lg font-semibold">Download Progress</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
          <div className="p-5 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Download by Date</div>
                  <div className="text-sm text-muted-foreground">
                    Select a date to download all exercises logged on that day.
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button className="w-full" onClick={handleDownloadByDate}>
                    Download CSV
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t my-2" />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Download by Exercise</div>
                  <div className="text-sm text-muted-foreground">
                    Choose an exercise to download all your logged entries for it.
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Exercise</Label>
                  <Select value={selectedExercise} onValueChange={setSelectedExercise}>
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
                <div className="flex items-end">
                  <Button className="w-full" onClick={handleDownloadByExercise}>
                    Download CSV
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}