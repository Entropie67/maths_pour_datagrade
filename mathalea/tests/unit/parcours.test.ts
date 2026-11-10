import { describe, expect, it } from 'vitest'
import {
  addLevel,
  addSteps,
  missing,
  moveStep,
  nudgeStep,
  removeLevel,
  removeStep,
  splitIntoLevels,
  studentPreviewUrl,
  withoutLevels,
} from '../../src/lib/parcours/parcoursEditing'
import {
  createParcoursFile,
  isParcours,
  readParcoursFile,
  timestampedName,
} from '../../src/lib/parcours/parcoursFile'
import {
  assign,
  cleaned,
  emptyLibrary,
  move,
  parcoursOfClass,
  publish,
  removeClass,
  renameClass,
  restore,
  saveParcours,
  setClassParcours,
  unpublishedCount,
} from '../../src/lib/parcours/parcoursLibrary'
import {
  dayOfOpening,
  isDay,
  isOpening,
  openingLabel,
  openingOfDay,
} from '../../src/lib/parcours/parcoursOpening'
import {
  exerciseKey,
  mergeObjectives,
  objectivesToCsv,
  readObjectives,
} from '../../src/lib/parcours/parcoursObjectives'
import { compile, isExpression } from '../../src/lib/parcours/lessonExpression'
import {
  createLessonFile,
  emptyBlock,
  emptyLesson,
  lessonFileName,
  lessonProblems,
  readLessonFile,
} from '../../src/lib/parcours/lessonFile'
import {
  ALL_LEVELS,
  exerciseIndex,
  levelsFor,
  menuPathFor,
  officialChapters,
} from '../../src/lib/parcours/parcoursReferential'
import {
  emptyParcours,
  levelGroups,
  levelName,
  suggestedIcon,
  validationLabels,
  type Parcours,
  type Lesson,
  type LessonBlock,
  type Step,
} from '../../src/lib/parcours/parcoursTypes'

const step = (uuid: string, objectifs?: string[]): Step => ({
  uuid,
  id: uuid,
  titre: uuid,
  nbQuestions: 2,
  ...(objectifs ? { objectifs } : {}),
})

const parcours = (): Parcours =>
  emptyParcours({
    titre: 'Relatifs',
    niveau: '5e',
    theme: 'Nombres relatifs',
    etapes: [
      step('a', ['Additionner']),
      step('b', ['Additionner']),
      step('c', ['Soustraire']),
    ],
  })

describe('édition des paliers', () => {
  it('découpe par objectif, puis déplace un exercice d’un palier à l’autre', () => {
    let p = splitIntoLevels(parcours())
    expect(p.paliers?.map((l) => [l.titre, l.nb])).toEqual([
      ['Additionner', 2],
      ['Soustraire', 1],
    ])
    expect(p.paliers?.[1]).toMatchObject({ acces: 'seuil', seuil: 80 })
    // Le dernier exercice du palier 1 descend : il ouvre le palier 2
    p = nudgeStep(p, 1, 1)
    expect(levelGroups(p)).toEqual([[0], [1, 2]])
    expect(p.etapes.map((s) => s.uuid)).toEqual(['a', 'b', 'c'])
    // Glisser « c » en tête du palier 1
    p = moveStep(p, 2, 0, 0)
    expect(p.etapes.map((s) => s.uuid)).toEqual(['c', 'a', 'b'])
    expect(levelGroups(p)).toEqual([[0, 1], [2]])
    expect(nudgeStep(p, 0, -1)).toBe(p)
  })

  it('ajoute à un palier, signale un palier vide, retire un exercice ou un palier', () => {
    let p = addLevel(splitIntoLevels(parcours()))
    expect(missing(p)).toEqual(['un exercice dans chaque palier'])
    p = addSteps(p, [step('d')], 2)
    expect(missing(p)).toEqual([])
    expect(levelGroups(p)[2]).toEqual([3])
    p = removeStep(p, 0)
    expect(levelGroups(p)).toEqual([[0], [1], [2]])
    p = removeLevel(p, 0)
    expect(p.paliers?.[0]).toMatchObject({ nb: 2, acces: undefined })
    p = removeLevel(p, 1)
    expect(p.paliers).toBeUndefined()
    expect(missing(emptyParcours())).toEqual([
      'un niveau',
      'un chapitre',
      'un titre',
      'un exercice',
    ])
  })

  it('ouvre les exercices dans la vue élève du site', () => {
    const url = new URL(
      studentPreviewUrl('https://mathalea.fr/alea/?v=parcours', [
        { ...step('cbc26'), sup: '2' },
      ]),
    )
    expect(url.searchParams.getAll('uuid')).toEqual(['cbc26'])
    expect(url.searchParams.get('s')).toBe('2')
    expect(url.searchParams.get('i')).toBe('1')
    expect(url.searchParams.get('v')).toBe('eleve')
  })
})

