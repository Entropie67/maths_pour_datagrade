import { describe, expect, it } from 'vitest'
import {
  analyseFragment,
  BilanExercice,
  chercheDesignations,
  decodeCheminGit,
  lisCheminsModifies,
  redigeRapport,
  selectionneExercices,
} from '../e2e/helpers/accessibiliteExercice'

const CATALOGUE: [string, string][] = [
  ['aaaaa', '6e/6N1E.ts'],
  ['bbbbb', 'modèlesExos/25_figure_accessible.ts'],
  ['ccccc', '6e/6N1E-old.ts'],
  ['ddddd', '2e/2N13-3 old.ts'],
  ['eeeee', 'profs/P009.ts'],
]
const QUOTE = '"src/exercices/mod\\303\\250lesExos/25_figure_accessible.ts"'
const sansGit = () => null
const codes = (html: string, enonce = true) =>
  analyseFragment(html, enonce).constats.map(({ code }) => code)

describe('chemins de CHANGED_FILES', () => {
  it('décode un chemin que git met entre guillemets', () => {
    expect(decodeCheminGit(QUOTE)).toBe(
      'src/exercices/modèlesExos/25_figure_accessible.ts',
    )
    expect(decodeCheminGit('"a\\tb\\"c\\\\d.ts"')).toBe('a\tb"c\\d.ts')
    expect(decodeCheminGit('src/exercices/6e/6N1E.ts')).toBe(
      'src/exercices/6e/6N1E.ts',
    )
  })

  it('accepte lignes, espaces, virgules et guillemets', () => {
    expect(
      lisCheminsModifies(
        `src/exercices/6e/A.ts\nsrc/exercices/6e/B.ts src/exercices/6e/C.ts,src/exercices/6e/D.ts\n${QUOTE}\nREADME.md`,
      ).sort(),
    ).toEqual([
      '6e/A.ts',
      '6e/B.ts',
      '6e/C.ts',
      '6e/D.ts',
      'modèlesExos/25_figure_accessible.ts',
    ])
  })

  it('retrouve un nom de fichier qui contient une espace', () => {
    expect(lisCheminsModifies('src/exercices/2e/2N13-3 old.ts')).toContain(
      '2e/2N13-3 old.ts',
    )
  })

  it('ramène un nom décomposé (NFD) à la forme du catalogue', () => {
    const decompose = 'src/exercices/modèlesExos/a.ts'.normalize('NFD')
    expect(lisCheminsModifies(decompose)).toEqual(['modèlesExos/a.ts'])
  })
})

describe('sélection des exercices', () => {
  const uuids = (
    env: Record<string, string>,
    git: () => string[] | null = sansGit,
  ) => selectionneExercices(CATALOGUE, env, git).cibles.map(([uuid]) => uuid)

  it('retient le modèle au chemin non ASCII, écarte archives et outils', () => {
    const { cibles, ecartes } = selectionneExercices(
      CATALOGUE,
      {
        CHANGED_FILES: `${QUOTE}\nsrc/exercices/6e/6N1E-old.ts\nsrc/exercices/2e/2N13-3 old.ts\nsrc/exercices/profs/P009.ts\nsrc/exercices/Exercice.ts`,
      },
      sansGit,
    )
    expect(cibles.map(([uuid]) => uuid)).toEqual(['bbbbb'])
    expect(ecartes.sort()).toEqual(
      [
        '6e/6N1E-old.ts',
        '2e/2N13-3 old.ts',
        'profs/P009.ts',
        'Exercice.ts',
      ].sort(),
    )
  })

  it('sans CHANGED_FILES, lit la branche et l’explique', () => {
    const { cibles, explication } = selectionneExercices(CATALOGUE, {}, () => [
      '6e/6N1E.ts',
    ])
    expect(cibles).toEqual([['aaaaa', '6e/6N1E.ts']])
    expect(explication.join(' ')).toContain('CHANGED_FILES absent')
    expect(explication.join(' ')).toContain('catalogue entier')
  })

  it('n’analyse jamais tout le catalogue par défaut', () => {
    expect(uuids({})).toEqual([])
    expect(uuids({}, () => [])).toEqual([])
    expect(uuids({ CHANGED_FILES: '' })).toEqual([])
    expect(uuids({ CHANGED_FILES: 'README.md' })).toEqual([])
  })

  it('A11Y_FILTER cible par chemin ou uuid, sans échouer si rien ne correspond', () => {
    expect(uuids({ A11Y_FILTER: '6e/6N1E' })).toEqual(['aaaaa'])
    expect(uuids({ A11Y_FILTER: 'bbbbb' })).toEqual(['bbbbb'])
    const vide = selectionneExercices(
      CATALOGUE,
      { A11Y_FILTER: 'inconnu' },
      sansGit,
    )
    expect(vide.cibles).toEqual([])
    expect(vide.explication.join(' ')).toContain('Aucun exercice')
  })
})

