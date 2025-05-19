import { useState } from 'react';
import { Alert, Button, Linking, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function App() {
  const [direccion, setDireccion] = useState('');
  const [direcciones, setDirecciones] = useState([]);
  const [ascendente, setAscendente] = useState(true);

  const agregarDireccion = () => {
    if (direccion.trim() === '') return;
    setDirecciones([...direcciones, direccion.trim()]);
    setDireccion('');
  };

  const ordenarDirecciones = () => {
  const TIPOS_ORDEN = ['avenida', 'av', 'carrera', 'cra', 'calle', 'cl', 'diagonal', 'dg', 'transversal', 'tv', 'circular', 'cir', 'otros'];

  const normalizarTipo = (texto) => {
    const tipoEncontrado = TIPOS_ORDEN.find(tipo => texto.startsWith(tipo));
    return tipoEncontrado || 'otros';
  };

  const parseDireccion = (dir) => {
    const texto = dir.toLowerCase().replace(/\./g, '').trim();

    const tipo = normalizarTipo(texto);
    const tipoIndex = TIPOS_ORDEN.indexOf(tipo);

    const matchNumero = texto.match(/\d+/);
    const numero = matchNumero ? parseInt(matchNumero[0]) : 0;

    const matchCasa = texto.match(/#\s*(\d+)/);
    const numeroCasa = matchCasa ? parseInt(matchCasa[1]) : 0;

    return {
      tipo,
      tipoIndex,
      numero,
      numeroCasa,
      original: dir,
    };
  };

  const ordenadas = [...direcciones]
    .map(parseDireccion)
    .sort((a, b) => {
      if (a.tipoIndex !== b.tipoIndex) {
        return ascendente ? a.tipoIndex - b.tipoIndex : b.tipoIndex - a.tipoIndex;
      }
      if (a.numero !== b.numero) {
        return ascendente ? a.numero - b.numero : b.numero - a.numero;
      }
      return ascendente ? a.numeroCasa - b.numeroCasa : b.numeroCasa - a.numeroCasa;
    })
    .map(d => d.original);

  setDirecciones(ordenadas);
  setAscendente(!ascendente);
};


  const borrarTodo = () => {
    if (Platform.OS === 'web') {
      if (window.confirm("¿Borrar todas las direcciones?")) {
        setDirecciones([]);
      }
    } else {
      Alert.alert("Confirmar", "¿Borrar todas las direcciones?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Borrar", onPress: () => setDirecciones([]) }
      ]);
    }
  };

  const abrirNavegador = (direccion, navegador) => {
    const query = encodeURIComponent(direccion + ', Valle de Aburrá, Colombia');
    let url = '';

    if (navegador === 'google') {
      url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    } else if (navegador === 'waze') {
      url = `https://waze.com/ul?q=${query}`;
    }

    Linking.openURL(url).catch(err => Alert.alert("Error", "No se pudo abrir el navegador"));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📍 Mi Ruta Mensajero</Text>

      <TextInput
        style={styles.input}
        placeholder="Ingresa dirección"
        value={direccion}
        onChangeText={setDireccion}
      />

      <Button title="Agregar Dirección" onPress={agregarDireccion} />

      <View style={styles.buttonRow}>
        <Button title={`Ordenar (${ascendente ? 'A-Z' : 'Z-A'})`} onPress={ordenarDirecciones} />
        <Button title="Borrar Todo" color="red" onPress={borrarTodo} />
      </View>

      {direcciones.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>
          No hay direcciones registradas.
        </Text>
      ) : (
        direcciones.map((item, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.dir}>{item}</Text>
            <View style={styles.navButtons}>
              <TouchableOpacity onPress={() => abrirNavegador(item, 'google')}>
                <Text style={styles.link}>Google Maps</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => abrirNavegador(item, 'waze')}>
                <Text style={styles.link}>Waze</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#ffffff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#004d66' },
  input: { borderWidth: 1, borderColor: '#aaa', padding: 10, borderRadius: 10, marginBottom: 10 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  item: { backgroundColor: '#fff', padding: 10, borderRadius: 10, marginVertical: 5 },
  dir: { fontSize: 16 },
  navButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 5 },
  link: { color: '#0066cc', textDecorationLine: 'underline' },
});
