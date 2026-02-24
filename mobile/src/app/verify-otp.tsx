import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { authClient } from "@/lib/auth/auth-client";
import { useInvalidateSession } from "@/lib/auth/use-session";
import { OtpInput } from "react-native-otp-entry";
import { ArrowLeft, Mail } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VerifyOTPScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const invalidateSession = useInvalidateSession();

  const handleVerifyOTP = async (otp: string) => {
    setLoading(true);
    setError(null);

    const result = await authClient.signIn.emailOtp({
      email: (email ?? "").trim(),
      otp,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error.message || "Invalid verification code. Please try again.");
    } else {
      await invalidateSession();
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    await authClient.emailOtp.sendVerificationOtp({
      email: (email ?? "").trim(),
      type: "sign-in",
    });
    setResending(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        <View style={{ paddingTop: 16, paddingBottom: 24 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#0f172a",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 32,
            }}
          >
            <ArrowLeft size={20} color="#94a3b8" />
          </TouchableOpacity>

          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: "#1e1b4b",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <Mail size={28} color="#818cf8" />
          </View>

          <Text style={{ color: "white", fontSize: 28, fontWeight: "700", marginBottom: 8 }}>
            Check your email
          </Text>
          <Text style={{ color: "#64748b", fontSize: 15, lineHeight: 22 }}>
            We sent a 6-digit code to{"\n"}
            <Text style={{ color: "#818cf8", fontWeight: "600" }}>{email}</Text>
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ marginBottom: 32 }}>
            <OtpInput
              numberOfDigits={6}
              onFilled={handleVerifyOTP}
              type="numeric"
              focusColor="#6366f1"
              theme={{
                containerStyle: { gap: 8 },
                inputsContainerStyle: { gap: 8 },
                pinCodeContainerStyle: {
                  backgroundColor: "#0f172a",
                  borderColor: "#1e293b",
                  borderRadius: 14,
                  width: 48,
                  height: 56,
                },
                pinCodeTextStyle: {
                  color: "white",
                  fontSize: 22,
                  fontWeight: "600",
                },
                focusStickStyle: { backgroundColor: "#6366f1" },
                focusedPinCodeContainerStyle: {
                  borderColor: "#6366f1",
                },
              }}
            />
          </View>

          {loading ? (
            <View style={{ alignItems: "center", paddingVertical: 16 }}>
              <ActivityIndicator color="#6366f1" />
              <Text style={{ color: "#64748b", fontSize: 14, marginTop: 8 }}>Verifying...</Text>
            </View>
          ) : null}

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

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 16 }}>
            <Text style={{ color: "#64748b", fontSize: 14 }}>Didn't receive it? </Text>
            <TouchableOpacity onPress={handleResend} disabled={resending}>
              {resending ? (
                <ActivityIndicator size="small" color="#6366f1" />
              ) : (
                <Text style={{ color: "#818cf8", fontSize: 14, fontWeight: "600" }}>Resend code</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
