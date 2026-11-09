import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { droite, droiteParPointEtPente } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import type { IDroite } from '../../lib/2d/Interfaces'
import { penteAffineAnimee } from '../../lib/2d/PenteAffineAnimee'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import RepereBuilder from '../../lib/2d/RepereBuilder'
import { latex2d } from '../../lib/2d/textes'
import { bleuMathalea, orangeMathalea, vertMathalea } from '../../lib/colors'
import {
  MathaleaCouteauSuisseElement,
  type MathaleaCouteauSuisseChild,
} from '../../lib/customElements/MathaleaCouteauSuisse'
import { MathaleaQcmElement } from '../../lib/customElements/MathaleaQcm'
import { MultiMathfieldElement } from '../../lib/customElements/MultiMathfield'
import {
  addTableauSignesVariations,
  TableauSignesVariationsElement,
} from '../../lib/customElements/TableauSignesVariationsElement'
import { deuxColonnesResp } from '../../lib/format/miseEnPage'
import {
  lireFormulaireComplexe,
  serialiseFormulaireComplexe,
  valeursParDefaut,
  type FormulaireComplexe,
} from '../../lib/formulaireComplexe'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import type { TableauSVConfig } from '../../lib/interactif/tableauSignesVariations/types'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { reduireAxPlusB } from '../../lib/outils/ecritures'
import { lettreMinusculeDepuisChiffre, sp } from '../../lib/outils/outilString'
import type { InteractivityType } from '../../lib/types'
import { context } from '../../modules/context'
import type FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const dateDeModifImportante = '31/10/2026'
export const uuid = '99d4e'
export const interactifReady = true
export const titre = 'Étudier une fonction affine à partir de son expression'

export const refs = {
  'fr-fr': ['2F21-9'],
  'fr-ch': [],
}
/**
 * @author Jean-Claude Lhote
 */

const leSuperFormulaire: FormulaireComplexe = {
  champs: [
    {
      type: 'listePonderee',
      nom: 'typeCoefDir',
      label: 'Types de coefficients directeurs',
      items: [
        {
          nom: '1',
          label: 'Entier relatif',
          poids: 0,
        },
        {
          nom: '2',
          label: 'rationnel',
          poids: 1,
        },
      ],
    },
    {
      type: 'listePonderee',
      nom: 'typeAntecedent',
      label: "Types d'antécédents",
      items: [
        { nom: '1', label: 'Entier relatif' },
        { nom: '2', label: 'Rationnel' },
      ],
    },
    {
      type: 'case',
      nom: 'withSignTab',
      label: 'Avec tableau de signes',
      defaut: true,
    },
  ],
}
export default class ExoCompletAffine extends Exercice {
  withSignTab: boolean = true
  get formulaireComplexe(): FormulaireComplexe {
    return leSuperFormulaire
  }

  constructor() {
    super()
    this.nbQuestions = 1
    this.spacing = 2
    this.besoinFormulaireComplexe = this.formulaireComplexe
    this.sup = serialiseFormulaireComplexe(
      this.formulaireComplexe,
      valeursParDefaut(this.formulaireComplexe),
    )
  }
  genereCoefDir(type: string): FractionEtendue {
    if (type === '1') {
      return fraction(randint(-2, 2, 0), 1)
    } else {
      let a: FractionEtendue
      do {
        a = fraction(randint(-4, 4, 0), choice([2, 3, 4, 5]))
      } while (a.estEntiere)
      return a
    }
  }
  genereAntecedents(type: string): [FractionEtendue, FractionEtendue] {
    if (type === '1') {
      const a = randint(-5, 5, 0)
      const x0 = fraction(a, 1)
      const x1 = fraction(randint(-5, 5, a), 1)
      const result = [x0, x1].sort((x, y) => x.num / x.den - y.num / y.den)
      return result as [FractionEtendue, FractionEtendue]
    } else {
      const a = randint(-10, 10, 0)
      const b = randint(-10, 10, a)
      const x0 = fraction(a, choice([2, 3, 4, 5]))
      const x1 = fraction(b, choice([2, 3, 4, 5]))
      const result = [x0, x1].sort((x, y) => x.num / x.den - y.num / y.den)
      return result as [FractionEtendue, FractionEtendue]
    }
  }
  genereImages(type: string): [FractionEtendue, FractionEtendue] {
    if (type === '1') {
      const a = randint(-5, 5, 0)
      const y2 = fraction(a, 1)
      const y3 = fraction(randint(-5, 5, a), 1)
      const result = [y2, y3].sort((x, y) => x.num / x.den - y.num / y.den)
      return result as [FractionEtendue, FractionEtendue]
    } else {
      const a = randint(-10, 10, 0)
      const b = randint(-10, 10, a)
      const y2 = fraction(a, choice([2, 3, 4, 5]))
      const y3 = fraction(b, choice([2, 3, 4, 5]))
      const result = [y2, y3].sort((x, y) => x.num / x.den - y.num / y.den)
      return result as [FractionEtendue, FractionEtendue]
    }
  }

