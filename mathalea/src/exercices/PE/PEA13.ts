import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha } from '../../lib/outils/outilString'
import { prenoms } from '../../lib/outils/Personne'
import {
  estPremier,
  factorisation,
  listeDesDiviseurs,
  pgcd,
  ppcm,
} from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import type { OptionsComparaisonType } from '../../lib/types'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import {
  couleursFacteurs,
  texEchelleDeDivisions,
  texFacto,
  texListeDiviseurs,
  texRechercheDesDiviseurs,
} from './PEA11'

export const titre =
  'Résoudre des problèmes de diviseurs et de multiples (PGCD et PPCM)'
export const interactifReady = true
export const dateDePublication = '02/10/2026'
export const uuid = '18492'
export const refs = {
  'fr-fr': ['PEA13'],
  'fr-ch': ['9R2NO1H-12', '9R3NO1H-12', '10CTNO1B-12', 'PRQNO09C-5', 'PRQNO15C-11'],
}

/**
 * Problèmes de partage, de découpe ou de rencontre qui se résolvent avec un PGCD (diviseurs) ou un PPCM (multiples).
 * Chaque problème vaut 4 points : 2 points par sous-question quand il y en a 2, 4 points sinon.
 * @author Rémi Angot
 */
export default class ProblemesPgcdPpcm extends Exercice {
  constructor() {
    super()
    const nbTypes = typesDeProblemes.length
    this.besoinFormulaireTexte = [
      'Types de problèmes',
      `Nombres séparés par des tirets :\n${typesDeProblemes.map((type, k) => `${k + 1} : ${type.titre}`).join('\n')}\n${nbTypes + 1} : Mélange`,
    ]
    this.sup = String(nbTypes + 1)
    this.nbQuestions = 2
  }

  nouvelleVersion() {
    const nbTypes = typesDeProblemes.length
    const types = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: nbTypes,
      melange: nbTypes + 1,
      defaut: nbTypes + 1,
      nbQuestions: this.nbQuestions,
    }) as number[]
    const ordresDesScenarios = typesDeProblemes.map(({ nbScenarios }) =>
      combinaisonListes(
        Array.from({ length: nbScenarios }, (_, k) => k),
        this.nbQuestions,
      ),
    )
    const nbUtilisations = typesDeProblemes.map(() => 0)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const type = types[i] - 1
      const scenario = ordresDesScenarios[type][nbUtilisations[type]]
      const probleme = typesDeProblemes[type].construire(scenario)
      if (this.questionJamaisPosee(i, probleme.enonce)) {
        const { texte, texteCorr } = this.rediger(i, probleme)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        nbUtilisations[type]++
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }

  /**
   * Construit l'énoncé (avec un multimathfield en mode interactif) et la correction, puis déclare les réponses
   */
  private rediger(i: number, probleme: Probleme) {
    const { enonce, correctionCommune, sousQuestions } = probleme
    const plusieurs = sousQuestions.length > 1
    const etiquette = (k: number) => (plusieurs ? numAlpha(k) : '')

    let texte = enonce
    if (this.interactif) {
      let numeroChamp = 0
      const dataOptions: Record<string, { keyboard?: string }> = {}
      const lignes = sousQuestions.map((sousQuestion, k) => {
        const ligne = sousQuestion.ligneReponse.replace(/§/g, () => {
          const nom = `field${numeroChamp++}`
          dataOptions[nom] = {
            keyboard: sousQuestion.clavier ?? KeyboardType.clavierNumbers,
          }
          return `%{${nom}}`
        })
        return sousQuestion.question === ''
          ? ligne
          : `${etiquette(k)}${sousQuestion.question}<br>${ligne}`
      })
      texte = `${enonce}<br><br>${addMultiMathfield(this, i, {
        dataTemplate: lignes.join('<br>'),
        dataOptions,
      })}`
      const reponses: Record<
        string,
        { value: number | string; options?: OptionsComparaisonType }
      > = {}
      let numero = 0
      for (const sousQuestion of sousQuestions) {
        for (const reponse of sousQuestion.reponses) {
          reponses[`field${numero++}`] = reponse
        }
      }
      handleAnswers(
        this,
        i,
        {
          bareme: baremeSurQuatre(
            sousQuestions.map((sq) => sq.reponses.length),
          ),
          ...reponses,
        },
        { formatInteractif: 'multi-mathfield' },
      )
    } else {
      const questions = sousQuestions.filter((sq) => sq.question !== '')
      if (questions.length > 0) {
        texte += `<br>${questions.map((sq, k) => `<br>${etiquette(k)}${sq.question}`).join('')}`
      }
    }

    let texteCorr = `${correctionCommune}<br><br>`
    texteCorr += sousQuestions
      .map((sq, k) => `${etiquette(k)}${sq.correction}`)
      .join('<br><br>')
    return { texte, texteCorr }
  }
}

type Personne = { prenom: string; pronom: string }

type SousQuestion = {
  question: string
  /** Ligne de réponse : chaque § est remplacé par un champ de saisie */
  ligneReponse: string
  reponses: { value: number | string; options?: OptionsComparaisonType }[]
  correction: string
  clavier?: string
}

type Probleme = {
  enonce: string
  /** Raisonnement, décompositions en produit de facteurs premiers puis PGCD ou PPCM */
  correctionCommune: string
  sousQuestions: SousQuestion[]
}

/**
 * Chaque problème vaut 4 points : une sous-question vaut 4 points si elle est seule, 2 points sinon.
 * Les points d'une sous-question sont partagés entre ses champs.
 */
function baremeSurQuatre(nbChampsParSousQuestion: number[]) {
  return (listePoints: number[]): [number, number] => {
    const pointsParSousQuestion = 4 / nbChampsParSousQuestion.length
    let total = 0
    let indice = 0
    for (const nbChamps of nbChampsParSousQuestion) {
      for (let k = 0; k < nbChamps; k++) {
        total +=
          ((listePoints[indice++] ?? 0) * pointsParSousQuestion) / nbChamps
      }
    }
    return [total, 4]
  }
}

const nb = (n: number) => `$${texNombre(n, 0)}$`
const fin = (x: number | string) =>
  `$${miseEnEvidence(typeof x === 'number' ? texNombre(x, 0) : x)}$`
const Il = (p: Personne) => (p.pronom === 'il' ? 'Il' : 'Elle')
const il = (p: Personne) => p.pronom
const luiMeme = (p: Personne) => (p.pronom === 'il' ? 'lui-même' : 'elle-même')
/** « de x » ou « d’x » devant une voyelle ou un h */
const de = (x: string) =>
  /^[aeiouyhàâéèêëîïôûœ]/i.test(x) ? `d’${x}` : `de ${x}`
/** « que x » ou « qu’x » devant une voyelle ou un h */
const que = (x: string) =>
  /^[aeiouyhàâéèêëîïôûœ]/i.test(x) ? `qu’${x}` : `que ${x}`

type TypeDeProbleme = {
  /** Titre affiché dans le formulaire des paramètres */
  titre: string
  /** Nombre de situations différentes proposées par ce type de problème */
  nbScenarios: number
  /** Construit un problème à partir de la situation numéro `scenario` */
  construire: (scenario: number) => Probleme
}

