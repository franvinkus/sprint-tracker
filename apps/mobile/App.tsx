import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import LoginPage from './src/components/LoginPage'; // Sesuaikan path folder-mu
import Dashboard from'./src/screen/DashboardPage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  // Fungsi ini dipanggil dari dalam LoginPage saat fetch sukses
  const handleLoginSuccess = (data: any) => {
    setUserData(data); // Menyimpan data user, misalnya untuk filter department nanti
    setIsLoggedIn(true);
  };

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