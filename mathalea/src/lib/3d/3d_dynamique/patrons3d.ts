import {
  type objetFace,
  type FaceNode,
  findPivot,
  buildFaceTree,
  getAbsolutePositions,
  getPivotPositions,
} from '../utilsPatrons'
import type { GroupDescription } from './Canvas3DElement'
import { THREE } from './threeInstance'

export function addFaceRecursive3D(
  node: FaceNode,
  taille: number,
  facePositions: Map<string, [number, number, number]>,
  pivotPositions: Map<string, [number, number, number]>,
  couleurs: string[],
  faceCount: { value: number } = { value: 0 },
): THREE.Group {
  const EPSILON = 0.002
  const boxWidth = taille - 2 * EPSILON
  const boxDepth = taille - 2 * EPSILON

  const colorIndex = faceCount.value % couleurs.length
  faceCount.value++
  const couleur = couleurs[colorIndex]

  const key = `${node.x},${node.y}`
  const faceAbsPos = facePositions.get(key) ?? [0, 0, 0]
  const pivotAbsPos = pivotPositions.get(key) ?? [0, 0, 0]
  const parentPivotAbsPos = node.parent
    ? (pivotPositions.get(`${node.parent.x},${node.parent.y}`) ?? [0, 0, 0])
    : [0, 0, 0]

  // Création du groupe pour ce noeud (pivot)
  const pivotGroup = new THREE.Group()
  if (node.parent && node.directionFromParent) {
    pivotGroup.userData.directionFromParent = node.directionFromParent
  }

  // Positionnement du pivot
  if (node.parent && node.directionFromParent) {
    // Position du pivot relatif au pivot parent
    pivotGroup.position.set(
      pivotAbsPos[0] - parentPivotAbsPos[0],
      pivotAbsPos[1] - parentPivotAbsPos[1],
      pivotAbsPos[2] - parentPivotAbsPos[2],
    )
  } else {
    // Racine
    pivotGroup.position.set(faceAbsPos[0], faceAbsPos[1], faceAbsPos[2])
  }

  // Création de la face (Mesh)
  const geometry = new THREE.BoxGeometry(boxWidth, 0.01, boxDepth)
  const material = new THREE.MeshPhongMaterial({
    color: couleur,
    side: THREE.DoubleSide,
  })
  const mesh = new THREE.Mesh(geometry, material)

  // Position de la face dans son pivot
  if (node.parent && node.directionFromParent) {
    mesh.position.set(
      faceAbsPos[0] - pivotAbsPos[0],
      faceAbsPos[1] - pivotAbsPos[1],
      faceAbsPos[2] - pivotAbsPos[2],
    )
  } else {
    mesh.position.set(0, 0, 0)
  }
  pivotGroup.add(mesh)

  // Ajout récursif des enfants
  for (const child of node.children) {
    const childGroup = addFaceRecursive3D(
      child,
      taille,
      facePositions,
      pivotPositions,
      couleurs,
      faceCount,
    )
    pivotGroup.add(childGroup)
  }

  return pivotGroup
}

export function generateContent3D(
  matrice: objetFace[][],
  id: string,
): GroupDescription {
  const pivot = findPivot(matrice)
  const taille = 1.5
  const tree = buildFaceTree(matrice, pivot.x, pivot.y)
  const facePositions = getAbsolutePositions(
    tree,
    taille,
    [pivot.x, 0, pivot.y],
    new Map<string, [number, number, number]>(),
  )
  const pivotsPositions = getPivotPositions(
    tree,
    taille,
    facePositions,
    new Map<string, [number, number, number]>(),
  )
  const couleurs = [
    '#3498db',
    '#2ecc71',
    '#e67e22',
    '#9b59b6',
    '#f1c40f',
    '#5dade2',
  ]
  const group = addFaceRecursive3D(
    tree,
    taille,
    facePositions,
    pivotsPositions,
    couleurs,
  )
  group.traverse((obj) => obj.updateMatrix())
  const groupJson = group.toJSON()
  return {
    type: 'group',
    object: groupJson,
  }
}

export const blinkColors = [
  '#ff0000', // rouge vif
  '#00ff00', // vert fluo
  '#0000ff', // bleu électrique
  '#ffff00', // jaune pétant
  '#ff00ff', // magenta
  '#00ffff', // cyan
  '#ff8800', // orange vif
  '#ff0080', // rose flashy
  '#00ff88', // vert menthe
  '#8800ff', // violet flashy
]
/**
 *
 * @param box La fonction qui fait clignoter les faces
 * @param color
 * @param times
 * @param interval
 * @returns
 */
