import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Linking, Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { obtenerSeguro, ampliarPoliza } from '../api/articulos';

export default function SeguroScreen({ navigation, route }) {
  const { productoId, nombreArticulo } = route.params;
  const [seguro, setSeguro] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [ampliando, setAmpliando] = useState(false);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    try {
      const data = await obtenerSeguro(productoId);
      setSeguro(data);
    } catch (e) {
      Alert.alert('Error', 'No se pudo cargar la información del seguro');
    } finally {
      setCargando(false);
    }
  }

  function contactarAseguradora() {
    if (!seguro?.telefonoAseguradora) return;
    const url = `tel:${seguro.telefonoAseguradora}`;
    Linking.canOpenURL(url).then((can) => {
      if (can) Linking.openURL(url);
      else Alert.alert('Error', 'No se puede realizar la llamada desde este dispositivo');
    });
  }

  async function handleAmpliar() {
    Alert.alert(
      'Ampliar póliza',
      `La cobertura actual es $${seguro?.montoCobertura?.toLocaleString()}.\n¿Querés solicitar una ampliación?\nSe calculará el costo según el nuevo valor.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Solicitar',
          onPress: async () => {
            setAmpliando(true);
            try {
              await ampliarPoliza(productoId);
              Alert.alert(
                '¡Solicitud enviada!',
                'Nos comunicaremos para coordinar el pago de la diferencia.',
              );
            } catch (e) {
              Alert.alert('Error', e.response?.data?.mensaje || 'No se pudo procesar la solicitud');
            } finally {
              setAmpliando(false);
            }
          },
        },
      ],
    );
  }

  if (cargando) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  if (!seguro) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No se encontró información del seguro</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>‹ Volver</Text>
      </TouchableOpacity>
      <Text style={styles.titulo}>🛡️ Seguro de la pieza</Text>
      {nombreArticulo && (
        <Text style={styles.subtitulo}>{nombreArticulo}</Text>
      )}

      {/* Depósito */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>📍 DEPÓSITO</Text>
        <View style={styles.card}>
          <Fila label="Nombre" valor={seguro.depositoNombre} />
          <Fila label="Dirección" valor={seguro.depositoDireccion} />
          <Fila label="Ciudad" valor={seguro.depositoCiudad} />
          <Fila label="Teléfono depósito" valor={seguro.depositoTelefono} />
          {seguro.depositoReferencia && (
            <Fila label="Referencia" valor={seguro.depositoReferencia} />
          )}
        </View>
      </View>

      {/* Póliza */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>📄 DATOS DE LA PÓLIZA</Text>
        <View style={styles.card}>
          <Fila label="Aseguradora" valor={seguro.aseguradora} />
          <Fila label="N° de póliza" valor={seguro.numeroPoliza} />
          <Fila label="Cobertura" valor={`$${seguro.montoCobertura?.toLocaleString()}`} destacado />
          <Fila label="Vigencia desde" valor={formatFecha(seguro.vigenciaDesde)} />
          <Fila label="Vigencia hasta" valor={formatFecha(seguro.vigenciaHasta)} />
          <Fila label="Estado" valor={seguro.estadoPoliza} color={estadoColor(seguro.estadoPoliza)} />
        </View>
      </View>

      {/* Botones */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>⚡ ACCIONES</Text>

        <TouchableOpacity style={styles.botonSecundario} onPress={contactarAseguradora}>
          <Text style={styles.botonSecundarioIcono}>📞</Text>
          <View>
            <Text style={styles.botonSecundarioTexto}>Contactar aseguradora</Text>
            <Text style={styles.botonSecundarioSub}>{seguro.telefonoAseguradora}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonPrincipal}
          onPress={handleAmpliar}
          disabled={ampliando}
        >
          {ampliando ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <>
              <Text style={styles.botonPrincipalIcono}>📈</Text>
              <Text style={styles.botonPrincipalTexto}>Ampliar póliza</Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.notaAmpliar}>
          Al ampliar la póliza se calculará la diferencia de prima y se coordinará el pago.
        </Text>
      </View>
    </ScrollView>
  );
}

// ── Componente auxiliar para filas de datos ──────────────────────────────────
function Fila({ label, valor, destacado, color }) {
  return (
    <View style={filaStyles.row}>
      <Text style={filaStyles.label}>{label}</Text>
      <Text style={[
        filaStyles.valor,
        destacado && filaStyles.destacado,
        color && { color },
      ]}>
        {valor ?? '—'}
      </Text>
    </View>
  );
}

const filaStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  label: { color: colors.textSecondary, fontSize: 13 },
  valor: { color: colors.textPrimary, fontSize: 13, fontWeight: '500', maxWidth: '55%', textAlign: 'right' },
  destacado: { color: colors.gold, fontSize: 15, fontWeight: 'bold' },
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatFecha(fechaStr) {
  if (!fechaStr) return '—';
  const d = new Date(fechaStr);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function estadoColor(estado) {
  if (!estado) return colors.textMuted;
  const s = estado.toLowerCase();
  if (s.includes('vigente') || s.includes('activa')) return colors.success;
  if (s.includes('vencida') || s.includes('cancelada')) return colors.error;
  return colors.warning;
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 50 },
  centered: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  back: { color: colors.gold, fontSize: 16, marginBottom: 16 },
  titulo: { color: colors.textPrimary, fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  subtitulo: { color: colors.textSecondary, fontSize: 14, marginBottom: 24 },
  errorText: { color: colors.textSecondary, fontSize: 15 },

  seccion: { marginBottom: 24 },
  seccionTitulo: {
    color: colors.textSecondary, fontSize: 11, letterSpacing: 2,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 14, paddingHorizontal: 16, overflow: 'hidden',
  },

  botonSecundario: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 14, padding: 16, marginBottom: 12,
  },
  botonSecundarioIcono: { fontSize: 24 },
  botonSecundarioTexto: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  botonSecundarioSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },

  botonPrincipal: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: colors.gold, borderRadius: 14,
    padding: 16, marginBottom: 10,
  },
  botonPrincipalIcono: { fontSize: 20 },
  botonPrincipalTexto: { color: colors.background, fontWeight: 'bold', fontSize: 15, letterSpacing: 1 },

  notaAmpliar: { color: colors.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
