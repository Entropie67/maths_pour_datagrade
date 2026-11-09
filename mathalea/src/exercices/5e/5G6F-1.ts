import { propositionsQcm } from '../../lib/interactif/qcm'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre =
  'Connaitre les propriétés des parallélogrammes particuliers'

export const dateDePublication = '26/04/2023'
export const uuid = '78f28'

export const refs = {
  'fr-fr': ['5G6F-1', '2G10-3'],
  'fr-2016': ['5G42-1'],
  'fr-ch': ['9R1ES2H-8', '9R2ES2H-8', '9R3ES2H-8', 'PRQES02B-10'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMult'

/**
 * QCM sur les parallélogrammes particuliers
 * @author Rémi Angot
 */
export default class QcmProprietesParallelogrammesParticuliers extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 4
    this.sup = 3 // Mélange de questions directes et indirectes
    this.sup2 = false // Par défaut on n'écrit pas « non croisé » dans les énoncés
  }

  nouvelleVersion() {
    let texte: string = ''
    let texteCorr: string = ''
    let questionsDirects = [
      'par1',
      'par2',
      'par3',
      'par4',
      'par5',
      'rect1',
      'rect2',
      'rect3',
      'rect4',
      'rect5',
      'losange1',
      'losange2',
      'losange3',
      'losange4',
      'losange5',
      'carre1',
      'carre2',
      'carre3',
      'carre4',
      'carre5',
    ]
    let questionsIndirects = [
      'reciproque1',
      'reciproque2',
      'reciproque3',
      'reciproque4',
      'reciproque5',
      'reciproque6',
      'reciproque7',
      'reciproque8',
      'reciproque9',
      'reciproque10',
      'reciproque11',
      'reciproque12',
      'reciproque13',
      'reciproque14',
      'reciproque15',
      'reciproque16',
    ]
    let listeTypeQuestions = []
    if (this.sup === 1) {
      listeTypeQuestions = questionsDirects
    } else if (this.sup === 2) {
      listeTypeQuestions = questionsIndirects
    } else {
      questionsDirects = combinaisonListes(
        questionsDirects,
        this.nbQuestions / 2,
      )
      questionsIndirects = combinaisonListes(
        questionsIndirects,
        this.nbQuestions / 2,
      )
      for (let i = 0; i < this.nbQuestions; i++) {
        if (i % 2 === 0) {
          listeTypeQuestions.push(questionsDirects[i / 2])
        } else {
          listeTypeQuestions.push(questionsIndirects[(i - 1) / 2])
        }
      }
    }
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      this.autoCorrection[i] = {}
      switch (listeTypeQuestions[i]) {
        case 'par1':
          texte = 'Si un quadrilatère est un parallélogramme, alors $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: 'ses côtés opposés sont de même longueur.',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: 'ses côtés consécutifs sont de même longueur.',
              statut: false,
              feedback:
                "Cela peut-être vrai (dans le cas d'un losange ou d'un carré) mais ce n'est pas toujours le cas.",
            },
            {
              texte: 'ses côtés opposés sont parallèles.',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: 'ses côtés opposés sont perpendiculaires.',
              statut: false,
              feedback: 'Non, ils sont parallèles.',
            },
            {
              texte: 'ses côtés consécutifs sont parallèles.',
              statut: false,
              feedback: 'Non, ce sont les côtés opposés qui sont parallèles.',
            },
            {
              texte: 'ses côtés consécutifs sont perpendiculaires.',
              statut: false,
              feedback:
                "Cela peut-être vrai (dans le cas d'un rectangle ou d'un carré) mais ce n'est pas toujours le cas.",
            },
          ]
          texteCorr =
            'Un parallélogramme a ses côtés opposés de même longueur et parallèles.'
          break
        case 'par2':
          texte = 'Si un quadrilatère est un parallélogramme, alors $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: 'ses diagonales se coupent en leur milieu.',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: 'ses diagonales sont perpendiculaires.',
              statut: false,
              feedback:
                "Cela peut-être vrai (dans le cas d'un losange ou d'un carré) mais ce n'est pas toujours le cas.",
            },
            {
              texte: 'ses diagonales sont de même longueur.',
              statut: false,
              feedback:
                "Cela peut-être vrai (dans le cas d'un rectangle ou d'un carré) mais ce n'est pas toujours le cas.",
            },
          ]
          texteCorr =
            'Un parallélogramme a ses diagonales qui se coupent en leur milieu.'
          break
        case 'par3':
          texte = 'Si un quadrilatère est un parallélogramme, alors $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: 'ses angles opposés sont de même mesure.',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: 'ses angles opposés sont supplémentaires.',
              statut: false,
              feedback: 'Non, ils sont de même mesure.',
            },
            {
              texte: 'ses angles consécutifs sont supplémentaires.',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: 'ses angles consécutifs sont complémentaires.',
              statut: false,
              feedback: 'Non, ils sont supplémentaires.',
            },
            {
              texte: 'ses angles consécutifs sont égaux.',
              statut: false,
              feedback: 'Non, ils sont supplémentaires.',
            },
          ]
          texteCorr =
            'Un parallélogramme a ses angles opposés de même mesure et ses angles consécutifs supplémentaires.'
          break
        case 'par4':
          texte = 'Si un quadrilatère est un parallélogramme, alors $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte:
                "il a un centre de symétrie qui est le point d'intersection de ses diagonales.",
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: 'il a un axe de symétrie.',
              statut: false,
              feedback:
                "Non, cela peut être vrai (dans le cas d'un losange ou d'un carré) mais ce n'est pas toujours le cas.",
            },
            {
              texte: 'il a deux axes de symétrie.',
              statut: false,
              feedback:
                "Non, cela peut être vrai (dans le cas d'un rectangle ou d'un carré) mais ce n'est pas toujours le cas.",
            },
            {
              texte: 'il a quatre axes de symétrie.',
              statut: false,
              feedback:
                "Non, cela peut être vrai (dans le cas d'un carré) mais ce n'est pas toujours le cas.",
            },
          ]
          texteCorr =
            "Un parallélogramme a un centre de symétrie qui est le point d'intersection de ses diagonales."
          break
        case 'par5':
          texte = 'Si un quadrilatère est un parallélogramme, alors $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: "c'est un rectangle.",
              statut: false,
              feedback:
                "Tous les rectangles sont des parallélogrammes mais l'inverse n'est pas vrai !",
            },
            {
              texte: "c'est un losange.",
              statut: false,
              feedback:
                "Tous les losanges sont des parallélogrammes mais l'inverse n'est pas vrai !",
            },
            {
              texte: "c'est un carré.",
              statut: false,
              feedback:
                "Tous les carrés sont des parallélogrammes mais l'inverse n'est pas vrai !",
            },
          ]
          texteCorr =
            "Tous les rectangles, losanges et carrés sont des parallélogrammes mais l'inverse n'est pas vrai !"
          break
        case 'rect1':
          texte = 'Si un quadrilatère est un rectangle, alors $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: 'ses côtés opposés sont de même longueur.',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: 'ses côtés consécutifs sont de même longueur.',
              statut: false,
              feedback:
                "Cela peut être vrai si c'est un carré mais ce n'est pas toujours le cas.",
            },
            {
              texte: 'ses côtés opposés sont parallèles.',
              statut: true,
              feedback: "C'est vrai, comme pour tous les parallélogrammes.",
            },
            {
              texte: 'ses côtés opposés sont perpendiculaires.',
              statut: false,
              feedback: 'Non, ils sont parallèles.',
            },
            {
              texte: 'ses côtés consécutifs sont parallèles.',
              statut: false,
              feedback: 'Non, ils sont perpendiculaires.',
            },
            {
              texte: 'ses côtés consécutifs sont perpendiculaires.',
              statut: true,
              feedback: 'Correct !',
            },
          ]
          texteCorr =
            'Les rectangles ont leurs côtés opposés de même longueur et parallèles et leurs côtés consécutifs perpendiculaires.'
          break
        case 'rect2':
          texte = 'Si un quadrilatère est un rectangle, alors $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: 'ses diagonales se coupent en leur milieu.',
              statut: true,
              feedback: "C'est vrai comme pour tous les parallélogrammes.",
            },
            {
              texte: 'ses diagonales sont perpendiculaires.',
              statut: false,
              feedback:
                "Non, elles peuvent être perpendiculaires si c'est un carré mais ce n'est pas toujours le cas.",
            },
            {
              texte: 'ses diagonales sont de même longueur.',
              statut: true,
              feedback: 'Correct !',
            },
          ]
          texteCorr =
            'Les rectangles ont des diagonales qui se coupent en leur milieu et qui sont de même longueur.'
          break
        case 'rect3':
          texte = 'Si un quadrilatère est un rectangle, alors $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: 'ses angles opposés sont de même mesure.',
              statut: true,
              feedback: "C'est vrai, tous ses angles mesurent 90°.",
            },
            {
              texte: 'ses angles opposés sont supplémentaires.',
              statut: true,
              feedback:
                "C'est vrai, tous ses angles mesurent 90°, donc la somme de la mesure de deux angles opposés est égale à 180°.",
            },
            {
              texte: 'ses angles consécutifs sont supplémentaires.',
              statut: true,
              feedback:
                "C'est vrai, tous ses angles mesurent 90°, donc la somme de la mesure de deux angles supplémentaires est égale à 180°.",
            },
            {
              texte: 'ses angles consécutifs sont complémentaires.',
              statut: false,
              feedback: 'Non, ils sont supplémentaires.',
            },
            {
              texte: 'ses angles consécutifs sont égaux.',
              statut: true,
              feedback: "C'est vrai, tous ses angles mesurent 90°.",
            },
          ]
          texteCorr =
            'Un rectangle a ses angles opposés et ses angles consécutifs de même mesure et supplémentaires car ils mesurent tous 90°.'
          break
        case 'rect4':
          texte = 'Si un quadrilatère est un rectangle, alors $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte:
                "il a un centre de symétrie qui est le point d'intersection de ses diagonales.",
              statut: true,
              feedback: "C'est vrai, comme pour tous les parallélogrammes.",
            },
            {
              texte: "il n'a qu'un seul axe de symétrie.",
              statut: false,
              feedback: "Non, il en a plus d'un.",
            },
            {
              texte: 'il a deux axes de symétrie.',
              statut: true,
              feedback:
                'Oui, les axes de symétrie sont les médiatrices de ses côtés.',
            },
            {
              texte: 'il a quatre axes de symétrie.',
              statut: false,
              feedback:
                "Non, cela peut être vrai (dans le cas d'un carré) mais ce n'est pas toujours le cas.",
            },
          ]
          texteCorr =
            "Un rectangle a un centre de symétrie qui est le point d'intersection de ses diagonales et deux axes de symétrie qui sont les médiatrices de ses côtés."
          break
        case 'rect5':
          texte = 'Si un quadrilatère est un rectangle, alors $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: "c'est un parallélogramme.",
              statut: true,
              feedback:
                'Tous les rectangles sont des parallélogrammes car ses côtés opposés sont parallèles.',
            },
            {
              texte: "c'est un losange.",
              statut: false,
              feedback:
                "Il peut avoir sa longueur et sa largeur de même longueur mais ce n'est pas toujours le cas.",
            },
            {
              texte: "c'est un carré.",
              statut: false,
              feedback:
                "Il peut avoir sa longueur et sa largeur de même longueur mais ce n'est pas toujours le cas.",
            },
          ]
          texteCorr =
            "Tous les rectangles sont des parallélogrammes car ses côtés opposés sont parallèles. Certains rectangles particuliers peuvent aussi être des losanges ou des carrés mais ce n'est pas toujours vrai."
          break
        case 'losange1':
          texte = 'Si un quadrilatère est un losange, alors $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: 'ses côtés opposés sont de même longueur.',
              statut: true,
              feedback: 'Oui car tous ses côtés sont de même longueur.',
            },
            {
              texte: 'ses côtés consécutifs sont de même longueur.',
              statut: true,
              feedback: 'Oui car tous ses côtés sont de même longueur.',
            },
            {
              texte: 'ses côtés opposés sont parallèles.',
              statut: true,
              feedback: "C'est vrai, comme pour tous les parallélogrammes.",
            },
            {
              texte: 'ses côtés opposés sont perpendiculaires.',
              statut: false,
              feedback: 'Non, ils sont parallèles.',
            },
            {
              texte: 'ses côtés consécutifs sont parallèles.',
              statut: false,
              feedback: '',
            },
            {
              texte: 'ses côtés consécutifs sont perpendiculaires.',
              statut: false,
              feedback:
                "Cela peut être vrai (dans le cas d'un carré) mais ce n'est pas toujours le cas.",
            },
          ]
          texteCorr =
            'Les losanges ont leurs côtés opposés parallèles et tous leurs côtés de même longueur.'
          break
        case 'losange2':
          texte = 'Si un quadrilatère est un losange, alors $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: 'ses diagonales se coupent en leur milieu.',
              statut: true,
              feedback: "C'est vrai comme pour tous les parallélogrammes.",
            },
            {
              texte: 'ses diagonales sont perpendiculaires.',
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: 'ses diagonales sont de même longueur.',
              statut: false,
              feedback:
                "Cela peut être vrai (dans le cas d'un carré) mais ce n'est pas toujours le cas.",
            },
          ]
          texteCorr =
            'Les losanges ont des diagonales qui se coupent en leur milieu et qui sont perpendiculaires.'
          break
        case 'losange3':
          texte = 'Si un quadrilatère est un losange, alors $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: 'ses angles opposés sont de même mesure.',
              statut: true,
              feedback: "C'est vrai, comme pour tous les parallélogrammes.",
            },
            {
              texte: 'ses angles opposés sont supplémentaires.',
              statut: false,
              feedback: 'Non, ils sont de même mesure.',
            },
            {
              texte: 'ses angles consécutifs sont supplémentaires.',
              statut: true,
              feedback: "C'est vrai, comme pour tous les parallélogrammes.",
            },
            {
              texte: 'ses angles consécutifs sont complémentaires.',
              statut: false,
              feedback: 'Non, ils sont supplémentaires.',
            },
            {
              texte: 'ses angles consécutifs sont égaux.',
              statut: false,
              feedback: '',
            },
          ]
          texteCorr =
            'Un losange a ses angles opposés de même mesure et ses angles consécutifs supplémentaires comme pour tous les parallélogrammes.'
          break
        case 'losange4':
          texte = 'Si un quadrilatère est un losange, alors $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte:
                "il a un centre de symétrie qui est le point d'intersection de ses diagonales.",
              statut: true,
              feedback: "C'est vrai, comme pour tous les parallélogrammes.",
            },
            {
              texte: "il n'a qu'un seul axe de symétrie.",
              statut: false,
              feedback: "Non, il en a plus d'un.",
            },
            {
              texte: 'il a deux axes de symétrie.',
              statut: true,
              feedback: 'Oui, les axes de symétrie sont ses diagonales.',
            },
            {
              texte: 'il a quatre axes de symétrie.',
              statut: false,
              feedback:
                "Non, cela peut être vrai (dans le cas d'un carré) mais ce n'est pas toujours le cas.",
            },
          ]
          texteCorr =
            "Un losange a un centre de symétrie qui est le point d'intersection de ses diagonales et deux axes de symétrie qui sont ses diagonales."
          break
        case 'losange5':
          texte = 'Si un quadrilatère est un losange, alors $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: "c'est un parallélogramme.",
              statut: true,
              feedback:
                'Tous les losanges sont des parallélogrammes car ses côtés opposés sont parallèles.',
            },
            {
              texte: "c'est un rectangle.",
              statut: false,
              feedback:
                "Il peut avoir 4 angles droits mais ce n'est pas toujours le cas.",
            },
            {
              texte: "c'est un carré.",
              statut: false,
              feedback:
                "Il peut avoir 4 angles droits mais ce n'est pas toujours le cas.",
            },
          ]
          texteCorr =
            "Tous les losanges sont des parallélogrammes car ses côtés opposés sont parallèles. Certains losanges particuliers peuvent aussi être des carrés mais ce n'est pas toujours vrai."
          break
        case 'carre1':
          texte = 'Si un quadrilatère est un carré, alors $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: 'ses côtés opposés sont de même longueur.',
              statut: true,
              feedback: 'Oui car tous ses côtés sont de même longueur.',
            },
            {
              texte: 'ses côtés consécutifs sont de même longueur.',
              statut: true,
              feedback: 'Oui car tous ses côtés sont de même longueur.',
            },
            {
              texte: 'ses côtés opposés sont parallèles.',
              statut: true,
              feedback: "C'est vrai, comme pour tous les parallélogrammes.",
            },
            {
              texte: 'ses côtés opposés sont perpendiculaires.',
              statut: false,
              feedback: 'Non, ils sont parallèles.',
            },
            {
              texte: 'ses côtés consécutifs sont parallèles.',
              statut: false,
              feedback: '',
            },
            {
              texte: 'ses côtés consécutifs sont perpendiculaires.',
              statut: true,
              feedback: 'Oui, il a 4 angles droits.',
            },
          ]
          texteCorr =
            'Les carrés ont leurs côtés opposés parallèles, tous leurs côtés de même longueur et leurs côtés consécutifs perpendiculaire.'
          break
        case 'carre2':
          texte = 'Si un quadrilatère est un carré, alors $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: 'ses diagonales se coupent en leur milieu.',
              statut: true,
              feedback: "C'est vrai comme pour tous les parallélogrammes.",
            },
            {
              texte: 'ses diagonales sont perpendiculaires.',
              statut: true,
              feedback: "C'est vrai comme pour tous les losanges.",
            },
            {
              texte: 'ses diagonales sont de même longueur.',
              statut: true,
              feedback: "C'est vrai comme pour tous les rectangles.",
            },
          ]
          texteCorr =
            'Les carrés ont des diagonales qui se coupent en leur milieu, de même longueur (car ce sont des rectangles particuliers) et qui sont perpendiculaires (car ce sont des losanges particuliers).'
          break
        case 'carre3':
          texte = 'Si un quadrilatère est un carré, alors $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: 'ses angles opposés sont de même mesure.',
              statut: true,
              feedback: "C'est vrai, tous ses angles mesurent 90°.",
            },
            {
              texte: 'ses angles opposés sont supplémentaires.',
              statut: true,
              feedback: "C'est vrai, tous ses angles mesurent 90°.",
            },
            {
              texte: 'ses angles consécutifs sont supplémentaires.',
              statut: true,
              feedback: "C'est vrai, tous ses angles mesurent 90°.",
            },
            {
              texte: 'ses angles consécutifs sont complémentaires.',
              statut: false,
              feedback: 'Non, ils sont supplémentaires.',
            },
            {
              texte: 'ses angles consécutifs sont égaux.',
              statut: true,
              feedback: "C'est vrai, tous ses angles mesurent 90°.",
            },
          ]
          texteCorr =
            'Un carré a ses angles opposés et supplémentaires de même mesure et ses angles consécutifs supplémentaires.'
          break
        case 'carre4':
          texte = 'Si un quadrilatère est un carré, alors $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte:
                "il a un centre de symétrie qui est le point d'intersection de ses diagonales.",
              statut: true,
              feedback: "C'est vrai, comme pour tous les parallélogrammes.",
            },
            {
              texte: "il n'a qu'un seul axe de symétrie.",
              statut: false,
              feedback: "Non, il en a plus d'un.",
            },
            {
              texte: "il n'a que deux axes de symétrie.",
              statut: false,
              feedback: 'Non, il en a plus de deux.',
            },
            {
              texte: 'il a quatre axes de symétrie.',
              statut: true,
              feedback:
                "C'est un losange particulier donc ses diagonales sont des axes de symétrie. C'est un rectangle particulier donc ses médiatrices sont des axes de symétrie. Il a donc 4 axes de symétrie.",
            },
          ]
          texteCorr =
            "Un carré a un centre de symétrie qui est le point d'intersection de ses diagonales et quatre axes de symétrie qui sont ses diagonales ainsi que les médiatrices de ses côtés."
          break
        case 'carre5':
          texte = 'Si un quadrilatère est un carré, alors $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: "c'est un parallélogramme.",
              statut: true,
              feedback:
                'Tous les carrés sont des parallélogrammes car ses côtés opposés sont parallèles.',
            },
            {
              texte: "c'est un rectangle.",
              statut: true,
              feedback: 'Oui, car il a 4 angles droits.',
            },
            {
              texte: "c'est un losange.",
              statut: true,
              feedback: 'Oui, car il a 4 côtés de même longueur.',
            },
          ]
          texteCorr =
            'Tous les carrés sont des parallélogrammes, des losanges et des rectangles.'
          break
        case 'reciproque1':
          texte =
            'Si un quadrilatère non croisé a deux côtés opposés parallèles, alors on est sûr que $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: "c'est un parallélogramme.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un parallélogramme.",
            },
            {
              texte: "c'est un rectangle.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un rectangle.",
            },
            {
              texte: "c'est un losange.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un losange.",
            },
            {
              texte: "c'est un carré.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un carré.",
            },
          ]
          texteCorr =
            "Si un quadrilatère non croisé a deux côtés opposés parallèles, alors c'est un trapèze."
          break
        case 'reciproque2':
          texte =
            'Si un quadrilatère non croisé a deux côtés opposés de même longueur, alors on est sûr que $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: "c'est un parallélogramme.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un parallélogramme.",
            },
            {
              texte: "c'est un rectangle.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un rectangle.",
            },
            {
              texte: "c'est un losange.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un losange.",
            },
            {
              texte: "c'est un carré.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un carré.",
            },
          ]
          texteCorr =
            'Si un quadrilatère non croisé a deux côtés opposés de même longueur, alors cela peut être un quadrilatère quelconque.'
          break
        case 'reciproque3':
          texte =
            'Si un quadrilatère non croisé a deux côtés consécutifs perpendiculaires, alors on est sûr que $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: "c'est un parallélogramme.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un parallélogramme.",
            },
            {
              texte: "c'est un rectangle.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un rectangle.",
            },
            {
              texte: "c'est un losange.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un losange.",
            },
            {
              texte: "c'est un carré.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un carré.",
            },
          ]
          texteCorr =
            'Si un quadrilatère non croisé a deux côtés consécutifs perpendiculaires, alors cela peut être un quadrilatère quelconque.'
          break
        case 'reciproque4':
          texte =
            'Si un quadrilatère non croisé a deux côtés consécutifs de même longueur, alors on est sûr que $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: "c'est un parallélogramme.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un parallélogramme.",
            },
            {
              texte: "c'est un rectangle.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un rectangle.",
            },
            {
              texte: "c'est un losange.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un losange.",
            },
            {
              texte: "c'est un carré.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un carré.",
            },
          ]
          texteCorr =
            'Si un quadrilatère non croisé a deux côtés consécutifs de même longueur, alors cela peut être un quadrilatère quelconque.'
          break
        case 'reciproque5':
          texte =
            'Si un quadrilatère non croisé a deux côtés consécutifs perpendiculaires et de même longueur, alors on est sûr que $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: "c'est un parallélogramme.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un parallélogramme.",
            },
            {
              texte: "c'est un rectangle.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un rectangle.",
            },
            {
              texte: "c'est un losange.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un losange.",
            },
            {
              texte: "c'est un carré.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un carré.",
            },
          ]
          texteCorr =
            'Si un quadrilatère non croisé a deux côtés consécutifs perpendiculaires de même longueur, alors cela peut être un quadrilatère quelconque.'
          break
        case 'reciproque6':
          texte =
            'Si un parallélogramme a deux côtés consécutifs perpendiculaires, alors on est sûr que $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: "c'est un parallélogramme.",
              statut: true,
              feedback: '',
            },
            {
              texte: "c'est un rectangle.",
              statut: true,
              feedback:
                "Comme les angles opposés d'un parallélogramme sont de même mesure, tous ses angles auront une mesure de 90°.",
            },
            {
              texte: "c'est un losange.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un losange.",
            },
            {
              texte: "c'est un carré.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un carré.",
            },
          ]
          texteCorr =
            "Si un parallélogramme a deux côtés consécutifs perpendiculaires, alors on est sûr que c'est un rectangle."
          break
        case 'reciproque7':
          texte =
            'Si un parallélogramme a deux côtés consécutifs de même longueur, alors on est sûr que $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: "c'est un parallélogramme.",
              statut: true,
              feedback: '',
            },
            {
              texte: "c'est un rectangle.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un rectangle.",
            },
            {
              texte: "c'est un losange.",
              statut: true,
              feedback:
                "Comme les côtés opposés d'un parallélogramme sont de même longueur, tous ses côtés auront la même longueur.",
            },
            {
              texte: "c'est un carré.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un carré.",
            },
          ]
          texteCorr =
            "Si un parallélogramme a deux côtés consécutifs de même longueur, alors on est sûr que c'est un losange."
          break
        case 'reciproque8':
          texte =
            'Si un parallélogramme a deux côtés consécutifs perpendiculaires et de même longueur, alors on est sûr que $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: "c'est un parallélogramme.",
              statut: true,
              feedback: '',
            },
            {
              texte: "c'est un rectangle.",
              statut: true,
              feedback:
                "Comme les angles opposés d'un parallélogramme sont de même mesure, tous ses angles auront une mesure de 90°.",
            },
            {
              texte: "c'est un losange.",
              statut: true,
              feedback:
                "Comme les côtés opposés d'un parallélogramme sont de même longueur, tous ses côtés auront la même longueur.",
            },
            {
              texte: "c'est un carré.",
              statut: true,
              feedback:
                "Comme c'est un rectangle et un losange,, alors c'est un carré.",
            },
          ]
          texteCorr =
            "Si un parallélogramme a deux côtés consécutifs perpendiculaires et de même longueur, alors on est sûr que c'est un rectangle, un losange et donc un carré."
          break
        case 'reciproque9':
          texte =
            'Si un quadrilatère non croisé a ses diagonales perpendiculaires, alors on est sûr que $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: "c'est un parallélogramme.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un parallélogramme.",
            },
            {
              texte: "c'est un rectangle.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un rectangle.",
            },
            {
              texte: "c'est un losange.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un losange.",
            },
            {
              texte: "c'est un carré.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un carré.",
            },
          ]
          texteCorr =
            'Si un quadrilatère non croisé a ses diagonales perpendiculaires, alors cela peut être un quadrilatère quelconque.'
          break
        case 'reciproque10':
          texte =
            'Si un quadrilatère non croisé a ses diagonales de même longueur, alors on est sûr que $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: "c'est un parallélogramme.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un parallélogramme.",
            },
            {
              texte: "c'est un rectangle.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un rectangle.",
            },
            {
              texte: "c'est un losange.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un losange.",
            },
            {
              texte: "c'est un carré.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un carré.",
            },
          ]
          texteCorr =
            'Si un quadrilatère non croisé a ses diagonales de même longueur, alors cela peut être un quadrilatère quelconque.'
          break
        case 'reciproque11':
          texte =
            'Si un parallélogramme a ses diagonales perpendiculaires, alors on est sûr que $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: "c'est un parallélogramme.",
              statut: true,
              feedback: '',
            },
            {
              texte: "c'est un rectangle.",
              statut: false,
              feedback: '',
            },
            {
              texte: "c'est un losange.",
              statut: true,
              feedback: 'Correct ! ',
            },
            {
              texte: "c'est un carré.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un carré.",
            },
          ]
          texteCorr =
            "Si un parallélogramme a ses diagonales perpendiculaires, alors c'est un losange."
          break
        case 'reciproque12':
          texte =
            'Si un parallélogramme a ses diagonales de même longueur, alors on est sûr que $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: "c'est un parallélogramme.",
              statut: true,
              feedback: '',
            },
            {
              texte: "c'est un rectangle.",
              statut: true,
              feedback: 'Correct !',
            },
            {
              texte: "c'est un losange.",
              statut: false,
              feedback: '',
            },
            {
              texte: "c'est un carré.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un carré.",
            },
          ]
          texteCorr =
            "Si un parallélogramme a ses diagonales de même longueur, alors c'est un rectangle."
          break
        case 'reciproque13':
          texte =
            'Si un quadrilatère non croisé a ses angles opposés de même mesure, alors on est sûr que $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: "c'est un parallélogramme.",
              statut: true,
              feedback: '',
            },
            {
              texte: "c'est un rectangle.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un rectangle.",
            },
            {
              texte: "c'est un losange.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un losange.",
            },
            {
              texte: "c'est un carré.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un carré.",
            },
          ]
          texteCorr =
            "Tous les parallélogrammes ont leurs angles opposés de même mesure donc cela ne nous suffit pas pour en déduire que c'est un parallélogramme particulier."
          break
        case 'reciproque14':
          texte =
            'Si un quadrilatère non croisé a ses angles consécutifs supplémentaires, alors on est sûr que $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: "c'est un parallélogramme.",
              statut: true,
              feedback: '',
            },
            {
              texte: "c'est un rectangle.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un rectangle.",
            },
            {
              texte: "c'est un losange.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un losange.",
            },
            {
              texte: "c'est un carré.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il nous faudrait d'autres informations pour être certain que c'est un carré.",
            },
          ]
          texteCorr =
            "Tous les parallélogrammes ont leurs angles consécutifs supplémentaires donc cela ne nous suffit pas pour en déduire que c'est un parallélogramme particulier."
          break
        case 'reciproque15':
          texte =
            'Si un parallélogramme a ses diagonales perpendiculaires et de même longueur, alors on est sûr que $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: "c'est un parallélogramme.",
              statut: true,
              feedback: '',
            },
            {
              texte: "c'est un rectangle.",
              statut: true,
              feedback:
                'Car un parallélogramme qui a ses diagonales de même longueur est un rectangle.',
            },
            {
              texte: "c'est un losange.",
              statut: true,
              feedback:
                'Car un parallélogramme qui a ses diagonales perpendiculaires est un losange.',
            },
            {
              texte: "c'est un carré.",
              statut: true,
              feedback: "Car c'est un rectangle et un losange.",
            },
          ]
          texteCorr =
            "Si un parallélogramme a ses diagonales perpendiculaires et de même longueur, alors c'est un rectangle et un losange donc c'est un carré."
          break
        case 'reciproque16':
          texte =
            'Si un quadrilatère non croisé a ses diagonales perpendiculaires et de même longueur, alors on est sûr que $\\ldots$'
          this.autoCorrection[i].propositions = [
            {
              texte: "c'est un parallélogramme.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il faudrait que les diagonales se coupent en leur milieu pour être certain que c'est un parallélogramme.",
            },
            {
              texte: "c'est un rectangle.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il faudrait que les diagonales se coupent en leur milieu pour être certain que c'est un rectangle.",
            },
            {
              texte: "c'est un losange.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il faudrait que les diagonales se coupent en leur milieu pour être certain que c'est un losange.",
            },
            {
              texte: "c'est un carré.",
              statut: false,
              feedback:
                "Ce n'est pas suffisant, il faudrait que les diagonales se coupent en leur milieu pour être certain que c'est un carré.",
            },
          ]
          texteCorr =
            'Si un quadrilatère a ses diagonales perpendiculaires et de même longueur, alors cela peut être un quadrilatère quelconque (il faudrait en plus que les diagonales se coupent en leur milieu pour que ce soit un carré).'
          break
      }
      const propositions = this.autoCorrection[i].propositions
      if (propositions?.every((proposition) => !proposition.statut)) {
        propositions.push({
          texte: 'Aucune de ces réponses.',
          statut: true,
          feedback: 'Correct !',
        })
      }
      this.autoCorrection[i].options = {
        ordered: true,
        vertical: true,
      }
      const qcm = propositionsQcm(this, i)
      texte += qcm.texte
      if (!this.interactif || !context.isHtml) {
        texteCorr += qcm.texteCorr
      }
      if (this.sup2 === false) {
        texte = texte.replaceAll(' non croisé', '')
      }

      // Si la question n'a jamais été posée, on l'enregistre
      if (this.questionJamaisPosee(i, listeTypeQuestions[i])) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
    this.besoinFormulaireNumerique = [
      'Type de questions',
      3,
      "1: Si un quadrilatère est un ..., alors ...\n2: Si un parallélogramme a ..., alors c'est un ...\n3: Mélange des deux cas précédents",
    ]
    this.besoinFormulaire2CaseACocher = ['Préciser « non croisé »']
  }
}
