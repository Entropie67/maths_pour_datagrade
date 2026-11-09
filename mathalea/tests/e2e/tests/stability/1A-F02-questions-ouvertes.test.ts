import OrdonneePointB from '../../../../src/exercices/1e/1A-F02-11'
import SignesCanonique from '../../../../src/exercices/1e/1A-F02-13'
import SignesFactorise from '../../../../src/exercices/1e/1A-F02-14'
import OrdonneeDroite from '../../../../src/exercices/1e/1A-F02-10'
import InequationGraphique from '../../../../src/exercices/1e/1A-F02-8'
import '../../helpers/setupExerciseGeneration'
import ImageSecondDegre from '../../../../src/exercices/1e/1A-F02-1'
import ImageAffine from '../../../../src/exercices/1e/1A-F02-2'
import ImageAffineFraction from '../../../../src/exercices/1e/1A-F02-3'
import IntersectionAxeAbscisses from '../../../../src/exercices/1e/1A-F02-9'
import { pointsMaxExercice } from '../../../../src/lib/interactif/baremeExercice'
import { mathaleaHandleExerciceSimple } from '../../../../src/lib/mathalea'
import { context } from '../../../../src/modules/context'
import { fonctionComparaison } from '../../../../src/lib/interactif/comparisonFunctions'
import PositionPoint from '../../../../src/exercices/1e/1A-F02-18'
import Coordonnees from '../../../../src/exercices/1e/1A-F02-21'
import AntecedentAffine from '../../../../src/exercices/2e/2A-F2-5'
import Image from '../../../../src/exercices/1e/1A-F02-4'
import ImageFraction from '../../../../src/exercices/1e/1A-F02-5'
import * as arrayOutils from '../../../../src/lib/outils/arrayOutils'
import { expect, it, vi } from 'vitest'
import Intersection from '../../../../src/exercices/1e/1A-F02-15'
import Ordonnee from '../../../../src/exercices/1e/1A-F02-16'
import Antecedent from '../../../../src/exercices/1e/1A-F02-19'

for (const Classe of [Intersection, Ordonnee]) {
  it.each([false, true])(
    `${Classe.name} propose une question ouverte (interactif : %s)`,
    (interactif) => {
      const exercice = new Classe()
      exercice.versionAleatoire = exercice.versionOriginale
      exercice.interactif = interactif
      exercice.nouvelleVersion()
      expect(exercice.listeQuestions[0]).toContain(
        interactif
          ? Classe === Intersection
            ? 'Le produit'
            : "L'ordonnée"
          : 'Déterminer',
      )
      expect(exercice.listeQuestions[0]).not.toContain('qcmMult')
      expect(exercice.listeCorrections[0]).not.toContain('La bonne réponse est')
      expect(exercice.listeCorrections[0]).not.toContain('proposition')
      expect(exercice.consigne).toBe('')
      expect(exercice.autoCorrection[0].formatInteractif).toBe(
        'mathalea-mathfield',
      )
      expect(exercice.listeQuestions[0].includes('<mathalea-mathfield')).toBe(
        interactif,
      )
      const reponses = exercice.autoCorrection[0].valeur?.reponse?.value
      expect(reponses).toEqual(Classe === Intersection ? ['8'] : ['-23'])
    },
  )
}

it('rejette une valeur proposée qui n’est pas un antécédent', () => {
  const exercice = new Antecedent()
  exercice.interactif = false
  exercice.versionAleatoire = exercice.versionOriginale
  const choixOriginal = arrayOutils.choice
  const tirage = vi
    .spyOn(arrayOutils, 'choice')
    .mockImplementation((valeurs, exclus) =>
      valeurs.length === 2 && valeurs[0] === 1 && valeurs[1] === -1
        ? -1
        : choixOriginal(valeurs, exclus),
    )
  try {
    exercice.nouvelleVersion()
    expect(exercice.listeQuestions[0]).toContain(
      'Le nombre $-1$ est-il un antécédent',
    )
    expect(exercice.listeCorrections[0]).toContain('f(-1)')
    expect(exercice.listeCorrections[0]).toContain('n’est pas')
    expect(exercice.listeCorrections[0]).not.toContain('factoriser')
    expect(exercice.listeCorrections[0]).toContain('Le nombre $-1$')
    expect(exercice.listeCorrections[0]).not.toContain('Non}')
  } finally {
    tirage.mockRestore()
  }
})

