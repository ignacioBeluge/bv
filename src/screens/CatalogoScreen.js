import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { colors } from '../theme/colors';
import { obtenerSubasta } from '../api/subastas';

export default function CatalogoScreen({ route, navigation }) {
  const { subastaId } = route.params;
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  async function cargarCatalogo() {
    setCargando(true);
    setError(null);
    try {
      // Reusamos el detalle de subasta que ya trae los ítems
      const data = await obtenerSubasta(subastaId);
      setItems(data.items || []);
    } catch (e) {
      setError('No se pudo cargar el catálogo');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarCatalogo();
  }, []);

  function renderItem({ item }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DetalleItem', {
          subastaId,
          itemId: item.id,
        })}
      >
        {/* Placeholder de imagen del ítem */}
        {item.fotoPrincipal ? (
          <Image source={{ uri: item.fotoPrincipal }} style={styles.cardImagen} />
        ) : (
          <View style={styles.cardImagen}>
            <Text style={styles.cardImagenIcono}>🏺</Text>
          </View>
        )}
        <Text style={styles.cardNombre} numberOfLines={2}>
          {item.descripcion || 'Sin descripción'}
        </Text>
        <Text style={styles.cardBase}>Base: ${item.precioBase}</Text>
        {item.mejorOfertaActual != null && (
          <Text style={styles.cardOferta}>Oferta: ${item.mejorOfertaActual}</Text>
        )}
      </TouchableOpacity>
    );
  }

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
        <TouchableOpacity style={styles.retryButton} onPress={cargarCatalogo}>
          <Text style={styles.retryText}>REINTENTAR</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>‹ Volver</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>Catálogo</Text>
      <Text style={styles.subtitulo}>{items.length} lotes disponibles</Text>

      {items.length === 0 ? (
        <Text style={styles.vacio}>Esta subasta no tiene ítems cargados</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}                          // grilla de 2 columnas
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ gap: 12, paddingTop: 12 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 50 },
  center: {
    flex: 1, backgroundColor: colors.background,
    justifyContent: 'center', alignItems: 'center',
  },
  back: { color: colors.gold, fontSize: 16, marginBottom: 16 },
  titulo: { color: colors.textPrimary, fontSize: 22, fontWeight: 'bold' },
  subtitulo: { color: colors.textMuted, fontSize: 13 },
  card: {
    flex: 1, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: 14, padding: 12,
  },
  cardImagen: {
    height: 90, backgroundColor: '#1a1200', borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  cardImagenIcono: { fontSize: 32 },
  cardNombre: { color: colors.textPrimary, fontSize: 13, fontWeight: '600', marginBottom: 4 },
  cardBase: { color: colors.gold, fontSize: 12, fontWeight: '600' },
  cardOferta: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  vacio: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
  errorText: { color: colors.error, marginBottom: 16 },
  retryButton: {
    borderWidth: 1, borderColor: colors.gold,
    borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12,
  },
  retryText: { color: colors.gold, letterSpacing: 1 },
});