describe('défauts certains', () => {
  it('signale une figure sans option, pas une figure décrite ou décorative', () => {
    expect(codes('<svg class="mathalea2d"></svg>')).toEqual(['figure'])
    expect(
      codes(
        '<svg class="mathalea2d" role="img" aria-label="Carré de côté 3 cm."></svg>',
      ),
    ).toEqual([])
    expect(codes('<svg class="mathalea2d" aria-hidden="true"></svg>')).toEqual(
      [],
    )
    expect(codes('<svg></svg>')).toEqual([])
  })

  it.each([
    '3{,}5 cm',
    'Côté $x$',
    'Angle \\widehat{A}',
    'a<br>b',
    'undefined cm',
    'NaN',
  ])('signale la description « %s »', (description) => {
    const zone = document.createElement('div')
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('class', 'mathalea2d')
    svg.setAttribute('role', 'img')
    svg.setAttribute('aria-label', description)
    zone.append(svg)
    expect(codes(zone.innerHTML)).toEqual(['description'])
  })

  it.each([
    'Rectangle de longueur 3,5 cm.',
    'Points A, B et C.',
    'x < y et 3 cm',
  ])('accepte la description « %s »', (description) => {
    const zone = document.createElement('div')
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('class', 'mathalea2d')
    svg.setAttribute('role', 'img')
    svg.setAttribute('aria-label', description)
    zone.append(svg)
    expect(codes(zone.innerHTML)).toEqual([])
  })

  it('signale un champ écrit à la main, pas ceux du moteur', () => {
    expect(codes('<input type="text">')).toEqual(['champ'])
    expect(codes('<select><option>1</option></select>')).toEqual(['champ'])
    expect(codes('<textarea></textarea>')).toEqual(['champ'])
    expect(codes('<input type="checkbox" name="checkEx1Q0">')).toEqual([])
    expect(codes('<mathalea-textfield><input></mathalea-textfield>')).toEqual(
      [],
    )
    expect(codes('<math-field id="champ"></math-field>')).toEqual([])
  })

  it('signale une image sans attribut alt, y compris en correction', () => {
    expect(codes('<img src="a/b.png">', false)).toEqual(['image'])
    expect(codes('<img src="b.png" alt="">')).toEqual([])
    expect(codes('<img src="b.png" alt="Un dé.">')).toEqual([])
  })
})

