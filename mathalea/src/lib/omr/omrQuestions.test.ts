import { describe, expect, it } from 'vitest'
import {
  colonnesDepuisBloc,
  colonnesNumeriques,
  exercicesDepuisExercices,
  identifiantQuestion,
  questionsDepuisExercice,
  questionsDepuisExercices,
  type ExercicePourOmr,
} from './omrQuestions'

describe('colonnesNumeriques', () => {
  it('donne une colonne par chiffre attendu, pas une de plus', () => {
    const colonnes = colonnesNumeriques('125')
    expect(colonnes).toHaveLength(3)
    expect(colonnes.map((c) => c.attendu)).toEqual(['1', '2', '5'])
    expect(colonnes[0].valeurs).toHaveLength(10)
  })

  it('ajoute une colonne de signe seulement si la réponse est négative', () => {
    expect(colonnesNumeriques('42')[0].attendu).toBe('4')
    const negatif = colonnesNumeriques('-42')
    expect(negatif[0]).toMatchObject({ attendu: '-', valeurs: ['+', '-'] })
    expect(negatif).toHaveLength(3)
  })

  it('ignore la virgule d’un décimal, dont la position est imprimée', () => {
    expect(colonnesNumeriques('3,14').map((c) => c.attendu)).toEqual([
      '3',
      '1',
      '4',
    ])
  })

  it('ne produit aucune colonne pour une réponse sans chiffre', () => {
    expect(colonnesNumeriques('abc')).toHaveLength(0)
  })
})

describe('questionsDepuisExercice', () => {
  it('reconnaît un QCM à choix unique', () => {
    const exercice: ExercicePourOmr = {
      listeQuestions: ['Combien font 3 × 4 ?'],
      autoCorrection: [
        {
          propositions: [
            { texte: '12', statut: true },
            { texte: '7', statut: false },
          ],
        },
      ],
    }
    const [question] = questionsDepuisExercice(exercice, 0)
    expect(question).toMatchObject({ qid: 'e0q0', type: 'qcmMono', points: 1 })
    expect(question.type === 'qcmMono' && question.propositions).toHaveLength(2)
  })

  it('bascule en choix multiples dès qu’il y a deux bonnes réponses', () => {
    const exercice: ExercicePourOmr = {
      listeQuestions: ['Lesquels sont pairs ?'],
      autoCorrection: [
        {
          propositions: [
            { texte: '2', statut: true },
            { texte: '4', statut: true },
            { texte: '3', statut: false },
          ],
        },
      ],
    }
    expect(questionsDepuisExercice(exercice, 0)[0].type).toBe('qcmMult')
  })

  it('respecte un amcType « qcmMult » même avec une seule bonne réponse', () => {
    const exercice: ExercicePourOmr = {
      amcType: 'qcmMult',
      listeQuestions: ['Lesquels sont pairs ?'],
      autoCorrection: [
        {
          propositions: [
            { texte: '2', statut: true },
            { texte: '3', statut: false },
          ],
        },
      ],
    }
    expect(questionsDepuisExercice(exercice, 0)[0].type).toBe('qcmMult')
  })

  it('construit une grille de chiffres depuis une réponse numérique', () => {
    const exercice: ExercicePourOmr = {
      listeQuestions: ['Calculez 57 + 68.'],
      autoCorrection: [{ reponse: { valeur: '125' } }],
    }
    const [question] = questionsDepuisExercice(exercice, 1)
    expect(question).toMatchObject({ qid: 'e1q0', type: 'AMCNum' })
    expect(question.type === 'AMCNum' && question.colonnes).toHaveLength(3)
  })

  it('écarte une question sans structure de réponse exploitable', () => {
    // imprimer une question sans case produirait une note impossible à lire
    const exercice: ExercicePourOmr = {
      listeQuestions: ['Rédigez.'],
      autoCorrection: [{}],
    }
    expect(questionsDepuisExercice(exercice, 0)).toHaveLength(0)
  })

  it('garde les questions ouvertes quand l’exercice est déclaré AMCOpen', () => {
    const exercice: ExercicePourOmr = {
      amcType: 'AMCOpen',
      listeQuestions: ['Rédigez.'],
      autoCorrection: [{}],
      pointsParQuestion: 4,
    }
    const [question] = questionsDepuisExercice(exercice, 0)
    expect(question).toMatchObject({ type: 'AMCOpen', points: 4 })
  })

  it('numérote les questions par exercice, sans collision', () => {
    const qcm = {
      propositions: [
        { texte: 'a', statut: true },
        { texte: 'b', statut: false },
      ],
    }
    const questions = questionsDepuisExercices([
      { listeQuestions: ['A', 'B'], autoCorrection: [qcm, qcm] },
      { listeQuestions: ['C'], autoCorrection: [qcm] },
    ])
    expect(questions.map((q) => q.qid)).toEqual(['e0q0', 'e0q1', 'e1q0'])
    expect(new Set(questions.map((q) => q.qid)).size).toBe(3)
  })

  it('compose des identifiants stables', () => {
    expect(identifiantQuestion(2, 5)).toBe('e2q5')
  })
})

