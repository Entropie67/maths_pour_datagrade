import { describe, expect, it } from 'vitest'
import katex from 'katex'
import seedrandom from 'seedrandom'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildTypstDocument } from '../../../src/components/setup/typst/buildTypstDocument'
import { mathaleaFormatExercice } from '../../../src/lib/mathalea'
import { texteGras } from '../../../src/lib/outils/embellissements'
import AffirmationsSuites, {
  affirmations,
  filtrerAffirmations,
  nombreAffirmations,
  type Theme,
} from '../../../src/exercices/TSpe/TSA1-48'

const themes: Theme[] = [
  'python',
  'logarithme',
  'integrale',
  'limite',
  'pointFixe',
  'cours',
  'recurrence',
  'arithmeticoGeo',
  'arithGeo',
  'bornee',
  'calculTermes',
]

describe('TSA1-48 : banque et filtrage', () => {
  it('met la consigne au singulier pour une seule affirmation', () => {
    const une = new AffirmationsSuites()
    une.nbQuestions = 1
    une.nouvelleVersion()
    expect(une.consigne).toBe(
      'Indiquer si l’affirmation est vraie ou fausse et justifier la réponse.',
    )
    const plusieurs = new AffirmationsSuites()
    plusieurs.nbQuestions = 3
    plusieurs.nouvelleVersion()
    expect(plusieurs.consigne).toContain('chaque affirmation')
    expect(new AffirmationsSuites().consigne).toContain('l’affirmation est')
  })

  it('tire chaque affirmation au plus une fois, sans numéro affiché', () => {
    const exercise = new AffirmationsSuites()
    exercise.nbQuestions = 36
    exercise.nouvelleVersion()
    expect([...exercise.idsAffirmations].sort((x, y) => x - y)).toEqual(
      Array.from({ length: 36 }, (_, i) => i + 1),
    )
    for (const question of exercise.listeQuestions) {
      expect(question).not.toMatch(/Affirmation \$\d+\$/)
    }
    for (const correction of exercise.listeCorrections) {
      expect(correction).not.toMatch(/Affirmation \$\d+\$/)
    }
  })

  it('indique entre parenthèses le nombre d’affirmations de chaque thème', () => {
    const exercise = new AffirmationsSuites()
    const labels = [
      ...(exercise.besoinFormulaireComplexe?.champs ?? []).map(
        ({ label }) => label,
      ),
      exercise.besoinFormulaire2CaseACocher?.[0],
      exercise.besoinFormulaire3CaseACocher?.[0],
      exercise.besoinFormulaire4CaseACocher?.[0],
    ]
    expect(labels.every((label) => /\(\d+\)$/.test(String(label)))).toBe(true)
    expect(labels).toContain(
      `Calcul intégral (${nombreAffirmations('integrale')})`,
    )
    expect(exercise.besoinFormulaireComplexe?.titre).toContain(
      'On ne peut pas demander plus de questions',
    )
    // Le nombre affiché est celui des affirmations réellement tirables avec ce seul thème.
    for (const theme of themes) {
      const exercice = new AffirmationsSuites()
      exercice.sup = [
        'python',
        'pointFixe',
        'cours',
        'recurrence',
        'arithmeticoGeo',
        'arithGeo',
        'bornee',
        'calculTermes',
      ]
        .map((t) => (t === theme ? '1' : '0'))
        .join('*')
      exercice.sup2 = theme === 'logarithme'
      exercice.sup3 = theme === 'integrale'
      exercice.sup4 = theme === 'limite'
      exercice.nbQuestions = 36
      exercice.nouvelleVersion()
      expect(exercice.listeQuestions).toHaveLength(nombreAffirmations(theme))
    }
    expect(nombreAffirmations('arithmeticoGeo')).toBe(
      affirmations.filter(({ tags }) => tags.includes('arithmeticoGeo')).length,
    )
  })

  it('propose une affirmation dès qu’un de ses thèmes est coché', () => {
    const exercise = new AffirmationsSuites()
    exercise.sup2 = false
    exercise.nbQuestions = 36
    exercise.nouvelleVersion()
    // Seules les affirmations dont le seul thème est le logarithme disparaissent.
    const attendues = affirmations.filter(({ tags }) =>
      tags.some((tag) => tag !== 'logarithme'),
    )
    expect(new Set(exercise.idsAffirmations)).toEqual(
      new Set(attendues.map(({ id }) => id)),
    )
    const empty = new AffirmationsSuites()
    empty.sup = '0*0*0*0*0*0*0*0'
    empty.sup2 = empty.sup3 = empty.sup4 = false
    empty.nouvelleVersion()
    expect(empty.listeQuestions).toHaveLength(0)
    expect(empty.consigne).toContain('Aucune affirmation')
  })

  it('conserve le tirage et les thèmes des anciens liens à cases à cocher', () => {
    const legacy = new AffirmationsSuites()
    legacy.sup = false
    legacy.sup5 = false
    legacy.nbQuestions = 6
    const current = new AffirmationsSuites()
    current.sup = '0*0'
    current.nbQuestions = 6
    seedrandom('tsa48-compatibility', { global: true })
    legacy.nouvelleVersion()
    seedrandom('tsa48-compatibility', { global: true })
    current.nouvelleVersion()
    expect(legacy.idsAffirmations).toEqual(current.idsAffirmations)
    expect(legacy.listeQuestions).toEqual(current.listeQuestions)
    expect(legacy.sup).toBe('0*0*1*1*1*1*1*1')
    expect(legacy.sup5).toBe('0')
  })

  it.skipIf(spawnSync('typst', ['--version']).status !== 0)(
    'compile les 36 affirmations et leurs corrections en Typst',
    () => {
      const exercice = new AffirmationsSuites()
      exercice.nbQuestions = 36
      exercice.nouvelleVersion()
      const source = buildTypstDocument([
        {
          ref: 'TSA1-48',
          intro: exercice.consigne,
          questions: exercice.listeQuestions.map(mathaleaFormatExercice),
          corrections: exercice.listeCorrections.map(mathaleaFormatExercice),
          introCorrection: '',
          numbered: true,
        },
      ])
      // Une compilation native peut réussir malgré le plantage WebAssembly
      // des mesures auto-fit : vérifier aussi la mise en page générée.
      expect(source).toContain('#let ex1-corr-colonnes = 1')
      expect(source).not.toMatch(/\\begin\{array\}/)
      const directory = mkdtempSync(join(tmpdir(), 'tsa48-typst-'))
      const input = join(directory, 'main.typ')
      writeFileSync(input, source)
      const result = spawnSync(
        'typst',
        ['compile', input, join(directory, 'main.pdf')],
        { encoding: 'utf8', timeout: 60000 },
      )
      expect(result.status, result.stderr).toBe(0)
    },
  )
  it('génère uniquement les affirmations autorisées, sans doublon ni complément exclu', () => {
    for (let masque = 0; masque < 2048; masque += 31) {
      const exercice = new AffirmationsSuites()
      const autorisations = themes.map((_, i) => Boolean(masque & (1 << i)))
      const autorise = (theme: Theme) => autorisations[themes.indexOf(theme)]
      exercice.sup = [
        'python',
        'pointFixe',
        'cours',
        'recurrence',
        'arithmeticoGeo',
        'arithGeo',
        'bornee',
        'calculTermes',
      ]
        .map((theme) => (autorise(theme as Theme) ? '1' : '0'))
        .join('*')
      exercice.sup2 = autorise('logarithme')
      exercice.sup3 = autorise('integrale')
      exercice.sup4 = autorise('limite')
      exercice.nbQuestions = 36
      exercice.nouvelleVersion()
      const attendues = filtrerAffirmations(
        themes.filter((_, i) => autorisations[i]),
      )
      // Les affirmations à valeurs aléatoires ont un énoncé variable : comparer les numéros.
      expect(new Set(exercice.idsAffirmations)).toEqual(
        new Set(attendues.map(({ id }) => id)),
      )
      expect(exercice.listeQuestions).toHaveLength(attendues.length)
      expect(exercice.listeCorrections).toHaveLength(attendues.length)
    }
  })

  it('aléatoirise les affirmations 1 et 4 en gardant des corrections cohérentes', () => {
    const enonces = new Set<string>()
    const affirmation1 = affirmations.find(({ id }) => id === 1)!
    const affirmation4 = affirmations.find(({ id }) => id === 4)!
    for (let i = 0; i < 40; i++) {
      const un = affirmation1.generer!()
      enonces.add(un.enonce)
      const denominateur = un.enonce.match(/\{\(-1\)\^n\}\{([^}]*)\}/)?.[1]
      expect(un.correction).toContain(
        `\\dfrac{1}{${denominateur?.replace(' + ', '+')}}`,
      )
      const quatre = affirmation4.generer!()
      enonces.add(quatre.enonce)
      const c = Number(quatre.enonce.match(/\{(\d+) \+/)?.[1])
      expect(quatre.correction).toContain(`\\dfrac{${c - 1}}{n}`)
      expect(quatre.correction).toContain(`\\dfrac{${c + 1}}{n}`)
    }
    expect(enonces.size).toBeGreaterThan(10)
  })

  it('rend sans erreur les formules des variantes aléatoires', () => {
    for (const affirmation of affirmations.filter(({ generer }) => generer)) {
      for (let i = 0; i < 30; i++) {
        const { enonce, correction } = affirmation.generer!()
        for (const texte of [enonce, correction]) {
          for (const formule of texte.matchAll(
            /\$([^$]+)\$|\\\[([\s\S]*?)\\\]/g,
          )) {
            expect(() =>
              katex.renderToString(
                (formule[1] ?? formule[2]).replaceAll('&lt;', '<'),
                { throwOnError: true },
              ),
            ).not.toThrow()
          }
        }
      }
    }
  })

  it('conserve les 36 affirmations et rend leurs formules sans erreur', () => {
    expect(affirmations).toHaveLength(36)
    expect(new Set(affirmations.map(({ id }) => id)).size).toBe(36)
    for (const { enonce, correction } of affirmations) {
      for (const texte of [enonce, correction]) {
        for (const formule of texte.matchAll(
          /\$([^$]+)\$|\\\[([\s\S]*?)\\\]/g,
        )) {
          expect(() =>
            katex.renderToString(
              (formule[1] ?? formule[2]).replaceAll('&lt;', '<'),
              {
                throwOnError: true,
              },
            ),
          ).not.toThrow()
        }
      }
    }
  })

  it('respecte les 2048 combinaisons d’autorisations : un thème coché suffit', () => {
    for (let masque = 0; masque < 2048; masque++) {
      const autorises = themes.filter((_, i) => masque & (1 << i))
      const selection = filtrerAffirmations(autorises)
      for (const affirmation of affirmations) {
        expect(selection.includes(affirmation)).toBe(
          affirmation.tags.some((tag) => autorises.includes(tag)),
        )
      }
    }
    expect(filtrerAffirmations(themes)).toHaveLength(36)
    expect(filtrerAffirmations([])).toHaveLength(0)
  })

  it('rattache les affirmations générales au thème « cours »', () => {
    const generales = affirmations.filter(({ tags }) => tags.includes('cours'))
    expect(generales.length).toBeGreaterThan(0)
    for (const { enonce } of generales) expect(enonce).toMatch(/^Toute suite/)
    const exercice = new AffirmationsSuites()
    exercice.sup = '0*0*1*0*0*0*0*0'
    exercice.sup2 = exercice.sup3 = exercice.sup4 = false
    exercice.nbQuestions = 36
    exercice.nouvelleVersion()
    expect(new Set(exercice.idsAffirmations)).toEqual(
      new Set(generales.map(({ id }) => id)),
    )
  })

  it('retient les affirmations à plusieurs thèmes dès que l’un est coché', () => {
    const ids = (themesCoches: Theme[]) =>
      filtrerAffirmations(themesCoches).map(({ id }) => id)
    expect(ids(['integrale'])).toContain(7)
    expect(ids(['logarithme'])).toContain(7)
    expect(ids(['python'])).toContain(13)
    expect(ids(['pointFixe'])).toContain(13)
    expect(ids(['integrale'])).not.toContain(1)
  })
})
