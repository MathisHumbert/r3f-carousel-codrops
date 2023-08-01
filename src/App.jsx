import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

import './style/styles.css';
import Plane from './three/Plane';

export default function App() {
  return (
    <div>
      <Canvas>
        <Suspense fallback={null}>
          <Plane />
        </Suspense>
      </Canvas>
    </div>
  );
}