describe('bibliothèque et fichier publié', () => {
  it('crée pour un niveau, donne à des classes, ordonne, renomme et retire', () => {
    let { library, id } = saveParcours(emptyLibrary(), parcours())
    expect(library.entries[0].classes).toEqual([])
    expect(library.defaults?.niveau).toBe('5e')
    library = assign(library, id, ['5e A'])
    library = saveParcours(library, { ...parcours(), titre: 'Autre' }).library
    const autre = library.entries[1].parcours.id
    library = setClassParcours(library, '5e A', [id, autre])
    library = move(library, autre, '5e A', -1)
    expect(
      parcoursOfClass(library, '5e A').map((e) => e.parcours.titre),
    ).toEqual(['Autre', 'Relatifs'])
    library = renameClass(library, '5e A', '5e B')
    expect(library.entries[0].classes).toEqual(['5e B'])
    library = removeClass(library, '5e B')
    expect(library.entries.every((e) => e.classes.length === 0)).toBe(true)
  })

  it('publie toute la bibliothèque ; une modification après publication ouvre la version suivante', () => {
    let { library, id } = saveParcours(
      emptyLibrary(),
      splitIntoLevels(parcours()),
    )
    library = saveParcours(
      library,
      emptyParcours({
        titre: 'Sans classe',
        niveau: '5e',
        theme: 'T',
        etapes: [step('x')],
      }),
    ).library
    library = assign(library, id, ['5e A'])
    library = {
      ...library,
      objectives: [
        {
          libelle: 'Additionner',
          code: '5N2G',
          niveau: '5e',
          theme: 'Relatifs',
        },
      ],
    }
    expect(unpublishedCount(library)).toBe(2)
    const published = publish(library)
    library = published.library
    expect(unpublishedCount(library)).toBe(0)
    const file = readParcoursFile(published.text)
    expect(file.banque).toBe(true)
    expect(file.classes.map((c) => [c.nom, c.parcours.length])).toEqual([
      ['5e A', 1],
    ])
    expect(file.bibliotheque?.parcours).toHaveLength(2)
    expect(file.classes[0].parcours[0].paliers).toHaveLength(2)
    const p = library.entries[0].parcours
    library = saveParcours(library, {
      ...p,
      titre: 'Relatifs (corrigé)',
    }).library
    expect(library.entries[0].parcours.version).toBe(2)
    library = saveParcours(library, {
      ...library.entries[0].parcours,
      objectif: 'Encore',
    }).library
    expect(library.entries[0].parcours.version).toBe(2)
    expect(unpublishedCount(library)).toBe(1)
  })

  it('ne publie ni ressource sans lien ni pause vide', () => {
    let p = splitIntoLevels(parcours())
    p.paliers![0].ressource = { titre: 'Fiche', lien: '' }
    p.paliers![0].pause = { texte: '  ' }
    p.paliers![1].ressource = { titre: 'Vidéo', lien: 'https://exemple.fr/v' }
    const { library, id } = saveParcours(emptyLibrary(), p)
    const sent = readParcoursFile(publish(assign(library, id, ['5e A'])).text)
      .classes[0].parcours[0]
    expect(sent.paliers?.[0].ressource).toBeUndefined()
    expect(sent.paliers?.[0].pause).toBeUndefined()
    expect(sent.paliers?.[1].ressource?.titre).toBe('Vidéo')
  })

  it('reprend un fichier publié sans rien perdre, sans doublon', () => {
    const { library: source, id } = saveParcours(emptyLibrary(), parcours())
    const file = readParcoursFile(publish(assign(source, id, ['5e A'])).text)
    const local = saveParcours(emptyLibrary(), {
      ...parcours(),
      titre: 'À moi',
    }).library
    let library = restore(local, file)
    expect(library.entries.map((e) => e.parcours.titre)).toEqual([
      'À moi',
      'Relatifs',
    ])
    expect(library.entries[1].classes).toEqual(['5e A'])
    // Seul « À moi », jamais publié, reste à publier
    expect(unpublishedCount(library)).toBe(1)
    library = restore(library, file)
    expect(library.entries).toHaveLength(2)
  })

  it('lit le format de l’application et refuse un fichier abîmé', () => {
    expect(
      timestampedName('parcours-mathalea', 'json', new Date(2026, 9, 15, 8, 5)),
    ).toBe('parcours-mathalea-2026-10-15-08h05.json')
    const text = createParcoursFile([
      { nom: '5e A', parcours: [{ ...parcours(), id: 'relatifs' }] },
    ])
    expect(readParcoursFile(text).classes[0].parcours[0].id).toBe('relatifs')
    expect(
      isParcours({
        ...parcours(),
        id: 'relatifs',
        paliers: [{ titre: 'x', nb: 1, acces: 'pause' }],
      }),
    ).toBe(false)
    // Affichage : en-têtes masqués et questions mélangées, comme dans l'application
    expect(emptyParcours()).toMatchObject({
      enTetesMasques: true,
      melanger: true,
    })
    expect(isParcours({ ...parcours(), id: 'relatifs', melanger: false })).toBe(
      true,
    )
    expect(isParcours({ ...parcours(), id: 'relatifs', melanger: 'oui' })).toBe(
      false,
    )
    expect(
      isParcours({ ...parcours(), id: 'relatifs', enTetesMasques: 1 }),
    ).toBe(false)
    expect(() => readParcoursFile('{"format":"autre"}')).toThrow(
      'fichier de parcours',
    )
    expect(() =>
      readParcoursFile(
        createParcoursFile([
          { nom: 'A', parcours: [] },
          { nom: 'A', parcours: [] },
        ]),
      ),
    ).toThrow()
  })
})

