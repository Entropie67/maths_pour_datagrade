import { randint } from '../../../modules/outils'
import { ajouteCanvas3d, type Elements3DDescription } from './Canvas3DElement'

export function cubesToSceneContent(
  lstCoordonneesCubes: number[][],
  eclate: boolean,
) {
  return lstCoordonneesCubes.map(([x, y, z]) => ({
    type: 'cube' as const,
    pos: [x * (eclate ? 3 : 1), z, -y] as [number, number, number],
    size: 1,
    edges: true,
  }))
}
export function empilementCubes(long: number, larg: number, hmax: number) {
  const tabHauteurs = new Array(larg)
  for (let i = 0; i < larg; i++) {
    tabHauteurs[i] = new Array(long)
  }
  // premiere ligne
  for (let i = 0; i < larg; i++) {
    tabHauteurs[i][0] = randint(0, 1)
  }
  // deuxième ligne et suivantes
  for (let i = 0; i < larg; i++) {
    for (let j = 1; j < long; j++) {
      tabHauteurs[i][j] = Math.min(tabHauteurs[i][j - 1] + randint(1, 2), hmax)
    }
  }
  // Vérification Dernière Ligne : ne pas être vide.
  for (let i = 0; i < larg; i++) {
    tabHauteurs[i][long - 1] = Math.max(2, tabHauteurs[i][long - 1])
  }
  // Ajoute les cubes dans un tableau une dimension
  // il faut trier les cubes : x décroissant puis y décroissant, puis z croissant
  const lstCoordonneesCubes = []
  for (let i = larg - 1; i > -1; i = i - 1) {
    for (let j = long - 1; j > -1; j = j - 1) {
      for (let k = 0; k < tabHauteurs[i][j]; k++) {
        lstCoordonneesCubes.push([i, j, k])
      }
    }
  }
  return lstCoordonneesCubes
}

export function canvasEnonceCorrection(
  lstCoordonneesCubes: number[][],
  id: string,
) {
  const objects: Elements3DDescription[] = cubesToSceneContent(
    lstCoordonneesCubes,
    false,
  )
  objects.push(
    { type: 'ambientLight' as const, color: 0xffffff, intensity: 0.8 },
    {
      type: 'directionalLight' as const,
      color: 0xffffff,
      intensity: 1.2,
      position: [1, 0, 0],
    },
    {
      type: 'directionalLight' as const,
      color: 0xffffff,
      intensity: 1.2,
      position: [0, 1, 0],
    },
    {
      type: 'directionalLight' as const,
      color: 0xffffff,
      intensity: 1.2,
      position: [0, 0, 1],
    },
    {
      type: 'directionalLight' as const,
      color: 0xffffff,
      intensity: 0.6,
      position: [-1, 0, 0],
    },
    {
      type: 'directionalLight' as const,
      color: 0xffffff,
      intensity: 0.6,
      position: [0, -1, 0],
    },
    {
      type: 'directionalLight' as const,
      color: 0xffffff,
      intensity: 0.6,
      position: [0, 0, -1],
    },
  )
  const content = {
    objects,
    autoCenterZoomMargin: 1.2,
  }
  const canvasEnonce = ajouteCanvas3d({ id, content, width: 300, height: 300 })

  const objectsCorr: Elements3DDescription[] = cubesToSceneContent(
    lstCoordonneesCubes,
    true,
  )
  objectsCorr.push(
    { type: 'ambientLight' as const, color: 0xffffff, intensity: 0.8 },
    {
      type: 'directionalLight' as const,
      color: 0xffffff,
      intensity: 1.2,
      position: [1, 0, 0],
    },
    {
      type: 'directionalLight' as const,
      color: 0xffffff,
      intensity: 1.2,
      position: [0, 1, 0],
    },
    {
      type: 'directionalLight' as const,
      color: 0xffffff,
      intensity: 1.2,
      position: [0, 0, 1],
    },
    {
      type: 'directionalLight' as const,
      color: 0xffffff,
      intensity: 0.6,
      position: [-1, 0, 0],
    },
    {
      type: 'directionalLight' as const,
      color: 0xffffff,
      intensity: 0.6,
      position: [0, -1, 0],
    },
    {
      type: 'directionalLight' as const,
      color: 0xffffff,
      intensity: 0.6,
      position: [0, 0, -1],
    },
  )
  const contentCorr = {
    objects: objectsCorr,
    autoCenterZoomMargin: 1,
  }
  const canvasCorrection = ajouteCanvas3d({
    id: `${id}Correction`,
    content: contentCorr,
    width: 400,
    height: 400,
  })
  return { canvasEnonce, canvasCorrection }
}
