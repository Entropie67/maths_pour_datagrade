import ScratchInterpreter from '@scratch2latex/scratch-core/ScratchInterpreter'
import { ScratchSimulator } from '@scratch2latex/scratch-core/ScratchSimulator'
import { describe, expect, it, vi } from 'vitest'

type ScratchSimulatorTestHarness = {
  codeDiv: HTMLDivElement
  codeBlocks: Array<{ element: SVGGElement; text: string; children: any[] }>
  allRenderedBlocks: Array<{
    element: SVGGElement
    text: string
    children: any[]
  }>
  customDefinitionGroups: Set<SVGGElement>
  conditionBlockElements: Set<SVGGElement>
  executionIndexToBlockId: Map<number, string>
  scratchCode: string
  customDefinitionEntryIdBySignature?: Map<string, string>
  customDefinitionBodyIdsBySignature?: Map<string, Set<string>>
  buildExecutionIndexToSelectorMap: () => Promise<void>
}

describe('ScratchInterpreter', () => {
  it('met a jour les variables avec blockvariable + repeat', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre  \\selectmenu{compteur} à \\ovalnum{0}}
\\blockrepeat{répéter \\ovalnum{3} fois}{
\\blockvariable{Ajouter \\ovalnum{1} à \\ovalvariable{compteur}}
}
\\blocklook{Dire \\ovalvariable{compteur}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0, {
      skipWaitBlocks: true,
    })

    expect(result.variables.compteur).toBe(3)
    expect(result.messages).toEqual(['3'])
  })

  it('met a jour les variables en mode anime a chaque etape', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre  \\selectmenu{compteur} à \\ovalnum{0}}
\\blockrepeat{répéter \\ovalnum{3} fois}{
\\blockvariable{Ajouter \\ovalnum{1} à \\ovalvariable{compteur}}
}
\\blocklook{Dire \\ovalvariable{compteur}}
\\end{scratch}`

    const snapshots: number[] = []

    const result = await interpreter.executeAnimated(
      code,
      () => {
        snapshots.push(interpreter.getCurrentState().variables.compteur ?? 0)
      },
      0,
    )

    expect(result.variables.compteur).toBe(3)
    expect(result.messages).toEqual(['3'])
    expect(snapshots).toContain(1)
    expect(snapshots).toContain(2)
    expect(snapshots).toContain(3)
  })

  it('evalue les ovaloperator imbriques avec variables', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{compteur} à \\ovalnum{5}}
\\blockvariable{mettre \\selectmenu{compteur} à \\ovaloperator{\\ovalvariable{compteur} - \\ovalnum{1}}}
\\blockvariable{mettre \\selectmenu{resultat} à \\ovaloperator{\\ovaloperator{\\ovalnum{2}+\\ovalnum{3}}*\\ovalvariable{compteur}}}
\\blocklook{Dire \\ovalvariable{resultat}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.variables.compteur).toBe(4)
    expect(result.variables.resultat).toBe(20)
    expect(result.messages).toEqual(['20'])
  })

  it('gere blocklook dire et penser avec variable', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{compteur} à \\ovalnum{7}}
\\blocklook{dire \\ovalvariable{compteur} pendant \\ovalnum{2} secondes}
\\blocklook{penser \\ovalvariable{compteur}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.messages).toEqual(['7', '7'])
  })

  it('gere blocklook dire avec ovalnum textuel sans convertir en 0', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blocklook{dire \\ovalnum{Bonjour}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.messages).toEqual(['Bonjour'])
  })

  it('gere blocklook cacher puis montrer via la propriete visible', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const codeHideOnly = `\\begin{scratch}[blocks]
\\blocklook{cacher}
\\end{scratch}`

    const hideOnlyResult = await interpreter.executeAnimated(
      codeHideOnly,
      () => {},
      0,
    )

    expect(hideOnlyResult.visible).toBe(false)

    const codeHideThenShow = `\\begin{scratch}[blocks]
\\blocklook{cacher}
\\blocklook{montrer}
\\end{scratch}`

    const hideThenShowResult = await interpreter.executeAnimated(
      codeHideThenShow,
      () => {},
      0,
    )

    expect(hideThenShowResult.visible).toBe(true)
  })

  it('mode dry saute les attentes des blocs dire pendant', async () => {
    const code = `\\begin{scratch}[blocks]
\\blocklook{dire Bonjour pendant \\ovalnum{0.2} secondes}
\\blocklook{dire Salut pendant \\ovalnum{0.2} secondes}
\\blocklook{dire Coucou pendant \\ovalnum{0.2} secondes}
\\end{scratch}`

    const normalInterpreter = new ScratchInterpreter(200, 200, 90)
    const normalStart = Date.now()
    const normalResult = await normalInterpreter.executeAnimated(
      code,
      () => {},
      0,
    )
    const normalDurationMs = Date.now() - normalStart

    const dryInterpreter = new ScratchInterpreter(200, 200, 90)
    const dryStart = Date.now()
    const dryResult = await dryInterpreter.executeAnimated(code, () => {}, 0, {
      skipWaitBlocks: true,
    })
    const dryDurationMs = Date.now() - dryStart

    expect(normalResult.messages).toEqual(['Bonjour', 'Salut', 'Coucou'])
    expect(dryResult.messages).toEqual(['Bonjour', 'Salut', 'Coucou'])
    expect(normalDurationMs).toBeGreaterThanOrEqual(450)
    expect(dryDurationMs).toBeLessThan(normalDurationMs / 2)
  })

  it("declenche un script 'quand la touche espace est pressee'", async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockinit{quand la touche \\selectmenu{espace} est pressée}
\\blockvariable{mettre \\selectmenu{ok} à \\ovalnum{1}}
\\end{scratch}`

    const execution = interpreter.executeAnimated(code, () => {}, 0)
    interpreter.triggerKeyPress(' ')
    const result = await execution

    expect(result.variables.ok).toBe(1)
  })

  it("gere blockmove 'ajouter ... a x'", async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockmove{ajouter \\ovalnum{5} à x}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.finalX).toBe(205)
    expect(result.finalY).toBe(200)
  })

  it("gere blockmove 'ajouter ... a y'", async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockmove{ajouter \\ovalnum{5} à y}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.finalX).toBe(200)
    expect(result.finalY).toBe(195)
  })

  it("trace avec stylo lors des blockmove 'ajouter ... a x/y'", async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockpen{stylo en position d'écriture}
\\blockmove{ajouter \\ovalnum{15} à x}
\\blockmove{ajouter \\ovalnum{15} à y}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.traces.length).toBe(2)
    expect(result.traces[0]).toEqual({
      startX: 200,
      startY: 200,
      endX: 215,
      endY: 200,
      color: '#0066cc',
      width: 3,
    })
    expect(result.traces[1]).toEqual({
      startX: 215,
      startY: 200,
      endX: 215,
      endY: 185,
      color: '#0066cc',
      width: 3,
    })
  })

  it("borne 'aller a x:y' a la scene Scratch et trace jusqu'au bord", async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockpen{stylo en position d'écriture}
\\blockmove{aller à x: \\ovalnum{-180} y: \\ovalnum{-340}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.finalX).toBe(20)
    expect(result.finalY).toBe(400)
    expect(result.traces).toHaveLength(1)
    expect(result.traces[0]).toEqual({
      startX: 200,
      startY: 200,
      endX: 20,
      endY: 400,
      color: '#0066cc',
      width: 3,
    })
  })

  it("borne 'mettre x/y a' a la scene Scratch et conserve le trace", async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockpen{stylo en position d'écriture}
\\blockmove{mettre x à \\ovalnum{260}}
\\blockmove{mettre y à \\ovalnum{-260}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.finalX).toBe(400)
    expect(result.finalY).toBe(400)
    expect(result.traces).toHaveLength(2)
    expect(result.traces[0]).toEqual({
      startX: 200,
      startY: 200,
      endX: 400,
      endY: 200,
      color: '#0066cc',
      width: 3,
    })
    expect(result.traces[1]).toEqual({
      startX: 400,
      startY: 200,
      endX: 400,
      endY: 400,
      color: '#0066cc',
      width: 3,
    })
  })

  it("borne 'avancer de' a la scene Scratch et trace jusqu'au bord", async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockmove{aller à x: \\ovalnum{190} y: \\ovalnum{0}}
\\blockmove{s'orienter à \\ovalnum{90}}
\\blockpen{stylo en position d'écriture}
\\blockmove{avancer de \\ovalnum{30} pas}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.finalX).toBe(400)
    expect(result.finalY).toBe(200)
    expect(result.traces).toHaveLength(1)
    expect(result.traces[0]).toEqual({
      startX: 390,
      startY: 200,
      endX: 400,
      endY: 200,
      color: '#0066cc',
      width: 3,
    })
  })

  it("evalue ovalvariable dans 'aller a x:y' sans confondre avec les variables reservees", async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{x} à \\ovalnum{50}}