function tirerPersonnes(n: number): Personne[] {
  return shuffle(prenoms).slice(0, n)
}

/**
 * Tire (g, m, n) avec m et n premiers entre eux : les deux nombres sont g×m et g×n et leur PGCD est g.
 * Une fois sur deux, m et n sont échangés.
 */
function tirerGMN(
  gs: number[],
  ms: number[],
  convient: (g: number, m: number, n: number) => boolean = () => true,
): [number, number, number] {
  for (let essai = 0; essai < 1000; essai++) {
    const g = choice(gs)
    const m = choice(ms)
    const n = choice(ms)
    if (m !== n && pgcd(m, n) === 1 && convient(g, m, n)) {
      return randint(0, 1) === 0 ? [g, m, n] : [g, n, m]
    }
  }
  return [gs[0], 2, 3]
}

function exposantDans(facto: [number, number][], p: number) {
  return facto.find(([q]) => q === p)?.[1] ?? 0
}

function decompositions(
  a: number,
  b: number,
  couleurs: Record<number, string>,
) {
  const ligne = (n: number) =>
    estPremier(n)
      ? `$${texNombre(n, 0)}$ est un nombre premier.`
      : `$${texNombre(n, 0)} = ${texFacto(factorisation(n), couleurs)}$`
  let texte = `On décompose ${nb(a)} et ${nb(b)} en produit de facteurs premiers :`
  texte += `<br><br>$${texEchelleDeDivisions(a)} \\qquad\\qquad ${texEchelleDeDivisions(b)}$`
  texte += `<br><br>${ligne(a)}<br>${ligne(b)}`
  return texte
}

/**
 * Raisonnement, décompositions puis calcul du PGCD
 */
function correctionPgcd(a: number, b: number, raisonnement: string) {
  const factoA = factorisation(a)
  const factoB = factorisation(b)
  const premiersCommuns = factoA
    .map(([p]) => p)
    .filter((p) => factoB.some(([q]) => q === p))
  const couleurs: Record<number, string> = {}
  for (const p of premiersCommuns) couleurs[p] = couleursFacteurs[p]
  const factoPgcd: [number, number][] = premiersCommuns.map((p) => [
    p,
    Math.min(exposantDans(factoA, p), exposantDans(factoB, p)),
  ])
  let texte = `${raisonnement}<br><br>`
  texte += decompositions(a, b, couleurs)
  texte +=
    '<br><br>Le PGCD est le produit des facteurs premiers communs aux deux décompositions, chacun étant affecté du plus petit des deux exposants :'
  texte += `<br>$\\text{PGCD}(${texNombre(a, 0)}\\text{ ; }${texNombre(b, 0)}) = ${factoPgcd.length > 0 ? `${texFacto(factoPgcd, couleurs)} = ` : ''}${texNombre(pgcd(a, b), 0)}$`
  return texte
}

/**
 * Raisonnement, décompositions puis calcul du PPCM
 */
function correctionPpcm(a: number, b: number, raisonnement: string) {
  const factoA = factorisation(a)
  const factoB = factorisation(b)
  const tousLesPremiers = [
    ...new Set([...factoA.map(([p]) => p), ...factoB.map(([p]) => p)]),
  ].sort((x, y) => x - y)
  const factoPpcm: [number, number][] = tousLesPremiers.map((p) => [
    p,
    Math.max(exposantDans(factoA, p), exposantDans(factoB, p)),
  ])
  let texte = `${raisonnement}<br><br>`
  texte += decompositions(a, b, couleursFacteurs)
  texte +=
    '<br><br>Le PPCM est le produit de tous les facteurs premiers qui apparaissent dans l’une ou l’autre des décompositions, chacun étant affecté du plus grand des deux exposants :'
  texte += `<br>$\\text{PPCM}(${texNombre(a, 0)}\\text{ ; }${texNombre(b, 0)}) = ${texFacto(factoPpcm, couleursFacteurs)} = ${texNombre(ppcm(a, b), 0)}$`
  return texte
}

/**
 * Une seule sous-question de 4 points, avec un seul champ
 */
function problemeSimple(
  enonce: string,
  correctionCommune: string,
  sousQuestion: SousQuestion,
): Probleme {
  return { enonce, correctionCommune, sousQuestions: [sousQuestion] }
}

// ---------------------------------------------------------------------------
// Problèmes de diviseurs
// ---------------------------------------------------------------------------

type ScenarioLots = {
  enonce: (p: Personne, a: number, b: number) => string
  objet1: string
  objet2: string
  lot: string
  lots: string
}

const scenariosLots: ScenarioLots[] = [
  {
    enonce: (p, a, b) =>
      `Pour la kermesse de l’école, ${p.prenom} dispose de ${nb(a)} billes et de ${nb(b)} calots. ${Il(p)} veut faire le plus grand nombre de lots identiques en utilisant toutes les billes et tous les calots.`,
    objet1: 'billes',
    objet2: 'calots',
    lot: 'lot',
    lots: 'lots',
  },
  {
    enonce: (p, a, b) =>
      `${p.prenom} tient une boutique de souvenirs. ${Il(p)} possède un stock de ${nb(a)} savons et de ${nb(b)} sachets de lavande. ${Il(p)} veut écouler tout ce stock en confectionnant le plus grand nombre de coffrets identiques, sans qu’il reste un savon ou un sachet.`,
    objet1: 'savons',
    objet2: 'sachets de lavande',
    lot: 'coffret',
    lots: 'coffrets',
  },
  {
    enonce: (p, a, b) =>
      `${p.prenom} vend des fruits au marché. ${Il(p)} a ${nb(a)} pommes et ${nb(b)} poires. ${Il(p)} veut préparer le plus grand nombre de paniers identiques, avec le même nombre de pommes et le même nombre de poires dans chaque panier, sans aucun fruit en trop.`,
    objet1: 'pommes',
    objet2: 'poires',
    lot: 'panier',
    lots: 'paniers',
  },
  {
    enonce: (p, a, b) =>
      `${p.prenom} est bénévole dans une association de solidarité. ${Il(p)} a reçu ${nb(a)} stylos et ${nb(b)} cahiers qu’${il(p)} veut répartir entre le plus grand nombre possible de kits de rentrée identiques, en utilisant tout le matériel.`,
    objet1: 'stylos',
    objet2: 'cahiers',
    lot: 'kit',
    lots: 'kits',
  },
  {
    enonce: (p, a, b) =>
      `${p.prenom} travaille dans une chocolaterie. ${Il(p)} doit emballer ${nb(a)} chocolats au lait et ${nb(b)} chocolats noirs dans le plus grand nombre possible de ballotins identiques, en utilisant tous les chocolats.`,
    objet1: 'chocolats au lait',
    objet2: 'chocolats noirs',
    lot: 'ballotin',
    lots: 'ballotins',
  },
]

