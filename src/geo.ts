import * as THREE from "three";

const R = 6378137;

export type Geo = {
  lat: number;
  lon: number;
  alt: number;
};

export function geoToLocal(root: Geo, point: Geo): THREE.Vector3 {
  const dLat = THREE.MathUtils.degToRad(point.lat - root.lat);
  const dLon = THREE.MathUtils.degToRad(point.lon - root.lon);
  const lat0 = THREE.MathUtils.degToRad(root.lat);
  const east = dLon * Math.cos(lat0) * R;
  const north = dLat * R;
  const up = point.alt - root.alt;
  return new THREE.Vector3(east, up, -north);
}