describe('objectifs', () => {
  it('importe un CSV au fil de l’année, sans doublon, et l’exporte', () => {
    const csv =
      'Code;Libellé;Niveau;Chapitre\n5N2G;Additionner deux nombres décimaux relatifs;5e;Nombres relatifs\n;"Lire ; écrire";;\n'
    const read = readObjectives(csv, '4e', 'Fractions')
    expect(read).toEqual([
      {
        libelle: 'Additionner deux nombres décimaux relatifs',
        code: '5N2G',
        niveau: '5e',
        theme: 'Nombres relatifs',
      },
      { libelle: 'Lire ; écrire', niveau: '4e', theme: 'Fractions' },
    ])
    expect(
      readObjectives('Additionner, soustraire', '5e', 'R')[0].libelle,
    ).toBe('Additionner, soustraire')
    expect(
      readObjectives('5N2G\tAdditionner\t5e\tRelatifs', '', '')[0].code,
    ).toBe('5N2G')
    expect(mergeObjectives(read, read)).toHaveLength(2)
    expect(readObjectives('﻿' + objectivesToCsv(read), '', '')).toEqual(read)
  })

  it('distingue un exercice par ses réglages, pas par son nombre de questions', () => {
    expect(exerciseKey({ uuid: 'a', sup: '2' })).not.toBe(
      exerciseKey({ uuid: 'a', sup: '3' }),
    )
    expect(exerciseKey({ ...step('a'), nbQuestions: 9 })).toBe(
      exerciseKey(step('a')),
    )
  })

  it('trouve l’objectif du programme d’un exercice dans le référentiel', async () => {
    const index = await exerciseIndex()
    const exercise = index.get('cbc26')
    expect(exercise?.niveau).toBe('5e')
    expect(exercise?.objective).toEqual({
      code: '5N2G',
      libelle: 'Additionner deux nombres décimaux relatifs',
    })
    expect(exercise?.interactif).toBe(true)
  })

  it('propose les rubriques du référentiel suisse en Suisse', async () => {
    expect(levelsFor('FR')).toContain('6e')
    const swiss = levelsFor('CH')
    expect(swiss).toEqual(
      expect.arrayContaining(['9R1', '11LS', '1re Collège', 'Préqualifiant']),
    )
    expect(swiss).not.toContain('6e')
    // Fenêtre d'ajout : la section du parcours, puis son chapitre
    expect(menuPathFor('11LS', '11LSNO')).toEqual([
      'ecoleObligatoire',
      '11LS',
      '11LSNO',
    ])
    expect(menuPathFor('1re Collège')).toEqual(['secondaireII', '1e-college'])
    expect(menuPathFor('Préqualifiant', 'PRQAL')).toEqual([
      'prequalifiant',
      'PRQAL',
    ])
    expect(menuPathFor('5e', '5N2')).toEqual(['college', '5e', '5N2'])
    const chapters = await officialChapters()
    expect(chapters['9R3'].map((c) => c.code)).toContain('9R3NO')
    expect(chapters['1re Collège'].map((c) => c.code)).toContain('1mCN')
    expect(chapters['Préqualifiant'].map((c) => c.code)).toContain('PRQST')
    expect(chapters['5e'].map((c) => c.code)).toContain('5N2')
  })

  it('garde les anciens niveaux suisses 9e, 10e, 11e', () => {
    // Ordre du menu du site, anciens niveaux juste avant leurs sections
    const swiss = ALL_LEVELS.filter((l) => /^(9|10|11)/.test(l))
    expect(swiss).toEqual([
      '9e',
      '9R3',
      '9R2',
      '9R1',
      '10e',
      '10LS',
      '10LC',
      '10CT',
      '11e',
      '11LS',
      '11LC',
      '11CT',
    ])
    expect(menuPathFor('11e', '11NO1')).toEqual(['ecoleObligatoire'])
  })

  it('connaît les exercices des deux référentiels, quel que soit le pays', async () => {
    const fr = await exerciseIndex('FR')
    const ch = await exerciseIndex('CH')
    // Un exercice rangé seulement en France reste connu en Suisse, et inversement
    const onlyCH = [...ch.values()].find((e) => e.niveau === 'Préqualifiant')
    expect(onlyCH && fr.get(onlyCH.uuid)?.uuid).toBe(onlyCH?.uuid)
    expect(ch.get('cbc26')?.uuid).toBe('cbc26')
  })
})

