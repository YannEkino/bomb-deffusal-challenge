# Contributing to the Bomb Defusal Challenge

Thank you for participating in this coding dojo! This document provides guidelines for each team working on the Bomb Defusal Challenge application.

## Team Workflow

1. **Fork the repository** to your team's GitHub account
2. **Clone the repository** to your local machine
3. **Create a feature branch** for your team's challenge (`team1-geolocation`, `team2-speech`, or `team3-orientation`)
4. **Work in pairs** on the assigned task
5. **Commit and push** to your team's branch
6. **Create a Pull Request** when your implementation is complete

## API Implementation Guidelines

### General Guidelines for All Teams

- Focus on the assigned web API implementation
- Write clear, well-documented code
- Add error handling and fallbacks where appropriate
- Provide appropriate user feedback
- Test your implementation in at least two different browsers

### Team 1 - Geolocation API

**Files to modify:**
- `src/modules/geolocation/GeolocationApi.ts`
- `src/views/FindBombLocationView.vue`

**Implementation steps:**
1. Implement the necessary methods in `GeolocationApi.ts` for location detection
2. Update the UI in `FindBombLocationView.vue` to provide visual feedback
3. Add location comparison logic to determine proximity to target
4. Handle routing to the next challenge when successful

### Team 2 - Speech Recognition API

**Files to modify:**
- `src/modules/speech-recognition/SpeechRecognitionApi.ts`
- `src/views/UnlockBombView.vue`

**Implementation steps:**
1. Implement the necessary methods in `SpeechRecognitionApi.ts` for voice recognition
2. Update the UI in `UnlockBombView.vue` to provide visual feedback
3. Add speech analysis logic to compare spoken words with target codes
4. Handle routing to the next challenge when successful

### Team 3 - Device Orientation API

**Files to modify:**
- `src/modules/device-orientation/DeviceOrientationApi.ts`
- `src/views/DefuseBombView.vue`

**Implementation steps:**
1. Implement the necessary methods in `DeviceOrientationApi.ts` for orientation detection
2. Update the UI in `DefuseBombView.vue` to provide visual feedback
3. Add orientation analysis logic to determine device stability
4. Handle routing to the final screen when successful

## Testing

Each team should test their implementation with the following scenarios:

- **Happy path:** Verify the API works as expected under normal conditions
- **Error handling:** Test the behavior when the API is unavailable or permissions are denied
- **Edge cases:** Consider scenarios like weak GPS signals, speech in noisy environments, or minor device movements

## Coding Standards

- Use TypeScript types appropriately
- Follow Vue.js composition API best practices
- Keep CSS modular and scoped to components
- Use consistent naming conventions
- Comment code for clarity, especially complex algorithms

## Pull Request Process

1. Ensure your code is formatted properly
2. Update the README.md with any necessary changes
3. Link to any relevant issues
4. Assign reviewers from your team for code review
5. Address any review feedback before merging