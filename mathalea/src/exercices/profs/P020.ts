import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { tableauColonneLigne } from '../../lib/2d/tableau'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import {
  contraindreValeur,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDeModifImportante = '30/10/2026'

export const titre = 'Décoder un message avec les tables de multiplication'

export const refs = {
  'fr-fr': ['P020'],
  'fr-ch': [],
}
export const uuid = 'de363'
const tableauDesCaracteres = Array.from(
  "-xçwjè,k~:aq«rlgdmftbéocsà.êeipzhu'ynvî»â!",
)
const enteteColonnes = [
  '\\times',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
]

function produitPourCaractere(car: string, map: Map<number, string>): number {
  const liste = map.entries()
  for (const paire of liste) {
    if (paire[1] === car) return paire[0]
  }
  return NaN
}
/**
 * @author Jean-claude Lhote
 */
export default class EncodeurTexte extends Exercice {
  besoinCorrection: boolean
  type: string
  constructor(type = 'générateur') {
    super()
    this.consigne =
      'Choisir un texte à encoder dans le formulaire en paramètre.'
    this.besoinFormulaireTexte = [
      'Texte à encoder (liste de mots ou de phrases séparés par /',
      '',
    ]
    this.besoinFormulaire2CaseACocher = [
      'Grille différente pour chaque morceau',
      false,
    ]

    this.sup = 'mathématiques'
    this.sup2 = false
    this.nbQuestions = 1
    this.besoinCorrection = false
    this.type = type
  }

  nouvelleVersion() {
    const enteteLignes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
    const listeDeMots = [
      'mathématiques',
      'diviseur',
      'multiple',
      'médiatrice',
      'milieu',
      'parallèle',
      'perpendiculaire',
      'multiplication',
      'addition',
      'soustraction',
      'division',
      'addition',
      'cercle',
      'histogramme',
      'diagramme',
      'numération',
      'fraction',
      'égalité',
      'propriété',
      'contre-exemple',
      'symétrie',
      'hauteur',
      'périmètre',
      'volume',
      'digramme',
      'effectif',
    ]
    const listeDePhrases = [
      "Les mathématiques/c'est fantastique",
      'multiplier et diviser/se fait avant/additionner ou soustraire',
      'être supérieur/à un nombre signifie/être plus grand que ce nombre',
      'Il faut toujours/vérifier la cohérence/de ses résultats',
      'Pour tracer des/droites ou des segments/on utilise une règle',
      'Pour tracer des/droites perpendiculaires/utilise ton équerre',
      'Pour tracer des/droites parallèles/utilise ta règle et ton équerre',
      'Pour tracer des/cercles/utilise un compas',
      "L'aire est la mesure de la surface/d'une figure géométrique",
      "Le périmètre est la mesure du contour/d'une figure géométrique",
      "Un produit est le résultat d'une multiplication",
      "Un quotient est le résultat d'une division",
      'Une somme est le résultat d’une addition',
      'Une différence est le résultat d’une soustraction',
      'Un nombre premier est un nombre qui n’a que deux diviseurs : un et lui-même',
      'Un nombre pair est un nombre divisible par deux',
      'Un nombre impair est un nombre qui n’est pas divisible par deux',
      'Un nombre entier est un nombre dont la partie décimale est nulle',
      'Le diamêtre d’un cercle est le double de son rayon',
      'Le rayon d’un cercle est la moitié de son diamètre',
      'Un angle droit mesure quatre-vingt-dix degrés',
      'Un angle aigu mesure moins de quatre-vingt-dix degrés',
      'Un angle obtus mesure plus de quatre-vingt-dix degrés',
      'Un triangle est une figure géométrique à trois côtés',
      'Un quadrilatère est une figure géométrique à quatre côtés',
      'Un pentagone est une figure géométrique à cinq côtés',
      'Un hexagone est une figure géométrique à six côtés',
      'Un heptagone est une figure géométrique à sept côtés',
      'Un octogone est une figure géométrique à huit côtés',
      'Un nonagone est une figure géométrique à neuf côtés',
      'Un décagone est une figure géométrique à dix côtés',
      'Un triangle équilatéral est un triangle dont les trois côtés sont égaux',
      'Un triangle isocèle est un triangle dont deux côtés sont égaux',
      'Un pavé droit est un solide dont les faces sont des rectangles',
      'Un cube est un solide dont les faces sont des carrés',
    ]
    this.sup3 = contraindreValeur(1, 3, this.sup3, 1)

    if (this.type === 'exo') {
      switch (this.sup3) {
        case 1:
          this.sup = choice(listeDeMots)
          break
        case 2:
          this.sup = choice(listeDePhrases).replaceAll('/', ' ')
          this.sup2 = false
          break
        case 3:
          this.sup = choice(listeDePhrases)
          this.sup2 = true
          break
      }
    }
    const texteAEncoder: string[] = this.sup.replaceAll(' ', '~').split('/') // On récupère la saisie du formulaire ou du choix aléatoire si c'est un exo
    this.nbQuestions = texteAEncoder.length
    for (let j = 0; j < this.nbQuestions; j++) {
      texteAEncoder[j] = texteAEncoder[j].toLowerCase()
    }
    const associations: Map<number, string> = new Map()
    for (
      let i = 0, texte, positionCourante, tabCar, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const table: string[][] = []
      if (i === 0 || this.sup2) {
        // on mélange les caractères pour la première question ou à chaque question si sup2=true
        // objet qui contiendra des associations : '12' : 'a'
        associations.clear()
        positionCourante = 0
        tabCar = shuffle(tableauDesCaracteres) // On mélange les caractères à disposition pour changer de grille à chaque fois
        // Conserver les associations existantes et remplacer seulement des caractères
        // inutilisés par ceux du message absents de l'alphabet initial.
        const caracteresDuMessage = new Set(
          Array.from(this.sup2 ? texteAEncoder[i] : texteAEncoder.join('')),
        )
        if (caracteresDuMessage.size > tableauDesCaracteres.length) {
          this.listeQuestions = [
            'Choisir un texte contenant au plus 42 caractères différents.',
          ]
          this.listeCorrections = []
          listeQuestionsToContenu(this)
          return
        }
        for (const caractere of caracteresDuMessage) {
          if (!tabCar.includes(caractere)) {
            const positionLibre = tabCar.findIndex(
              (c) => !caracteresDuMessage.has(c),
            )
            tabCar[positionLibre] = caractere
          }
        }
        // On initialise la grille (table) de 100 cases qui contiendra les caractères.
        for (let j = 0; j < 10; j++) {
          table[j] = []
          for (let k = 0, produit; k < 10; k++) {
            produit = (j + 1) * (k + 1) // La table js est indicée de 0 à 9 donc on ajoute 1 pour avoir le facteur correspondant.

            if (!associations.has(produit)) {
              // Ce produit n'est pas déjà associé
              associations.set(produit, tabCar[positionCourante]) // on lui associe le caractère courant
              positionCourante++ // On se positionne sur le caractère suivant n'ayant pas encore été assigné
            }
            table[j][k] = String(associations.get(produit)) // on ajoute le caractère dans la table.
          }
        }
        texte = `${tableauColonneLigne(
          enteteColonnes,
          enteteLignes,
          table.flat().map((c) => `\\large \\textbf{${c}}`),
          1.3,
          false,
          this.numeroExercice,
          i,
          false,
        )}`
      } else {
        texte = ''
      }
      texte +=
        "<br><br>À l'aide de la table ci-dessus, décoder le message suivant :<br>"
      for (const caractere of texteAEncoder[i]) {
        texte += `$${produitPourCaractere(caractere, associations)}$ `
      }
      texte += '<br><br>'

      if (
        this.questionJamaisPosee(i, texteAEncoder[i], table.flat().join(''))
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteEnCouleurEtGras(texteAEncoder[i])
          .replaceAll('~', ' ')
          .replaceAll('/', ' ')
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