function problemeLots(scenario: number): Probleme {
  const [g, m, n] = tirerGMN(
    [18, 20, 24, 30, 36, 40, 42, 45, 48, 54, 60],
    [4, 5, 6, 7, 8, 9],
  )
  const a = g * m
  const b = g * n
  const [p] = tirerPersonnes(1)
  const s = scenariosLots[scenario]
  const raisonnement = `Pour utiliser tous les ${s.objet1} et tous les ${s.objet2}, le nombre de ${s.lots} doit être un diviseur commun de ${nb(a)} et de ${nb(b)}. Comme on veut le plus grand nombre de ${s.lots} possible, on cherche le PGCD de ${nb(a)} et de ${nb(b)}.`
  return {
    enonce: s.enonce(p, a, b),
    correctionCommune: correctionPgcd(a, b, raisonnement),
    sousQuestions: [
      {
        question: `Combien de ${s.lots} identiques ${p.prenom} pourra-t-${il(p)} faire ?`,
        ligneReponse: `§ ${s.lots}`,
        reponses: [{ value: g }],
        correction: `${Il(p)} pourra faire ${fin(g)} ${s.lots}.`,
      },
      {
        question: `Quelle sera la composition de chaque ${s.lot} ?`,
        ligneReponse: `Chaque ${s.lot} contiendra § ${s.objet1} et § ${s.objet2}.`,
        reponses: [{ value: m }, { value: n }],
        correction: `$${texNombre(a, 0)} \\div ${texNombre(g, 0)} = ${texNombre(m, 0)}$ et $${texNombre(b, 0)} \\div ${texNombre(g, 0)} = ${texNombre(n, 0)}$.<br>Chaque ${s.lot} contiendra ${fin(m)} ${s.objet1} et ${fin(n)} ${s.objet2}.`,
      },
    ],
  }
}

type ScenarioCarres = {
  enonce: (p: Personne, a: number, b: number) => string
}

const scenariosCarres: ScenarioCarres[] = [
  {
    enonce: (p, a, b) =>
      `${p.prenom} dispose d’une plaque de contreplaqué de ${nb(a)} cm de longueur et de ${nb(b)} cm de largeur. ${Il(p)} veut la découper en carrés tous identiques, les plus grands possibles, de façon à ne pas avoir de perte.`,
  },
  {
    enonce: (p, a, b) =>
      `${p.prenom} réalise un patchwork. ${Il(p)} a une pièce de tissu rectangulaire de ${nb(a)} cm sur ${nb(b)} cm et veut la découper en carrés tous identiques, les plus grands possibles, sans aucune chute.`,
  },
  {
    enonce: (p, a, b) =>
      `Dans son atelier, ${p.prenom} découpe des dessous de verre dans des plaques de liège de ${nb(a)} cm de longueur et de ${nb(b)} cm de largeur. La consigne est de découper dans chaque plaque des carrés tous identiques, les plus grands possibles, de façon à ne pas avoir de perte.`,
  },
  {
    enonce: (p, a, b) =>
      `${p.prenom} est vitrier. ${Il(p)} doit découper une plaque de verre rectangulaire de ${nb(a)} cm de longueur et de ${nb(b)} cm de largeur en carrés tous identiques, les plus grands possibles, sans aucune perte.`,
  },
]

function problemeCarres(scenario: number): Probleme {
  const [g, m, n] = tirerGMN(
    [12, 15, 18, 20, 24, 25, 28, 30, 36, 40, 44, 45],
    [4, 5, 6, 7, 8, 9, 10, 11],
    (g0, m0, n0) => g0 * Math.max(m0, n0) <= 500,
  )
  const a = g * m
  const b = g * n
  const [p] = tirerPersonnes(1)
  const s = scenariosCarres[scenario]
  const raisonnement = `Pour qu’il n’y ait pas de perte, la longueur du côté d’un carré doit diviser à la fois ${nb(a)} cm et ${nb(b)} cm. Comme les carrés doivent être les plus grands possibles, on cherche le PGCD de ${nb(a)} et de ${nb(b)}.`
  return {
    enonce: s.enonce(p, a, b),
    correctionCommune: correctionPgcd(a, b, raisonnement),
    sousQuestions: [
      {
        question: 'Quelle est la longueur du côté de chaque carré ?',
        ligneReponse: '§ cm',
        reponses: [{ value: g }],
        correction: `Chaque carré a un côté de ${fin(g)} cm.`,
      },
      {
        question: `Combien de carrés ${p.prenom} obtiendra-t-${il(p)} ?`,
        ligneReponse: '§ carrés',
        reponses: [{ value: m * n }],
        correction: `$${texNombre(a, 0)} \\div ${texNombre(g, 0)} = ${texNombre(m, 0)}$ et $${texNombre(b, 0)} \\div ${texNombre(g, 0)} = ${texNombre(n, 0)}$ : on place ${nb(m)} carrés sur la longueur et ${nb(n)} carrés sur la largeur.<br>$${texNombre(m, 0)} \\times ${texNombre(n, 0)} = ${texNombre(m * n, 0)}$ donc ${Il(p).toLowerCase()} obtiendra ${fin(m * n)} carrés.`,
      },
    ],
  }
}

type ScenarioRangees = {
  enonce: (p: Personne, a: number, b: number) => string
  gens: string
}

const scenariosRangees: ScenarioRangees[] = [
  {
    enonce: (p, a, b) =>
      `${p.prenom} organise le spectacle de fin d’année du collège. Il y a ${nb(a)} garçons et ${nb(b)} filles. ${Il(p)} voudrait former des rangées d’égale longueur comprenant chacune seulement des garçons ou seulement des filles.`,
    gens: 'élèves',
  },
  {
    enonce: (p, a, b) =>
      `${p.prenom} installe les supporters dans une tribune : ${nb(a)} supporters de l’équipe rouge et ${nb(b)} de l’équipe bleue. ${Il(p)} veut former des rangées de même longueur, chacune ne contenant que des supporters d’une seule équipe.`,
    gens: 'supporters',
  },
  {
    enonce: (p, a, b) =>
      `Pour le défilé du 14 juillet, ${p.prenom} dirige une fanfare composée de ${nb(a)} trompettistes et de ${nb(b)} tambours. ${Il(p)} voudrait former des rangées d’égale longueur comprenant chacune seulement des trompettistes ou seulement des tambours.`,
    gens: 'musiciens',
  },
  {
    enonce: (p, a, b) =>
      `Pour la photo de fin d’année, ${p.prenom} doit placer ${nb(a)} élèves de troisième et ${nb(b)} élèves de quatrième. ${Il(p)} voudrait former des rangées d’égale longueur comprenant chacune seulement des élèves de troisième ou seulement des élèves de quatrième.`,
    gens: 'élèves',
  },
]

function problemeRangees(scenario: number): Probleme {
  const [g, m, n] = tirerGMN(
    [30, 36, 40, 45, 48, 60, 72, 90, 120, 150, 180],
    [2, 3, 4, 5, 6, 7, 8, 9],
    (g0, m0, n0) =>
      g0 * Math.max(m0, n0) <= 1000 && g0 * Math.min(m0, n0) >= 300,
  )
  const a = g * m
  const b = g * n
  const [p] = tirerPersonnes(1)
  const s = scenariosRangees[scenario]
  const raisonnement = `Chaque rangée ne contient qu’un seul type de personnes et toutes les rangées ont la même longueur : cette longueur doit diviser à la fois ${nb(a)} et ${nb(b)}. On cherche le maximum de personnes par rangée, donc le PGCD de ${nb(a)} et de ${nb(b)}.`
  return problemeSimple(s.enonce(p, a, b), correctionPgcd(a, b, raisonnement), {
    question: `Combien de personnes au maximum ${p.prenom} peut-${il(p)} mettre dans chaque rangée ?`,
    ligneReponse: `§ ${s.gens}`,
    reponses: [{ value: g }],
    correction: `${Il(p)} peut donc mettre au maximum ${fin(g)} personnes par rangée.`,
  })
}

