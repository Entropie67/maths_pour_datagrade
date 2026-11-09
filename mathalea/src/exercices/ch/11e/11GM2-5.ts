import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { pgcd } from '../../../lib/outils/primalite'
import { texNombre } from '../../../lib/outils/texNombre'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Résoudre un problème de solides en plusieurs étapes'
export const dateDePublication = '29/10/2026'
export const uuid = 'b72f3'
export const interactifReady = true
export const refs = { 'fr-fr': [], 'fr-ch': ['11CTGM1E-5', '11LCGM1E-5', '11LSGM1E-5', 'PRQMG02D-5'] }

type Tirage = {
  enonce: string
  correction: string
  valeur: number
  avecPi: boolean
  unite: string
  grandeur: string
  cle: string
}

const cm = '\\text{ cm}'
const cm2 = '\\text{ cm}^2'
const cm3 = '\\text{ cm}^3'
const n = (x: number): string => texNombre(x)
const arrondiDixieme = (x: number): number => Math.round(x * 10) / 10
const arrondiTex = (x: number): string =>
  miseEnEvidence(texNombre(arrondiDixieme(x), 1))

/** Écrit `n\pi` ou `\dfrac{n}{d}\pi` avec la fraction simplifiée. */
function fracPi(num: number, den: number): string {
  const g = pgcd(num, den)
  const [a, b] = [num / g, den / g]
  return b === 1 ? `${a}\\pi` : `\\dfrac{${a}}{${b}}\\pi`
}

/** Triplets pythagoriciens (cathète horizontale, cathète verticale, hypoténuse). */
const triplets: [number, number, number][] = [
  [3, 4, 5],
  [4, 3, 5],
  [6, 8, 10],
  [8, 6, 10],
  [5, 12, 13],
  [12, 5, 13],
  [9, 12, 15],
  [12, 16, 20],
  [8, 15, 17],
  [15, 8, 17],
]

/** Pyramide régulière : l'apothème est donné, on cherche le volume. */
function pyramideVolume(): Tirage {
  const [x, H, a] = choice(
    triplets.filter(([x, H]) => (4 * x * x * H) % 3 === 0),
  )
  const c = 2 * x
  const V = (c * c * H) / 3
  return {
    enonce: `Une pyramide régulière a pour base un carré de côté $${c}${cm}$. Ses quatre faces latérales sont des triangles isocèles de hauteur $${a}${cm}$.<br>Calculer le volume de cette pyramide.`,
    correction:
      `Le pied de la hauteur $H$ de la pyramide est le centre de la base, à $\\dfrac{${c}}{2}=${x}${cm}$ du milieu d'un côté.<br>` +
      `Le triangle formé par la hauteur de la pyramide, ce segment et la hauteur d'une face latérale est rectangle ; son hypoténuse mesure $${a}${cm}$.<br>` +
      `D'après le théorème de Pythagore : $H^2=${a}^2-${x}^2=${a * a}-${x * x}=${H * H}$, donc $H=\\sqrt{${H * H}}=${H}${cm}$.<br>` +
      `Le volume est : $V=\\dfrac{${c}^2\\times${H}}{3}=\\dfrac{${n(c * c * H)}}{3}=${miseEnEvidence(n(V))}${cm3}$.`,
    valeur: V,
    avecPi: false,
    unite: cm3,
    grandeur: 'V',
    cle: `pv${c}-${a}`,
  }
}

/** Cône : la génératrice est donnée, on cherche le volume. */
function coneVolume(): Tirage {
  const [r, h, g] = choice(triplets)
  const valeur = (Math.PI * r * r * h) / 3
  return {
    enonce: `Un cône de révolution a un rayon de $${r}${cm}$. La distance entre son sommet et un point du cercle de sa base est de $${g}${cm}$.<br>Calculer le volume de ce cône, arrondi au dixième de $\\text{cm}^3$.`,
    correction:
      `La hauteur $h$ du cône, le rayon de la base et la distance sommet-cercle forment un triangle rectangle d'hypoténuse $${g}${cm}$.<br>` +
      `D'après le théorème de Pythagore : $h^2=${g}^2-${r}^2=${g * g}-${r * r}=${h * h}$, donc $h=\\sqrt{${h * h}}=${h}${cm}$.<br>` +
      `Le volume est : $V=\\dfrac{\\pi\\times${r}^2\\times${h}}{3}=${fracPi(r * r * h, 3)}${cm3}\\approx${arrondiTex(valeur)}${cm3}$.`,
    valeur: arrondiDixieme(valeur),
    avecPi: true,
    unite: cm3,
    grandeur: 'V',
    cle: `cv${r}-${g}`,
  }
}

