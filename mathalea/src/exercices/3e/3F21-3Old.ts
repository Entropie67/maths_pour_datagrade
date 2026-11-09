import { cercle } from '../../lib/2d/cercle'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { droite } from '../../lib/2d/droites'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { texteParPoint } from '../../lib/2d/textes'
import { milieu } from '../../lib/2d/utilitairesPoint'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha, sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { contraindreValeur, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Lire graphiquement les caractéristiques de la courbe représentative d'une fonction affine ou linéaire"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDeModifImportante = '28/05/2023'

/**
 * Lire la pente et l'ordonnée à l'origine d'une droite pour en déduire la forme algébrique de la fonction affine
 * @author Rémi Angot (modifié par EE pour l'ajout de paramètres)

 */
export const uuid = '056fa'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class PenteEtOrdonneeOrigineDroite extends Exercice {
  constructor() {
    super()
    this.besoinFormulaire2Numerique = [
      'Signe du coefficient directeur ',
      3,
      '1 : Positif\n2 : Négatif\n3: Peu importe',
    ]
    this.besoinFormulaireNumerique = [
      'Coefficient directeur ',
      3,
      '1 : Entier\n2 : Décimal\n3: Peu importe',
    ]
    this.besoinFormulaire3Numerique = [
      "Signe de l'ordonnée à l'origine ",
      3,
      '1 : Positif\n2 : Négatif\n3: Peu importe',
    ]
    this.besoinFormulaire4Numerique = [
      'Type de fonctions ',
      3,
      '1 : Linéaires\n2 : Affines et non linéaires\n3: Affines ou linéaires',
    ]

    this.nbQuestions = 2
    // this.nbCols = 2 // Uniquement pour la sortie LaTeX
    // this.nbColsCorr = 2 // Uniquement pour la sortie LaTeX

    this.sup = 3
    this.sup2 = 3
    this.sup3 = 3
    this.sup4 = 2
  }

  nouvelleVersion() {
    let questionInteractif = 0
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const signeNum =
        this.sup2 === 3 ? choice([-1, 1]) : this.sup2 === 2 ? -1 : 1
      const num =
        (this.sup === 2 ? choice([1, 3, 5]) : randint(1, 5)) * signeNum
      this.sup = contraindreValeur(1, 3, this.sup, 1)
      const den = this.sup === 3 ? randint(1, 2) : this.sup
      const a = num / den
      const b =
        this.sup4 === 1
          ? 0
          : (this.sup3 === 3 ? choice([-1, 1]) : this.sup3 === 2 ? -1 : 1) *
            randint(this.sup4 === 2 ? 1 : 0, 4)
      const vocabulaire = b === 0 ? 'linéaire' : 'affine'
      const xMin = context.isHtml ? -10 : -8
      const xMax = -xMin
      const yMin = xMin
      const yMax = -yMin

      const r = repere({ xMin, yMin, xMax, yMax })
      const f = (x: number): number => a * x + b

      const d = droite(a, -1, b)
      d.color = colorToLatexOrHTML(bleuMathalea)
      d.epaisseur = 2
      const c = cercle(pointAbstrait(0, b), 0.8, orangeMathalea)
      c.epaisseur = 2
      let x0 = -7
      while (
        !Number.isInteger(f(x0)) ||
        f(x0) <= yMin ||
        f(x0) >= yMax ||
        x0 === -1 ||
        x0 === 0
      ) {
        x0 += 1
        if (x0 >= xMax) {
          // pour éviter une boucle infinie
          x0 = 1
          break
        }
      }
      const A = pointAbstrait(x0, f(x0))
      const B = pointAbstrait(x0 + 1, f(x0))
      const C = pointAbstrait(x0 + 1, f(x0 + 1))
      const s1 = segment(A, B, orangeMathalea)
      const s2 = segment(B, C, orangeMathalea)
      const M1 = milieu(A, B)
      const M2 = milieu(B, C)
      const t1 = texteParPoint(
        '$1$',
        pointAbstrait(M1.x, M1.y + (a > 0 ? -0.4 : 0.4)),
      )
      const t2 = texteParPoint(
        `$${texNombre(a)}$`,
        pointAbstrait(M2.x + 0.6, M2.y),
      )
      t1.color = colorToLatexOrHTML(orangeMathalea)
      t2.color = colorToLatexOrHTML(orangeMathalea)

      s1.epaisseur = 3
      s1.pointilles = 5
      s2.epaisseur = 3
      s2.pointilles = 5

      const nomFonction = choice(['f', 'g', 'h', 'f_1', 'f_2', 'f_3'])

      const introduction =
        `On a représenté ci-dessous une fonction ${vocabulaire} $${nomFonction}$.<br>` +
        mathalea2d(
          {
            xmin: xMin,
            xmax: xMax,
            ymin: yMin,
            ymax: yMax,
            scale: context.isHtml ? 1 : 0.5,
          },
          r,
          d,
        )
      const consigneCorrection = mathalea2d(
        {
          xmin: xMin,
          xmax: xMax,
          ymin: yMin,
          ymax: yMax,
        },
        r,
        d,
        c,
        s1,
        s2,
        t1,
        t2,
      )
      let question1
      let question2
      let question3
      let indice = 0
      let correction1, correction2, correction3
      if (vocabulaire === 'affine') {
        question1 =
          numAlpha(indice) +
          `Quelle est l'ordonnée à l'origine de la fonction $${nomFonction}$ ?`
        question1 += ajouteChampTexteMathLive(
          this,
          questionInteractif,
          KeyboardType.clavierDeBaseAvecFraction,
        )
        correction1 = consigneCorrection
        correction1 +=
          numAlpha(indice) +
          `La droite coupe l'axe des ordonnées au point de coordonnées $(0;${b})$. L'ordonnée de $${nomFonction}$ à l'origine est donc $${miseEnEvidence(b)}$.`
        indice++
      }
      question2 =
        numAlpha(indice) +
        `Quel est le coefficient directeur de $${nomFonction}$ ?`
      question2 += ajouteChampTexteMathLive(
        this,
        (vocabulaire === 'affine' ? 1 : 0) + questionInteractif,
        KeyboardType.clavierDeBaseAvecFraction,
      )
      correction2 =
        numAlpha(indice) +
        `À chaque fois que l'on avance de 1 unité d'abscisses, on ${a > 0 ? 'monte' : 'descend'} de $${texNombre(Math.abs(a))}$ unité${Math.abs(a) >= 2 ? 's' : ''} d'ordonnées. `
      correction2 += `Le coefficient directeur de $${nomFonction}$ est donc $${miseEnEvidence(texNombre(a))}$.`
      indice++
      question3 =
        numAlpha(indice) +
        `En déduire l'expression algébrique de $${nomFonction}$.`
      question3 += ajouteChampTexteMathLive(
        this,
        (vocabulaire === 'affine' ? 2 : 1) + questionInteractif,
        KeyboardType.clavierFullOperations,
        { texteAvant: `$${sp(10)}${nomFonction} : x \\mapsto $` },
      )
      correction3 =
        numAlpha(indice) +
        `$${nomFonction}$ étant une fonction ${vocabulaire}, on a $${nomFonction} : x \\mapsto $` +
        (vocabulaire === 'affine'
          ? "$ax + b$ avec $a$ son coefficient directeur (ou pente) et $b$ son ordonnée à l'origine."
          : '$ax$ avec $a$ son coefficient directeur (ou pente).')
      correction3 +=
        `<br>Finalement, $${nomFonction} : x \\mapsto ${miseEnEvidence(`${(rienSi1(a) as string).toString().replace('.', ',')}x`)}$` +
        (vocabulaire === 'affine'
          ? `$${miseEnEvidence(ecritureAlgebrique(b))}$.`
          : '.')

      if (vocabulaire === 'affine')
        handleAnswers(this, questionInteractif, { reponse: { value: b } })
      handleAnswers(
        this,
        (vocabulaire === 'affine' ? 1 : 0) + questionInteractif,
        { reponse: { value: `\\frac{${num}}{${den}}` } },
      )
      handleAnswers(
        this,
        (vocabulaire === 'affine' ? 2 : 1) + questionInteractif,
        {
          reponse: {
            value: `\\frac{${num}}{${den}}x+${b}`,
            options: { fonction: true, variable: 'x' },
          },
        },
      )

      texte =
        introduction +
        (vocabulaire === 'affine' ? question1 + '<br>' : '') +
        question2 +
        '<br>' +
        question3
      texteCorr =
        (vocabulaire === 'affine' ? correction1 + '<br>' : '') +
        correction2 +
        '<br>' +
        correction3

      if (this.questionJamaisPosee(i, a, b, num, den)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: introduction + '<br>',
            enonceAvant: false,
            // enonceAvantUneFois: true, // EE : ce champ est facultatif et permet (si true) d'afficher l'énoncé ci-dessus une seule fois avant la numérotation de la première question de l'exercice. Ne fonctionne correctement que si l'option melange est à false.
            // enonceCentre: false, // EE : ce champ est facultatif et permet (si true) de centrer le champ 'enonce' ci-dessus.
            enonceApresNumQuestion: true, // New (12/2022) EE : ce champ est facultatif et permet (si true) de mettre le champ 'enonce' à côté du numéro de question (et non avant par défaut). Ne fonctionne (pour l'instant) que si la première question est AMCNum (pas de besoin autre pour l'instant).
            options: { multicolsAll: true },
            propositions: [],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
          if (vocabulaire === 'affine') {
            this.autoCorrectionAMC[i].propositions?.push({
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: question1,
                    valeur: [b],
                    param: {
                      signe: true,
                    },
                  },
                },
              ],
            })
          }
          this.autoCorrectionAMC[i].propositions?.push(
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: question2,
                    valeur: [a],
                    param: {
                      signe: true,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCOpen',
              propositions: [
                {
                  texte: '',
                  enonce: question3 + '<br>',
                  statut: 1,
                },
              ],
            },
          )
        }
        i++
        questionInteractif += vocabulaire === 'linéaire' ? 2 : 3
      }
      cpt++
    }
  }
}
