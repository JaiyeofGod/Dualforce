import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" options={{ presentation: "modal" }} />
      <Stack.Screen name="log-workout" options={{ presentation: "modal" }} />
      <Stack.Screen name="log-study" options={{ presentation: "modal" }} />
      <Stack.Screen name="log-sleep" options={{ presentation: "modal" }} />
      <Stack.Screen name="log-calories" options={{ presentation: "modal" }} />
    </Stack>
  );
}