  image(a: FractionEtendue, b: FractionEtendue, x: FractionEtendue) {
    return a.produitFraction(x).sommeFraction(b).simplifie()
  }

  antecedent(a: FractionEtendue, b: FractionEtendue, y: FractionEtendue) {
    return y.differenceFraction(b).diviseFraction(a).simplifie()
  }

  signeSurIntervalle(a: FractionEtendue, estAvantZero: boolean) {
    const signeA = a.valeurDecimale > 0 ? 1 : -1
    return signeA * (estAvantZero ? -1 : 1) > 0 ? '+' : '-'
  }

  commandeCouleurTexte(couleur: string): string {
    if (context.isHtml || !couleur.startsWith('#')) {
      return `\\color{${couleur}}`
    }
    return `\\color[HTML]{${couleur.slice(1)}}`
  }

  configTableauSignes(a: FractionEtendue, b: FractionEtendue): TableauSVConfig {
    const zero = b.oppose().diviseFraction(a).simplifie().texFSD
    const signeAvantZero = this.signeSurIntervalle(a, true)
    const signeApresZero = this.signeSurIntervalle(a, false)
    return {
      variableName: 'x',
      colonnes: [
        { valeur: '-\\infty' },
        { valeur: '', editable: true, expected: zero },
        { valeur: '+\\infty' },
      ],
      lignes: [
        {
          type: 'signe',
          label: 'g(x)',
          cellules: [
            { symbole: '' },
            {
              symbole: '',
              editable: true,
              expected: signeAvantZero,
            },
            { symbole: '|0' },
            {
              symbole: '',
              editable: true,
              expected: signeApresZero,
            },
            { symbole: '' },
          ],
        },
      ],
    }
  }

  configTableauSignesCorrige(
    a: FractionEtendue,
    b: FractionEtendue,
  ): TableauSVConfig {
    const zero = b.oppose().diviseFraction(a).simplifie().texFSD
    const signeAvantZero = this.signeSurIntervalle(a, true)
    const signeApresZero = this.signeSurIntervalle(a, false)
    return {
      variableName: 'x',
      colonnes: [
        { valeur: '-\\infty' },
        { valeur: zero, highlight: true },
        { valeur: '+\\infty' },
      ],
      lignes: [
        {
          type: 'signe',
          label: 'g(x)',
          cellules: [
            { symbole: '' },
            { symbole: signeAvantZero, highlight: true },
            { symbole: '|0' },
            { symbole: signeApresZero, highlight: true },
            { symbole: '' },
          ],
        },
      ],
    }
  }

