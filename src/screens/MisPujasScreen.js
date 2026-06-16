import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { colors } from '../theme/colors';
import { obtenerMisPujas } from '../api/multas';

export default function MisPujasScreen() {
  const [pujas, setPujas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerMisPujas()
      .then(data => setPujas(data))
      .catch(() => setError('No se pudo cargar el historial.'))
      .finally(() => setLoading(false));
  }, []);

  const renderItem = ({ item }) => {
    const badge = item.remateCerrado
      ? item.gane
        ? { label: '🏆 Ganaste', color: colors.gold }
        : { label: 'Finalizado', color: colors.textMuted }
      : { label: 'En curso', color: '#4CAF50' };

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.nombreArticulo}>
            {item.nombreArticulo || 'Artículo'}
          </Text>
          <View style={[styles.badge, { borderColor: badge.color }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>
              {badge.label}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Subasta</Text>
            <Text style={styles.value}>#{item.subastaId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Artículo ID</Text>
            <Text style={styles.value}>#{item.itemId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Monto ofertado</Text>
            <Text style={[styles.value, styles.monto]}>
              ${Number(item.montoOfertado).toLocaleString('es-AR')}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Mis Pujas</Text>

      {pujas.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Todavía no participaste en ninguna subasta.</Text>
        </View>
      ) : (
        <FlatList
          data={pujas}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    paddingTop: 60,
  },
  titulo: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222222',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nombreArticulo: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 13,
  },
  monto: {
    color: colors.gold,
    fontWeight: '700',
    fontSize: 15,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
});