\\blockvariable{mettre \\selectmenu{y} à \\ovalnum{-30}}
\\blockpen{stylo en position d'écriture}
\\blockmove{aller à x: \\ovalvariable{x} y: \\ovalvariable{y}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.variables.x).toBe(50)
    expect(result.variables.y).toBe(-30)
    expect(result.finalX).toBe(250)
    expect(result.finalY).toBe(230)
    expect(result.traces).toHaveLength(1)
    expect(result.traces[0]).toEqual({
      startX: 200,
      startY: 200,
      endX: 250,
      endY: 230,
      color: '#0066cc',
      width: 3,
    })
  })

  it("evalue ovaloperator dans 'aller a x:y'", async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{x} à \\ovalnum{50}}
\\blockvariable{mettre \\selectmenu{y} à \\ovalnum{-30}}
\\blockpen{stylo en position d'écriture}
\\blockmove{aller à x: \\ovaloperator{\\ovalvariable{x}+\\ovalnum{10}} y: \\ovaloperator{\\ovalvariable{y}-\\ovalnum{20}}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.finalX).toBe(260)
    expect(result.finalY).toBe(250)
    expect(result.traces).toHaveLength(1)
    expect(result.traces[0]).toEqual({
      startX: 200,
      startY: 200,
      endX: 260,
      endY: 250,
      color: '#0066cc',
      width: 3,
    })
  })

  it('gere blocklist ajouter/supprimer et ovallist longueur de liste', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blocklist{ajouter \\ovalnum{11} à \\selectmenu{triplets}}
\\blocklist{ajouter \\ovalnum{22} à \\selectmenu{triplets}}
\\blockrepeat{répéter jusqu'à ce que \\booloperator{\\ovallist{longueur de \\selectmenu{triplets}} = \\ovalnum{0}}}
{
  \\blocklist{supprimer l'élément \\ovallist{longueur de \\selectmenu{triplets}} de \\selectmenu{triplets}}
}
\\blockvariable{mettre \\selectmenu{taille} à \\ovallist{longueur de \\selectmenu{triplets}}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.variables.taille).toBe(0)
  })

  it('gere ovallist element ... de ... avec index 1-based', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blocklist{ajouter \\ovalnum{11} à \\selectmenu{triplets}}
\\blocklist{ajouter \\ovalnum{22} à \\selectmenu{triplets}}
\\blocklist{ajouter \\ovalnum{33} à \\selectmenu{triplets}}
\\blockvariable{mettre \\selectmenu{element2} à \\ovallist{élément \\ovalnum{2} de \\selectmenu{triplets}}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.variables.element2).toBe(22)
  })

  it('gere ovallist numero de ... dans ...', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blocklist{ajouter \\ovalnum{11} à \\selectmenu{triplets}}
\\blocklist{ajouter \\ovalnum{22} à \\selectmenu{triplets}}
\\blocklist{ajouter \\ovalnum{33} à \\selectmenu{triplets}}
\\blockvariable{mettre \\selectmenu{rang22} à \\ovallist{numéro de \\ovalnum{22} dans \\selectmenu{triplets}}}
\\blockvariable{mettre \\selectmenu{rang44} à \\ovallist{numéro de \\ovalnum{44} dans \\selectmenu{triplets}}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.variables.rang22).toBe(2)
    expect(result.variables.rang44).toBe(0)
  })

  it('gere blocklook dire avec ovallist nomDeListe', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blocklist{ajouter \\ovalnum{11} à \\selectmenu{maListe}}
\\blocklist{ajouter \\ovalnum{22} à \\selectmenu{maListe}}
\\blocklook{dire \\ovallist{maListe}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.messages).toEqual(['11 22'])
  })

  it('gere la couleur du stylo via pencolor puis trace avec cette couleur', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockpen{mettre la couleur du stylo à \\pencolor{#ff0000}}
\\blockpen{stylo en position d'écriture}
\\blockmove{avancer de \\ovalnum{10} pas}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.traces).toHaveLength(1)
    expect(result.traces[0].color).toBe('#ff0000')
    expect(result.traces[0].width).toBe(3)
  })

  it("gere blockpen 'effacer tout' en supprimant les traces", async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockpen{stylo en position d'écriture}
\\blockmove{avancer de \\ovalnum{10} pas}
\\blockpen{effacer tout}
\\blockmove{avancer de \\ovalnum{10} pas}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.traces).toHaveLength(1)
    expect(result.traces[0]).toEqual({
      startX: 210,
      startY: 200,
      endX: 220,
      endY: 200,
      color: '#0066cc',
      width: 3,
    })
  })

  it('gere la couleur du stylo via pencolor HTML imbrique', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockpen{mettre la couleur du stylo à \\pencolor{[HTML]{CB4AD4}}}
\\blockpen{stylo en position d'écriture}
\\blockmove{avancer de \\ovalnum{10} pas}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.traces).toHaveLength(1)
    expect(result.traces[0].color).toBe('#CB4AD4')
  })

  it('gere la couleur du stylo via ovalnum puis ajout a la couleur', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockpen{mettre la couleur du stylo à \\ovalnum{50}}
\\blockpen{stylo en position d'écriture}
\\blockmove{avancer de \\ovalnum{10} pas}
\\blockpen{ajouter \\ovalnum{10} à la couleur du stylo}
\\blockmove{avancer de \\ovalnum{10} pas}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.traces).toHaveLength(2)
    expect(result.traces[0].color).toBe('hsla(90, 100%, 50%, 1)')
    expect(result.traces[1].color).toBe('hsla(108, 100%, 50%, 1)')
  })

  it('gere la taille du stylo pour la largeur des traces', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockpen{mettre la taille du stylo à \\ovalnum{6}}
\\blockpen{stylo en position d'écriture}
\\blockmove{avancer de \\ovalnum{10} pas}
\\blockpen{ajouter \\ovalnum{2} à la taille du stylo}
\\blockmove{avancer de \\ovalnum{10} pas}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.traces).toHaveLength(2)
    expect(result.traces[0].width).toBe(6)
    expect(result.traces[1].width).toBe(8)
  })

  it('traite selectmenu commente comme parametre couleur du stylo', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockpen{mettre la couleur du stylo à \\ovalnum{50}}
\\blockpen{stylo en position d'écriture}
\\blockmove{avancer de \\ovalnum{10} pas}
\\blockpen{ajouter \\ovalnum{10} à \\selectmenu{% non pris en charge: pen\\_menu\\_colorParam} du stylo}
\\blockmove{avancer de \\ovalnum{10} pas}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.traces).toHaveLength(2)
    expect(result.traces[0].color).toBe('hsla(90, 100%, 50%, 1)')
    expect(result.traces[1].color).toBe('hsla(108, 100%, 50%, 1)')
  })

  it("gere blockmove 'mettre x a ...'", async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockmove{mettre x à \\ovalnum{5}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.finalX).toBe(205)
    expect(result.finalY).toBe(200)
  })

  it("gere blockmove 'mettre y a ...'", async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockmove{mettre y à \\ovalnum{5}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.finalX).toBe(200)
    expect(result.finalY).toBe(195)
  })

  it('gere les variables reservees abscisse x, ordonnee y et direction', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{abscisse x} à \\ovalnum{12}}
