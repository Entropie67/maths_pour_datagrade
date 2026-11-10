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
  'Calculer mentalement le périmètre de carrés, rectangles et cercles'
export const interactifReady = true

export const dateDePublication = '13/12/2024'
export const dateDeModifImportante = '03/04/2025'

export const uuid = 'e9252'
export const refs = {
  'fr-fr': ['6M1autoE-2', '3AutoM05-1'],
  'fr-2016': ['6M25-1'],
  'fr-ch': ['9R1GM1A-2', '9R2GM1A-2', '9R3GM1A-2', 'PRQMG01B-8'],
}
/**
 * Les longueurs sont choisies de telle sorte que le calcul mental soit possible.
 * @author Rémi Angot
 */
export default class PerimetresCalculMental extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.spacingCorr = 2
    this.besoinFormulaireTexte = [
      'Type de figures',
      [
        'Nombres séparés par des tirets  :',
        '1 : Carré',
        '2 : Rectangle',
        '3 : Cercle avec rayon',
        '4 : Cercle avec diamètre',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.sup = 5
    this.besoinFormulaire2CaseACocher = [
      'Périmètre du cercle calculé avec pi ≈ 3,14',
    ]
    this.sup2 = false
  }

  nouvelleVersion() {
    if (!this.sup2) {
      this.consigne =
        this.nbQuestions === 1
          ? 'Calculer le périmètre exact de la figure suivante.'
          : 'Calculer le périmètre exact des figures suivantes.'
    } else {
      this.consigne =
        this.nbQuestions === 1
          ? 'Calculer le périmètre de la figure suivante (On prendra $\\pi\\approx 3{,}14$ le cas échéant.).'
          : 'Calculer le périmètre des figures suivantes (On prendra $\\pi\\approx 3{,}14$ le cas échéant.).'
    }
    const listeTypeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      listeOfCase: ['carré', 'rectangle', 'cercleRayon', 'cercleDiametre'],
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
    }).map(String)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let texteInteractif = ''
      switch (listeTypeQuestions[i]) {
        case 'carré':
          {
            const c = randint(2, 11) + randint(2, 9) / 10
            texte = `Carré de côté $${texNombre(c)}\\text{ cm}$`
            texteCorr = '$\\mathcal{P}_\\text{carré} = 4 \\times c$'
            texteCorr += `<br>$\\mathcal{P}_\\text{carré} = 4 \\times ${texNombre(c)}\\text{ cm}$`
            texteCorr += `<br>$\\mathcal{P}_\\text{carré} = ${miseEnEvidence(texNombre(4 * c))}\\text{ cm}$`
            texteInteractif += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBase,
              {
                texteAvant: '$\\mathcal{P}_\\text{carré} =$',
                texteApres: '$\\text{ cm}$',
              },
            )
            handleAnswers(this, i, { reponse: { value: texNombre(4 * c) } })
          }
          break
        case 'rectangle':
          {
            const l = randint(1, 3) + randint(1, 4) / 10
            const L = randint(5, 9) + randint(1, 4) / 10
            texte = `Rectangle de longueur $${texNombre(L)}\\text{ cm}$ et de largeur $${texNombre(l)}\\text{ cm}$`
            texteCorr = '$\\mathcal{P}_\\text{rectangle} = 2 \\times (L + l)$'
            texteCorr += `<br>$\\mathcal{P}_\\text{rectangle} = 2 \\times (${texNombre(L)} + ${texNombre(l)})\\text{ cm}$`
            texteCorr += `<br>$\\mathcal{P}_\\text{rectangle} = 2 \\times ${texNombre(L + l)}\\text{ cm}$`
            texteCorr += `<br>$\\mathcal{P}_\\text{rectangle} = ${miseEnEvidence(texNombre(2 * (L + l)))}\\text{ cm}$`
            texteInteractif += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBase,
              {
                texteAvant: '$\\mathcal{P}_\\text{rectangle} =$',
                texteApres: '$\\text{ cm}$',
              },
            )
            handleAnswers(this, i, {
              reponse: { value: texNombre(2 * L + 2 * l) },
            })
          }
          break
        case 'cercleRayon':
          {
            const r = randint(2, 9)
            texte = `Cercle de rayon $${texNombre(r)}\\text{ cm}$`
            texteCorr =
              '$\\mathcal{P}_\\text{cercle} = 2 \\times r \\times \\pi$'
            texteCorr += this.sup2
              ? `<br>$\\mathcal{P}_\\text{cercle} \\approx 2 \\times ${texNombre(r)}\\text{ cm} \\times 3,14$`
              : `<br>$\\mathcal{P}_\\text{cercle} = 2 \\times ${texNombre(r)}\\text{ cm} \\times \\pi$`
            const perimetre = this.sup2 ? 2 * r * 3.14 : 2 * r
            texteCorr += this.sup2
              ? `<br>$\\mathcal{P}_\\text{cercle} \\approx ${miseEnEvidence(`${texNombre(perimetre)}`)}\\text{ cm}$`
              : `<br>$\\mathcal{P}_\\text{cercle} = ${miseEnEvidence(`${texNombre(perimetre)}\\pi`)}\\text{ cm}$`
            texteInteractif += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBase,
              {
                texteAvant: '$\\mathcal{P}_\\text{cercle} =$',
                texteApres: '$\\text{ cm}$',
              },
            )
            handleAnswers(this, i, {
              reponse: {
                value: this.sup2 ? texNombre(perimetre) : `${2 * r}\\pi`,
                options: { calculFormel: !this.sup2 },
              },
            })
          }
          break
        case 'cercleDiametre': {
          const d = randint(2, 9)
          texte = `Cercle de diamètre $${texNombre(d)}\\text{ cm}$`
          texteCorr = '$\\mathcal{P}_\\text{cercle} = d \\times \\pi$'
          texteCorr += this.sup2
            ? `<br>$\\mathcal{P}_\\text{cercle} \\approx ${texNombre(d)}\\text{ cm} \\times 3,14$`
            : `<br>$\\mathcal{P}_\\text{cercle} = ${texNombre(d)}\\pi\\text{ cm}$`
          const perimetre = this.sup2 ? d * 3.14 : d
          texteCorr += this.sup2
            ? `<br>$\\mathcal{P}_\\text{cercle} \\approx ${miseEnEvidence(`${texNombre(perimetre)}`)}\\text{ cm}$`
            : `<br>$\\mathcal{P}_\\text{cercle} = ${miseEnEvidence(`${texNombre(perimetre)}\\pi`)}\\text{ cm}$`
          texteInteractif += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBase,
            {
              texteAvant: '$\\mathcal{P}_\\text{cercle} =$',
              texteApres: '$\\text{ cm}$',
            },
          )
          handleAnswers(this, i, {
            reponse: {
              value: this.sup2 ? texNombre(perimetre) : `${d}\\pi`,
              options: { calculFormel: !this.sup2 },
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
