import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListesSansChangerOrdre } from '../../lib/outils/arrayOutils'
import {
  texFractionReduite,
  texFractionSigne,
} from '../../lib/outils/deprecatedFractions'
import { reduireAxPlusB } from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { fraction } from '../../modules/fractions'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDeModifImportante = '13/11/2025'
export const interactifReady = true

export const titre = 'Résoudre des équations se ramenant au produit-nul'

/**
 * Résoudre des équations se ramenant au produit-nul
 * @author Stéphane Guyon
 */
export const uuid = '93432'

export const refs = {
  'fr-fr': ['2L22-3'],
  'fr-ch': ['11LSFA4E-9'],
}
export default class Equationspresqueproduitnulle extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 3
    this.spacingCorr = 3
    this.nbQuestions = 5
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
  }

  nouvelleVersion() {
    this.consigne = `Résoudre dans $\\mathbb R$ ${this.nbQuestions > 1 ? 'les équations suivantes' : "l'équation suivante"}.`
    if (this.interactif) {
      this.consigne +=
        "<br>On donnera la réponse sous forme d'un ensemble de solutions."
    }
    const typesDeQuestionsDisponibles = [1, 2, 3, 4, 5]
    let valeursSolution

    const listeTypeDeQuestions = combinaisonListesSansChangerOrdre(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const typesDeQuestions = listeTypeDeQuestions[i]
      const a = randint(-9, 9, [-1, 0, 1]) // on évite a=1, -1 ou 0
      const b = randint(-9, 9, 0)
      const c = randint(-9, 9, 0)
      const d = randint(-9, 9, 0)
      const e = randint(-9, 9, [0, c, -c]) // on évite que c+e et c-e soit égal à 0 et on évite e=0
      const f = randint(-9, 9, [0, d, -d]) // on évite que d+f et d-f soit égal à 0 et on évite f=0

      switch (typesDeQuestions) {
        case 1: // (ax+b)(cx+d)+(ax+b)(ex+f)=0
          texte = `$(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})+(${reduireAxPlusB(a, b)})(${reduireAxPlusB(e, f)})=0$`
          texteCorr = ` $(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})+(${reduireAxPlusB(a, b)})(${reduireAxPlusB(e, f)})=0$<br>`
          if (this.correctionDetaillee) {
            texteCorr += ` On observe que $(${reduireAxPlusB(a, b)})$ est un facteur commun dans les deux termes :<br>`
            texteCorr += ` $\\phantom{\\iff} (\\underline{${reduireAxPlusB(a, b)}})(${reduireAxPlusB(c, d)})+(\\underline{${reduireAxPlusB(a, b)}})(${reduireAxPlusB(e, f)})=0$<br>`
            texteCorr += ` $\\iff (\\underline{${reduireAxPlusB(a, b)}})\\Big((${reduireAxPlusB(c, d)})+(${reduireAxPlusB(e, f)})\\Big)=0$<br>`
          }
          texteCorr += ` $\\iff (${reduireAxPlusB(a, b)})(${reduireAxPlusB(c + e, d + f)})=0$<br>`
          if (c + e === 0) {
            texteCorr += `$\\iff ${reduireAxPlusB(a, b)}=0$<br>`
            texteCorr += `$x=${texFractionSigne(-b, a)}$<br>`
            texteCorr += `L'équation admet une unique solution : $S=\\left\\{${texFractionReduite(-b, a)}\\right\\}$.`
          } else {
            texteCorr +=
              'On reconnaît une équation produit-nul, donc on applique la propriété :<br>'
            texteCorr += `${texteEnCouleur('Un produit est nul si et seulement si au moins un de ses facteurs est nul.', bleuMathalea)}<br>`
            texteCorr += ` $\\iff ${reduireAxPlusB(a, b)}=0\\quad$ ou bien $\\quad ${reduireAxPlusB(c + e, d + f)}=0$<br>`
            texteCorr += `$\\iff x=${texFractionSigne(-b, a)}\\quad$ ou $\\quad x=${texFractionSigne(-d - f, c + e)}$<br>
                       On en déduit :  `
            if ((-d - f) / (c + e) < -b / a) {
              valeursSolution = `${fraction(-d - f, c + e).texFractionSimplifiee};${fraction(-b, a).texFractionSimplifiee}`
            } else {
              valeursSolution = `${fraction(-b, a).texFractionSimplifiee};${fraction(-d - f, c + e).texFractionSimplifiee}`
            }
          }

          break
        case 2: // (ax+b)(cx+d)+(ax+b)(ex+f)=0
          texte = `$(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})-
                    (${reduireAxPlusB(a, b)})(${reduireAxPlusB(e, f)})=0$`
          texteCorr = ` $(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})-
                    (${reduireAxPlusB(a, b)})(${reduireAxPlusB(e, f)})=0$<br>`
          if (this.correctionDetaillee) {
            texteCorr += ` On observe que $(${reduireAxPlusB(a, b)})$ est un facteur commun dans les deux termes :<br>`
            texteCorr += ` $\\phantom{\\iff} (\\underline{${reduireAxPlusB(a, b)}})(${reduireAxPlusB(c, d)})- (\\underline{${reduireAxPlusB(a, b)}})(${reduireAxPlusB(e, f)})=0$<br>`
            texteCorr += ` $\\iff (\\underline{${reduireAxPlusB(a, b)}})\\Big((${reduireAxPlusB(c, d)})-(${reduireAxPlusB(e, f)})\\Big)=0$<br>`
          }
          if (e > 0)
            texteCorr += ` $\\iff (${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)}${reduireAxPlusB(-e, -f)})=0$<br>`
          else
            texteCorr += ` $\\iff (${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)}+${reduireAxPlusB(-e, -f)})=0$<br>`
          texteCorr += ` $\\iff (${reduireAxPlusB(a, b)})(${reduireAxPlusB(c - e, d - f)})=0$<br>`
          if (c - e === 0) {
            texteCorr += `$\\iff ${reduireAxPlusB(a, b)}=0$<br>`
            texteCorr += `$x=${texFractionSigne(-b, a)}$<br>`
            texteCorr += `L'équation admet une unique solution : $S=\\left\\{${texFractionReduite(-b, a)}\\right\\}$.`
          } else {
            texteCorr +=
              'On reconnaît une équation produit-nul, donc on applique la propriété :<br>'
            texteCorr += `${texteEnCouleur('Un produit est nul si et seulement si au moins un de ses facteurs est nul.', bleuMathalea)}<br>`
            texteCorr += ` $\\iff ${reduireAxPlusB(a, b)}=0\\quad$ ou bien $\\quad ${reduireAxPlusB(c - e, d - f)}=0$<br>`
            texteCorr += `$\\iff x=${texFractionSigne(-b, a)}\\quad$ ou $\\quad x=${texFractionSigne(-d + f, c - e)}$<br>
                   On en déduit :  `
            if ((-d + f) / (c - e) < -b / a) {
              valeursSolution = `${fraction(-d + f, c - e).texFractionSimplifiee};${fraction(-b, a).texFractionSimplifiee}`
            } else {
              valeursSolution = `${fraction(-b, a).texFractionSimplifiee};${fraction(-d + f, c - e).texFractionSimplifiee}`
            }
          }

          break
        case 3: // (ax+b)²+(ax+b)(ex+f)=0
          texte = `$(${reduireAxPlusB(a, b)})^{2}+(${reduireAxPlusB(a, b)})(${reduireAxPlusB(e, f)})=0$`
          texteCorr = ` $(${reduireAxPlusB(a, b)})^{2}+(${reduireAxPlusB(a, b)})(${reduireAxPlusB(e, f)})=0$<br>`
          texteCorr += ` $(${reduireAxPlusB(a, b)})(${reduireAxPlusB(a, b)})+(${reduireAxPlusB(a, b)})(${reduireAxPlusB(e, f)})=0$<br>`
          if (this.correctionDetaillee) {
            texteCorr += ` On observe que $(${reduireAxPlusB(a, b)})$ est un facteur commun dans les deux termes :<br>`
            texteCorr += ` $\\phantom{\\iff} (\\underline{${reduireAxPlusB(a, b)}})(${reduireAxPlusB(a, b)})+(\\underline{${reduireAxPlusB(a, b)}})(${reduireAxPlusB(e, f)})=0$<br>`
            texteCorr += ` $\\iff (\\underline{${reduireAxPlusB(a, b)}})\\Big((${reduireAxPlusB(a, b)})+(${reduireAxPlusB(e, f)})\\Big)=0$<br>`
          }
          if (e < 0)
            texteCorr += ` $\\iff (${reduireAxPlusB(a, b)})(${reduireAxPlusB(a, b)})${reduireAxPlusB(e, f)})=0$<br>`
          else
            texteCorr += ` $\\iff (${reduireAxPlusB(a, b)})(${reduireAxPlusB(a, b)})+${reduireAxPlusB(e, f)})=0$<br>`
          texteCorr += ` $\\iff (${reduireAxPlusB(a, b)})(${reduireAxPlusB(a + e, b + f)})=0$<br>`
          if (a + e === 0) {
            texteCorr += `$\\iff ${reduireAxPlusB(a, b)}=0$<br>`
            texteCorr += `$x=${texFractionSigne(-b, a)}$<br>`
            texteCorr += `L'équation admet une unique solution : $S=\\left\\{${texFractionReduite(-b, a)}\\right\\}$.`
          } else {
            texteCorr +=
              'On reconnaît une équation produit-nul, donc on applique la propriété :<br>'
            texteCorr += `${texteEnCouleur('Un produit est nul si et seulement si au moins un de ses facteurs est nul.', bleuMathalea)}<br>`
            texteCorr += ` $\\iff ${reduireAxPlusB(a, b)}=0\\quad$ ou bien $\\quad ${reduireAxPlusB(a + e, b + f)}=0$<br>`
            texteCorr += `$\\iff x=${texFractionSigne(-b, a)}\\quad$ ou $\\quad x=${texFractionSigne(-b - f, a + e)}$<br>
               On en déduit :  `
            if ((-b - f) / (a + e) < -b / a) {
              valeursSolution = `${fraction(-b - f, a + e).texFractionSimplifiee};${fraction(-b, a).texFractionSimplifiee}`
            } else {
              valeursSolution = `${fraction(-b, a).texFractionSimplifiee};${fraction(-b - f, a + e).texFractionSimplifiee}`
            }
          }

          break
        case 4: // (ax+b)(cx+d)-(ax+b)²=0
          texte = `$(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})-(${reduireAxPlusB(a, b)})^{2}=0$`
          texteCorr = ` ($${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})-(${reduireAxPlusB(a, b)})^{2}=0$<br>`
          texteCorr += ` ($${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})-(${reduireAxPlusB(a, b)})(${reduireAxPlusB(a, b)})=0$<br>`
          if (this.correctionDetaillee) {
            texteCorr += ` On observe que $(${reduireAxPlusB(a, b)})$ est un facteur commun dans les deux termes :<br>`
            texteCorr += ` $\\phantom{\\iff} (\\underline{${reduireAxPlusB(a, b)}})(${reduireAxPlusB(c, d)})-(\\underline{${reduireAxPlusB(a, b)}})(${reduireAxPlusB(a, b)})=0$<br>`
            texteCorr += ` $\\iff (\\underline{${reduireAxPlusB(a, b)}})\\Big((${reduireAxPlusB(c, d)})-(${reduireAxPlusB(a, b)})\\Big)=0$<br>`
          }
          if (a > 0)
            texteCorr += ` $\\iff (${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)}${reduireAxPlusB(-a, -b)}))=0$<br>`
          else
            texteCorr += ` $\\iff (${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)}+${reduireAxPlusB(-a, -b)}))=0$<br>`
          texteCorr += ` $\\iff (${reduireAxPlusB(a, b)})(${reduireAxPlusB(c - a, d - b)})=0$<br>`
          if (c - a === 0) {
            texteCorr += `$\\iff ${reduireAxPlusB(a, b)}=0$<br>`
            texteCorr += `$x=${texFractionSigne(-b, a)}$<br>`
            texteCorr += `L'équation admet une unique solution : $S=\\left\\{${texFractionReduite(-b, a)}\\right\\}$.`
          } else {
            texteCorr +=
              'On reconnaît une équation produit-nul, donc on applique la propriété :<br>'
            texteCorr += `${texteEnCouleur('Un produit est nul si et seulement si au moins un de ses facteurs est nul.', bleuMathalea)}<br>`
            texteCorr += ` $\\iff ${reduireAxPlusB(a, b)}=0\\quad$ ou bien $\\quad ${reduireAxPlusB(c - a, d - b)}=0$<br>`
            texteCorr += `$\\iff x=${texFractionSigne(-b, a)}\\quad$ ou $\\quad x=${texFractionSigne(-d + b, c - a)}$<br>
           On en déduit :  `
            if ((-d + b) / (c - b) < -b / a) {
              valeursSolution = `${fraction(-d + b, c - a).texFractionSimplifiee};${fraction(-b, a).texFractionSimplifiee}`
            } else {
              valeursSolution = `${fraction(-b, a).texFractionSimplifiee};${fraction(-d + b, c - a).texFractionSimplifiee}`
            }
          }

          break

        case 5: // (ax+b)(cx+d)=(ax+b)(ex+f)
        default:
          {
            texte = `$(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})=(${reduireAxPlusB(a, b)})(${reduireAxPlusB(e, f)})$`
            texteCorr =
              'Deux nombres sont égaux si et seulement si leur différence est nulle.<br>'
            texteCorr += `$\\phantom{\\iff}(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})=(${reduireAxPlusB(a, b)})(${reduireAxPlusB(e, f)})$<br>`
            texteCorr += `$\\iff (${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})-(${reduireAxPlusB(a, b)})(${reduireAxPlusB(e, f)})=0$<br>`
            if (this.correctionDetaillee) {
              texteCorr += ` On observe que $(${reduireAxPlusB(a, b)})$ est un facteur commun dans les deux termes :<br>`
              texteCorr += `$\\phantom{\\iff}(\\underline{${reduireAxPlusB(a, b)}})(${reduireAxPlusB(c, d)})-(\\underline{${reduireAxPlusB(a, b)}})(${reduireAxPlusB(e, f)})=0$<br>`
              texteCorr += `$\\iff (\\underline{${reduireAxPlusB(a, b)}})\\Big((${reduireAxPlusB(c, d)})-(${reduireAxPlusB(e, f)})\\Big)=0$<br>`
            }
            if (e < 0) {
              texteCorr += `$\\iff (${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)}+${reduireAxPlusB(-e, -f)})=0$<br>`
            } else {
              texteCorr += `$\\iff (${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)}${reduireAxPlusB(-e, -f)})=0$<br>`
            }
            texteCorr += `$\\iff (${reduireAxPlusB(a, b)})(${reduireAxPlusB(c - e, d - f)})=0$<br>`
            texteCorr += `On reconnaît une équation produit-nul, donc on applique la propriété :<br>
        ${texteEnCouleur('Un produit est nul si et seulement si au moins un de ses facteurs est nul.', bleuMathalea)}<br>`
            texteCorr += `$(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c - e, d - f)})=0$<br>`
            texteCorr += `$\\iff ${reduireAxPlusB(a, b)}=0$ ou $${reduireAxPlusB(c - e, d - f)}=0$<br>`
            if (this.correctionDetaillee) {
              // on ajoute les étapes de résolution si la correction détaillée est cochée.
              texteCorr += `$\\iff ${reduireAxPlusB(a, 0)}=${-b}$ ou $ ${reduireAxPlusB(c - e, 0)}=${-d + f}$<br>`
            }
            const f1 = fraction(-b, a)
            const f2 = fraction(-d + f, c - e)
            texteCorr += `$\\iff x=${f1.texFraction}$ ou $ x=${f2.texFraction}$<br>On en déduit :  `
            if (-b / a > (-d + f) / (c - e)) {
              valeursSolution = `${f2.texFractionSimplifiee};${f1.texFractionSimplifiee}`
            } else if (-b / a < (-d + f) / (c - e)) {
              valeursSolution = `${f1.texFractionSimplifiee};${f2.texFractionSimplifiee}`
            } else {
              valeursSolution = `${f1.texFractionSimplifiee}`
            }
          }
          break
      }
      //  const solutions = valeursSolution?.split(';')
      // texteCorr += `$S=\\left\\{${valeursSolution}\\right\\}$`
      const solutions = valeursSolution?.split(';')
      texteCorr += `$S=${miseEnEvidence(`\\left\\{${solutions?.join(';')}\\right\\}`)}$.`
      if (this.interactif) {
        texte +=
          '<br>$S=$' +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierEnsemble)
      }
      handleAnswers(this, i, {
        reponse: {
          value: `\\{${valeursSolution}\\}`,
          options: { ensembleDeNombres: true },
        },
      })
      if (this.questionJamaisPosee(a, b, c, d, e, f)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
