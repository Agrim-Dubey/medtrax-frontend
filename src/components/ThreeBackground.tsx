import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Procedurally generate a soft radial glow particle sprite
function createGlowTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(56, 189, 248, 0.95)');
  gradient.addColorStop(0.5, 'rgba(14, 165, 233, 0.45)');
  gradient.addColorStop(0.8, 'rgba(3, 105, 161, 0.12)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export default function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 13);

    // High performance WebGL renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const glowTexture = createGlowTexture();

    // ─── Double Helix Construction ───
    const helixGroup = new THREE.Group();
    scene.add(helixGroup);

    const totalHeight = 26;
    const helixRadius = 3.6;
    const turns = 4.5;
    const pointsPerStrand = 1400;
    const rungsCount = 42;
    const particlesPerRung = 12;

    const totalParticles = pointsPerStrand * 2 + rungsCount * particlesPerRung;
    const positions = new Float32Array(totalParticles * 3);
    const colors = new Float32Array(totalParticles * 3);
    const basePositions = new Float32Array(totalParticles * 3); // For wave animation
    const phases = new Float32Array(totalParticles);

    let pIdx = 0;

    // Helper to store particle
    const addParticle = (x: number, y: number, z: number, r: number, g: number, b: number, phase: number) => {
      positions[pIdx * 3] = x;
      positions[pIdx * 3 + 1] = y;
      positions[pIdx * 3 + 2] = z;

      basePositions[pIdx * 3] = x;
      basePositions[pIdx * 3 + 1] = y;
      basePositions[pIdx * 3 + 2] = z;

      colors[pIdx * 3] = r;
      colors[pIdx * 3 + 1] = g;
      colors[pIdx * 3 + 2] = b;

      phases[pIdx] = phase;
      pIdx++;
    };

    // 1. Strand A (Electric Cyan -> Sapphire)
    for (let i = 0; i < pointsPerStrand; i++) {
      const progress = i / pointsPerStrand;
      const y = (progress - 0.5) * totalHeight;
      const angle = progress * Math.PI * 2 * turns;
      const x = Math.cos(angle) * helixRadius;
      const z = Math.sin(angle) * helixRadius;

      // Color gradient along strand
      const r = 0.15 + Math.sin(progress * Math.PI) * 0.15;
      const g = 0.72 + Math.cos(progress * Math.PI) * 0.18;
      const b = 0.98;

      addParticle(x, y, z, r, g, b, angle);
    }

    // 2. Strand B (Emerald Mint -> Teal, phase offset by PI)
    for (let i = 0; i < pointsPerStrand; i++) {
      const progress = i / pointsPerStrand;
      const y = (progress - 0.5) * totalHeight;
      const angle = progress * Math.PI * 2 * turns + Math.PI;
      const x = Math.cos(angle) * helixRadius;
      const z = Math.sin(angle) * helixRadius;

      // Mint to turquoise
      const r = 0.2;
      const g = 0.88 - progress * 0.2;
      const b = 0.72 + progress * 0.25;

      addParticle(x, y, z, r, g, b, angle);
    }

    // 3. Hydrogen Bond Ladder Rungs (Connecting Strand A and B)
    for (let i = 0; i < rungsCount; i++) {
      const progress = (i + 0.5) / rungsCount;
      const y = (progress - 0.5) * (totalHeight * 0.94);
      const angle = progress * Math.PI * 2 * turns;

      const x1 = Math.cos(angle) * helixRadius;
      const z1 = Math.sin(angle) * helixRadius;
      const x2 = Math.cos(angle + Math.PI) * helixRadius;
      const z2 = Math.sin(angle + Math.PI) * helixRadius;

      for (let j = 0; j < particlesPerRung; j++) {
        const rungProgress = j / (particlesPerRung - 1);
        const rx = x1 + (x2 - x1) * rungProgress;
        const rz = z1 + (z2 - z1) * rungProgress;

        // Bridge color: softly blending between cyan and mint with lavender core
        const r = 0.35 + Math.sin(rungProgress * Math.PI) * 0.35;
        const g = 0.75 + Math.cos(rungProgress * Math.PI) * 0.15;
        const b = 0.98;

        addParticle(rx, y, rz, r, g, b, angle);
      }
    }

    const helixGeometry = new THREE.BufferGeometry();
    helixGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    helixGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const helixMaterial = new THREE.PointsMaterial({
      size: 0.18,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const helixPoints = new THREE.Points(helixGeometry, helixMaterial);
    helixGroup.add(helixPoints);

    // ─── Ambient Clinical Particles (Depth & Bokeh) ───
    const ambientCount = 650;
    const ambPositions = new Float32Array(ambientCount * 3);
    const ambColors = new Float32Array(ambientCount * 3);

    for (let i = 0; i < ambientCount; i++) {
      ambPositions[i * 3] = (Math.random() - 0.5) * 45;
      ambPositions[i * 3 + 1] = (Math.random() - 0.5) * 45;
      ambPositions[i * 3 + 2] = (Math.random() - 0.5) * 35;

      const isCyan = Math.random() > 0.45;
      ambColors[i * 3] = isCyan ? 0.22 : 0.45;
      ambColors[i * 3 + 1] = isCyan ? 0.75 : 0.82;
      ambColors[i * 3 + 2] = 0.98;
    }

    const ambGeometry = new THREE.BufferGeometry();
    ambGeometry.setAttribute('position', new THREE.BufferAttribute(ambPositions, 3));
    ambGeometry.setAttribute('color', new THREE.BufferAttribute(ambColors, 3));

    const ambMaterial = new THREE.PointsMaterial({
      size: 0.12,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const ambPoints = new THREE.Points(ambGeometry, ambMaterial);
    scene.add(ambPoints);

    // ─── Interactive Physics & Parallax ───
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let scrollY = 0;
    let lastScrollY = 0;
    let scrollVelocity = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const onScroll = () => {
      scrollY = window.scrollY;
      scrollVelocity = (scrollY - lastScrollY) * 0.001;
      lastScrollY = scrollY;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // Clock for consistent frame pacing
    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerping with soft inertia
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      // Smooth scroll velocity damping
      scrollVelocity *= 0.92;

      // Base rotation + interactive acceleration
      helixGroup.rotation.y += 0.0035 + scrollVelocity * 0.5;
      helixGroup.rotation.x = targetY * 0.25;
      helixGroup.rotation.z = targetX * 0.12;

      // Living organic pulse / breathing wave
      const positionAttr = helixGeometry.attributes.position as THREE.BufferAttribute;
      const posArray = positionAttr.array as Float32Array;

      for (let i = 0; i < totalParticles; i++) {
        const bx = basePositions[i * 3];
        const by = basePositions[i * 3 + 1];
        const bz = basePositions[i * 3 + 2];
        const phase = phases[i];

        // Harmonic breathing wave
        const wave = Math.sin(elapsedTime * 1.8 + by * 0.35 + phase * 0.1) * 0.12;
        const radiusScale = 1 + Math.sin(elapsedTime * 0.8 + by * 0.15) * 0.06;

        posArray[i * 3] = bx * radiusScale + Math.cos(elapsedTime + by * 0.2) * wave;
        posArray[i * 3 + 2] = bz * radiusScale + Math.sin(elapsedTime + by * 0.2) * wave;
      }
      positionAttr.needsUpdate = true;

      // Slow ambient particle drift
      ambPoints.rotation.y = elapsedTime * 0.015;
      ambPoints.rotation.x = Math.sin(elapsedTime * 0.02) * 0.05;

      // Camera parallax tracking
      camera.position.x += (targetX * 1.5 - camera.position.x) * 0.03;
      camera.position.y += (-targetY * 1.5 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      container.removeChild(renderer.domElement);

      helixGeometry.dispose();
      helixMaterial.dispose();
      ambGeometry.dispose();
      ambMaterial.dispose();
      glowTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="three-canvas" />;
}
