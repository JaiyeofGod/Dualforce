import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/api";
import type { Goal } from "@/lib/types";
import { Dumbbell, BookOpen, Moon, Flame, X, Check } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingScreen() {
  const queryClient = useQueryClient();

  const { data: goal, isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: () => api.get<Goal>("/api/goals"),
  });

  const [form, setForm] = useState({
    weeklyWorkouts: "3",
    weeklyStudyHours: "10",
    dailySleepHours: "8",
    dailyCalorieTarget: "2000",
  });

  useEffect(() => {
    if (goal) {
      setForm({
        weeklyWorkouts: String(goal.weeklyWorkouts),
        weeklyStudyHours: String(goal.weeklyStudyHours),
        dailySleepHours: String(goal.dailySleepHours),
        dailyCalorieTarget: String(goal.dailyCalorieTarget),
      });
    }
  }, [goal]);

  const mutation = useMutation({
    mutationFn: (data: Partial<Goal>) => api.put<Goal>("/api/goals", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      router.back();
    },
    onError: () => Alert.alert("Error", "Failed to save goals. Please try again."),
  });

  const handleSave = () => {
    mutation.mutate({
      weeklyWorkouts: parseInt(form.weeklyWorkouts, 10) || 3,
      weeklyStudyHours: parseFloat(form.weeklyStudyHours) || 10,
      dailySleepHours: parseFloat(form.dailySleepHours) || 8,
      dailyCalorieTarget: parseInt(form.dailyCalorieTarget, 10) || 2000,
    });
  };

  const fields = [
    {
      key: "weeklyWorkouts" as const,
      label: "Weekly Workouts",
      description: "How many workout sessions per week?",
      unit: "sessions/week",
      icon: <Dumbbell size={20} color="#22d3ee" />,
      color: "#22d3ee",
      isDecimal: false,
    },
    {
      key: "weeklyStudyHours" as const,
      label: "Weekly Study Hours",
      description: "Target study hours per week",
      unit: "hours/week",
      icon: <BookOpen size={20} color="#4ade80" />,
      color: "#4ade80",
      isDecimal: true,
    },
    {
      key: "dailySleepHours" as const,
      label: "Daily Sleep Goal",
      description: "Target sleep hours per night",
      unit: "hours/night",
      icon: <Moon size={20} color="#a78bfa" />,
      color: "#a78bfa",
      isDecimal: true,
    },
    {
      key: "dailyCalorieTarget" as const,
      label: "Daily Calorie Target",
      description: "Target daily calorie intake",
      unit: "kcal/day",
      icon: <Flame size={20} color="#f97316" />,
      color: "#f97316",
      isDecimal: false,
    },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#020617", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#6366f1" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center", marginRight: 12 }}
        >
          <X size={18} color="#94a3b8" />
        </TouchableOpacity>
        <Text style={{ flex: 1, color: "white", fontSize: 20, fontWeight: "700" }}>Set Goals</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={mutation.isPending}
          style={{ backgroundColor: "#4f46e5", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, flexDirection: "row", alignItems: "center" }}
        >
          {mutation.isPending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Check size={15} color="white" />
              <Text style={{ color: "white", fontWeight: "700", fontSize: 14, marginLeft: 4 }}>Save</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        <Text style={{ color: "#64748b", fontSize: 14, marginBottom: 24, lineHeight: 20 }}>
          Set your weekly and daily targets. You can update these anytime from your profile.
        </Text>

        {fields.map((field) => (
          <View key={field.key} style={{ backgroundColor: "#0f172a", borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#1e293b" }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 11,
                  backgroundColor: `${field.color}22`,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                {field.icon}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>{field.label}</Text>
                <Text style={{ color: "#475569", fontSize: 12, marginTop: 1 }}>{field.description}</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#1e293b", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
              <TextInput
                style={{ flex: 1, color: field.color, fontSize: 20, fontWeight: "700" }}
                value={form[field.key]}
                onChangeText={(v) => setForm((f) => ({ ...f, [field.key]: v }))}
                keyboardType={field.isDecimal ? "decimal-pad" : "number-pad"}
                selectTextOnFocus
              />
              <Text style={{ color: "#475569", fontSize: 13 }}>{field.unit}</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
