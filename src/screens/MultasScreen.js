import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import { obtenerMisMultas } from '../api/multas';

export default function MultasScreen({ navigation }) {
  const [multas, setMultas] = useState([]);
  const [bloqueado, setBloqueado] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    try {
      const data = await obtenerMisMultas();
      setMultas(data.multas || []);
      setBloqueado(data.bloqueado || false);
    } catch (e) {
      setMultas([]);
    } finally {
      setCargando(false);
    }
  }

  if (cargando) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>‹ Volver</Text>
      </TouchableOpacity>
      <Text style={styles.titulo}>⚠️ Mis multas</Text>

      {/* Banner de bloqueo */}
      {bloqueado && (
        <View style={styles.bloqueoBox}>
          <Text style={styles.bloqueoIcono}>🚫</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.bloqueoTitulo}>Cuenta bloqueada</Text>
            <Text style={styles.bloqueoTexto}>
              Tu cuenta está bloqueada por no haber presentado los fondos a tiempo.
              Regularizá tus multas para volver a participar en subastas.
            </Text>
          </View>
        </View>
      )}

      {/* Sin multas */}
      {multas.length === 0 && !bloqueado && (
        <View style={styles.vacioCont}>
          <Text style={styles.vacioIcono}>✅</Text>
          <Text style={styles.vacioTitulo}>Sin multas</Text>
          <Text style={styles.vacioTexto}>No tenés multas registradas.</Text>
        </View>
      )}

      {/* Lista de multas */}
      {multas.length > 0 && (
        <>
          <Text style={styles.seccionTitulo}>HISTORIAL DE MULTAS</Text>
          {multas.map((multa, i) => (
            <View key={i} style={styles.multaCard}>
              <View style={styles.multaHeader}>
                <Text style={styles.multaArticulo} numberOfLines={1}>
                  Multa por pago incumplido
                </Text>
                <View style={[
                  styles.estadoBadge,
                  { backgroundColor: multa.pagada ? '#1a3a1a' : '#3a1a1a' },
                ]}>
                  <Text style={[
                    styles.estadoText,
                    { color: multa.pagada ? colors.success : colors.error },
                  ]}>
                    {multa.pagada ? 'PAGADA' : 'PENDIENTE'}
                  </Text>
                </View>
              </View>

              <View style={styles.multaFila}>
                <Text style={styles.multaLabel}>Multa (10% del ofertado)</Text>
                <Text style={[styles.multaValor, { color: colors.error }]}>
                  ${multa.montoMulta?.toLocaleString()}
                </Text>
              </View>
              {multa.fechaVencimiento && (
                <View style={styles.multaFila}>
                  <Text style={styles.multaLabel}>Plazo límite</Text>
                  <Text style={styles.multaValor}>{formatFecha(multa.fechaVencimiento)}</Text>
                </View>
              )}
            </View>
          ))}
        </>
      )}

      {/* Nota legal */}
      <View style={styles.notaBox}>
        <Text style={styles.notaTexto}>
          Según las condiciones de BidVault, si ganás una subasta tenés{' '}
          <Text style={{ color: colors.gold }}>72 horas</Text> para presentar los fondos.
          En caso de incumplimiento se aplica una multa del{' '}
          <Text style={{ color: colors.error }}>10% del valor ofertado</Text> y tu
          cuenta queda bloqueada de otras subastas.
        </Text>
      </View>
    </ScrollView>
  );
}

function formatFecha(str) {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 50 },
  centered: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  back: { color: colors.gold, fontSize: 16, marginBottom: 16 },
  titulo: { color: colors.textPrimary, fontSize: 22, fontWeight: 'bold', marginBottom: 20 },

  bloqueoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: '#2a0a0a', borderWidth: 1, borderColor: colors.error,
    borderRadius: 14, padding: 16, marginBottom: 20,
  },
  bloqueoIcono: { fontSize: 28 },
  bloqueoTitulo: { color: colors.error, fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  bloqueoTexto: { color: '#cc8888', fontSize: 13, lineHeight: 20 },

  vacioCont: { alignItems: 'center', paddingVertical: 60 },
  vacioIcono: { fontSize: 48, marginBottom: 16 },
  vacioTitulo: { color: colors.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  vacioTexto: { color: colors.textSecondary, fontSize: 14 },

  seccionTitulo: {
    color: colors.textSecondary, fontSize: 11, letterSpacing: 2, marginBottom: 12,
  },
  multaCard: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 14, padding: 16, marginBottom: 12,
  },
  multaHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  multaArticulo: { color: colors.textPrimary, fontWeight: '600', fontSize: 14, flex: 1, marginRight: 8 },
  estadoBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  estadoText: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  multaFila: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.border,
  },
  multaLabel: { color: colors.textSecondary, fontSize: 13 },
  multaValor: { color: colors.textPrimary, fontSize: 13, fontWeight: '500' },

  notaBox: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 14, padding: 16, marginTop: 8,
  },
  notaTexto: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
});