import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function PerfilScreen({ navigation }) {
  const { usuario, logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigation.getParent()?.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }

  // Primera letra del nombre para el avatar
  const inicial = usuario?.nombre?.charAt(0)?.toUpperCase() || '?';

  // Color del badge según categoría
  const colorCategoria = {
    comun: '#888888',
    especial: '#88aacc',
    plata: '#c0c0c0',
    oro: colors.gold,
    platino: '#e5e4e2',
  }[usuario?.categoria] || colors.gold;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Avatar y nombre */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{inicial}</Text>
        </View>
        <Text style={styles.nombre}>{usuario?.nombre}</Text>

        {/* Badge de categoría */}
        <View style={[styles.categoriaBadge, { borderColor: colorCategoria }]}>
          <Text style={[styles.categoriaText, { color: colorCategoria }]}>
            ⭐ {usuario?.categoria?.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Sección: cuenta */}
      <Text style={styles.seccionTitulo}>MI CUENTA</Text>
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.fila}
          onPress={() => navigation.navigate('MediosPago')}
        >
          <Text style={styles.filaIcono}>💳</Text>
          <Text style={styles.filaTexto}>Mis medios de pago</Text>
          <Text style={styles.filaFlecha}>›</Text>
        </TouchableOpacity>
        <View style={styles.separador} />
        <TouchableOpacity
          style={styles.fila}
          onPress={() => navigation.navigate('Multas')}
        >
          <Text style={styles.filaIcono}>⚠️</Text>
          <Text style={styles.filaTexto}>Mis multas</Text>
          <Text style={styles.filaFlecha}>›</Text>
        </TouchableOpacity>
        <View style={styles.separador} />
        <TouchableOpacity style={styles.fila} onPress={() => Alert.alert('Próximamente', 'Las notificaciones estarán disponibles en la próxima versión.')}>
          <Text style={styles.filaIcono}>🔔</Text>
          <Text style={styles.filaTexto}>Notificaciones</Text>
          <Text style={styles.filaFlecha}>›</Text>
        </TouchableOpacity>
        <View style={styles.separador} />
        <TouchableOpacity style={styles.fila} onPress={() => Alert.alert('Próximamente', 'Mis métricas estará disponible en la próxima versión.')}>
          <Text style={styles.filaIcono}>📊</Text>
          <Text style={styles.filaTexto}>Mis métricas</Text>
          <Text style={styles.filaFlecha}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Sección: ayuda */}
      <Text style={styles.seccionTitulo}>AYUDA</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.fila} onPress={() => Alert.alert('Centro de ayuda', 'Para consultas escribinos a soporte@bidvault.com')}>
          <Text style={styles.filaIcono}>❓</Text>
          <Text style={styles.filaTexto}>Centro de ayuda</Text>
          <Text style={styles.filaFlecha}>›</Text>
        </TouchableOpacity>
        <View style={styles.separador} />
        <TouchableOpacity style={styles.fila} onPress={() => Alert.alert('Términos y condiciones', 'Al usar BidVault aceptás que las subastas son dinámicas ascendentes. El ganador tiene 72hs para presentar los fondos. El incumplimiento genera una multa del 10% y el bloqueo de la cuenta.')}>
          <Text style={styles.filaIcono}>📄</Text>
          <Text style={styles.filaTexto}>Términos y condiciones</Text>
          <Text style={styles.filaFlecha}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Cerrar sesión */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
      </TouchableOpacity>

      <Text style={styles.version}>BidVault v1.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: colors.gold,
    fontSize: 36,
    fontWeight: 'bold',
  },
  nombre: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  categoriaBadge: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  categoriaText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  seccionTitulo: {
    color: colors.textSecondary,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    marginBottom: 24,
    overflow: 'hidden',
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  filaIcono: {
    fontSize: 18,
    marginRight: 14,
  },
  filaTexto: {
    color: colors.textPrimary,
    fontSize: 15,
    flex: 1,
  },
  filaFlecha: {
    color: colors.textMuted,
    fontSize: 22,
  },
  separador: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 48,
  },
  logoutBtn: {
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: colors.error,
    letterSpacing: 1,
    fontWeight: '600',
  },
  version: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
});