import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { createList } from '../../lib/format/lists'
import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { bleuMathalea } from '../../lib/colors'
import { shuffle } from '../../lib/outils/arrayOutils'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Comparer des trajets pour découvrir que la ligne droite est le plus court chemin'
export const dateDePublication = '11/10/2026'
export const interactifReady = true

/**
 * Comparer deux longueurs de trajets (somme de deux segments et segment direct)
 * sur une figure formée de quatre points alignés et d'un point hors de leur droite.
 * Première approche de l'inégalité triangulaire.
 * @author Rémi Angot
 */
export const uuid = '2569b'

export const refs = {
  'fr-fr': ['6G6A-8'],
  'fr-2016': [],
  'fr-ch': ['9R1ES2C-4', '9R2ES2C-4', '9R3ES2C-4'],
}

const nbComparaisonsParFigure = 4
// Numéros des sous-questions en gras et en bleu Mathalea
const classesNumeros =
  'marker:font-bold marker:text-coopmaths-struct dark:marker:text-coopmathsdark-struct'

type TypeComparaison = 'egal' | 'detour' | 'recul'
type Signe = 'inf' | 'sup' | 'egal'

const symboles: Record<Signe, string> = { inf: '<', sup: '>', egal: '=' }

const choixSignes = [
  { label: 'Choisir', value: '' },
  { latex: '<', value: 'inf' },
  { latex: '=', value: 'egal' },
  { latex: '>', value: 'sup' },
]

/** Nom d'un segment, avec les deux lettres dans un ordre aléatoire. */
function nomSegment(p1: string, p2: string) {
  return randint(0, 1) === 0 ? `${p1}${p2}` : `${p2}${p1}`
}

