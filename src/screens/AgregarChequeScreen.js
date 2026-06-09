import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { colors } from '../theme/colors';
import { crearMedioPago } from '../api/mediosPago';

export default function AgregarChequeScreen({ navigation }) {
  const [bancoEmisor, setBancoEmisor] = useState('');
  const [numeroCheque, setNumeroCheque] = useState('');
  const [monto, setMonto] = useState('');
  const [cargando, setCargando] = useState(false);

  async function handleGuardar() {
    if (!bancoEmisor.trim() || !numeroCheque.trim() || !monto.trim()) {
      Alert.alert('Campos incompletos', 'Completá todos los campos');
      return;
    }
    if (isNaN(Number(monto)) || Number(monto) <= 0) {
      Alert.alert('Monto inválido', 'Ingresá un monto válido');
      return;
    }

    setCargando(true);
    try {
      await crearMedioPago({
        tipo: 'cheque_certificado',
        bancoEmisor,
        numeroCheque,
        monto: Number(monto),
      });
      Alert.alert('¡Listo!', 'Tu cheque fue registrado', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      const mensaje = e.response?.data?.mensaje || 'No se pudo registrar el cheque';
      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>‹ Volver</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>Registrar cheque certificado</Text>
      <Text style={styles.subtitulo}>
        El cheque debe entregarse físicamente antes de la subasta
      </Text>

      <Text style={styles.label}>BANCO EMISOR</Text>
      <TextInput
        style={styles.input}
        placeholder="Banco Ciudad"
        placeholderTextColor={colors.textMuted}
        value={bancoEmisor}
        onChangeText={setBancoEmisor}
      />

      <Text style={styles.label}>NÚMERO DE CHEQUE</Text>
      <TextInput
        style={styles.input}
        placeholder="00045678"
        placeholderTextColor={colors.textMuted}
        value={numeroCheque}
        onChangeText={setNumeroCheque}
        keyboardType="numeric"
      />

      <Text style={styles.label}>MONTO CERTIFICADO</Text>
      <TextInput
        style={styles.input}
        placeholder="50000"
        placeholderTextColor={colors.textMuted}
        value={monto}
        onChangeText={setMonto}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleGuardar} disabled={cargando}>
        {cargando ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.buttonText}>REGISTRAR CHEQUE</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 50 },
  back: { color: colors.gold, fontSize: 16, marginBottom: 16 },
  titulo: { color: colors.textPrimary, fontSize: 22, fontWeight: 'bold' },
  subtitulo: { color: colors.textMuted, fontSize: 13, marginBottom: 8 },
  label: {
    color: colors.textSecondary, fontSize: 11, letterSpacing: 2,
    marginBottom: 8, marginTop: 16,
  },
  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, padding: 14, color: colors.textPrimary, fontSize: 14,
  },
  button: {
    backgroundColor: colors.gold, borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 32,
  },
  buttonText: {
    color: colors.background, fontWeight: 'bold', fontSize: 15, letterSpacing: 2,
  },
});