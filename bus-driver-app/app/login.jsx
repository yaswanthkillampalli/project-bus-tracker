import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginPage() {
  const [busId, setBusId] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (busId.trim() !== '') {
      // In a real app, you would validate the busId with your backend
      // and get a real JWT token.
      const jwtToken = `fake-jwt-for-bus-${busId}-${new Date().getTime()}`;
      console.log('Simulated JWT Token:', jwtToken);
      // In a real app, you would store this in secure storage.
      router.replace('/tracker');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bus Driver Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Bus ID"
        value={busId}
        onChangeText={setBusId}
      />
      <Button title="Login and Start Tracking" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
});