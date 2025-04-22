<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import CountdownTimer from '../components/shared/CountdownTimer.vue';
import 'leaflet/dist/leaflet.css';
// Fix TypeScript errors by using non-typed import for Leaflet
import L from 'leaflet';

const router = useRouter();
const timerRef = ref<InstanceType<typeof CountdownTimer> | null>(null);

// Map related variables
const mapContainer = ref<HTMLElement | null>(null);
const map = ref<any>(null); // Using any to avoid TypeScript errors with Leaflet
const userMarker = ref<any>(null);
const clickMarker = ref<any>(null);
const searchRadiusCircle = ref<any>(null);

// Geolocation API related variables
const isGeolocationSupported = ref(!!navigator.geolocation);
const userLocation = ref<{ latitude: number; longitude: number } | null>(null);
const targetLocation = ref<{ latitude: number; longitude: number } | null>(null);
const distance = ref<number | null>(null);
const errorMessage = ref('');
const isLocationLoading = ref(true);

// Define custom marker icons
function createMapIcons() {
  return {
    userIcon: L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })
  };
}

// Computed property to determine if user is close enough to the target
const isCloseEnough = computed(() => {
  return distance.value !== null && distance.value <= 50; // 50 meters threshold
});

// Calculate distance between two points using the Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Generate a random point within 1km of user's location
function generateTargetLocation(latitude: number, longitude: number) {
  // 1km in degrees is approximately 0.009 degrees for latitude
  // For longitude, it depends on the latitude (adjust for Earth's curvature)
  const latOffset = (Math.random() - 0.5) * 0.018; // +/- 0.009 degrees (~1km)
  const lngFactor = Math.cos(latitude * Math.PI / 180);
  const lngOffset = (Math.random() - 0.5) * (0.018 / lngFactor); // Adjust for latitude
  
  targetLocation.value = {
    latitude: latitude + latOffset,
    longitude: longitude + lngOffset
  };
}

// Initialize the Leaflet map
function initMap(latitude: number, longitude: number) {
  if (!mapContainer.value) return;
  
  // Create the map
  map.value = L.map(mapContainer.value).setView([latitude, longitude], 15);
  
  // Add the OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map.value);

  const { userIcon } = createMapIcons();
  
  // Add a marker for the user's position
  userMarker.value = L.marker([latitude, longitude], {
    icon: userIcon
  }).addTo(map.value);
  userMarker.value.bindPopup('Your Location').openPopup();
  
  // Add a circle to show the 1km search radius
  searchRadiusCircle.value = L.circle([latitude, longitude], {
    color: '#ff3333',
    fillColor: '#ff333333',
    fillOpacity: 0.1,
    radius: 1000, // 1km radius
    dashArray: '5, 10',
    weight: 2
  }).addTo(map.value);
  
  // Handle map clicks
  map.value.on('click', handleMapClick);
}

// Handle map click events
function handleMapClick(event: any) { // Using any for the event type to avoid TypeScript errors
  if (!map.value || !targetLocation.value) return;
  
  const clickLat = event.latlng.lat;
  const clickLng = event.latlng.lng;
  
  // Remove previous click marker if exists
  if (clickMarker.value) {
    map.value.removeLayer(clickMarker.value);
  }
  
  // Add a new marker at the clicked location
  clickMarker.value = L.circle([clickLat, clickLng], {
    color: '#ff3333',
    fillColor: '#ff3333',
    fillOpacity: 0.5,
    radius: 20
  }).addTo(map.value);
  
  // Calculate distance to the target
  distance.value = calculateDistance(
    clickLat,
    clickLng,
    targetLocation.value.latitude,
    targetLocation.value.longitude
  );
  
  // If close enough, show success message
  if (isCloseEnough.value) {
    clickMarker.value.setStyle({
      color: '#33ff33',
      fillColor: '#33ff33'
    });
  }
}

// Proceed to next challenge
function proceedToNextStep() {
  router.push('/unlock-bomb');
}

