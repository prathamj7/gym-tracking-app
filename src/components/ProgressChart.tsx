import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";

type DayAgg = {
  dateKey: string; // YYYY-MM-DD
  label: string;   // e.g., Sep 10
  total: number;   // total volume or minutes that day
  breakdown: Array<{ weight?: number; reps?: number; duration?: number; volume: number }>;
};

const formatDayKey = (ts: number) => {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const shortLabel = (ts: number) =>
  new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const computeVolume = (e: any) => {
  const weight = typeof e.weight === "number" ? e.weight : 0;
  const reps = typeof e.reps === "number" ? e.reps : 0;
  return weight * reps;
};

const computeMinutes = (e: any) => {
  const duration = typeof e.duration === "number" ? e.duration : 0;
  return duration;
};

export function ProgressChart({ onClose }: { onClose: () => void }) {
  const names = useQuery(api.exercises.listNames);
  const [selected, setSelected] = useState<string>("");
  const rows = useQuery(
    api.exercises.listByExerciseName,
    selected ? ({ name: selected } as any) : undefined
  );

  // Add: determine if this exercise should be graphed by minutes
  const isDuration = useMemo(() => {
    return (rows ?? []).some((r: any) => typeof r.duration === "number");
  }, [rows]);

  const data: Array<DayAgg> = useMemo(() => {
    if (!rows || rows.length === 0) return [];
    const byDay = new Map<string, DayAgg>();
    for (const r of rows) {
      const key = formatDayKey(r.performedAt);
      const label = shortLabel(r.performedAt);
      const metric = isDuration ? computeMinutes(r) : computeVolume(r);
      const agg = byDay.get(key) ?? { dateKey: key, label, total: 0, breakdown: [] };
      agg.total += metric;
      agg.breakdown.push(
        isDuration
          ? { duration: r.duration, volume: metric }
          : { weight: r.weight, reps: r.reps, volume: metric }
      );
      byDay.set(key, agg);
    }
    const arr = Array.from(byDay.values()).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    return arr;
  }, [rows, isDuration]);

  // Simple responsive SVG line chart with hover tooltip
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const chartW = 700;
  const chartH = 280;
  const padding = { top: 20, right: 24, bottom: 40, left: 44 };

  const xCount = data.length;
  const yMax = data.length ? Math.max(...data.map((d) => d.total)) : 0;
  const yNiceMax = yMax === 0 ? 10 : Math.ceil(yMax / 10) * 10;

  const getX = (i: number) => {
    if (xCount <= 1) return padding.left + (chartW - padding.left - padding.right) / 2;
    const step = (chartW - padding.left - padding.right) / (xCount - 1);
    return padding.left + step * i;
    };
  const getY = (v: number) => {
    const usable = chartH - padding.top - padding.bottom;
    const ratio = yNiceMax === 0 ? 0 : v / yNiceMax;
    return padding.top + (1 - ratio) * usable;
  };

  const points = data.map((d, i) => `${getX(i)},${getY(d.total)}`).join(" ");

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || data.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    // map x back to index
    if (xCount <= 1) {
      setHoverIndex(0);
      setTooltipPos({ x: getX(0), y: getY(data[0].total) });
      return;
    }
    const step = (chartW - padding.left - padding.right) / (xCount - 1);
    const clamped = Math.max(padding.left, Math.min(x, chartW - padding.right));
    const idx = Math.round((clamped - padding.left) / step);
    setHoverIndex(idx);
    setTooltipPos({ x: getX(idx), y: getY(data[idx].total) });
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setTooltipPos(null);
  };

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h3 className="text-lg font-semibold">Progress Chart</h3>
        <button
          onClick={onClose}
          className="text-sm px-3 py-1.5 rounded-md border hover:bg-accent"
        >
          Close
        </button>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Select Exercise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <Label>Exercise</Label>
                <Select value={selected} onValueChange={setSelected}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose exercise" />
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
              {selected && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Showing {isDuration ? "minutes" : "volume"} over time for <span className="font-medium">{selected}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{isDuration ? "Minutes Over Time" : "Volume Over Time"}</CardTitle>
            </CardHeader>
            <CardContent>
              {!selected ? (
                <div className="text-sm text-muted-foreground">
                  Select an exercise to see your progress.
                </div>
              ) : data.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No entries available for this exercise yet.
                </div>
              ) : (
                <div className="relative w-full">
                  <div className="w-full overflow-x-auto">
                    <svg
                      ref={svgRef}
                      viewBox={`0 0 ${chartW} ${chartH}`}
                      className="w-full h-[280px]"
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* Axes */}
                      <line
                        x1={padding.left}
                        y1={chartH - padding.bottom}
                        x2={chartW - padding.right}
                        y2={chartH - padding.bottom}
                        stroke="currentColor"
                        className="text-muted-foreground"
                        strokeWidth={0.5}
                      />
                      <line
                        x1={padding.left}
                        y1={padding.top}
                        x2={padding.left}
                        y2={chartH - padding.bottom}
                        stroke="currentColor"
                        className="text-muted-foreground"
                        strokeWidth={0.5}
                      />

                      {/* Y ticks */}
                      {Array.from({ length: 5 }).map((_, i) => {
                        const v = (yNiceMax / 4) * i;
                        const y = getY(v);
                        return (
                          <g key={i}>
                            <line
                              x1={padding.left}
                              y1={y}
                              x2={chartW - padding.right}
                              y2={y}
                              stroke="currentColor"
                              className="text-muted-foreground/40"
                              strokeWidth={0.5}
                              strokeDasharray="3,3"
                            />
                            <text
                              x={padding.left - 6}
                              y={y + 4}
                              textAnchor="end"
                              className="fill-muted-foreground"
                              fontSize="10"
                            >
                              {Math.round(v)}
                            </text>
                          </g>
                        );
                      })}

                      {/* X labels */}
                      {data.map((d, i) => {
                        const x = getX(i);
                        const y = chartH - padding.bottom + 14;
                        // show every nth label if many points
                        const show = data.length <= 10 || i % Math.ceil(data.length / 10) === 0;
                        return (
                          <text
                            key={d.dateKey}
                            x={x}
                            y={y}
                            textAnchor="middle"
                            className={`fill-muted-foreground ${show ? "" : "hidden"}`}
                            fontSize="10"
                          >
                            {d.label}
                          </text>
                        );
                      })}

                      {/* Line path */}
                      <polyline
                        fill="none"
                        stroke="currentColor"
                        className="text-primary"
                        strokeWidth={2}
                        points={points}
                      />

                      {/* Points */}
                      {data.map((d, i) => (
                        <circle
                          key={d.dateKey}
                          cx={getX(i)}
                          cy={getY(d.total)}
                          r={hoverIndex === i ? 4 : 3}
                          fill="currentColor"
                          className={hoverIndex === i ? "text-primary" : "text-primary/80"}
                        />
                      ))}
                    </svg>
                  </div>

                  {/* Tooltip */}
                  {hoverIndex !== null && tooltipPos && data[hoverIndex] && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute pointer-events-none"
                      style={{
                        left: Math.min(
                          tooltipPos.x + 12,
                          (svgRef.current?.getBoundingClientRect().width ?? chartW) - 200
                        ),
                        top: Math.max(tooltipPos.y - 10, 0),
                      }}
                    >
                      <div className="rounded-md border bg-popover text-popover-foreground shadow-md p-3 w-56">
                        <div className="text-xs text-muted-foreground">Date</div>
                        <div className="text-sm font-semibold">{data[hoverIndex].label}</div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {isDuration ? "Total Minutes" : "Total Volume"}
                        </div>
                        <div className="text-sm font-semibold">
                          {Math.round(data[hoverIndex].total)}
                        </div>
                        {data[hoverIndex].breakdown.length > 0 && (
                          <>
                            <div className="mt-2 text-xs text-muted-foreground">Breakdown</div>
                            <ul className="text-xs max-h-24 overflow-y-auto pr-1">
                              {data[hoverIndex].breakdown.map((b, i) => (
                                <li key={i} className="flex justify-between">
                                  {isDuration ? (
                                    <>
                                      <span>{typeof b.duration === "number" ? `${b.duration} min` : "-"}</span>
                                      <span className="font-medium">{Math.round(b.volume)}</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>
                                        {(typeof b.weight === "number" ? `${b.weight}kg` : "-")} ×{" "}
                                        {(typeof b.reps === "number" ? b.reps : "-")}
                                      </span>
                                      <span className="font-medium">{Math.round(b.volume)}</span>
                                    </>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}