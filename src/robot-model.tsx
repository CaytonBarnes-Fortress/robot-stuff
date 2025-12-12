import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

const TrailLine = ({ positions, visible }: { positions: THREE.Vector3[]; visible: boolean }) => {
  const meshRef = useRef<THREE.Line>(null);

  useFrame(() => {
    if (meshRef.current && positions.length > 1) {
      const posArray = positions.map(p => [p.x, p.y, p.z]).flat();
      (meshRef.current.geometry as THREE.BufferGeometry).setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(posArray), 3)
      );
      (meshRef.current.geometry as THREE.BufferGeometry).attributes.position.needsUpdate = true;

      // Create fading colors
      const colors = positions.map(() => [1, 0.5, 0]).flat();
      (meshRef.current.geometry as THREE.BufferGeometry).setAttribute(
        'color',
        new THREE.BufferAttribute(new Float32Array(colors), 3)
      );
      (meshRef.current.geometry as THREE.BufferGeometry).attributes.color.needsUpdate = true;
    }
  });

  if (!visible || positions.length < 2) return null;

  const geometry = new THREE.BufferGeometry();
  const posArray = positions.map(p => [p.x, p.y, p.z]).flat();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(posArray), 3));

  const colors = positions.map(() => [1, 0.5, 0]).flat();
  geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    linewidth: 5,
    fog: false,
  });

  return <primitive ref={meshRef} object={new THREE.Line(geometry, material)} />;
};

export const RobotModel: React.FC<{ 
  url: string; 
  pitch: number; 
  roll: number; 
  heading: number; 
  scale?: number; 
  position?: THREE.Vector3;
  showTrail?: boolean;
}> = ({ url, pitch, roll, heading, scale = 1, position = new THREE.Vector3(0, 0, 0), showTrail = false }) => {
  const [object, setObject] = useState<THREE.Group | null>(null);
  const modelRef = useRef<THREE.Group>(null);
  const isInitialized = useRef(false);
  const trailPositions = useRef<THREE.Vector3[]>([]);
  const maxTrailLength = 5000;
  
  useEffect(() => {
    const loadModel = async () => {
      const ext = url.split(".").pop()?.toLowerCase();
      let loadedObject: THREE.Group | null = null;
 
      switch (ext) {
        case "glb":
        case "gltf": {
          const loader = new GLTFLoader();
          const gltf = await loader.loadAsync(url);
          loadedObject = gltf.scene;
          break;
        }
        case "stl": {
          const loader = new STLLoader();
          const geometry = await loader.loadAsync(url);
          const material = new THREE.MeshStandardMaterial({ color: 0x999999 });
          const mesh = new THREE.Mesh(geometry, material);
          loadedObject = new THREE.Group();
          loadedObject.add(mesh);
          break;
        }
        case "obj": {
          const loader = new OBJLoader();
          loadedObject = await loader.loadAsync(url);
          break;
        }
        case "fbx": {
          const loader = new FBXLoader();
          loadedObject = await loader.loadAsync(url);
          break;
        }
        default:
          loadedObject = new THREE.Group().add(
            new THREE.Mesh(
              new THREE.BoxGeometry(1, 1, 1),
              new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }),
            ),
          );
          return;
      }
 
      setObject(loadedObject);
    };
 
    loadModel();
  }, [url]);
 
  const easeInOutCubic = (t: number) => { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  
  useFrame(() => {
    if (modelRef.current) {
      if (!isInitialized.current) {
        modelRef.current.position.set(position.x, position.y, position.z);
        modelRef.current.rotation.x = THREE.MathUtils.degToRad(pitch);
        modelRef.current.rotation.y = THREE.MathUtils.degToRad(heading);
        modelRef.current.rotation.z = THREE.MathUtils.degToRad(roll);
        modelRef.current.scale.set(scale, scale, scale);
        isInitialized.current = true;
        return;
      }

      const targetPitch = THREE.MathUtils.degToRad(pitch);
      const targetRoll = THREE.MathUtils.degToRad(roll);
      const targetYaw = THREE.MathUtils.degToRad(heading);
 
      const lerpFactor = easeInOutCubic(0.1);
 
      modelRef.current.rotation.x += (targetPitch - modelRef.current.rotation.x) * lerpFactor;
      modelRef.current.rotation.y += (targetYaw - modelRef.current.rotation.y) * lerpFactor;
      modelRef.current.rotation.z += (targetRoll - modelRef.current.rotation.z) * lerpFactor;
 
      modelRef.current.position.x += (position.x - modelRef.current.position.x) * lerpFactor;
      modelRef.current.position.y += (position.y - modelRef.current.position.y) * lerpFactor;
      modelRef.current.position.z += (position.z - modelRef.current.position.z) * lerpFactor;
      
      // Update trail
      if (showTrail) {
        const currentPos = modelRef.current.position.clone();
        trailPositions.current.push(currentPos);
        
        if (trailPositions.current.length > maxTrailLength) {
          trailPositions.current.shift();
        }
      }
    }
  });
 
  if (!object) return null;
 
  return (
    <>
      <primitive ref={modelRef} object={object} />
      <TrailLine positions={trailPositions.current} visible={showTrail} />
    </>
  );
};