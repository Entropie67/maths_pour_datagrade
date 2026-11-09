import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import Decimal from 'decimal.js'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence, texteGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { ecritureAlgebrique, reduireAxPlusB } from '../../lib/outils/ecritures'
import { abs } from '../../lib/outils/nombres'
import { prenomF } from '../../lib/outils/Personne'
import { deDevant } from '../../lib/outils/outilString'
export const titre = 'Modéliser une situation avec une suite'
export const interactifReady = true

export const dateDePublication = '14/12/2024'
export const dateDeModifImportante = '26/09/2025'

/**
 *
 * @author Gilles Mora
 */
export const uuid = '6487c'

export const refs = {
  'fr-fr': ['1AL10-1', '1Tec-S101'],
  'fr-ch': [],
}
export default class ModeliserSuites extends Exercice {
  clavierSuite = KeyboardType.clavierSuite
  touchesSuite?: string[][]

  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = '11'
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.besoinFormulaire2CaseACocher = ["Sans indication dans l'énoncé"]
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Les abeilles',
        "2 : La retenue d'eau",
        '3 : Les vélos',
        '4 : Capital sur un compte',
        '5 : Abonnement spectacle',
        '6 : Prêt à la consommation',
        '7 : La température (forme explicite)',
        '8 : La salle de sport (forme explicite) ',
        '9 : Location de voiture (forme explicite)',
        "10 : Budget d'une association (forme explicite)",
        '11 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 10,
      melange: 11,
      defaut: 11,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''

      let a, p, b, cm, reponse1, reponse2, choix, alt, temp
      switch (listeTypeDeQuestions[i]) {
        case 1: // abeilles
          a = randint(10, 35) * 10
          p = randint(5, 10)
          cm = new Decimal(100).sub(p).div(100)
          b = randint(1, 8) * 10
          reponse1 = String(a)
          reponse2 = `${cm.toNumber()}\\times c_{n}${ecritureAlgebrique(b)}`
          texte = `Un apiculteur souhaite étendre son activité de production de miel à une nouvelle région.<br>
         En juillet $2024$, il achète $${a}$ colonies d'abeilles qu'il installe dans cette région.<br>
        Après renseignements pris auprès des services spécialisés, il s'attend à perdre $${p}$ % des colonies durant
        l'hiver. <br>Pour maintenir son activité et la développer, il a prévu d'installer $${b}$ nouvelles colonies chaque
        printemps.<br>`
          if (!this.sup2 || this.interactif) {
            texte += `On modélise l'évolution du nombre de colonies par une suite $(c_n)$, le terme $c_n$ donnant une estimation du nombre de colonies pendant l'année $2024 + n$.<br>
            Préciser la valeur de $c_0$, puis exprimer pour tout entier $n$, le terme $c_{n+1}$ en fonction de $c_n$.`
          } else {
            texte +=
              "Modéliser l'évolution du nombre de colonies par une suite $(c_n)$ à partir de 2024."
          }

          if (this.interactif) {
            texte +=
              '<br>' +
              remplisLesBlancs(
                this,
                i,
                '\\begin{cases}c_0=%{champ1}\\\\c_{n+1}=%{champ2}\\end{cases}',
                this.clavierSuite,
                '\\ldots',
                { dataKeys: this.touchesSuite },
              )
          }
          handleAnswers(
            this,
            i,
            {
              bareme: (listePoints: number[]) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: reponse1 },
              champ2: { value: reponse2, options: { calculFormel: true } },
            },
            { formatInteractif: 'fillInTheBlank' },
          )
          texteCorr = `$c_n$ est le nombre de colonies pendant l'année $2024 + n$.<br>
            D'une année sur l'autre, l'apiculteur perd $${p}$ % de colonies donc il en reste $${100 - p}$ %. <br>
          De plus, il installe $${b}$ nouvelles colonies chaque printemps.<br>
          Ainsi, la suite $(c_n)$ est définie par :
          $\\begin{cases}c_0=${miseEnEvidence(`${texNombre(a, 0)}`)}\\\\
          c_{n+1}=${miseEnEvidence(`${texNombre(cm, 2)}\\times c_n+${b}`)} \\text{ pour tout entier naturel }n.
          \\end{cases}$`
          break

