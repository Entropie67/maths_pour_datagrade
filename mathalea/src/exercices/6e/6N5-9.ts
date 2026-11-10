import { miseEnEvidence } from '../../lib/outils/embellissements'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { texPrix } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { egalOuApprox } from '../../lib/outils/ecritures'
import { arrondi, range1 } from '../../lib/outils/nombres'
import { prenom } from '../../lib/outils/Personne'
import SchemaEnBoite from '../../lib/outils/SchemaEnBoite'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Résoudre des problèmes de courses au marché'
export const amcReady = true
export const amcType = 'AMCNum'
export const interactifReady = true

export const dateDeModifImportante = '07/06/2025'

/**
 * On achète 2 aliments dont on connaît la masse (un en grammes et l'autre en kilogrammes) et le prix au kilogramme. Il faut calculer le prix total.
 * @author Rémi Angot
 * @author Jean-claude Lhote pour les version probleme1, problem2 et probleme3 et l'ajout de schémas.
 */
export const uuid = '96b94'

export const refs = {
  'fr-fr': ['6N5-9', '5N1D-7'],
  'fr-2016': ['6C32'],
  'fr-ch': ['9R1NO7G-8', '9R2NO7G-8', '9R3NO7G-8', 'PRQPF04A-10', 'PRQST02C-1', 'PRQNO15A-13'],
}

