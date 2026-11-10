import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = "Calculer l'aire d'un solide"
export const dateDePublication = '29/10/2026'
export const uuid = '5c1e7'
export const interactifReady = true
export const refs = { 'fr-fr': [], 'fr-ch': ['10CTGM2A-5', '10LCGM2A-5', '10LSGM2A-5', '9R1GM3B-3', '9R2GM3B-3', '9R3GM3B-3', '11CTGM1E-6', '11LCGM1E-6', '11LSGM1E-6', 'PRQMG01D-1'] }

type Tirage = {
  enonce: string
  correction: string
  valeur: number
  avecPi: boolean
  cle: string
}

const cm2 = '\\text{ cm}^2'
const arrondiDixieme = (x: number): number => Math.round(x * 10) / 10
const arrondiTex = (x: number): string =>
  miseEnEvidence(texNombre(arrondiDixieme(x), 1))

/** Aire totale d'un cube. */
function cube(): Tirage {
  const c = randint(3, 12)
  return {
    enonce: `Calculer l'aire totale d'un cube d'arête $${c}\\text{ cm}$.`,
    correction:
      `Un cube a six faces carrées identiques.<br>` +
      `L'aire d'une face est : $${c}\\times${c}=${c * c}${cm2}$.<br>` +
      `L'aire totale est : $\\mathcal{A}=6\\times${c * c}=${miseEnEvidence(texNombre(6 * c * c))}${cm2}$.`,
    valeur: 6 * c * c,
    avecPi: false,
    cle: `cu${c}`,
  }
}

/** Aire totale d'un pavé droit. */
function pave(): Tirage {
  const L = randint(4, 12)
  const l = randint(3, L)
  const h = randint(2, 9)
  const total = 2 * (L * l + L * h + l * h)
  return {
    enonce: `Calculer l'aire totale d'un pavé droit de longueur $${L}\\text{ cm}$, de largeur $${l}\\text{ cm}$ et de hauteur $${h}\\text{ cm}$.`,
    correction:
      `Un pavé droit a trois paires de faces identiques.<br>` +
      `Les faces de dessus et de dessous ont pour aire : $${L}\\times${l}=${L * l}${cm2}$.<br>` +
      `Les faces de devant et de derrière ont pour aire : $${L}\\times${h}=${L * h}${cm2}$.<br>` +
      `Les faces de gauche et de droite ont pour aire : $${l}\\times${h}=${l * h}${cm2}$.<br>` +
      `L'aire totale est : $\\mathcal{A}=2\\times(${L * l}+${L * h}+${l * h})=${miseEnEvidence(texNombre(total))}${cm2}$.`,
    valeur: total,
    avecPi: false,
    cle: `pa${L}-${l}-${h}`,
  }
}

/** Aire totale d'un prisme droit dont la base est un triangle rectangle. */
function prisme(): Tirage {
  const [a, b, c] = choice([
    [3, 4, 5],
    [6, 8, 10],
    [5, 12, 13],
    [9, 12, 15],
    [8, 15, 17],
  ])
  const h = randint(3, 12)
  const base = (a * b) / 2
  const lateral = (a + b + c) * h
  return {
    enonce: `Un prisme droit a pour base un triangle rectangle dont les côtés de l'angle droit mesurent $${a}\\text{ cm}$ et $${b}\\text{ cm}$ et dont l'hypoténuse mesure $${c}\\text{ cm}$. Sa hauteur est de $${h}\\text{ cm}$.<br>Calculer l'aire totale de ce prisme.`,
    correction:
      `L'aire d'une base est : $\\dfrac{${a}\\times${b}}{2}=${base}${cm2}$, donc les deux bases ont pour aire $2\\times${base}=${2 * base}${cm2}$.<br>` +
      `Les trois faces latérales sont des rectangles de hauteur $${h}\\text{ cm}$ ; leurs largeurs sont les côtés du triangle. Leur aire totale est : $(${a}+${b}+${c})\\times${h}=${lateral}${cm2}$.<br>` +
      `L'aire totale est : $\\mathcal{A}=${2 * base}+${lateral}=${miseEnEvidence(texNombre(2 * base + lateral))}${cm2}$.`,
    valeur: 2 * base + lateral,
    avecPi: false,
    cle: `pr${a}-${b}-${h}`,
  }
}

/** Aire totale d'un cylindre. */
function cylindre(): Tirage {
  const r = randint(2, 8)
  const h = randint(3, 12)
  const valeur = 2 * Math.PI * r * r + 2 * Math.PI * r * h
  return {
    enonce: `Calculer l'aire totale d'un cylindre de rayon $${r}\\text{ cm}$ et de hauteur $${h}\\text{ cm}$, arrondie au dixième de $\\text{cm}^2$.`,
    correction:
      `Les deux disques de base ont pour aire totale : $2\\times\\pi\\times${r}^2=${2 * r * r}\\pi${cm2}$.<br>` +
      `La surface latérale est un rectangle de largeur $2\\pi\\times${r}$ et de hauteur $${h}$ : $2\\pi\\times${r}\\times${h}=${2 * r * h}\\pi${cm2}$.<br>` +
      `L'aire totale est : $\\mathcal{A}=${2 * r * r}\\pi+${2 * r * h}\\pi=${2 * r * r + 2 * r * h}\\pi${cm2}\\approx${arrondiTex(valeur)}${cm2}$.`,
    valeur: arrondiDixieme(valeur),
    avecPi: true,
    cle: `cy${r}-${h}`,
  }
}

