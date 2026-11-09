import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import {
    factorielle,
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = "Compter le nombre d'anagrammes d'un mot"
export const dateDePublication = '05/02/2026'
export const interactifReady = true

export const uuid = 'bc62e'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['3mComb-1'],
}

/**
 * Permutations avec répétition - Anagrammes
 * @author Nathan Scheinmann
 */

export default class Anagrammes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Mot sans répétition (perm. sans rép.)',
        '2 : Mot avec répétition simple (perm. avec rép.)',
        '3 : Mot avec répétitions multiples (perm. avec rép.)',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.sup = '4'
  }

  nouvelleVersion() {
    this.consigne =
      "Déterminer le nombre d'anagrammes que l'on peut former avec les lettres du mot donné. On ne cherche pas de vrais mots."

    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      listeOfCase: [
        'sansRepetition',
        'repetitionSimple',
        'repetitionsMultiples',
      ],
      nbQuestions: this.nbQuestions,
      shuffle: true,
    })

    const motsSansRepetition = [
      'MATHS',
      'PRIX',
      'BRUN',
      'CLOU',
      'FLEUR',
      'CHAUD',
      'SPORT',
      'BLANC',
      'GUIDE',
      'VOTRE',
      'JEUDI',
      'MONDE',
      'PLACE',
      'ROUGE',
      'TABLE',
      'PIVOT',
      'FABLE',
      'MIXTE',
      'JUMBO',
      'PLOMB',
      'CRASH',
      'SPHINX',
      'CLOWN',
      'GLYPH',
      'CHAMP',
      'DELTA',
      'MICRO',
      'PREUX',
      'VOILA',
      'CABLE',
      'DROIT',
      'FORTE',
      'GLACE',
      'JOUET',
      'NOBLE',
      'QUAND',
      'RIVAL',
      'VERTU',
      'PIXEL',
      'RUGBY',
      'YACHT',
      'EXPAT',
      'FJORD',
    ]

    const motsRepetitionSimple = [
      { mot: 'CLASSE', repetitions: { S: 2 } },
      { mot: 'POMME', repetitions: { M: 2 } },
      { mot: 'TOMATE', repetitions: { T: 2 } },
      { mot: 'CAROTTE', repetitions: { T: 2 } },
      { mot: 'TORTUE', repetitions: { T: 2 } },
      { mot: 'CARAMEL', repetitions: { A: 2 } },
      { mot: 'ANNONCER', repetitions: { N: 3 } },
      { mot: 'INNOCENT', repetitions: { N: 3 } },
      { mot: 'CANADA', repetitions: { A: 3 } },
      { mot: 'CARAVANE', repetitions: { A: 3 } },
      { mot: 'CAMELEON', repetitions: { E: 2 } },
      { mot: 'MAHARAJA', repetitions: { A: 4 } },
    ]

    const motsRepetitionsMultiples = [
      { mot: 'GARAGE', repetitions: { G: 2, A: 2 } },
      { mot: 'BAGAGE', repetitions: { A: 2, G: 2 } },
      { mot: 'KAYAK', repetitions: { K: 2, A: 2 } },
      { mot: 'REVOLVER', repetitions: { R: 2, E: 2, V: 2 } },
      { mot: 'CHOCOLAT', repetitions: { C: 2, O: 2 } },
      { mot: 'COCORICO', repetitions: { C: 3, O: 3 } },
      { mot: 'RECOMMANDER', repetitions: { R: 2, E: 2, M: 2 } },
      { mot: 'ADDITION', repetitions: { D: 2, I: 2 } },
      { mot: 'PROGRAMME', repetitions: { R: 2, M: 2 } },
      { mot: 'GRAMMAIRE', repetitions: { A: 2, R: 2, M: 2 } },
      { mot: 'LITTERATURE', repetitions: { T: 3, E: 2, R: 2 } },
      { mot: 'PRINCESSE', repetitions: { S: 2, E: 2 } },
      { mot: 'ACCESSOIRE', repetitions: { C: 2, S: 2, E: 2 } },
      { mot: 'COMMANDANT', repetitions: { M: 2, A: 2, N: 2 } },
      { mot: 'ANANAS', repetitions: { A: 3, N: 2 } },
      { mot: 'BANANE', repetitions: { A: 2, N: 2 } },
      { mot: 'BAOBAB', repetitions: { B: 3, A: 2 } },
      { mot: 'ENTENTE', repetitions: { E: 3, N: 2, T: 2 } },
      { mot: 'ASSASSIN', repetitions: { A: 2, S: 4 } },
      { mot: 'ABRACADABRA', repetitions: { A: 5, B: 2, R: 2 } },
      { mot: 'MISSISSIPPI', repetitions: { I: 4, S: 4, P: 2 } },
      { mot: 'TENNESSEE', repetitions: { E: 4, N: 2, S: 2 } },
      { mot: 'COCCINELLE', repetitions: { C: 3, E: 2, L: 2 } },
      { mot: 'RATATOUILLE', repetitions: { A: 2, T: 2, L: 2 } },
      { mot: 'PARALLELE', repetitions: { A: 2, L: 3, E: 2 } },
      { mot: 'PAPILLON', repetitions: { P: 2, L: 2 } },
      { mot: 'CASCADES', repetitions: { C: 2, A: 2, S: 2 } },
      { mot: 'CALCAIRE', repetitions: { C: 2, A: 2 } },
      { mot: 'BARBARE', repetitions: { B: 2, A: 2, R: 2 } },
      { mot: 'SASSAFRAS', repetitions: { S: 4, A: 3 } },
      { mot: 'MAMMIFERE', repetitions: { M: 3, E: 2 } },
      { mot: 'TARATATA', repetitions: { T: 3, A: 4 } },
    ]

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let reponse = 0
      let mot = ''

      const typeQuestion = listeTypeDeQuestions[i]

      if (typeQuestion === 'sansRepetition') {
        mot = choice(motsSansRepetition)
        const n = mot.length
        reponse = factorielle(n)

        texte = `Combien d'anagrammes peut-on former avec les lettres du mot $\\text{${mot}}$ ?`

        texteCorr = `Le mot $\\text{${mot}}$ contient $${n}$ lettres toutes distinctes.<br>`
        texteCorr += `Le nombre d'anagrammes est le nombre de permutations sans répétition de ces $${n}$ lettres :<br>`
        texteCorr += `$P_{${n}} = ${n}! = ${miseEnEvidence(texNombre(reponse, 0))}$`
      } else if (typeQuestion === 'repetitionSimple') {
        const choix = choice(motsRepetitionSimple)
        mot = choix.mot
        const n = mot.length
        const reps = choix.repetitions

        let denominateur = 1
        const repEntries = Object.entries(reps)
        for (const [, count] of repEntries) {
          denominateur *= factorielle(count as number)
        }
        const denomTexte = Object.values(reps)
          .map((c) => `${c}!`)
          .join(' \\times ')
        reponse = factorielle(n) / denominateur

        texte = `Combien d'anagrammes peut-on former avec les lettres du mot $\\text{${mot}}$ ?`

        texteCorr = `Le mot $\\text{${mot}}$ contient $${n}$ lettres avec des répétitions :<br>`
        for (const [lettre, count] of repEntries) {
          texteCorr += `$\\bullet$ la lettre $\\text{${lettre}}$ apparaît $${count}$ fois<br>`
        }
        texteCorr += `Il s'agit d'une permutation avec répétition :<br>`
        texteCorr += `$\\overline{P}_{${n}}(${Object.values(reps).join(';')}) = \\dfrac{${n}!}{${denomTexte}} = \\dfrac{${texNombre(factorielle(n), 0)}}{${texNombre(denominateur, 0)}} = ${miseEnEvidence(texNombre(reponse, 0))}$`
      } else {
        const choix = choice(motsRepetitionsMultiples)
        mot = choix.mot
        const n = mot.length
        const reps = choix.repetitions

        let denominateur = 1
        const repEntries = Object.entries(reps)
        for (const [, count] of repEntries) {
          denominateur *= factorielle(count as number)
        }
        const denomTexte = Object.values(reps)
          .map((c) => `${c}!`)
          .join(' \\times ')
        reponse = factorielle(n) / denominateur

        texte = `Combien d'anagrammes peut-on former avec les lettres du mot $\\text{${mot}}$ ?`

        texteCorr = `Le mot $\\text{${mot}}$ contient $${n}$ lettres avec des répétitions :<br>`
        for (const [lettre, count] of repEntries) {
          texteCorr += `$\\bullet$ la lettre $\\text{${lettre}}$ apparaît $${count}$ fois<br>`
        }
        texteCorr += `Il s'agit d'une permutation avec répétition :<br>`
        texteCorr += `$\\overline{P}_{${n}}(${Object.values(reps).join(';')}) = \\dfrac{${n}!}{${denomTexte}} = \\dfrac{${texNombre(factorielle(n), 0)}}{${texNombre(denominateur, 0)}} = ${miseEnEvidence(texNombre(reponse, 0))}$`
      }

      if (this.interactif) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
          texteAvant: '<br>',
        })
        handleAnswers(this, i, {
          reponse: { value: reponse.toString() },
        })
      }

      if (this.questionJamaisPosee(i, mot)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
