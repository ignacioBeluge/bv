import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function MisPujasScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Mis Pujas</Text>
      <Text style={styles.texto}>Acá vas a ver tus participaciones en subastas.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 60 },
  titulo: { color: colors.textPrimary, fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  texto: { color: colors.textMuted, fontSize: 14 },
});