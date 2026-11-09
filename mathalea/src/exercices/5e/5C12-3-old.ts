import type { MathfieldElement } from 'mathlive'
import { amcConvert } from '../../lib/amc/amcBuilders'
import ce from '../../lib/interactif/comparisonFunctions'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre, sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Utiliser la distributivité pour du calcul mental'
export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDePublication = '26/11/2022'
export const dateDeModifImportante = '25/01/2026'

/**
 * Distributivité numérique
 * @author Sébastien LOZANO
 * Modif EE : Passage en interactif donc passage en TS
 * Modif OM : variables didactiques : choix du facteur commun et du nombre ajouté ou retiré
 */
export const uuid = '3b474'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

class DistributiviteNumeriqueOld extends Exercice {
  rep1: number[] = []
  rep2: number[] = []
  rep3: number[] = []
  rep4: number[] = []
  rep5: number[] = []
  typeQuestion: (1 | 2)[] = []
  exoCustomResultat: boolean
  constructor() {
    super()
    this.exoCustomResultat = true
    this.nbQuestions = 4 // Ici le nombre de questions
    this.sup = 3
    this.besoinFormulaireNumerique = [
      'Type des questions',
      3,
      '1 : Sous forme développée\n2 : Sous forme factorisée\n3 : Mélange',
    ]
    this.besoinFormulaire2Texte = [
      'Nombre ajouté ou retiré',
      'Nombres entre 1 et 3 séparés par des tirets, 4 pour mélange',
    ]
    this.sup2 = '4'
    this.besoinFormulaire3Texte = [
      'Choix du facteur',
      [
        'Nombres séparés par des tirets  :',
        '1 : Entre 16 et 46',
        '2 : Entre 47 et 65',
        '3 : Entre 66 et 83',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.sup3 = '2-3'
  }

  nouvelleVersion() {
    this.listeAvecNumerotation = false
    const typesDeQuestionsDisponibles =
      this.sup === 3 ? [1, 2, 3, 4] : this.sup === 2 ? [3, 4] : [1, 2]
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    const ajoutRetrait = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    const facteurCommun = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    this.consigne =
      'Utiliser la distributivité pour calculer de façon astucieuse '
    const consigneAMC = this.consigne + "l'expression suivante : "
    this.consigne +=
      this.nbQuestions === 1
        ? "l'expression suivante."
        : 'les expressions suivantes.'

    // Quelques fonctions pour factoriser le code
    function avecLesPriorites(
      i: number,
      k: number,
      b: number,
      c: number,
      formeInitiale: string,
      operation: number,
    ) {
      let sortie: [string, number, number, number, number, number] = [
        '',
        0,
        0,
        0,
        0,
        0,
      ]
      if (formeInitiale === 'factorisee') {
        sortie = [
          `
        $\\textbf{Ici, il est plus judicieux de distribuer d'abord :}$<br>
        $${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(String(k))}\\times ${operation === 1 ? texNombre(b + c, 0) : texNombre(b - c, 0)}$<br>
        $${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(String(k))}\\times (${texNombre(b, 0)} ${operation === 1 ? `+ ${texNombre(c, 0)}` : `- ${texNombre(c, 0)}`})$<br>
        $${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(String(k))}\\times ${texNombre(b, 0)} ${operation === 1 ? '+' : '-'} ${miseEnEvidence(String(k))}\\times ${texNombre(c, 0)}$<br>
        $${lettreDepuisChiffre(i + 1)}=${texNombre(k * b, 0)} ${operation === 1 ? '+' : '-'} ${texNombre(k * c, 0)}$<br>
        $${lettreDepuisChiffre(i + 1)}=${operation === 1 ? texNombre(k * b + k * c, 0) : texNombre(k * b - k * c, 0)}$
        `,
          b,
          c,
          k * b,
          k * c,
          operation === 1 ? k * b + k * c : k * b - k * c,
        ]
      } else {
        sortie = [
          `
        $\\textbf{Ici, il est plus judicieux de factoriser d'abord :}$<br>
        $${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(String(k))}\\times ${texNombre(b, 0)} ${operation === 1 ? '+' : '-'} ${miseEnEvidence(String(k))}\\times ${texNombre(c, 0)}$<br>
        $${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(String(k))}\\times (${texNombre(b, 0)} ${operation === 1 ? `+ ${texNombre(c, 0)}` : `- ${texNombre(c, 0)}`})$<br>
        $${lettreDepuisChiffre(i + 1)}=${miseEnEvidence(String(k))}\\times ${operation === 1 ? texNombre(b + c, 0) : texNombre(b - c, 0)}$<br>
        $${lettreDepuisChiffre(i + 1)}=${operation === 1 ? texNombre(k * (b + c), 0) : texNombre(k * (b - c), 0)}$
        `,
          b,
          c,
          operation === 1 ? b + c : b - c,
          operation === 1 ? k * (b + c) : k * (b - c),
          0,
        ]
      }
      return sortie
    }

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texte = '' // Nous utilisons souvent cette variable pour construire le texte de la question.
      let texteCorr = '' // Idem pour le texte de la correction.
      // Choix des paramètres aléatoires
      let k = 0
      let b
      let cinqChamps: boolean = false
      let correctionTableau: [string, number, number, number, number, number] =
        ['', 0, 0, 0, 0, 0]
      const puissance = choice([100, 1000])
      switch (facteurCommun[i]) {
        case 1:
          k = randint(16, 46)
          break
        case 2:
          k = randint(47, 65)
          break
        case 3:
          k = randint(66, 83)
          break
        default:
          k = randint(47, 83)
          break
      }
      // const ajoutRetrait = randint(1, 3) // OM : remplacé par formulaire
      const c = ajoutRetrait[i]
      switch (
        listeTypeDeQuestions[i] // Chaque question peut être d'un type différent, ici 4 cas sont prévus...
      ) {
        case 1: {
          // Calcul mental addition developpée initialement
          b = puissance - c // puissance[choixIndicePuissance] - c
          texte = `$${lettreDepuisChiffre(i + 1)}=${k}\\times ${texNombre(b, 0)} + ${k}\\times ${c}$`
          correctionTableau = avecLesPriorites(i, k, b, c, 'developpee', 1)
          cinqChamps = false
          this.typeQuestion[i] = 2
          break
        }
        case 2: {
          // Calcul mental soustraction  developpée initialement
          b = puissance + c // puissance[choixIndicePuissance] + c
          texte = `$${lettreDepuisChiffre(i + 1)}=${k}\\times ${texNombre(b, 0)} - ${k}\\times ${c}$`
          correctionTableau = avecLesPriorites(i, k, b, c, 'developpee', -1)
          cinqChamps = false
          this.typeQuestion[i] = 2
          break
        }
        case 3: {
          // Calcul mental addition factorisée initialement
          b = puissance - c // puissance[choixIndicePuissance] - c
          texte = `$${lettreDepuisChiffre(i + 1)}=${k}\\times ${texNombre(b + 2 * c, 0)}$`
          correctionTableau = avecLesPriorites(i, k, b + c, c, 'factorisee', 1)
          cinqChamps = true
          this.typeQuestion[i] = 1
          break
        }
        case 4: {
          // Calcul mental soustraction factorisée initialement
          b = puissance + c // puissance[choixIndicePuissance] + c
          texte = `$${lettreDepuisChiffre(i + 1)}=${k}\\times ${texNombre(b - 2 * c, 0)}$`
          correctionTableau = avecLesPriorites(i, k, b - c, c, 'factorisee', -1)
          cinqChamps = true
          this.typeQuestion[i] = 1
          break
        }
      }
      texteCorr += correctionTableau[0]
      this.rep1[i] = correctionTableau[1]
      this.rep2[i] = correctionTableau[2]
      this.rep3[i] = correctionTableau[3]
      this.rep4[i] = correctionTableau[4]
      this.rep5[i] = correctionTableau[5]
      if (this.interactif) {
        if (cinqChamps) {
          const code =
            sp(2) +
            remplisLesBlancs(
              this,
              i,
              `= ${texNombre(k, 0)} \\times %{champ1} ${listeTypeDeQuestions[i] % 2 === 1 ? '+' : '-'} ${texNombre(k, 0)} \\times %{champ2} = %{champ3} ${listeTypeDeQuestions[i] % 2 === 1 ? '+' : '-'} %{champ4} = %{champ5}`,
              'ml-2',
            )
          texte += code
        } else {
          const code =
            sp(2) +
            remplisLesBlancs(
              this,
              i,
              ` = ${texNombre(k, 0)} \\times (%{champ1} ${listeTypeDeQuestions[i] % 2 === 1 ? '+' : '-'} %{champ2}) = ${texNombre(k, 0)} \\times %{champ3} = %{champ4}`,
              'ml-2',
            )
          texte += code
        }
      }

      if (this.questionJamaisPosee(i, k, c)) {
        // Si la question n'a jamais été posée, on la stocke dans la liste des questions
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: '',
            enonceAvant: true,
            propositions: [
              {
                type: 'AMCOpen',
                propositions: [
                  {
                    enonce: consigneAMC + texte + '<br>',
                    texte: texteCorr,
                    statut: 3,
                    pointilles: false,
                    multicolsBegin: true,
                  },
                ],
              },
              {
                type: 'AMCNum',
                propositions: [
                  {
                    texte: '',
                    statut: '',
                    multicolsEnd: true,
                    reponse: {
                      texte:
                        'Détailler les calculs dans le cadre de gauche et donner le résultat ci-dessous.',
                      valeur: cinqChamps
                        ? [correctionTableau[5]]
                        : [correctionTableau[4]],
                      param: {
                        digits: 1,
                        decimals: 0,
                        signe: false,
                        approx: 0,
                      },
                    },
                  },
                ],
              },
            ],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }

  correctionInteractive = (i?: number) => {
    if (i === undefined) return ''
    if (this.answers === undefined) this.answers = {}
    const result: ('OK' | 'KO')[] = []
    const mf = document.querySelector(
      `#champTexteEx${this.numeroExercice}Q${i}`,
    ) as MathfieldElement
    this.answers[`Ex${this.numeroExercice}Q${i}`] = mf.getValue()
    // C'est dommage d'utiliser ce divFeedback pour y mettre juste un smiley !
    const spanResultatCheck = document.querySelector(
      `span#resultatCheckEx${this.numeroExercice}Q${i}`,
    ) as HTMLDivElement
    const test1 = ce
      .parse(mf.getPromptValue('champ1'))
      .isSame(ce.parse(`${this.rep1[i]}`))
    const test2 = ce
      .parse(mf.getPromptValue('champ2'))
      .isSame(ce.parse(`${this.rep2[i]}`))
    const test3 = ce
      .parse(mf.getPromptValue('champ3'))
      .isSame(ce.parse(`${this.rep3[i]}`))
    const test4 = ce
      .parse(mf.getPromptValue('champ4'))
      .isSame(ce.parse(`${this.rep4[i]}`))
    mf.setPromptState('champ1', test1 ? 'correct' : 'incorrect', true)
    mf.setPromptState('champ2', test2 ? 'correct' : 'incorrect', true)
    mf.setPromptState('champ3', test3 ? 'correct' : 'incorrect', true)
    mf.setPromptState('champ4', test4 ? 'correct' : 'incorrect', true)
    if (this.typeQuestion[i] === 1) {
      const test5 = ce
        .parse(mf.getPromptValue('champ5'))
        .isSame(ce.parse(`${this.rep5[i]}`))
      mf.setPromptState('champ5', test5 ? 'correct' : 'incorrect', true)
      if (test1 && test2 && test3 && test4 && test5) {
        // question à 5 champs test5 est pour la réponse finale
        result.push('OK')
        if (spanResultatCheck) spanResultatCheck.innerHTML = '😎'
      } else {
        result.push('KO')
        if (spanResultatCheck) spanResultatCheck.innerHTML = '☹️'
      }
      if (test5) {
        result.push('OK')
      } else {
        result.push('KO')
      }
    } else {
      // question à 4 champs test4 est pour la réponse final
      if (test1 && test2 && test3 && test4) {
        result.push('OK')
        if (spanResultatCheck) spanResultatCheck.innerHTML = '😎'
      } else {
        result.push('KO')
        if (spanResultatCheck) spanResultatCheck.innerHTML = '☹️'
      }
      if (test4) {
        result.push('OK')
      } else {
        result.push('KO')
      }
    }
    return result
  }
}

export default DistributiviteNumeriqueOld