  genereGraphique(
    a: FractionEtendue,
    b: FractionEtendue,
    figureId?: string,
  ): {
    graphique: string
    bonneDroite: number
    couleursParDroite: Record<number, string>
  } {
    const couleursDiscernables = [orangeMathalea, vertMathalea, 'gray', 'brown']
    const indices = shuffle([1, 2, 3, 4])
    const couleursParDroite: Record<number, string> = {}
    const objets: NestedObjetMathalea2dArray = []
    const lesDroites: IDroite[] = []
    const d1 = droiteParPointEtPente(
      pointAbstrait(0, b.num / b.den),
      a.num / a.den,
    )
    d1.pente = a.num / a.den
    d1.ordonneeOrigine = b.num / b.den
    const d2 = droiteParPointEtPente(
      pointAbstrait(0, b.num / b.den),
      -a.num / a.den,
    )
    d2.pente = -a.num / a.den
    d2.ordonneeOrigine = b.num / b.den
    const d3 = droiteParPointEtPente(
      pointAbstrait(0, a.num / a.den),
      b.num / b.den,
    )
    d3.pente = b.num / b.den
    d3.ordonneeOrigine = a.num / a.den
    const d4 = droite(
      pointAbstrait(0, a.num / a.den),
      pointAbstrait(b.num / b.den, 0),
    )
    d4.pente = -a.num / a.den / (b.num / b.den)
    d4.ordonneeOrigine = a.num / a.den
    for (let i = 0; i < 4; i++) {
      const d = [d1, d2, d3, d4][i]
      lesDroites.push(d)
      couleursParDroite[indices[i]] = couleursDiscernables[i]
      d.epaisseur = 2
      d.color = colorToLatexOrHTML(couleursDiscernables[i])
      const a = Number(d.pente)
      const b = Number(d.ordonneeOrigine)
      const nomLatex = `(d_${indices[i]})`

      if (a >= 1.5 || a <= -1.5) {
        objets.push(
          latex2d(nomLatex, (5.5 - b) / a + 0.5, 5.5, {
            color: couleursDiscernables[i],
            letterSize: 'small',
          }),
        )
      } else {
        if (a > 0) {
          objets.push(
            latex2d(nomLatex, 3.5, 3.5 * a + b + 0.5, {
              color: couleursDiscernables[i],
              letterSize: 'small',
            }),
          )
        } else {
          objets.push(
            latex2d(nomLatex, -3, -3 * a + b + 0.5, {
              color: couleursDiscernables[i],
              letterSize: 'small',
            }),
          )
        }
      }
    }

    const rep = new RepereBuilder({
      xMin: -5,
      xMax: 6,
      yMin: -2,
      yMax: 6,
    })
      .setThickX({ xMin: -5, xMax: 6, dx: 1 })
      .setThickY({ yMin: -2, yMax: 6, dy: 1 })
      .setLabelX({ xMin: 0, xMax: 1, dx: 1 })
      .setLabelY({ yMin: 0, yMax: 1, dy: 1 })
      .setGrille({
        grilleX: { xMin: -5, xMax: 6, dx: 1 },
        grilleY: { yMin: -2, yMax: 6, dy: 1 },
      })
      .buildStandard()
    objets.push(rep)
    return {
      graphique: mathalea2d(
        Object.assign(
          { id: figureId, pixelsParCm: 30, scale: 0.8 },
          fixeBordures(objets, { rxmin: 0, rxmax: 0, rymin: 0, rymax: 0 }),
        ),
        objets,
        lesDroites,
      ),
      bonneDroite: indices[0],
      couleursParDroite,
    }
  }

  expressionFonction(a: FractionEtendue, b: FractionEtendue): string {
    return `g(x)=${a.texFractionSaufUn}x${b.texFractionSignee}`
  }

