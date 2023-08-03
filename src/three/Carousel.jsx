import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { usePrevious } from 'react-use';
import { gsap } from 'gsap';
import { lerp, getPiramidalIndex } from '../utils';

import CarouselItem from './CarouselItem';
import images from '../data/images';
import PostProcessing from './PostProcessing';

const planeSettings = {
  width: 1,
  height: 2.5,
  gap: 0.1,
};

gsap.defaults({
  duration: 2.5,
  ease: 'power3.out',
});

export default function Carousel() {
  const [root, setRoot] = useState();
  const [activePlane, setActivePlane] = useState(null);
  const prevActivePlane = usePrevious(activePlane);
  const postRef = useRef();
  const { viewport } = useThree();

  const progress = useRef(0);
  const oldProgress = useRef(0);
  const speed = useRef(0);
  const startX = useRef(0);
  const isDown = useRef(false);
  const speedWhell = 0.02;
  const speedDrag = -0.3;

  const items = useMemo(() => {
    if (root) {
      return root.children;
    }
  }, [root]);

  useEffect(() => {
    document.body.classList.remove('loading');
  }, []);

  useEffect(() => {
    if (!items) return;

    if (activePlane !== null && prevActivePlane === null) {
      progress.current = (activePlane / (items.length - 1)) * 100;
    }
  }, [items, activePlane]);

  useFrame(() => {
    progress.current = Math.max(0, Math.min(progress.current, 100));

    const active = Math.floor((progress.current / 100) * (items.length - 1));

    items.forEach((item, index) => displayItems(item, index, active));

    speed.current = lerp(
      speed.current,
      Math.abs(oldProgress.current - progress.current),
      0.1
    );

    oldProgress.current = lerp(oldProgress.current, progress.current, 0.1);

    if (postRef.current) {
      postRef.current.thickness = speed.current;
    }
  });

  const displayItems = (item, index, active) => {
    const piramidalIndex = getPiramidalIndex(items, active)[index];

    const posX = (index - active) * (planeSettings.width + planeSettings.gap);

    gsap.to(item.position, {
      x: posX,
      y: items.length * -0.1 + piramidalIndex * 0.1,
    });
  };

  const onWheel = (e) => {
    if (activePlane !== null) return;

    const isVerticalScroll = Math.abs(e.deltaY) > Math.abs(e.deltaX);

    const wheelProgress = isVerticalScroll ? e.deltaY : e.deltaX;
    progress.current = progress.current + wheelProgress * speedWhell;
  };

  const onMouseDown = (e) => {
    if (activePlane !== null) return;

    isDown.current = true;
    startX.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
  };

  const onMouseMove = (e) => {
    if (activePlane !== null || !isDown.current) return;

    const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;

    const mouseProgress = (x - startX.current) * speedDrag;
    progress.current = progress.current + mouseProgress;

    startX.current = x;
  };

  const onMouseUp = (e) => {
    if (activePlane !== null) return;

    isDown.current = false;
  };

  return (
    <>
      <group ref={setRoot}>
        {images.map((item, index) => (
          <CarouselItem
            key={index}
            width={planeSettings.width}
            height={planeSettings.height}
            setActivePlane={setActivePlane}
            activePlane={activePlane}
            item={item}
            index={index}
          />
        ))}
      </group>
      <mesh
        position={[0, 0, -0.01]}
        onWheel={onWheel}
        onPointerDown={onMouseDown}
        onPointerUp={onMouseUp}
        onPointerLeave={onMouseUp}
        onPointerCancel={onMouseUp}
        onPointerMove={onMouseMove}
      >
        <planeGeometry args={[viewport.width, viewport.height]} />
        <meshBasicMaterial transparent={true} opacity={0} />
      </mesh>
      <PostProcessing ref={postRef} />
    </>
  );
}
