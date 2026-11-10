import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
// import ExerciceQcmA from '../../ExerciceQcmA'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { reduireAxPlusB } from '../../lib/outils/ecritures'
import { texNombre } from '../../lib/outils/texNombre'
import ExerciceQcmA from '../ExerciceQcmA'
import { sp } from '../../lib/outils/outilString'

export const uuid = 'e6c95'
export const refs = {
  'fr-fr': ['1A-C10-15', '2A-C3-11'],
  'fr-ch': ['2mIneq-12'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Trouver l'inéquation avec une solution"
export const dateDePublication = '17/12/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora avec Claude ai
 *
 */
type Proposition = {
  inequation: string
  type: 1 | 2
  a: number
  b: number
  c?: number
  d?: number
  estSolution: boolean
}

export default class Auto1C10o extends ExerciceQcmA {
  private genererInequation1(
    x0: number,
    estSolution: boolean,
  ): { inequation: string; a: number; b: number; c: number; d: number } {
    if (estSolution) {
      const a = randint(2, 6)
      const c = randint(1, a - 1)
      const d = randint(1, 5)
      const b = c * x0 + d - a * x0 - randint(1, 3)

      return {
        inequation: `${reduireAxPlusB(a, b)} < ${reduireAxPlusB(c, d)}`,
        a,
        b,
        c,
        d,
      }
    } else {
      const a = randint(2, 6)
      const c = randint(1, a - 1)
      const d = randint(1, 5)
      const b = c * x0 + d - a * x0 + randint(1, 3)

      return {
        inequation: `${reduireAxPlusB(a, b)} < ${reduireAxPlusB(c, d)}`,
        a,
        b,
        c,
        d,
      }
    }
  }

  // Génère une inéquation du second degré avec solution x0
  private genererInequation2(
    x0: number,
    estSolution: boolean,
  ): { inequation: string; a: number; b: number } {
    if (estSolution) {
      const a = randint(2, 5)
      const b = x0 * x0 - a * x0 + randint(1, 3)

      return {
        inequation: `x^2 < ${reduireAxPlusB(a, b)}`,
        a,
        b,
      }
    } else {
      const a = randint(2, 5)
      const b = x0 * x0 - a * x0 - randint(1, 3)

      return {
        inequation: `x^2 < ${reduireAxPlusB(a, b)}`,
        a,
        b,
      }
    }
  }

  private construireCorrection(
    x0: number,
    propositions: Proposition[],
    bonneInequation: string,
  ): string {
    let correction = `On teste le nombre $${x0}$ dans chacune des inéquations proposées.`
    for (const p of propositions) {
      let membreGauche: number
      let membreDroit: number
      let gaucheTex: string
      let droitTex: string
      if (p.type === 1) {
        membreGauche = p.a * x0 + p.b
        membreDroit = (p.c as number) * x0 + (p.d as number)
        gaucheTex = `${p.a} \\times (${x0}) + ${p.b} = ${texNombre(membreGauche)}`
        droitTex = `${p.c} \\times (${x0}) + ${p.d} = ${texNombre(membreDroit)}`
      } else {
        membreGauche = x0 * x0
        membreDroit = p.a * x0 + p.b
        gaucheTex = `(${x0})^2 = ${texNombre(membreGauche)}`
        droitTex = `${p.a} \\times (${x0}) + ${p.b} = ${texNombre(membreDroit)}`
      }
      correction += `<br>$\\bullet$ $${p.inequation}$${sp()}:<br>
Membre de gauche${sp()}: $${gaucheTex}$<br>
Membre de droite${sp()}: $${droitTex}$<br>`
      if (p.estSolution) {
        correction += `Comme $${texNombre(membreGauche)} < ${texNombre(membreDroit)}$, l'inéquation est vérifiée${sp()}: $${x0}$ est solution.`
      } else {
        correction += `Comme $${texNombre(membreGauche)} > ${texNombre(membreDroit)}$, l'inéquation n'est pas vérifiée${sp()}: $${x0}$ n'est pas solution.`
      }
    }
    correction += `<br><br>Ainsi, la seule inéquation dont $${x0}$ est solution est $${miseEnEvidence(bonneInequation)}$.`
    return correction
  }

  private cas1(x0: number): void {
    const bonne = this.genererInequation1(x0, true)

    const propositions: Proposition[] = [
      { ...bonne, type: 1, estSolution: true },
      { ...this.genererInequation1(x0, false), type: 1, estSolution: false },
      { ...this.genererInequation2(x0, false), type: 2, estSolution: false },
      { ...this.genererInequation2(x0, false), type: 2, estSolution: false },
    ]

    this.enonce = `Le nombre $${x0}$ est solution de l'inéquation${sp()}:`
    this.correction = this.construireCorrection(
      x0,
      propositions,
      bonne.inequation,
    )
    this.reponses = propositions.map((p) => `$${p.inequation}$`)
  }

  private cas2(x0: number): void {
    const bonne = this.genererInequation2(x0, true)

    const propositions: Proposition[] = [
      { ...bonne, type: 2, estSolution: true },
      { ...this.genererInequation1(x0, false), type: 1, estSolution: false },
      { ...this.genererInequation1(x0, false), type: 1, estSolution: false },
      { ...this.genererInequation2(x0, false), type: 2, estSolution: false },
    ]

    this.enonce = `Le nombre $${x0}$ est solution de l'inéquation${sp()}:`
    this.correction = this.construireCorrection(
      x0,
      propositions,
      bonne.inequation,
    )
    this.reponses = propositions.map((p) => `$${p.inequation}$`)
  }

  versionOriginale: () => void = () => {
    this.cas1(-1)
  }

  versionAleatoire: () => void = () => {
    let compteur = 0
    do {
      const x0 = choice([-1, -2, -3])
      const typeCas = randint(1, 2)

      if (typeCas === 1) {
        this.cas1(x0)
      } else {
        this.cas2(x0)
      }
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.optionsDeComparaison = { texteSansCasse: true } // pour le test qcm_exercice
    this.versionAleatoire()
    this.spacing = 1.5
  }
}
