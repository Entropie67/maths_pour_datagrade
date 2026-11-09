import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import {
  evalueFormule,
  expressionNumerique,
  formuleEnTex,
  valeurAffichee,
  type Cellules,
} from '../../lib/outils/tableurFormules'
import { rendTableur } from '../../lib/outils/tableurRendu'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Déterminer le résultat affiché par une formule de tableur'
export const dateDePublication = '14/10/2026'
export const interactifReady = true
export const uuid = 'cda0a'

export const refs = {
  'fr-fr': ['PET11'],
  'fr-ch': [],
}

/**
 * Trouver le résultat affiché dans une cellule où l'on a saisi une formule de calcul (CRPE).
 * @author Rémi Angot
 */

type QuestionResultat = {
  /** Formule saisie dans la cellule cible. */
  formule: string
  cible: string
  /** Formule d'une cellule intermédiaire (type 5), saisie avant la cible. */
  formuleIntermediaire?: { cellule: string; formule: string }
  cellules: Cellules
  resultat: number
  explication: string
}

const COLONNES = ['A', 'B', 'C']
const TOUTES_LES_CELLULES = COLONNES.flatMap((c) =>
  [1, 2, 3].map((l) => `${c}${l}`),
)

function bloc(): Cellules {
  const cellules: Cellules = {}
  TOUTES_LES_CELLULES.forEach((ref) => {
    cellules[ref] = randint(1, 9)
  })
  return cellules
}

function valeur(cellules: Cellules, ref: string): number {
  return Number(cellules[ref])
}

function questionAvecOperateurs(type: number): QuestionResultat {
  for (;;) {
    const cellules = bloc()
    const [x, y, z] = shuffle([...TOUTES_LES_CELLULES]).slice(0, 3)
    const [vx, vy, vz] = [x, y, z].map((r) => valeur(cellules, r))
    let formule = ''
    let explication = ''
    switch (type) {
      case 1: {
        const modele = randint(1, 3)
        if (modele === 1) {
          formule = `=${x}+${y}*${z}`
          explication = 'La multiplication est prioritaire sur l’addition.'
        } else if (modele === 2) {
          if (vx * vy <= vz) continue
          formule = `=${x}*${y}-${z}`
          explication = 'La multiplication est prioritaire sur la soustraction.'
        } else {
          if (vx <= vy) continue
          formule = `=${x}-${y}+${z}`
          explication = 'Les opérations sont effectuées de gauche à droite.'
        }
        break
      }
      case 2: {
        const modele = randint(1, 3)
        if (modele === 1) {
          formule = `=(${x}+${y})*${z}`
          explication = 'Les parenthèses sont prioritaires.'
        } else if (modele === 2) {
          if (vy <= vz) continue
          formule = `=${x}*(${y}-${z})`
          explication = 'Les parenthèses sont prioritaires.'
        } else {
          if ((vx + vy) % 2 !== 0) continue
          formule = `=(${x}+${y})/2`
          explication =
            'Les parenthèses sont prioritaires : on calcule d’abord la somme.'
        }
        break
      }
      default: {
        const modele = randint(1, 4)
        if (modele === 4) {
          if (![4, 9, 16].includes(vx + vy)) continue
          formule = `=RACINE(${x}+${y})`
          explication =
            'La fonction RACINE calcule la racine carrée du nombre obtenu entre parenthèses.'
        } else if (modele === 1) {
          formule = `=${x}^2+${y}`
          explication = 'L’exposant est prioritaire sur l’addition.'
        } else if (modele === 2) {
          if ((vx * vy) % vz !== 0) continue
          formule = `=${x}*${y}/${z}`
          explication = 'Les opérations sont effectuées de gauche à droite.'
        } else {
          formule = `=${x}^2+${y}*${z}`
          explication =
            'L’exposant et la multiplication sont prioritaires sur l’addition.'
        }
      }
    }
    const resultat = evalueFormule(formule, (r) => valeurAffichee(cellules, r))
    if (!Number.isInteger(resultat) || resultat < 0) continue
    const cible = `D${randint(1, 3)}`
    const valeursUtilisees = [...new Set(formule.match(/[A-C]\d/g))]
      .map((r) => `${r} contient $${cellules[r]}$`)
      .join(', ')
    return {
      formule,
      cible,
      cellules,
      resultat,
      explication: `On remplace chaque référence par la valeur de la cellule (${valeursUtilisees}). ${explication}<br>$${expressionNumerique(formule, cellules)}=${resultat}$.`,
    }
  }
}

