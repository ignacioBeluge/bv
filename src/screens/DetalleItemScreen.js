import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator
} from 'react-native';
import { colors } from '../theme/colors';
import { obtenerDetalleItem } from '../api/subastas';

export default function DetalleItemScreen({ route, navigation }) {
  const { subastaId, itemId } = route.params;
  const [item, setItem] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  async function cargarItem() {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerDetalleItem(subastaId, itemId);
      setItem(data);
    } catch (e) {
      setError('No se pudo cargar el ítem');
    } finally {
      setCargando(false);
    }
    const data = await obtenerDetalleItem(subastaId, itemId);
    console.log('FOTOS RECIBIDAS:', data.fotos?.length);
    console.log('ITEM ID:', data.id, 'PRODUCTO:', data.producto);
    setItem(data);
  }

  useEffect(() => {
    cargarItem();
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
        <TouchableOpacity style={styles.retryButton} onPress={cargarItem}>
          <Text style={styles.retryText}>REINTENTAR</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tieneFotos = item.fotos && item.fotos.length > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>‹ Volver</Text>
      </TouchableOpacity>

      {/* Carrusel de fotos */}
{tieneFotos ? (
  <ScrollView
    horizontal
    pagingEnabled
    showsHorizontalScrollIndicator={false}
    style={styles.carrusel}
  >
    {item.fotos.map((foto, index) => (
      <Image
        key={index}
        source={{ uri: foto }}
        style={styles.foto}
        resizeMode="cover"
      />
    ))}
  </ScrollView>
) : (
  <View style={styles.fotoPlaceholder}>
    <Text style={styles.fotoPlaceholderIcono}>🏺</Text>
    <Text style={styles.fotoPlaceholderText}>Sin fotos disponibles</Text>
  </View>
)}

      {/* Indicador de cantidad de fotos */}
      {tieneFotos && (
        <Text style={styles.fotosCount}>{item.fotos.length} fotos</Text>
      )}

      {/* Info del ítem */}
      <Text style={styles.nombre}>{item.descripcionCatalogo}</Text>
      <Text style={styles.precioBase}>Base: ${item.precioBase}</Text>

      {item.mejorOfertaActual != null && (
        <View style={styles.ofertaBox}>
          <Text style={styles.ofertaLabel}>MEJOR OFERTA ACTUAL</Text>
          <Text style={styles.ofertaValor}>${item.mejorOfertaActual}</Text>
        </View>
      )}

      {/* Descripción completa */}
      <Text style={styles.seccion}>DESCRIPCIÓN</Text>
      <Text style={styles.descripcion}>{item.descripcionCompleta}</Text>
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
  carrusel: { height: 240, borderRadius: 14 },
  foto: { width: 320, height: 240, borderRadius: 14, marginRight: 10 },
  fotoPlaceholder: {
    height: 240, backgroundColor: '#1a1200', borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  fotoPlaceholderIcono: { fontSize: 64 },
  fotoPlaceholderText: { color: colors.textMuted, marginTop: 12 },
  fotosCount: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 8 },
  nombre: { color: colors.textPrimary, fontSize: 22, fontWeight: 'bold', marginTop: 16 },
  precioBase: { color: colors.gold, fontSize: 18, fontWeight: '600', marginTop: 8 },
  ofertaBox: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16,
  },
  ofertaLabel: { color: colors.textSecondary, fontSize: 10, letterSpacing: 1 },
  ofertaValor: { color: colors.gold, fontSize: 24, fontWeight: 'bold', marginTop: 4 },
  seccion: {
    color: colors.textSecondary, fontSize: 11, letterSpacing: 2,
    marginTop: 24, marginBottom: 8,
  },
  descripcion: { color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
  botonPujar: {
    backgroundColor: colors.gold, borderRadius: 12,
    padding: 18, alignItems: 'center', marginTop: 28,
  },
  botonPujarText: {
    color: colors.background, fontWeight: 'bold', fontSize: 15, letterSpacing: 1,
  },
  errorText: { color: colors.error, marginBottom: 16 },
  retryButton: {
    borderWidth: 1, borderColor: colors.gold,
    borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12,
  },
  retryText: { color: colors.gold, letterSpacing: 1 },
});