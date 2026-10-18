---
name: threejs-visualizer
description: Build and improve this project’s Three.js classroom visualizer, including modular scenes, interactive figures, camera behavior, and readable presentation UI. Use for Three.js/WebGL changes in this organizational-structure app.
---

# Three.js Organizational Structure Visualizer

Use this skill for Three.js and WebGL work in this project. Preserve the user's requested scope and the existing app architecture.

## Project conventions

- Inspect relevant files first and preserve module boundaries, interfaces, and existing UI behavior.
- Keep the app static and client-side. Match the Three.js CDN version and module style in `index.html`.
- For version-sensitive APIs, consult current official Three.js documentation instead of guessing.
- Reuse shared human and office-prop factories. Keep each structure's scene assembly and animation in its corresponding module.
- Maintain the classroom style: a light environment, high contrast, projector-readable typography, calm motion, and clean structural connectors.
- Keep all four structure tabs and lesson content synchronized. Maintain the four accordion sections unless asked otherwise.

## Scene and interaction guidance

- Keep scale and camera targets consistent across structures. Drive animation with frame delta for frame-rate independence.
- Support container resizing, update camera projection, and cap renderer pixel ratio for practical GPU performance.
- Preserve OrbitControls and coordinate camera transitions with its target; do not override user input continuously.
- Make figures selectable through raycasting even when their meshes are nested. Preserve role metadata for the detail UI and make hit targets usable.
- Reuse geometry and materials where practical. Dispose of resources when replacing or removing scenes.
- Keep DOM controls keyboard accessible with visible focus. Provide UI equivalents for important canvas actions where practical.

## Presentation content

- Keep the 3D stage and lesson panel independently usable and responsive. Preserve the large-text, high-contrast classroom layout.
- Keep structure descriptions accurate to standard organizational theory; distinguish theoretical tendencies from universal rules.
- Do not add presenter notes or empty note-taking areas unless requested.

## Verification

- Run checks only when the user asks for testing or verification.
- When requested, exercise all four tabs, camera controls, resizing, accordion behavior, and figure selection, and inspect browser console errors.
- Mention that CDN-loaded Three.js requires a network connection when relevant; do not imply the app is fully offline.
