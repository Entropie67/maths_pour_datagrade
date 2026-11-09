import {
  figureCylindreCone,
  figureCylindreDemiBoule,
  figurePaveCreuxCylindre,
  figurePaveCreuxPave,
  figurePavePyramide,
} from '../../../lib/3d/figuresSolidesCompose'
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

export const titre = "Calculer le volume d'un solide composé"
export const dateDePublication = '29/10/2026'
export const uuid = '8473d'
export const interactifReady = true
export const refs = { 'fr-fr': [], 'fr-ch': ['10CTGM2C-3', '10LCGM2C-3', '10LSGM2C-3', '11CTGM1E-3', '11LCGM1E-3', '11LSGM1E-3', 'PRQMG02D-4'] }

type Tirage = {
  enonce: string
  correction: string
  valeur: number
  avecPi: boolean
  cle: string
  figure: () => string
}

const cm3 = '\\text{ cm}^3'

/** Écrit `n\pi` ou `\dfrac{n}{d}\pi` avec la fraction simplifiée. */
function fracPi(n: number, d: number): string {
  const g = pgcd(n, d)
  const [num, den] = [n / g, d / g]
  return den === 1 ? `${num}\\pi` : `\\dfrac{${num}}{${den}}\\pi`
}

function arrondiDixieme(x: number): number {
  return Math.round(x * 10) / 10
}

/** Pavé à base carrée surmonté d'une pyramide de même base. */
function pavePyramide(): Tirage {
  const a = randint(4, 10)
  const h = randint(3, 9)
  const H = choice([3, 6, 9])
  const v1 = a * a * h
  const v2 = (a * a * H) / 3
  return {
    enonce: `Une maison miniature est formée d'un pavé droit à base carrée de côté $${a}\\text{ cm}$ et de hauteur $${h}\\text{ cm}$, surmonté d'une pyramide de même base et de hauteur $${H}\\text{ cm}$.<br>Calculer le volume de cette maison.`,
    correction:
      `Le volume du pavé est : $V_1=${a}\\times${a}\\times${h}=${v1}${cm3}$.<br>` +
      `Le volume de la pyramide est : $V_2=\\dfrac{${a}\\times${a}\\times${H}}{3}=${v2}${cm3}$.<br>` +
      `Le volume de la maison est la somme des deux volumes : $V=V_1+V_2=${v1}+${v2}=${miseEnEvidence(texNombre(v1 + v2))}${cm3}$.`,
    valeur: v1 + v2,
    avecPi: false,
    cle: `pp${a}-${h}-${H}`,
    figure: () => figurePavePyramide(a, h, H),
  }
}

/** Cylindre surmonté d'un cône de même base. */
function cylindreCone(): Tirage {
  const r = randint(2, 6)
  const h = randint(4, 10)
  const H = choice([3, 6, 9])
  const c1 = r * r * h
  const c2 = (r * r * H) / 3
  const valeur = (c1 + c2) * Math.PI
  return {
    enonce: `Un silo est formé d'un cylindre de rayon $${r}\\text{ cm}$ et de hauteur $${h}\\text{ cm}$, surmonté d'un cône de même base et de hauteur $${H}\\text{ cm}$.<br>Calculer le volume de ce silo, arrondi au dixième de $\\text{cm}^3$.`,
    correction:
      `Le volume du cylindre est : $V_1=\\pi\\times${r}^2\\times${h}=${c1}\\pi${cm3}$.<br>` +
      `Le volume du cône est : $V_2=\\dfrac{\\pi\\times${r}^2\\times${H}}{3}=${c2}\\pi${cm3}$.<br>` +
      `Le volume du silo est la somme des deux volumes : $V=V_1+V_2=${c1}\\pi+${c2}\\pi=${c1 + c2}\\pi${cm3}\\approx${miseEnEvidence(texNombre(arrondiDixieme(valeur), 1))}${cm3}$.`,
    valeur: arrondiDixieme(valeur),
    avecPi: true,
    cle: `cc${r}-${h}-${H}`,
    figure: () => figureCylindreCone(r, h, H),
  }
}

/** Cylindre surmonté d'une demi-boule de même rayon. */
function cylindreDemiBoule(): Tirage {
  const r = randint(2, 6)
  const h = randint(3, 9)
  const c1 = r * r * h
  const total = 3 * c1 + 2 * r ** 3
  const valeur = (total / 3) * Math.PI
  return {
    enonce: `Un réservoir est formé d'un cylindre de rayon $${r}\\text{ cm}$ et de hauteur $${h}\\text{ cm}$, surmonté d'une demi-boule de même rayon.<br>Calculer le volume de ce réservoir, arrondi au dixième de $\\text{cm}^3$.`,
    correction:
      `Le volume du cylindre est : $V_1=\\pi\\times${r}^2\\times${h}=${c1}\\pi${cm3}$.<br>` +
      `Le volume de la demi-boule est : $V_2=\\dfrac{1}{2}\\times\\dfrac{4\\pi\\times${r}^3}{3}=${fracPi(2 * r ** 3, 3)}${cm3}$.<br>` +
      `Le volume du réservoir est la somme des deux volumes : $V=V_1+V_2=${c1}\\pi+${fracPi(2 * r ** 3, 3)}=${fracPi(total, 3)}${cm3}\\approx${miseEnEvidence(texNombre(arrondiDixieme(valeur), 1))}${cm3}$.`,
    valeur: arrondiDixieme(valeur),
    avecPi: true,
    cle: `cb${r}-${h}`,
    figure: () => figureCylindreDemiBoule(r, h),
  }
}

