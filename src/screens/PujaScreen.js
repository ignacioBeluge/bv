import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView
} from 'react-native';
import Slider from '@react-native-community/slider';
import { colors } from '../theme/colors';
import { obtenerLimites, realizarPuja, puedePujar, obtenerHistorialPujas, obtenerEstadoRemate } from '../api/subastas';
import { misMediosDePago } from '../api/mediosPago';

export default function PujaScreen({ route, navigation }) {
  const { subastaId, itemId, descripcion, medioPagoId  } = route.params;

  const [limites, setLimites] = useState(null);
  const [montoPuja, setMontoPuja] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [pujando, setPujando] = useState(false);
  const [error, setError] = useState(null);
  const [historial, setHistorial] = useState([]);

  // NUEVO: estado para saber si puede pujar
  const [habilitado, setHabilitado] = useState(true);
  const [motivoBloqueo, setMotivoBloqueo] = useState(null);

  const [remate, setRemate] = useState(null);        // estado del remate
  const [resultado, setResultado] = useState(null);  // resultado cuando cierra

async function cargarDatos() {
  setCargando(true);
  setError(null);
  try {
    const permiso = await puedePujar(subastaId);
    setHabilitado(permiso.puedePujar);
    setMotivoBloqueo(permiso.motivo);

    const data = await obtenerLimites(subastaId, itemId);
    setLimites(data);
    setMontoPuja(Number(data.pujaMinima));

    const hist = await obtenerHistorialPujas(subastaId, itemId);
    setHistorial(hist);

  } catch (e) {
    setError('No se pudieron cargar los datos de la subasta');
  } finally {
    setCargando(false);
  }
}

  // Polling cada 5 segundos: remate + historial + límites
  useEffect(() => {
    let intervalo;

    async function consultarTodo() {
      try {
        // 1. Estado del remate (countdown)
        const estado = await obtenerEstadoRemate(subastaId, itemId);
        console.log('ESTADO REMATE:', JSON.stringify(estado));
        setRemate(estado);

        // 2. Historial de pujas (para ver las pujas de otros)
        const hist = await obtenerHistorialPujas(subastaId, itemId);
        setHistorial(hist);

        // 3. Límites actualizados (la mejor oferta sube con cada puja)
        const nuevosLimites = await obtenerLimites(subastaId, itemId);
        setLimites((prev) => {
          // Actualizamos la mejor oferta, pero respetamos el monto que el usuario eligió en el slider
          return { ...nuevosLimites };
        });

        // Si el remate cerró, guardamos el resultado y frenamos el polling
        if (estado.cerrado) {
          setResultado(estado);
          clearInterval(intervalo);
        }
      } catch (e) {
        // si falla una consulta, seguimos intentando
      }
    }

    consultarTodo();
    intervalo = setInterval(consultarTodo, 5000);

    return () => clearInterval(intervalo);
  }, [subastaId, itemId]);

  useEffect(() => {
    cargarDatos();
  }, []);

async function handlePujar() {
  // Validar que tenga un medio de pago
  if (!medioPagoId) {
    Alert.alert('Sin medio de pago', 'No se encontró un medio de pago verificado');
    return;
  }

  setPujando(true);
  try {
    const resultado = await realizarPuja(subastaId, itemId, montoPuja, medioPagoId);
    //                                                                  ↑ ahora dinámico
    await cargarDatos();
    Alert.alert(
      '¡Puja confirmada!',
      `Ofertaste $${resultado.montoOfertado}\n` +
      `${resultado.esMayorPostor ? 'Sos el mayor postor' : 'Fuiste superado'}`
    );
  } catch (e) {
    const mensaje = e.response?.data?.mensaje || 'No se pudo realizar la puja';
    Alert.alert('Error', mensaje);
  } finally {
    setPujando(false);
  }
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
        <TouchableOpacity style={styles.retryButton} onPress={cargarDatos}>
          <Text style={styles.retryText}>REINTENTAR</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const maxSlider = limites.aplicanLimites
    ? Number(limites.pujaMaxima)
    : Number(limites.pujaMinima) * 2;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>‹ Volver</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>{descripcion || 'Ítem'}</Text>

      {/* Oferta actual — se muestra siempre */}
      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>MEJOR OFERTA ACTUAL</Text>
        {/* ─── Estado del remate ─── */}
{remate && remate.enRemate && !remate.cerrado && (
  <View style={styles.remateBox}>
    <View style={styles.remateDot} />
    <Text style={styles.remateLabel}>REMATE EN VIVO</Text>
    <Text style={styles.remateCountdown}>
      {remate.segundosRestantes}s
    </Text>
    <Text style={styles.remateSubtexto}>
      Si nadie puja, se cierra
    </Text>
  </View>
)}

{/* ─── Resultado cuando cierra ─── */}
{resultado && resultado.cerrado && (
  <View style={styles.resultadoBox}>
    {resultado.ganaste ? (
      <>
        <Text style={styles.resultadoIcono}>🏆</Text>
        <Text style={styles.resultadoTitulo}>¡Ganaste!</Text>
        <Text style={styles.resultadoMonto}>
          ${Number(resultado.montoFinal).toLocaleString('es-AR')}
        </Text>
        <Text style={styles.resultadoTexto}>
          Te llegará un mensaje con el detalle de pago
        </Text>
      </>
    ) : resultado.ganaEmpresa ? (
      <>
        <Text style={styles.resultadoIcono}>🏢</Text>
        <Text style={styles.resultadoTitulo}>Sin ofertas</Text>
        <Text style={styles.resultadoTexto}>
          La empresa compró el artículo al precio base
        </Text>
      </>
    ) : (
      <>
        <Text style={styles.resultadoIcono}>😔</Text>
        <Text style={styles.resultadoTitulo}>No ganaste</Text>
        <Text style={styles.resultadoTexto}>
          Ganó el Postor {resultado.numeroPostorGanador} con $
          {Number(resultado.montoFinal).toLocaleString('es-AR')}
        </Text>
      </>
    )}
  </View>
)}
        <Text style={styles.infoValor}>${limites.mejorOfertaActual}</Text>
      </View>

      {/* Historial de pujas */}
      {historial.length > 0 && (
        <View style={styles.historialBox}>
          <Text style={styles.historialTitulo}>ÚLTIMAS PUJAS</Text>
          {historial.slice(0, 5).map((puja) => (
            <View
              key={puja.pujaId}
              style={[styles.historialItem, puja.esMia && styles.historialItemMio]}
            >
              <Text style={[styles.historialPostor, puja.esMia && styles.historialMioText]}>
                {puja.esMia ? 'Vos' : `Postor ${puja.numeroPostor}`}
              </Text>
              <Text style={[styles.historialMonto, puja.esMia && styles.historialMioText]}>
                ${Number(puja.monto).toLocaleString('es-AR')}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* ─── MODO SOLO VER: usuario sin medio de pago ─── */}
      {!habilitado ? (
        <>
          <View style={styles.bloqueoBox}>
            <Text style={styles.bloqueoIcono}>🔒</Text>
            <Text style={styles.bloqueoTitulo}>No podés pujar aún</Text>
            <Text style={styles.bloqueoMotivo}>{motivoBloqueo}</Text>
          </View>
        </>
      ) : (
        /* ─── MODO PUJAR: usuario habilitado ─── */
        <>
          <Text style={styles.montoLabel}>TU OFERTA</Text>
          <Text style={styles.montoGrande}>
            ${montoPuja.toLocaleString('es-AR')}
          </Text>

          <Slider
            style={{ width: '100%', height: 40, marginVertical: 20 }}
            minimumValue={Number(limites.pujaMinima)}
            maximumValue={maxSlider}
            step={100}
            value={montoPuja}
            onValueChange={setMontoPuja}
            minimumTrackTintColor={colors.gold}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.gold}
          />

          <View style={styles.limitesRow}>
            <View>
              <Text style={styles.limiteLabel}>MÍNIMO</Text>
              <Text style={styles.limiteValor}>${limites.pujaMinima}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.limiteLabel}>MÁXIMO</Text>
              <Text style={styles.limiteValor}>
                {limites.aplicanLimites ? `$${limites.pujaMaxima}` : 'Sin límite'}
              </Text>
            </View>
          </View>

          {!limites.aplicanLimites && (
            <Text style={styles.sinLimite}>
              Tu categoría no tiene tope máximo de puja
            </Text>
          )}

          <TouchableOpacity
            style={styles.botonPujar}
            onPress={handlePujar}
            disabled={pujando}
          >
            {pujando ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.botonPujarText}>
                ⚡ PUJAR ${montoPuja.toLocaleString('es-AR')}
              </Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    paddingTop: 50,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  back: { color: colors.gold, fontSize: 16, marginBottom: 20 },
  titulo: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 4,
  },
  infoValor: { color: colors.gold, fontSize: 24, fontWeight: 'bold' },

  // Estilos del modo "solo ver"
  bloqueoBox: {
    backgroundColor: '#1a0a0a',
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.3)',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  bloqueoIcono: { fontSize: 32, marginBottom: 12 },
  bloqueoTitulo: {
    color: '#ff8888',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  bloqueoMotivo: {
    color: '#884444',
    fontSize: 13,
    textAlign: 'center',
  },
  botonSecundario: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  botonSecundarioText: { color: colors.gold, letterSpacing: 1 },

  // Estilos del modo pujar
  montoLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    letterSpacing: 2,
    textAlign: 'center',
  },
  montoGrande: {
    color: colors.gold,
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  limitesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  limiteLabel: { color: colors.textMuted, fontSize: 10, letterSpacing: 1 },
  limiteValor: { color: colors.textPrimary, fontSize: 14 },
  sinLimite: {
    color: colors.gold,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  botonPujar: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  botonPujarText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  errorText: { color: colors.error, marginBottom: 16 },
  retryButton: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryText: { color: colors.gold, letterSpacing: 1 },
  historialBox: {
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 12,
  padding: 16,
  marginBottom: 20,
},
historialTitulo: {
  color: colors.textSecondary,
  fontSize: 10,
  letterSpacing: 1,
  marginBottom: 12,
},
historialItem: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingVertical: 8,
  borderBottomWidth: 0.5,
  borderBottomColor: colors.border,
},
historialItemMio: {
  backgroundColor: 'rgba(201,168,76,0.08)',
  borderRadius: 8,
  paddingHorizontal: 8,
  marginHorizontal: -8,
},
historialPostor: {
  color: colors.textSecondary,
  fontSize: 13,
},
historialMonto: {
  color: colors.textPrimary,
  fontSize: 13,
  fontWeight: '600',
},
historialMioText: {
  color: colors.gold,
  fontWeight: 'bold',
},
remateBox: {
  backgroundColor: '#1a0a0a',
  borderWidth: 1,
  borderColor: 'rgba(255,68,68,0.4)',
  borderRadius: 14,
  padding: 20,
  alignItems: 'center',
  marginBottom: 20,
},
remateDot: {
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: colors.error,
  marginBottom: 8,
},
remateLabel: {
  color: colors.error,
  fontSize: 11,
  letterSpacing: 2,
  fontWeight: 'bold',
},
remateCountdown: {
  color: colors.error,
  fontSize: 48,
  fontWeight: 'bold',
  marginVertical: 4,
},
remateSubtexto: {
  color: colors.textMuted,
  fontSize: 12,
},
resultadoBox: {
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.gold,
  borderRadius: 14,
  padding: 28,
  alignItems: 'center',
  marginBottom: 20,
},
resultadoIcono: {
  fontSize: 48,
  marginBottom: 12,
},
resultadoTitulo: {
  color: colors.textPrimary,
  fontSize: 22,
  fontWeight: 'bold',
  marginBottom: 8,
},
resultadoMonto: {
  color: colors.gold,
  fontSize: 28,
  fontWeight: 'bold',
  marginBottom: 8,
},
resultadoTexto: {
  color: colors.textSecondary,
  fontSize: 13,
  textAlign: 'center',
},
});