/** Transvasement d'eau entre deux cylindres : on cherche la nouvelle hauteur. */
function transvasement(): Tirage {
  const k = choice([2, 3])
  const r = randint(2, 5)
  const R = k * r
  const h = randint(3, 9)
  const h2 = k * k * h
  return {
    enonce: `Un récipient cylindrique de rayon $${R}${cm}$ contient de l'eau sur une hauteur de $${h}${cm}$. On verse toute cette eau dans un autre récipient cylindrique de rayon $${r}${cm}$, assez haut pour tout contenir.<br>Calculer la hauteur de l'eau dans le second récipient.`,
    correction:
      `Le volume d'eau est : $V=\\pi\\times${R}^2\\times${h}=${R * R * h}\\pi${cm3}$.<br>` +
      `Dans le second récipient, ce volume vaut aussi $V=\\pi\\times${r}^2\\times h$, donc $h=\\dfrac{${R * R * h}\\pi}{\\pi\\times${r * r}}=\\dfrac{${R * R * h}}{${r * r}}=${miseEnEvidence(n(h2))}${cm}$.`,
    valeur: h2,
    avecPi: false,
    unite: cm,
    grandeur: 'h',
    cle: `tv${R}-${r}-${h}`,
  }
}

/** Boule contenue dans un cylindre : volume restant. */
function bouleDansCylindre(): Tirage {
  const r = randint(3, 9)
  const valeur = (2 * Math.PI * r ** 3) / 3
  return {
    enonce: `Une boule de rayon $${r}${cm}$ est exactement contenue dans un cylindre de rayon $${r}${cm}$ et de hauteur $${2 * r}${cm}$ : elle touche les deux bases et la paroi.<br>Calculer le volume du cylindre qui n'est pas occupé par la boule, arrondi au dixième de $\\text{cm}^3$.`,
    correction:
      `Le volume du cylindre est : $V_1=\\pi\\times${r}^2\\times${2 * r}=${2 * r ** 3}\\pi${cm3}$.<br>` +
      `Le volume de la boule est : $V_2=\\dfrac{4\\pi\\times${r}^3}{3}=${fracPi(4 * r ** 3, 3)}${cm3}$.<br>` +
      `Le volume non occupé est la différence : $V=V_1-V_2=${2 * r ** 3}\\pi-${fracPi(4 * r ** 3, 3)}=${fracPi(2 * r ** 3, 3)}${cm3}\\approx${arrondiTex(valeur)}${cm3}$.`,
    valeur: arrondiDixieme(valeur),
    avecPi: true,
    unite: cm3,
    grandeur: 'V',
    cle: `bc${r}`,
  }
}

/** Toupie : cylindre posé sur un cône, dont on connaît la distance pointe-cercle. */
function toupie(): Tirage {
  const [r, hc, g] = choice(triplets)
  const h = randint(3, 9)
  const total = 3 * r * r * h + r * r * hc
  const valeur = (Math.PI * total) / 3
  return {
    enonce: `Une toupie est formée d'un cylindre de rayon $${r}${cm}$ et de hauteur $${h}${cm}$, posé sur un cône de même base dont la pointe est vers le bas. La distance entre la pointe du cône et un point du cercle de sa base est de $${g}${cm}$.<br>Calculer le volume de cette toupie, arrondi au dixième de $\\text{cm}^3$.`,
    correction:
      `Le volume du cylindre est : $V_1=\\pi\\times${r}^2\\times${h}=${r * r * h}\\pi${cm3}$.<br>` +
      `La hauteur $h'$ du cône vérifie, d'après le théorème de Pythagore : $h'^2=${g}^2-${r}^2=${g * g}-${r * r}=${hc * hc}$, donc $h'=\\sqrt{${hc * hc}}=${hc}${cm}$.<br>` +
      `Le volume du cône est : $V_2=\\dfrac{\\pi\\times${r}^2\\times${hc}}{3}=${fracPi(r * r * hc, 3)}${cm3}$.<br>` +
      `Le volume de la toupie est : $V=V_1+V_2=${r * r * h}\\pi+${fracPi(r * r * hc, 3)}=${fracPi(total, 3)}${cm3}\\approx${arrondiTex(valeur)}${cm3}$.`,
    valeur: arrondiDixieme(valeur),
    avecPi: true,
    unite: cm3,
    grandeur: 'V',
    cle: `to${r}-${h}-${g}`,
  }
}