export default class ComparerTrajets extends Exercice {
  constructor() {
    super()
    this.consigne = "À l'aide de la figure, comparer les longueurs suivantes."
    this.nbQuestions = 1
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      // Quatre points alignés (dans l'ordre de la droite) et un point hors de la droite
      const lettres = choisitLettresDifferentes(5, 'IJOQ')
      const aligne = lettres.slice(0, 4)
      const hors = lettres[4]
      const abscisses = [0]
      for (let k = 1; k < 4; k++) {
        abscisses.push(abscisses[k - 1] + randint(18, 32) / 10)
      }
      // Au moins un point (au plus deux) de la droite reste en dehors du triangle
      const [debutBase, finBase] = shuffle([
        [0, 2],
        [1, 3],
        [0, 1],
        [1, 2],
        [2, 3],
      ])[0]
      const abscisseHors =
        abscisses[debutBase] +
        ((abscisses[finBase] - abscisses[debutBase]) * randint(30, 70)) / 100
      const hauteur = randint(16, 24) / 10

      const points = aligne.map((nom, k) =>
        pointAbstrait(abscisses[k], 0, nom, 'below'),
      )
      const pointHors = pointAbstrait(abscisseHors, hauteur, hors, 'above')
      const droite = segment(
        abscisses[0] - 0.5,
        0,
        abscisses[3] + 0.5,
        0,
        'black',
      )
      droite.epaisseur = 2
      const cote1 = segment(points[debutBase], pointHors, 'black')
      const cote2 = segment(points[finBase], pointHors, 'black')
      cote1.epaisseur = 2
      cote2.epaisseur = 2
      const objets = [
        droite,
        cote1,
        cote2,
        tracePoint(...points, pointHors),
        labelPoint(...points, pointHors),
      ]
      let texte = mathalea2d(
        Object.assign({ pixelsParCm: 30, scale: 1 }, fixeBordures(objets)),
        objets,
      )

      // Choix des types de comparaisons : au moins une égalité, au moins un détour
      const types: TypeComparaison[] = shuffle([
        'egal',
        'detour',
        'recul',
        ['egal', 'detour', 'recul'][randint(0, 2)] as TypeComparaison,
      ])

      const lignesEnonce: string[] = []
      const lignesCorr: string[] = []
      const clesVues = new Set<string>()
      let figureValide = true
      for (let k = 0; k < nbComparaisonsParFigure; k++) {
        let essais = 0
        let comparaison: ReturnType<typeof creeComparaison> | undefined
        while (essais < 30) {
          comparaison = creeComparaison(types[k], aligne, hors)
          if (!clesVues.has(comparaison.cle)) break
          essais++
        }
        if (comparaison == null || clesVues.has(comparaison.cle)) {
          figureValide = false
          break
        }
        clesVues.add(comparaison.cle)
        const { gauche, droite: droiteComp, signe, explication } = comparaison

        const indexReponse = nbComparaisonsParFigure * i + k
        const champ = this.interactif
          ? choixDeroulant(this, indexReponse, { choices: choixSignes })
          : '$\\ldots$'
        lignesEnonce.push(`$${gauche}$ ${champ} $${droiteComp}$`)
        handleAnswers(
          this,
          indexReponse,
          { reponse: { value: signe } },
          { formatInteractif: 'liste-deroulante' },
        )
        lignesCorr.push(
          `$${gauche} ${miseEnEvidence(symboles[signe])} ${droiteComp}$ ${texteEnCouleur(explication, bleuMathalea)}`,
        )
      }
      if (!figureValide) continue

      texte += createList({
        items: lignesEnonce,
        style: 'alpha',
        classOptions: classesNumeros,
      })
      const texteCorr = createList({
        items: lignesCorr,
        style: 'alpha',
        classOptions: classesNumeros,
      })
      if (this.questionJamaisPosee(i, aligne.join(''), hors, ...abscisses)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}

/**
 * Crée une comparaison « somme de deux segments / segment direct ».
 * Le trajet X → Y → Z est comparé au trajet direct X → Z. La somme est placée
 * à gauche ou à droite du signe, au hasard.
 * @param type 'egal' : Y est entre X et Z sur la droite,
 * 'recul' : points alignés mais Y n'est pas entre X et Z,
 * 'detour' : l'un des points du trajet est hors de la droite
 * @param aligne noms des quatre points alignés, dans l'ordre de la droite
 * @param hors nom du point hors de la droite
 */
function creeComparaison(
  type: TypeComparaison,
  aligne: string[],
  hors: string,
) {
  let x: string
  let y: string
  let z: string
  let explication: string
  const signeSomme: Signe = type === 'egal' ? 'egal' : 'sup'

  if (type === 'egal') {
    const [a, b, c] = shuffle([0, 1, 2, 3])
      .slice(0, 3)
      .sort((m, n) => m - n)
    const sens = randint(0, 1) === 0
    x = aligne[sens ? a : c]
    y = aligne[b]
    z = aligne[sens ? c : a]
    explication = `car les points $${x}$, $${y}$ et $${z}$ sont alignés dans cet ordre.`
  } else if (type === 'recul') {
    const [a, b, c] = shuffle([0, 1, 2, 3])
      .slice(0, 3)
      .sort((m, n) => m - n)
    const extremite = randint(0, 1) === 0 ? a : c
    const autres = [a, b, c].filter((n) => n !== extremite)
    const sens = randint(0, 1) === 0
    x = aligne[sens ? autres[0] : autres[1]]
    y = aligne[extremite]
    z = aligne[sens ? autres[1] : autres[0]]
    explication = `car les points $${x}$, $${y}$ et $${z}$ sont alignés mais le point $${y}$ n'appartient pas au segment $[${x}${z}]$.`
  } else {
    const [p, q] = shuffle(aligne).slice(0, 2)
    const position = randint(0, 2)
    if (position === 0) {
      ;[x, y, z] = [p, hors, q]
    } else if (position === 1) {
      ;[x, y, z] = [hors, p, q]
    } else {
      ;[x, y, z] = [p, q, hors]
    }
    explication = `car les points $${x}$, $${y}$ et $${z}$ ne sont pas alignés : le chemin le plus court entre $${x}$ et $${z}$ est le segment $[${x}${z}]$.`
  }

  const somme = [nomSegment(x, y), nomSegment(y, z)]
  if (randint(0, 1) === 0) somme.reverse()
  const sommeTex = somme.join('+')
  const direct = nomSegment(x, z)
  const sommeAGauche = randint(0, 1) === 0
  let signe: Signe = signeSomme
  if (!sommeAGauche && signe === 'sup') signe = 'inf'
  return {
    gauche: sommeAGauche ? sommeTex : direct,
    droite: sommeAGauche ? direct : sommeTex,
    signe,
    explication,
    cle: [...somme].sort().join('+') + direct.split('').sort().join(''),
  }
}