\\blockvariable{mettre \\selectmenu{ordonnée y} à \\ovalnum{-3}}
\\blockvariable{mettre \\selectmenu{direction} à \\ovalnum{45}}
\\blocklook{dire \\ovalvariable{abscisse x}}
\\blocklook{dire \\ovalvariable{ordonnée y}}
\\blocklook{dire \\ovalvariable{direction}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.finalX).toBe(212)
    expect(result.finalY).toBe(203)
    expect(result.finalAngle).toBe(45)
    expect(result.messages).toEqual(['12', '-3', '45'])
  })

  it('gere Ajouter sur variables reservees', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{Ajouter \\ovalnum{5} à \\ovalvariable{abscisse x}}
\\blockvariable{Ajouter \\ovalnum{2} à \\ovalvariable{ordonnée y}}
\\blockvariable{Ajouter \\ovalnum{10} à \\ovalvariable{direction}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.finalX).toBe(205)
    expect(result.finalY).toBe(198)
    expect(result.finalAngle).toBe(100)
  })

  it('normalise la direction dans les bornes Scratch [-180, 180]', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{direction} à \\ovalnum{181}}
\\blocklook{dire \\ovalvariable{direction}}
\\blockvariable{mettre \\selectmenu{direction} à \\ovalnum{-181}}
\\blocklook{dire \\ovalvariable{direction}}
\\blockvariable{mettre \\selectmenu{direction} à \\ovalnum{540}}
\\blocklook{dire \\ovalvariable{direction}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.messages).toEqual(['-179', '179', '180'])
    expect(result.finalAngle).toBe(180)
  })

  it('normalise -180 en 180 pour la direction', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{direction} à \\ovalnum{-180}}
\\blocklook{dire \\ovalvariable{direction}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.messages).toEqual(['180'])
    expect(result.finalAngle).toBe(180)
  })

  it("gere blockrepeat jusqu'à ce que avec booloperator <", async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{compteur} à \\ovalnum{0}}
\\blockrepeat{répéter jusqu'à ce que \\booloperator{\\ovalvariable{compteur} > 5}}{
\\blockvariable{Ajouter \\ovalnum{1} à \\ovalvariable{compteur}}
}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.variables.compteur).toBe(6)
  })

  it("gere blockrepeat jusqu'à ce que avec booloperator <=", async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{x} à \\ovalnum{1}}
\\blockrepeat{répéter jusqu'à ce que \\booloperator{\\ovalvariable{x} >= 10}}{
\\blockvariable{Ajouter \\ovalnum{2} à \\ovalvariable{x}}
}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.variables.x).toBe(11)
  })

  it("gere blockrepeat jusqu'à ce que avec booloperator =", async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{compteur} à \\ovalnum{0}}
\\blockrepeat{répéter jusqu'à ce que \\booloperator{\\ovalvariable{compteur} = 3}}{
\\blockvariable{Ajouter \\ovalnum{1} à \\ovalvariable{compteur}}
}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.variables.compteur).toBe(3)
  })

  it("gere blockrepeat jusqu'à ce que en mode anime", async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{compteur} à \\ovalnum{0}}
\\blockrepeat{répéter jusqu'à ce que \\booloperator{\\ovalvariable{compteur} > 3}}{
\\blockvariable{Ajouter \\ovalnum{1} à \\ovalvariable{compteur}}
}
\\end{scratch}`

    const snapshots: number[] = []

    const result = await interpreter.executeAnimated(
      code,
      () => {
        snapshots.push(interpreter.getCurrentState().variables.compteur ?? 0)
      },
      0,
    )

    expect(result.variables.compteur).toBe(4)
    expect(snapshots).toContain(1)
    expect(snapshots).toContain(2)
    expect(snapshots).toContain(3)
    expect(snapshots).toContain(4)
  })

  it('expose les compteurs d iterations pour les boucles repeat imbriquees', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{c} à \\ovalnum{0}}
\\blockrepeat{répéter \\ovalnum{2} fois}{
\\blockrepeat{répéter \\ovalnum{3} fois}{
\\blockvariable{Ajouter \\ovalnum{1} à \\ovalvariable{c}}
}
}
\\end{scratch}`

    const iterationSnapshots: Array<string> = []

    const result = await interpreter.executeAnimated(
      code,
      () => {
        const iterations = interpreter.getCurrentState().repeatIterations ?? []
        if (iterations.length > 0) {
          iterationSnapshots.push(
            iterations
              .map(
                (it) =>
                  `${it.level}:${it.current}/${it.total === null ? '?' : it.total}`,
              )
              .join('|'),
          )
        }
      },
      0,
    )

    expect(result.variables.c).toBe(6)
    expect(iterationSnapshots.some((entry) => entry.includes('1:1/2'))).toBe(
      true,
    )
    expect(iterationSnapshots.some((entry) => entry.includes('2:1/3'))).toBe(
      true,
    )
    expect(iterationSnapshots.some((entry) => entry.includes('2:3/3'))).toBe(
      true,
    )
    expect(result.repeatIterations).toEqual([])
  })

  it('gere initmoreblocks avec repeat sans fuite dans le flux principal', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\initmoreblocks{définir \\namemoreblocks{Compter4}}
\\blockrepeat{répéter \\ovalnum{4} fois}{
\\blockvariable{Ajouter \\ovalnum{1} à \\ovalvariable{compteur}}
}
\\blockinit{quand \\greenflag est cliqué}
\\blockvariable{mettre \\selectmenu{compteur} à \\ovalnum{0}}
\\blockrepeat{répéter \\ovalnum{2} fois}{
\\blockmoreblocks{Compter4}
}
\\blockvariable{Ajouter \\ovalnum{10} à \\ovalvariable{compteur}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0, {
      skipWaitBlocks: true,
    })

    expect(result.variables.compteur).toBe(18)
  })

  it('execute completement un bloc personnalise contenant une boucle de dessin', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\initmoreblocks{définir \\namemoreblocks{Carré}}
\\blockrepeat{répéter \\ovalnum{4} fois}
{
  \\blockmove{avancer de \\ovalnum{50} pas}
  \\blockmove{tourner \\turnright{} de \\ovalnum{90} degrés}
}
\\blockinit{quand \\greenflag est cliqué}
\\blockpen{stylo en position d'écriture}
\\blockrepeat{répéter \\ovalnum{10} fois}
{
  \\blockmoreblocks{Carré}
  \\blockmove{tourner \\turnright{} de \\ovalnum{36} degrés}
}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0, {
      skipWaitBlocks: true,
    })

    expect(result.traces.length).toBe(40)
  })

  it('exécute un bloc personnalisé paramétré (nom avec underscore échappé)', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\initmoreblocks{définir \\namemoreblocks{polygone\\_régulier \\ovalmoreblocks{number1} \\ovalmoreblocks{number2}}}
\\blockrepeat{répéter \\ovalmoreblocks{number1} fois}
{
  \\blockmove{avancer de \\ovalmoreblocks{number2} pas}
  \\blockmove{tourner \\turnright{} de \\ovaloperator{\\ovalnum{360} / \\ovalmoreblocks{number1}} degrés}
}
\\blockinit{quand \\greenflag est cliqué}
\\blockpen{stylo en position d'écriture}
\\blockmoreblocks{polygone\\_régulier \\ovalnum{3} \\ovalnum{40}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0, {
      skipWaitBlocks: true,
    })

    expect(result.traces.length).toBe(3)
  })

  it('évalue les arguments de bloc custom à l’appel et évite la récursion auto-référente', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = String.raw`\begin{scratch}[blocks]
\initmoreblocks{définir \namemoreblocks{branche \ovalmoreblocks{taille}}}
\blockvariable{Ajouter \ovalnum{1} à \ovalvariable{compteur}}
\blockif{si \booloperator{\ovalmoreblocks{taille} > \ovalnum{1}} alors}{
\blockmoreblocks{branche \ovaloperator{\ovalmoreblocks{taille} / \ovalnum{2}}}
}
\blockinit{quand \greenflag est cliqué}
\blockvariable{mettre \selectmenu{compteur} à \ovalnum{0}}
\blockmoreblocks{branche \ovalnum{8}}
\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0, {
      skipWaitBlocks: true,
    })

    expect(result.variables.compteur).toBe(4)
  })

  it('gere blockifelse avec condition vraie', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{x} à \\ovalnum{10}}
\\blockifelse{si \\booloperator{\\ovalvariable{x} > 5} alors}{
\\blockvariable{mettre \\selectmenu{resultat} à \\ovalnum{1}}
}{
\\blockvariable{mettre \\selectmenu{resultat} à \\ovalnum{0}}
}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.variables.x).toBe(10)
    expect(result.variables.resultat).toBe(1)
  })

  it('ne gere pas booloperator ==', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{a} à \\ovalnum{4}}
\\blockifelse{si \\booloperator{\\ovalvariable{a} == \\ovalnum{4}} alors}{
\\blockvariable{mettre \\selectmenu{resultat} à \\ovalnum{1}}
}{
\\blockvariable{mettre \\selectmenu{resultat} à \\ovalnum{0}}
}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.variables.resultat).toBe(0)
  })

  it('gere booloperator = avec valeurs textuelles', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blocksensing{demander \\ovalnum{Ton nom} et attendre}
\\blockifelse{si \\booloperator{\\ovalsensing{réponse} = \\ovalnum{Alice}} alors}{
\\blockvariable{mettre \\selectmenu{ok} à \\ovalnum{1}}
}{
\\blockvariable{mettre \\selectmenu{ok} à \\ovalnum{0}}
}
\\end{scratch}`

    interpreter.onAskInput = async () => 'Alice'
    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.variables.ok).toBe(1)
  })

  it('gere blockifelse avec condition fausse', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{x} à \\ovalnum{3}}
