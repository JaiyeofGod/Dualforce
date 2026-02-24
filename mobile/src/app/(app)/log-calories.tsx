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
import type { CalorieLog } from "@/lib/types";
import { X, Check, Flame, Coffee, Sun, Moon, Cookie } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MEALS = [
  { key: "breakfast", label: "Breakfast", icon: <Coffee size={15} color="#fbbf24" />, color: "#fbbf24" },
  { key: "lunch", label: "Lunch", icon: <Sun size={15} color="#f97316" />, color: "#f97316" },
  { key: "dinner", label: "Dinner", icon: <Moon size={15} color="#818cf8" />, color: "#818cf8" },
  { key: "snack", label: "Snack", icon: <Cookie size={15} color="#4ade80" />, color: "#4ade80" },
];

const CALORIE_PRESETS = [100, 200, 350, 500, 700, 1000];

export default function LogCaloriesScreen() {
  const queryClient = useQueryClient();
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("300");
  const [meal, setMeal] = useState("lunch");
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: (data: { foodName: string; calories: number; meal: string; notes?: string }) =>
      api.post<CalorieLog>("/api/calories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
      router.back();
    },
    onError: () => Alert.alert("Error", "Failed to save food entry."),
  });

  const handleSave = () => {
    if (!foodName.trim()) {
      Alert.alert("Missing info", "Please enter the food name.");
      return;
    }
    mutation.mutate({
      foodName: foodName.trim(),
      calories: parseInt(calories, 10) || 300,
      meal,
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
        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "#7c2d12", alignItems: "center", justifyContent: "center", marginRight: 8 }}>
          <Flame size={16} color="#f97316" />
        </View>
        <Text style={{ flex: 1, color: "white", fontSize: 20, fontWeight: "700" }}>Log Calories</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={mutation.isPending}
          style={{ backgroundColor: "#7c2d12", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, flexDirection: "row", alignItems: "center" }}
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
        <Text style={{ color: "#64748b", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Food / Meal Name</Text>
        <TextInput
          style={{ backgroundColor: "#0f172a", color: "white", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: "#1e293b" }}
          placeholder="e.g. Chicken Rice Bowl, Protein Shake..."
          placeholderTextColor="#334155"
          value={foodName}
          onChangeText={setFoodName}
          returnKeyType="next"
        />

        <Text style={{ color: "#64748b", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Meal</Text>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
          {MEALS.map((m) => (
            <TouchableOpacity
              key={m.key}
              onPress={() => setMeal(m.key)}
              style={{
                flex: 1,
                borderRadius: 14,
                paddingVertical: 12,
                alignItems: "center",
                backgroundColor: meal === m.key ? `${m.color}22` : "#0f172a",
                borderWidth: 1,
                borderColor: meal === m.key ? m.color : "#1e293b",
              }}
            >
              {m.icon}
              <Text style={{ fontSize: 11, fontWeight: "600", marginTop: 4, color: meal === m.key ? m.color : "#64748b" }}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ color: "#64748b", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Calories (kcal)</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {CALORIE_PRESETS.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setCalories(String(c))}
              style={{
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 10,
                backgroundColor: calories === String(c) ? "#7c2d12" : "#0f172a",
                borderWidth: 1,
                borderColor: calories === String(c) ? "#f97316" : "#1e293b",
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "700", color: calories === String(c) ? "#f97316" : "#64748b" }}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={{ backgroundColor: "#0f172a", color: "white", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: "#1e293b" }}
          placeholder="Or enter custom calories"
          placeholderTextColor="#334155"
          keyboardType="number-pad"
          value={calories}
          onChangeText={setCalories}
        />

        <Text style={{ color: "#64748b", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Notes (optional)</Text>
        <TextInput
          style={{ backgroundColor: "#0f172a", color: "white", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, marginBottom: 40, borderWidth: 1, borderColor: "#1e293b", minHeight: 88, textAlignVertical: "top" }}
          placeholder="Additional details..."
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
