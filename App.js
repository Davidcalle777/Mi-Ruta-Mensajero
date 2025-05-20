import { useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Colores corporativos
const coloresCorporativos = {
  verde: '#2E7D32',
  azulRey: '#0033A0',
  gris: '#666666',
  fondo: '#F5F5F5',
  textoClaro: '#ffffff'
};

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
  if (a.tipo !== b.tipo) return a.tipo.localeCompare(b.tipo);
  if (a.viaNum !== b.viaNum) return a.viaNum - b.viaNum;
  if (a.viaLetra !== b.viaLetra) return a.viaLetra.localeCompare(b.viaLetra);
  if (a.interseccionNum !== b.interseccionNum) return a.interseccionNum - b.interseccionNum;
  if (a.interseccionLetra !== b.interseccionLetra) return a.interseccionLetra.localeCompare(b.interseccionLetra);
  return a.puerta - b.puerta;
}

export default function App() {
  const [direccion, setDireccion] = useState('');
  const [direcciones, setDirecciones] = useState([]);
  const [ascendente, setAscendente] = useState(true);

  const agregarDireccion = () => {
    const dirTrimmed = direccion.trim();
    if (dirTrimmed === '') return;
    const yaExiste = direcciones.some(d => d.trim().toLowerCase() === dirTrimmed.toLowerCase());
    if (yaExiste) {
      setDireccion('');
      return;
    }
    setDirecciones([...direcciones, dirTrimmed]);
    setDireccion('');
  };

  const borrarDireccion = (index) => {
    const nuevas = [...direcciones];
    nuevas.splice(index, 1);
    setDirecciones(nuevas);
  };

  const ordenarDirecciones = () => {
    const parseadas = direcciones.map(d => ({
      original: d,
      parsed: parseDireccionPrecisa(d),
    }));
    const conParseo = parseadas.filter(d => d.parsed !== null);
    const sinParseo = parseadas.filter(d => d.parsed === null);

    conParseo.sort((a, b) =>
      ascendente
        ? compararDirecciones(a.parsed, b.parsed)
        : compararDirecciones(b.parsed, a.parsed)
    );

    setDirecciones([...conParseo, ...sinParseo].map(d => d.original));
    setAscendente(!ascendente);
  };

  const borrarTodo = () => setDirecciones([]);

  const abrirNavegador = (direccion, navegador) => {
    const query = encodeURIComponent(direccion + ', Medellín, Colombia');
    const url =
      navegador === 'google'
        ? `https://www.google.com/maps/search/?api=1&query=${query}`
        : `https://waze.com/ul?q=${query}`;

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

        <TouchableOpacity style={styles.addButton} onPress={agregarDireccion}>
          <Text style={styles.buttonText}>Agregar Dirección</Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={ordenarDirecciones}>
            <Text style={styles.buttonText}>
              Ordenar ({ascendente ? 'Asc' : 'Desc'})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dangerButton} onPress={borrarTodo}>
            <Text style={styles.buttonText}>Borrar Todo</Text>
          </TouchableOpacity>
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
    backgroundColor: coloresCorporativos.fondo,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: coloresCorporativos.azulRey,
  },
  input: {
    borderWidth: 1,
    borderColor: coloresCorporativos.gris,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: coloresCorporativos.verde,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginVertical: 10,
  },
  secondaryButton: {
    backgroundColor: coloresCorporativos.azulRey,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flex: 1,
    alignItems: 'center',
    marginRight: 5,
  },
  dangerButton: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flex: 1,
    alignItems: 'center',
    marginLeft: 5,
  },
  buttonText: {
    color: coloresCorporativos.textoClaro,
    fontSize: 14,
    fontWeight: 'bold',
  },
  item: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  dir: {
    fontSize: 16,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 5,
    alignItems: 'center',
  },
  link: {
    color: coloresCorporativos.azulRey,
    textDecorationLine: 'underline',
    marginHorizontal: 5,
  },
  deleteButton: {
    backgroundColor: '#999',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
  },
});
