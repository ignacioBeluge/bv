import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { colors } from '../theme/colors';
import { crearMedioPago } from '../api/mediosPago';

export default function AgregarCuentaScreen({ navigation }) {
  const [banco, setBanco] = useState('');
  const [cbu, setCbu] = useState('');
  const [alias, setAlias] = useState('');
  const [titular, setTitular] = useState('');
  const [cargando, setCargando] = useState(false);

  async function handleGuardar() {
    if (!banco.trim() || !cbu.trim() || !titular.trim()) {
      Alert.alert('Campos incompletos', 'Completá banco, CBU y titular');
      return;
    }
    if (cbu.length !== 22) {
      Alert.alert('CBU inválido', 'El CBU debe tener 22 dígitos');
      return;
    }

    setCargando(true);
    try {
      await crearMedioPago({
        tipo: 'cuenta_bancaria',
        banco,
        cbu,
        alias,
        titular,
        esInternacional: false,
        moneda: 'ARS',
      });
      Alert.alert('¡Listo!', 'Tu cuenta fue registrada', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      const mensaje = e.response?.data?.mensaje || 'No se pudo registrar la cuenta';
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

      <Text style={styles.titulo}>Agregar cuenta bancaria</Text>

      <Text style={styles.label}>BANCO</Text>
      <TextInput
        style={styles.input}
        placeholder="Banco Nación"
        placeholderTextColor={colors.textMuted}
        value={banco}
        onChangeText={setBanco}
      />

      <Text style={styles.label}>CBU (22 dígitos)</Text>
      <TextInput
        style={styles.input}
        placeholder="0110599520059900236215"
        placeholderTextColor={colors.textMuted}
        value={cbu}
        onChangeText={setCbu}
        keyboardType="numeric"
        maxLength={22}
      />

      <Text style={styles.label}>ALIAS (opcional)</Text>
      <TextInput
        style={styles.input}
        placeholder="mi.alias.banco"
        placeholderTextColor={colors.textMuted}
        value={alias}
        onChangeText={setAlias}
        autoCapitalize="none"
      />

      <Text style={styles.label}>TITULAR</Text>
      <TextInput
        style={styles.input}
        placeholder="Juan García"
        placeholderTextColor={colors.textMuted}
        value={titular}
        onChangeText={setTitular}
      />

      <TouchableOpacity style={styles.button} onPress={handleGuardar} disabled={cargando}>
        {cargando ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.buttonText}>GUARDAR CUENTA</Text>
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
  button: {
    backgroundColor: colors.gold, borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 32,
  },
  buttonText: {
    color: colors.background, fontWeight: 'bold', fontSize: 15, letterSpacing: 2,
  },
});