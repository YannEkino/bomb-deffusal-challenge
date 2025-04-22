# Bomb Defusal Challenge - Coding Dojo

## Introduction

This document outlines the structure for the "Bomb Defusal Challenge" coding dojo, where three teams will work together to implement different Web APIs in a collaborative bomb defusal simulation.

## Dojo Format

### Duration
- Total: 3-4 hours
- Introduction & Setup: 30 minutes
- Coding Sessions: 2 hours
- Code Review & Demo: 30-45 minutes
- Retrospective: 30 minutes

### Team Structure
- 3 teams of 2-3 people each
- Each team is responsible for one Web API implementation
- Pair programming is mandatory within each team

## Challenge Overview

The challenge is to create an interactive web application where users must defuse a virtual bomb through three sequential steps:

1. **Find the bomb location** (Team 1 - Geolocation API)
2. **Unlock the bomb panel** (Team 2 - Speech Recognition API)
3. **Defuse the bomb mechanism** (Team 3 - Device Orientation API)

A global countdown timer adds pressure throughout all three steps.

## Team Responsibilities

### Team 1: Geolocation Challenge
- **API**: Geolocation - https://whatwebcando.today/geolocation.html
- **Files**: `src/modules/geolocation/GeolocationApi.ts` and `src/views/FindBombLocationView.vue`
- **Challenge**: Implement a location finder that shows a map with a 1km radius around the user's location. The user must find and click on the target location (randomly generated) within the radius. The user proceeds when they are within 50m of the target.

### Team 2: Speech Recognition Challenge
- **API**: Speech Recognition - https://whatwebcando.today/speech-recognition.html
- **Files**: `src/modules/speech-recognition/SpeechRecognitionApi.ts` and `src/views/UnlockBombView.vue`
- **Challenge**: Implement a voice recognition system where users must speak the correct unlock code from a list of possible codes. Only one code works.

### Team 3: Device Orientation Challenge
- **API**: Device Orientation - https://whatwebcando.today/device-position.html
- **Files**: `src/modules/device-orientation/DeviceOrientationApi.ts` and `src/views/DefuseBombView.vue`
- **Challenge**: Implement an orientation-based puzzle where users must keep their device perfectly level for 5 seconds to defuse the bomb.

## Dojo Process

### 1. Introduction (30 minutes)
- Explain the challenge and overall application architecture
- Introduce the technologies (Vue 3, TypeScript, Web APIs)
- Form teams and explain team assignments
- Explain the modular architecture and API isolation

### 2. Coding Session (2 hours)
- Teams work independently on their assigned API implementation
- Encourage pair programming with regular role switching
- Facilitator rotates between teams to provide guidance when needed

### 3. Integration and Demo (30-45 minutes)
- Teams integrate their solutions into the main application
- Full challenge demonstration with all steps
- Each team explains their implementation approach
- Q&A about implementation challenges

### 4. Retrospective (30 minutes)
- What went well?
- What was challenging?
- What new things did you learn?
- How would you improve the API implementations?
- Ideas for future coding dojos

## Testing Tips

### Local Testing

Each team can work and test their section independently:

```bash
# Navigate to project folder
cd bomb-defusal-challenge

# Install dependencies
npm install

# Start development server
npm run dev
```

### API-Specific Testing

- **Geolocation**: Use Chrome DevTools to simulate different locations
- **Speech Recognition**: Test in Chrome for best support
- **Device Orientation**: Use Chrome DevTools' sensors tab or test on a mobile device

## Success Criteria

A successful implementation should:
1. Use the assigned Web API correctly
2. Handle errors gracefully with user feedback
3. Provide intuitive UI feedback during the challenge
4. Successfully transition to the next step when completed
5. Work in at least one modern browser