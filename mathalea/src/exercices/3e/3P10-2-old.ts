// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 4ce2e continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/interactivity/mathLive.texte.test.ts ⚠️
 */

import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { egalOuApprox } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha } from '../../lib/outils/outilString'
import { texNombre, texPrix } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer des variations consécutives (pourcentages)'
export const interactifReady = true

export const dateDePublication = '28/06/2026'

/**
 * @author Jean-Claude Lhote
 */
export const uuid = '4ce2e'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

function troisPointsSiJuste(listePoints: number[]): [number, number] {
  return listePoints[0] === 1 ? [3, 3] : [0, 3]
}
function troisPointsPour2Questions(listePoints: number[]): [number, number] {
  const totalPoints = listePoints[0] + 2 * listePoints[1]
  return [totalPoints, 3]
}
export default class VariationsCumuleesOld extends Exercice {
  version = 1
  constructor() {
    super()
    this.spacingCorr = 2
    this.nbQuestions = 4
    this.besoinFormulaireTexte = [
      'Type de problème',
      "0: Mélange\n1: Augmentation de salaire\n2 : Intérêts d'un placement\n3: Diminution de population animale\n4: Population mondiale",
    ]
    this.besoinFormulaire2Numerique = [
      'Progressivité des énoncés',
      3,
      '1: Trois questions\n2: Deux questions\n3: Une question',
    ]
    this.sup = '1'
    this.sup2 = 1
  }

