// Exemple : rendu de 4 scènes dans un seul canvas
// filepath: /Users/lhotejc/mathalea/src/lib/3d/3d_dynamique/MultiViewCanvas.ts

import { THREE } from './threeInstance'

export class MultiViewCanvas {
  canvas: HTMLCanvasElement
  renderer: THREE.WebGLRenderer
  scenes: { scene: THREE.Scene; camera: THREE.Camera }[] = []

  constructor(width: number, height: number, nbViews: number) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = width
    this.canvas.height = height
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    })
    this.renderer.setSize(width, height, false)
    this.renderer.setClearColor(0xffffff)

    // Crée n scènes/caméras
    for (let i = 0; i < nbViews; i++) {
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000)
      camera.position.set(8, 8, 8)
      camera.lookAt(0, 0, 0)
      scene.add(new THREE.AxesHelper(5))

      // Ajoute une lumière
      const light = new THREE.DirectionalLight(0xffffff, 1)
      light.position.set(10, 10, 10)
      scene.add(light)

      // Ajoute un cube
      const geometry = new THREE.BoxGeometry(2, 2, 2)
      const material = new THREE.MeshStandardMaterial({ color: 0x44aa88 })
      const cube = new THREE.Mesh(geometry, material)
      cube.position.x = i * 3 - nbViews // Décale chaque cube
      scene.add(cube)

      this.scenes.push({ scene, camera })
    }
  }

  render() {
    const cols = Math.ceil(Math.sqrt(this.scenes.length))
    const rows = Math.ceil(this.scenes.length / cols)
    const w = Math.floor(this.canvas.width / cols)
    const h = Math.floor(this.canvas.height / rows)

    this.renderer.clear()
    for (let i = 0; i < this.scenes.length; i++) {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = col * w
      const y = row * h

      // Définit la zone de rendu
      this.renderer.setViewport(x, y, w, h)
      this.renderer.setScissor(x, y, w, h)
      this.renderer.setScissorTest(true)

      // Met à jour l'aspect de la caméra si c'est une PerspectiveCamera
      if (this.scenes[i].camera instanceof THREE.PerspectiveCamera) {
        ;(this.scenes[i].camera as THREE.PerspectiveCamera).aspect = w / h
        ;(
          this.scenes[i].camera as THREE.PerspectiveCamera
        ).updateProjectionMatrix()
      }

      // Rendu de la scène
      this.renderer.render(this.scenes[i].scene, this.scenes[i].camera)
    }
    this.renderer.setScissorTest(false)
  }

  /**
   * Remplace les objets d'une scène (hors caméras et lumières) par ceux fournis.
   * @param viewIndex Index de la vue à modifier
   * @param objects Tableau d'objets THREE.Object3D à ajouter
   */
  setObjects(viewIndex: number, objects: THREE.Object3D[]) {
    const { scene } = this.scenes[viewIndex]
    // Supprime tout sauf les lumières
    scene.children = scene.children.filter(
      (obj) =>
        obj.type === 'DirectionalLight' ||
        obj.type === 'AmbientLight' ||
        obj.type === 'PerspectiveCamera' ||
        obj.type === 'AxesHelper' ||
        obj.type === 'GridHelper',
    )
    // Ajoute les nouveaux objets
    objects.forEach((obj) => scene.add(obj))
    this.render()
  }
}
