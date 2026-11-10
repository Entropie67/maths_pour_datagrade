import { orangeMathalea } from 'apigeom/src/elements/defaultValues'
import Decimal from 'decimal.js'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha, sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import operation from '../../modules/operations'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Effectuer produit et somme ou différence de décimaux'

export const interactifReady = true

export const dateDeModifImportante = '14/01/2026'
export const dateDePublication = '20/12/2022'

/**
 * Exercice pour pour tenter d'en remettre une couche sur :
 * on pose pas les additions de décimaux et les multiplications de décimaux de la même manière (dans le premier cas, il est impératif d'aligner les chiffres des unités les uns en dessous des autres, dans le deuxième on aligne les chiffres à droite indépendamment de la virgule)
 $ quand on a effectué une multiplication de deux nombres, on n'a pas besoin de poser à nouveau la multiplication si les chiffres significatifs des deux nombres sont les mêmes mais que seule la virgule n'est pas au même endroit.
 * @author Guillaume Valmont
 * idée originale de Mireille Gain
*/
export const uuid = 'c6836'

export const refs = {
  'fr-fr': [''],
  'fr-2016': [''],
  'fr-ch': [''],
}
export default class ProduitEtSommeOuDifferenceDeDecimauxOld extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.spacing = 2
    this.besoinFormulaireNumerique = [
      'Nombre de calculs par exercice',
      3,
      '1\n2\n3',
    ] // le paramètre sera numérique de valeur max 3 (le 3 en vert)
    this.sup = 3
    this.besoinFormulaire2CaseACocher = ['Mélanger additions et soustractions']
    this.sup2 = false
  }

  nouvelleVersion() {
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const A = new Decimal(
        choice([randint(10, 99), randint(100, 999)]) * 10 + randint(1, 9),
      )
      const B = new Decimal(
        choice([randint(1, 9), randint(10, 99)]) * 10 + randint(1, 9),
      )
      const diviseursPossibles = [10, 100, 1000]
      const operandes1 = [A]
      const operandes2 = [B]
      for (const diviseurPossible of diviseursPossibles) {
        operandes1.push(A.div(diviseurPossible))
        operandes2.push(B.div(diviseurPossible))
      }
      const couplesPossibles = []
      for (const operande1 of operandes1) {
        for (const operande2 of operandes2) {
          couplesPossibles.push({ A: operande1, B: operande2 })
        }
      }
      const couples = shuffle(couplesPossibles).slice(0, this.sup)
      texte = 'Calculer.'
      texteCorr =
        operation({
          operande1: A.toNumber(),
          operande2: B.toNumber(),
          type: 'multiplication',
          display: 'inline',
          options: { solution: true, colore: orangeMathalea },
        }) + '<br>'
      let indice = 0
      const afficherIndice = couples.length > 1

      for (const couple of couples) {
        if (afficherIndice) {
          texte += `<br>${numAlpha(indice)}`
          texteCorr += `<br>${numAlpha(indice)}<br>`
        } else {
          texte += `<br>`
          texteCorr += `<br>`
        }

        const addition = this.sup2 ? choice([true, false]) : true
        const operande1 =
          this.interactif && !addition
            ? Math.max(couple.A.toNumber(), couple.B.toNumber())
            : couple.A.toNumber()
        const operande2 =
          this.interactif && !addition
            ? Math.min(couple.A.toNumber(), couple.B.toNumber())
            : couple.B.toNumber()

        texte += `$${texNombre(operande1)} ${addition ? '+' : '-'} ${texNombre(operande2)}$ `
        texte += this.interactif
          ? ajouteChampTexteMathLive(
              this,
              2 * (i * this.sup + indice),
              KeyboardType.clavierNumbers,
              {
                texteAvant: ' =',
              },
            )
          : ``
        texte += ` ${sp(6)} et  ${sp(6)} $${texNombre(couple.A)} \\times ${texNombre(couple.B)}$`
        texte += this.interactif
          ? ajouteChampTexteMathLive(
              this,
              2 * (i * this.sup + indice) + 1,
              KeyboardType.clavierNumbers,
              {
                texteAvant: ' =',
                texteApres: '.',
              },
            )
          : `.`
        texteCorr += operation({
          operande1,
          operande2,
          type: addition ? 'addition' : 'soustraction',
          display: 'inline',
          methodeParCompensation: addition,
          options: { solution: true, colore: orangeMathalea },
        })
        handleAnswers(this, 2 * (i * this.sup + indice), {
          reponse: {
            value: addition ? operande1 + operande2 : operande1 - operande2,
          },
        })
        handleAnswers(this, 2 * (i * this.sup + indice) + 1, {
          reponse: { value: couple.B.mul(couple.A) },
        })

        texteCorr += `<br> Je sais que $${texNombre(A)}\\times${texNombre(B)}=${miseEnEvidence(texNombre(B.mul(A)), bleuMathalea)}$.`
        texteCorr += '<br>'
        texteCorr += `<br> J'en déduis que $${texNombre(couple.A)}\\times${texNombre(couple.B)}=${miseEnEvidence(texNombre(couple.B.mul(couple.A)))}$.`
        texteCorr += '<br>'
        indice++
      }
      // on retire le dernier <br>
      texteCorr = texteCorr.slice(0, texteCorr.length - 4)
      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
