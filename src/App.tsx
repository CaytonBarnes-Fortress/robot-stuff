import './App.css';
import { RobotViewer } from './robot-viewer';
import { useState, useEffect } from 'react';

export default function App() {
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [heading, setHeading] = useState(0);

  const randomDelta = () => (Math.random() * 20 - 10);
  const clamp = (val: number) => Math.max(-180, Math.min(180, val));

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
      <RobotViewer
        modelUrl="/robot.glb"
        pitch={pitch}
        roll={roll}
        heading={heading}
        style={{ width: '1200px', height: '600px' }}
        showGrid
      />
    </>
  );
}