function probleme4(calculFacile: boolean): {
  texte: string
  texteCorr: string
  reponse: string
} {
  const quidam = prenom()
  let masseEnKgDeAliment1
  if (calculFacile) {
    masseEnKgDeAliment1 = randint(2, 5)
  } else {
    masseEnKgDeAliment1 = randint(2, 5) + randint(1, 9) / 10
  }
  const prixAliment1 = randint(2, 4) + randint(1, 9) / 10
  const aliment1 = choice(['courgettes', 'carottes', 'pommes'])
  let masseEnGdeAliment2

  let prixAliment2
  if (calculFacile) {
    prixAliment2 = randint(20, 25)
    masseEnGdeAliment2 = choice([200, 250, 500, 750])
  } else {
    prixAliment2 = randint(12, 23) + randint(1, 9) / 10
    masseEnGdeAliment2 = randint(21, 97) * 10
  }
  const aliment2 = choice(['bœuf', 'veau', 'poulet'])
  const prixTotalAliment1 = masseEnKgDeAliment1 * prixAliment1
  const prixTotalAliment2 = (masseEnGdeAliment2 * prixAliment2) / 1000
  const prixTotal = prixTotalAliment1 + prixTotalAliment2
  const masseEnKgDeAliment2 = masseEnGdeAliment2 / 1000
  const schema = new SchemaEnBoite({
    topBraces: [
      {
        text: `${aliment1} à $${texPrix(prixAliment1)}$ €/kg`,
        start: 1,
        end: 2 * Math.round(masseEnKgDeAliment1) + 1,
        type: 'flèche',
      },
    ],
    lignes: [
      {
        spacing: 1,
        barres: [
          ...range1(Math.round(masseEnKgDeAliment1)).map((_el) => ({
            content: `$${texPrix(prixAliment1)}$ €`,
            length: 2,
            color: 'lightgray',
          })),
        ],
      },
      {
        barres:
          masseEnGdeAliment2 === 750
            ? [
                ...range1(3).map((_el) => ({
                  content: '$250$ g',
                  length: 2,
                  color: 'lightgray',
                })),
                {
                  content: '',
                  length: 2,
                  color: 'white',
                },
              ]
            : masseEnGdeAliment2 === 500
              ? [
                  {
                    content: '$500$ g',
                    length: 4,
                    color: 'lightgray',
                  },
                  {
                    content: '',
                    length: 4,
                    color: 'white',
                  },
                ]
              : [
                  {
                    content: `$${texNombre(masseEnGdeAliment2)}$ g`,
                    length: 2,
                    color: 'lightgray',
                  },
                  ...range1(Math.round(1000 / masseEnGdeAliment2 - 1)).map(
                    (_el) => ({
                      content: `$${texNombre(masseEnGdeAliment2)}$ g`,
                      length: 2,
                      color: 'white',
                    }),
                  ),
                ],
      },
    ],
    bottomBraces: [
      {
        text: `$1$ kg de ${aliment2} : $${texPrix(prixAliment2)}$ €`,
        start: 1,
        end: masseEnGdeAliment2 === 200 ? 11 : 9,
        type: 'accolade',
      },
    ],
    rightBraces: [
      {
        text: `Prix total : $${texPrix(prixTotal)}$ €`,
        start: 2,
        end: 5,
        type: 'accolade',
      },
    ],
  })
  let texte = `${quidam} achète $${texNombre(masseEnKgDeAliment1)}$ kg de ${aliment1} à $${texPrix(prixAliment1)}$ €/kg `
  texte += `et $${texNombre(masseEnGdeAliment2, 0)}$ g de ${aliment2} à $${texPrix(prixAliment2)}$ €/kg. Quel est le prix total à payer ?`
  let texteCorr = `Prix des ${aliment1} : $${texNombre(masseEnKgDeAliment1)}\\text{ kg} \\times ${texPrix(prixAliment1)}$ €/kg $ = ${texPrix(prixTotalAliment1)}$ €<br>`
  texteCorr += `Prix du ${aliment2} : $${texNombre(masseEnKgDeAliment2)}\\text{ kg} \\times ${texPrix(prixAliment2)}$ €/kg $${egalOuApprox(prixTotalAliment2, 2)} ${texPrix(prixTotalAliment2)}$ €<br>`
  texteCorr += `Prix total à payer : $${texPrix(prixTotalAliment1)}\\text{ €} +${texPrix(prixTotalAliment2)}$ € `
  texteCorr += `$${egalOuApprox(prixTotal, 2)} ${miseEnEvidence(texNombre(prixTotal, 2, true))}$ €<br>`
  texteCorr += `<br>${context.isHtml ? '<i>' : ''}Le prix total aurait aussi pu être trouvé en un seul calcul${context.isHtml ? '<i>' : ''} :<br> $${texNombre(masseEnKgDeAliment1, 2)} \\text{ kg} \\times ${texPrix(prixAliment1)} \\text{ €/kg} + ${texNombre(masseEnKgDeAliment2)} \\text{ kg} \\times ${texPrix(prixAliment2)} \\text{ €/kg}$ `
  texteCorr += `$${egalOuApprox(prixTotal, 2)} ${texNombre(prixTotal, 2, true)}$ €<br>`

  texteCorr += calculFacile ? `<br>${schema.display()}<br>` : ''

  // Pour tolérer l'écriture d'un somme avec des centimes, par exemple 54,1 € ou 54,10 €
  const reponse = arrondi(prixTotal, 2).toFixed(2)
  return {
    texte,
    texteCorr,
    reponse,
  }
}

