// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 277d3 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { courbe } from '../../lib/2d/Courbe'
import { droite, droiteParPointEtPente } from '../../lib/2d/droites'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latexParCoordonnees } from '../../lib/2d/textes'
import {
  lireFormulaireComplexe,
  serialiseFormulaireComplexe,
  valeursParDefaut,
  type FormulaireComplexe,
} from '../../lib/formulaireComplexe'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { arrondi } from '../../lib/outils/nombres'
import Exercice from '../Exercice'

import { mathalea2d } from '../../modules/mathalea2d'

import { crochetD, crochetG } from '../../lib/2d/intervalles'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'

export const interactifReady = true

export const titre =
  'Résoudre graphiquement une inéquation avec une fonction de référence'
export const dateDePublication = '14/02/2023'
/**
 *
 * @author Gilles Mora adaptation été 2026 : Stéphane Guyon
 */
export const uuid = '277d3'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

const formulaire: FormulaireComplexe = {
  champs: [
    {
      type: 'liste',
      nom: 'fonctions',
      label: 'Fonctions de référence',
      items: [
        { nom: 'carre', label: 'Fonction carré', actif: true },
        { nom: 'inverse', label: 'Fonction inverse', actif: true },
        { nom: 'valeurAbsolue', label: 'Fonction valeur absolue', actif: true },
        {
          nom: 'cube',
          label: 'Fonction cube (année de transition)',
          actif: false,
        },
        {
          nom: 'racineCarree',
          label: 'Fonction racine carrée (année de transition)',
          actif: false,
        },
      ],
    },
  ],
}

