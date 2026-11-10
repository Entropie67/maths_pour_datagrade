import { describe, expect, it } from 'vitest'
import {
  analyseReference,
  decaleFormule,
  evalueFormule,
  expressionNumerique,
  formuleAnglaise,
  formuleEnTex,
  formateReference,
  indexVersLettres,
  lettresVersIndex,
  recopieFormule,
  texteAffiche,
  valeurAffichee,
} from './tableurFormules'

describe('références', () => {
  it('convertit lettres et index', () => {
    expect(indexVersLettres(0)).toBe('A')
    expect(indexVersLettres(26)).toBe('AA')
    expect(lettresVersIndex('C')).toBe(2)
    expect(lettresVersIndex('AB')).toBe(27)
  })
  it('analyse et reformate une référence', () => {
    const r = analyseReference('$B3')
    expect(r).toEqual({
      colonne: 1,
      ligne: 2,
      colonneAbsolue: true,
      ligneAbsolue: false,
    })
    expect(formateReference(r!)).toBe('$B3')
    expect(analyseReference('B')).toBeNull()
  })
})

describe('recopie de formules', () => {
  it('décale les références relatives', () => {
    expect(decaleFormule('=B2*C2', 0, 1)).toBe('=B3*C3')
    expect(decaleFormule('=B2*C2', 2, 0)).toBe('=D2*E2')
  })
  it('respecte les $', () => {
    expect(decaleFormule('=$A2*B$1', 1, 1)).toBe('=$A3*C$1')
    expect(decaleFormule('=B2*$F$1', 3, 4)).toBe('=E6*$F$1')
    expect(decaleFormule('=$B2+B$2', 2, 2)).toBe('=$B4+D$2')
  })
  it('gère les plages et les fonctions', () => {
    expect(decaleFormule('=SUM(B2:B6)', 1, 0)).toBe('=SUM(C2:C6)')
    expect(decaleFormule('=SUM($B2:B$6)', 1, 1)).toBe('=SUM($B3:C$6)')
  })
  it('signale une référence sortie de la feuille', () => {
    expect(decaleFormule('=A1+B2', -1, 0)).toBe('=#REF!+A2')
  })
  it('recopie d’une cellule vers une autre', () => {
    expect(recopieFormule('=B2*C$1', 'D2', 'F5')).toBe('=D5*E$1')
    expect(recopieFormule('=B4+A1', 'C4', 'B3')).toBe('=A3+#REF!')
  })
})

describe('évaluation', () => {
  const cellules = { A1: 3, B1: 4, C1: 10, D1: '=A1*B1' }
  const val = (ref: string) => valeurAffichee(cellules, ref)
  it('respecte les priorités opératoires', () => {
    expect(evalueFormule('=A1+B1*2', val)).toBe(11)
    expect(evalueFormule('=(A1+B1)*2', val)).toBe(14)
    expect(evalueFormule('=2^3+1', val)).toBe(9)
    expect(evalueFormule('=C1/4', val)).toBe(2.5)
    expect(evalueFormule('= - A1 + 5', val)).toBe(2)
  })
  it('évalue les cellules contenant des formules', () => {
    expect(evalueFormule('=D1+1', val)).toBe(13)
  })
  it('évalue les fonctions', () => {
    expect(evalueFormule('=SUM(A1:C1)', val)).toBe(17)
    expect(evalueFormule('=SOMME(A1:B1;C1)', val)).toBe(17)
    expect(evalueFormule('=MOYENNE(A1:B1)', val)).toBe(3.5)
    expect(evalueFormule('=MAX(A1:C1)-MIN(A1:C1)', val)).toBe(7)
  })
  it('évalue RACINE et SQRT, en majuscules ou en minuscules', () => {
    expect(evalueFormule('=RACINE(A1*A1+B1*B1)', val)).toBe(5)
    expect(evalueFormule('=racine(16)+1', val)).toBe(5)
    expect(evalueFormule('=SQRT(C1+6)', val)).toBe(4)
    expect(() => evalueFormule('=RACINE(A1-B1)', val)).toThrow()
  })
  it('traite une cellule vide comme 0', () => {
    expect(evalueFormule('=A1+Z9', val)).toBe(3)
  })
  it('évite les artefacts flottants', () => {
    expect(evalueFormule('=0.1+0.2', val)).toBe(0.3)
  })
  it('refuse les formules invalides', () => {
    expect(() => evalueFormule('=A1B1', val)).toThrow()
    expect(() => evalueFormule('=A1/0', val)).toThrow()
    expect(() => evalueFormule('=(A1+B1', val)).toThrow()
    expect(() => evalueFormule('=A1+', val)).toThrow()
  })
})

describe('affichage d’une feuille', () => {
  it('affiche les erreurs comme un tableur', () => {
    const cellules = {
      A1: 5,
      B1: 0,
      C1: '=A1/B1',
      D1: '=A1B1',
      E1: '=E1+1',
      F1: '=A1*2',
      G1: 'texte',
    }
    expect(texteAffiche(cellules, 'C1')).toBe('#DIV/0!')
    expect(texteAffiche(cellules, 'D1')).toBe('#ERROR!')
    expect(texteAffiche(cellules, 'E1')).toBe('#ERROR!')
    expect(texteAffiche(cellules, 'F1')).toBe(10)
    expect(texteAffiche(cellules, 'G1')).toBe('texte')
    expect(texteAffiche(cellules, 'H1')).toBe('')
  })
})

describe('expression numérique', () => {
  it('remplace les références par les valeurs', () => {
    const cellules = { A1: 3, B2: 5, C3: -2, D4: '=A1*B2' }
    expect(expressionNumerique('=A1+B2*$C3', cellules)).toBe('3+5\\times (-2)')
    expect(expressionNumerique('=D4/B2', cellules)).toBe('15\\div 5')
    expect(expressionNumerique('=racine(A1+B2+1)', cellules)).toBe(
      '\\sqrt{3+5+1}',
    )
  })
})

describe('mise en forme', () => {
  it('convertit en notation anglaise', () => {
    expect(formuleAnglaise('=SOMME(B2:B6)/MOYENNE(A1:A2)')).toBe(
      '=SUM(B2:B6)/AVERAGE(A1:A2)',
    )
    expect(formuleAnglaise('=racine(A1)+Racine (B1)')).toBe(
      '=SQRT(A1)+SQRT(B1)',
    )
    expect(formuleAnglaise('=somme(A1;B1;C1)')).toBe('=SUM(A1,B1,C1)')
    expect(formuleAnglaise('=SQRT(A1)')).toBe('=SQRT(A1)')
  })
  it('protège les caractères spéciaux en LaTeX', () => {
    expect(formuleEnTex('=B2*$F$1^2')).toBe(
      '\\text{=B2*\\$F\\$1\\textasciicircum{}2}',
    )
  })
})
