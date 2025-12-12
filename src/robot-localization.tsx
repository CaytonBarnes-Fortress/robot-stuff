import { geoToLocal, type Geo } from "./geo";
import { EnvironmentModel } from "./environment-model";
import { RobotModel } from "./robot-model.tsx";
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, OrthographicCamera } from '@react-three/drei';
import React, { useEffect } from "react";
import { MathUtils, Vector3, Raycaster, Vector2 } from "three";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { WaypointMarker, type Waypoint } from "./waypoint.tsx";
import { Ruler } from "./ruler";

function CSS2DRendererComponent() {
  const { camera, scene, size, gl } = useThree();
  useEffect(() => {
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(size.width, size.height);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    gl.domElement.parentElement?.appendChild(labelRenderer.domElement);

    const animate = () => {
      labelRenderer.render(scene, camera);
    };

    gl.setAnimationLoop(() => {
      animate();
    });

    return () => {
      labelRenderer.domElement.remove();
    };
  }, [camera, scene, gl, size]);

  return null;
}

function CameraController({ is2d, zoom2d = 20, zoom3d = 1, x = 0, y = 0 }: { is2d: boolean, zoom2d?: number, zoom3d?: number, x:number, y:number }) {
  MathUtils.clamp(zoom2d, 1, 25);
  MathUtils.clamp(zoom3d, 1, 25);
  return (
    <>
      {is2d ? (<OrthographicCamera makeDefault position={[x, 15, y]} zoom={zoom2d + 20} near={0.01} far={10000} />) : (<PerspectiveCamera makeDefault position={[10, 15, 10]} fov={50} zoom={zoom3d} near={0.01} far={10000} />)}
      <OrbitControls enablePan={is2d} enableRotate={!is2d} minDistance={3} maxDistance={50} />
    </>
  );
}

function MeasurementClickHandler({ enabled, root, onPointClick }: { enabled: boolean; root: Geo; onPointClick: (point: Vector3) => void }) {
  const { camera, gl, scene } = useThree();

  useEffect(() => {
    if (!enabled) return;

    const handleCanvasClick = (event: MouseEvent) => {
      const raycaster = new Raycaster();
      const mouse = new Vector2();

      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      let clickedPoint: Vector3 | null = null;

      if (intersects.length > 0) {
        clickedPoint = intersects[0].point;
      } else {
        const planeY = 0;
        const direction = raycaster.ray.direction.clone();
        const t = (planeY - raycaster.ray.origin.y) / direction.y;
        if (t > 0) {
          clickedPoint = raycaster.ray.origin.clone().addScaledVector(direction, t);
        }
      }

      if (clickedPoint) {
        // Pass the clicked point in local THREE.Vector3 coordinates directly
        onPointClick(clickedPoint);
      }
    };

    gl.domElement.addEventListener('click', handleCanvasClick);
    return () => {
      gl.domElement.removeEventListener('click', handleCanvasClick);
    };
  }, [enabled, camera, gl, scene, root, onPointClick]);

  return null;
}

export function RobotLocalization({ root, robot, robotUrl, environmentUrl, robotScale = 1, environmentScale = 1, style, className, showGrid, transparent, is2d, zoom2d = 20, zoom3d = 1, position = {x: 0, y: 0}, waypoints, showTrail, measurementMode = false, measurementPoints = [], onMeasurementPointsChange }: {
  root: Geo;
  robot: Geo & { pitch: number; roll: number; heading: number };
  robotUrl: string;
  environmentUrl: string;
  robotScale?: number;
  environmentScale?: number;
  style?: React.CSSProperties;
  className?: string;
  showGrid?: boolean;
  transparent?: boolean;
  is2d?: boolean;
  zoom2d?: number;
  zoom3d?: number;
  position?: { x: number; y: number; };
  waypoints?: Waypoint[];
  showTrail?: boolean;
  measurementMode?: boolean;
  measurementPoints?: Vector3[];
  onMeasurementPointsChange?: (points: Vector3[]) => void;
}) {
  const robotPosition = geoToLocal(root, robot);

  const handlePointClick = (point: Vector3) => {
    if (onMeasurementPointsChange) {
      const updatedPoints = [...(measurementPoints || []), point];
      if (updatedPoints.length > 2) {
        updatedPoints.shift();
      }
      onMeasurementPointsChange(updatedPoints);
    }
  };

  const rulerPointA = measurementPoints && measurementPoints.length > 0 ? measurementPoints[0] : null;
  const rulerPointB = measurementPoints && measurementPoints.length > 1 ? measurementPoints[1] : null;

  return (
    <div style={{ width: '100%', height: '100%', ...style }} className={className}>
      <Canvas gl={{ alpha: true }}>
        <CSS2DRendererComponent />
        <CameraController is2d={!!is2d} zoom3d={zoom3d} zoom2d={zoom2d} x={position.x} y={position.y}/>
        <MeasurementClickHandler enabled={measurementMode} root={root} onPointClick={handlePointClick} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        {showGrid && <gridHelper args={[50, 15]} position={[0, 0, 0]}/>}
        <EnvironmentModel url={environmentUrl} scale={environmentScale} visible={!transparent} />
        <RobotModel url={robotUrl} pitch={robot.pitch} roll={robot.roll} heading={robot.heading} position={robotPosition} scale={robotScale} showTrail={showTrail} />
        {waypoints && waypoints.map((wp, index) => <WaypointMarker waypoint={wp} root={root} key={index} />)}
        {rulerPointA && rulerPointB && <Ruler pointA={rulerPointA} pointB={rulerPointB} color="#00ff00" lineWidth={3} />}
      </Canvas>
    </div>
  );
}