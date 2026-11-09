import { orangeMathalea } from '../../lib/colors'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import operation from '../../modules/operations'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '06/05/2025'
export const dateDeModifImportante = '25/05/2025'
export const interactifReady = true

export const titre =
  'Calculer le produit (en ligne) de deux décimaux connaissant le produit de deux entiers'

/**
 * * Calculer le produit (en ligne) de deux décimaux à partir d'un produit de deux entiers
 * @author Éric Elter
 */

export const uuid = '56773'

export const refs = {
  'fr-fr': ['6N2D'],
  'fr-2016': ['6C30-2b'],
  'fr-ch': ['PR-25', '9R1NO6C-11', '9R2NO6C-11', '9R3NO6C-11'],
}

function nomUnitePourPuissance(p1: number): string {
  const mapPuissance: Record<number, string> = {
    [-3]: 'millièmes',
    [-2]: 'centièmes',
    [-1]: 'dixièmes',
    1: 'dizaines',
    2: 'centaines',
    3: 'milliers',
  }

  if (p1 in mapPuissance) {
    return mapPuissance[p1]
  }
  return ''
}

export default class ProduitDeDecimauxAPartirProduitConnu extends Exercice {
  constructor() {
    super()
    this.sup = 4
    this.sup2 = 1
    this.sup4 = false
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      'Types du calcul final',
      [
        'Nombres séparés par des tirets  :',
        '1 : Premier facteur multiplié par une puissance de 10',
        '2 : Second facteur multiplié par une puissance de 10',
        '3 : Deux facteurs multipliés par des puissances de 10',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.comment =
      'Le premier calcul est nb1 $\\times$ nb2 où nb1 et nb2 représentent des entiers entre 2 et 99. <br> Le premier paramètre permet de paramétrer le calcul final ' +
      'dans lequel p1 et p2 représentent des exposants entiers non nuls entre -3 et 3.'
    this.besoinFormulaire2Numerique = [
      'Nombre de chiffres non nuls dans le plus petit facteur',
      4,
      '1 : Un seul chiffre\n2 : Deux chiffres\n3 : Mélange',
    ]
    this.besoinFormulaire3CaseACocher = ['Produit initial donné', false]
    this.besoinFormulaire4CaseACocher = ['Correction avec des mots', true]
    this.spacing = context.isHtml ? 3 : 2
    this.spacingCorr = context.isHtml ? 2.5 : 1.5
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
      max: 3,
      melange: 4,
      defaut: 4,
    })

    const reponse = []
    let nb1 = 0
    let nb2 = 0
    let multipleNb1 = 0
    let multipleNb2 = 0
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let d1 = randint(1, 9)
      const u1 = randint(2, 9)
      let d2 = randint(1, 9)
      const u2 = randint(2, 9)
      let p1 = 0
      let p2 = 0
      texteCorr = ''

      let choix = true
      switch (listeTypeDeQuestions[i]) {
        case 1: // nb1*10^p1 x nb2
          if (this.sup2 === 1) d1 = 0
          p1 = randint(-3, 3, [0])
          break

        case 2: // nb1 x nb2*10^p2
          if (this.sup2 === 1) d2 = 0
          p2 = randint(-3, 3, [0])
          break

        case 3: // nb1*10^p1 x nb2*10^p2
          do {
            p1 = randint(-3, 3, [0])
            p2 = randint(-3, 3, [0])
          } while (Math.abs(p1 + p2) > 3 || p1 + p2 === 0)
          choix = choice([true, false])
          if (choix) {
            if (this.sup2 === 1) d2 = 0
          } else {
            if (this.sup2 === 1) d1 = 0
          }
          break
      }

      nb1 = d1 * 10 + u1
      nb2 = d2 * 10 + u2
      multipleNb1 = arrondi(nb1 * 10 ** p1)
      multipleNb2 = arrondi(nb2 * 10 ** p2)
      reponse[0] = nb1 * nb2

      const useNb1Decomposed =
        listeTypeDeQuestions[i] === 1 ||
        (listeTypeDeQuestions[i] === 3 && choix === false)

