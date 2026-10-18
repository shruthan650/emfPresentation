# Three.js workflow

Use these project-specific practices when editing this classroom visualizer.

## Before editing

- Read the relevant scene, model, UI, and stylesheet modules first; preserve their existing interfaces and visual conventions.
- Check `index.html` for the Three.js import map/CDN version. Match the project's existing Three.js version and module style. If an API is version-sensitive, consult current official Three.js documentation instead of guessing.
- Keep this static, client-side application modular. Do not introduce a backend or build system unless requested.

## Scene implementation

- Keep scene construction, shared human/office props, and presentation UI in the existing modules. Reuse shared factories rather than duplicating geometry.
- Treat scene units consistently; compose each organizational layout around a clear focal point and provide a useful camera target for it.
- Make scene updates time-based using the animation delta so motion behaves consistently across frame rates.
- Prefer a small number of reusable geometries/materials and instancing for repeated details when useful. Dispose of geometries, materials, textures, and render targets when replacing or removing scene content.
- Use restrained, readable motion and clean structural connectors appropriate to a classroom presentation. Avoid neon, lightning, or distracting effects unless specifically requested.
- Add semantic role information to selectable objects and make raycasting work with nested groups. Update hover feedback and detail UI without making selection dependent on tiny targets.

## Rendering and interaction

- Keep the canvas responsive to its container: update renderer dimensions and camera aspect/projection on resize, and cap pixel ratio to avoid excessive GPU cost.
- Preserve OrbitControls and coordinate camera transitions with controls target updates. Avoid overwriting user interaction every frame.
- Ensure animations and render resources are cleaned up when switching scenes or tearing down the application.
- Keep accessible DOM controls usable by keyboard and provide visible focus states; canvas-only actions should have corresponding UI controls where appropriate.

## Classroom presentation UI

- Maintain high contrast and projection-readable typography, including on narrow screens. Keep the lesson panel scrollable independently from the 3D viewport.
- Keep structure data and accordion rendering synchronized across all four models. Follow the current four-section content structure unless the user asks to change it.
- Do not add presenter notes or empty note-taking areas unless requested.

## Verification

- Follow the user's request about whether to run tests or verification. When verification is requested, check browser console/runtime errors and exercise all four tabs, camera controls, resizing, accordion behavior, and figure selection.
- Do not claim that CDN-based modules work offline; note the network dependency when relevant.