describe('ceintures, icônes, libellés', () => {
  it('nomme les paliers en ceintures à partir de la première choisie', () => {
    const p = { style: 'ceintures' as const, premiereCeinture: 2 }
    expect([0, 1, 2].map((k) => levelName(p, k))).toEqual([
      'Ceinture orange',
      'Ceinture verte',
      'Ceinture bleue',
    ])
    expect(levelName({ style: 'ceintures', premiereCeinture: 6 }, 1)).toBe(
      'Ceinture noire, 2e dan',
    )
    expect(levelName({}, 1)).toBe('Palier 2')
  })
  it('propose une icône d’après le chapitre et dit « fin du palier » avec des paliers', () => {
    expect(suggestedIcon('Nombres relatifs')).toBe('bx-calculator')
    expect(suggestedIcon('Théorème de Pythagore')).toBe('bx-shape-triangle')
    expect(suggestedIcon('Probabilités')).toBe('bx-dice-5')
    expect(suggestedIcon('Chapitre inventé')).toBe('bx-book-content')
    expect(validationLabels(splitIntoLevels(parcours())).parcours).toBe(
      'À la fin du palier',
    )
    expect(
      validationLabels({ ...splitIntoLevels(parcours()), style: 'ceintures' })
        .parcours,
    ).toBe('À la fin de la ceinture')
    expect(validationLabels(parcours()).parcours).toBe('À la fin du parcours')
  })
})