it('conserve le QCM en interactif pour les antécédents', () => {
  const exercice = new Antecedent()
  exercice.sup3 = true
  exercice.versionAleatoire = exercice.versionOriginale
  exercice.interactif = true
  exercice.nouvelleVersion()
  expect(exercice.autoCorrection[0].formatInteractif).toBe('mathalea-qcm')
  expect(exercice.autoCorrection[0].propositions).toHaveLength(4)
  expect(exercice.listeCorrections[0]).toContain(
    'le nombre $1$ est un antécédent',
  )
})

it('propose uniquement des petits entiers en question ouverte', () => {
  const exercice = new Antecedent()
  exercice.nbQuestions = 15
  exercice.interactif = false
  exercice.nouvelleVersion()
  for (let i = 0; i < exercice.listeQuestions.length; i++) {
    const valeur = exercice.listeQuestions[i].match(
      /Le nombre \$(-?\d+)\$ est-il/,
    )
    expect(valeur).not.toBeNull()
    expect(Math.abs(Number(valeur![1]))).toBeLessThanOrEqual(2)
    expect(exercice.listeCorrections[i]).toContain(`Le nombre $${valeur![1]}$`)
    expect(exercice.listeCorrections[i]).not.toContain('La bonne réponse est')
  }
})

for (const Classe of [Coordonnees, AntecedentAffine, Image, ImageFraction]) {
  it.each([false, true])(
    `${Classe.name} supprime le QCM (interactif : %s)`,
    (interactif) => {
      const exercice = new Classe()
      exercice.interactif = interactif
      exercice.nbQuestions = 1
      exercice.nouvelleVersion()
      const question = exercice.listeQuestions[0]
      expect(question).toMatch(
        /Déterminer|Calculer|Les coordonnées|On considère|L'image de/,
      )
      expect(question).not.toContain('qcmMult')
      expect(question).not.toContain('mathalea-qcm')
      expect(
        question.includes(
          Classe === Coordonnees ? '<math-field' : '<mathalea-mathfield',
        ),
      ).toBe(interactif)
      expect(exercice.listeCorrections[0]).not.toContain('La bonne réponse est')
      expect(exercice.listeCorrections[0]).not.toContain("C'est donc le point")
      if (interactif)
        expect(exercice.autoCorrection[0].formatInteractif).toBe(
          Classe === Coordonnees ? 'fillInTheBlank' : 'mathalea-mathfield',
        )
      if (Classe === Coordonnees && !interactif) {
        expect(exercice.autoCorrection[0].valeur?.reponse?.options).toEqual({
          coordonnees: true,
        })
        expect(exercice.autoCorrection[0].valeur?.reponse?.value).toMatch(
          /^\(-?\d+;-?\d+\)$/,
        )
      }
    },
  )
}

for (const Classe of [
  Intersection,
  Ordonnee,
  Coordonnees,
  AntecedentAffine,
  Image,
  ImageFraction,
  OrdonneeDroite,
  SignesCanonique,
  SignesFactorise,
  PositionPoint,
  Antecedent,
]) {
  it.each([false, true])(
    `${Classe.name} propose le paramétrage QCM (interactif : %s)`,
    (interactif) => {
      const exercice = new Classe()
      exercice.interactif = interactif
      exercice.nbQuestions = 1
      if (Classe === AntecedentAffine) exercice.sup2 = true
      else exercice.sup3 = true
      exercice.nouvelleVersion()
      expect(exercice.autoCorrection[0].formatInteractif).toBe('mathalea-qcm')
      expect(exercice.autoCorrection[0].propositions).toHaveLength(4)
      expect(exercice.listeQuestions[0]).not.toContain('<mathalea-mathfield')
    },
  )
}

