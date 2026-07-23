import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import LoginPage from './src/components/LoginPage'; // Sesuaikan path folder-mu
import Dashboard from'./src/screen/DashboardPage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const savedSession = await AsyncStorage.getItem('userSession');
        if (savedSession) {
          setUserData(JSON.parse(savedSession));
          setIsLoggedIn(true);
        }
      } catch (e) {
        console.error("Gagal membaca session", e);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  // Fungsi ini dipanggil dari dalam LoginPage saat fetch sukses
  const handleLoginSuccess = async (data: any) => {
    setUserData(data); 
    setIsLoggedIn(true);
    try {
      await AsyncStorage.setItem('userSession', JSON.stringify(data));
    } catch (e) {
      console.error("Gagal menyimpan session", e);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Jika sudah login, render Dashboard (kamu bisa memindahkan kode dashboard lama ke komponen terpisah nanti)
  return (
    <Dashboard user={userData}/>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  }
});