\\blockifelse{si \\booloperator{\\ovalvariable{x} > 5} alors}{
\\blockvariable{mettre \\selectmenu{resultat} à \\ovalnum{1}}
}{
\\blockvariable{mettre \\selectmenu{resultat} à \\ovalnum{0}}
}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.variables.x).toBe(3)
    expect(result.variables.resultat).toBe(0)
  })

  it('gere blockif simple avec condition fausse (sync)', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{x} à \\ovalnum{0}}
\\blockif{si \\booloperator{\\ovalvariable{x} > 5} alors}{
\\blockmove{ajouter \\ovalnum{15} à y}
}
\\blockmove{ajouter \\ovalnum{15} à x}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.finalX).toBe(215)
    expect(result.finalY).toBe(200)
  })

  it('gere blockif simple avec condition fausse (anime)', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{x} à \\ovalnum{0}}
\\blockif{si \\booloperator{\\ovalvariable{x} > 5} alors}{
\\blockmove{ajouter \\ovalnum{15} à y}
}
\\blockmove{ajouter \\ovalnum{15} à x}
\\end{scratch}`

    const instructions: string[] = []

    const result = await interpreter.executeAnimated(
      code,
      () => {
        const state = interpreter.getCurrentState()
        if (state.currentInstruction) {
          instructions.push(state.currentInstruction)
        }
      },
      0,
    )

    expect(result.finalX).toBe(215)
    expect(result.finalY).toBe(200)
    expect(instructions.some((item) => item.includes('Ajouter 15 a y'))).toBe(
      false,
    )
    expect(instructions.some((item) => item.includes('Ajouter 15 a x'))).toBe(
      true,
    )
  })

  it('gere blockifelse avec operateurs comparaison', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{a} à \\ovalnum{5}}
\\blockvariable{mettre \\selectmenu{b} à \\ovalnum{5}}
\\blockifelse{si \\booloperator{\\ovalvariable{a} = \\ovalvariable{b}} alors}{
\\blockvariable{mettre \\selectmenu{egal} à \\ovalnum{1}}
}{
\\blockvariable{mettre \\selectmenu{egal} à \\ovalnum{0}}
}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.variables.a).toBe(5)
    expect(result.variables.b).toBe(5)
    expect(result.variables.egal).toBe(1)
  })

  it('gere booloperator imbriques avec non et et ou', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{x} à \\ovalnum{4}}
\\blockifelse{si \\booloperator{\\booloperator{\\ovalvariable{x} > \\ovalnum{10}} ou \\booloperator{non \\booloperator{\\booloperator{\\ovalvariable{x} = \\ovalnum{4}} et \\booloperator{\\ovalvariable{x} < \\ovalnum{6}}}}} alors}{
\\blockvariable{mettre \\selectmenu{ok} à \\ovalnum{0}}
}{
\\blockvariable{mettre \\selectmenu{ok} à \\ovalnum{1}}
}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.variables.ok).toBe(1)
  })

  it('gere booloperator et simple', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{x} à \\ovalnum{4}}
\\blockifelse{si \\booloperator{\\booloperator{\\ovalvariable{x} > \\ovalnum{3}} et \\booloperator{\\ovalvariable{x} < \\ovalnum{5}}} alors}{
\\blockvariable{mettre \\selectmenu{ok} à \\ovalnum{1}}
}{
\\blockvariable{mettre \\selectmenu{ok} à \\ovalnum{0}}
}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.variables.ok).toBe(1)
  })

  it('gere booloperator ou simple', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{x} à \\ovalnum{4}}
\\blockifelse{si \\booloperator{\\booloperator{\\ovalvariable{x} > \\ovalnum{10}} ou \\booloperator{\\ovalvariable{x} = \\ovalnum{4}}} alors}{
\\blockvariable{mettre \\selectmenu{ok} à \\ovalnum{1}}
}{
\\blockvariable{mettre \\selectmenu{ok} à \\ovalnum{0}}
}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.variables.ok).toBe(1)
  })

  it('gere booloperator non simple', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{x} à \\ovalnum{4}}
\\blockifelse{si \\booloperator{non \\booloperator{\\ovalvariable{x} > \\ovalnum{10}}} alors}{
\\blockvariable{mettre \\selectmenu{ok} à \\ovalnum{1}}
}{
\\blockvariable{mettre \\selectmenu{ok} à \\ovalnum{0}}
}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.variables.ok).toBe(1)
  })

  it('gere booloperator avec ovalmove abscisse x dans une condition ifelse', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockmove{aller à x:\\ovalnum{0} y:\\ovalnum{0}}
\\blockrepeat{répéter \\ovalnum{4} fois}{
\\blockifelse{si \\booloperator{\\ovalmove{abscisse x} < \\ovalnum{-30}} alors}{
\\blockmove{ajouter \\ovalnum{15} à y}
}{
\\blockmove{ajouter \\ovalnum{-15} à x}
}
}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.finalX).toBe(155)
    expect(result.finalY).toBe(185)
  })

  it('gere booloperator avec ovalmove ordonnee y dans une condition ifelse', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockmove{aller à x:\\ovalnum{0} y:\\ovalnum{0}}
\\blockifelse{si \\booloperator{\\ovalmove{ordonnée y} = \\ovalnum{0}} alors}{
\\blockmove{ajouter \\ovalnum{15} à y}
}{
\\blockmove{ajouter \\ovalnum{15} à x}
}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.finalX).toBe(200)
    expect(result.finalY).toBe(185)
  })

  it('gere booloperator avec ovalmove direction dans une condition ifelse', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockmove{s'orienter à \\ovalnum{-90}}
\\blockifelse{si \\booloperator{\\ovalmove{direction} = \\ovalnum{-90}} alors}{
\\blockmove{ajouter \\ovalnum{15} à x}
}{
\\blockmove{ajouter \\ovalnum{15} à y}
}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.finalX).toBe(215)
    expect(result.finalY).toBe(200)
  })

  it('gere blockifelse en mode anime', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{x} à \\ovalnum{7}}
\\blockifelse{si \\booloperator{\\ovalvariable{x} >= 6} alors}{
\\blockvariable{mettre \\selectmenu{resultat} à \\ovalnum{100}}
}{
\\blockvariable{mettre \\selectmenu{resultat} à \\ovalnum{50}}
}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.variables.x).toBe(7)
    expect(result.variables.resultat).toBe(100)
  })

  it('conserve le texte complet de condition imbriquee dans currentConditionText', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{x} à \\ovalnum{3}}
\\blockvariable{mettre \\selectmenu{y} à \\ovalnum{4}}
\\blockvariable{mettre \\selectmenu{z} à \\ovalnum{7}}
\\blockifelse{si \\booloperator{\\ovaloperator{\\ovalvariable{x}+\\ovalvariable{y}} = \\ovalvariable{z}} alors}{
\\blockvariable{mettre \\selectmenu{resultat} à \\ovalnum{1}}
}{
\\blockvariable{mettre \\selectmenu{resultat} à \\ovalnum{0}}
}
\\end{scratch}`

    const conditionSnapshots: string[] = []

    const result = await interpreter.executeAnimated(
      code,
      () => {
        const state = interpreter.getCurrentState()
        if (state.currentConditionText) {
          conditionSnapshots.push(state.currentConditionText)
        }
      },
      0,
    )

    expect(result.variables.z).toBe(7)
    expect(result.variables.resultat).toBe(1)
    expect(conditionSnapshots.length).toBeGreaterThan(0)
    const merged = conditionSnapshots.join(' | ')
    expect(merged).toContain('si')
    expect(merged).toContain('x')
    expect(merged).toContain('y')
    expect(merged).toContain('z')
    expect(merged).toContain('=')
  })

  describe('ifelse en mode anime', () => {
    it('suit uniquement la branche active des ifelse imbriques', async () => {
      const interpreter = new ScratchInterpreter(200, 200, 90)
      const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{x} à \\ovalnum{2}}
\\blockifelse{si \\booloperator{\\ovalvariable{x} > 5} alors}{
\\blockvariable{mettre \\selectmenu{resultat} à \\ovalnum{1}}
}{
\\blockifelse{si \\booloperator{\\ovalvariable{x} = 2} alors}{
\\blockvariable{mettre \\selectmenu{resultat} à \\ovalnum{42}}
}{
\\blockvariable{mettre \\selectmenu{resultat} à \\ovalnum{0}}
}
}
\\blockmove{avancer de \\ovalnum{10} pas}
\\end{scratch}`

      const instructions: string[] = []
      const indexes: number[] = []

      const result = await interpreter.executeAnimated(
        code,
        () => {
          const state = interpreter.getCurrentState()
          if (state.currentInstruction) {
            instructions.push(state.currentInstruction)
          }
          if (typeof state.currentInstructionIndex === 'number') {
            indexes.push(state.currentInstructionIndex)
          }
        },
        0,
      )

      expect(result.variables.resultat).toBe(42)
      expect(result.finalX).toBe(210)
      expect(
        instructions.some((item) => item.includes('Mettre resultat a 42')),
      ).toBe(true)
      expect(
        instructions.some((item) => item.includes('Mettre resultat a 1')),
      ).toBe(false)
      expect(
        instructions.some((item) => item.includes('Mettre resultat a 0')),
      ).toBe(false)
      expect(Math.max(...indexes)).toBe(4)
    })

    it('suit uniquement la branche then quand la condition est vraie', async () => {
      const interpreter = new ScratchInterpreter(200, 200, 90)
      const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{x} à \\ovalnum{9}}
\\blockifelse{si \\booloperator{\\ovalvariable{x} > 5} alors}{
\\blockvariable{mettre \\selectmenu{resultat} à \\ovalnum{100}}
}{
\\blockifelse{si \\booloperator{\\ovalvariable{x} = 9} alors}{
\\blockvariable{mettre \\selectmenu{resultat} à \\ovalnum{42}}
}{
\\blockvariable{mettre \\selectmenu{resultat} à \\ovalnum{0}}
}
}
\\blockmove{avancer de \\ovalnum{5} pas}
\\end{scratch}`

      const instructions: string[] = []
      const indexes: number[] = []

      const result = await interpreter.executeAnimated(
        code,
        () => {
          const state = interpreter.getCurrentState()
          if (state.currentInstruction) {
            instructions.push(state.currentInstruction)
          }
          if (typeof state.currentInstructionIndex === 'number') {
            indexes.push(state.currentInstructionIndex)
          }
        },
        0,
      )

      expect(result.variables.resultat).toBe(100)
      expect(result.finalX).toBe(205)
      expect(
        instructions.some((item) => item.includes('Mettre resultat a 100')),
      ).toBe(true)
      expect(
        instructions.some((item) => item.includes('Mettre resultat a 42')),
      ).toBe(false)
      expect(
        instructions.some((item) => item.includes('Mettre resultat a 0')),
      ).toBe(false)
      expect(Math.max(...indexes)).toBe(3)
    })

    it('dans un repeat, suit les instructions enfants ifelse sans surligner le conteneur', async () => {
      const interpreter = new ScratchInterpreter(200, 200, 90)
      const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{compteur} à \\ovalnum{0}}
\\blockrepeat{répéter \\ovalnum{3} fois}{
\\blockifelse{si \\booloperator{\\ovalvariable{compteur} < 2} alors}{
\\blockvariable{Ajouter \\ovalnum{1} à \\ovalvariable{compteur}}
}{
\\blockvariable{mettre \\selectmenu{resultat} à \\ovalnum{99}}
}
}
\\end{scratch}`

      const instructions: string[] = []

      const result = await interpreter.executeAnimated(
        code,
        () => {
          const state = interpreter.getCurrentState()
          if (state.currentInstruction) {
            instructions.push(state.currentInstruction)
          }
        },
        0,
      )

      expect(result.variables.compteur).toBe(2)
      expect(result.variables.resultat).toBe(99)
      // Vérifier que les instructions atomiques apparaissent
      expect(
        instructions.some((item) => item.includes('Ajouter 1 a compteur')),
      ).toBe(true)
      expect(
        instructions.some((item) => item.includes('Mettre resultat a 99')),
      ).toBe(true)
      // Le conteneur ifelse "si ... alors" devrait apparaître pendant l'évaluation de la condition
      expect(instructions.some((item) => item.includes('si '))).toBe(true)
    })
  })

  it('gere blockcontrol stop tout', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{compteur} à \\ovalnum{0}}
\\blockvariable{Ajouter \\ovalnum{1} à \\ovalvariable{compteur}}
\\blockcontrol{stop \\selectmenu{tout}}
\\blockvariable{Ajouter \\ovalnum{10} à \\ovalvariable{compteur}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.variables.compteur).toBe(1)
  })

  it('gere blockcontrol stop tout dans une boucle repeat', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{compteur} à \\ovalnum{0}}
\\blockrepeat{répéter \\ovalnum{10} fois}{
\\blockvariable{Ajouter \\ovalnum{1} à \\ovalvariable{compteur}}
\\blockifelse{si \\booloperator{\\ovalvariable{compteur} = 3} alors}{
\\blockcontrol{stop \\selectmenu{tout}}
}{
}
}
\\blockvariable{mettre \\selectmenu{apres} à \\ovalnum{99}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.variables.compteur).toBe(3)
    expect(result.variables.apres).toBeUndefined()
  })

  it('gere blockcontrol stop tout en mode anime', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{compteur} à \\ovalnum{0}}
\\blockvariable{Ajouter \\ovalnum{5} à \\ovalvariable{compteur}}
\\blockcontrol{stop \\selectmenu{tout}}
\\blockvariable{Ajouter \\ovalnum{20} à \\ovalvariable{compteur}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.variables.compteur).toBe(5)
  })

  it('gere blocksensing demander et attendre', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blocksensing{demander \\ovalnum{Choisissez un nombre} et attendre}
\\blockvariable{mettre \\selectmenu{x} à \\ovalsensing{réponse}}
\\end{scratch}`

    // Simuler la réponse utilisateur
    interpreter.onAskInput = async (prompt: string) => {
      expect(prompt).toBe('Choisissez un nombre')
      return '15'
    }

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.variables.x).toBe(15)
  })

  it('gere blocksensing avec reponse dans calcul', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blocksensing{demander \\ovalnum{Entrez un nombre} et attendre}
\\blockvariable{mettre \\selectmenu{resultat} à \\ovaloperator{\\ovalsensing{réponse} * \\ovalnum{2}}}
\\end{scratch}`

    interpreter.onAskInput = async () => '7'

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.variables.resultat).toBe(14)
  })

  it('gere blocksensing avec valeur par defaut si pas de callback', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blocksensing{demander \\ovalnum{Test} et attendre}
\\blockvariable{mettre \\selectmenu{x} à \\ovalsensing{réponse}}
\\end{scratch}`

    // Pas de callback défini, devrait utiliser '42' par défaut
    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.variables.x).toBe(42)
  })

  it('met a jour une variable depuis ovalvariable, ovalsensing et ovalmove', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{r} à \\ovalnum{12}}
