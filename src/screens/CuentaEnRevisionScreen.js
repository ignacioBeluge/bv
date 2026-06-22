import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { colors } from '../theme/colors';
import { consultarEstadoRegistro } from '../api/auth';

export default function CuentaEnRevisionScreen({ route, navigation }) {
  const { usuarioId, mensaje } = route.params;
  const [verificando, setVerificando] = useState(false);

  // Consulta al backend si la cuenta ya fue aprobada
  async function verificarAprobacion() {
    setVerificando(true);
    try {
      const estado = await consultarEstadoRegistro(usuarioId);
      if (estado.aprobado) {
        // Aprobado → ir al paso 2 para crear contraseña
        navigation.replace('RegistroPaso2', { usuarioId });
      } else {
        Alert.alert(
          'Todavía en revisión',
          'Tu cuenta aún no fue aprobada. Probá de nuevo en un rato.'
        );
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo verificar el estado de tu cuenta');
    } finally {
      setVerificando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icono}>⏳</Text>
      <Text style={styles.titulo}>Cuenta en revisión</Text>
      <Text style={styles.mensaje}>{mensaje}</Text>

      <View style={styles.notaBox}>
        <Text style={styles.notaTitulo}>¿Qué sigue?</Text>
        <Text style={styles.notaTexto}>
          La empresa va a revisar tus datos y la foto de tu DNI. Cuando tu cuenta
          sea aprobada, vas a poder crear tu contraseña y empezar a usar la app.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={verificarAprobacion}
        disabled={verificando}
      >
        {verificando ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.buttonText}>VERIFICAR SI FUI APROBADO</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.replace('Login')}>
        <Text style={styles.volverLogin}>Volver al login</Text>
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
    alignItems: 'center',
  },
  icono: { fontSize: 56, marginBottom: 20 },
  titulo: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  mensaje: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  notaBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  notaTitulo: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  idGrande: {
    color: colors.gold,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  notaTexto: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  buttonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  volverLogin: {
    color: colors.textMuted,
    fontSize: 13,
  },
});