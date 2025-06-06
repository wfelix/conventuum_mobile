import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
  PermissionsAndroid,
  Vibration,
} from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import api from './api/useapi';

interface PatientData {
  nome: string;
  data: string;
  horario?: string;
  procedimento?: string;
}

export default function App() {
  const [showScanner, setShowScanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    requestCameraPermission();
    loadApiData();
  }, []);


  const loadApiData = () => {
    api.get('/appointments')
      .then(function (response) {
        console.log('Dados da API:', response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const requestCameraPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Permissão da Câmera',
            message: 'Este app precisa acessar sua câmera para escanear QR codes',
            buttonNeutral: 'Perguntar depois',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          }
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        setHasPermission(true);
      }
    } catch (err) {
      console.warn(err);
      setHasPermission(false);
    }
  };

  const parseQRData = (qrString: string): PatientData | null => {
    try {
      // Tenta parsear como JSON primeiro
      const jsonData = JSON.parse(qrString);
      if (jsonData.nome && jsonData.data) {
        return {
          nome: jsonData.nome,
          data: jsonData.data,
          horario: jsonData.horario || '',
          procedimento: jsonData.procedimento || 'Consulta médica'
        };
      }
    } catch (e) {
      // Se não for JSON, tenta parsear como string delimitada
      const parts = qrString.split('|');
      if (parts.length >= 2) {
        return {
          nome: parts[0] || 'Nome não informado',
          data: parts[1] || new Date().toLocaleDateString('pt-BR'),
          horario: parts[2] || '',
          procedimento: parts[3] || 'Consulta médica'
        };
      }
      
      // Fallback: usa o QR como nome do paciente
      return {
        nome: qrString,
        data: new Date().toLocaleDateString('pt-BR'),
        horario: new Date().toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        procedimento: 'Consulta médica'
      };
    }
    return null;
  };

  const onBarcodeRead = (event: any) => {
    console.log('QR Code lido:', event.nativeEvent.codeStringValue);
    
    const parsedData = parseQRData(event.nativeEvent.codeStringValue);
    
    if (parsedData) {
      Vibration.vibrate(100); // Feedback tátil
      setPatientData(parsedData);
      setShowScanner(false);
      setShowModal(true);
    }
  };

  const openScanner = () => {
    if (hasPermission) {
      setShowScanner(true);
    } else {
      Alert.alert(
        'Permissão Necessária', 
        'Este app precisa de permissão para usar a câmera. Deseja conceder a permissão?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sim', onPress: requestCameraPermission }
        ]
      );
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setPatientData(null);
  };

  const confirmAppointment = () => {
    Alert.alert(
      'Agendamento Confirmado!',
      `Paciente: ${patientData?.nome}\nData: ${patientData?.data}\nHorário: ${patientData?.horario}\nProcedimento: ${patientData?.procedimento}`,
      [
        {
          text: 'OK',
          onPress: () => {
            console.log('Agendamento confirmado para:', patientData);
            closeModal();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Scanner QR Code</Text>
          <Text style={styles.subtitulo}>
            Escaneie o código QR do paciente para confirmar o agendamento
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.scanButton} onPress={openScanner}>
            <Text style={styles.scanButtonText}>📱 Escanear QR Code</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          Equipe Neutrino • Conventuum Mobile
        </Text>
      </View>

      {/* Modal do Scanner */}
      <Modal
        visible={showScanner}
        animationType="slide"
        onRequestClose={() => setShowScanner(false)}
      >
        <View style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitle}>
              Aponte a câmera para o QR Code
            </Text>
            <TouchableOpacity 
              style={styles.closeScanner}
              onPress={() => setShowScanner(false)}
            >
              <Text style={styles.closeScannerText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Camera
            style={styles.camera}
            cameraType={CameraType.Back}
            onReadCode={onBarcodeRead}
            showFrame={true}
            laserColor="red"
            frameColor="white"
          />

          <View style={styles.scannerFooter}>
            <Text style={styles.scannerInstructions}>
              Posicione o QR code dentro do quadro
            </Text>
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmação */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Agendamento</Text>
            
            <View style={styles.patientInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nome do Paciente:</Text>
                <Text style={styles.infoValue}>{patientData?.nome}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Data:</Text>
                <Text style={styles.infoValue}>{patientData?.data}</Text>
              </View>

              {patientData?.horario && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Horário:</Text>
                  <Text style={styles.infoValue}>{patientData.horario}</Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Procedimento:</Text>
                <Text style={styles.infoValue}>{patientData?.procedimento}</Text>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={confirmAppointment}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitulo: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  scanButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 20,
  },
  // Scanner Styles
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  scannerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  closeScanner: {
    padding: 8,
  },
  closeScannerText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
  },
  scannerFooter: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  scannerInstructions: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#1F2937',
  },
  patientInfo: {
    marginBottom: 24,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  confirmButton: {
    backgroundColor: '#10B981',
    elevation: 2,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});