      if (this.sup2 === 1) {
        if (useNb1Decomposed) {
          texteCorr += `a) $${nb1}\\times ${nb2} =
      (${nb1} \\times ${d2 * 10}) + (${nb1} \\times ${u2}) =
      ${nb1 * d2 * 10} + ${nb1 * u2} =
      ${miseEnEvidence(texNombre(reponse[0]))}$<br>`
        } else {
          texteCorr += `a) $${nb1}\\times ${nb2} =
      (${d1 * 10} \\times ${nb2}) + (${u1} \\times ${nb2}) =
      ${nb2 * d1 * 10} + ${nb2 * u1} =
      ${miseEnEvidence(texNombre(reponse[0]))}$<br>`
        }
      } else {
        if (!this.sup3) {
          const [op1, op2] = useNb1Decomposed ? [nb1, nb2] : [nb2, nb1]
          texteCorr += `Posons $${op1}\\times ${op2}$.<br>`
          texteCorr += String(
            operation({
              operande1: op1,
              operande2: op2,
              type: 'multiplication',
              options: { solution: true, colore: orangeMathalea },
            }),
          )
          texteCorr += `$${nb1}\\times ${nb2} = ${miseEnEvidence(texNombre(reponse[0]))}$.<br>`
        }
      }

      reponse[1] = arrondi(multipleNb1 * multipleNb2)

      if (this.sup3) {
        texte = addMultiMathfield(this, i, {
          dataTemplate: `Sachant que $${nb1}\\times ${nb2} = ${texNombre(nb1 * nb2)}$, calculer : $${texNombre(multipleNb1)}$ $\\times$ $${texNombre(multipleNb2)}${this.interactif ? '=' : ''}$%{champ1}`,
          dataOptions: {
            champ1: {
              keyboard: KeyboardType.clavierNumbers,
              minWidth: 50,
            },
          },
        })

        texte += '.'
        handleAnswers(
          this,
          i,
          {
            champ1: {
              value: reponse[1],
              options: { nombreDecimalSeulement: true },
            },
          },
          { formatInteractif: 'multi-mathfield' },
        )
        reponse[0] = 0
      } else {
        texte = addMultiMathfield(this, i, {
          dataTemplate: `Calculer ${this.sup2 === 1 ? 'en ligne' : "en posant l'opération"} $${nb1}\\times ${nb2}${this.interactif ? '=' : ''}$%{champ1} puis en déduire le résultat de $${texNombre(multipleNb1)}\\times ${texNombre(multipleNb2)}$ : %{champ2}`,
          dataOptions: {
            champ1: {
              keyboard: KeyboardType.clavierNumbers,
              minWidth: 50,
            },
            champ2: {
              keyboard: KeyboardType.clavierNumbers,
              minWidth: 50,
            },
          },
        })
        handleAnswers(
          this,
          i,
          {
            bareme: toutAUnPoint,
            champ1: {
              value: reponse[0],
              options: { nombreDecimalSeulement: true },
            },
            champ2: {
              value: reponse[1],
              options: { nombreDecimalSeulement: true },
            },
          },
          { formatInteractif: 'multi-mathfield' },
        )
      }

      texteCorr += !this.sup4
        ? `$${texNombre(multipleNb1)}\\times ${texNombre(multipleNb2)} =
                   ${nb1} ${p1 === 0 ? '' : `\\times ${texNombre(10 ** p1)}`} \\times ${nb2}${p2 === 0 ? '' : `\\times ${texNombre(10 ** p2)}`} =
                   ${nb1}\\times ${nb2}${p1 === 0 ? '' : `\\times ${texNombre(10 ** p1)}`}${p2 === 0 ? '' : `\\times ${texNombre(10 ** p2)}`} = 
                   ${texNombre(nb1 * nb2)}\\times ${texNombre(10 ** (p1 + p2))} =
                   ${miseEnEvidence(texNombre(reponse[1]))}$`
        : `$${texNombre(multipleNb1)}\\times ${texNombre(multipleNb2)} =
      ${nb1}$  ${nomUnitePourPuissance(p1)} $\\times ${nb2} $ ${nomUnitePourPuissance(p2)} $=` +
          (p1 === 0
            ? ''
            : `${nb1}\\times ${nb2}$ ${nomUnitePourPuissance(p1 + p2)} $ = `) + // si p1=0, alors cette ligne est équivalente à la précédente
          `${texNombre(nb1 * nb2)}$ ${nomUnitePourPuissance(p1 + p2)} $ =
      ${miseEnEvidence(texNombre(reponse[1]))}$`

      if (this.questionJamaisPosee(i, reponse[1])) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
