import Decimal from 'decimal.js'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Écrire un décimal sous la forme d’un pourcentage'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '19/12/2021' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '13/09/2026'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export const uuid = 'dba07'

export const refs = {
  'fr-fr': ['can5P2-02', '6N1E-flash1', '2I10-flash1'],
  'fr-ch': ['NR'],
}
export default class ÉcrirePourcentage extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.versionQcmDisponible = true
  }

  nouvelleVersion() {
    switch (this.quotaChoice('typeDeQuestions', ['a', 'b', 'c'])) {
      case 'a':
        {
          const a = randint(10, 99) / 100
          this.question = this.versionQcm
            ? `$${texNombre(a)}$ est égal à : `
            : `Compléter.<br> $${texNombre(a)}=$`
          if (this.interactif) {
            this.optionsChampTexte = { texteApres: ' $\\%$' }
          } else {
            this.question += this.versionQcm
              ? ``
              : `${sp(1)} $\\ldots\\ldots\\ldots${sp(1)}\\%$`
          }
          this.correction = `$${texNombre(a)}=\\dfrac{${texNombre(a * 100, 0)}}{100}=${miseEnEvidence(`${texNombre(a * 100)}${sp()}\\%`)}$`
          this.reponse = this.versionQcm
            ? `$${(a * 100).toFixed(0)}\\,\\%$`
            : (a * 100).toFixed(0)
          this.canEnonce = 'Compléter.'
          this.canReponseACompleter = `$${texNombre(a)}=\\ldots ${sp()}\\%$`
          this.distracteurs = [
            `$${texNombre(a)}\\,\\%$`, // Erreur : oubli de multiplier par 100
            `$${texNombre(a * 10)}\\,\\%$`, // Erreur : multiplication par 10 au lieu de 100
            `$${texNombre(a * 1000)}\\,\\%$`, // Erreur : multiplication par 1000 au lieu de 100
          ]
        }
        break
      case 'b':
        {
          const a = randint(1, 99)
          const dec = new Decimal(a).div(1000)
          const pourc = new Decimal(a).div(10)
          this.question = this.versionQcm
            ? `$${texNombre(dec, 3)}$ est égal à : `
            : `Compléter.<br> $${texNombre(dec, 3)}=$`
          if (this.interactif) {
            this.optionsChampTexte = { texteApres: ' $\\%$' }
          } else {
            this.question += this.versionQcm
              ? ``
              : `${sp(1)} $\\ldots\\ldots\\ldots${sp(1)}\\%$`
          }
          this.correction = `$${texNombre(dec, 3)}=\\dfrac{${texNombre(pourc, 2)}}{100}=${miseEnEvidence(`${texNombre(pourc, 2)}${sp()}\\%`)}$`
          this.reponse = this.versionQcm ? `$${texNombre(pourc)}\\,\\%$` : pourc
          this.canEnonce = 'Compléter.'
          this.canReponseACompleter = `$${texNombre(dec, 3)}=\\ldots ${sp()}\\%$`
          this.distracteurs = [
            `$${texNombre(dec, 3)}\\,\\%$`, // Erreur : oubli de multiplier par 100
            `$${texNombre(a)}\\,\\%$`, // Erreur : multiplication par 100 au lieu de 10
            `$${texNombre(new Decimal(a).div(100), 2)}\\,\\%$`, // Erreur : division par 100 au lieu de multiplication
          ]
        }
        break

      case 'c':
        {
          const a = randint(1, 99)
          const dec = new Decimal(a).div(10000)
          const pourc = new Decimal(a).div(100)
          this.question = this.versionQcm
            ? `$${texNombre(dec, 4)}$ est égal à : `
            : `Compléter.<br> $${texNombre(dec, 4)}=$`
          if (this.interactif) {
            this.optionsChampTexte = { texteApres: ' $\\%$' }
          } else {
            this.question += this.versionQcm
              ? ``
              : `${sp(1)} $\\ldots\\ldots\\ldots${sp(1)}\\%$`
          }
          this.correction = `$${texNombre(dec, 4)}=\\dfrac{${texNombre(pourc, 3)}}{100}=${miseEnEvidence(`${texNombre(pourc, 3)}${sp()}\\%`)}$`
          this.reponse = this.versionQcm ? `$${texNombre(pourc)}\\,\\%$` : pourc
          this.canEnonce = 'Compléter.'
          this.canReponseACompleter = `$${texNombre(dec, 4)}=\\ldots ${sp()}\\%$`
          this.distracteurs = [
            `$${texNombre(dec, 4)}\\,\\%$`, // Erreur : oubli de multiplier par 100
            `$${texNombre(new Decimal(a).div(10), 2)}\\,\\%$`, // Erreur : multiplication par 1000 au lieu de 100
            `$${texNombre(a)}\\,\\%$`, // Erreur : multiplication par 10000 au lieu de 100
          ]
        }
        break
    }
  }
}
