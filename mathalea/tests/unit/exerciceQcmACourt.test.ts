import { describe, expect, it } from 'vitest'
import ConvertirCelsius from '../../src/exercices/1e/1A-C12-2'
import CentresEtrangersSpe from '../../src/exercices/1e/1A-A01-3'
import CentresEtrangersSpeAncienne from '../../src/exercices/1e/1A-A01-3-old'
import CentresEtrangersNonSpe from '../../src/exercices/1e/1A-A01-4'
import CentresEtrangersNonSpeAncienne from '../../src/exercices/1e/1A-A01-4-old'
import CentresEtrangersTechno from '../../src/exercices/1e/1A-A01-5'
import CentresEtrangersTechnoAncienne from '../../src/exercices/1e/1A-A01-5-old'
import FranceMetroSpe from '../../src/exercices/1e/1A-A01-6'
import FranceMetroSpeAncienne from '../../src/exercices/1e/1A-A01-6-old'
import FranceMetroNonSpe from '../../src/exercices/1e/1A-A01-7'
import FranceMetroNonSpeAncienne from '../../src/exercices/1e/1A-A01-7-old'
import FranceMetroTechno from '../../src/exercices/1e/1A-A01-8'
import FranceMetroTechnoAncienne from '../../src/exercices/1e/1A-A01-8-old'
import AntillesGuyaneSpe from '../../src/exercices/1e/1A-A01-9'
import AntillesGuyaneSpeAncienne from '../../src/exercices/1e/1A-A01-9-old'
import AntillesGuyaneNonSpe from '../../src/exercices/1e/1A-A01-10'
import AntillesGuyaneNonSpeAncienne from '../../src/exercices/1e/1A-A01-10-old'
import AntillesGuyaneTechno from '../../src/exercices/1e/1A-A01-11'
import AntillesGuyaneTechnoAncienne from '../../src/exercices/1e/1A-A01-11-old'
import AmeriqueNordSpe from '../../src/exercices/1e/1A-A01-1'
import AmeriqueNordSpeAncienne from '../../src/exercices/1e/1A-A01-1-old'
import AmeriqueNordNonSpe from '../../src/exercices/1e/1A-A01-2'
import AmeriqueNordNonSpeAncienne from '../../src/exercices/1e/1A-A01-2-old'
import PolynesieSpeComposition from '../../src/exercices/1e/1A-A01-12'
import PolynesieSpeCompositionAncienne from '../../src/exercices/1e/1A-A01-12-old'
import PolynesieSpecifiqueComposition from '../../src/exercices/1e/1A-A01-13'
import PolynesieSpecifiqueCompositionAncienne from '../../src/exercices/1e/1A-A01-13-old'
import PolynesieTechnoComposition from '../../src/exercices/1e/1A-A01-14'
import PolynesieTechnoCompositionAncienne from '../../src/exercices/1e/1A-A01-14-old'
import CalculerF from '../../src/exercices/1e/1A-C12-1'
import ExprimerVariable from '../../src/exercices/1e/1A-C11-2'
import SigneAffine from '../../src/exercices/1e/1A-C14-1'
import SigneProduit from '../../src/exercices/1e/1A-C14-2'
import FonctionDepuisSignes from '../../src/exercices/1e/1A-C14-3'
import FonctionDepuisDonnees from '../../src/exercices/1e/1A-C14-5'
import ResoudreInequation from '../../src/exercices/1e/1A-C14-4'
import FractionCredit from '../../src/exercices/1e/1A-C15-2'
import CalculFacture from '../../src/exercices/1e/1A-C15-4'
import MasseHuile from '../../src/exercices/1e/1A-C15-9'

