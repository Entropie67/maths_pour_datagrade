import { orangeMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import operation from '../../../modules/operations'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const dateDePublication = '16/09/2026'
export const amcReady = false
export const interactifReady = true

export const titre =
  'Poser et effectuer une multiplication ou une division de nombres entiers relatifs'

/**
 * Les exercices existants sur les relatifs multiplient des chiffres de 2 à 9 :
 * ce sont les tables avec un signe devant. Ici les nombres sont assez grands
 * pour que l'opération doive être posée.
 *
 * On part du RÉSULTAT (deux ou trois chiffres, avec ou sans zéro au milieu)
 * et d'un facteur à deux chiffres, puis on multiplie. Pour la division, le
 * dividende est ce produit : la division tombe donc toujours juste, et le
 * quotient ne se devine pas.
 *
 * Le signe se décide par la règle des signes, la potence ne traite que les
 * valeurs absolues : c'est l'ordre dans lequel on apprend à faire.
 *
 * @author Nathan Scheinmann
 */
export const uuid = 'k9r3w'

export const refs = {
  'fr-fr': [''],
  'fr-ch': ['10LCNO2C-9', '10LSNO2C-9', '11CTNO1B-9'],
}

export default class ProduitQuotientRelatifsPoses extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Choix des opérations',
      'Nombres séparés par des tirets :\n1 : Multiplication\n2 : Division\n3 : Mélange',
    ]
    this.sup = 3
    this.besoinFormulaire2Texte = [
      'Choix des résultats',
      'Nombres séparés par des tirets :\n1 : Sans zéro à descendre\n2 : Avec un zéro à descendre\n3 : Mélange',
    ]
    this.sup2 = 3
    this.nbQuestions = 4
    this.spacing = 2
    this.spacingCorr = context.isHtml ? 2 : 1 // Sinon la potence n'est pas jolie.
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Poser et effectuer le calcul suivant.'
        : 'Poser et effectuer les calculs suivants.'

    const listeOperations = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      defaut: 3,
      melange: 3,
      nbQuestions: this.nbQuestions,
    })
    const listeResultats = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 2,
      defaut: 3,
      melange: 3,
      nbQuestions: this.nbQuestions,
    })

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 60;) {
      cpt++
      const division = Number(listeOperations[i]) === 2
      const avecZero = Number(listeResultats[i]) === 2

      // Le résultat, en valeur absolue : trois chiffres, le zéro éventuel au
      // milieu. C'est lui qu'on obtient au bout de la potence.
      const a = randint(1, 9)
      const b = avecZero ? 0 : randint(1, 9)
      const c = randint(1, 9)
      const resultatAbs = a * 100 + b * 10 + c

      // L'autre facteur : deux chiffres, ni multiple de 10, ni 11, 22, …
      let facteurAbs = randint(12, 99)
      while (facteurAbs % 10 === 0 || facteurAbs % 11 === 0) {
        facteurAbs = randint(12, 99)
      }

      // Les signes : au moins un négatif, sinon ce n'est plus un exercice sur
      // les relatifs. Le signe du résultat suit la règle des signes.
      const signeResultat = randint(0, 1) === 0 ? -1 : 1
      const signeFacteur = randint(0, 1) === 0 ? -1 : 1
      if (signeResultat === 1 && signeFacteur === 1) continue

      const resultat = signeResultat * resultatAbs
      const facteur = signeFacteur * facteurAbs
      const produit = resultat * facteur

      let texte: string
      let texteCorr: string
      let reponse: number
      if (division) {
        // produit ÷ facteur = résultat
        reponse = resultat
        texte = `$${texNombre(produit)}\\div${ecritureParentheseSiNegatif(facteur)}`
        texteCorr = `Le dividende et le diviseur sont de signes ${produit * facteur < 0 ? 'contraires, le quotient est donc négatif' : 'identiques, le quotient est donc positif'}. On pose la division des valeurs absolues.`
        texteCorr += operation({
          operande1: Math.abs(produit),
          operande2: facteurAbs,
          type: 'division',
          precision: 0,
          options: { solution: true, colore: orangeMathalea },
        })
        texteCorr += `<br>$${texNombre(produit)}\\div${ecritureParentheseSiNegatif(facteur)}=${miseEnEvidence(texNombre(resultat))}$.`
      } else {
        // résultat × facteur = produit, présenté avec le résultat en premier
        reponse = produit
        texte = `$${texNombre(resultat)}\\times${ecritureParentheseSiNegatif(facteur)}`
        texteCorr = `Les deux facteurs sont de signes ${resultat * facteur < 0 ? 'contraires, le produit est donc négatif' : 'identiques, le produit est donc positif'}. On pose la multiplication des valeurs absolues.`
        texteCorr += operation({
          operande1: resultatAbs,
          operande2: facteurAbs,
          type: 'multiplication',
          options: { solution: true, colore: orangeMathalea },
        })
        texteCorr += `<br>$${texNombre(resultat)}\\times${ecritureParentheseSiNegatif(facteur)}=${miseEnEvidence(texNombre(produit))}$.`
      }
      texte +=
        (this.interactif ? '=$' : '$') +
        (context.isHtml && this.interactif
          ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase)
          : '')

      handleAnswers(this, i, { reponse: { value: reponse } })

      if (this.questionJamaisPosee(i, resultat, facteur, division ? 1 : 0)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
