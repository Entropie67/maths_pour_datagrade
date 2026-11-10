import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { droite } from '../../lib/2d/droites'
import { repere } from '../../lib/2d/reperes'
import { texteParPosition } from '../../lib/2d/textes'
import { pointSurDroite } from '../../lib/2d/utilitairesPoint'
import { bleuMathalea } from '../../lib/colors'
import { troisColonnes } from '../../lib/format/miseEnPage'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice, shuffle2tableaux } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../lib/outils/ecritures'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Associer des systèmes d'équations à leur représentation graphique"
export const interactifReady = true

export const dateDePublication = '20/04/2024'
/**
 *
 * @author Nathan Scheinmann
 */
// TODO à passer en ts, nouvelle classe exercice et interactif avec handleAnswer
export const uuid = '81fd6'
export const refs = {
  'fr-fr': ['2G34-9'],
  'fr-ch': ['1mSE-1', '11LSFA4G-3'],
}

export default class AssocierGraphiqueSysteme extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
    this.correctionDetaillee = true
    this.correctionDetailleeDisponible = true
    // this.besoinFormulaireNumerique = ['Type de questions', 1, '1 : Niveau 1\n2 : Niveau 2\n3 : Mélange']
  }

  nouvelleVersion() {
    const listeFractions = [
      [1, 3],
      [2, 3],
      [3, 7],
      [2, 7],
      [4, 3],
      [3, 5],
      [4, 7],
      [1, 5],
      [4, 5],
      [3, 4],
      [1, 4],
      [2, 5],
      [5, 3],
      [6, 5],
      [1, 6],
      [5, 6],
      [1, 7],
    ]
    // const listeTypeDeQuestions = combinaisonListes(typesDeQuestionsDisponibles, this.nbQuestions)
    for (
      let i = 0,
        a,
        b,
        d,
        a2,
        a3,
        b2,
        b3,
        d2,
        d3,
        c,
        c2,
        c3,
        a4,
        b4,
        c4,
        d4,
        a4Frac,
        a5,
        b5,
        c5,
        d5,
        a5Frac,
        a6,
        b6,
        c6,
        d6,
        a6Frac,
        r,
        t1,
        t2,
        t3,
        s1,
        s2,
        s3,
        s4,
        s5,
        s6,
        aFrac,
        a2Frac,
        a3Frac,
        pente1,
        pente2,
        pente3,
        pente4,
        pente5,
        pente6,
        texte,
        texteCorr,
        lsys,
        ss1,
        ss2,
        ss3,
        vari,
        lass,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const eqToLatex = function (
        vect: Array<number | FractionEtendue>,
        nomVal: Array<string>,
        inSys: boolean,
      ) {
        let expr = ''
        let checkPreviousNull = true
        for (let i = 0; i < 3; i++) {
          if (vect.slice(0, 3).every((item) => item === 0) && i === 0) {
            expr = expr + '0'
          } else if (!(vect[i] === 0) && checkPreviousNull) {
            if (nomVal[i] === '') {
              expr = expr + `${texNombre(vect[i], 0)}${nomVal[i]}`
            } else {
              expr = expr + `${rienSi1(vect[i])}${nomVal[i]}`
            }
            checkPreviousNull = false
          } else if (!(vect[i] === 0) && !checkPreviousNull) {
            if (nomVal[i] === '') {
              expr = expr + `${ecritureAlgebrique(vect[i])}${nomVal[i]}`
            } else {
              expr = expr + `${ecritureAlgebriqueSauf1(vect[i])}${nomVal[i]}`
            }
            checkPreviousNull = false
          }
        }
        if (inSys === true) {
          expr = expr + ' &='
        } else {
          expr = expr + '='
        }
        checkPreviousNull = true
        for (let i = 3; i < 6; i++) {
          if (vect.slice(3).every((item) => item === 0) && i === 3) {
            expr = expr + '0'
          } else if (!(vect[i] === 0) && checkPreviousNull) {
            if (nomVal[i] === '') {
              expr = expr + `${texNombre(vect[i], 0)}${nomVal[i]}`
            } else {
              expr = expr + `${rienSi1(vect[i])}${nomVal[i]}`
            }
            checkPreviousNull = false
          } else if (!(vect[i] === 0) && !checkPreviousNull) {
            if (nomVal[i] === '') {
              expr = expr + `${ecritureAlgebrique(vect[i])}${nomVal[i]}`
            } else {
              expr = expr + `${ecritureAlgebriqueSauf1(vect[i])}${nomVal[i]}`
            }
            checkPreviousNull = false
          }
        }
        return expr
      }
      const printSystem = function (eq1: string, eq2: string) {
        let expr = ''
        expr =
          expr +
          `\\begin{cases}\\begin{aligned}${eq1}\\\\${eq2}\\end{aligned}\\end{cases}`
        return expr
      }
      do {
        a = randint(-5, 5, [0]) // numérateut coefficient directeur non nul
        b = randint(-5, 5) // ordonnée à l'origine
        aFrac = choice(listeFractions)
        a = aFrac[0] * choice([-1, 1]) //
        d = aFrac[1] //
        c = droite(a / d, -1, b)
        c.color = colorToLatexOrHTML('red')
        c.epaisseur = 1
        a2 = randint(-5, 5, [0]) // numérateut coefficient directeur non nul
        b2 = randint(-5, 5) // ordonnée à l'origine
        a2Frac = choice(listeFractions)
        a2 = a2Frac[0] * choice([-1, 1]) //
        d2 = a2Frac[1] //
        c2 = droite(a2 / d2, -1, b2)
        c2.color = colorToLatexOrHTML(bleuMathalea)
        c2.epaisseur = 1
        a3 = randint(-5, 5, [0]) // numérateut coefficient directeur non nul
        b3 = randint(-5, 5) // ordonnée à l'origine
        a3Frac = choice(listeFractions)
        a3 = a3Frac[0] * choice([-1, 1]) //
        d3 = a3Frac[1] //
        c3 = droite(a3 / d3, -1, b3)
        c3.color = colorToLatexOrHTML('red')
        c3.epaisseur = 1
        a4 = randint(-5, 5, [0]) // numérateut coefficient directeur non nul
        b4 = randint(-5, 5) // ordonnée à l'origine
        a4Frac = choice(listeFractions)
        a4 = a4Frac[0] * choice([-1, 1]) //
        d4 = a4Frac[1] //
        c4 = droite(a4 / d4, -1, b4)
        c4.color = colorToLatexOrHTML(bleuMathalea)
        c4.epaisseur = 1
        a5 = randint(-5, 5, [0]) // numérateut coefficient directeur non nul
        b5 = randint(-5, 5) // ordonnée à l'origine
        a5Frac = choice(listeFractions)
        a5 = a5Frac[0] * choice([-1, 1]) //
        d5 = a5Frac[1] //
        c5 = droite(a5 / d5, -1, b5)
        c5.color = colorToLatexOrHTML('red')
        c5.epaisseur = 1
        a6 = randint(-5, 5, [0]) // numérateut coefficient directeur non nul
        b6 = randint(-5, 5) // ordonnée à l'origine
        a6Frac = choice(listeFractions)
        a6 = a6Frac[0] * choice([-1, 1]) //
        d6 = a6Frac[1] //
        c6 = droite(a6 / d6, -1, b6)
        c6.color = colorToLatexOrHTML(bleuMathalea)
        c6.epaisseur = 1
      } while (
        (c === c3 && c2 === c4) ||
        (c === c4 && c2 === c3) ||
        (c === c5 && c2 === c6) ||
        (c === c6 && c2 === c5) ||
        (c3 === c5 && c4 === c6) ||
        (c3 === c6 && c4 === c5) ||
        (b === b4 && b4 === b5 && b5 === b3 && b3 === b6)
      )
      t1 = texteParPosition(
        '1',
        -7.5,
        5.5,
        undefined,
        'black',
        undefined,
        'milieu',
        undefined,
        1,
      )
      t2 = texteParPosition(
        '2',
        -7.5,
        5.5,
        undefined,
        'black',
        undefined,
        'milieu',
        undefined,
        1,
      )
      t3 = texteParPosition(
        '3',
        -7.5,
        5.5,
        undefined,
        'black',
        undefined,
        'milieu',
        undefined,
        1,
      )
      r = repere({
        xMin: -7,
        xMax: 7,
        xUnite: 1,
        yMin: -6,
        yMax: 6,
        yUnite: 1,
        thickHauteur: 0.2,
        thickEpaisseur: 1,
        xLabelMin: -7,
        xLabelMax: 7,
        yLabelMax: 5,
        yLabelMin: -5,
        axeXStyle: '->',
        axeYStyle: '->',
        yLabelDistance: 2,
        xLabelDistance: 2,
        yLabelEcart: 0.6,
        axesEpaisseur: 1,
        grilleSecondaire: true,
        grilleSecondaireYDistance: 1,
        grilleSecondaireXDistance: 1,
        grilleSecondaireYMin: -6,
        grilleSecondaireYMax: 6,
        grilleSecondaireXMin: -7,
        grilleSecondaireXMax: 7,
      })
      pente1 = new FractionEtendue(a, d)
      pente2 = new FractionEtendue(a2, d2)
      pente3 = new FractionEtendue(a3, d3)
      pente4 = new FractionEtendue(a4, d4)
      pente5 = new FractionEtendue(a5, d5)
      pente6 = new FractionEtendue(a6, d6)
      s1 = [0, 1, 0, pente1, 0, Math.round(pointSurDroite(c, 0, '').y)]
      s2 = [0, 1, 0, pente2, 0, Math.round(pointSurDroite(c2, 0, '').y)]
      s3 = [0, 1, 0, pente3, 0, Math.round(pointSurDroite(c3, 0, '').y)]
      s4 = [0, 1, 0, pente4, 0, Math.round(pointSurDroite(c4, 0, '').y)]
      s5 = [0, 1, 0, pente5, 0, Math.round(pointSurDroite(c5, 0, '').y)]
      s6 = [0, 1, 0, pente6, 0, Math.round(pointSurDroite(c6, 0, '').y)]
      lsys = [
        [s1, s2],
        [s3, s4],
        [s5, s6],
      ]
      lass = ['1', '2', '3']
      shuffle2tableaux(lsys, lass)
      ss1 = lsys[0]
      ss2 = lsys[1]
      ss3 = lsys[2]
      vari = ['x', 'y', '', 'x', 'y', '']
      texte = `Associer chaque système d'équations avec la représentation graphique qui convient. \\[ A=${printSystem(eqToLatex(ss1[0], vari, true), eqToLatex(ss1[1], vari, true))} \\quad\\quad B=${printSystem(eqToLatex(ss2[0], vari, true), eqToLatex(ss2[1], vari, true))} \\quad\\quad C=${printSystem(eqToLatex(ss3[0], vari, true), eqToLatex(ss3[1], vari, true))}\\]`
      texte += troisColonnes(
        mathalea2d(
          {
            xmin: -7,
            ymin: -6,
            xmax: 7,
            ymax: 6,
            pixelsParCm: 16,
            scale: 0.32,
            display: 'inline',
            optionsTikz: ['baseline=(current bounding box.north)'],
          },
          r,
          c,
          c2,
          t1,
        ),
        mathalea2d(
          {
            xmin: -7,
            ymin: -6,
            xmax: 7,
            ymax: 6,
            pixelsParCm: 16,
            scale: 0.32,
            display: 'inline',
            optionsTikz: ['baseline=(current bounding box.north)'],
          },
          r,
          c3,
          c4,
          t2,
        ),
        mathalea2d(
          {
            xmin: -7,
            ymin: -6,
            xmax: 7,
            ymax: 6,
            pixelsParCm: 16,
            scale: 0.32,
            display: 'inline',
            optionsTikz: ['baseline=(current bounding box.north)'],
          },
          r,
          c5,
          c6,
          t3,
        ),
      )
      if (this.interactif) {
        texte +=
          '<br> Indiquer pour chaque graphique le système correspondant ($A, B, C$)' +
          remplisLesBlancs(
            this,
            i,
            '1\\rightarrow %{champ1} \\quad 2\\rightarrow %{champ2} \\quad 3\\rightarrow %{champ3}',
          )
        const letters = ['A', 'B', 'C']
        handleAnswers(
          this,
          i,
          {
            bareme: (listePoints: number[]) => [
              Math.min(listePoints[0], listePoints[1], listePoints[2]),
              1,
            ],
            champ1: {
              value: `${letters[lass.findIndex((item) => item === '1')]}`,
              options: { texteSansCasse: true },
            },
            champ2: {
              value: `${letters[lass.findIndex((item) => item === '2')]}`,
              options: { texteSansCasse: true },
            },
            champ3: {
              value: `${letters[lass.findIndex((item) => item === '3')]}`,
              options: { texteSansCasse: true },
            },
          },
          { formatInteractif: 'fillInTheBlank' },
        )
      }
      texteCorr = ''
      if (this.correctionDetaillee) {
        texteCorr =
          "On raisonne sur les pentes et les ordonnées à l'origine des droites des différents systèmes. Voici la première partie du raisonnement :<br>"
        if (![b3, b4, b5, b6].includes(b)) {
          texteCorr =
            texteCorr +
            `L'ordonnée à l'origine de la première droite dans le système ${['$A$', '$B$', '$C$'][lass.findIndex((item) => item === '1')]} est $${b}$ et aucune droite dans un autre système n'a la même ordonnée à l'origine. Ainsi le système ${texteEnCouleurEtGras(['$A$', '$B$', '$C$'][lass.findIndex((item) => item === '1')])} est associé au premier graphique.<br>`
        } else if (![b3, b4, b5, b6].includes(b2)) {
          texteCorr =
            texteCorr +
            `L'ordonnée à l'origine de la deuxième droite dans le système ${['$A$', '$B$', '$C$'][lass.findIndex((item) => item === '1')]} est $${b2}$ et aucune droite dans un autre système n'a la même ordonnée à l'origine. Ainsi le système ${texteEnCouleurEtGras(['$A$', '$B$', '$C$'][lass.findIndex((item) => item === '1')])} est associé au graphique premier graphique.`
        } else if (![b, b2, b5, b6].includes(b3)) {
          texteCorr =
            texteCorr +
            `L'ordonnée à l'origine de la première droite dans le système ${['$A$', '$B$', '$C$'][lass.findIndex((item) => item === '2')]} est $${b3}$ et aucune droite dans un autre système n'a la même ordonnée à l'origine. Ainsi le système ${texteEnCouleurEtGras(['$A$', '$B$', '$C$'][lass.findIndex((item) => item === '2')])} est associé au deuxième graphique.`
        } else if (![b, b2, b5, b6].includes(b4)) {
          texteCorr =
            texteCorr +
            `L'ordonnée à l'origine de la deuxième droite dans le système ${['$A$', '$B$', '$C$'][lass.findIndex((item) => item === '2')]} est $${b4}$ et aucune droite dans un autre système n'a la même ordonnée à l'origine. Ainsi le système ${texteEnCouleurEtGras(['$A$', '$B$', '$C$'][lass.findIndex((item) => item === '2')])} est associé au deuxième graphique.`
        } else if (![b, b2, b3, b4].includes(b5)) {
          texteCorr =
            texteCorr +
            `L'ordonnée à l'origine de la première droite dans le système ${['$A$', '$B$', '$C$'][lass.findIndex((item) => item === '3')]} est $${b5}$ et aucune droite dans un autre système n'a la même ordonnée à l'origine. Ainsi le système${['$A$', '$B$', '$C$'][lass.findIndex((item) => item === '3')]} est associé au troisième graphique.`
        } else if (![b, b2, b3, b4].includes(b6)) {
          texteCorr =
            texteCorr +
            `L'ordonnée à l'origine de la deuxième droite dans le système ${['$A$', '$B$', '$C$'][lass.findIndex((item) => item === '3')]} est $${b6}$ et aucune droite dans un autre système n'a la même ordonnée à l'origine. Ainsi le système ${texteEnCouleurEtGras(['$A$', '$B$', '$C$'][lass.findIndex((item) => item === '3')])} est associé au troisième graphique.`
        }
        texteCorr =
          texteCorr +
          " On continue à raisonner avec les ordonnées à l'origine des droites restantes ou en analysant leur pente.<br>"
      }
      texteCorr =
        texteCorr +
        `Le système ${texteEnCouleurEtGras(['$A$', '$B$', '$C$'][lass.findIndex((item) => item === '1')])} est associé au premier graphique,` +
        ` le système ${texteEnCouleurEtGras(['$A$', '$B$', '$C$'][lass.findIndex((item) => item === '2')])} est associé au deuxième graphique, le système ${texteEnCouleurEtGras(['$A$', '$B$', '$C$'][lass.findIndex((item) => item === '3')])} au troisième graphique.`
      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
