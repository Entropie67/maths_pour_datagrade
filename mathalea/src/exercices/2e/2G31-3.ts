import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { droite } from '../../lib/2d/droites'
import { repere } from '../../lib/2d/reperes'
import { Segment, segment } from '../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../lib/2d/textes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { reduireAxPlusB } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { abs } from '../../lib/outils/nombres'
import { pgcd } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'

export const titre =
  'Déterminer une équation réduite à partir de sa représentation graphique'
export const dateDeModifImportante = '08/12/2024'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
/**
 *
 * @author Stéphane Guyon + modif Gilles Mora (droite verticale)
 */
export const uuid = '41e6f'

export const refs = {
  'fr-fr': ['2G31-3'],
  'fr-ch': ['1mF2-6', '11LCFA2E-8', '11LSFA2E-8'],
}
export default class Lecturegraphiquedeaetb extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Types de questions ',
      3,
      '1 : Valeurs entières\n2 : Valeurs fractionnaires\n3 : Mélange',
    ]

    this.nbQuestions = 1 // On complète le nb de questions

    this.sup = 1
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = this.sup === 3 ? [1, 2] : [this.sup]
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // on rajoute les variables dont on a besoin
      let texte = ''
      let texteCorr = ''
      const typeDeQuestion = listeTypeDeQuestions[i]
      const b = randint(-5, 5) // ordonnée à l'origine

      const choix = context.isAmc ? 1 : choice([1, 1, 1, 1, 2])

      let d = typeDeQuestion === 1 ? 1 : choice([4, 5, 3]) * choice([-1, 1]) // dénominateur coefficient directeur
      let a =
        typeDeQuestion === 1
          ? randint(-5, 5)
          : choice([d + 1, d - 1]) * choice([-1, 1]) // coefficient directeur
      if (a === 0 && b === 0) {
        d = typeDeQuestion === 1 ? 1 : choice([4, 5, 3]) * choice([-1, 1]) // dénominateur coefficient directeur
        a =
          typeDeQuestion === 1
            ? randint(-5, 5)
            : choice([d + 1, d - 1]) * choice([-1, 1]) // coefficient directeur
      } // On évite la situation de double nullité
      const coeffDir = new FractionEtendue(a, d)
      const A = pointAbstrait(a, 5, 'A') // droite horizontale
      const B = pointAbstrait(a, -5, 'B') // droite horizontale
      const droiteAB = droite(A, B) // droite horizontale
      droiteAB.color = colorToLatexOrHTML('red') // droite horizontale
      droiteAB.epaisseur = 2 // droite horizontale
      const r = repere({
        xMin: -8,
        xMax: 8,
        yMin: -8,
        yMax: 8,
        yLabelEcart: 0.8,
        yLabelDistance: 2,
        xLabelDistance: 2,
        grilleX: false,
        grilleY: false,
        grilleSecondaire: true,
        grilleSecondaireYDistance: 1,
        grilleSecondaireXDistance: 1,
        grilleSecondaireYMin: -8,
        grilleSecondaireYMax: 8,
        grilleSecondaireXMin: -8,
        grilleSecondaireXMax: 8,
      })
      const c = droite(a / d, -1, b) // On définit l'objet qui tracera la courbe dans le repère
      c.color = colorToLatexOrHTML('red')
      c.epaisseur = 2
      const o = texteParPosition('O', -0.5, -0.5, 0, 'black', 1)
      texte =
        'À partir de la représentation graphique de la droite ci-dessous, donner par lecture graphique son équation réduite.<br><br>'
      texte += mathalea2d(
        {
          xmin: -8,
          ymin: -8,
          xmax: 8,
          ymax: 8,
          scale: 0.5,
        },
        r,
        o,
        choix === 1 ? c : droiteAB,
      ) // On trace le graphique
      if (choix === 1) {
        if (a === 0) {
          // La droite est horizontale
          texteCorr = 'On observe que la droite est horizontale.'
          texteCorr += `<br>La droite est l'ensemble des points ayant comme ordonnée : $${texNombre(b, 1)}$.`
          texteCorr += `<br>L'équation réduite de cette droite est donc : $y=${miseEnEvidence(texNombre(b, 1))}$.`
        } else {
          // La droite n'est pas horizontale
          texteCorr =
            "On sait que l'équation réduite d'une droite non verticale est de la forme : $y= ax+b$ avec $a$ et $b$ deux réels non tous deux nuls.<br>"
          texteCorr +=
            "Le premier coefficient à lire graphiquement est $b$, l'ordonnée à l'origine de la droite.<br>"
          texteCorr +=
            "C'est l'ordonnée du point d'intersection de la droite avec l'axe des ordonnées.<br>"
          texteCorr += `On lit ici que le point $(0;${texNombre(b, 1)}) \\in (d)$.<br>`
          texteCorr += `On peut alors conclure que l'ordonnée à l'origine est : $b=${texNombre(b, 1)}$. <br>`
          texteCorr +=
            'On peut lire ensuite le coefficient directeur $a$ de la droite $(d)$.<br>'
          texteCorr +=
            'On sait que $a=\\dfrac{\\text{Dénivelé vertical}}{\\text{Déplacement horizontal}}$.'

          texteCorr +=
            typeDeQuestion === 1
              ? ''
              : '<br>On cherche un déplacement horizontal correspondant à un déplacement vertical entier.'
          texteCorr += '<br>On lit que pour un déplacement vers la droite '
          texteCorr +=
            typeDeQuestion === 1
              ? "d'une unité"
              : `de $${texNombre(d, 1)}$ unités`
          texteCorr += ', il faut '
          texteCorr += a > 0 ? 'monter de ' : 'descendre de '
          texteCorr += `$${abs(a)}$ unité${abs(a) === 1 ? '' : 's'} `
          texteCorr += `et donc $a=\\dfrac{${texNombre(a, 1)}}{${texNombre(d, 1)}}`
          if (pgcd(a, d) !== 1 || d === 1) {
            texteCorr += `=${coeffDir.texFractionSimplifiee}`
          }
          texteCorr += '$'

          texteCorr += `<br>On peut en déduire que l'équation réduite de la droite $(d)$ est : $y=${miseEnEvidence(reduireAxPlusB(coeffDir, b))}$.<br>`
          let s1: Segment
          let s2: Segment
          if (b + a < -8 || b + a > 8) {
            // Si cela sort du cadre
            s1 = segment(-d, b - a, 0, b - a, bleuMathalea)
            s1.epaisseur = 4
            s2 = segment(0, b - a, 0, b, bleuMathalea)
          } else {
            s1 = segment(0, b, d, b, bleuMathalea)
            s1.epaisseur = 4
            s2 = segment(d, b, d, a + b, bleuMathalea)
          }
          s2.epaisseur = 4

          if (a !== 0) {
            texteCorr += mathalea2d(
              {
                xmin: -8,
                ymin: -8,
                xmax: 8,
                ymax: 8,
                scale: 0.5,
              },
              r,
              s1,
              s2,
              c,
              o,
            )
          } // On trace le graphique
        }

        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: texte + '<br>',
            propositions: [
              {
                type: 'AMCNum',
                propositions: [
                  {
                    texte: texteCorr,
                    statut: '',
                    reponse: {
                      texte: 'coefficient directeur',
                      valeur: coeffDir.toNumber(),
                      param: {
                        digits: typeDeQuestion === 1 ? 1 : 3,
                        decimals: typeDeQuestion === 1 ? 0 : 2,
                        signe: true,
                        approx: 0,
                      },
                    },
                  },
                ],
              },
              {
                type: 'AMCNum',
                propositions: [
                  {
                    texte: '',
                    statut: '',
                    reponse: {
                      texte: "ordonnée à l'origine",
                      valeur: b,
                      param: {
                        digits: 1,
                        decimals: 0,
                        signe: true,
                        approx: 0,
                      },
                    },
                  },
                ],
              },
            ],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }

        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierFullOperations,
          {
            texteAvant: "<br>L'équation réduite de la droite est : $y=$",
          },
        )
        const reponse = reduireAxPlusB(coeffDir.simplifie(), b)
        handleAnswers(this, i, { reponse: { value: reponse } })
      } else {
        texteCorr = 'On observe que la droite est verticale.'
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierFullOperations,
          {
            texteAvant: "<br>L'équation réduite de la droite est : ",
          },
        )
        texteCorr += `<br>On peut en déduire que l'équation réduite de la droite $(d)$ est : $${miseEnEvidence(`x=${a}`)}$.`
        const reponse = `x=${a}`
        handleAnswers(this, i, {
          reponse: { value: reponse, options: { egaliteExpression: true } },
        })
      }
      if (this.questionJamaisPosee(i, a, b)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