it.each([PositionPoint, Antecedent])(
  'propose une saisie quand le QCM est désactivé (%s)',
  (Classe) => {
    const exercice = new Classe()
    exercice.interactif = true
    exercice.versionAleatoire = exercice.versionOriginale
    exercice.sup3 = false
    exercice.nouvelleVersion()
    expect(exercice.autoCorrection[0].formatInteractif).toBe('liste-deroulante')
    expect(exercice.listeQuestions[0]).toContain('<liste-deroulante')
    expect(exercice.listeCorrections[0]).not.toContain('La bonne réponse est')
  },
)

it('propose deux coordonnées dans des parenthèses avec un barème sur un point', () => {
  const exercice = new Coordonnees()
  exercice.versionAleatoire = exercice.versionOriginale
  exercice.interactif = true
  exercice.nouvelleVersion()
  expect(exercice.listeQuestions[0]).toContain('Les coordonnées du point')
  expect(exercice.listeQuestions[0]).toContain(' sont ')
  const reponses = exercice.autoCorrection[0].valeur
  expect(reponses?.champ1?.value).toBe('-1')
  expect(reponses?.champ2?.value).toBe('6')
  expect(reponses?.bareme?.([1, 1])).toEqual([1, 1])
  expect(reponses?.bareme?.([1, 0])).toEqual([0, 1])
})

it.each([1, 3])(
  'accorde la consigne de 22 pour %s question(s)',
  (nbQuestions) => {
    const exercice = new AntecedentAffine()
    exercice.nbQuestions = nbQuestions
    exercice.nouvelleVersion()
    expect(exercice.consigne).toBe(
      nbQuestions === 1
        ? 'Répondre à la question suivante avec une valeur exacte simplifiée.'
        : 'Répondre aux questions suivantes avec une valeur exacte simplifiée.',
    )
    for (const correction of exercice.listeCorrections) {
      expect(correction).toMatch(
        /L'antécédent de \$-?\d+\$ par la fonction \$f\$ est \$/,
      )
      expect(correction).toMatch(/\$\.$/)
    }
  },
)

it('conserve la conclusion affirmative en QCM pour 22', () => {
  const exercice = new AntecedentAffine()
  exercice.sup2 = true
  exercice.interactif = true
  exercice.nouvelleVersion()
  expect(exercice.listeCorrections[0]).toContain("L'antécédent de $")
  expect(exercice.listeCorrections[0]).toContain('par la fonction $f$ est $')
})

it('présente l’antécédent comme une affirmation devant le champ en interactif', () => {
  const exercice = new AntecedentAffine()
  exercice.interactif = true
  exercice.nouvelleVersion()
  const question = exercice.listeQuestions[0]
  expect(question).toContain('On considère la fonction $f$ définie par $f(x)=')
  expect(question).toMatch(
    /L'antécédent de \$-?\d+\$ par la fonction \$f\$ est (?:<label><\/label>)?<mathalea-mathfield/,
  )
  expect(question).not.toContain("Déterminer l'antécédent")
  expect(question).toMatch(/\.$/)
})

