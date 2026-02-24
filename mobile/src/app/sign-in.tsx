import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { authClient } from "@/lib/auth/auth-client";
import { Zap } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOTP = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    setError(null);

    const result = await authClient.emailOtp.sendVerificationOtp({
      email: trimmed,
      type: "sign-in",
    });

    setLoading(false);

    if (result.error) {
      setError(result.error.message || "Failed to send verification code");
    } else {
      router.push({ pathname: "/verify-otp", params: { email: trimmed } });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flex: 1, paddingHorizontal: 24 }}>
            {/* Hero */}
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 60, paddingBottom: 40 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 24,
                  backgroundColor: "#4f46e5",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 24,
                  shadowColor: "#6366f1",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                }}
              >
                <Zap size={40} color="white" />
              </View>
              <Text style={{ color: "white", fontSize: 36, fontWeight: "800", letterSpacing: -1, marginBottom: 8 }}>
                DualForce
              </Text>
              <Text style={{ color: "#64748b", fontSize: 15, textAlign: "center", lineHeight: 22, paddingHorizontal: 20 }}>
                Balance your fitness, studies, sleep, and nutrition in one place
              </Text>
            </View>

            {/* Form */}
            <View style={{ paddingBottom: 48 }}>
              <Text style={{ color: "white", fontSize: 24, fontWeight: "700", marginBottom: 6 }}>
                Get started
              </Text>
              <Text style={{ color: "#64748b", fontSize: 14, marginBottom: 28 }}>
                Enter your email to receive a sign-in code
              </Text>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: "#94a3b8", fontSize: 11, fontWeight: "600", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                  Email Address
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#0f172a",
                    color: "white",
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: "#1e293b",
                  }}
                  placeholder="you@example.com"
                  placeholderTextColor="#334155"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                  onSubmitEditing={handleSendOTP}
                  returnKeyType="send"
                />
              </View>

              {error !== null && (
                <View
                  style={{
                    backgroundColor: "#1a0a0a",
                    borderWidth: 1,
                    borderColor: "#7f1d1d",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    marginBottom: 16,
                  }}
                >
                  <Text style={{ color: "#f87171", fontSize: 14 }}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                onPress={handleSendOTP}
                disabled={loading}
                style={{
                  backgroundColor: "#4f46e5",
                  borderRadius: 16,
                  paddingVertical: 16,
                  alignItems: "center",
                  opacity: loading ? 0.7 : 1,
                }}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
                    Send code
                  </Text>
                )}
              </TouchableOpacity>

              <Text style={{ color: "#334155", fontSize: 12, textAlign: "center", marginTop: 20, lineHeight: 18 }}>
                A 6-digit verification code will be sent to your inbox.{"\n"}New users are created automatically.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
