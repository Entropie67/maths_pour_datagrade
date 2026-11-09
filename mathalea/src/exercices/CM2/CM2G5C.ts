import { addCliqueFigure } from '../../lib/customElements/CliqueFigureElement'
import { BoiteBuilder } from '../../lib/2d/BoiteBuilder'
import {
  arrayClone,
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { fixeBordures } from '../../lib/2d/fixeBordures'
import { texteParPosition } from '../../lib/2d/textes'
import {
  ajouteCanvas3d,
  type Elements3DDescription,
  type GroupDescription,
} from '../../lib/3d/3d_dynamique/Canvas3DElement'
import {
  generateContent3D,
  initialisePatron3DCanvas,
} from '../../lib/3d/3d_dynamique/patrons3d'
import type { objetFace } from '../../lib/3d/utilsPatrons'
import { cubesObj, fauxCubesObj } from '../../lib/3d/utilsPatrons'
import { DomReadyActionElement } from '../../lib/customElements/DomReadyAction'
import type { MathaleaSVG } from '../../lib/types'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import { sp } from '../../lib/outils/outilString'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

export const titre = 'Choisir le patron de cube'
export const dateDeModifImportante = '08/11/2026'
export const dateDePublication = '18/07/2025'

export const uuid = 'f57fe'
export const refs = {
  'fr-fr': ['CM2G5C', '5G2autoD'],
  'fr-2016': ['6G45'],
  'fr-ch': ['9R1ES3B-1', '9R2ES3B-1', '9R3ES3B-1', 'PRQES06B-4', 'PRQES07B-1', 'PRQES07D-1'],
}

const patron3dReadyAction = 'CM2G5C:patron-3d-ready'
let patron3dReadyRegistered = false

function retrouveMatrices(liste: objetFace[][][]): {
  indexVraiPatron: number
  indexPas6Faces: number
  indexFauxPatrons: { index: number; collision: [number, number][] }[]
} {
  const indexVraiPatron = liste.findIndex((matrice) => {
    return (
      matrice.flat().filter((face) => face.isFace).length === 6 &&
      matrice.flat().filter((face) => face.collision !== undefined).length === 0
    )
  })
  const indexPas6Faces = liste.findIndex((matrice) => {
    return matrice.flat().filter((face) => face.isFace).length !== 6
  })
  const indexFauxPatrons = liste
    .map((matrice, index) => {
      const collisions = matrice.flat().reduce(
        (acc, face) => {
          if (face.collision !== undefined) {
            acc.push([index, face.collision])
          }
          return acc
        },
        [] as [number, number][],
      )
      return { index, collision: collisions }
    })
    .filter((item) => item.collision.length > 0)
  if (indexFauxPatrons.length === 0) {
    throw new Error('Aucun faux patron trouvé dans la liste fournie.') // ça ne doit jamais arrivé.
  }
  return { indexVraiPatron, indexPas6Faces, indexFauxPatrons }
}

/**
 * Choisir le bon patron parmi ceux proposés
 * @author Olivier Mimeau
 */
export default class choixPatron extends Exercice {
  listeMatrices: objetFace[][][][]

  constructor() {
    super()
    this.nbQuestions = 1
    // pour plus tard cubes Paves ...
    // this.besoinFormulaireNumerique = ['Type de questions', 3, '1 : patrons de cubes\n 2 : patrons de pavés droits']

    this.besoinFormulaire2CaseACocher = ['3d dynamique', true]
    this.sup2 = true
    this.listeMatrices = []
  }

  nouvelleVersion() {
    this.cliqueFiguresArray = []
    this.consigne =
      `Parmi les dessins suivants, lequel est un patron de cube${sp()}? <br>` // 'Consigne'
    this.consigne += this.interactif
      ? 'Cliquer sur'
      : context.vue !== 'diap' && !context.isAmc
        ? 'Entourer'
        : 'Choisir' /// Penser ici à AMC aussi.
    this.consigne += ' la bonne figure.'
    // context.pixelsParCm = 10
    // xmin: -1, xmax: 6, ymin: -1, scale: 0.4
    const zoom = 0.4 // scale: 0.4
    const zoomAMC = 0.3 // si 0.4 c'est trop proche de la taille de la case à cocher
    const typeQuestionsDisponibles = ['type1'] // 'type2',, 'type3']
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    const listeTypeVraiPatrons = combinaisonListes(
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
      this.nbQuestions,
    )
    const listeVraisPatrons: UnPatron[] = initListePatrons(cubesObj)
    const listeFauxPatrons: UnPatron[] = initListePatrons(fauxCubesObj)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''

      const indexMelangés = shuffle([0, 1, 2, 3])
      const patronsOriginaux: UnPatron[] = []
      const patronsAffiches: UnPatron[] = []
      this.listeMatrices[i] = []

      switch (listeTypeQuestions[i]) {
        case 'type1':
          {
            texte = '' // `Question ${i + 1} de type 1<br>`
            // texte += `listeVraisPatrons :  ${listeVraisPatrons.length} <br>`
            patronsOriginaux.push(
              listeVraisPatrons[Number(listeTypeVraiPatrons[i]) - 1],
            )
            const numPatron2 = randint(0, listeFauxPatrons.length - 1)
            patronsOriginaux.push(listeFauxPatrons[randint(0, numPatron2)])
            patronsOriginaux.push(
              listeFauxPatrons[
                randint(0, listeFauxPatrons.length - 1, numPatron2)
              ],
            )
            const taillePatronAuPif = choice([5, 7])
            patronsOriginaux.push(faitUnPatronAuPif(taillePatronAuPif))
            for (let k = 0; k < 4; k++) {
              patronsOriginaux[k].braceMatrice()
              patronsAffiches[k] = patronsOriginaux[indexMelangés[k]]
              this.listeMatrices[i][k] =
                patronsOriginaux[indexMelangés[k]].matrice
            }
            const indexVraiPatron = retrouveMatrices(
              this.listeMatrices[i],
            ).indexVraiPatron
            const indexPas6Faces = retrouveMatrices(
              this.listeMatrices[i],
            ).indexPas6Faces
            const indexFauxPatrons = retrouveMatrices(
              this.listeMatrices[i],
            ).indexFauxPatrons
            const fig0 = patronsAffiches[0].dessineMatrice({
              numeroterFaces: false,
              numeroDessin: 0,
            })
            const fig1 = patronsAffiches[1].dessineMatrice({
              numeroterFaces: false,
              numeroDessin: 1,
            })
            const fig2 = patronsAffiches[2].dessineMatrice({
              numeroterFaces: false,
              numeroDessin: 2,
            })
            const fig3 = patronsAffiches[3].dessineMatrice({
              numeroterFaces: false,
              numeroDessin: 3,
            })
            const fig0AMC = mathalea2d(
              Object.assign(
                {
                  display: 'inline-block',
                  scale: zoomAMC,
                  id: `cliquefigure0Ex${this.numeroExercice}Q${i}`,
                } as const,
                fixeBordures(fig0),
              ),
              fig0,
            )
            const fig1AMC = mathalea2d(
              Object.assign(
                {
                  display: 'inline-block',
                  scale: zoomAMC,
                  id: `cliquefigure1Ex${this.numeroExercice}Q${i}`,
                } as const,
                fixeBordures(fig1),
              ),
              fig1,
            )
            const fig2AMC = mathalea2d(
              Object.assign(
                {
                  display: 'inline-block',
                  scale: zoomAMC,
                  id: `cliquefigure2Ex${this.numeroExercice}Q${i}`,
                } as const,
                fixeBordures(fig2),
              ),
              fig2,
            )
            const fig3AMC = mathalea2d(
              Object.assign(
                {
                  display: 'inline-block',
                  scale: zoomAMC,
                  id: `cliquefigure3Ex${this.numeroExercice}Q${i}`,
                } as const,
                fixeBordures(fig3),
              ),
              fig3,
            )

            this.autoCorrection[i] = {}

            this.autoCorrection[i].enonce = this.consigne + texte
            this.autoCorrection[i].propositions = [
              {
                texte: fig0AMC,
                statut: indexVraiPatron === 0,
              },
              {
                texte: fig1AMC,
                statut: indexVraiPatron === 1,
              },
              {
                texte: fig2AMC,
                statut: indexVraiPatron === 2,
              },
              {
                texte: fig3AMC,
                statut: indexVraiPatron === 3,
              },
            ]
            this.autoCorrection[i].options = {
              ordered: true,
              lastChoice: 4,
            }
            this.autoCorrection[i].formatInteractif = 'clique-figure'
            this.cliqueFiguresArray[i] = [
              {
                id: `cliquefigure0Ex${this.numeroExercice}Q${i}`,
                solution: indexVraiPatron === 0,
              },
              {
                id: `cliquefigure1Ex${this.numeroExercice}Q${i}`,
                solution: indexVraiPatron === 1,
              },
              {
                id: `cliquefigure2Ex${this.numeroExercice}Q${i}`,
                solution: indexVraiPatron === 2,
              },
              {
                id: `cliquefigure3Ex${this.numeroExercice}Q${i}`,
                solution: indexVraiPatron === 3,
              },
            ]
            // const figures =  [figPatronOkAMC, figPatronFaux1AMC, figPatronFaux2AMC, figPatronFaux3AMC]
            const figuresEnonce = [fig0AMC, fig1AMC, fig2AMC, fig3AMC]
            if (!context.isAmc) {
              texte += figuresEnonce.join('') + '<br><br>'
              if (this.interactif && context.isHtml) {
                texte += addCliqueFigure(this, i)
                texte += `<span id="resultatCheckEx${this.numeroExercice}Q${i}"></span>`
              }

              texteCorr = `Procédons par élimination${sp()}:<br>`
              texteCorr += `- Le dessin $${indexPas6Faces + 1}$ contient $${taillePatronAuPif}$ faces au lieu de $6$ faces.<br><br>`
              texteCorr += `- Le dessin $${indexFauxPatrons[0].index + 1}$ possède des faces qui vont se superposer${sp()}:<br>`
              const fig1 = patronsAffiches[
                indexFauxPatrons[0].index
              ].dessineMatrice({
                numeroterFaces: true,
                numeroDessin: indexFauxPatrons[0].index,
              })
              texteCorr +=
                mathalea2d(
                  Object.assign(
                    {
                      display: 'inline-block',
                      scale: zoom,
                      id: `correction0Ex${this.numeroExercice}Q${i}`,
                    } as const,
                    fixeBordures(fig1),
                  ),
                  fig1,
                ) + '<br>'
              texteCorr +=
                patronsAffiches[
                  indexFauxPatrons[0].index
                ].ecritFacesQuiSeSuperposent() + '<br><br>'
              texteCorr += `- Le dessin $${indexFauxPatrons[1].index + 1}$ possède des faces qui vont se superposer${sp()}:<br>`
              const fig2 = patronsAffiches[
                indexFauxPatrons[1].index
              ].dessineMatrice({
                numeroterFaces: true,
                numeroDessin: indexFauxPatrons[1].index,
              })
              texteCorr +=
                mathalea2d(
                  Object.assign(
                    {
                      display: 'inline-block',
                      scale: zoom,
                      id: `correction1Ex${this.numeroExercice}Q${i}`,
                    } as const,
                    fixeBordures(fig2),
                  ),
                  fig2,
                ) + '<br>'
              texteCorr +=
                patronsAffiches[
                  indexFauxPatrons[1].index
                ].ecritFacesQuiSeSuperposent() + '<br><br>'
              texteCorr += `Le dessin $${indexVraiPatron + 1}$ possède $6$ faces qui ne vont pas se superposer en le pliant, c'est donc le dessin d'un patron.<br>`
              const fig3 = patronsAffiches[indexVraiPatron].dessineMatrice({
                numeroterFaces: true,
                numeroDessin: indexVraiPatron,
              })
              texteCorr +=
                mathalea2d(
                  Object.assign(
                    {
                      display: 'inline-block',
                      scale: zoom,
                      id: `correction2Ex${this.numeroExercice}Q${i}`,
                    } as const,
                    fixeBordures(fig3),
                  ),
                  fig3,
                ) + '<br><br>'
            }
          }
          break
        case 'type2':
          texte = `Question ${i + 1} de type 2`

          texteCorr = `Correction ${i + 1} de type 2`
          break
        case 'type3':
          texte = `Question ${i + 1} de type 3`
          texteCorr = `Correction ${i + 1} de type 3`
          break
      }
      if (this.questionJamaisPosee(i, texte)) {
        if (context.isHtml && this.sup2) {
          // On insère directement le canvas-3d pour la correction
          const indexVraiPatron = retrouveMatrices(
            this.listeMatrices[i],
          ).indexVraiPatron
          const content = generateContent3D(
            this.listeMatrices[i][indexVraiPatron],
            `patron3dEx${this.numeroExercice}Q${i}`,
          )
          const objects: Elements3DDescription[] = [
            content as GroupDescription,
            { type: 'ambientLight' as const, color: 0xffffff },
            {
              type: 'directionalLight' as const,
              color: 0xffffff,
              position: [8, 8, 8],
            },
            {
              type: 'canvas3dButton',
              id: `btnPlier-Ex${this.numeroExercice}Q${i}`,
              text: 'Plier',
              position: { left: '10px', bottom: '10px' },
              onClick: `pliage-Ex${this.numeroExercice}Q${i}`, // id = identifiant unique du canvas
            },
            {
              type: 'canvas3dButton',
              id: `btnDeplier-Ex${this.numeroExercice}Q${i}`,
              text: 'Déplier',
              position: { left: '90px', bottom: '10px' },
              onClick: `depliage-Ex${this.numeroExercice}Q${i}`,
            },
          ]
          const content3d = { objects, autoCenterZoomMargin: 1 }
          const canvasId = `canvas3dEx${this.numeroExercice}Q${i}`
          texteCorr += ajouteCanvas3d({
            id: canvasId,
            content: content3d,
            width: 200,
            height: 200,
          })
          registerPatron3dReady()
          texteCorr += DomReadyActionElement.create({
            action: patron3dReadyAction,
            payload: { canvasId },
          })
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr ?? ''
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }

  callback(exercice: Exercice, i: number): void {
    if (
      'listeMatrices' in exercice &&
      Array.isArray(exercice.listeMatrices) &&
      exercice.listeMatrices.length >= i
    ) {
      // On commence par trouver l'élément cliqué... enfin son index.
      // Trouver tous les SVG dont l'id correspond au format 'cliquefigure{n}Ex{exercice.numeroExercice}Q{i}'
      const figElements = Array.from(
        document.querySelectorAll<MathaleaSVG>(
          `[id^="cliquefigure"][id$="Ex${exercice.numeroExercice}Q${i}"]`,
        ),
      ).filter((el) => {
        // Vérifie que l'id correspond exactement au format voulu (un seul chiffre pour n)
        const regex = new RegExp(
          `^cliquefigure\\dEx${exercice.numeroExercice}Q${i}$`,
        )
        return regex.test(el.id)
      })

      let indexClique = Array.from(figElements as MathaleaSVG[]).findIndex(
        (el: MathaleaSVG) => Boolean(el.etat),
      )
      if (
        indexClique === -1 &&
        Array.isArray(exercice.autoCorrection[i].propositions)
      ) {
        indexClique = retrouveMatrices(
          exercice.listeMatrices[i],
        ).indexVraiPatron
      }
      const content = generateContent3D(
        exercice.listeMatrices[i][indexClique],
        `patron3dEx${exercice.numeroExercice}Q${i}`,
      )
      const objects: Elements3DDescription[] = [
        content as GroupDescription,
        { type: 'ambientLight' as const, color: 0xffffff },
        {
          type: 'directionalLight' as const,
          color: 0xffffff,
          position: [8, 8, 8],
        },
        {
          type: 'canvas3dButton',
          id: `btnPlier-Ex${exercice.numeroExercice}Q${i}`,
          text: 'Plier',
          position: { left: '10px', bottom: '10px' },
          onClick: `pliage-Ex${exercice.numeroExercice}Q${i}`, // id = identifiant unique du canvas
        },
        {
          type: 'canvas3dButton',
          id: `btnDeplier-Ex${exercice.numeroExercice}Q${i}`,
          text: 'Déplier',
          position: { left: '90px', bottom: '10px' },
          onClick: `depliage-Ex${exercice.numeroExercice}Q${i}`,
        },
      ]
      const content3d = { objects, autoCenterZoomMargin: 1.2 }
      const canvasId = `canvas3dEx${exercice.numeroExercice}Q${i}`

      const nouveauCanvas = ajouteCanvas3d({
        id: canvasId,
        content: content3d, // généré avec la matrice du patron cliqué
        width: 200,
        height: 200,
      })
      registerPatron3dReady()
      exercice.listeCorrections[i] = exercice.listeCorrections[i].replace(
        /<canvas-3d[^>]*>.*?<\/canvas-3d>(?:<mathalea-dom-ready[^>]*><\/mathalea-dom-ready>)?/s,
        nouveauCanvas +
          DomReadyActionElement.create({
            action: patron3dReadyAction,
            payload: { canvasId },
          }),
      )
    }
  }
}

function registerPatron3dReady() {
  if (patron3dReadyRegistered) return
  patron3dReadyRegistered = true
  DomReadyActionElement.registerCallback<{ canvasId: string }>(
    patron3dReadyAction,
    ({ payload }) => {
      initialisePatron3DCanvas(payload.canvasId)
    },
  )
}

const tailleCarre = 1

// const initMatrice = (largeur: number, longueur: number, digit:number = 0, face:boolean = false): objetFace[][] =>
//  Array.from({ length: longueur }, () => Array(largeur).fill({ numero: digit, isFace: face }))

function initListePatrons(listeMatrices: objetFace[][][]): UnPatron[] {
  const listePatrons: UnPatron[] = []
  for (const uneMatrice of listeMatrices) {
    const patron = new UnPatron(uneMatrice[0].length, uneMatrice.length)
    // patron.initMatrice(uneMatrice[0].length, uneMatrice.length, 0)
    patron.matrice = uneMatrice.map((ligne) => [...ligne]) // copie de la matrice
    listePatrons.push(patron)
  }
  return listePatrons
}

function faitUnPatronAuPif(taille: number): UnPatron {
  const tempcouples: SerieCouples = new SerieCouples()
  tempcouples.faitUnPatron(taille)
  tempcouples.faitUnPatronMatrice()
  return tempcouples.matrice
}

class UnPatron {
  matrice: objetFace[][] = []
  constructor(
    largeur: number,
    longueur: number,
    digit: number = 0,
    face: boolean = false,
  ) {
    for (let l = 0; l < longueur; l++) {
      this.matrice[l] = []
      for (let k = 0; k < largeur; k++) {
        this.matrice[l][k] = { numero: digit, isFace: face } // l * largeur + k // digit
      }
    }
  }

  get larg(): number {
    return this.matrice.reduce((max, row) => Math.max(max, row.length), 0)
  }

  get long(): number {
    return this.matrice.length
  }

  /* initMatrice = (largeur: number, longueur: number, digit:number = 0, face:boolean = false): objetFace[][] =>
    Array.from({ length: longueur }, () => Array(largeur).fill({ numero: digit, isFace: face })) */

  initMatrice(
    largeur: number,
    longueur: number,
    digit: number = 0,
    face: boolean = false,
  ): void {
    for (let l = 0; l < longueur; l++) {
      this.matrice[l] = []
      for (let k = 0; k < largeur; k++) {
        this.matrice[l][k] = { numero: digit, isFace: face }
      }
    }
  }

  setcell(x: number, y: number, value: number, face: boolean): void {
    if (y < this.long && x < this.larg) {
      this.matrice[y][x] = { numero: value, isFace: face }
    }
  }

  dimensions(): [number, number] {
    return [this.larg, this.long]
  }

  ecritMatrice(): string {
    let texte = '[\n' // numbers.length
    // bollean vers valeurs 0,1
    const valeursBooleennes = this.matrice.map((row) =>
      row.map((element) => (element.isFace ? 1 : 0)),
    )
    texte += valeursBooleennes.map((row) => `[${row.join(', ')}]`).join(',\n')
    texte += ']\n'
    return texte
  }

  braceMatrice(): void {
    const [largeur, longueur] = [this.larg, this.long]
    const patronTemp = new UnPatron(largeur, longueur)
    patronTemp.matrice = arrayClone(this.matrice) // copie de la matrice
    let transfo = choice([1, 2, 3, 3, 0])
    switch (transfo) {
      case 1:
        patronTemp.symetrieMatriceH()
        break
      case 2:
        patronTemp.symetrieMatriceV()
        break
      case 3:
        patronTemp.symetrieMatriceD()
        break
      default:
        // ne fait rien
        break
    }
    transfo = choice([1, 1, 2, 3, 3, 3, 3, 0])
    switch (transfo) {
      case 1:
        patronTemp.rotationMatrice90p()
        break
      case 2:
        patronTemp.rotationMatrice90n()
        break
      case 3:
        patronTemp.rotationMatrice180()
        break
      default:
        // ne fait rien
        break
    }
    this.matrice = arrayClone(patronTemp.matrice)
  }

  ecritFacesQuiSeSuperposent(): string {
    let texte: string = ''
    for (let i = 0; i < this.long; i++) {
      for (let j = 0; j < this.larg; j++) {
        if (this.matrice[i][j].isFace && this.matrice[i][j].collision) {
          texte += ` Les faces $${this.matrice[i][j].numero}$ et $${this.matrice[i][j].collision}$ vont se superposer.`
        }
      }
    }
    return texte
  }

  dessineMatrice({
    numeroterFaces,
    numeroDessin,
  }: {
    numeroterFaces?: boolean
    numeroDessin?: number
  }): NestedObjetMathalea2dArray {
    const correction = numeroterFaces ?? false

    const leDessin: NestedObjetMathalea2dArray = []
    for (let i = 0; i < this.long; i++) {
      for (let j = 0; j < this.larg; j++) {
        if (this.matrice[i][j].isFace) {
          const face1 = new BoiteBuilder({
            xMin: i * tailleCarre,
            yMin: j * tailleCarre,
            xMax: (i + 1) * tailleCarre,
            yMax: (j + 1) * tailleCarre,
          })
          if (correction) {
            // face1.addColor({ colorBackground: 'gray' }) // 'gray''blue'
            face1.addTextIn({
              textIn: `${this.matrice[i][j].numero}` /*, color: couleurTexte1 */,
            })
          }
          const laFace1 = face1.render()
          leDessin.push(laFace1)
        }
      }
    }
    const { xmin, xmax } = fixeBordures(leDessin)
    if (numeroDessin !== undefined && typeof numeroDessin === 'number') {
      const Numdessin = texteParPosition(
        `Dessin ${numeroDessin + 1}`,
        (xmin + xmax) / 2,
        -0.5,
        0,
        'black',
        1,
        'milieu',
        false,
        1,
      )
      leDessin.push(Numdessin)
    }

    return leDessin
  }

  symetrieMatriceH(): void {
    // symetrie horizontale
    // inverse les lignes
    const [largeur, longueur] = [this.larg, this.long]
    const matriceTemp = new UnPatron(largeur, longueur) // objetFace[][] = this.initMatrice(largeur, longueur, 4)
    for (let l = 0; l < longueur; l++) {
      for (let k = 0; k < largeur; k++) {
        matriceTemp.matrice[longueur - 1 - l][k] = this.matrice[l][k]
      }
    }
    this.matrice = arrayClone(matriceTemp.matrice)
  }

  symetrieMatriceV(): void {
    // symetrie verticale
    // inverse les colonnes
    const [largeur, longueur] = [this.larg, this.long]
    const matriceTemp = new UnPatron(largeur, longueur) // : objetFace[][] = this.initMatrice(largeur, longueur, 4)
    for (let l = 0; l < longueur; l++) {
      for (let k = 0; k < largeur; k++) {
        matriceTemp.matrice[l][largeur - 1 - k] = this.matrice[l][k]
      }
    }
    this.matrice = arrayClone(matriceTemp.matrice)
  }

  symetrieMatriceD(): void {
    // symetrie diagonale (ex Transpose la matrice)
    // inverse les lignes et les colonnes
    const [largeur, longueur] = [this.larg, this.long]
    const matriceTemp = new UnPatron(longueur, largeur) // : objetFace[][] = this.initMatrice(longueur, largeur, 4)
    for (let l = 0; l < longueur; l++) {
      for (let k = 0; k < largeur; k++) {
        //  matriceTemp[largeur - 1 - k][longueur - 1 - l] = this.matrice[l][k]
        matriceTemp.matrice[k][l] = this.matrice[l][k]
      }
    }
    this.matrice = arrayClone(matriceTemp.matrice)
  }

  rotationMatrice90p(): void {
    // rotation de 90°
    const [largeur, longueur] = [this.long, this.larg]
    const matriceTemp = new UnPatron(largeur, longueur) // : objetFace[][] = this.initMatrice(longueur, largeur, 4)
    for (let l = 0; l < longueur; l++) {
      for (let k = 0; k < largeur; k++) {
        matriceTemp.matrice[l][largeur - k - 1] = this.matrice[k][l]
      }
    }
    this.matrice = arrayClone(matriceTemp.matrice)
  }

  rotationMatrice90n(): void {
    // rotation de 90° autre sens
    const [largeur, longueur] = [this.long, this.larg]
    const matriceTemp = new UnPatron(largeur, longueur) // : objetFace[][] = this.initMatrice(longueur, largeur, 4)
    for (let l = 0; l < longueur; l++) {
      for (let k = 0; k < largeur; k++) {
        matriceTemp.matrice[longueur - l - 1][k] = this.matrice[k][l]
      }
    }
    this.matrice = arrayClone(matriceTemp.matrice)
  }

  rotationMatrice180(): void {
    // rotation de 180°
    const [largeur, longueur] = [this.larg, this.long]
    const matriceTemp = new UnPatron(largeur, longueur) // : objetFace[][] = this.initMatrice(largeur, longueur, 4)
    for (let l = 0; l < longueur; l++) {
      for (let k = 0; k < largeur; k++) {
        matriceTemp.matrice[longueur - 1 - l][largeur - 1 - k] =
          this.matrice[l][k]
      }
    }
    this.matrice = arrayClone(matriceTemp.matrice)
  }
}

type couple = [number, number]

class SerieCouples {
  private _couples: couple[] = []
  private _matrice: UnPatron = new UnPatron(0, 0)
  constructor() {
    this._couples = [
      [0, 0],
      [1, 0],
    ]
  }

  get couples(): couple[] {
    return this._couples
  }

  get matrice(): UnPatron {
    return this._matrice
  }

  set couples(value: couple[]) {
    // ne fait rien
  }

  ecritCouples(): string {
    return this._couples.map(([a, b]) => `[${a}, ${b}]`).join('; ')
  }

  ecritlongueur(): number {
    return this._couples.length
  }

  faitUnPatron(long: number = 6): void {
    const sens = [-1, 1]
    const longDejaEcrite = this._couples.length
    for (let l = 0; l < long - longDejaEcrite; l++) {
      const couplesPossibles: couple[] = []
      // parcours la liste des couples et liste les cas possibles
      for (let j = 0; j < this._couples.length; j++) {
        const [a, b] = this._couples[j]
        for (const k of sens) {
          if (
            !this._couples.some(
              ([x, y]) =>
                x === a + k && (y === b || y === b + 1 || y === b - 1),
            )
          ) {
            couplesPossibles.push([a + k, b])
          }
        }
        for (const k of sens) {
          if (
            !this._couples.some(
              ([x, y]) =>
                y === b + k && (x === a || x === a + 1 || x === a - 1),
            )
          ) {
            couplesPossibles.push([a, b + k])
          }
        }
      }
      this._couples.push(
        couplesPossibles[randint(0, couplesPossibles.length - 1)],
      )
    }
  }

  faitUnPatronMatrice(): void {
    let aMin = 0
    let bMin = 0
    let aMax = 0
    let bMax = 0
    for (const [a, b] of this._couples) {
      aMax = Math.max(aMax, a)
      bMax = Math.max(bMax, b)
      aMin = Math.min(aMin, a)
      bMin = Math.min(bMin, b)
    }
    const couplesLargeur = aMax - aMin + 1
    const couplesLongueur = bMax - bMin + 1
    this._matrice.initMatrice(couplesLargeur, couplesLongueur)
    for (const [a, b] of this._couples) {
      this._matrice.setcell(a - aMin, bMax - b, 1, true)
    }
  }
}
