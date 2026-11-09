import { propositionsQcm } from '../../lib/interactif/qcm'
import {
  tableauSignesFacteurs,
  tableauSignesFonction,
} from '../../lib/mathFonctions/etudeFonction'
import { reduireAxPlusB, rienSi1 } from '../../lib/outils/ecritures'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true
export const interactifType = 'qcm'
export const titre =
  "Déterminer le tableau de signes d'un produit de fonctions affines"
export const dateDePublication = '12/04/2026'

/**
 *
 * @author Arnaud Meistermann - Aménagement et développement : Stéphane Guyon

*/
export const uuid = '49fca'
export const refs = {
  'fr-fr': ['2F33-2', '1Tec-F3-01'],
  'fr-ch': [],
}

export default class TableauSignePolyDegre3 extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Nombre de fonctions affines',
      '1 : Produit de trois fonctions affines\n2 : Produit de deux fonctions affines\n3 : Mélange',
    ]
    this.sup = '3'
    this.besoinFormulaire2Texte = [
      'Signe du facteur constant',
      '1 : Positif\n2 : Négatif\n3 : Mélange',
    ]
    this.sup2 = '3'

    this.nbCols = 2
    this.spacing = 1.5 // Interligne des questions
    this.spacingCorr = 1.5 // Interligne des réponses
  }

  nouvelleVersion() {
    this.autoCorrection = []
    const listeNombreFacteurs = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    })
    const listeSignesFacteurConstant = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      const produitDeuxAffines = listeNombreFacteurs[i] === 2
      const facteurGlobal =
        listeSignesFacteurConstant[i] === 1 ? randint(1, 10) : randint(-10, -1)
      let coefficientsFacteurs: Array<{
        coefficient: number
        constante: number
      }>

      if (produitDeuxAffines) {
        let coefficient1: number
        let constante1: number
        let coefficient2: number
        let constante2: number
        do {
          coefficient1 = randint(-6, 6, 0)
          constante1 = randint(-9, 9, 0)
          coefficient2 = randint(-6, 6, 0)
          constante2 = randint(-9, 9, 0)
        } while (
          -constante1 / coefficient1 === -constante2 / coefficient2 ||
          -constante1 / coefficient1 === constante2 / coefficient2
        )
        coefficientsFacteurs = [
          { coefficient: coefficient1, constante: constante1 },
          { coefficient: coefficient2, constante: constante2 },
        ]
      } else {
        const x1 = randint(-10, 10, 0)
        const x2 = randint(-10, 10, [0, x1])
        const x3 = randint(-10, 10, [0, x1, x2])
        coefficientsFacteurs = [x1, x2, x3].map((zero) => ({
          coefficient: 1,
          constante: -zero,
        }))
      }
      const xMin = -99
      const xMax = 99
      const zeros = coefficientsFacteurs.map(({ coefficient, constante }) =>
        new FractionEtendue(-constante, coefficient).simplifie(),
      )
      const zerosOpposes = coefficientsFacteurs.map(
        ({ coefficient, constante }) =>
          new FractionEtendue(constante, coefficient).simplifie(),
      )

      const facteurs = [
        ...(facteurGlobal !== 1
          ? [
              {
                nom: `${facteurGlobal}`,
                fonction: () => facteurGlobal,
              },
            ]
          : []),
        ...coefficientsFacteurs.map(
          ({ coefficient, constante }, indexFacteur) => ({
            nom: reduireAxPlusB(coefficient, constante),
            fonction: (x: number) => coefficient * x + constante,
            zero: zeros[indexFacteur],
          }),
        ),
      ]

      const expression = `${rienSi1(facteurGlobal)}${coefficientsFacteurs
        .map(
          ({ coefficient, constante }) =>
            `(${reduireAxPlusB(coefficient, constante)})`,
        )
        .join('')}`

      const produit = (
        x: number,
        opposeConstantes = false,
        opposeProduit = false,
      ) =>
        (opposeProduit ? -1 : 1) *
        facteurGlobal *
        coefficientsFacteurs.reduce(
          (resultat, { coefficient, constante }) =>
            resultat *
            (coefficient * x + (opposeConstantes ? -constante : constante)),
          1,
        )

      const tableau = tableauSignesFacteurs(facteurs, xMin, xMax, {
        fractionTex: true,
        borneInf: '-\\infty',
        borneSup: '+\\infty',
        nomVariable: 'x',
        nomFonction: 'f(x)',
      })

      const optionsTableau = (zerosExactes: FractionEtendue[]) => {
        const zerosArrondis = zerosExactes.map((zero) =>
          new FractionEtendue(
            Math.round(zero.toNumber() * 1000),
            1000,
          ).simplifie(),
        )
        return {
          step: 1,
          tolerance: 0.1,
          fractionTex: false,
          zeros: zerosArrondis,
          substituts: [
            { antVal: xMin, antTex: '-\\infty' },
            { antVal: xMax, antTex: '+\\infty' },
            ...zerosExactes.map((zero, index) => ({
              antVal: zerosArrondis[index].toNumber(),
              antTex: zero.texFractionSimplifiee,
            })),
          ],
        }
      }

      // Fonction correcte
      const fCorrecte = (x: number) => produit(x)

      const tabCor = tableauSignesFonction(
        fCorrecte,
        xMin,
        xMax,
        optionsTableau(zeros),
      )

      // Distracteurs
      const fDis1 = (x: number) => produit(x, false, true)

      const fDis2 = (x: number) => produit(x, true)

      const fDis3 = (x: number) => produit(x, true, true)

      const tabDis1 = tableauSignesFonction(
        fDis1,
        xMin,
        xMax,
        optionsTableau(zeros),
      )

      const tabDis2 = tableauSignesFonction(
        fDis2,
        xMin,
        xMax,
        optionsTableau(zerosOpposes),
      )

      const tabDis3 = tableauSignesFonction(
        fDis3,
        xMin,
        xMax,
        optionsTableau(zerosOpposes),
      )

      // QCM
      this.autoCorrection[i] = {
        options: { ordered: false, radio: true, vertical: true },
        enonce: 'Choisir le bon tableau de signes :',
        propositions: [
          { texte: tabCor, statut: true },
          { texte: tabDis1, statut: false },
          { texte: tabDis2, statut: false },
          { texte: tabDis3, statut: false },
        ],
      }

      const monQCM = propositionsQcm(this, i)

      // ÉNONCÉ
      texte = `On considère la fonction $f$ définie sur $\\mathbb{R}$ par
      $f(x)=${expression}$.<br>`

      if (this.interactif) {
        texte += 'Quel est le tableau de signes de $f$ ?<br>'
        texte += `<style>
          #exercice${this.numeroExercice} .my-3 {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            font-size: 1.1em;
            align-items: center;
            justify-items: center;
          }
        </style>`
        texte += monQCM.texte
      } else {
        texte += 'Déterminer le tableau de signes de $f$ sur $\\mathbb{R}$.'
      }

      // CORRECTION
      const etudeDesFacteurs = coefficientsFacteurs
        .map(({ coefficient, constante }) => {
          const facteur = reduireAxPlusB(coefficient, constante)
          const zero = new FractionEtendue(-constante, coefficient).simplifie()
            .texFraction
          return `$${facteur}>0 \\Leftrightarrow x ${coefficient > 0 ? '>' : '<'} ${zero}$`
        })
        .join('<br>')
      texteCorr = `Pour étudier le signe de $f$, on va étudier le signe de ses facteurs.<br>
        ${etudeDesFacteurs}<br>
        On obtient donc le tableau de signes : <br>
        ${tableau}`

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
