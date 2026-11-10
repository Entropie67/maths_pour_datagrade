import { afterEach, describe, expect, it } from 'vitest'
import {
  latexVersTexte,
  libellePourNom,
  lireIdentifiantChamp,
  nommeChampsAutourDe,
  nommeChampsDe,
  positionDansTableau,
  prefixeChamp,
  reponseNumerotee,
} from './nomAccessibleChamp'

afterEach(() => {
  document.body.innerHTML = ''
})

const nomDe = (id: string) =>
  document.getElementById(id)?.getAttribute('aria-label')

describe('morceaux du nom', () => {
  it('affiche les index à partir de 1', () => {
    expect(prefixeChamp(1, 2)).toBe('Exercice 2, question 3')
  })

  it('numérote la réponse seulement quand il y a plusieurs champs', () => {
    expect(reponseNumerotee(1, 1)).toBe('réponse')
    expect(reponseNumerotee(2, 4)).toBe('réponse 2 sur 4')
  })

  it('précise la position dans un tableau par les entêtes lisibles', () => {
    expect(positionDansTableau(2, 3)).toBe('ligne 2, colonne 3')
    expect(positionDansTableau(2, 3, 'Prix', 'x')).toBe(
      'ligne 2 (Prix), colonne 3 (x)',
    )
  })

  it.each([
    ['champTexteEx2Q3', 2, 3],
    ['champTexteEx0Q1L1C2', 0, 1],
    ['MetaInteractif2dEx4Q5field1', 4, 5],
    ['multi-mathfieldEx0Q7-field0', 0, 7],
    ['champTextetableau-hybrideEx1Q0L2C3', 1, 0],
  ])(
    'lit l’exercice et la question dans %s',
    (id, numeroExercice, questionIndex) => {
      expect(lireIdentifiantChamp(id)).toEqual({
        numeroExercice,
        questionIndex,
      })
    },
  )

  it('ne lit rien dans un identifiant sans exercice', () => {
    expect(lireIdentifiantChamp('tab-sv-toolbar-mathfield')).toBeNull()
  })
})

describe('latexVersTexte', () => {
  it.each([
    ['S=', 'S ='],
    ["f'(x)=", "f'(x) ="],
    ['{x}', 'x'],
    ['\\mathcal{A}=', 'A ='],
    ['3{,}5\\,\\text{cm}', '3,5 cm'],
    ['\\dfrac{3}{4}', '3/4'],
    ['x^2', 'x²'],
    ['u_{n}', 'u indice n'],
    ['a\\times b', 'a × b'],
  ])('transcrit %s', (latex, texte) => {
    expect(latexVersTexte(latex)?.replace(/\s+/g, ' ')).toBe(texte)
  })

  it.each(['\\overrightarrow{AB}', '\\sqrt{2}', 'P_{\\overset{a}{b}}'])(
    'refuse %s plutôt que de lire du code',
    (latex) => {
      expect(latexVersTexte(latex)).toBeNull()
    },
  )
})

describe('libellePourNom', () => {
  it.each([
    ['Réponse :', ''],
    ['réponse', ''],
    [' $=$ ', ''],
    ['=', ''],
    [' :', ''],
    ['  ', ''],
    ['vitesse', 'vitesse'],
    ['$S=$', 'S ='],
    ['Longueur $AB$ :', 'Longueur AB'],
    ['Valeur de $\\sqrt{2}$ :', ''],
  ])('nettoie « %s »', (source, libelle) => {
    expect(libellePourNom(source)).toBe(libelle)
  })
})

