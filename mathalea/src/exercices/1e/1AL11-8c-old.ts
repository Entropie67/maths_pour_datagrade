// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 974a9 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { texteGras } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre = "Calculer la somme des termes d'une suite géométrique"
export const interactifReady = true

export const dateDePublication = '28/12/2022'

/**
 * Calculer \sum_{k=0}^n u_k, avec n et (u_n) (suite géométrique) données
 * @author Rémi Angot
 */

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

export const uuid = '974a9'
export default class SommeSuiteGeometriqueOld extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 2
    this.spacingCorr = 3
    this.correctionDetaillee = true
    this.correctionDetailleeDisponible = true
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '<br>$S=$' }
    this.besoinFormulaireCaseACocher = ['Le premier indice est toujours 1']
    this.sup = false
  }

  nouvelleVersion() {
    const premierTerme = randint(2, 10)
    const premierRang = this.sup ? 1 : 0
    const q = arrondi(randint(2, 19, 10) / 10, 1)
    const n = choice([10, 12, 15])
    const u = choice(['u', 'v', 'w'])
    const besoinDArrondi =
      arrondi((premierTerme * (1 - q ** (n + 1))) / (1 - q), 7) !==
      arrondi((premierTerme * (1 - q ** (n + 1))) / (1 - q), 3)
    if (premierRang === 0) {
      this.question = `Soit $${u}$ la suite géométrique de premier terme $${u}_0 = ${premierTerme}$ et de raison $${texNombre(q)}$.`
      this.question += `<br>Calculer $\\displaystyle S = ${u}_0 + ${u}_1 + ... + ${u}_{${n}} =\\sum_{k=0}^{${n}}${u}_k$`
      this.question += besoinDArrondi
        ? ' et donner un arrondi au millième près.'
        : '.'
      this.reponse = arrondi((premierTerme * (1 - q ** (n + 1))) / (1 - q), 3)
      if (this.correctionDetaillee) {
        this.consigneCorrection = `${texteGras('Rappel')} : $1 + q + q^2 + ... + q^n = \\dfrac{1 - q^{n + 1}}{1 - q}$.`
        this.correction = `$S = \\underbrace{${premierTerme}}_{${u}_0} + (\\underbrace{${premierTerme} \\times ${texNombre(q)}}_{${u}_1}) + (\\underbrace{${premierTerme} \\times${texNombre(q)}^2}_{${u}_2}) + ... + (\\underbrace{${premierTerme} \\times ${texNombre(q)}^{${n}}}_{${u}_{${n}}})$`
        this.correction += `<br>$S = ${premierTerme} \\times (1 + ${texNombre(q)} + ${texNombre(q)}^2 + ... + ${texNombre(q)}^{${n}})$`
        this.correction += `<br>$S = ${premierTerme} \\times \\dfrac{1-${texNombre(q)}^{${n + 1}}}{1-${texNombre(q)}}$`
      } else {
        this.consigneCorrection = `${texteGras('Rappel')} : La somme $S$ de plusieurs termes consécutifs d'une suite géométrique de raison $q$ est telle que : `
        this.consigneCorrection +=
          '<br>$S=\\left(1^\\text{er}\\text{ terme}\\times \\dfrac{1-q^{\\text{nombre de termes}}}{1-q}\\right)$.'
        this.correction = `D'après la formule du cours : $S = ${premierTerme} \\times \\dfrac{1-${texNombre(q)}^{${n + 1}}}{1-${texNombre(q)}}$.`
      }
    } else {
      this.question = `Soit $${u}$ la suite géométrique de premier terme $${u}_1 = ${premierTerme}$ et de raison $${texNombre(q)}$.`
      this.question += `<br>Calculer $\\displaystyle S = ${u}_1 + ${u}_2 + ... + ${u}_{${n}} =\\sum_{k=1}^{${n}}${u}_k$`
      this.question += besoinDArrondi
        ? ' et donner un arrondi au millième près.'
        : '.'
      this.reponse = arrondi((premierTerme * (1 - q ** n)) / (1 - q), 3)
      if (this.correctionDetaillee) {
        this.consigneCorrection = `${texteGras('Rappel')} : $1 + q + q^2 + ... + q^n = \\dfrac{1 - q^{n + 1}}{1 - q}$.`
        this.correction = `$S = \\underbrace{${premierTerme}}_{${u}_1} + (\\underbrace{${premierTerme} \\times ${texNombre(q)}}_{${u}_2}) + (\\underbrace{${premierTerme} \\times${texNombre(q)}^2}_{${u}_3}) + ... + (\\underbrace{${premierTerme} \\times ${texNombre(q)}^{${n - 1}}}_{${u}_{${n}}})$`
        this.correction += `<br>$S = ${premierTerme} \\times (1 + ${texNombre(q)} + ${texNombre(q)}^2 + ... + ${texNombre(q)}^{${n - 1}})$`
        this.correction += `<br>$S = ${premierTerme} \\times \\dfrac{1-${texNombre(q)}^{${n}}}{1-${texNombre(q)}}$`
      } else {
        this.consigneCorrection = `${texteGras('Rappel')} : La somme $S$ de plusieurs termes consécutifs d'une suite géométrique de raison $q$ est telle que : `
        this.consigneCorrection +=
          '<br>$S=\\left(1^\\text{er}\\text{ terme}\\times \\dfrac{1-q^{\\text{nombre de termes}}}{1-q}\\right)$.'
        this.correction = `D'après la formule du cours : $S = ${premierTerme} \\times \\dfrac{1-${texNombre(q)}^{${n}}}{1-${texNombre(q)}}$.`
      }
    }
    this.correction += `<br>$S ${besoinDArrondi ? '\\approx' : '='} ${miseEnEvidence(texNombre(this.reponse))}$`
  }
}
