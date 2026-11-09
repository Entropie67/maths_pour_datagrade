import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexte } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  analyseReference,
  formuleEnTex,
  normaliseFormule,
  type Cellules,
} from '../../lib/outils/tableurFormules'
import { rendTableur } from '../../lib/outils/tableurRendu'
import {
  creeRecopie,
  decritDecalage,
  type ModeDollar,
  type ModeRecopie,
} from '../../lib/outils/tableurRecopie'
import type { CompareFunction } from '../../lib/types'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer la formule obtenue après la copie d’une cellule sur tableur'
export const dateDePublication = '14/10/2026'
export const interactifReady = true
export const uuid = '46e40'

export const refs = {
  'fr-fr': ['PET15'],
  'fr-ch': [],
}

/**
 * Trouver la formule de calcul obtenue dans une cellule après y avoir copié une formule saisie dans une autre cellule (CRPE).
 * @author Rémi Angot
 */

/** Explique comment une référence de la formule initiale est modifiée par la copie. */
function expliqueReference(
  avant: string,
  apres: string,
  dColonnes: number,
  dLignes: number,
): string {
  const r = analyseReference(avant)!
  const texteAvant = `$${formuleEnTex(avant)}$`
  const texteApres = `$${formuleEnTex(apres)}$`
  if (r.colonneAbsolue && r.ligneAbsolue) {
    return `${texteAvant} est bloquée en colonne et en ligne : elle reste ${texteApres}.`
  }
  if (r.colonneAbsolue) {
    return `${texteAvant} : la colonne est bloquée, la ligne est décalée de $${Math.abs(dLignes)}$ : on obtient ${texteApres}.`
  }
  if (r.ligneAbsolue) {
    return `${texteAvant} : la ligne est bloquée, la colonne est décalée de $${Math.abs(dColonnes)}$ : on obtient ${texteApres}.`
  }
  return `${texteAvant} n’est pas bloquée : elle est décalée de ${decritDecalage(dColonnes, dLignes)} et devient ${texteApres}.`
}

function compareFormule(formuleInitiale: string): CompareFunction {
  return (saisie, reponse) => {
    const saisieNormalisee = normaliseFormule(saisie)
    if (saisieNormalisee === normaliseFormule(reponse)) return { isOk: true }
    if (saisieNormalisee === normaliseFormule(formuleInitiale)) {
      return {
        isOk: false,
        feedback:
          'La formule n’est pas modifiée par la copie : les références qui ne sont pas bloquées par le signe dollar sont décalées.',
      }
    }
    if (!saisieNormalisee.startsWith('=')) {
      return { isOk: false, feedback: 'Une formule commence par le signe =.' }
    }
    return { isOk: false }
  }
}

export default class FormuleApresRecopie extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.besoinFormulaireTexte = [
      'Sens de la copie',
      [
        'Nombres séparés par des tirets :',
        '1 : Vers la droite',
        '2 : Vers le bas',
        '3 : Vers la droite et vers le bas',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2Texte = [
      'Utilisation du signe dollar',
      [
        'Nombres séparés par des tirets :',
        '1 : Aucune référence bloquée',
        '2 : Références mixtes (colonne ou ligne bloquée)',
        `3 : Une référence entièrement bloquée ($${formuleEnTex('$A$1')}$) et une référence libre (B2)`,
        '4 : Mélange',
      ].join('\n'),
    ]
    this.sup = '4'
    this.sup2 = '4'
  }

  nouvelleVersion() {
    const sens = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    }).map(Number) as ModeRecopie[]
    const dollars = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    }).map(Number) as ModeDollar[]

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const nbColonnes = 6
      const nbLignes = 8
      const r = creeRecopie({
        mode: sens[i],
        dollar: dollars[i],
        nbColonnes,
        nbLignes,
      })
      const cellules: Cellules = { [r.origine]: r.formule }

      let texte = `Dans la cellule ${r.origine} d’un tableur, on a saisi la formule $${formuleEnTex(r.formule)}$. Cette cellule est ensuite copiée dans la cellule ${r.destination}.<br>`
      texte += rendTableur({
        cellules,
        nbColonnes,
        nbLignes,
        largeurs: Array(nbColonnes).fill(60),
        lignesEntete: [],
        couleurs: { [r.origine]: '#fde68a', [r.destination]: '#bfdbfe' },
      })
      texte += `<br>Quelle formule contient alors la cellule ${r.destination} ?`
      texte += ajouteChampTexte(this, i, KeyboardType.alphanumeric, {
        texteAvant: ` ${r.destination} :`,
      })
      handleAnswers(
        this,
        i,
        {
          reponse: {
            value: r.formuleRecopiee,
            compare: compareFormule(r.formule),
          },
        },
        { formatInteractif: 'mathalea-textfield' },
      )

      const references = (formule: string) =>
        formule.match(/\$?[A-Z]+\$?\d+/g) ?? []
      const apres = references(r.formuleRecopiee)
      let texteCorr = `La copie de ${r.origine} vers ${r.destination} décale la formule de ${decritDecalage(r.dColonnes, r.dLignes)}.<br>`
      texteCorr +=
        'Dans la formule, les références sont modifiées de la façon suivante :'
      texteCorr +=
        '<br>' +
        references(r.formule)
          .map((avant, k) =>
            expliqueReference(avant, apres[k], r.dColonnes, r.dLignes),
          )
          .join('<br>')
      texteCorr += `<br>La cellule ${r.destination} contient donc la formule $${miseEnEvidence(formuleEnTex(r.formuleRecopiee))}$.`

      if (this.questionJamaisPosee(i, r.formule, r.destination)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