describe('nommeChampsAutourDe', () => {
  it('nomme un champ seul depuis sa question affichée, pas depuis son index', () => {
    document.body.innerHTML = `<li id="exercice1Q2"><math-field id="champTexteEx1Q104"></math-field></li>`
    nommeChampsAutourDe(document.getElementById('champTexteEx1Q104')!)
    expect(nomDe('champTexteEx1Q104')).toBe('Exercice 2, question 3 : réponse')
  })

  it('numérote les champs de la question', () => {
    document.body.innerHTML = `<li id="exercice0Q0"><math-field id="a"></math-field><mathalea-textfield><input id="b"></mathalea-textfield></li><li id="exercice0Q1"><math-field id="c"></math-field></li>`
    nommeChampsDe(document)
    expect(nomDe('a')).toBe('Exercice 1, question 1 : réponse 1 sur 2')
    expect(nomDe('b')).toBe('Exercice 1, question 1 : réponse 2 sur 2')
    expect(nomDe('c')).toBe('Exercice 1, question 2 : réponse')
  })

  it('renumérote quand un champ apparaît', () => {
    document.body.innerHTML = `<li id="exercice0Q0"><math-field id="a"></math-field></li>`
    nommeChampsDe(document)
    expect(nomDe('a')).toBe('Exercice 1, question 1 : réponse')
    const nouveau = document.createElement('math-field')
    nouveau.id = 'b'
    document.querySelector('li')?.append(nouveau)
    nommeChampsAutourDe(nouveau)
    expect(nomDe('a')).toBe('Exercice 1, question 1 : réponse 1 sur 2')
    expect(nomDe('b')).toBe('Exercice 1, question 1 : réponse 2 sur 2')
  })

  it('préfère le nom fourni par l’auteur, sans le compter dans les rangs', () => {
    document.body.innerHTML = `<li id="exercice0Q0"><math-field id="a" data-nom-accessible="longueur AB"></math-field><math-field id="b"></math-field></li>`
    nommeChampsDe(document)
    expect(nomDe('a')).toBe('Exercice 1, question 1 : longueur AB')
    expect(nomDe('b')).toBe('Exercice 1, question 1 : réponse')
  })

  it('n’écrase pas un aria-label posé par ailleurs', () => {
    document.body.innerHTML = `<li id="exercice0Q0"><math-field id="a" aria-label="Moyenne"></math-field></li>`
    nommeChampsDe(document)
    expect(nomDe('a')).toBe('Moyenne')
  })

  it('complète le nom par le label relié, sans lire KaTeX en double', () => {
    document.body.innerHTML = `<li id="exercice0Q0"><label for="a"><span class="katex"><span class="katex-mathml"><math><semantics><mrow><mi>S</mi><mo>=</mo></mrow><annotation encoding="application/x-tex">{S=}</annotation></semantics></math></span><span class="katex-html" aria-hidden="true">S=</span></span></label><math-field id="a"></math-field></li>`
    nommeChampsDe(document)
    expect(nomDe('a')).toBe('Exercice 1, question 1 : réponse, S =')
  })

  it('ignore un label fait d’une formule illisible', () => {
    document.body.innerHTML = `<li id="exercice0Q0"><label for="a">$\\overrightarrow{AB}=$</label><math-field id="a"></math-field></li>`
    nommeChampsDe(document)
    expect(nomDe('a')).toBe('Exercice 1, question 1 : réponse')
  })

  it('compte les blancs d’un texte à trous', () => {
    document.body.innerHTML = `<li id="exercice0Q0"><math-field id="a">x=\\placeholder[champ1]{}+\\placeholder[champ2]{}</math-field></li>`
    nommeChampsDe(document)
    expect(nomDe('a')).toBe('Exercice 1, question 1 : 2 réponses à compléter')
  })

  it('nomme une cellule par sa ligne, sa colonne et ses entêtes lisibles', () => {
    document.body.innerHTML = `<li id="exercice0Q0"><table><tr><th></th><th>$\\sqrt{2}$</th><th>$x$</th></tr><tr><th>Prix</th><td><math-field id="champTexteEx0Q0L1C1"></math-field></td><td><math-field id="champTexteEx0Q0L1C2"></math-field></td></tr></table></li>`
    nommeChampsDe(document)
    expect(nomDe('champTexteEx0Q0L1C1')).toBe(
      'Exercice 1, question 1 : ligne 2 (Prix), colonne 2',
    )
    expect(nomDe('champTexteEx0Q0L1C2')).toBe(
      'Exercice 1, question 1 : ligne 2 (Prix), colonne 3 (x)',
    )
  })

  it('lit le texte voisin d’un champ placé dans la légende du tableau', () => {
    document.body.innerHTML = `<li id="exercice0Q0"><table><caption><span>Moyenne : <math-field id="champTexteEx0Q0L6C1"></math-field></span></caption><tr><td><math-field id="champTexteEx0Q0L0C0"></math-field></td></tr></table></li>`
    nommeChampsDe(document)
    expect(nomDe('champTexteEx0Q0L6C1')).toBe(
      'Exercice 1, question 1 : réponse 1 sur 2, Moyenne',
    )
  })

  it('utilise le préfixe du conteneur (Course aux nombres)', () => {
    document.body.innerHTML = `<div data-prefixe-champs="Question 5"><math-field id="champTexteEx2Q0"></math-field></div>`
    nommeChampsDe(document)
    expect(nomDe('champTexteEx2Q0')).toBe('Question 5 : réponse')
  })

  it('se rabat sur l’identifiant hors d’une question affichée', () => {
    document.body.innerHTML = `<div><math-field id="champTexteEx1Q2"></math-field><math-field id="champTexteEx1Q2Etape1"></math-field><math-field id="champTexteEx1Q3"></math-field></div>`
    nommeChampsDe(document)
    expect(nomDe('champTexteEx1Q2')).toBe(
      'Exercice 2, question 3 : réponse 1 sur 2',
    )
    expect(nomDe('champTexteEx1Q3')).toBe('Exercice 2, question 4 : réponse')
  })

  it('traverse le shadow DOM des composants', () => {
    document.body.innerHTML = `<li id="exercice0Q0"><multi-mathfield id="m"></multi-mathfield></li>`
    const racine = document.getElementById('m')!.attachShadow({ mode: 'open' })
    racine.innerHTML = `<math-field id="a"></math-field><math-field id="b"></math-field>`
    nommeChampsAutourDe(racine.getElementById('a')!)
    expect(racine.getElementById('b')?.getAttribute('aria-label')).toBe(
      'Exercice 1, question 1 : réponse 2 sur 2',
    )
  })

  it('ne pose rien sur un champ sans contexte ou encore hors de la page', () => {
    document.body.innerHTML = `<math-field id="a"></math-field>`
    nommeChampsDe(document)
    expect(nomDe('a')).toBeNull()
    const detache = document.createElement('math-field')
    detache.id = 'champTexteEx0Q0'
    expect(nommeChampsAutourDe(detache)).toEqual([])
    expect(detache.hasAttribute('aria-label')).toBe(false)
  })
})
