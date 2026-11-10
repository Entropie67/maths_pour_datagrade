import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'
export const titre = 'Calculer avec une probabilité conditionnelle'
export const interactifReady = true

export const dateDePublication = '29/04/2025'

/**
 *
 * @author Gilles Mora
 */
export const uuid = 'baee1'

export const refs = {
  'fr-fr': ['1P10-2', 'BP1SP12', '2P20-2'],
  'fr-ch': [],
}
export default class CalculerProbaCond extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = 4
    this.spacing = 1.5
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Sans situation (valeurs décimales)',
        '2 : Sans situation (valeurs fractionnaires)',
        '3 : Dans une situation',
        '4 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"

    for (
      let i = 0,
        texte,
        texteCorr,
        reponse,
        cpt = 0,
        pA,
        pBsachantA,
        pAinterB,
        intro,
        cours,
        listeEV,
        ev,
        listeFractions,
        f;
      i < this.nbQuestions && cpt < 50;
    ) {
      cours = `Pour tout événement $A$ (avec $P(A)\\neq 0$) et $B$ d'un univers $\\Omega$, on a : <br>
          $P_{A}(B)=\\dfrac{P(A\\cap B)}{P(A)}$ ou encore $P(A\\cap B)=P(A)\\times P_{A}(B)$.<br>
          En appliquant avec les données de l'énoncé, on obtient :<br>`
      listeEV = [
        ['A', 'B'],
        ['A', 'C'],
        ['R', 'T'],
        ['K', 'L'],
      ]
      ev = choice(listeEV)
      listeFractions = [
        [1, 3, 1, 4],
        [2, 3, 3, 7],
        [1, 4, 1, 6],
        [3, 4, 1, 7],
        [3, 5, 3, 7],
        [2, 3, 2, 9],
        [3, 8, 1, 4],
        [4, 7, 1, 4],
        [4, 7, 1, 3],
        [1, 6, 1, 9],
      ]
      f = choice(listeFractions)

      switch (listeTypeDeQuestions[i]) {
        case 1: //
          pA = randint(1, 9) / 10
          pBsachantA = randint(1, 49) / 100
          pAinterB = pA * pBsachantA
          if (choice([true, false])) {
            reponse = texNombre(pA * pBsachantA, 3)
            handleAnswers(this, i, {
              reponse: { value: reponse, options: { fonction: true } },
            })
            texte = `On considère deux événements $${ev[0]}$ et $${ev[1]}$ tels que : <br>
          $P(${ev[0]})=${texNombre(pA, 1)}$ et $P_{${ev[0]}}(${ev[1]})=${texNombre(pBsachantA, 2)}$.<br>
         ${this.interactif ? `$P(${ev[0]}\\cap ${ev[1]})=$` : `Calculer $P(${ev[0]}\\cap ${ev[1]})$.`}`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
            texteCorr = cours
            texteCorr += `
          $\\begin{aligned}
          P(${ev[0]}\\cap ${ev[1]})&=P(${ev[0]}) \\times P_{${ev[0]}}(${ev[1]})\\\\
          &=${texNombre(pA, 2)}\\times ${texNombre(pBsachantA, 2)}\\\\
          &=${miseEnEvidence(`${texNombre(pA * pBsachantA, 3)}`)}
          \\end{aligned}$`
          } else {
            reponse = texNombre(pBsachantA, 2)
            handleAnswers(this, i, {
              reponse: { value: reponse, options: { fonction: true } },
            })
            texte = `On considère deux événements $${ev[0]}$ et $${ev[1]}$ tels que : <br>
          $P(${ev[0]})=${texNombre(pA, 1)}$ et $P(${ev[0]}\\cap ${ev[1]})=${texNombre(pAinterB, 3)}$.<br>
         ${this.interactif ? `$P_{${ev[0]}}(${ev[1]})=$` : `Calculer $P_{${ev[0]}}(${ev[1]})$.`}`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
            )
            texteCorr = cours
            texteCorr += `
          $\\begin{aligned}
         P_{${ev[0]}}(${ev[1]})&=\\dfrac{P(${ev[0]}\\cap ${ev[1]})}{P(${ev[0]})}\\\\
          &=\\dfrac{${texNombre(pA * pBsachantA, 3)}}{${texNombre(pA, 3)}}\\\\
          &=${miseEnEvidence(`${texNombre(pBsachantA, 3)}`)}
          \\end{aligned}$`
          }

          break

        case 2: //
          pA = new FractionEtendue(f[0], f[1])
          pBsachantA = new FractionEtendue(f[2], f[3])
          pAinterB = pA.produitFraction(pBsachantA).simplifie()
          if (choice([true, false])) {
            reponse = pAinterB.texFraction
            handleAnswers(this, i, {
              reponse: { value: reponse, options: { fractionEgale: true } },
            })
            texte = `On considère deux événements $${ev[0]}$ et $${ev[1]}$ tels que : <br>
        $P(${ev[0]})=${pA.texFraction}$ et $P_{${ev[0]}}(${ev[1]})=${pBsachantA.texFraction}$.<br>
       ${this.interactif ? `$P(${ev[0]}\\cap ${ev[1]})=$` : `Calculer $P(${ev[0]}\\cap ${ev[1]})$.`}`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
            )
            texteCorr = cours
            texteCorr += `
        $\\begin{aligned}
        P(${ev[0]}\\cap ${ev[1]})&=P(${ev[0]}) \\times P_{${ev[0]}}(${ev[1]})\\\\
        &=${pA.texFraction}\\times ${pBsachantA.texFraction}\\\\
        &=${miseEnEvidence(pAinterB.texFraction)}
        \\end{aligned}$`
          } else {
            reponse = pBsachantA.texFraction
            handleAnswers(this, i, {
              reponse: { value: reponse, options: { fractionEgale: true } },
            })
            texte = `On considère deux événements $${ev[0]}$ et $${ev[1]}$ tels que : <br>
        $P(${ev[0]})=${pA.texFraction}$ et $P(${ev[0]}\\cap ${ev[1]})=${pAinterB.texFraction}$.<br>
       ${this.interactif ? `$P_{${ev[0]}}(${ev[1]})=$` : `Calculer $P_{${ev[0]}}(${ev[1]})$.`}`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
            )
            texteCorr = cours
            texteCorr += `
        $\\begin{aligned}
       P_{${ev[0]}}(${ev[1]})&=\\dfrac{P(${ev[0]}\\cap ${ev[1]})}{P(${ev[0]})}\\\\
        &=${pAinterB.texFraction}\\div ${pA.texFraction}\\\\
         &=${pAinterB.texFraction}\\times ${pA.inverse().texFraction}\\\\
        &=${miseEnEvidence(pBsachantA.texFraction)}
        \\end{aligned}$`
          }

          break

        case 3:
        default:
          switch (randint(1, 2)) {
            case 1:
              pA = randint(40, 60) / 100
              pBsachantA = randint(65, 85) / 100
              pAinterB = pA * pBsachantA
              intro = choice([
                `On estime que la proportion de spams, sur la boîte de messagerie électronique d’un particulier est de $${texNombre(pA * 100, 0)}\\,\\%$. <br>
               Un logiciel de suppression de spams est installé sur l'ordinateur. Il ne supprime que des spams mais ne supprime pas tous les spams.<br>
               On constate qu'il supprime $${texNombre(pBsachantA * 100, 3)}\\,\\%$ de spams.<br>
                On choisit un message au hasard et on note $${ev[0]}$ : «${sp()}le message est un spam${sp()}» et $${ev[1]}$ : «${sp()}le message est supprimé${sp()}».<br>
              Calculer la valeur décimale de$P(${ev[0]}\\cap ${ev[1]})$`,
                `Le cuisinier d’une colonie de vacances a confectionné des beignets pour le goûter :<br>
 $${texNombre(pA * 100, 0)}\\,\\%$ des beignets sont à l’ananas, les autres sont aux pommes et $${texNombre(pBsachantA * 100, 2)}\\,\\%$ des beignets à l’ananas sont aromatisés à la cannelle.<br>
On choisit un beignet au hasard. <br>
On définit les évènements suivants :<br>
• $${ev[0]}$ : «${sp()}le beignet choisi est à l’ananas${sp()}» ;<br>
• $${ev[1]}$ : «${sp()}le beignet choisi est aromatisé à la cannelle${sp()}».<br>
Calculer la valeur décimale de $P(${ev[0]}\\cap ${ev[1]})$.`,
                `Le jour d'une grande journée de promotion, $${texNombre(pA * 100, 0)}\\,\\%$ des clients qui entrent dans un magasin ont été
contactés lors d'une campagne publicitaire. Une étude statistique montre que la probabilité qu’un client effectue un achat sachant qu’il a été contacté au cours de la campagne publicitaire est de $${texNombre(pBsachantA, 2)}$.<br>
On choisit au hasard un client du magasin lors de cette grande journée de promotion. <br>On définit les évènements suivants :<br>
• $${ev[0]}$ : «${sp()}le client choisi a été contacté lors de la campagne publicitaire ;${sp()}»<br>
• $${ev[1]}$ : le client choisi a effectué un achat${sp()}».<br>
Calculer la valeur décimale de $P(${ev[0]}\\cap ${ev[1]})$. `,
              ])
              handleAnswers(this, i, {
                reponse: {
                  value: texNombre(pAinterB, 4),
                },
              })

              texte = intro
              texte +=
                '<br>' +
                ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierProbabilite,
                  { texteAvant: `$P(${ev[0]}\\cap ${ev[1]})=$` },
                )
              texteCorr = `On a :<br>
              $\\begin{aligned}
              P(${ev[0]}\\cap ${ev[1]})&=P(${ev[0]}) \\times P_{${ev[0]}}(${ev[1]})\\\\
              &=${texNombre(pA, 4)}\\times ${texNombre(pBsachantA, 4)}\\\\
              &=${miseEnEvidence(`${texNombre(pA * pBsachantA, 4)}`)}
              \\end{aligned}$`
              break

            case 2:
            default:
              pA = randint(40, 60) / 100
              pBsachantA = randint(89, 95) / 100
              pAinterB = pA * pBsachantA
              intro = choice([
                `On estime que la proportion de spams, sur la boîte de messagerie électronique d’un particulier est de $${texNombre(pA * 100, 0)}\\,\\%$. <br>
                  Un logiciel de suppression de spams est installé sur l'ordinateur. Il ne supprime que des spams mais ne supprime pas tous les spams.<br>
                 $${texNombre(pAinterB * 100, 2)}\\,\\%$ des messages sont des spams supprimés.<br>
                 On note $${ev[0]}$ : «${sp()}le message est un spam${sp()}» et $${ev[1]}$ : «${sp()}le message est supprimé${sp()}».<br>
                 On choisit un message au hasard.<br>
                 Calculer la valeur décimale de$P_{${ev[0]}}(${ev[1]})$.`,
                `Le cuisinier d’une colonie de vacances a confectionné des beignets pour le goûter :<br>
                  $${texNombre(pA * 100, 0)}\\,\\%$ sont à l’ananas, les autres sont aux pommes et $${texNombre(pAinterB * 100, 2)}\\,\\%$ sont des beignets à l’ananas aromatisés à la cannelle.<br>
                 On choisit un beignet au hasard. <br>
                 On définit les évènements suivants :<br>
                 • $${ev[0]}$ : «${sp()}le beignet choisi est à l’ananas${sp()}» ;<br>
                 • $${ev[1]}$ : «${sp()}le beignet choisi est aromatisé à la cannelle${sp()}».<br>
                Calculer la valeur décimale de $P_{${ev[0]}}(${ev[1]})$.`,
                `Le jour d'une grande journée de promotion, $${texNombre(pA * 100, 0)}\\,\\%$ des clients qui entrent dans un magasin ont été
contactés lors d'une campagne publicitaire. Une étude statistique montre que, parmi tous les clients, $${texNombre(pAinterB * 100, 3)}\\,\\%$ ont été contactés lors de la campagne publicitaire et ont fait un achat.<br>
On choisit au hasard un client du magasin lors de cette grande journée de promotion. <br>On définit les évènements suivants :<br>
• $${ev[0]}$ : «${sp()}le client choisi a été contacté lors de la campagne publicitaire ${sp()}» ;<br>
• $${ev[1]}$ : «${sp()}le client choisi a effectué un achat.${sp()}»<br>
Calculer la valeur décimale de $P_{${ev[0]}}(${ev[1]})$.`,
              ])

              handleAnswers(this, i, {
                reponse: {
                  value: [`${texNombre(pBsachantA, 4)}`],
                },
              })

              texte = intro

              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierProbabilite,
                { texteAvant: `<br>$P_{${ev[0]}}(${ev[1]})=$` },
              )

              texteCorr = `On a :<br>
          $\\begin{aligned}
         P_{${ev[0]}}(${ev[1]})&=\\dfrac{P(${ev[0]}\\cap ${ev[1]})}{P(${ev[0]})}\\\\
          &=\\dfrac{${texNombre(pAinterB, 4)}}{${texNombre(pA, 4)}}\\\\
          &=${miseEnEvidence(`${texNombre(pBsachantA, 4)}`)}
          \\end{aligned}$`
          }

          break
      }

      if (this.questionJamaisPosee(i, pA)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
