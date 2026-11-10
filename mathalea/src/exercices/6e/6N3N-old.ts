import { createList } from '../../lib/format/lists'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { range } from '../../lib/outils/nombres'
import { prenomsPronoms } from '../../lib/outils/Personne'
import SchemaEnBoite from '../../lib/outils/SchemaEnBoite'
import { fraction } from '../../modules/fractions'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Résoudre des problèmes mettant en jeu des fractions'
export const interactifReady = true

export const dateDePublication = '27/08/2025'
export const uuid = '67f72'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': ['NR'],
}

/**
 * @author Jean-claude Lhote
 */

const situations = [
  {
    id: 'trajet total',
    texteATrous:
      '%prénom% a parcouru $%frac1%$ de son trajet avant la pause déjeuner. Après le repas, %pronom% a parcouru $%frac2%$ de son trajet.<br>',
    question1: 'Quelle fraction de son trajet a-t-%pronom% parcourue ?',
    question2: 'Quelle fraction de son trajet lui reste-t-il à parcourir ?',
    correction1: '%prénom% a parcouru $%frac3%$ de son trajet.<br>',
    correction2: 'Il lui reste $%frac4%$ de son trajet à parcourir.<br>',
  },
  {
    id: 'gâteau',
    texteATrous:
      "%prénom% a mangé $%frac1%$ d'un gâteau au chocolat ce matin. Cet après-midi, %pronom% a mangé $%frac2%$ du gâteau.<br>",
    question1: 'Quelle fraction du gâteau a-t-%pronom% mangée ?',
    question2: 'Quelle fraction du gâteau reste-t-il ?',
    correction1: '%prénom% a mangé $%frac3%$ de gâteau.<br>',
    correction2: 'Il reste $%frac4%$ de gâteau.<br>',
  },
  {
    id: 'sufrages',
    texteATrous:
      "Au premier tour d'une élection, %prénom1% a obtenu $%frac1%$ des voix  et %prénom2% a obtenu $%frac2%$ des voix.<br>",
    question1:
      'Quelle fraction des voix ont obtenu ensemble %prénom1% et %prénom2% ?',
    question2: 'Quelle fraction des voix ont obtenu les autres candidats ?',
    correction1:
      '%prénom1% et %prénom2% ont obtenu ensemble $%frac3%$ des voix.<br>',
    correction2: 'Les autres candidats ont obtenu $%frac4%$ des voix.<br>',
  },
  {
    id: 'livre',
    texteATrous:
      "%prénom% a lu $%frac1%$ d'un livre hier. Aujourd'hui, %pronom% a lu $%frac2%$ du livre.<br>",
    question1: 'Quelle fraction du livre a-t-%pronom% lue ?',
    question2: 'Quelle fraction du livre lui reste-t-il à lire ?',
    correction1: '%prénom% a lu $%frac3%$ du livre.<br>',
    correction2: 'Il lui reste $%frac4%$ du livre à lire.<br>',
  },
  {
    id: 'capcaité du réservoir',
    texteATrous:
      "Un réservoir d'eau est rempli aux $%frac1%$. On y ajoute $%frac2%$ de sa capacité totale.<br>",
    question1: 'Quelle fraction du réservoir a-t-on remplie ?',
    question2: 'Quelle fraction du réservoir reste-t-il à remplir ?',
    correction1: 'On a rempli $%frac3%$ du réservoir.<br>',
    correction2: 'Il reste $%frac4%$ du réservoir à remplir.<br>',
  },
  {
    id: 'surface du jardin',
    texteATrous:
      '%prénom% a planté des fleurs dans $%frac1%$ de la surface de son jardin. Puis, %pronom% a planté des légumes dans $%frac2%$ de la surface du jardin.<br>',
    question1: 'Quelle fraction de la surface du jardin a-t-%pronom% plantée ?',
    question2:
      'Quelle fraction de la surface du jardin lui reste-t-il à planter ?',
    correction1: '%prénom% a planté $%frac3%$ de la surface de son jardin.<br>',
    correction2:
      'Il lui reste $%frac4%$ de la surface du jardin à planter.<br>',
  },
  {
    id: 'distance totale',
    texteATrous:
      "%prénom% a couru $%frac1%$ de la distance d'une course à pied la première heure. Ensuite, %pronom% a couru $%frac2%$ de la distance totale la deuxième heure.<br>",
    question1: 'Quelle fraction de la distance totale a-t-%pronom% courue ?',
    question2:
      'Quelle fraction de la distance totale lui reste-t-il à courir ?',
    correction1: '%prénom% a couru $%frac3%$ de la distance totale.<br>',
    correction2: 'Il lui reste $%frac4%$ de la distance totale à courir.<br>',
  },
]

