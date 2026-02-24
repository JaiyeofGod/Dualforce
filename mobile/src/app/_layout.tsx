import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSession } from "@/lib/auth/use-session";
import { useColorScheme } from "@/lib/useColorScheme";

const queryClient = new QueryClient();

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { data: session, isLoading } = useSession();

  if (isLoading) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!!session?.user}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={!session?.user}>
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="verify-otp" />
        </Stack.Protected>
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <RootLayoutNav />
        </KeyboardProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
