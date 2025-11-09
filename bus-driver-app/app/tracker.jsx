import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Button, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

// The URL of your local server.
const SERVER_URL = 'http://localhost:3000/location';

export default function TrackerPage() {
  const [busId, setBusId] = useState('Bus-123'); // Assume Bus ID is set after login
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showRouteModal, setShowRouteModal] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [timer, setTimer] = useState(5);
  const router = useRouter();

  // Sample routes data.
  const routes = [
    { id: 'Route-1', name: 'Vijayawada to Hyderabad' },
    { id: 'Route-2', name: 'Vijayawada to Visakhapatnam' },
  ];

  // Request location permissions when the app starts
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
      }
    })();
  }, []);

  // Effect for location tracking and sending data
  useEffect(() => {
    let locationSubscription;

    const startLocationTracking = async () => {
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 5000,
          distanceInterval: 1,
        },
        (loc) => {
          setLocation(loc.coords);

          const data = {
            busId: busId,
            routeId: selectedRoute.id,
            timestamp: loc.timestamp,
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            speed: loc.coords.speed,
            heading: loc.coords.heading, 
          };
          
          fetch(SERVER_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })
          .then(response => response.json())
          .then(resData => console.log('Server response:', resData))
          .catch(error => console.error('Failed to send data:', error));
        }
      );
    };

    if (selectedRoute) {
      startLocationTracking();
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [selectedRoute]);

  // Effect for the countdown timer
  useEffect(() => {
    let timerInterval;
    if (selectedRoute) {
      timerInterval = setInterval(() => {
        setTimer(prevTimer => (prevTimer > 1 ? prevTimer - 1 : 5));
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [selectedRoute]);

  const handleLogout = () => {
    router.replace('/login');
  };

  const handleRouteSelection = (route) => {
    setSelectedRoute(route);
    setShowRouteModal(false);
  };

  const speedKmh = location && location.speed !== -1 ? (location.speed * 3.6).toFixed(2) : 'N/A';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bus Tracker Active</Text>
      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
      
      {showRouteModal && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showRouteModal}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Select Your Route</Text>
              {routes.map((route) => (
                <Pressable
                  key={route.id}
                  style={styles.buttonRoute}
                  onPress={() => handleRouteSelection(route)}
                >
                  <Text style={styles.textStyle}>{route.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Modal>
      )}

      {location && selectedRoute ? (
        <View style={styles.locationContainer}>
          <Text style={styles.text}>Bus ID: {busId}</Text>
          <Text style={styles.text}>Route: {selectedRoute.name}</Text>
          <Text style={styles.text}>Latitude: {location.latitude.toFixed(6)}</Text>
          <Text style={styles.text}>Longitude: {location.longitude.toFixed(6)}</Text>
          <Text style={styles.text}>Heading: {location.heading !== -1 ? `${location.heading.toFixed(2)}°` : 'N/A'}</Text>
          <Text style={styles.text}>Speed: {speedKmh} km/h</Text>
          <Text style={styles.status}>Next update in: {timer}s</Text>
        </View>
      ) : (
        <Text style={styles.text}>Waiting for location and route selection...</Text>
      )}

      <View style={styles.controls}>
        <Button title="Change Route" onPress={() => setShowRouteModal(true)} disabled={!selectedRoute} />
        <Button title="Logout" onPress={handleLogout} color="red" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
  status: {
    fontSize: 14,
    color: 'green',
    marginTop: 10,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonRoute: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginVertical: 5,
    width: 200,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  locationContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20,
  }
});
