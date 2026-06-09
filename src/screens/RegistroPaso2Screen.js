import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator
} from 'react-native';
import { colors } from '../theme/colors';
import { registroPaso2 } from '../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function RegistroPaso2Screen({ route, navigation }) {
  const { usuarioId } = route.params;
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [cargando, setCargando] = useState(false);


    async function handleCrearPassword() {
    // Validaciones
    if (!password.trim() || !passwordConfirm.trim()) {
        Alert.alert('Campos incompletos', 'Completá ambos campos');
        return;
    }
    if (password.length < 6) {
        Alert.alert('Contraseña corta', 'Debe tener al menos 6 caracteres');
        return;
    }
    if (password !== passwordConfirm) {
        Alert.alert('Error', 'Las contraseñas no coinciden');
        return;
    }

    setCargando(true);
    try {
        await registroPaso2(usuarioId, password, passwordConfirm);

        // ✅ ACÁ va — limpiamos el pendiente cuando ya se activó la cuenta
        await AsyncStorage.removeItem('registroPendiente');

        Alert.alert(
        '¡Cuenta activada!',
        'Tu cuenta está lista. Ya podés iniciar sesión.',
        [{ text: 'OK', onPress: () => navigation.replace('Login') }]
        );
    } catch (e) {
        const mensaje = e.response?.data?.mensaje || 'No se pudo activar la cuenta';
        Alert.alert('Error', mensaje);
    } finally {
        setCargando(false);
    }
    }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Crear contraseña</Text>
      <Text style={styles.subtitulo}>Paso 2 de 2 · Activá tu cuenta</Text>

      <Text style={styles.label}>CONTRASEÑA</Text>
      <TextInput
        style={styles.input}
        placeholder="Mínimo 6 caracteres"
        placeholderTextColor={colors.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.label}>CONFIRMAR CONTRASEÑA</Text>
      <TextInput
        style={styles.input}
        placeholder="Repetí la contraseña"
        placeholderTextColor={colors.textMuted}
        value={passwordConfirm}
        onChangeText={setPasswordConfirm}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleCrearPassword}
        disabled={cargando}
      >
        {cargando ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.buttonText}>CREAR CUENTA</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: 'center',
  },
  titulo: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitulo: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 32,
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
});