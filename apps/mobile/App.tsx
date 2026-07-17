import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  SafeAreaView, 
  Platform,
  StyleSheet,
  TextInput,         
  TouchableOpacity
} from 'react-native';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [tabName, setTabName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('default'); 

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://192.168.0.117:3000/api/sprint');
      const data = await response.json();
      setTasks(data.dataMentah); 
      setTabName(data.namaTabYangDibaca);
    } catch (error) {
      console.error("Gagal menarik data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const processedTasks = tasks
    .filter((item: any) => {
      // 1. Fitur Search
      if (!searchText) return true; // Kalau kolom search kosong, tampilkan semua
      const lowerSearch = searchText.toLowerCase();
      
      // Cari kecocokan di nama task, ID, atau nama developer
      return (
        item.taskName?.toLowerCase().includes(lowerSearch) ||
        item.taskId?.toLowerCase().includes(lowerSearch) ||
        item.developer?.toLowerCase().includes(lowerSearch)
      );
    })
    .sort((a: any, b: any) => {
      // 2. Fitur Sort
      if (sortBy === 'status') {
        // Urutkan: Yang belum DONE taruh di atas
        if (a.status === 'DONE' && b.status !== 'DONE') return 1;
        if (a.status !== 'DONE' && b.status === 'DONE') return -1;
        return 0;
      }
      if (sortBy === 'department') {
        // Urutkan berdasarkan abjad departemen (A-Z)
        return a.department?.localeCompare(b.department || '');
      }
      return 0; // 'default': biarkan urutan asli dari Sheets
    });

  useEffect(() => {
    fetchTasks();
  }, []);

  const getDeptStyle = (deptName: string) => {
    // Ubah ke huruf kecil semua agar pengecekan lebih aman (pm = PM = Pm)
    const name = deptName?.toLowerCase() || '';

    switch (name) {
      case 'pm':
        return styles.deptPM;
      case 'fi':
      case 'finance':
        return styles.deptFI;
      case 'it':
      case 'tech':
        return styles.deptIT;
      default:
        return styles.deptDefault; // Warna abu-abu kalau department tidak dikenali
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      
      {/* Header Card: Dept & Status */}
      <View style={styles.cardHeader}>
        <Text style={[styles.deptBadge, getDeptStyle(item.department)]}>
          {item.department}
        </Text>
        <Text style={[
          styles.statusBadge, 
          item.status === 'DONE' ? styles.statusDone : styles.statusProgress
        ]}>
          {item.status}
        </Text>
      </View>
      
      {/* Body Card: ID & Name */}
      <Text style={styles.taskId}>{item.taskId}</Text>
      <Text style={styles.taskName}>{item.taskName}</Text>
      
      {/* Footer Card: Assignee & Story Points */}
      <View style={styles.cardFooter}>
        <Text style={styles.assignee}>
          👤 {item.developer || 'Unassigned'}
        </Text>
        <Text style={styles.storyPoints}>
          SP: {item.progressPoints} / {item.storyPoints}
        </Text>
      </View>
      
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <Text style={styles.headerTitle}>
          Sprint Dashboard
        </Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Cari tugas, ID, atau developer..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#9CA3AF"
        />

        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Urutkan:</Text>
          <TouchableOpacity 
            style={[styles.sortBtn, sortBy === 'default' && styles.sortBtnActive]} 
            onPress={() => setSortBy('default')}
          >
            <Text style={[styles.sortBtnText, sortBy === 'default' && styles.sortBtnTextActive]}>Semua</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortBtn, sortBy === 'status' && styles.sortBtnActive]} 
            onPress={() => setSortBy('status')}
          >
            <Text style={[styles.sortBtnText, sortBy === 'status' && styles.sortBtnTextActive]}>Status</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortBtn, sortBy === 'department' && styles.sortBtnActive]} 
            onPress={() => setSortBy('department')}
          >
            <Text style={[styles.sortBtnText, sortBy === 'department' && styles.sortBtnTextActive]}>Dept</Text>
          </TouchableOpacity>
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Menarik data dari Sheets...</Text>
          </View>
        ) : (
          <FlatList
            data={processedTasks}
            keyExtractor={(item, index) => item.taskId + index}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
        
      </View>
    </SafeAreaView>
  );
}

// Terjemahan Tailwind ke StyleSheet murni
const styles = StyleSheet.create({
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 8,
  },
  sortBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  sortBtnActive: {
    backgroundColor: '#2563EB', // Biru saat aktif
  },
  sortBtnText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  sortBtnTextActive: {
    color: '#FFFFFF', // Putih saat aktif
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB', // gray-50
    paddingTop: Platform.OS === 'android' ? 36 : 0, // pt-9
  },
  container: {
    flex: 1,
    paddingHorizontal: 16, // px-4
  },
  headerTitle: {
    fontSize: 24, // text-2xl
    fontWeight: 'bold',
    color: '#1F2937', // gray-800
    marginBottom: 16, // mb-4
    marginTop: 8, // mt-2
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280', // gray-500
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF', // bg-white
    borderRadius: 12, // rounded-xl
    padding: 16, // p-4
    marginBottom: 12, // mb-3
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Elevation for Android
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8, // mb-2
  },
  deptBadge: {
    backgroundColor: '#E5E7EB', // bg-gray-200
    color: '#374151', // text-gray-700
    paddingHorizontal: 8, // px-2
    paddingVertical: 4, // py-1
    borderRadius: 6, // rounded-md
    fontSize: 12, // text-xs
    fontWeight: '600', // font-semibold
  },
  deptPM: {
    backgroundColor: '#FEE2E2', 
    color: '#991B1B',           
  },
  deptFI: {
    backgroundColor: '#FEF3C7', 
    color: '#92400E',           
  },
  deptIT: {
    backgroundColor: '#E0E7FF', 
    color: '#3730A3',           
  },
  deptDefault: {
    backgroundColor: '#E1FFDE', 
    color: '#16A800',           
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusDone: {
    backgroundColor: '#DBEAFE', // bg-blue-100
    color: '#1E40AF', // text-blue-800
  },
  statusProgress: {
    backgroundColor: '#D1FAE5', // bg-emerald-100
    color: '#065F46', // text-emerald-800
  },
  taskId: {
    fontSize: 12, // text-xs
    color: '#6B7280', // text-gray-500
    marginBottom: 4, // mb-1
  },
  taskName: {
    fontSize: 16, // text-base
    fontWeight: 'bold',
    color: '#111827', // text-gray-900
    marginBottom: 12, // mb-3
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6', // border-gray-100
    paddingTop: 12, // pt-3
  },
  assignee: {
    fontSize: 14, // text-sm
    color: '#4B5563', // text-gray-600
    flex: 1,
  },
  storyPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB', // text-blue-600
  },
});