describe('Automatismes avec saisie courte et Version QCM', () => {
  it('attend un nombre sans unité par défaut pour une conversion', () => {
    const exercice = new ConvertirCelsius()
    exercice.interactif = true
    exercice.nouvelleVersion()

    expect(exercice.autoCorrection[0].formatInteractif).toBe(
      'mathalea-mathfield',
    )
    expect(exercice.autoCorrection[0].valeur).toBeDefined()
    expect(JSON.stringify(exercice.autoCorrection[0].valeur)).not.toContain(
      'circ',
    )
    expect(exercice.listeQuestions[0]).toContain('mathalea-mathfield')
    expect(exercice.listeQuestions[0]).not.toContain('qcmMult')
  })

  it('conserve le QCM en option', () => {
    const exercice = new ConvertirCelsius()
    exercice.sup3 = true
    exercice.interactif = true
    exercice.nouvelleVersion()

    expect(exercice.autoCorrection[0].formatInteractif).toBe('mathalea-qcm')
    expect(exercice.autoCorrection[0].propositions?.length).toBe(4)
    expect(exercice.listeQuestions[0]).toContain(
      'Calculer la température correspondante',
    )
  })

  it.each([SigneAffine, SigneProduit])(
    'demande de compléter un tableau de signes',
    (ClasseExercice) => {
      const exercice = new ClasseExercice()
      exercice.interactif = true
      exercice.nouvelleVersion()

      expect(exercice.listeQuestions[0]).toContain(
        'Déterminer le tableau de signes de $f$.',
      )
      expect(exercice.autoCorrection[0].formatInteractif).toBe(
        'tableau-signes-variations',
      )
      expect(exercice.autoCorrection[0].valeur?.bareme?.([1, 1, 1])).toEqual([
        1, 1,
      ])
    },
  )

  it('accepte toute fonction affine vérifiant les données sur le signe', () => {
    const exercice = new FonctionDepuisDonnees()
    exercice.interactif = true
    exercice.nouvelleVersion()

    expect(exercice.listeQuestions[0]).toContain('vérifiant ces conditions')
    expect(exercice.autoCorrection[0].valeur?.reponse?.compare).toBeDefined()
    expect(exercice.listeQuestions[0]).not.toContain(
      'Parmi les quatre expressions',
    )
    expect(exercice.autoCorrection[0].formatInteractif).toBe(
      'mathalea-mathfield',
    )
  })

  it('accepte toute fonction affine ayant le tableau de signes donné', () => {
    const exercice = new FonctionDepuisSignes()
    exercice.interactif = true
    exercice.nouvelleVersion()

    expect(exercice.listeQuestions[0]).toContain('ayant ce tableau de signes')
    expect(exercice.listeQuestions[0]).not.toContain(
      'Parmi les quatre expressions',
    )
    expect(exercice.autoCorrection[0].formatInteractif).toBe(
      'mathalea-mathfield',
    )

    expect(exercice.autoCorrection[0].valeur?.reponse?.compare).toBeDefined()
  })

  it('formule les consignes de calcul et de réponse courte à l’infinitif', () => {
    const calculerF = new CalculerF()
    calculerF.nouvelleVersion()
    expect(calculerF.question).toContain('Calculer la valeur de $F$ lorsque')

    const conversion = new ConvertirCelsius()
    conversion.nouvelleVersion()
    expect(conversion.listeQuestions[0]).toContain(
      'Calculer la température correspondante',
    )

    const expressions = new ExprimerVariable()
    expressions.nouvelleVersion()
    expect(expressions.listeQuestions[0]).toContain('Exprimer')
    expect(expressions.listeQuestions[0]).not.toContain('Une expression de')

    const inequation = new ResoudreInequation()
    inequation.nouvelleVersion()
    expect(inequation.listeQuestions[0]).toContain(
      "Déterminer l'ensemble des solutions",
    )

    const credit = new FractionCredit()
    credit.nouvelleVersion()
    expect(credit.listeQuestions[0]).toContain('Déterminer la part du crédit')

    const facture = new CalculFacture()
    facture.interactif = true
    facture.nouvelleVersion()
    expect(facture.listeQuestions[0]).toContain(
      "Déterminer $a$ sous forme d'un calcul qu'on ne demande pas d'effectuer.",
    )
    expect(facture.listeQuestions[0]).toContain('$a =$')

    const huile = new MasseHuile()
    huile.nouvelleVersion()
    expect(huile.listeQuestions[0]).toContain('Calculer la masse')
  })

  it('affiche l’unité après le champ de réponse pour la masse d’huile', () => {
    const huile = new MasseHuile()
    huile.interactif = true
    huile.nouvelleVersion()

    const question = document.createElement('div')
    question.innerHTML = huile.listeQuestions[0]
    const champ = question.querySelector('mathalea-mathfield')

    expect(champ).not.toBeNull()
    expect(huile.texteApresReponseCourte?.trim()).toMatch(/^k?g$/)
    expect(champ?.nextElementSibling?.textContent?.trim()).toBe(
      huile.texteApresReponseCourte?.trim(),
    )
  })
})

