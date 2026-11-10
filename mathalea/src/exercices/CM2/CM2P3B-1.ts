import { miseEnEvidence } from '../../lib/outils/embellissements'
import Decimal from 'decimal.js'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { createList } from '../../lib/format/lists'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { egalOuApprox } from '../../lib/outils/ecritures'
import { premiereLettreEnMajuscule, sp } from '../../lib/outils/outilString'
import SchemaEnBoite from '../../lib/outils/SchemaEnBoite'
import { texNombre } from '../../lib/outils/texNombre'
import operation from '../../modules/operations'
import { randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const uuid = '559fc'
export const refs = {
  'fr-fr': ['CM2P3B-1', 'BP2AutoL10'],
  'fr-2016': ['c3C32-01', 'BP2AutoL10'],
  'fr-ch': ['9R1FA1C-7', '9R2FA1C-7', '9R3FA1C-7'],
}
export const titre =
  'Savoir résoudre un problème de proportionnalité : À la pêche aux coquillages'
export const dateDePublication = '15/11/2024'

export const interactifReady = true
/**
 * @Author Jean-claude Lhote
 * Sources (eduscol) : https://eduscol.education.fr/ressources/numerique/2020/2020-exercices-mathematiques-6e
 * Ces exercices seront proposés systématiquement pour 3 niveaux de difficulté afin de différencier autour d'un même problème
 */
export default class ExerciceProbleme001 extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireNumerique = [
      'niveau de difficulté',
      3,
      '1 : Élèves à besoin\n2 : Moyens\n3 : Avancés',
    ]
    this.sup = 2
    this.besoinFormulaire2CaseACocher = [
      "Schéma dans l'énoncé (élèves à besoin seulement)",
      false,
    ]
    this.sup2 = false
    this.besoinFormulaire3CaseACocher = [
      'Opération posée dans la correction',
      false,
    ]
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let nbCoquillages: number
      let nouveauNombre: number | undefined
      const coquillages = [
        {
          nomSingulier: 'un bigorneau',
          nomPluriel: 'bigorneaux',
          masseMoyenne: 2,
        },
        {
          nomSingulier: 'une palourde',
          nomPluriel: 'palourdes',
          masseMoyenne: 20,
        },
        { nomSingulier: 'un bulot', nomPluriel: 'bulots', masseMoyenne: 50 },
        { nomSingulier: 'une coque', nomPluriel: 'coques', masseMoyenne: 15 },
        { nomSingulier: 'une moule', nomPluriel: 'moules', masseMoyenne: 25 },
        { nomSingulier: 'une praire', nomPluriel: 'praires', masseMoyenne: 30 },
        {
          nomSingulier: 'une telline',
          nomPluriel: 'tellines',
          masseMoyenne: 5,
        },
        {
          nomSingulier: 'un pétoncle',
          nomPluriel: 'pétoncles',
          masseMoyenne: 35,
        },
      ]
      const coquillage = choice(coquillages)
      const pronom = coquillage.nomSingulier.startsWith('une') ? 'elles' : 'ils'
      const tout = coquillage.nomSingulier.startsWith('une') ? 'toutes' : 'tous'
      const masseMoyenne = coquillage.masseMoyenne
      let masseCoquillages: Decimal
      switch (this.sup) {
        case 1:
          nbCoquillages = choice([10, 100])
          nouveauNombre = randint(1, 6) * 10 + 5
          masseCoquillages = new Decimal(nbCoquillages).mul(
            randint(
              Math.floor((masseMoyenne * 2) / 3),
              Math.ceil((masseMoyenne * 3) / 2),
            ),
          )
          break
        case 3:
          nbCoquillages = randint(31, 59, [40, 50])
          masseCoquillages = new Decimal(nbCoquillages).mul(
            (10 *
              randint(
                Math.floor((masseMoyenne * 2) / 3),
                Math.ceil((masseMoyenne * 3) / 2),
              ) +
              randint(1, 9)) /
              10,
          )
          break
        default:
          nbCoquillages = randint(31, 59, [40, 50])
          masseCoquillages = new Decimal(nbCoquillages).mul(
            randint(
              Math.floor((masseMoyenne * 2) / 3),
              Math.ceil((masseMoyenne * 3) / 2),
            ),
          )
          nouveauNombre = undefined
          break
      }
      let listePrincipale: string
      let correction: string
      if (this.sup !== 1) {
        // this.sup = 2 et 3
        listePrincipale = `Aujourd'hui, j'ai trouvé $${nbCoquillages}$ ${coquillage.nomPluriel}. ${premiereLettreEnMajuscule(pronom)} pèsent ensemble $${this.sup === 2 ? `${texNombre(masseCoquillages, 2)}` : `${texNombre(masseCoquillages, 0)}`}$ g.<br>En supposant qu'${pronom} aient ${tout} la même masse, trouve combien pèse ${coquillage.nomSingulier}.
        ${this.sup === 3 ? '<br>Donner une valeur approchée au gramme près.' : ''}`

        if (this.sup === 2) {
          listePrincipale += ajouteQuestionMathlive({
            exercice: this,
            question: i,
            reponseParams: { formatInteractif: 'mathalea-mathfield' },
            objetReponse: {
              reponse: {
                value: texNombre(masseCoquillages.div(nbCoquillages), 2),
              },
            },
            typeInteractivite: 'mathlive',
            texteApres: 'g',
          })
          correction = `Pour trouver la masse moyenne d'${coquillage.nomSingulier}, on divise la masse totale par le nombre de ${coquillage.nomPluriel}.<br>
   $${texNombre(masseCoquillages)}\\text{ g}\\div ${nbCoquillages}$ ${egalOuApprox(masseCoquillages.div(nbCoquillages), 2)} $${texNombre(masseCoquillages.div(nbCoquillages), 2)}$ g<br>
     ${this.sup3 ? `${operation({ operande1: masseCoquillages.toNumber(), operande2: nbCoquillages, type: 'division', precision: 2, options: { solution: true, colore: orangeMathalea } })}` : ''}
        ${premiereLettreEnMajuscule(coquillage.nomSingulier)} pèse $${miseEnEvidence(texNombre(masseCoquillages.div(nbCoquillages), 2))}$ g.<br>`
        } else {
          listePrincipale += ajouteQuestionMathlive({
            exercice: this,
            question: i,
            reponseParams: { formatInteractif: 'mathalea-mathfield' },
            objetReponse: {
              reponse: {
                value: texNombre(masseCoquillages.div(nbCoquillages), 0),
              },
            },
            typeInteractivite: 'mathlive',
            texteApres: 'g',
          })
          correction = `Pour trouver la masse moyenne d'${coquillage.nomSingulier}, on divise la masse totale par le nombre de ${coquillage.nomPluriel}.<br>
    $${texNombre(masseCoquillages.round())}\\text{ g}\\div ${nbCoquillages} ${egalOuApprox(masseCoquillages.div(nbCoquillages), 0)} ${texNombre(masseCoquillages.div(nbCoquillages), 0)}$ g<br>
    ${this.sup3 ? `${operation({ operande1: masseCoquillages.round().toNumber(), operande2: nbCoquillages, type: 'division', precision: 1, options: { solution: true, colore: orangeMathalea } })}` : ''}
        ${premiereLettreEnMajuscule(coquillage.nomSingulier)} pèse environ $${miseEnEvidence(texNombre(masseCoquillages.div(nbCoquillages), 0))}$ g au gramme près.<br>`
        }
      } else {
        // this.sup = 1
        listePrincipale = createList({
          items: [
            `Aujourd'hui, j'ai trouvé $${nbCoquillages}$ ${coquillage.nomPluriel}. ${premiereLettreEnMajuscule(pronom)} pèsent ensemble $${texNombre(masseCoquillages, 2)}$ g.<br>En supposant qu'${pronom} aient ${tout} la même masse, trouve combien pèse ${coquillage.nomSingulier}.
          ${this.sup2 ? `${SchemaEnBoite.division(masseCoquillages.toNumber(), undefined, nbCoquillages, 0).display()}<br>` : ''}
          ${ajouteQuestionMathlive({
            exercice: this,
            question: 2 * i,
            reponseParams: { formatInteractif: 'mathalea-mathfield' },
            objetReponse: {
              reponse: {
                value: texNombre(masseCoquillages.div(nbCoquillages), 2),
              },
            },
            typeInteractivite: 'mathlive',
            texteApres: 'g',
          })}`,
            `Combien pèsent $${nouveauNombre}$ ${coquillage.nomPluriel} (on suppose toujours qu'${pronom} ont ${tout} la même masse)${sp()}?
     ${this.sup2 ? `${SchemaEnBoite.division(undefined, undefined, Number(nouveauNombre), 0).display()}` : ''}
      ${ajouteQuestionMathlive({
        exercice: this,
        question: 2 * i + 1,
        reponseParams: { formatInteractif: 'mathalea-mathfield' },
        objetReponse: {
          reponse: {
            value: texNombre(
              masseCoquillages.mul(Number(nouveauNombre)).div(nbCoquillages),
              2,
            ),
          },
        },
        typeInteractivite: 'mathlive',
        texteApres: 'g',
      })}`,
          ],
          style: 'alpha',
          classOptions: 'display: inline-block;',
        })
        correction = createList({
          items: [
            `Pour trouver la masse moyenne d'${coquillage.nomSingulier}, on divise la masse totale par le nombre de ${coquillage.nomPluriel}.<br>
    ${SchemaEnBoite.division(masseCoquillages.toNumber(), masseCoquillages.div(nbCoquillages).toNumber(), nbCoquillages, 0).display()}
     $${texNombre(masseCoquillages)}\\text{ g}\\div ${nbCoquillages}$ = $${texNombre(masseCoquillages.div(nbCoquillages), 2)}$ g<br>
${this.sup3 ? `${operation({ operande1: masseCoquillages.toNumber(), operande2: nbCoquillages, type: 'division', precision: 1, options: { solution: true, colore: bleuMathalea } })}` : ''}${premiereLettreEnMajuscule(coquillage.nomSingulier)} pèse $${miseEnEvidence(texNombre(masseCoquillages.div(nbCoquillages), 2))}$ g en moyenne.<br>`,
            `Pour trouver la masse de $${nouveauNombre}$ ${coquillage.nomPluriel}, on multiplie la masse moyenne d'${coquillage.nomSingulier} par le nombre de ${coquillage.nomPluriel}.<br>
    ${SchemaEnBoite.division(masseCoquillages.mul(Number(nouveauNombre)).div(nbCoquillages).toNumber(), masseCoquillages.div(nbCoquillages).toNumber(), Number(nouveauNombre), 0).display()}<br><br>
    $${texNombre(masseCoquillages.div(nbCoquillages), 2)}\\text{ g}\\times ${nouveauNombre}$ = $${texNombre(masseCoquillages.mul(Number(nouveauNombre)).div(nbCoquillages), 2)}$ g<br>
     ${this.sup3 ? `${operation({ operande1: masseCoquillages.div(nbCoquillages).toNumber(), operande2: nouveauNombre, type: 'multiplication', precision: 1, options: { solution: true, colore: orangeMathalea } })}` : ''}$
     ${nouveauNombre}$ ${coquillage.nomPluriel} pèsent $${miseEnEvidence(texNombre(masseCoquillages.mul(Number(nouveauNombre)).div(nbCoquillages), 2))}$ g.<br>`,
          ],
          style: 'alpha',
        })
      }
      if (
        this.questionJamaisPosee(
          i,
          nbCoquillages,
          masseCoquillages.toString(),
          coquillage.nomPluriel,
        )
      ) {
        this.listeQuestions[i] = listePrincipale
        this.listeCorrections[i] = correction
        i++
      }
      cpt++
    }
  }
}
