import { lectureAntecedentAnimee } from '../../lib/2d/LectureAntecedent'
import { repere } from '../../lib/2d/reperes'
import { latex2d } from '../../lib/2d/textes'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { context } from '../../modules/context'

import { courbe } from '../../lib/2d/Courbe'
import { bleuMathalea } from '../../lib/colors'
import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { deuxColonnes } from '../../lib/format/miseEnPage'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
export const dateDePublication = '20/09/2025'
export const dateDeModifImportante = '21/10/2026'
export const uuid = '28bee'
/**
 *
 * @author Gilles Mora
 */
export const refs = {
  'fr-fr': ['1A-F04-4'],
  'fr-ch': ['1mQCM-58'],
}

export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Déterminer le nombre de solutions de l'équation $f(x)=0$ avec un graphique"

// Réponses de la liste déroulante, indexées par le cas tiré
// (elles complètent la phrase « L'équation f(x)=0 … »)
const reponsesCas: Record<number, string> = {
  1: 'admet deux solutions négatives',
  2: 'admet deux solutions de signes contraires',
  3: 'admet une solution positive',
  4: "n'admet aucune solution",
}

// Choix de la liste déroulante : tous les nombres et signes possibles,
// pour ne pas restreindre la réponse aux seuls cas tirés
const choixListe = [
  "n'admet aucune solution",
  'admet une solution négative',
  'admet une solution positive',
  'admet deux solutions négatives',
  'admet deux solutions positives',
  'admet deux solutions de signes contraires',
]

// Nom de la courbe, placé à droite de son extrémité (x = 2) sans sortir de la fenêtre
const nomCourbe = (fonc: (x: number) => number) =>
  latex2d('\\mathscr{C}', 2.5, Math.min(4.5, Math.max(-3.5, fonc(2))), {
    color: bleuMathalea,
  })

export default class auto1AF4c extends ExerciceQcmACourt {
  cas = 1
  // Vrai en version interactive à liste déroulante : seule la valeur choisie dans la liste est mise en évidence
  listeDeroulante = false

  /**
   * Phrase de conclusion de la correction. Dans la liste déroulante, la phrase
   * « L'équation f(x)=0 » est donnée : on ne met en évidence que la réponse de la liste.
   */
  conclusion(fin: string) {
    if (this.listeDeroulante) {
      return `l'équation $f(x)=0$ ${texteEnCouleurEtGras(reponsesCas[this.cas])}.`
    }
    return `${texteEnCouleurEtGras("l'équation ")}$${miseEnEvidence('f(x)=0')}$${texteEnCouleurEtGras(fin)}.`
  }

  versionOriginale: () => void = () => {
    this.cas = 1
    const figureId = `lectureAntecedentsEx${this.numeroExercice ?? 0}Q0`
    const o = latex2d('\\text{O}', -0.3, -0.3, { letterSize: 'scriptsize' })

    const fonc = (x: number) => 0.3 * (x ** 3 - 7.8 * x - 3)

    const repere1 = repere({
      xMin: -4.05,
      xMax: 3,
      yMin: -4.05,
      yMax: 3,
      grilleX: true,
      grilleY: true,
      xThickMin: -4,
      yThickMin: -4,
      yThickMax: 4,
      thickHauteur: 0.1,
      xLabelListe: [-3, -2, -1, 1, 2],
      yLabelListe: [-3, -2, -1, 1, 2],
      axesEpaisseur: 1.5,
    })

    const objetsEnonce = [repere1] //, courbe1

    this.enonce = `${deuxColonnes(
      `Voici la représentation graphique $\\mathscr{C}$ d'une fonction $f$ définie sur $[-3\\,;\\,2]$.<br>
   On s'intéresse à l'équation $f(x)=0$.<br>Une seule de ces propositions est exacte.`,
      mathalea2d(
        Object.assign(
          {
            pixelsParCm: 30,
            scale: 0.7,
            center: !context.isHtml,
            id: figureId,
          },
          {
            xmin: -4,
            ymin: -4,
            xmax: 3,
            ymax: 3,
          },
        ),

        objetsEnonce,
        o,
        nomCourbe(fonc),
        courbe(fonc, {
          xMin: -3,
          xMax: 2,
          repere: repere1,
          color: bleuMathalea,
          epaisseur: 2,
        }),
      ),
    )}`

    this.correction = `Il y a deux points d'intersection entre la courbe et l'axe des abscisses.<br>
    Les abscisses respectives de ces points sont les solutions de l'équation. Ces abscisses sont négatives. <br>
    Par conséquent, ${texteEnCouleurEtGras("l'équation ")}$${miseEnEvidence('f(x)=0')}$${texteEnCouleurEtGras(' admet exactement deux solutions et ces solutions sont négatives')}.`
    if (context.isHtml && !context.isTypst) {
      this.correction += `<br>${lectureAntecedentAnimee({
        figureId,
        x: [-2.576, -0.393],
        y: 0,
        pixelsParCm: 30,
      })}`
    }

    this.reponses = [
      "L'équation $f(x)=0$ admet exactement deux solutions et ces solutions sont négatives.",
      "L'équation $f(x)=0$ admet exactement deux solutions et ces solutions sont de signes contraires.",
      "L'équation $f(x)=0$ admet exactement une solution.",
      "L'équation $f(x)=0$ n'admet aucune solution.",
    ]
  }