type ScenarioPartage = {
  contenant: string
  objets: string
}

const scenariosPartage: ScenarioPartage[] = [
  { contenant: 'un paquet', objets: 'bonbons' },
  { contenant: 'un sachet', objets: 'billes' },
  { contenant: 'une pochette', objets: 'autocollants' },
  { contenant: 'une boîte', objets: 'chocolats' },
  { contenant: 'un classeur', objets: 'cartes à collectionner' },
]

function problemePartage(scenario: number): Probleme {
  const n = choice([48, 60, 72, 84, 90, 96, 108])
  const [p] = tirerPersonnes(1)
  const s = scenariosPartage[scenario]
  const facto = factorisation(n)
  const diviseurs = listeDesDiviseurs(n)
  const amis = diviseurs.filter((d) => d > 1).map((d) => d - 1)

  let correctionCommune = `Le nombre de personnes qui se partagent les ${s.objets}, en comptant ${p.prenom}, doit être un diviseur de ${nb(n)}.`
  correctionCommune += `<br><br>On décompose ${nb(n)} en produit de facteurs premiers :<br><br>$${texEchelleDeDivisions(n)}$<br><br>$${texNombre(n, 0)} = ${texFacto(facto, couleursFacteurs)}$`
  correctionCommune += `<br><br>On cherche tous les diviseurs de ${nb(n)} :<br><br>${texRechercheDesDiviseurs(n, facto)}`
  correctionCommune += `<br><br>Les diviseurs de ${nb(n)} sont : ${texListeDiviseurs(diviseurs)}.`

  return problemeSimple(
    `${p.prenom} a ${s.contenant === 'un paquet' ? 'acheté' : 'reçu'} ${s.contenant} de ${nb(n)} ${s.objets}. ${Il(p)} veut les partager avec ses amis mais tient absolument à ce que chacun d’eux (et ${luiMeme(p)}) ait le même nombre ${de(s.objets)}.`,
    correctionCommune,
    {
      question: `Combien d’amis pourront recevoir des ${s.objets} ? Donner toutes les possibilités.`,
      ligneReponse:
        'Nombres d’amis possibles, séparés par des points-virgules : §',
      reponses: [{ value: amis.join(';'), options: { suiteDeNombres: true } }],
      clavier: KeyboardType.clavierEnsemble,
      correction: `${p.prenom} partage aussi, donc le nombre d’amis est égal à un diviseur de ${nb(n)} (le nombre de personnes) diminué de $1$. Le diviseur $1$ est écarté car il ne donne aucun ami.<br>Nombres d’amis possibles : ${fin(amis.map((x) => texNombre(x, 0)).join('\\text{ ; }'))}.`,
    },
  )
}

function problemeFraction(): Probleme {
  const nombresLisses: number[] = []
  for (let k = 25; k <= 120; k++) {
    const facto = factorisation(k)
    if (facto.every(([q]) => q <= 13)) nombresLisses.push(k)
  }
  const [g, m, n] = tirerGMN(
    [14, 15, 21, 22, 26, 28, 30, 33, 34, 35, 36, 39, 42, 45, 55],
    nombresLisses,
    (g0, m0, n0) => g0 * Math.max(m0, n0) <= 7000,
  )
  const a = g * m
  const b = g * n
  const raisonnement =
    'Pour rendre une fraction irréductible, on divise son numérateur et son dénominateur par le PGCD de ces deux nombres.'
  const fraction = `\\dfrac{${texNombre(a, 0)}}{${texNombre(b, 0)}}`
  return problemeSimple(
    `Rendre irréductible la fraction $${fraction}$.`,
    correctionPgcd(a, b, raisonnement),
    {
      question: '',
      ligneReponse: `$${fraction} =$ §`,
      reponses: [
        {
          value: `\\dfrac{${m}}{${n}}`,
          options: { fractionIrreductible: true },
        },
      ],
      clavier: KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
      correction: `$${fraction} = \\dfrac{${texNombre(a, 0)} \\div ${texNombre(g, 0)}}{${texNombre(b, 0)} \\div ${texNombre(g, 0)}} = ${miseEnEvidence(`\\dfrac{${texNombre(m, 0)}}{${texNombre(n, 0)}}`)}$`,
    },
  )
}

// ---------------------------------------------------------------------------
// Problèmes de multiples
// ---------------------------------------------------------------------------

type SousQuestionFois = {
  question: string
  ligneReponse: string
  valeurs: number[]
  correction: string
}

type ScenarioCycle = {
  /** Ordre de grandeur des durées : petites (jours, minutes) ou moyennes (tours de piste) */
  taille: 'petite' | 'moyenne'
  enonce: (p1: Personne, p2: Personne, a: number, b: number) => string
  raisonnement: (p1: Personne, p2: Personne, a: number, b: number) => string
  question: (p1: Personne, p2: Personne) => string
  unite: string
  fois?: (
    p1: Personne,
    p2: Personne,
    a: number,
    b: number,
    valeurPpcm: number,
  ) => SousQuestionFois
}

const multiplesCommuns = (a: number, b: number) =>
  `On cherche le premier moment où les deux évènements ont lieu en même temps, c’est-à-dire le plus petit multiple commun de ${nb(a)} et de ${nb(b)} : le PPCM.`

