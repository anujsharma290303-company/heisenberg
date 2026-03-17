import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import portraitUrl from '../../data/images/waltvshein.jpg';
import styles from './HeroPortraitScene.module.css';

export interface HeroPortraitSceneProps {
  className?: string;
}

export function HeroPortraitScene({ className }: HeroPortraitSceneProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
    camera.position.set(0, 0, 5.4);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    let frameId = 0;
    let disposed = false;
    let portraitTexture: THREE.Texture | null = null;
    let portraitGeometry: THREE.PlaneGeometry | null = null;
    let portraitMaterial: THREE.MeshBasicMaterial | null = null;
    let portraitMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | null = null;

    const resize = () => {
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();

    const loader = new THREE.TextureLoader();
    loader.load(portraitUrl, (texture) => {
      if (disposed) {
        texture.dispose();
        return;
      }

      const image = texture.image as { width?: number; height?: number };
      const imageWidth = image.width ?? 1;
      const imageHeight = image.height ?? 1;
      const aspectRatio = imageWidth / imageHeight;

      texture.colorSpace = THREE.SRGBColorSpace;
      portraitTexture = texture;
      portraitGeometry = new THREE.PlaneGeometry(4.35 * aspectRatio, 4.35, 1, 1);
      portraitMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.94,
      });
      portraitMesh = new THREE.Mesh(portraitGeometry, portraitMaterial);
      portraitMesh.position.set(0, 0.1, 0);
      scene.add(portraitMesh);
    });

    const animate = (time: number) => {
      const cinematicTime = time * 0.00042;

      if (portraitMesh) {
        portraitMesh.rotation.y = Math.sin(cinematicTime) * 0.09;
        portraitMesh.rotation.x = -0.04 + Math.cos(cinematicTime * 0.8) * 0.025;
        portraitMesh.position.y = 0.1 + Math.sin(cinematicTime * 1.6) * 0.04;
        portraitMesh.scale.setScalar(1.015 + Math.sin(cinematicTime * 1.15) * 0.015);
        camera.position.z = 5.35 + Math.cos(cinematicTime * 0.9) * 0.08;
      }

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);
    window.addEventListener('resize', resize);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);

      portraitTexture?.dispose();
      portraitGeometry?.dispose();
      portraitMaterial?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  const rootClasses = [styles.root, className].filter(Boolean).join(' ');

  return (
    <div className={rootClasses} aria-hidden="true">
      <div className={styles.viewport} ref={hostRef} />
      <div className={styles.vignette} />
      <div className={styles.lightLeak} />
      <div className={styles.frame} />
    </div>
  );
}
