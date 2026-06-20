import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { colors } from '../theme/colors';
import { misMediosDePago } from '../api/mediosPago';
import { responderCondiciones } from '../api/articulos';

export default function SeleccionarCuentaCobroScreen({ route, navigation }) {
  const { productoId, nombreArticulo } = route.params;

  const [cuentas, setCuentas] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [confirmando, setConfirmando] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      const medios = await misMediosDePago();
      // Solo las cuentas bancarias (no tarjetas ni cheques)
      const soloCuentas = medios.filter((m) => m.tipo === 'cuenta_bancaria');
      setCuentas(soloCuentas);
      if (soloCuentas.length > 0) {
        setSeleccionada(soloCuentas[0].id);
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar tus cuentas');
    } finally {
      setCargando(false);
    }
  }

  // Recargar al volver (por si agregó una cuenta)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', cargar);
    return unsubscribe;
  }, [navigation]);

  async function confirmarAceptacion() {
    if (!seleccionada) {
      Alert.alert('Elegí una cuenta', 'Seleccioná a qué cuenta querés cobrar');
      return;
    }
    setConfirmando(true);
    try {
      // Acepta las condiciones mandando la cuenta de cobro
      await responderCondiciones(productoId, true, seleccionada);
      Alert.alert(
        '¡Aceptaste!',
        'La empresa asignará tu artículo a una subasta. Cobrarás en la cuenta declarada.',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (e) {
      const mensaje = e.response?.data?.mensaje || 'No se pudo procesar';
      Alert.alert('Error', mensaje);
    } finally {
      setConfirmando(false);
    }
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

      <Text style={styles.titulo}>Cuenta de cobro</Text>
      <Text style={styles.subtitulo}>
        Elegí a qué cuenta querés recibir el dinero cuando se venda
        {nombreArticulo ? ` "${nombreArticulo}"` : ''}
      </Text>

      {cuentas.length === 0 ? (
        <View style={styles.vacioBox}>
          <Text style={styles.vacioIcono}>🏦</Text>
          <Text style={styles.vacioTexto}>No tenés cuentas bancarias registradas</Text>
          <Text style={styles.vacioSub}>
            Necesitás declarar una cuenta para cobrar la venta
          </Text>
          <TouchableOpacity
            style={styles.botonAgregar}
            onPress={() => navigation.navigate('AgregarCuenta')}
          >
            <Text style={styles.botonAgregarText}>AGREGAR CUENTA BANCARIA</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {cuentas.map((cuenta) => (
            <TouchableOpacity
              key={cuenta.id}
              style={[
                styles.cuentaCard,
                seleccionada === cuenta.id && styles.cuentaCardActiva,
              ]}
              onPress={() => setSeleccionada(cuenta.id)}
            >
              <Text style={styles.cuentaIcono}>🏦</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cuentaTipo}>CUENTA BANCARIA</Text>
                <Text style={styles.cuentaEstado}>
                  {cuenta.verificado === 'si' ? '✅ Verificada' : '⏳ Pendiente'}
                </Text>
              </View>
              <View style={[
                styles.radio,
                seleccionada === cuenta.id && styles.radioActivo,
              ]}>
                {seleccionada === cuenta.id && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}

          {/* Agregar otra cuenta */}
          <TouchableOpacity
            style={styles.agregarOtra}
            onPress={() => navigation.navigate('AgregarCuenta')}
          >
            <Text style={styles.agregarOtraText}>+ Agregar otra cuenta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonConfirmar}
            onPress={confirmarAceptacion}
            disabled={confirmando}
          >
            {confirmando ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.botonConfirmarText}>ACEPTAR Y DECLARAR CUENTA</Text>
            )}
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
  cuentaCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 14, padding: 16, marginBottom: 12,
  },
  cuentaCardActiva: { borderColor: colors.gold },
  cuentaIcono: { fontSize: 26 },
  cuentaTipo: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  cuentaEstado: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  radio: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActivo: { borderColor: colors.gold },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.gold },
  agregarOtra: { paddingVertical: 12, alignItems: 'center' },
  agregarOtraText: { color: colors.gold, fontSize: 13 },
  botonConfirmar: {
    backgroundColor: colors.gold, borderRadius: 12,
    padding: 18, alignItems: 'center', marginTop: 12,
  },
  botonConfirmarText: {
    color: colors.background, fontWeight: 'bold', fontSize: 14, letterSpacing: 1,
  },
  vacioBox: { alignItems: 'center', marginTop: 40 },
  vacioIcono: { fontSize: 48, marginBottom: 16 },
  vacioTexto: { color: colors.textPrimary, fontSize: 16, marginBottom: 4 },
  vacioSub: { color: colors.textMuted, fontSize: 13, marginBottom: 24, textAlign: 'center' },
  botonAgregar: {
    borderWidth: 1, borderColor: colors.gold,
    borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14,
  },
  botonAgregarText: { color: colors.gold, letterSpacing: 1 },
});