const scenariosCycles: ScenarioCycle[] = [
  {
    taille: 'petite',
    enonce: (p1, p2, a, b) =>
      `${p1.prenom} et ${p2.prenom} se sont croisés à la laverie du quartier aujourd’hui. ${p1.prenom} y fait sa lessive tous les ${nb(a)} jours et ${p2.prenom} tous les ${nb(b)} jours.`,
    raisonnement: (p1, p2, a, b) =>
      `${p1.prenom} fait sa lessive tous les multiples de ${nb(a)} jours à partir d’aujourd’hui et ${p2.prenom} tous les multiples de ${nb(b)} jours. ${multiplesCommuns(a, b)}`,
    question: () => 'Dans combien de jours se retrouveront-ils à la laverie ?',
    unite: 'jours',
    fois: (_p1, p2, _a, b, v) => ({
      question: `Combien de fois ${p2.prenom} aura-t-${il(p2)} fait sa lessive d’ici là, en comptant celle du jour de leurs retrouvailles ?`,
      ligneReponse: '§ fois',
      valeurs: [v / b],
      correction: `$${texNombre(v, 0)} \\div ${texNombre(b, 0)} = ${texNombre(v / b, 0)}$ donc ${p2.prenom} aura fait sa lessive ${fin(v / b)} fois.`,
    }),
  },
  {
    taille: 'petite',
    enonce: (p1, p2, a, b) =>
      `${p1.prenom} et ${p2.prenom} se sont croisés ce matin à la piscine municipale. ${p1.prenom} y va tous les ${nb(a)} jours et ${p2.prenom} tous les ${nb(b)} jours.`,
    raisonnement: (p1, p2, a, b) =>
      `${p1.prenom} va à la piscine tous les multiples de ${nb(a)} jours à partir d’aujourd’hui et ${p2.prenom} tous les multiples de ${nb(b)} jours. ${multiplesCommuns(a, b)}`,
    question: () =>
      'Dans combien de jours se croiseront-ils de nouveau à la piscine ?',
    unite: 'jours',
    fois: (p1, _p2, a, _b, v) => ({
      question: `Combien de fois ${p1.prenom} sera-t-${il(p1)} allé${p1.pronom === 'il' ? '' : 'e'} à la piscine à ce moment-là, en comptant la séance du jour de leur rencontre ?`,
      ligneReponse: '§ fois',
      valeurs: [v / a],
      correction: `$${texNombre(v, 0)} \\div ${texNombre(a, 0)} = ${texNombre(v / a, 0)}$ donc ${p1.prenom} sera allé${p1.pronom === 'il' ? '' : 'e'} ${fin(v / a)} fois à la piscine.`,
    }),
  },
  {
    taille: 'petite',
    enonce: (p1, _p2, a, b) =>
      `${p1.prenom} observe les bus de la gare routière. Les bus des lignes A et B sont partis en même temps à 7 h. Ensuite, un bus de la ligne A part toutes les ${nb(a)} minutes et un bus de la ligne B toutes les ${nb(b)} minutes.`,
    raisonnement: (_p1, _p2, a, b) =>
      `Les départs de la ligne A ont lieu tous les multiples de ${nb(a)} minutes après 7 h et ceux de la ligne B tous les multiples de ${nb(b)} minutes. ${multiplesCommuns(a, b)}`,
    question: () =>
      'Au bout de combien de minutes les deux lignes auront-elles de nouveau un départ au même moment ?',
    unite: 'minutes',
    fois: (_p1, _p2, _a, b, v) => ({
      question:
        'Combien de bus de la ligne B auront quitté la gare à ce moment-là, en comptant celui-ci ?',
      ligneReponse: '§ bus',
      valeurs: [v / b],
      correction: `$${texNombre(v, 0)} \\div ${texNombre(b, 0)} = ${texNombre(v / b, 0)}$ donc ${fin(v / b)} bus de la ligne B auront quitté la gare.`,
    }),
  },
  {
    taille: 'petite',
    enonce: (p1, _p2, a, b) =>
      `${p1.prenom} observe deux phares depuis la côte. Au début de l’observation, ils émettent un éclat lumineux en même temps. Ensuite, le premier émet un éclat toutes les ${nb(a)} secondes et le second toutes les ${nb(b)} secondes.`,
    raisonnement: (_p1, _p2, a, b) =>
      `Le premier phare émet un éclat à chaque multiple de ${nb(a)} secondes et le second à chaque multiple de ${nb(b)} secondes. ${multiplesCommuns(a, b)}`,
    question: () =>
      'Au bout de combien de secondes émettront-ils de nouveau un éclat en même temps ?',
    unite: 'secondes',
    fois: (_p1, _p2, a, b, v) => ({
      question:
        'Combien d’éclats chaque phare aura-t-il émis à ce moment-là, sans compter celui du début ?',
      ligneReponse: 'Premier phare : § éclats ; second phare : § éclats',
      valeurs: [v / a, v / b],
      correction: `$${texNombre(v, 0)} \\div ${texNombre(a, 0)} = ${texNombre(v / a, 0)}$ et $${texNombre(v, 0)} \\div ${texNombre(b, 0)} = ${texNombre(v / b, 0)}$.<br>Le premier phare aura émis ${fin(v / a)} éclats et le second ${fin(v / b)} éclats.`,
    }),
  },
  {
    taille: 'petite',
    enonce: (p1, p2, a, b) =>
      `${p1.prenom} et ${p2.prenom} se téléphonent. Leurs téléphones émettent un signal sonore dès qu’ils décrochent. Ensuite, le téléphone ${de(p1.prenom)} émet ce signal toutes les ${nb(a)} minutes et celui ${de(p2.prenom)} toutes les ${nb(b)} minutes.`,
    raisonnement: (p1, p2, a, b) =>
      `Le téléphone ${de(p1.prenom)} émet un signal à chaque multiple de ${nb(a)} minutes et celui ${de(p2.prenom)} à chaque multiple de ${nb(b)} minutes. ${multiplesCommuns(a, b)}`,
    question: () =>
      'Au bout de combien de temps de conversation leurs téléphones émettront-ils ensemble un signal sonore ?',
    unite: 'minutes',
  },
  {
    taille: 'moyenne',
    enonce: (p1, p2, a, b) =>
      `${p1.prenom} et ${p2.prenom} s’entraînent sur une piste d’athlétisme. Ils partent en même temps de la ligne de départ. ${p1.prenom} met ${nb(a)} secondes pour faire un tour et ${p2.prenom} met ${nb(b)} secondes, chacun courant à vitesse constante.`,
    raisonnement: (p1, p2, a, b) =>
      `${p1.prenom} passe la ligne de départ à chaque multiple de ${nb(a)} secondes et ${p2.prenom} à chaque multiple de ${nb(b)} secondes. ${multiplesCommuns(a, b)}`,
    question: () =>
      'Au bout de combien de secondes passeront-ils ensemble la ligne de départ pour la première fois ?',
    unite: 'secondes',
    fois: (p1, p2, a, b, v) => ({
      question: 'Combien de tours chacun aura-t-il faits à ce moment-là ?',
      ligneReponse: `${p1.prenom} : § tours ; ${p2.prenom} : § tours`,
      valeurs: [v / a, v / b],
      correction: `$${texNombre(v, 0)} \\div ${texNombre(a, 0)} = ${texNombre(v / a, 0)}$ et $${texNombre(v, 0)} \\div ${texNombre(b, 0)} = ${texNombre(v / b, 0)}$.<br>${p1.prenom} aura fait ${fin(v / a)} tours et ${p2.prenom} ${fin(v / b)} tours.`,
    }),
  },
]

function problemeCycles(scenario: number): Probleme {
  const s = scenariosCycles[scenario]
  const [g, m, n] =
    s.taille === 'petite'
      ? tirerGMN(
          [2, 3, 4, 5, 6],
          [2, 3, 4, 5, 6, 7],
          (g0, m0, n0) => g0 * Math.max(m0, n0) <= 30 && g0 * m0 * n0 <= 180,
        )
      : tirerGMN(
          [5, 6, 8, 10, 12],
          [4, 5, 6, 7, 8, 9],
          (g0, m0, n0) =>
            g0 * Math.min(m0, n0) >= 40 &&
            g0 * Math.max(m0, n0) <= 100 &&
            g0 * m0 * n0 <= 1000,
        )
  const a = g * m
  const b = g * n
  const v = ppcm(a, b)
  const [p1, p2] = tirerPersonnes(2)
  const questionTemps: SousQuestion = {
    question: s.question(p1, p2),
    ligneReponse: `§ ${s.unite}`,
    reponses: [{ value: v }],
    correction: `Ils se retrouveront dans ${fin(v)} ${s.unite}.`,
  }
  const correctionCommune = correctionPpcm(a, b, s.raisonnement(p1, p2, a, b))
  const enonce = s.enonce(p1, p2, a, b)
  if (s.fois == null || randint(1, 3) === 1) {
    return problemeSimple(enonce, correctionCommune, questionTemps)
  }
  const fois = s.fois(p1, p2, a, b, v)
  return {
    enonce,
    correctionCommune,
    sousQuestions: [
      questionTemps,
      {
        question: fois.question,
        ligneReponse: fois.ligneReponse,
        reponses: fois.valeurs.map((value) => ({ value })),
        correction: fois.correction,
      },
    ],
  }
}

