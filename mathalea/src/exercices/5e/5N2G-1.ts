import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiMoins,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const dateDeModifImportante = '16/05/2025'
export const amcReady = true
export const amcType = 'AMCNum'

export const titre = "Trouver le terme manquant d'une somme de nombres relatifs"

/**
 * Additions à trou dans les relatifs
 *
 *  @author Jean-claude Lhote à partir de CM000 de Rémi Angot
 */
export const uuid = '61b4a'

export const refs = {
  'fr-fr': ['5N2G-1'],
  'fr-2016': ['5R20-1'],
  'fr-ch': ['9R2NO3C-4', '9R3NO3C-4', '10CTNO2A-4'],
}
export default class TermeInconnuDeSomme extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      2,
      '1 : Nombres entiers\n2 : Nombres décimaux',
    ]
    this.besoinFormulaire2Numerique = ['Valeur maximale', 9999]
    this.nbQuestions = 5
    this.sup = 1
    this.sup2 = 20
    this.consigne = 'Calculer le terme manquant.'
    this.spacing = 2
    this.interactif = false

    this.amcType = amcType
    this.amcReady = amcReady
  }

  nouvelleVersion() {
    this.besoinFormulaire3CaseACocher = this.interactif
      ? ['Parenthèses inutiles dans la réponse', false]
      : false
    const typesDeQuestionsDisponibles = [1, 2, 3, 4]
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    let decimal
    if (this.sup === 1) {
      decimal = 1
    } else {
      decimal = 10
    }
    for (
      let i = 0, a, b, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      do {
        if (!context.isAmc) {
          a = arrondi(randint(4 * decimal, this.sup2 * decimal) / decimal, 1)
          b = arrondi(randint(2 * decimal, this.sup2 * decimal) / decimal, 1)
        } else {
          a = arrondi(randint(4 * decimal, 20 * decimal) / decimal, 1)
          b = arrondi(randint(2 * decimal, 20 * decimal) / decimal, 1)
        }
      } while (a === b)

      let feedback
      switch (listeTypeDeQuestions[i]) {
        case 1: // a + .... = b
          if (a > b) feedback = feedbackNeedParentheses
          texte = remplisLesBlancs(
            this,
            i,
            `${texNombre(a)}~+~%{champ1}~=~${texNombre(b)}`,
            KeyboardType.clavierDeBaseAvecFraction,
            '\\ldots',
          )
          texteCorr = `$${texNombre(a)} + ${ecritureParentheseSiMoins(texNombre(b - a))} = ${texNombre(b)}$`
          break

        case 2: // .... + a = b
          texte = remplisLesBlancs(
            this,
            i,
            `%{champ1}~+~${texNombre(a)}~=~${texNombre(b)}`,
            KeyboardType.clavierDeBaseAvecFraction,
            '\\ldots',
          )
          texteCorr = `$${ecritureParentheseSiMoins(texNombre(b - a))} + ${texNombre(a)} = ${texNombre(b)}$`
          break

        case 3: // b = .... + a
          texte = remplisLesBlancs(
            this,
            i,
            `${texNombre(b)}~=~%{champ1}~+~${texNombre(a)}`,
            KeyboardType.clavierDeBaseAvecFraction,
            '\\ldots',
          )
          texteCorr = `$${texNombre(b)}=${ecritureParentheseSiMoins(texNombre(b - a))} + ${texNombre(a)}$`
          break

        default: // b = a + ....
          if (a > b) feedback = feedbackNeedParentheses
          texte = remplisLesBlancs(
            this,
            i,
            `${texNombre(b)}~=~${texNombre(a)}~+~%{champ1}`,
            KeyboardType.clavierDeBaseAvecFraction,
            '\\ldots',
          )
          texteCorr = `$${texNombre(b)}=${texNombre(a)} + ${ecritureParentheseSiMoins(texNombre(b - a))}$`
          break
      }
      texteCorr += `. En effet : $${texNombre(b)}-${texNombre(a)}=${texNombre(b - a)}$`

      // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
      const textCorrSplit = texteCorr.split('=')
      let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
      aRemplacer = aRemplacer.replaceAll('$', '')

      texteCorr = ''
      for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
        texteCorr += textCorrSplit[ee] + '='
      }
      // Si la saisie sans parenthèses est refusée, la valeur mise en évidence les contient
      const parenthesesObligatoires = !(
        this.sup3 ||
        listeTypeDeQuestions[i] === 2 ||
        listeTypeDeQuestions[i] === 3 ||
        arrondi(b - a, 2) > 0
      )
      if (parenthesesObligatoires) aRemplacer = `(${aRemplacer})`
      texteCorr += `$ $${miseEnEvidence(aRemplacer)}$` + '.' // Gestion du point final
      // Fin de cette uniformisation

      if (this.questionJamaisPosee(i, a, b)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        const tableauReponse = [
          '(' + arrondi(b - a, 2) + ')',
          '(' + ecritureAlgebrique(arrondi(b - a, 2)) + ')',
        ]
        if (
          this.sup3 ||
          listeTypeDeQuestions[i] === 2 ||
          listeTypeDeQuestions[i] === 3 ||
          arrondi(b - a, 2) > 0
        )
          tableauReponse.push(String(arrondi(b - a, 2)))
        handleAnswers(this, i, {
          champ1: {
            value: tableauReponse,
            options: { texteSansCasse: true },
          },
          feedback,
        })
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

function feedbackNeedParentheses(input: Record<string, string>) {
  const champ1 = input.champ1
  if (champ1.length > 0 && !champ1.startsWith('\\lparen')) {
    return 'On ne peut pas écrire les signes + et - côte à côte. Il faudrait mettre la réponse entre parenthèses.'
  }
  return ''
}
