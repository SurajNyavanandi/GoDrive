import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Procedural 3D Chauffeur Character
 * Animated via useFrame with lifelike breathing, cursor gaze tracking, and greeting gesture.
 */
function ChauffeurModel() {
  const characterRef = useRef();
  const headGroupRef = useRef();
  const torsoRef = useRef();
  const rightForearmRef = useRef();
  const targetRotation = useRef({ x: 0, y: 0 });
  const startTimeRef = useRef(performance.now());

  useFrame((state) => {
    const time = (performance.now() - startTimeRef.current) * 0.001;
    const { x, y } = state.pointer; // Normalized pointer: -1 to 1

    // Smooth head tracking target
    targetRotation.current.y = THREE.MathUtils.lerp(targetRotation.current.y, x * 0.7, 0.08);
    targetRotation.current.x = THREE.MathUtils.lerp(targetRotation.current.x, -y * 0.45, 0.08);

    if (headGroupRef.current) {
      headGroupRef.current.rotation.y = targetRotation.current.y + Math.sin(time * 1.5) * 0.03;
      headGroupRef.current.rotation.x = targetRotation.current.x + Math.cos(time * 1.2) * 0.02;
    }

    // Natural subtle breathing motion on torso
    if (torsoRef.current) {
      torsoRef.current.scale.y = 1 + Math.sin(time * 2.2) * 0.025;
      torsoRef.current.scale.x = 1 + Math.sin(time * 2.2) * 0.015;
    }

    // Friendly greeting wave on right arm
    if (rightForearmRef.current) {
      const wave = Math.sin(time * 3.6);
      rightForearmRef.current.rotation.z = -Math.PI / 6 + wave * 0.25;
      rightForearmRef.current.rotation.y = Math.cos(time * 3.6) * 0.12;
    }
  });

  return (
    <group ref={characterRef} position={[0, -0.05, 0]}>
      {/* 1. Torso / Executive Suit Jacket */}
      <group ref={torsoRef} position={[0, 0.55, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.5, 0.42, 1.05, 32]} />
          <meshStandardMaterial
            color="#1e293b" // Deep executive navy
            roughness={0.65}
            metalness={0.15}
          />
        </mesh>

        {/* White Shirt Collar & Placket */}
        <mesh position={[0, 0.26, 0.4]}>
          <boxGeometry args={[0.26, 0.46, 0.08]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>

        {/* Mobility Royal Blue Silk Tie */}
        <mesh position={[0, 0.16, 0.45]}>
          <boxGeometry args={[0.1, 0.44, 0.05]} />
          <meshStandardMaterial
            color="#0066ff" // Mobility blue
            roughness={0.3}
            metalness={0.25}
          />
        </mesh>

        {/* Gold Chauffeur Lapel Pin */}
        <mesh position={[0.22, 0.26, 0.44]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.02, 16]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.25} metalness={0.85} />
        </mesh>

        {/* Shoulder Epaulets */}
        <mesh position={[-0.48, 0.48, 0]}>
          <boxGeometry args={[0.18, 0.04, 0.15]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0.48, 0.48, 0]}>
          <boxGeometry args={[0.18, 0.04, 0.15]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>

      {/* 2. Neck & Head Hierarchy (Smooth cursor gaze tracking) */}
      <group ref={headGroupRef} position={[0, 1.28, 0]}>
        {/* Neck */}
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.16, 0.18, 0.28, 20]} />
          <meshStandardMaterial color="#f4b28c" roughness={0.6} />
        </mesh>

        {/* Head Sphere */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <sphereGeometry args={[0.35, 36, 32]} />
          <meshStandardMaterial color="#f4b28c" roughness={0.55} metalness={0.05} />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.12, 0.27, 0.31]}>
          <sphereGeometry args={[0.038, 16, 16]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0.12, 0.27, 0.31]}>
          <sphereGeometry args={[0.038, 16, 16]} />
          <meshBasicMaterial color="#0f172a" />
        </mesh>

        {/* Friendly Courteous Smile */}
        <mesh position={[0, 0.14, 0.32]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.07, 0.016, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#9a3412" roughness={0.5} />
        </mesh>

        {/* 3. Chauffeur Peaked Cap */}
        <group position={[0, 0.38, 0]}>
          {/* Cap Crown */}
          <mesh>
            <cylinderGeometry args={[0.39, 0.35, 0.22, 32]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.1} />
          </mesh>

          {/* Gold Cap Band */}
          <mesh position={[0, -0.09, 0]}>
            <cylinderGeometry args={[0.37, 0.37, 0.05, 32]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.25} metalness={0.85} />
          </mesh>

          {/* Gold Crest Emblem */}
          <mesh position={[0, -0.05, 0.37]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.9} />
          </mesh>

          {/* Cap Patent Leather Visor with Specular Curve */}
          <mesh position={[0, -0.11, 0.2]} rotation={[Math.PI / 6, 0, 0]}>
            <cylinderGeometry args={[0.39, 0.39, 0.04, 32, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#020617" roughness={0.15} metalness={0.6} />
          </mesh>
        </group>
      </group>

      {/* 4. Right Arm (Waving Welcoming Greeting) */}
      <group position={[0.54, 0.98, 0]}>
        {/* Upper arm */}
        <mesh position={[0.08, -0.18, 0]} rotation={[0, 0, -Math.PI / 9]}>
          <cylinderGeometry args={[0.12, 0.1, 0.42, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.65} />
        </mesh>

        {/* Forearm & Hand pivot (animated) */}
        <group ref={rightForearmRef} position={[0.16, -0.36, 0]}>
          <mesh position={[0.12, 0.16, 0.15]} rotation={[-Math.PI / 3, 0, -Math.PI / 6]}>
            <cylinderGeometry args={[0.09, 0.08, 0.4, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.65} />
          </mesh>
          {/* White Chauffeur Glove */}
          <mesh position={[0.22, 0.34, 0.28]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.35} />
          </mesh>
        </group>
      </group>

      {/* 5. Left Arm (Natural executive posture) */}
      <group position={[-0.54, 0.98, 0]}>
        <mesh position={[-0.06, -0.3, 0.05]} rotation={[0, 0, Math.PI / 16]}>
          <cylinderGeometry args={[0.12, 0.09, 0.65, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.65} />
        </mesh>
        <mesh position={[-0.08, -0.66, 0.06]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.35} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Main HeroDriverR3F Canvas Export
 * Declarative React Three Fiber scene with studio lights, soft float, and contact shadows.
 */
export default function HeroDriverR3F() {
  return (
    <div
      className="w-full h-full min-h-[220px] max-h-[300px] flex items-center justify-center select-none"
      aria-label="Interactive 3D Chauffeur Character"
    >
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        camera={{ position: [0, 1.35, 4.2], fov: 42 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {/* Studio 3-Point Lighting */}
          <ambientLight intensity={1.3} />
          <directionalLight
            position={[3, 4, 3.5]}
            intensity={2.2}
            castShadow
            shadow-mapSize={[512, 512]}
          />
          <directionalLight position={[-3, 2, 2]} intensity={0.9} color="#93c5fd" />
          <directionalLight position={[0, 3, -3]} intensity={1.6} color="#60a5fa" />

          {/* Organic Floating Motion */}
          <Float speed={2.0} rotationIntensity={0.2} floatIntensity={0.3}>
            <ChauffeurModel />
          </Float>

          {/* Soft Ground Contact Shadow */}
          <ContactShadows
            position={[0, -0.15, 0]}
            opacity={0.35}
            scale={3.5}
            blur={2.4}
            far={1.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
