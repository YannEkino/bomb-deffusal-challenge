/**
 * Geolocation API Module
 * 
 * This module handles the browser's Geolocation API functionality
 * Reference: https://whatwebcando.today/geolocation.html
 * 
 * Team 1 will work on this module to implement the "find-bomb-location" challenge
 */

// Define types for the Geolocation API responses
export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export class GeolocationApi {
  /**
   * Check if geolocation is supported in the current browser
   */
  static isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Get the current position of the device
   * @param options GeolocationOptions to configure the position request
   * @returns Promise that resolves with the position or rejects with an error
   */
  static getCurrentPosition(options: GeolocationOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  }): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('Geolocation API is not supported in this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let errorMessage: string;

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'User denied the request for geolocation';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'The request to get user location timed out';
              break;
            default:
              errorMessage = 'An unknown error occurred';
              break;
          }

          reject({
            code: error.code,
            message: errorMessage
          });
        },
        options
      );
    });
  }

  /**
   * Calculate the distance between two geographic points using the Haversine formula
   * 
   * @param lat1 Latitude of first point in degrees
   * @param lon1 Longitude of first point in degrees
   * @param lat2 Latitude of second point in degrees
   * @param lon2 Longitude of second point in degrees
   * @returns Distance in meters between the two points
   */
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

  /**
   * Generate a random location within a specified radius of a central point
   * 
   * @param centerLat Latitude of the center point in degrees
   * @param centerLon Longitude of the center point in degrees
   * @param radiusInMeters Radius within which to generate a point (in meters)
   * @returns A random location within the specified radius
   */
  static generateRandomPointWithinRadius(centerLat: number, centerLon: number, radiusInMeters: number): GeolocationPosition {
    // Convert radius from meters to degrees (approximate)
    const radiusInDegrees = radiusInMeters / 111300; // 1 degree is approximately 111,300 meters
    
    // Generate a random angle
    const randomAngle = Math.random() * 2 * Math.PI;
    
    // Generate a random distance within the radius
    const randomDistance = Math.random() * radiusInDegrees;
    
    // Calculate the random point using the distance and angle
    const lat = centerLat + randomDistance * Math.cos(randomAngle);
    const lon = centerLon + randomDistance * Math.sin(randomAngle) / Math.cos(centerLat * Math.PI / 180);
    
    return {
      latitude: lat,
      longitude: lon
    };
  }
}