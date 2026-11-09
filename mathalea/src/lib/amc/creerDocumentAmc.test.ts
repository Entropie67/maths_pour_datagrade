import { describe, expect, it, vi } from 'vitest'

import * as exercice2N40_1 from '../../exercices/2e/2L10-1'
import { mathaleaHandleExerciceSimple } from '../mathalea'
import {
  renderAMCCopyContent,
  renderAMCDocumentStart,
  renderAMCGroupSection,
  renderAMCHeader,
  renderAMCPreamble,
} from './amcDocumentTemplates'
import { mathaleaEnsureAMCCompatibility } from './amcInference'
import {
  checkAMCGroupConsistency,
  creerDocumentAmc,
  extractAMCQuestionGroups,
} from './creerDocumentAmc'

function prepareExercise(
  module: { default: new () => any; amcType?: string; amcReady?: boolean },
  seed: string,
) {
  const exercice = new module.default()
  if (module.amcType != null) exercice.amcType = module.amcType
  if (module.amcReady != null) exercice.amcReady = module.amcReady
  if (exercice.typeExercice === 'simple')
    mathaleaHandleExerciceSimple(exercice, true, 0, seed)
  mathaleaEnsureAMCCompatibility(exercice)
  return exercice
}

function inferQcmType(exercice: any) {
  const autoCorrection = Array.isArray(exercice.autoCorrectionAMC)
    ? exercice.autoCorrectionAMC
    : exercice.autoCorrection
  const firstItem = autoCorrection?.find((item: any) => item != null)
  const goodAnswersCount = Array.isArray(firstItem?.propositions)
    ? firstItem.propositions.filter((proposition: any) =>
        Boolean(proposition.statut),
      ).length
    : 0

  return goodAnswersCount > 1 ? 'qcmMult' : 'qcmMono'
}