  versionAleatoire = () => {
    const figureId = `lectureAntecedentsEx${this.numeroExercice ?? 0}Q0`
    let solutions: number[] = []
    const cas = choice([1, 2, 3, 4])
    this.cas = cas

    switch (cas) {
      case 1: // cas 2 solutions négatives
        {
          const o = latex2d('\\text{O}', -0.3, -0.3, {
            letterSize: 'scriptsize',
          })
          const a = randint(-4, 4, [-1, 0, 1]) / 10
          const x1 = randint(-25, -19) / 10
          const x2 = randint(-9, -4) / 10
          solutions = [x1, x2]

          const fonc = (x: number) => a * (x - x1) * (x - x2) * (x - 2.5)

          const repere1 = repere({
            xMin: -4.05,
            xMax: 3,
            yMin: -4.05,
            yMax: 5.05,
            grilleX: true,
            grilleY: true,
            xThickMin: -4,
            yThickMin: -4,
            yThickMax: 5,
            thickHauteur: 0.1,
            xLabelListe: [-3, -2, -1, 1, 2],
            yLabelListe: [-3, -2, -1, 1, 2, 3, 4],
          })

          const objetsEnonce = [repere1]

          this.enonce = `${deuxColonnes(
            `Voici la représentation graphique $\\mathscr{C}$ d'une fonction $f$ définie sur $[-3\\,;\\,2]$.<br>
         On s'intéresse à l'équation $f(x)=0$.<br>Une seule de ces propositions est exacte.`,
            mathalea2d(
              Object.assign(
                {
                  pixelsParCm: 30,
                  scale: 0.7,
                  center: !context.isHtml,
                  id: figureId,
                },
                {
                  xmin: -4,
                  ymin: -4,
                  xmax: 3,
                  ymax: 5,
                },
              ),

              objetsEnonce,
              o,
              nomCourbe(fonc),
              courbe(fonc, {
                xMin: -3,
                xMax: 2,
                repere: repere1,
                color: bleuMathalea,
                epaisseur: 2,
              }),
            ),
          )}`

          this.correction = `Il y a deux points d'intersection entre la courbe et l'axe des abscisses.<br>
    Les abscisses respectives de ces points sont les solutions de l'équation. Ces abscisses sont négatives. <br>
    Par conséquent, ${this.conclusion(' admet exactement deux solutions et ces solutions sont négatives')}`

          this.reponses = [
            "L'équation $f(x)=0$ admet exactement deux solutions et ces solutions sont négatives.",
            "L'équation $f(x)=0$ admet exactement deux solutions et ces solutions sont de signes contraires.",
            "L'équation $f(x)=0$ admet exactement une solution.",
            "L'équation $f(x)=0$ n'admet aucune solution.",
          ]
        }
        break

      case 2: // cas 2 solutions de signes contraires
        {
          const o = latex2d('\\text{O}', -0.3, -0.3, {
            letterSize: 'scriptsize',
          })
          const a = randint(-3, 3, [-1, 0, 1]) / 10
          const x1 = randint(7, 15) / 10
          const x2 = randint(-15, -6) / 10
          solutions = [x2, x1]

          const fonc = (x: number) => a * (x - x1) * (x - x2) * (x + 3.5)

          const repere1 = repere({
            xMin: -4.05,
            xMax: 3,
            yMin: -4.05,
            yMax: 5.05,
            grilleX: true,
            grilleY: true,
            xThickMin: -4,
            yThickMin: -4,
            yThickMax: 5,
            thickHauteur: 0.1,
            xLabelListe: [-3, -2, -1, 1, 2],
            yLabelListe: [-3, -2, -1, 1, 2, 3, 4],
          })

          const objetsEnonce = [repere1]

          this.enonce = `${deuxColonnes(
            `Voici la représentation graphique $\\mathscr{C}$ d'une fonction $f$ définie sur $[-3\\,;\\,2]$.<br>
         On s'intéresse à l'équation $f(x)=0$.<br>Une seule de ces propositions est exacte.`,
            mathalea2d(
              Object.assign(
                {
                  pixelsParCm: 30,
                  scale: 0.7,
                  center: !context.isHtml,
                  id: figureId,
                },
                {
                  xmin: -4,
                  ymin: -4,
                  xmax: 3,
                  ymax: 5,
                },
              ),

              objetsEnonce,
              o,
              nomCourbe(fonc),
              courbe(fonc, {
                xMin: -3,
                xMax: 2,
                repere: repere1,
                color: bleuMathalea,
                epaisseur: 2,
              }),
            ),
          )}`

          this.correction = `Il y a deux points d'intersection entre la courbe et l'axe des abscisses.<br>
    Les abscisses respectives de ces points sont les solutions de l'équation. Ces abscisses sont de signes contraires. <br>
    Par conséquent, ${this.conclusion(' admet exactement deux solutions et ces solutions sont de signes contraires')}`

          this.reponses = [
            "L'équation $f(x)=0$ admet exactement deux solutions et ces solutions sont de signes contraires.",
            "L'équation $f(x)=0$ admet exactement deux solutions et ces solutions sont négatives.",
            "L'équation $f(x)=0$ admet exactement une solution.",
            "L'équation $f(x)=0$ n'admet aucune solution.",
          ]
        }
        break

      case 3: // cas 1 solution exactement
        {
          const o = latex2d('\\text{O}', -0.3, -0.3, {
            letterSize: 'scriptsize',
          })

          const a = randint(-1, 1, [0]) / 10
          const x1 = randint(7, 15) / 10
          solutions = [x1]

          const fonc = (x: number) => a * (x - x1) * (x + 4.6) * (x + 3.8)

          const repere1 = repere({
            xMin: -4.05,
            xMax: 3,
            yMin: -5.05,
            yMax: 5,
            grilleX: true,
            grilleY: true,
            xThickMin: -4,
            yThickMin: -4,
            yThickMax: 5,
            thickHauteur: 0.1,
            xLabelListe: [-3, -2, -1, 1, 2],
            yLabelListe: [-3, -2, -1, 1, 2, 3, 4],
          })

          const objetsEnonce = [repere1]

          this.enonce = `${deuxColonnes(
            `Voici la représentation graphique $\\mathscr{C}$ d'une fonction $f$ définie sur $[-3\\,;\\,2]$.<br>
         On s'intéresse à l'équation $f(x)=0$.<br>Une seule de ces propositions est exacte.`,
            mathalea2d(
              Object.assign(
                {
                  pixelsParCm: 30,
                  scale: 0.7,
                  center: !context.isHtml,
                  id: figureId,
                },
                {
                  xmin: -4,
                  ymin: -4,
                  xmax: 3,
                  ymax: 5,
                },
              ),

              objetsEnonce,
              o,
              nomCourbe(fonc),
              courbe(fonc, {
                xMin: -3,
                xMax: 2,
                repere: repere1,
                color: bleuMathalea,
                epaisseur: 2,
              }),
            ),
          )}`

          this.correction = `Il y a un point d'intersection entre la courbe et l'axe des abscisses.<br>
    Son abscisse, solution de l'équation, est positive. <br>
    Par conséquent, ${this.conclusion(' admet exactement une solution')}`

          this.reponses = [
            "L'équation $f(x)=0$ admet exactement une solution.",
            "L'équation $f(x)=0$ admet exactement deux solutions et ces solutions sont de signes contraires.",
            "L'équation $f(x)=0$ admet exactement deux solutions et ces solutions sont négatives.",
            "L'équation $f(x)=0$ n'admet aucune solution.",
          ]
        }
        break

      case 4: // cas aucune solution
      default:
        {
          const o = latex2d('\\text{O}', -0.3, -0.3, {
            letterSize: 'scriptsize',
          })
          const a = randint(-1, 1, [0]) / 10
          const x1 = randint(23, 27) / 10
          const x2 = randint(-33, -38) / 10

          const fonc = (x: number) => a * (x - x1) * (x - x2) * (x + 4)
          const repere1 = repere({
            xMin: -4.05,
            xMax: 3,
            yMin: -4.05,
            yMax: 5.05,
            grilleX: true,
            grilleY: true,
            xThickMin: -4,
            yThickMin: -4,
            yThickMax: 5,
            thickHauteur: 0.1,
            xLabelListe: [-3, -2, -1, 1, 2],
            yLabelListe: [-3, -2, -1, 1, 2, 3, 4],
          })

          const objetsEnonce = [repere1]

          this.enonce = `${deuxColonnes(
            `Voici la représentation graphique $\\mathscr{C}$ d'une fonction $f$ définie sur $[-3\\,;\\,2]$.<br>
         On s'intéresse à l'équation $f(x)=0$.<br>Une seule de ces propositions est exacte.`,
            mathalea2d(
              Object.assign(
                {
                  pixelsParCm: 30,
                  scale: 0.7,
                  center: !context.isHtml,
                  id: figureId,
                },
                {
                  xmin: -4,
                  ymin: -4,
                  xmax: 3,
                  ymax: 5,
                },
              ),

              objetsEnonce,
              o,
              nomCourbe(fonc),
              courbe(fonc, {
                xMin: -3,
                xMax: 2,
                repere: repere1,
                color: bleuMathalea,
                epaisseur: 2,
              }),
            ),
          )}`

          this.correction = `Il n'y a aucun point d'intersection entre la courbe et l'axe des abscisses.<br>
    Par conséquent, ${this.conclusion(" n'admet aucune solution")}`

          this.reponses = [
            "L'équation $f(x)=0$ n'admet aucune solution.",
            "L'équation $f(x)=0$ admet exactement une solution.",
            "L'équation $f(x)=0$ admet exactement deux solutions et ces solutions sont de signes contraires.",
            "L'équation $f(x)=0$ admet exactement deux solutions et ces solutions sont négatives.",
          ]
        }
        break
    }
    if (context.isHtml && !context.isTypst) {
      this.correction += `<br>${lectureAntecedentAnimee({
        figureId,
        x: solutions,
        y: 0,
        pixelsParCm: 30,
      })}`
    }
  }

