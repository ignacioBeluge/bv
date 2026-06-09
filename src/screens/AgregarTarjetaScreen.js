import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { colors } from '../theme/colors';
import { crearMedioPago } from '../api/mediosPago';

export default function AgregarTarjetaScreen({ navigation }) {
  const [numero, setNumero] = useState('');
  const [titular, setTitular] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [marca, setMarca] = useState('VISA');
  const [cargando, setCargando] = useState(false);

  async function handleGuardar() {
    // Validaciones
    if (!numero.trim() || !titular.trim() || !vencimiento.trim()) {
      Alert.alert('Campos incompletos', 'Completá todos los campos');
      return;
    }
    if (numero.replace(/\s/g, '').length < 4) {
      Alert.alert('Tarjeta inválida', 'El número de tarjeta es muy corto');
      return;
    }

    setCargando(true);
    try {
      await crearMedioPago({
        tipo: 'tarjeta',
        numeroTarjeta: numero.replace(/\s/g, ''),
        marca,
        titular,
        vencimiento,
        esInternacional: false,
        moneda: 'ARS',
      });
      Alert.alert('¡Listo!', 'Tu tarjeta fue registrada', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      const mensaje = e.response?.data?.mensaje || 'No se pudo registrar la tarjeta';
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

      <Text style={styles.titulo}>Agregar tarjeta</Text>

      <Text style={styles.label}>NÚMERO DE TARJETA</Text>
      <TextInput
        style={styles.input}
        placeholder="4521 8834 0012 4521"
        placeholderTextColor={colors.textMuted}
        value={numero}
        onChangeText={setNumero}
        keyboardType="numeric"
        maxLength={19}
      />

      <Text style={styles.label}>NOMBRE DEL TITULAR</Text>
      <TextInput
        style={styles.input}
        placeholder="Juan García"
        placeholderTextColor={colors.textMuted}
        value={titular}
        onChangeText={setTitular}
      />

      <Text style={styles.label}>VENCIMIENTO (MM/AA)</Text>
      <TextInput
        style={styles.input}
        placeholder="12/28"
        placeholderTextColor={colors.textMuted}
        value={vencimiento}
        onChangeText={setVencimiento}
        maxLength={5}
      />

      <Text style={styles.label}>MARCA</Text>
      <View style={styles.marcasRow}>
        {['VISA', 'MASTERCARD', 'AMEX'].map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.marcaChip, marca === m && styles.marcaChipActivo]}
            onPress={() => setMarca(m)}
          >
            <Text style={[styles.marcaText, marca === m && styles.marcaTextActivo]}>
              {m}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleGuardar}
        disabled={cargando}
      >
        {cargando ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.buttonText}>GUARDAR TARJETA</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 50 },
  back: { color: colors.gold, fontSize: 16, marginBottom: 16 },
  titulo: { color: colors.textPrimary, fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  label: {
    color: colors.textSecondary, fontSize: 11, letterSpacing: 2,
    marginBottom: 8, marginTop: 16,
  },
  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, padding: 14, color: colors.textPrimary, fontSize: 14,
  },
  marcasRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  marcaChip: {
    flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, padding: 12, alignItems: 'center',
  },
  marcaChipActivo: { borderColor: colors.gold, backgroundColor: 'rgba(201,168,76,0.1)' },
  marcaText: { color: colors.textSecondary, fontSize: 12 },
  marcaTextActivo: { color: colors.gold, fontWeight: 'bold' },
  button: {
    backgroundColor: colors.gold, borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 32,
  },
  buttonText: {
    color: colors.background, fontWeight: 'bold', fontSize: 15, letterSpacing: 2,
  },
});