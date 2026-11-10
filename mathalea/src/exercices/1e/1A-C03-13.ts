import Decimal from 'decimal.js'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import ExerciceSimple from '../ExerciceSimple'
export const dateDePublication = '15/12/2025'
export const dateDeModifImportante = '30/09/2026'
export const uuid = '7e7d7'

export const refs = {
  'fr-fr': ['1A-C03-13', '2A-N3-8'],
  'fr-ch': ['10CTQCMNO-1', '10LCQCMNO-2', '10LSQCMNO-3'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre =
  'Résoudre un problème de hauteur avec une puissance de $10$'

/**
 *
 * @author Gilles Mora (avec claude ai)
 *
 */
export default class Auto1AC3m extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcmDisponible = true
    this.versionQcm = false
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut bien identifier les informations utiles.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Repérer à quoi correspond l'épaisseur donnée : une feuille, dix feuilles ou cent feuilles.</li>
    <li>Identifier l'unité de l'épaisseur donnée.</li>
    <li>Repérer le nombre de feuilles dans la pile à calculer.</li>
    <li>Identifier l'unité attendue pour la réponse.</li>
  </ul>
  <p style="margin: 0;">
   Faire un tableau de conversion si besoin.
  </p>`
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = true

    // cas 1 : épaisseur d'une feuille ; cas 2 : de 10 feuilles ; cas 3 : de 100 feuilles
    const cas = this.quotaChoice('cas', [1, 2, 3])
    const epaisseurBase = choice([60, 70, 80])
    const nbFeuillesPile = choice([1000, 2000, 5000])
    const nbFeuillesReference = 10 ** (cas - 1)
    const unite = cas === 1 ? 'mm' : cas === 3 ? 'cm' : choice(['mm', 'cm'])
    const format = choice([1, 2])

    // Épaisseur de référence : m × 10^e (une feuille mesure epaisseurBase × 10^-3 mm)
    const exposantBase = unite === 'mm' ? -3 : -4
    const mantisse =
      format === 1
        ? epaisseurBase * nbFeuillesReference
        : (epaisseurBase * nbFeuillesReference) / 10
    const exposant = format === 1 ? exposantBase : exposantBase + 1

    // Épaisseur de la pile, exprimée dans l'unité de l'énoncé
    const pileDansUnite = new Decimal(mantisse)
      .mul(new Decimal(10).pow(exposant))
      .mul(nbFeuillesPile)
      .div(nbFeuillesReference)
    // Unité de la réponse :
    // - en QCM, celle qui donne un nombre raisonnable (entre 1 et 100) ;
    // - sinon, l'autre unité que celle de l'énoncé (cm → mm, mm → cm).
    const uniteReponse = this.versionQcm
      ? cas === 3 || (unite === 'mm' && cas === 2)
        ? 'cm'
        : nbFeuillesPile === 1000
          ? 'mm'
          : 'cm'
      : unite === 'mm'
        ? 'cm'
        : 'mm'
    const pileEnMm = unite === 'mm' ? pileDansUnite : pileDansUnite.mul(10)
    const reponse = uniteReponse === 'mm' ? pileEnMm : pileEnMm.div(10)
    const autreUnite = uniteReponse === 'mm' ? 'cm' : 'mm'

    const texteReference =
      nbFeuillesReference === 1
        ? "d'une feuille"
        : `de $${texNombre(nbFeuillesReference)}$ feuilles`
    const enonce = `L'épaisseur ${texteReference} de papier est égale à $${texNombre(mantisse)} \\times 10^{${exposant}}$ ${unite}.<br>`
    const pileScientifique = (mantisse * nbFeuillesPile) / nbFeuillesReference
    let mantissePile = pileScientifique
    let exposantPile = exposant
    while (mantissePile >= 10) {
      mantissePile /= 10
      exposantPile += 1
    }

    const epaisseurEnEvidence = this.versionQcm
      ? `$${miseEnEvidence(texNombre(reponse, 1))}$ ${texteEnCouleurEtGras(uniteReponse)}`
      : `$${miseEnEvidence(texNombre(reponse, 1))} \\text{ ${uniteReponse}}$`

    this.correction =
      `L'épaisseur ${texteReference} est $${texNombre(mantisse)} \\times 10^{${exposant}}$ ${unite}.<br>` +
      `Pour $${texNombre(nbFeuillesPile)}$ feuilles, il faut multiplier par $${texNombre(nbFeuillesPile / nbFeuillesReference)}$.<br>` +
      `L'épaisseur de la pile en $\\textbf{${unite}}$ est donc : <br>` +
      `$\\begin{aligned}` +
      `${texNombre(mantisse)} \\times ${texNombre(nbFeuillesPile / nbFeuillesReference, 0)} \\times 10^{${exposant}}` +
      `&=${texNombre(pileScientifique)} \\times 10^{${exposant}}\\\\` +
      `&=${texNombre(mantissePile, 2)} \\times 10^{${exposantPile}} \\\\` +
      `&=${texNombre(pileDansUnite, 2)}` +
      `\\end{aligned}$<br>` +
      (unite === uniteReponse
        ? `L'épaisseur de la pile est donc de ${epaisseurEnEvidence}.`
        : `L'épaisseur de la pile est donc de $${texNombre(pileDansUnite, 2)}\\text{ ${unite}}$, soit ${epaisseurEnEvidence}.`)

    if (this.versionQcm) {
      const avecUnite = (valeur: Decimal, u: string) =>
        `$${texNombre(valeur, 2)}\\text{ ${u}}$`
      this.question = `${enonce}L'épaisseur d'une pile de $${texNombre(nbFeuillesPile)}$ feuilles est égale à :`
      this.reponse = avecUnite(reponse, uniteReponse)
      this.distracteurs = [
        avecUnite(reponse, autreUnite),
        avecUnite(reponse.div(10), uniteReponse),
        avecUnite(reponse.mul(10), uniteReponse),
        avecUnite(reponse.mul(10), autreUnite),
        avecUnite(reponse.div(100), uniteReponse),
      ]
    } else {
      // En interactif, phrase à compléter : « L'épaisseur … est : [champ] unité »
      this.question = this.interactif
        ? `${enonce}L'épaisseur d'une pile de $${texNombre(nbFeuillesPile)}$ feuilles est :`
        : `${enonce}Calculer l'épaisseur d'une pile de $${texNombre(nbFeuillesPile)}$ feuilles, en $\\text{${uniteReponse}}$.`
      this.optionsChampTexte = {
        texteApres: `$\\text{${uniteReponse}}$`,
      }
      this.reponse = reponse
    }
  }
}
