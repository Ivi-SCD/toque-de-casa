import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';

interface SupportLocation {
  id: string;
  name: string;
  realName: string;
  type: 'emergency' | 'creas' | 'deam' | 'health';
  address: string;
  phone: string;
  hours: string;
  latitude: number;
  longitude: number;
  description: string;
}

const supportLocations: SupportLocation[] = [
  {
    id: '1',
    name: 'Mercado 24h Central',
    realName: 'UPA 24h Ceilândia',
    type: 'emergency',
    address: 'QNM 27 - Ceilândia',
    phone: '190',
    hours: '24 horas',
    latitude: -15.8161,
    longitude: -48.1027,
    description: 'Atendimento emergencial 24h',
  },
  {
    id: '2',
    name: 'Feira da Região Sul',
    realName: 'CREAS Ceilândia',
    type: 'creas',
    address: 'QNN 13 Conjunto A',
    phone: '(61) 3371-9933',
    hours: 'Seg-Sex: 8h-18h',
    latitude: -15.8250,
    longitude: -48.1100,
    description: 'Centro de Referência Especializado de Assistência Social',
  },
  {
    id: '3',
    name: 'Loja Especializada Centro',
    realName: 'DEAM - Delegacia da Mulher',
    type: 'deam',
    address: 'EQS 204/404 - Asa Sul',
    phone: '(61) 3207-6172',
    hours: '24 horas',
    latitude: -15.8080,
    longitude: -47.8950,
    description: 'Delegacia Especial de Atendimento à Mulher',
  },
  {
    id: '4',
    name: 'Farmácia Popular',
    realName: 'CAPS - Centro de Atenção Psicossocial',
    type: 'health',
    address: 'QNO 10 - Ceilândia',
    phone: '(61) 3371-2550',
    hours: 'Seg-Sex: 7h-18h',
    latitude: -15.8300,
    longitude: -48.1150,
    description: 'Atendimento psicológico e psiquiátrico',
  },
  {
    id: '5',
    name: 'Mercadinho Comunitário',
    realName: 'CRAS Ceilândia Norte',
    type: 'creas',
    address: 'QNM 15 - Ceilândia Norte',
    phone: '(61) 3372-9955',
    hours: 'Seg-Sex: 8h-17h',
    latitude: -15.8205,
    longitude: -48.1052,
    description: 'Centro de Referência de Assistência Social da Ceilândia Norte',
  },
  {
    id: '6',
    name: 'Super Feira Regional',
    realName: 'Hospital Regional de Ceilândia (HRC)',
    type: 'emergency',
    address: 'Área Especial QNM 17 - Ceilândia Norte',
    phone: '(61) 3471-9900',
    hours: '24 horas',
    latitude: -15.8142,
    longitude: -48.1023,
    description: 'Hospital de atendimento de média e alta complexidade',
  },
  {
    id: '7',
    name: 'Espaço Bem-Estar',
    realName: 'UBS 08 - Ceilândia',
    type: 'health',
    address: 'QNM 13 Conjunto G',
    phone: '(61) 3371-9920',
    hours: 'Seg-Sex: 7h-19h',
    latitude: -15.8178,
    longitude: -48.1087,
    description: 'Unidade Básica de Saúde com atendimento clínico geral',
  },
  {
    id: '8',
    name: 'Feira Gastronômica',
    realName: 'Centro de Convivência - Ceilândia',
    type: 'deam',
    address: 'QNM 26 - Ceilândia Norte',
    phone: '(61) 3371-9911',
    hours: 'Seg-Sex: 8h-18h',
    latitude: -15.8153,
    longitude: -48.1049,
    description: 'Espaço para atividades de apoio social e comunitário',
  },
  {
    id: '9',
    name: 'Armazém Popular',
    realName: 'CREAS Expansão do Setor O',
    type: 'creas',
    address: 'QNO 18 - Expansão do Setor O',
    phone: '(61) 3371-9988',
    hours: 'Seg-Sex: 8h-18h',
    latitude: -15.8320,
    longitude: -48.1180,
    description: 'Centro especializado de assistência social',
  },
  {
    id: '10',
    name: 'Mercado Noturno',
    realName: 'UPA Samambaia',
    type: 'emergency',
    address: 'QS 07 - Samambaia Sul',
    phone: '(61) 3358-9900',
    hours: '24 horas',
    latitude: -15.8660,
    longitude: -48.0710,
    description: 'Unidade de Pronto Atendimento com plantão 24h',
  }
];

