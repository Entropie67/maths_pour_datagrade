import { describe, expect, it } from 'vitest'
import {
  calculeNombreDeColonnes,
  doitAfficherFormuleComplete,
  extraitLettresQcm,
  extraitReponsesCourtes,
  formuleReponseCourte,
  repartisEnColonnes,
} from '../../src/components/setup/diaporama/answersTable'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../src/lib/outils/embellissements'
import type { IExercice } from '../../src/lib/types'

function exerciceAvecPropositions(
  propositions: Array<{ texte: string; statut?: boolean }>,
): IExercice {
  return { autoCorrection: [{ propositions }] } as unknown as IExercice
}

describe('extraitReponsesCourtes', () => {
  it("extrait le contenu d'une mise en évidence", () => {
    const correction = `Le résultat est $2\\times 3 = ${miseEnEvidence('6')}$.`
    expect(extraitReponsesCourtes(correction)).toEqual(['$\\boldsymbol{6}$'])
  })

  it('gère les accolades imbriquées', () => {
    const correction = `$${miseEnEvidence('\\dfrac{3}{4}')}$`
    expect(extraitReponsesCourtes(correction)).toEqual([
      '$\\boldsymbol{\\dfrac{3}{4}}$',
    ])
  })

  it('conserve l’ordre et supprime les doublons', () => {
    const correction = `$${miseEnEvidence('12')}$ puis $${miseEnEvidence('5')}$ et enfin $${miseEnEvidence('12')}$`
    expect(extraitReponsesCourtes(correction)).toEqual([
      '$\\boldsymbol{12}$',
      '$\\boldsymbol{5}$',
    ])
  })

  it('ignore les mises en évidence dans une autre couleur', () => {
    const correction = `$${miseEnEvidence('7', 'blue')}$`
    expect(extraitReponsesCourtes(correction)).toEqual([])
  })

  it('renvoie un tableau vide sans mise en évidence', () => {
    expect(extraitReponsesCourtes('Aucune couleur ici.')).toEqual([])
  })

  it('extrait aussi les textes en orange et gras, dans l’ordre', () => {
    const correction = `Les droites sont ${texteEnCouleurEtGras('parallèles')} et $d=${miseEnEvidence('3')}$.`
    expect(extraitReponsesCourtes(correction)).toEqual([
      '<b>parallèles</b>',
      '$\\boldsymbol{3}$',
    ])
  })

  it('ignore les textes en orange pour un QCM (lettres déjà affichées)', () => {
    const correction = `${texteEnCouleurEtGras('B')}. $${miseEnEvidence('12')}$`
    expect(extraitReponsesCourtes(correction, false)).toEqual([
      '$\\boldsymbol{12}$',
    ])
  })
})

describe('formuleReponseCourte', () => {
  it('réécrit une formule grasse sans couleur', () => {
    expect(formuleReponseCourte('6')).toBe('$\\boldsymbol{6}$')
  })

  it('réécrit un texte en gras sans couleur', () => {
    expect(formuleReponseCourte('parallèles', 'texte')).toBe(
      '<b>parallèles</b>',
    )
  })
})

describe('doitAfficherFormuleComplete', () => {
  it('affiche la formule complète pour plusieurs réponses courtes (remplisLesBlancs)', () => {
    expect(doitAfficherFormuleComplete([], ['83', '100', '83'])).toBe(true)
  })

  it("n'affiche pas la formule complète pour une seule réponse courte", () => {
    expect(doitAfficherFormuleComplete([], ['6'])).toBe(false)
  })

  it("n'affiche pas la formule complète sans réponse courte", () => {
    expect(doitAfficherFormuleComplete([], [])).toBe(false)
  })

  it('ne concerne pas les QCM même avec plusieurs réponses courtes', () => {
    expect(doitAfficherFormuleComplete(['A'], ['83', '100'])).toBe(false)
  })
})

describe('extraitLettresQcm', () => {
  it('renvoie la lettre de la bonne proposition', () => {
    const exercice = exerciceAvecPropositions([
      { texte: '$1$', statut: false },
      { texte: '$2$', statut: true },
      { texte: '$3$', statut: false },
    ])
    expect(extraitLettresQcm(exercice, 0)).toEqual(['B'])
  })

  it('renvoie toutes les lettres des bonnes propositions', () => {
    const exercice = exerciceAvecPropositions([
      { texte: '$1$', statut: true },
      { texte: '$2$', statut: false },
      { texte: '$3$', statut: true },
    ])
    expect(extraitLettresQcm(exercice, 0)).toEqual(['A', 'C'])
  })

  it("renvoie un tableau vide quand la question n'est pas un QCM", () => {
    const exercice = { autoCorrection: [{}] } as unknown as IExercice
    expect(extraitLettresQcm(exercice, 0)).toEqual([])
  })
})

describe('calculeNombreDeColonnes', () => {
  it('renvoie 2 colonnes sous le premier seuil', () => {
    expect(calculeNombreDeColonnes(800, 20)).toBe(2)
  })

  it('répartit quatre questions sur deux colonnes, quelle que soit la largeur', () => {
    expect(calculeNombreDeColonnes(1100, 4)).toBe(2)
    expect(calculeNombreDeColonnes(1600, 4)).toBe(2)
  })

  it('renvoie 3 colonnes entre les deux seuils', () => {
    expect(calculeNombreDeColonnes(1200, 20)).toBe(3)
  })

  it('renvoie 4 colonnes au-delà du second seuil', () => {
    expect(calculeNombreDeColonnes(1600, 20)).toBe(4)
  })

  it('ne dépasse jamais le nombre de questions', () => {
    expect(calculeNombreDeColonnes(1600, 3)).toBe(3)
  })

  it("renvoie au moins 1 colonne s'il n'y a qu'une question", () => {
    expect(calculeNombreDeColonnes(1600, 1)).toBe(1)
  })
})

describe('repartisEnColonnes', () => {
  it('répartit équitablement quand le total est divisible', () => {
    const order = [0, 1, 2, 3, 4, 5]
    expect(repartisEnColonnes(order, 3)).toEqual([
      { indexDeDepart: 0, lignes: [0, 1] },
      { indexDeDepart: 2, lignes: [2, 3] },
      { indexDeDepart: 4, lignes: [4, 5] },
    ])
  })

  it('donne les questions en trop aux premières colonnes', () => {
    const order = [0, 1, 2, 3, 4]
    expect(repartisEnColonnes(order, 4)).toEqual([
      { indexDeDepart: 0, lignes: [0, 1] },
      { indexDeDepart: 2, lignes: [2] },
      { indexDeDepart: 3, lignes: [3] },
      { indexDeDepart: 4, lignes: [4] },
    ])
  })

  it('conserve l’ordre original de `order` (pas celui des slides)', () => {
    const order = [5, 2, 8]
    expect(repartisEnColonnes(order, 2)).toEqual([
      { indexDeDepart: 0, lignes: [5, 2] },
      { indexDeDepart: 2, lignes: [8] },
    ])
  })

  it('renvoie un tableau vide sans questions', () => {
    expect(repartisEnColonnes([], 3)).toEqual([])
  })
})
