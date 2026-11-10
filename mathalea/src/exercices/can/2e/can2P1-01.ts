import { orangeMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { simplificationDeFractionAvecEtapes } from '../../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une probabilité'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021
 */
export const uuid = '763d3'

export const refs = {
  'fr-fr': ['can2P1-01', '2P10-flash1'],
  'fr-ch': [],
}
export default class CalculsDeProbabilites extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionIrreductible: true }
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 2, 4)
    const b = this.quotaChoice('b', [2, 3])
    const c = this.quotaChoice('c', [2, 3, 11, 12])
    const p = [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1]
    switch (
      this.quotaChoice('type', ['a', 'b', 'b', 'b', 'c', 'c', 'd', 'd', 'd'])
    ) {
      case 'a':
        this.question = `On lance deux fois de suite un dé équilibré.<br>
        
        Quelle est la probabilité d’obtenir deux fois le même nombre ?
        <br>
        Donner le résultat sous la forme d'une fraction irréductible.`
        this.correction = `Sur $36$ cas possibles équiprobables, il y en a $6$ qui sont des doubles. Donc la probabilité d'obtenir deux fois le même nombre est $\\dfrac{6}{36}=${miseEnEvidence(`\\dfrac{1}{6}`)}$.`
        this.reponse = new FractionEtendue(1, 6)
        break
      case 'b':
        this.question = `Si on lance une pièce $${a}$ fois de suite, quelle est la probabilité d'obtenir pile $${a}$ fois ?<br>Donner le résultat sous la forme d'une fraction irréductible.`
        this.correction = `À chaque lancer, la probabilité d'obtenir pile est $\\dfrac{1}{2}$, donc si on lance $${a}$ fois la pièce, la probabilité d'obtenir $${a}$ fois pile est $\\left(\\dfrac{1}{2}\\right)^${a}=${miseEnEvidence(`\\dfrac{1}{${2 ** a}}`)}$.`
        this.reponse = new FractionEtendue(1, 2 ** a)
        break
      case 'c':
        this.question = `On lance un dé cubique équilibré.<br>
        
        Quelle est la probabilité d’obtenir un multiple de $${b}$ ?<br>
        
        Donner le résultat sous la forme d'une fraction irréductible.`
        this.correction = `Comme il y a $${5 - b}$ multiples de $${b}$, la probabilité d'obtenir un multiple de $${b}$ est $\\dfrac{${5 - b}}{6}=${miseEnEvidence(`\\dfrac{1}{${b}}`)}$.`
        this.reponse = new FractionEtendue(1, 2 ** a)
        this.reponse = new FractionEtendue(1, b)
        break
      case 'd':
        this.question = `On lance deux dés cubiques équilibrés.<br>
        
        Quelle est la probabilité d’obtenir un total de $${c}$ ?<br>
        
        Donner le résultat sous la forme d'une fraction irréductible.`
        this.correction = `Sur $36$ cas possibles équiprobables, il y en a $${p[c - 2]}$ qui ${p[c - 2] === 1 ? 'donne' : 'donnent'} une somme de $${c}$. Donc la probabilité d'obtenir un total de $${c}$ est $${p[c - 2] === 1 ? `${miseEnEvidence(`\\dfrac{${p[c - 2]}}{36}`)}` : `\\dfrac{${p[c - 2]}}{36}`}${simplificationDeFractionAvecEtapes(p[c - 2], 36, { colorisationResultat: true, couleur2: orangeMathalea })}$.`
        this.reponse = new FractionEtendue(p[c - 2], 36)
        break
    }
    this.canEnonce = this.question // 'Compléter'
    this.canReponseACompleter = ''
  }
}