describe('Composition 1A-A01-3 : questions en saisie libre ou en QCM', () => {
  const genere = (
    Classe: typeof CentresEtrangersSpe,
    options: { versionQcm?: boolean } = {},
  ) => {
    const exercice = new Classe()
    exercice.seed = 'abcd'
    exercice.interactif = true
    exercice.numeroExercice = 0
    if (options.versionQcm !== undefined) exercice.sup4 = options.versionQcm
    exercice.nouvelleVersionWrapper(0)
    return exercice.listeQuestions.map((question) => {
      if (question.includes('apigeom-figure')) return 'construction'
      return question.includes('mathalea-mathfield') ? 'saisie' : 'qcm'
    })
  }

  it('est en saisie libre par défaut, sauf la question 4 où l’élève construit la droite', () => {
    expect(genere(CentresEtrangersSpe)).toEqual([
      'saisie',
      'saisie',
      'saisie',
      'construction',
      'saisie',
      'saisie',
      'saisie',
      'saisie',
    ])
  })

  it('repasse toutes les questions en QCM avec la case « Version QCM »', () => {
    expect(
      genere(CentresEtrangersSpe, { versionQcm: true }).every(
        (type) => type === 'qcm',
      ),
    ).toBe(true)
  })

  it('déclare l’absence de réponse courte pour la construction de la droite', () => {
    const exercice = new CentresEtrangersSpe()
    exercice.seed = 'abcd'
    exercice.numeroExercice = 0
    exercice.nouvelleVersionWrapper(0)
    expect(exercice.listeReponsesCourtes[3]).toBeNull()
    exercice.sup4 = true
    exercice.nouvelleVersionWrapper(0)
    expect(exercice.listeReponsesCourtes[3]).toBeUndefined()
  })

  it('garde le QCM dans l’ancienne version archivée', () => {
    expect(
      genere(CentresEtrangersSpeAncienne).every((type) => type === 'qcm'),
    ).toBe(true)
  })
})

describe.each([
  ['1A-A01-4', CentresEtrangersNonSpe, CentresEtrangersNonSpeAncienne, 12],
  ['1A-A01-5', CentresEtrangersTechno, CentresEtrangersTechnoAncienne, 8],
  ['1A-A01-6', FranceMetroSpe, FranceMetroSpeAncienne, 8],
  ['1A-A01-7', FranceMetroNonSpe, FranceMetroNonSpeAncienne, 8],
  ['1A-A01-8', FranceMetroTechno, FranceMetroTechnoAncienne, 12],
  ['1A-A01-9', AntillesGuyaneSpe, AntillesGuyaneSpeAncienne, 8],
  ['1A-A01-10', AntillesGuyaneNonSpe, AntillesGuyaneNonSpeAncienne, 8],
  ['1A-A01-11', AntillesGuyaneTechno, AntillesGuyaneTechnoAncienne, 12],
  ['1A-A01-1', AmeriqueNordSpe, AmeriqueNordSpeAncienne, 9],
  ['1A-A01-2', AmeriqueNordNonSpe, AmeriqueNordNonSpeAncienne, 12],
  ['1A-A01-12', PolynesieSpeComposition, PolynesieSpeCompositionAncienne, 8],
  [
    '1A-A01-13',
    PolynesieSpecifiqueComposition,
    PolynesieSpecifiqueCompositionAncienne,
    8,
  ],
  [
    '1A-A01-14',
    PolynesieTechnoComposition,
    PolynesieTechnoCompositionAncienne,
    8,
  ],
])(
  'Composition %s : questions en saisie libre ou en QCM',
  (_, Classe, Ancienne, nbQuestions) => {
    const genere = (
      Composition: typeof CentresEtrangersNonSpe,
      options: { versionQcm?: boolean } = {},
    ) => {
      const exercice = new Composition()
      exercice.seed = 'abcd'
      exercice.interactif = true
      exercice.numeroExercice = 0
      if (options.versionQcm !== undefined) exercice.sup4 = options.versionQcm
      exercice.nouvelleVersionWrapper(0)
      return exercice.listeQuestions.map((question) =>
        question.includes('mathalea-mathfield') ||
        question.includes('tableau-signes-variations') ||
        question.includes('liste-deroulante') ||
        question.includes('fill-in-the-blank')
          ? 'saisie'
          : 'qcm',
      )
    }

    it('est en saisie libre par défaut', () => {
      const types = genere(Classe)
      expect(types).toHaveLength(nbQuestions)
      expect(types.every((type) => type === 'saisie')).toBe(true)
    })

    it('repasse toutes les questions en QCM avec la case « Version QCM »', () => {
      expect(
        genere(Classe, { versionQcm: true }).every((type) => type === 'qcm'),
      ).toBe(true)
    })

    it('garde le QCM dans l’ancienne version archivée', () => {
      expect(genere(Ancienne).every((type) => type === 'qcm')).toBe(true)
    })

    it('explique le choix éditorial dans le commentaire, même après génération', () => {
      const exercice = new Classe()
      exercice.numeroExercice = 0
      exercice.nouvelleVersionWrapper(0)
      exercice.nouvelleVersionWrapper(0)
      expect(exercice.comment).toContain(
        'questions ouvertes ou à réponses courtes',
      )
      expect(exercice.comment).not.toContain('Courses Aux Nombres')
    })
  },
)
