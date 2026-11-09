import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment, segmentAvecExtremites } from '../../lib/2d/segmentsVecteurs'
import { labelPoint, texteParPosition } from '../../lib/2d/textes'
import { texteSurSegment } from '../../lib/2d/texteSurSegment'
import { milieu } from '../../lib/2d/utilitairesPoint'
import { bleuMathalea } from '../../lib/colors'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { texFractionReduite } from '../../lib/outils/deprecatedFractions'
import { reduireAxPlusB, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { stringNombre, texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'
export const titre =
  "Modéliser une situation géométrique à l'aide d'une équation"
export const dateDePublication = '16/12/2021'
/**
 *
 * @author Gilles Mora

 */
export const uuid = 'cf5b7'

export const refs = {
  'fr-fr': ['2L20-4', 'BP2RES24'],
  'fr-ch': ['11CTFA4A-11', '11LCFA4A-11', '11LSFA4A-11'],
}
export default class ModeliserEquationsGeometrie extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
    this.nbCols = 2 // Uniquement pour la sortie LaTeX
    this.nbColsCorr = 2 // Uniquement pour la sortie LaTeX
    this.sup = 1 // Niveau de difficulté
  }

  nouvelleVersion() {
    const typeQuestionsDisponibles = [
      'typeE1',
      'typeE2',
      'typeE3',
      'typeE4',
      'typeE5',
      'typeE6',
      'typeE7',
      'typeE8',
    ] //
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      // Boucle principale où i+1 correspond au numéro de la question
      const objets: NestedObjetMathalea2dArray = []
      let texte = ''
      let texteCorr = ''
      const variables: number[] = []
      switch (
        listeTypeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'typeE1':
          {
            const a = randint(1, 10) // valeur ajoutée
            const d = randint(1, 7) // largeur
            const b = randint(4 * d + 2 * a + 1, 50) // périmètre
            const c = b - 2 * a - 2 * d
            const A = pointAbstrait(0, 0, 'A', 'below')
            const B = pointAbstrait(10, 0, 'B', 'below')
            const C = pointAbstrait(10, 6, 'C')
            const D = pointAbstrait(0, 6, 'D')

            objets.push(
              segment(A, B),
              segment(B, C),
              segment(D, A),
              segment(C, D),
              labelPoint(A, B, C, D),
            )
            objets.push(
              texteParPosition(
                `x+${texNombre(a)}`,
                milieu(C, D).x + 0,
                milieu(C, D).y + 0.7,
                0,
                'black',
                1,
                'milieu',
                true,
              ),
              texteParPosition(
                `${texNombre(d)}`,
                milieu(A, D).x - 0.5,
                milieu(A, D).y,
                0,
                'black',
                1,
                'milieu',
                true,
              ),
            )

            texte = ` Un rectangle a pour largeur $${d}\\text{ cm}$ et pour longueur $x\\text{ cm}$.<br>
            En ajoutant $${a}\\text{ cm}$ à la longueur de ce rectangle, on obtient un nouveau rectangle dont le périmètre est $${b}\\text{ cm}$.<br>
             Quelle est la longueur $x$ du rectangle initial ?<br>
              `
            texteCorr =
              ' On réalise une petite figure à main levée pour visualiser la situation :<br>'
            texteCorr += mathalea2d(
              {
                xmin: -1,
                ymin: -1,
                xmax: 12,
                ymax: 8,
                pixelsParCm: 20,
                mainlevee: true,
                amplitude: 0.5,
                scale: 0.7,
              },
              objets,
            )
            texteCorr += `<br>Le périmètre du rectangle obtenu est donné par la formule : $2\\times (\\ell+L)$ avec $\\ell$ la largeur du rectangle et $L$ sa longueur. <br>
                  Comme $\\ell=${d}$ et $L=x+${a}$, le périmètre est donné en fonction de $x$ par : $ 2(${d}+x+${a})=2(x+${a + d})=2x+${2 * a + 2 * d}$.<br>
       Puisque le périmètre du rectangle est $${b}\\text{ cm}$, on cherche $x$ tel que : $2x+${2 * a + 2 * d}=${b}$.<br>
       $\\begin{aligned}
       2x+${2 * a + 2 * d}&=${b}\\\\
       2x+${2 * a + 2 * d}${miseEnEvidence(-2 * a - 2 * d)}&=${b}${miseEnEvidence(-2 * a - 2 * d)}\\\\
       2x&=${b - 2 * a - 2 * d}\\\\
       x&=\\dfrac{${b - 2 * a - 2 * d}}{2}\\\\
       x&=${texNombre(c / 2)}\\end{aligned}$<br>

       La longueur $x$ du rectangle initial est $${texNombre(c / 2)}\\text{ cm}$.
       `
            variables.push(a, b, c, d)
          }
          break
        case 'typeE2':
          {
            const a = randint(1, 10)
            const d = randint(1, 5) // largeur
            const b = randint(d * d + d * a + 1, 100)

            const A = pointAbstrait(0, 0, 'A', 'below')
            const B = pointAbstrait(10, 0, 'B', 'below')
            const C = pointAbstrait(10, 6, 'C')
            const D = pointAbstrait(0, 6, 'D')

            objets.push(
              segment(A, B),
              segment(B, C),
              segment(D, A),
              segment(C, D),
              labelPoint(A, B, C, D),
            )
            objets.push(
              texteParPosition(
                `x+${texNombre(a)}`,
                milieu(C, D).x + 0,
                milieu(C, D).y + 0.7,
                0,
                'black',
                1,
                'milieu',
                true,
              ),
              texteParPosition(
                `${texNombre(d)}`,
                milieu(A, D).x - 0.5,
                milieu(A, D).y,
                0,
                'black',
                1,
                'milieu',
                true,
              ),
            )
            texte = ` Un rectangle a pour largeur $${d}\\text{ cm}$ et pour longueur $x\\text{ cm}$.<br>
             En ajoutant $${a}\\text{ cm}$ à la longueur de ce rectangle, on obtient un nouveau rectangle dont l'aire est $${b}\\text{ cm}^2$.<br>
              Quelle est la longueur $x$ du rectangle initial ? <br>
              On donnera le résultat sous la forme d'une fraction irréductible ou d'un nombre entier le cas échéant.`
            texteCorr =
              ' On réalise une petite figure à main levée pour visualiser la situation :<br>'
            texteCorr += mathalea2d(
              {
                xmin: -1,
                ymin: -1,
                xmax: 12,
                ymax: 8,
                pixelsParCm: 20,
                mainlevee: true,
                amplitude: 0.5,
                scale: 0.7,
              },
              objets,
            )
            texteCorr += `L'aire du rectangle obtenu est donnée par la formule : $\\ell\\times L$ avec $\\ell$ la largeur du rectangle et $L$ sa longueur. <br>
                   Comme $\\ell=${d}$ et $L=x+${a}$, l'aire est donnée en fonction de $x$ par : $ ${rienSi1(d)}\\times (x+${a})=${rienSi1(d)}x+${d * a}$.<br>
        Puisque l'aire du rectangle est $${b}\\text{ cm}$, on cherche $x$ tel que : $${rienSi1(d)}x+${d * a}=${b}$.<br>
       $\\begin{aligned}
        ${rienSi1(d)}x+${d * a}&=${b}\\\\
        ${rienSi1(d)}x+${d * a}${miseEnEvidence(-d * a)}&=${b}${miseEnEvidence(-d * a)}\\\\
                ${rienSi1(d)}x&=${b - d * a}
        \\end{aligned}$<br>`
            if (d !== 1) {
              texteCorr += `${sp(18)}$\\begin{aligned}
          \\dfrac{${d}x}{${miseEnEvidence(d)}}&=\\dfrac{${b - d * a}}{${miseEnEvidence(d)}}\\\\
               x&=${texFractionReduite(b - d * a, d)}\\end{aligned}$<br>`
            } else {
              texteCorr += ''
            }
            texteCorr += ` La longueur $x$ du rectangle initial est $${texFractionReduite(b - d * a, d)}\\text{ cm}$.
        `
            variables.push(a, b, d)
          }
          break
        case 'typeE3':
          {
            const a = randint(1, 10)
            const b = randint(a * a + 1, 100)
            const A = pointAbstrait(0, 0, 'A', 'below')
            const B = pointAbstrait(10, 0, 'B', 'below')
            const C = pointAbstrait(0, 6, 'C')
            objets.push(
              segment(A, B),
              segment(B, C),
              segment(A, C),
              labelPoint(A, B, C),
              codageAngleDroit(B, A, C),
            )
            objets.push(
              texteParPosition(
                `${texNombre(a)}`,
                milieu(A, B).x + 0,
                milieu(A, B).y - 0.5,
                0,
                'black',
                1,
                'milieu',
                true,
              ),
              texteParPosition(
                'x',
                milieu(A, C).x - 0.5,
                milieu(A, C).y,
                0,
                'black',
                1,
                'milieu',
                true,
              ),
            )
            texte = ` Un triangle $ABC$ est rectangle en $A$. On a $AB= ${a}\\text{ cm}$ et $AC= x\\text{ cm}$.<br>
         Sachant que le carré de son hypoténuse est $${b}$, déterminer la valeur exacte de $x$. `
            texteCorr =
              ' On réalise une petite figure à main levée pour visualiser la situation :<br>'
            texteCorr += mathalea2d(
              {
                xmin: -1,
                ymin: -1,
                xmax: 12,
                ymax: 8,
                pixelsParCm: 20,
                mainlevee: true,
                amplitude: 0.5,
                scale: 0.7,
              },
              objets,
            )
            texteCorr += `Le carré de l'hypoténuse est égal à $${b}$. On a donc $BC^2=${b}$.<br>
          Le triangle $ABC$ est rectangle en $A$, d'après le théorème de Pythagore :<br>
        $\\begin{aligned}
        AB^2+AC^2&=BC^2\\\\
        ${a * a}+x^2&=${b}\\\\
        ${a * a}+x^2${miseEnEvidence(-a * a)}&=${b} ${miseEnEvidence(-a * a)}\\\\
        x^2&=${b - a * a}\\\\
        x&=\\sqrt{${b - a * a}}${sp(10)} \\text{car}${sp(2)} x>0
        \\end{aligned}$`

            if (
              b - a * a === 1 ||
              b - a * a === 4 ||
              b - a * a === 9 ||
              b - a * a === 16 ||
              b - a * a === 25 ||
              b - a * a === 36 ||
              b - a * a === 49 ||
              b - a * a === 64 ||
              b - a * a === 81 ||
              b - a * a === 100
            ) {
              texteCorr += `<br>
            ${sp(28)} $x=${Math.sqrt(b - a * a)}$<br>
         La valeur de $x$ cherchée est $${Math.sqrt(b - a * a)}$.
         `
            } else {
              texteCorr += `<br>
         La valeur de $x$ cherchée est $\\sqrt{${b - a * a}}$.
         `
            }
            variables.push(a, b)
          }
          break
        case 'typeE4':
          {
            const b = randint(1, 10)
            const a = randint(b + 1, 15)
            const M = pointAbstrait(0, 0, 'M', 'below')
            const N = pointAbstrait(10, 0, 'N', 'below')
            const P = pointAbstrait(0, 6, 'P')

            objets.push(
              segment(M, N),
              segment(N, P),
              segment(M, P),
              labelPoint(M, N, P),
              codageAngleDroit(N, M, P),
            )
            objets.push(
              texteParPosition(
                `${texNombre(a)}`,
                milieu(M, P).x - 0.5,
                milieu(M, P).y,
                0,
                'black',
                1,
                'milieu',
                true,
              ),
              texteParPosition(
                'x',
                milieu(M, N).x + 0,
                milieu(M, N).y - 0.5,
                0,
                'black',
                1,
                'milieu',
                true,
              ),
              texteSurSegment(`$x+${texNombre(b)}$`, P, N, 'black', 0.5),
            )
            // texteParPosition(`$$x+$$${texNombre(b)}`, milieu(P, N).x + 1, milieu(P, N).y, 0, 'black', 2, 'milieu'', true))
            texte = ` Un triangle $MNP$ est rectangle en $M$. On a $MP= ${a}\\text{ cm}$ et $MN= x\\text{ cm}$.<br>
             L'hypoténuse du triangle $MNP$ mesure $${b}\\text{ cm}$ de plus que le côté $[MN]$.<br>
             Déterminer la valeur de $x$ sous la forme d'une fraction irréductible ou d'un nombre entier le cas échéant. `
            texteCorr =
              ' On réalise une petite figure à main levée pour visualiser la situation :<br>'
            texteCorr += mathalea2d(
              {
                xmin: -1,
                ymin: -1,
                xmax: 12,
                ymax: 8,
                pixelsParCm: 20,
                mainlevee: true,
                amplitude: 0.5,
                scale: 0.7,
              },
              objets,
            )
            texteCorr += `Le triangle $MNP$ est rectangle en $M$, d'après le théorème de Pythagore :<br>
            $\\begin{aligned}
            MN^2+MP^2&=PN^2\\\\
            x^2+${a}^2&=(x+${b})^2\\\\
            x^2+${a * a}&= x^2+2\\times x\\times ${b}+${b}^2\\\\
            x^2+${a * a}&= x^2+${2 * b}x+${b * b}\\\\
            ${a * a}+\\cancel{x^2}&=\\cancel{x^2}+${2 * b}x+${b * b} \\\\
            ${2 * b}x+${b * b}&=${a * a}\\\\
            ${2 * b}x+${b * b}${miseEnEvidence(-b * b)}&=${a * a}${miseEnEvidence(-b * b)}\\\\
            ${2 * b}x&=${a * a - b * b}\\\\
            \\dfrac{${2 * b}x}{${miseEnEvidence(2 * b)}}&=\\dfrac{${a * a - b * b}}{${miseEnEvidence(2 * b)}}\\\\
            x&=${texFractionReduite(a * a - b * b, 2 * b)}\\end{aligned}$<br>
            
       La valeur de $x$ cherchée est : $${texFractionReduite(a * a - b * b, 2 * b)}$.
       `
            variables.push(a, b)
          }
          break
        case 'typeE5':
          {
            const a = randint(1, 8)
            const b = randint(a * a + 1, 100)

            texte = ` En augmentant le côté d'un carré de $${a}\\text{ cm}$, son aire augmente de $${b}\\text{ cm}^2$.<br>
      Quelle est la longueur du côté de ce carré ? <br>
      On donnera le résultat sous la forme d'une fraction irréductible ou d'un nombre entier le cas échéant.`
            texteCorr = `On note $x$ la longueur du côté du carré que l'on cherche.<br>
      La différence des aires entre les deux carrés est $${b}$, on cherche $x$ tel que : <br>
      $\\begin{aligned}
      (x+${a})^2-x^2&=${b}\\\\
      \\cancel{x^2}+ ${2 * a}x+${a}^2-\\cancel{x^2}&=${b}\\\\
       ${2 * a}x+${a * a}&=${b}\\\\
        ${2 * a}x+${a * a}${miseEnEvidence(-a * a)}&=${b}${miseEnEvidence(-a * a)}\\\\
         ${2 * a}x&=${b - a * a}\\\\
         \\dfrac{${2 * a}x}{${miseEnEvidence(2 * a)}}&=\\dfrac{${b - a * a}}{${miseEnEvidence(2 * a)}}\\\\
         x&=${texFractionReduite(b - a * a, 2 * a)}\\end{aligned}$
           <br>
           La longueur du côté du carré est $${texFractionReduite(b - a * a, 2 * a)}\\text{ cm}$.
 `
            variables.push(a, b)
          }
          break
        case 'typeE6':
          {
            const b = randint(1, 7) // petite base
            const a = randint(b + 2, 14) // grande base
            const d = (a - b) / 2
            const e = randint(1, 10) * 2
            const c = (e * (a + b)) / 2 // aire
            const A = pointAbstrait(0, 0, 'A', 'below')
            const H = pointAbstrait(9, 0, 'H', 'below')
            const B = pointAbstrait(15, 0, 'B', 'below')
            const C = pointAbstrait(15, 8, 'C')
            const D = pointAbstrait(9, 8, 'D')
            const E = pointAbstrait(0, -1, 'E')
            const F = pointAbstrait(15, -1, 'F')

            objets.push(
              segment(A, D),
              segmentAvecExtremites(E, F),
              segment(A, B),
              segment(B, C),
              segment(D, C),
              segment(D, H),
              codageAngleDroit(A, B, C),
              codageAngleDroit(B, C, D),
              labelPoint(A, H, D, B, C),
              codageAngleDroit(B, H, D),
            )
            objets.push(
              texteSurSegment(`${stringNombre(b)} cm`, D, C, 'black', +0.5),
              texteSurSegment(`${stringNombre(a)} cm`, E, F, 'black', -0.5),
              texteParPosition(
                'x',
                milieu(B, C).x + 0.5,
                milieu(B, C).y,
                0,
                'black',
                1,
                'milieu',
                true,
              ),
            )

            texte = ' $ABCD$ est un trapèze rectangle.<br> '

            texte +=
              "Le schéma ci-dessous n'est pas à l'échelle.<br>" +
              mathalea2d(
                {
                  xmin: -1,
                  ymin: -2,
                  xmax: 16,
                  ymax: 10,
                  pixelsParCm: 20,
                  scale: 1,
                },
                objets,
              )

            texte += `Sachant que l'aire de ce trapèze est $${c}\\text{ cm}^2$ et en utilisant les données du graphique, déterminer la hauteur de ce trapèze.<br>
                    <br>`
            texteCorr = mathalea2d(
              {
                xmin: -1,
                ymin: -3,
                xmax: 16,
                ymax: 10,
                pixelsParCm: 20,
                scale: 0.7,
              },
              objets,
            )
            texteCorr += `<br>La hauteur du trapèze est $x$. Il est constitué du rectangle $HBCD$ et du triangle rectangle $AHD$. <br>
                    Son aire est donc la somme des aires de ces deux figures. <br>
                    $\\bullet~$ L' aire du rectangle $HBCD$ est : $${b}\\times x=${reduireAxPlusB(b, 0)}$.<br>
                    $\\bullet~$ L' aire de triangle rectangle $AHD$ est : $\\dfrac{(${a}-${b})\\times x}{2}=${reduireAxPlusB((a - b) / 2, 0)}$.
                    <br>
                    Puisque l'aire du trapèze est $${c}\\text{ cm}^2$, $x$ est donc la solution de l'équation : $${reduireAxPlusB(b, 0)} + ${reduireAxPlusB((a - b) / 2, 0)}=${c}$.<br>
                    $\\begin{aligned}
                    ${reduireAxPlusB(b, 0)} + ${reduireAxPlusB((a - b) / 2, 0)}&=${c}\\\\
                    ${texNombre(b + (a - b) / 2)}x&=${c}\\\\
                    \\dfrac{${texNombre(b + d)}x}{${miseEnEvidence(texNombre(b + d))}}&=\\dfrac{${c}}{${miseEnEvidence(texNombre(b + d))}}\\\\
                    x&=${texFractionReduite(c, b + d)}
                    \\end{aligned}$<br>
                    La hauteur du trapèze est : $${texFractionReduite(c, b + d)}\\text{ cm}$.`
            variables.push(a, b, c, d)
          }
          break
        case 'typeE7':
          {
            const a = randint(3, 8) // largeur rect
            const b = randint(1, 6) // hauteur triang
            const c = randint(1, 6) // valeur ajout à x
            const e = randint(1, 20)
            const d = (e * (2 * a + b) + 2 * a * c + c * b) / 2 // aire
            const A = pointAbstrait(0, 0, 'A', 'below')
            const H = pointAbstrait(5, 6, 'H', 'below')
            const B = pointAbstrait(10, 0, 'B', 'below')
            const C = pointAbstrait(10, 6, 'C')
            const D = pointAbstrait(0, 6, 'D')
            const E = pointAbstrait(5, 10, 'E')

            objets.push(
              segment(A, B),
              segment(B, C),
              segment(C, D),
              segment(A, D),
              segment(E, C),
              segment(E, D),
              segment(E, H),
              codageAngleDroit(E, H, C),
              labelPoint(A, H, D, B, C, E),
              codageSegments('//', bleuMathalea, D, E, E, C),
            )
            objets.push(
              texteParPosition(
                `${texNombre(a)}`,
                milieu(B, C).x + 0.4,
                milieu(B, C).y,
                0,
                'black',
                1,
                'milieu',
                true,
              ),
              texteParPosition(
                `${texNombre(b)}`,
                milieu(E, H).x + 0.4,
                milieu(E, H).y,
                0,
                'black',
                1,
                'milieu',
                true,
              ),
              texteParPosition(
                `x + ${texNombre(c)}`,
                milieu(A, B).x + 0.4,
                milieu(A, B).y - 0.4,
                0,
                'black',
                1,
                'milieu',
                true,
              ),
            )

            texte =
              ` La figure ci-dessous (qui n'est pas à l'échelle) est composée d'un rectangle $ABCD$ et d'un triangle isocèle $DEC$. <br>
        L'unité est le mètre.<br> ` +
              mathalea2d(
                {
                  xmin: -1,
                  ymin: -1,
                  xmax: 12,
                  ymax: 11,
                  pixelsParCm: 20,
                  scale: 1,
                },
                objets,
              )

            texte += `Sachant que l'aire de cette figure est $${texNombre(d)}\\text{ m}^2$ et en utilisant les données du graphique, déterminer la valeur exacte de $x$.<br>
         <br>`
            texteCorr = mathalea2d(
              {
                xmin: -1,
                ymin: -1,
                xmax: 16,
                ymax: 11,
                pixelsParCm: 20,
                scale: 0.7,
              },
              objets,
            )
            texteCorr += `<br>La figure est constituée du rectangle $ABCD$ et du triangle isocèle $DEC$. <br>
        Son aire est donc la somme des aires de ces deux figures. <br>
        $\\bullet~$ L' aire du rectangle $ABCD$ est : $${a}\\times (x+${c})=${reduireAxPlusB(a, a * c)}$ ;<br>
        $\\bullet~$ L' aire de triangle isocèle $DEC$ est : $\\dfrac{${b}\\times(x +${c})}{2}=${texFractionReduite(b, 2)}(x+${c})=${reduireAxPlusB(b / 2, (b * c) / 2)}$.<br>
        L'aire de la figure étant $${texNombre(d)}\\text{ m}^2$, on cherche $x$ tel que : <br>
        $\\begin{aligned}
        (${reduireAxPlusB(a, a * c)})+(${reduireAxPlusB(b / 2, (b * c) / 2)})&=${texNombre(d)}\\\\
        ${reduireAxPlusB(a, a * c)}+${reduireAxPlusB(b / 2, (b * c) / 2)}&=${texNombre(d)}\\\\
        ${reduireAxPlusB(a + b / 2, a * c + (b * c) / 2)}&=${texNombre(d)}\\\\
        ${reduireAxPlusB(a + b / 2, a * c + (b * c) / 2)}${miseEnEvidence(texNombre(-a * c - (b * c) / 2))}&=${d}${miseEnEvidence(texNombre(-a * c - (b * c) / 2))}\\\\
                ${reduireAxPlusB(a + b / 2, 0)}&=${reduireAxPlusB(0, d - a * c - (b * c) / 2)}\\\\
                \\dfrac{${reduireAxPlusB(a + b / 2, 0)}}{${miseEnEvidence(texNombre(a + b / 2))}}&=\\dfrac{${texNombre(d - a * c - (b * c) / 2)}}{${miseEnEvidence(texNombre(a + b / 2))}}\\\\
                x&=${texFractionReduite((d - a * c - (b * c) / 2) * 10, (a + b / 2) * 10)}
                \\end{aligned}$<br>
                La valeur de $x$ cherchée est donc : $ ${texFractionReduite((d - a * c - (b * c) / 2) * 10, (a + b / 2) * 10)}$.
                `
            variables.push(a, b, c, d)
          }
          break

        case 'typeE8':
        default:
          {
            const a = randint(10, 50) // longueur seg [AB]
            const A = pointAbstrait(0, 0, 'A', 'below')
            const B = pointAbstrait(10, 0, 'B', 'below')
            const C = pointAbstrait(10, 6, 'C')
            const D = pointAbstrait(4, 6, 'D')
            const E = pointAbstrait(2, 3.46, 'E')
            const M = pointAbstrait(4, 0, 'M', 'below')
            const K = pointAbstrait(10, -1, 'K')
            const L = pointAbstrait(0, -1, 'L')

            objets.push(
              segment(A, B),
              segment(A, E),
              segmentAvecExtremites(K, L),
              segment(E, M),
              segment(M, D),
              segment(B, C),
              segment(D, C),
              codageAngleDroit(B, M, D),
              codageAngleDroit(M, B, C),
              codageAngleDroit(B, C, D),
              codageAngleDroit(C, D, M),
              labelPoint(A, M, B, C, D, E),
              codageSegments('//', bleuMathalea, A, E, E, M, A, M),
              codageSegments('/', bleuMathalea, M, B, B, C, C, D, D, M),
            )
            objets.push(
              texteParPosition(
                '$x$',
                milieu(A, M).x,
                milieu(A, M).y - 0.3,
                0,
                'black',
                2,
                'milieu',
                true,
              ),
              texteParPosition(
                `${texNombre(a)}`,
                milieu(A, B).x,
                milieu(A, B).y - 1.5,
                0,
                'black',
                1,
                'milieu',
                true,
              ),
            )

            texte = `$[AB]$ est un segment de longueur $${a}$ et $M$ est un point de ce segment.<br>
      Du même côté du segment $[AB]$, on trace le triangle équilatéral $AME$ et le carré $MBCD$.<br>
      On pose $AM=x$.<br>
     Déterminer la valeur de $x$ pour que le périmètre du triangle $AME$ soit égal à celui du carré $MBCD$. `

            texteCorr = context.isHtml
              ? '<br>'
              : '' + 'On réalise une figure pour visualiser la situation :<br>'
            texteCorr += mathalea2d(
              {
                xmin: -1,
                ymin: -3,
                xmax: 12,
                ymax: 8,
                pixelsParCm: 30,
                scale: 2,
              },
              objets,
            )

            texteCorr += ` Le triangle $AME$ est un triangle équilatéral de côté $x$, son périmètre est donc $3x$.<br>
      
      Le carré $MBCD$ a pour côté $MB=${a}-x$. Son périmètre est donc : $4\\times (${a}-x)=${reduireAxPlusB(-4, 4 * a)} $.
      <br>
      On cherche $x$ tel que : <br>
      $\\begin{aligned}
      ${reduireAxPlusB(-4, 4 * a)}&=3x\\\\
      ${reduireAxPlusB(-4, 4 * a)} ${miseEnEvidence('-3\\textit{x}')}&=3x${miseEnEvidence('-3\\textit{x}')}\\\\
      ${reduireAxPlusB(-7, 4 * a)}&=0\\\\
      ${reduireAxPlusB(-7, 4 * a)}${miseEnEvidence(-4 * a)}&=0${miseEnEvidence(-4 * a)}\\\\
      \\dfrac{${reduireAxPlusB(-7, 0)}}{${miseEnEvidence('-7')}}&=\\dfrac{${reduireAxPlusB(0, -4 * a)}}{${miseEnEvidence('-7')}}\\\\
      x&=${texFractionReduite(-4 * a, -7)}
      \\end{aligned}$<br>
      Les deux périmètres sont égaux lorsque : $x=${texFractionReduite(-4 * a, -7)}$.
      `
            variables.push(a)
          }
          break
      }
      if (this.questionJamaisPosee(i, variables.map(String).join())) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
  // this.besoinFormulaireNumerique = ['Niveau de difficulté', 2,'1 : Facile\n2 : Difficile'];
}
