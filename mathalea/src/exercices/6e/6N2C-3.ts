import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

export const titre = 'Diviser par $10$, $100$ ou $1\\,000$'

export const dateDePublication = '08/12/2021'
export const dateDeModifImportante = '22/08/2024'

/**
 * @author Eric Elter (déclinaison de 6C30-5 de Jean-claude Lhote)
 */
export const uuid = '9540b'

export const refs = {
  'fr-fr': ['6N2C-3', '6AutoN4-3'],
  'fr-2016': ['6C30-8'],
  'fr-ch': ['PR-24', '9R1NO6F-8', '9R2NO6F-8', '9R3NO6F-8'],
}
export default class DiviserPar101001000 extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = [
      'Le dividende est un nombre entier',
      false,
    ]
    this.besoinFormulaire2CaseACocher = ['Trois décimales maximum', true]
    this.besoinFormulaire3Texte = [
      'Type de questions',
      'Nombres séparés par des tirets :\n1 : Résultat à calculer\n2 : Nombre à retrouver\n3 : 10, 100 ou 1 000 à retrouver\n4 : Mélange',
    ]

    this.nbQuestions = 4 // Ici le nombre de questions
    this.consigne = 'Compléter les pointillés.'
    this.sup = false
    this.sup2 = true
    this.sup3 = 4
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
      saisie: this.sup3,
    })
    const rang = ['millièmes', 'centièmes', 'dixièmes']

    for (
      let i = 0,
        texte,
        texteCorr,
        coef,
        nombre,
        nombreEntier,
        resultat,
        exposant,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = '' // Nous utilisons souvent cette variable pour construire le texte de la question.
      texteCorr = '' // Idem pour le texte de la correction.
      coef = -randint(1, 3)
      exposant = 0
      if (!this.sup)
        if (this.sup2) {
          switch (coef) {
            case -1:
              exposant = -randint(0, 2)
              break
            case -2:
              exposant = -randint(0, 1)
              break
          }
        } else {
          exposant = -randint(1, 3)
        }
      nombreEntier = randint(10, 1000) + randint(10, 999) * choice([0, 1000])
      nombre = nombreEntier * 10 ** exposant
      resultat = nombre * 10 ** coef
      switch (
        Number(listeTypeDeQuestions[i]) // Chaque question peut être d'un type différent, ici 4 cas sont prévus...
      ) {
        case 1:
          texte = `$${texNombre(nombre)}\\div ${texNombre(10 ** -coef)}=\\ldots\\ldots\\ldots\\ldots$`
          texteCorr = `Quand on divise par $${texNombre(10 ** -coef)}$, chaque chiffre prend une valeur $${texNombre(10 ** -coef)}$ fois plus petite.<br>`
          texteCorr += `Le chiffre des unités se positionne donc dans les ${rang[3 + coef]} :<br>`
          texteCorr += `$${texNombre(nombre)}\\div ${texNombre(10 ** -coef)}=${miseEnEvidence(texNombre(resultat))}$`

          this.autoCorrection[i] = {}
          this.autoCorrection[i].enonce = `${texte}\n`
          this.autoCorrection[i].propositions = [
            {
              texte: `$${texNombre(resultat)}$`,
              statut: true,
            },
            {
              texte: `$${texNombre(arrondi(nombre * 10 ** -coef, 5))}$`,
              statut: false,
            },
            {
              texte: `$${texNombre(nombre * 10 ** (coef - 1))}$`,
              statut: false,
            },
            {
              texte: `$${texNombre(arrondi(nombre * 10 ** (-coef + 1), 5))}$`,
              statut: false,
            },
          ]
          this.autoCorrection[i].options = {
            ordered: false,
            lastChoice: 5,
          }
          break

        case 3:
          texte = `$${texNombre(nombre)}\\div \\ldots\\ldots\\ldots=${texNombre(resultat)}$`
          texteCorr = `Le chiffre des unités de $${texNombre(nombre)}$ se positionne sur le chiffre des ${rang[3 + coef]} dans $${texNombre(resultat)}$.<br>`
          texteCorr += `Chaque chiffre prend une valeur $${texNombre(10 ** -coef)}$ fois plus petite, donc on divise par $${texNombre(10 ** -coef)}$.<br>`
          texteCorr += `$${texNombre(nombre)}\\div ${miseEnEvidence(texNombre(10 ** -coef))}=${texNombre(resultat)}$`
          this.autoCorrection[i] = {}
          this.autoCorrection[i].enonce = `${texte}\n`
          this.autoCorrection[i].propositions = [
            {
              texte: `$${texNombre(10 ** 1)}$`,
              statut: -coef === 1,
            },
            {
              texte: `$${texNombre(10 ** 2)}$`,
              statut: -coef === 2,
            },
            {
              texte: `$${texNombre(10 ** 3)}$`,
              statut: -coef === 3,
            },
            {
              texte: `$${texNombre(10 ** 4)}$`,
              statut: -coef === 4,
            },
          ]
          this.autoCorrection[i].options = {
            ordered: false,
            lastChoice: 5,
          }
          break

        case 2:
          texte = `$\\ldots\\ldots\\ldots\\ldots\\div ${texNombre(10 ** -coef)}=${texNombre(resultat)}$`
          texteCorr = `Quand on divise par $${texNombre(10 ** -coef)}$, chaque chiffre prend une valeur $${texNombre(10 ** -coef)}$ fois plus petite.<br>`
          texteCorr += `Le chiffre des unités se positionne donc dans les ${rang[3 + coef]} :<br>`
          texteCorr += `$${miseEnEvidence(texNombre(nombre))}\\div ${texNombre(10 ** -coef)}=${texNombre(resultat)}$`
          this.autoCorrection[i] = {}
          this.autoCorrection[i].enonce = `${texte}\n`
          this.autoCorrection[i].propositions = [
            {
              texte: `$${texNombre(nombre)}$`,
              statut: true,
            },
            {
              texte: `$${texNombre(nombre / 10)}$`,
              statut: false,
            },
            {
              texte: `$${texNombre(nombre * 10)}$`,
              statut: false,
            },
            {
              texte: `$${texNombre(arrondi(nombre * 10 ** (-coef + 1), 5))}$`,
              statut: false,
            },
          ]
          this.autoCorrection[i].options = {
            ordered: false,
            lastChoice: 5,
          }
          break
      }
      const props = propositionsQcm(this, i)
      if (this.interactif) {
        texte += `<br>${props.texte}`
      }

      if (this.questionJamaisPosee(i, nombreEntier, coef)) {
        // Si la question n'a jamais été posée, on la stocke dans la liste des questions
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