describe('désignations à relire', () => {
  it.each([
    'Calculer la longueur du segment rouge.',
    'Calculer l’aire de la zone tracée en bleu.',
    'Calculer l’aire de la partie de couleur verte.',
    'Calculer l’aire de la figure à gauche.',
    'À droite, calculer le périmètre.',
    'Calculer l’aire de la partie grisée.',
  ])('signale « %s »', (texte) => {
    expect(chercheDesignations(texte)).toHaveLength(1)
  })

  it.each([
    // Mots qui contiennent une couleur ou une position.
    'Tracer la perpendiculaire à la droite $(d)$.',
    'Calculer l’aire du carré.',
    'Le segment est ouvert et couvert.',
    'La droite $(d)$ passe par $A$.',
    // Élément nommé : la couleur ou la position ne le désigne pas seule.
    'Le segment rouge $[AB]$ mesure 3 cm.',
    'La droite $(d)$ est tracée en rouge.',
    'On a représenté en rouge la tangente $T$ à la courbe.',
    'Le point à gauche de $A$.',
    // Consigne : l’élève colorie ou trace.
    'Colorier en rouge la moitié de la figure.',
    'Tracer la droite en bleu.',
    'Le vecteur-solution doit être en vert.',
    'a) en rouge, la médiatrice du segment $[AB]$ ; b) en bleu, la médiatrice du segment $[CD]$.',
    // La couleur est une donnée de l’énoncé.
    'Une urne contient 3 boules rouges et 2 boules noires.',
    // Sens mathématique ou de lecture.
    'Déterminer la limite à gauche en $0$.',
    'Le chiffre à droite de la virgule.',
    'Lire de gauche à droite.',
    'Le lutin tourne à gauche.',
    'Le nombre inscrit en haut à gauche de la cage.',
    'Le trou traverse le pavé de haut en bas.',
    'Aller en bas puis aller en haut.',
    // Une seule figure : sans ambiguïté.
    'Calculer l’aire de la figure ci-dessous.',
    'Le tableau ci-dessous donne les résultats.',
  ])('ne signale pas « %s »', (texte) => {
    expect(chercheDesignations(texte, 1)).toEqual([])
  })

  it('signale « ci-dessous » à partir de deux figures, devant un élément', () => {
    expect(
      chercheDesignations('Calculer l’aire de la figure ci-dessous.', 2),
    ).toHaveLength(1)
    expect(
      chercheDesignations('Le tableau ci-dessous donne les résultats.', 2),
    ).toEqual([])
  })

  it('ne lit que le texte de l’énoncé : ni correction, ni formule, ni figure', () => {
    const rouge = 'Le segment rouge mesure 3 cm.'
    expect(codes(rouge)).toEqual(['designation'])
    expect(codes(rouge, false)).toEqual([])
    expect(codes('Calculer $\\textcolor{red}{en rouge}$.')).toEqual([])
    expect(
      codes(
        '<svg class="mathalea2d" aria-hidden="true"><text>segment rouge</text></svg>',
      ),
    ).toEqual([])
    expect(
      codes('<span style="color: red">Calculer</span> l’aire du carré.'),
    ).toEqual([])
  })
})

describe('rapport', () => {
  const selection = { cibles: [], explication: ['Sélection.'], ecartes: [] }

  it('nomme l’exercice, la graine, le défaut et le correctif, avec le guide', () => {
    const bilan = new BilanExercice('6e/6N1E.ts', 'aaaaa')
    bilan.ajouteFragment(
      {
        lieu: 'question 2',
        html: '<svg class="mathalea2d"></svg>',
        enonce: true,
      },
      { graine: 'a11y-b', cle: 's=2', interactif: true },
    )
    const rapport = redigeRapport(selection, [bilan])
    expect(rapport).toContain(
      '6e/6N1E.ts (uuid aaaaa) : 1 défaut(s), 0 à relire',
    )
    expect(rapport).toContain('graine a11y-b, s=2, interactif, question 2')
    expect(rapport).toContain('`decorative: true`')
    expect(rapport).toContain('rediger-un-exercice.md#décrire-chaque-figure')
    expect(rapport).toContain('ne pas migrer tout le fichier')
  })

  it('compte demandeLaVue et une désignation comme à relire, pas comme défauts', () => {
    const bilan = new BilanExercice('6e/6G0-7.ts', 'bbbbb')
    bilan.signaleDemandeLaVue()
    bilan.ajouteFragment(
      { lieu: 'question 1', html: 'Le segment rouge.', enonce: true },
      { graine: 'a11y-a', cle: '', interactif: false },
    )
    expect(bilan.nbDefauts).toBe(0)
    expect(bilan.nbARelire).toBe(2)
    expect(redigeRapport(selection, [bilan])).toContain('À relire')
  })

  it('rapporte un exercice qui plante sans lever d’erreur', () => {
    const bilan = new BilanExercice('6e/6N1E.ts', 'aaaaa')
    bilan.erreurs.push('a11y-a : boucle sans issue')
    expect(redigeRapport(selection, [bilan])).toContain(
      'Non analysé : a11y-a : boucle sans issue.',
    )
  })

  it('reste court et sans conseil de migration quand tout va bien', () => {
    const rapport = redigeRapport(selection, [
      new BilanExercice('6e/6N1E.ts', 'aaaaa'),
    ])
    expect(rapport).toContain('1 exercice(s) analysé(s)')
    expect(rapport).not.toContain('migrer')
  })
})