  nouvelleVersion() {
    const params = lireFormulaireComplexe(this.formulaireComplexe, this.sup)
    const typesCoefDir = params.repartition('typeCoefDir', this.nbQuestions)
    const typesAntecedents = params.repartition(
      'typeAntecedent',
      this.nbQuestions,
    )
    const withSignTab = this.withSignTab && params.case('withSignTab')

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const typeCoefDir = typesCoefDir[i]
      const typeAntecedent = typesAntecedents[i]
      let a: FractionEtendue, b: FractionEtendue
      do {
        a = this.genereCoefDir(typeCoefDir)
        b = fraction(randint(-1, 3, [0, 2]), 2)
      } while (
        a.differenceFraction(b).valeurAbsolue().inferieurstrict(0.5) &&
        ++cpt < 50
      )
      const [x0, x1] = this.genereAntecedents(typeAntecedent)
      const [y2, y3] = this.genereImages(
        String(Math.max(Number(typeCoefDir), Number(typeAntecedent))),
      )
      const gx0 = this.image(a, b, x0)
      const gx1 = this.image(a, b, x1)
      const antecedentY2 = this.antecedent(a, b, y2)
      const antecedentY3 = this.antecedent(a, b, y3)
      const figureId = `lectureAffineEx${this.numeroExercice ?? 0}Q${i}`
      const { graphique, bonneDroite, couleursParDroite } =
        this.genereGraphique(a, b, figureId)
      const tableauSignes = this.configTableauSignes(a, b)
      const tableauSignesCorrige = this.configTableauSignesCorrige(a, b)
      const zero = b.oppose().diviseFraction(a).simplifie().texFSD
      const addTableauSignesPourCouteauSuisse = (
        config: TableauSVConfig,
        interactivityOn: boolean,
      ) => {
        const autoCorrectionPrecedente = this.autoCorrection[i]
        // addTableauSignesVariations modifie l'entrée existante sur place :
        // on la retire pour ne pas écraser celle du couteau suisse.
        delete this.autoCorrection[i]
        const html = addTableauSignesVariations(this, i, {
          config,
          interactivityOn,
        })
        const autoCorrection = this.autoCorrection[i]
        if (autoCorrectionPrecedente == null) {
          delete this.autoCorrection[i]
        } else {
          this.autoCorrection[i] = autoCorrectionPrecedente
        }
        return { html, autoCorrection }
      }
      const tableauSignesQuestion = withSignTab
        ? addTableauSignesPourCouteauSuisse(tableauSignes, this.interactif)
        : undefined
      const champTableau = withSignTab
        ? [
            `<br>${sp(4)}${texteEnCouleurEtGras('c)', bleuMathalea)} Dresser le tableau de signes de $g$.<br>`,
            tableauSignesQuestion?.html ?? '',
          ].join('')
        : ''
      const tableauSignesAutoCorrection = tableauSignesQuestion?.autoCorrection
      if (withSignTab && tableauSignesAutoCorrection?.valeur != null) {
        tableauSignesAutoCorrection.valeur.bareme = (listePoints: number[]) => [
          listePoints.every((point) => point > 0) ? 1 : 0,
          1,
        ]
      }
      const propositionsDroites = [1, 2, 3, 4].map((indice) => ({
        texte: `$${this.commandeCouleurTexte(couleursParDroite[indice])}{(d_${indice})}$`,
        statut: indice === bonneDroite,
      }))
      const elements: MathaleaCouteauSuisseChild[] = [
        {
          formatInteractif: MultiMathfieldElement.elementTag,
          autoCorrection: {
            valeur: {
              champ1: {
                value: gx0.texFSD,
              },
              champ2: {
                value: gx1.texFSD,
              },
              champ3: {
                value: antecedentY2.texFSD,
              },
              champ4: {
                value: antecedentY3.texFSD,
              },
            },
          },
        },
        ...(withSignTab
          ? [
              {
                formatInteractif:
                  TableauSignesVariationsElement.elementTag as InteractivityType,
                autoCorrection: tableauSignesAutoCorrection,
              },
            ]
          : []),
        {
          formatInteractif: MathaleaQcmElement.elementTag as InteractivityType,
          autoCorrection: {
            propositions: propositionsDroites,
            options: { radio: true },
          },
        },
      ]

      this.autoCorrection[i] = {
        formatInteractif: MathaleaCouteauSuisseElement.elementTag,
        elements,
      }

      const champsCalculs = MultiMathfieldElement.create({
        numeroExercice: this.numeroExercice,
        questionIndex: i,
        dataTemplate: [
          `a) Calculer les images de $${x0.texFSD}$ et $${x1.texFSD}$ par $g$ :`,
          `$g(${x0.texFSD})=$%{champ1} et $g(${x1.texFSD})=$%{champ2}.`,
          `b) Calculer les antécédents de $${y2.texFSD}$ et $${y3.texFSD}$ par $g$ :`,
          `$g(x)=${y2.texFSD}$ pour $x=$%{champ3} et $g(x)=${y3.texFSD}$ pour $x=$%{champ4}.`,
        ].join('<br>'),
        dataOptions: {
          champ1: {
            keyboard: KeyboardType.clavierDeBaseAvecFraction,
            ldots: true,
          },
          champ2: {
            keyboard: KeyboardType.clavierDeBaseAvecFraction,
            ldots: true,
          },
          champ3: {
            keyboard: KeyboardType.clavierDeBaseAvecFraction,
            ldots: true,
          },
          champ4: {
            keyboard: KeyboardType.clavierDeBaseAvecFraction,
            ldots: true,
          },
        },
        interactivityOn: this.interactif,
      })
      const numeroQcm = withSignTab ? 4 : 3
      const animationLectureAffine =
        context.isHtml && !context.isTypst
          ? penteAffineAnimee({
              figureId,
              b: b.num / b.den,
              numerateur: a.num,
              denominateur: a.den,
              pixelsParCm: 30,
            })
          : ''
      const separateurQcm = context.isHtml ? '<br>' : '\n\n'
      const champQcm = [
        `<br>${sp(4)}${texteEnCouleurEtGras(` ${lettreMinusculeDepuisChiffre(numeroQcm)})`, bleuMathalea)} Parmi les quatre droites tracées ci-dessous, laquelle représente la fonction $g$ ?`,
        graphique,
        MathaleaQcmElement.create({
          numeroExercice: this.numeroExercice ?? 0,
          questionIndex: i,
          propositions: propositionsDroites,
          radio: true,
          vertical: false,
        }),
      ].join(separateurQcm)

