# Robot Stuff

Robot Visualization in 3D space and stuff. More below:

---

## Quick start

- Install and run dev server:

```bash
npm install
npm run dev
```

- Build / preview:

```bash
npm run build
npm run preview
```

- Lint:

```bash
npm run lint
```

Open the dev app at the vite URL (usually http://localhost:5173). `src/main.tsx` chooses the page by `window.location.pathname`: visit `/` to load `src/App.tsx` and `/test` to load `src/Test.tsx`.

## Component usage

This section documents how to use the two primary visual components in this repo: `robot-viewer.tsx` and `robot-localization.tsx`. Examples below are taken from `src/App.tsx` and `src/Test.tsx`.

### `robot-viewer` (3D model preview)

- Purpose: lightweight 3D viewer that renders a single robot model and applies `pitch`, `roll`, and `heading` for visualization. Internally it creates a `<Canvas>` and mounts `RobotModel`.

- Props (common):
  - `modelUrl: string` — path to model asset (place files in `public/`, e.g. `/robot.glb`).
  - `pitch`, `roll`, `heading: number` — orientation in degrees (component converts to radians internally).
  - `style?: React.CSSProperties` — container size (example uses `{ width: '1200px', height: '600px' }`).
  - `showGrid?: boolean`, `controls?: boolean`, `showTrail?: boolean` — visualization toggles.

Example (from `src/App.tsx`):

```tsx
<RobotViewer
  modelUrl="/robot.glb"
  pitch={pitch}
  roll={roll}
  heading={heading}
  style={{ width: '1200px', height: '600px' }}
  showGrid
/>
```

Notes:
- `pitch`, `roll`, `heading` should be in degrees; the viewer/`RobotModel` handles conversion and easing.
- Use `controls` to enable `OrbitControls` for manual inspection.

### `robot-localization` (geographic scene + environment)

- Purpose: full localization scene that places robot(s) and environment geometry using geodetic coordinates. It converts geographic positions via `geoToLocal()` and renders `EnvironmentModel`, `RobotModel`, waypoint markers, measurement tools, and optional 2D orthographic camera.

- Key props:
  - `root: Geo` — reference origin `{ lat, lon, alt }` used by `geoToLocal`.
  - `robot: Geo & { pitch:number; roll:number; heading:number }` — robot geodetic position + orientation in degrees.
  - `robotUrl: string`, `environmentUrl: string` — asset paths (put assets in `public/`).
  - `robotScale?: number`, `environmentScale?: number` — scale multipliers for models.
  - `is2d?: boolean` — when true, scene uses an orthographic top-down camera.
  - `zoom2d?: number`, `zoom3d?: number` — zoom levels for respective camera modes.
  - `transparent?: boolean` — hides environment meshes while keeping the scene.
  - `waypoints?: Waypoint[]` — optional markers (see `src/waypoint.tsx`) — positions are geodetic `{lat, lon, alt}`.
  - `measurementMode?: boolean`, `measurementPoints?: THREE.Vector3[]`, `onMeasurementPointsChange?: (points)=>void` — enables clicking to measure distances in scene-local coordinates.

Example (from `src/Test.tsx`):

```tsx
<RobotLocalization
  root={ROOT}
  robot={robot}
  robotUrl="/robot.glb"
  environmentUrl="/environment.glb"
  style={{ width: '1200px', height: '600px' }}
  is2d={is2d}
  zoom2d={zoom}
  zoom3d={zoom}
  transparent
  waypoints={WAYPOINTS}
  showTrail={showTrail}
  measurementMode={measurementMode}
  measurementPoints={measurementPoints}
  onMeasurementPointsChange={setMeasurementPoints}
/>
```

Notes and gotchas:
- Coordinate conversion: use `geoToLocal(root, point)` from `src/geo.ts`; it returns a `THREE.Vector3` in the app convention (east, up, -north).
- Model loaders: `RobotModel` and `EnvironmentModel` include loaders for `.glb/.gltf`, `.stl`, `.obj`, `.fbx`. Ensure the file extension matches an imported loader.
- Material handling: when modifying mesh materials, handle both single material and arrays (see `src/environment-model.tsx` traversal patterns).
- Centering: models are centered with `Box3` after load — keep centering logic when changing transforms.
- Measurement clicks: clicked points are reported in scene-local `THREE.Vector3` coordinates via `onMeasurementPointsChange`.

## Troubleshooting

- Loader 404: verify model path under `public/` and that the dev server is running.
- Unsupported file: confirm a loader exists for the file extension in the component loaders.
- Invisible or off-center model: inspect `Box3` centering code in `src/environment-model.tsx` and `scale`/`position` props passed to the model components.

## Where to look in the code

- `src/robot-model.tsx` — loader + orientation conversion + trail logic.
- `src/environment-model.tsx` — loaders, centering, and material traversal.
- `src/geo.ts` — `geoToLocal` and coordinate math.
- `src/robot-localization.tsx` — camera switching, measurement click handling, and scene composition.
- `src/robot-viewer.tsx` — simple 3D viewer wrapper used by `src/App.tsx`.

If you'd like, I can also add small runnable examples in `/examples` or include a sample GLB in `public/` for quicker testing. Tell me which you'd prefer.