/** Pyramide régulière : la hauteur est donnée, on cherche l'aire totale. */
function pyramideAire(): Tirage {
  const [x, H, a] = choice(triplets)
  const c = 2 * x
  const A = c * c + 2 * c * a
  return {
    enonce: `Une pyramide régulière a pour base un carré de côté $${c}${cm}$ et pour hauteur $${H}${cm}$.<br>Calculer l'aire totale de cette pyramide.`,
    correction:
      `La hauteur $a$ d'une face latérale est l'hypoténuse d'un triangle rectangle dont les côtés de l'angle droit mesurent $${H}${cm}$ (hauteur de la pyramide) et $\\dfrac{${c}}{2}=${x}${cm}$.<br>` +
      `D'après le théorème de Pythagore : $a^2=${H}^2+${x}^2=${H * H}+${x * x}=${a * a}$, donc $a=\\sqrt{${a * a}}=${a}${cm}$.<br>` +
      `L'aire de la base est $${c}^2=${c * c}${cm2}$ et celle des quatre faces latérales est $4\\times\\dfrac{${c}\\times${a}}{2}=${2 * c * a}${cm2}$.<br>` +
      `L'aire totale est : $\\mathcal{A}=${c * c}+${2 * c * a}=${miseEnEvidence(n(A))}${cm2}$.`,
    valeur: A,
    avecPi: false,
    unite: cm2,
    grandeur: '\\mathcal{A}',
    cle: `pa${c}-${H}`,
  }
}

const tirages: Record<number, () => Tirage> = {
  1: pyramideVolume,
  2: coneVolume,
  3: transvasement,
  4: bouleDansCylindre,
  5: toupie,
  6: pyramideAire,
}

/**
 * Problèmes de solides à plusieurs étapes : théorème de Pythagore pour une
 * hauteur ou une hauteur de face, puis volume ou aire.
 * @author Nathan Scheinmann
 */
export default class ProblemeSolidesEtapes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.spacingCorr = 3
    this.sup = 7
    this.besoinFormulaireTexte = [
      'Situations',
      [
        'Nombres séparés par des tirets :',
        '1 : Volume d’une pyramide dont on connaît la hauteur d’une face',
        '2 : Volume d’un cône dont on connaît la distance sommet-cercle',
        '3 : Transvasement d’eau entre deux cylindres',
        '4 : Boule dans un cylindre',
        '5 : Toupie (cylindre et cône)',
        '6 : Aire totale d’une pyramide dont on connaît la hauteur',
        '7 : Mélange',
      ].join('\n'),
    ]
    this.comment =
      'Chaque situation demande plusieurs étapes, dont le théorème de Pythagore pour une hauteur cachée (pyramide, cône, toupie). Les dimensions viennent de triplets pythagoriciens, donc les hauteurs déduites sont entières. Dans les cas avec π, la réponse attendue est la valeur arrondie au dixième ; la correction donne aussi la valeur exacte. Les énoncés n’ont pas de figure.'
  }

  nouvelleVersion() {
    const types = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 6,
      melange: 7,
      defaut: 7,
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
          texteAvant: `<br>$${tirage.grandeur}${tirage.avecPi ? '\\approx' : '='}$`,
          texteApres: `$${tirage.unite}$.`,
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
