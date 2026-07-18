import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator
} from 'react-native';

export default function LoginPage({ onLoginSuccess }: { onLoginSuccess: (userData: any) => void }) {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !pin) {
      Alert.alert('Peringatan', 'Username dan PIN tidak boleh kosong');
      return;
    }

    setIsLoading(true);
    try {
      // Sesuaikan IP address jika ada perubahan
      const response = await fetch('http://192.168.0.117:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, pin }), 
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onLoginSuccess(result.data); 
      } else {
        Alert.alert('Login Gagal', result.message || 'Periksa kembali data Anda');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal terhubung ke server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login to your account</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="PIN"
        value={pin}
        onChangeText={setPin}
        secureTextEntry // Membuat teks menjadi bulat-bulat (password)
        keyboardType="numeric" // Memunculkan keyboard angka untuk PIN
      />

      <TouchableOpacity 
        style={styles.loginBtn} 
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.loginBtnText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F3F4F6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#1F2937',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  loginBtn: {
    backgroundColor: '#2563EB',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});