it('exige une réponse réduite pour 22 en interactif', () => {
  const exercice = new AntecedentAffine()
  exercice.interactif = true
  exercice.nbQuestions = 5
  exercice.nouvelleVersion()
  for (const correction of exercice.autoCorrection) {
    const reponse = correction.valeur?.reponse
    expect(reponse?.options).toEqual(
      String(reponse?.value).includes('frac')
        ? { fractionIrreductible: true, nombreDecimalSeulement: true }
        : { nombreDecimalSeulement: true },
    )
    if (String(reponse?.value).includes('frac')) {
      expect(
        reponse?.compare?.('0,5', '\\frac{1}{2}', reponse.options).isOk,
      ).toBe(true)
      expect(
        reponse?.compare?.('0.33333333333333', '\\frac{1}{3}', reponse.options)
          .isOk,
      ).toBe(false)
      expect(
        reponse?.compare?.('0,33', '\\frac{1}{3}', reponse.options).isOk,
      ).toBe(false)
      expect(
        fonctionComparaison('\\frac{2}{4}', '\\frac{1}{2}', reponse?.options)
          .isOk,
      ).toBe(false)
      expect(
        fonctionComparaison('\\frac{1}{2}', '\\frac{1}{2}', reponse?.options)
          .isOk,
      ).toBe(true)
    } else {
      expect(
        fonctionComparaison('\\frac{2}{2}', '1', reponse?.options).isOk,
      ).toBe(false)
      expect(fonctionComparaison('1', '1', reponse?.options).isOk).toBe(true)
    }
  }
})

it('affiche une phrase affirmative devant le champ pour l’image dans 4', () => {
  const exercice = new Image()
  exercice.versionAleatoire = exercice.versionOriginale
  exercice.interactif = true
  exercice.nouvelleVersion()
  expect(exercice.listeQuestions[0]).toContain(
    "L'image de $3$ par la fonction $f$ est ",
  )
  expect(exercice.listeQuestions[0]).not.toContain("Calculer l'image")
  expect(exercice.listeQuestions[0]).toContain('<mathalea-mathfield')
  expect(exercice.listeQuestions[0]).toMatch(/\.$/)
})

