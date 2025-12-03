import './App.css';
import { RobotLocalization } from './robot-localization';
import { useState, useEffect } from 'react';

export default function Test() {
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [heading, setHeading] = useState(0);
  const [is2d, setIs2d] = useState(false);
  const [zoom, setZoom] = useState(20);

  const randomDelta = () => (Math.random() * 20 - 10);
  const clamp = (val: number) => Math.max(-180, Math.min(180, val));
  const ROOT = { lat: 37.7749, lon: -122.4194, alt: 0 }; // Example root position (San Francisco)

  const [robot, setRobot] = useState({
  lat: ROOT.lat,
  lon: ROOT.lon,
  alt: ROOT.alt + 5,
  pitch: pitch,
  roll: roll,
  heading: heading,
});

// Convert ~1 meter to degrees (approx for demo)
const meterToLat = 1 / 111111; // ~1e−5
const meterToLon = 1 / (111111 * Math.cos(ROOT.lat * Math.PI / 180));

const randomDeltaMeters = () => (Math.random() * 0.2 - 0.1); // -1m to +1m

const clampDeg = (v:number) => Math.max(-180, Math.min(180, v));

useEffect(() => {
  const id = setInterval(() => {
    setRobot(prev => ({
      ...prev,
      // --- Fake position ---
      lat: prev.lat + meterToLat * randomDeltaMeters(),
      lon: prev.lon + meterToLon * randomDeltaMeters(),
      alt: prev.alt + (Math.random() * 0.3 - 0.15), // ±15cm vertical bouncing

      // --- Fake orientation ---
      pitch: clampDeg(prev.pitch + (Math.random() * 2 - 1)),
      roll: clampDeg(prev.roll + (Math.random() * 2 - 1)),
      heading: clampDeg(prev.heading + (Math.random() * 2 - 1)),
    }));
  }, 250);

  return () => clearInterval(id);
}, [meterToLat, meterToLon]);


  useEffect(() => {
    const id = setInterval(() => {
      setPitch(prev => clamp(prev + randomDelta()));
      setRoll(prev => clamp(prev + randomDelta()));
      setHeading(prev => clamp(prev + randomDelta()));
    }, 250); 

    return () => clearInterval(id);
  }, []);

  return (
    <>
    <button onClick={() => setIs2d(!is2d)}>Toggle View (Currently {is2d ? "2D" : "3D"})</button>
    <button onClick={() => setZoom(zoom + 1)}> Zoom +1 </button>
    <button onClick={() => setZoom(zoom - 1)}> Zoom -1 </button>
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
      />
    </>
  );
}
