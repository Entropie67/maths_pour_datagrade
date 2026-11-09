import { context } from '../../modules/context'
import { OrbitControls, THREE } from '../3d/3d_dynamique/threeInstance'
import type { IExercice } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

export type CubeStackCube = { x: number; y: number; z: number; color?: string }
/** Format compatible avec l'export JSON de vision-espace. */
export type CubeStackState = {
  version: 1
  grid: number
  cubes: CubeStackCube[]
}
export type CubeStackEditorCreateOptions = {
  id?: string
  numeroExercice: number
  questionIndex: number
  initialState?: CubeStackState
  grid?: number
  interactivityOn?: boolean
}
export type CubeStackEditorOptions = Omit<
  CubeStackEditorCreateOptions,
  'numeroExercice' | 'questionIndex'
> & { expectedState?: CubeStackState }

type Rotation = [number, number, number, number, number, number]
const DEFAULT_COLOR = '#3b82f6'
const DEFAULT_GRID = 12
const isInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value)
const isHalfInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value * 2)

export function parseCubeStackState(value: unknown): CubeStackState | null {
  if (typeof value === 'string') {
    try {
      return parseCubeStackState(JSON.parse(value))
    } catch {
      return null
    }
  }
  if (value == null || typeof value !== 'object') return null
  const candidate = value as Partial<CubeStackState>
  if (!Array.isArray(candidate.cubes)) return null
  const grid =
    isInteger(candidate.grid) && candidate.grid > 0
      ? candidate.grid
      : DEFAULT_GRID
  const seen = new Set<string>()
  const cubes: CubeStackCube[] = []
  for (const raw of candidate.cubes) {
    if (raw == null || typeof raw !== 'object') return null
    const cube = raw as Partial<CubeStackCube>
    if (
      !isHalfInteger(cube.x) ||
      !isHalfInteger(cube.y) ||
      !isHalfInteger(cube.z)
    )
      return null
    const key = `${cube.x},${cube.y},${cube.z}`
    if (seen.has(key)) continue
    seen.add(key)
    cubes.push({
      x: cube.x,
      y: cube.y,
      z: cube.z,
      color: typeof cube.color === 'string' ? cube.color : DEFAULT_COLOR,
    })
  }
  return { version: 1, grid, cubes }
}

function permutationParity(permutation: number[]): number {
  let inversions = 0
  for (let i = 0; i < permutation.length; i++)
    for (let j = i + 1; j < permutation.length; j++)
      if (permutation[i] > permutation[j]) inversions++
  return inversions % 2 === 0 ? 1 : -1
}

function cubeRotations(): Rotation[] {
  const permutations = [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
  ]
  const rotations: Rotation[] = []
  for (const permutation of permutations) {
    for (const sx of [-1, 1])
      for (const sy of [-1, 1])
        for (const sz of [-1, 1]) {
          if (permutationParity(permutation) * sx * sy * sz === 1)
            rotations.push([
              permutation[0],
              sx,
              permutation[1],
              sy,
              permutation[2],
              sz,
            ] as Rotation)
        }
  }
  return rotations
}
const ROTATIONS = cubeRotations()

function canonicalCoordinates(
  cubes: CubeStackCube[],
  rotation: Rotation,
): string {
  const transformed = cubes.map((cube) => {
    const values = [cube.x, cube.y, cube.z]
    return [
      values[rotation[0]] * rotation[1],
      values[rotation[2]] * rotation[3],
      values[rotation[4]] * rotation[5],
    ]
  })
  const mins = [0, 1, 2].map((axis) =>
    Math.min(...transformed.map((point) => point[axis])),
  )
  return transformed
    .map((point) => point.map((value, axis) => value - mins[axis]).join(','))
    .sort()
    .join(';')
}

/** Compare deux empilements modulo une translation et une rotation de l'espace. */
export function areCubeStacksCongruent(
  first: CubeStackState | string,
  second: CubeStackState | string,
): boolean {
  const a = parseCubeStackState(first)
  const b = parseCubeStackState(second)
  if (a == null || b == null || a.cubes.length !== b.cubes.length) return false
  if (a.cubes.length === 0) return true
  const target = canonicalCoordinates(a.cubes, ROTATIONS[0])
  return ROTATIONS.some(
    (rotation) => canonicalCoordinates(b.cubes, rotation) === target,
  )
}

