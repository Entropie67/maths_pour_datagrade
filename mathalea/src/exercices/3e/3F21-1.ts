import {
  droiteParPointEtPente,
  positionLabelDroite,
} from '../../lib/2d/droites'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { latexParPoint } from '../../lib/2d/textes'
import { Vide2d } from '../../lib/2d/Vide2d'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { ecritureAlgebrique, reduireAxPlusB } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { ajouterAide } from '../../lib/outils/enrichissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Déterminer une fonction affine'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const dateDeModifImportante = '31/03/2023'

/**
 * Trace jusqu'à 5 droites et demande l'expression de la fonction affine ou linéaire correspondante
 * @author Jean-claude Lhote
 * MAJ de Guillaume Valmont le 31/03/2023 :
 * - Suppression des retours à la ligne en fin de question si non interactif
 * - Suppression des Math.round inutiles
 * - Réduction de la plage des pentes possibles dans le cas d'un coefficient directeur 'en quart' pour que les droites passent par un point de coordonnées entières visible
 * - Factorisation des dimensions de la grille
 * - Ajout d'un paramètre Mélange
 */
export const uuid = 'e5ddd'

export const refs = {
  'fr-fr': ['3F21-1'],
  'fr-ch': ['11LCFA2E-2', '11LSFA2E-2', 'PRQPF01C-6', 'PRQPF02C-2'],
}
export default class LectureExpressionFonctionsAffines extends Exercice {
  lineaire: boolean
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      4,
      "1 : Coefficient directeur entier\n2 : Coefficient directeur 'en demis'\n3 : Coefficient directeur 'en quarts'\n4 : Mélange",
    ]
    this.besoinFormulaire2Numerique = ['Nombre de droites (1 à 5)', 5]
    // une question par droite (3 par défaut), recalculé dans nouvelleVersion()
    this.nbQuestions = 3
    this.nbQuestionsModifiable = false

    this.spacing = context.isHtml ? 2 : 1
    this.spacingCorr = context.isHtml ? 2 : 1
    this.sup = 1
    this.sup2 = 3
    this.lineaire = false
  }

  nouvelleVersion() {
    let explain = ''
    let preK = this.sup
    if (this.sup === 4) {
      preK = randint(1, 3)
    }
    let k = Math.pow(2, preK - 1)
    let nbDroites = parseInt(this.sup2)

    const colors = [bleuMathalea, 'red', 'black', 'purple', 'brown']

    const listeDroites = []
    const posLab = []
    const nomDroite = []
    const xmin = -5.5
    const ymin = -5.5
    const xmax = 5.5
    const ymax = 5.5
    context.fenetreMathalea2d = [xmin, ymin, xmax, ymax]
    const pente = []
    let OrdX0
    if (context.isAmc) {
      nbDroites = 1
      k = 1
    }
    this.nbQuestions = nbDroites
    let penteMin = -3
    let penteMax = 3
    if (this.lineaire && k === 4) {
      penteMin = -1
      penteMax = 1
    }
    pente.push(randint(penteMin * k, penteMax * k, 0))
    pente.push(randint(penteMin * k, penteMax * k, [pente[0], 0]))
    pente.push(randint(penteMin * k, penteMax * k, [pente[0], pente[1], 0]))
    pente.push(
      randint(penteMin * k, penteMax * k, [pente[0], pente[1], pente[2], 0]),
    )
    pente.push(
      randint(penteMin * k, penteMax * k, [
        pente[0],
        pente[1],
        pente[2],
        pente[3],
        0,
      ]),
    )
    const d = []
    for (let i = 0; i < 5; i++) {
      if (this.lineaire) {
        OrdX0 = 0
      } else {
        OrdX0 = randint(
          Math.round(-1 + pente[i] / k),
          Math.round(1 + pente[i] / k),
          [pente[i], 0],
        )
      }
      listeDroites.push([OrdX0, pente[i] / k])
    }
    const r = repere({
      xMin: xmin - 0.5,
      yMin: ymin - 0.5,
      xMax: xmax + 0.5,
      yMax: ymax + 0.5,
    })
    const objets2d = []
    objets2d.push(r)
    for (let i = 0; i < nbDroites; i++) {
      d[i] = droiteParPointEtPente(
        pointAbstrait(0, listeDroites[i][0]),
        listeDroites[i][1],
        '',
        colors[i],
      )
      posLab[i] = positionLabelDroite(d[i], { xmin, ymin, xmax, ymax })
      posLab[i].positionLabel = 'center'
      if (posLab[i] instanceof Vide2d) {
        objets2d.push(d[i])
      } else {
        nomDroite[i] = latexParPoint(
          `(d_${i + 1})`,
          posLab[i],
          colors[i],
          20,
          10,
          '',
          6,
        )
        objets2d.push(d[i], nomDroite[i])
      }
    }

    const introduction = mathalea2d(
      { xmin, ymin, xmax, ymax, pixelsParCm: 30, scale: 0.75 },
      objets2d,
    )
    for (let i = 0; i < nbDroites; i++) {
      this.listeQuestions.push(
        introduction +
          `Déterminer l'expression de la fonction $f_${i + 1}$ représentée par la droite $(d_${i + 1})$.${this.interactif ? '<br>' : ''}` +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBaseAvecX, {
            texteAvant: sp() + `$f_${i + 1}(x)=$`,
          }),
      )
      if (this.lineaire || listeDroites[i][0] === 0) {
        explain += `La droite $(d_${i + 1})$ passe par l'origine. Elle représente donc la fonction linéaire $f_${i + 1}(x)=ax$ dont il faut déterminer le coefficient $a$.<br>$(d_${i + 1})$ passe par le point de coordonnées $(1\\,;\\,${texNombre(listeDroites[i][1])})$ donc $f_${i + 1}(1)=${texNombre(listeDroites[i][1])}$ c'est-à-dire $a\\times 1=${texNombre(listeDroites[i][1])}$ donc $a=${texNombre(listeDroites[i][1])}\\div 1$ d'où $a=${texNombre(listeDroites[i][1])}$.<br>Ainsi, $f_${i + 1}(x)=${reduireAxPlusB(listeDroites[i][1], 0)}$.`
        this.listeCorrections.push(
          `La droite $(d_${i + 1})$ passe par l'origine. Elle représente donc la fonction linéaire $f_${i + 1}(x)=ax$ dont il faut déterminer le coefficient $a$.<br>$(d_${i + 1})$ passe par le point de coordonnées $(1\\,;\\,${texNombre(listeDroites[i][1])})$ donc $f_${i + 1}(1)=${texNombre(listeDroites[i][1])}$ c'est-à-dire $a\\times 1=${texNombre(listeDroites[i][1])}$ donc $a=${texNombre(listeDroites[i][1])}\\div 1$ d'où $a=${texNombre(listeDroites[i][1])}$.<br>Ainsi, $f_${i + 1}(x)=${miseEnEvidence(reduireAxPlusB(listeDroites[i][1], 0))}$.`,
        )
        handleAnswers(this, i, {
          reponse: {
            value: reduireAxPlusB(listeDroites[i][1], 0, 'x'),
            options: { fonction: true, variable: 'x' },
          },
        })
      } else {
        explain += `La droite $d_${i + 1}$ passe par le point de coordonnées $(0\\,;\\,${texNombre(listeDroites[i][0])})$. Elle représente donc la fonction affine $f_${i + 1}(x)=ax+b$ dont la constante $b$ est égale à $f_${i + 1}(0)=a\\times 0+b$, c'est-à-dire  $${texNombre(listeDroites[i][0])}=0+b$ donc $b=${texNombre(listeDroites[i][0])}$.<br> De plus, $(d_${i + 1})$ passe par le point de coordonnées $(1\\,;\\,${texNombre(listeDroites[i][1] + listeDroites[i][0])})$ donc $f_${i + 1}(1)=${texNombre(listeDroites[i][1] + listeDroites[i][0])}=a\\times 1${ecritureAlgebrique(listeDroites[i][0])}=a${ecritureAlgebrique(listeDroites[i][0])}$ donc $a=${texNombre(listeDroites[i][1] + listeDroites[i][0])}${ecritureAlgebrique(-listeDroites[i][0])}=${texNombre(listeDroites[i][1])}$.<br>Ainsi, $f_${i + 1}(x)=${reduireAxPlusB(listeDroites[i][1], listeDroites[i][0])}$.`
        this.listeCorrections.push(
          `La droite $d_${i + 1}$ passe par le point de coordonnées $(0\\,;\\,${texNombre(listeDroites[i][0])})$. Elle représente donc la fonction affine $f_${i + 1}(x)=ax+b$ dont la constante $b$ est égale à $f_${i + 1}(0)=a\\times 0+b$, c'est-à-dire  $${texNombre(listeDroites[i][0])}=0+b$ donc $b=${texNombre(listeDroites[i][0])}$.<br> De plus, $(d_${i + 1})$ passe par le point de coordonnées $(1\\,;\\,${texNombre(listeDroites[i][1] + listeDroites[i][0])})$ donc $f_${i + 1}(1)=${texNombre(listeDroites[i][1] + listeDroites[i][0])}=a\\times 1${ecritureAlgebrique(listeDroites[i][0])}=a${ecritureAlgebrique(listeDroites[i][0])}$ donc $a=${texNombre(listeDroites[i][1] + listeDroites[i][0])}${ecritureAlgebrique(-listeDroites[i][0])}=${texNombre(listeDroites[i][1])}$.<br>Ainsi, $f_${i + 1}(x)=${miseEnEvidence(reduireAxPlusB(listeDroites[i][1], listeDroites[i][0]))}$.`,
        )
        handleAnswers(this, i, {
          reponse: {
            value: reduireAxPlusB(listeDroites[i][1], listeDroites[i][0], 'x'),
            options: { fonction: true, variable: 'x' },
          },
        })
      }
    }
    listeQuestionsToContenu(this)
    if (!this.lineaire) {
      explain =
        "Il s'agit de fonctions affines, elles sont donc de la forme $f(x)=ax+b$, $b$ étant l'ordonnée à l'origine et $a$ la pente de la droite.\\\n" +
        explain
      this.contenuCorrection =
        "Il s'agit de fonctions affines, elles sont donc de la forme $f(x)=ax+b$, $b$ étant l'ordonnée à l'origine et $a$ la pente de la droite.\n" +
        this.contenuCorrection
    } else {
      explain =
        "Il s'agit de fonctions linéaires, elles sont donc de la forme $f(x)=ax$, $a$ étant la pente de la droite.\\ \n" +
        explain
      this.contenuCorrection =
        "Il s'agit de fonctions linéaires, elles sont donc de la forme $f(x)=ax$, $a$ étant la " +
        ajouterAide(
          "La pente (le a de y=ax ou y=ax+b) d'une droite donne le taux d'accroissement de y par rapport à x : lorsque x augmente de 1, alors y augmente de a.",
          { texteAvant: 'pente', titreAide: "pente d'une droite" },
        ) +
        ' de la droite.\n' +
        this.contenuCorrection
    }
    if (context.isAmc) {
      this.autoCorrectionAMC[0] = {
        enonce: '',
        enonceAvant: false,
        options: { multicolsAll: true },
        propositions: [
          {
            type: 'AMCOpen',
            propositions: [
              {
                enonce:
                  "Déterminer l'expression  de la fonction représentée ci-dessous : \\\\" +
                  mathalea2d(
                    {
                      xmin,
                      ymin,
                      xmax,
                      ymax,
                      pixelsParCm: 30,
                      scale: 0.5,
                    },
                    objets2d,
                  ),
                texte: explain,
                statut: 2,
                pointilles: true,
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
                  texte: 'Coefficient',
                  valeur: [pente[0]],
                  param: {
                    digits: 1,
                    decimals: 0,
                    signe: true,
                    exposantNbChiffres: 0,
                    exposantSigne: false,
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
                  texte: "Ordonnée à l'origine",
                  valeur: [listeDroites[0][0]],
                  param: {
                    digits: 1,
                    decimals: 0,
                    signe: true,
                    exposantNbChiffres: 0,
                    exposantSigne: false,
                    approx: 0,
                  },
                },
              },
            ],
          },
        ],
      }
      this.questionsAMC[0] = amcConvert(this.autoCorrectionAMC[0])
    }
  }
}
