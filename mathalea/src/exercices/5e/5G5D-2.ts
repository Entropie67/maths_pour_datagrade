import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { miseEnEvidence } from '../../lib/outils/embellissements'

export const titre =
  "Calculer l'aire de carrés, rectangles, triangles et disques (calcul mental)"
export const interactifReady = true

export const dateDePublication = '13/12/2024'
export const dateDeModifImportante = '25/09/2026'

export const uuid = '9e8f9'
export const refs = {
  'fr-fr': ['5G5D-2', 'BP2AutoV8', '3AutoM06-1', 'BP1AUTO102'],
  'fr-2016': ['6M25-2', '5M11-6', 'BP2AutoV8', '3AutoG09-1'],
  'fr-ch': ['10CTGM1C-1', '10LCGM1C-1', '10LSGM1C-1', 'PRQMG01C-10'],
}
/**
 * Les longueurs sont choisies de telle sorte que le calcul mental soit possible.
 * @author Rémi Angot
 */
export default class AiresCalculMental extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    this.spacingCorr = 2
    this.besoinFormulaireTexte = [
      'Type de figures',
      [
        'Nombres séparés par des tirets  :',
        '1 : Carré',
        '2 : Rectangle',
        '3 : Triangle',
        '4 : Disque avec rayon',
        '5 : Disque avec diamètre',
        '6 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2CaseACocher = [
      'Uniquement des petits nombres entiers',
      false,
    ]
    this.sup = 6
    this.sup2 = false

    // this.besoinFormulaireCaseACocher = ['Tracer les figures', false]
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? "Calculer l'aire exacte de la figure suivante."
        : "Calculer l'aire exacte des figures suivantes."

    const listeTypeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      listeOfCase: [
        'carré',
        'rectangle',
        'triangle',
        'disqueRayon',
        'disqueDiametre',
      ],
      min: 1,
      max: 5,
      melange: 6,
      defaut: 6,
    }).map(String)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let texteInteractif = ''
      switch (listeTypeQuestions[i]) {
        case 'carré':
          {
            const c = randint(2, 10)
            texte = `Carré de côté $${texNombre(c)}\\text{ cm}$`
            texteCorr = '$\\mathcal{A}_\\text{carré} = c \\times c$'
            texteCorr += `<br>$\\mathcal{A}_\\text{carré} = ${texNombre(c)}\\text{ cm}  \\times ${texNombre(c)}\\text{ cm}$`
            texteCorr += `<br>$\\mathcal{A}_\\text{carré} = ${miseEnEvidence(texNombre(c * c))}\\text{ cm}^2$`
            texteInteractif += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBase,
              {
                texteAvant: '$\\mathcal{A}_\\text{carré} =$',
                texteApres: '$\\text{ cm}^2$',
              },
            )
            handleAnswers(this, i, { reponse: { value: texNombre(c * c) } })
          }
          break
        case 'rectangle':
          {
            let l: number
            let L: number
            if (this.sup2) {
              l = randint(2, 6)
              L = randint(l + 1, 10)
            } else {
              l = randint(1, 3) + randint(2, 9) / 10
              L = randint(5, 9)
            }
            texte = `Rectangle de longueur $${texNombre(L)}\\text{ cm}$ et de largeur $${texNombre(l)}\\text{ cm}$`
            texteCorr = '$\\mathcal{A}_\\text{rectangle} = L \\times l$'
            texteCorr += `<br>$\\mathcal{A}_\\text{rectangle} = ${texNombre(L)}\\text{ cm} \\times ${texNombre(l)}\\text{ cm}$`
            texteCorr += `<br>$\\mathcal{A}_\\text{rectangle} = ${miseEnEvidence(texNombre(L * l))}\\text{ cm}^2$`
            texteInteractif += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBase,
              {
                texteAvant: '$\\mathcal{A}_\\text{rectangle} =$',
                texteApres: '$\\text{ cm}^2$',
              },
            )
            handleAnswers(this, i, { reponse: { value: texNombre(L * l) } })
          }
          break
        case 'triangle':
          {
            const b = randint(2, 9)
            // Avec l'option nombres entiers, le produit b × h doit être pair
            const h =
              this.sup2 && b % 2 === 1 ? 2 * randint(1, 4) : randint(2, 9)
            texte = `Triangle de base $${texNombre(b)}\\text{ cm}$ et de hauteur $${texNombre(h)}\\text{ cm}$`
            texteCorr =
              '$\\mathcal{A}_\\text{triangle} = (b \\times h) \\div 2$'
            texteCorr += `<br>$\\mathcal{A}_\\text{triangle} = (${texNombre(b)}\\text{ cm} \\times ${texNombre(h)}\\text{ cm}) \\div 2$`
            texteCorr += `<br>$\\mathcal{A}_\\text{triangle} = ${texNombre(b * h)}\\text{ cm}^2 \\div 2$`
            texteCorr += `<br>$\\mathcal{A}_\\text{triangle} = ${miseEnEvidence(texNombre((b * h) / 2))}\\text{ cm}^2$`
            texteInteractif += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBase,
              {
                texteAvant: '$\\mathcal{A}_\\text{triangle} =$',
                texteApres: '$\\text{ cm}^2$',
              },
            )
            handleAnswers(this, i, {
              reponse: { value: texNombre((b * h) / 2) },
            })
          }
          break
        case 'disqueRayon':
          {
            const r = randint(2, 9)
            texte = `Disque de rayon $${texNombre(r)}\\text{ cm}$`
            texteCorr =
              '$\\mathcal{A}_\\text{disque} = r \\times r \\times \\pi$'
            texteCorr += `<br>$\\mathcal{A}_\\text{disque} = ${texNombre(r)}\\text{ cm} \\times ${texNombre(r)}\\text{ cm} \\times \\pi$`
            texteCorr += `<br>$\\mathcal{A}_\\text{disque} = ${miseEnEvidence(`${texNombre(r * r)}\\pi`)}\\text{ cm}^2$`
            texteInteractif += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBase,
              {
                texteAvant: '$\\mathcal{A}_\\text{disque} =$',
                texteApres: '$\\text{ cm}^2$',
              },
            )
            handleAnswers(this, i, {
              reponse: {
                value: `${r * r}\\pi`,
                options: { exclusifFactorisation: true },
              },
            })
          }
          break
        case 'disqueDiametre': {
          const r = randint(2, 9)
          texte = `Disque de diamètre $${texNombre(2 * r)}\\text{ cm}$`
          texteCorr = '$\\mathcal{A}_\\text{disque} = r \\times r \\times \\pi$'
          texteCorr += `<br>$\\mathcal{A}_\\text{disque} = ${texNombre(r)}\\text{ cm} \\times ${texNombre(r)}\\text{ cm} \\times \\pi $`
          texteCorr += `<br>$\\mathcal{A}_\\text{disque} = ${miseEnEvidence(`${texNombre(r * r)}\\pi`)}\\text{ cm}^2$`
          texteInteractif += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBase,
            {
              texteAvant: '$\\mathcal{A}_\\text{disque} =$',
              texteApres: '$\\text{ cm}^2$',
            },
          )
          handleAnswers(this, i, {
            reponse: {
              value: `${r * r}\\pi`,
              options: { exclusifFactorisation: true },
            },
          })
        }
      }
      if (this.questionJamaisPosee(i, texte)) {
        if (this.interactif) {
          texte += '.<br>' + texteInteractif
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
