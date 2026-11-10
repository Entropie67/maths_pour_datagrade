import {
  choixDeroulant,
  type AllChoicesType,
} from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteFeedback } from '../../lib/interactif/questionMathLive'
import {
  combinaisonListes,
  enleveDoublonNum,
  shuffle,
} from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Connaître la définition d'une unité de volume"
export const interactifReady = true
export const dateDePublication = '04/08/2025'

/**
 * Connaître la définition d'une unité de volume
 * @author Éric Elter (sur la base du 6M2autoB)

 */
export const uuid = 'fa88c'

export const refs = {
  'fr-fr': ['5N4autoB'],
  'fr-2016': ['5M21'],
  'fr-ch': ['9R1GM3A-4', '9R2GM3A-4', '9R3GM3A-4', 'PRQMG02A-5'],
}

export default class DefinitionUnitesVolumes extends Exercice {
  listeReponses: string[][]
  constructor() {
    super()

    this.nbQuestions = 2
    this.besoinFormulaireTexte = [
      'Nombre de listes déroulantes par question',
      [
        'Nombres séparés par des tirets :',
        '1 : Une seule liste déroulante',
        '2 : Deux listes déroulantes',
        '3 : Trois listes déroulantes',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.sup = '4'

    this.besoinFormulaire2Texte = [
      'Unités désirées',
      [
        'Nombres séparés par des tirets :',
        '1 : cm³',
        '2 : dm³',
        '3 : m³',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.sup2 = '4'

    this.listeReponses = []
  }

  nouvelleVersion() {
    let nbDeListesDeroulantes = gestionnaireFormulaireTexte({
      max: 3,
      defaut: 4,
      melange: 4,
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
    }).map(Number)
    nbDeListesDeroulantes = combinaisonListes(nbDeListesDeroulantes, 50)

    const uneSeuleListeDeroulante = enleveDoublonNum([...nbDeListesDeroulantes])

    let unitesChoisies = gestionnaireFormulaireTexte({
      max: 3,
      defaut: 4,
      melange: 4,
      nbQuestions: this.nbQuestions,
      saisie: this.sup2,
      listeOfCase: ['$\\text{ cm}$', '$\\text{ dm}$', '$\\text{ m}$'],
    }).map(String)
    unitesChoisies = combinaisonListes(unitesChoisies, 50)

    this.consigne = this.interactif
      ? 'Choisir ' +
        (uneSeuleListeDeroulante.length === 1 &&
        uneSeuleListeDeroulante[0] === 1
          ? 'la bonne proposition'
          : 'les bonnes propositions')
      : 'Compléter'
    this.consigne += " afin d'obtenir "
    this.consigne +=
      this.nbQuestions === 1 ? ' une définition.' : ' des définitions.'

    const choixListeDeroulante: AllChoicesType[] = [
      [
        { label: "l'aire", value: 'aire' },
        { label: 'le périmètre', value: 'perimetre' },
        { label: 'la longueur', value: 'longueur' },
        { label: 'le volume', value: 'volume' },
      ],
      [
        { label: 'carré', value: 'carre' },
        { label: 'rectangle', value: 'rectangle' },
        { label: 'pavé droit', value: 'pave' },
        { label: 'triangle', value: 'triangle' },
        { label: 'cube', value: 'cube' },
      ],
      [
        { label: '1 mm', value: 'mm' },
        { label: '1 cm', value: 'cm' },
        { label: '1 dm', value: 'dm' },
        { label: '1 m', value: 'm' },
      ],
      [
        { label: '1 mm³', value: 'mm3' },
        { label: '1 cm³', value: 'cm3' },
        { label: '1 dm³', value: 'dm3' },
        { label: '1 m³', value: 'm3' },
      ],
      [
        { label: '1 mm²', value: 'mm2' },
        { label: '1 cm²', value: 'cm2' },
        { label: '1 dm²', value: 'dm2' },
        { label: '1 m²', value: 'm2' },
      ],
    ]
    let indiceInteractif = 0
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const unite = unitesChoisies[cpt] // cpt choisi ici et dans tous les tableaux comme indice par pas assez de questions sinon.
      const match = unite.match(/\{ *([^}]*) *\}/)
      let uniteBrut = ''
      if (match) {
        uniteBrut = match[1]
      }
      let texte = ''
      let texteCorr = ''
      const texteFixe = []
      const choixListeDeroulantePourCeCas: AllChoicesType[] = []
      let choixPossibilites = 0
      switch (nbDeListesDeroulantes[cpt]) {
        case 1:
          choixPossibilites = randint(1, 4)
          switch (choixPossibilites) {
            case 1:
              texteFixe.push(`$1\\text{ ${uniteBrut}}^3$ est `)
              texteFixe.push(` d'un cube de $1\\text{ ${uniteBrut}}$ de côté.`)
              this.listeReponses[i] = ['volume']
              choixListeDeroulantePourCeCas.push([
                { label: 'Choisir une proposition', value: '' },
                ...shuffle(choixListeDeroulante[0]),
              ])
              texteCorr = `$1\\text{ ${uniteBrut}}^3$ est ${texteEnCouleurEtGras('le volume')} d'un cube de $1\\text{ ${uniteBrut}}$ de côté.`
              break
            case 2:
              texteFixe.push(`$1\\text{ ${uniteBrut}}^3$ est le volume d'un cube de `)
              texteFixe.push(' de côté.')
              this.listeReponses[i] = [uniteBrut]
              choixListeDeroulantePourCeCas.push([
                { label: 'Choisir une proposition', value: '' },
                ...shuffle(choixListeDeroulante[2]),
              ])
              texteCorr = `$1\\text{ ${uniteBrut}}^3$ est le volume d'un cube de ${texteEnCouleurEtGras(`$\\mathbf{1}\\textbf{ ${uniteBrut}}$`)} de côté.`
              break
            case 3:
              texteFixe.push(`$1\\text{ ${uniteBrut}}^3$ est le volume d'un `)
              texteFixe.push(` de $1\\text{ ${uniteBrut}}$ de côté.`)
              this.listeReponses[i] = ['cube']
              choixListeDeroulantePourCeCas.push([
                { label: 'Choisir une proposition', value: '' },
                ...shuffle(choixListeDeroulante[1]),
              ])
              texteCorr = `$1\\text{ ${uniteBrut}}^3$ est le volume d'un ${texteEnCouleurEtGras('cube')} de $1\\text{ ${uniteBrut}}$ de côté.`
              break
            case 4:
              texteFixe.push(' ')
              texteFixe.push(
                ` est le volume d'un cube de $1\\text{ ${uniteBrut}}$ de côté.`,
              )
              this.listeReponses[i] = [uniteBrut + '3']
              choixListeDeroulantePourCeCas.push([
                { label: 'Choisir une proposition', value: '' },
                ...shuffle(choixListeDeroulante[3]),
              ])
              texteCorr = `$1$ ${texteEnCouleurEtGras(unite)}$${miseEnEvidence('^3')}$ est ${texteEnCouleurEtGras('le volume')} d'un cube de $1\\text{ ${uniteBrut}}$ de côté.`
              break
          }
          texte = texteFixe[0]
          texte += this.interactif
            ? choixDeroulant(this, indiceInteractif, {
                choices: choixListeDeroulantePourCeCas[0],
              })
            : '$\\ldots\\ldots\\ldots$'
          texte += texteFixe[1]
          break
        case 2:
          choixPossibilites = randint(1, 5)
          switch (choixPossibilites) {
            case 1:
              texteFixe.push(`$1\\text{ ${uniteBrut}}^3$ est `)
              texteFixe.push(" d'un ")
              texteFixe.push(` de $1\\text{ ${uniteBrut}}$ de côté.`)
              this.listeReponses[i] = ['volume', 'cube']
              choixListeDeroulantePourCeCas.push([
                { label: 'Choisir une proposition', value: '' },
                ...shuffle(choixListeDeroulante[0]),
              ])
              choixListeDeroulantePourCeCas.push([
                { label: 'Choisir une proposition', value: '' },
                ...shuffle(choixListeDeroulante[1]),
              ])
              texteCorr = `$1\\text{ ${uniteBrut}}^3$ est ${texteEnCouleurEtGras('le volume')} d'un ${texteEnCouleurEtGras('cube')} de $1\\text{ ${uniteBrut}}$ de côté.`
              break
            case 2:
              texteFixe.push(`$1\\text{ ${uniteBrut}}^3$ est `)
              texteFixe.push(" d'un cube de ")
              texteFixe.push(' de côté.')
              this.listeReponses[i] = ['volume', uniteBrut]
              choixListeDeroulantePourCeCas.push([
                { label: 'Choisir une proposition', value: '' },
                ...shuffle(choixListeDeroulante[0]),
              ])
              choixListeDeroulantePourCeCas.push([
                { label: 'Choisir une proposition', value: '' },
                ...shuffle(choixListeDeroulante[2]),
              ])
              texteCorr = `$1\\text{ ${uniteBrut}}^3$ est ${texteEnCouleurEtGras('le volume')} d'un cube de ${texteEnCouleurEtGras(`$\\mathbf{1}\\textbf{ ${uniteBrut}}$`)} de côté.`
              break
            case 3:
              texteFixe.push(`$1\\text{ ${uniteBrut}}^3$ est le volume d'un `)
              texteFixe.push(' de ')
              texteFixe.push(' de côté.')
              this.listeReponses[i] = ['cube', uniteBrut]
              choixListeDeroulantePourCeCas.push([
                { label: 'Choisir une proposition', value: '' },
                ...shuffle(choixListeDeroulante[1]),
              ])
              choixListeDeroulantePourCeCas.push([
                { label: 'Choisir une proposition', value: '' },
                ...shuffle(choixListeDeroulante[2]),
              ])
              texteCorr = `$1\\text{ ${uniteBrut}}^3$ est le volume d'un ${texteEnCouleurEtGras('cube')} de ${texteEnCouleurEtGras(`$\\mathbf{1}\\textbf{ ${uniteBrut}}$`)} de côté.`
              break
            case 4:
              texteFixe.push(' ')
              texteFixe.push(' est ')
              texteFixe.push(` d'un cube de $1\\text{ ${uniteBrut}}$ de côté.`)
              this.listeReponses[i] = [uniteBrut + '3', 'volume']
              choixListeDeroulantePourCeCas.push([
                { label: 'Choisir une proposition', value: '' },
                ...shuffle(choixListeDeroulante[3]),
              ])
              choixListeDeroulantePourCeCas.push([
                { label: 'Choisir une proposition', value: '' },
                ...shuffle(choixListeDeroulante[0]),
              ])
              texteCorr = `$1$ ${texteEnCouleurEtGras(unite)}$${miseEnEvidence('^3')}$ est ${texteEnCouleurEtGras('le volume')} d'un cube de $1\\text{ ${uniteBrut}}$ de côté.`
              break
            case 5:
              texteFixe.push(' ')
              texteFixe.push(" est le volume d'un ")
              texteFixe.push(` de $1\\text{ ${uniteBrut}}$ de côté.`)
              this.listeReponses[i] = [uniteBrut + '3', 'cube']
              choixListeDeroulantePourCeCas.push([
                { label: 'Choisir une proposition', value: '' },
                ...shuffle(choixListeDeroulante[3]),
              ])
              choixListeDeroulantePourCeCas.push([
                { label: 'Choisir une proposition', value: '' },
                ...shuffle(choixListeDeroulante[1]),
              ])
              texteCorr = `$1$ ${texteEnCouleurEtGras(unite)}$${miseEnEvidence('^3')}$ est le volume d'un ${texteEnCouleurEtGras('cube')} de $1\\text{ ${uniteBrut}}$ de côté.`
              break
          }
          texte = texteFixe[0]
          texte += this.interactif
            ? choixDeroulant(this, indiceInteractif, {
                choices: choixListeDeroulantePourCeCas[0],
              })
            : '$\\ldots\\ldots\\ldots$'
          texte += texteFixe[1]
          texte += this.interactif
            ? choixDeroulant(this, indiceInteractif + 1, {
                choices: choixListeDeroulantePourCeCas[1],
              })
            : '$\\ldots\\ldots\\ldots$'
          texte += texteFixe[2]
          break
        case 3:
          choixPossibilites = randint(1, 2)
          switch (choixPossibilites) {
            case 1:
              texteFixe.push(`$1\\text{ ${uniteBrut}}^3$ est `)
              texteFixe.push(" d'un ")
              texteFixe.push(' de ')
              texteFixe.push(' de côté.')
              this.listeReponses[i] = ['volume', 'cube', uniteBrut]
              choixListeDeroulantePourCeCas.push([
                { label: 'Choisir une proposition', value: '' },
                ...shuffle(choixListeDeroulante[0]),
              ])
              choixListeDeroulantePourCeCas.push([
                { label: 'Choisir une proposition', value: '' },
                ...shuffle(choixListeDeroulante[1]),
              ])
              choixListeDeroulantePourCeCas.push([
                { label: 'Choisir une proposition', value: '' },
                ...shuffle(choixListeDeroulante[2]),
              ])
              texteCorr = `$1\\text{ ${uniteBrut}}^3$ est ${texteEnCouleurEtGras('le volume')} d'un ${texteEnCouleurEtGras('cube')} de ${texteEnCouleurEtGras(`$\\mathbf{1}\\textbf{ ${uniteBrut}}$`)} de côté.`
              break
            case 2:
              texteFixe.push(' ')
              texteFixe.push(' est ')
              texteFixe.push(" d'un ")
              texteFixe.push(` de $1\\text{ ${uniteBrut}}$ de côté.`)
              texteFixe.push('')
              this.listeReponses[i] = [uniteBrut + '3', 'volume', 'cube']
              choixListeDeroulantePourCeCas.push([
                { label: 'Choisir une proposition', value: '' },
                ...shuffle(choixListeDeroulante[3]),
              ])
              choixListeDeroulantePourCeCas.push([
                { label: 'Choisir une proposition', value: '' },
                ...shuffle(choixListeDeroulante[0]),
              ])
              choixListeDeroulantePourCeCas.push([
                { label: 'Choisir une proposition', value: '' },
                ...shuffle(choixListeDeroulante[1]),
              ])
              texteCorr = `$1$ ${texteEnCouleurEtGras(unite)}$^3$ est ${texteEnCouleurEtGras('le volume')} d'un ${texteEnCouleurEtGras('cube')} de $1\\text{ ${uniteBrut}}$ de côté.`
              break
          }

          texte = texteFixe[0]
          texte += this.interactif
            ? choixDeroulant(this, indiceInteractif, {
                choices: choixListeDeroulantePourCeCas[0],
              })
            : '$\\ldots\\ldots\\ldots$'
          texte += texteFixe[1]
          texte += this.interactif
            ? choixDeroulant(this, indiceInteractif + 1, {
                choices: choixListeDeroulantePourCeCas[1],
              })
            : '$\\ldots\\ldots\\ldots$'
          texte += texteFixe[2]
          texte += this.interactif
            ? choixDeroulant(this, indiceInteractif + 2, {
                choices: choixListeDeroulantePourCeCas[2],
              })
            : '$\\ldots\\ldots\\ldots$'
          texte += texteFixe[3]
          break
      }

      if (
        this.questionJamaisPosee(
          i,
          uniteBrut,
          choixPossibilites,
          this.listeReponses[i].length,
        )
      ) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        texte += ajouteFeedback(this, i)
        if (this.interactif) {
          for (let j = 0; j < this.listeReponses[i].length; j++) {
            handleAnswers(
              this,
              indiceInteractif + j,
              { reponse: { value: this.listeReponses[i][j] } },
              { formatInteractif: 'liste-deroulante' },
            )
          }
        }
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        indiceInteractif += this.listeReponses[i].length
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
