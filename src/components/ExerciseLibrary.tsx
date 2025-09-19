import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Dumbbell, Filter, Info } from "lucide-react";

type ExerciseLibraryItem = {
  _id: string;
  name: string;
  category: string;
  primaryMuscle: string;
  difficulty: string;
  equipment: string;
  description: string;
  tips?: string;
  commonMistakes?: string;
  mediaUrl?: string;
  popularity?: number;
};

interface ExerciseLibraryProps {
  onClose: () => void;
  onSelectExercise: (data: { name: string; category: string }) => void;
}

const CATEGORIES = ["Strength", "Cardio", "Core", "Mobility", "Flexibility", "Other"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
const EQUIPMENT = ["None", "Bodyweight", "Dumbbell", "Barbell", "Kettlebell", "Machine", "Bands"];

export function ExerciseLibrary({ onClose, onSelectExercise }: ExerciseLibraryProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [equipment, setEquipment] = useState<string>("");
  const [selected, setSelected] = useState<ExerciseLibraryItem | null>(null);

  const args = useMemo(
    () =>
      ({
        search: search.trim() || undefined,
        category: category || undefined,
        difficulty: difficulty || undefined,
        equipment: equipment || undefined,
        limit: 120,
      } as any),
    [search, category, difficulty, equipment],
  );
  const list = useQuery(api.exerciseLibrary.list, args);

  const items: ExerciseLibraryItem[] = (list ?? []) as any;

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Exercise Library</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="p-5 space-y-5">
        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-1 md:col-span-2">
            <Label>Search by name</Label>
            <Input
              placeholder="e.g., Bench Press"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v === "__all__" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v === "__all__" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All</SelectItem>
                {DIFFICULTIES.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Equipment</Label>
            <Select value={equipment} onValueChange={(v) => setEquipment(v === "__all__" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All</SelectItem>
                {EQUIPMENT.map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 flex items-end">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSearch("");
                setCategory("");
                setDifficulty("");
                setEquipment("");
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(items ?? []).map((ex) => (
            <motion.div key={ex._id} whileHover={{ y: -3 }}>
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{ex.name}</CardTitle>
                    <span className="text-xs rounded-md bg-primary/15 text-primary px-2 py-1">
                      {ex.category}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {ex.primaryMuscle} • {ex.difficulty} • {ex.equipment}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ex.mediaUrl ? (
                    <img
                      src={ex.mediaUrl}
                      alt={ex.name}
                      className="w-full h-36 object-cover rounded-md"
                    />
                  ) : null}
                  <p className="text-sm text-muted-foreground line-clamp-3">{ex.description}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onSelectExercise({ name: ex.name, category: ex.category })}
                    >
                      Log this exercise
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelected(ex)}
                    >
                      <Info className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {items && items.length === 0 && (
          <div className="text-sm text-muted-foreground">No exercises found. Try adjusting filters.</div>
        )}
      </div>

      {/* Details modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selected.name}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
                    Close
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  {selected.category} • {selected.primaryMuscle} • {selected.difficulty} • {selected.equipment}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {selected.mediaUrl ? (
                  <img
                    src={selected.mediaUrl}
                    alt={selected.name}
                    className="w-full h-56 object-cover rounded-md"
                  />
                ) : null}
                <div>
                  <div className="text-sm font-medium mb-1">Description</div>
                  <p className="text-sm text-muted-foreground">{selected.description}</p>
                </div>
                {selected.tips && (
                  <div>
                    <div className="text-sm font-medium mb-1">Tips</div>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{selected.tips}</p>
                  </div>
                )}
                {selected.commonMistakes && (
                  <div>
                    <div className="text-sm font-medium mb-1">Common Mistakes</div>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{selected.commonMistakes}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => {
                      onSelectExercise({ name: selected.name, category: selected.category });
                      setSelected(null);
                    }}
                  >
                    Log this exercise
                  </Button>
                  <Button variant="outline" onClick={() => setSelected(null)}>
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}