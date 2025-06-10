import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';

const PatientHeader = () => (
  <View style={styles.header}>
    <StatusBar backgroundColor="#00a69d" />
    <View style={styles.content}>
      <Text style={styles.name}>Nombre Paciente</Text>
      <Text style={styles.description}>Descripción Paciente</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#00a69d',
    paddingTop: StatusBar.currentHeight,
  },
  content: {
    padding: 16,
    paddingBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  description: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
});

export default PatientHeader;