describe('fiches de cours de l’application', () => {
  // Contenu propre à l'application : le site le garde tel quel
  const sheet = (titre = 'Primitives'): Lesson => ({
    titre,
    avant: true,
    blocs: [{ type: 'graphique', fonctions: ['x^2'], x: [0, 1], y: [0, 1] }],
  })
  const withSheets = (): Parcours => {
    const p = splitIntoLevels(parcours())
    p.paliers![0].fiche = sheet()
    p.paliers![1].fiche = sheet('Soustraire')
    return p
  }

  it('relit et republie un parcours avec fiches sans rien perdre', () => {
    const p = withSheets()
    const { library, id } = saveParcours(emptyLibrary(), p)
    const file = readParcoursFile(publish(assign(library, id, ['5e A'])).text)
    expect(file.classes[0].parcours[0].paliers?.map((l) => l.fiche)).toEqual([
      sheet(),
      sheet('Soustraire'),
    ])
    const back = restore(emptyLibrary(), file)
    expect(back.entries[0].parcours.paliers?.[0].fiche).toEqual(sheet())
  })

  it('garde les fiches quand on retire des paliers', () => {
    let p = withSheets()
    // Le palier voisin a déjà sa fiche : il la garde
    expect(removeLevel(p, 0).paliers).toBeUndefined()
    expect(removeLevel(p, 0).fiche).toEqual(sheet('Soustraire'))
    // Le palier précédent a sa fiche : celle du palier retiré va au suivant
    p = addLevel(p)
    p = removeLevel(p, 1)
    expect(p.paliers?.map((l) => l.fiche?.titre)).toEqual([
      'Primitives',
      'Soustraire',
    ])
    // Le précédent n'en a pas : il la reprend
    p = addLevel(p)
    delete p.paliers![1].fiche
    p.paliers![2].fiche = sheet('Aires')
    expect(removeLevel(p, 2).paliers?.[1].fiche).toEqual(sheet('Aires'))
    // Liste simple : la fiche du premier palier devient celle du parcours
    const list = withoutLevels(withSheets())
    expect(list.paliers).toBeUndefined()
    expect(list.style).toBeUndefined()
    expect(list.fiche).toEqual(sheet())
    // Découpage en paliers : la fiche du parcours reste (elle vaut pour le premier)
    expect(splitIntoLevels(list).fiche).toEqual(sheet())
  })
})

