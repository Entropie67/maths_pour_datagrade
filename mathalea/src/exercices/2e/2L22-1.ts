import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import {
  fraction,
  obtenirListeFractionsIrreductiblesFaciles,
} from '../../modules/fractions'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { sp } from '../../lib/outils/outilString'
export const titre = 'Résoudre les équations produit-nul'
export const interactifReady = true

export const dateDePublication = '06/02/2021'

/**
 * Résoudre des équations (ax+b)(cx+d)=0
 * @author Stéphane Guyon & Jean-claude Lhote
 */
export const uuid = '53762'

export const refs = {
  'fr-fr': ['2L22-1', 'BP2RES31'],
  'fr-ch': ['11LSFA4E-3'],
}
export default class EquationsProduitsNuls2 extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      5,
      '1 : ax(bx+d)=0 avec a, b et d entiers\n2 : (ax+b)(cx+d)=0 avec a, b, c et d entiers\n3 : (ax+b)(cx+d)=0 avec a et c rationnels\n4 : (ax+b)(cx+d)=0 avec b et d rationnels\n5 : Mélange des cas précédents',
    ]

    this.nbQuestions = 2
    this.sup = 1
    this.spacingCorr = 3
    this.nbQuestions = 2
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
  }

  nouvelleVersion() {
    this.consigne =
      'Résoudre dans $\\mathbb R$ ' +
      (this.nbQuestions !== 1
        ? 'les équations suivantes'
        : "l'équation suivante") +
      '.'
    let typesDeQuestionsDisponibles = []
    if (this.sup < 5) {
      typesDeQuestionsDisponibles = [this.sup]
    } else {
      typesDeQuestionsDisponibles = [1, 2, 3, 4]
    }

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (
      let i = 0, texte, texteCorr, cpt = 0, typesDeQuestions;
      i < this.nbQuestions && cpt < 50;
    ) {
      typesDeQuestions = listeTypeDeQuestions[i]
      const a = randint(-9, 9, 0)
      const b = randint(-9, 9, 0)
      const c = randint(-9, 9, [0, a])
      const d = randint(1, 9, [0, b])
      const fractions = obtenirListeFractionsIrreductiblesFaciles()
      const index = randint(0, fractions.length - 1)
      let f1 = fractions[index].multiplieEntier(choice([-1, 1]))
      const index2 = randint(0, fractions.length - 1, index)
      let f2 = fractions[index2].multiplieEntier(choice([-1, 1]))
      let f3, f4
      let reponse

      switch (typesDeQuestions) {
        case 1: {
          texte = `$${reduireAxPlusB(a, 0)}(${reduireAxPlusB(c, d)})=0$`
          texteCorr = `On reconnaît une équation produit-nul, donc on applique la propriété :<br>
                    ${texteEnCouleur('Un produit est nul si et seulement si au moins un de ses facteurs est nul.')}<br>`
          texteCorr += texte + '<br>'
          texteCorr += `$\\iff ${reduireAxPlusB(a, 0)}=0$ ou $${reduireAxPlusB(c, d)}=0$<br>`
          if (this.correctionDetaillee) {
            texteCorr += `$\\iff x=0$ ou $${reduireAxPlusB(c, 0)}=${-d}$<br>`
          }
          f1 = fraction(-d, c)
          texteCorr += `$\\iff x=0$ ou $x=${f1.texFraction}$<br>On en déduit : `
          if (f1.s > 0) {
            texteCorr += `$S=\\left\\{0;${f1.texFractionSimplifiee}\\right\\}$`
            reponse = `\\{0;${f1.texFractionSimplifiee}\\}`
          } else {
            texteCorr += `$S=\\left\\{${f1.texFractionSimplifiee};0\\right\\}$`
            reponse = `\\{${f1.texFractionSimplifiee};0\\}`
          }
          break
        }
        case 2:
          texte = `$(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})=0$`
          texteCorr = `On reconnaît une équation produit-nul, donc on applique la propriété :<br>
                    ${texteEnCouleur('Un produit est nul si et seulement si au moins un de ses facteurs est nul.')}<br>`
          texteCorr += texte + '<br>' // optimisation du code
          texteCorr += `$\\iff ${reduireAxPlusB(a, b)}=0$ ou $${reduireAxPlusB(c, d)}=0$<br>`
          if (this.correctionDetaillee) {
            // on ajoute les étapes de résolution si la correction détaillée est cochée.
            texteCorr += `$\\iff ${reduireAxPlusB(a, 0)}=${-b}$ ou $ ${reduireAxPlusB(c, 0)}=${-d}$<br>`
          }
          f1 = fraction(-b, a)
          f2 = fraction(-d, c)
          texteCorr += `$\\iff x=${f1.texFraction}$ ou $ x=${f2.texFraction}$<br>On en déduit :  `
          if (-b / a > -d / c) {
            texteCorr += `$S=\\left\\{${f2.texFractionSimplifiee};${f1.texFractionSimplifiee}\\right\\}$`
            reponse = `\\{${f2.texFractionSimplifiee};${f1.texFractionSimplifiee}\\}`
          } else if (-b / a < -d / c) {
            texteCorr += `$S=\\left\\{${f1.texFractionSimplifiee};${f2.texFractionSimplifiee}\\right\\}$`
            reponse = `\\{${f1.texFractionSimplifiee};${f2.texFractionSimplifiee}\\}`
          } else {
            texteCorr += `$S=\\left\\{${f1.texFractionSimplifiee}\\right\\}$`
            reponse = `\\{${f1.texFractionSimplifiee}\\}`
          }
          break
        case 3:
          f3 = f1.inverse().multiplieEntier(-b)
          f4 = f2.inverse().multiplieEntier(-d)
          texte = `$\\left(${f1.texFraction}x${ecritureAlgebrique(b)}\\right)\\left(${f2.texFraction}x${ecritureAlgebrique(d)}\\right)=0$`
          texteCorr = `On reconnaît une équation produit-nul, donc on applique la propriété :<br>
                    ${texteEnCouleur('Un produit est nul si et seulement si au moins un de ses facteurs est nul.')}<br>
                    $\\left(${f1.texFraction}x${ecritureAlgebrique(b)}\\right)\\left(${f2.texFraction}x${ecritureAlgebrique(d)}\\right)=0$<br>`
          texteCorr += `$\\iff ${f1.texFraction}x${ecritureAlgebrique(b)}=0$ ou $${f2.texFraction}x${ecritureAlgebrique(d)}=0$<br>`
          if (this.correctionDetaillee) {
            texteCorr += `$\\iff ${f1.texFraction}x=${-b}$ ou $${f2.texFraction}x=${-d}$<br>`
            texteCorr += `$\\iff x=${-b}\\div ${f1.texFraction}$ ou $x=${-d}\\div ${f2.texFraction}$<br>`
            texteCorr += `$\\iff x=${-b}\\times ${f1.inverse().texFraction}$ ou $x=${-d}\\times ${f2.inverse().texFraction}$<br>`
          }
          texteCorr += `$\\iff x=${f3.texFractionSimplifiee}$ ou $ x=${f4.texFractionSimplifiee}$<br>
                     On en déduit :  `
          if (f3.differenceFraction(f4).s > 0) {
            texteCorr += `$S=\\left\\{${f4.texFractionSimplifiee};${f3.texFractionSimplifiee}\\right\\}$`
            reponse = `\\{${f4.texFractionSimplifiee};${f3.texFractionSimplifiee}\\}`
          } else if (f3.differenceFraction(f4).s < 0) {
            texteCorr += `$S=\\left\\{${f3.texFractionSimplifiee};${f4.texFractionSimplifiee}\\right\\}$`
            reponse = `\\{${f3.texFractionSimplifiee};${f4.texFractionSimplifiee}\\}`
          } else {
            texteCorr += `$S=\\left\\{${f3.texFractionSimplifiee}\\right\\}$`
            reponse = `\\{${f3.texFractionSimplifiee}\\}`
          }

          break
        case 4: // (ax+f1)(bx+f2)=0
        default:
          f3 = f1.entierDivise(-a)
          f4 = f2.entierDivise(-b)
          texte = `$\\left(${reduireAxPlusB(a, 0)}${f1.texFractionSignee}\\right)\\left(${reduireAxPlusB(b, 0)}${f2.texFractionSignee}\\right)=0$`
          texteCorr = `On reconnaît une équation produit-nul, donc on applique la propriété :<br>
                        ${texteEnCouleur('Un produit est nul si et seulement si au moins un de ses facteurs est nul.')}<br>
                        $\\left(${reduireAxPlusB(a, 0)}${f1.texFractionSignee}\\right)\\left(${reduireAxPlusB(b, 0)}${f2.texFractionSignee}\\right)=0$<br>`
          texteCorr += `$\\iff ${reduireAxPlusB(a, 0)}${f1.texFractionSignee}=0$ ou $${reduireAxPlusB(b, 0)}${f2.texFractionSignee}=0$<br>`
          if (this.correctionDetaillee) {
            texteCorr += `$\\iff ${reduireAxPlusB(a, 0)}=${f1.multiplieEntier(-1).texFraction}$ ou $${reduireAxPlusB(b, 0)}=${f2.multiplieEntier(-1).texFraction}$<br>`
            texteCorr += `$\\iff x=${f1.multiplieEntier(-1).texFraction}\\div ${ecritureParentheseSiNegatif(a)}$ ou $x=${f2.multiplieEntier(-1).texFraction}\\div ${ecritureParentheseSiNegatif(b)}$<br>`
            texteCorr += `$\\iff x=${f1.multiplieEntier(-1).texFraction}\\times ${fraction(1, a).texFSP}$ ou $x=${f2.multiplieEntier(-1).texFraction}\\times ${fraction(1, b).texFSP}$<br>`
          }
          texteCorr += `$\\iff x=${f3.texFractionSimplifiee}$ ou $ x=${f4.texFractionSimplifiee}$<br>
                         On en déduit :  `
          if (f3.differenceFraction(f4).s > 0) {
            texteCorr += `$S=\\left\\{${f4.texFractionSimplifiee};${f3.texFractionSimplifiee}\\right\\}$`
            reponse = `\\{${f4.texFraction};${f3.texFraction}\\}`
          } else if (f3.differenceFraction(f4).s < 0) {
            texteCorr += `$S=\\left\\{${f3.texFractionSimplifiee};${f4.texFractionSimplifiee}\\right\\}$`
            reponse = `\\{${f3.texFractionSimplifiee};${f4.texFractionSimplifiee}\\}`
          } else {
            texteCorr += `$S=\\left\\{${f3.texFractionSimplifiee}\\right\\}$`
            reponse = `\\{${f3.texFractionSimplifiee}\\}`
          }
          break
      }
      texte +=
        sp(4) +
        ajouteChampTexteMathLive(this, i, KeyboardType.clavierEnsemble, {
          texteAvant: ' $S=$',
        })
      handleAnswers(this, i, {
        reponse: { value: reponse, options: { ensembleDeNombres: true } },
      })

      // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras

      const textCorrSplit = texteCorr.split('=')
      let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
      aRemplacer = aRemplacer.replace('$', '').replace('<br>', '')

      texteCorr = ''
      for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
        texteCorr += textCorrSplit[ee] + '='
      }
      texteCorr += `$ $${miseEnEvidence(aRemplacer)}$.`

      // Fin de cette uniformisation

      if (this.questionJamaisPosee(i, a, b, c, d, ...fractions)) {
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