export default class ResoudreGraphFonctionRefOld extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireComplexe = formulaire
    this.sup = serialiseFormulaireComplexe(
      formulaire,
      valeursParDefaut(formulaire),
    )

    this.nbQuestions = 1

    this.spacing = 1.5 // Interligne des questions
  }

  nouvelleVersion() {
    const parametres = lireFormulaireComplexe(formulaire, this.sup)
    const typesParFonction: Record<string, string[]> = {
      carre: ['typeE1', 'typeE2'],
      inverse: ['typeE3', 'typeE4'],
      racineCarree: ['typeE5', 'typeE6'],
      valeurAbsolue: ['typeE7', 'typeE8'],
      cube: ['typeE9', 'typeE10'],
    }
    const fonctionsCochees = parametres.listeActive('fonctions')
    const fonctionsDisponibles =
      fonctionsCochees.length > 0
        ? fonctionsCochees
        : parametres.declares('fonctions').filter((item) => item.poids > 0)
    const typeDeQuestionsDisponibles = fonctionsDisponibles.flatMap(
      (fonction) => typesParFonction[fonction.nom],
    )
    //
    // variables communes à tous les cas et sortis des cases et même de la boucle.
    const o = latexParCoordonnees('O', -0.2, -0.3, 'black', 0, 0, '')
    const O = pointAbstrait(0, 0)

    const listeTypeQuestions = combinaisonListes(
      typeDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Boucle principale où i+1 correspond au numéro de la question
      const estInegStrict = choice([true, false])
      let ensembleSolutions: string
      function intervalleLaTex(
        borneGauche: string | number,
        borneDroite: string | number,
        ouvertGauche: boolean,
        ouvertDroite: boolean,
      ): string {
        const delimGauche = ouvertGauche ? '\\left]' : '\\left['
        const delimDroite = ouvertDroite ? '\\right[' : '\\right]'
        return `${delimGauche}${borneGauche} ; ${borneDroite}${delimDroite}`
      }
      switch (
        listeTypeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'typeE1': // x^2<k
          {
            const signeInegalité = estInegStrict ? '<' : ' \\leqslant '
            const a = randint(1, 30)
            const A = pointAbstrait(1.73, 3)
            const Ax = pointAbstrait(A.x, 0)
            const sAAx = segment(A, Ax)
            sAAx.epaisseur = 2
            sAAx.pointilles = 5
            const B = pointAbstrait(-1.73, 3)
            const Bx = pointAbstrait(B.x, 0)
            const sBBx = segment(B, Bx)
            sBBx.epaisseur = 2
            sBBx.pointilles = 5
            const sAxBx = segment(Bx, Ax, 'red')
            sAxBx.epaisseur = 2
            const c1 = estInegStrict ? crochetG(Bx, 'red') : crochetD(Bx, 'red')
            const c2 = estInegStrict ? crochetD(Ax, 'red') : crochetG(Ax, 'red')
            const Texte1 = latexParCoordonnees(
              `y=${a}`,
              4,
              2.7,
              'green',
              0,
              0,
              '',
            )
            const Texte2 = latexParCoordonnees(
              'y=x^2',
              3,
              4.5,
              bleuMathalea,
              0,
              0,
              '',
            )
            const Texte3 = latexParCoordonnees(
              `-\\sqrt{${a}}`,
              -1.73,
              -0.6,
              'red',
              0,
              0,
              '',
            )
            const Texte4 = latexParCoordonnees(
              `\\sqrt{${a}}`,
              1.73,
              -0.6,
              'red',
              0,
              0,
              '',
            )
            const r1 = repere({
              xMin: -4,
              yMin: -1,
              yMax: 5,
              xMax: 4,
              xUnite: 1,
              yUnite: 1,
              axeXStyle: '->',
              axeYStyle: '->',
              grilleX: false,
              grilleY: false,
              xThickListe: [0],
              yThickListe: [0],
              xLabelListe: [-6],
              yLabelListe: [-6],
            })
            const f = (x: number) => Number(x) ** 2
            const Cg = droite(
              pointAbstrait(-3, 3),
              pointAbstrait(3, 3),
              '',
              'green',
            )
            Cg.epaisseur = 2
            const graphique = mathalea2d(
              {
                xmin: -5,
                xmax: 5,
                ymin: -1,
                ymax: 5,
                pixelsParCm: 30,
                scale: 0.7,
                display: 'block',
              },
              r1,
              o,
            )
            const graphiqueC = mathalea2d(
              {
                xmin: -6,
                xmax: 6,
                ymin: -2,
                ymax: 5,
                pixelsParCm: 30,
                scale: 1,
                display: 'block',
              },
              courbe(f, {
                repere: r1,
                color: bleuMathalea,
                epaisseur: 2,
              }),
              Cg,
              r1,
              o,
              sAAx,
              sBBx,
              sAxBx,
              c1,
              c2,
              Texte1,
              Texte2,
              Texte3,
              Texte4,
            )
            texte = `Résoudre graphiquement l'inéquation : $x^2${signeInegalité}${a}$.<br>`
            if (!context.isHtml) {
              texte += 'On pourra utiliser le repère suivant.<br>'
              texte += `    ${graphique}`
            }
            texteCorr = `Pour résoudre graphiquement cette inéquation : <br>
            $\\bullet$ On trace la parabole d'équation $y=x^2$. <br>
            $\\bullet$ On trace la droite horizontale d'équation $y=${a}$. Cette droite coupe la parabole en $-\\sqrt{${a}}$ et $\\sqrt{${a}}$. <br>
            $\\bullet$  Les solutions de l'inéquation sont les abscisses respectives des points de la courbe qui se situent ${estInegStrict ? 'strictement en dessous de' : ' sur ou sous '} la droite.<br>`
            texteCorr += `${graphiqueC}`

            if (a === 1 || a === 4 || a === 9 || a === 16 || a === 25) {
              const borne = arrondi(Math.sqrt(a), 0)
              ensembleSolutions = intervalleLaTex(
                -borne,
                borne,
                estInegStrict,
                estInegStrict,
              )
              texteCorr += `Comme la fonction carré est définie sur $\\mathbb{R}$ et que $\\sqrt{${a}}=${borne}$, l'ensemble des solutions de l'inéquation $x^2${signeInegalité}${a}$ est :
             `
            } else {
              const borne = `\\sqrt{${a}}`
              ensembleSolutions = intervalleLaTex(
                '-' + borne,
                borne,
                estInegStrict,
                estInegStrict,
              )
              texteCorr += `Comme la fonction carré est définie sur $\\mathbb{R}$, l'ensemble des solutions de l'inéquation $x^2${signeInegalité}${a}$ est : `
            }
          }
          break

        case 'typeE2': // x^2>k
          {
            const signeInegalité = estInegStrict ? '>' : ' \\geqslant '
            const a = randint(1, 30)
            const A = pointAbstrait(1.73, 3)
            const Ax = pointAbstrait(A.x, 0)
            const sAAx = segment(A, Ax)
            sAAx.epaisseur = 2
            sAAx.pointilles = 5
            const B = pointAbstrait(-1.73, 3)
            const Bx = pointAbstrait(B.x, 0)
            const sBBx = segment(B, Bx)
            sBBx.epaisseur = 2
            sBBx.pointilles = 5
            const BxI = pointAbstrait(-4, 0)
            const sBxBxI = segment(BxI, Bx, 'red')
            sBxBxI.epaisseur = 2
            const c1 = estInegStrict ? crochetD(Bx, 'red') : crochetG(Bx, 'red')
            const AxI = pointAbstrait(4, 0)
            const sAxAxI = segment(Ax, AxI, 'red')
            sAxAxI.epaisseur = 2
            const c2 = estInegStrict ? crochetG(Ax, 'red') : crochetD(Ax, 'red')
            const Texte1 = latexParCoordonnees(
              `y=${a}`,
              4,
              2.7,
              'green',
              0,
              0,
              '',
            )
            const Texte2 = latexParCoordonnees(
              'y=x^2',
              3,
              4.5,
              bleuMathalea,
              0,
              0,
              '',
            )
            const Texte3 = latexParCoordonnees(
              `-\\sqrt{${a}}`,
              -1.73,
              -0.6,
              'red',
              0,
              0,
              '',
            )
            const Texte4 = latexParCoordonnees(
              `\\sqrt{${a}}`,
              1.73,
              -0.6,
              'red',
              0,
              0,
              '',
            )
            const r1 = repere({
              xMin: -4,
              yMin: -1,
              yMax: 5,
              xMax: 4,
              xUnite: 1,
              yUnite: 1,
              axeXStyle: '->',
              axeYStyle: '->',
              grilleX: false,
              grilleY: false,
              xThickListe: [-6],
              yThickListe: [-6],
              xLabelListe: [-6],
              yLabelListe: [-6],
            })
            const f = (x: number) => Number(x) ** 2
            const Cg = droite(
              pointAbstrait(-6, 3),
              pointAbstrait(6, 3),
              '',
              'green',
            )
            Cg.epaisseur = 2
            const graphique = mathalea2d(
              {
                xmin: -5,
                xmax: 6,
                ymin: -1,
                ymax: 5,
                pixelsParCm: 30,
                scale: 0.7,
                display: 'block',
              },
              r1,
              o,
            )
            const graphiqueC = mathalea2d(
              {
                xmin: -5,
                xmax: 6,
                ymin: -2,
                ymax: 5.5,
                pixelsParCm: 30,
                scale: 1,
                display: 'block',
              },
              courbe(f, {
                repere: r1,
                color: bleuMathalea,
                epaisseur: 2,
              }),
              Cg,
              r1,
              o,
              sAAx,
              sBBx,
              sAxAxI,
              sBxBxI,
              c1,
              c2,
              Texte1,
              Texte2,
              Texte3,
              Texte4,
            )
            texte = `Résoudre graphiquement l'inéquation : $x^2${signeInegalité}${a}$.<br>`
            if (!context.isHtml) {
              texte += 'On pourra utiliser le repère suivant.<br>'
              texte += `    ${graphique}`
            }
            texteCorr = `Pour résoudre graphiquement cette inéquation : <br>
            $\\bullet$ On trace la parabole d'équation $y=x^2$. <br>
            $\\bullet$ On trace la droite horizontale d'équation $y=${a}$. <br>
            $\\bullet$    Les solutions de l'inéquation sont les abscisses respectives des points de la courbe qui se situent ${estInegStrict ? 'strictement au-dessus de' : ' sur ou au-dessus de '} la droite.<br>`
            texteCorr += `${graphiqueC}`

            if (a === 1 || a === 4 || a === 9 || a === 16 || a === 25) {
              const borne = arrondi(Math.sqrt(a), 0)
              ensembleSolutions =
                intervalleLaTex('-\\infty', -borne, true, estInegStrict) +
                '\\cup' +
                intervalleLaTex(borne, '+\\infty', estInegStrict, true)
              texteCorr += `Comme la fonction carré est définie sur $\\mathbb{R}$ et que $\\sqrt{${a}}=${borne}$, l'ensemble des solutions de l'inéquation $x^2${signeInegalité}${a}$ est : `
            } else {
              const borne = `\\sqrt{${a}}`
              ensembleSolutions =
                intervalleLaTex('-\\infty', '-' + borne, true, estInegStrict) +
                '\\cup' +
                intervalleLaTex(borne, '+\\infty', estInegStrict, true)
              texteCorr += `Comme la fonction carré est définie sur $\\mathbb{R}$, l'ensemble des solutions de l'inéquation $x^2${signeInegalité}${a}$ est : `
            }
          }
          break

        case 'typeE3': // 1/x<k
          {
            const a = randint(-9, 9, [-1, 0, 1])

            const A = pointAbstrait(0.5, 2)
            const A2 = pointAbstrait(-1, -1)
            const Ax = pointAbstrait(A.x, 0)
            const A2x = pointAbstrait(A2.x, 0)
            const sAAx = segment(A, Ax)
            const sA2A2x = segment(A2, A2x)
            sAAx.epaisseur = 2
            sAAx.pointilles = 5
            sA2A2x.epaisseur = 2
            sA2A2x.pointilles = 5
            const AxI = pointAbstrait(-4, 0)
            const sAxIAx = segment(AxI, Ax, 'red')
            sAxIAx.epaisseur = 2
            // graphiqueC2 (a<0) : intervalle ]A2x ; 0[
            // A2x est borne gauche, on veut ] si strict, [ si large
            const sA2xO = segment(A2x, O, 'red')
            sA2xO.epaisseur = 2
            const cC2A2x = estInegStrict
              ? crochetG(A2x, 'red')
              : crochetD(A2x, 'red')
            const cC2O = crochetD(O, 'red')
            // graphiqueC1 (a>0) : ]-∞;0[ ∪ [1/a;+∞[ si large, ]-∞;0[ ∪ ]1/a;+∞[ si strict
            const sAxIO = segment(AxI, O, 'red')
            sAxIO.epaisseur = 2
            const cC1O = crochetD(O, 'red')
            const AxI2 = pointAbstrait(4, 0)
            const sAxI2Ax = segment(Ax, AxI2, 'red')
            sAxI2Ax.epaisseur = 2
            // Ax est borne gauche de [1/a;+∞[, on veut [ si large (crochetD), ] si strict (crochetG)
            const cC1Ax = estInegStrict
              ? crochetG(Ax, 'red')
              : crochetD(Ax, 'red')
            const Texte1 = latexParCoordonnees(
              `y = ${a} `,
              4,
              2.3,
              'green',
              0,
              0,
              '',
            )
            const Texte1B = latexParCoordonnees(
              `y = ${a} `,
              4,
              -1.3,
              'green',
              0,
              0,
              '',
            )
            const Texte2 = latexParCoordonnees(
              'y=\\dfrac{1}{x}',
              1.2,
              3,
              bleuMathalea,
              0,
              0,
              '',
            )
            const Texte3 = latexParCoordonnees(
              `\\dfrac{ 1 } {${a} } `,
              0.5,
              -1,
              'red',
              0,
              0,
              '',
            )
            const Texte3B = latexParCoordonnees(
              `-\\dfrac{ 1 } {${-a} } `,
              -1.2,
              1,
              'red',
              0,
              0,
              '',
            )

            const r1 = repere({
              xMin: -4,
              yMin: -3,
              yMax: 4,
              xMax: 4,
              xUnite: 1,
              yUnite: 1,
              axeXStyle: '->',
              axeYStyle: '->',
              grilleX: false,
              grilleY: false,
              xThickListe: [0],
              yThickListe: [0],
              xLabelListe: [-6],
              yLabelListe: [-6],
            })
            const f = (x: number) => 1 / Number(x)
            const Cg1 = droiteParPointEtPente(
              pointAbstrait(0, 2),
              0,
              '',
              'green',
            )
            Cg1.epaisseur = 2
            const Cg2 = droiteParPointEtPente(
              pointAbstrait(0, -1),
              0,
              '',
              'green',
            )
            Cg2.epaisseur = 2
            const graphique = mathalea2d(
              {
                xmin: -5,
                xmax: 5,
                ymin: -3,
                ymax: 4,
                pixelsParCm: 30,
                scale: 0.7,
                display: 'block',
              },
              r1,
              o,
            )

            const graphiqueC1 = mathalea2d(
              {
                // 1/x<k avec k>0
                xmin: -6,
                xmax: 6,
                ymin: -3,
                ymax: 4,
                pixelsParCm: 30,
                scale: 1,
                display: 'block',
              },
              courbe(f, {
                repere: r1,
                color: bleuMathalea,
                epaisseur: 2,
              }),
              Cg1,
              r1,
              o,
              sAAx,
              sAxIO,
              cC1O,
              sAxI2Ax,
              cC1Ax,
              Texte1,
              Texte2,
              Texte3,
            )

            const graphiqueC2 = mathalea2d(
              {
                // 1/x<k avec k<0
                xmin: -6,
                xmax: 6,
                ymin: -3,
                ymax: 4,
                pixelsParCm: 30,
                scale: 1,
                display: 'block',
              },
              courbe(f, {
                repere: r1,
                color: bleuMathalea,
                epaisseur: 2,
              }),
              Cg2,
              r1,
              o,
              sA2A2x,
              sA2xO,
              cC2A2x,
              cC2O,
              Texte1B,
              Texte2,
              Texte3B,
            )

            const signeInégalité = estInegStrict ? ' < ' : ' \\leqslant '
            texte = `Résoudre graphiquement l'inéquation : $\\dfrac{1}{x}${signeInégalité}${a}$.<br>`
            if (!context.isHtml) {
              texte += 'On pourra utiliser le repère suivant.<br>'
              texte += `    ${graphique}`
            }
            const borne = a > 0 ? `\\dfrac{1}{${a}}` : `-\\dfrac{1}{${-a}}`
            texteCorr = `Pour résoudre graphiquement cette inéquation : <br>
            $\\bullet$ On trace l'hyperbole d'équation $y=\\dfrac{1}{x}$. <br>
            $\\bullet$ On trace la droite horizontale d'équation $y=${a}$. Cette droite coupe l'hyperbole en un point dont l'abscisse est : $${borne}$.<br>
            $\\bullet$    Les solutions de l'inéquation sont les abscisses respectives des points de la courbe qui se situent ${estInegStrict ? 'strictement en dessous de' : ' sur ou sous '} la droite.<br>`
            if (a > 0) {
              ensembleSolutions =
                intervalleLaTex('-\\infty', 0, true, true) +
                '\\cup' +
                intervalleLaTex(borne, '+\\infty', estInegStrict, true)
              texteCorr += `${graphiqueC1}`
              texteCorr += `Comme la fonction inverse est définie sur $\\mathbb{R}^*$, $0$ est une valeur interdite et donc l'ensemble des solutions de l'inéquation $\\dfrac{1}{x}${signeInégalité}${a}$ est : `
            } else {
              ensembleSolutions = intervalleLaTex(borne, 0, estInegStrict, true)
              texteCorr += `${graphiqueC2}`
              texteCorr += `Comme la fonction inverse est définie sur $\\mathbb{R}^*$, $0$ est une valeur interdite et donc l'ensemble des solutions de l'inéquation $\\dfrac{1}{x}${signeInégalité}${a}$ est : `
            }
          }

          break

        case 'typeE4': // 1/x>k
          {
            const a = randint(-9, 9, [-1, 0, 1])

            const A = pointAbstrait(0.5, 2)
            const A2 = pointAbstrait(-1, -1)
            const Ax = pointAbstrait(A.x, 0)
            const A2x = pointAbstrait(A2.x, 0)
            const sAAx = segment(A, Ax)
            const sA2A2x = segment(A2, A2x)
            sAAx.epaisseur = 2
            sAAx.pointilles = 5
            sA2A2x.epaisseur = 2
            sA2A2x.pointilles = 5
            const AxI = pointAbstrait(-4, 0)
            const sAxIAx = segment(Ax, AxI, 'red')
            sAxIAx.epaisseur = 2
            const AxIP = pointAbstrait(4, 0)
            const sAxIPAx = segment(AxIP, O, 'red')
            sAxIPAx.epaisseur = 2
            const sAxIA2x = segment(AxI, A2x, 'red')
            sAxIA2x.epaisseur = 2
            const sA2xO = segment(A2x, O, 'red')
            sA2xO.epaisseur = 2
            const sAxO = segment(Ax, O, 'red')
            sAxO.epaisseur = 2
            // graphiqueC1 (a>0) : ]0 ; 1/a] si large, ]0 ; 1/a[ si strict
            // Ax borne droite : fermé=crochetG, ouvert=crochetD
            // O borne gauche exclue : crochetD
            const cC1AxR = estInegStrict
              ? crochetD(Ax, 'red')
              : crochetG(Ax, 'red')
            const cC1OR = crochetG(O, 'red')
            // graphiqueC2 (a<0) : ]-∞;A2x] ∪ ]0;+∞[ si large, ]-∞;A2x[ ∪ ]0;+∞[ si strict
            // A2x borne droite : fermé=crochetG, ouvert=crochetD
            // O borne gauche exclue : crochetD
            const cC2A2x = estInegStrict
              ? crochetD(A2x, 'red')
              : crochetG(A2x, 'red')
            const cC2OP = crochetG(O, 'red')
            const Texte1 = latexParCoordonnees(
              `y=${a}`,
              4,
              2.3,
              'green',
              0,
              0,
              '',
            )
            const Texte1B = latexParCoordonnees(
              `y=${a}`,
              4,
              -1.3,
              'green',
              0,
              0,
              '',
            )
            const Texte2 = latexParCoordonnees(
              'y=\\dfrac{1}{x}',
              1.2,
              3,
              bleuMathalea,
              0,
              0,
              '',
            )
            const Texte3 = latexParCoordonnees(
              `\\dfrac{1}{${a}}`,
              0.5,
              -1,
              'red',
              0,
              0,
              '',
            )
            const Texte3B = latexParCoordonnees(
              `-\\dfrac{1}{${-a}}`,
              -1.2,
              1,
              'red',
              0,
              0,
              '',
            )
            const r1 = repere({
              xMin: -4,
              yMin: -3,
              yMax: 4,
              xMax: 4,
              xUnite: 1,
              yUnite: 1,
              axeXStyle: '->',
              axeYStyle: '->',
              grilleX: false,
              grilleY: false,
              xThickListe: [0],
              yThickListe: [0],
              xLabelListe: [-6],
              yLabelListe: [-6],
            })
            const f = (x: number) => 1 / Number(x)
            const Cg1 = droiteParPointEtPente(
              pointAbstrait(0, 2),
              0,
              '',
              'green',
            )
            Cg1.epaisseur = 2
            const Cg2 = droiteParPointEtPente(
              pointAbstrait(0, -1),
              0,
              '',
              'green',
            )
            Cg2.epaisseur = 2
            const graphique = mathalea2d(
              {
                xmin: -5,
                xmax: 5,
                ymin: -3,
                ymax: 4,
                pixelsParCm: 30,
                scale: 0.7,
                display: 'block',
              },
              r1,
              o,
            )

            const graphiqueC1 = mathalea2d(
              {
                // 1/x>k avec a>0
                xmin: -6,
                xmax: 6,
                ymin: -3,
                ymax: 4,
                pixelsParCm: 30,
                scale: 1,
                display: 'block',
              },
              courbe(f, {
                repere: r1,
                color: bleuMathalea,
                epaisseur: 2,
              }),
              Cg1,
              r1,
              o,
              sAAx,
              sAxO,
              cC1AxR,
              cC1OR,
              Texte1,
              Texte2,
              Texte3,
            )

            const graphiqueC2 = mathalea2d(
              {
                // 1/x>k avec a<0
                xmin: -6,
                xmax: 6,
                ymin: -3,
                ymax: 4,
                pixelsParCm: 30,
                scale: 1,
                display: 'block',
              },
              courbe(f, {
                repere: r1,
                color: bleuMathalea,
                epaisseur: 2,
              }),
              Cg2,
              r1,
              o,
              sA2A2x,
              sAxIA2x,
              cC2A2x,
              sAxIPAx,
              cC2OP,
              Texte1B,
              Texte2,
              Texte3B,
            )
            const signeInégalité = estInegStrict ? '>' : ' \\geqslant '
            texte = `Résoudre graphiquement l'inéquation : $\\dfrac{1}{x}${signeInégalité}${a}$.<br>`
            if (!context.isHtml) {
              texte += 'On pourra utiliser le repère suivant.<br>'
              texte += `    ${graphique}`
            }
            const borne = a > 0 ? `\\dfrac{1}{${a}}` : `-\\dfrac{1}{${-a}}`
            texteCorr = `Pour résoudre graphiquement cette inéquation : <br>
            $\\bullet$ On trace l'hyperbole d'équation $y=\\dfrac{1}{x}$. <br>
            $\\bullet$ On trace la droite horizontale d'équation $y=${a}$. Cette droite coupe l'hyperbole en un point dont l'abscisse est : $${borne}$. <br>
            $\\bullet$    Les solutions de l'inéquation sont les abscisses respectives des points de la courbe qui se situent ${estInegStrict ? 'strictement au-dessus de' : ' sur ou au-dessus de '} la droite.<br>`
            if (a > 0) {
              ensembleSolutions = intervalleLaTex(0, borne, true, estInegStrict)
              texteCorr += `${graphiqueC1}`
              texteCorr += `Comme la fonction inverse est définie sur $\\mathbb{R}^*$, $0$ est une valeur interdite et donc l'ensemble des solutions de l'inéquation $\\dfrac{1}{x}${signeInégalité}${a}$ est : `
            } else {
              ensembleSolutions =
                intervalleLaTex('-\\infty', borne, true, estInegStrict) +
                '\\cup' +
                intervalleLaTex(0, '+\\infty', true, true)
              texteCorr += `${graphiqueC2}`
              texteCorr += `Comme la fonction inverse est définie sur $\\mathbb{R}^*$, $0$ est une valeur interdite et donc l'ensemble des solutions de l'inéquation $\\dfrac{1}{x}${signeInégalité}${a}$ est : `
            }
          }

          break
        case 'typeE5': // sqrt(x)<k
          {
            const a = randint(1, 12)
            const A = pointAbstrait(2.25, 1.5)
            const Ax = pointAbstrait(A.x, 0)
            const sAAx = segment(A, Ax)
            sAAx.epaisseur = 2
            sAAx.pointilles = 5
            const sAxBx = segment(O, Ax, 'red')
            sAxBx.epaisseur = 2
            const c5O = crochetD(O, 'red')
            const c5Ax = estInegStrict
              ? crochetD(Ax, 'red')
              : crochetG(Ax, 'red')
            const Texte1 = latexParCoordonnees(
              `y=${a}`,
              4,
              1.2,
              'green',
              0,
              0,
              '',
            )
            const Texte2 = latexParCoordonnees(
              'y=\\sqrt{x}',
              3,
              2.3,
              bleuMathalea,
              0,
              0,
              '',
            )
            const Texte3 = latexParCoordonnees(
              `${a ** 2}`,
              2.25,
              -0.6,
              'red',
              0,
              0,
              '',
            )
            const r1 = repere({
              xMin: -1,
              yMin: -1,
              yMax: 4,
              xMax: 5,
              xUnite: 1,
              yUnite: 1,
              axeXStyle: '->',
              axeYStyle: '->',
              grilleX: false,
              grilleY: false,
              xThickListe: [0],
              yThickListe: [0],
              xLabelListe: [-6],
              yLabelListe: [-6],
            })
            const f = (x: number) => Math.sqrt(Number(x))
            const Cg = droiteParPointEtPente(
              pointAbstrait(0, 1.5),
              0,
              '',
              'green',
            )
            Cg.epaisseur = 2
            const graphique = mathalea2d(
              {
                xmin: -2,
                xmax: 6,
                ymin: -1,
                ymax: 4,
                pixelsParCm: 30,
                scale: 0.7,
                display: 'block',
              },
              r1,
              o,
            )
            const graphiqueC = mathalea2d(
              {
                xmin: -1,
                xmax: 5,
                ymin: -1,
                ymax: 4,
                pixelsParCm: 30,
                scale: 1,
                display: 'block',
              },
              courbe(f, {
                repere: r1,
                color: bleuMathalea,
                epaisseur: 2,
                xMin: 0,
              }),
              Cg,
              r1,
              o,
              sAAx,
              sAxBx,
              c5O,
              c5Ax,
              Texte1,
              Texte2,
              Texte3,
            )
            const signeInégalité = estInegStrict ? '<' : ' \\leqslant '
            texte = `Résoudre graphiquement l'inéquation : $\\sqrt{x}${signeInégalité}${a}$.<br>`
            if (!context.isHtml) {
              texte += 'On pourra utiliser le repère suivant.<br>'
              texte += `    ${graphique}`
            }
            const borne = a ** 2
            ensembleSolutions = intervalleLaTex(0, borne, false, estInegStrict)
            texteCorr = `Pour résoudre graphiquement cette inéquation : <br>
            $\\bullet$ On trace la courbe d'équation $y=\\sqrt{x}$. <br>
            $\\bullet$ On trace la droite horizontale d'équation $y=${a}$. Cette droite coupe la courbe en $${a}^2=${borne}$. <br>
            $\\bullet$  Les solutions de l'inéquation sont les abscisses respectives des points de la courbe qui se situent ${estInegStrict ? 'strictement en dessous de' : ' sur ou sous '} la droite.<br>`
            texteCorr += `${graphiqueC}`
            texteCorr += `Comme la fonction racine carrée est définie sur $[0\\,;\\,+\\infty[$, l'ensemble des solutions de l'inéquation $\\sqrt{x}${signeInégalité}${a}$ est : `
          }
          break
        case 'typeE6': // sqrt(x)>k
          {
            const a = randint(1, 12)
            const A = pointAbstrait(2.25, 1.5)
            const AInf = pointAbstrait(5, 0)
            const Ax = pointAbstrait(A.x, 0)
            const sAAx = segment(A, Ax)
            sAAx.epaisseur = 2
            sAAx.pointilles = 5
            const sAxBx = segment(Ax, O, 'red')
            sAxBx.epaisseur = 2
            const sAxAInf = segment(Ax, AInf, 'red')
            sAxAInf.epaisseur = 2
            const c6Ax2 = estInegStrict
              ? crochetG(Ax, 'red')
              : crochetD(Ax, 'red')
            const Texte1 = latexParCoordonnees(
              `y=${a}`,
              4,
              1.2,
              'green',
              0,
              0,
              '',
            )
            const Texte2 = latexParCoordonnees(
              'y=\\sqrt{x}',
              3,
              2.3,
              bleuMathalea,
              0,
              0,
              '',
            )
            const Texte3 = latexParCoordonnees(
              `${a ** 2}`,
              2.25,
              -0.6,
              'red',
              0,
              0,
              '',
            )
            const r1 = repere({
              xMin: -1,
              yMin: -1,
              yMax: 4,
              xMax: 5,
              xUnite: 1,
              yUnite: 1,
              axeXStyle: '->',
              axeYStyle: '->',
              grilleX: false,
              grilleY: false,
              xThickListe: [0],
              yThickListe: [0],
              xLabelListe: [-6],
              yLabelListe: [-6],
            })
            const f = (x: number) => Math.sqrt(x)
            const Cg = droiteParPointEtPente(
              pointAbstrait(0, 1.5),
              0,
              '',
              'green',
            )
            Cg.epaisseur = 2
            const graphique = mathalea2d(
              {
                xmin: -2,
                xmax: 6,
                ymin: -1,
                ymax: 4,
                pixelsParCm: 30,
                scale: 0.7,
                display: 'block',
              },
              r1,
              o,
            )
            const graphiqueC = mathalea2d(
              {
                xmin: -1,
                xmax: 5,
                ymin: -1,
                ymax: 4,
                pixelsParCm: 30,
                scale: 1,
                display: 'block',
              },
              courbe(f, {
                repere: r1,
                color: bleuMathalea,
                epaisseur: 2,
                xMin: 0,
              }),
              Cg,
              r1,
              o,
              sAAx,
              sAxAInf,
              c6Ax2,
              Texte1,
              Texte2,
              Texte3,
            )

            const signeInégalité = estInegStrict ? '>' : ' \\geqslant '
            texte = `Résoudre graphiquement l'inéquation : $\\sqrt{x}${signeInégalité}${a}$.<br>`
            if (!context.isHtml) {
              texte += 'On pourra utiliser le repère suivant.<br>'
              texte += `    ${graphique}`
            }
            const borne = a ** 2
            ensembleSolutions = intervalleLaTex(
              borne,
              '+\\infty',
              estInegStrict,
              true,
            )
            texteCorr = `Pour résoudre graphiquement cette inéquation : <br>
            $\\bullet$ On trace la courbe d'équation $y=\\sqrt{x}$. <br>
            $\\bullet$ On trace la droite horizontale d'équation $y=${a}$. Cette droite coupe la courbe en $${a}^2=${borne}$. <br>
            $\\bullet$  Les solutions de l'inéquation sont les abscisses respectives des points de la courbe qui se situent ${estInegStrict ? 'strictement au-dessus de' : ' sur ou au-dessus de'} la droite.<br>`
            texteCorr += `${graphiqueC}`
            texteCorr += `Comme la fonction racine carrée est définie sur $[0\\,;\\,+\\infty[$, l'ensemble des solutions de l'inéquation $\\sqrt{x}${signeInégalité}${a}$ est : `
          }
          break

        case 'typeE7': // |x|<k
        case 'typeE8': // |x|>k
          {
            const inferieure = listeTypeQuestions[i] === 'typeE7'
            const a = randint(1, 4)
            const signeInégalité = inferieure
              ? estInegStrict
                ? '<'
                : ' \\leqslant '
              : estInegStrict
                ? '>'
                : ' \\geqslant '
            const r1 = repere({
              xMin: -5,
              xMax: 5,
              yMin: -1,
              yMax: 5,
              axeXStyle: '->',
              axeYStyle: '->',
              grilleX: false,
              grilleY: false,
            })
            const droiteSeuil = droiteParPointEtPente(
              pointAbstrait(0, a),
              0,
              '',
              'green',
            )
            droiteSeuil.epaisseur = 2
            const pointGauche = pointAbstrait(-a, 0)
            const pointDroit = pointAbstrait(a, 0)
            const segmentsSolutions = inferieure
              ? [segment(pointGauche, pointDroit, 'red')]
              : [
                  segment(pointAbstrait(-5, 0), pointGauche, 'red'),
                  segment(pointDroit, pointAbstrait(5, 0), 'red'),
                ]
            segmentsSolutions.forEach((objet) => (objet.epaisseur = 2))
            const crochetsSolutions = inferieure
              ? [
                  estInegStrict
                    ? crochetG(pointGauche, 'red')
                    : crochetD(pointGauche, 'red'),
                  estInegStrict
                    ? crochetD(pointDroit, 'red')
                    : crochetG(pointDroit, 'red'),
                ]
              : [
                  estInegStrict
                    ? crochetD(pointGauche, 'red')
                    : crochetG(pointGauche, 'red'),
                  estInegStrict
                    ? crochetG(pointDroit, 'red')
                    : crochetD(pointDroit, 'red'),
                ]
            const graphique = mathalea2d(
              {
                xmin: -5,
                xmax: 5,
                ymin: -1,
                ymax: 5,
                pixelsParCm: 30,
                scale: 0.7,
                display: 'block',
              },
              r1,
              o,
            )
            const graphiqueC = mathalea2d(
              {
                xmin: -5,
                xmax: 5,
                ymin: -1,
                ymax: 5,
                pixelsParCm: 30,
                scale: 1,
                display: 'block',
              },
              courbe((x: number) => Math.abs(x), {
                repere: r1,
                color: bleuMathalea,
                epaisseur: 2,
              }),
              droiteSeuil,
              r1,
              o,
              segmentsSolutions,
              crochetsSolutions,
              latexParCoordonnees(`${-a}`, -a, -0.6, 'red', 0, 0, ''),
              latexParCoordonnees(`${a}`, a, -0.6, 'red', 0, 0, ''),
              latexParCoordonnees('y=|x|', 3.4, 3.7, bleuMathalea, 0, 0, ''),
              latexParCoordonnees(`y=${a}`, 4, a + 0.3, 'green', 0, 0, ''),
            )
            texte = `Résoudre graphiquement l'inéquation : $|x|${signeInégalité}${a}$.<br>`
            if (!context.isHtml) {
              texte += 'On pourra utiliser le repère suivant.<br>'
              texte += graphique
            }
            if (inferieure) {
              ensembleSolutions = intervalleLaTex(
                -a,
                a,
                estInegStrict,
                estInegStrict,
              )
            } else {
              ensembleSolutions =
                intervalleLaTex('-\\infty', -a, true, estInegStrict) +
                '\\cup' +
                intervalleLaTex(a, '+\\infty', estInegStrict, true)
            }
            texteCorr = `Pour résoudre graphiquement cette inéquation : <br>
              $\\bullet$ On trace la courbe d'équation $y=|x|$. <br>
              $\\bullet$ On trace la droite horizontale d'équation $y=${a}$. Elle coupe la courbe aux points d'abscisses $-${a}$ et $${a}$. <br>
              $\\bullet$ Les solutions sont les abscisses respectives des points de la courbe situés ${inferieure ? (estInegStrict ? 'strictement en dessous de' : 'sur ou sous') : estInegStrict ? 'strictement au-dessus de' : 'sur ou au-dessus de'} la droite.<br>
              ${graphiqueC}
              L'ensemble des solutions de l'inéquation $|x|${signeInégalité}${a}$ est : `
          }
          break

        case 'typeE9': // x^3<k
        case 'typeE10': // x^3>k
        default:
          {
            const inferieure = listeTypeQuestions[i] === 'typeE9'
            const borne = choice([-2, -1, 1, 2])
            const a = borne ** 3
            const signeInégalité = inferieure
              ? estInegStrict
                ? '<'
                : ' \\leqslant '
              : estInegStrict
                ? '>'
                : ' \\geqslant '
            const r1 = repere({
              xMin: -4,
              xMax: 4,
              yMin: -10,
              yMax: 10,
              axeXStyle: '->',
              axeYStyle: '->',
              grilleX: false,
              grilleY: false,
            })
            const droiteSeuil = droiteParPointEtPente(
              pointAbstrait(0, a),
              0,
              '',
              'green',
            )
            droiteSeuil.epaisseur = 2
            const pointBorne = pointAbstrait(borne, 0)
            const segmentSolutions = inferieure
              ? segment(pointAbstrait(-4, 0), pointBorne, 'red')
              : segment(pointBorne, pointAbstrait(4, 0), 'red')
            segmentSolutions.epaisseur = 2
            const crochetSolution = inferieure
              ? estInegStrict
                ? crochetD(pointBorne, 'red')
                : crochetG(pointBorne, 'red')
              : estInegStrict
                ? crochetG(pointBorne, 'red')
                : crochetD(pointBorne, 'red')
            const graphique = mathalea2d(
              {
                xmin: -4,
                xmax: 4,
                ymin: -10,
                ymax: 10,
                pixelsParCm: 25,
                scale: 0.7,
                display: 'block',
              },
              r1,
              o,
            )
            const graphiqueC = mathalea2d(
              {
                xmin: -4,
                xmax: 4,
                ymin: -10,
                ymax: 10,
                pixelsParCm: 25,
                scale: 1,
                display: 'block',
              },
              courbe((x: number) => x ** 3, {
                repere: r1,
                color: bleuMathalea,
                epaisseur: 2,
              }),
              droiteSeuil,
              r1,
              o,
              segmentSolutions,
              crochetSolution,
              latexParCoordonnees(`${borne}`, borne, -1.2, 'red', 0, 0, ''),
              latexParCoordonnees('y=x^3', 1.8, 6, bleuMathalea, 0, 0, ''),
              latexParCoordonnees(`y=${a}`, 3, a + 0.7, 'green', 0, 0, ''),
            )
            texte = `Résoudre graphiquement l'inéquation : $x^3${signeInégalité}${a}$.<br>`
            if (!context.isHtml) {
              texte += 'On pourra utiliser le repère suivant.<br>'
              texte += graphique
            }
            ensembleSolutions = inferieure
              ? intervalleLaTex('-\\infty', borne, true, estInegStrict)
              : intervalleLaTex(borne, '+\\infty', estInegStrict, true)
            texteCorr = `Pour résoudre graphiquement cette inéquation : <br>
              $\\bullet$ On trace la courbe d'équation $y=x^3$. <br>
              $\\bullet$ On trace la droite horizontale d'équation $y=${a}$. Elle coupe la courbe au point d'abscisse $${borne}$, car $${borne}^3=${a}$. <br>
              $\\bullet$ Les solutions sont les abscisses respectives des points de la courbe situés ${inferieure ? (estInegStrict ? 'strictement en dessous de' : 'sur ou sous') : estInegStrict ? 'strictement au-dessus de' : 'sur ou au-dessus de'} la droite.<br>
              ${graphiqueC}
              L'ensemble des solutions de l'inéquation $x^3${signeInégalité}${a}$ est : `
          }
          break
      }
      texteCorr += `$${miseEnEvidence(ensembleSolutions)}$`
      if (this.interactif) {
        texte +=
          '<br>$S=$' +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierEnsemble)
      }
      handleAnswers(
        this,
        i,
        {
          reponse: {
            value: ensembleSolutions,
            options: { intervalle: true },
          },
        },
        { formatInteractif: 'calcul' },
      )
      if (this.questionJamaisPosee(i, texteCorr)) {
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
