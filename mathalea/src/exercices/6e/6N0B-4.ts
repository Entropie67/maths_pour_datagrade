import { miseEnEvidence } from '../../lib/outils/embellissements'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Retrouver le nombre de départ'
export const dateDePublication = '11/11/2023'
export const interactifReady = true

/**
 * Retrouver le nombre de départ
 * @author Rémi Angot

 */
export const uuid = '2be1d'

export const refs = {
  'fr-fr': ['6N0B-4'],
  'fr-2016': ['6C13-3'],
  'fr-ch': ['9R1NO8C-6', '9R2NO8C-6', '9R3NO8C-6', '10LCFA5D-7', '10LSFA5D-7', '11CTFA4A-10', '11LCFA4A-10', '11LSFA4A-10', 'PRQST02B-6', 'PRQAL04C-3', 'PRQAL04D-4', 'PRQAL05A-2'],
}

class OperationsReciproques extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.spacingCorr = 2
  }

  nouvelleVersion(): void {
    type TypeQuestionsDisponibles =
      'x+' | '+x' | 'x-' | '-x' | '/+' | '+/' | '/-' | '-/'
    const typeQuestionsDisponibles = [
      'x+',
      '+x',
      'x-',
      '-x',
      '/+',
      '+/',
      '/-',
      '-/',
    ] as TypeQuestionsDisponibles[]

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    ) as TypeQuestionsDisponibles[]
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let depart = randint(1, 10)
      let etape: number
      let arrivee: number
      let operande1: number = randint(2, 10)
      let operande2: number = randint(2, 10)
      switch (listeTypeQuestions[i]) {
        case 'x+':
          etape = depart * operande1
          arrivee = etape + operande2
          texte = `Je choisis un nombre, je le multiplie par $${operande1}$ puis j'ajoute $${operande2}$ au résultat. Quel est le nombre de départ si j'obtiens $${arrivee}$ ?`
          texteCorr = `$\\ldots \\xrightarrow{\\times${operande1}} \\ldots \\xrightarrow{+${operande2}} ${arrivee}$`
          texteCorr += "<br>On peut «\u00a0faire les calculs à l'envers\u00a0» : "
          texteCorr += `<br>$${depart} \\xleftarrow[\\div${operande1}]{} ${etape} \\xleftarrow[-${operande2}]{} ${arrivee}$.`
          break
        case '+x':
          depart = randint(2, 6)
          operande1 = randint(2, 11 - depart)
          etape = depart + operande1
          arrivee = etape * operande2
          texte = `Je choisis un nombre, j'ajoute $${operande1}$ puis je le multiplie par $${operande2}$. Quel est le nombre de départ si j'obtiens $${arrivee}$ ?`
          texteCorr = `$\\ldots \\xrightarrow{+${operande1}} \\ldots \\xrightarrow{\\times${operande2}} ${arrivee}$`
          texteCorr += "<br>On peut «\u00a0faire les calculs à l'envers\u00a0» : "
          texteCorr += `<br>$${depart} \\xleftarrow[-${operande1}]{} ${etape} \\xleftarrow[\\div${operande2}]{} ${arrivee}$.`
          break
        case 'x-':
          depart = randint(2, 10)
          etape = depart * operande1
          operande2 = Math.min(randint(1, 10), etape - 1)
          arrivee = etape - operande2
          texte = `Je choisis un nombre, je le multiplie par $${operande1}$ puis je soustrais $${operande2}$ au résultat. Quel est le nombre de départ si j'obtiens $${arrivee}$ ?`
          texteCorr = `$\\ldots \\xrightarrow{\\times${operande1}} \\ldots \\xrightarrow{-${operande2}} ${arrivee}$`
          texteCorr += "<br>On peut «\u00a0faire les calculs à l'envers\u00a0» : "
          texteCorr += `<br>$${depart} \\xleftarrow[\\div${operande1}]{} ${etape} \\xleftarrow[+${operande2}]{} ${arrivee}$.`
          break
        case '-x':
          etape = randint(1, 10)
          arrivee = etape * operande2
          depart = etape + operande1
          texte = `Je choisis un nombre, je soustrais $${operande1}$ puis je le multiplie par $${operande2}$. Quel est le nombre de départ si j'obtiens $${arrivee}$ ?`
          texteCorr = `$\\ldots \\xrightarrow{-${operande1}} \\ldots \\xrightarrow{\\times${operande2}} ${arrivee}$`
          texteCorr += "<br>On peut «\u00a0faire les calculs à l'envers\u00a0» : "
          texteCorr += `<br>$${depart} \\xleftarrow[+${operande1}]{} ${etape} \\xleftarrow[\\div${operande2}]{} ${arrivee}$.`
          break
        case '/+':
          etape = randint(1, 10)
          arrivee = etape + operande2
          depart = etape * operande1
          texte = `Je choisis un nombre, je le divise par $${operande1}$ puis j'ajoute $${operande2}$ au résultat. Quel est le nombre de départ si j'obtiens $${arrivee}$ ?`
          texteCorr = `$\\ldots \\xrightarrow{\\div${operande1}} \\ldots \\xrightarrow{+${operande2}} ${arrivee}$`
          texteCorr += "<br>On peut «\u00a0faire les calculs à l'envers\u00a0» : "
          texteCorr += `<br>$${depart} \\xleftarrow[\\times${operande1}]{} ${etape} \\xleftarrow[+${operande2}]{} ${arrivee}$.`
          break
        case '+/':
          arrivee = randint(2, 10)
          etape = arrivee * operande2
          operande1 = Math.min(randint(1, 10), etape - 1)
          depart = etape - operande1
          texte = `Je choisis un nombre, j'ajoute $${operande1}$ puis je le divise par $${operande2}$. Quel est le nombre de départ si j'obtiens $${arrivee}$ ?`
          texteCorr = `$\\ldots \\xrightarrow{+${operande1}} \\ldots \\xrightarrow{\\div${operande2}} ${arrivee}$`
          texteCorr += "<br>On peut «\u00a0faire les calculs à l'envers\u00a0» : "
          texteCorr += `<br>$${depart} \\xleftarrow[-${operande1}]{} ${etape} \\xleftarrow[\\times${operande2}]{} ${arrivee}$.`
          break
        case '/-':
          etape = randint(3, 10)
          depart = etape * operande1
          operande2 = Math.min(randint(1, 10), etape - 1)
          arrivee = etape - operande2
          texte = `Je choisis un nombre, je le divise par $${operande1}$ puis je soustrais $${operande2}$ au résultat. Quel est le nombre de départ si j'obtiens $${arrivee}$ ?`
          texteCorr = `$\\ldots \\xrightarrow{\\div${operande1}} \\ldots \\xrightarrow{-${operande2}} ${arrivee}$`
          texteCorr += "<br>On peut «\u00a0faire les calculs à l'envers\u00a0» : "
          texteCorr += `<br>$${depart} \\xleftarrow[\\times${operande1}]{} ${etape} \\xleftarrow[+${operande2}]{} ${arrivee}$.`
          break
        case '-/':
          arrivee = randint(2, 10)
          etape = arrivee * operande2
          depart = etape + operande1
          texte = `Je choisis un nombre, je soustrais $${operande1}$ puis je le divise par $${operande2}$. Quel est le nombre de départ si j'obtiens $${arrivee}$ ?`
          texteCorr = `$\\ldots \\xrightarrow{-${operande1}} \\ldots \\xrightarrow{\\div${operande2}} ${arrivee}$`
          texteCorr += "<br>On peut «\u00a0faire les calculs à l'envers\u00a0» : "
          texteCorr += `<br>$${depart} \\xleftarrow[+${operande1}]{} ${etape} \\xleftarrow[\\times${operande2}]{} ${arrivee}$.`
          break
      }
      texteCorr += `<br>Le nombre de départ est donc $${miseEnEvidence(depart)}$.`
      if (this.interactif) {
        texte +=
          '<br>' + ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase)
        handleAnswers(this, i, { reponse: { value: depart } })
      }
      if (this.questionJamaisPosee(i, depart, operande1, operande2)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
  }
}

export default OperationsReciproques
