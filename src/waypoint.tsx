import { geoToLocal, type Geo } from "./geo";
import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

export type Waypoint = {
    name: string,
    type: WaypointType,
    marker: string,
    position: Geo,
}

type WaypointType = "object" | "structure";

export const WaypointMarker = ({waypoint, root}:{waypoint: Waypoint, root: Geo}) => {
    const groupRef = useRef<THREE.Group | null>(null);
    const position = geoToLocal(root, waypoint.position);
    const scale = 1;

    // Create the marker mesh and label once per waypoint.
    const group = useMemo(() => {
        const group = new THREE.Group();
        
        // Create the 3D marker mesh
        switch (waypoint.type) {
            case "object": {
                const geometry = new THREE.SphereGeometry(0.2, 16, 16);
                const material = new THREE.MeshStandardMaterial({ color: waypoint.marker });
                group.add(new THREE.Mesh(geometry, material));
                break;
            }
            case "structure": {
                const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
                const material = new THREE.MeshStandardMaterial({ color: waypoint.marker });
                group.add(new THREE.Mesh(geometry, material));
                break;
            }
            default: {
                const geometry = new THREE.ConeGeometry(0.2, 0.5, 16);
                const material = new THREE.MeshStandardMaterial({ color: waypoint.marker });
                group.add(new THREE.Mesh(geometry, material));
                break;
            }
        }
        
        // Create CSS2D label
        const labelDiv = document.createElement('div');
        labelDiv.className = 'waypoint-label';
        labelDiv.textContent = waypoint.name;
        labelDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        labelDiv.style.color = '#fff';
        labelDiv.style.padding = '4px 8px';
        labelDiv.style.borderRadius = '4px';
        labelDiv.style.fontSize = '12px';
        labelDiv.style.fontWeight = 'bold';
        labelDiv.style.pointerEvents = 'none';
        labelDiv.style.whiteSpace = 'nowrap';
        
        const label = new CSS2DObject(labelDiv);
        label.position.set(0, 0.4, 0); // Position above the marker
        group.add(label);
        
        return group;
    }, [waypoint.type, waypoint.marker, waypoint.name]);

    useEffect(() => {
        if (groupRef.current) {
            groupRef.current.position.set(position.x, position.y, position.z);
            groupRef.current.scale.set(scale, scale, scale);
        }
    }, [position]);

    if (!group) { return null; }
    return <primitive ref={groupRef} object={group} />;
}