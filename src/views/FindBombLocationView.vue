<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import CountdownTimer from '../components/shared/CountdownTimer.vue';

const router = useRouter();
const timerRef = ref<InstanceType<typeof CountdownTimer> | null>(null);

// Geolocation API related variables
const isGeolocationSupported = ref(!!navigator.geolocation);
const userLocation = ref<{ latitude: number; longitude: number } | null>(null);
const targetLocation = ref<{ latitude: number; longitude: number } | null>(null);
const distance = ref<number | null>(null);
const errorMessage = ref('');
const mapLoaded = ref(false);

// Mock map implementation variables - to be replaced by actual map API
const mapClickPosition = ref<{ x: number; y: number } | null>(null);

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

// Simulate map click (in a real implementation, this would get coordinates from the map API)
function handleMapClick(event: MouseEvent) {
  // This is a simplified implementation - in reality, you'd convert pixel coordinates to geo coordinates
  if (!userLocation.value || !targetLocation.value) return;
  
  const mapElement = event.currentTarget as HTMLElement;
  const rect = mapElement.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  // For demo purposes: convert click position to a location near the user
  const clickLatitude = userLocation.value.latitude + (y - rect.height / 2) * 0.0001;
  const clickLongitude = userLocation.value.longitude + (x - rect.width / 2) * 0.0001;
  
  mapClickPosition.value = { x, y };
  
  // Calculate distance between click and target
  if (targetLocation.value) {
    distance.value = calculateDistance(
      clickLatitude, 
      clickLongitude,
      targetLocation.value.latitude,
      targetLocation.value.longitude
    );
  }
}

// Proceed to next challenge
function proceedToNextStep() {
  router.push('/unlock-bomb');
}

// Get user's current location
function getUserLocation() {
  if (!isGeolocationSupported.value) {
    errorMessage.value = 'Geolocation is not supported by your browser';
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation.value = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      
      // Generate a target within 1km of the user
      generateTargetLocation(position.coords.latitude, position.coords.longitude);
      mapLoaded.value = true;
    },
    (error) => {
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
    { enableHighAccuracy: true }
  );
}

onMounted(() => {
  if (timerRef.value) {
    timerRef.value.startTimer();
  }
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
    
    <div v-else-if="!mapLoaded" class="loading">
      <p>Getting your location...</p>
      <div class="spinner"></div>
    </div>
    
    <div v-else class="map-container">
      <div class="instructions">
        <p>A bomb has been hidden somewhere within 1km of your location.</p>
        <p>Click on the map to try to find its exact location.</p>
        <p>You need to get within 50 meters of the bomb to proceed.</p>
      </div>
      
      <!-- Simplified map representation - would be replaced with a real map API -->
      <div class="mock-map" @click="handleMapClick">
        <div class="map-center" title="Your Location">
          <span>YOU</span>
        </div>
        
        <div v-if="mapClickPosition" class="map-click" 
             :style="{ left: mapClickPosition.x + 'px', top: mapClickPosition.y + 'px' }">
          <span>X</span>
        </div>
        
        <!-- This circle represents the 1km search radius -->
        <div class="search-radius"></div>
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
  padding: 2rem;
  color: #e0e0e0;
  font-family: 'Courier New', monospace;
}

h1 {
  color: #33ff33;
  text-align: center;
  margin-bottom: 2rem;
}

.timer-container {
  margin-bottom: 2rem;
}

.error-message {
  background-color: rgba(255, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
}

.loading {
  text-align: center;
  margin: 3rem 0;
}

.spinner {
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 5px solid rgba(51, 255, 51, 0.3);
  border-radius: 50%;
  border-top-color: #33ff33;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.instructions {
  background-color: rgba(0, 0, 0, 0.7);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.mock-map {
  width: 100%;
  height: 400px;
  background-color: #242424;
  border: 2px solid #33ff33;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 1rem;
  cursor: crosshair;
}

.map-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
  background-color: #3333ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 8px;
  font-weight: bold;
  z-index: 10;
}

.map-click {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background-color: #ff3333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: bold;
  z-index: 5;
}

.search-radius {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 80%;
  border: 2px dashed #ff3333;
  border-radius: 50%;
  opacity: 0.5;
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
  padding: 0.5rem 1.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
  font-family: 'Courier New', monospace;
  transition: all 0.3s ease;
}

.retry-button:hover, .proceed-button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(51, 255, 51, 0.7);
}
</style>