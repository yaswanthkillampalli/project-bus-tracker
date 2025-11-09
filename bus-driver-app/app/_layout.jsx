import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// This simple hook simulates a more robust authentication check.
const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would check for a token in secure storage here.
    // We'll simulate a check that takes 1 second.
    setTimeout(() => {
      const token = null; // Replace with logic to check for a stored token.
      if (token) {
        setIsLoggedIn(true);
      }
      setLoading(false);
    }, 1000);
  }, []);

  return { isLoggedIn, setIsLoggedIn, loading };
};

export default function RootLayout() {
  const { isLoggedIn, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // This effect handles the redirection logic based on the user's login state.
  useEffect(() => {
    if (loading) return;

    const inApp = segments[0] === '(app)';

    if (isLoggedIn && !inApp) {
      // If the user is logged in but not in the app, redirect to the tracker page.
      router.replace('/tracker');
    } else if (!isLoggedIn && inApp) {
      // If the user is not logged in but tries to access the app, redirect to login.
      router.replace('/login');
    }
  }, [isLoggedIn, loading, segments]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="tracker" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});