import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { authClient } from "@/lib/auth/auth-client";
import { useSession, useInvalidateSession } from "@/lib/auth/use-session";
import { LogOut, Target, ChevronRight, User, Zap } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { data: session } = useSession();
  const invalidateSession = useInvalidateSession();

  const handleSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await authClient.signOut();
          await invalidateSession();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 }}>
          <Text style={{ color: "white", fontSize: 24, fontWeight: "800", marginBottom: 24 }}>Profile</Text>

          {/* User card */}
          <View style={{ backgroundColor: "#0f172a", borderRadius: 20, padding: 20, marginBottom: 24, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#1e293b" }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#4f46e5", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
              <User size={24} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
                {session?.user?.name ?? "User"}
              </Text>
              <Text style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>
                {session?.user?.email}
              </Text>
            </View>
          </View>

          {/* Menu */}
          <View style={{ backgroundColor: "#0f172a", borderRadius: 20, overflow: "hidden", marginBottom: 16, borderWidth: 1, borderColor: "#1e293b" }}>
            <TouchableOpacity
              onPress={() => router.push("/onboarding")}
              style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#1e293b" }}
              activeOpacity={0.7}
            >
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#1e1b4b", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Target size={18} color="#818cf8" />
              </View>
              <Text style={{ flex: 1, color: "white", fontWeight: "600", fontSize: 14 }}>Edit Goals</Text>
              <ChevronRight size={16} color="#334155" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSignOut}
              style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16 }}
              activeOpacity={0.7}
            >
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#1a0a0a", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <LogOut size={18} color="#f87171" />
              </View>
              <Text style={{ flex: 1, color: "#f87171", fontWeight: "600", fontSize: 14 }}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 12 }}>
            <Zap size={12} color="#1e293b" />
            <Text style={{ color: "#1e293b", fontSize: 12, marginLeft: 4 }}>DualForce v1.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
