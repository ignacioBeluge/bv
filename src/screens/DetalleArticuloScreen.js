import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { colors } from '../theme/colors';
import { obtenerArticulo, responderCondiciones, confirmarEnvio } from '../api/articulos';

export default function DetalleArticuloScreen({ route, navigation }) {
  const { id } = route.params;
  const [articulo, setArticulo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  // Dirección fija del depósito de la empresa donde se inspeccionan los artículos
  const DIRECCION_DEPOSITO = {
    nombre: 'Depósito Central BidVault',
    direccion: 'Av. Corrientes 1234, CABA',
    horario: 'Lunes a Viernes de 9 a 18hs',
    referencia: 'Presentar DNI y código de artículo',
  };

  async function cargar() {
    setCargando(true);
    try {
      const data = await obtenerArticulo(id);
      setArticulo(data);
    } catch (e) {
      Alert.alert('Error', 'No se pudo cargar el artículo');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  // Aceptar o rechazar el precio propuesto
  async function responder(acepta) {
    setProcesando(true);
    try {
      await responderCondiciones(id, acepta);
      Alert.alert(
        acepta ? '¡Aceptaste!' : 'Rechazaste',
        acepta
          ? 'La empresa asignará tu artículo a una subasta.'
          : 'El artículo no se subastará.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      const mensaje = e.response?.data?.mensaje || 'No se pudo procesar';
      Alert.alert('Error', mensaje);
    } finally {
      setProcesando(false);
    }
  }

  // Confirmar que envió el producto al depósito
  async function handleConfirmarEnvio() {
    Alert.alert(
      'Confirmar envío',
      '¿Ya enviaste el artículo al depósito?',
      [
        { text: 'Todavía no', style: 'cancel' },
        {
          text: 'Sí, ya lo envié',
          onPress: async () => {
            setProcesando(true);
            try {
              await confirmarEnvio(id);
              Alert.alert(
                'Envío confirmado',
                'Te avisaremos cuando inspeccionemos el artículo.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (e) {
              const mensaje = e.response?.data?.mensaje || 'No se pudo confirmar el envío';
              Alert.alert('Error', mensaje);
            } finally {
              setProcesando(false);
            }
          },
        },
      ]
    );
  }

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  const tieneFotos = articulo.fotos && articulo.fotos.length > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>‹ Volver</Text>
      </TouchableOpacity>

      {/* Carrusel de fotos */}
      {tieneFotos && (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {articulo.fotos.map((foto, index) => (
            <Image key={index} source={{ uri: foto }} style={styles.foto} />
          ))}
        </ScrollView>
      )}

      <Text style={styles.nombre}>{articulo.nombre}</Text>
      <Text style={styles.descripcion}>{articulo.descripcionCompleta}</Text>

      {/* Estado actual */}
      <View style={styles.estadoBox}>
        <Text style={styles.estadoLabel}>ESTADO</Text>
        <Text style={styles.estadoValor}>{articulo.estado.replace(/_/g, ' ')}</Text>
      </View>

      {/* Si fue rechazado, mostrar el motivo */}
      {articulo.estado === 'RECHAZADO' && articulo.motivoRechazo && (
        <View style={styles.rechazoBox}>
          <Text style={styles.rechazoTitulo}>Motivo del rechazo</Text>
          <Text style={styles.rechazoTexto}>{articulo.motivoRechazo}</Text>
        </View>
      )}

      {/* Botón seguro — visible cuando el artículo está aceptado o en subasta */}
      {(articulo.estado === 'ACEPTADO' || articulo.estado === 'EN_SUBASTA') && (
        <TouchableOpacity
          style={styles.botonSeguro}
          onPress={() => navigation.navigate('Seguro', {
            productoId: id,
            nombreArticulo: articulo.nombre,
          })}
        >
          <Text style={styles.botonSeguroTexto}>🛡️ Ver seguro de la pieza</Text>
        </TouchableOpacity>
      )}

      {/* PENDIENTE_ENVIO: mostrar la dirección del depósito + botón confirmar envío */}
      {articulo.estado === 'PENDIENTE_ENVIO' && (
        <View style={styles.envioBox}>
          <Text style={styles.envioTitulo}>📦 Enviá tu artículo a inspección</Text>
          <Text style={styles.envioTexto}>
            La empresa aprobó tu artículo por las fotos. Para continuar, enviá el
            producto a nuestro depósito para la inspección presencial.
          </Text>

          <View style={styles.envioDatos}>
            <Text style={styles.envioLabel}>DEPÓSITO</Text>
            <Text style={styles.envioValor}>{DIRECCION_DEPOSITO.nombre}</Text>

            <Text style={styles.envioLabel}>DIRECCIÓN</Text>
            <Text style={styles.envioValor}>{DIRECCION_DEPOSITO.direccion}</Text>

            <Text style={styles.envioLabel}>HORARIO</Text>
            <Text style={styles.envioValor}>{DIRECCION_DEPOSITO.horario}</Text>

            <Text style={styles.envioLabel}>IMPORTANTE</Text>
            <Text style={styles.envioValor}>{DIRECCION_DEPOSITO.referencia}</Text>
          </View>

          <Text style={styles.envioNota}>
            Una vez que recibamos e inspeccionemos tu artículo, te propondremos un precio.
          </Text>

          {/* Botón para confirmar el envío */}
          <TouchableOpacity
            style={styles.botonEnvio}
            onPress={handleConfirmarEnvio}
            disabled={procesando}
          >
            {procesando ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.botonEnvioText}>YA ENVIÉ EL PRODUCTO</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* ENVIADO: esperando que la empresa inspeccione */}
      {articulo.estado === 'ENVIADO' && (
        <View style={styles.esperandoBox}>
          <Text style={styles.esperandoIcono}>📬</Text>
          <Text style={styles.esperandoTitulo}>Artículo enviado</Text>
          <Text style={styles.esperandoTexto}>
            Estamos esperando recibir tu artículo para inspeccionarlo.
            Te propondremos un precio una vez completada la revisión.
          </Text>
        </View>
      )}

      {/* PRECIO_ASIGNADO: mostrar condiciones + botones aceptar/rechazar */}
      {articulo.estado === 'PRECIO_ASIGNADO' && (
        <>
          <View style={styles.precioBox}>
            <Text style={styles.precioLabel}>PRECIO PROPUESTO POR LA EMPRESA</Text>
            <Text style={styles.precioValor}>${articulo.precioPropuesto}</Text>
            <Text style={styles.comision}>Comisión: ${articulo.comisionPropuesta}</Text>
          </View>

          <Text style={styles.pregunta}>¿Aceptás estas condiciones?</Text>

          <View style={styles.botonesRow}>
            <TouchableOpacity
              style={styles.botonRechazar}
              onPress={() => responder(false)}
              disabled={procesando}
            >
              <Text style={styles.botonRechazarText}>RECHAZAR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.botonAceptar}
              onPress={() => responder(true)}
              disabled={procesando}
            >
              {procesando ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={styles.botonAceptarText}>ACEPTAR</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
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
  foto: { width: 300, height: 220, borderRadius: 14, marginRight: 10 },
  nombre: { color: colors.textPrimary, fontSize: 22, fontWeight: 'bold', marginTop: 16 },
  descripcion: { color: colors.textSecondary, fontSize: 14, lineHeight: 22, marginTop: 8 },
  estadoBox: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: 16, marginTop: 20,
  },
  estadoLabel: { color: colors.textSecondary, fontSize: 10, letterSpacing: 1 },
  estadoValor: { color: colors.gold, fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  rechazoBox: {
    backgroundColor: '#1a0a0a', borderWidth: 1, borderColor: 'rgba(255,68,68,0.3)',
    borderRadius: 12, padding: 16, marginTop: 16,
  },
  rechazoTitulo: { color: colors.error, fontSize: 13, fontWeight: '600', marginBottom: 4 },
  rechazoTexto: { color: '#cc8888', fontSize: 13 },
  precioBox: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.gold,
    borderRadius: 12, padding: 20, marginTop: 16, alignItems: 'center',
  },
  precioLabel: { color: colors.textSecondary, fontSize: 10, letterSpacing: 1 },
  precioValor: { color: colors.gold, fontSize: 32, fontWeight: 'bold', marginTop: 8 },
  comision: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  pregunta: {
    color: colors.textPrimary, fontSize: 15, textAlign: 'center', marginTop: 24,
  },
  botonesRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  botonRechazar: {
    flex: 1, borderWidth: 1, borderColor: colors.error,
    borderRadius: 12, padding: 16, alignItems: 'center',
  },
  botonRechazarText: { color: colors.error, fontWeight: '600', letterSpacing: 1 },
  botonAceptar: {
    flex: 1, backgroundColor: colors.gold,
    borderRadius: 12, padding: 16, alignItems: 'center',
  },
  botonAceptarText: { color: colors.background, fontWeight: 'bold', letterSpacing: 1 },
  botonSeguro: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.gold,
    borderRadius: 12, padding: 14, marginTop: 16,
  },
  botonSeguroTexto: { color: colors.gold, fontWeight: '600', fontSize: 14 },

  // Estilos PENDIENTE_ENVIO
  envioBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
  },
  envioTitulo: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  envioTexto: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  envioDatos: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  envioLabel: {
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 10,
  },
  envioValor: {
    color: colors.textPrimary,
    fontSize: 14,
    marginTop: 2,
  },
  envioNota: {
    color: colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  botonEnvio: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  botonEnvioText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },

  // Estilos ENVIADO
  esperandoBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 24,
    marginTop: 16,
    alignItems: 'center',
  },
  esperandoIcono: { fontSize: 40, marginBottom: 12 },
  esperandoTitulo: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  esperandoTexto: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});