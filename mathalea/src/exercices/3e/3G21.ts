import Decimal from 'decimal.js'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { texteParPoint } from '../../lib/2d/textes'
import { homothetie, rotation } from '../../lib/2d/transformations'
import { angleOriente } from '../../lib/2d/utilitairesGeometriques'
import { pointSurSegment } from '../../lib/2d/utilitairesPoint'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { ajouterBoutonMathalea2d } from '../../lib/outils/enrichissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  contraindreValeur,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDeModifImportante = '14/01/2025'

export const titre =
  'Démontrer que deux droites sont ou ne sont pas parallèles avec le théorème de Thalès'

/**
 * Reciproque_Thales
 * @author Jean-claude Lhote
 * 18/10/21 passage de MG32 à MathALEA2D par Rémi Angot
 */
export const uuid = '3451c'

export const refs = {
  'fr-fr': ['3G21'],
  'fr-ch': ['11LCGM3C-1', '11LSGM3C-1', 'PRQMG03C-3'],
}
export default class ReciproqueThales extends Exercice {
  declare quatrieme: boolean
  declare sup: number
  declare sup2: number
  declare sup3: number

  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      3,
      ' 1 : Cas simple \n 2 : Complication \n 3 : Sans figure',
    ]
    this.besoinFormulaire2Numerique = [
      'Réciproque ou contraposée',
      3,
      ' 1 : Réciproque \n 2 : Contraposée \n 3 : Mélange',
    ]
    this.besoinFormulaire3Numerique = [
      'Triangles emboîtés ou papillon',
      3,
      " 1 : Triangles emboîtés \n 2 : Papillon \n 3 : L'un des deux au hasard",
    ]
    this.nbQuestions = 3
    this.spacing = context.isHtml ? 2 : 1.5
    this.spacingCorr = context.isHtml ? 3.5 : 1

    this.quatrieme = false
    this.sup = 1
    this.sup2 = 3
    this.sup3 = 3

    // coefficient de l'homothétie compris entre -0,8 et -0,2 ou entre 0,2 et 0,8 pour éviter les constructions trop serrées
  }

  nouvelleVersion(numeroExercice: number) {
    this.sup = contraindreValeur(1, 3, this.sup, 1)
    this.sup2 = contraindreValeur(1, 3, this.sup2, 1)
    this.sup3 = contraindreValeur(1, 3, this.sup3, 3)
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const lettre1 = randint(1, 26) // aleatoirisation du nom des points
      const s1 = lettreDepuisChiffre(lettre1)
      const lettre2 = randint(1, 26, [lettre1])
      const s2 = lettreDepuisChiffre(lettre2)
      const lettre3 = randint(1, 26, [lettre1, lettre2])
      const s3 = lettreDepuisChiffre(lettre3)
      const lettre4 = randint(1, 26, [lettre1, lettre2, lettre3])
      const s4 = lettreDepuisChiffre(lettre4)
      const lettre5 = randint(1, 26, [lettre1, lettre2, lettre3, lettre4])
      const s5 = lettreDepuisChiffre(lettre5)
      let x2 = randint(2, 4)
      let y2 = randint(3, 5)
      let x3 = randint(5, 6)
      let y3 = randint(-2, 1)
      let k = new Decimal(randint(2, 8)).div(10)
      k =
        this.sup3 === 2
          ? k.mul(-1)
          : this.sup3 === 3
            ? k.mul(randint(-1, 1, [0]))
            : k
      let k2
      if (this.sup2 === 1) {
        k2 = k.mul(1)
      } else if (this.sup2 === 3) {
        k2 = k.mul(choice([1, 1.1]))
      } else {
        k2 = k.mul(choice([0.9, 1.1]))
      }

      if (this.quatrieme) {
        k = k.abs()
        k2 = k2.abs()
      }
      let dist24
      let dist12 = new Decimal(x2 * x2 + y2 * y2).sqrt().round()
      let dist13 = new Decimal(x3 * x3 + y3 * y3).sqrt().round()
      while (dist12.eq(dist13)) {
        // éviter les triangles isocèles imbriqués qui ne nécéssitent aucun calcul.
        x2 = randint(2, 4)
        y2 = randint(3, 5)
        x3 = randint(5, 6)
        y3 = randint(-2, 1)
        dist12 = new Decimal(x2 * x2 + y2 * y2).sqrt().round()
        dist13 = new Decimal(x3 * x3 + y3 * y3).sqrt().round()
      }
      const dist15 = k.abs().mul(dist13)
      const dist14 = k2.abs().mul(dist12)
      let dist35

      if (k.isNeg()) {
        dist35 = dist13.plus(dist15)
        dist24 = dist12.plus(dist14)
      } else {
        dist35 = dist13.sub(dist15)
        dist24 = dist12.sub(dist14)
      }

      // On ne garde qu'une approximation au dixième pour l'exercice
      // mise en texte avec 1 chiffre après la virgule pour énoncé
      const s13 = texNombre(dist13, 3)
      const s12 = texNombre(dist12, 3)
      const s15 = texNombre(dist15, 3)
      const s14 = texNombre(dist14, 3)
      const s24 = texNombre(dist24, 3)
      const s35 = texNombre(dist35, 3)
      const A = pointAbstrait(0, 0)
      const B = pointAbstrait(x2, y2)
      const C = pointAbstrait(x3, y3)
      const t1 = polygone(A, B, C)
      t1.id = `M2D_${numeroExercice}_Q${i}_t1`
      const M = homothetie(B, A, k.toNumber())
      const N = homothetie(C, A, k.toNumber())
      const t2 = polygone(A, M, N)
      t2.id = `M2D_${numeroExercice}_Q${i}_t2`
      const m = pointSurSegment(M, N, -0.5)
      const n = pointSurSegment(N, M, -0.5)
      const marqueNomM = texteParPoint(s4, m, 0, 'black', 1, 'milieu', true)
      const marqueNomN = texteParPoint(s5, n, 0, 'black', 1, 'milieu', true)
      const c = pointSurSegment(C, B, -0.5)
      const b = pointSurSegment(B, C, -0.5)
      const marqueNomC = texteParPoint(s3, c, 0, 'black', 1, 'milieu', true)
      const marqueNomB = texteParPoint(s2, b, 0, 'black', 1, 'milieu', true)
      const xMin = Math.min(A.x, B.x, C.x, M.x, N.x) - 1
      const xMax = Math.max(A.x, B.x, C.x, M.x, N.x) + 1
      const yMin = Math.min(A.y, B.y, C.y, M.y, N.y) - 1
      const yMax = Math.max(A.y, B.y, C.y, M.y, N.y) + 1
      let a
      if (k.isNeg()) {
        const demiangle = angleOriente(N, A, B) / 2
        const a2 = pointSurSegment(A, N, 0.5)
        a = rotation(a2, A, demiangle)
      } else {
        a = pointSurSegment(A, N, -0.5)
      }
      const marqueNomA = texteParPoint(s1, a)
      if (context.isHtml) {
        if (this.sup === 1) {
          // AM,AB,AN,AC sont donnés pas de calculs intermédiaires
          texte = `Dans la figure ci-dessous, $${s1 + s2}=${s12}\\text{ cm}$, $${s1 + s3}=${s13}\\text{ cm}$, $${s1 + s5}=${s15}\\text{ cm}$ et $${s1 + s4}=${s14}\\text{ cm}$.<br>`
          texteCorr = ''
        } else if (this.sup === 2) {
          // AN n'est pas donné, il faut le calculer avant.
          texte = `Dans la figure ci-dessous, $${s1 + s2}=${s12}\\text{ cm}$, $${s1 + s3}=${s13}\\text{ cm}$, $${s3 + s5}=${s35}\\text{ cm}$ et $${s2 + s4}=${s24}\\text{ cm}$.<br>`
          texteCorr = ''
          if (k.isPos()) {
            // triangles imbriqués
            texteCorr +=
              'On sait que ' +
              `$${s1 + s5}=${s1 + s3}-${s3 + s5}=${s13}-${s35}=${s15}$` +
              ' cm.<br>'
            texteCorr +=
              'On sait aussi que ' +
              `$${s1 + s4}=${s1 + s2}-${s2 + s4}=${s12}-${s24}=${s14}$` +
              ' cm.<br>'
          } else {
            // papillon
            texteCorr +=
              'On sait que ' +
              `$${s1 + s5}=${s3 + s5}-${s1 + s3}=${s35}-${s13}=${s15}$` +
              ' cm.<br>'
            texteCorr +=
              'On sait aussi que ' +
              `$${s1 + s4}=${s2 + s4}-${s1 + s2}=${s24}-${s12}=${s14}$` +
              ' cm.<br>'
          }
        } else if (randint(1, 2) === 1) {
          // triangles imbriqués sans figure
          texte = `$${s1}$, $${s2}$ et $${s3}$ sont trois points distincts. $${s4} \\in [${s1 + s2}]$ et $${s5} \\in [${s1 + s3}]$. <br> $${s1 + s2}=${s12}\\text{ cm}$, $${s1 + s3}=${s13}\\text{ cm}$, $${s1 + s4}=${s14}\\text{ cm}$ et $${s1 + s5}=${s15}\\text{ cm}$.<br>`
          texteCorr = ''
        } else {
          // papillon sans figure
          texte = `Les points $${s2}$, $${s1}$, $${s4}$ et $${s3}$, $${s1}$, $${s5}$ sont alignés dans cet ordre.<br>`
          texte += `$${s1 + s2}=${s12}\\text{ cm}$, $${s1 + s3}=${s13}\\text{ cm}$, $${s1 + s4}=${s14}\\text{ cm}$ et $${s1 + s5}=${s15}\\text{ cm}$.<br>`
          texteCorr = ''
        }
        texte += `Les droites $(${s2 + s3})$ et $(${s4 + s5})$ sont-elles parallèles ?<br>`
        if (this.interactif) {
          texte += '<div class="italic">Répondre «\u00a0oui\u00a0» ou «\u00a0non\u00a0».</div>'
          texte += ajouteChampTexteMathLive(
            this,
            i,
            `${KeyboardType.vFON} ${KeyboardType.variableN}`,
          )
        }

        texteCorr += `D'une part, on a : $\\dfrac{${s1 + s2}}{${s1 + s4}}=\\dfrac{${s12}}{${s14}}=\\dfrac{${s12}\\times${miseEnEvidence(
          s15,
          bleuMathalea,
        )}}{${s14}\\times${miseEnEvidence(s15, bleuMathalea)}}=\\dfrac{
        ${texNombre(dist12.mul(dist15), 3)}}
        {${texNombre(dist14.mul(dist15), 3)}}
      $.`
        texteCorr += `<br>D'autre part, on a : $\\dfrac{${s1 + s3}}{${s1 + s5}}=\\dfrac{${s13}}{${s15}}=\\dfrac{${s13}\\times${miseEnEvidence(
          s14,
          bleuMathalea,
        )}}{${s15}\\times${miseEnEvidence(s14, bleuMathalea)}}=\\dfrac{${texNombre(dist13.mul(dist14), 3)}}
        {${texNombre(dist14.mul(dist15), 3)}}
      $.`

        if (!k.eq(k2)) {
          if (!context.isAmc)
            handleAnswers(this, i, {
              reponse: {
                value: ['n', 'non'],
                options: { texteSansCasse: true },
              },
            })
          // droites non parallèles
          texteCorr += `<br>D'où : $\\dfrac{${s1 + s2}}{${s1 + s4}}\\not=\\dfrac{${s1 + s3}}{${s1 + s5}}$.<br>`
          texteCorr += `Donc d'après la contraposée du théorème de Thalès, les droites $(${s2 + s3})$ et $(${s4 + s5})$ ${texteEnCouleurEtGras('ne sont pas parallèles')}.<br>`
        } else {
          if (!context.isAmc)
            handleAnswers(this, i, {
              reponse: {
                value: ['o', 'oui'],
                options: { texteSansCasse: true },
              },
            })
          // droites parallèles
          texteCorr += `<br>D'où : $\\dfrac{${s1 + s2}}{${s1 + s4}}=\\dfrac{${s1 + s3}}{${s1 + s5}}$.<br>`
          if (k.isPos()) {
            texteCorr += `De plus, $${s1}$, $${s4}$, $${s2}$ et $${s1}$, $${s5}$, $${s3}$ sont alignés dans le même ordre.<br>`
          } else {
            texteCorr += `De plus, $${s4}$, $${s1}$, $${s2}$ et $${s5}$, $${s1}$, $${s3}$ sont alignés dans le même ordre.<br>`
          }
          texteCorr += `Donc d'après la réciproque du théorème de Thalès, les droites $(${s2 + s3})$ et $(${s4 + s5})$ ${texteEnCouleurEtGras('sont parallèles')}.<br>`
        }

        if (this.sup !== 3) {
          texte += mathalea2d(
            {
              xmin: xMin,
              xmax: xMax,
              ymin: yMin,
              ymax: yMax,
            },
            t1,
            t2,
            marqueNomA,
            marqueNomB,
            marqueNomC,
            marqueNomM,
            marqueNomN,
          )
        }

        const epaisseurTriangle = k.isNeg() ? 2 : 6 // En cas de configuration papillon il est inutile de changer l'épaisseur
        const boutonAideMathalea2d = ajouterBoutonMathalea2d(
          `${numeroExercice}_Q${i}`,
          `if (document.getElementById('M2D_${numeroExercice}_Q${i}_t1').dataset.colorie == undefined || (document.getElementById('M2D_${numeroExercice}_Q${i}_t1').dataset.colorie == 'false')){
          document.getElementById('M2D_${numeroExercice}_Q${i}_t1').style.stroke = '${bleuMathalea}';
          document.getElementById('M2D_${numeroExercice}_Q${i}_t2').style.stroke = 'red';
          document.getElementById('M2D_${numeroExercice}_Q${i}_t1').style.opacity = .5;
          document.getElementById('M2D_${numeroExercice}_Q${i}_t1').style.strokeWidth = ${epaisseurTriangle};
          document.getElementById('M2D_${numeroExercice}_Q${i}_t2').style.opacity = 1;
          document.getElementById('M2D_${numeroExercice}_Q${i}_t2').style.strokeWidth = 2;
          document.getElementById('M2D_${numeroExercice}_Q${i}_t1').dataset.colorie = 'dejaEnCouleur';
          document.getElementById('btnMathALEA2d_${numeroExercice}_Q${i}').classList.add('active');
        } else {
          document.getElementById('M2D_${numeroExercice}_Q${i}_t1').style.stroke = 'black';
          document.getElementById('M2D_${numeroExercice}_Q${i}_t2').style.stroke = 'black';
          document.getElementById('M2D_${numeroExercice}_Q${i}_t1').style.opacity = 1;
          document.getElementById('M2D_${numeroExercice}_Q${i}_t1').style.strokeWidth = 1;
          document.getElementById('M2D_${numeroExercice}_Q${i}_t2').style.opacity = 1;
          document.getElementById('M2D_${numeroExercice}_Q${i}_t2').style.strokeWidth = 1;
          document.getElementById('M2D_${numeroExercice}_Q${i}_t1').dataset.colorie = 'false';
          document.getElementById('btnMathALEA2d_${numeroExercice}_Q${i}').classList.remove('active');
  
        }
        `,
          'Mettre en couleur les $2$ triangles',
        )

        if (context.isHtml && this.sup !== 3) {
          texte += `<br><div style="display: inline-block;margin-top:20px;">${boutonAideMathalea2d}</div>`
        }
      } else {
        // sortie Latex
        texteCorr = ''
        if (this.sup === 1) {
          // niveau 1 : Calcul direct
          texte =
            '\\begin{minipage}[t]{.6 \\linewidth} \\vspace{0cm} Sur la figure ci-contre, on a  : \\begin{itemize}'
          texte += `\n\t \\item $${s1 + s2}=${s12}\\text{ cm}$ \n\t \\item $${s1 + s3}=${s13}\\text{ cm}$\n\t \\item $${s1 + s5}=${s15}\\text{ cm}$\n\t \\item $${s1 + s4}=${s14}\\text{ cm}$`
          texte +=
            '\\end{itemize}  ' +
            `Les droites $(${s2 + s3})$ et $(${s4 + s5})$ sont-elles parallèles ?<br>` +
            '\\end{minipage}'
        } else if (this.sup === 2) {
          // niveau 2 : Calcul intermédiaire nécessaire
          texte =
            '\\begin{minipage}[t]{.6 \\linewidth} \\vspace{0cm} Sur la figure ci-contre, on a  : \\begin{itemize}'
          texte += `\n\t \\item $${s1 + s2} = ${s12}\\text{ cm}$\n\t \\item $${s1 + s3} = ${s13}\\text{ cm}$\n\t \\item $${s3 + s5} = ${s35}\\text{ cm}$\n\t \\item $${s2 + s4} = ${s24}\\text{ cm}$`
          texte +=
            '\\end{itemize}  ' +
            `Les droites $(${s2 + s3})$ et $(${s4 + s5})$ sont-elles parallèles ?<br>` +
            '\\end{minipage}'
          if (k.isPos()) {
            // triangles imbriqués
            texteCorr +=
              'On sait que ' +
              `$${s1 + s5}=${s1 + s3}-${s3 + s5}=${s13}-${s35}=${s15}$` +
              ' cm.<br>'
            texteCorr +=
              'On sait aussi que ' +
              `$${s1 + s4}=${s1 + s2}-${s2 + s4}=${s12}-${s24}=${s14}$` +
              ' cm.<br>'
          } else {
            // papillon
            texteCorr +=
              'On sait que ' +
              `$${s1 + s5}=${s3 + s5}-${s1 + s3}=${s35}-${s13}=${s15}$` +
              ' cm.<br>'
            texteCorr +=
              'On sait aussi que ' +
              `$${s1 + s4}=${s2 + s4}-${s1 + s2}=${s24}-${s12}=${s14}$` +
              ' cm.<br>'
          } // énoncé sans figure
        } else if (randint(1, 2) === 1) {
          // triangles imbriqués
          texte = `$${s1}$, $${s2}$ et $${s3}$ sont trois point distincts. $${s4} \\in [${s1 + s2}]$ et $${s5} \\in [${s1 + s3}]$ <br> $${s1 + s2}=${s12}\\text{ cm}$, $${s1 + s3}=${s13}\\text{ cm}$, $${s1 + s4}=${s14}\\text{ cm}$ et $${s1 + s5}=${s15}\\text{ cm}$.<br>`
          texte += `Les droites (${s2 + s3}) et (${s4 + s5}) sont-elles parallèles ?<br>`
        } else {
          // papillon
          texte = `Les points $${s2}$, $${s1}$, $${s4}$ et $${s3}$, $${s1}$, $${s5}$ sont alignés dans cet ordre.<br>`
          texte += `$${s1 + s2}=${s12}\\text{ cm}$, $${s1 + s3}=${s13}\\text{ cm}$, $${s1 + s4}=${s14}\\text{ cm}$ et $${s1 + s5}=${s15}\\text{ cm}$.<br>`
          texte += `Les droites (${s2 + s3}) et (${s4 + s5}) sont-elles parallèles ?<br>`
        }

        if (this.sup < 3) {
          // on ne fait la figure que si niveau < 3
          texte += '\\begin{minipage}[t]{0.4 \\linewidth}'
          // dessin de la figure
          texte += '\\vspace{0pt}   \n \\begin{tikzpicture}[scale=0.7]' // Balise début de figure
          texte +=
            '\n\t \\tkzDefPoints{0/0/' +
            s1 +
            ',' +
            x3 +
            '/' +
            y3 +
            '/' +
            s3 +
            ',' +
            x2 +
            '/' +
            y2 +
            '/' +
            s2 +
            '}' // Placer les points du triangle principal
          texte += '\n\t \\tkzDrawPolygon(' + s1 + ',' + s2 + ',' + s3 + ')' // Trace le triangle principal

          // Définit les points M et N par homothétie de centre C et de rapport 0,3<k<0,8
          texte +=
            '\n\t \\tkzDefPointBy[homothety=center ' +
            s1 +
            ' ratio ' +
            k +
            '](' +
            s2 +
            ')' +
            '\t\\tkzGetPoint{' +
            s4 +
            '}' // Place le premier point du triangle image
          texte +=
            '\n\t \\tkzDefPointBy[homothety=center ' +
            s1 +
            ' ratio ' +
            k +
            '](' +
            s3 +
            ')' +
            '\t\\tkzGetPoint{' +
            s5 +
            '}' // Place le deuxième point du triangle image
          texte += '\n\t \\tkzDrawSegment(' + s4 + ',' + s5 + ')' // Trace le segment
          if (k.isPos()) {
            texte += '\n\t \\tkzLabelPoints[left](' + s1 + ')' // nomme les points
            texte += '\n\t \\tkzLabelPoints[above left](' + s2 + ',' + s4 + ')' // nomme les points
            texte += '\n\t \\tkzLabelPoints[below](' + s3 + ',' + s5 + ')' // nomme les points

            // Nomme les points au-dessus avec above, dessous avec below...
          } else {
            // position papillon -> position du nom inversée et nécessité de tracer le triangle secondaire
            texte += '\n\t \\tkzLabelPoints[below right](' + s1 + ')' // nomme les points
            texte += '\n\t \\tkzLabelPoints[below](' + s3 + ',' + s4 + ')' // nomme les points
            texte += '\n\t \\tkzLabelPoints[above](' + s2 + ',' + s5 + ')' // nomme les points
            texte += '\n\t \\tkzDrawPolygon(' + s1 + ',' + s4 + ',' + s5 + ')' // Trace le triangle secondaire
          }
          texte += '\n \\end{tikzpicture}' // Balise de fin de figure
          texte += '\\end{minipage}'
        }
        //  this.listeQuestions.push(texte) // on envoie la question

        // correction
        texteCorr += `D'une part on a $\\dfrac{${s1 + s2}}{${s1 + s4}}=\\dfrac{${s12}}{${s14}}=\\dfrac{${s12}\\times${miseEnEvidence(
          s15,
          bleuMathalea,
        )}}{${s14}\\times${miseEnEvidence(s15, bleuMathalea)}}=${texFractionFromString(
          texNombre(dist12.mul(dist15), 3),
          texNombre(dist14.mul(dist15), 4),
        )}$.`
        texteCorr += `<br>D'autre part on a $\\dfrac{${s1 + s3}}{${s1 + s5}}=\\dfrac{${s13}}{${s15}}=\\dfrac{${s13}\\times${miseEnEvidence(
          s14,
          bleuMathalea,
        )}}{${s15}\\times${miseEnEvidence(s14, bleuMathalea)}}=${texFractionFromString(
          texNombre(dist13.mul(dist14), 3),
          texNombre(dist14.mul(dist15), 4),
        )}$.`

        if (!k.eq(k2)) {
          // droites pas parallèles
          texteCorr += `<br>$\\dfrac{${s1 + s2}}{${s1 + s4}}\\not=\\dfrac{${s1 + s3}}{${s1 + s5}}$.<br>`
          texteCorr += `Donc d'après la contraposée du théorème de Thalès, les droites $(${s2 + s3})$ et $(${s4 + s5})$ ${texteEnCouleurEtGras('ne sont pas parallèles')}.<br>`
        } else {
          // droites parallèles
          texteCorr += `<br>$\\dfrac{${s1 + s2}}{${s1 + s4}}=\\dfrac{${s1 + s3}}{${s1 + s5}}$.<br>`
          if (k.isPos()) {
            texteCorr += `$${s1}$,$${s4}$,$${s2}$ et $${s1}$,$${s5}$,$${s3}$ sont alignés dans le même ordre.<br>`
          } else {
            texteCorr += `$${s4}$,$${s1}$,$${s2}$ et $${s5}$,$${s1}$,$${s3}$ sont alignés dans le même ordre.<br>`
          }
          texteCorr += `Donc d'après la réciproque du théorème de Thalès, les droites $(${s2 + s3})$ et $(${s4 + s5})$ ${texteEnCouleurEtGras('sont parallèles')}.<br>`
        }
        this.autoCorrectionAMC[i] = {
          enonce: '',
          enonceAvant: false,
          propositions: [
            {
              type: 'AMCOpen',
              propositions: [
                {
                  texte: texteCorr,
                  enonce: '<br>' + texte + '<br>',
                  statut: 6,
                  feedback: '',
                },
              ],
            },
          ],
        }
      }
      if (this.questionJamaisPosee(i, x2, y2, x3, y3)) {
        // Si la question n'a jamais été posée, on la stocke dans la liste des questions
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
