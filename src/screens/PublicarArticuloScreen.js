import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, StyleSheet,
  Alert, ActivityIndicator, ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { publicarArticulo } from '../api/articulos';

const MIN_FOTOS = 6;
const MAX_FOTOS = 10;

export default function PublicarArticuloScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fotos, setFotos] = useState([]);   // array de objetos {uri, base64}
  const [declaraPropiedad, setDeclaraPropiedad] = useState(false);
  const [declaraOrigen, setDeclaraOrigen] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Agregar una foto desde galería (más estable que cámara)
  async function agregarFoto() {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la galería');
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.3,
      allowsEditing: false,
    });
    if (!resultado.canceled) {
      setFotos([...fotos, resultado.assets[0]]);
    }
  }

  function quitarFoto(index) {
    setFotos(fotos.filter((_, i) => i !== index));
  }

  async function handlePublicar() {
    // Validaciones
    if (!nombre.trim() || !descripcion.trim()) {
      Alert.alert('Campos incompletos', 'Completá nombre y descripción');
      return;
    }
    if (fotos.length < MIN_FOTOS) {
      Alert.alert('Faltan fotos', `Necesitás al menos ${MIN_FOTOS} fotos (tenés ${fotos.length})`);
      return;
    }
    if (!declaraPropiedad || !declaraOrigen) {
      Alert.alert('Declaraciones', 'Debés aceptar ambas declaraciones juradas');
      return;
    }

    setCargando(true);
    try {
      await publicarArticulo({
        nombre,
        descripcion,
        fotos: fotos.map((f) => f.base64),
        declaraPropiedad,
        declaraOrigenLicito: declaraOrigen,
      });
      Alert.alert(
        '¡Artículo enviado!',
        'Tu artículo está en revisión por la empresa.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      const mensaje = e.response?.data?.mensaje || 'No se pudo publicar el artículo';
      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>‹ Volver</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>Publicar artículo</Text>

      <Text style={styles.label}>NOMBRE DEL ARTÍCULO</Text>
      <TextInput
        style={styles.input}
        placeholder="Reloj Omega Vintage"
        placeholderTextColor={colors.textMuted}
        value={nombre}
        onChangeText={setNombre}
      />

      <Text style={styles.label}>DESCRIPCIÓN</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Describí el artículo, su estado, antigüedad..."
        placeholderTextColor={colors.textMuted}
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
        numberOfLines={4}
      />

      {/* Fotos */}
      <Text style={styles.label}>FOTOS ({fotos.length} — mínimo {MIN_FOTOS}, máximo {MAX_FOTOS})</Text>
      <View style={styles.fotosGrid}>
        {fotos.map((foto, index) => (
          <View key={index} style={styles.fotoItem}>
            <Image source={{ uri: foto.uri }} style={styles.fotoThumb} />
            <TouchableOpacity
              style={styles.quitarFoto}
              onPress={() => quitarFoto(index)}
            >
              <Text style={styles.quitarFotoText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        {/* Botón agregar — solo si no se alcanzó el máximo */}
        {fotos.length < MAX_FOTOS && (
          <TouchableOpacity style={styles.agregarFoto} onPress={agregarFoto}>
            <Text style={styles.agregarFotoIcono}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Declaraciones juradas */}
      <TouchableOpacity
        style={styles.checkRow}
        onPress={() => setDeclaraPropiedad(!declaraPropiedad)}
      >
        <View style={[styles.checkbox, declaraPropiedad && styles.checkboxActivo]}>
          {declaraPropiedad && <Text style={styles.checkboxCheck}>✓</Text>}
        </View>
        <Text style={styles.checkText}>
          Declaro bajo juramento ser el legítimo propietario del artículo
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.checkRow}
        onPress={() => setDeclaraOrigen(!declaraOrigen)}
      >
        <View style={[styles.checkbox, declaraOrigen && styles.checkboxActivo]}>
          {declaraOrigen && <Text style={styles.checkboxCheck}>✓</Text>}
        </View>
        <Text style={styles.checkText}>
          Declaro que el origen del artículo es lícito
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handlePublicar}
        disabled={cargando}
      >
        {cargando ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.buttonText}>ENVIAR SOLICITUD</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 50 },
  back: { color: colors.gold, fontSize: 16, marginBottom: 16 },
  titulo: { color: colors.textPrimary, fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  label: {
    color: colors.textSecondary, fontSize: 11, letterSpacing: 2,
    marginBottom: 8, marginTop: 16,
  },
  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, padding: 14, color: colors.textPrimary, fontSize: 14,
  },
  textarea: { height: 100, textAlignVertical: 'top' },
  fotosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  fotoItem: { position: 'relative' },
  fotoThumb: { width: 80, height: 80, borderRadius: 10 },
  quitarFoto: {
    position: 'absolute', top: -6, right: -6,
    backgroundColor: colors.error, borderRadius: 10,
    width: 20, height: 20, alignItems: 'center', justifyContent: 'center',
  },
  quitarFotoText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  agregarFoto: {
    width: 80, height: 80, borderRadius: 10,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center',
  },
  agregarFotoIcono: { color: colors.gold, fontSize: 28 },
  checkRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20,
  },
  checkbox: {
    width: 24, height: 24, borderRadius: 6,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxActivo: { backgroundColor: colors.gold, borderColor: colors.gold },
  checkboxCheck: { color: colors.background, fontWeight: 'bold' },
  checkText: { color: colors.textSecondary, fontSize: 13, flex: 1 },
  button: {
    backgroundColor: colors.gold, borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 32,
  },
  buttonText: { color: colors.background, fontWeight: 'bold', fontSize: 15, letterSpacing: 2 },
});