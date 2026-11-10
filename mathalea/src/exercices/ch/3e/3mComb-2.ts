import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import {
    factorielle,
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Dénombrer des codes et mots de passe'
export const dateDePublication = '05/02/2026'
export const interactifReady = true

export const uuid = 'bc63r'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['3mComb-2'],
}

/**
 * Arrangements avec et sans répétition - Codes et mots de passe
 * @author Nathan Scheinmann
 */

function arrangement(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  return Math.round(factorielle(n) / factorielle(n - k))
}

export default class CodesMDP extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Code à chiffres (arr. avec rép.)',
        '2 : Code binaire/morse (arr. avec rép.)',
        '3 : Code à lettres distinctes (arr. sans rép.)',
        '4 : Code mixte (arr. sans rép.)',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.sup = '5'
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      listeOfCase: ['chiffres', 'binaire', 'lettres', 'mixte'],
      nbQuestions: this.nbQuestions,
      shuffle: true,
    })

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let reponse = 0
      let questionId: (string | number)[] = []

      const typeQuestion = listeTypeDeQuestions[i]

      if (typeQuestion === 'chiffres') {
        const nbChiffres = randint(3, 9)
        questionId = [nbChiffres]
        reponse = Math.pow(10, nbChiffres)

        const contexte = choice([
          `Un code de carte bancaire est composé de $${nbChiffres}$ chiffres (de $0$ à $9$).`,
          `Un cadenas numérique possède $${nbChiffres}$ molettes, chacune affichant un chiffre de $0$ à $9$.`,
          `Un digicode d'immeuble utilise un code à $${nbChiffres}$ chiffres.`,
          `Le code secret d'un coffre-fort comporte $${nbChiffres}$ chiffres de $0$ à $9$.`,
          `Un casier de gare s'ouvre avec un code à $${nbChiffres}$ chiffres.`,
          `Un smartphone demande un code PIN à $${nbChiffres}$ chiffres.`,
          `Le code d'activation d'une alarme comporte $${nbChiffres}$ chiffres.`,
          `Un vélo en libre-service s'ouvre avec un code à $${nbChiffres}$ chiffres.`,
          `L'accès au parking nécessite un code à $${nbChiffres}$ chiffres.`,
          `Un antivol de valise possède $${nbChiffres}$ roulettes numérotées de $0$ à $9$.`,
        ])

        texte = `${contexte} Combien de codes différents peut-on former ?`

        texteCorr = `Chaque position peut contenir n'importe quel chiffre de $0$ à $9$, soit $10$ possibilités.<br>`
        texteCorr += `Les chiffres peuvent être répétés. Il s'agit d'un arrangement avec répétition :<br>`
        texteCorr += `$\\overline{A}_{${nbChiffres}}^{10} = 10^{${nbChiffres}} = ${miseEnEvidence(texNombre(new Decimal(reponse), 0))}$`
      } else if (typeQuestion === 'lettres') {
        const nbLettres = randint(3, 8)
        const nbLettresDisponibles = randint(nbLettres + 2, 10)
        questionId = [nbLettresDisponibles, nbLettres]
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        const lettresDisponibles = alphabet.slice(0, nbLettresDisponibles)
        const lettresAffichees = lettresDisponibles.split('').join(', ')

        reponse = arrangement(nbLettresDisponibles, nbLettres)

        const contexte = choice([
          `On forme des mots de passe de $${nbLettres}$ lettres distinctes choisies parmi $\\{${lettresAffichees}\\}$.`,
          `Un code de sécurité est constitué de $${nbLettres}$ lettres distinctes prises dans $\\{${lettresAffichees}\\}$.`,
          `On crée un identifiant de $${nbLettres}$ lettres différentes parmi $\\{${lettresAffichees}\\}$.`,
          `Un nom d'utilisateur est formé de $${nbLettres}$ lettres distinctes choisies parmi $\\{${lettresAffichees}\\}$.`,
          `Un code d'accès wifi utilise $${nbLettres}$ lettres distinctes parmi $\\{${lettresAffichees}\\}$.`,
          `Un ticket de loterie porte $${nbLettres}$ lettres distinctes choisies dans $\\{${lettresAffichees}\\}$.`,
        ])

        texte = `${contexte} Combien de codes différents peut-on créer ?`

        texteCorr = `On choisit et ordonne $${nbLettres}$ lettres parmi $${nbLettresDisponibles}$ : chaque position du code est distincte (l'ordre compte) et les lettres ne se répètent pas.<br>`
        texteCorr += `Il s'agit d'un arrangement sans répétition :<br>`
        texteCorr += `$A_{${nbLettres}}^{${nbLettresDisponibles}} = \\dfrac{${nbLettresDisponibles}!}{(${nbLettresDisponibles} - ${nbLettres})!} = \\dfrac{${nbLettresDisponibles}!}{${nbLettresDisponibles - nbLettres}!} = ${miseEnEvidence(texNombre(new Decimal(reponse), 0))}$`
      } else if (typeQuestion === 'mixte') {
        const nbChiffres = randint(2, 7)
        const nbLettres = randint(2, 7)
        const nbLettresDisponibles = randint(nbLettres + 1, 8)
        questionId = [nbChiffres, nbLettres, nbLettresDisponibles]
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        const lettresDisponibles = alphabet.slice(0, nbLettresDisponibles)
        const lettresAffichees = lettresDisponibles.split('').join(', ')

        const partieChiffres = Math.pow(10, nbChiffres)
        const partieLettres = arrangement(nbLettresDisponibles, nbLettres)
        reponse = partieChiffres * partieLettres

        const contexte = choice([
          `Un code d'accès est formé de $${nbChiffres}$ chiffres (pouvant être répétés) suivis de $${nbLettres}$ lettres distinctes choisies parmi $\\{${lettresAffichees}\\}$.`,
          `Une plaque personnalisée porte $${nbChiffres}$ chiffres (avec répétition possible) puis $${nbLettres}$ lettres distinctes parmi $\\{${lettresAffichees}\\}$.`,
          `Un numéro de série comporte $${nbChiffres}$ chiffres suivis de $${nbLettres}$ lettres différentes prises dans $\\{${lettresAffichees}\\}$.`,
          `Un billet de spectacle porte un code de $${nbChiffres}$ chiffres puis $${nbLettres}$ lettres distinctes choisies dans $\\{${lettresAffichees}\\}$.`,
          `Le login d'un serveur comporte $${nbChiffres}$ chiffres (répétition autorisée) suivis de $${nbLettres}$ lettres distinctes parmi $\\{${lettresAffichees}\\}$.`,
        ])

        texte = `${contexte} Combien de codes différents peut-on créer ?`

        texteCorr = `Le code se décompose en deux parties indépendantes. Chaque position est distincte, donc l'ordre compte :<br>`
        texteCorr += `$\\bullet$ Pour les $${nbChiffres}$ chiffres (arrangement avec répétition) : $\\overline{A}_{${nbChiffres}}^{10} = 10^{${nbChiffres}} = ${texNombre(new Decimal(partieChiffres), 0)}$<br>`
        texteCorr += `$\\bullet$ Pour les $${nbLettres}$ lettres distinctes parmi $${nbLettresDisponibles}$ (arrangement sans répétition) : $A_{${nbLettres}}^{${nbLettresDisponibles}} = ${texNombre(new Decimal(partieLettres), 0)}$<br><br>`
        texteCorr += `Par le principe multiplicatif :<br>`
        texteCorr += `$${texNombre(new Decimal(partieChiffres), 0)} \\times ${texNombre(new Decimal(partieLettres), 0)} = ${miseEnEvidence(texNombre(new Decimal(reponse), 0))}$`
      } else {
        // binaire/morse/braille
        const variante = choice([
          'binaire',
          'morse',
          'braille',
          'signaux',
          'drapeaux',
          'feux',
        ])

        if (variante === 'binaire') {
          const nbBits = randint(5, 10)
          questionId = ['binaire', nbBits]
          reponse = Math.pow(2, nbBits)

          texte = `Dans un ordinateur, chaque caractère est codé par une suite de $${nbBits}$ bits ($0$ ou $1$). `
          texte += `Combien de caractères différents peut-on coder ?`

          texteCorr = `Chaque bit a $2$ possibilités ($0$ ou $1$) et les mêmes valeurs peuvent se répéter. Il s'agit d'un arrangement avec répétition :<br>`
          texteCorr += `$\\overline{A}_{${nbBits}}^{2} = 2^{${nbBits}} = ${miseEnEvidence(texNombre(new Decimal(reponse), 0))}$`
        } else if (variante === 'morse') {
          const nbSignes = randint(1, 5)
          questionId = ['morse', nbSignes]
          let somme = 0
          for (let k = 1; k <= nbSignes; k++) {
            somme += Math.pow(2, k)
          }
          reponse = somme

          texte = `L'alphabet Morse utilise des points et des traits. Chaque caractère est codé par une suite de 1 à $${nbSignes}$ signes. `
          texte += `Combien de caractères différents peut-on théoriquement coder ?`

          texteCorr = `Pour chaque longueur $k$ de 1 à $${nbSignes}$, chaque position peut être un point ou un trait (répétition autorisée) : $\\overline{A}_{k}^{2} = 2^k$ codes.<br>`
          texteCorr += `Le nombre total est :<br>`
          let calcul = ''
          for (let k = 1; k <= nbSignes; k++) {
            calcul += `2^{${k}}`
            if (k < nbSignes) calcul += ' + '
          }
          texteCorr += `$${calcul} = ${miseEnEvidence(texNombre(new Decimal(reponse), 0))}$`
        } else if (variante === 'braille') {
          const nbPoints = 6
          questionId = ['braille']
          reponse = Math.pow(2, nbPoints)

          texte = `L'alphabet braille utilise $${nbPoints}$ points qui peuvent chacun être en relief ou non. `
          texte += `Combien de caractères différents peut-on former ?`

          texteCorr = `Chaque point a $2$ états possibles (en relief ou non) et les mêmes états peuvent se répéter. Il s'agit d'un arrangement avec répétition :<br>`
          texteCorr += `$\\overline{A}_{${nbPoints}}^{2} = 2^{${nbPoints}} = ${miseEnEvidence(texNombre(new Decimal(reponse), 0))}$`
        } else if (variante === 'signaux') {
          const nbLampes = randint(4, 8)
          const nbCouleurs = randint(3, 5)
          questionId = ['signaux', nbLampes, nbCouleurs]
          reponse = Math.pow(nbCouleurs, nbLampes)

          texte = `Un panneau de signalisation est composé de $${nbLampes}$ lampes, chacune pouvant afficher $${nbCouleurs}$ couleurs différentes. `
          texte += `Combien de signaux différents peut-on émettre ?`

          texteCorr = `Chaque lampe a $${nbCouleurs}$ couleurs possibles et les mêmes couleurs peuvent apparaître à plusieurs lampes. Il s'agit d'un arrangement avec répétition :<br>`
          texteCorr += `$\\overline{A}_{${nbLampes}}^{${nbCouleurs}} = ${nbCouleurs}^{${nbLampes}} = ${miseEnEvidence(texNombre(new Decimal(reponse), 0))}$`
        } else if (variante === 'drapeaux') {
          const nbBandes = randint(3, 5)
          const nbCouleurs = randint(4, 7)
          questionId = ['drapeaux', nbBandes, nbCouleurs]
          reponse = Math.pow(nbCouleurs, nbBandes)

          texte = `On fabrique des drapeaux composés de $${nbBandes}$ bandes horizontales. Chaque bande peut être peinte dans l'une de $${nbCouleurs}$ couleurs (deux bandes consécutives peuvent être de même couleur). `
          texte += `Combien de drapeaux différents peut-on créer ?`

          texteCorr = `Chaque bande a $${nbCouleurs}$ couleurs possibles et les mêmes couleurs peuvent se répéter. Il s'agit d'un arrangement avec répétition :<br>`
          texteCorr += `$\\overline{A}_{${nbBandes}}^{${nbCouleurs}} = ${nbCouleurs}^{${nbBandes}} = ${miseEnEvidence(texNombre(new Decimal(reponse), 0))}$`
        } else {
          // feux tricolores
          const nbFeux = randint(3, 6)
          questionId = ['feux', nbFeux]
          reponse = Math.pow(3, nbFeux)

          texte = `Un système de signalisation utilise $${nbFeux}$ feux, chacun pouvant être rouge, orange ou vert. `
          texte += `Combien de configurations différentes le système peut-il afficher ?`

          texteCorr = `Chaque feu a $3$ états possibles et les mêmes états peuvent se répéter. Il s'agit d'un arrangement avec répétition :<br>`
          texteCorr += `$\\overline{A}_{${nbFeux}}^{3} = 3^{${nbFeux}} = ${miseEnEvidence(texNombre(new Decimal(reponse), 0))}$`
        }
      }

      if (this.interactif) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
          texteAvant: '<br>',
        })
        handleAnswers(this, i, {
          reponse: { value: reponse.toString() },
        })
      }

      if (this.questionJamaisPosee(i, ...questionId)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
