import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // DNA Helix particles
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const t = (i / particleCount) * Math.PI * 8;
      const radius = 3 + Math.sin(t * 0.5) * 1.5;
      if (i < particleCount / 2) {
        positions[i * 3] = Math.cos(t) * radius;
        positions[i * 3 + 1] = (i / particleCount) * 20 - 10;
        positions[i * 3 + 2] = Math.sin(t) * radius;
      } else {
        positions[i * 3] = Math.cos(t + Math.PI) * radius;
        positions[i * 3 + 1] = (i / particleCount) * 20 - 10;
        positions[i * 3 + 2] = Math.sin(t + Math.PI) * radius;
      }
      // Cyan to purple gradient
      const mix = i / particleCount;
      colors[i * 3] = 0.22 + mix * 0.3;
      colors[i * 3 + 1] = 0.74 - mix * 0.3;
      colors[i * 3 + 2] = 0.97;
      sizes[i] = Math.random() * 3 + 1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Floating ambient particles
    const ambientCount = 500;
    const ambPositions = new Float32Array(ambientCount * 3);
    for (let i = 0; i < ambientCount; i++) {
      ambPositions[i * 3] = (Math.random() - 0.5) * 30;
      ambPositions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      ambPositions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    const ambGeometry = new THREE.BufferGeometry();
    ambGeometry.setAttribute('position', new THREE.BufferAttribute(ambPositions, 3));
    const ambMaterial = new THREE.PointsMaterial({
      size: 0.04,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const ambPoints = new THREE.Points(ambGeometry, ambMaterial);
    scene.add(ambPoints);

    camera.position.z = 12;
    let mouseX = 0, mouseY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      points.rotation.y += 0.002;
      points.rotation.x = mouseY * 0.1;
      ambPoints.rotation.y -= 0.001;
      ambPoints.rotation.x += 0.0005;
      camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      container.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      ambGeometry.dispose();
      ambMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="three-canvas" />;
}