\\blockvariable{mettre \\selectmenu{b} à \\ovalvariable{r}}
\\blocksensing{demander \\ovalnum{Entrez une valeur} et attendre}
\\blockvariable{mettre \\selectmenu{s} à \\ovalsensing{réponse}}
\\blockvariable{mettre \\selectmenu{mx} à \\ovalmove{abscisse x}}
\\blockvariable{mettre \\selectmenu{my} à \\ovalmove{ordonnée y}}
\\blockvariable{mettre \\selectmenu{md} à \\ovalmove{direction}}
\\end{scratch}`

    interpreter.onAskInput = async () => '17'

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.variables.b).toBe(12)
    expect(result.variables.s).toBe(17)
    expect(result.variables.mx).toBe(0)
    expect(result.variables.my).toBe(0)
    expect(result.variables.md).toBe(90)
  })

  it('gere ovaloperator avec regrouper pour concatenation simple', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blocklook{dire \\ovaloperator{regrouper \\ovalnum{Hello} et \\ovalnum{World}}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.messages).toEqual(['HelloWorld'])
  })

  it('gere ovaloperator avec regrouper et espaces', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blocklook{dire \\ovaloperator{regrouper \\ovalnum{Hello } et \\ovalnum{World}}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.messages).toEqual(['Hello World'])
  })

  it('gere regrouper avec variables', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{a} à \\ovalnum{10}}
\\blockvariable{mettre \\selectmenu{b} à \\ovalnum{20}}
\\blocklook{dire \\ovaloperator{regrouper \\ovalvariable{a} et \\ovalvariable{b}}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.messages).toEqual(['1020'])
  })

  it('gere regrouper imbrique', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blocklook{dire \\ovaloperator{regrouper \\ovalnum{A} et \\ovaloperator{regrouper \\ovalnum{B} et \\ovalnum{C}}}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.messages).toEqual(['ABC'])
  })

  it('gere regrouper imbrique avec variable et texte', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{compteur} à \\ovalnum{5}}
\\blocklook{dire \\ovaloperator{regrouper \\ovalnum{Le nombre de terme de la suite est à } et \\ovaloperator{regrouper \\ovalvariable{compteur} et \\ovalnum{ .}}}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.messages).toEqual([
      'Le nombre de terme de la suite est à 5 .',
    ])
  })

  it('gere regrouper avec ovalsensing reponse', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blocksensing{demander \\ovalnum{Ton nom} et attendre}
\\blocklook{dire \\ovaloperator{regrouper \\ovalnum{Bonjour } et \\ovalsensing{réponse}}}
\\end{scratch}`

    interpreter.onAskInput = async () => 'Alice'

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.messages).toEqual(['Bonjour Alice'])
  })

  it('ovaloperator continue de fonctionner en mode arithmetique', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blocklook{dire \\ovaloperator{5 + 3 * 2}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.messages).toEqual(['11'])
  })

  it('gere l operateur modulo avec %', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blocklook{dire \\ovaloperator{17 % 5}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.messages).toEqual(['2'])
  })

  it('gere l operateur modulo avec mod', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blocklook{dire \\ovaloperator{17 mod 5}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.messages).toEqual(['2'])
  })

  it('gere l operateur modulo avec modulo', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blocklook{dire \\ovaloperator{17 modulo 5}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.messages).toEqual(['2'])
  })

  it('gere les principales fonctions mathematiques via selectmenu', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{absVal} à \\ovaloperator{\\selectmenu{abs} de \\ovalnum{-4}}}
