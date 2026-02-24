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
import type { SleepLog } from "@/lib/types";
import { X, Check, Moon, Star } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SLEEP_PRESETS = [5, 6, 7, 7.5, 8, 8.5, 9];
const QUALITY_LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

export default function LogSleepScreen() {
  const queryClient = useQueryClient();
  const [hours, setHours] = useState("8");
  const [quality, setQuality] = useState(3);
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: (data: { hours: number; quality: number; notes?: string }) =>
      api.post<SleepLog>("/api/sleep", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
      router.back();
    },
    onError: () => Alert.alert("Error", "Failed to save sleep log."),
  });

  const handleSave = () => {
    mutation.mutate({
      hours: parseFloat(hours) || 8,
      quality,
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
        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "#3b0764", alignItems: "center", justifyContent: "center", marginRight: 8 }}>
          <Moon size={16} color="#a78bfa" />
        </View>
        <Text style={{ flex: 1, color: "white", fontSize: 20, fontWeight: "700" }}>Log Sleep</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={mutation.isPending}
          style={{ backgroundColor: "#3b0764", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, flexDirection: "row", alignItems: "center" }}
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
        {/* Big display */}
        <View style={{ alignItems: "center", paddingVertical: 32 }}>
          <Text style={{ color: "#64748b", fontSize: 14, marginBottom: 8 }}>Hours slept</Text>
          <Text style={{ color: "#a78bfa", fontSize: 72, fontWeight: "800", lineHeight: 80 }}>{hours}</Text>
          <Text style={{ color: "#475569", fontSize: 16, marginTop: 4 }}>hours</Text>
        </View>

        <Text style={{ color: "#64748b", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Quick select</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {SLEEP_PRESETS.map((h) => (
            <TouchableOpacity
              key={h}
              onPress={() => setHours(String(h))}
              style={{
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 10,
                backgroundColor: hours === String(h) ? "#3b0764" : "#0f172a",
                borderWidth: 1,
                borderColor: hours === String(h) ? "#a78bfa" : "#1e293b",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "700", color: hours === String(h) ? "#a78bfa" : "#64748b" }}>{h}h</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ color: "#64748b", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Custom hours</Text>
        <TextInput
          style={{ backgroundColor: "#0f172a", color: "white", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: "#1e293b" }}
          placeholder="e.g. 7.5"
          placeholderTextColor="#334155"
          keyboardType="decimal-pad"
          value={hours}
          onChangeText={setHours}
        />

        <Text style={{ color: "#64748b", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Sleep Quality</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
          {[1, 2, 3, 4, 5].map((q) => (
            <TouchableOpacity key={q} onPress={() => setQuality(q)} style={{ alignItems: "center", flex: 1 }}>
              <Star
                size={32}
                color={q <= quality ? "#a78bfa" : "#1e293b"}
                fill={q <= quality ? "#a78bfa" : "transparent"}
              />
              <Text style={{ fontSize: 10, marginTop: 4, color: q <= quality ? "#a78bfa" : "#334155" }}>
                {QUALITY_LABELS[q]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ color: "#64748b", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Notes (optional)</Text>
        <TextInput
          style={{ backgroundColor: "#0f172a", color: "white", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, marginBottom: 40, borderWidth: 1, borderColor: "#1e293b", minHeight: 88, textAlignVertical: "top" }}
          placeholder="How did you sleep?"
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
