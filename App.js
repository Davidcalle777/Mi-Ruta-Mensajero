import { Camera } from 'expo-camera';
import * as TextRecognition from 'expo-text-recognition';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function App() {
  const [direccion, setDireccion] = useState('');
  const [direcciones, setDirecciones] = useState([]);
  const [mostrarCamara, setMostrarCamara] = useState(false);
  const [permisoCamara, setPermisoCamara] = useState(null);
  const [camaraLista, setCamaraLista] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setPermisoCamara(status === 'granted');
    })();
  }, []);

  const agregarDireccion = () => {
    const dir = direccion.trim();
    if (dir && !direcciones.includes(dir)) {
      setDirecciones([...direcciones, dir]);
    }
    setDireccion('');
  };

  const escanearDireccion = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync();
      const result = await TextRecognition.recognize(photo.uri);
      const texto = result.join(' ');
      const match = texto.match(/\b(Calle|Cra|Cl|Diagonal|Transversal)\s*\d+.*?#\s*\d+.*?-?\s*\d+/i);
      if (match) {
        setDireccion(match[0]);
        Alert.alert("Dirección detectada", match[0]);
      } else {
        Alert.alert("No se detectó una dirección válida.");
      }
      setMostrarCamara(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Hubo un problema al capturar la imagen.");
      setMostrarCamara(false);
    }
  };

  const abrirMapa = (direccion, app) => {
    const query = encodeURIComponent(direccion + ', Medellín, Colombia');
    const url =
      app === 'google'
        ? `https://www.google.com/maps/search/?api=1&query=${query}`
        : `https://waze.com/ul?q=${query}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("No se pudo abrir el navegador.")
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📍 Mi Ruta Mensajero</Text>

      <TextInput
        style={styles.input}
        placeholder="Ingresa una dirección"
        value={direccion}
        onChangeText={setDireccion}
      />

      <TouchableOpacity style={styles.button} onPress={agregarDireccion}>
        <Text style={styles.buttonText}>Agregar Dirección</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#007AFF' }]}
        onPress={() => {
          if (permisoCamara) {
            setMostrarCamara(true);
          } else {
            Alert.alert("Permiso", "Permiso de cámara denegado.");
          }
        }}
      >
        <Text style={styles.buttonText}>📷 Escanear Dirección</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#d9534f' }]}
        onPress={() => setDirecciones([])}
      >
        <Text style={styles.buttonText}>Borrar Todo</Text>
      </TouchableOpacity>

      {direcciones.map((dir, i) => (
        <View key={i} style={styles.item}>
          <Text>{dir}</Text>
          <View style={styles.navButtons}>
            <TouchableOpacity onPress={() => abrirMapa(dir, 'google')}>
              <Text style={styles.link}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => abrirMapa(dir, 'waze')}>
              <Text style={styles.link}>Waze</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                const nuevo = [...direcciones];
                nuevo.splice(i, 1);
                setDirecciones(nuevo);
              }}
            >
              <Text style={styles.linkDanger}>Borrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Modal de cámara */}
      <Modal visible={mostrarCamara} animationType="slide">
        <View style={{ flex: 1 }}>
          {permisoCamara ? (
            <>
              <Camera
                ref={cameraRef}
                style={{ flex: 1 }}
                onCameraReady={() => setCamaraLista(true)}
              />
              {camaraLista && (
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={escanearDireccion}
                >
                  <Text style={{ color: '#fff' }}>📸 Capturar</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setCamaraLista(false);
                  setMostrarCamara(false);
                }}
              >
                <Text style={{ color: '#333' }}>Cerrar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={{ padding: 20, color: 'red' }}>
              Permiso de cámara no concedido
            </Text>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  button: {
    backgroundColor: 'green',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  item: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  link: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  linkDanger: {
    color: 'red',
    fontWeight: 'bold',
  },
  captureButton: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 50,
  },
  closeButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 50,
  },
});
