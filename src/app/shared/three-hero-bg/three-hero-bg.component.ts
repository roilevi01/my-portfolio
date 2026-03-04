import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  NgZone,
} from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-three-hero-bg',
  standalone: true,
  template: `<canvas #canvas></canvas>`,
  styles: [
    `
      :host {
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        overflow: hidden;
      }
      canvas {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class ThreeHeroBgComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private meshes: THREE.Mesh[] = [];
  private animId = 0;
  private mouse = { x: 0, y: 0 };
  private onMouseMove = (e: MouseEvent) => {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  };
  private onResize = () => this.resize();

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => this.init());
  }

  private init(): void {
    const canvas = this.canvasRef.nativeElement;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    this.camera.position.z = 14;

    // Lights
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 8, 6);
    this.scene.add(dir);

    // Materials
    const wireMat = (color: number) =>
      new THREE.MeshStandardMaterial({
        color,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });

    const glassMat = (color: number) =>
      new THREE.MeshPhysicalMaterial({
        color,
        transparent: true,
        opacity: 0.18,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.6,
      });

    // Shape definitions: [geometry, material, position, scale]
    const shapes: [THREE.BufferGeometry, THREE.Material, THREE.Vector3, number][] = [
      [new THREE.IcosahedronGeometry(1.6, 1), wireMat(0x2563eb), new THREE.Vector3(-5, 2.5, -2), 1],
      [new THREE.TorusGeometry(1.2, 0.4, 16, 32), glassMat(0x1d4ed8), new THREE.Vector3(5.5, -1.5, -3), 1],
      [new THREE.OctahedronGeometry(1, 0), wireMat(0x2563eb), new THREE.Vector3(3, 3.5, -5), 0.9],
      [new THREE.SphereGeometry(1.1, 8, 6), wireMat(0x93c5fd), new THREE.Vector3(-4, -2.8, -4), 0.85],
      [new THREE.TorusKnotGeometry(0.7, 0.25, 64, 8), glassMat(0x2563eb), new THREE.Vector3(0, -3.5, -3), 0.8],
      [new THREE.IcosahedronGeometry(0.9, 0), wireMat(0x1d4ed8), new THREE.Vector3(-2, 4, -6), 0.75],
      [new THREE.DodecahedronGeometry(0.8, 0), glassMat(0x93c5fd), new THREE.Vector3(6, 1.5, -5), 0.7],
    ];

    for (const [geo, mat, pos, scale] of shapes) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      mesh.scale.setScalar(scale);
      // store original position for parallax
      mesh.userData['origPos'] = pos.clone();
      this.scene.add(mesh);
      this.meshes.push(mesh);
    }

    window.addEventListener('mousemove', this.onMouseMove, { passive: true });
    window.addEventListener('resize', this.onResize, { passive: true });

    this.animate();
  }

  private animate = (): void => {
    this.animId = requestAnimationFrame(this.animate);
    const t = performance.now() * 0.001;

    for (let i = 0; i < this.meshes.length; i++) {
      const m = this.meshes[i];
      const orig: THREE.Vector3 = m.userData['origPos'];
      const speed = 0.15 + i * 0.05;

      // gentle rotation
      m.rotation.x = t * speed * 0.4;
      m.rotation.y = t * speed * 0.3;

      // float
      m.position.y = orig.y + Math.sin(t * 0.5 + i) * 0.35;

      // mouse parallax (subtle)
      const factor = 0.3 + i * 0.08;
      m.position.x = orig.x + this.mouse.x * factor;
      m.position.z = orig.z + this.mouse.y * factor * 0.5;
    }

    this.renderer.render(this.scene, this.camera);
  };

  private resize(): void {
    const canvas = this.canvasRef.nativeElement;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animId);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize', this.onResize);

    for (const m of this.meshes) {
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    }
    this.renderer.dispose();
  }
}