const keyOf = (x: number, y: number, z: number) => `${x},${y},${z}`

export class CubeStackEditorElement extends MathaleaCustomElement {
  static readonly elementTag = 'cube-stack-editor'
  private state: CubeStackState = { version: 1, grid: DEFAULT_GRID, cubes: [] }
  private mode: 'add' | 'remove' | 'select' = 'add'
  private selected = new Set<string>()
  private renderer: THREE.WebGLRenderer | null = null
  private scene: THREE.Scene | null = null
  private camera: THREE.PerspectiveCamera | null = null
  private controls: OrbitControls | null = null
  private resizeObserver: ResizeObserver | null = null
  private animationFrame: number | null = null
  private cubeMeshes = new Map<string, THREE.Mesh>()
  private ground: THREE.Mesh | null = null
  private pointerStart: { x: number; y: number } | null = null

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  static create({
    id,
    numeroExercice,
    questionIndex,
    initialState = { version: 1, grid: DEFAULT_GRID, cubes: [] },
    grid = initialState.grid,
    interactivityOn = true,
  }: CubeStackEditorCreateOptions): string {
    return super.create({
      id: id ?? `${this.elementTag}Ex${numeroExercice}Q${questionIndex}`,
      numeroExercice,
      questionIndex,
      initialState: { ...initialState, grid },
      interactivityOn,
    })
  }

  static verifQuestion(exercice: IExercice, questionIndex: number) {
    const id = `${this.elementTag}Ex${exercice.numeroExercice}Q${questionIndex}`
    const element = document.getElementById(id) as CubeStackEditorElement | null
    const result = document.querySelector(
      `#resultatCheckEx${exercice.numeroExercice}Q${questionIndex}`,
    )
    const feedback = document.querySelector(
      `#feedbackEx${exercice.numeroExercice}Q${questionIndex}`,
    ) as HTMLElement | null
    const expected =
      exercice.autoCorrection?.[questionIndex]?.valeur?.reponse?.value
    const actual = element?.value ?? ''
    const isOk =
      element != null && areCubeStacksCongruent(expected as string, actual)
    const message =
      element == null
        ? "L'éditeur d'empilement est introuvable."
        : isOk
          ? ''
          : "L'empilement ne correspond pas à celui attendu."
    if (element != null) {
      exercice.answers ??= {}
      exercice.answers[element.id] = actual
      element.interactivityOn = false
    }
    if (result != null) result.innerHTML = isOk ? '😎' : '☹️'
    if (feedback != null) {
      feedback.textContent = message
      feedback.style.display = message === '' ? 'none' : 'block'
    }
    return {
      isOk,
      feedback: message,
      score: { nbBonnesReponses: isOk ? 1 : 0, nbReponses: 1 },
    }
  }

  static formatStudentAnswer(rawAnswer: string): string {
    const state = parseCubeStackState(rawAnswer)
    return state == null
      ? rawAnswer
      : `${state.cubes.length} cube${state.cubes.length > 1 ? 's' : ''}`
  }

  connectedCallback(): void {
    this.hydrateCommonAttributes()
    const initial = parseCubeStackState(this.getAttribute('initial-state'))
    if (initial != null) this.state = initial
    this.render()
  }
  disconnectedCallback(): void {
    this.disposeThree()
  }

