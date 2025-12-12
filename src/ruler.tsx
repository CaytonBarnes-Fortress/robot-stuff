import { useEffect, useMemo } from 'react';
import { Vector3, BufferGeometry, Line, LineBasicMaterial, Float32BufferAttribute, Group } from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

interface RulerProps {
    pointA: Vector3;
    pointB: Vector3;
    color?: string;
    lineWidth?: number;
}

export function Ruler({ pointA, pointB, color = '#ff0000', lineWidth = 12 }: RulerProps) {
    const distance = pointA.distanceTo(pointB);
    const midpoint = new Vector3().addVectors(pointA, pointB).multiplyScalar(0.5);

    // Build a Group containing the Line and a CSS2D label (like WaypointMarker)
    const groupObject = useMemo(() => {
        const group = new Group();

        const geometry = new BufferGeometry();
        const positions = new Float32Array([
            pointA.x, pointA.y, pointA.z,
            pointB.x, pointB.y, pointB.z,
        ]);
        geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));

        const material = new LineBasicMaterial({ color, linewidth: lineWidth });
        const line = new Line(geometry, material);
        group.add(line);

        const labelDiv = document.createElement('div');
        labelDiv.className = 'ruler-label';
        labelDiv.textContent = `${distance.toFixed(2)} units`;
        labelDiv.style.background = 'rgba(0, 0, 0, 0.7)';
        labelDiv.style.color = 'white';
        labelDiv.style.padding = '4px 8px';
        labelDiv.style.borderRadius = '4px';
        labelDiv.style.fontSize = '12px';
        labelDiv.style.whiteSpace = 'nowrap';
        labelDiv.style.pointerEvents = 'none';

        const label = new CSS2DObject(labelDiv);
        label.position.set(midpoint.x, midpoint.y + 0.2, midpoint.z);
        group.add(label);

        return group;
    }, [pointA.x, pointA.y, pointA.z, pointB.x, pointB.y, pointB.z, color, lineWidth, distance, midpoint.x, midpoint.y, midpoint.z]);

    // Dispose geometry/material when groupObject changes or unmounts
    useEffect(() => {
        return () => {
            if (!groupObject) return;
            const lineChild = groupObject.children.find((c) => (c as Line).geometry) as Line | undefined;
            if (lineChild) {
                try { (lineChild.geometry as BufferGeometry).dispose(); } catch { /* ignore dispose errors */ }
                try { ((lineChild.material as unknown) as { dispose?: () => void }).dispose?.(); } catch { /* ignore dispose errors */ }
            }
            // Remove any DOM nodes created by CSS2DObjects (they are removed by CSS2DRenderer on cleanup of scene, but we defensively remove)
            groupObject.children.forEach((c) => {
                // CSS2DObject holds its element in (c as any).element
                try {
                    const elem = (c as unknown as { element?: HTMLElement }).element;
                    if (elem && elem.remove) elem.remove();
                } catch { /* ignore DOM remove errors */ }
            });
        };
    }, [groupObject]);

    return (
        <primitive object={groupObject} />
    );
}