import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

export const EnvironmentModel: React.FC<{ url: string; scale?: number; visible?: boolean }> = ({
  url,
  scale = 1,
  visible,
}) => {
  const [object, setObject] = useState<THREE.Group | null>(null);

  useEffect(() => {
    const load = async () => {
      const ext = url.split(".").pop()?.toLowerCase();
      let obj: THREE.Group | null = null;

      switch (ext) {
        case "glb":
        case "gltf": {
          const loader = new GLTFLoader();
          const gltf = await loader.loadAsync(url);
          obj = gltf.scene;
          break;
        }
        case "stl": {
          const loader = new STLLoader();
          const geometry = await loader.loadAsync(url);
          const material = new THREE.MeshStandardMaterial({ color: 0xcccccc });
          obj = new THREE.Group();
          obj.add(new THREE.Mesh(geometry, material));
          break;
        }
        case "obj": {
          const loader = new OBJLoader();
          obj = await loader.loadAsync(url);
          break;
        }
        case "fbx": {
          const loader = new FBXLoader();
          obj = await loader.loadAsync(url);
          break;
        }
      }
      const box = new THREE.Box3().setFromObject(obj!);
      const center = box.getCenter(new THREE.Vector3());
      obj!.position.y -= box.min.y;
      obj!.position.x -= center.x;
      obj!.position.z -= center.z;

      if(visible) {
          obj!.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach((mat) => {
                  mat.transparent = true;
                  mat.opacity = 1.0;
                });
              } else {
                mesh.material.transparent = true;
                mesh.material.opacity = 1.0;
              }
            }
          });
        } else {
          obj!.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach((mat) => {
                  mat.transparent = true;
                  mat.opacity = 0.2;
                });
              } else {
                mesh.material.transparent = true;
                mesh.material.opacity = 0.2;
              }
            }
          });
        }
      setObject(obj);
    };

    load();
  }, [object, url, visible]);

  

  if (!object) return null;

  return <primitive object={object} scale={scale}/>;
};
