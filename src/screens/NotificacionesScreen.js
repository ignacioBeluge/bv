import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator
} from 'react-native';
import { colors } from '../theme/colors';
import { obtenerNotificaciones, marcarLeida, marcarTodasLeidas } from '../api/notificaciones';

// Ícono según el tipo de notificación
const ICONOS = {
  subasta_ganada: '🏆',
  puja_superada: '📉',
  puja_confirmada: '✅',
  fondos_pendientes: '💰',
  penalidad_aplicada: '⚠️',
  articulo_aprobado: '📦',
  articulo_rechazado: '❌',
  seguro_por_vencer: '🛡️',
  subasta_por_iniciar: '🔔',
};

export default function NotificacionesScreen({ navigation }) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    setCargando(true);
    try {
      const data = await obtenerNotificaciones();
      setNotificaciones(data);
    } catch (e) {
      setNotificaciones([]);
    } finally {
      setCargando(false);
    }
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargar);
    return unsubscribe;
  }, [navigation]);

  // Al tocar una notificación: marcarla leída y navegar si corresponde
  async function abrirNotificacion(notif) {
    if (!notif.leida) {
      try {
        await marcarLeida(notif.id);
        // Actualizar en la lista local
        setNotificaciones((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, leida: true } : n))
        );
      } catch (e) {
        // si falla, igual seguimos
      }
    }

    // Navegar al destino si tiene uno
    if (notif.destinoNavegacion === 'resumen_compra') {
      // Por ahora solo mostramos el detalle. Si tenés ResumenCompra, navegás ahí.
      // navigation.navigate('ResumenCompra', { ... });
    }
  }

  async function handleMarcarTodas() {
    try {
      await marcarTodasLeidas();
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch (e) {
      // si falla, no pasa nada
    }
  }

  function renderNotif({ item }) {
    return (
      <TouchableOpacity
        style={[styles.card, !item.leida && styles.cardNoLeida]}
        onPress={() => abrirNotificacion(item)}
      >
        <Text style={styles.icono}>{ICONOS[item.tipo] || '🔔'}</Text>
        <View style={{ flex: 1 }}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitulo}>{item.titulo}</Text>
            {!item.leida && <View style={styles.dot} />}
          </View>
          <Text style={styles.cardMensaje} numberOfLines={3}>{item.mensaje}</Text>
          <Text style={styles.cardFecha}>{formatFecha(item.fechaCreacion)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Volver</Text>
        </TouchableOpacity>
        {notificaciones.some((n) => !n.leida) && (
          <TouchableOpacity onPress={handleMarcarTodas}>
            <Text style={styles.marcarTodas}>Marcar todas</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.titulo}>Notificaciones</Text>

      {cargando ? (
        <ActivityIndicator color={colors.gold} size="large" style={{ marginTop: 40 }} />
      ) : notificaciones.length === 0 ? (
        <View style={styles.vacioBox}>
          <Text style={styles.vacioIcono}>🔔</Text>
          <Text style={styles.vacio}>No tenés notificaciones</Text>
        </View>
      ) : (
        <FlatList
          data={notificaciones}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNotif}
          contentContainerStyle={{ gap: 10, paddingTop: 12 }}
        />
      )}
    </View>
  );
}

function formatFecha(str) {
  if (!str) return '';
  const d = new Date(str);
  return d.toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  back: { color: colors.gold, fontSize: 16 },
  marcarTodas: { color: colors.gold, fontSize: 13 },
  titulo: { color: colors.textPrimary, fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  card: {
    flexDirection: 'row', gap: 14,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 14, padding: 16,
  },
  cardNoLeida: { borderColor: 'rgba(201,168,76,0.4)', backgroundColor: 'rgba(201,168,76,0.05)' },
  icono: { fontSize: 24 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitulo: { color: colors.textPrimary, fontSize: 15, fontWeight: '600', flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold, marginLeft: 8 },
  cardMensaje: { color: colors.textSecondary, fontSize: 13, marginTop: 4, lineHeight: 19 },
  cardFecha: { color: colors.textMuted, fontSize: 11, marginTop: 8 },
  vacioBox: { alignItems: 'center', marginTop: 60 },
  vacioIcono: { fontSize: 48, marginBottom: 16 },
  vacio: { color: colors.textMuted, fontSize: 15 },
});