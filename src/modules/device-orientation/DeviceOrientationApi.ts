/**
 * Device Orientation API Module
 * 
 * This module handles the Device Orientation API functionality
 * Reference: https://whatwebcando.today/device-position.html
 * 
 * Team 3 will work on this module to implement the "defuse-bomb" challenge
 */

// Type definitions for the Device Orientation API
export interface DeviceOrientationData {
  alpha: number | null;  // z-axis rotation [0-360) degrees
  beta: number | null;   // x-axis rotation [-180, 180] degrees
  gamma: number | null;  // y-axis rotation [-90, 90] degrees
}

export interface DeviceMotionData {
  acceleration: {
    x: number | null;
    y: number | null;
    z: number | null;
  };
  rotationRate: {
    alpha: number | null;
    beta: number | null;
    gamma: number | null;
  };
}

// Interface for iOS-specific request permission method
interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

export class DeviceOrientationApi {
  private orientationHandler: ((event: DeviceOrientationEvent) => void) | null = null;
  private permissionState: 'granted' | 'denied' | 'prompt' = 'prompt';

  /**
   * Check if Device Orientation API is supported in the current browser
   */
  static isSupported(): boolean {
    return 'DeviceOrientationEvent' in window;
  }

  /**
   * Check if permission is needed (iOS 13+ requires explicit permission)
   */
  static isPermissionNeeded(): boolean {
    return typeof (DeviceOrientationEvent as unknown as DeviceOrientationEventiOS).requestPermission === 'function';
  }

  /**
   * Request permission to use device orientation (for iOS 13+)
   * @returns Promise that resolves with the permission state
   */
  async requestPermission(): Promise<'granted' | 'denied'> {
    if (!DeviceOrientationApi.isSupported()) {
      throw new Error('Device Orientation API is not supported in this browser');
    }

    // Check if permission is needed (iOS 13+)
    if (DeviceOrientationApi.isPermissionNeeded()) {
      try {
        this.permissionState = await (DeviceOrientationEvent as unknown as DeviceOrientationEventiOS).requestPermission!();
        return this.permissionState;
      } catch (error) {
        console.error('Error requesting device orientation permission:', error);
        this.permissionState = 'denied';
        return 'denied';
      }
    } else {
      // Permission is implicitly granted on other browsers
      this.permissionState = 'granted';
      return 'granted';
    }
  }

  /**
   * Start listening for device orientation events
   * @param callback Function to call when orientation changes
   * @returns Promise that resolves when listening starts or rejects with an error
   */
  startOrientationListening(callback: (data: DeviceOrientationData) => void): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!DeviceOrientationApi.isSupported()) {
        reject(new Error('Device Orientation API is not supported'));
        return;
      }

      // Request permission if needed
      if (DeviceOrientationApi.isPermissionNeeded() && this.permissionState === 'prompt') {
        const permissionResult = await this.requestPermission();
        if (permissionResult !== 'granted') {
          reject(new Error('Permission to access device orientation was denied'));
          return;
        }
      }

      // Create handler function
      this.orientationHandler = (event: DeviceOrientationEvent) => {
        callback({
          alpha: event.alpha,
          beta: event.beta,
          gamma: event.gamma
        });
      };

      // Add event listener
      window.addEventListener('deviceorientation', this.orientationHandler);
      resolve();
    });
  }

  /**
   * Stop listening for device orientation events
   */
  stopOrientationListening(): void {
    if (this.orientationHandler) {
      window.removeEventListener('deviceorientation', this.orientationHandler);
      this.orientationHandler = null;
    }
  }

  /**
   * Check if the device is approximately level
   * @param data The device orientation data
   * @param tolerance The maximum degrees off level allowed
   * @returns Boolean indicating if the device is level
   */
  static isDeviceLevel(data: DeviceOrientationData, tolerance: number = 5): boolean {
    // Device is level when beta (x-axis tilt) and gamma (y-axis tilt) are close to 0
    return (
      data.beta !== null &&
      data.gamma !== null &&
      Math.abs(data.beta) <= tolerance &&
      Math.abs(data.gamma) <= tolerance
    );
  }

  /**
   * Calculate the level accuracy as a percentage
   * @param data The device orientation data
   * @param maxDeviation The maximum degrees off level for 0% accuracy
   * @returns Number from 0-100 representing level accuracy percentage
   */
  static calculateLevelAccuracy(data: DeviceOrientationData, maxDeviation: number = 15): number {
    if (data.beta === null || data.gamma === null) {
      return 0;
    }

    // Calculate percentage accuracy for each axis
    const betaAccuracy = Math.max(0, 100 - (Math.abs(data.beta) / maxDeviation) * 100);
    const gammaAccuracy = Math.max(0, 100 - (Math.abs(data.gamma) / maxDeviation) * 100);
    
    // Use the lower of the two accuracies
    return Math.min(betaAccuracy, gammaAccuracy);
  }
}

// Add type declaration for the iOS version of DeviceOrientationEvent
declare global {
  interface DeviceOrientationEvent {
    requestPermission?: () => Promise<'granted' | 'denied'>;
  }
}
