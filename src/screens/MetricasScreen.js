import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator
} from 'react-native';
import { colors } from '../theme/colors';
import { obtenerMetricas } from '../api/metricas';

export default function MetricasScreen({ navigation }) {
  const [metricas, setMetricas] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerMetricas()
      .then(setMetricas)
      .catch(() => setMetricas(null))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  if (!metricas) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No se pudieron cargar las métricas</Text>
      </View>
    );
  }

  // Porcentaje de efectividad (pujas que terminaron en victoria)
  const efectividad = metricas.totalPujasRealizadas > 0
    ? Math.round((metricas.vecesGano / metricas.totalPujasRealizadas) * 100)
    : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>‹ Volver</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>📊 Mis métricas</Text>
      <Text style={styles.subtitulo}>Tu actividad en BidVault</Text>

      {/* Destacado: veces que ganó */}
      <View style={styles.destacadoBox}>
        <Text style={styles.destacadoNumero}>{metricas.vecesGano}</Text>
        <Text style={styles.destacadoLabel}>
          {metricas.vecesGano === 1 ? 'Subasta ganada' : 'Subastas ganadas'}
        </Text>
        {metricas.totalPujasRealizadas > 0 && (
          <Text style={styles.destacadoSub}>
            {efectividad}% de efectividad en tus pujas
          </Text>
        )}
      </View>

      {/* Grid de métricas */}
      <View style={styles.grid}>
        <MetricaCard
          icono="🔨"
          valor={metricas.subastasParticipadas}
          label="Subastas en las que participaste"
        />
        <MetricaCard
          icono="✋"
          valor={metricas.totalPujasRealizadas}
          label="Pujas realizadas"
        />
      </View>

      <View style={styles.grid}>
        <MetricaCard
          icono="💰"
          valor={`$${Number(metricas.totalOfertado).toLocaleString('es-AR')}`}
          label="Total ofertado"
          ancho
        />
      </View>

      <View style={styles.grid}>
        <MetricaCard
          icono="✅"
          valor={`$${Number(metricas.totalPagado).toLocaleString('es-AR')}`}
          label="Total pagado"
        />
        <MetricaCard
          icono="⏳"
          valor={metricas.comprasPendientes}
          label="Compras pendientes de pago"
        />
      </View>

      {/* Multas — solo si tiene */}
      {metricas.cantidadMultas > 0 && (
        <View style={styles.multaBox}>
          <Text style={styles.multaIcono}>⚠️</Text>
          <Text style={styles.multaTexto}>
            Tenés {metricas.cantidadMultas} {metricas.cantidadMultas === 1 ? 'multa' : 'multas'} registrada{metricas.cantidadMultas === 1 ? '' : 's'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

// Card individual de una métrica
function MetricaCard({ icono, valor, label, ancho }) {
  return (
    <View style={[styles.card, ancho && { flex: 1 }]}>
      <Text style={styles.cardIcono}>{icono}</Text>
      <Text style={styles.cardValor}>{valor}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 50 },
  centered: {
    flex: 1, backgroundColor: colors.background,
    justifyContent: 'center', alignItems: 'center',
  },
  back: { color: colors.gold, fontSize: 16, marginBottom: 16 },
  titulo: { color: colors.textPrimary, fontSize: 22, fontWeight: 'bold' },
  subtitulo: { color: colors.textMuted, fontSize: 13, marginTop: 4, marginBottom: 20 },
  errorText: { color: colors.textMuted, fontSize: 14 },

  destacadoBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  destacadoNumero: { color: colors.gold, fontSize: 42, fontWeight: 'bold' },
  destacadoLabel: { color: colors.textPrimary, fontSize: 14, marginTop: 4 },
  destacadoSub: { color: colors.textMuted, fontSize: 12, marginTop: 8 },

  grid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  cardIcono: { fontSize: 22, marginBottom: 8 },
  cardValor: { color: colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
  cardLabel: {
    color: colors.textSecondary, fontSize: 11, textAlign: 'center', marginTop: 4,
  },

  multaBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#2a0a0a', borderWidth: 1, borderColor: colors.error,
    borderRadius: 14, padding: 16, marginTop: 8,
  },
  multaIcono: { fontSize: 20 },
  multaTexto: { color: '#cc8888', fontSize: 13, flex: 1 },
});