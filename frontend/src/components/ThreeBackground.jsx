import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check for user reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();

    const getWidth = () => container.clientWidth || window.innerWidth;
    const getHeight = () => container.clientHeight || 260;

    let width = getWidth();
    let height = getHeight();

    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 100);
    camera.position.set(0, 3.8, 8.2);
    camera.lookAt(0, -0.2, 0);

    // 2. High-Performance WebGL Renderer
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
    renderer.setClearColor(0x000000, 0); // Pure transparent backdrop
    container.appendChild(renderer.domElement);

    // 3. Dynamic Colorful Interactive Mesh Construction
    const cols = 36;
    const rows = 26;
    const totalPoints = cols * rows;

    const positions = new Float32Array(totalPoints * 3);
    const colors = new Float32Array(totalPoints * 3);
    const baseElevation = new Float32Array(totalPoints);

    // Palette: Cyan (#06B6D4), Royal Blue (#2563EB), Soft Violet (#8B5CF6), Mint (#10B981)
    const colorPalette = [
      new THREE.Color(0x06b6d4), // Electric Cyan
      new THREE.Color(0x2563eb), // Vivid Royal Blue
      new THREE.Color(0x8b5cf6), // Soft Violet
      new THREE.Color(0x10b981), // Emerald Mint
      new THREE.Color(0x38bdf8), // Sky Blue
    ];

    const spacingX = 0.58;
    const spacingZ = 0.55;
    const offsetX = (cols * spacingX) / 2;
    const offsetZ = (rows * spacingZ) / 2;

    let idx = 0;
    for (let i = 0; i < cols; i++) {
      const u = i / (cols - 1); // 0 to 1 along X
      for (let j = 0; j < rows; j++) {
        const v = j / (rows - 1); // 0 to 1 along Z
        const x = i * spacingX - offsetX;
        const z = j * spacingZ - offsetZ;

        // Base organic parabolic curve
        const distFromCenter = Math.sqrt(x * x + z * z);
        const y = Math.sin(distFromCenter * 0.4) * 0.28 - 0.45;

        positions[idx * 3] = x;
        positions[idx * 3 + 1] = y;
        positions[idx * 3 + 2] = z;
        baseElevation[idx] = y;

        // Smooth multi-color gradient based on coordinates and diagonal flow
        const colorFactor = (u * 0.65 + v * 0.35 + Math.sin(x * 0.5) * 0.15) % 1;
        const c1 = colorPalette[Math.floor(colorFactor * (colorPalette.length - 1))];
        const c2 = colorPalette[Math.min(colorPalette.length - 1, Math.floor(colorFactor * (colorPalette.length - 1)) + 1)];
        const lerpFactor = (colorFactor * (colorPalette.length - 1)) % 1;

        const mixedColor = c1.clone().lerp(c2, lerpFactor);
        colors[idx * 3] = mixedColor.r;
        colors[idx * 3 + 1] = mixedColor.g;
        colors[idx * 3 + 2] = mixedColor.b;

        idx++;
      }
    }

    const gridGeometry = new THREE.BufferGeometry();
    gridGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    gridGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Grid wireframe indices (connecting rows and columns)
    const lineIndices = [];
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const current = i * rows + j;
        if (i < cols - 1) {
          lineIndices.push(current, (i + 1) * rows + j);
        }
        if (j < rows - 1) {
          lineIndices.push(current, i * rows + (j + 1));
        }
      }
    }
    gridGeometry.setIndex(lineIndices);

    // Visible colorful lines with vertex color blending
    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      linewidth: 1.5,
    });
    const gridLines = new THREE.LineSegments(gridGeometry, lineMaterial);
    scene.add(gridLines);

    // Glowing colorful particle nodes
    // Create a circular particle texture for smooth soft glow dots
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const particleTexture = new THREE.CanvasTexture(canvas);

    const pointsMaterial = new THREE.PointsMaterial({
      vertexColors: true,
      size: 0.16,
      map: particleTexture,
      transparent: true,
      opacity: 0.85,
      alphaTest: 0.01,
      blending: THREE.NormalBlending,
    });
    const pointsMesh = new THREE.Points(gridGeometry, pointsMaterial);
    scene.add(pointsMesh);

    // 4. Floating Ambient Drift Particles (depth sparkles)
    const driftCount = 65;
    const driftPositions = new Float32Array(driftCount * 3);
    const driftColors = new Float32Array(driftCount * 3);
    const driftVelocities = [];

    for (let d = 0; d < driftCount; d++) {
      driftPositions[d * 3] = (Math.random() - 0.5) * 18;
      driftPositions[d * 3 + 1] = Math.random() * 5 - 1.5;
      driftPositions[d * 3 + 2] = (Math.random() - 0.5) * 14;

      const randomColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      driftColors[d * 3] = randomColor.r;
      driftColors[d * 3 + 1] = randomColor.g;
      driftColors[d * 3 + 2] = randomColor.b;

      driftVelocities.push({
        y: 0.004 + Math.random() * 0.008,
        x: (Math.random() - 0.5) * 0.003,
        z: (Math.random() - 0.5) * 0.003,
      });
    }

    const driftGeometry = new THREE.BufferGeometry();
    driftGeometry.setAttribute('position', new THREE.BufferAttribute(driftPositions, 3));
    driftGeometry.setAttribute('color', new THREE.BufferAttribute(driftColors, 3));

    const driftMaterial = new THREE.PointsMaterial({
      vertexColors: true,
      size: 0.18,
      map: particleTexture,
      transparent: true,
      opacity: 0.7,
      alphaTest: 0.01,
    });
    const driftPoints = new THREE.Points(driftGeometry, driftMaterial);
    scene.add(driftPoints);

    // 5. Cursor & Touch "Traction" Interaction Setup
    const pointer = {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      worldX: 0,
      worldZ: 0,
      isInteracting: false,
    };

    const updatePointer = (clientX, clientY) => {
      pointer.isInteracting = true;
      const normX = (clientX / window.innerWidth) * 2 - 1;
      const normY = -(clientY / window.innerHeight) * 2 + 1;

      pointer.targetX = normX;
      pointer.targetY = normY;

      // Map normalized pointer coordinates to ground plane world space (traction origin)
      pointer.worldX = normX * (offsetX * 0.85);
      pointer.worldZ = -normY * (offsetZ * 0.85);
    };

    const onPointerMove = (e) => {
      updatePointer(e.clientX, e.clientY);
    };

    const onTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    // Resize handler
    const onResize = () => {
      if (!container || !renderer) return;
      width = getWidth();
      height = getHeight();
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    // 6. 60FPS Continuous Animation Loop
    let animationFrameId;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = (performance.now() - startTime) * 0.001;

      // Fluid spring damping for camera tracking
      pointer.currentX += (pointer.targetX - pointer.currentX) * 0.055;
      pointer.currentY += (pointer.targetY - pointer.currentY) * 0.055;

      camera.position.x = pointer.currentX * 2.0;
      camera.position.y = 3.8 - pointer.currentY * 0.85;
      camera.lookAt(0, -0.25, 0);

      // Active undulating sine waves & interactive traction ripples
      if (!prefersReducedMotion) {
        const posAttr = gridGeometry.attributes.position;
        const posArray = posAttr.array;

        const tractionRadius = 4.2;

        for (let k = 0; k < totalPoints; k++) {
          const vx = posArray[k * 3];
          const vz = posArray[k * 3 + 2];

          // 1. Organic multi-frequency continuous ambient ocean wave
          const wave1 = Math.sin(elapsedTime * 1.35 + vx * 0.55 + vz * 0.45) * 0.22;
          const wave2 = Math.cos(elapsedTime * 0.95 + vz * 0.75 - vx * 0.3) * 0.12;
          const wave3 = Math.sin(elapsedTime * 1.8 + (vx + vz) * 0.35) * 0.06;

          // 2. Cursor/Touch "Traction" interactive magnetic pulse
          let tractionEffect = 0;
          if (pointer.isInteracting) {
            const dx = vx - pointer.worldX;
            const dz = vz - pointer.worldZ;
            const distToCursor = Math.sqrt(dx * dx + dz * dz);

            if (distToCursor < tractionRadius) {
              const falloff = 1 - distToCursor / tractionRadius;
              // Responsive fluid traction ripple
              tractionEffect =
                Math.sin(distToCursor * 2.8 - elapsedTime * 5.0) *
                (falloff * falloff) *
                0.45;
            }
          }

          posArray[k * 3 + 1] = baseElevation[k] + wave1 + wave2 + wave3 + tractionEffect;
        }

        posAttr.needsUpdate = true;

        // Animate floating drift particles
        const driftPosAttr = driftGeometry.attributes.position;
        const driftArray = driftPosAttr.array;

        for (let d = 0; d < driftCount; d++) {
          driftArray[d * 3 + 1] += driftVelocities[d].y;
          driftArray[d * 3] += driftVelocities[d].x + Math.sin(elapsedTime * 0.5 + d) * 0.002;

          // Wrap around top boundary
          if (driftArray[d * 3 + 1] > 4.5) {
            driftArray[d * 3 + 1] = -1.5;
            driftArray[d * 3] = (Math.random() - 0.5) * 18;
          }
        }
        driftPosAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', onResize);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      gridGeometry.dispose();
      lineMaterial.dispose();
      pointsMaterial.dispose();
      particleTexture.dispose();
      driftGeometry.dispose();
      driftMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none overflow-hidden z-0"
      style={{ opacity: 0.95 }}
      aria-hidden="true"
    />
  );
}
