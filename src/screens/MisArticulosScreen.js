import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator
} from 'react-native';
import { colors } from '../theme/colors';
import { misArticulos } from '../api/articulos';

// Config visual de cada estado
const ESTADOS = {
  EN_REVISION:     { label: 'En revisión',    color: colors.warning },
  PRECIO_ASIGNADO: { label: 'Precio asignado', color: colors.gold },
  ACEPTADO:        { label: 'Aceptado',        color: colors.success },
  RECHAZADO:       { label: 'Rechazado',       color: colors.error },
  CANCELADO:       { label: 'Cancelado',       color: colors.textMuted },
  EN_SUBASTA:      { label: 'En subasta',      color: colors.gold },
  VENDIDO:         { label: 'Vendido',         color: colors.success },
};

export default function MisArticulosScreen({ navigation }) {
  const [articulos, setArticulos] = useState([]);
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    setCargando(true);
    try {
      const data = await misArticulos();
      setArticulos(data);
    } catch (e) {
      // lista vacía si falla
    } finally {
      setCargando(false);
    }
  }

  // Recarga cada vez que la pantalla vuelve a estar en foco
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargar);
    return unsubscribe;
  }, [navigation]);

  function renderArticulo({ item }) {
    const estadoConfig = ESTADOS[item.estado] || { label: item.estado, color: colors.textMuted };

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DetalleArticulo', { id: item.productoId })}
      >
        {/* Imagen */}
        {item.fotoPrincipal ? (
          <Image source={{ uri: item.fotoPrincipal }} style={styles.cardImagen} />
        ) : (
          <View style={styles.cardImagen}>
            <Text style={{ fontSize: 24 }}>📦</Text>
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text style={styles.cardNombre} numberOfLines={1}>{item.nombre}</Text>

          {/* Badge de estado */}
          <View style={[styles.badge, { borderColor: estadoConfig.color }]}>
            <Text style={[styles.badgeText, { color: estadoConfig.color }]}>
              {estadoConfig.label}
            </Text>
          </View>

          {/* Precio si ya fue asignado */}
          {item.precioPropuesto != null && (
            <Text style={styles.precio}>Precio: ${item.precioPropuesto}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Mis Artículos</Text>
        <TouchableOpacity
          style={styles.botonPublicar}
          onPress={() => navigation.navigate('PublicarArticulo')}
        >
          <Text style={styles.botonPublicarText}>+ PUBLICAR</Text>
        </TouchableOpacity>
      </View>

      {cargando ? (
        <ActivityIndicator color={colors.gold} size="large" style={{ marginTop: 40 }} />
      ) : articulos.length === 0 ? (
        <View style={styles.vacioBox}>
          <Text style={styles.vacioIcono}>📦</Text>
          <Text style={styles.vacio}>Todavía no publicaste artículos</Text>
          <Text style={styles.vacioSub}>Tocá "Publicar" para subastar algo tuyo</Text>
        </View>
      ) : (
        <FlatList
          data={articulos}
          keyExtractor={(item) => item.productoId.toString()}
          renderItem={renderArticulo}
          contentContainerStyle={{ gap: 12, paddingTop: 12 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 60 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  titulo: { color: colors.textPrimary, fontSize: 24, fontWeight: 'bold' },
  botonPublicar: {
    backgroundColor: colors.gold, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  botonPublicarText: { color: colors.background, fontWeight: 'bold', fontSize: 12 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 14, padding: 14,
  },
  cardImagen: {
    width: 60, height: 60, borderRadius: 10, backgroundColor: '#1a1200',
    alignItems: 'center', justifyContent: 'center',
  },
  cardNombre: { color: colors.textPrimary, fontSize: 15, fontWeight: '600', marginBottom: 6 },
  badge: {
    alignSelf: 'flex-start', borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  precio: { color: colors.gold, fontSize: 13, marginTop: 6 },
  vacioBox: { alignItems: 'center', marginTop: 60 },
  vacioIcono: { fontSize: 48, marginBottom: 16 },
  vacio: { color: colors.textPrimary, fontSize: 16, marginBottom: 6 },
  vacioSub: { color: colors.textMuted, fontSize: 13 },
});