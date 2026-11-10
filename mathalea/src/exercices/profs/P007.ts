import { texteParPosition } from '../../lib/2d/textes'
import { nombreAvecEspace } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import { Pavage } from '../../modules/Pavage'
import Exercice from '../Exercice'

export const titre = 'Fabriquer des pavages pour travailler les transformations'

export const refs = {
  'fr-fr': ['P007'],
  'fr-ch': [],
}
export const uuid = 'ad5f8'

/**
 * Outil de création de pavages pour le prof
 * @author Jean-claude Lhote
 * Publié le 12/12/2020
 * Ref : P007
 */
export default class PavagesMathalea2d extends Exercice {
  constructor() {
    super()

    this.besoinFormulaireNumerique = [
      'Type de pavage',
      8,
      "1 : Triangles équilatéraux\n2 : Carrés\n3 : Hexagones\n4 : Pavage 3².4.3.4\n5 : Pavage 8².4\n6 : Pavage hexagonal d'écolier\n7 : Pavage 6.3.6.3",
    ]
    this.besoinFormulaire2Texte = [
      'Nombre de répétitions du motif (2 entiers séparés par un tiret)',
      '',
    ]
    this.besoinFormulaire3CaseACocher = ['Présence de numéros']

    this.nbQuestions = 1
    this.nbQuestionsModifiable = false

    this.sup = 4
    this.sup2 = '1-1'
    this.sup3 = true
    this.correctionDetaillee = false
    this.correctionDetailleeDisponible = true
    this.spacingCorr = context.isHtml ? 2.5 : 1.5
  }

  nouvelleVersion() {
    const objets = []
    let Nx, Ny // nombres de dalles en x et en y
    if (!this.sup2) {
      // On fixe le nombre de dalles en x et en y
      // Si aucune grandeur n'est saisie
      ;[Nx, Ny] = [1, 1]
    } else {
      ;[Nx, Ny] = gestionnaireFormulaireTexte({
        saisie: this.sup2,
        min: 1,
        max: 10,
        defaut: 1,
        melange: 1,
        nbQuestions: 2,
        shuffle: false,
      }).map(Number)
      if (isNaN(Nx) || isNaN(Ny)) {
        Nx = 1
        Ny = 1
      }
    }

    const monpavage: Pavage = new Pavage() // On crée l'objet Pavage qui va s'appeler monpavage
    const typeDePavage = this.sup > 7 ? randint(1, 7) : this.sup
    monpavage.construit(typeDePavage, Nx, Ny, 3) // On initialise toutes les propriétés de l'objet.
    if (this.sup3) {
      // Doit-on afficher les Numéros ?
      for (let i = 0; i < monpavage.nb_polygones; i++) {
        objets.push(
          texteParPosition(
            nombreAvecEspace(i + 1),
            monpavage.barycentres[i].x + 0.3,
            monpavage.barycentres[i].y,
            0,
            'black',
            0.04 * monpavage.echelle,
            'milieu',
            true,
          ),
        )
      }
    }
    if (this.correctionDetaillee) {
      // Doit-on montrer les centres des figures ?
      for (let i = 0; i < monpavage.nb_polygones; i++) {
        objets.push(monpavage.tracesCentres[i])
      }
    }
    for (let i = 0; i < monpavage.nb_polygones; i++) {
      // il faut afficher tous les polygones du pavage
      objets.push(monpavage.polygones[i])
    }
    const texte = mathalea2d(monpavage.fenetre, objets) // monpavage.fenetre est calibrée pour faire entrer le pavage dans une feuille A4

    let texteComment = 'Le premier paramètre permet de choisir le pavage.<br>'
    texteComment +=
      'Le deuxième permet de choisir le nombre de répétitions en x et y. Exemple : 3-2<br>'
    texteComment +=
      "Le troisième permet d'afficher un Numéro distinct sur chaque figure.<br>"
    texteComment +=
      'En activant la correction détaillée, on affiche les barycentres de celles-ci.'

    this.listeQuestions.push(texte)
    // this.listeCorrections.push(texteCorr)
    this.comment = texteComment
    listeQuestionsToContenu(this)
  }
} // Fin de l'exercice.