\\blockvariable{mettre \\selectmenu{racineVal} à \\ovaloperator{\\selectmenu{racine} de \\ovalnum{9}}}
\\blockvariable{mettre \\selectmenu{sinVal} à \\ovaloperator{\\selectmenu{sin} de \\ovalnum{30}}}
\\blockvariable{mettre \\selectmenu{cosVal} à \\ovaloperator{\\selectmenu{cos} de \\ovalnum{60}}}
\\blockvariable{mettre \\selectmenu{tanVal} à \\ovaloperator{\\selectmenu{tan} de \\ovalnum{45}}}
\\blockvariable{mettre \\selectmenu{asinVal} à \\ovaloperator{\\selectmenu{asin} de \\ovalnum{0.5}}}
\\blockvariable{mettre \\selectmenu{acosVal} à \\ovaloperator{\\selectmenu{acos} de \\ovalnum{0.5}}}
\\blockvariable{mettre \\selectmenu{atanVal} à \\ovaloperator{\\selectmenu{atan} de \\ovalnum{1}}}
\\blockvariable{mettre \\selectmenu{plancherVal} à \\ovaloperator{\\selectmenu{plancher} de \\ovalnum{3.8}}}
\\blockvariable{mettre \\selectmenu{plafondVal} à \\ovaloperator{\\selectmenu{plafond} de \\ovalnum{3.2}}}
\\blockvariable{mettre \\selectmenu{pow10Val} à \\ovaloperator{\\selectmenu{10^} de \\ovalnum{3}}}
\\blockvariable{mettre \\selectmenu{lnVal} à \\ovaloperator{\\selectmenu{ln} de \\ovalnum{2.718281828459045}}}
\\blockvariable{mettre \\selectmenu{logVal} à \\ovaloperator{\\selectmenu{log} de \\ovalnum{100}}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.variables.absVal).toBe(4)
    expect(result.variables.racineVal).toBe(3)
    expect(result.variables.sinVal).toBeCloseTo(0.5, 10)
    expect(result.variables.cosVal).toBeCloseTo(0.5, 10)
    expect(result.variables.tanVal).toBeCloseTo(1, 10)
    expect(result.variables.asinVal).toBeCloseTo(30, 10)
    expect(result.variables.acosVal).toBeCloseTo(60, 10)
    expect(result.variables.atanVal).toBeCloseTo(45, 10)
    expect(result.variables.plancherVal).toBe(3)
    expect(result.variables.plafondVal).toBe(4)
    expect(result.variables.pow10Val).toBe(1000)
    expect(result.variables.lnVal).toBeCloseTo(1, 10)
    expect(result.variables.logVal).toBeCloseTo(2, 10)
  })

  it('gere selectmenu sans antislash dans ovaloperator', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blocklook{dire \\ovaloperator{selectmenu{abs} de \\ovalnum{-8}}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.messages).toEqual(['8'])
  })

  it("gere l'operateur nombre aleatoire entre deux bornes", async () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blocklook{dire \\ovaloperator{nombre aléatoire entre \\ovalnum{1} et \\ovalnum{3}}}
\\end{scratch}`

    try {
      const result = await interpreter.executeAnimated(code, () => {}, 0)
      const lastMessage = result.messages[result.messages.length - 1] as
        | string
        | { text?: string }
        | undefined
      const lastMessageText =
        typeof lastMessage === 'string'
          ? lastMessage
          : (lastMessage?.text ?? '')

      expect(lastMessageText).toBe('2')
    } finally {
      randomSpy.mockRestore()
    }
  })

  it("gere l'operateur lettre ... de ...", async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blocklook{dire \\ovaloperator{lettre \\ovalnum{1} de \\ovalnum{pomme}}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.messages).toEqual(['p'])
  })

  it('gere aussi la variante ovaloperaror pour lettre ... de ...', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blocklook{dire \\ovaloperaror{lettre \\ovalnum{1} de \\ovalnum{pomme}}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.messages).toEqual(['p'])
  })

  it("gere l'operateur longueur de ...", async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blocklook{dire \\ovaloperator{longueur de \\ovalnum{pomme}}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.messages).toEqual(['5'])
  })

  it("gere l'operateur ... contient ... avec retour booleen", async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blocklook{dire \\ovaloperator{\\ovalnum{pomme} contient \\ovalnum{p}}}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.messages).toEqual(['true'])
  })

  it("permet d'utiliser ... contient ... directement dans booloperator", async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockifelse{si \\booloperator{\\ovaloperator{\\ovalnum{pomme} contient \\ovalnum{p}}} alors}{
\\blocklook{dire \\ovalnum{oui}}
}{
\\blocklook{dire \\ovalnum{non}}
}
\\end{scratch}`

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.messages).toEqual(['oui'])
  })

  it("gere l'operateur arrondi de avec ovalnum, ovalvariable, ovalsensing et ovalmove", async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blockvariable{mettre \\selectmenu{a} à \\ovalnum{3.6}}
\\blocksensing{demander \\ovalnum{Entrez un decimal} et attendre}
\\blockmove{mettre x à \\ovalnum{2.6}}
\\blocklook{dire \\ovaloperator{arrondi de \\ovalnum{4.4}}}
\\blocklook{dire \\ovaloperator{arrondi de \\ovalvariable{a}}}
\\blocklook{dire \\ovaloperator{arrondi de \\ovalsensing{réponse}}}
\\blocklook{dire \\ovaloperator{arrondi de \\ovalmove{abscisse x}}}
\\end{scratch}`

    interpreter.onAskInput = async () => '7.6'

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.messages).toEqual(['4', '4', '8', '3'])
  })

  it('gere arrondi de ovalsensing reponse non numerique', async () => {
    const interpreter = new ScratchInterpreter(200, 200, 90)
    const code = `\\begin{scratch}[blocks]
\\blocksensing{demander \\ovalnum{Entrez un texte} et attendre}
\\blocklook{dire \\ovaloperator{arrondi de \\ovalsensing{réponse}}}
\\end{scratch}`

    interpreter.onAskInput = async () => 'Alice'

    const result = await interpreter.executeAnimated(code, () => {}, 0)

    expect(result.messages).toEqual(['0'])
  })
})

describe('ScratchSimulator mapping', () => {
  it('normalise blockinit en blockevent pour le simulateur', () => {
    const simulator = Object.create(ScratchSimulator.prototype) as any
    simulator.scratchCode = String.raw`\begin{scratch}
\blockinit{quand la touche \selectmenu{espace} est pressée}
\end{scratch}`

    const normalized = simulator.getSimulatorScratchCode()

    expect(normalized).toContain('\\blockevent{quand la touche')
    expect(normalized).not.toContain('\\blockinit{')
  })

  it('reprend le surlignage sur le bloc suivant apres blockmoreblocks dans un repeat', async () => {
    const code = `\\begin{scratch}
\\initmoreblocks{définir \\namemoreblocks{Carré}}
\\blockmove{avancer de \\ovalnum{50} pas}
\\blockmove{tourner \\turnright{} de \\ovalnum{90} degrés}
\\blockmove{avancer de \\ovalnum{50} pas}
\\blockmove{tourner \\turnright{} de \\ovalnum{90} degrés}
\\blockmove{avancer de \\ovalnum{50} pas}
\\blockmove{tourner \\turnright{} de \\ovalnum{90} degrés}
\\blockmove{avancer de \\ovalnum{50} pas}
\\blockmove{tourner \\turnright{} de \\ovalnum{90} degrés}

\\blockinit{quand \\greenflag est cliqué}
\\blockrepeat{répéter \\ovalnum{10} fois}
{
  \\blockpen{stylo en position d'écriture}
  \\blockmoreblocks{Carré}
  \\blockpen{relever le stylo}
  \\blockmove{avancer de \\ovalnum{10} pas}
}
\\end{scratch}`

    let firstPenUpInstructionIndex: number | undefined
    const interpreter = new ScratchInterpreter(200, 200, 90)

    await interpreter.executeAnimated(
      code,
      () => {
        const state = interpreter.getCurrentState()
        if (
          firstPenUpInstructionIndex === undefined &&
          state.currentInstruction === 'Relever le stylo'
        ) {
          firstPenUpInstructionIndex = state.currentInstructionIndex
        }
      },
      0,
      { skipWaitBlocks: true },
    )

    expect(firstPenUpInstructionIndex).toBeDefined()

    const simulator = Object.create(
      ScratchSimulator.prototype,
    ) as unknown as ScratchSimulatorTestHarness

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const mk = (
      id: string,
      text: string,
    ): { element: SVGGElement; text: string; children: any[] } => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      g.id = id
      svg.appendChild(g)
      return {
        element: g,
        text,
        children: [],
      }
    }

    const renderedBlocks = [
      mk('block-pen-down', "stylo en position d'écriture"),
      mk('block-call-carre', 'bloc carré'),
      mk('block-pen-up', 'relever le stylo'),
      mk('block-forward-10', 'avancer de 10 pas'),
      mk('block-forward-50', 'avancer de 50 pas'),
      mk('block-turn-90', 'tourner a droite de 90 degres'),
    ]

    const codeDiv = document.createElement('div')
    codeDiv.appendChild(svg)

    simulator.codeDiv = codeDiv
    simulator.codeBlocks = [renderedBlocks[0]]
    simulator.allRenderedBlocks = renderedBlocks
    simulator.customDefinitionGroups = new Set<SVGGElement>()
    simulator.conditionBlockElements = new Set<SVGGElement>()
    simulator.executionIndexToBlockId = new Map<number, string>()
    simulator.scratchCode = code

    await simulator.buildExecutionIndexToSelectorMap()

    const mappedBlockId = simulator.executionIndexToBlockId.get(
      firstPenUpInstructionIndex!,
    )

    expect(mappedBlockId).toBe('block-pen-up')
  })

  it('reprend aussi sur le bloc suivant quand le bloc personnalise contient un repeat', async () => {
    const code = `\\begin{scratch}
\\initmoreblocks{définir \\namemoreblocks{Carré}}
\\blockrepeat{répéter \\ovalnum{4} fois}
{
  \\blockmove{avancer de \\ovalnum{50} pas}
  \\blockmove{tourner \\turnright{} de \\ovalnum{90} degrés}
}

\\blockinit{quand \\greenflag est cliqué}
\\blockrepeat{répéter \\ovalnum{10} fois}
{
  \\blockpen{stylo en position d'écriture}
  \\blockmoreblocks{Carré}
  \\blockpen{relever le stylo}
  \\blockmove{avancer de \\ovalnum{10} pas}
}
\\end{scratch}`

    let firstPenUpInstructionIndex: number | undefined
    const interpreter = new ScratchInterpreter(200, 200, 90)

    await interpreter.executeAnimated(
      code,
      () => {
        const state = interpreter.getCurrentState()
        if (
          firstPenUpInstructionIndex === undefined &&
          state.currentInstruction === 'Relever le stylo'
        ) {
          firstPenUpInstructionIndex = state.currentInstructionIndex
        }
      },
      0,
      { skipWaitBlocks: true },
    )

    expect(firstPenUpInstructionIndex).toBeDefined()

    const simulator = Object.create(
      ScratchSimulator.prototype,
    ) as unknown as ScratchSimulatorTestHarness

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const mk = (
      id: string,
      text: string,
    ): { element: SVGGElement; text: string; children: any[] } => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      g.id = id
      svg.appendChild(g)
      return {
        element: g,
        text,
        children: [],
      }
    }

    const renderedBlocks = [
      mk('block-pen-down', "stylo en position d'écriture"),
      mk('block-call-carre', 'bloc carré'),
      mk('block-pen-up', 'relever le stylo'),
      mk('block-forward-10', 'avancer de 10 pas'),
      mk('block-repeat-4', 'répéter 4 fois'),
      mk('block-forward-50', 'avancer de 50 pas'),
      mk('block-turn-90', 'tourner a droite de 90 degres'),
    ]

    const codeDiv = document.createElement('div')
    codeDiv.appendChild(svg)

    simulator.codeDiv = codeDiv
    simulator.codeBlocks = [renderedBlocks[0]]
    simulator.allRenderedBlocks = renderedBlocks
    simulator.customDefinitionGroups = new Set<SVGGElement>()
    simulator.conditionBlockElements = new Set<SVGGElement>()
    simulator.executionIndexToBlockId = new Map<number, string>()
    simulator.scratchCode = code

    await simulator.buildExecutionIndexToSelectorMap()

    const mappedBlockId = simulator.executionIndexToBlockId.get(
      firstPenUpInstructionIndex!,
    )

    expect(mappedBlockId).toBe('block-pen-up')
  })

  it('privilégie le bloc dans la procédure custom quand le texte est identique dans l’appelant', async () => {
    const code = `\\begin{scratch}
\\initmoreblocks{définir \\namemoreblocks{polygone\\_régulier \\ovalmoreblocks{number1} \\ovalmoreblocks{number2}}}
\\blockrepeat{répéter \\ovalmoreblocks{number1} fois}
{
  \\blockmove{avancer de \\ovalmoreblocks{number2} pas}
}

\\blockinit{quand \\greenflag est cliqué}
\\blockmoreblocks{polygone\\_régulier \\ovalnum{1} \\ovalnum{40}}
\\blockmove{avancer de \\ovalnum{40} pas}
\\end{scratch}`

    let firstMove40InstructionIndex: number | undefined
    const interpreter = new ScratchInterpreter(200, 200, 90)

    await interpreter.executeAnimated(
      code,
      () => {
        const state = interpreter.getCurrentState()
        if (
          firstMove40InstructionIndex === undefined &&
          state.currentInstruction === 'Avancer de 40 pas'
        ) {
          firstMove40InstructionIndex = state.currentInstructionIndex
        }
      },
      0,
      { skipWaitBlocks: true },
    )

    expect(interpreter.getCurrentState().finalX).toBe(280)

    expect(firstMove40InstructionIndex).toBeDefined()

    const simulator = Object.create(
      ScratchSimulator.prototype,
    ) as unknown as ScratchSimulatorTestHarness

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const mk = (
      id: string,
      text: string,
    ): { element: SVGGElement; text: string; children: any[] } => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      g.id = id
      svg.appendChild(g)
      return {
        element: g,
        text,
        children: [],
      }
    }

    const renderedBlocks = [
      mk('block-call-poly', 'bloc polygone_régulier 1 40'),
      mk('block-caller-move-40', 'avancer de 40 pas'),
      mk('block-custom-move-40', 'avancer de 40 pas'),
    ]

    const codeDiv = document.createElement('div')
    codeDiv.appendChild(svg)

    simulator.codeDiv = codeDiv
    simulator.codeBlocks = [renderedBlocks[0]]
    simulator.allRenderedBlocks = renderedBlocks
    simulator.customDefinitionGroups = new Set<SVGGElement>()
    simulator.conditionBlockElements = new Set<SVGGElement>()
    simulator.executionIndexToBlockId = new Map<number, string>()
    simulator.customDefinitionEntryIdBySignature = new Map<string, string>([
      ['polygone_régulier', 'block-custom-move-40'],
    ])
    simulator.customDefinitionBodyIdsBySignature = new Map<string, Set<string>>(
      [['polygone_régulier', new Set(['block-custom-move-40'])]],
    )
    simulator.scratchCode = code

    expect(
      (simulator as any).normalizeCustomBlockSignature(
        'bloc polygone\\_régulier \\ovalnum{1} \\ovalnum{40}',
      ),
    ).toBe('polygone_régulier')

    await simulator.buildExecutionIndexToSelectorMap()

    const mappedBlockId = simulator.executionIndexToBlockId.get(
      firstMove40InstructionIndex!,
    )

    expect(mappedBlockId).toBe('block-custom-move-40')
  })

  it('mappe correctement un evenement touche pour le surlignage de depart', async () => {
    const code = `\\begin{scratch}[blocks]
\\blockevent{quand la touche \\selectmenu{espace} est pressée}
\\blockvariable{mettre \\selectmenu{ok} à \\ovalnum{1}}
\\end{scratch}`

    let keyEventInstructionIndex: number | undefined
    const interpreter = new ScratchInterpreter(200, 200, 90)

    await interpreter.executeAnimated(
      code,
      () => {
        const state = interpreter.getCurrentState()
        if (
          keyEventInstructionIndex === undefined &&
          state.currentInstruction?.startsWith('Attente de la touche')
        ) {
          keyEventInstructionIndex = state.currentInstructionIndex
        }
      },
      0,
      { skipWaitBlocks: true },
    )

    expect(keyEventInstructionIndex).toBeDefined()

    const simulator = Object.create(
      ScratchSimulator.prototype,
    ) as unknown as ScratchSimulatorTestHarness

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const mk = (
      id: string,
      text: string,
    ): { element: SVGGElement; text: string; children: any[] } => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      g.id = id
      svg.appendChild(g)
      return {
        element: g,
        text,
        children: [],
      }
    }

    const renderedBlocks = [
      mk('block-event-key-space', 'when space key pressed'),
      mk('block-var-ok', 'mettre ok a 1'),
    ]

    const codeDiv = document.createElement('div')
    codeDiv.appendChild(svg)

    simulator.codeDiv = codeDiv
    simulator.codeBlocks = [renderedBlocks[0]]
    simulator.allRenderedBlocks = renderedBlocks
    simulator.customDefinitionGroups = new Set<SVGGElement>()
    simulator.conditionBlockElements = new Set<SVGGElement>()
    simulator.executionIndexToBlockId = new Map<number, string>()
    simulator.scratchCode = code

    await simulator.buildExecutionIndexToSelectorMap()

    const mappedBlockId = simulator.executionIndexToBlockId.get(
      keyEventInstructionIndex!,
    )

    expect(mappedBlockId).toBe('block-event-key-space')
  })

  it('avec script complet, detecte blockinit touche comme instruction de depart', async () => {
    const code = String.raw`\begin{scratch}
\initmoreblocks{définir \namemoreblocks{Initialisation}}
\blockmove{aller à x: \ovalnum{0} y: \ovalnum{-170}}
\blockmove{s'orienter à \ovalnum{0}}
\blockpen{stylo en position d'écriture}
\blockpen{effacer tout}
\end{scratch}

\begin{scratch}
\initmoreblocks{définir \namemoreblocks{branche \ovalmoreblocks{taille}}}
\blockvariable{mettre \selectmenu{niveau} à \ovaloperator{\ovalvariable{niveau} + \ovalnum{1}}}
\blockmove{avancer de \ovalmoreblocks{taille} pas}
\blockmove{tourner \turnleft{} de \ovaloperator{\ovalnum{60} / \ovaloperator{\selectmenu{sqrt} de \ovalvariable{niveau}}} degrés}
\blockif{si \booloperator{\ovalvariable{niveau} < \ovalnum{7}} alors}
{
  \blockmoreblocks{branche \ovaloperator{\ovalmoreblocks{taille} / \ovalnum{1.4}}}
}
\blockmove{tourner \turnright{} de \ovaloperator{\ovalnum{120} / \ovaloperator{\selectmenu{sqrt} de \ovalvariable{niveau}}} degrés}
\blockif{si \booloperator{\ovalvariable{niveau} < \ovalnum{7}} alors}
{
  \blockmoreblocks{branche \ovaloperator{\ovalmoreblocks{taille} / \ovalnum{1.4}}}
}
\blockmove{tourner \turnleft{} de \ovaloperator{\ovalnum{60} / \ovaloperator{\selectmenu{sqrt} de \ovalvariable{niveau}}} degrés}
\blockmove{avancer de \ovaloperator{\ovalnum{0} - \ovalmoreblocks{taille}} pas}
\blockvariable{mettre \selectmenu{niveau} à \ovaloperator{\ovalvariable{niveau} + \ovalnum{-1}}}
\end{scratch}

\begin{scratch}
\blockinit{quand la touche \selectmenu{espace} est pressée}
\blockmoreblocks{Initialisation}
\blockmoreblocks{branche \ovalnum{100}}
\blockvariable{mettre \selectmenu{niveau} à \ovalnum{0}}
\end{scratch}`

    const interpreter = new ScratchInterpreter(200, 200, 90)
    let firstInstruction = ''

    await interpreter.executeAnimated(
      code,
      () => {
        const state = interpreter.getCurrentState()
        if (!firstInstruction && state.currentInstruction) {
          firstInstruction = state.currentInstruction
          interpreter.stopExecution()
        }
      },
      0,
      { skipWaitBlocks: true },
    )

    expect(firstInstruction).toContain('Attente de la touche espace')
  })
})
