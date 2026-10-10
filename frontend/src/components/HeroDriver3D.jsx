import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * HeroDriver3D
 * An interactive, procedural 3D Chauffeur character rendered in Three.js.
 * Features:
 * - Studio 3-point lighting
 * - Idle breathing & floating animation
 * - Interactive head tracking (follows pointer/touch)
 * - Friendly waving / greeting hand gesture
 * - 60 FPS performance with WebGL cleanup
 */
export default function HeroDriver3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Dimensions
    const getW = () => container.clientWidth || 320;
    const getH = () => container.clientHeight || 280;

    let width = getW();
    let height = getH();

    // 1. Scene, Camera, Studio Lighting
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 50);
    camera.position.set(0, 1.4, 4.2);
    camera.lookAt(0, 0.9, 0);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Transparent
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    // Studio 3-Point Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(2.5, 4, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.0);
    fillLight.position.set(-2.5, 2, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 1.8);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    // 2. Character Model Group Hierarchy
    const characterGroup = new THREE.Group();
    characterGroup.position.set(0, -0.1, 0);
    scene.add(characterGroup);

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xf4b28c,
      roughness: 0.55,
      metalness: 0.05,
    });

    const suitMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Deep executive navy
      roughness: 0.7,
      metalness: 0.1,
    });

    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
    });

    const tieMat = new THREE.MeshStandardMaterial({
      color: 0x0066ff, // Trustworthy mobility blue
      roughness: 0.3,
      metalness: 0.2,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Amber Gold
      roughness: 0.3,
      metalness: 0.8,
    });

    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.5,
    });

    // 3. Torso & Upper Body
    const torsoGeo = new THREE.CylinderGeometry(0.48, 0.42, 1.05, 24);
    const torso = new THREE.Mesh(torsoGeo, suitMat);
    torso.position.set(0, 0.52, 0);
    torso.castShadow = true;
    characterGroup.add(torso);

    // White Shirt V-Placket
    const shirtGeo = new THREE.BoxGeometry(0.24, 0.45, 0.1);
    const shirt = new THREE.Mesh(shirtGeo, whiteMat);
    shirt.position.set(0, 0.78, 0.38);
    torso.add(shirt);

    // Royal Blue Tie
    const tieGeo = new THREE.BoxGeometry(0.1, 0.42, 0.06);
    const tie = new THREE.Mesh(tieGeo, tieMat);
    tie.position.set(0, 0.68, 0.43);
    torso.add(tie);

    // Chauffeur Gold Badge / Pin
    const pinGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16);
    pinGeo.rotateX(Math.PI / 2);
    const pin = new THREE.Mesh(pinGeo, goldMat);
    pin.position.set(0.22, 0.78, 0.42);
    torso.add(pin);

    // Epaulets (Gold details on shoulders)
    const epauletGeo = new THREE.BoxGeometry(0.18, 0.04, 0.14);
    const epauletLeft = new THREE.Mesh(epauletGeo, goldMat);
    epauletLeft.position.set(-0.46, 0.98, 0);
    torso.add(epauletLeft);

    const epauletRight = new THREE.Mesh(epauletGeo, goldMat);
    epauletRight.position.set(0.46, 0.98, 0);
    torso.add(epauletRight);

    // 4. Neck & Head Hierarchy (Rotates with pointer)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.25, 0);
    characterGroup.add(headGroup);

    const neckGeo = new THREE.CylinderGeometry(0.15, 0.17, 0.28, 16);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.set(0, -0.05, 0);
    headGroup.add(neck);

    // Head Sphere
    const headGeo = new THREE.SphereGeometry(0.34, 32, 28);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.set(0, 0.24, 0);
    headGroup.add(head);

    // Friendly Eyes
    const eyeGeo = new THREE.SphereGeometry(0.038, 16, 16);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

    const eyeLeft = new THREE.Mesh(eyeGeo, eyeMat);
    eyeLeft.position.set(-0.11, 0.26, 0.3);
    headGroup.add(eyeLeft);

    const eyeRight = new THREE.Mesh(eyeGeo, eyeMat);
    eyeRight.position.set(0.11, 0.26, 0.3);
    headGroup.add(eyeRight);

    // Friendly Smile
    const smileCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.09, 0.14, 0.3),
      new THREE.Vector3(0, 0.1, 0.33),
      new THREE.Vector3(0.09, 0.14, 0.3)
    );
    const smilePoints = smileCurve.getPoints(12);
    const smileGeo = new THREE.BufferGeometry().setFromPoints(smilePoints);
    const smileMat = new THREE.LineBasicMaterial({ color: 0x88421d, linewidth: 2 });
    const smile = new THREE.Line(smileGeo, smileMat);
    headGroup.add(smile);

    // 5. Chauffeur Peaked Cap
    const capGroup = new THREE.Group();
    capGroup.position.set(0, 0.36, 0);
    headGroup.add(capGroup);

    // Cap Crown
    const crownGeo = new THREE.CylinderGeometry(0.38, 0.34, 0.2, 24);
    const crown = new THREE.Mesh(crownGeo, suitMat);
    capGroup.add(crown);

    // Cap Gold Band
    const bandGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.05, 24);
    const band = new THREE.Mesh(bandGeo, goldMat);
    band.position.set(0, -0.08, 0);
    capGroup.add(band);

    // Gold Cap Crest Emblem
    const emblemGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const emblem = new THREE.Mesh(emblemGeo, goldMat);
    emblem.position.set(0, -0.04, 0.36);
    capGroup.add(emblem);

    // Cap Visor (Black patent leather curve)
    const visorGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.04, 24, 1, false, 0, Math.PI);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.rotation.x = Math.PI / 6;
    visor.position.set(0, -0.1, 0.18);
    capGroup.add(visor);

    // 6. Right Arm (Waving Greeting Gesture)
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.52, 0.95, 0);
    characterGroup.add(rightArmGroup);

    // Upper arm
    const upperArmGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.42, 16);
    const upperArm = new THREE.Mesh(upperArmGeo, suitMat);
    upperArm.position.set(0.08, -0.18, 0);
    upperArm.rotation.z = -Math.PI / 10;
    rightArmGroup.add(upperArm);

    // Forearm & Hand Pivot for wave
    const forearmGroup = new THREE.Group();
    forearmGroup.position.set(0.16, -0.36, 0);
    rightArmGroup.add(forearmGroup);

    const forearmGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.4, 16);
    const forearm = new THREE.Mesh(forearmGeo, suitMat);
    forearm.position.set(0.12, 0.16, 0.15);
    forearm.rotation.x = -Math.PI / 3;
    forearm.rotation.z = -Math.PI / 6;
    forearmGroup.add(forearm);

    // Hand (White chauffeur glove)
    const handGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const hand = new THREE.Mesh(handGeo, whiteMat);
    hand.position.set(0.22, 0.34, 0.28);
    forearmGroup.add(hand);

    // 7. Left Arm (Gentle resting posture)
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.52, 0.95, 0);
    characterGroup.add(leftArmGroup);

    const leftArmGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.65, 16);
    const leftArm = new THREE.Mesh(leftArmGeo, suitMat);
    leftArm.position.set(-0.06, -0.3, 0.05);
    leftArm.rotation.z = Math.PI / 16;
    leftArmGroup.add(leftArm);

    const leftHand = new THREE.Mesh(handGeo, whiteMat);
    leftHand.position.set(-0.08, -0.66, 0.06);
    leftArmGroup.add(leftHand);

    // 8. Ground Soft Shadow Disk
    const shadowGeo = new THREE.CircleGeometry(0.9, 32);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.25,
    });
    const groundShadow = new THREE.Mesh(shadowGeo, shadowMat);
    groundShadow.position.set(0, -0.05, 0);
    scene.add(groundShadow);

    // 9. Pointer Tracking for Interactive Gaze
    const targetLook = { x: 0, y: 0, currX: 0, currY: 0 };

    const onPointerMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const rect = container.getBoundingClientRect();
      const relX = (clientX - rect.left) / rect.width;
      const relY = (clientY - rect.top) / rect.height;

      targetLook.x = (relX - 0.5) * 1.5;
      targetLook.y = -(relY - 0.5) * 1.2;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });

    // Resize Handler
    const onResize = () => {
      if (!container || !renderer) return;
      width = getW();
      height = getH();
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    // 10. Animation Loop
    let animId;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = (performance.now() - startTime) * 0.001;

      // Smooth pointer interpolation
      targetLook.currX += (targetLook.x - targetLook.currX) * 0.06;
      targetLook.currY += (targetLook.y - targetLook.currY) * 0.06;

      if (!prefersReducedMotion) {
        // Idle breathing & gentle float
        characterGroup.position.y = -0.1 + Math.sin(time * 2.2) * 0.035;

        // Head smoothly turns to track user's cursor / finger
        headGroup.rotation.y = targetLook.currX * 0.6 + Math.sin(time * 1.2) * 0.04;
        headGroup.rotation.x = -targetLook.currY * 0.4 + Math.cos(time * 1.5) * 0.02;

        // Waving Hand Animation
        const wave = Math.sin(time * 3.8);
        forearmGroup.rotation.z = wave * 0.28;
        forearmGroup.rotation.y = Math.cos(time * 3.8) * 0.15;

        // Subtle torso sway
        torso.rotation.y = Math.sin(time * 1.5) * 0.03;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('resize', onResize);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose materials & geometries
      [skinMat, suitMat, whiteMat, tieMat, goldMat, visorMat, shadowMat, eyeMat].forEach((m) =>
        m.dispose()
      );
      [
        torsoGeo,
        shirtGeo,
        tieGeo,
        pinGeo,
        epauletGeo,
        neckGeo,
        headGeo,
        eyeGeo,
        smileGeo,
        crownGeo,
        bandGeo,
        emblemGeo,
        visorGeo,
        upperArmGeo,
        forearmGeo,
        handGeo,
        leftArmGeo,
        shadowGeo,
      ].forEach((g) => g.dispose());

      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[220px] max-h-[300px] flex items-center justify-center select-none"
      aria-label="3D Interactive Chauffeur Character"
    />
  );
}