type ScenarioAstres = {
  enonce: (p: Personne, a: number, b: number) => string
  question: string
  unite: string
  nomsDesAstres: [string, string]
  nomTour: string
  questionTours: string
}

const scenariosAstres: ScenarioAstres[] = [
  {
    enonce: (p, a, b) =>
      `L’astronome ${p.prenom} étudie deux planètes, Zéphyr et Borée, qui tournent autour d’une même étoile lointaine. Zéphyr fait un tour complet autour de l’étoile en ${nb(a)} jours et Borée en ${nb(b)} jours. Aujourd’hui, les deux planètes et l’étoile sont alignées. On suppose ces durées parfaitement exactes.`,
    question:
      'Dans combien de jours les deux planètes et l’étoile seront-elles de nouveau alignées de la même façon ?',
    unite: 'jours',
    nomsDesAstres: ['Zéphyr', 'Borée'],
    nomTour: 'tours',
    questionTours:
      'Combien de tours chaque planète aura-t-elle faits à ce moment-là ?',
  },
  {
    enonce: (p, a, b) =>
      `${p.prenom} est passionné${p.pronom === 'il' ? '' : 'e'} d’astronomie. ${Il(p)} a lu que la comète Alpha repasse près de la Terre tous les ${nb(a)} ans et la comète Bêta tous les ${nb(b)} ans. Elles sont passées toutes les deux près de la Terre cette année.`,
    question:
      'Dans combien d’années passeront-elles de nouveau près de la Terre la même année ?',
    unite: 'ans',
    nomsDesAstres: ['Alpha', 'Bêta'],
    nomTour: 'passages',
    questionTours:
      'Combien de passages chaque comète aura-t-elle faits à ce moment-là, sans compter celui de cette année ?',
  },
  {
    enonce: (p, a, b) =>
      `${p.prenom} observe deux lunes, Lunor et Mira, qui tournent autour d’une planète géante. Lunor fait le tour de la planète en ${nb(a)} jours et Mira en ${nb(b)} jours. Ce soir, les deux lunes et la planète sont alignées. On suppose ces durées parfaitement exactes.`,
    question:
      'Dans combien de jours les deux lunes et la planète seront-elles de nouveau alignées de la même façon ?',
    unite: 'jours',
    nomsDesAstres: ['Lunor', 'Mira'],
    nomTour: 'tours',
    questionTours:
      'Combien de tours chaque lune aura-t-elle faits à ce moment-là ?',
  },
]

