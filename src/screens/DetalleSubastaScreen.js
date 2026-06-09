import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView
} from 'react-native';
import { colors } from '../theme/colors';
import { obtenerSubasta } from '../api/subastas';

export default function DetalleSubastaScreen({ route, navigation }) {
  const { id } = route.params;
  const [subasta, setSubasta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  async function cargarDetalle() {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerSubasta(id);
      setSubasta(data);
    } catch (e) {
      setError('No se pudo cargar el detalle de la subasta');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDetalle();
  }, []);

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={cargarDetalle}>
          <Text style={styles.retryText}>REINTENTAR</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cantidadItems = subasta.items ? subasta.items.length : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>‹ Volver</Text>
      </TouchableOpacity>

      {/* Badge categoría + estado en vivo */}
      <View style={styles.badgesRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{subasta.categoria?.toUpperCase()}</Text>
        </View>
        {subasta.estado === 'abierta' && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>EN VIVO</Text>
          </View>
        )}
      </View>

      <Text style={styles.titulo}>{subasta.ubicacion}</Text>
      <Text style={styles.info}>📅 {subasta.fecha} · {subasta.hora}</Text>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumero}>{cantidadItems}</Text>
          <Text style={styles.statLabel}>Lotes</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumero}>{subasta.capacidadAsistentes}</Text>
          <Text style={styles.statLabel}>Capacidad</Text>
        </View>
      </View>

      {/* Botón 1: Ver catálogo */}
      <TouchableOpacity
        style={styles.botonSecundario}
        onPress={() => navigation.navigate('Catalogo', { subastaId: id })}
      >
        <Text style={styles.botonSecundarioText}>VER CATÁLOGO COMPLETO →</Text>
      </TouchableOpacity>

      {/* Botón 2: Conectarse en vivo */}
      <TouchableOpacity
        style={styles.botonPrimario}
        onPress={() => {
          // Si tiene ítems, va a pujar por el primero. En real elegiría cuál.
          if (cantidadItems > 0) {
            navigation.navigate('Puja', {
              subastaId: id,
              itemId: subasta.items[0].id,
              descripcion: subasta.items[0].descripcion,
            });
          }
        }}
      >
        <Text style={styles.botonPrimarioText}>⚡ CONECTARSE A LA SUBASTA</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 50 },
  center: {
    flex: 1, backgroundColor: colors.background,
    justifyContent: 'center', alignItems: 'center',
  },
  back: { color: colors.gold, fontSize: 16, marginBottom: 16 },
  badgesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  badge: {
    backgroundColor: colors.gold, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  badgeText: { color: colors.background, fontSize: 10, fontWeight: 'bold' },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,68,68,0.15)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  liveDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.error, marginRight: 6,
  },
  liveText: { color: colors.error, fontSize: 10, fontWeight: 'bold' },
  titulo: { color: colors.textPrimary, fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  info: { color: colors.textSecondary, fontSize: 13, marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statBox: {
    flex: 1, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: 16, alignItems: 'center',
  },
  statNumero: { color: colors.gold, fontSize: 24, fontWeight: 'bold' },
  statLabel: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  botonSecundario: {
    borderWidth: 1, borderColor: colors.gold,
    borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12,
  },
  botonSecundarioText: { color: colors.gold, fontSize: 13, letterSpacing: 1 },
  botonPrimario: {
    backgroundColor: colors.gold, borderRadius: 12,
    padding: 18, alignItems: 'center',
  },
  botonPrimarioText: {
    color: colors.background, fontWeight: 'bold', fontSize: 15, letterSpacing: 1,
  },
  errorText: { color: colors.error, marginBottom: 16 },
  retryButton: {
    borderWidth: 1, borderColor: colors.gold,
    borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12,
  },
  retryText: { color: colors.gold, letterSpacing: 1 },
});