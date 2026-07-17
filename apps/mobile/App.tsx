// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  SafeAreaView, 
  Platform 
} from 'react-native';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [tabName, setTabName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      // Ganti dengan IP Address-mu
      const response = await fetch('http://192.168.10.11:3000/api/sprint');
      const data = await response.json();
      setTasks(data.dataMentah); 
      setTabName(data.namaTabYangDibaca);
      console.log(data);
    } catch (error) {
      console.error("Gagal menarik data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm elevation-2">
      
      {/* Header Card: Dept & Status */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs font-semibold">
          {item.department}
        </Text>
        <Text className={`px-2 py-1 rounded-md text-xs font-bold ${
          item.status === 'DONE' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-emerald-100 text-emerald-800'
        }`}>
          {item.status}
        </Text>
      </View>
      
      {/* Body Card: ID & Name */}
      <Text className="text-xs text-gray-500 mb-1">{item.taskId}</Text>
      <Text className="text-base font-bold text-gray-900 mb-3">{item.taskName}</Text>
      
      {/* Footer Card: Assignee & Story Points */}
      <View className="flex-row justify-between items-center border-t border-gray-100 pt-3">
        <Text className="text-sm text-gray-600 flex-1">
          👤 {item.developer || 'Unassigned'}
        </Text>
        <Text className="text-sm font-semibold text-blue-600">
          SP: {item.progressPoints} / {item.storyPoints}
        </Text>
      </View>
      
    </View>
  );

  return (
    // Penanganan padding top khusus Android karena SafeAreaView iOS berbeda
    <SafeAreaView className={`flex-1 bg-gray-50 ${Platform.OS === 'android' ? 'pt-9' : ''}`}>
      <View className="flex-1 px-4">
        
        <Text className="text-2xl font-bold text-gray-800 mb-4 mt-2">
          Sprint Dashboard
        </Text>
        
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#2563EB" />
            <Text className="mt-3 text-gray-500">Menarik data dari Sheets...</Text>
          </View>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item, index) => item.taskId + index}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )}
        
      </View>
    </SafeAreaView>
  );
}