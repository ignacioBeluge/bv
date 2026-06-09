import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { colors } from '../theme/colors';
import { registroPaso1 } from '../api/auth';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function RegistroPaso1Screen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [documento, setDocumento] = useState('');
  const [direccion, setDireccion] = useState('');
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(false);
  const [numeroPais, setNumeroPais] = useState(null);
  const [fotoFrente, setFotoFrente] = useState(null);
  const [fotoDorso, setFotoDorso] = useState(null);

  // Pide permiso a la cámara y saca una foto
  async function tomarFoto(lado) {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara');
      return;
    }
    const resultado = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.3,          // más comprimido = menos memoria
      allowsEditing: false,  // sin recorte = no crashea
    });
    if (!resultado.canceled) {
      if (lado === 'frente') setFotoFrente(resultado.assets[0]);
      else setFotoDorso(resultado.assets[0]);
    }
  }

  async function handleRegistro() {
    // Validación de campos obligatorios
    if (!nombre.trim() || !documento.trim() || !direccion.trim() || !email.trim()) {
      Alert.alert('Campos incompletos', 'Completá todos los campos');
      return;
    }
    if (!numeroPais) {
    Alert.alert('Falta el país', 'Seleccioná tu país');
    return;
    }

    setCargando(true);
    try {
      const datos = {
        nombre,
        documento,
        direccion,
        email,
        numeroPais: numeroPais,                  
        fotoDniFrente: fotoFrente?.base64 || null,
        fotoDniDorso: fotoDorso?.base64 || null,
      };
      const resultado = await registroPaso1(datos);

      // Guardamos el id pendiente para poder recuperarlo si cierra la app
      await AsyncStorage.setItem('registroPendiente', resultado.usuarioId.toString());

      // Navega a la pantalla de "cuenta en revisión" pasando el usuarioId
      navigation.replace('CuentaEnRevision', {
        usuarioId: resultado.usuarioId,
        mensaje: resultado.mensaje,
      });
    } catch (e) {
      const mensaje = e.response?.data?.mensaje || 'No se pudo crear la cuenta';
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

      <Text style={styles.titulo}>Crear cuenta</Text>
      <Text style={styles.subtitulo}>Paso 1 de 2 · Datos personales</Text>

      <Text style={styles.label}>NOMBRE COMPLETO</Text>
      <TextInput
        style={styles.input}
        placeholder="María López"
        placeholderTextColor={colors.textMuted}
        value={nombre}
        onChangeText={setNombre}
      />

      <Text style={styles.label}>DOCUMENTO</Text>
      <TextInput
        style={styles.input}
        placeholder="30123456"
        placeholderTextColor={colors.textMuted}
        value={documento}
        onChangeText={setDocumento}
        keyboardType="numeric"
      />

      <Text style={styles.label}>DIRECCIÓN</Text>
      <TextInput
        style={styles.input}
        placeholder="Av. Santa Fe 2000, CABA"
        placeholderTextColor={colors.textMuted}
        value={direccion}
        onChangeText={setDireccion}
      />

      <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
      <TextInput
        style={styles.input}
        placeholder="maria.lopez@email.com"
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.label}>PAÍS</Text>
        <View style={styles.paisRow}>
        {[
            { numero: 1, nombre: 'Argentina' },
            { numero: 2, nombre: 'Uruguay' },
            { numero: 3, nombre: 'Chile' },
        ].map((pais) => (
            <TouchableOpacity
            key={pais.numero}
            style={[
                styles.paisChip,
                numeroPais === pais.numero && styles.paisChipActivo,
            ]}
            onPress={() => setNumeroPais(pais.numero)}
            >
            <Text style={[
                styles.paisChipText,
                numeroPais === pais.numero && styles.paisChipTextActivo,
            ]}>
                {pais.nombre}
            </Text>
            </TouchableOpacity>
        ))}
        </View>

      {/* Foto DNI — abre la cámara al tocar */}
      <Text style={styles.label}>FOTO DEL DNI</Text>
        <View style={styles.fotosRow}>
        <TouchableOpacity style={styles.fotoBox} onPress={() => tomarFoto('frente')}>
            <Text style={styles.fotoTexto}>
            {fotoFrente ? '✅ Frente' : '📷 Frente'}
            </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fotoBox} onPress={() => tomarFoto('dorso')}>
            <Text style={styles.fotoTexto}>
            {fotoDorso ? '✅ Dorso' : '📷 Dorso'}
            </Text>
        </TouchableOpacity>
        </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegistro}
        disabled={cargando}
      >
        {cargando ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.buttonText}>CONTINUAR</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    paddingTop: 50,
  },
  back: { color: colors.gold, fontSize: 16, marginBottom: 16 },
  titulo: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitulo: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 24,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    color: colors.textPrimary,
    fontSize: 14,
  },
  fotoPlaceholder: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
    marginTop: 4,
  },
  fotoTexto: { color: colors.textSecondary, fontSize: 14 },
  fotoNota: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  button: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 2,
  },
  paisRow: {
  flexDirection: 'row',
  gap: 8,
  marginTop: 4,
},
paisChip: {
  flex: 1,
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 10,
  padding: 12,
  alignItems: 'center',
},
paisChipActivo: {
  borderColor: colors.gold,
  backgroundColor: 'rgba(201,168,76,0.1)',
},
paisChipText: { color: colors.textSecondary, fontSize: 13 },
paisChipTextActivo: { color: colors.gold, fontWeight: 'bold' },
fotosRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
fotoBox: {
  flex: 1,
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  borderStyle: 'dashed',
  borderRadius: 10,
  padding: 24,
  alignItems: 'center',
},
});