describe('exercicesDepuisExercices', () => {
  const qcm = {
    propositions: [
      { texte: 'a', statut: true },
      { texte: 'b', statut: false },
    ],
  }

  it('garde le groupement, l’unité que règle la palette de l’aperçu', () => {
    const exercices = exercicesDepuisExercices([
      {
        titre: 'Calculs',
        listeQuestions: ['A', 'B'],
        autoCorrection: [qcm, qcm],
      },
      { titre: 'Fractions', listeQuestions: ['C'], autoCorrection: [qcm] },
    ])
    expect(exercices.map((e) => e.titre)).toEqual(['Calculs', 'Fractions'])
    expect(exercices.map((e) => e.questions.length)).toEqual([2, 1])
  })

  it('écarte un exercice dont aucune question n’a de cases', () => {
    // imprimer son titre seul laisserait un exercice sans rien à noircir
    const exercices = exercicesDepuisExercices([
      { titre: 'Sans cases', listeQuestions: ['A'], autoCorrection: [{}] },
      { titre: 'Avec cases', listeQuestions: ['B'], autoCorrection: [qcm] },
    ])
    expect(exercices.map((e) => e.titre)).toEqual(['Avec cases'])
  })
})

describe('colonnesDepuisBloc', () => {
  it('imprime la virgule d’un décimal entre ses colonnes', () => {
    const colonnes = colonnesDepuisBloc({
      value: 12.5,
      digits: 3,
      decimals: 1,
      sign: false,
    })
    expect(colonnes.map((c) => c.attendu)).toEqual(['1', '2', '5'])
    expect(colonnes.map((c) => c.separateurAvant)).toEqual([
      undefined,
      undefined,
      ',',
    ])
  })

  it('complète les colonnes annoncées par des zéros', () => {
    const colonnes = colonnesDepuisBloc({
      value: 7,
      digits: 3,
      decimals: 0,
      sign: false,
    })
    expect(colonnes.map((c) => c.attendu)).toEqual(['0', '0', '7'])
  })

  it('donne un chiffre à gauche de la virgule, même à un nombre plus petit que 1', () => {
    const colonnes = colonnesDepuisBloc({
      value: 0.5,
      digits: 1,
      decimals: 1,
      sign: false,
    })
    expect(colonnes.map((c) => c.attendu)).toEqual(['0', '5'])
  })

  it('ouvre une colonne de signe dès qu’AMC en demande une', () => {
    // une réponse positive garde sa case : c'est à l'élève de la noircir
    const colonnes = colonnesDepuisBloc({
      value: 42,
      digits: 2,
      decimals: 0,
      sign: true,
    })
    expect(colonnes[0]).toMatchObject({ attendu: '+', valeurs: ['+', '-'] })
    expect(
      colonnesDepuisBloc({
        value: -42,
        digits: 2,
        decimals: 0,
        sign: true,
      })[0].attendu,
    ).toBe('-')
  })

  it('sépare le numérateur du dénominateur d’une fraction', () => {
    const colonnes = colonnesDepuisBloc({
      value: 3.4,
      digits: 2,
      decimals: 1,
      sign: false,
      options: { Tpoint: '\\vspace{0.5cm} \\vrule height 0.4pt width 5.5cm ' },
    })
    expect(colonnes.map((c) => c.separateurAvant)).toEqual([undefined, '/'])
  })
})

