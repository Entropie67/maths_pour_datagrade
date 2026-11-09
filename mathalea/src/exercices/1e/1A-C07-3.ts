import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { prenomF } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
export const dateDePublication = '01/10/2025'
export const dateDeModifImportante = '30/09/2026'
export const uuid = 'd61b6'

export const refs = {
  'fr-fr': ['1A-C07-3', '2A-N7-3'],
  'fr-ch': ['11CTFA1A-3', '11LCFA1A-3', '11LSFA1A-3'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre = 'Calculer une vitesse'

export default class auto1AC7b extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = {
      texteAvant: '<br>Sa vitesse moyenne est ',
      texteApres: '$\\text{km/h}$.',
    }
    this.versionQcmDisponible = true
    this.versionQcm = false
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = true

    const choix = String(prenomF())
    // Durée du parcours en minutes : 12, 5, 3 ou 4 ; le nombre de tours d'une heure en découle
    const duree = this.quotaChoice('duree', [12, 5, 3, 4])
    const facteur = 60 / duree // nombre de parcours identiques en 1 heure
    let enonce: string
    let vitesse: number // en km/h
    let distracteurs: number[]

    if (duree === 12) {
      const dist = randint(1, 4)
      const sujet = dist > 2 ? 'Une athlète' : choix
      enonce = `${sujet} parcourt $${dist}\\text{ km}$ en $12$ minutes.`
      vitesse = 5 * dist
      distracteurs = [4 * dist, 12 * dist, 24, 6 * dist]
      this.correction = `Dans une $1$ heure, il y a $12\\times 5$ minutes.<br>
      Ainsi, en $1$ heure, ${dist > 2 ? 'cette athlète' : choix} parcourt $5$ fois plus de distance, soit $${texNombre(dist)}\\text{ km}\\times ${facteur}=${texNombre(5 * dist)}\\text{ km}$.<br>
      Sa vitesse moyenne est donc `
      this.correction += this.versionQcm
        ? `$${miseEnEvidence(`${texNombre(5 * dist)}\\text{ km/h}`)}$. `
        : `$${miseEnEvidence(texNombre(5 * dist))}\\text{ km/h}$. `
    } else {
      const dist = randint(3, 9)
      enonce = `${choix} parcourt $${texNombre(dist * 100, 0)}\\text{ m}$ en $${duree}$ minutes.`
      vitesse = (facteur * dist) / 10
      distracteurs =
        duree === 5
          ? [dist, 5, 12, (6 * dist) / 10]
          : [
              ((facteur - 5) * dist) / 10,
              ((facteur - 10) * dist) / 10,
              (duree * dist) / 10,
            ]
      this.correction = `Dans une $1$ heure, il y a $${duree}\\times ${facteur}$ minutes.<br>
      Ainsi, en $1$ heure, ${choix} parcourt $${facteur}$ fois plus de distance, soit $${texNombre(dist / 10, 2)}\\text{ km}\\times ${facteur}=${texNombre(vitesse, 2)}\\text{ km}$.<br>
      Sa vitesse moyenne est donc `
      this.correction += this.versionQcm
        ? `$${miseEnEvidence(`${texNombre(vitesse, 2)}\\text{ km/h}`)}$. `
        : `$${miseEnEvidence(texNombre(vitesse, 2))}\\text{ km/h}$. `
    }

    if (this.versionQcm) {
      this.question = `${enonce} <br>Quelle est sa vitesse moyenne ?   `
      this.reponse = `$${texNombre(vitesse, 2)}\\text{ km/h}$`
      this.distracteurs = distracteurs.map(
        (d) => `$${texNombre(d, 2)}\\text{ km/h}$`,
      )
    } else {
      this.question = `${enonce} <br>Calculer sa vitesse moyenne, en $\\text{km/h}$.`
      this.reponse = String(vitesse)
    }
  }
}
