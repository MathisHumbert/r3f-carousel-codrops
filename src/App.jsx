import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

import Carousel from './three/Carousel';

export default function App() {
  return (
    <>
      <Suspense fallback={null}>
        <Canvas>
          <Carousel />
        </Canvas>
      </Suspense>
    </>
  );
}
