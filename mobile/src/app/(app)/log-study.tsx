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
import type { StudySession } from "@/lib/types";
import { X, Check, BookOpen } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "History", "English", "Comp Sci", "Economics", "Other"];
const DURATION_PRESETS = [25, 50, 60, 90, 120];

export default function LogStudyScreen() {
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("Math");
  const [duration, setDuration] = useState("50");
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: (data: { subject: string; durationMin: number; notes?: string }) =>
      api.post<StudySession>("/api/study", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["report"] });
      router.back();
    },
    onError: () => Alert.alert("Error", "Failed to save study session."),
  });

  const handleSave = () => {
    mutation.mutate({
      subject,
      durationMin: parseInt(duration, 10) || 50,
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
        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "#14532d", alignItems: "center", justifyContent: "center", marginRight: 8 }}>
          <BookOpen size={16} color="#4ade80" />
        </View>
        <Text style={{ flex: 1, color: "white", fontSize: 20, fontWeight: "700" }}>Log Study Session</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={mutation.isPending}
          style={{ backgroundColor: "#14532d", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, flexDirection: "row", alignItems: "center" }}
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
        <Text style={{ color: "#64748b", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Subject</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20, marginHorizontal: -20 }}>
          <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 20 }}>
            {SUBJECTS.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setSubject(s)}
                style={{
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  backgroundColor: subject === s ? "#14532d" : "#0f172a",
                  borderWidth: 1,
                  borderColor: subject === s ? "#4ade80" : "#1e293b",
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "600", color: subject === s ? "#4ade80" : "#64748b" }}>{s}</Text>
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
                backgroundColor: duration === String(d) ? "#14532d" : "#0f172a",
                borderWidth: 1,
                borderColor: duration === String(d) ? "#4ade80" : "#1e293b",
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "700", color: duration === String(d) ? "#4ade80" : "#64748b" }}>{d}</Text>
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
          placeholder="Topics covered, difficulty..."
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
