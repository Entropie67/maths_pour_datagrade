import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import { texNombre } from '../../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'

export const titre = 'Écrire une probabilité avec les notations'
export const dateDePublication = '21/07/2022'
export const interactifReady = true

/**
 *
 * @author Gilles Mora
 *
 */
export const uuid = '15f6d'

export const refs = {
  'fr-fr': ['can1P12-01', 'can2P2-01', '2P20-flash1'],
  'fr-ch': ['4mProbStat-10'],
}
export default class ProbabilitesNotation extends Exercice {
  constructor() {
    super()
    this.sup = true
    this.nbQuestions = 1
    this.nbCols = 2 // Uniquement pour la sortie LaTeX

    // this.sup = 1; // Niveau de difficulté
  }

  nouvelleVersion() {
    for (
      let i = 0,
        cpt = 0,
        p1 = 0,
        p2 = 0,
        p3 = 0,
        p4 = 0,
        p5 = 0,
        p6 = 0,
        texte,
        texteCorr,
        choix;
      i < this.nbQuestions && cpt < 50;
    ) {
      // switch (choice([1, 2, 3])) { //, 2, 3
      switch (
        choice([1, 2, 3]) //, 2, 3
      ) {
        case 1:
          p1 = randint(25, 80)
          p2 = p1 / 100
          choix = choice(['q1', 'q2', 'q3', 'q4', 'q5']) //
          texte = `Dans un lycée, on choisit au hasard un élève. On note : <br>
      $\\bullet$ $F$ : «${sp()}L'élève choisi est une fille${sp()}» ;<br>
      $\\bullet$ $R$ : «${sp()}L'élève choisi est un demi-pensionnaire${sp()}».<br>`
          this.canEnonce = texte
          if (choix === 'q1') {
            texte += `Dans ce lycée il y a $${p1}$ $\\%$ de filles demi-pensionnaires.<br>
            En utilisant les événements $F$ et $R$, compléter avec une probabilité :<br>
            `
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierProbabilite,
              )
            } else {
              texte += '$\\ldots\\ldots $'
            }
            texte += ` $= ${texNombre(p2, 2)}$`
            texteCorr = `Il ne s'agit pas d'une probabilité conditionnelle. Le pourcentage s'applique sur l'ensemble des élèves du lycée.<br>
            $${miseEnEvidence(`P(F\\cap R)`)}=${texNombre(p2, 2)}$.`
            handleAnswers(this, i, {
              reponse: {
                value: [
                  'p( F\\cap R)',
                  'p( R\\cap F)',
                  'P( F\\cap R)',
                  'P( R\\cap F)',
                ],
                options: { texteAvecCasse: true },
              },
            })
            this.canEnonce += `Dans ce lycée il y a $${p1}\\,\\%$ de filles demi-pensionnaires.`
            this.canReponseACompleter = ` En utilisant les événements $F$ et $R$, compléter avec une probabilité :<br>
            $\\ldots = ${texNombre(p2, 2)}$`
          } else if (choix === 'q2') {
            if (choice([true, false])) {
              texte += ` Dans ce lycée, $${p1}\\,\\%$ des filles sont demi-pensionnaires.<br>`
              this.canEnonce += ` Dans ce lycée, $${p1}\\,\\%$ des filles sont demi-pensionnaires.`
            } else {
              texte += ` Parmi les filles de ce lycée, $${p1}\\,\\%$ sont demi-pensionnaires.<br>`
              this.canEnonce += ` Parmi les filles de ce lycée, $${p1}\\,\\%$ sont demi-pensionnaires.`
            }
            texte +=
              ' En utilisant les événements $F$ et $R$, compléter avec une probabilité :<br>'
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierProbabilite,
              )
            } else {
              texte += '$\\ldots\\ldots $'
            }
            texte += ` $= ${texNombre(p2, 2)}$`
            this.canReponseACompleter = ` En utilisant les événements $F$ et $R$, compléter avec une probabilité :<br>
            $\\ldots = ${texNombre(p2, 2)}$`
            texteCorr = `Il s'agit d'une probabilité conditionnelle. Le pourcentage s'applique sur l'ensemble des filles.<br>
             $${miseEnEvidence(`P_F(R)`)}=${texNombre(p2, 2)}$.`
            handleAnswers(this, i, {
              reponse: {
                value: ['P_{F}({R})', 'P_{F}(R)', 'p_{F}({R})', 'p_{F}(R)'],
                options: { texteAvecCasse: true },
              },
            })
          } else if (choix === 'q3') {
            if (choice([true, false])) {
              texte += ` Dans ce lycée $${p1}\\,\\%$ des garçons sont demi-pensionnaires.<br>`
              this.canEnonce += ` Dans ce lycée $${p1}\\,\\%$ des garçons sont demi-pensionnaires.`
            } else {
              texte += ` Parmi les garçons de ce lycée, $${p1}\\,\\%$ sont demi-pensionnaires.<br>`
              this.canEnonce += ` Parmi les garçons de ce lycée, $${p1}\\,\\%$ sont demi-pensionnaires.`
            }
            texte +=
              ' En utilisant les événements $F$ et $R$, compléter avec une probabilité :<br>'
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierProbabilite,
              )
            } else {
              texte += '$\\ldots\\ldots $'
            }
            texte += ` $= ${texNombre(p2, 2)}$`
            this.canReponseACompleter = ` En utilisant les événements $F$ et $R$, compléter avec une probabilité :<br>
            $\\ldots = ${texNombre(p2, 2)}$`
            texteCorr = `Il s'agit d'une probabilité conditionnelle. Le pourcentage s'applique sur l'ensemble des garçons.<br>
             $${miseEnEvidence(`P_{\\overline{F}}(R)`)}=${texNombre(p2, 2)}$.`
            handleAnswers(this, i, {
              reponse: {
                value: [
                  'P_{\\overline{F}}({R})',
                  'p_{\\overline{F}}({R})',
                  'P_{\\overline{F}}({ R})',
                  'p_{\\overline{F}}({ R})',
                  'P_{\\overline{F}}(R)',
                  'p_{\\overline{F}}(R)',
                  'P_{\\overline{F}}( R)',
                  'p_{\\overline{F}}( R)',
                ],
                options: { texteAvecCasse: true },
              },
            })
          } else if (choix === 'q4') {
            texte += ` Dans ce lycée, il y a $${p1}\\,\\%$ de garçons demi-pensionnaires.<br>
            En utilisant les événements $F$ et $R$, compléter avec une probabilité :<br>`
            this.canEnonce += ` Dans ce lycée, il y a $${p1}\\,\\%$ de garçons demi-pensionnaires.
            `
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierProbabilite,
              )
            } else {
              texte += '$\\ldots\\ldots $'
            }
            texte += ` $ = ${texNombre(p2, 2)}$`
            this.canReponseACompleter = ` En utilisant les événements $F$ et $R$, compléter avec une probabilité :<br>
            $\\ldots = ${texNombre(p2, 2)}$`
            texteCorr = `Il ne s'agit pas d'une probabilité conditionnelle. Le pourcentage s'applique sur l'ensemble des élèves du lycée.<br>
             $${miseEnEvidence(`P(\\overline{F}\\cap R)`)}=${texNombre(p2, 2)}$.`
            handleAnswers(this, i, {
              reponse: {
                value: [
                  'p(\\overline{F}\\cap R)',
                  'p(R\\cap \\overline{F})',
                  'P(\\overline{F}\\cap R)',
                  'P(R\\cap \\overline{F})',
                ],
                options: { texteAvecCasse: true },
              },
            })
          } else {
            if (choice([true, false])) {
              texte += ` Dans ce lycée $${p1}\\,\\%$ des demi-pensionnaires sont des garçons.<br>`
              this.canEnonce += ` Dans ce lycée $${p1}\\,\\%$ des demi-pensionnaires sont des garçons.`
            } else {
              texte += `Parmi les demi-pensionnaires de ce lycée, $${p1}\\,\\%$ sont des garçons.<br>`
              this.canEnonce += `Parmi les demi-pensionnaires de ce lycée, $${p1}\\,\\%$ sont des garçons.`
            }
            texte +=
              ' En utilisant les événements $F$ et $R$, compléter avec une probabilité :<br>'
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierProbabilite,
              )
            } else {
              texte += '$\\ldots\\ldots $'
            }
            texte += `$= ${texNombre(p2, 2)}$`
            this.canReponseACompleter = ` En utilisant les événements $F$ et $R$, compléter avec une probabilité :<br>
            $\\ldots = ${texNombre(p2, 2)}$`
            texteCorr = `Il s'agit d'une probabilité conditionnelle. Le pourcentage s'applique sur l'ensemble des demi-pensionnaires.<br>
             $${miseEnEvidence(`P_{R}(\\overline{F})`)}=${texNombre(p2, 2)}$.`
            handleAnswers(this, i, {
              reponse: {
                value: [
                  'P_{R}({\\overline{F}})',
                  'p_{R}({\\overline{F}})',
                  'P{_R}({\\overline{F}})',
                  'P_R({\\overline{F}})',
                  'P{_R}({\\overline{F}})',
                  'P_{R}(\\overline{F})',
                  'p_{R}(\\overline{F})',
                  'P{_R}(\\overline{F})',
                  'P_R(\\overline{F})',
                  'P{_R}(\\overline{F})',
                ],
                options: { texteAvecCasse: true },
              },
            })
          }

          break

        case 2:
          p1 = randint(80, 95)
          p2 = p1 / 100
          p3 = randint(2, 7)
          p4 = p3 / 100
          p5 = randint(35, 55)
          p6 = p5 / 100
          choix = choice(['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7']) //,
          texte = `Dans un stock de pommes provenant de deux fournisseurs (A et B), on prend au hasard une pomme. On note :<br>
            A : «${sp()}La pomme provient du fournisseur A${sp()}» ;<br>
            C : «${sp()}La pomme est commercialisable${sp()}». <br>`
          this.canEnonce = texte
          if (choix === 'q1') {
            if (choice([true, false])) {
              texte += ` $${p1}\\,\\%$ des pommes provenant du fournisseur A sont commercialisables.<br>
              En utilisant les événements $A$ et $C$, compléter avec une probabilité :<br>`
              this.canEnonce += ` $${p1}\\,\\%$ des pommes provenant du fournisseur A sont commercialisables.`
            } else {
              texte += `Parmi les pommes provenant du fournisseur A, $${p1}$ $\\%$ sont commercialisables.<br>
              En utilisant les événements $A$ et $C$, compléter avec une probabilité :<br>`
              this.canEnonce += `Parmi les pommes provenant du fournisseur A, $${p1}\\,\\%$ sont commercialisables.`
            }
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierProbabilite,
              )
            } else {
              texte += '$\\ldots\\ldots $'
            }
            texte += ` $ = ${texNombre(p2, 2)}$`
            this.canReponseACompleter = ` En utilisant les événements $A$ et $C$, compléter avec une probabilité :<br>
            $\\ldots = ${texNombre(p2, 2)}$`
            texteCorr = `Il s'agit d'une probabilité conditionnelle. Le pourcentage s'applique sur l'ensemble des pommes du fournisseur A.<br>
               $${miseEnEvidence(`P_A(C)`)}=${texNombre(p2, 2)}$.`
            handleAnswers(this, i, {
              reponse: {
                value: [
                  'P_{A}({C})',
                  'P_{A}(C)',
                  'p_{A}({C})',
                  'p_{A}(C)',
                  'P_{A}({ C})',
                  'P_{A}( C)',
                  'p_{A}({ C})',
                  'p_{A}( C)',
                ],
                options: { texteAvecCasse: true },
              },
            })
          } else if (choix === 'q2') {
            if (choice([true, false])) {
              texte += ` $${p3}\\,\\%$ des pommes provenant du fournisseur A ne sont pas commercialisables.<br>
              En utilisant les événements $A$ et $C$, compléter avec une probabilité :<br>`
              this.canEnonce += ` $${p3}\\,\\%$ des pommes provenant du fournisseur A ne sont pas commercialisables.`
            } else {
              texte += `Parmi les pommes provenant du fournisseur A, $${p3}\\,\\%$ ne sont pas commercialisables.<br>
              En utilisant les événements $A$ et $C$, compléter avec une probabilité :<br>`
              this.canEnonce += `Parmi les pommes provenant du fournisseur A, $${p3}\\,\\%$ ne sont pas commercialisables.`
            }
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierProbabilite,
              )
            } else {
              texte += '$\\ldots\\ldots $'
            }
            texte += ` $ = ${texNombre(p4, 2)}$`
            texteCorr = `Il s'agit d'une probabilité conditionnelle. Le pourcentage s'applique sur l'ensemble des pommes du fournisseur A.<br>
              $ $${miseEnEvidence(`P_A(\\overline{C})`)}=${texNombre(p4, 2)}$.`
            handleAnswers(this, i, {
              reponse: {
                value: [
                  'P_{A}(\\overline{C})',
                  'p_{A}(\\overline{C})',
                  'P_A(\\overline{C})',
                  'P{_A}(\\overline{C})',
                  'p_A(\\overline{C})',
                  'p{_A}(\\overline{C})',
                  'P_{A}(\\overline{C})',
                  'p_{A}(\\overline{C})',
                  'P_A(\\overline{C})',
                  'P{_A}(\\overline{C})',
                  'p_A(\\overline{C})',
                  'p{_A}(\\overline{C})',
                ],
                options: { texteAvecCasse: true },
              },
            })
            this.canReponseACompleter = ` En utilisant les événements $A$ et $C$, compléter avec une probabilité :<br>
            $\\ldots = ${texNombre(p4, 2)}$`
          } else if (choix === 'q3') {
            if (choice([true, false])) {
              texte += ` $${p5}\\,\\%$ des pommes commercialisables proviennent du fournisseur A.<br>
              En utilisant les événements $A$ et $C$, compléter avec une probabilité :<br>`
              this.canEnonce += ` $${p5}\\,\\%$ des pommes commercialisables proviennent du fournisseur A.`
            } else {
              texte += `Parmi les pommes commercialisables, $${p5}$ $\\%$ proviennent du fournisseur A.<br>
              En utilisant les événements $A$ et $C$, compléter avec une probabilité :<br>`
              this.canEnonce += `Parmi les pommes commercialisables, $${p5}$ $\\%$ proviennent du fournisseur A.`
            }
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierProbabilite,
              )
            } else {
              texte += '$\\ldots\\ldots $'
            }
            texte += ` $ = ${texNombre(p6, 2)}$`
            texteCorr = `Il s'agit d'une probabilité conditionnelle. Le pourcentage s'applique sur l'ensemble des pommes commercialisables.<br>
               $${miseEnEvidence(`P_C(A)`)}=${texNombre(p6, 2)}$.`
            handleAnswers(this, i, {
              reponse: {
                value: [
                  'P_{C}({A})',
                  'P_{C}(A)',
                  'p_{C}({A})',
                  'p_{C}(A)',
                  'P_{C}({ A})',
                  'P_{C}( A)',
                  'p_{C}({ A})',
                  'p_{C}( A)',
                ],
                options: { texteAvecCasse: true },
              },
            })
            this.canReponseACompleter = ` En utilisant les événements $A$ et $C$, compléter avec une probabilité :<br>
            $\\ldots = ${texNombre(p6, 2)}$`
          } else if (choix === 'q4') {
            if (choice([true, false])) {
              texte += ` $${p5}\\,\\%$ des pommes non commercialisables proviennent du fournisseur B.<br>
              En utilisant les événements $A$ et $C$, compléter avec une probabilité :<br>`
              this.canEnonce += ` $${p5}\\,\\%$ des pommes non commercialisables proviennent du fournisseur B.`
            } else {
              texte += `Parmi les pommes non commercialisables, $${p5}$ $\\%$ proviennent du fournisseur B.<br>
              En utilisant les événements $A$ et $C$, compléter avec une probabilité :<br>`
              this.canEnonce += `Parmi les pommes non commercialisables, $${p5}$ $\\%$ proviennent du fournisseur B.`
            }
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierProbabilite,
              )
            } else {
              texte += '$\\ldots\\ldots $'
            }
            texte += ` $ = ${texNombre(p6, 2)}$`
            texteCorr = `Il s'agit d'une probabilité conditionnelle. Le pourcentage s'applique sur l'ensemble des pommes non commercialisables.<br>
               $${miseEnEvidence(`P_{\\overline{C}}(\\overline{A})`)}=${texNombre(p6, 2)}$.`
            handleAnswers(this, i, {
              reponse: {
                value: [
                  'P_\\overline{C}({\\overline{A}})',
                  'p_\\overline{C}({\\overline{A}})',
                  'P_\\overline{C}({\\overline{A}})',
                  'P{_\\overline{C}}({\\overline{A}})',
                  'p_\\overline{C}({\\overline{A}})',
                  'p{_\\overline{C}}({\\overline{A}})',
                  'P_\\overline{C}(\\overline{A})',
                  'p_\\overline{C}(\\overline{A})',
                  'P_\\overline{C}(\\overline{A})',
                  'P{_\\overline{C}}(\\overline{A})',
                  'p_\\overline{C}(\\overline{A})',
                  'p{_\\overline{C}}(\\overline{A})',
                ],
                options: { texteAvecCasse: true },
              },
            })
            this.canReponseACompleter = ` En utilisant les événements $A$ et $C$, compléter avec une probabilité :<br>
            $\\ldots = ${texNombre(p6, 2)}$`
          } else if (choix === 'q5') {
            texte += ` $${p5}\\,\\%$ des pommes proviennent du fournisseur A et sont commercialisables.<br>
              En utilisant les événements $A$ et $C$, compléter avec une probabilité :<br> `
            this.canEnonce += ` $${p5}\\,\\%$ des pommes proviennent du fournisseur A et sont commercialisables.`
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierProbabilite,
              )
            } else {
              texte += '$\\ldots\\ldots $'
            }
            texte += ` $ = ${texNombre(p6, 2)}$`
            texteCorr = `Il ne s'agit pas d'une probabilité conditionnelle. Le pourcentage s'applique sur l'ensemble des pommes.<br>
               $${miseEnEvidence(`P(A\\cap C)`)}=${texNombre(p6, 2)}$.`
            handleAnswers(this, i, {
              reponse: {
                value: [
                  'P(A\\cap C)',
                  'p(A\\cap C)',
                  'P(C\\cap A)',
                  'p(C\\cap A)',
                  'P( A\\cap C)',
                  'p( A\\cap C)',
                  'P( C\\cap A)',
                  'p( C\\cap A)',
                ],
                options: { texteAvecCasse: true },
              },
            })
            this.canReponseACompleter = ` En utilisant les événements $A$ et $C$, compléter avec une probabilité :<br>
            $\\ldots = ${texNombre(p6, 2)}$`
          } else if (choix === 'q6') {
            texte += ` $${p5}\\,\\%$ des pommes proviennent du fournisseur B et sont commercialisables.<br>
            En utilisant les événements $A$ et $C$, compléter avec une probabilité :<br> `
            this.canEnonce += ` $${p5}\\,\\%$ des pommes proviennent du fournisseur B et sont commercialisables.`
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierProbabilite,
              )
            } else {
              texte += '$\\ldots\\ldots $'
            }
            texte += ` $ = ${texNombre(p6, 2)}$`
            texteCorr = `Il ne s'agit pas d'une probabilité conditionnelle. Le pourcentage s'applique sur l'ensemble des pommes.<br>
             $${miseEnEvidence(`P(\\overline{A}\\cap C)`)}=${texNombre(p6, 2)}$.`
            handleAnswers(this, i, {
              reponse: {
                value: [
                  'P(\\overline{A}\\cap C)',
                  'p(\\overline{A}\\cap C)',
                  'P(C\\cap\\overline{A})',
                  'P(C\\cap\\overline{A})',
                  'P( C\\cap\\overline{A})',
                  'P( C\\cap\\overline{A})',
                ],
                options: { texteAvecCasse: true },
              },
            })
            this.canReponseACompleter = ` En utilisant les événements $A$ et $C$, compléter avec une probabilité :<br>
            $\\ldots = ${texNombre(p6, 2)}$`
          } else {
            texte += ` $${p5}\\,\\%$ des pommes proviennent du fournisseur A et ne sont pas commercialisables.<br>
          En utilisant les événements $A$ et $C$, compléter avec une probabilité :<br>`
            this.canEnonce += ` $${p5}\\,\\%$ des pommes proviennent du fournisseur A et ne sont pas commercialisables.`
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierProbabilite,
              )
            } else {
              texte += '$\\ldots\\ldots $'
            }
            texte += ` $ = ${texNombre(p6, 2)}$`
            texteCorr = `Il ne s'agit pas d'une probabilité conditionnelle. Le pourcentage s'applique sur l'ensemble des pommes.<br>
           $${miseEnEvidence(`P(A\\cap \\overline{C})`)}=${texNombre(p6, 2)}$.`
            handleAnswers(this, i, {
              reponse: {
                value: [
                  'P(\\overline{C}\\cap A)',
                  'p(\\overline{C}\\cap A)',
                  'P(A\\cap\\overline{C})',
                  'P(A\\cap\\overline{C})',
                  'P( A\\cap\\overline{C})',
                  'P( A\\cap\\overline{C})',
                ],
                options: { texteAvecCasse: true },
              },
            })
            this.canReponseACompleter = ` En utilisant les événements $A$ et $C$, compléter avec une probabilité :<br>
            $\\ldots = ${texNombre(p6, 2)}$`
          }
          break

        case 3:
        default:
          p1 = randint(90, 99)
          p2 = p1 / 100
          p3 = randint(2, 7)
          p4 = p3 / 100
          p5 = randint(35, 55)
          p6 = p5 / 100
          choix = choice(['q1', 'q2', 'q3', 'q4', 'q5', 'q6']) //,
          texte = `Un test est utilisé pour dépister une maladie. On choisit une personne au hasard. On note :<br>
              M : «${sp()}La personne est malade${sp()}» ;<br>
              T : «${sp()}Le test est positif${sp()}». <br>`
          this.canEnonce = texte
          if (choix === 'q1') {
            if (choice([true, false])) {
              texte += ` Si une personne est malade, le test est positif dans $${p1}\\,\\%$ des cas.<br>
                En utilisant les événements $M$ et $T$, compléter avec une probabilité :<br>`
              this.canEnonce += `Si une personne est malade, le test est positif dans $${p1}\\,\\%$ des cas.`
            } else {
              texte += `Parmi les personnes malades, $${p1}$ $\\%$ ont un test positif.<br>
                En utilisant les événements $M$ et $T$, compléter avec une probabilité :<br>`
              this.canEnonce += `Parmi les personnes malades, $${p1}\\,\\%$ ont un test positif.`
            }
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierProbabilite,
              )
            } else {
              texte += '$\\ldots\\ldots $'
            }
            texte += ` $ = ${texNombre(p2, 2)}$`
            texteCorr = `Il s'agit d'une probabilité conditionnelle. Le pourcentage s'applique sur l'ensemble des personnes malades.<br>
                 $${miseEnEvidence(`P_M(T)`)}=${texNombre(p2, 2)}$.`
            handleAnswers(this, i, {
              reponse: {
                value: [
                  'P_{M}({T})',
                  'P_{M}(T)',
                  'p_{M}({T})',
                  'p_{M}(T)',
                  'P_{M}({ T})',
                  'P_{M}( T)',
                  'p_{M}({ T})',
                  'p_{M}( T)',
                ],
                options: { texteAvecCasse: true },
              },
            })
            this.canReponseACompleter = ` En utilisant les événements $M$ et $T$, compléter avec une probabilité :<br>
            $\\ldots = ${texNombre(p2, 2)}$`
          } else if (choix === 'q2') {
            if (choice([true, false])) {
              texte += ` Si une personne n'est pas malade, le test est négatif dans $${p1}\\,\\%$ des cas.<br>
                En utilisant les événements $M$ et $T$, compléter avec une probabilité :<br> `
              this.canEnonce += ` Si une personne n'est pas malade, le test est négatif dans $${p1}\\,\\%$ des cas.`
            } else {
              texte += ` $${p1}\\,\\%$ des personnes non malades ont un test négatif.<br>
                En utilisant les événements $M$ et $T$, compléter avec une probabilité :<br>`
              this.canEnonce += ` $${p1}\\,\\%$ des personnes non malades ont un test négatif.`
            }
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierProbabilite,
              )
            } else {
              texte += '$\\ldots\\ldots $'
            }
            texte += ` $ = ${texNombre(p2, 2)}$`
            texteCorr = `Il s'agit d'une probabilité conditionnelle. Le pourcentage s'applique sur l'ensemble des personnes non malades.<br>
                 $${miseEnEvidence(`P_{\\overline{M}}(\\overline{T})`)}=${texNombre(p2, 2)}$.`
            handleAnswers(this, i, {
              reponse: {
                value: [
                  'P_{\\overline{M}}({\\overline{T}})',
                  'P_{\\overline{M}}(\\overline{T})',
                  'p_{\\overline{M}}({\\overline{T}})',
                  'p_{\\overline{M}}(\\overline{T})',
                  'P_{\\overline{M}}({\\overline{T}})',
                  'P_{\\overline{M}}(\\overline{T})',
                  'p_{\\overline{M}}({\\overline{T}})',
                  'p_{\\overline{M}}(\\overline{T})',
                ],
                options: { texteAvecCasse: true },
              },
            })
            this.canReponseACompleter = ` En utilisant les événements $M$ et $T$, compléter avec une probabilité :<br>
            $\\ldots = ${texNombre(p2, 2)}$`
          } else if (choix === 'q3') {
            if (choice([true, false])) {
              texte += ` Parmi les tests positifs, $${p3}\\,\\%$ des personnes ne sont pas malades.<br>
                En utilisant les événements $M$ et $T$, compléter avec une probabilité :<br>
                `
              this.canEnonce += ` Parmi les tests positifs, $${p3}\\,\\%$ des personnes ne sont pas malades.`
            } else {
              texte += `$${p3}\\,\\%$ des personnes testées positives ne sont pas malades.<br>
                En utilisant les événements $M$ et $T$, compléter avec une probabilité :<br>
                `
              this.canEnonce += `$${p3}\\,\\%$ des personnes testées positives ne sont pas malades.`
            }
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierProbabilite,
              )
            } else {
              texte += '$\\ldots\\ldots $'
            }
            texte += ` $ = ${texNombre(p4, 2)}$`
            texteCorr = `Il s'agit d'une probabilité conditionnelle. Le pourcentage s'applique sur l'ensemble des tests positifs.<br>
                 $${miseEnEvidence(`P_{T}(\\overline{M})`)}=${texNombre(p4, 2)}$.`
            handleAnswers(this, i, {
              reponse: {
                value: [
                  'P_{T}({\\overline{M}})',
                  'p_{T}({\\overline{M}})',
                  'P_T({\\overline{M}})',
                  'P{_T}({\\overline{M}})',
                  'p_T({\\overline{M}})',
                  'p{_T}({\\overline{M}})',
                ],
                options: { texteAvecCasse: true },
              },
            })
            this.canReponseACompleter = ` En utilisant les événements $M$ et $T$, compléter avec une probabilité :<br>
            $\\ldots = ${texNombre(p2, 2)}$`
          } else if (choix === 'q4') {
            if (choice([true, false])) {
              texte += ` Parmi les tests négatifs, $${p3}\\,\\%$ des personnes sont malades.<br>
                En utilisant les événements $M$ et $T$, compléter avec une probabilité :<br>`
              this.canEnonce += ` Parmi les tests négatifs, $${p3}\\,\\%$ des personnes sont malades.`
            } else {
              texte += `Si le test est négatif, la personne est malade dans $${p3}\\,\\%$ des cas.<br>
                En utilisant les événements $M$ et $T$, compléter avec une probabilité :<br>`
              this.canEnonce += `Si le test est négatif, la personne est malade dans $${p3}\\,\\%$ des cas.`
            }
            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierProbabilite,
              )
            } else {
              texte += '$\\ldots\\ldots $'
            }
            texte += ` $ = ${texNombre(p4, 2)}$`
            texteCorr = `Il s'agit d'une probabilité conditionnelle. Le pourcentage s'applique sur l'ensemble des tests positifs.<br>
                 $${miseEnEvidence(`P_{\\overline{T}}(M)`)}=${texNombre(p4, 2)}$.`
            handleAnswers(this, i, {
              reponse: {
                value: [
                  'P_{\\overline{T}}({M})',
                  'p_{\\overline{T}}({M})',
                  'P_\\overline{T}({M})',
                  'P{_\\overline{T}}({M})',
                  'p_\\overline{T}({M})',
                  'p{_\\overline{T}}({M})',
                ],
                options: { texteAvecCasse: true },
              },
            })
            this.canReponseACompleter = ` En utilisant les événements $M$ et $T$, compléter avec une probabilité :<br>
            $\\ldots = ${texNombre(p4, 2)}$`
          } else if (choix === 'q5') {
            texte += ` Dans $${p3}\\,\\%$ des cas, le test est positif et la personne est malade.<br>
                En utilisant les événements $T$ et $M$, compléter avec une probabilité :<br>`
            this.canEnonce += ` Dans $${p3}\\,\\%$ des cas, le test est positif et la personne est malade.`

            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierProbabilite,
              )
            } else {
              texte += '$\\ldots\\ldots $'
            }
            texte += ` $ = ${texNombre(p4, 2)}$`
            texteCorr = `Il ne s'agit pas d'une probabilité conditionnelle. Le pourcentage s'applique sur l'ensemble des personnes.<br>
                 $${miseEnEvidence(`P(T\\cap M)`)}=${texNombre(p4, 2)}$.`
            handleAnswers(this, i, {
              reponse: {
                value: [
                  'P(M\\cap T)',
                  'p(M\\cap T)',
                  'P(T\\cap M)',
                  'p(T\\cap M)',
                  'P( M\\cap T)',
                  'p( M\\cap T)',
                  'P( T\\cap M)',
                  'p( T\\cap M)',
                ],
                options: { texteAvecCasse: true },
              },
            })
            this.canReponseACompleter = ` En utilisant les événements $M$ et $T$, compléter avec une probabilité :<br>
            $\\ldots = ${texNombre(p4, 2)}$`
          } else {
            texte += ` $${p3}\\,\\%$ des personnes ont un test positif alors qu'elles ne sont pas malades.<br>
                En utilisant les événements $T$ et $M$, compléter avec une probabilité :<br>`
            this.canEnonce += `$${p3}\\,\\%$ des personnes ont un test positif alors qu'elles ne sont pas malades.`

            if (this.interactif) {
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierProbabilite,
              )
            } else {
              texte += '$\\ldots\\ldots $'
            }
            texte += ` $ = ${texNombre(p4, 2)}$`
            texteCorr = `Il ne s'agit pas d'une probabilité conditionnelle. Le pourcentage s'applique sur l'ensemble des personnes.<br>
                 $${miseEnEvidence(`P(T\\cap \\overline{M})`)}=${texNombre(p4, 2)}$.`
            handleAnswers(this, i, {
              reponse: {
                value: [
                  'P(\\overline{M}\\cap T)',
                  'p(\\overline{M}\\cap T)',
                  'P(T\\cap \\overline{M})',
                  'p(T\\cap \\overline{M})',
                ],
                options: { texteAvecCasse: true },
              },
            })
            this.canReponseACompleter = ` En utilisant les événements $M$ et $T$, compléter avec une probabilité :<br>
            $\\ldots = ${texNombre(p4, 2)}$`
          }
          break
      }
      if (this.questionJamaisPosee(i, p1, p2, p3, p4, p5, p6)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        this.listeCanEnonces.push(this.canEnonce)
        this.listeCanReponsesACompleter.push(this.canReponseACompleter)
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
