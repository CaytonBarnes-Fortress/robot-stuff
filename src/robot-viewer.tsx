import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { RobotModel } from './robot-model';

interface RobotViewerProps {
  modelUrl: string;
  pitch: number;
  roll: number; 
  heading: number; 
  style?: React.CSSProperties;
  className?: string;
  showGrid?: boolean;
  controls?: boolean;
  showTrail?: boolean;
}

export const RobotViewer: React.FC<RobotViewerProps> = ({ modelUrl, pitch, roll, heading, style, className, showGrid, controls, showTrail }) => {
  return (
    <div style={{ width: '100%', height: '100%', ...style }} className={className}>
      <Canvas gl={{ alpha: true }} camera={{ position: [1, 2, 3], fov: 50 }}>
        <ambientLight intensity={0.7} />
        {showGrid && <gridHelper args={[50, 15]} position={[0, -2, 0]}/>}
        {controls && <OrbitControls enablePan={false} minDistance={3} maxDistance={20} />}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <RobotModel url={modelUrl} pitch={pitch} roll={roll} heading={heading} showTrail={showTrail} />
      </Canvas>
    </div>
  );
};
