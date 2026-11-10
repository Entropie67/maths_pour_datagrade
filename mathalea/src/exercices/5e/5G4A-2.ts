import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import {
  droite,
  droiteParPointEtPente,
  droiteParPointEtPerpendiculaire,
  labelOnLine,
} from '../../lib/2d/droites'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { Latex2d } from '../../lib/2d/textes'
import { pointSurDroite } from '../../lib/2d/utilitairesPoint'
import { bleuMathalea } from '../../lib/colors'
import { combinaisonListes, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre =
  'Se servir des relations entre perpendicularité et parallélisme'

export const dateDePublication = '11/09/2022'

/**
 * d0 et d1 sont parallèles données par l'énoncé
 * d1 et d2 sont perpendiculaires à d3
 * d4 perpendiculaire à d3 non marquée
 * d5 (et d6 ?) random
 *
 * Question :
 * Donner tous les couples de droites parallèles en justifiant.
 * Ou
 * Donner tous les couples de droites perpendiculaires en justifiant
 * Refactoring pour les noms des droites Mickael Guironnet
 * @author Guillaume Valmont

*/
export const uuid = '5bac3'

export const refs = {
  'fr-fr': ['5G4A-2'],
  'fr-2016': ['6G52', '5G33-1'],
  'fr-ch': ['9R1ES1B-6', '9R2ES1B-6', '9R3ES1B-6', 'PRQES01A-8', 'PRQES04A-6'],
}
export default class TracerCarresRectangleslongueurDonnees extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 2

    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = false

    this.besoinFormulaireNumerique = [
      'Consigne',
      3,
      '1 : Droites parallèles\n2 : Droites perpendiculaires\n3 : Mélange',
    ]
    this.sup = 3
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles = ['Parallèles', 'Perpendiculaires']
    if (this.sup === 1) typesDeQuestionsDisponibles = ['Parallèles']
    if (this.sup === 2) typesDeQuestionsDisponibles = ['Perpendiculaires']

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const objetsEnonce = []
      const noms = shuffle([
        '(d_1)',
        '(d_2)',
        '(d_3)',
        '(d_4)',
        '(d_5)',
        '(d_6)',
        '(d_7)',
      ])
      const couleurs = shuffle([
        'black',
        bleuMathalea,
        'green',
        '#2471A3',
        'purple',
        'red',
        'brown',
      ])
      const couleur = (indice: number) => {
        // La fonction permet d'ajouter facilement une condition en fonction du contexte si besoin
        return context.isHtml ? couleurs[indice] : 'black'
      }
      const x: number[] = []
      const y: number[] = []
      for (let i = 0; i < 6; i++) {
        x.push(randint(-3, 3, x))
        y.push(randint(-3, 3, y))
      }
      for (let i = 0; i < 6; i++) {
        x[i] = x[i] * 2 + randint(-10, 10) / 20
        y[i] = y[i] * 2 + randint(-10, 10) / 20
      }
      const P03 = pointAbstrait(x[0], y[0]) //, texDroiteFigure(0), 'above left')
      const P13 = pointAbstrait(x[1], y[0] + randint(-10, 10) / 10) //, texDroiteFigure(1), 'above left')
      const d3 = droite(P03, P13, '', couleur(3))
      const P23 = pointSurDroite(d3, x[2]) //, texDroiteFigure(2), 'above left')
      const P43 = pointSurDroite(d3, x[3]) //, texDroiteFigure(4), 'above left')
      const P53 = pointSurDroite(d3, x[4]) //, texDroiteFigure(5), 'above left')
      const P63 = pointSurDroite(d3, x[5]) //, texDroiteFigure(6), 'above left')
      // const P3 = pointSurDroite(d3, Math.max(P03.x, P13.x, P23.x, P43.x, P53.x, P63.x) + 1) //, texDroiteFigure(3), 'right')
      const d0 = droiteParPointEtPerpendiculaire(P03, d3, '', couleur(0))
      const d1 = droiteParPointEtPerpendiculaire(P13, d3, '', couleur(1))
      const d2 = droiteParPointEtPerpendiculaire(P23, d3, '', couleur(2))
      const d4 = droiteParPointEtPerpendiculaire(P43, d3, '', couleur(4))
      const d5 = droiteParPointEtPente(P53, randint(-3, 3, [0]), '', couleur(5))
      const d6 = droiteParPointEtPente(P63, randint(-3, 3, [0]), '', couleur(6))
      const P1 = pointSurDroite(d1, 10)
      const P2 = pointSurDroite(d2, 10)
      const A13 = codageAngleDroit(
        P1,
        P13,
        P43,
        couleur(1),
        0.7,
        1,
        0.6,
        couleur(1),
        0.2,
      )
      const A23 = codageAngleDroit(
        P2,
        P23,
        P43,
        couleur(2),
        0.7,
        1,
        0.6,
        couleur(2),
        0.2,
      )
      objetsEnonce.push(d0, d1, d2, d3, d4, d5, d6, A13, A23) //, labelLatexPoint({ points: [P03, P13, P23, P43, P53, P63, P3] }))
      // Les lignes ci-dessous permettent d'avoir un affichage aux dimensions optimisées
      const xmin = Math.min(P03.x, P13.x, P23.x, P43.x, P53.x, P63.x) - 3
      const xmax = Math.max(P03.x, P13.x, P23.x, P43.x, P53.x, P63.x) + 3
      const ymin = Math.min(P03.y, P13.y, P23.y, P43.y, P53.y, P63.y) - 4
      const ymax = Math.max(P03.y, P13.y, P23.y, P43.y, P53.y, P63.y) + 4

      context.fenetreMathalea2d = [xmin, ymin, xmax, ymax] // important pour la position des labels
      const d5nom = labelOnLine(d5, noms[5], {
        color: couleur(5),
        letterSize: 'footnotesize',
      })
      if (!(d5nom instanceof Latex2d)) {
        window.notify("d5nom n'est pas une instance de Latex2d", { d5nom })
        continue
      }
      const d6nom = labelOnLine(d6, noms[6], {
        color: couleur(6),
        letterSize: 'footnotesize',
        usedPosition: [d5nom],
      })
      if (!(d6nom instanceof Latex2d)) {
        window.notify("d6nom n'est pas une instance de Latex2d", { d6nom })
        continue
      }
      const d0nom = labelOnLine(d0, noms[0], {
        color: couleur(0),
        letterSize: 'footnotesize',
        usedPosition: [d5nom, d6nom],
      })
      if (!(d0nom instanceof Latex2d)) {
        window.notify("d0nom n'est pas une instance de Latex2d", { d0nom })
        continue
      }
      const d1nom = labelOnLine(d1, noms[1], {
        color: couleur(1),
        letterSize: 'footnotesize',
        usedPosition: [d5nom, d6nom, d0nom],
      })
      if (!(d1nom instanceof Latex2d)) {
        window.notify("d1nom n'est pas une instance de Latex2d", { d1nom })
        continue
      }
      const d2nom = labelOnLine(d2, noms[2], {
        color: couleur(2),
        letterSize: 'footnotesize',
        usedPosition: [d5nom, d6nom, d0nom, d1nom],
      })
      if (!(d2nom instanceof Latex2d)) {
        window.notify("d2nom n'est pas une instance de Latex2d", { d2nom })
        continue
      }
      const d4nom = labelOnLine(d4, noms[4], {
        color: couleur(4),
        letterSize: 'footnotesize',
        usedPosition: [d5nom, d6nom, d0nom, d1nom, d2nom],
      })
      if (!(d4nom instanceof Latex2d)) {
        window.notify("d4nom n'est pas une instance de Latex2d", { d4nom })
        continue
      }
      const d3nom = labelOnLine(d3, noms[3], {
        color: couleur(3),
        letterSize: 'footnotesize',
        usedPosition: [d5nom, d6nom, d0nom, d1nom, d2nom, d4nom],
      })

      objetsEnonce.push(d0nom, d1nom, d2nom, d3nom, d4nom, d5nom, d6nom)
      // paramètres de la fenêtre Mathalea2d pour l'énoncé normal
      const params = { xmin, ymin, xmax, ymax, pixelsParCm: 20, scale: 1 }
      // On ajoute au texte de la correction, la figure de la correction
      const texDroiteEnonce = (indice: number) => {
        return `$${miseEnEvidence(noms[indice], couleur(indice))}$`
      }
      texte = `Les droites ${texDroiteEnonce(0)} et ${texDroiteEnonce(1)} sont parallèles.<br>`
      switch (listeTypeDeQuestions[i]) {
        case 'Parallèles':
          texte +=
            'Donner tous les couples de droites parallèles en justifiant.'
          texteCorr = `D'après l'énoncé, les droites ${texDroiteEnonce(0)} et ${texDroiteEnonce(1)} sont parallèles.<br><br>`
          texteCorr += `Les droites ${texDroiteEnonce(2)} et ${texDroiteEnonce(1)} sont perpendiculaires à la même droite ${texDroiteEnonce(3)}.<br>`
          texteCorr += this.correctionDetaillee
            ? 'Or, si deux droites sont perpendiculaires à une même droite alors elles sont parallèles entre elles.<br>'
            : ''
          texteCorr += `Donc ${texteEnCouleurEtGras(`${texDroiteEnonce(2)} et ${texDroiteEnonce(1)}`)} sont parallèles.<br><br>`
          texteCorr += `Les droites ${texDroiteEnonce(0)} et ${texDroiteEnonce(2)} sont parallèles à la même droite ${texDroiteEnonce(1)}.<br>`
          texteCorr += this.correctionDetaillee
            ? 'Or, si deux droites sont parallèles à une même troisième droite alors elles sont parallèles entre elles.<br>'
            : ''
          texteCorr += `Donc ${texteEnCouleurEtGras(`${texDroiteEnonce(0)} et ${texDroiteEnonce(2)}`)} sont parallèles.<br>`
          texteCorr += `<br>Remarque :<br>La droite ${texDroiteEnonce(4)} semble elle aussi être parallèle aux autres mais rien ne nous permet de l'affirmer.<br>Il aurait fallu que l'énoncé dise qu'elle est parallèle à une autre ou qu'un angle droit soit marqué par exemple.`
          break
        case 'Perpendiculaires':
        default:
          texte +=
            'Donner tous les couples de droites perpendiculaires en justifiant.'
          texteCorr = `Les codages permettent d'affirmer que les droites ${texteEnCouleurEtGras(`${texDroiteEnonce(1)}`)} et ${texteEnCouleurEtGras(`${texDroiteEnonce(2)}`)} sont toutes les deux perpendiculaires à ${texteEnCouleurEtGras(`${texDroiteEnonce(3)}`)}.<br><br>`
          texteCorr += `Les droites ${texDroiteEnonce(0)} et ${texDroiteEnonce(1)} sont parallèles (c'est l'énoncé qui le dit) et ${texDroiteEnonce(3)} est perpendiculaire à ${texDroiteEnonce(1)}`

          texteCorr += this.correctionDetaillee
            ? ".<br>Or, si deux droites sont parallèles et si une troisième droite est perpendiculaire à l'une alors elle est perpendiculaire à l'autre.<br>D"
            : ' d'
          texteCorr += `onc ${texteEnCouleurEtGras(`${texDroiteEnonce(3)}`)} est aussi perpendiculaire à ${texteEnCouleurEtGras(`${texDroiteEnonce(0)}`)}.<br>`
          texteCorr += `<br>Remarque :<br>La droite ${texDroiteEnonce(4)} semble elle aussi être perpendiculaire à ${texDroiteEnonce(3)} mais rien ne nous permet de l'affirmer.<br>Il aurait fallu que l'énoncé dise qu'elle est parallèle à une autre ou qu'un angle droit soit marqué par exemple.`
          break
      }
      texte +=
        '<br>' +
        (context.vue === 'diap' ? '<center>' : '') +
        mathalea2d(params, objetsEnonce) +
        (context.vue === 'diap' ? '</center>' : '')
      // Si la question n'a jamais été posée, on l'enregistre
      if (this.questionJamaisPosee(i, String(x), String(y))) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
