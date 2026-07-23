import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Button,
  ScrollView
} from 'react-native';

interface CreateTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (taskData: any) => void;
  lastTaskCode?: string;
}

export default function CreateTaskModal({ visible, onClose, onSave, lastTaskCode }: CreateTaskModalProps) {
  // State untuk form
  const [code, setCode] = useState('');
  const [ticketType, setTicketType] = useState('');
  const [module, setModule] = useState('');
  const [slaStatus, setSlaStatus] = useState('WITHIN SLA');
  const [status, setStatus] = useState('TO DO');
  const [eta, setEta] = useState('');
  const [assignee, setAssignee] = useState('');
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');

  // Data opsi Dropdown (disimulasikan dengan UI Chips)
  const TICKET_OPTIONS = ['Service Request', 'Bug Fixing', 'Incident'];
  const MODULE_OPTIONS = ['FI/CO', 'MM', 'PS', 'SD', 'ABAP', 'Infra'];
  const SLA_OPTIONS = ['WITHIN SLA', 'BREACHED SLA', 'SLA EXCLUDED'];
  const STATUS_OPTIONS = ['TO DO', 'ON PROGRESS', 'HOLD', 'DONE'];
  
  // Data dummy assignee (kamu bisa ganti ambil dari API nanti)
  const ASSIGNEE_OPTIONS = ['Budi (Developer)', 'Siti (Konsultan)', 'Agus (ABAP)'];

  const createCode = () => {
    let prefix = 'TSK'; // Default
    if (ticketType === 'Service Request') prefix = 'SR';
    else if (ticketType === 'Bug Fixing') prefix = 'BF';
    else if (ticketType === 'Incident') prefix = 'INC';

    const date = new Date();
    const year = date.getFullYear(); // 2026
    const month = String(date.getMonth() + 1).padStart(2, '0'); // '07'
    const yearMonth = `${year}${month}`;

    let nextSequence = 1; 

    if (lastTaskCode) {
      const parts = lastTaskCode.split('-');

      if (parts.length === 3 && parts[1] === yearMonth) {
        const lastNumber = parseInt(parts[2], 10);
        if (!isNaN(lastNumber)) {
          nextSequence = lastNumber + 1; 
        }
      }
    }

    const sequenceString = String(nextSequence).padStart(3, '0');
    return `${prefix}-${yearMonth}-${sequenceString}`;
  }

  const handleSave = () => {
    // Validasi field mandatori
    if ( !ticketType || !eta) {
      alert("Field Support Ticket dan ETA wajib diisi!");
      return;
    }

    const finalCode = code || createCode();

    const payload = {
      code: finalCode,
      supportTicket: ticketType,
      module,
      slaStatus,
      status,
      eta: parseFloat(eta), // Pastikan formatnya desimal
      assignee,
      description,
      title,
    };

    onSave(payload);
    resetForm();
  };

  const resetForm = () => {
    setCode('');
    setTicketType('');
    setModule('');
    setSlaStatus('WITHIN SLA');
    setStatus('TO DO');
    setEta('');
    setAssignee('');
    setDescription('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Komponen pembantu untuk merender opsi ala Dropdown (Chips)
  const renderChips = (options: string[], selectedValue: string, onSelect: (val: string) => void) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
      {options.map((opt, index) => (
        <TouchableOpacity 
          key={index} 
          style={[styles.chip, selectedValue === opt && styles.chipActive]}
          onPress={() => onSelect(opt)}
        >
          <Text style={[styles.chipText, selectedValue === opt && styles.chipTextActive]}>
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          
          <Text style={styles.modalTitle}>Buat Task Baru</Text>
          
          {/* ScrollView agar form yang panjang tidak terpotong di layar kecil */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollForm}>
            
            {/* <Text style={styles.inputLabel}>CODE (Mandatori) *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Contoh: SR-202607-001"
              value={code}
              onChangeText={setCode}
            /> */}

            <Text style={styles.inputLabel}>Support Ticket (Mandatori) *</Text>
            {renderChips(TICKET_OPTIONS, ticketType, setTicketType)}

            <Text style={styles.inputLabel}>Modul Terkait</Text>
            {renderChips(MODULE_OPTIONS, module, setModule)}

            <Text style={styles.inputLabel}>SLA Status</Text>
            {renderChips(SLA_OPTIONS, slaStatus, setSlaStatus)}

            <Text style={styles.inputLabel}>STATUS</Text>
            {renderChips(STATUS_OPTIONS, status, setStatus)}

            <Text style={styles.inputLabel}>ETA (Jam) (Mandatori) *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Contoh: 8.5"
              value={eta}
              onChangeText={setEta}
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>Assignee / Developer</Text>
            {/* Menggunakan Chips sementara, bisa diubah jadi TextInput jika datanya terlalu banyak */}
            {renderChips(ASSIGNEE_OPTIONS, assignee, setAssignee)}

            <Text style={styles.inputLabel}>Task Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Jelaskan detail task..."
              value={description}
              onChangeText={setDescription}
              multiline={true}
              numberOfLines={4}
            />

            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Masukkan Title"
              value={title}
              onChangeText={setTitle}
            />

          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button title="Batal" color="red" onPress={handleClose} />
            <Button title="Simpan Task" onPress={handleSave} />
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    padding: 20,
    paddingTop: 50, // Memberi jarak dari atas layar
    paddingBottom: 50,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    maxHeight: '100%', // Agar tidak melebihi layar
  },
  scrollForm: {
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1F2937',
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 5,
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  chip: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 13,
    color: '#4B5563',
  },
  chipTextActive: {
    color: '#1D4ED8',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  }
});