  nouvelleVersion() {
    let pourcentage = 0
    const problemes = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      nbQuestions: this.nbQuestions,
      defaut: 1,
      melange: 0,
    })
    const progressivite = 4 - Number(this.sup2)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 100;) {
      const nbFois = randint(3, 6)
      const enonceBase = ''
      const questionType1 = ''
      const correctionType1 = ''
      let probleme = {
        enonceBase,
        questionType1,
        correctionType1,
        valeur1: {},
        dataTemplate2: '',
        dataOptions2: {},
        valeur2: {},
        correction2: '',
        dataTemplate3: '',
        dataOptions3: {},
        valeur3: {},
        correction3: '',
      }
      switch (problemes[i]) {
        case 4:
          {
            // Population mondiale
            const nbAns = randint(3, 6)
            pourcentage = randint(8, 14) * 0.1
            probleme = populationMondiale(pourcentage, nbAns)
          }
          break
        case 2:
          {
            // Intérêts d'un placement
            const nbAns = randint(3, 6)
            pourcentage = randint(1, 4)
            probleme = interetsPlacement(pourcentage, nbAns)
          }
          break
        case 3:
          {
            // Diminution de population
            const nbAns = randint(3, 6)
            pourcentage = randint(1, 4) * 4
            probleme = extinctionDePopulation(pourcentage, nbAns)
          }
          break
        case 1:
        default:
          {
            // Augmentation de salaire
            const nbAns = randint(3, 6) * 2
            pourcentage = randint(1, 5) * 2
            probleme = augmentationDeSalaire(pourcentage, nbAns)
          }
          break
      }
      const texte =
        progressivite === 1
          ? `${probleme.enonceBase}<br>${probleme.questionType1}${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, { texteApres: ' euros' })}`
          : progressivite === 3
            ? `${probleme.enonceBase}<br>${addMultiMathfield(this, i, { dataTemplate: probleme.dataTemplate3, dataOptions: probleme.dataOptions3 })}`
            : `${probleme.enonceBase}<br>${addMultiMathfield(this, i, { dataTemplate: probleme.dataTemplate2, dataOptions: probleme.dataOptions2 })}`

      if (this.questionJamaisPosee(i, problemes[i], pourcentage, nbFois)) {
        handleAnswers(
          this,
          i,
          progressivite === 1
            ? probleme.valeur1
            : progressivite === 3
              ? probleme.valeur3
              : probleme.valeur2,
          {
            formatInteractif:
              progressivite === 1 ? 'mathlive' : 'multi-mathfield',
          },
        )
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] =
          progressivite === 1
            ? probleme.correctionType1
            : progressivite === 3
              ? probleme.correction3
              : probleme.correction2
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

function interetsPlacement(PourcentageAugmentation: number, nbAns: number) {
  const capitalInitial = 1000 + randint(0, 10) * 100 // Capital initial placé

  const enonceBase = `Un capital initial de $${texPrix(capitalInitial)}$ euros est placé à un taux d'intérêt de $${PourcentageAugmentation}~\\%$ par an.<br>`

  const questionType1 = `Quel sera le capital au bout de ${nbAns} ans ?`
  const correctionType1 = `Le capital au bout de ${nbAns} ans sera de :<br>
$\\begin{aligned}
${texPrix(capitalInitial)}\\times (\\dfrac{100+${PourcentageAugmentation}}{100})^${nbAns}&=${texPrix(capitalInitial)}\\times ${texNombre((100 + PourcentageAugmentation) / 100, 2)}^${nbAns}\\\\
&=${texPrix(capitalInitial)}\\times ${texNombre(Math.pow((100 + PourcentageAugmentation) / 100, nbAns), 12)}\\\\
&${egalOuApprox(capitalInitial * Math.pow((100 + PourcentageAugmentation) / 100, nbAns), 2)}${texPrix(capitalInitial * Math.pow((100 + PourcentageAugmentation) / 100, nbAns))}\\\\
\\end{aligned}$<br>
Ainsi, le capital au bout de ${nbAns} ans sera de $${miseEnEvidence(
    texPrix(
      capitalInitial * Math.pow((100 + PourcentageAugmentation) / 100, nbAns),
    ),
  )}$ euros.`
  const valeur1 = {
    reponse: {
      value: texNombre(
        capitalInitial * Math.pow((100 + PourcentageAugmentation) / 100, nbAns),
        2,
      ),
    },
    bareme: troisPointsSiJuste,
  }

  const dataTemplate2 = `a) Par quel nombre faut-il multiplier chaque année le capital pour obtenir le nouveau capital ? %{champ1}<br>
b) Quel sera le capital au bout de ${nbAns} ans ? %{champ2}<br>`
  const dataOptions2 = {
    champ1: {
      texteApres: '',
      keyboard: KeyboardType.clavierDeBase,
    },
    champ2: {
      texteApres: ' euros',
      keyboard: KeyboardType.clavierDeBase,
    },
    bareme: troisPointsPour2Questions,
  }
  const valeur2 = {
    champ1: {
      value: texNombre((100 + PourcentageAugmentation) / 100, 2),
    },
    champ2: {
      value: texNombre(
        capitalInitial * Math.pow((100 + PourcentageAugmentation) / 100, nbAns),
        2,
      ),
    },
    bareme: troisPointsPour2Questions,
  }

  const correction2 = `${numAlpha(0)} Le capital est multiplié chaque année par :<br>
$\\dfrac{100+${PourcentageAugmentation}}{100}=${miseEnEvidence(texNombre((100 + PourcentageAugmentation) / 100, 2))}$<br>
${numAlpha(1)} Le capital au bout de ${nbAns} ans sera de :<br>
$${texPrix(capitalInitial)}\\times (\\dfrac{100+${PourcentageAugmentation}}{100})^${nbAns}=${texPrix(capitalInitial)}\\times ${texNombre((100 + PourcentageAugmentation) / 100, 2)}^${nbAns}${egalOuApprox(capitalInitial * Math.pow((100 + PourcentageAugmentation) / 100, nbAns), 2)}${miseEnEvidence(texPrix(capitalInitial * Math.pow((100 + PourcentageAugmentation) / 100, nbAns)))}$ euros.<br>`

  const dataTemplate3 = `a) Au bout d'un an, quel sera le capital ? %{champ1}<br>
  b) Au bout de deux ans, quel sera le capital ? %{champ2}<br>
  c) Au bout de ${nbAns} ans, quel sera le capital ? %{champ3}<br>`
  const dataOptions3 = {
    champ1: {
      texteApres: ' euros',
      keyboard: KeyboardType.clavierDeBase,
    },
    champ2: {
      texteApres: ' euros',
      keyboard: KeyboardType.clavierDeBase,
    },
    champ3: {
      texteApres: ' euros',
      keyboard: KeyboardType.clavierDeBase,
    },
    bareme: toutAUnPoint,
  }
  const valeur3 = {
    champ1: {
      value: texNombre(
        capitalInitial * Math.pow((100 + PourcentageAugmentation) / 100, 1),
        2,
      ),
    },
    champ2: {
      value: texNombre(
        capitalInitial * Math.pow((100 + PourcentageAugmentation) / 100, 2),
        2,
      ),
    },
    champ3: {
      value: texNombre(
        capitalInitial * Math.pow((100 + PourcentageAugmentation) / 100, nbAns),
        2,
      ),
    },
  }
  const correction3 = `${numAlpha(0)} Au bout d'un an, le capital sera :<br>
 $${texPrix(capitalInitial)}\\times \\dfrac{100+${PourcentageAugmentation}}{100}=${texPrix(capitalInitial)}\\times ${texNombre((100 + PourcentageAugmentation) / 100, 2)}${egalOuApprox(capitalInitial * Math.pow((100 + PourcentageAugmentation) / 100, 1), 2)}${miseEnEvidence(texPrix(capitalInitial * Math.pow((100 + PourcentageAugmentation) / 100, 1)))}$ euros.<br>
 ${numAlpha(1)} Au bout de deux ans, le capital sera :<br>
 $${texPrix((capitalInitial * (100 + PourcentageAugmentation)) / 100)}\\times \\dfrac{100+${PourcentageAugmentation}}{100}=${texPrix((capitalInitial * (100 + PourcentageAugmentation)) / 100)}\\times ${texNombre((100 + PourcentageAugmentation) / 100, 2)}${egalOuApprox(capitalInitial * Math.pow((100 + PourcentageAugmentation) / 100, 2), 2)}${miseEnEvidence(texPrix(capitalInitial * Math.pow((100 + PourcentageAugmentation) / 100, 2)))}$ euros.<br>
 ${numAlpha(2)} Au bout de ${nbAns} ans, le capital sera :<br>
 $${texPrix(capitalInitial * Math.pow((100 + PourcentageAugmentation) / 100, nbAns))}\\times \\dfrac{100+${PourcentageAugmentation}}{100}=${texPrix(capitalInitial * Math.pow((100 + PourcentageAugmentation) / 100, nbAns))}\\times ${texNombre((100 + PourcentageAugmentation) / 100, 2)}${egalOuApprox(capitalInitial * Math.pow((100 + PourcentageAugmentation) / 100, nbAns), 2)}${miseEnEvidence(texPrix(capitalInitial * Math.pow((100 + PourcentageAugmentation) / 100, nbAns)))}$ euros.<br>`
  return {
    enonceBase,
    questionType1,
    correctionType1,
    valeur1,
    dataTemplate2,
    dataOptions2,
    valeur2,
    correction2,
    dataTemplate3,
    dataOptions3,
    valeur3,
    correction3,
  }
}

function augmentationDeSalaire(PourcentageAugmentation: number, nbAns: number) {
  const salaireInitial = 1000 + randint(0, 10) * 100 // Salaire initial de l'employé

  const enonceBase = `Un employé a un salaire initial de $${texPrix(salaireInitial)}$ euros.<br>
  On lui propose une augmentation de $${PourcentageAugmentation}~\\%$ tous les deux ans.<br>`

  const questionType1 = `S'il reste $${nbAns}$ ans dans l'entreprise, quel sera le salaire de l'employé au bout des $${nbAns}$ ans ?`
  const correctionType1 = `Le salaire de l'employé au bout de ${nbAns} ans sera de :<br>
$\\begin{aligned}
${texPrix(salaireInitial)}\\times (\\dfrac{100+${PourcentageAugmentation}}{100})^${nbAns / 2}&=${texPrix(salaireInitial)}\\times ${texNombre((100 + PourcentageAugmentation) / 100, 2)}^${nbAns / 2}\\\\
&=${texPrix(salaireInitial)}\\times ${texNombre(Math.pow((100 + PourcentageAugmentation) / 100, nbAns / 2), 12)}\\\\
&${egalOuApprox(salaireInitial * Math.pow((100 + PourcentageAugmentation) / 100, nbAns / 2), 2)}${texPrix(salaireInitial * Math.pow((100 + PourcentageAugmentation) / 100, nbAns / 2))}\\\\
\\end{aligned}$<br>
Ainsi, le salaire de l'employé au bout de ${nbAns} ans sera de $${miseEnEvidence(
    texPrix(
      salaireInitial *
        Math.pow((100 + PourcentageAugmentation) / 100, nbAns / 2),
    ),
  )}$ euros.`
  const valeur1 = {
    reponse: {
      value: texNombre(
        salaireInitial *
          Math.pow((100 + PourcentageAugmentation) / 100, nbAns / 2),
        2,
      ),
    },
    bareme: troisPointsSiJuste,
  }
  const dataTemplate2 = `a) Par quel nombre faut-il multiplier chaque année le salaire de l'employé pour obtenir son nouveau salaire ? %{champ1}<br>
b) Quel sera son salaire au bout de ${nbAns} ans ? %{champ2}<br>`
  const dataOptions2 = {
    champ1: {
      texteApres: '',
      keyboard: KeyboardType.clavierDeBase,
    },
    champ2: {
      texteApres: ' euros',
      keyboard: KeyboardType.clavierDeBase,
    },
    bareme: troisPointsPour2Questions,
  }
  const valeur2 = {
    champ1: {
      value: texNombre((100 + PourcentageAugmentation) / 100, 2),
    },
    champ2: {
      value: texNombre(
        salaireInitial *
          Math.pow((100 + PourcentageAugmentation) / 100, nbAns / 2),
        2,
      ),
    },
    bareme: troisPointsPour2Questions,
  }

  const correction2 = `${numAlpha(0)} Le salaire de l'employé est multiplié chaque année par :<br>
$\\dfrac{100+${PourcentageAugmentation}}{100}=${miseEnEvidence(texNombre((100 + PourcentageAugmentation) / 100, 2))}$<br>
${numAlpha(1)} Le salaire de l'employé au bout de ${nbAns} ans sera de :<br>
$${texPrix(salaireInitial)}\\times (\\dfrac{100+${PourcentageAugmentation}}{100})^${nbAns / 2}=${texPrix(salaireInitial)}\\times ${texNombre((100 + PourcentageAugmentation) / 100, 2)}^${nbAns / 2}${egalOuApprox(salaireInitial * Math.pow((100 + PourcentageAugmentation) / 100, nbAns / 2), 2)}${miseEnEvidence(texPrix(salaireInitial * Math.pow((100 + PourcentageAugmentation) / 100, nbAns / 2)))}$ euros.<br>`

  const dataTemplate3 = `a) Au bout de deux ans, quel sera le salaire de l'employé ? %{champ1}<br>
  b) Au bout de quatre ans, quel sera le salaire de l'employé ? %{champ2}<br>
  c) Au bout de ${nbAns} ans, quel sera le salaire de l'employé ? %{champ3}<br>`
  const dataOptions3 = {
    champ1: {
      texteApres: ' euros',
      keyboard: KeyboardType.clavierDeBase,
    },
    champ2: {
      texteApres: ' euros',
      keyboard: KeyboardType.clavierDeBase,
    },
    champ3: {
      texteApres: ' euros',
      keyboard: KeyboardType.clavierDeBase,
    },
    bareme: toutAUnPoint,
  }
  const valeur3 = {
    champ1: {
      value: texNombre(
        salaireInitial * Math.pow((100 + PourcentageAugmentation) / 100, 1),
        2,
      ),
    },
    champ2: {
      value: texNombre(
        salaireInitial * Math.pow((100 + PourcentageAugmentation) / 100, 2),
        2,
      ),
    },
    champ3: {
      value: texNombre(
        salaireInitial * Math.pow((100 + PourcentageAugmentation) / 100, nbAns),
        2,
      ),
    },
  }
  const correction3 = `${numAlpha(0)} Au bout de deux ans, le salaire de l'employé sera :<br>
 $${texPrix(salaireInitial)}\\times \\dfrac{100+${PourcentageAugmentation}}{100}=${texPrix(salaireInitial)}\\times ${texNombre((100 + PourcentageAugmentation) / 100, 2)}${egalOuApprox(salaireInitial * Math.pow((100 + PourcentageAugmentation) / 100, 1), 2)}${miseEnEvidence(texPrix(salaireInitial * Math.pow((100 + PourcentageAugmentation) / 100, 1)))}$ euros.<br>
 ${numAlpha(1)} Au bout de quatre ans, le salaire de l'employé sera :<br>
 $${texPrix((salaireInitial * (100 + PourcentageAugmentation)) / 100)}\\times \\dfrac{100+${PourcentageAugmentation}}{100}=${texPrix((salaireInitial * (100 + PourcentageAugmentation)) / 100)}\\times ${texNombre((100 + PourcentageAugmentation) / 100, 2)}${egalOuApprox(salaireInitial * Math.pow((100 + PourcentageAugmentation) / 100, 2), 2)}${miseEnEvidence(texPrix(salaireInitial * Math.pow((100 + PourcentageAugmentation) / 100, 2)))}$ euros.<br>
 ${numAlpha(2)} Au bout de ${nbAns} ans, le salaire de l'employé sera :<br>
 $${texPrix(salaireInitial)}\\times (\\dfrac{100+${PourcentageAugmentation}}{100})^${nbAns / 2}=${texPrix(salaireInitial)}\\times ${texNombre(Math.pow((100 + PourcentageAugmentation) / 100, nbAns / 2), 12)}${egalOuApprox(salaireInitial * Math.pow((100 + PourcentageAugmentation) / 100, nbAns / 2), 2)}${miseEnEvidence(texPrix(salaireInitial * Math.pow((100 + PourcentageAugmentation) / 100, nbAns / 2)))}$ euros.<br>`

  return {
    enonceBase,
    questionType1,
    correctionType1,
    valeur1,
    dataTemplate2,
    dataOptions2,
    valeur2,
    correction2,
    dataTemplate3,
    dataOptions3,
    valeur3,
    correction3,
  }
}

function extinctionDePopulation(PourcentageDiminution: number, nbAns: number) {
  const populationInitiale = 300 + randint(0, 10) * 100 // Population initiale
  const enonceBase = `La population d'une espèce protégée est de $${texNombre(populationInitiale)}$ individus.<br>
  On considère qu'en raison des facteurs environnementaux, elle diminue de $${PourcentageDiminution}~\\%$ chaque année.<br>`
  const questionType1 = `Combien d'individus restera-t-il au bout de ${nbAns} ans ?`
  const correctionType1 = `La population au bout de ${nbAns} ans sera de :<br>
$\\begin{aligned}
${texNombre(populationInitiale)}\\times (\\dfrac{100-${PourcentageDiminution}}{100})^${nbAns}&=${texNombre(populationInitiale)}\\times ${texNombre((100 - PourcentageDiminution) / 100, 2)}^${nbAns}\\\\
&=${texNombre(populationInitiale)}\\times ${texNombre(Math.pow((100 - PourcentageDiminution) / 100, nbAns), 12)}\\\\
&${egalOuApprox(populationInitiale * Math.pow((100 - PourcentageDiminution) / 100, nbAns), 0)}${texNombre(populationInitiale * Math.pow((100 - PourcentageDiminution) / 100, nbAns), 0)}\\\\
\\end{aligned}$<br>
Ainsi, la population au bout de ${nbAns} ans sera de $${miseEnEvidence(
    texNombre(
      populationInitiale * Math.pow((100 - PourcentageDiminution) / 100, nbAns),
      0,
    ),
  )}$ individus.`
  const valeur1 = {
    reponse: {
      value: texNombre(
        populationInitiale *
          Math.pow((100 - PourcentageDiminution) / 100, nbAns),
        2,
      ),
    },
    bareme: troisPointsSiJuste,
  }

  const dataTemplate2 = `a) Par quel nombre faut-il multiplier chaque année la population pour obtenir la nouvelle population ? %{champ1}<br>
b) Combien d'individus restera-t-il au bout de ${nbAns} ans ? %{champ2}<br>`
  const dataOptions2 = {
    champ1: {
      texteApres: '',
      keyboard: KeyboardType.clavierDeBase,
    },
    champ2: {
      texteApres: ' individus',
      keyboard: KeyboardType.clavierDeBase,
    },
    bareme: troisPointsPour2Questions,
  }
  const valeur2 = {
    champ1: {
      value: texNombre((100 - PourcentageDiminution) / 100, 2),
    },
    champ2: {
      value: texNombre(
        populationInitiale *
          Math.pow((100 - PourcentageDiminution) / 100, nbAns),
        2,
      ),
    },
    bareme: troisPointsPour2Questions,
  }

  const correction2 = `${numAlpha(0)} La population est multipliée chaque année par :<br>
$\\dfrac{100-${PourcentageDiminution}}{100}=${miseEnEvidence(texNombre((100 - PourcentageDiminution) / 100, 0))}$<br>
${numAlpha(1)} La population au bout de ${nbAns} ans sera de :<br>
$${texNombre(populationInitiale)}\\times (\\dfrac{100-${PourcentageDiminution}}{100})^${nbAns}=${texNombre(populationInitiale)}\\times ${texNombre((100 - PourcentageDiminution) / 100, 2)}^${nbAns}${egalOuApprox(populationInitiale * Math.pow((100 - PourcentageDiminution) / 100, nbAns), 0)}${miseEnEvidence(texNombre(populationInitiale * Math.pow((100 - PourcentageDiminution) / 100, nbAns), 0))}$ individus.<br>`

  const dataTemplate3 = `a) Au bout d'un an, combien d'individus restera-t-il ? %{champ1}<br>
  b) Au bout de deux ans, combien d'individus restera-t-il ? %{champ2}<br>
  c) Au bout de ${nbAns} ans, combien d'individus restera-t-il ? %{champ3}<br>`
  const dataOptions3 = {
    champ1: {
      texteApres: ' individus',
      keyboard: KeyboardType.clavierDeBase,
    },
    champ2: {
      texteApres: ' individus',
      keyboard: KeyboardType.clavierDeBase,
    },
    champ3: {
      texteApres: ' individus',
      keyboard: KeyboardType.clavierDeBase,
    },
    bareme: toutAUnPoint,
  }
  const valeur3 = {
    champ1: {
      value: texNombre(
        populationInitiale * Math.pow((100 - PourcentageDiminution) / 100, 1),
        2,
      ),
    },
    champ2: {
      value: texNombre(
        populationInitiale * Math.pow((100 - PourcentageDiminution) / 100, 2),
        2,
      ),
    },
    champ3: {
      value: texNombre(
        populationInitiale *
          Math.pow((100 - PourcentageDiminution) / 100, nbAns),
        2,
      ),
    },
  }
  const correction3 = `${numAlpha(0)} Au bout d'un an, il restera :<br>
 $${texNombre(populationInitiale)}\\times \\dfrac{100-${PourcentageDiminution}}{100}=${texNombre(populationInitiale)}\\times ${texNombre((100 - PourcentageDiminution) / 100, 2)}${egalOuApprox(populationInitiale * Math.pow((100 - PourcentageDiminution) / 100, 1), 0)}${miseEnEvidence(texNombre(populationInitiale * Math.pow((100 - PourcentageDiminution) / 100, 1), 0))}$ individus.<br>
 ${numAlpha(1)} Au bout de deux ans, il restera :<br>
 $${texNombre((populationInitiale * (100 - PourcentageDiminution)) / 100)}\\times \\dfrac{100-${PourcentageDiminution}}{100}=${texNombre((populationInitiale * (100 - PourcentageDiminution)) / 100)}\\times ${texNombre((100 - PourcentageDiminution) / 100, 2)}${egalOuApprox(populationInitiale * Math.pow((100 - PourcentageDiminution) / 100, 2), 0)}${miseEnEvidence(texNombre(populationInitiale * Math.pow((100 - PourcentageDiminution) / 100, 2), 0))}$ individus.<br>
 ${numAlpha(2)} Au bout de ${nbAns} ans, il restera :<br>
 $${texNombre(populationInitiale * Math.pow((100 - PourcentageDiminution) / 100, nbAns))}\\times \\dfrac{100-${PourcentageDiminution}}{100}=${texNombre(populationInitiale * Math.pow((100 - PourcentageDiminution) / 100, nbAns))}\\times ${texNombre((100 - PourcentageDiminution) / 100, 2)}${egalOuApprox(populationInitiale * Math.pow((100 - PourcentageDiminution) / 100, nbAns), 0)}${miseEnEvidence(texNombre(populationInitiale * Math.pow((100 - PourcentageDiminution) / 100, nbAns), 0))}$ individus.<br>`
  return {
    enonceBase,
    questionType1,
    correctionType1,
    valeur1,
    dataTemplate2,
    dataOptions2,
    valeur2,
    correction2,
    dataTemplate3,
    dataOptions3,
    valeur3,
    correction3,
  }
}

function populationMondiale(pourcentage: number, nbAns: number) {
  const populationIntitiale = 8.3 * 10 ** 9 // Population mondiale initiale
  const enonceBase = `La population mondiale est de $${texNombre(populationIntitiale, 0)}$ individus.<br>
  On considère qu'elle augmente de $${texNombre(pourcentage, 1)}~\\%$ chaque année.<br>`
  const questionType1 = `Combien d'individus y aura-t-il au bout de ${nbAns} ans ?`
  const correctionType1 = `La population au bout de ${nbAns} ans sera de :<br>
$\\begin{aligned}
${texNombre(populationIntitiale, 0)}\\times (\\dfrac{100+${texNombre(pourcentage, 1)}}{100})^${nbAns}&=${texNombre(populationIntitiale, 0)}\\times ${texNombre((100 + pourcentage) / 100, 2)}^${nbAns}\\\\
&\\approx${texNombre(populationIntitiale, 0)}\\times ${texNombre(Math.pow((100 + pourcentage) / 100, nbAns), 3)}\\\\
&\\approx${texNombre(populationIntitiale * Math.pow((100 + pourcentage) / 100, nbAns), 0)}\\\\
\\end{aligned}$<br>
Ainsi, la population au bout de ${nbAns} ans sera de $${miseEnEvidence(
    texNombre(
      populationIntitiale * Math.pow((100 + pourcentage) / 100, nbAns),
      0,
    ),
  )}$ individus.`
  const valeur1 = {
    reponse: {
      value: texNombre(
        populationIntitiale * Math.pow((100 + pourcentage) / 100, nbAns),
        0,
      ),
    },
    bareme: troisPointsSiJuste,
  }

  const dataTemplate2 = `a) Par quel nombre faut-il multiplier chaque année la population pour obtenir la nouvelle population ? %{champ1}<br>
b) Combien d'individus y aura-t-il au bout de ${nbAns} ans ? %{champ2}<br>`
  const dataOptions2 = {
    champ1: {
      texteApres: '',
      keyboard: KeyboardType.clavierDeBase,
    },
    champ2: {
      texteApres: ' individus',
      keyboard: KeyboardType.clavierDeBase,
    },
    bareme: troisPointsPour2Questions,
  }
  const valeur2 = {
    champ1: {
      value: texNombre((100 + pourcentage) / 100, 2),
    },
    champ2: {
      value: texNombre(
        populationIntitiale * Math.pow((100 + pourcentage) / 100, nbAns),
        0,
      ),
    },
    bareme: troisPointsPour2Questions,
  }

  const correction2 = `${numAlpha(0)} La population est multipliée chaque année par :<br>
$\\dfrac{100+${texNombre(pourcentage, 1)}}{100}=${miseEnEvidence(texNombre((100 + pourcentage) / 100, 3))}$<br>
${numAlpha(1)} La population au bout de ${nbAns} ans sera de :<br>
$${texNombre(populationIntitiale, 0)}\\times (\\dfrac{100+${texNombre(pourcentage, 1)}}{100})^${nbAns}=${texNombre(populationIntitiale, 0)}\\times ${texNombre((100 + pourcentage) / 100, 2)}^${nbAns}${egalOuApprox(populationIntitiale * Math.pow((100 + pourcentage) / 100, nbAns), 0)}${miseEnEvidence(texNombre(populationIntitiale * Math.pow((100 + pourcentage) / 100, nbAns), 0))}$ individus.<br>`

  const dataTemplate3 = `a) Au bout d'un an, combien d'individus y aura-t-il ? %{champ1}<br>
  b) Au bout de deux ans, combien d'individus y aura-t-il ? %{champ2}<br>
  c) Au bout de ${nbAns} ans, combien d'individus y aura-t-il ? %{champ3}<br>`
  const dataOptions3 = {
    champ1: {
      texteApres: ' individus',
      keyboard: KeyboardType.clavierDeBase,
    },
    champ2: {
      texteApres: ' individus',
      keyboard: KeyboardType.clavierDeBase,
    },
    champ3: {
      texteApres: ' individus',
      keyboard: KeyboardType.clavierDeBase,
    },
    bareme: toutAUnPoint,
  }
  const valeur3 = {
    champ1: {
      value: texNombre(
        populationIntitiale * Math.pow((100 + pourcentage) / 100, 1),
        0,
      ),
    },
    champ2: {
      value: texNombre(
        populationIntitiale * Math.pow((100 + pourcentage) / 100, 2),
        0,
      ),
    },
    champ3: {
      value: texNombre(
        populationIntitiale * Math.pow((100 + pourcentage) / 100, nbAns),
        0,
      ),
    },
  }
  const correction3 = `${numAlpha(0)} Au bout d'un an, il y aura :<br>
 $${texNombre(populationIntitiale, 0)}\\times \\dfrac{100+${texNombre(pourcentage, 1)}}{100}=${texNombre(populationIntitiale, 0)}\\times ${texNombre((100 + pourcentage) / 100, 3)}${egalOuApprox(populationIntitiale * Math.pow((100 + pourcentage) / 100, 1), 0)}${miseEnEvidence(texNombre(populationIntitiale * Math.pow((100 + pourcentage) / 100, 1), 0))}$ individus.<br>
 ${numAlpha(1)} Au bout de deux ans, il y aura :<br>
 $${texNombre((populationIntitiale * (100 + pourcentage)) / 100, 0)}\\times \\dfrac{100+${texNombre(pourcentage, 1)}}{100}=${texNombre((populationIntitiale * (100 + pourcentage)) / 100, 0)}\\times ${texNombre((100 + pourcentage) / 100, 3)}${egalOuApprox(populationIntitiale * Math.pow((100 + pourcentage) / 100, 2), 0)}${miseEnEvidence(texNombre(populationIntitiale * Math.pow((100 + pourcentage) / 100, 2), 0))}$ individus.<br>
 ${numAlpha(2)} Au bout de ${nbAns} ans, il y aura :<br>
 $${texNombre(populationIntitiale, 0)}\\times (\\dfrac{100+${texNombre(pourcentage, 1)}}{100})^{${nbAns}}\\approx${texNombre(populationIntitiale, 0)}\\times ${texNombre(Math.pow((100 + pourcentage) / 100, nbAns), 3)}\\approx${miseEnEvidence(texNombre(populationIntitiale * Math.pow((100 + pourcentage) / 100, nbAns), 0))}$ individus.<br>`
  return {
    enonceBase,
    questionType1,
    correctionType1,
    valeur1,
    dataTemplate2,
    dataOptions2,
    valeur2,
    correction2,
    dataTemplate3,
    dataOptions3,
    valeur3,
    correction3,
  }
}
