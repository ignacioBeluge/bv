import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { misMediosDePago, eliminarMedioPago  } from '../api/mediosPago';

export default function MediosPagoScreen({ navigation }) {
  const [medios, setMedios] = useState([]);
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    setCargando(true);
    try {
      const data = await misMediosDePago();
      setMedios(data);
    } catch (e) {
      // si falla, lista vacía
    } finally {
      setCargando(false);
    }
  }

  // Recarga cada vez que la pantalla vuelve a estar en foco
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargar);
    return unsubscribe;
  }, [navigation]);

  function renderMedio({ item }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        Alert.alert(
          item.tipo.replace('_', ' ').toUpperCase(),
          `Estado: ${item.verificado === 'si' ? 'Verificado ✅' : 'Pendiente ⏳'}`,
          [
            { text: 'Cerrar', style: 'cancel' },
            {
              text: 'Eliminar',
              style: 'destructive',
              onPress: () => confirmarEliminar(item.id),
            },
          ]
        );
      }}
    >
      <Text style={styles.cardIcono}>💳</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTipo}>{item.tipo.replace('_', ' ').toUpperCase()}</Text>
        <Text style={styles.cardEstado}>
          {item.verificado === 'si' ? '✅ Verificado' : '⏳ Pendiente'}
        </Text>
      </View>
      <Text style={styles.cardFlecha}>›</Text>
    </TouchableOpacity>
  );
}

// Confirma y elimina
function confirmarEliminar(id) {
    Alert.alert(
      'Eliminar medio de pago',
      '¿Seguro que querés eliminar este medio de pago?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarMedioPago(id);
              cargar();   // recargar la lista
            } catch (e) {
              const mensaje = e.response?.data?.mensaje || 'No se pudo eliminar';
              Alert.alert('Error', mensaje);
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>‹ Volver</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>Mis medios de pago</Text>

      {cargando ? (
        <ActivityIndicator color={colors.gold} size="large" style={{ marginTop: 40 }} />
      ) : medios.length === 0 ? (
        <Text style={styles.vacio}>Todavía no tenés medios de pago</Text>
      ) : (
        <FlatList
          data={medios}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMedio}
          contentContainerStyle={{ gap: 12, paddingTop: 12 }}
        />
      )}

      {/* Botón agregar */}
      <TouchableOpacity
        style={styles.botonAgregar}
        onPress={() => {
          Alert.alert('Agregar medio de pago', 'Elegí el tipo', [
            { text: 'Tarjeta', onPress: () => navigation.navigate('AgregarTarjeta') },
            { text: 'Cuenta bancaria', onPress: () => navigation.navigate('AgregarCuenta') },
            { text: 'Cheque', onPress: () => navigation.navigate('AgregarCheque') },
            { text: 'Cancelar', style: 'cancel' },
          ]);
        }}
      >
        <Text style={styles.botonAgregarText}>+ AGREGAR MEDIO DE PAGO</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 50 },
  back: { color: colors.gold, fontSize: 16, marginBottom: 16 },
  titulo: { color: colors.textPrimary, fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 14, padding: 16,
  },
  cardIcono: { fontSize: 24, marginRight: 14 },
  cardTipo: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  cardEstado: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  vacio: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
  botonAgregar: {
    backgroundColor: colors.gold, borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 12,
  },
  botonAgregarText: {
    color: colors.background, fontWeight: 'bold', fontSize: 14, letterSpacing: 1,
  },

  cardFlecha: { color: colors.textMuted, fontSize: 22 },
  
});