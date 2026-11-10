import { texteGras } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre = "Calculer la somme des termes d'une suite géométrique"
export const interactifReady = true

export const dateDePublication = '28/12/2022'

/**
 * Calculer \sum_{k=0}^n u_k, avec n et (u_n) (suite géométrique) données
 * @author Rémi Angot
 */

export const refs = {
  'fr-fr': ['1AL11-8'],
  'fr-ch': [],
}

export const dateDeModifImportante = '29/09/2026'

export const uuid = '58ca0'
export default class SommeSuiteGeometrique extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 2
    this.spacingCorr = 3
    this.correctionDetaillee = true
    this.correctionDetailleeDisponible = true
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
    const premierTerme = randint(2, 10)
    const premierRang =
      typePremierIndice === 3 ? randint(5, 50) : typePremierIndice - 1
    const q = arrondi(randint(2, 19, 10) / 10, 1)
    const n = choice([10, 12, 15])
    const u = choice(['u', 'v', 'w'])
    const nombreDeTermes = premierRang === 0 ? n + 1 : n
    const besoinDArrondi =
      arrondi((premierTerme * (1 - q ** nombreDeTermes)) / (1 - q), 7) !==
      arrondi((premierTerme * (1 - q ** nombreDeTermes)) / (1 - q), 3)
    if (premierRang === 0) {
      this.question = `Soit $${u}$ la suite géométrique de premier terme $${u}_0 = ${premierTerme}$ et de raison $${texNombre(q)}$.`
      this.question += `<br>Calculer $\\displaystyle S = ${u}_0 + ${u}_1 + \\ldots + ${u}_{${n}} =\\sum_{k=0}^{${n}}${u}_k$`
      this.question += besoinDArrondi
        ? ' et donner un arrondi au millième près.'
        : '.'
      this.reponse = arrondi((premierTerme * (1 - q ** (n + 1))) / (1 - q), 3)
      if (this.correctionDetaillee) {
        this.consigneCorrection = `${texteGras('Rappel')} : $1 + q + q^2 + \\ldots + q^n = \\dfrac{1 - q^{n + 1}}{1 - q}$.`
        this.correction = `$S = \\underbrace{${premierTerme}}_{${u}_0} + (\\underbrace{${premierTerme} \\times ${texNombre(q)}}_{${u}_1}) + (\\underbrace{${premierTerme} \\times${texNombre(q)}^2}_{${u}_2}) + \\ldots + (\\underbrace{${premierTerme} \\times ${texNombre(q)}^{${n}}}_{${u}_{${n}}})$`
        this.correction += `<br>$S = ${premierTerme} \\times (1 + ${texNombre(q)} + ${texNombre(q)}^2 + \\ldots + ${texNombre(q)}^{${n}})$`
        this.correction += `<br>$S = ${premierTerme} \\times \\dfrac{1-${texNombre(q)}^{${n + 1}}}{1-${texNombre(q)}}$`
      } else {
        this.consigneCorrection = `${texteGras('Rappel')} : La somme $S$ de plusieurs termes consécutifs d'une suite géométrique de raison $q$ est telle que : `
        this.consigneCorrection +=
          '<br>$S=\\left(1^\\text{er}\\text{ terme}\\times \\dfrac{1-q^{\\text{nombre de termes}}}{1-q}\\right)$.'
        this.correction = `D'après la formule du cours : $S = ${premierTerme} \\times \\dfrac{1-${texNombre(q)}^{${n + 1}}}{1-${texNombre(q)}}$.`
      }
    } else if (premierRang === 1) {
      this.question = `Soit $${u}$ la suite géométrique de premier terme $${u}_1 = ${premierTerme}$ et de raison $${texNombre(q)}$.`
      this.question += `<br>Calculer $\\displaystyle S = ${u}_1 + ${u}_2 + \\ldots + ${u}_{${n}} =\\sum_{k=1}^{${n}}${u}_k$`
      this.question += besoinDArrondi
        ? ' et donner un arrondi au millième près.'
        : '.'
      this.reponse = arrondi((premierTerme * (1 - q ** n)) / (1 - q), 3)
      if (this.correctionDetaillee) {
        this.consigneCorrection = `${texteGras('Rappel')} : $1 + q + q^2 + \\ldots + q^n = \\dfrac{1 - q^{n + 1}}{1 - q}$.`
        this.correction = `$S = \\underbrace{${premierTerme}}_{${u}_1} + (\\underbrace{${premierTerme} \\times ${texNombre(q)}}_{${u}_2}) + (\\underbrace{${premierTerme} \\times${texNombre(q)}^2}_{${u}_3}) + \\ldots + (\\underbrace{${premierTerme} \\times ${texNombre(q)}^{${n - 1}}}_{${u}_{${n}}})$`
        this.correction += `<br>$S = ${premierTerme} \\times (1 + ${texNombre(q)} + ${texNombre(q)}^2 + \\ldots + ${texNombre(q)}^{${n - 1}})$`
        this.correction += `<br>$S = ${premierTerme} \\times \\dfrac{1-${texNombre(q)}^{${n}}}{1-${texNombre(q)}}$`
      } else {
        this.consigneCorrection = `${texteGras('Rappel')} : La somme $S$ de plusieurs termes consécutifs d'une suite géométrique de raison $q$ est telle que : `
        this.consigneCorrection +=
          '<br>$S=\\left(1^\\text{er}\\text{ terme}\\times \\dfrac{1-q^{\\text{nombre de termes}}}{1-q}\\right)$.'
        this.correction = `D'après la formule du cours : $S = ${premierTerme} \\times \\dfrac{1-${texNombre(q)}^{${n}}}{1-${texNombre(q)}}$.`
      }
    } else {
      const dernierRang = premierRang + nombreDeTermes - 1
      this.question = `Soit $${u}$ la suite géométrique de premier terme $${u}_{${premierRang}} = ${premierTerme}$ et de raison $${texNombre(q)}$.`
      this.question += `<br>Calculer $\\displaystyle S = ${u}_{${premierRang}} + ${u}_{${premierRang + 1}} + \\ldots + ${u}_{${dernierRang}} =\\sum_{k=${premierRang}}^{${dernierRang}}${u}_k$`
      this.question += besoinDArrondi
        ? ' et donner un arrondi au millième près.'
        : '.'
      this.reponse = arrondi(
        (premierTerme * (1 - q ** nombreDeTermes)) / (1 - q),
        3,
      )
      if (this.correctionDetaillee) {
        this.consigneCorrection = `${texteGras('Rappel')} : $1 + q + q^2 + \\ldots + q^n = \\dfrac{1 - q^{n + 1}}{1 - q}$.`
        this.correction = `$S = \\underbrace{${premierTerme}}_{${u}_{${premierRang}}} + (\\underbrace{${premierTerme} \\times ${texNombre(q)}}_{${u}_{${premierRang + 1}}}) + \\ldots + (\\underbrace{${premierTerme} \\times ${texNombre(q)}^{${nombreDeTermes - 1}}}_{${u}_{${dernierRang}}})$`
        this.correction += `<br>$S = ${premierTerme} \\times (1 + ${texNombre(q)} + \\ldots + ${texNombre(q)}^{${nombreDeTermes - 1}})$`
        this.correction += `<br>$S = ${premierTerme} \\times \\dfrac{1-${texNombre(q)}^{${nombreDeTermes}}}{1-${texNombre(q)}}$`
      } else {
        this.consigneCorrection = `${texteGras('Rappel')} : La somme $S$ de plusieurs termes consécutifs d'une suite géométrique de raison $q$ est telle que : `
        this.consigneCorrection +=
          '<br>$S=\\left(1^\\text{er}\\text{ terme}\\times \\dfrac{1-q^{\\text{nombre de termes}}}{1-q}\\right)$.'
        this.correction = `D'après la formule du cours : $S = ${premierTerme} \\times \\dfrac{1-${texNombre(q)}^{${nombreDeTermes}}}{1-${texNombre(q)}}$.`
      }
    }
    this.correction += `<br>$S ${besoinDArrondi ? '\\approx' : '='} ${miseEnEvidence(texNombre(this.reponse))}$`
  }
}
