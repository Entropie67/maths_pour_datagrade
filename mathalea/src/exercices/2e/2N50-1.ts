import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { texteGras } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'
export const titre = "Justifier l'existence d'une racine carrée"
export const interactifReady = true

export const dateDeModifImportante = '15/11/2023'
/**
 * 2N32-1, ex 2N10
 * @author Stéphane Guyon et Gilles Mora (interactif + modif correction)
 */
export const uuid = '55cc0'

export const refs = {
  'fr-fr': ['2N50-1'],
  'fr-ch': ['1mCN-6', '11LSNO3C-1'],
}
export default class ExistenceDUneRacineCarree extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 5
    this.nbCols = 2
    this.nbColsCorr = 2
    this.sup = 1 //
    this.correctionDetaillee = true
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    if (!this.interactif) {
      this.consigne = ` Le nombre proposé existe-t-il${sp()}? Justifier.`
    } else {
      this.consigne = `Le nombre proposé existe-t-il${sp()}? <br>
    Répondre par Oui (saisir O) ou Non (saisir N).`
    }
    const typesDeQuestionsDisponibles = [1, 2, 3, 4, 5, 6, 7, 8]
    let typesDeQuestions //,
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (
      let i = 0, texte, texteCorr, reponse, corr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      typesDeQuestions = listeTypeDeQuestions[i]
      const corrDetail = `${texteGras('Définition')}${sp()}: $\\sqrt{a}$ est le nombre positif dont le carré est $a$.<br>
      Il vérifie donc $\\sqrt{a}\\times \\sqrt{a}=a$. <br>
      Comme $a$ est un carré, c'est un nombre positif.<br>
      Ainsi, la racine carrée d'un nombre négatif n'existe pas. <br><br>
      ${texteGras('Méthode')}${sp()}: Pour montrer qu'une racine carrée existe, il suffit de montrer que le nombre sous le radical est positif. <br><br>`
      let a = 0
      switch (typesDeQuestions) {
        // Cas par cas, on définit le type de nombres que l'on souhaite
        // Combien de chiffres ? Quelles valeurs ?
        case 1:
          a = randint(2, 9)
          corr = `Comme $\\sqrt{${a}} \\geqslant 0$, alors $\\sqrt{\\sqrt{${a}}}$ ${texteEnCouleurEtGras("existe")}.`
          texte = `$\\sqrt{\\sqrt{${a}}}$`
          if (this.correctionDetaillee) {
            texteCorr = corrDetail
            texteCorr += corr
          } else {
            texteCorr = corr
          }
          reponse = 'O'

          break
        case 2:
          a = randint(2, 9) * -1
          texte = `$\\sqrt{${a}}$`
          reponse = 'N'
          corr = `$${a}$ est un nombre négatif donc $\\sqrt{${a}}$ ${texteEnCouleurEtGras("n'existe pas")}. `
          if (this.correctionDetaillee) {
            texteCorr = corrDetail
            texteCorr += corr
          } else {
            texteCorr = corr
          }
          break
        case 3:
          a = randint(2, 9) * -1
          texte = `$\\sqrt{\\left(${a}\\right)^{2}}$`
          reponse = 'O'
          corr = `On a $\\left(${a}\\right)^{2}=\\left(${a}\\right)\\times \\left(${a}\\right)=${a * a}$. <br>
          Comme $${a * a}$ est un nombre positf, $\\sqrt{\\left(${a}\\right)^{2}}$ ${texteEnCouleurEtGras("existe")}.`
          if (this.correctionDetaillee) {
            texteCorr = corrDetail
            texteCorr += corr
          } else {
            texteCorr = corr
          }

          break
        case 4:
          a = randint(2, 9)
          texte = `$-\\sqrt{${a}}$`
          reponse = 'O'
          corr = `$${a}$ est un nombre positif donc $-\\sqrt{${a}}$ ${texteEnCouleurEtGras("existe")}.<br>
          ${texteGras('Remarque')}${sp()}: Le signe $-$ étant placé devant le symbole radical, le nombre $-\\sqrt{${a}}$ est donc négatif. `
          if (this.correctionDetaillee) {
            texteCorr = corrDetail
            texteCorr += corr
          } else {
            texteCorr = corr
          }
          break
        case 5:
          a = randint(2, 9) * -1
          texte = `$\\sqrt{-\\left(${a}\\right)^{2}}$`
          reponse = 'N'
          corr = `On a $-\\left(${a}\\right)^{2}=-\\left(${a}\\right)\\times \\left(${a}\\right)=-${a * a}$.<br>
          Comme $-${a * a}$ est un nombre négatif, $\\sqrt{-\\left(${a}\\right)^{2}}$ ${texteEnCouleurEtGras("n'existe pas")}.`
          if (this.correctionDetaillee) {
            texteCorr = corrDetail
            texteCorr += corr
          } else {
            texteCorr = corr
          }
          break
        case 6:
          a = randint(2, 3)
          texte = `$\\sqrt{${a}-\\pi}$`
          reponse = 'N'
          corr = `Comme $\\pi>3$ alors $${a}-\\pi$ est un nombre négatif. <br>
          Ainsi, $\\sqrt{${a}-\\pi}$ ${texteEnCouleurEtGras("n'existe pas")}.`
          if (this.correctionDetaillee) {
            texteCorr = corrDetail
            texteCorr += corr
          } else {
            texteCorr = corr
          }
          break

        case 7:
          a = randint(4, 8)
          texte = `$\\sqrt{${a}-\\pi}$`
          reponse = 'O'
          corr = `Comme $\\pi\\approx 3,14$ alors $${a}-\\pi$ est un nombre positif.<br>
          Ainsi, $\\sqrt{${a}-\\pi}$ ${texteEnCouleurEtGras("existe")}.`
          if (this.correctionDetaillee) {
            texteCorr = corrDetail
            texteCorr += corr
          } else {
            texteCorr = corr
          }
          break

        case 8:
        default:
          a = randint(2, 12)
          texte = `$\\sqrt{-${a}^{2}}$`
          reponse = 'N'
          corr = `On a $-${a}^{2}=-${a}\\times ${a}=-${a * a}$. <br>
          Comme $-${a * a}$ est un réel négatif, $\\sqrt{-${a}^{2}}$ ${texteEnCouleurEtGras("n'existe pas")}.`
          if (this.correctionDetaillee) {
            texteCorr = corrDetail
            texteCorr += corr
          } else {
            texteCorr = corr
          }
          break
      }
      handleAnswers(this, i, {
        reponse: {
          value: Array.isArray(reponse)
            ? reponse.map(String)
            : [String(reponse)],
          options: { texteAvecCasse: true },
        },
      })
      if (this.interactif) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.vFON)
      }
      if (this.questionJamaisPosee(i, a, typesDeQuestions)) {
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