// Get user's current location
function getUserLocation() {
  isLocationLoading.value = true;
  errorMessage.value = '';
  
  if (!isGeolocationSupported.value) {
    errorMessage.value = 'Geolocation is not supported by your browser';
    isLocationLoading.value = false;
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      
      userLocation.value = {
        latitude,
        longitude
      };
      
      // Generate a target within 1km of the user
      generateTargetLocation(latitude, longitude);
      
      // Initialize map with user's location
      initMap(latitude, longitude);
      
      isLocationLoading.value = false;
    },
    (error) => {
      isLocationLoading.value = false;
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage.value = 'User denied the request for Geolocation';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage.value = 'Location information is unavailable';
          break;
        case error.TIMEOUT:
          errorMessage.value = 'The request to get user location timed out';
          break;
        default:
          errorMessage.value = 'An unknown error occurred';
          break;
      }
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

// Clean up map resources when component is unmounted
onUnmounted(() => {
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
});

onMounted(() => {
  // Get user location immediately
  getUserLocation();
});
</script>

<template>
  <div class="find-bomb-container">
    <h1>Step 1: Find the Bomb Location</h1>
    
    <div class="timer-container">
      <CountdownTimer ref="timerRef" :initialTime="300" :start="true" />
    </div>
    
    <div v-if="!isGeolocationSupported" class="error-message">
      <p>Your browser doesn't support geolocation, which is required for this challenge.</p>
      <p>Please try using a modern browser with geolocation capabilities.</p>
    </div>
    
    <div v-else-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
      <button @click="getUserLocation" class="retry-button">Try Again</button>
    </div>
    
    <div class="map-container">
      <div class="instructions">
        <p>A bomb has been hidden somewhere within 1km of your location.</p>
        <p>Click on the map to try to find its exact location.</p>
        <p>You need to get within 50 meters of the bomb to proceed.</p>
      </div>
      
      <!-- Real map container using Leaflet -->
      <div ref="mapContainer" class="real-map">
        <div v-if="isLocationLoading" class="loading-overlay">
          <div class="spinner"></div>
          <p>Getting your location...</p>
        </div>
      </div>
      
      <div v-if="distance !== null" class="distance-info">
        <p>Distance to target: <strong>{{ Math.round(distance) }} meters</strong></p>
      </div>
      
      <div v-if="isCloseEnough" class="success-message">
        <p>Bomb located! You are close enough to proceed.</p>
        <button @click="proceedToNextStep" class="proceed-button">Proceed to Unlock the Bomb</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.find-bomb-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0.5rem; /* Reduced padding for mobile */
  color: #e0e0e0;
  font-family: 'Courier New', monospace;
}

h1 {
  color: #33ff33;
  text-align: center;
  font-size: 1.5rem; /* Smaller font size for mobile */
  margin: 1rem 0;
}

.timer-container {
  margin-bottom: 1rem;
}

.error-message {
  background-color: rgba(255, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
}

.spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(51, 255, 51, 0.3);
  border-radius: 50%;
  border-top-color: #33ff33;
  animation: spin 1s ease-in-out infinite;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  border-radius: 8px;
}

.loading-overlay p {
  margin-top: 1rem;
  color: #33ff33;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.instructions {
  background-color: rgba(0, 0, 0, 0.7);
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.map-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Styling for the real Leaflet map */
.real-map {
  width: 100%;
  height: 350px; /* Better height for mobile */
  border: 2px solid #33ff33;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 1rem;
  z-index: 10;
}

.distance-info {
  background-color: rgba(0, 0, 0, 0.7);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
}

.success-message {
  background-color: rgba(51, 255, 51, 0.3);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: center;
}

.retry-button, .proceed-button {
  background-color: #33ff33;
  color: black;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 0.5rem;
  font-family: 'Courier New', monospace;
  transition: all 0.3s ease;
  width: 100%; /* Full width buttons on mobile */
  max-width: 300px;
}

.retry-button:hover, .proceed-button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(51, 255, 51, 0.7);
}

/* Media queries for larger screens */
@media (min-width: 768px) {
  .find-bomb-container {
    padding: 2rem;
  }
  
  h1 {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
  
  .real-map {
    height: 450px;
  }
  
  .retry-button, .proceed-button {
    width: auto;
    padding: 0.5rem 1.5rem;
  }
}
</style>