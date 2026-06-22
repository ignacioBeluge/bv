import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Image, Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { obtenerMisPujas, obtenerMisCompras, pagarCompra } from '../api/multas';

export default function MisPujasScreen() {
  const [tab, setTab] = useState('pujas');   // 'pujas' | 'compras'

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Mi actividad</Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'pujas' && styles.tabActivo]}
          onPress={() => setTab('pujas')}
        >
          <Text style={[styles.tabText, tab === 'pujas' && styles.tabTextActivo]}>
            Mis Pujas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'compras' && styles.tabActivo]}
          onPress={() => setTab('compras')}
        >
          <Text style={[styles.tabText, tab === 'compras' && styles.tabTextActivo]}>
            Mis Compras
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'pujas' ? <TabPujas /> : <TabCompras />}
    </View>
  );
}

// ─────────────── TAB MIS PUJAS ───────────────
function TabPujas() {
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
          <Text style={styles.nombreArticulo}>{item.nombreArticulo || 'Artículo'}</Text>
          <View style={[styles.badge, { borderColor: badge.color }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Subasta</Text>
            <Text style={styles.value}>#{item.subastaId}</Text>
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

  if (loading) return <View style={styles.centered}><ActivityIndicator color={colors.gold} size="large" /></View>;
  if (error) return <View style={styles.centered}><Text style={styles.errorText}>{error}</Text></View>;

  return pujas.length === 0 ? (
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
  );
}

// ─────────────── TAB MIS COMPRAS ───────────────
function TabCompras() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerMisCompras()
      .then(data => setCompras(data))
      .catch(() => setCompras([]))
      .finally(() => setLoading(false));
  }, []);

  // Paga una compra y recarga la lista
  async function handlePagar(compraId) {
    try {
      const resultado = await pagarCompra(compraId);
      Alert.alert(
        resultado.pagado ? '¡Pago exitoso!' : 'No se pudo pagar',
        resultado.mensaje,
        [{ text: 'OK' }]
      );
      const data = await obtenerMisCompras();
      setCompras(data);
    } catch (e) {
      const mensaje = e.response?.data?.mensaje || 'No se pudo procesar el pago';
      Alert.alert('Error', mensaje);
    }
  }

  // Config visual del estado de pago
  const ESTADO_PAGO = {
    PENDIENTE: { label: 'Pago pendiente', color: colors.warning },
    PAGADO: { label: 'Pagado', color: colors.success },
    VENCIDO: { label: 'Vencido', color: colors.error },
  };

  const renderItem = ({ item }) => {
    const estado = ESTADO_PAGO[item.estado] || { label: item.estado, color: colors.textMuted };

    return (
      <View style={styles.card}>
        <View style={styles.compraHeader}>
          {item.fotoPrincipal ? (
            <Image source={{ uri: item.fotoPrincipal }} style={styles.compraFoto} />
          ) : (
            <View style={styles.compraFoto}><Text style={{ fontSize: 20 }}>📦</Text></View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.nombreArticulo}>{item.nombreArticulo || 'Artículo'}</Text>
            <View style={[styles.badge, { borderColor: estado.color, alignSelf: 'flex-start', marginTop: 6 }]}>
              <Text style={[styles.badgeText, { color: estado.color }]}>{estado.label}</Text>
            </View>
          </View>
        </View>

        {/* Detalle de pago */}
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Monto pujado</Text>
            <Text style={styles.value}>${Number(item.montoPujado).toLocaleString('es-AR')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Comisiones</Text>
            <Text style={styles.value}>${Number(item.comision).toLocaleString('es-AR')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Envío</Text>
            <Text style={styles.value}>${Number(item.envio).toLocaleString('es-AR')}</Text>
          </View>
          <View style={[styles.infoRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>TOTAL A PAGAR</Text>
            <Text style={styles.totalValor}>${Number(item.montoTotal).toLocaleString('es-AR')}</Text>
          </View>
        </View>

        {/* Botón pagar — solo si está pendiente */}
        {item.estado === 'PENDIENTE' && (
          <TouchableOpacity
            style={styles.botonPagar}
            onPress={() => handlePagar(item.id)}
          >
            <Text style={styles.botonPagarText}>
              PAGAR ${Number(item.montoTotal).toLocaleString('es-AR')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator color={colors.gold} size="large" /></View>;

  return compras.length === 0 ? (
    <View style={styles.centered}>
      <Text style={styles.emptyText}>Todavía no ganaste ninguna subasta.</Text>
    </View>
  ) : (
    <FlatList
      data={compras}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 60 },
  titulo: { color: colors.textPrimary, fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  tabs: { flexDirection: 'row', marginBottom: 20, gap: 8 },
  tab: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    borderRadius: 10, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  tabActivo: { backgroundColor: colors.gold, borderColor: colors.gold },
  tabText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
  tabTextActivo: { color: colors.background },
  card: {
    backgroundColor: '#111111', borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#222222',
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  compraHeader: { flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'center' },
  compraFoto: {
    width: 54, height: 54, borderRadius: 10, backgroundColor: '#1a1200',
    alignItems: 'center', justifyContent: 'center',
  },
  nombreArticulo: { color: colors.textPrimary, fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  badge: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  cardBody: { gap: 6 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: colors.textMuted, fontSize: 13 },
  value: { color: colors.textPrimary, fontSize: 13 },
  monto: { color: colors.gold, fontWeight: '700', fontSize: 15 },
  totalRow: {
    marginTop: 8, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  totalLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', letterSpacing: 1 },
  totalValor: { color: colors.gold, fontSize: 16, fontWeight: 'bold' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
  errorText: { color: '#ef4444', fontSize: 14 },
  botonPagar: {
    backgroundColor: colors.gold,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  botonPagarText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
});