describe('creerDocumentAmc templates', () => {
  it('rend un preambule AMC parametrable', () => {
    const preambule = renderAMCPreamble({
      documentClassOptions: '10pt,a4paper,french,svgnames',
    })

    expect(preambule.startsWith('% !TEX encoding = UTF-8 Unicode')).toBe(true)
    expect(preambule).toContain(
      '\\documentclass[10pt,a4paper,french,svgnames]{article}',
    )
    expect(preambule).toContain(
      '\\usepackage[francais,bloc,insidebox,nowatermark]{automultiplechoice}',
    )
    expect(preambule).toContain('\\providecommand{\\R}{\\mathbb{R}}')
  })

  it('rend un entete AMC code grid parametrable', () => {
    const entete = renderAMCHeader({
      isA3: false,
      isAssociation: false,
      isCodeGrid: true,
      matiere: 'Mathématiques',
      titre: 'Evaluation',
      nbExemplaires: 2,
    })

    expect(entete).toContain('\\exemplaire{2}{')
    expect(entete).toContain('\\textbf{Mathématiques}')
    expect(entete).toContain('\\AMCcodeGrid[h]{ID}{ABCDEFGHIJKLMNOPQRSTUVWXYZ,')
  })

  it('rend un entete AMC association parametrable', () => {
    const entete = renderAMCHeader({
      isA3: true,
      isAssociation: true,
      isCodeGrid: false,
      matiere: 'Mathématiques',
      titre: 'Evaluation',
      nbExemplaires: 1,
    })

    expect(entete).toContain('\\newcommand{\\sujet}{')
    expect(entete).toContain('\\begin{multicols}{2}')
    expect(entete).toContain('\\nom{}~\\prenom{}')
  })

  it('rend un debut de document AMC parametrable', () => {
    const documentStart = renderAMCDocumentStart({
      seed: 12345,
      groupsContent:
        '\\element{G}{\\begin{question}{Q}\\AMClabel{Q}X\\end{question}}',
    })

    expect(documentStart).toContain('\\begin{document}')
    expect(documentStart).toContain('\\AMCrandomseed{12345}')
    expect(documentStart).toContain('\\FPseed=12345')
    expect(documentStart).toContain(
      '\\element{G}{\\begin{question}{Q}\\AMClabel{Q}X\\end{question}}',
    )
  })

  it('extrait uniquement la section de preparation des groupes', () => {
    const latex = `${renderAMCDocumentStart({
      seed: 12345,
      groupsContent: '\\element{G}{\\begin{question}{Q}X\\end{question}}',
    })}${renderAMCHeader({
      isA3: false,
      isAssociation: false,
      isCodeGrid: false,
      matiere: 'Mathématiques',
      titre: 'Evaluation',
      nbExemplaires: 1,
    })}`

    const groups = extractAMCQuestionGroups(latex)

    expect(groups).toContain('%%% préparation des groupes')
    expect(groups).toContain('\\setdefaultgroupmode{cyclic}')
    expect(groups).toContain('\\element{G}')
    expect(groups).not.toContain('\\begin{document}')
    expect(groups).not.toContain('MISE EN PAGE DU QCM')
    expect(groups).not.toContain('\\exemplaire')
    expect(
      groups
        .trimEnd()
        .endsWith('\\element{G}{\\begin{question}{Q}X\\end{question}}'),
    ).toBe(true)
  })

  it('renvoie une chaine vide si la section des groupes est incomplete', () => {
    expect(extractAMCQuestionGroups('\\begin{document}')).toBe('')
    expect(
      extractAMCQuestionGroups('%%% préparation des groupes\n\\element{G}{}'),
    ).toBe('')
  })

  it('rend un contenu de copie AMC parametrable', () => {
    const copyContent = renderAMCCopyContent({
      isCodeGrid: true,
      groupsSections:
        '\\begin{center}Titre\\end{center}\\restituegroupe[2]{G1}\\n',
      isA3: true,
      isAssociation: false,
    })

    expect(copyContent).toContain('\\def\\AMCchoiceLabel##1{}')
    expect(copyContent).toContain('\\restituegroupe[2]{G1}')
    expect(copyContent).toContain('\\end{multicols}')
    expect(copyContent).toContain('}')
  })

  it('rend une section de groupe AMC parametrable', () => {
    const groupSection = renderAMCGroupSection({
      groupTitle: 'Titre Groupe',
      groupName: 'G1',
      isMixed: false,
      questionsToRestore: 2,
    })

    expect(groupSection).toContain('\\bf\\Large Titre Groupe')
    expect(groupSection).toContain('\\setgroupmode{G1}{cyclic}')
    expect(groupSection).toContain('\\restituegroupe[2]{G1}')
    expect(groupSection).not.toContain('\\restituegroupe[2]{ G1 }')
  })

  it('rend une section de groupe sans titre avec hrule simple', () => {
    const groupSection = renderAMCGroupSection({
      groupTitle: '',
      groupName: 'G1',
      isMixed: false,
      questionsToRestore: 2,
    })

    expect(groupSection).toContain('\\hrule')
    expect(groupSection).not.toContain('\\bf\\Large')
    expect(groupSection).not.toContain('\\begin{center}')
    expect(groupSection).toContain('\\restituegroupe[2]{G1}')
  })

  it('propage les options de format et recto-verso au preambule du document', () => {
    vi.stubGlobal('document', {
      getElementById: vi.fn(() => ({ checked: true })),
    })

    const latex = creerDocumentAmc({
      exercices: [
        {
          amcReady: true,
          amcType: 'AMCNum',
          autoCorrection: [
            {
              enonce: 'Question',
              reponse: {
                valeur: 5,
                param: { digits: 1, decimals: 0, tpoint: ',' },
              },
            },
          ],
          id: 'EXO',
          nbQuestions: 1,
          titre: 'Titre',
          listeQuestions: ['Question'],
          listeCorrections: ['Correction'],
        } as any,
      ],
      format: 'A3',
      typeEntete: 'AMCassociation',
    })

    expect(latex).toContain(
      '\\documentclass[twoside,10pt,a3paper,landscape,french,svgnames]{article}',
    )
    expect(latex).toContain('\\AMCrandomseed{')
    expect(latex).toContain('\\newcommand{\\sujet}{')
    expect(latex).toContain('\\begin{multicols}{2}')
    expect(latex).toContain('\\restituegroupe')

    vi.unstubAllGlobals()
  })

  it('ignore les exercices non amcReady lors de la restitution des groupes', () => {
    vi.stubGlobal('document', {
      getElementById: vi.fn(() => ({ checked: false })),
    })

    const latex = creerDocumentAmc({
      exercices: [
        {
          amcReady: true,
          amcType: 'AMCNum',
          autoCorrection: [
            {
              enonce: 'Question valide',
              reponse: {
                valeur: 7,
                param: { digits: 1, decimals: 0, tpoint: ',' },
              },
            },
          ],
          id: 'READY',
          nbQuestions: 1,
          titre: 'Titre prêt',
          listeQuestions: ['Question valide'],
          listeCorrections: ['Correction valide'],
        } as any,
        {
          amcReady: false,
          amcType: 'AMCNum',
          autoCorrection: [
            {
              enonce: 'Question ignorée',
              reponse: {
                valeur: 3,
                param: { digits: 1, decimals: 0, tpoint: ',' },
              },
            },
          ],
          id: 'NOT_READY',
          nbQuestions: 1,
          titre: 'Titre ignoré',
          listeQuestions: ['Question ignorée'],
          listeCorrections: ['Correction ignorée'],
        } as any,
      ],
    })

    expect(latex).toContain('\\element{READY}')
    expect(latex).toContain('\\restituegroupe')
    expect(latex).toContain('READY')
    expect(latex).not.toContain('\\element{NOT_READY}')
    expect(latex).not.toContain('\\restituegroupe{NOT_READY}')

    vi.unstubAllGlobals()
  })

  it('masque les titres de groupes quand titleOn est false', () => {
    vi.stubGlobal('document', {
      getElementById: vi.fn(() => ({ checked: false })),
    })

    const latex = creerDocumentAmc({
      exercices: [
        {
          amcReady: true,
          amcType: 'AMCNum',
          autoCorrection: [
            {
              enonce: 'Question valide',
              reponse: {
                valeur: 7,
                param: { digits: 1, decimals: 0, tpoint: ',' },
              },
            },
          ],
          id: 'READY',
          nbQuestions: 1,
          titre: 'Titre visible normalement',
          listeQuestions: ['Question valide'],
          listeCorrections: ['Correction valide'],
        } as any,
      ],
      titleOn: false,
    })

    expect(latex).not.toContain('\\bf\\Large Titre visible normalement')
    expect(latex).toContain('\\hrule')
    expect(latex).toContain('\\restituegroupe')

    vi.unstubAllGlobals()
  })

  it('ne restitue pas un groupe sans element AMC genere', () => {
    vi.stubGlobal('document', {
      getElementById: vi.fn(() => ({ checked: false })),
    })

    const latex = creerDocumentAmc({
      exercices: [
        {
          amcReady: true,
          amcType: 'AMCNum',
          autoCorrection: [],
          id: 'EMPTY_READY',
          nbQuestions: 0,
          titre: 'Vide',
          listeQuestions: [],
          listeCorrections: [],
        } as any,
      ],
    })

    expect(latex).not.toContain('\\element{EMPTY_READY}')
    expect(latex).not.toContain('\\restituegroupe{EMPTY_READY}')

    vi.unstubAllGlobals()
  })

  it('génère un élément indépendant pour chaque question AMCOpen', () => {
    vi.stubGlobal('document', {
      getElementById: vi.fn(() => ({ checked: false })),
    })

    const latex = creerDocumentAmc({
      exercices: [
        {
          amcReady: true,
          amcType: 'AMCOpen',
          autoCorrectionAMC: Array.from({ length: 4 }, (_, index) => ({
            enonce: `Version ${index + 1}`,
            propositions: [{ texte: `Correction ${index + 1}`, statut: 3 }],
          })),
          consigne: 'Traiter la question.',
          id: '6G01',
          nbQuestions: 4,
          titre: 'Quatre versions',
          listeQuestions: Array.from(
            { length: 4 },
            (_, index) => `Version ${index + 1}`,
          ),
          listeCorrections: Array.from(
            { length: 4 },
            (_, index) => `Correction ${index + 1}`,
          ),
        } as any,
      ],
    })

    expect(latex.match(/\\element\{6G01\}\{/g)).toHaveLength(4)
    expect(latex.match(/\\begin\{question\}\{6G01A1[0-3]\}/g)).toHaveLength(4)
    for (let index = 1; index <= 4; index++) {
      expect(latex).toContain(`Version ${index}`)
    }

    vi.unstubAllGlobals()
  })

  it('utilise questionmult dès qu’un QCM contient plusieurs bonnes réponses', () => {
    vi.stubGlobal('document', {
      getElementById: vi.fn(() => ({ checked: false })),
    })

    const latex = creerDocumentAmc({
      exercices: [
        {
          amcReady: true,
          // Le rendu doit rester sûr même si une ancienne métadonnée est
          // incohérente avec les propositions réellement générées.
          amcType: 'qcmMono',
          autoCorrection: [
            {
              enonce: 'Sélectionner les réponses exactes.',
              propositions: [
                { texte: 'Réponse A', statut: true },
                { texte: 'Réponse B', statut: true },
                { texte: 'Réponse C', statut: false },
              ],
            },
          ],
          id: 'QCM_MULTIPLE',
          nbQuestions: 1,
          titre: 'QCM multiple',
          listeQuestions: ['Sélectionner les réponses exactes.'],
          listeCorrections: ['A et B.'],
        } as any,
      ],
    })

    expect(latex).toContain('\\begin{questionmult}{QCMMULTIPLEA10}')
    expect(latex).toContain('\\end{questionmult}')
    expect(latex).not.toContain('\\begin{question}{QCMMULTIPLEA10}')

    vi.unstubAllGlobals()
  })

  it('detecte les groupes restitues sans element correspondant', () => {
    const report = checkAMCGroupConsistency(`
      \\element{A}{\\begin{question}{A1}X\\end{question}}
      \\restituegroupe{A}
      \\restituegroupe{B}
    `)

    expect(report.missingGroupDefinitions).toContain('B')
    expect(report.missingGroupDefinitions).not.toContain('A')
  })

  it('ne signale pas d incoherence sur un document AMC coherent', () => {
    vi.stubGlobal('document', {
      getElementById: vi.fn(() => ({ checked: false })),
    })

    const latex = creerDocumentAmc({
      exercices: [
        {
          amcReady: true,
          amcType: 'AMCNum',
          autoCorrection: [
            {
              enonce: 'Question',
              reponse: {
                valeur: 9,
                param: { digits: 1, decimals: 0, tpoint: ',' },
              },
            },
          ],
          id: 'COHERENT',
          nbQuestions: 1,
          titre: 'Cohérent',
          listeQuestions: ['Question'],
          listeCorrections: ['Correction'],
        } as any,
      ],
    })

    const report = checkAMCGroupConsistency(latex)
    expect(report.missingGroupDefinitions).toHaveLength(0)

    vi.unstubAllGlobals()
  })

  it('injecte des packages dynamiques detectes depuis le contenu AMC', () => {
    vi.stubGlobal('document', {
      getElementById: vi.fn(() => ({ checked: false })),
    })

    const latex = creerDocumentAmc({
      exercices: [
        {
          amcReady: true,
          amcType: 'AMCNum',
          autoCorrection: [
            {
              enonce: 'Mesure : $\\ang{30}$',
              reponse: {
                valeur: 9,
                param: { digits: 1, decimals: 0, tpoint: ',' },
              },
            },
          ],
          id: 'DYN_CONTENT',
          nbQuestions: 1,
          titre: 'Dynamique contenu',
          listeQuestions: ['Mesure : $\\ang{30}$'],
          listeCorrections: ['Correction'],
        } as any,
      ],
    })

    expect(latex).toContain('\\usepackage{siunitx}')

    vi.unstubAllGlobals()
  })

  it('injecte les listePackages et commandes latex des exercices dans le preambule AMC', () => {
    vi.stubGlobal('document', {
      getElementById: vi.fn(() => ({ checked: false })),
    })

    const latex = creerDocumentAmc({
      exercices: [
        {
          amcReady: true,
          amcType: 'AMCNum',
          autoCorrection: [
            {
              enonce: 'Question',
              reponse: {
                valeur: 2,
                param: { digits: 1, decimals: 0, tpoint: ',' },
              },
            },
          ],
          listePackages: ['siunitx', 'cmd\\newcommand{\\AMCSpec}{ok}'],
          id: 'DYN_PACKAGES',
          nbQuestions: 1,
          titre: 'Dynamique packages',
          listeQuestions: ['Question'],
          listeCorrections: ['Correction'],
        } as any,
      ],
    })

    expect(latex).toContain('\\usepackage{siunitx}')
    expect(latex).toContain('\\newcommand{\\AMCSpec}{ok}')

    vi.unstubAllGlobals()
  })

  it('infere les types AMC avant de generer un document LaTeX AMC', () => {
    const exerciseExplicitQcm = prepareExercise(exercice2N40_1, 'amc-seed-1')
    const exerciseInferredQcm = {
      titre: 'QCM a inferer',
      nbQuestions: 1,
      formatInteractif: 'qcm',
      autoCorrection: [
        {
          propositions: [
            { texte: 'A', statut: false },
            { texte: 'B', statut: true },
            { texte: 'C', statut: false },
          ],
        },
      ],
      listeQuestions: ['Question QCM'],
      listeCorrections: ['Correction QCM'],
      questionJamaisPosee: () => true,
      reinit: () => {},
      nouvelleVersion: () => {},
    } as any
    mathaleaEnsureAMCCompatibility(exerciseInferredQcm)
    const exerciseInferredMathLive = {
      titre: 'MathLive a inferer',
      nbQuestions: 1,
      formatInteractif: 'mathlive',
      autoCorrection: [
        {
          reponse: {
            reponse: {
              value: 42,
              options: { nombreDecimalSeulement: true },
            },
          },
        },
      ],
      listeQuestions: ['Question MathLive'],
      listeCorrections: ['Correction MathLive'],
      questionJamaisPosee: () => true,
      reinit: () => {},
      nouvelleVersion: () => {},
    } as any
    mathaleaEnsureAMCCompatibility(exerciseInferredMathLive)
    const exerciseExplicitlyBlocked = {
      titre: 'AMC refuse',
      nbQuestions: 1,
      formatInteractif: 'mathLive',
      amcReady: false,
      amcType: 'AMCOpen',
      autoCorrection: [],
      listeQuestions: ['Question bloquee'],
      listeCorrections: ['Correction bloquee'],
      questionJamaisPosee: () => true,
      reinit: () => {},
      nouvelleVersion: () => {},
    } as any
    mathaleaEnsureAMCCompatibility(exerciseExplicitlyBlocked)

    expect(exerciseExplicitQcm.amcType).toBe(exercice2N40_1.amcType)
    expect(exerciseInferredQcm.amcType).toBe(inferQcmType(exerciseInferredQcm))
    expect(exerciseInferredMathLive.amcType).toBe('AMCOpen')
    expect(exerciseExplicitlyBlocked.amcReady).toBe(false)
    expect(exerciseExplicitlyBlocked.amcType).toBe('AMCOpen')

    const getElementByIdSpy = vi
      .spyOn(document, 'getElementById')
      .mockReturnValue({ checked: false } as any)

    const latex = creerDocumentAmc({
      exercices: [
        exerciseExplicitQcm,
        exerciseInferredQcm,
        exerciseInferredMathLive,
        exerciseExplicitlyBlocked,
      ],
      matiere: 'Mathématiques',
      titre: 'Test AMC',
      typeEntete: 'AMCcodeGrid',
    })

    expect(latex).toContain('\\documentclass')
    expect(latex).toContain('\\begin{question}')
    expect(latex).toContain('\\bonne')
    expect(latex).not.toContain('Question bloquee')

    getElementByIdSpy.mockRestore()
  })

  it('nettoie les collisions de packages pour eviter les option clash dans le preambule AMC dynamique', () => {
    vi.stubGlobal('document', {
      getElementById: vi.fn(() => ({ checked: false })),
    })

    const latex = creerDocumentAmc({
      exercices: [
        {
          amcReady: true,
          amcType: 'AMCNum',
          autoCorrection: [
            {
              enonce: 'Tracer \\draw[color={red}] (0,0)--(1,1) puis \\ang{45}.',
              reponse: {
                valeur: 1,
                param: { digits: 1, decimals: 0, tpoint: ',' },
              },
            },
          ],
          listePackages: ['xcolor', 'siunitx', 'siunitx'],
          id: 'DYN_CLASH',
          nbQuestions: 1,
          titre: 'Dynamique collisions',
          listeQuestions: [
            'Tracer \\draw[color={red}] (0,0)--(1,1) puis \\ang{45}.',
          ],
          listeCorrections: ['Correction'],
        } as any,
      ],
    })

    expect(latex).not.toContain('\\usepackage[table,svgnames]{xcolor}')
    expect((latex.match(/\\usepackage\{siunitx\}/g) ?? []).length).toBe(1)

    vi.unstubAllGlobals()
  })

  it('prefere autoCorrectionAMC latex et exclut les balises html/svg du document exporte', () => {
    vi.stubGlobal('document', {
      getElementById: vi.fn(() => ({ checked: false })),
    })

    const latex = creerDocumentAmc({
      exercices: [
        {
          amcReady: true,
          amcType: 'AMCOpen',
          autoCorrection: [
            {
              enonce: '<ul><li>Enonce HTML</li></ul><svg><circle /></svg>',
              propositions: [
                {
                  texte: '<li>Correction HTML</li>',
                  statut: 3,
                  pointilles: true,
                },
              ],
            },
          ],
          autoCorrectionAMC: [
            {
              enonce: '\\begin{itemize}\\item Enonce LaTeX\\end{itemize}',
              propositions: [
                {
                  texte: 'Correction LaTeX',
                  statut: 3,
                  pointilles: true,
                },
              ],
            },
          ],
          id: 'AMCOPEN_LATEX',
          nbQuestions: 1,
          titre: 'AMCOpen LaTeX prioritaire',
          listeQuestions: ['Question'],
          listeCorrections: ['Correction'],
        } as any,
      ],
      assumeAmcPrepared: true,
    })

    expect(latex).toContain('Enonce LaTeX')
    expect(latex).toContain('Correction LaTeX')
    expect(latex).not.toContain('<ul>')
    expect(latex).not.toContain('<li>')
    expect(latex).not.toContain('<svg')

    vi.unstubAllGlobals()
  })
})
