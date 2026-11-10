// Copie figée : dépendance d'un exercice archivé, gelée pour que ses
// tirages ne bougent plus. Ne plus la modifier : toute correction va
// dans la version courante du fichier d'origine.
// Gelée à la révision 02c15f53a pour 2N40-1.ts (dérive du 06/09/2026).
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { puissanceEnProduit } from '../../lib/outils/puissance'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Transformer une écriture de puissance en écriture décimale ou fractionnaire'

export const dateDePublication = '14/06/2022'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Rémi Angot
 */
export const uuid = 'a1e3a'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class PuissanceDecimaleOuFractionnaireOld extends Exercice {
  classe: 5 | 4 = 4
  constructor() {
    super()
    this.nbQuestions = 8
    this.nbCols = 2
    this.nbColsCorr = 2
    this.sup = false
    this.besoinFormulaireCaseACocher = ['Avec des nombres négatifs']
    this.besoinFormulaire2CaseACocher = [
      'Avec que des exposants positifs (incontournable pour AMC)',
    ]
  }

  nouvelleVersion() {
    this.consigne = `Calculer, de tête, l'écriture décimale ${this.classe === 4 ? 'ou fractionnaire' : ''} des nombres suivants.`
    const typeQuestionsDisponibles = [
      'puissancePos',
      'puissanceNeg',
      'negPuissancePaire',
      'negPuissanceImpaire',
      'negParenthesePuissancePaire',
      'negParenthesePuissanceImpaire',
      'puissance0',
      'puissance1',
      'negParenthesePuissancePaireNeg',
      'negParenthesePuissanceImpaireNeg',
    ] // On créé 3 types de questions
    let typesDeQuestions =
      this.sup2 || context.isAmc // Ici on ne prends que les exposants positifs pour ne pas influencer par le format de réponse AMC
        ? [
            'puissance0',
            'puissance1',
            'puissancePos',
            'puissancePos',
            'puissancePos',
            'puissancePos',
          ]
        : this.sup
          ? typeQuestionsDisponibles
          : [
              'puissance0',
              'puissance1',
              'puissancePos',
              'puissanceNeg',
              'puissancePos',
              'puissanceNeg',
              'puissancePos',
              'puissanceNeg',
              'puissancePos',
              'puissanceNeg',
            ]
    if (this.classe === 5) typesDeQuestions = ['puissancePos']
    const listeTypeQuestions = combinaisonListes(
      typesDeQuestions,
      this.nbQuestions,
    )
    let texte /** string */, texteCorr
    /** string */
    let a: number, n: number, reponse: FractionEtendue
    const alternance2Et3 = combinaisonListes([2, 3], this.nbQuestions)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      switch (listeTypeQuestions[i]) {
        case 'puissancePos':
          a = choice([2, 3, randint(4, 9)])
          n = a === 2 ? randint(2, 8) : a < 4 ? randint(2, 3) : 2
          if (this.classe === 5) {
            n = alternance2Et3[i]
            a = n === 2 ? randint(1, 10) : choice([1, 2, 3, 5, 10])
          }
          texte = `$${a}^{${n}} = $`
          texteCorr = `$${a}^{${n}} = ${puissanceEnProduit(a, n)} = ${a ** n}$`
          reponse = new FractionEtendue(a ** n, 1)
          break
        case 'puissanceNeg':
          a = choice([2, 3, randint(4, 9)])
          n = a === 2 ? randint(2, 8) : a < 4 ? randint(2, 3) : 2
          texte = `$${a}^{${-n}} = $`
          texteCorr = `$${a}^{${-n}} =  \\dfrac{1}{${a}^{${n}}} = ${puissanceEnProduit(a, -n)} = \\dfrac{1}{${a ** n}}$`
          reponse = new FractionEtendue(1, a ** n)
          break
        case 'negPuissancePaire':
          a = choice([2, 3, randint(4, 9)])
          n = a === 2 ? choice([2, 4, 6, 8]) : 2
          texte = `$${-a}^{${n}} = $`
          texteCorr = `$${-a}^{${n}} = - (${puissanceEnProduit(a, n)}) = - ${a ** n}$`
          reponse = new FractionEtendue(-(a ** n), 1)
          break
        case 'negPuissanceImpaire':
          a = 2
          n = choice([3, 5, 7])
          texte = `$${-a}^{${n}} = $`
          texteCorr = `$${-a}^{${n}} = -(${puissanceEnProduit(a, n)}) = - ${a ** n}$`
          reponse = new FractionEtendue(-(a ** n), 1)
          break
        case 'negParenthesePuissancePaire':
          a = choice([2, 3, randint(4, 9)])
          n = a === 2 ? choice([2, 4, 6, 8]) : 2
          texte = `$(${-a})^{${n}} = $`
          texteCorr = `$(${-a})^{${n}} = ${puissanceEnProduit(-a, n)} = ${a ** n}$`
          reponse = new FractionEtendue(a ** n, 1)
          break
        case 'negParenthesePuissanceImpaire':
          a = choice([2, 3, randint(4, 5)])
          n = a === 2 ? choice([3, 5, 7, 9]) : 3
          texte = `$(${-a})^{${n}} = $`
          texteCorr = `$(${-a})^{${n}} = ${puissanceEnProduit(-a, n)} = -${a ** n}$`
          reponse = new FractionEtendue(-(a ** n), 1)
          break
        case 'puissance0':
          a = randint(11, 40)
          if (this.sup) a *= choice([-1, 1])
          n = 0
          texte = `$${a}^{${n}} = $`
          if (a > 0) {
            texteCorr = `$${a}^{${n}} = 1$`
            reponse = new FractionEtendue(1, 1)
          } else {
            texteCorr = `$${a}^{${n}} = -1$`
            reponse = new FractionEtendue(-1, 1)
          }
          break
        case 'puissance1':
          a = randint(11, 40)
          if (this.sup) a *= choice([-1, 1])
          n = 1
          texte = `$${a}^{${n}} = $`
          texteCorr = `$${a}^{${n}} = ${a}$`
          reponse = new FractionEtendue(a, 1)
          break
        case 'negParenthesePuissancePaireNeg':
          a = choice([2, 3, randint(4, 9)])
          n = a === 2 ? choice([2, 4, 6, 8]) : 2
          texte = `$(${-a})^{${-n}} = $`
          texteCorr = `$(${-a})^{${-n}} = ${puissanceEnProduit(-a, -n)} = \\dfrac{1}{${a ** n}}$`
          reponse = new FractionEtendue(1, a ** n)
          break
        case 'negParenthesePuissanceImpaireNeg':
        default:
          a = choice([2, 3, randint(4, 5)])
          n = a === 2 ? choice([3, 5, 7, 9]) : 3
          texte = `$(${-a})^{${-n}} = $`
          texteCorr = `$(${-a})^{${-n}} = ${puissanceEnProduit(-a, -n)} = \\dfrac{-1}{${a ** n}}$`
          reponse = new FractionEtendue(-1, a ** n)
          break
      }
      handleAnswers(this, i, {
        reponse: {
          value: reponse,
          options: { fractionEgale: true },
        },
      })

      // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras

      const textCorrSplit = texteCorr.split('=')
      let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
      aRemplacer = aRemplacer.replace('$', '').replace('<br>', '')

      texteCorr = ''
      for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
        texteCorr += textCorrSplit[ee] + '='
      }
      texteCorr += `$ $${miseEnEvidence(aRemplacer)}$`

      // Fin de cette uniformisation

      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierDeBaseAvecFraction,
      )
      if (this.questionJamaisPosee(i, a, n, listeTypeQuestions[i])) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
