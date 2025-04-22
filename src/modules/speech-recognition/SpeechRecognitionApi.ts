/**
 * Speech Recognition API Module
 * 
 * This module handles the Web Speech API's speech recognition functionality
 * Reference: https://whatwebcando.today/speech-recognition.html
 * 
 * Team 2 will work on this module to implement the "unlock-bomb" challenge
 */

// Type definitions for the Web Speech API
export interface SpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionError {
  error: string;
  message: string;
}

export class SpeechRecognitionApi {
  private recognition: any;
  private isListening: boolean = false;
  private resultReceived: boolean = false;

  /**
   * Check if Speech Recognition is supported in the current browser
   */
  static isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  constructor(options: SpeechRecognitionOptions = {}) {
    // Check for browser support
    if (!SpeechRecognitionApi.isSupported()) {
      throw new Error('Speech Recognition API is not supported in this browser');
    }

    // Initialize Speech Recognition API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    // Set default options
    this.recognition.lang = options.lang || 'en-US';
    this.recognition.continuous = options.continuous || false;
    this.recognition.interimResults = options.interimResults || false;
    this.recognition.maxAlternatives = options.maxAlternatives || 1;
  }

  /**
   * Start listening for speech
   * @returns Promise that resolves when recognition starts or rejects with an error
   */
  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isListening) {
        reject(new Error('Speech recognition is already running'));
        return;
      }

      // Set up event handlers
      this.recognition.onstart = () => {
        this.isListening = true;
        resolve();
      };

      this.recognition.onerror = (event: any) => {
        reject({
          error: event.error,
          message: this.getErrorMessage(event.error)
        });
      };

      // Start recognition
      try {
        this.recognition.start();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop listening for speech
   */
  stop(): void {
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Listen for speech and return the result
   * @returns Promise that resolves with the recognition result or rejects with an error
   */
  listen(): Promise<SpeechRecognitionResult> {
    return new Promise((resolve, reject) => {
      // Reset the result received flag
      this.resultReceived = false;
      
      // Set up result handler
      this.recognition.onresult = (event: any) => {
        this.resultReceived = true;
        const result = event.results[0][0];
        resolve({
          transcript: result.transcript,
          confidence: result.confidence
        });
      };

      // Set up error handler
      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        reject({
          error: event.error,
          message: this.getErrorMessage(event.error)
        });
      };

      // Set up end handler (in case no result was found)
      this.recognition.onend = () => {
        this.isListening = false;
        // Only reject if no result was received
        if (!this.resultReceived) {
          reject({
            error: 'no-speech',
            message: 'No speech was detected'
          });
        }
      };

      // Start recognition if not already listening
      if (!this.isListening) {
        this.start().catch(reject);
      }
    });
  }

  /**
   * Get the current listening state
   * @returns boolean indicating if speech recognition is active
   */
  isActive(): boolean {
    return this.isListening;
  }

  /**
   * Compare a transcript to a target phrase
   * @param transcript The speech recognition result transcript
   * @param targetPhrase The phrase to compare against
   * @param fuzzyMatch Whether to do a fuzzy match (includes) or exact match (equals)
   * @returns boolean indicating if the transcript matches the target phrase
   */
  static compareTranscript(transcript: string, targetPhrase: string, fuzzyMatch: boolean = true): boolean {
    // Normalize both strings (lowercase, remove extra spaces)
    const normalizedTranscript = transcript.toLowerCase().trim();
    const normalizedTarget = targetPhrase.toLowerCase().trim();
    
    if (fuzzyMatch) {
      return normalizedTranscript.includes(normalizedTarget) || normalizedTarget.includes(normalizedTranscript);
    } else {
      return normalizedTranscript === normalizedTarget;
    }
  }

  /**
   * Get a user-friendly error message for speech recognition errors
   * @param error The error code from the speech recognition API
   * @returns A user-friendly error message
   */
  private getErrorMessage(error: string): string {
    switch (error) {
      case 'no-speech':
        return 'No speech was detected. Please try again.';
      case 'aborted':
        return 'Speech recognition was aborted.';
      case 'audio-capture':
        return 'No microphone was found or microphone is disabled.';
      case 'network':
        return 'Network error occurred during speech recognition.';
      case 'not-allowed':
      case 'service-not-allowed':
        return 'Microphone permission was denied. Please allow microphone access.';
      case 'bad-grammar':
        return 'Speech grammar error.';
      case 'language-not-supported':
        return 'The language specified is not supported.';
      default:
        return 'An unknown error occurred during speech recognition.';
    }
  }
}

// Add type declaration for the Web Speech API to avoid TypeScript errors
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}