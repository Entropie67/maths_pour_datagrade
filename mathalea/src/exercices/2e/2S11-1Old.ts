import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import Exercice from '../Exercice'

import { tableauColonneLigne } from '../../lib/2d/tableau'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha, sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
export const titre =
  'Calculer des probabilités dans une situation concrète (union et intersection)'
export const dateDePublication = '26/05/2024'
export const interactifReady = true

/**
 *
 * @author Gilles Mora
 */
export const uuid = 'ae872'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class ProbaConcretOld extends Exercice {
  constructor() {
    super()
    // this.consigne = 'Calculer '
    this.sup = 7
    this.nbQuestions = 1
    this.spacing = context.isHtml ? 1.5 : 2
    this.spacingCorr = context.isHtml ? 1.5 : 2
  }

  nouvelleVersion() {
    let index = 0
    let increment = 1
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 6,
      melange: 7,
      defaut: 7,
      nbQuestions: this.nbQuestions,
    })

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const a = randint(1, 20)
      let texte = ''
      let texteCorr = ''

      const total = randint(6, 9) * 20
      const nbCadres = randint(20, 60)
      const nbEmployes = total - nbCadres
      const nbFemmes = randint(25, 50)
      const nbHommes = total - nbFemmes
      const nbFemmesEtCadres = randint(10, 15)
      const nbHommesEtCadres = nbCadres - nbFemmesEtCadres
      const nbFemmesEtEmployees = nbFemmes - nbFemmesEtCadres
      const nbHommesEtEmployes = nbHommes - nbHommesEtCadres

      const listeEvenementIntersection = [
        [
          'F\\cap C',
          'la personne choisie est une femme qui fait partie des cadres',
          new FractionEtendue(nbFemmesEtCadres, total).texFraction,
          'de femmes cadres',
        ],
        [
          '\\overline{F}\\cap C',
          'la personne choisie est un homme qui fait partie des cadres',
          new FractionEtendue(nbHommesEtCadres, total).texFraction,
          "d'hommes cadres",
        ],
        [
          '\\overline{F}\\cap \\overline{C}',
          'la personne choisie est un homme qui fait partie des employés',
          new FractionEtendue(nbHommesEtEmployes, total).texFraction,
          "d'hommes employés",
        ],
        [
          'F\\cap \\overline{C}',
          'la personne choisie est une femme qui fait partie des employés',
          new FractionEtendue(nbFemmesEtEmployees, total).texFraction,
          'de femmes employées',
        ],
      ]
      const EvInter = choice(listeEvenementIntersection)

      const listeEvenementUnion = [
        [
          'F\\cup C',
          'F',
          new FractionEtendue(nbFemmes, total).texFraction,
          'C',
          new FractionEtendue(nbCadres, total).texFraction,
          'F\\cap C',
          new FractionEtendue(nbFemmesEtCadres, total).texFraction,
          'la personne choisie est une femme ou fait partie des cadres',
          new FractionEtendue(nbFemmes + nbCadres - nbFemmesEtCadres, total)
            .texFraction,
        ],
        [
          '\\overline{F}\\cup C',
          '\\overline{F}',
          new FractionEtendue(nbHommes, total).texFraction,
          'C',
          new FractionEtendue(nbCadres, total).texFraction,
          '\\overline{F}\\cap C',
          new FractionEtendue(nbHommesEtCadres, total).texFraction,
          'la personne choisie est un homme ou fait partie des cadres',
          new FractionEtendue(nbHommes + nbCadres - nbHommesEtCadres, total)
            .texFraction,
        ],
        [
          'F\\cup \\overline{C}',
          'F',
          new FractionEtendue(nbFemmes, total).texFraction,
          '\\overline{C}',
          new FractionEtendue(nbEmployes, total).texFraction,
          'F\\cap \\overline{C}',
          new FractionEtendue(nbFemmesEtEmployees, total).texFraction,
          'la personne choisie est une femme ou fait partie des employés',
          new FractionEtendue(
            nbFemmes + nbEmployes - nbFemmesEtEmployees,
            total,
          ).texFraction,
        ],
        [
          '\\overline{F}\\cup \\overline{C}',
          '\\overline{F}',
          new FractionEtendue(nbHommes, total).texFraction,
          '\\overline{C}',
          new FractionEtendue(nbEmployes, total).texFraction,
          '\\overline{F}\\cap \\overline{C}',
          new FractionEtendue(nbHommesEtEmployes, total).texFraction,
          'la personne choisie est un homme ou fait partie des employés',
          new FractionEtendue(nbHommes + nbEmployes - nbHommesEtEmployes, total)
            .texFraction,
        ],
      ]
      const EvUnion = choice(listeEvenementUnion)

      const listeEvenementCond = [
        [
          'est une femme',
          "qu'elle soit cadre",
          'Nombre de femmes',
          'Nombre de femmes cadres',
          new FractionEtendue(nbFemmesEtCadres, nbFemmes).texFraction,
        ],
        [
          'est un homme',
          "qu'il soit cadre",
          "Nombre d'hommes",
          "Nombre d'hommes cadres",
          new FractionEtendue(nbHommesEtCadres, nbHommes).texFraction,
        ],
        [
          'est un homme',
          "qu'il soit employé",
          "Nombre d'hommes",
          "Nombre d'hommes employés",
          new FractionEtendue(nbHommesEtEmployes, nbHommes).texFraction,
        ],
        [
          'est une femme',
          "qu'elle soit employée",
          'Nombre de femmes',
          'Nombre de femmes employées',
          new FractionEtendue(nbFemmesEtEmployees, nbFemmes).texFraction,
        ],
        [
          'fait partie des cadres',
          'que ce soit une femme',
          'Nombre de cadres',
          'Nombre de femmes cadres',
          new FractionEtendue(nbFemmesEtCadres, nbCadres).texFraction,
        ],
        [
          'fait partie des cadres',
          'que ce soit un homme',
          'Nombre de cadres',
          "Nombre d'hommes cadres",
          new FractionEtendue(nbHommesEtCadres, nbCadres).texFraction,
        ],
        [
          'fait partie des employés',
          'que ce soit une femme',
          "Nombre d'employés",
          'Nombre de femmes employées',
          new FractionEtendue(nbFemmesEtEmployees, nbEmployes).texFraction,
        ],
        [
          'fait partie des employés',
          'que ce soit un homme',
          "Nombre d'employés",
          "Nombre d'hommes employées",
          new FractionEtendue(nbHommesEtEmployes, nbEmployes).texFraction,
        ],
      ]
      const EvCond = choice(listeEvenementCond)

      const choix1 = choice([true, false])
      const choix2 = choice([true, false])
      const tableau = tableauColonneLigne(
        ['', '\\text{Femmes}', '\\text{Hommes}', '\\text{Total}'],
        ['\\text{Cadres}', '\\text{Employés}', '\\text{Total}'],
        [
          `${nbFemmesEtCadres}`,
          `${nbHommesEtCadres}`,
          `${nbCadres}`,
          `${nbFemmesEtEmployees}`,
          `${nbHommesEtEmployes}`,
          `${nbEmployes}`,
          `${nbFemmes}`,
          `${nbHommes}`,
          `${total}`,
        ],
      )

      texte = `Le personnel d'une entreprise est constitué de $${total}$ personnes qui se répartissent de
          la manière suivante : <br>
            ${tableau}
               `

      texte += `Au cours de la fête de fin d'année, le comité d'entreprise offre un séjour à la
               montagne à une personne choisie au hasard parmi les $${total}$ personnes de cette
               entreprise.<br>
               On définit les évènements suivants : <br>
               C : «${sp()}la personne choisie fait partie des cadres${sp()}» ;
               F : «${sp()}la personne choisie est une femme${sp()}».<br>
               ${numAlpha(0)} Calculer la probabilité de l'événement ${choix1 ? `$${EvInter[0]}$` : `: «${sp()}${EvInter[1]}${sp()}»`}.<br>`
      texte +=
        ajouteChampTexteMathLive(
          this,
          index,
          KeyboardType.clavierDeBaseAvecFraction,
        ) + '<br>'
      handleAnswers(this, index, { reponse: { value: EvInter[2] } })
      texte += `${numAlpha(1)} Calculer la probabilité de l'événement ${choix2 ? `$${EvUnion[0]}$` : `: «${sp()}${EvUnion[7]}${sp()}»`}.<br>`
      texte +=
        ajouteChampTexteMathLive(
          this,
          index + 1,
          KeyboardType.clavierDeBaseAvecFraction,
        ) + '<br>'
      handleAnswers(this, index + 1, { reponse: { value: EvUnion[8] } })
      texte += `${numAlpha(2)} On sait que la personne choisie ${EvCond[0]}.<br>
          Quelle est la probabilité ${EvCond[1]} ?`
      texte +=
        '<br>' +
        ajouteChampTexteMathLive(
          this,
          index + 2,
          KeyboardType.clavierDeBaseAvecFraction,
        )
      handleAnswers(this, index + 2, { reponse: { value: EvCond[4] } })
      texteCorr = `${numAlpha(0)} La probabilité est donnée par : <br>
          $P(${EvInter[0]})=\\dfrac{\\text{Nombre ${EvInter[3]}}}{\\text{Effectif total}}=${miseEnEvidence(EvInter[2])}$.
               `
      texteCorr += `<br><br>${numAlpha(1)} La probabilité est donnée par : <br>
$\\begin{aligned}
P(${EvUnion[0]})&=P(${EvUnion[1]})+P(${EvUnion[3]})-P(${EvUnion[5]})\\\\
&=${EvUnion[2]}+${EvUnion[4]}-${EvUnion[6]}\\\\
&=${miseEnEvidence(EvUnion[8])}
  \\end{aligned}$
                    `
      texteCorr += `<br><br>${numAlpha(2)} La probabilité est donnée par : <br>
          $P=\\dfrac{\\text{${EvCond[3]}}}{\\text{${EvCond[2]}}}=${miseEnEvidence(EvCond[4])}$.
        
               `

      increment = 3

      if (this.questionJamaisPosee(i, listeTypeDeQuestions[i], a)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
        index += increment
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