        case 2: // retenue d'eau
          a = randint(10, 15) * 10000
          p = randint(3, 7)
          cm = new Decimal(100).sub(p).div(100)
          b = randint(-8, -4) * 100
          reponse1 = String(a)
          reponse2 = `${cm.toFixed(2)}\\times u_{n}${ecritureAlgebrique(b)}`
          texte = `Une retenue d'eau artificielle contient $${texNombre(a, 0)}\\text{ m}^3$ d'eau le 1er juillet 2024 au matin.<br>
La chaleur provoque dans la retenue une évaporation de $${p}\\,\\%$ du volume total de l'eau par jour. <br>
De plus, chaque soir, on doit libérer de la retenue $${abs(b)}\\text{ m}^3$ pour l'irrigation des cultures aux alentours.<br>
`
          if (!this.sup2 || this.interactif) {
            texte += `On modélise l'évolution du volume d'eau dans la retenue par une suite $(u_n)$, le terme $u_n$ donnant une estimation du volume d'eau en $\\text{ m}^3$ au matin du $n$-ième jour
qui suit le 1er juillet 2024.<br>
            Préciser la valeur de $u_0$, puis exprimer pour tout entier $n$, le terme $u_{n+1}$ en fonction de $u_n$.`
          } else {
            texte +=
              "Modéliser l'évolution du volume d'eau dans la retenue à partir du 1er juillet $2024$ par une suite $(u_n)$ ."
          }