export function blinkABox(
  box: Element,
  color = '#ff0000',
  times = 26,
  interval = 200,
) {
  let count = 0
  let stopped = false
  const originalColor = String(box.getAttribute('color'))
  function stop() {
    stopped = true
    box.setAttribute('color', originalColor)
  }
  const blink = () => {
    if (stopped) return
    box.setAttribute('color', count % 2 === 0 ? color : '#ffffff')
    count++
    if (count < times * 2) setTimeout(blink, interval)
    else box.setAttribute('color', originalColor)
  }
  blink()
  return stop
}

/**
 * affichePatron3D est une fonction qui crée un canvas-3d avec un patron dedans pour être ajouté au DOM.
 * Mais cette utilisation est inadaptée au workflow de Mathaléa qui crée du html en dehors du DOM pour être injecté plus tard.
 * On pourra éventuellement utiliser le canvas-3d retourné dans un listener 'exerciceAffiches'
 * Mais dans le workflow normal, il faut privilégier la fonction ajouteCanvas3d() en utilisant la fonction generateContent3d présente ci-dessus.
 * Voir l'exercice 6G45 pour un exemple du workflow normal sans listener.
 * @param matrice
 * @param id
 * @returns
 */
export function affichePatron3D(
  matrice: objetFace[][],
  id: string,
): HTMLElement {
  const objects = [
    generateContent3D(matrice, id),
    { type: 'ambientLight', color: 0xffffff },
    { type: 'directionalLight', color: 0xffffff, position: [8, 8, 8] },
  ]
  const content = { objects, autoCenterZoomMargin: 1.2 }
  const canvas3d = document.createElement('canvas-3d')
  canvas3d.setAttribute('id', id)
  canvas3d.setAttribute('width', '300')
  canvas3d.setAttribute('height', '300')
  canvas3d.setAttribute('content', JSON.stringify(content))
  return canvas3d
}

export function createEtatPatron() {
  return {
    pliageEnCours: false,
    depliageEnCours: false,
    estPlie: false,
    estDeplie: true,
    blinkEnCours: false,
  }
}

export function ajouteListenersThreeJS(
  canvas3d: HTMLElement,
  group: THREE.Group,
  id: string,
) {
  // Crée et stocke l’état sur le canvas
  ;(canvas3d as any)._etatPatron = createEtatPatron()

  // Récupère les boutons
  const btnPlier = canvas3d.querySelector(
    `#btnPlier-${id}`,
  ) as HTMLButtonElement
  const btnDeplier = canvas3d.querySelector(
    `#btnDeplier-${id}`,
  ) as HTMLButtonElement

  // Initialisation des boutons
  if (btnPlier) btnPlier.disabled = false
  if (btnDeplier) btnDeplier.disabled = true
  // Listener pliage
  canvas3d.addEventListener(`pliage-${id}`, () => {
    const etat = (canvas3d as any)._etatPatron
    if (!etat.estDeplie || etat.pliageEnCours) return
    etat.pliageEnCours = true
    etat.estDeplie = false
    btnPlier.disabled = true
    btnDeplier.disabled = true

    // Lance l’animation de pliage
    animePliageThreeJS(group, () => {
      etat.pliageEnCours = false
      etat.estPlie = true
      // Test de collision
      // Test de collision
      let collision = false
      const meshes: THREE.Mesh[] = []
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) meshes.push(obj)
      })
      const collidedMeshes: THREE.Mesh[] = []
      for (let i = 0; i < meshes.length; i++) {
        const boxA = new THREE.Box3().setFromObject(meshes[i])
        for (let j = i + 1; j < meshes.length; j++) {
          const boxB = new THREE.Box3().setFromObject(meshes[j])
          const intersectionBox = boxA.clone()
          intersectionBox.intersect(boxB)
          const size = intersectionBox.getSize(new THREE.Vector3())
          const volume = size.x * size.y * size.z
          if (volume > 0.01) {
            // seuil à ajuster selon la précision souhaitée
            collision = true
            collidedMeshes.push(meshes[i], meshes[j])
          }
        }
      }
      if (collision) {
        etat.blinkEnCours = true
        btnDeplier.disabled = true
        // Blink sur tous les meshes en collision
        let pending = collidedMeshes.length
        collidedMeshes.forEach((mesh) => {
          blinkMesh(mesh, '#ff0000', 7, 200, () => {
            pending--
            if (pending === 0) {
              etat.blinkEnCours = false
              btnDeplier.disabled = false
            }
          })
        })
      } else {
        btnDeplier.disabled = false // Activation directe si pas de collision
      }
    })
  })

  // Listener dépliage
  canvas3d.addEventListener(`depliage-${id}`, () => {
    const etat = (canvas3d as any)._etatPatron
    if (!etat.estPlie || etat.depliageEnCours || etat.blinkEnCours) return
    etat.depliageEnCours = true
    etat.estPlie = false
    btnDeplier.disabled = true
    btnPlier.disabled = true
    // Lance l’animation de dépliage
    animeDepliageThreeJS(group, () => {
      etat.depliageEnCours = false
      etat.estDeplie = true
      btnPlier.disabled = false // Retour à l’état initial
    })
  })
}

