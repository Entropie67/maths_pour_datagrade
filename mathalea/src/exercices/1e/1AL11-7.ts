import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre = "Calculer la somme des termes d'une suite arithmétique"
export const interactifReady = true

export const dateDePublication = '30/11/2021'

/**
 * Calculer \sum_{k=0}^n u_k, avec n et (u_n) (suite arithmétique) données
 * @author Rémi Angot
 */
export const dateDeModifImportante = '29/09/2026'

export const uuid = 'fccff'

export const refs = {
  'fr-fr': ['1AL11-7', 'BP1AA06'],
  'fr-ch': [],
}
export default class SommeSuiteArithmetique extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 2
    this.spacingCorr = 2
    this.consigneCorrection =
      'Rappel : $1 + 2 + 3 + \\ldots + n = \\dfrac{n(n + 1)}{2}$.'
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '<br>$S=$' }
    this.besoinFormulaireTexte = [
      'Premier indice',
      '1 : Le premier indice est 0\n2 : Le premier indice est 1\n3 : Le premier indice est supérieur à 1',
    ]
    this.sup = '1'
  }

  nouvelleVersion() {
    const typePremierIndice = Number(
      gestionnaireFormulaireTexte({
        saisie: this.sup,
        max: 3,
        defaut: 1,
        nbQuestions: 1,
        melange: 0,
      })[0],
    )
    const u0 = randint(1, 10)
    const u1 = u0
    const r = randint(3, 10)
    const n = randint(2, 4) * 10
    const u = choice(['u', 'v', 'w'])

    if (typePremierIndice === 2) {
      this.question = `Soit $(${u}_n)$ la suite arithmétique de premier terme $${u}_1 = ${u1}$ et de raison $${r}$.`
      this.question += `<br>Calculer $\\displaystyle S = ${u}_1 + ${u}_2 + \\ldots + ${u}_{${n}} =\\sum_{k=1}^{k=${n}}${u}_k$.`
      this.reponse = (n * (u1 + u1 + (n - 1) * r)) / 2
      this.correction = `$S = ${u1} + (${u1} + ${r}) + (${u1} + 2\\times${r}) + \\ldots + (${u1} + ${n - 1} \\times ${r})$`
      this.correction += `<br>$\\phantom{S} = (\\underbrace{${u1} + ${u1} + \\ldots + ${u1}}_{${n}\\times ${u1}}) + ${r} \\times (1 + 2 + \\ldots + ${n - 1})$`
      this.correction += `<br>$\\phantom{S} = ${n} \\times ${u1} + ${r} \\times \\dfrac{${n - 1}\\times${n}}{2}$`
      this.correction += `<br>$\\phantom{S} = ${miseEnEvidence(texNombre(this.reponse))}$`
      this.correction += '<br><br>'
      this.correction += `${texteGras('Deuxième méthode')} : <br>on utilise la formule $S = \\text{nombre de termes} \\times \\dfrac{\\text{premier terme} + \\text{dernier terme}}{2}$.`
      this.correction += `<br>$S =  ${n} \\times \\dfrac{${u}_1 + ${u}_{${n}}}{2}$`
      this.correction += `<br>$\\phantom{S} = ${n} \\times \\dfrac{${u1} + (${u1} + (${n} - 1) \\times ${r})}{2}$`
      this.correction += `<br>$\\phantom{S} = ${n} \\times \\dfrac{${u1} + ${u1 + (n - 1) * r}}{2}$`
      this.correction += `<br>$\\phantom{S} = ${miseEnEvidence(texNombre(this.reponse))}$`
    } else if (typePremierIndice === 1) {
      this.question = `Soit $(${u}_n)$ la suite arithmétique de premier terme $${u}_0 = ${u0}$ et de raison $${r}$.`
      this.question += `<br>Calculer $\\displaystyle S = ${u}_0 + ${u}_1 + \\ldots + ${u}_{${n}} =\\sum_{k=0}^{k=${n}}${u}_k$.`
      this.reponse = ((n + 1) * (u0 + u0 + n * r)) / 2
      this.correction = `$S = ${u0} + (${u0} + ${r}) + (${u0} + 2\\times${r}) + \\ldots + (${u0} + ${n} \\times ${r})$`
      this.correction += `<br>$\\phantom{S} = (\\underbrace{${u0} + ${u0} + \\ldots + ${u0}}_{${n + 1}\\times ${u0}}) + ${r} \\times (1 + 2 + \\ldots + ${n})$`
      this.correction += `<br>$\\phantom{S} = ${n + 1} \\times ${u0} + ${r} \\times \\dfrac{${n}\\times${n + 1}}{2}$`
      this.correction += `<br>$\\phantom{S} = ${miseEnEvidence(texNombre(this.reponse))}$`
      this.correction += '<br><br>'
      this.correction += `${texteGras('Deuxième méthode')} : <br>on utilise la formule $S = \\text{nombre de termes} \\times \\dfrac{\\text{premier terme} + \\text{dernier terme}}{2}$.`
      this.correction += `<br>$S =  ${n + 1} \\times \\dfrac{${u}_0 + ${u}_{${n}}}{2}$`
      this.correction += `<br>$\\phantom{S} = ${n + 1} \\times \\dfrac{${u0} + (${u0} + ${n} \\times ${r})}{2}$`
      this.correction += `<br>$\\phantom{S} = ${n + 1} \\times \\dfrac{${u0} + ${u0 + n * r}}{2}$`
      this.correction += `<br>$\\phantom{S} = ${miseEnEvidence(texNombre(this.reponse))}$`
    } else {
      const premierIndice = randint(5, 50)
      const dernierIndice = premierIndice + n - 1
      this.question = `Soit $(${u}_n)$ la suite arithmétique de premier terme $${u}_{${premierIndice}} = ${u0}$ et de raison $${r}$.`
      this.question += `<br>Calculer $\\displaystyle S = ${u}_{${premierIndice}} + ${u}_{${premierIndice + 1}} + \\ldots + ${u}_{${dernierIndice}} =\\sum_{k=${premierIndice}}^{k=${dernierIndice}}${u}_k$.`
      this.reponse = (n * (2 * u0 + (n - 1) * r)) / 2
      this.correction = `$S = ${u0} + (${u0} + ${r}) + (${u0} + 2\\times${r}) + \\ldots + (${u0} + ${n - 1}\\times${r})$`
      this.correction += `<br>$\\phantom{S} = ${n}\\times${u0} + ${r}\\times(1 + 2 + \\ldots + ${n - 1})$`
      this.correction += `<br>$\\phantom{S} = ${n}\\times${u0} + ${r}\\times\\dfrac{${n - 1}\\times${n}}{2}$`
      this.correction += `<br>$\\phantom{S} = ${miseEnEvidence(texNombre(this.reponse))}$`
      this.correction += '<br><br>'
      this.correction += `${texteGras('Deuxième méthode')} : <br>on utilise la formule $S = \\text{nombre de termes} \\times \\dfrac{\\text{premier terme} + \\text{dernier terme}}{2}$.`
      this.correction += `<br>$S = ${n}\\times\\dfrac{${u}_{${premierIndice}} + ${u}_{${dernierIndice}}}{2}$`
      this.correction += `<br>$\\phantom{S} = ${n}\\times\\dfrac{${u0} + (${u0} + (${n} - 1)\\times${r})}{2}$`
      this.correction += `<br>$\\phantom{S} = ${n}\\times\\dfrac{${u0} + ${u0 + (n - 1) * r}}{2}$`
      this.correction += `<br>$\\phantom{S} = ${miseEnEvidence(texNombre(this.reponse))}$`
    }
  }
}