function probleme3(calculFacile: boolean): {
  texte: string
  texteCorr: string
  reponse: string
} {
  const quidam = prenom()
  const prixAliment1 = randint(6, 10) + (calculFacile ? 0 : randint(5, 19) / 20)
  const aliment1 =
    'une cagette de ' + choice(['poires', 'pêches', 'pommes', 'abricots'])
  const prixAliment2 = randint(2, 4) + (calculFacile ? 0 : randint(5, 19) / 20)
  const aliment2 = choice(['tomates', 'carottes', 'courgettes'])
  const masseEnKgDeAliment2 = calculFacile
    ? randint(2, 5)
    : randint(1, 3) + randint(1, 9) / 10
  const prixTotalAliment2 = masseEnKgDeAliment2 * prixAliment2
  const texte = `${quidam} achète ${aliment1} à $${texPrix(prixAliment1)}$ € et $${texNombre(masseEnKgDeAliment2)}$ kg de ${aliment2} à $${texPrix(prixAliment2)}$ € le kg. Quel est le prix total à payer ?`
  let texteCorr = `Prix des $${texNombre(masseEnKgDeAliment2)}$ kg de ${aliment2} : $${texNombre(masseEnKgDeAliment2)}\\text{ kg}\\times ${texNombre(prixAliment2, 2, true)}\\text{ €/kg} ${egalOuApprox(prixTotalAliment2, 2)} ${texPrix(prixTotalAliment2)}$ €<br>`
  texteCorr += `Prix total à payer : $${texPrix(prixTotalAliment2)}\\text{ €}+ ${texPrix(prixAliment1)}\\text{ €}=${miseEnEvidence(texPrix(prixTotalAliment2 + prixAliment1))}$ €<br>`
  if (calculFacile) {
    const schema = new SchemaEnBoite({
      topBraces: [
        {
          text: `${aliment1}`,
          start: 1,
          end: prixAliment1 + 1,
          type: 'accolade',
        },
      ],
      lignes: [
        {
          spacing: 1,
          barres: [
            {
              content: `$${texNombre(prixAliment1, 2)}$ €`,
              length: prixAliment1,
              color: 'lightgray',
            },
          ],
        },
        {
          barres: range1(Math.round(masseEnKgDeAliment2)).map(() => ({
            content: `${texNombre(prixAliment2, 2)} €`,
            length: prixAliment2,
            color: 'lightgray',
          })),
        },
      ],
      bottomBraces: [
        {
          text: `$${masseEnKgDeAliment2}$ kg de ${aliment2}`,
          start: 1,
          end: prixAliment2 * masseEnKgDeAliment2 + 1,
          type: 'accolade',
        },
      ],
      rightBraces: [
        {
          text: `Prix total : $${texPrix(prixTotalAliment2 + prixAliment1)}$ €`,
          start: 2,
          end: 5,
          type: 'accolade',
        },
      ],
    })
    texteCorr += `<br>${schema.display()}<br>`
  }

  const reponse = arrondi(prixAliment1 + prixTotalAliment2, 2).toFixed(2)
  return { texte, texteCorr, reponse }
}

function probleme2(calculFacile: boolean): {
  texte: string
  texteCorr: string
  reponse: string
} {
  const quidam = prenom()
  const prixAliment1 = randint(2, 5) + (calculFacile ? 0 : randint(5, 19) / 20)
  const aliment1 = choice([
    'pastèques',
    'barquettes de fraises',
    'barquettes de framboises',
  ])
  const nombreDeAliment1 = randint(2, 7)
  const prixTotal = nombreDeAliment1 * prixAliment1
  const texte = `${quidam} achète $${nombreDeAliment1}$ ${aliment1} à $${texPrix(prixAliment1)}$ € l'unité. Quel est le prix total à payer ?`
  let texteCorr = `Prix des $${nombreDeAliment1}$ ${aliment1} : $${nombreDeAliment1}\\times ${texNombre(prixAliment1, 2, true)}$ € $${egalOuApprox(prixTotal, 2)} ${texPrix(prixTotal)}$ €<br>`
  texteCorr += `Prix total à payer : $${nombreDeAliment1}\\times ${texPrix(prixAliment1)}\\text{ €}=${miseEnEvidence(texPrix(prixTotal))}$ €<br>`
  const longueur =
    nombreDeAliment1 === 2
      ? 6
      : nombreDeAliment1 === 3
        ? 4
        : nombreDeAliment1 === 4
          ? 3
          : 2
  if (calculFacile) {
    const schema = new SchemaEnBoite({
      topBraces: [
        {
          text: `$${nombreDeAliment1}$ ${aliment1}`,
          start: 1,
          end: longueur * nombreDeAliment1 + 1,
          type: 'accolade',
        },
      ],
      lignes: [
        {
          spacing: 1,
          barres: range1(nombreDeAliment1).map(() => ({
            content: `$${texNombre(prixAliment1, 2)}$ €`,
            length: longueur,
            color: 'lightgray',
          })),
        },
      ],
    })
    texteCorr += `<br>${schema.display()}<br>`
  }
  const reponse = arrondi(prixTotal, 2).toFixed(2)
  return { texte, texteCorr, reponse }
}