/** Pavé dans lequel on creuse un trou traversant en forme de pavé. */
function paveCreuxPave(): Tirage {
  const L = randint(8, 14)
  const l = randint(6, L - 1)
  const h = randint(3, 9)
  const a = randint(2, l - 3)
  const b = randint(2, L - 3)
  const v1 = L * l * h
  const v2 = a * b * h
  return {
    enonce: `Un pavé droit a pour longueur $${L}\\text{ cm}$, pour largeur $${l}\\text{ cm}$ et pour hauteur $${h}\\text{ cm}$. On y a creusé un trou qui le traverse de haut en bas : ce trou est un pavé droit de longueur $${b}\\text{ cm}$, de largeur $${a}\\text{ cm}$ et de même hauteur que le grand pavé.<br>Calculer le volume de ce pavé creusé.`,
    correction:
      `Le volume du pavé plein est : $V_1=${L}\\times${l}\\times${h}=${v1}${cm3}$.<br>` +
      `Le volume du trou est : $V_2=${b}\\times${a}\\times${h}=${v2}${cm3}$.<br>` +
      `Le volume du pavé creusé est la différence des deux volumes : $V=V_1-V_2=${v1}-${v2}=${miseEnEvidence(texNombre(v1 - v2))}${cm3}$.`,
    valeur: v1 - v2,
    avecPi: false,
    cle: `pc${L}-${l}-${h}-${a}-${b}`,
    figure: () => figurePaveCreuxPave(L, l, h, b, a),
  }
}

/** Pavé dans lequel on creuse un trou cylindrique traversant. */
function paveCreuxCylindre(): Tirage {
  const l = randint(6, 12)
  const L = randint(l, 14)
  const h = randint(3, 9)
  const r = randint(1, Math.floor((l - 1) / 2))
  const v1 = L * l * h
  const c2 = r * r * h
  const valeur = v1 - c2 * Math.PI
  return {
    enonce: `Un pavé droit a pour longueur $${L}\\text{ cm}$, pour largeur $${l}\\text{ cm}$ et pour hauteur $${h}\\text{ cm}$. On y a percé un trou cylindrique de rayon $${r}\\text{ cm}$ qui le traverse de haut en bas.<br>Calculer le volume de ce pavé percé, arrondi au dixième de $\\text{cm}^3$.`,
    correction:
      `Le volume du pavé plein est : $V_1=${L}\\times${l}\\times${h}=${v1}${cm3}$.<br>` +
      `Le volume du trou est : $V_2=\\pi\\times${r}^2\\times${h}=${c2}\\pi${cm3}$.<br>` +
      `Le volume du pavé percé est la différence des deux volumes : $V=V_1-V_2=${v1}-${c2}\\pi${cm3}\\approx${miseEnEvidence(texNombre(arrondiDixieme(valeur), 1))}${cm3}$.`,
    valeur: arrondiDixieme(valeur),
    avecPi: true,
    cle: `pcy${L}-${l}-${h}-${r}`,
    figure: () => figurePaveCreuxCylindre(L, l, h, r),
  }
}

const tirages: Record<number, () => Tirage> = {
  1: pavePyramide,
  2: cylindreCone,
  3: cylindreDemiBoule,
  4: paveCreuxPave,
  5: paveCreuxCylindre,
}

/**
 * Volume d'un assemblage de deux solides, par ajout ou par retrait.
 * Le solide est décrit dans l'énoncé, avec une figure en option.
 * @author Nathan Scheinmann
 */
export default class VolumeSolideCompose extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.spacingCorr = 3
    this.sup = 6
    this.besoinFormulaireTexte = [
      'Type de solides',
      [
        'Nombres séparés par des tirets :',
        '1 : Pavé surmonté d’une pyramide',
        '2 : Cylindre surmonté d’un cône',
        '3 : Cylindre surmonté d’une demi-boule',
        '4 : Pavé dans lequel on creuse un pavé',
        '5 : Pavé dans lequel on perce un cylindre',
        '6 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2CaseACocher = ['Avec figure', false]
    this.sup2 = false
    this.comment =
      'Chaque énoncé décrit le solide ; une figure en perspective, avec les dimensions, peut être ajoutée. Dans les cas avec π, la réponse attendue est la valeur arrondie au dixième de cm³ ; la correction donne aussi la valeur exacte. Dans les autres cas, le volume est un entier.'
  }

  nouvelleVersion() {
    const types = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 5,
      melange: 6,
      defaut: 6,
      nbQuestions: this.nbQuestions,
    }) as number[]
    const liste = combinaisonListes(types, this.nbQuestions)
    let avecPi = false
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const tirage = tirages[liste[i]]()
      if (!this.questionJamaisPosee(i, tirage.cle)) continue
      if (tirage.avecPi) avecPi = true
      let texte = tirage.enonce
      if (this.sup2) texte += '<br>' + tirage.figure()
      handleAnswers(this, i, {
        reponse: { value: tirage.valeur },
      })
      if (this.interactif) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
          texteAvant: tirage.avecPi ? '<br>$V\\approx$' : '<br>$V=$',
          texteApres: '$\\text{cm}^3$.',
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
