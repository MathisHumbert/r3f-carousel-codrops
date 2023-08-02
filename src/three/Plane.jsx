import { useEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { gsap } from 'gsap';
// import { useControls } from 'leva';

export default function Plane({ width, height, image, isActive }) {
  const meshRef = useRef();
  const { viewport } = useThree();
  const texture = useTexture(image);

  // const { width, height } = useControls({
  //   width: { value: 2, min: 0.5, max: viewport.width },
  //   height: { value: 3, min: 0.5, max: viewport.height },
  // });

  useEffect(() => {
    if (meshRef.current.material) {
      meshRef.current.material.uniforms.uZoomScale.value.x =
        viewport.width / width;
      meshRef.current.material.uniforms.uZoomScale.value.y =
        viewport.height / height;

      gsap.to(meshRef.current.material.uniforms.uRes.value, {
        x: isActive ? viewport.width : width,
        y: isActive ? viewport.height : height,
        duration: 2.5,
        ease: 'power3.out',
      });

      gsap.to(meshRef.current.material.uniforms.uProgress, {
        value: isActive ? 1 : 0,
        duration: 2.5,
        ease: 'power3.out',
      });

      // meshRef.current.material.uniforms.uRes.value.x = width;
      // meshRef.current.material.uniforms.uRes.value.y = height;
    }
  }, [viewport, isActive]);

  const shaderArgs = useMemo(() => {
    return {
      uniforms: {
        uTexture: { value: texture },
        uRes: { value: { x: 1, y: 1 } },
        uImageRes: {
          value: {
            x: texture.source.data.width,
            y: texture.source.data.height,
          },
        },
        uZoomScale: { value: { x: 0, y: 0 } },
        uProgress: { value: 0 },
      },
      vertexShader: /* glsl */ `
      uniform vec2 uZoomScale;
      uniform float uProgress;
      
      varying vec2 vUv;

      void main(){
        vUv = uv;

        vec3 pos = position;
        float angle = uProgress * 3.14159265 / 2.;
        float wave = cos(angle);
        float c = sin(length(uv - 0.5) * 15. + uProgress * 12.) * .5 + .5;
        pos.x *= mix(1., uZoomScale.x + wave * c, uProgress);
        pos.y *= mix(1., uZoomScale.y + wave * c, uProgress);

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
      }
      `,
      fragmentShader: /* glsl */ `
      uniform sampler2D uTexture;
      uniform vec2 uRes;
      uniform vec2 uImageRes;

      varying vec2 vUv;

      /*------------------------------
      Background Cover UV
      --------------------------------
      u = basic UV
      s = screensize
      i = image size
      ------------------------------*/
      vec2 CoverUV(vec2 u, vec2 s, vec2 i) {
        float rs = s.x / s.y; // Aspect screen size
        float ri = i.x / i.y; // Aspect image size
        vec2 st = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x); // New st
        vec2 o = (rs < ri ? vec2((st.x - s.x) / 2.0, 0.0) : vec2(0.0, (st.y - s.y) / 2.0)) / st; // Offset
        return u * s / st + o;
      }

      void main(){
        vec2 uv = CoverUV(vUv, uRes, uImageRes);

        vec4 texture = texture2D(uTexture, uv);

        gl_FragColor = texture;
        // gl_FragColor = vec4(1., 0., 0., 1.);
      }
      `,
    };
  }, [texture]);

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[width, height, 30, 30]} />
      <shaderMaterial args={[shaderArgs]} />
    </mesh>
  );
}