  render(): string | void {
    if (!context.isHtml || context.isTypst || this.shadowRoot == null) return ''
    this.disposeThree()
    const disabled = this.interactivityOn ? '' : 'disabled'
    this.shadowRoot.innerHTML = `
      <style>
        :host{display:block;max-width:760px;margin:.5rem 0;color:#1f2937;font-family:system-ui,sans-serif}.editor{overflow:hidden;border:1px solid #cbd5e1;border-radius:.6rem;background:#f8fafc}.toolbar{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;padding:.55rem;background:white;border-bottom:1px solid #e2e8f0}.moves{display:flex;gap:.2rem;padding-left:.2rem;border-left:1px solid #cbd5e1}button{padding:.38rem .65rem;border:1px solid #94a3b8;border-radius:.35rem;background:white;cursor:pointer}button.active{color:white;background:#2563eb;border-color:#2563eb}button:disabled{cursor:default;opacity:.55}.count{margin-left:auto;font-size:.9rem}.viewport{height:420px;touch-action:none;position:relative}canvas{display:block;width:100%;height:100%}.hint{padding:.4rem .6rem;font-size:.8rem;background:white;border-top:1px solid #e2e8f0}
      </style><div class="editor"><div class="toolbar" role="toolbar" aria-label="Outils pour les cubes">
      <button data-mode="add" class="${this.mode === 'add' ? 'active' : ''}" ${disabled}>Ajouter</button><button data-mode="remove" class="${this.mode === 'remove' ? 'active' : ''}" ${disabled}>Supprimer</button><button data-mode="select" class="${this.mode === 'select' ? 'active' : ''}" ${disabled}>Sélectionner</button>${this.mode === 'select' ? `<span class="moves" aria-label="Déplacer la sélection par demi-pas"><button data-move-x="-0.5" data-move-z="0" title="Déplacer vers la gauche" ${disabled || this.selected.size === 0 ? 'disabled' : ''}>←</button><button data-move-x="0.5" data-move-z="0" title="Déplacer vers la droite" ${disabled || this.selected.size === 0 ? 'disabled' : ''}>→</button><button data-move-x="0" data-move-z="-0.5" title="Déplacer vers l'arrière" ${disabled || this.selected.size === 0 ? 'disabled' : ''}>↑</button><button data-move-x="0" data-move-z="0.5" title="Déplacer vers l'avant" ${disabled || this.selected.size === 0 ? 'disabled' : ''}>↓</button></span>` : ''}<span class="count">${this.state.cubes.length} cube${this.state.cubes.length > 1 ? 's' : ''}</span></div><div class="viewport" aria-label="Éditeur 3D d'empilement de cubes"></div><div class="hint">Cliquer sur la grille ou une face pour ajouter. En mode « Sélectionner », déplacer les cubes choisis par demi-pas avec les flèches. Faire glisser pour tourner la vue.</div></div>`
    this.shadowRoot
      .querySelectorAll<HTMLButtonElement>('[data-mode]')
      .forEach((button) =>
        button.addEventListener('click', () => {
          this.mode = button.dataset.mode as typeof this.mode
          this.render()
        }),
      )
    this.shadowRoot
      .querySelectorAll<HTMLButtonElement>('[data-move-x]')
      .forEach((button) =>
        button.addEventListener('click', () => {
          this.moveSelection(
            Number(button.dataset.moveX),
            Number(button.dataset.moveZ),
          )
        }),
      )
    this.setupThree(this.shadowRoot.querySelector('.viewport') as HTMLElement)
  }

  get value(): string {
    return JSON.stringify({
      version: 1,
      grid: this.state.grid,
      cubes: [...this.state.cubes].sort(
        (a, b) => a.x - b.x || a.y - b.y || a.z - b.z,
      ),
    })
  }
  set value(nextValue: string) {
    this.update(nextValue)
  }
  update(nextValue: string | CubeStackState): void {
    const parsed = parseCubeStackState(nextValue)
    if (parsed == null) return
    this.state = parsed
    this.selected.clear()
    this.render()
  }
  protected onInteractivityChanged(): void {
    this.render()
  }

