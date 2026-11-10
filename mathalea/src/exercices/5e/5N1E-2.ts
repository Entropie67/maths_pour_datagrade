import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Écrire un nombre sous différentes formes'

export const dateDePublication = '03/11/2024'
export const dateDeModifImportante = '02/11/2026'
export const uuid = 'aa1bd'
export const interactifReady = true

export const refs = {
  'fr-fr': ['5N1E-2'],
  'fr-2016': ['5C11-4'],
  'fr-ch': ['9R1NO8A-7', '9R2NO8A-7', '9R3NO8A-7', 'PRQST02A-8'],
}

/**
 * Travail sur le sens de l'égalité
 * @author Rémi Angot
 */
export default class EcrireNombreDifferentesFormes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 6

    this.comment =
      'Cet exercice permet de voir le symbole = autrement que la touche EXE de la calculatrice.'
    this.besoinFormulaireTexte = [
      'Types de questions',
      `Nombres séparés par des tirets
1 : Somme
2 : Différence
3 : Produit
4 : Double ou somme de deux nombres consécutifs
5 : Moitié
6 : Quart
7 : Mélange`,
    ]
    this.sup = '7'
  }

  nouvelleVersion() {
    const typeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 6,
      melange: 7,
      defaut: 7,
      listeOfCase: [
        'somme',
        'différence',
        'produit',
        'doubleOuSommeConsecutifs',
        'moitie',
        'quart',
      ],
      shuffle: true,
      nbQuestions:
        Number(this.sup) > 6
          ? 6
          : Math.min(6, String(this.sup).split('-').length),
    })
    const nbChoix = typeQuestionsDisponibles.length
    let a = 0
    let b = 0
    let n = 0
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      if (i % nbChoix === 0) {
        a = randint(2, 9)
        b = randint(2, 9)
        n = a * b
      }
      let texte = `Écrire le nombre $${n}$ `
      let texteCorr = ''
      let c = NaN
      switch (listeTypeQuestions[i]) {
        case 'produit':
          texte += 'sous la forme du produit de deux nombres.'
          handleAnswers(this, i, {
            reponse: {
              value: n.toString(),
              options: { multiplicationSeulementEtNonResultat: true },
            },
          })
          texteCorr = `Par exemple : $${n} = ${miseEnEvidence(`${a} \\times ${b}`)}$`
          break
        case 'somme':
          texte += 'sous la forme de la somme de deux nombres.'
          c = randint(2, Math.min(10, n - 1))
          texteCorr = `Par exemple : $${n} = ${miseEnEvidence(`${c} + ${n - c}`)}$`
          handleAnswers(this, i, {
            reponse: {
              value: n.toString(),
              options: { additionSeulementEtNonResultat: true },
            },
          })
          break
        case 'différence':
          texte += 'sous la forme de la différence de deux nombres.'
          handleAnswers(this, i, {
            reponse: {
              value: n.toString(),
              options: { soustractionSeulementEtNonResultat: true },
            },
          })
          c = randint(2, 10)
          texteCorr = `Par exemple : $${n} = ${miseEnEvidence(`${n + c} - ${c}`)}$`
          break
        case 'doubleOuSommeConsecutifs':
          if (n % 2 === 0) {
            texte += "sous la forme du double d'un nombre."
            texteCorr = `$${n} = ${miseEnEvidence(`2 \\times ${texNombre(n / 2)}`)}$`
            handleAnswers(this, i, {
              reponse: {
                value: `2 \\times ${texNombre(n / 2)}`,
                options: { expressionNumerique: true },
              },
            })
          } else {
            texte += 'sous la forme de la somme de deux nombres consécutifs.'
            handleAnswers(this, i, {
              reponse: {
                value: `${Math.floor(n / 2)} + ${Math.ceil(n / 2)}`,
                options: { expressionNumerique: true },
              },
            })

            texteCorr = `$${n} = ${miseEnEvidence(`${Math.floor(n / 2)} + ${Math.ceil(n / 2)}`)}$`
          }
          break
        case 'moitie':
          texte += "sous la forme de la moitié d'un nombre."
          handleAnswers(this, i, {
            reponse: { value: [`${n * 2} \\div 2`, `\\dfrac{${n * 2}}{2}`] },
          })
          texteCorr = `$${n} = ${miseEnEvidence(`\\dfrac{${2 * n}}{2}`)}$`
          break
        case 'quart':
          texte += "sous la forme du quart d'un nombre."
          handleAnswers(this, i, {
            reponse: { value: [`${n * 4} \\div 4`, `\\dfrac{${n * 4}}{4}`] },
          })
          texteCorr = `$${n} = ${miseEnEvidence(`\\dfrac{${4 * n}}{4}`)}$`
          break
      }
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierDeBaseAvecEgal,
        {
          texteAvant: `<br>$${n}=$`,
        },
      )
      if (this.questionJamaisPosee(i, listeTypeQuestions[i], n)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