for (const Classe of [
  ImageSecondDegre,
  ImageAffine,
  ImageAffineFraction,
  OrdonneePointB,
]) {
  it(`${Classe.name} termine la phrase interactive par un point`, () => {
    context.isHtml = true
    const exercice = new Classe()
    exercice.nbQuestions = 1
    mathaleaHandleExerciceSimple(exercice, true, 0)
    expect(exercice.listeQuestions[0]).toMatch(
      /(L'image|L’ordonnée) [\s\S]*<\/mathalea-mathfield><span>&nbsp;\.<\/span>/,
    )
  })
}

it('Auto1AF2a propose deux champs pour les coordonnées', () => {
  context.isHtml = true
  const exercice = new IntersectionAxeAbscisses()
  exercice.nbQuestions = 2
  mathaleaHandleExerciceSimple(exercice, true, 0)
  exercice.listeQuestions.forEach((question, i) => {
    expect(question).toContain('Les coordonnées')
    expect(question).toContain(`champTexteEx0Q${i}`)
    expect(question).toContain('placeholder[champ1]')
    expect(question).toContain('placeholder[champ2]')
    expect(exercice.autoCorrection[i].valeur?.champ2.value).toBe('0')
  })
  expect(pointsMaxExercice(exercice)).toBe(2)
})

it.each([false, true])(
  'auto1AF2 pose une question ouverte sur les points (interactif : %s)',
  (interactif) => {
    for (const original of [false, true]) {
      const exercice = new InequationGraphique()
      exercice.interactif = interactif
      if (original) exercice.versionAleatoire = exercice.versionOriginale
      exercice.nbQuestions = 1
      exercice.nouvelleVersion()
      const question = exercice.listeQuestions[0]
      expect(question).toContain(
        interactif ? 'Le ou les points de' : 'Déterminer le ou les points',
      )
      expect(question).not.toMatch(/est vérifiée par[^:]*:/)
      expect(question).not.toContain('mathalea-qcm')
      expect(question.includes('<mathalea-mathfield')).toBe(interactif)
      expect(question.includes('point-virgule')).toBe(interactif)
      expect(exercice.listeCorrections[0]).not.toContain('La bonne réponse est')
      expect(exercice.listeCorrections[0]).toContain(
        "Les points dont l'abscisse vérifie l'inéquation sont donc",
      )
      expect(exercice.autoCorrection[0].formatInteractif).toBe(
        'mathalea-mathfield',
      )
      const reponses = exercice.autoCorrection[0].valeur?.reponse?.value
      expect(reponses).toHaveLength(2)
      if (original) expect(reponses).toEqual(['A;R', 'R;A'])
    }
  },
)

it('auto1AF2 conserve le QCM avec la version QCM', () => {
  const exercice = new InequationGraphique()
  exercice.interactif = true
  exercice.sup3 = true
  exercice.nouvelleVersion()
  expect(exercice.listeQuestions[0]).toMatch(/est vérifiée par[^:]*:/)
  expect(exercice.autoCorrection[0].formatInteractif).toBe('mathalea-qcm')
  expect(exercice.autoCorrection[0].propositions).toHaveLength(4)
})

it.each([false, true])(
  'AutoFO2j pose une question ouverte (interactif : %s)',
  (interactif) => {
    const exercice = new OrdonneeDroite()
    exercice.interactif = interactif
    exercice.versionAleatoire = exercice.versionOriginale
    exercice.nouvelleVersion()
    const question = exercice.listeQuestions[0]
    expect(question).toContain(
      interactif
        ? "L'ordonnée du point de $\\mathscr{D}$ dont l'abscisse est $0$ est <mathalea-mathfield"
        : "Déterminer l'ordonnée du point de $\\mathscr{D}$ dont l'abscisse est $0$.",
    )
    expect(question).not.toContain('mathalea-qcm')
    expect(exercice.listeCorrections[0]).not.toContain('La bonne réponse est')
    expect(exercice.consigne).toBe('')
    expect(exercice.autoCorrection[0].valeur?.reponse?.value).toBe('-1')
  },
)

for (const [Classe, nbChamps] of [
  [SignesCanonique, 2],
  [SignesFactorise, 3],
] as const) {
  it.each([false, true])(
    `${Classe.name} demande des signes avec des listes (interactif : %s)`,
    (interactif) => {
      context.isHtml = true
      for (const original of [false, true]) {
        const exercice = new Classe()
        exercice.interactif = interactif
        if (original) exercice.versionAleatoire = exercice.versionOriginale
        exercice.numeroExercice = 0
        exercice.nouvelleVersion()
        const question = exercice.listeQuestions[0]
        expect(question).not.toContain('Une seule des quatre fonctions')
        expect(question).not.toContain('mathalea-qcm')
        expect(question.includes('Déterminer le signe')).toBe(!interactif)
        expect(question.includes('<multi-mathfield')).toBe(interactif)
        expect(exercice.listeCorrections[0]).not.toContain('la seule fonction')
        expect(exercice.listeCorrections[0]).toContain('Ainsi, $a$ est')
        expect(exercice.autoCorrection[0].formatInteractif).toBe(
          'multi-mathfield',
        )
        const valeur = exercice.autoCorrection[0].valeur ?? {}
        expect(
          Object.keys(valeur).filter((k) => k.startsWith('field')),
        ).toHaveLength(nbChamps)
        if (original)
          expect(
            Object.entries(valeur)
              .filter(([k]) => k.startsWith('field'))
              .map(([, v]) => (v as { value: string }).value),
          ).toEqual(Classe === SignesCanonique ? ['-', '+'] : ['+', '-', '+'])
      }
    },
  )
}

it('Antecedent propose « est / n’est pas » en interactif', () => {
  context.isHtml = true
  const exercice = new Antecedent()
  exercice.interactif = true
  exercice.versionAleatoire = exercice.versionOriginale
  exercice.numeroExercice = 0
  exercice.nouvelleVersion()
  const question = exercice.listeQuestions[0]
  expect(question).toMatch(/Le nombre \$-?1\$ <liste-deroulante/)
  expect(question).toContain('un antécédent de $0$ par la fonction $f$.')
  expect(question).not.toContain('<mathalea-mathfield')
  expect(exercice.autoCorrection[0].formatInteractif).toBe('liste-deroulante')
  expect(['est', 'nest']).toContain(
    exercice.autoCorrection[0].valeur?.reponse?.value,
  )
})