  /**
   * Version sans QCM : l'élève choisit le nombre et le signe des solutions
   * dans une liste déroulante. La case « Version QCM » (`sup3`) réactive le QCM.
   */
  nouvelleVersion() {
    this.listeDeroulante = false
    if (this.sup3) {
      super.nouvelleVersion()
      return
    }
    if (context.isAmc) {
      // L'export AMC reste un QCM : on court-circuite ExerciceQcmACourt
      ExerciceQcmA.prototype.nouvelleVersion.call(this)
      return
    }

    this.consigne = ''
    this.listeDeroulante = this.interactif
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 30; cpt++) {
      this.versionAleatoire()

      const bonneReponse = reponsesCas[this.cas]
      if (this.questionJamaisPosee(i, this.enonce, bonneReponse)) {
        const choices = [
          { label: 'Choisir une réponse', value: '' },
          ...choixListe.map((choix) => ({ label: choix, value: choix })),
        ]
        // En interactif, la liste déroulante complète la phrase sous la figure
        this.listeQuestions[i] = this.interactif
          ? this.enonce.replace(
              '<br>Une seule de ces propositions est exacte.',
              '',
            ) +
            `<br>L'équation $f(x)=0$ ${choixDeroulant(this, i, { choices })}.`
          : this.enonce.replace(
              'Une seule de ces propositions est exacte.',
              'Déterminer le nombre de solutions de cette équation et leur signe respectif éventuel.',
            )
        this.listeCorrections[i] = this.correction ?? ''

        handleAnswers(
          this,
          i,
          { reponse: { value: bonneReponse } },
          { formatInteractif: 'liste-deroulante' },
        )
        i++
      }
    }
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.options.vertical = true
  }
}
