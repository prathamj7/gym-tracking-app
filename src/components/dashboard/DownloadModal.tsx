import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { Download, Calendar, Dumbbell, FileText, X } from "lucide-react";

export function DownloadModal({ onClose }: { onClose: () => void }) {
  const names = useQuery(api.exercises.listNames);
  const allExercises = useQuery(api.exercises.getAll);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);

  const rowsByDate = useQuery(
    api.exercises.listByDate,
    selectedDate ? ({ date: new Date(selectedDate).getTime() } as any) : undefined
  );
  const rowsByExercise = useQuery(
    api.exercises.listByExerciseName,
    selectedExercise ? ({ name: selectedExercise } as any) : undefined
  );

  const downloadCsv = async (rows: any[], filename: string, type: string) => {
    try {
      setIsDownloading(true);
      
      // Enhanced validation
      if (!rows || rows.length === 0) {
        toast.error(`No ${type} entries found to download.`);
        return;
      }

      // Enhanced header with more details
      const header = [
        "Exercise Name", 
        "Category", 
        "Sets", 
        "Reps", 
        "Weight (kg)", 
        "Duration (min)", 
        "Total Volume (kg)", 
        "Notes", 
        "Date", 
        "Time"
      ];

      // Enhanced data formatting
      const csvRows = rows.map((e) => {
        const performed = new Date(e.performedAt);
        const totalVolume = (e.weight && e.sets && e.reps) ? e.weight * e.sets * e.reps : 0;
        
        return [
          e.name || "Unknown",
          e.category || "Uncategorized",
          e.sets || "",
          e.reps || "",
          e.weight || "",
          e.duration || "",
          totalVolume || "",
          (e.notes || "").toString().replace(/\n/g, " ").replace(/,/g, ";"),
          performed.toLocaleDateString(),
          performed.toLocaleTimeString(),
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",");
      });

      // Add metadata header
      const metadata = [
        `# FitTracker Export - ${type}`,
        `# Generated: ${new Date().toLocaleString()}`,
        `# Total Records: ${rows.length}`,
        `# Date Range: ${rows.length > 0 ? `${new Date(Math.min(...rows.map(r => r.performedAt))).toLocaleDateString()} - ${new Date(Math.max(...rows.map(r => r.performedAt))).toLocaleDateString()}` : 'N/A'}`,
        "",
      ].join("\n");

      const csv = metadata + [header.join(","), ...csvRows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Successfully downloaded ${rows.length} entries!`);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download data. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadAllData = async () => {
    if (!allExercises || allExercises.length === 0) {
      toast.error("No exercise data available to download.");
      return;
    }

    try {
      setIsDownloading(true);
      
      const formattedData = {
        exportInfo: {
          exportDate: new Date().toISOString(),
          totalExercises: allExercises.length,
          dateRange: {
            from: new Date(Math.min(...allExercises.map(e => e.performedAt))).toISOString(),
            to: new Date(Math.max(...allExercises.map(e => e.performedAt))).toISOString(),
          }
        },
        exercises: allExercises.map(ex => ({
          ...ex,
          performedAt: new Date(ex.performedAt).toISOString(),
          totalVolume: (ex.weight && ex.sets && ex.reps) ? ex.weight * ex.sets * ex.reps : null,
        }))
      };

      const dataStr = JSON.stringify(formattedData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `fittracker-complete-data-${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Complete data exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export data. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadByDate = () => {
    if (!selectedDate) {
      toast.error("Please select a date first.");
      return;
    }
    const dateStr = selectedDate.replace(/-/g, "_");
    downloadCsv(rowsByDate || [], `fittracker_${dateStr}.csv`, "date-specific");
  };

  const handleDownloadByExercise = () => {
    if (!selectedExercise) {
      toast.error("Please select an exercise first.");
      return;
    }
    const safeName = selectedExercise.replace(/[^a-zA-Z0-9]/g, "_");
    downloadCsv(rowsByExercise || [], `fittracker_${safeName}.csv`, "exercise-specific");
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Your Data
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Complete Export */}
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Complete Data Export
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Download all your exercise data in JSON format with metadata
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  className="w-full" 
                  onClick={downloadAllData}
                  disabled={isDownloading || !allExercises?.length}
                >
                  {isDownloading ? "Exporting..." : "Export All Data (JSON)"}
                </Button>
                {allExercises && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {allExercises.length} total exercises available
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Download by Date */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Export by Date
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Download all exercises from a specific date as CSV
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Select Date</Label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      className="w-full" 
                      onClick={handleDownloadByDate}
                      disabled={isDownloading || !selectedDate}
                      variant="outline"
                    >
                      {isDownloading ? "Downloading..." : "Download CSV"}
                    </Button>
                  </div>
                </div>
                {rowsByDate && selectedDate && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {rowsByDate.length} exercises found for {new Date(selectedDate).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Download by Exercise */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Dumbbell className="h-4 w-4" />
                  Export by Exercise
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Download all records for a specific exercise as CSV
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Select Exercise</Label>
                    <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose exercise..." />
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
                    <Button 
                      className="w-full" 
                      onClick={handleDownloadByExercise}
                      disabled={isDownloading || !selectedExercise}
                      variant="outline"
                    >
                      {isDownloading ? "Downloading..." : "Download CSV"}
                    </Button>
                  </div>
                </div>
                {rowsByExercise && selectedExercise && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {rowsByExercise.length} records found for "{selectedExercise}"
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>• CSV files can be opened in Excel, Google Sheets, or any spreadsheet app</p>
              <p>• JSON files contain complete data with metadata for advanced analysis</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}