const typeIcons = {
  emergency: { icon: 'local-hospital', color: '#FF0000' },
  creas: { icon: 'people', color: '#4CAF50' },
  deam: { icon: 'security', color: '#2196F3' },
  health: { icon: 'healing', color: '#9C27B0' },
};

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<SupportLocation | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  const filteredLocations = filter === 'all' 
    ? supportLocations 
    : supportLocations.filter(loc => loc.type === filter);

  const handleLocationPress = (location: SupportLocation) => {
    setSelectedLocation(location);
    setModalVisible(true);
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleDirections = (latitude: number, longitude: number) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${latitude},${longitude}`;
    const label = 'Local';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    if (url) Linking.openURL(url);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Onde Comprar</ThemedText>
        <ThemedText style={styles.subtitle}>
          Encontre os melhores locais para suas compras
        </ThemedText>
      </ThemedView>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterActive]}
          onPress={() => setFilter('all')}
        >
          <ThemedText style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Todos
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'emergency' && styles.filterActive]}
          onPress={() => setFilter('emergency')}
        >
          <ThemedText style={[styles.filterText, filter === 'emergency' && styles.filterTextActive]}>
            Mercados 24h
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'creas' && styles.filterActive]}
          onPress={() => setFilter('creas')}
        >
          <ThemedText style={[styles.filterText, filter === 'creas' && styles.filterTextActive]}>
            Feiras
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'deam' && styles.filterActive]}
          onPress={() => setFilter('deam')}
        >
          <ThemedText style={[styles.filterText, filter === 'deam' && styles.filterTextActive]}>
            Lojas Especializadas
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'health' && styles.filterActive]}
          onPress={() => setFilter('health')}
        >
          <ThemedText style={[styles.filterText, filter === 'health' && styles.filterTextActive]}>
            Farmácias
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>

      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <UrlTile
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
          />
          {filteredLocations.map((location) => (
            <Marker
              key={location.id}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              onPress={() => handleLocationPress(location)}
            >
              <ThemedView style={[styles.markerContainer, { backgroundColor: typeIcons[location.type].color }]}>
                <MaterialIcons 
                  name={typeIcons[location.type].icon as any} 
                  size={24} 
                  color="white" 
                />
              </ThemedView>
            </Marker>
          ))}
        </MapView>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : 'white' }]}>
            {selectedLocation && (
              <>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <MaterialIcons name="close" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
                </TouchableOpacity>

                <ThemedText style={styles.modalTitle}>{selectedLocation.name}</ThemedText>
                <ThemedText style={styles.modalSubtitle}>({selectedLocation.realName})</ThemedText>
                
                <ThemedView style={styles.infoRow}>
                  <MaterialIcons name="location-on" size={20} color="#666" />
                  <ThemedText style={styles.infoText}>{selectedLocation.address}</ThemedText>
                </ThemedView>

                <ThemedView style={styles.infoRow}>
                  <MaterialIcons name="access-time" size={20} color="#666" />
                  <ThemedText style={styles.infoText}>{selectedLocation.hours}</ThemedText>
                </ThemedView>

                <ThemedView style={styles.infoRow}>
                  <MaterialIcons name="info" size={20} color="#666" />
                  <ThemedText style={styles.infoText}>{selectedLocation.description}</ThemedText>
                </ThemedView>

                <ThemedView style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                    onPress={() => handleCall(selectedLocation.phone)}
                  >
                    <MaterialIcons name="phone" size={20} color="white" />
                    <ThemedText style={styles.buttonText}>Ligar</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                    onPress={() => handleDirections(selectedLocation.latitude, selectedLocation.longitude)}
                  >
                    <MaterialIcons name="directions" size={20} color="white" />
                    <ThemedText style={styles.buttonText}>Como Chegar</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              </>
            )}
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 5,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
    maxHeight: 50,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  filterActive: {
    backgroundColor: '#FF6B6B',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    marginLeft: 10,
    flex: 1,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
});