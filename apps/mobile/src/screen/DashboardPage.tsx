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
  TouchableOpacity,
  Modal,
  Button
} from 'react-native';

interface UserProps {
  user: {
    username: string;
    department: string; // Asumsi ini sekarang akan dicocokkan dengan kolom "Module"
  } | null; 
}

export default function DashboardPage({user}: UserProps) {
  const [tasks, setTasks] = useState([]);
  const [tabName, setTabName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('default'); 
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [percentage, setPercentage] = useState('');
  const [remark, setRemark] = useState('');

  const fetchTasks = async () => {
    try {
      // Sesuaikan endpoint ini dengan route.ts yang baru kamu buat
      const response = await fetch('http://10.116.191.10:3000/api/sprint');
      const data = await response.json();
      setTasks(data.dataMentah); 
      setTabName(data.namaTabYangDibaca);
    } catch (error) {
      console.error("Gagal menarik data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openUpdateModal = (item: any) => {
    setSelectedTask(item);
    setPercentage(''); 
    setRemark('');
    setModalVisible(true);
  };

  const handleSaveUpdate = async () => {
    try {
      const formattedPercentage = percentage ? `${percentage}%` : '0%';
      const payload = {
        code: selectedTask?.code, // Menggunakan 'code' sesuai mapping baru
        taskName: selectedTask?.taskName,
        pic: user?.username, 
        percentage: formattedPercentage, 
        remark: remark 
      };

      const response = await fetch('http://192.168.0.117:3000/api/timesheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Data yang mau disimpan:", payload);
        setModalVisible(false);
      } else {
        console.error("Gagal simpan:", result);
      }
    } catch (error) {
      console.error("Error jaringan:", error);
    }
  };

  const processedTasks = tasks
    .filter((item: any) => {
      if (!searchText) return true;
      const lowerSearch = searchText.toLowerCase();
      
      // Cari kecocokan di nama task, Code (ID), atau nama developer
      return (
        item.taskName?.toLowerCase().includes(lowerSearch) ||
        item.code?.toLowerCase().includes(lowerSearch) ||
        item.developer?.toLowerCase().includes(lowerSearch)
      );
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'status') {
        if (a.status === 'DONE' && b.status !== 'DONE') return 1;
        if (a.status !== 'DONE' && b.status === 'DONE') return -1;
        return 0;
      }
      if (sortBy === 'department') {
        // Mengurutkan berdasarkan kolom 'module'
        return a.module?.localeCompare(b.module || '');
      }
      return 0;
    });

  useEffect(() => {
    fetchTasks();
  }, []);

  // Penamaan fungsi dipertahankan, tapi parameter yang masuk adalah 'module'
  const getDeptStyle = (deptName: string) => {
    const name = deptName?.toLowerCase() || '';

    switch (name) {
      case 'pm':
        return styles.deptPM;
      case 'fi':
      case 'finance':
        return styles.deptFI;
      case 'scm':
          return styles.deptIT;
      case 'hcm':
      default:
        return styles.deptDefault;
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => openUpdateModal(item)}
    >
      
      {/* Header Card: Module & Status */}
      <View style={styles.cardHeader}>
        <Text style={[styles.deptBadge, getDeptStyle(item.module)]}>
          {item.module || 'Unknown'}
        </Text>
        <Text style={[
          styles.statusBadge, 
          item.status === 'DONE' ? styles.statusDone : styles.statusProgress
        ]}>
          {item.status || 'OPEN'}
        </Text>
      </View>
      
      {/* Body Card: Code & Name */}
      <Text style={styles.taskId}>{item.code}</Text>
      <Text style={styles.taskName}>{item.taskName}</Text>
      
      {/* Footer Card: Assignee & Kompleksitas */}
      <View style={styles.cardFooter}>
        <Text style={styles.assignee}>
          👤 {item.developer || 'Unassigned'}
        </Text>
        <Text style={styles.kompleksitas}>
          ⏱ {item.kompleksitas || '-'}
        </Text>
      </View>
      
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <Text style={styles.headerTitle}>
          Tasklist Dashboard
        </Text>

        <Text style={styles.welcome}>
          Welcome, {user?.username}
        </Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Cari tugas, Kode, atau developer..."
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
            <Text style={[styles.sortBtnText, sortBy === 'department' && styles.sortBtnTextActive]}>Module</Text>
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
            keyExtractor={(item, index) => (item.code || '') + index}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
        
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <Text style={styles.modalTitle}>Update Task</Text>
            <Text style={styles.modalSubtitle}>{selectedTask?.taskName}</Text>

            <Text style={styles.inputLabel}>Persentase Penyelesaian</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
              <TextInput
                style={[styles.textInput, { flex: 1, marginBottom: 0 }]} 
                placeholder="Contoh: 30"
                value={percentage}
                onChangeText={setPercentage}
                keyboardType="numeric"
                maxLength={3} 
              />
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginLeft: 10 }}>%</Text>
            </View>

            <Text style={styles.inputLabel}>Remark / Catatan</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Tambahkan catatan pengerjaan..."
              value={remark}
              onChangeText={setRemark}
              multiline={true} 
              numberOfLines={4}
            />

            <View style={styles.buttonContainer}>
              <Button title="Batal" color="red" onPress={() => setModalVisible(false)} />
              <Button title="Simpan" onPress={handleSaveUpdate} />
            </View>

          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... (Gunakan style yang sama persis seperti kode aslimu, 
  // hanya ubah/tambahkan properti di bawah ini)
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
    backgroundColor: '#2563EB',
  },
  sortBtnText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  sortBtnTextActive: {
    color: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB', 
    paddingTop: Platform.OS === 'android' ? 36 : 0, 
  },
  container: {
    flex: 1,
    paddingHorizontal: 16, 
  },
  headerTitle: {
    fontSize: 24, 
    fontWeight: 'bold',
    color: '#1F2937', 
    marginBottom: 16, 
    marginTop: 8, 
  },
  welcome: {
    fontSize: 16, 
    color: '#1F2937', 
    marginBottom: 16, 
    marginTop: -10, 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280', 
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 12, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8, 
  },
  deptBadge: {
    backgroundColor: '#E5E7EB', 
    color: '#374151', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6, 
    fontSize: 12, 
    fontWeight: '600', 
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
    backgroundColor: '#DBEAFE', 
    color: '#1E40AF', 
  },
  statusProgress: {
    backgroundColor: '#D1FAE5', 
    color: '#065F46', 
  },
  taskId: {
    fontSize: 12, 
    color: '#6B7280', 
    marginBottom: 4, 
  },
  taskName: {
    fontSize: 16, 
    fontWeight: 'bold',
    color: '#111827', 
    marginBottom: 12, 
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6', 
    paddingTop: 12, 
  },
  assignee: {
    fontSize: 14, 
    color: '#4B5563', 
    flex: 1,
  },
  kompleksitas: { // Menggantikan storyPoints
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706', // Warna oranye (amber-600) untuk kompleksitas
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5, 
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top', 
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  }
});