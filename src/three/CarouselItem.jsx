import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { gsap } from 'gsap';

import Plane from './Plane';

export default function CarouselItem({
  width,
  height,
  setActivePlane,
  activePlane,
  item,
  index,
}) {
  const [isActive, setIsActive] = useState(false);
  const [isCloseActive, setIsCloseActive] = useState(false);
  const [hover, setHover] = useState(false);
  const groupRef = useRef();
  const timeoutID = useRef();
  const { viewport } = useThree();

  useEffect(() => {
    if (activePlane === index) {
      setIsActive(true);
      setIsCloseActive(true);
    } else {
      setIsActive(false);
    }
  }, [activePlane]);

  useEffect(() => {
    gsap.killTweensOf(groupRef.current.position);
    gsap.to(groupRef.current.position, {
      z: isActive ? 0 : -0.01,
      duration: 0.2,
      delay: isActive ? 0 : 2,
      ease: 'power3.out',
    });
  }, [isActive]);

  useEffect(() => {
    const hoverScale = hover && !isActive ? 1.1 : 1;

    gsap.to(groupRef.current.scale, {
      x: hoverScale,
      y: hoverScale,
      ease: 'power3.out',
    });
  }, [hover]);

  const handleClose = (e) => {
    e.stopPropagation();

    if (!isActive) return;

    setActivePlane(null);
    setHover(false);
    clearTimeout(timeoutID.current);
    timeoutID.current = setTimeout(() => {
      setIsCloseActive(false);
    }, 1500);
  };

  return (
    <group
      ref={groupRef}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onClick={() => setActivePlane(index)}
    >
      <Plane
        width={width}
        height={height}
        image={item.image}
        isActive={isActive}
      />
      {isCloseActive && (
        <mesh position={[0, 0, 0.01]} onClick={handleClose}>
          <planeGeometry args={[viewport.width, viewport.height]} />
          <meshBasicMaterial transparent={true} opacity={0} />
        </mesh>
      )}
    </group>
  );
}