export function animePliageThreeJS(
  group: THREE.Group,
  onComplete?: () => void,
  duration = 1000,
) {
  const pivots: THREE.Group[] = []
  group.traverse((obj) => {
    if (obj instanceof THREE.Group && obj.userData.directionFromParent) {
      pivots.push(obj)
    }
  })
  let pending = pivots.length
  pivots.forEach((obj) => {
    const from = obj.rotation.clone()
    const to = new THREE.Euler()
    switch (obj.userData.directionFromParent) {
      case 'T':
        to.set(Math.PI / 2, 0, 0)
        break
      case 'B':
        to.set(-Math.PI / 2, 0, 0)
        break
      case 'L':
        to.set(0, 0, -Math.PI / 2)
        break
      case 'R':
        to.set(0, 0, Math.PI / 2)
        break
    }
    animateRotation(obj, from, to, duration, () => {
      pending--
      if (pending === 0 && onComplete) onComplete()
    })
  })
}
export function animeDepliageThreeJS(
  group: THREE.Group,
  onComplete?: () => void,
  duration = 1000,
) {
  const pivots: THREE.Group[] = []
  group.traverse((obj) => {
    if (obj instanceof THREE.Group && obj.userData.directionFromParent) {
      pivots.push(obj)
    }
  })
  let pending = pivots.length
  pivots.forEach((obj) => {
    const from = obj.rotation.clone()
    const to = new THREE.Euler(0, 0, 0)
    animateRotation(obj, from, to, duration, () => {
      pending--
      if (pending === 0 && onComplete) onComplete()
    })
  })
}

export function initialisePatron3DCanvas(canvasId: string): void {
  const canvas3d = document.getElementById(canvasId)
  if (!canvas3d || canvas3d.dataset.patrons3dListeners === 'ready') return

  const match = canvasId.match(/Ex\d+Q\d+/)
  const idEvent = match ? match[0] : ''
  const objects = (canvas3d as any).objects
  const group = Array.isArray(objects)
    ? objects.find((obj) => obj instanceof THREE.Group)
    : undefined

  if (group && idEvent) {
    ajouteListenersThreeJS(canvas3d, group, idEvent)
    canvas3d.dataset.patrons3dListeners = 'ready'
  }
}

function animateRotation(
  obj: THREE.Group,
  from: THREE.Euler,
  to: THREE.Euler,
  duration: number,
  onComplete?: () => void,
) {
  const start = performance.now()
  function step(now: number) {
    const t = Math.min((now - start) / duration, 1)
    obj.rotation.set(
      from.x + (to.x - from.x) * t,
      from.y + (to.y - from.y) * t,
      from.z + (to.z - from.z) * t,
    )
    if (t < 1) {
      requestAnimationFrame(step)
    } else {
      obj.rotation.copy(to)
      if (onComplete) onComplete()
    }
  }
  requestAnimationFrame(step)
}

function blinkMesh(
  mesh: THREE.Mesh,
  color = '#ff0000',
  times = 26,
  interval = 200,
  onComplete?: () => void,
) {
  let count = 0
  const stopped = false
  // Vérifie que le matériau possède une couleur
  const material = mesh.material as THREE.Material & { color?: THREE.Color }
  if (!material.color) {
    if (onComplete) onComplete()
    return () => {}
  }
  const originalColor = material.color.clone()

  function blink() {
    if (stopped) return
    if (material.color) {
      material.color.set(count % 2 === 0 ? color : '#ffffff')
    }
    count++
    if (count < times * 2) setTimeout(blink, interval)
    else {
      if (material.color) {
        material.color.copy(originalColor)
      }
      if (onComplete) onComplete()
    }
  }
  blink()
}