function probleme1(calculFacile: boolean): {
  texte: string
  texteCorr: string
  reponse: string
} {
  const quidam = prenom(1)
  const prixAliment1 = randint(6, 10) + (calculFacile ? 0 : randint(5, 19) / 20)
  const aliment1 =
    'une cagette de ' + choice(['poires', 'pêches', 'pommes', 'abricots'])
  const prixAliment2 =
    randint(6, 10, Math.floor(prixAliment1)) +
    (calculFacile ? 0 : randint(5, 19) / 20)
  const aliment2 =
    'une cagette de ' + choice(['tomates', 'carottes', 'courgettes'])
  const prixTotal = prixAliment1 + prixAliment2
  const texte = `${quidam} achète ${aliment1} à $${texPrix(prixAliment1)}$ € et ${aliment2} à $${texNombre(prixAliment2, 2)}$ €. Quel est le prix total à payer ?`
  let texteCorr = `Prix total à payer : $${texPrix(prixAliment1)}\\text{ €}+ ${texPrix(prixAliment2)}\\text{ €}=${miseEnEvidence(texPrix(prixAliment2 + prixAliment1))}\\text{ €}$<br>`
  if (calculFacile) {
    const schema = new SchemaEnBoite({
      topBraces: [
        {
          text: `$${texPrix(prixTotal)}$ €`,
          start: 1,
          end: prixAliment1 + prixAliment2 + 1,
          type: 'accolade',
        },
      ],
      lignes: [
        {
          spacing: 1,
          barres: [
            {
              content: `$${texNombre(prixAliment1, 2)}$ €`,
              length: prixAliment1,
              color: 'lightgray',
            },
            {
              content: `$${texNombre(prixAliment2, 2)}$ €`,
              length: prixAliment2,
              color: 'lightgray',
            },
          ],
        },
      ],
      bottomBraces: [
        {
          text: `${aliment1}`,
          start: 1,
          end: prixAliment1 + 1,
          type: 'accolade',
        },
        {
          text: `${aliment2}`,
          start: prixAliment1 + 1,
          end: prixAliment1 + prixAliment2 + 1,
          type: 'accolade',
        },
      ],
    })
    texteCorr += `<br>${schema.display()}<br>`
  }
  const reponse = arrondi(prixTotal, 2).toFixed(2)
  return { texte, texteCorr, reponse }
}

export default class ProblemeCourse extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Calculs faciles']
    this.besoinFormulaire2Texte = [
      'Types de problèmes',
      "Nombres séparés par des tirets :\n1 : Somme de deux prix\n2 : plusieurs produits au même prix\n3 : Un produit à l'unité et un autre au poids\n4 : Deux produits au poids\n 5 : Mélange",
    ]
    this.spacing = 2
    this.spacingCorr = 2
    // Modification de l'exercice pour avoir plusieurs question. On peut revenir à la version initiale en décommentant. Jean-claude Lhote
    this.nbQuestions = 4
    // this.nbQuestionsModifiable = false

    this.sup = false
    this.sup2 = '5'
    // this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    const listeTypesDeProblemes = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let reponse = ''
      switch (listeTypesDeProblemes[i]) {
        case 1:
          ;({ texte, texteCorr, reponse } = probleme1(this.sup))
          break
        case 2:
          ;({ texte, texteCorr, reponse } = probleme2(this.sup))
          break
        case 3:
          ;({ texte, texteCorr, reponse } = probleme3(this.sup))
          break
        case 4:
        default:
          ;({ texte, texteCorr, reponse } = probleme4(this.sup))
          break
      }

      handleAnswers(this, i, { reponse: { value: reponse } })
      if (context.isAmc) {
        // @ts-expect-error this.autoCorrection[i] est bien défini
        this.autoCorrectionAMC[i].reponse.valeur = arrondi(reponse, 2)
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        // @ts-expect-error this.autoCorrection[i] est bien défini
        this.autoCorrectionAMC[i].reponse.param.digits = 5
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        // @ts-expect-error this.autoCorrection[i] est bien défini
        this.autoCorrectionAMC[i].reponse.param.decimals = 2
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }
      if (this.interactif) {
        texte += `<br> ${ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierNumbers,
          {
            texteApres: ' €',
            texteAvant: 'Le prix total à payer sera de ',
          },
        )}`
      }
      if (this.questionJamaisPosee(i, reponse)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
