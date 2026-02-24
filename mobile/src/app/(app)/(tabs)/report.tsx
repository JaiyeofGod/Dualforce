import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/api";
import { useSession } from "@/lib/auth/use-session";
import type { WeeklyReport } from "@/lib/types";
import { Dumbbell, BookOpen, Moon, Flame, ChevronLeft, ChevronRight, TrendingUp, CheckCircle, XCircle } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function MetricCard({
  label,
  value,
  target,
  unit,
  color,
  icon,
  achieved,
}: {
  label: string;
  value: number;
  target: number | null;
  unit: string;
  color: string;
  icon: React.ReactNode;
  achieved: boolean;
}) {
  const pct = target !== null && target > 0 ? Math.min((value / target) * 100, 100) : 0;

  return (
    <View style={{ backgroundColor: "#0f172a", borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#1e293b" }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: `${color}22`, alignItems: "center", justifyContent: "center", marginRight: 10 }}>
            {icon}
          </View>
          <Text style={{ color: "white", fontWeight: "700", fontSize: 15 }}>{label}</Text>
        </View>
        {achieved ? <CheckCircle size={18} color="#4ade80" /> : <XCircle size={18} color="#334155" />}
      </View>

      <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 8 }}>
        <Text style={{ color, fontSize: 32, fontWeight: "800" }}>{value}</Text>
        {target !== null && (
          <Text style={{ color: "#475569", fontSize: 13, marginBottom: 4 }}>
            Goal: {target} {unit}
          </Text>
        )}
      </View>

      {target !== null && (
        <View style={{ height: 6, backgroundColor: "#1e293b", borderRadius: 9999, overflow: "hidden" }}>
          <View style={{ width: `${pct}%`, height: "100%", backgroundColor: color, borderRadius: 9999 }} />
        </View>
      )}
    </View>
  );
}

export default function ReportScreen() {
  const [weekOffset, setWeekOffset] = useState(0);
  const { data: session } = useSession();

  const { data: report, isLoading } = useQuery({
    queryKey: ["report", weekOffset],
    queryFn: () => api.get<WeeklyReport>(`/api/report/weekly?weekOffset=${weekOffset}`),
    enabled: !!session?.user,
  });

  const weekLabel = () => {
    if (weekOffset === 0) return "This week";
    if (weekOffset === 1) return "Last week";
    return `${weekOffset} weeks ago`;
  };

  const formatDateRange = () => {
    if (!report) return "";
    const start = new Date(report.weekStart);
    const end = new Date(report.weekEnd);
    end.setDate(end.getDate() - 1);
    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${fmt(start)} – ${fmt(end)}`;
  };

  const summary = report?.summary;
  const goal = report?.goal;
  const isEmpty = summary && summary.workoutsCompleted === 0 && summary.studyHours === 0 && summary.avgSleepHours === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
          <Text style={{ color: "white", fontSize: 24, fontWeight: "800", marginBottom: 2 }}>Weekly Report</Text>
          <Text style={{ color: "#475569", fontSize: 14 }}>Track your progress over time</Text>
        </View>

        {/* Week selector */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => setWeekOffset((w) => w + 1)}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#1e293b" }}
          >
            <ChevronLeft size={18} color="#94a3b8" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ color: "white", fontWeight: "700", fontSize: 14 }}>{weekLabel()}</Text>
            <Text style={{ color: "#475569", fontSize: 12, marginTop: 1 }}>{formatDateRange()}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setWeekOffset((w) => Math.max(0, w - 1))}
            disabled={weekOffset === 0}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#1e293b", opacity: weekOffset === 0 ? 0.3 : 1 }}
          >
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={{ paddingVertical: 80, alignItems: "center" }}>
            <ActivityIndicator color="#6366f1" />
          </View>
        ) : (
          <View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
            {summary !== undefined && !isEmpty && (
              <View style={{ backgroundColor: "#1e1b4b", borderRadius: 16, padding: 16, marginBottom: 16, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#3730a3" }}>
                <TrendingUp size={20} color="#818cf8" />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ color: "#c7d2fe", fontWeight: "700", fontSize: 13 }}>Weekly Summary</Text>
                  <Text style={{ color: "#6366f1", fontSize: 12, marginTop: 2 }}>
                    {summary.workoutsCompleted} workouts · {summary.studyHours}h study · avg {summary.avgSleepHours}h sleep
                  </Text>
                </View>
              </View>
            )}

            <MetricCard
              label="Workouts"
              value={summary?.workoutsCompleted ?? 0}
              target={goal?.weeklyWorkouts ?? null}
              unit="sessions"
              color="#22d3ee"
              icon={<Dumbbell size={16} color="#22d3ee" />}
              achieved={(summary?.workoutsCompleted ?? 0) >= (goal?.weeklyWorkouts ?? Infinity)}
            />
            <MetricCard
              label="Study Hours"
              value={summary?.studyHours ?? 0}
              target={goal?.weeklyStudyHours ?? null}
              unit="hrs"
              color="#4ade80"
              icon={<BookOpen size={16} color="#4ade80" />}
              achieved={(summary?.studyHours ?? 0) >= (goal?.weeklyStudyHours ?? Infinity)}
            />
            <MetricCard
              label="Avg Sleep"
              value={summary?.avgSleepHours ?? 0}
              target={goal?.dailySleepHours ?? null}
              unit="hrs/night"
              color="#a78bfa"
              icon={<Moon size={16} color="#a78bfa" />}
              achieved={(summary?.avgSleepHours ?? 0) >= (goal?.dailySleepHours ?? Infinity)}
            />
            <MetricCard
              label="Avg Daily Calories"
              value={summary?.avgDailyCalories ?? 0}
              target={goal?.dailyCalorieTarget ?? null}
              unit="kcal"
              color="#f97316"
              icon={<Flame size={16} color="#f97316" />}
              achieved={Math.abs((summary?.avgDailyCalories ?? 0) - (goal?.dailyCalorieTarget ?? 0)) < 200}
            />

            {isEmpty ? (
              <View style={{ backgroundColor: "#0f172a", borderRadius: 20, padding: 24, alignItems: "center", marginTop: 4, borderWidth: 1, borderColor: "#1e293b" }}>
                <Text style={{ color: "#475569", fontSize: 14, textAlign: "center" }}>
                  No entries logged this week yet.{"\n"}Start tracking from the dashboard!
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