describe('éditeur de fiches', () => {
  // Une fiche avec chaque sorte de bloc, comme en écrit l'application
  const full = (extra: unknown[] = []): Lesson => ({
    titre: 'Calculer une intégrale',
    avant: true,
    blocs: [
      { type: 'texte', texte: 'Une **primitive** $F$ de $f$.' },
      { type: 'retenir', texte: '$$\\int_a^b f=F(b)-F(a)$$' },
      { type: 'exemple', enonce: '$\\int_1^3 2x$', etapes: ['$x^2$', '8'] },
      {
        type: 'question',
        enonce: 'Signe ?',
        choix: ['+', '-'],
        bonne: 0,
        explication: '.',
      },
      { type: 'question', enonce: 'Valeur ?', reponse: 8, explication: '.' },
      {
        type: 'graphique',
        fonctions: ['x^2/4+1/2', 'a*sin(x)', '2e^(-x)'],
        x: [0, 4],
        y: [0, 5],
        aire: { de: 'a', a: 3, fonction: 0, entre: 1 },
        curseurs: { a: [0, 4, 1, 0.5] },
        valeur: true,
        styles: [{ trait: 'tirets', couleur: 'vert' }, {}],
        points: [
          { x: 1, y: 2, forme: 'vide', nom: 'A', coordonnees: true },
          { x: 'a', sur: 1, forme: 'croix', couleur: 'gris' },
        ],
        textes: [{ x: 2, y: 4, texte: '$\\mathcal{C}_f$', couleur: 'orange' }],
      },
      { type: 'image', src: 'data:image/svg+xml;base64,PHN2Zy8+', alt: 'Aire' },
      { type: 'lien', titre: 'Vidéo', lien: 'https://exemple.fr/v' },
      ...(extra as LessonBlock[]),
    ],
  })
  const accepts = (extra: unknown[]) =>
    isParcours({ ...parcours(), id: 'relatifs', fiche: full(extra) })

  it('accepte chaque sorte de bloc et refuse une fiche mal formée', () => {
    expect(accepts([])).toBe(true)
    const graph = { type: 'graphique', fonctions: ['x'], x: [0, 1], y: [0, 1] }
    for (const bad of [
      { type: 'tableau', texte: 'x' },
      { type: 'texte' },
      {
        type: 'question',
        enonce: '?',
        choix: ['a', 'b'],
        bonne: 2,
        explication: '',
      },
      {
        type: 'question',
        enonce: '?',
        choix: ['a'],
        bonne: 0,
        explication: '',
      },
      { type: 'question', enonce: '?', explication: '' },
      { type: 'image', src: 'https://exemple.fr/a.png', alt: '' },
      { type: 'lien', titre: 'x', lien: 'javascript:alert(1)' },
      { ...graph, fonctions: ['x+'] },
      { ...graph, fonctions: ['b*x'] },
      { ...graph, fonctions: [] },
      { ...graph, x: [1, 0] },
      { ...graph, curseurs: { x: [0, 1, 0] } },
      { ...graph, curseurs: { a: [1, 0, 0] } },
      { ...graph, aire: { de: 0, a: 'b' } },
      { ...graph, aire: { de: 0, a: 1, fonction: 1 } },
      { ...graph, styles: [{ trait: 'ondule' }] },
      { ...graph, styles: [{ couleur: '#ff0000' }] },
      { ...graph, styles: [{}, {}] },
      { ...graph, points: [{ x: 1 }] },
      { ...graph, points: [{ x: 1, y: 2, sur: 0 }] },
      { ...graph, points: [{ x: 1, sur: 1 }] },
      { ...graph, points: [{ x: 'c', y: 1 }] },
      { ...graph, points: [{ x: 1, y: 1, forme: 'carre' }] },
      { ...graph, textes: [{ x: 1, y: 1 }] },
    ]) {
      expect(accepts([bad]), JSON.stringify(bad)).toBe(false)
    }
    // Un texte vide passe dans un fichier (comme dans l'application), l'éditeur le signale
    expect(accepts([{ type: 'texte', texte: '' }])).toBe(true)
    expect(lessonProblems(full([{ type: 'texte', texte: '' }]))).toEqual([
      'Bloc 9 (Texte) : Texte vide.',
    ])
  })

  it('lit les expressions comme l’application et les calcule', () => {
    for (const ok of [
      'x^2/4+1/2',
      '2x',
      '3(x+1)',
      'x sin(x)',
      'sqrt x',
      '-x^-2',
      'pi*e^x',
      'ln(abs(x))+.5',
    ])
      expect(isExpression(ok), ok).toBe(true)
    for (const bad of ['', 'x+', '(x', 'x)', 'y', 'x;1', '2..3', 'sin'])
      expect(isExpression(bad), bad).toBe(false)
    expect(compile('2x+3(x+1)')!({ x: 2 })).toBe(13)
    expect(compile('2^3^2')!({ x: 0 })).toBe(512)
    expect(compile('a*x', ['x', 'a'])!({ x: 3, a: 2 })).toBe(6)
  })

  it('télécharge et rouvre une fiche, collée seule ou dans son fichier', () => {
    const lesson = full()
    expect(readLessonFile(createLessonFile(lesson))).toEqual(lesson)
    expect(readLessonFile(JSON.stringify(lesson))).toEqual(lesson)
    expect(lessonFileName(lesson)).toBe('fiche-calculer-une-integrale.json')
    expect(() => readLessonFile('{')).toThrow('JSON')
    expect(() => readLessonFile('{"format":"classes-mathalea/1"}')).toThrow(
      'fiche de cours',
    )
    expect(() =>
      readLessonFile(
        JSON.stringify(full([{ type: 'lien', titre: 'x', lien: 'x' }])),
      ),
    ).toThrow('Bloc 9 (Lien)')
  })

  it('propose des blocs neufs à compléter, sans rien d’invalide dans le fichier', () => {
    expect(lessonProblems(emptyLesson())).toEqual([
      'La fiche n’a pas de titre.',
      'La fiche n’a aucun bloc.',
    ])
    const blocs = (
      [
        'texte',
        'retenir',
        'exemple',
        'question',
        'graphique',
        'image',
        'lien',
      ] as const
    ).map(emptyBlock)
    // Le graphique neuf est déjà correct ; les autres attendent leur contenu
    expect(
      lessonProblems({ titre: 'x', blocs }).map((p) => p.split(' :')[0]),
    ).toEqual([
      'Bloc 1 (Texte)',
      'Bloc 2 (À retenir)',
      'Bloc 3 (Exemple)',
      'Bloc 4 (Question)',
      'Bloc 6 (Image)',
      'Bloc 7 (Lien)',
    ])
  })
})

