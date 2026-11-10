import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const titre =
  'Calculer une probabilité conditionnelle ou une intersection'
export const dateDePublication = '23/10/2026'
export const amcReady = true
export const interactifReady = true

export const uuid = '0975b'
export const refs = {
  'fr-fr': ['1A-P06-2'],
  'fr-ch': [],
}

/**
 * Calculer P_A(B) à partir de P(A), P(B) et P(A∩B),
 * ou P(A∩B) à partir de P(A) et P_A(B).
 * @author Stéphane Guyon
 */
export default class CalculerProbabiliteConditionnelleOuIntersection extends ExerciceQcmACourt {
  private reponseAttendue = ''
  private enonceSansQuestion = ''

  /** Les probabilités sont données en centièmes pour éviter les erreurs d'arrondi. */
  private static valeur(centiemes: number): string {
    return texNombre(centiemes / 100, 2)
  }

  /** Met en forme la réponse : seule la valeur est mise en évidence en saisie libre. */
  private bonneReponse(libelle: string, valeur: string): string {
    return this.sup3
      ? `$${miseEnEvidence(`${libelle}=${valeur}`)}$`
      : `$${libelle}=${miseEnEvidence(valeur)}$`
  }

  /** Garde trois distracteurs différents de la bonne réponse et compris entre 0 et 1. */
  private static distracteurs(correct: number, candidats: number[]): number[] {
    const retenus: number[] = []
    for (const c of [...candidats, 5, 10, 95, 90, 50]) {
      const arrondi = Math.round(c)
      if (
        arrondi > 0 &&
        arrondi < 100 &&
        arrondi !== correct &&
        !retenus.includes(arrondi)
      ) {
        retenus.push(arrondi)
      }
      if (retenus.length === 3) break
    }
    return retenus
  }

  private applique(
    type: 'conditionnelle' | 'intersection',
    [a, b]: string[],
    paTiers: number,
    qDixiemes: number,
    pbCentiemes: number,
  ) {
    const v = CalculerProbabiliteConditionnelleOuIntersection.valeur
    const paC = paTiers * 10
    const pabC = paTiers * qDixiemes
    const qC = qDixiemes * 10
    const pa = `P(${a})`
    const pb = `P(${b})`
    const pab = `P(${a}\\cap ${b})`
    const paB = `P_${a}(${b})`

    let donnees: string
    let question: string
    let libelle: string
    let reponseC: number
    let candidats: number[]
    let calcul: string

    if (type === 'conditionnelle') {
      donnees = `$${pa}=${v(paC)}$, $${pb}=${v(pbCentiemes)}$ et $${pab}=${v(pabC)}$`
      question = `Calculer $${paB}$.`
      libelle = paB
      reponseC = qC
      candidats = [
        (pabC * 100) / pbCentiemes,
        (paC * pabC) / 100,
        paC - pabC,
        (paC * pbCentiemes) / 100,
      ]
      calcul = `On utilise la formule $${paB}=\\dfrac{${pab}}{${pa}}$.<br>
      $${paB}=\\dfrac{${v(pabC)}}{${v(paC)}}=`
    } else {
      donnees = `$${pa}=${v(paC)}$ et $${paB}=${v(qC)}$`
      question = `Calculer $${pab}$.`
      libelle = pab
      reponseC = pabC
      candidats = [
        paC + qC,
        (paC * (100 - qC)) / 100,
        (paC * 100) / qC,
        Math.abs(paC - qC),
        qC,
      ]
      calcul = `On utilise la formule $${pab}=${pa}\\times ${paB}$.<br>
      $${pab}=${v(paC)}\\times ${v(qC)}=`
    }

    const reponse = v(reponseC)
    this.reponseAttendue = reponse
    this.optionsChampReponseCourte = { dataKeys: [] }
    this.texteAvantReponseCourte = `$${libelle}=$`
    this.reponseCourte = () => this.reponseAttendue

    this.enonceSansQuestion = `On donne ${donnees}.`
    this.enonce = `${this.enonceSansQuestion}<br>${question}`
    this.correction = `${calcul}${reponse}$`
    this.correction += `<br>Donc ${this.bonneReponse(libelle, reponse)}.`

    const distracteurs =
      CalculerProbabiliteConditionnelleOuIntersection.distracteurs(
        reponseC,
        candidats,
      )
    this.reponses = [
      `$${libelle}=${reponse}$`,
      ...distracteurs.map((d) => `$${libelle}=${v(d)}$`),
    ]
  }

  /** En interactif, le champ « P_E(F)= » porte déjà la question : « Calculer … » est omis. */
  enonceCourt = () => (this.interactif ? this.enonceSansQuestion : this.enonce)

  versionOriginale: () => void = () => {
    this.applique('conditionnelle', ['A', 'B'], 6, 5, 50)
  }

  versionAleatoire: () => void = () => {
    const evenements = choice([
      ['A', 'B'],
      ['E', 'F'],
      ['C', 'D'],
      ['R', 'S'],
    ])
    const type = choice(['conditionnelle', 'intersection'] as const)
    const paTiers = randint(3, 9)
    const qDixiemes = randint(2, 8)
    const pabC = paTiers * qDixiemes
    // P(B) est un multiple de 0,1 strictement supérieur à P(A∩B)
    const pbCentiemes = randint(Math.ceil(pabC / 10) + 1, 9) * 10
    this.applique(type, evenements, paTiers, qDixiemes, pbCentiemes)
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.versionAleatoire()
  }
}
