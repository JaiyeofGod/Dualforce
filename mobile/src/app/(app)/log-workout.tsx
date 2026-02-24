import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/api";
import type { Workout } from "@/lib/types";
import { X, Check, Dumbbell } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WORKOUT_TYPES = ["Cardio", "Strength", "HIIT", "Yoga", "Pilates", "Cycling", "Swimming", "Sports", "Other"];
const DURATION_PRESETS = [15, 30, 45, 60, 90];

export default function LogWorkoutScreen() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [type, setType] = useState("Strength");
  const [duration, setDuration] = useState("30");
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: (data: { name: string; type: string; durationMin: number; notes?: string }) =>
      api.post<Workout>("/api/workouts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
      router.back();
    },
    onError: () => Alert.alert("Error", "Failed to save workout."),
  });

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Missing info", "Please enter a workout name.");
      return;
    }
    mutation.mutate({
      name: name.trim(),
      type,
      durationMin: parseInt(duration, 10) || 30,
      notes: notes.trim() !== "" ? notes.trim() : undefined,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center", marginRight: 12 }}
        >
          <X size={18} color="#94a3b8" />
        </TouchableOpacity>
        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "#0e7490", alignItems: "center", justifyContent: "center", marginRight: 8 }}>
          <Dumbbell size={16} color="#22d3ee" />
        </View>
        <Text style={{ flex: 1, color: "white", fontSize: 20, fontWeight: "700" }}>Log Workout</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={mutation.isPending}
          style={{ backgroundColor: "#0e7490", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, flexDirection: "row", alignItems: "center" }}
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

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={{ color: "#64748b", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Workout Name</Text>
        <TextInput
          style={{ backgroundColor: "#0f172a", color: "white", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: "#1e293b" }}
          placeholder="e.g. Morning Run, Leg Day..."
          placeholderTextColor="#334155"
          value={name}
          onChangeText={setName}
          returnKeyType="next"
        />

        <Text style={{ color: "#64748b", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20, marginHorizontal: -20 }}>
          <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 20 }}>
            {WORKOUT_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setType(t)}
                style={{
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  backgroundColor: type === t ? "#0e7490" : "#0f172a",
                  borderWidth: 1,
                  borderColor: type === t ? "#22d3ee" : "#1e293b",
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "600", color: type === t ? "#22d3ee" : "#64748b" }}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={{ color: "#64748b", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Duration (minutes)</Text>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
          {DURATION_PRESETS.map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => setDuration(String(d))}
              style={{
                flex: 1,
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: "center",
                backgroundColor: duration === String(d) ? "#0e7490" : "#0f172a",
                borderWidth: 1,
                borderColor: duration === String(d) ? "#22d3ee" : "#1e293b",
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "700", color: duration === String(d) ? "#22d3ee" : "#64748b" }}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={{ backgroundColor: "#0f172a", color: "white", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: "#1e293b" }}
          placeholder="Or enter custom minutes"
          placeholderTextColor="#334155"
          keyboardType="number-pad"
          value={duration}
          onChangeText={setDuration}
        />

        <Text style={{ color: "#64748b", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Notes (optional)</Text>
        <TextInput
          style={{ backgroundColor: "#0f172a", color: "white", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, marginBottom: 40, borderWidth: 1, borderColor: "#1e293b", minHeight: 88, textAlignVertical: "top" }}
          placeholder="How did it go?"
          placeholderTextColor="#334155"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
