import { miseEnEvidence } from '../../lib/outils/embellissements'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const amcReady = true
export const amcType = 'qcmMono'

export const interactifReady = true

export const titre =
  'Multiplier par $0{,}1$ ; $0{,}01$ ; $0{,}001$ (placer la virgule)'

/**
 * @author Jean-claude Lhote
 * Publié le 20/02/2021

 * Relecture : Décembre 2021 par EE
 */
export const uuid = '47a54'

export const refs = {
  'fr-fr': ['6N2B-1'],
  'fr-2016': ['6C30-4'],
  'fr-ch': ['9R1NO6G-2', '9R2NO6G-2', '9R3NO6G-2'],
}
export default class PlacerLaVirgule extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Nombres entiers', true]
    this.nbQuestions = 4 // Ici le nombre de questions
    this.consigne =
      'Les calculs suivants sont faux. Placer la virgule correctement dans le résultat pour que le calcul soit juste.'
    this.sup = false
  }

  nouvelleVersion() {
    if (this.nbQuestions > 1) {
      if (this.interactif) {
        this.consigne = 'Déterminer le résultat de ces multiplications.'
      } else {
        this.consigne =
          'Les calculs suivants sont faux. Placer la virgule correctement dans le résultat pour que le calcul soit juste.'
      }
    } else {
      if (this.interactif) {
        this.consigne = 'Déterminer le résultat de cette multiplication.'
      } else {
        this.consigne =
          'Le calcul suivant est faux. Placer la virgule correctement dans le résultat pour que le calcul soit juste.'
      }
    }

    const rang = ['millièmes', 'centièmes', 'dixièmes']

    // Indispensable d'exporter les solutions pour rendre le QCM interactif
    this.tableauSolutionsDuQcm = []
    for (
      let i = 0,
        texte,
        texteCorr,
        coef,
        nombre,
        nombreentier,
        resultat,
        exposant,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = '' // Nous utilisons souvent cette variable pour construire le texte de la question.
      texteCorr = '' // Idem pour le texte de la correction.
      coef = -randint(1, 3)
      if (!this.sup) {
        exposant = -randint(1, 3)
      } else {
        exposant = 0
      }
      nombreentier = arrondi(
        randint(10, 1000) + randint(10, 999) * choice([0, 1000]),
      )
      nombre = arrondi(nombreentier * 10 ** exposant)
      resultat = arrondi(nombre * 10 ** coef)
      texte = `$${texNombre(nombre)} \\times ${texNombre(arrondi(10 ** coef))}$`
      if (!this.interactif) {
        texte += `$~~ = ~~\\phantom{\\ldots\\ldots}${texNombre(nombreentier)}$<br>`
      }
      texteCorr = `Quand on multiplie par $${texNombre(arrondi(10 ** coef))}=${texFractionFromString(1, arrondi(10 ** -coef))}$, chaque chiffre prend une valeur $${texNombre(10 ** -coef)}$ fois plus petite.<br>`
      texteCorr += `Le chiffre des unités se positionne donc dans les ${rang[3 + coef]}${sp()}:<br>`
      texteCorr += `$${texNombre(nombre)} \\times ${texNombre(arrondi(10 ** coef))} = ${miseEnEvidence(texNombre(resultat))}$` // ${texNombre(Math.floor(resultat))}${miseEnEvidence(',')}${texNombre(resultat-Math.floor(resultat)).replace('0,','')}$`

      this.autoCorrection[i] = {}
      this.autoCorrection[i].enonce = `${texte}\n`
      this.autoCorrection[i].propositions = [
        {
          texte: `$${texNombre(resultat)}$`,
          statut: true,
        },
        {
          texte: `$${texNombre(arrondi(resultat / 10))}$`,
          statut: false,
        },
        {
          texte: `$${texNombre(arrondi(resultat * 10))}$`,
          statut: false,
        },
        {
          texte: `$${texNombre(arrondi(resultat / 100))}$`,
          statut: false,
        },
      ]
      this.autoCorrection[i].options = {
        ordered: false,
        lastChoice: 4,
      }
      const props = propositionsQcm(this, i)
      if (this.interactif) {
        texte += props.texte
      }

      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on la stocke dans la liste des questions
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
  // Si les variables suivantes sont définies, elles provoquent l'affichage des formulaires des paramètres correspondants
  // Il peuvent être de 3 types : _numerique, _case_a_cocher ou _texte.
  // Il sont associés respectivement aux paramètres sup, sup2 et sup3.
} // Fin de l'exercice.
