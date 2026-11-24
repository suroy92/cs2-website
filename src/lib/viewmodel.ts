/**
 * First-person pistol for the sensitivity tester, drawn like CS2's viewmodel:
 * its own scene and camera, rendered on top of the room after clearing depth,
 * so it never clips into walls or targets and never affects aim, FOV or hits.
 *
 * Units are inches (Source units), gun pointing down −Z. Placement follows
 * CS2's viewmodel_fov / viewmodel_offset_x/y/z / cl_prefer_lefthanded.
 * A generic sidearm design, not a copy of any in-game weapon.
 */
import {
  AdditiveBlending,
  BoxGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Quaternion,
  Scene,
  SphereGeometry,
  Vector3,
  type Material,
} from "three";

export interface ViewmodelSettings {
  fov: number; // viewmodel_fov (horizontal degrees at 4:3, like CS2)
  x: number; // viewmodel_offset_x: right
  y: number; // viewmodel_offset_y: forward
  z: number; // viewmodel_offset_z: up
  left: boolean; // cl_prefer_lefthanded
}

/** Where the gun sits with all offsets at 0 (camera space, inches). */
const BASE = new Vector3(2.2, -2.9, -13.5);
const KICK_MS = 170;
const FLASH_MS = 45;

export function createViewmodel(s: ViewmodelSettings) {
  const scene = new Scene(); // no background: drawn over the room
  // CS2's viewmodel_fov is horizontal at 4:3 → vertical FOV, then Hor+ like the world camera
  const vfov = (2 * Math.atan(Math.tan(((s.fov / 2) * Math.PI) / 180) * 0.75) * 180) / Math.PI;
  const camera = new PerspectiveCamera(vfov, 4 / 3, 0.5, 200);

  // ---- materials ----
  const metal = new MeshStandardMaterial({ color: "#3a3d48", metalness: 0.2, roughness: 0.45 });
  const metalDark = new MeshStandardMaterial({ color: "#24252d", metalness: 0.2, roughness: 0.55 });
  const polymer = new MeshStandardMaterial({ color: "#2a2b33", metalness: 0.05, roughness: 0.7 });
  const bore = new MeshBasicMaterial({ color: "#050507" });
  const sightDot = new MeshBasicMaterial({ color: "#f5e6d3" });
  const glove = new MeshStandardMaterial({ color: "#1d1b26", metalness: 0, roughness: 0.95 });
  const sleeve = new MeshStandardMaterial({ color: "#27223d", metalness: 0, roughness: 0.9 });

  const box = (w: number, h: number, d: number, m: Material, x: number, y: number, z: number, rx = 0) => {
    const b = new Mesh(new BoxGeometry(w, h, d), m);
    b.position.set(x, y, z);
    b.rotation.x = rx;
    return b;
  };

  // ---- the pistol (origin: top of the grip, where the hand holds it) ----
  const gun = new Group();
  const slide = new Group(); // moves back on each shot
  slide.add(box(0.95, 1.05, 7.2, metal, 0, 0.55, -2.3));
  for (let i = 0; i < 6; i++) slide.add(box(0.99, 0.8, 0.07, metalDark, 0, 0.5, 0.25 + i * 0.16)); // rear serrations
  slide.add(box(0.06, 0.38, 1.35, bore, 0.47, 0.72, -1.05)); // ejection port (right side)
  slide.add(box(0.2, 0.24, 0.32, metalDark, 0, 1.19, -5.65)); // front sight
  slide.add(box(0.12, 0.1, 0.05, sightDot, 0, 1.22, -5.5));
  slide.add(box(0.26, 0.28, 0.34, metalDark, 0.3, 1.2, 0.95)); // rear sight, two posts
  slide.add(box(0.26, 0.28, 0.34, metalDark, -0.3, 1.2, 0.95));
  const muzzle = new Mesh(new CylinderGeometry(0.25, 0.25, 0.3, 20), metalDark);
  muzzle.rotation.x = Math.PI / 2;
  muzzle.position.set(0, 0.5, -5.95);
  slide.add(muzzle);
  const hole = new Mesh(new CylinderGeometry(0.15, 0.15, 0.32, 16), bore);
  hole.rotation.x = Math.PI / 2;
  hole.position.set(0, 0.5, -5.97);
  slide.add(hole);
  gun.add(slide);

  gun.add(box(0.86, 0.55, 4.3, polymer, 0, -0.25, -3.55)); // frame / dust cover
  gun.add(box(0.88, 0.55, 2.7, polymer, 0, -0.25, 0.1)); // frame over the grip
  gun.add(box(0.95, 4.0, 1.85, polymer, 0, -2.2, 0.95, -0.3)); // grip, raked back
  gun.add(box(0.3, 0.18, 1.75, polymer, 0, -1.55, -1.45)); // trigger guard: bottom
  gun.add(box(0.3, 1.05, 0.2, polymer, 0, -1.08, -2.3)); // trigger guard: front
  gun.add(box(0.2, 0.7, 0.22, metalDark, 0, -0.95, -1.0, 0.3)); // trigger

  // ---- gloved hand and sleeve ----
  gun.add(box(1.32, 2.7, 2.25, glove, 0, -2.5, 1.0, -0.3)); // palm around the grip
  gun.add(box(1.22, 2.2, 0.55, glove, 0, -2.45, -0.35, -0.3)); // fingers wrapped round the front
  gun.add(box(0.45, 0.42, 1.9, glove, -0.62, -0.75, -0.2)); // thumb along the left side
  {
    const wrist = new Vector3(0.1, -3.9, 1.9);
    const dir = new Vector3(0.35, -0.6, 1).normalize();
    const len = 16;
    const arm = new Mesh(new CylinderGeometry(1.15, 1.45, len, 20), sleeve);
    arm.quaternion.copy(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir));
    arm.position.copy(wrist).addScaledVector(dir, len / 2);
    gun.add(arm);
    const cuff = new Mesh(new CylinderGeometry(1.0, 1.05, 1.4, 20), glove);
    cuff.quaternion.copy(arm.quaternion);
    cuff.position.copy(wrist).addScaledVector(dir, 0.4);
    gun.add(cuff);
  }

  // ---- muzzle flash (additive, only for a few frames) ----
  const flash = new Group();
  const flashMat = new MeshBasicMaterial({ color: "#ffcf7a", transparent: true, opacity: 0.95, blending: AdditiveBlending, depthWrite: false, side: DoubleSide });
  for (let i = 0; i < 3; i++) {
    const p = new Mesh(new PlaneGeometry(1.0, 2.6), flashMat);
    p.rotation.set(Math.PI / 2, (i * Math.PI) / 3, 0); // star of planes along the barrel
    p.position.z = -0.9;
    flash.add(p);
  }
  flash.add(new Mesh(new SphereGeometry(0.42, 12, 8), flashMat));
  flash.position.set(0, 0.5, -6.3);
  flash.visible = false;
  gun.add(flash);
  const flashLight = new PointLight("#ffb35c", 0, 14, 2);
  flashLight.position.set(0, 0.6, -6.8);
  gun.add(flashLight);

  // ---- lights (only the gun is lit; the room stays flat) ----
  scene.add(new HemisphereLight(new Color("#c9c3ff"), new Color("#141126"), 1.6));
  const key = new DirectionalLight("#ffffff", 2.4);
  key.position.set(-0.4, 1, 0.7);
  scene.add(key);
  const rim = new DirectionalLight("#b9a6ff", 2.2); // subtle lilac edge, to match the room
  rim.position.set(-1, 0.35, -0.4);
  scene.add(rim);

  // ---- placement: CS2 offsets (x right, y forward, z up), angled slightly towards the centre ----
  const holder = new Group();
  holder.add(gun);
  const side = s.left ? -1 : 1;
  const rest = new Vector3((BASE.x + s.x) * side, BASE.y + s.z, BASE.z - s.y);
  holder.position.copy(rest);
  holder.rotation.y = 0.07 * side;
  if (s.left) holder.scale.x = -1; // mirror for left hand
  scene.add(holder);

  // ---- shot animation ----
  let shotAt = -1e9;
  function kick() {
    shotAt = performance.now();
    flash.rotation.z = Math.random() * Math.PI;
    flash.scale.setScalar(0.85 + Math.random() * 0.35);
  }

  /** Call every frame before rendering. */
  function update(now = performance.now()) {
    const t = now - shotAt;
    let e = 0; // 0 = at rest, 1 = full kick
    if (t < 25) e = t / 25;
    else if (t < KICK_MS) {
      const u = (t - 25) / (KICK_MS - 25);
      e = (1 - u) * (1 - u); // ease back
    }
    gun.position.set(0, 0.18 * e, 0.75 * e);
    gun.rotation.x = 0.11 * e; // muzzle flips up
    const se = t < 70 ? Math.sin((Math.max(0, t) / 70) * Math.PI) : 0;
    slide.position.z = 1.1 * se;
    const on = t >= 0 && t < FLASH_MS;
    flash.visible = on;
    flashLight.intensity = on ? 60 * (1 - t / FLASH_MS) : 0;
    return t < KICK_MS; // still animating
  }

  function setAspect(aspect: number) {
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  }

  return { scene, camera, kick, update, setAspect };
}