  private setupThree(container: HTMLElement): void {
    try {
      const width = container.clientWidth || 640
      const height = container.clientHeight || 420
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      this.renderer.setSize(width, height, false)
      container.append(this.renderer.domElement)
      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color(0xeaf1fb)
      this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100)
      this.camera.position.set(10, 10, 10)
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      this.controls.target.set(0, 1.5, 0)
      this.controls.enableDamping = true
      this.controls.update()
      this.scene.add(new THREE.HemisphereLight(0xffffff, 0x64748b, 2.2))
      const light = new THREE.DirectionalLight(0xffffff, 2.5)
      light.position.set(6, 10, 8)
      this.scene.add(light)
      this.scene.add(
        new THREE.GridHelper(
          this.state.grid,
          this.state.grid,
          0x6b9bd2,
          0xa9c4e8,
        ),
      )
      this.ground = new THREE.Mesh(
        new THREE.PlaneGeometry(this.state.grid, this.state.grid),
        new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }),
      )
      this.ground.rotation.x = -Math.PI / 2
      this.scene.add(this.ground)
      this.rebuildCubes()
      const canvas = this.renderer.domElement
      canvas.addEventListener('pointerdown', (event) => {
        this.pointerStart = { x: event.clientX, y: event.clientY }
      })
      canvas.addEventListener('pointerup', (event) => {
        if (!this.interactivityOn || this.pointerStart == null) return
        const distance = Math.hypot(
          event.clientX - this.pointerStart.x,
          event.clientY - this.pointerStart.y,
        )
        this.pointerStart = null
        if (distance < 5) this.handleClick(event)
      })
      this.resizeObserver = new ResizeObserver(() => this.resize(container))
      this.resizeObserver.observe(container)
      const animate = () => {
        this.controls?.update()
        if (
          this.renderer != null &&
          this.scene != null &&
          this.camera != null
        ) {
          this.renderer.render(this.scene, this.camera)
          this.animationFrame = requestAnimationFrame(animate)
        }
      }
      animate()
    } catch (error) {
      container.textContent = "L'affichage 3D n'est pas disponible."
      window.notify?.("Impossible d'initialiser l'éditeur 3D", { error })
    }
  }

  private resize(container: HTMLElement): void {
    if (this.renderer == null || this.camera == null) return
    const width = container.clientWidth || 1
    const height = container.clientHeight || 1
    this.renderer.setSize(width, height, false)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  private rebuildCubes(): void {
    if (this.scene == null) return
    for (const mesh of this.cubeMeshes.values()) {
      this.scene.remove(mesh)
      mesh.geometry.dispose()
      ;(mesh.material as THREE.Material).dispose()
    }
    this.cubeMeshes.clear()
    for (const cube of this.state.cubes) {
      const key = keyOf(cube.x, cube.y, cube.z)
      const material = new THREE.MeshStandardMaterial({
        color: cube.color ?? DEFAULT_COLOR,
        roughness: 0.65,
        emissive: this.selected.has(key) ? 0x8a6500 : 0x000000,
      })
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.96, 0.96, 0.96),
        material,
      )
      mesh.position.set(
        cube.x - this.state.grid / 2 + 0.5,
        cube.y + 0.5,
        cube.z - this.state.grid / 2 + 0.5,
      )
      mesh.userData.grid = cube
      this.scene.add(mesh)
      this.cubeMeshes.set(key, mesh)
    }
  }

  private handleClick(event: PointerEvent): void {
    if (this.renderer == null || this.camera == null || this.ground == null)
      return
    const rect = this.renderer.domElement.getBoundingClientRect()
    const pointer = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    )
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(pointer, this.camera)
    const hit = raycaster.intersectObjects([
      ...this.cubeMeshes.values(),
      this.ground,
    ])[0]
    if (hit == null) return
    if (hit.object === this.ground) {
      if (this.mode === 'add')
        this.addCube(
          Math.floor(hit.point.x + this.state.grid / 2),
          0,
          Math.floor(hit.point.z + this.state.grid / 2),
        )
      return
    }
    const cube = hit.object.userData.grid as CubeStackCube
    if (this.mode === 'remove') this.removeCube(cube)
    else if (this.mode === 'select') this.toggleSelection(cube)
    else {
      const normal = hit.face?.normal
        .clone()
        .transformDirection(hit.object.matrixWorld)
      if (normal != null)
        this.addCube(
          cube.x + Math.round(normal.x),
          cube.y + Math.round(normal.y),
          cube.z + Math.round(normal.z),
        )
    }
  }

  private addCube(x: number, y: number, z: number): void {
    if (
      x < 0 ||
      z < 0 ||
      x >= this.state.grid ||
      z >= this.state.grid ||
      y < 0 ||
      this.state.cubes.some(
        (cube) => keyOf(cube.x, cube.y, cube.z) === keyOf(x, y, z),
      )
    )
      return
    this.state.cubes.push({ x, y, z, color: DEFAULT_COLOR })
    this.stateChanged()
  }
  private removeCube(cube: CubeStackCube): void {
    const key = keyOf(cube.x, cube.y, cube.z)
    this.state.cubes = this.state.cubes.filter(
      (item) => keyOf(item.x, item.y, item.z) !== key,
    )
    this.selected.delete(key)
    this.stateChanged()
  }
  private toggleSelection(cube: CubeStackCube): void {
    const key = keyOf(cube.x, cube.y, cube.z)
    if (this.selected.has(key)) this.selected.delete(key)
    else this.selected.add(key)
    this.rebuildCubes()
    this.updateMoveButtons()
  }
  private moveSelection(dx: number, dz: number): void {
    if (this.selected.size === 0) return
    const selectedCubes = this.state.cubes.filter((cube) =>
      this.selected.has(keyOf(cube.x, cube.y, cube.z)),
    )
    const unselectedKeys = new Set(
      this.state.cubes
        .filter((cube) => !this.selected.has(keyOf(cube.x, cube.y, cube.z)))
        .map((cube) => keyOf(cube.x, cube.y, cube.z)),
    )
    const moved = selectedCubes.map((cube) => ({
      ...cube,
      x: cube.x + dx,
      z: cube.z + dz,
    }))
    if (
      moved.some(
        (cube) =>
          cube.x < 0 ||
          cube.z < 0 ||
          cube.x > this.state.grid - 1 ||
          cube.z > this.state.grid - 1 ||
          unselectedKeys.has(keyOf(cube.x, cube.y, cube.z)),
      )
    )
      return
    const movedByOldKey = new Map(
      selectedCubes.map((cube, index) => [
        keyOf(cube.x, cube.y, cube.z),
        moved[index],
      ]),
    )
    this.state.cubes = this.state.cubes.map(
      (cube) => movedByOldKey.get(keyOf(cube.x, cube.y, cube.z)) ?? cube,
    )
    this.selected = new Set(moved.map((cube) => keyOf(cube.x, cube.y, cube.z)))
    this.stateChanged()
  }
  private updateMoveButtons(): void {
    this.shadowRoot
      ?.querySelectorAll<HTMLButtonElement>('[data-move-x]')
      .forEach((button) => {
        button.disabled = !this.interactivityOn || this.selected.size === 0
      })
  }
  private stateChanged(): void {
    this.rebuildCubes()
    const count = this.shadowRoot?.querySelector('.count')
    if (count != null)
      count.textContent = `${this.state.cubes.length} cube${this.state.cubes.length > 1 ? 's' : ''}`
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
    this.dispatchEvent(
      new CustomEvent('value-changed', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    )
  }
  private disposeThree(): void {
    if (this.animationFrame != null) cancelAnimationFrame(this.animationFrame)
    this.animationFrame = null
    this.resizeObserver?.disconnect()
    this.resizeObserver = null
    this.controls?.dispose()
    this.controls = null
    for (const mesh of this.cubeMeshes.values()) {
      mesh.geometry.dispose()
      ;(mesh.material as THREE.Material).dispose()
    }
    this.cubeMeshes.clear()
    this.ground?.geometry.dispose()
    ;(this.ground?.material as THREE.Material | undefined)?.dispose()
    this.renderer?.dispose()
    this.renderer = null
    this.scene = null
    this.camera = null
    this.ground = null
  }
}

export function addCubeStackEditor(
  exercice: IExercice,
  questionIndex: number,
  { expectedState, ...options }: CubeStackEditorOptions = {},
): string {
  exercice.autoCorrection[questionIndex] ??= {}
  exercice.autoCorrection[questionIndex].formatInteractif =
    CubeStackEditorElement.elementTag
  if (expectedState != null)
    exercice.autoCorrection[questionIndex].valeur = {
      reponse: { value: JSON.stringify(expectedState) },
    }
  return CubeStackEditorElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice ?? 0,
    questionIndex,
  })
}

registerMathaleaCustomElement(CubeStackEditorElement)