/** Aire totale d'une pyramide régulière à base carrée. */
function pyramide(): Tirage {
  const c = randint(4, 12)
  const a = randint(Math.floor(c / 2) + 2, 14)
  const lateral = 2 * c * a
  return {
    enonce: `Une pyramide régulière a pour base un carré de côté $${c}\\text{ cm}$. Chacune de ses quatre faces latérales est un triangle de base $${c}\\text{ cm}$ et de hauteur $${a}\\text{ cm}$.<br>Calculer l'aire totale de cette pyramide.`,
    correction:
      `L'aire de la base carrée est : $${c}\\times${c}=${c * c}${cm2}$.<br>` +
      `L'aire d'une face latérale est : $\\dfrac{${c}\\times${a}}{2}=${(c * a) / 2}${cm2}$, donc les quatre faces latérales ont pour aire $4\\times${(c * a) / 2}=${lateral}${cm2}$.<br>` +
      `L'aire totale est : $\\mathcal{A}=${c * c}+${lateral}=${miseEnEvidence(texNombre(c * c + lateral))}${cm2}$.`,
    valeur: c * c + lateral,
    avecPi: false,
    cle: `py${c}-${a}`,
  }
}

/** Aire d'une sphère. */
function sphere(): Tirage {
  const r = randint(2, 10)
  const valeur = 4 * Math.PI * r * r
  return {
    enonce: `Calculer l'aire d'une sphère de rayon $${r}\\text{ cm}$, arrondie au dixième de $\\text{cm}^2$.`,
    correction: `L'aire d'une sphère de rayon $r$ est $4\\pi r^2$.<br>$\\mathcal{A}=4\\times\\pi\\times${r}^2=${4 * r * r}\\pi${cm2}\\approx${arrondiTex(valeur)}${cm2}$.`,
    valeur: arrondiDixieme(valeur),
    avecPi: true,
    cle: `sp${r}`,
  }
}

/** Surface extérieure d'un cylindre fermé en bas et surmonté d'une demi-boule. */
function reservoir(): Tirage {
  const r = randint(2, 7)
  const h = randint(3, 10)
  const valeur = 2 * Math.PI * r * h + 3 * Math.PI * r * r
  return {
    enonce: `Un réservoir est formé d'un cylindre de rayon $${r}\\text{ cm}$ et de hauteur $${h}\\text{ cm}$, fermé en bas par un disque et surmonté d'une demi-boule de même rayon.<br>Calculer l'aire de la surface extérieure de ce réservoir, arrondie au dixième de $\\text{cm}^2$.`,
    correction:
      `Le disque du bas a pour aire : $\\pi\\times${r}^2=${r * r}\\pi${cm2}$.<br>` +
      `La surface latérale du cylindre a pour aire : $2\\pi\\times${r}\\times${h}=${2 * r * h}\\pi${cm2}$.<br>` +
      `La demi-boule a pour aire la moitié de celle d'une sphère : $\\dfrac{4\\pi\\times${r}^2}{2}=${2 * r * r}\\pi${cm2}$.<br>` +
      `L'aire de la surface extérieure est : $\\mathcal{A}=${r * r}\\pi+${2 * r * h}\\pi+${2 * r * r}\\pi=${3 * r * r + 2 * r * h}\\pi${cm2}\\approx${arrondiTex(valeur)}${cm2}$.`,
    valeur: arrondiDixieme(valeur),
    avecPi: true,
    cle: `re${r}-${h}`,
  }
}

const tirages: Record<number, () => Tirage> = {
  1: cube,
  2: pave,
  3: prisme,
  4: cylindre,
  5: pyramide,
  6: sphere,
  7: reservoir,
}

/**
 * Aire totale ou extérieure d'un solide décrit dans l'énoncé, sans figure.
 * @author Nathan Scheinmann
 */
export default class AireSolide extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.spacingCorr = 3
    this.sup = 8
    this.besoinFormulaireTexte = [
      'Type de solides',
      [
        'Nombres séparés par des tirets :',
        '1 : Cube',
        '2 : Pavé droit',
        '3 : Prisme droit à base triangulaire rectangle',
        '4 : Cylindre',
        '5 : Pyramide régulière à base carrée',
        '6 : Sphère',
        '7 : Cylindre surmonté d’une demi-boule',
        '8 : Mélange',
      ].join('\n'),
    ]
    this.comment =
      'Chaque énoncé décrit le solide sans figure. Pour la pyramide, la hauteur donnée est celle des faces latérales (apothème), pas celle de la pyramide. Dans les cas avec π, la réponse attendue est la valeur arrondie au dixième de cm² ; la correction donne aussi la valeur exacte. Dans les autres cas, l’aire est un entier.'
  }

  nouvelleVersion() {
    const types = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 7,
      melange: 8,
      defaut: 8,
      nbQuestions: this.nbQuestions,
    }) as number[]
    const liste = combinaisonListes(types, this.nbQuestions)
    let avecPi = false
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const tirage = tirages[liste[i]]()
      if (!this.questionJamaisPosee(i, tirage.cle)) continue
      if (tirage.avecPi) avecPi = true
      let texte = tirage.enonce
      handleAnswers(this, i, { reponse: { value: tirage.valeur } })
      if (this.interactif) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
          texteAvant: tirage.avecPi
            ? '<br>$\\mathcal{A}\\approx$'
            : '<br>$\\mathcal{A}=$',
          texteApres: '$\\text{cm}^2$.',
        })
      }
      this.listeQuestions[i] = texte
      this.listeCorrections[i] = tirage.correction
      i++
    }
    this.consigne = avecPi
      ? 'Prendre la valeur exacte de $\\pi$ pour faire les calculs.'
      : ''
    listeQuestionsToContenu(this)
  }
}
