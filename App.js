import { useState } from 'react';
import {
  Button,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';

function parseDireccionPrecisa(direccion) {
  const regex = /\b(Calle|Cl|Cll|Carrera|Cra|Cr|Diagonal|Dg|Transversal|Tv)\s*(\d+)\s*([A-Z]{0,3})?\s*#\s*(\d+)\s*([A-Z]{0,3})?\s*(?:-|)?\s*(\d+)/i;
  const match = direccion.match(regex);
  if (!match) return null;

  let tipo = match[1].toLowerCase();
  const viaNum = parseInt(match[2]);
  const viaLetra = (match[3] || '').toUpperCase();
  const interseccionNum = parseInt(match[4]);
  const interseccionLetra = (match[5] || '').toUpperCase();
  const puerta = parseInt(match[6]);

  const normalizados = {
    'cl': 'Calle',
    'cll': 'Calle',
    'calle': 'Calle',
    'cra': 'Carrera',
    'cr': 'Carrera',
    'carrera': 'Carrera',
    'dg': 'Diagonal',
    'diagonal': 'Diagonal',
    'tv': 'Transversal',
    'transversal': 'Transversal'
  };

  tipo = normalizados[tipo] || tipo;

  let calle = null;
  let carrera = null;

  if (tipo === 'Calle') {
    calle = viaNum;
    carrera = interseccionNum;
  } else if (tipo === 'Carrera') {
    carrera = viaNum;
    calle = interseccionNum;
  }

  return {
    original: direccion,
    tipo,
    viaNum,
    viaLetra,
    interseccionNum,
    interseccionLetra,
    puerta,
    calle,
    carrera
  };
}

function compararDirecciones(a, b) {
  if (a.tipo !== b.tipo) {
    return a.tipo.localeCompare(b.tipo);
  }

  if (a.viaNum !== b.viaNum) {
    return a.viaNum - b.viaNum;
  }

  if (a.viaLetra !== b.viaLetra) {
    return a.viaLetra.localeCompare(b.viaLetra);
  }

  if (a.interseccionNum !== b.interseccionNum) {
    return a.interseccionNum - b.interseccionNum;
  }

  if (a.interseccionLetra !== b.interseccionLetra) {
    return a.interseccionLetra.localeCompare(b.interseccionLetra);
  }

  return a.puerta - b.puerta;
}

export default function App() {
  const [direccion, setDireccion] = useState('');
  const [direcciones, setDirecciones] = useState([]);
  const [ascendente, setAscendente] = useState(true);

  const agregarDireccion = () => {
    const dirTrimmed = direccion.trim();

    if (dirTrimmed === '') return;

    // Verificar si ya existe (sin alertas)
    const yaExiste = direcciones.some(d => d.trim().toLowerCase() === dirTrimmed.toLowerCase());
    if (yaExiste) {
      setDireccion('');
      return;
    }

    setDirecciones([...direcciones, dirTrimmed]);
    setDireccion('');
  };

  const borrarDireccion = (index) => {
    const nuevasDirecciones = [...direcciones];
    nuevasDirecciones.splice(index, 1);
    setDirecciones(nuevasDirecciones);
  };

  const ordenarDirecciones = () => {
    const direccionesParseadas = direcciones.map(d => ({
      original: d,
      parsed: parseDireccionPrecisa(d),
    }));

    const conParseo = direccionesParseadas.filter(d => d.parsed !== null);
    const sinParseo = direccionesParseadas.filter(d => d.parsed === null);

    conParseo.sort((a, b) =>
      ascendente
        ? compararDirecciones(a.parsed, b.parsed)
        : compararDirecciones(b.parsed, a.parsed)
    );

    const listaOrdenada = [...conParseo, ...sinParseo].map(d => d.original);

    setDirecciones(listaOrdenada);
    setAscendente(!ascendente);
  };

  const borrarTodo = () => {
    setDirecciones([]);
  };

  const abrirNavegador = (direccion, navegador) => {
    const query = encodeURIComponent(direccion + ', Medellín, Colombia');
    let url = '';

    if (navegador === 'google') {
      url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    } else if (navegador === 'waze') {
      url = `https://waze.com/ul?q=${query}`;
    }

    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "No se pudo abrir el navegador")
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
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
          <Button title={`Ordenar (${ascendente ? 'Asc' : 'Desc'})`} onPress={ordenarDirecciones} />
          <Button title="Borrar Todo" onPress={borrarTodo} />
        </View>

        {direcciones.map((item, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.dir}>{item}</Text>
            <View style={styles.navButtons}>
              <TouchableOpacity onPress={() => abrirNavegador(item, 'google')}>
                <Text style={styles.link}>Google Maps</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => abrirNavegador(item, 'waze')}>
                <Text style={styles.link}>Waze</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => borrarDireccion(index)}>
                <Text style={styles.deleteButtonText}>Borrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#004d66',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  item: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  dir: {
    fontSize: 16,
    flexShrink: 1,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 5,
    alignItems: 'center',
  },
  link: {
    color: '#0066cc',
    textDecorationLine: 'underline',
    marginHorizontal: 5,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});