export default class ProblemesFractions extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacingCorr = 3
    this.besoinFormulaireTexte = [
      'types de fractions',
      'Nombres séparés par des tirets :\n1 : Même dénominateur\n2 : Dénominateurs multiples\n3 : Mélange',
    ]
    this.sup = 3
  }

  nouvelleVersion(): void {
    const typesDeFractions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
    }).map(Number)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      cpt++
      let texte = ''
      let texteCorr = ''
      const [personne, personne2] = prenomsPronoms(2) as {
        prenom: string
        pronom: string
      }[]

      const situation =
        situations[Math.floor(Math.random() * situations.length)]
      const couplesDens =
        typesDeFractions[i] === 1
          ? [
              [5, 5],
              [6, 6],
              [7, 7],
              [8, 8],
              [9, 9],
              [10, 10],
            ]
          : [
              [2, 6],
              [2, 8],
              [2, 10],
              [3, 6],
              [3, 9],
              [4, 8],
              [4, 12],
              [5, 10],
              [6, 12],
            ]

      const coupleDen = choice(couplesDens)
      const num1 = randint(1, coupleDen[0] - 1)
      const num1Converti = (num1 * coupleDen[1]) / coupleDen[0]
      const num2 = randint(1, num1Converti - 1)
      const frac1 = fraction(num1, coupleDen[0])
      const frac2 = fraction(num2, coupleDen[1])
      const frac3 = fraction(
        (frac1.num * coupleDen[1]) / coupleDen[0] + frac2.num,
        coupleDen[1],
      )
      const frac4 = fraction(coupleDen[1] - frac3.num, coupleDen[1])
      if (frac4.inferieurlarge(0)) continue
      const schema1 = new SchemaEnBoite({
        bottomBraces: [
          {
            start: 1,
            end: 1 + num1Converti * 2,
            text: `$${frac1.texFraction}$`,
          },
          {
            start: 1 + num1Converti * 2,
            end: 1 + (num1Converti + num2) * 2,
            text: `$${frac2.texFraction}$`,
          },
        ],
        lignes: [
          {
            barres: [
              {
                content: `${situation.id}`,
                length: coupleDen[1] * 2,
                color: 'lightgray',
              },
            ],
          },
          {
            barres: [
              {
                content: `${situation.id === 'sufrages' ? personne.prenom : '1e part'}`,
                length: num1Converti * 2,
                color: 'lightgray',
              },
              {
                content: `${situation.id === 'sufrages' ? personne2.prenom : '2e part'}`,
                length: frac2.num * 2,
                color: 'lightgray',
              },
            ],
          },
          {
            barres: range(frac3.num - 1).map(() => ({
              length: 2,
              color: 'lightgray',
              content: '$\\phantom{P}$',
            })),
          },
        ],
      })
      const schema2 = new SchemaEnBoite({
        lignes: [
          {
            barres: [
              {
                content: `${situation.id}`,
                length: coupleDen[1] * 2,
                color: 'lightgray',
              },
            ],
          },
          {
            barres: [
              {
                content: `$${frac3.texFraction}$`,
                length: frac3.num * 2,
                color: 'lightgray',
              },
              {
                content: `?`,
                length: frac4.num * 2,
                color: 'lightgray',
              },
            ],
          },
        ],
      })

      if (situation.id === 'sufrages') {
        texte = situation.texteATrous
          .replace('%prénom1%', personne.prenom)
          .replace('%prénom2%', personne2.prenom)
          .replace('%frac1%', frac1.texFraction)
          .replace('%frac2%', frac2.texFraction)
        texte += createList({
          items: [
            situation.question1
              .replace('%prénom1%', personne.prenom)
              .replace('%prénom2%', personne2.prenom) +
              ajouteChampTexteMathLive(
                this,
                2 * i,
                KeyboardType.clavierDeBaseAvecFraction,
              ),
            situation.question2 +
              ajouteChampTexteMathLive(
                this,
                2 * i + 1,
                KeyboardType.clavierDeBaseAvecFraction,
              ),
          ],
          style: 'alpha',
        })
        texteCorr = createList({
          items: [
            situation.correction1
              .replace('%prénom1%', personne.prenom)
              .replace('%prénom2%', personne2.prenom)
              .replace(
                '%frac3%',
                `${frac3.texFraction}${frac3.estIrreductible ? '' : `\\text{ soit }${frac3.texFractionSimplifiee}`}`,
              ) +
              ' En effet :<br>' +
              ` $\\begin{aligned}${frac1.texFraction} + ${frac2.texFraction} ${
                coupleDen[0] === coupleDen[1]
                  ? `&=\\dfrac{${frac1.num}+${frac2.num}}{${coupleDen[0]}}\\\\
                  &=${
                    frac3.estIrreductible
                      ? miseEnEvidence(frac3.texFraction)
                      : `${frac3.texFraction}\\\\
                  &=${miseEnEvidence(frac3.texFractionSimplifiee)}`
                  }\\end{aligned}$<br>`
                  : `&=\\dfrac{${frac1.num} \\times ${coupleDen[1] / coupleDen[0]}}{${coupleDen[0]}\\times ${coupleDen[1] / coupleDen[0]}} + ${frac2.texFraction}\\\\
                  &=\\dfrac{${(frac1.num * coupleDen[1]) / coupleDen[0]}+${frac2.num}}{${coupleDen[1]}}\\\\
                  &=${
                    frac3.estIrreductible
                      ? miseEnEvidence(`${frac3.texFraction}`)
                      : `${frac3.texFraction}\\\\
                  &=${miseEnEvidence(frac3.texFractionSimplifiee)}`
                  }\\end{aligned}$<br>`
              }` +
              schema1.display() +
              '<br>',

            situation.correction2.replace(
              '%frac4%',
              `${frac4.texFraction}${frac4.estIrreductible ? '' : `\\text{ soit }${frac4.texFractionSimplifiee}`}`,
            ) +
              ' En effet :<br>' +
              `$\\begin{aligned}1 - ${frac3.texFraction} ${
                coupleDen[0] === coupleDen[1]
                  ? `&=\\dfrac{${coupleDen[0]}}{${coupleDen[0]}} - \\dfrac{${frac3.num}}{${coupleDen[0]}}\\\\
                & = \\dfrac{${coupleDen[0]} - ${frac3.num}}{${coupleDen[0]}}\\\\
                &=${
                  frac4.estIrreductible
                    ? miseEnEvidence(frac4.texFraction)
                    : `${frac4.texFraction}\\\\
                &=${miseEnEvidence(frac4.texFractionSimplifiee)}`
                }`
                  : `&=\\dfrac{${coupleDen[1]}}{${coupleDen[1]}} - \\dfrac{${frac3.num}}{${coupleDen[1]}}\\\\
                & = \\dfrac{${coupleDen[1]} - ${frac3.num}}{${coupleDen[1]}}\\\\
                &=${frac4.texFraction}${
                  !frac4.estIrreductible
                    ? `\\\\
                &=${frac4.texFractionSimplifiee}`
                    : ''
                }`
              }\\end{aligned}$<br>` +
              schema2.display(),
          ],
          style: 'alpha',
        })
      } else {
        texte = situation.texteATrous
          .replace('%prénom%', personne.prenom)
          .replace('%pronom%', personne.pronom)
          .replace('%frac1%', frac1.texFraction)
          .replace('%frac2%', frac2.texFraction)
          .replace('%pronom%', personne.pronom)

        texte += createList({
          items: [
            situation.question1
              .replace('%prénom1%', personne.prenom)
              .replace('%pronom%', personne.pronom) +
              ajouteChampTexteMathLive(
                this,
                2 * i,
                KeyboardType.clavierDeBaseAvecFraction,
              ),
            situation.question2 +
              ajouteChampTexteMathLive(
                this,
                2 * i + 1,
                KeyboardType.clavierDeBaseAvecFraction,
              ),
          ],
          style: 'alpha',
        })
        texteCorr = createList({
          items: [
            situation.correction1
              .replace('%prénom%', personne.prenom)
              .replace(
                '%frac3%',
                `${frac3.texFraction}${frac3.estIrreductible ? '' : `\\text{ soit }${frac3.texFractionSimplifiee}`}`,
              ) +
              ' En effet :<br>' +
              `$\\begin{aligned}${frac1.texFraction} + ${frac2.texFraction} ${
                coupleDen[0] === coupleDen[1]
                  ? `&=\\dfrac{${frac1.num}+${frac2.num}}{${coupleDen[0]}}\\\\
                  &=${
                    frac3.estIrreductible
                      ? miseEnEvidence(frac3.texFraction)
                      : `${frac3.texFraction}\\\\
                  &=${miseEnEvidence(frac3.texFractionSimplifiee)}`
                  }\\end{aligned}$<br>`
                  : `&=\\dfrac{${frac1.num} \\times ${coupleDen[1] / coupleDen[0]}}{${coupleDen[0]}\\times ${coupleDen[1] / coupleDen[0]}} + ${frac2.texFraction}\\\\
                  &=\\dfrac{${(frac1.num * coupleDen[1]) / coupleDen[0]}+${frac2.num}}{${coupleDen[1]}}\\\\
                  &=${
                    frac4.estIrreductible
                      ? miseEnEvidence(frac3.texFraction)
                      : `${frac3.texFraction}\\\\
                  &=${miseEnEvidence(frac3.texFractionSimplifiee)}`
                  }\\end{aligned}$<br>`
              }` +
              schema1.display() +
              '<br>',

            situation.correction2.replace(
              '%frac4%',
              `${frac4.texFraction}${frac4.estIrreductible ? '' : `\\text{ soit }${frac4.texFractionSimplifiee}`}`,
            ) +
              ' En effet :' +
              `$\\begin{aligned}1 - ${frac3.texFraction}` +
              (coupleDen[0] === coupleDen[1]
                ? `&=\\dfrac{${coupleDen[0]}}{${coupleDen[0]}} - \\dfrac{${frac3.num}}{${coupleDen[0]}}\\\\
              & = \\dfrac{${coupleDen[0]} - ${frac3.num}}{${coupleDen[0]}}\\\\
              &=${
                frac4.estIrreductible
                  ? miseEnEvidence(frac4.texFraction)
                  : `${frac4.texFraction}\\\\
              &=${miseEnEvidence(frac4.texFractionSimplifiee)}`
              }`
                : `&=\\dfrac{${coupleDen[1]}}{${coupleDen[1]}} - \\dfrac{${frac3.num}}{${coupleDen[1]}}\\\\
              & = \\dfrac{${coupleDen[1]} - ${frac3.num}}{${coupleDen[1]}}\\\\
              &=${
                frac4.estIrreductible
                  ? miseEnEvidence(frac4.texFraction)
                  : `${frac4.texFraction}\\\\
              &=${miseEnEvidence(frac4.texFractionSimplifiee)}`
              }`) +
              `\\end{aligned}$<br>` +
              schema2.display(),
          ],
          style: 'alpha',
        })
      }
      handleAnswers(this, 2 * i, {
        reponse: { value: frac3.texFraction, options: { fractionEgale: true } },
      })
      handleAnswers(this, 2 * i + 1, {
        reponse: { value: frac4.texFraction, options: { fractionEgale: true } },
      })
      if (
        this.questionJamaisPosee(
          i,
          frac1.texFraction,
          frac2.texFraction,
          situation.id,
        )
      ) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
    }
  }
}
