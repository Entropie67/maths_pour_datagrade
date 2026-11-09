import {
  choixDeroulant,
  type AllChoicesType,
} from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteFeedback } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Connaître les multiples égalités d'une unité d'aire"
export const interactifReady = true
export const dateDePublication = '04/08/2025'

/**
 * Connaître les multiples égalités d'une unité d'aire
 * @author Éric Elter

 */
export const uuid = '61772'

export const refs = {
  'fr-fr': ['6M2autoD', '6AutoA2-2'],
  'fr-2016': ['6M23-3'],
  'fr-ch': ['9R1GM4C-3', '9R2GM4C-3', '9R3GM4C-3', 'PRQMG04B-7'],
}

export default class EgalitesUnitesAires extends Exercice {
  listeReponses: string[][]
  constructor() {
    super()

    this.nbQuestions = 2
    this.besoinFormulaireTexte = [
      'Unités désirées',
      [
        'Nombres séparés par des tirets :',
        '1 : cm²',
        '2 : dm²',
        '3 : m²',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.sup = '2-3'

    this.listeReponses = []
  }

  nouvelleVersion() {
    let unitesChoisies = gestionnaireFormulaireTexte({
      max: 3,
      defaut: 4,
      melange: 4,
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
    }).map(Number)
    unitesChoisies = combinaisonListes(unitesChoisies, 50)

    this.consigne = this.interactif
      ? 'Choisir les bonnes propositions'
      : 'Compléter'
    this.consigne += '.'

    const choixListeDeroulante: AllChoicesType[] = [
      [
        { label: '1 000', value: '1000' },
        { label: '100', value: '100' },
        { label: '10', value: '10' },
        { label: '1', value: '1' },
      ],
      [
        { label: 'mm', value: 'mm' },
        { label: 'cm', value: 'cm' },
        { label: 'dm', value: 'dm' },
        { label: 'm', value: 'm' },
      ],
    ]
    let choixListeDeroulantePourCoefficient = [
      { label: 'Choisir', value: '' },
      ...shuffle(choixListeDeroulante[0]),
    ]
    const choixListeDeroulantePourUnite = [
      { label: 'Choisir', value: '' },
      ...shuffle(choixListeDeroulante[1]),
    ]

    const unitesPossibles = [
      '$\\text{mm}$',
      '$\\text{cm}$',
      '$\\text{dm}$',
      '$\\text{m}$',
    ]
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const unite = unitesPossibles[unitesChoisies[cpt]] // cpt choisi ici et dans tous les tableaux comme indice par pas assez de questions sinon.
      const sousUnite = unitesPossibles[unitesChoisies[cpt] - 1]

      this.listeReponses[i] = []

      let texte = `$1$ ${unite}$^2$ = $1$ ${unite} $\\times$ `
      let texteCorr = texte

      let choix = choice([true, false])
      if (choix) {
        texte += this.interactif
          ? choixDeroulant(this, 4 * i, {
              choices: choixListeDeroulantePourCoefficient,
            })
          : '$\\ldots\\ldots\\ldots$'
        texte += ` ${unite} `
        this.listeReponses[i].push('1')
        texteCorr += `${texteEnCouleurEtGras('$\\mathbf{1}$')} ${unite}`
      } else {
        texte += ' $1$ '
        texte += this.interactif
          ? choixDeroulant(this, 4 * i, {
              choices: choixListeDeroulantePourUnite,
            })
          : '$\\ldots\\ldots\\ldots$'
        this.listeReponses[i].push(unite)
        texteCorr += `$1$ ${texteEnCouleurEtGras(unite)} `
      }
      texte += ' = '
      texteCorr += ' = '

      choix = choice([true, false])
      if (choix) {
        choix = choice([true, false])
        if (choix) {
          texte += this.interactif
            ? choixDeroulant(this, 4 * i + 1, {
                choices: choixListeDeroulantePourCoefficient,
              })
            : '$\\ldots\\ldots\\ldots$'
          texte += ` ${sousUnite} `
          this.listeReponses[i].push('10')
          texteCorr += `${texteEnCouleurEtGras('$\\mathbf{10}$')} ${sousUnite}`
        } else {
          texte += ' $10$ '
          texte += this.interactif
            ? choixDeroulant(this, 4 * i + 1, {
                choices: choixListeDeroulantePourUnite,
              })
            : '$\\ldots\\ldots\\ldots$'
          this.listeReponses[i].push(sousUnite)
          texteCorr += `$10$ ${texteEnCouleurEtGras(sousUnite)} `
        }
        texte += `$\\times 10$ ${sousUnite} `
        texteCorr += `$\\times 10$ ${sousUnite} `
      } else {
        texte += `$10$ ${sousUnite} $\\times$ `
        texteCorr += `$10$ ${sousUnite} $\\times$ `
        choix = choice([true, false])
        if (choix) {
          texte += this.interactif
            ? choixDeroulant(this, 4 * i + 1, {
                choices: choixListeDeroulantePourCoefficient,
              })
            : '$\\ldots\\ldots\\ldots$'
          texte += ` ${sousUnite} `
          this.listeReponses[i].push('10')
          texteCorr += `${texteEnCouleurEtGras('$\\mathbf{10}$')} ${sousUnite}`
        } else {
          texte += ' $10$ '
          texte += this.interactif
            ? choixDeroulant(this, 4 * i + 1, {
                choices: choixListeDeroulantePourUnite,
              })
            : '$\\ldots\\ldots\\ldots$'
          this.listeReponses[i].push(sousUnite)
          texteCorr += `$10$ ${texteEnCouleurEtGras(sousUnite)} `
        }
      }
      texte += ' = '
      texteCorr += ' = '

      choix = choice([true, false])
      this.listeReponses[i].push('10')
      if (choix) {
        texte += this.interactif
          ? choixDeroulant(this, 4 * i + 2, {
              choices: choixListeDeroulantePourCoefficient,
            })
          : '$\\ldots\\ldots\\ldots$'
        texte += '$\\times 10$ '
        texteCorr += `${texteEnCouleurEtGras('$\\mathbf{10}$')} $\\times 10$`
      } else {
        texte += ' $10 \\times$ '
        texte += this.interactif
          ? choixDeroulant(this, 4 * i + 2, {
              choices: choixListeDeroulantePourCoefficient,
            })
          : '$\\ldots\\ldots\\ldots$'
        texteCorr += `$10 \\times$ ${texteEnCouleurEtGras('$\\mathbf{10}$')}`
      }

      texte += ` ${sousUnite}$^2$ = `
      texteCorr += ` ${sousUnite}$^2$ = `

      choixListeDeroulantePourCoefficient = [
        { label: 'Choisir', value: '' },
        ...shuffle(choixListeDeroulante[0]),
      ]
      texte += this.interactif
        ? choixDeroulant(this, 4 * i + 3, {
            choices: choixListeDeroulantePourCoefficient,
          })
        : '$\\ldots\\ldots\\ldots$'
      this.listeReponses[i].push('100')

      texte += ` ${sousUnite}$^2$`
      texteCorr += `${texteEnCouleurEtGras('$\\mathbf{100}$')} ${sousUnite}$^2$`

      if (this.questionJamaisPosee(i, unite)) {
        texte += ajouteFeedback(this, i)
        if (this.interactif) {
          for (let j = 0; j < 4; j++) {
            handleAnswers(
              this,
              4 * i + j,
              {
                reponse: {
                  value: this.listeReponses[i][j]
                    .replace('$\\text{', '')
                    .replace('}$', ''),
                },
              },
              { formatInteractif: 'liste-deroulante' },
            )
          }
        }
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
    // MGU : parfois pas assez de questions par rapport à la demande donc on corrige
    this.nbQuestions = this.listeQuestions.length
    this.autoCorrection.length = this.nbQuestions * 4
  }
}
