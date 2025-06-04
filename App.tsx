import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.logoContainer}>
        <Image
          source={require('./assets/logo-neutrino.png')} // coloque o logo aqui
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.equipe}>Equipe Neutrino</Text>
      <Text style={styles.coordenador}>Coordenador: Wilson Felix</Text>

      <Text style={styles.titulo}>Primeiro Aperfeiçoamento Prático</Text>
      <Text style={styles.data}>05/06/2025</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    maxWidth: 720,
    alignSelf: 'center',
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  equipe: {
    textAlign: 'center',
    color: '#4B5563', // equivalente ao tailwind text-gray-600
    marginBottom: 4,
    fontSize: 18,
  },
  coordenador: {
    textAlign: 'center',
    color: '#6B7280', // equivalente ao tailwind text-gray-500
    marginBottom: 20,
    fontSize: 16,
  },
  titulo: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  data: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
});
