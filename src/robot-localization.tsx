import { geoToLocal, type Geo } from "./geo";
import { EnvironmentModel } from "./environment-model";
import { RobotModel } from "./robot-model.tsx";
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, OrthographicCamera } from '@react-three/drei';
import React from "react";
import { MathUtils } from "three";

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

export function RobotLocalization({ root, robot, robotUrl, environmentUrl, robotScale = 1, environmentScale = 1, style, className, showGrid, transparent, is2d, zoom2d = 20, zoom3d = 1, position = {x: 0, y: 0} }: {
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
}) {
  const robotPosition = geoToLocal(root, robot);

  return (
    <div style={{ width: '100%', height: '100%', ...style }} className={className}>
      <Canvas gl={{ alpha: true }}>
        <CameraController is2d={!!is2d} zoom3d={zoom3d} zoom2d={zoom2d} x={position.x} y={position.y}/>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        {showGrid && <gridHelper args={[50, 15]} position={[0, 0, 0]}/>}
        <EnvironmentModel url={environmentUrl} scale={environmentScale} visible={!transparent} />
        <RobotModel url={robotUrl} pitch={robot.pitch} roll={robot.roll} heading={robot.heading} position={robotPosition} scale={robotScale} />
      </Canvas>
    </div>
  );
}