describe('structure venue de l’inférence AMC', () => {
  it('dimensionne les cases avec les paramètres d’AMC', () => {
    // « 2,50 » demande quatre colonnes, pas les deux que donnerait « 2.5 »
    const exercice: ExercicePourOmr = {
      amcType: 'AMCNum',
      listeQuestions: ['Combien coûte le stylo ?'],
      autoCorrectionAMC: [
        { reponse: { valeur: 2.5, param: { digits: 3, decimals: 2 } } },
      ],
    }
    const [question] = questionsDepuisExercice(exercice, 0)
    expect(question.type).toBe('AMCNum')
    expect(
      question.type === 'AMCNum' && question.colonnes.map((c) => c.attendu),
    ).toEqual(['2', '5', '0'])
  })

  it('découpe un AMCHybride en une question à cases par bloc', () => {
    const exercice: ExercicePourOmr = {
      amcType: 'AMCHybride',
      listeQuestions: ['Mesurer puis conclure.'],
      listeCorrections: ['La longueur vaut 12 cm.'],
      autoCorrectionAMC: [
        {
          enonce: 'Mesurer puis conclure.',
          propositions: [
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  reponse: { texte: 'Réponse 1', valeur: 12, param: {} },
                },
              ],
            },
            {
              type: 'qcmMono',
              enonce: 'Le triangle est-il rectangle ?',
              propositions: [
                { texte: 'oui', statut: true },
                { texte: 'non', statut: false },
              ],
            },
          ],
        },
      ],
    }
    const questions = questionsDepuisExercice(exercice, 0)
    expect(questions.map((q) => q.type)).toEqual(['AMCNum', 'qcmMono'])
    expect(questions.map((q) => q.qid)).toEqual(['e0q0b0', 'e0q0b1'])
  })

  it('préfère la structure AMC à la reconnaissance historique', () => {
    // le moteur interactif ne montre qu'un champ de saisie ; c'est l'inférence
    // qui sait qu'il attend un nombre à deux chiffres
    const exercice: ExercicePourOmr = {
      amcType: 'AMCNum',
      listeQuestions: ['10 + 14 = ?'],
      autoCorrection: [
        {
          formatInteractif: 'fill-in-the-blank',
          valeur: { champ1: { value: '24' } },
        },
      ],
      autoCorrectionAMC: [{ reponse: { valeur: 24, param: {} } }],
    }
    const [question] = questionsDepuisExercice(exercice, 0)
    expect(question.type === 'AMCNum' && question.colonnes).toHaveLength(2)
  })
})

describe('plusieurs réponses sous un même énoncé', () => {
  const deuxReponses = {
    amcType: 'AMCNum',
    autoCorrectionAMC: [
      { reponse: { valeur: 7, param: {} } },
      { reponse: { valeur: 9, param: {} } },
    ],
  }

  it('rend à chaque réponse sa sous-question', () => {
    const exercice: ExercicePourOmr = {
      ...deuxReponses,
      listeQuestions: [
        'Compléter.<br><span style="font-weight:bold">a)&nbsp;</span>3 + 4 = ?<br><span style="font-weight:bold">b)&nbsp;</span>4 + 5 = ?',
      ],
    }
    const questions = questionsDepuisExercice(exercice, 0)
    expect(questions.map((q) => q.qid)).toEqual(['e0q0b0', 'e0q0b1'])
    expect(questions[0].enonce).toContain('Compléter')
    expect(questions[0].enonce).toContain('3 + 4')
    expect(questions[1].enonce).toContain('4 + 5')
    expect(questions[1].enonce).not.toContain('Compléter')
  })

  it('numérote les réponses d’un énoncé qu’on ne sait pas découper', () => {
    const exercice: ExercicePourOmr = {
      ...deuxReponses,
      listeQuestions: ['Calculer 3 + 4 puis 4 + 5.'],
    }
    const questions = questionsDepuisExercice(exercice, 0)
    expect(questions).toHaveLength(2)
    expect(questions[0].enonce).toContain('Calculer')
    expect(questions[1].enonce).toContain('Réponse 2')
  })

  it('écarte un énoncé resté peuplé de composants interactifs', () => {
    // il porte les sous-questions et les champs de l'élève : l'imprimer
    // donnerait une copie illisible
    const exercice: ExercicePourOmr = {
      ...deuxReponses,
      listeQuestions: [
        'Compléter le tableau.<tableau-mathlive id="t1"></tableau-mathlive>',
      ],
    }
    expect(questionsDepuisExercice(exercice, 0)).toHaveLength(0)
  })
})

describe('repli en question ouverte', () => {
  it('imprime l’énoncé et ses cases de barème quand le type ne donne rien', () => {
    // quelques exercices n'ont de structure AMC qu'en contexte AMC : les
    // perdre les ferait disparaître de l'évaluation
    const exercice: ExercicePourOmr = {
      amcType: 'AMCHybride',
      listeQuestions: ['Démontrer que le triangle est rectangle.'],
      autoCorrection: [{}],
      pointsParQuestion: 3,
    }
    const [question] = questionsDepuisExercice(exercice, 0)
    expect(question).toMatchObject({ type: 'AMCOpen', points: 3 })
  })

  it('n’invente rien pour un exercice dont le type n’a pas été inféré', () => {
    const exercice: ExercicePourOmr = {
      listeQuestions: ['Rédigez.'],
      autoCorrection: [{}],
    }
    expect(questionsDepuisExercice(exercice, 0)).toHaveLength(0)
  })
})


describe('réponse courte explicite en OMR', () => {
  it('la convertit sans modifier la correction complète', () => {
    const questions = questionsDepuisExercice({
      amcType: 'AMCOpen',
      listeQuestions: ['Calculer.'],
      listeCorrections: ['Calcul détaillé.'],
      listeReponsesCourtes: ['$42$'],
    }, 0)
    expect(questions[0].correction).toBe('Calcul détaillé.')
    expect(questions[0].correctionMinimale).toBe('$42$')
  })
})