function problemeAstres(scenario: number): Probleme {
  const [g, m, n] = tirerGMN(
    [5, 10, 15, 20, 25],
    [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
    (g0, m0, n0) =>
      g0 * Math.min(m0, n0) >= 100 &&
      g0 * Math.max(m0, n0) <= 400 &&
      g0 * m0 * n0 <= 12000,
  )
  const a = g * m
  const b = g * n
  const v = ppcm(a, b)
  const [p] = tirerPersonnes(1)
  const s = scenariosAstres[scenario]
  const [astre1, astre2] = s.nomsDesAstres
  const raisonnement = `Les deux astres retrouvent leur position de départ à chaque multiple de leur durée de révolution. Ils se retrouvent dans la même configuration pour la première fois au plus petit multiple commun de ${nb(a)} et de ${nb(b)} : le PPCM.`
  return {
    enonce: s.enonce(p, a, b),
    correctionCommune: correctionPpcm(a, b, raisonnement),
    sousQuestions: [
      {
        question: s.question,
        ligneReponse: `§ ${s.unite}`,
        reponses: [{ value: v }],
        correction: `Ce sera dans ${fin(v)} ${s.unite}.`,
      },
      {
        question: s.questionTours,
        ligneReponse: `${astre1} : § ${s.nomTour} ; ${astre2} : § ${s.nomTour}`,
        reponses: [{ value: v / a }, { value: v / b }],
        correction: `$${texNombre(v, 0)} \\div ${texNombre(a, 0)} = ${texNombre(v / a, 0)}$ et $${texNombre(v, 0)} \\div ${texNombre(b, 0)} = ${texNombre(v / b, 0)}$.<br>${astre1} aura fait ${fin(v / a)} ${s.nomTour} et ${astre2} ${fin(v / b)} ${s.nomTour}.`,
      },
    ],
  }
}

type ScenarioPaquets = {
  enonce: (p: Personne, a: number, b: number) => string
  objet1: string
  objet2: string
  paquets1: string
  paquets2: string
}

const scenariosPaquets: ScenarioPaquets[] = [
  {
    enonce: (p, a, b) =>
      `${p.prenom} organise un pique-nique pour sa classe. ${Il(p)} achète des saucisses, vendues par paquets de ${nb(a)}, et des pains à hot-dogs, vendus par paquets de ${nb(b)}. ${Il(p)} veut acheter autant de saucisses que de pains.`,
    objet1: 'saucisses',
    objet2: 'pains',
    paquets1: 'paquets de saucisses',
    paquets2: 'paquets de pains',
  },
  {
    enonce: (p, a, b) =>
      `Pour l’anniversaire de son frère, ${p.prenom} achète des gobelets, vendus par lots de ${nb(a)}, et des assiettes, vendues par lots de ${nb(b)}. ${Il(p)} veut acheter autant de gobelets que d’assiettes.`,
    objet1: 'gobelets',
    objet2: 'assiettes',
    paquets1: 'lots de gobelets',
    paquets2: 'lots d’assiettes',
  },
  {
    enonce: (p, a, b) =>
      `À la rentrée, ${p.prenom} achète des stylos, vendus par boîtes de ${nb(a)}, et des cahiers, vendus par lots de ${nb(b)}. ${Il(p)} veut acheter autant de stylos que de cahiers.`,
    objet1: 'stylos',
    objet2: 'cahiers',
    paquets1: 'boîtes de stylos',
    paquets2: 'lots de cahiers',
  },
  {
    enonce: (p, a, b) =>
      `${p.prenom} prépare un goûter. ${Il(p)} achète des bouteilles de jus, vendues par packs de ${nb(a)}, et des brioches, vendues par sachets de ${nb(b)}. ${Il(p)} veut acheter autant de bouteilles que de brioches.`,
    objet1: 'bouteilles de jus',
    objet2: 'brioches',
    paquets1: 'packs de jus',
    paquets2: 'sachets de brioches',
  },
  {
    enonce: (p, a, b) =>
      `${p.prenom} prépare un mariage. ${Il(p)} achète des cartes d’invitation, vendues par paquets de ${nb(a)}, et des enveloppes, vendues par paquets de ${nb(b)}. ${Il(p)} veut acheter autant de cartes que d’enveloppes.`,
    objet1: 'cartes',
    objet2: 'enveloppes',
    paquets1: 'paquets de cartes',
    paquets2: 'paquets d’enveloppes',
  },
]

function problemePaquets(scenario: number): Probleme {
  const [g, m, n] = tirerGMN(
    [2, 3, 4, 6],
    [2, 3, 4, 5, 6],
    (g0, m0, n0) => g0 * Math.max(m0, n0) <= 24 && g0 * Math.min(m0, n0) >= 4,
  )
  const a = g * m
  const b = g * n
  const v = ppcm(a, b)
  const [p] = tirerPersonnes(1)
  const s = scenariosPaquets[scenario]
  const raisonnement = `Le nombre ${de(s.objet1)} est un multiple de ${nb(a)} et le nombre ${de(s.objet2)} est un multiple de ${nb(b)}. Pour en avoir autant, on cherche un multiple commun de ${nb(a)} et de ${nb(b)}, et comme ${p.prenom} veut en acheter le minimum, on cherche le PPCM.`
  const questionMinimum: SousQuestion = {
    question: `Combien de ${s.objet1} ${p.prenom} doit-${il(p)} acheter au minimum ?`,
    ligneReponse: `§ ${s.objet1}`,
    reponses: [{ value: v }],
    correction: `${Il(p)} doit donc acheter ${fin(v)} ${s.objet1} (et autant ${de(s.objet2)}).`,
  }
  const enonce = s.enonce(p, a, b)
  const correctionCommune = correctionPpcm(a, b, raisonnement)
  if (randint(1, 3) === 1) {
    return problemeSimple(enonce, correctionCommune, questionMinimum)
  }
  return {
    enonce,
    correctionCommune,
    sousQuestions: [
      questionMinimum,
      {
        question: `Combien ${de(s.paquets1)} et ${de(s.paquets2)} ${p.prenom} doit-${il(p)} alors acheter ?`,
        ligneReponse: `§ ${s.paquets1} et § ${s.paquets2}`,
        reponses: [{ value: v / a }, { value: v / b }],
        correction: `$${texNombre(v, 0)} \\div ${texNombre(a, 0)} = ${texNombre(v / a, 0)}$ et $${texNombre(v, 0)} \\div ${texNombre(b, 0)} = ${texNombre(v / b, 0)}$.<br>${Il(p)} doit acheter ${fin(v / a)} ${s.paquets1} et ${fin(v / b)} ${s.paquets2}.`,
      },
    ],
  }
}

type ScenarioGains = {
  enonce: (p1: Personne, p2: Personne, a: number, b: number) => string
  unite: string
  action: string
  questionSimple: (p: Personne) => string
  questionMinimum: string
  questionActions: string
}

const scenariosGains: ScenarioGains[] = [
  {
    enonce: (p1, p2, a, b) =>
      `${p1.prenom} et ${p2.prenom} sont deux adeptes d’un jeu d’arcade. ${p1.prenom} gagne ${nb(a)} tickets à chaque partie et ${p2.prenom} en gagne ${nb(b)} à chaque partie. Un jour, en se retrouvant après leur séance de jeu, ils s’aperçoivent qu’ils ont gagné autant de tickets l’un que l’autre.`,
    unite: 'tickets',
    action: 'parties',
    questionSimple: (p) =>
      `Combien de parties, au minimum, ${p.prenom} a-t-${il(p)} jouées ?`,
    questionMinimum:
      'Combien de tickets, au minimum, chacun a-t-il pu gagner ?',
    questionActions: 'Combien de parties, au minimum, chacun a-t-il jouées ?',
  },
  {
    enonce: (p1, p2, a, b) =>
      `${p1.prenom} et ${p2.prenom} jouent au même jeu vidéo. ${p1.prenom} marque ${nb(a)} points à chaque niveau terminé et ${p2.prenom} en marque ${nb(b)}. Ils comparent leurs scores et constatent qu’ils ont exactement le même nombre de points.`,
    unite: 'points',
    action: 'niveaux',
    questionSimple: (p) =>
      `Combien de niveaux, au minimum, ${p.prenom} a-t-${il(p)} terminés ?`,
    questionMinimum:
      'Combien de points, au minimum, chacun a-t-il pu marquer ?',
    questionActions: 'Combien de niveaux, au minimum, chacun a-t-il terminés ?',
  },
  {
    enonce: (p1, p2, a, b) =>
      `${p1.prenom} et ${p2.prenom} ramassent des champignons en forêt. ${p1.prenom} en ramasse ${nb(a)} à chaque sortie et ${p2.prenom} en ramasse ${nb(b)} à chaque sortie. À la fin de l’automne, ils ont ramassé exactement le même nombre de champignons.`,
    unite: 'champignons',
    action: 'sorties',
    questionSimple: (p) =>
      `Combien de sorties, au minimum, ${p.prenom} a-t-${il(p)} faites ?`,
    questionMinimum:
      'Combien de champignons, au minimum, chacun a-t-il pu ramasser ?',
    questionActions: 'Combien de sorties, au minimum, chacun a-t-il faites ?',
  },
  {
    enonce: (p1, p2, a, b) =>
      `${p1.prenom} et ${p2.prenom} remplissent leur album de collection. ${p1.prenom} colle ${nb(a)} autocollants par page et ${p2.prenom} en colle ${nb(b)} par page. Quand ils comparent leurs albums, ils ont collé autant d’autocollants l’un que l’autre.`,
    unite: 'autocollants',
    action: 'pages',
    questionSimple: (p) =>
      `Combien de pages, au minimum, ${p.prenom} a-t-${il(p)} remplies ?`,
    questionMinimum:
      'Combien d’autocollants, au minimum, chacun a-t-il pu coller ?',
    questionActions: 'Combien de pages, au minimum, chacun a-t-il remplies ?',
  },
]

function problemeGains(scenario: number): Probleme {
  let a = 5
  let b = 11
  for (let essai = 0; essai < 1000; essai++) {
    const x = randint(3, 16)
    const y = randint(3, 16)
    if (x % y !== 0 && y % x !== 0 && ppcm(x, y) <= 150) {
      a = x
      b = y
      break
    }
  }
  const v = ppcm(a, b)
  const [p1, p2] = tirerPersonnes(2)
  const s = scenariosGains[scenario]
  const raisonnement = `Le nombre ${de(s.unite)} ${de(p1.prenom)} est un multiple de ${nb(a)} et celui ${de(p2.prenom)} un multiple de ${nb(b)}. Ils en ont autant : on cherche un multiple commun de ${nb(a)} et de ${nb(b)}, et comme on cherche le minimum ${de(s.action)}, on prend le PPCM.`
  const enonce = s.enonce(p1, p2, a, b)
  const correctionCommune = correctionPpcm(a, b, raisonnement)
  if (randint(1, 3) === 1) {
    return problemeSimple(enonce, correctionCommune, {
      question: s.questionSimple(p1),
      ligneReponse: `§ ${s.action}`,
      reponses: [{ value: v / a }],
      correction: `Ils peuvent avoir tous les deux ${nb(v)} ${s.unite}. Pour cela, ${p1.prenom} a dû faire $${texNombre(v, 0)} \\div ${texNombre(a, 0)} = ${miseEnEvidence(texNombre(v / a, 0))}$ ${s.action}.`,
    })
  }
  return {
    enonce,
    correctionCommune,
    sousQuestions: [
      {
        question: s.questionMinimum,
        ligneReponse: `§ ${s.unite}`,
        reponses: [{ value: v }],
        correction: `Ils peuvent avoir tous les deux au minimum ${fin(v)} ${s.unite}.`,
      },
      {
        question: s.questionActions,
        ligneReponse: `${p1.prenom} : § ${s.action} ; ${p2.prenom} : § ${s.action}`,
        reponses: [{ value: v / a }, { value: v / b }],
        correction: `$${texNombre(v, 0)} \\div ${texNombre(a, 0)} = ${texNombre(v / a, 0)}$ et $${texNombre(v, 0)} \\div ${texNombre(b, 0)} = ${texNombre(v / b, 0)}$.<br>${p1.prenom} a fait ${fin(v / a)} ${s.action} et ${p2.prenom} ${fin(v / b)} ${s.action}.`,
      },
    ],
  }
}

type ScenarioCarrelage = {
  enonce: (p: Personne, a: number, b: number) => string
  question: (p: Personne) => string
  elements: string
}

const scenariosCarrelage: ScenarioCarrelage[] = [
  {
    enonce: (p, a, b) =>
      `${p.prenom} dispose de dalles rectangulaires de longueur ${nb(a)} cm et de largeur ${nb(b)} cm. ${Il(p)} veut carreler une terrasse carrée avec un nombre entier de ces dalles, sans aucune découpe.`,
    question: (p) =>
      `Quelle est la longueur du côté de la plus petite terrasse carrée ${que(p.prenom)} peut carreler ?`,
    elements: 'dalles',
  },
  {
    enonce: (p, a, b) =>
      `${p.prenom} achète des carreaux de faïence rectangulaires de longueur ${nb(a)} cm et de largeur ${nb(b)} cm. ${Il(p)} veut recouvrir un mur carré avec un nombre entier de ces carreaux, sans aucune découpe.`,
    question: (p) =>
      `Quelle est la longueur du côté du plus petit mur carré ${que(p.prenom)} peut recouvrir ?`,
    elements: 'carreaux',
  },
  {
    enonce: (p, a, b) =>
      `${p.prenom} dispose de carreaux de moquette rectangulaires de longueur ${nb(a)} cm et de largeur ${nb(b)} cm. ${Il(p)} veut recouvrir le sol d’une salle carrée avec un nombre entier de ces carreaux, sans aucune découpe.`,
    question: (p) =>
      `Quelle est la longueur du côté de la plus petite salle carrée ${que(p.prenom)} peut recouvrir ?`,
    elements: 'carreaux',
  },
  {
    enonce: (p, a, b) =>
      `${p.prenom} dispose de plaques de liège rectangulaires de longueur ${nb(a)} cm et de largeur ${nb(b)} cm. ${Il(p)} veut recouvrir un panneau d’affichage carré avec un nombre entier de ces plaques, sans aucune découpe.`,
    question: (p) =>
      `Quelle est la longueur du côté du plus petit panneau carré ${que(p.prenom)} peut recouvrir ?`,
    elements: 'plaques',
  },
]

function problemeCarrelage(scenario: number): Probleme {
  const [g, m, n] = tirerGMN(
    [2, 3, 4, 5, 6],
    [3, 4, 5, 6, 7, 8, 9, 10],
    (g0, m0, n0) =>
      g0 * Math.min(m0, n0) >= 12 &&
      g0 * Math.max(m0, n0) <= 60 &&
      g0 * m0 * n0 <= 300,
  )
  const a = g * m
  const b = g * n
  const v = ppcm(a, b)
  const [p] = tirerPersonnes(1)
  const s = scenariosCarrelage[scenario]
  const raisonnement = `Les éléments étant posés tous dans le même sens, le côté du carré est à la fois un multiple de ${nb(a)} cm (dans le sens de la longueur) et un multiple de ${nb(b)} cm (dans le sens de la largeur). Pour que ce soit le plus petit carré possible, on cherche le PPCM de ${nb(a)} et de ${nb(b)}.`
  const questionCote: SousQuestion = {
    question: s.question(p),
    ligneReponse: '§ cm',
    reponses: [{ value: v }],
    correction: `Le côté du plus petit carré mesure ${fin(v)} cm.`,
  }
  const enonce = s.enonce(p, a, b)
  const correctionCommune = correctionPpcm(a, b, raisonnement)
  if (randint(1, 3) === 1) {
    return problemeSimple(enonce, correctionCommune, questionCote)
  }
  return {
    enonce,
    correctionCommune,
    sousQuestions: [
      questionCote,
      {
        question: `Combien de ${s.elements} ${p.prenom} utilisera-t-${il(p)} alors ?`,
        ligneReponse: `§ ${s.elements}`,
        reponses: [{ value: m * n }],
        correction: `$${texNombre(v, 0)} \\div ${texNombre(a, 0)} = ${texNombre(v / a, 0)}$ et $${texNombre(v, 0)} \\div ${texNombre(b, 0)} = ${texNombre(v / b, 0)}$ : on place ${nb(v / a)} ${s.elements} dans un sens et ${nb(v / b)} dans l’autre.<br>$${texNombre(v / a, 0)} \\times ${texNombre(v / b, 0)} = ${texNombre(m * n, 0)}$ donc ${il(p)} utilisera ${fin(m * n)} ${s.elements}.`,
      },
    ],
  }
}

/**
 * D'abord les problèmes qui se résolvent avec un PGCD (ou des diviseurs), puis ceux qui se résolvent avec un PPCM
 */
const typesDeProblemes: TypeDeProbleme[] = [
  {
    titre: 'PGCD : lots identiques',
    nbScenarios: scenariosLots.length,
    construire: problemeLots,
  },
  {
    titre: 'PGCD : carrés les plus grands possibles dans un rectangle',
    nbScenarios: scenariosCarres.length,
    construire: problemeCarres,
  },
  {
    titre: 'PGCD : rangées de même longueur',
    nbScenarios: scenariosRangees.length,
    construire: problemeRangees,
  },
  {
    titre: 'PGCD : fraction à rendre irréductible',
    nbScenarios: 1,
    construire: problemeFraction,
  },
  {
    titre: 'Diviseurs : partage équitable entre amis',
    nbScenarios: scenariosPartage.length,
    construire: problemePartage,
  },
  {
    titre: 'PPCM : événements qui se répètent régulièrement',
    nbScenarios: scenariosCycles.length,
    construire: problemeCycles,
  },
  {
    titre: 'PPCM : alignement d’astres',
    nbScenarios: scenariosAstres.length,
    construire: problemeAstres,
  },
  {
    titre: 'PPCM : achats par paquets',
    nbScenarios: scenariosPaquets.length,
    construire: problemePaquets,
  },
  {
    titre: 'PPCM : gains identiques à chaque partie',
    nbScenarios: scenariosGains.length,
    construire: problemeGains,
  },
  {
    titre: 'PPCM : surface carrée à recouvrir',
    nbScenarios: scenariosCarrelage.length,
    construire: problemeCarrelage,
  },
]