      this.listeQuestions[i] = [
        `La fonction affine $g$ est définie par $${this.expressionFonction(a, b)}$.`,
        MathaleaCouteauSuisseElement.create({
          numeroExercice: this.numeroExercice ?? 0,
          questionIndex: i,
          elements,
          contenu: [champsCalculs, champTableau, champQcm].join(''),
          interactivityOn: this.interactif,
        }),
      ].join('<br>')
      this.listeCorrections[i] = [
        `${texteEnCouleurEtGras(`${lettreMinusculeDepuisChiffre(1)})`, bleuMathalea)} $g(${x0.texFSD})=${a.texFSD}\\times ${x0.texFSP} ${b.ecritureAlgebrique} = ${gx0.texFSD}$ et $g(${x1.texFSD})=${a.texFSD}\\times ${x1.texFSP} ${b.ecritureAlgebrique} = ${gx1.texFSD}$.`,
        `${texteEnCouleurEtGras(`${lettreMinusculeDepuisChiffre(2)})`, bleuMathalea)} Les antécédents de $${y2.texFSD}$ et $${y3.texFSD}$ sont respectivement $${antecedentY2.texFSD}$ et $${antecedentY3.texFSD}$.<br>
        En effet, ${deuxColonnesResp(
          `$\\begin{aligned}g(x)=${y2.texFSD}&\\iff ${reduireAxPlusB(a, b)}=${y2.texFSD}\\\\
        &\\iff ${reduireAxPlusB(a, 0)}=${y2.texFSD} ${b.oppose().ecritureAlgebrique}\\\\
        &\\iff x=\\frac{${y2.texFSD} ${b.oppose().ecritureAlgebrique}}{${a.texFSD}}\\\\
        &\\iff x=${miseEnEvidence(antecedentY2.texFSD)}.\\end{aligned}$`,
          `De même,<br> $\\begin{aligned}g(x)=${y3.texFSD}&\\iff ${reduireAxPlusB(a, b)}=${y3.texFSD}\\\\
        &\\iff ${reduireAxPlusB(a, 0)}=${y3.texFSD} ${b.oppose().ecritureAlgebrique}\\\\
        &\\iff x=\\frac{${y3.texFSD} ${b.oppose().ecritureAlgebrique}}{${a.texFSD}}\\\\
        &\\iff x=${miseEnEvidence(antecedentY3.texFSD)}\\end{aligned}$`,
          { largeur1: 50, widthmincol1: '200px', widthmincol2: '200px' },
        )}
        <br>.`,
        withSignTab
          ? `${texteEnCouleurEtGras(`${lettreMinusculeDepuisChiffre(3)})`, bleuMathalea)} $g(x)=0\\iff ${reduireAxPlusB(a, b)}=0\\iff ${reduireAxPlusB(a, 0)}=${b.oppose().ecritureAlgebrique}\\iff x=\\frac{${b.oppose().ecritureAlgebrique}}{${a.texFSD}}\\iff x=${miseEnEvidence(zero)}$.<br>
        La fonction $g$ s'annule donc pour $x=${miseEnEvidence(zero)}$.<br>
        Comme le coefficient directeur de $g$ est $${a.ecritureAlgebrique}$, la fonction $g$ est strictement ${a.valeurDecimale > 0 ? 'croissante' : 'décroissante'}. On en déduit le tableau de signes suivant :<br>
        ${addTableauSignesPourCouteauSuisse(tableauSignesCorrige, false).html}`
          : '',
        `${texteEnCouleurEtGras(`${lettreMinusculeDepuisChiffre(numeroQcm)})`, bleuMathalea)} La droite représentative de $g$ est $${miseEnEvidence(`(d_${bonneDroite})`)}$.${animationLectureAffine}`,
      ]
        .filter(Boolean)
        .join('<br>')
      i++
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
