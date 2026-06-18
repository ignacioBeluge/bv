import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { colors } from '../theme/colors';
import { misMediosDePago } from '../api/mediosPago';

// Iconos por tipo de medio
const ICONOS = {
  tarjeta: '💳',
  cuenta_bancaria: '🏦',
  cheque_certificado: '📄',
};

export default function SeleccionarMedioPagoScreen({ route, navigation }) {
  // Recibimos los datos de la subasta/ítem a los que se va a conectar
  const { subastaId, itemId, descripcion } = route.params;

  const [medios, setMedios] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    setCargando(true);
    try {
      const data = await misMediosDePago();
      // Solo mostramos los medios verificados (con los que puede pujar)
      const verificados = data.filter((m) => m.verificado === 'si');
      setMedios(verificados);
      // Preseleccionamos el primero si hay
      if (verificados.length > 0) {
        setSeleccionado(verificados[0].id);
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar los medios de pago');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function continuar() {
    if (!seleccionado) {
      Alert.alert('Elegí un medio de pago', 'Seleccioná con qué vas a pagar si ganás');
      return;
    }
    // Vamos a la puja llevando el medio de pago elegido
    navigation.replace('Puja', {
      subastaId,
      itemId,
      descripcion,
      medioPagoId: seleccionado,
    });
  }

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>‹ Volver</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>¿Cómo vas a pagar?</Text>
      <Text style={styles.subtitulo}>
        Elegí el medio de pago que usarás si ganás la subasta
      </Text>

      {medios.length === 0 ? (
        <View style={styles.vacioBox}>
          <Text style={styles.vacioIcono}>🔒</Text>
          <Text style={styles.vacioTexto}>
            No tenés medios de pago verificados
          </Text>
          <Text style={styles.vacioSub}>
            Necesitás uno para poder pujar
          </Text>
          <TouchableOpacity
            style={styles.botonAgregar}
            onPress={() => navigation.navigate('MediosPago')}
          >
            <Text style={styles.botonAgregarText}>AGREGAR MEDIO DE PAGO</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Lista de medios para elegir */}
          {medios.map((medio) => (
            <TouchableOpacity
              key={medio.id}
              style={[
                styles.medioCard,
                seleccionado === medio.id && styles.medioCardActivo,
              ]}
              onPress={() => setSeleccionado(medio.id)}
            >
              <Text style={styles.medioIcono}>{ICONOS[medio.tipo] || '💳'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.medioTipo}>
                  {medio.tipo.replace('_', ' ').toUpperCase()}
                </Text>
                <Text style={styles.medioEstado}>✅ Verificado</Text>
              </View>
              {/* Radio button */}
              <View style={[
                styles.radio,
                seleccionado === medio.id && styles.radioActivo,
              ]}>
                {seleccionado === medio.id && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}

          {/* Botón continuar */}
          <TouchableOpacity style={styles.botonContinuar} onPress={continuar}>
            <Text style={styles.botonContinuarText}>CONECTARSE A LA SUBASTA</Text>
          </TouchableOpacity>
        </>
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
  subtitulo: { color: colors.textMuted, fontSize: 13, marginTop: 4, marginBottom: 24 },
  medioCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 14, padding: 16, marginBottom: 12,
  },
  medioCardActivo: { borderColor: colors.gold },
  medioIcono: { fontSize: 26 },
  medioTipo: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  medioEstado: { color: colors.success, fontSize: 12, marginTop: 2 },
  radio: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActivo: { borderColor: colors.gold },
  radioDot: {
    width: 12, height: 12, borderRadius: 6, backgroundColor: colors.gold,
  },
  botonContinuar: {
    backgroundColor: colors.gold, borderRadius: 12,
    padding: 18, alignItems: 'center', marginTop: 12,
  },
  botonContinuarText: {
    color: colors.background, fontWeight: 'bold', fontSize: 15, letterSpacing: 1,
  },
  vacioBox: { alignItems: 'center', marginTop: 40 },
  vacioIcono: { fontSize: 48, marginBottom: 16 },
  vacioTexto: { color: colors.textPrimary, fontSize: 16, marginBottom: 4 },
  vacioSub: { color: colors.textMuted, fontSize: 13, marginBottom: 24 },
  botonAgregar: {
    borderWidth: 1, borderColor: colors.gold,
    borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14,
  },
  botonAgregarText: { color: colors.gold, letterSpacing: 1 },
});