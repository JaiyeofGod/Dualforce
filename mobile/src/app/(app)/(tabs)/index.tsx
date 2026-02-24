import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/api";
import { useSession } from "@/lib/auth/use-session";
import type { DashboardData } from "@/lib/types";
import { Dumbbell, BookOpen, Moon, Flame, Plus, ChevronRight, Zap } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function StatCard({
  icon,
  label,
  value,
  target,
  unit,
  color,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null;
  target: number;
  unit: string;
  color: string;
  onPress: () => void;
}) {
  const displayVal = value ?? 0;
  const pct = Math.min((displayVal / Math.max(target, 1)) * 100, 100);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: "#0f172a",
        borderRadius: 20,
        padding: 16,
        marginRight: 12,
        minWidth: 148,
        borderWidth: 1,
        borderColor: "#1e293b",
      }}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: `${color}22`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </View>
        <Plus size={16} color="#334155" />
      </View>
      <Text style={{ color: "#94a3b8", fontSize: 11, fontWeight: "600", marginBottom: 4 }}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        <Text style={{ color, fontSize: 26, fontWeight: "800" }}>
          {value === null ? "—" : displayVal}
        </Text>
        <Text style={{ color: "#334155", fontSize: 11, marginBottom: 3, marginLeft: 4 }}>
          /{target} {unit}
        </Text>
      </View>
      <View style={{ height: 4, backgroundColor: "#1e293b", borderRadius: 9999, marginTop: 12, overflow: "hidden" }}>
        <View
          style={{
            width: `${pct}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: 9999,
          }}
        />
      </View>
    </TouchableOpacity>
  );
}

const QUICK_ACTIONS = [
  { label: "Log workout", color: "#22d3ee", route: "/log-workout" as const },
  { label: "Log study session", color: "#4ade80", route: "/log-study" as const },
  { label: "Log sleep", color: "#a78bfa", route: "/log-sleep" as const },
  { label: "Log calories", color: "#f97316", route: "/log-calories" as const },
];

const QUICK_ICONS: Record<string, React.ReactNode> = {
  "Log workout": <Dumbbell size={18} color="#22d3ee" />,
  "Log study session": <BookOpen size={18} color="#4ade80" />,
  "Log sleep": <Moon size={18} color="#a78bfa" />,
  "Log calories": <Flame size={18} color="#f97316" />,
};

export default function DashboardScreen() {
  const { data: session } = useSession();

  const { data: dashboard, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get<DashboardData>("/api/dashboard"),
    enabled: !!session?.user,
    refetchOnMount: true,
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#6366f1" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const goal = dashboard?.goal;
  const todayCalories = dashboard?.today?.calories ?? 0;
  const todaySleep = dashboard?.today?.sleepHours ?? null;
  const weekWorkouts = dashboard?.week?.workouts ?? 0;
  const weekStudyHours = dashboard?.week?.studyHours ?? 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366f1" />
        }
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#4f46e5", alignItems: "center", justifyContent: "center", marginRight: 8 }}>
              <Zap size={14} color="white" />
            </View>
            <Text style={{ color: "#818cf8", fontSize: 13, fontWeight: "600" }}>DualForce</Text>
          </View>
          <Text style={{ color: "white", fontSize: 24, fontWeight: "800" }}>
            {greeting()}, {session?.user?.name?.split(" ")[0] ?? "there"}
          </Text>
          <Text style={{ color: "#475569", fontSize: 13, marginTop: 2 }}>{today}</Text>
        </View>

        {/* Today */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={{ color: "#64748b", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
            Today
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginRight: -20 }}>
            <View style={{ flexDirection: "row", paddingRight: 20 }}>
              <StatCard
                icon={<Flame size={18} color="#f97316" />}
                label="Calories"
                value={todayCalories}
                target={goal?.dailyCalorieTarget ?? 2000}
                unit="kcal"
                color="#f97316"
                onPress={() => router.push("/log-calories")}
              />
              <StatCard
                icon={<Moon size={18} color="#a78bfa" />}
                label="Sleep"
                value={todaySleep}
                target={goal?.dailySleepHours ?? 8}
                unit="hrs"
                color="#a78bfa"
                onPress={() => router.push("/log-sleep")}
              />
            </View>
          </ScrollView>
        </View>

        {/* This Week */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={{ color: "#64748b", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
            This Week
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginRight: -20 }}>
            <View style={{ flexDirection: "row", paddingRight: 20 }}>
              <StatCard
                icon={<Dumbbell size={18} color="#22d3ee" />}
                label="Workouts"
                value={weekWorkouts}
                target={goal?.weeklyWorkouts ?? 3}
                unit="sessions"
                color="#22d3ee"
                onPress={() => router.push("/log-workout")}
              />
              <StatCard
                icon={<BookOpen size={18} color="#4ade80" />}
                label="Study"
                value={weekStudyHours}
                target={goal?.weeklyStudyHours ?? 10}
                unit="hrs"
                color="#4ade80"
                onPress={() => router.push("/log-study")}
              />
            </View>
          </ScrollView>
        </View>

        {/* Quick Log */}
        <View style={{ paddingHorizontal: 20, marginBottom: 40 }}>
          <Text style={{ color: "#64748b", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
            Quick Log
          </Text>
          <View style={{ backgroundColor: "#0f172a", borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "#1e293b" }}>
            {QUICK_ACTIONS.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => router.push(item.route)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  borderBottomWidth: i < QUICK_ACTIONS.length - 1 ? 1 : 0,
                  borderBottomColor: "#1e293b",
                }}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    backgroundColor: `${item.color}18`,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  {QUICK_ICONS[item.label]}
                </View>
                <Text style={{ flex: 1, color: "white", fontWeight: "600", fontSize: 14 }}>{item.label}</Text>
                <ChevronRight size={16} color="#334155" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