function questionAvecFonction(): QuestionResultat {
  for (;;) {
    const cellules = bloc()
    const enLigne = choice([true, false])
    const indice = randint(1, 3)
    const debut = enLigne ? `A${indice}` : `${COLONNES[indice - 1]}1`
    const fin = enLigne ? `C${indice}` : `${COLONNES[indice - 1]}3`
    const plage = [...TOUTES_LES_CELLULES].filter((r) =>
      enLigne ? r.endsWith(String(indice)) : r.startsWith(COLONNES[indice - 1]),
    )
    const valeurs = plage.map((r) => valeur(cellules, r))
    const modele = choice(['SOMME', 'MOYENNE', 'MAX-MIN'])
    const somme = valeurs.reduce((a, b) => a + b, 0)
    let formule: string
    let explication: string
    if (modele === 'SOMME') {
      formule = `=SOMME(${debut}:${fin})`
      explication = `La fonction SOMME additionne les valeurs des cellules de ${debut} à ${fin} : $${valeurs.join('+')}=${somme}$.`
    } else if (modele === 'MOYENNE') {
      if (somme % 3 !== 0) continue
      formule = `=MOYENNE(${debut}:${fin})`
      explication = `La fonction MOYENNE calcule la moyenne des valeurs des cellules de ${debut} à ${fin} : $(${valeurs.join('+')})\\div 3=${somme / 3}$.`
    } else {
      if (Math.max(...valeurs) === Math.min(...valeurs)) continue
      formule = `=MAX(${debut}:${fin})-MIN(${debut}:${fin})`
      explication = `Dans les cellules de ${debut} à ${fin}, la plus grande valeur est $${Math.max(...valeurs)}$ et la plus petite est $${Math.min(...valeurs)}$ : $${Math.max(...valeurs)}-${Math.min(...valeurs)}=${Math.max(...valeurs) - Math.min(...valeurs)}$.`
    }
    const resultat = evalueFormule(formule, (r) => valeurAffichee(cellules, r))
    return {
      formule,
      cible: `D${randint(1, 3)}`,
      cellules,
      resultat,
      explication,
    }
  }
}

function questionEnDeuxEtapes(): QuestionResultat {
  for (;;) {
    const cellules = bloc()
    const ligne = randint(1, 3)
    const [a, b, c] = [`A${ligne}`, `B${ligne}`, `C${ligne}`]
    const operation = choice(['*', '+'])
    const formuleC = `=${a}${operation}${b}`
    const formuleD = choice([`=${c}+${a}`, `=${c}-${b}`, `=2*${c}`])
    cellules[c] = formuleC
    const resultatC = evalueFormule(formuleC, (r) =>
      valeurAffichee(cellules, r),
    )
    const resultat = evalueFormule(formuleD, (r) => valeurAffichee(cellules, r))
    if (resultat < 0) continue
    return {
      formule: formuleD,
      cible: `D${ligne}`,
      formuleIntermediaire: { cellule: c, formule: formuleC },
      cellules,
      resultat,
      explication: `La cellule ${c} affiche d’abord $${expressionNumerique(formuleC, cellules)}=${resultatC}$.<br>Puis la cellule D${ligne} calcule $${expressionNumerique(formuleD, cellules)}=${resultat}$.`,
    }
  }
}

export default class ResultatFormuleTableur extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.consigne = ''
    this.besoinFormulaireTexte = [
      'Types de formules',
      [
        'Nombres séparés par des tirets :',
        '1 : Opérations avec priorités opératoires',
        '2 : Opérations avec parenthèses',
        '3 : Opérations avec exposant ou quotient',
        '4 : Fonctions SOMME, MOYENNE, MAX et MIN',
        '5 : Formule utilisant une cellule qui contient elle-même une formule',
        '6 : Mélange',
      ].join('\n'),
    ]
    this.sup = '6'
  }

  nouvelleVersion() {
    const types = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 5,
      melange: 6,
      defaut: 6,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = types[i]
      const q =
        type <= 3
          ? questionAvecOperateurs(type)
          : type === 4
            ? questionAvecFonction()
            : questionEnDeuxEtapes()
      const couleurs = { [q.cible]: '#fde68a' }
      const parametresTableur = {
        cellules: q.cellules,
        nbColonnes: 4,
        nbLignes: 3,
        largeurs: [60, 60, 60, 60],
        lignesEntete: [],
        barreFormule: false,
        couleurs,
      }

      let texte = 'On considère le tableur ci-dessous. '
      if (q.formuleIntermediaire != null) {
        texte += `Dans la cellule ${q.formuleIntermediaire.cellule}, on a saisi la formule $${formuleEnTex(q.formuleIntermediaire.formule)}$, puis, `
        texte += `dans la cellule ${q.cible}, la formule $${formuleEnTex(q.formule)}$.`
      } else {
        texte += `Dans la cellule ${q.cible}, on a saisi la formule $${formuleEnTex(q.formule)}$.`
      }
      texte += `<br>${rendTableur({
        ...parametresTableur,
        formuleImprimee: q.formuleIntermediaire,
      })}<br>`
      texte += `Quel nombre s’affiche dans la cellule ${q.cible} ?`
      texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
        texteAvant: ' ',
      })
      handleAnswers(
        this,
        i,
        { reponse: { value: q.resultat } },
        { formatInteractif: 'mathlive' },
      )

      const texteCorr = `${q.explication}<br>La cellule ${q.cible} affiche ${texteEnCouleurEtGras(q.resultat)}.`

      if (this.questionJamaisPosee(i, q.formule, JSON.stringify(q.cellules))) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