describe('date d’ouverture d’un palier', () => {
  it('écrit 8 h du jour choisi avec le décalage de l’appareil', () => {
    const o = openingOfDay('2026-11-12')
    expect(o).toMatch(/^2026-11-12T08:00:00[+-]\d{2}:\d{2}$/)
    expect(Date.parse(o)).toBe(new Date(2026, 10, 12, 8).getTime())
    expect(dayOfOpening(o)).toBe('2026-11-12')
    expect(isOpening(o)).toBe(true)
    expect(openingLabel(o)).toBe('jeudi 12 novembre 2026')
  })

  it('refuse un jour ou un instant invalide', () => {
    expect(isDay('2026-02-31')).toBe(false)
    expect(isDay('12/11/2026')).toBe(false)
    expect(isOpening('2026-11-12')).toBe(false)
    expect(isOpening('2026-11-12T08:00:00')).toBe(false)
    expect(isOpening('2026-02-31T08:00:00+01:00')).toBe(false)
    expect(isOpening('2026-11-12T08:00:00Z')).toBe(true)
  })

  it('est contrôlée dans le fichier et gardée quand on édite le parcours', () => {
    const open = openingOfDay('2026-11-12')
    let p = splitIntoLevels(parcours())
    p.paliers![0].ouverture = open
    p.paliers![1].ouverture = openingOfDay('2026-11-19')
    expect(isParcours({ ...p, id: 'relatifs' })).toBe(true)
    p.paliers![1].ouverture = '2026-11-19'
    expect(isParcours({ ...p, id: 'relatifs' })).toBe(false)
    p.paliers![1].ouverture = openingOfDay('2026-11-19')
    // Le parcours part aux élèves avec ses dates
    expect(cleaned(p).paliers?.map((l) => dayOfOpening(l.ouverture!))).toEqual([
      '2026-11-12',
      '2026-11-19',
    ])
    // Supprimer le premier palier : le second garde sa date
    p = removeLevel(addLevel(p), 0)
    expect(p.paliers?.[0].ouverture).toBe(openingOfDay('2026-11-19'))
  })
})
