import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

import './style/styles.css';
import Carousel from './three/Carousel';

export default function App() {
  return (
    <div>
      <Canvas>
        <Suspense fallback={null}>
          <Carousel />
        </Suspense>
      </Canvas>
    </div>
  );
}