          if (this.interactif) {
            texte +=
              '<br>' +
              remplisLesBlancs(
                this,
                i,
                '\\begin{cases}u_0=%{champ1}\\\\u_{n+1}=%{champ2}\\end{cases}',
                this.clavierSuite,
                '\\ldots',
                { dataKeys: this.touchesSuite },
              )
          }
          handleAnswers(
            this,
            i,
            {
              bareme: (listePoints: number[]) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: reponse1 },
              champ2: { value: reponse2 },
            },
            { formatInteractif: 'fillInTheBlank' },
          )
          texteCorr = `$u_n$ est le terme donnant une estimation du volume d'eau en $\\text{ m}^3$ au matin du $n$-ième jour
qui suit le 1er juillet $2024$ l'année $2024 + n$.<br>
            D'une année sur l'autre, la retenue perd $${p}\\,\\%$ par évaporation donc il en reste $${100 - p}\\,\\%$. <br>
          De plus, la retenue perd $${abs(b)}\\text{ m}^3$ chaque soir.<br>
          Ainsi, la suite $(u_n)$ est définie par :
          $\\begin{cases}u_0=${miseEnEvidence(`${texNombre(a, 0)}`)}\\\\
          u_{n+1}=${miseEnEvidence(`${texNombre(cm, 2)}\\times u_n${ecritureAlgebrique(b)}`)} \\text{ pour tout entier naturel }n.
          \\end{cases}$`
          break
        case 3: // les vélos
          a = randint(100, 200)
          p = randint(12, 17)
          cm = new Decimal(100).sub(p).div(100)
          b = randint(40, 50)
          reponse1 = String(a)
          reponse2 = `${cm.toFixed(2)}\\times v_{n}${ecritureAlgebrique(b)}`
          texte = `Depuis le 1er janvier $2022$, une commune dispose de vélos en libre service. <br>
          La société Bicycl'Aime est chargée de l'exploitation et de l'entretien du parc de vélos.<br>
La commune disposait de $${a}$ vélos au 1er janvier $2022$.<br>
La société estime que, chaque année, $${p}\\,\\%$ des vélos sont retirés de la circulation à cause de dégradations et que $${b}$ nouveaux vélos sont mis en service.<br>
`
          if (!this.sup2 || this.interactif) {
            texte += `On modélise cette situation par une suite $(v_n)$ où $v_n$ représente le nombre de vélos de cette commune
au 1er janvier de l'année $2022 + n$.<br>
            Préciser la valeur de $v_0$, puis exprimer pour tout entier $n$, le terme $v_{n+1}$ en fonction de $v_n$.`
          } else {
            texte +=
              "Modéliser l'évolution du nombre de vélos de cette commune à partir du 1er janvier de l'année 2022 par une suite $(v_n)$ ."
          }

          if (this.interactif) {
            texte +=
              '<br>' +
              remplisLesBlancs(
                this,
                i,
                '\\begin{cases}v_0=%{champ1}\\\\v_{n+1}=%{champ2}\\end{cases}',
                this.clavierSuite,
                '\\ldots',
                { dataKeys: this.touchesSuite },
              )
          }
          handleAnswers(
            this,
            i,
            {
              bareme: (listePoints: number[]) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: reponse1 },
              champ2: { value: reponse2 },
            },
            { formatInteractif: 'fillInTheBlank' },
          )
          texteCorr = `$v_n$ est le nombre de vélos de cette commune au 1er janvier de l'année $2022 + n$.<br>
            D'une année sur l'autre, la commune se sépare de $${p}\\,\\%$ de vélos donc il en reste $${100 - p}\\,\\%$. <br>
          De plus, $${b}$ nouveaux vélos sont mis en service.<br>
          Ainsi, la suite $(v_n)$ est définie par :
          $\\begin{cases}v_0=${miseEnEvidence(`${texNombre(a, 0)}`)}\\\\
          v_{n+1}=${miseEnEvidence(`${texNombre(cm, 2)}\\times v_n${ecritureAlgebrique(b)}`)} \\text{ pour tout entier naturel }n.
          \\end{cases}$`
          break
        case 4: // capital sur un compte
          a = randint(19, 25) * 100
          p = randint(2, 5)
          cm = new Decimal(100).add(p).div(100)
          b = randint(20, 30)
          choix = prenomF()
          reponse1 = String(a)
          reponse2 = `${cm.toFixed(2)}\\times c_{n}-${b}`
          texte = `${choix} place $${texNombre(a)}$ € dans une banque le 1er janvier $2023$ au taux annuel de $${p}\\,\\%$.<br>
           À la fin de chaque année, les intérêts sont ajoutés au capital, mais les frais de gestion s'élèvent à $${b}$ € ( par an).<br>`
          if (!this.sup2 || this.interactif) {
            texte += `On modélise l'évolution du capital ${deDevant(choix)} par une suite $(c_n)$, le terme $c_n$ donnant le capital au 1er janvier de l'année $2023 + n$.<br>
            Préciser la valeur de $c_0$, puis exprimer pour tout entier $n$, le terme $c_{n+1}$ en fonction de $c_n$.`
          } else {
            texte += `Modéliser l'évolution du capital ${deDevant(choix)} par une suite $(c_n)$ à partir de $2023$.`
          }

          if (this.interactif) {
            texte +=
              '<br>' +
              remplisLesBlancs(
                this,
                i,
                '\\begin{cases}c_0=%{champ1}\\\\c_{n+1}=%{champ2}\\end{cases}',
                this.clavierSuite,
                '\\ldots',
                { dataKeys: this.touchesSuite },
              )
          }
          handleAnswers(
            this,
            i,
            {
              bareme: (listePoints: number[]) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: reponse1 },
              champ2: { value: reponse2 },
            },
            { formatInteractif: 'fillInTheBlank' },
          )
          texteCorr = `$c_n$ est le capital 1er janvier de l'année $2023 + n$.<br>
            À la fin de chaque année, les intérêts sont ajoutés au capital. Cela signifie que le capital est multiplié par $${texNombre(cm, 2)}$. <br>
          De plus, les frais de gestion s'élèvent à $${b}$ €.<br>
          Ainsi, la suite $(c_n)$ est définie par :
          $\\begin{cases}c_0=${miseEnEvidence(`${texNombre(a, 0)}`)}\\\\
          c_{n+1}=${miseEnEvidence(`${texNombre(cm, 2)}\\times c_n-${b}`)} \\text{ pour tout entier naturel }n.
          \\end{cases}$`
          break
        case 5: // abonnement spectacle
          a = randint(30, 55) * 10
          p = new Decimal(randint(70, 80))
          cm = p.div(100)
          b = randint(20, 30) * 10
          choix = prenomF()
          reponse1 = String(a)
          reponse2 = `${cm.toFixed(2)}\\times u_{n}${ecritureAlgebrique(b)}`
          texte = `Dans une ville, un opéra décide de proposer à partir de $2024$ un abonnement annuel pour ses spectacles.<br>
Le directeur de l'opéra prévoit que $${p}\\,\\%$ des personnes abonnées renouvelleront leur abonnement l'année suivante et
qu'il y aura chaque année $${b}$ nouveaux abonnés.<br>
Pour l'année $2024$, il y a $${a}$ abonnés.<br>`
          if (!this.sup2 || this.interactif) {
            texte += `L'évolution du nombre d'abonnés d'une année à la suivante est donnée par une suite $(u_n)$, le terme $u_n$ donnant le nombre d'abonnés pour l'année $2024 + n$.<br>
            Préciser la valeur de $u_0$, puis exprimer pour tout entier $n$, le terme $u_{n+1}$ en fonction de $u_n$.`
          } else {
            texte +=
              "Modéliser l'évolution du nombre d'abonnés par une suite $(u_n)$ à partir de $2024$."
          }

          if (this.interactif) {
            texte +=
              '<br>' +
              remplisLesBlancs(
                this,
                i,
                '\\begin{cases}u_0=%{champ1}\\\\u_{n+1}=%{champ2}\\end{cases}',
                this.clavierSuite,
                '\\ldots',
                { dataKeys: this.touchesSuite },
              )
          }
          handleAnswers(
            this,
            i,
            {
              bareme: (listePoints: number[]) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: reponse1 },
              champ2: { value: reponse2 },
            },
            { formatInteractif: 'fillInTheBlank' },
          )
          texteCorr = `$u_n$ est le nombre d'abonnés pour l'année $2024 + n$.<br>
            Chaque année, $${p}\\,\\%$ des personnes abonnées renouvellent leur abonnement. <br>
          De plus, chaque année il y a $${b}$ nouveaux abonnés.<br>
          Ainsi, la suite $(u_n)$ est définie par :
          $\\begin{cases}u_0=${miseEnEvidence(`${texNombre(a, 0)}`)}\\\\
          u_{n+1}=${miseEnEvidence(`${texNombre(cm, 2)}\\times u_n+${b}`)} \\text{ pour tout entier naturel }n.
          \\end{cases}$`
          break

        case 6: // le prêt
          a = randint(50, 70) * 100
          p = new Decimal(randint(15, 30)).div(10)
          cm = new Decimal(100).add(p).div(100)
          b = randint(30, 40) * 10
          choix = prenomF()
          reponse1 = String(a)
          reponse2 = `${cm.toFixed(3)}\\times v_{n}-${b}`
          texte = `En janvier $2024$, une personne se décide à acheter un scooter coûtant $${texNombre(a, 0)}$ euros sans apport personnel.<br>
           Le vendeur lui propose un crédit à la consommation d'un montant de $${texNombre(a, 0)}$ euros, au taux
mensuel de $${texNombre(p, 2, true)}\\,\\%$. <br>
Par ailleurs, la mensualité, fixée à $${b}$ euros, est versée par l'emprunteur à l'organisme de crédit le $25$ de chaque mois. <br>
Ainsi, le capital restant dû augmente de $${texNombre(p, 2, true)}\\,\\%$ puis baisse de $${b}$ euros.<br>
Le premier versement a lieu le $25$ février $2024$.<br>`
          if (!this.sup2 || this.interactif) {
            texte += `L'évolution du capital restant dû en euros est modélisée par une suite $(v_n)$, le terme $v_n$ est le capital restant dû juste après la $n$-ième mensualité.<br>
            Préciser la valeur de $v_0$, puis exprimer pour tout entier $n$, le terme $v_{n+1}$ en fonction de $v_n$.`
          } else {
            texte +=
              "Modéliser l'évolution du capital restant dû juste après le versement d'une mensualité par une suite $(v_n)$ à partir de $2024$."
          }

          if (this.interactif) {
            texte +=
              '<br>' +
              remplisLesBlancs(
                this,
                i,
                '\\begin{cases}v_0=%{champ1}\\\\v_{n+1}=%{champ2}\\end{cases}',
                this.clavierSuite,
                '\\ldots',
                { dataKeys: this.touchesSuite },
              )
          }
          handleAnswers(
            this,
            i,
            {
              bareme: (listePoints: number[]) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: reponse1 },
              champ2: { value: reponse2 },
            },
            { formatInteractif: 'fillInTheBlank' },
          )
          texteCorr = `$v_n$ est le capital restant dû en euros juste après la $n$-ième mensualité.<br>
           Chaque mois, le capital restant dû augmente de $${texNombre(p, 2, true)}\\,\\%$, cela signifie qu'il est multiplié par $${texNombre(cm, 3)}$.<br>
          De plus, il baisse de $${b}$ euros (versement de la mensualité).<br>
          Ainsi, la suite $(v_n)$ est définie par :
          $\\begin{cases}v_0=${miseEnEvidence(`${texNombre(a, 0)}`)}\\\\
          v_{n+1}=${miseEnEvidence(`${texNombre(cm, 3)}\\times v_n-${b}`)} \\text{ pour tout entier naturel }n.
          \\end{cases}$`
          break

        case 7: // la température
          b = new Decimal(randint(2, 7)).div(100)
          alt = randint(6, 11) * 100
          temp = randint(15, 25)
          reponse1 = [
            `${reduireAxPlusB(-b, temp, 'n')}`,
            `${temp}-${b}\\times n`,
          ]
          texte = `Un randonneur se trouve à $${texNombre(alt, 0)}\\text{ m}$ d'altitude.<br>
          Sur son parcours, la température diminue de $${texNombre(b, 2)}$ degré Celsius lorsque l'altitude augmente de $1$ mètre.<br>
Au point de départ, la température est de $${temp}$ degrés Celsius.<br>`
          if (!this.sup2 || this.interactif) {
            texte += `L'évolution de la température est modélisée par une suite $(u_n)$, le terme $u_n$ est la température (en degrés Celsius) sur le parcours du randonneur à l'altitude $${texNombre(alt, 0)}+n$ mètres.<br>
            Exprimer pour tout entier $n$, le terme $u_{n}$ en fonction de $n$.`
          } else {
            texte += `Modéliser l'évolution de la température sur le parcours du randonneur par une suite $(u_n)$ définie de manière explicite à partir de l'altitude de $${texNombre(alt, 0)}\\text{ m}$.`
          }

          if (this.interactif) {
            texte +=
              '<br>' +
              remplisLesBlancs(
                this,
                i,
                'u_n=%{champ1}',
                this.clavierSuite,
                '\\ldots',
                { dataKeys: this.touchesSuite },
              )
          }
          handleAnswers(
            this,
            i,
            { champ1: { value: reponse1 } },
            { formatInteractif: 'fillInTheBlank' },
          )
          texteCorr = `$u_n$ est la température (en degrés Celsius) sur le parcours du randonneur à l'altitude $${texNombre(alt, 0)}+n$ mètres.<br>
           La température diminue de $${texNombre(b, 2)}$ degré Celsius lorsque l'altitude augmente de $1$ mètre.<br>
          Ainsi, la suite $(u_n)$ est définie pour tout entier naturel $n$ par : $u_n=${miseEnEvidence(`${texNombre(temp, 0)}-${texNombre(b, 2)}n`)}$.`
          break

        case 8: // l'abonnement salle de sport
          a = randint(1, 4) * 10
          b = new Decimal(choice([3, 5, 7])).div(2)
          reponse1 = [`${reduireAxPlusB(b, a, 'n')}`, `${b}\\times n+${a}`]
          texte = `Une salle de sport propose une formule avec un abonnement mensuel.<br>
          L'abonnement de $${a}$ € permet un tarif de $${texNombre(b, 2, true)}$ € par séance.<br>`
          if (!this.sup2 || this.interactif) {
            texte += `Le prix payé par un abonné est modélisé par une suite $(w_n)$, le terme $w_n$ est le prix payé par cet abonné pour $n$ séances sur un mois.<br>
            Exprimer pour tout entier $n$, le terme $w_{n}$ en fonction de $n$.`
          } else {
            texte +=
              'Modéliser le prix payé par un abonné sur un mois par une suite $(u_n)$ définie de manière explicite.'
          }

          if (this.interactif) {
            texte +=
              '<br>' +
              remplisLesBlancs(
                this,
                i,
                'w_n=%{champ1}',
                this.clavierSuite,
                '\\ldots',
                { dataKeys: this.touchesSuite },
              )
            handleAnswers(
              this,
              i,
              { champ1: { value: reponse1 } },
              { formatInteractif: 'fillInTheBlank' },
            )
          }
          texteCorr = `$w_n$ est le prix payé par un abonné sur un mois pour $n$ séances.<br>
          Ce prix comprend un abonnement de $${a}$ € puis un tarif de $${texNombre(b, 2, true)}$ € par séance.<br>
          Ainsi, la suite $(w_n)$ est définie pour tout entier naturel $n$ par : $w_n=${miseEnEvidence(`${texNombre(a, 0)}+${texNombre(b, 2)}n`)}$.`
          break

        case 9: // location de voiture
          a = randint(80, 120)
          b = new Decimal(randint(41, 65, [50, 60])).div(100) // prix /km
          reponse1 = [`${reduireAxPlusB(b, a, 'n')}`, `${b}\\times n+${a}`]
          texte = `Une société de location de véhicules particuliers propose le tarif suivant pour un week-end de location :<br>
          ${texteGras('TARIF WEEK-END :')} forfait de $${a}$ € puis $${texNombre(b, 2)}$ € par $\\text{km}$ parcouru.<br>`
          if (!this.sup2 || this.interactif) {
            texte += `Le prix payé par un client est modélisé par une suite $(u_n)$, le terme $u_n$ est le prix payé par ce client pour $n\\text{ km}$ parcourus pendant le week-end.<br>
            Exprimer pour tout entier $n$, le terme $u_{n}$ en fonction de $n$.`
          } else {
            texte +=
              "Modéliser le prix payé par un client pour la location d'un véhicule par une suite $(u_n)$ définie de manière explicite."
          }

          if (this.interactif) {
            texte +=
              '<br>' +
              remplisLesBlancs(
                this,
                i,
                'u_n=%{champ1}',
                this.clavierSuite,
                '\\ldots',
                { dataKeys: this.touchesSuite },
              )
            handleAnswers(
              this,
              i,
              { champ1: { value: reponse1 } },
              { formatInteractif: 'fillInTheBlank' },
            )
          }
          texteCorr = `$u_n$ est le prix payé par un client pour $n\\text{ km}$ parcourus pendant le week-end.<br>
          Ce prix comprend un forfait de $${a}$ € puis un tarif de $${texNombre(b, 2, true)}$ € par $\\text{km}$ parcourus.
          Ainsi, la suite $(u_n)$ est définie pour tout entier naturel $n$ par : $u_n=${miseEnEvidence(`${texNombre(a, 0)}+${texNombre(b, 2)}n`)}$.`
          break

        default: // budget d'une association
          a = randint(5, 20) * 1000
          b = randint(60, 120) * 10
          reponse1 = [
            `${reduireAxPlusB(-b, a, 'n')}`,
            `${-b}\\times n+${a}`,
            `${a}${ecritureAlgebrique(-b)}\\times n`,
          ]
          texte = `Le budget initialement alloué à une association de $${texNombre(a, 0)}$ € diminue chaque année de $${texNombre(b, 2)}$ €.<br>`
          if (!this.sup2 || this.interactif) {
            texte += `Le montant du budget est modélisé par une suite $(u_n)$, le terme $u_n$ est le montant du budget au bout de $n$ ans.<br>
            Exprimer pour tout entier $n$, le terme $u_{n}$ en fonction de $n$.`
          } else {
            texte +=
              "Modéliser le budget de l'association par une suite $(u_n)$ définie de manière explicite."
          }

          if (this.interactif) {
            texte +=
              '<br>' +
              remplisLesBlancs(
                this,
                i,
                'u_n=%{champ1}',
                this.clavierSuite,
                '\\ldots',
                { dataKeys: this.touchesSuite },
              )
            handleAnswers(
              this,
              i,
              { champ1: { value: reponse1 } },
              { formatInteractif: 'fillInTheBlank' },
            )
          }
          texteCorr = `$u_n$ est le montant du budget de l'association au bout de $n$ ans.<br>
          Le budget initial de diminue de $${texNombre(a, 0)}$ € diminue de $${texNombre(b, 2, true)}$ € par an.<br>
          Ainsi, la suite $(u_n)$ est définie pour tout entier naturel $n$ par : $u_n=${miseEnEvidence(`${texNombre(a, 0)}-${texNombre(b, 2)}n`)}$.`
          break
      }

      if (this.questionJamaisPosee(i, b)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
