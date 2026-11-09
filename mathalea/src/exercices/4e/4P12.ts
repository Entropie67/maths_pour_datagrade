import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif' // fonction qui va préparer l'analyse de la saisie
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive' // fonctions de mise en place des éléments interactifs
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { prenom, prenomF, prenomM } from '../../lib/outils/Personne'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import { objet } from '../6e/6N4A-1'
import Exercice from '../Exercice'
import { queDevant } from '../../lib/outils/outilString'

export const interactifReady = true

export const titre =
  'Partager une quantité en deux ou trois parts selon un ratio donné'

/**
 * Partager une quantité en deux ou trois parts selon un ratio donné.
 * @author Guillaume Valmont

 * Date de publication : 24/07/2021
*/
export const uuid = '60910'

export const refs = {
  'fr-fr': ['5P12'],
  'fr-ch': ['10CTFA1B-1', '10LCFA1B-1', '10LSFA1B-1', 'PRQPF03B-5'],
}
export default class PartagerSelonUnRatio extends Exercice {
  constructor() {
    super()

    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      3,
      '1 : Partager en deux parts\n2 : Partager en trois parts',
    ]

    this.nbQuestions = 1
    this.sup = 1
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    for (
      let i = 0,
        texte,
        texteCorr,
        objet1,
        prenom1,
        prenom2,
        prenom3,
        quantite1,
        quantite2,
        quantite3,
        facteur,
        total,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      objet1 = objet()
      prenom1 = prenomF()
      prenom2 = prenomM()
      prenom3 = prenom()
      while (prenom3 === prenom1 || prenom3 === prenom2) {
        prenom3 = prenom()
      }
      quantite1 = randint(2, 9)
      quantite2 = randint(2, 9, [quantite1])
      quantite3 = randint(2, 9, [quantite1, quantite2])
      facteur = randint(2, 9)
      if (this.sup.toString() === '1') {
        // Partage en deux parts
        total = (quantite1 + quantite2) * facteur
        texte = `${prenom1} et ${prenom2} veulent se partager leurs $${total}$ ${objet1} en deux parts selon le ratio $${quantite1} : ${quantite2}$. <br>`
        texte += `Combien chacun recevra-t-il de ${objet1} ?`

        texteCorr = ''
        if (this.correctionDetaillee) {
          texteCorr += `À chaque fois ${queDevant(prenom1)} en reçoit $${quantite1}$, ${prenom2} en reçoit $${quantite2}$. Ce qui fait $${quantite1} + ${quantite2} = ${quantite1 + quantite2}$. <br>`
        } else {
          texteCorr += `$${quantite1} + ${quantite2} = ${quantite1 + quantite2}$ <br>`
        }
        if (this.correctionDetaillee) {
          texteCorr += `En fait, à chaque passage, ils en reçoivent $${quantite1 + quantite2}$ au total.<br>`
          texteCorr += `<br>Calculons le nombre de passages nécessaires pour se partager les $${total}$ ${objet1} :<br>`
        }
        texteCorr += `$${total} \\div ${quantite1 + quantite2} = ${facteur}$`
        if (this.correctionDetaillee) {
          texteCorr += `.<br><br>Ils devront faire $${facteur}$ passages et à chaque passage, ${prenom1} recevra $${quantite1}$ ${objet1}. <br>`
          texteCorr += `Au total, elle recevra $${quantite1} \\times ${facteur} = ${miseEnEvidence(quantite1 * facteur)}$ ${objet1}. <br>`
          texteCorr += `De la même façon, ${prenom2} recevra $${quantite2} \\times ${facteur} = ${miseEnEvidence(quantite2 * facteur)}$ ${objet1}. <br>`
        } else {
          texteCorr += `<br>$\\text{${prenom1}} : \\text{${prenom2}} = ${quantite1} : ${quantite2} = ${miseEnEvidence(quantite1 * facteur)} : ${miseEnEvidence(quantite2 * facteur)}  \\text{ (en multipliant par }${facteur}\\text{)}$ <br>`
        }
        texteCorr += `<br>${prenom1} recevra $${quantite1 * facteur}$ ${objet1} et ${prenom2} en recevra $${quantite2 * facteur}$. <br>`
      } else {
        // Partage en trois parts
        total = (quantite1 + quantite2 + quantite3) * facteur
        texte = `${prenom1}, ${prenom2} et ${prenom3} veulent se partager leurs $${total}$ ${objet1} en trois parts selon le ratio $${quantite1} : ${quantite2} : ${quantite3}$. <br>`
        texte += `Combien chacun recevra-t-il de ${objet1} ?`

        texteCorr = ''
        if (this.correctionDetaillee) {
          texteCorr += `À chaque fois ${queDevant(prenom1)} en reçoit $${quantite1}$, ${prenom2} en reçoit $${quantite2}$ et ${prenom3} en reçoit $${quantite3}$. Ce qui fait $${quantite1} + ${quantite2} + ${quantite3} = ${quantite1 + quantite2 + quantite3}$. <br>`
        } else {
          texteCorr += `$${quantite1} + ${quantite2} + ${quantite3} = ${quantite1 + quantite2 + quantite3}$ <br>`
        }
        if (this.correctionDetaillee) {
          texteCorr += `En fait, à chaque passage, ils en reçoivent $${quantite1 + quantite2 + quantite3}$ au total.<br>`
          texteCorr += `<br>Calculons le nombre de passages nécessaires pour se partager les $${total}$ ${objet1} :<br>`
        }
        texteCorr += `$${total} \\div ${quantite1 + quantite2 + quantite3} = ${facteur}$`
        if (this.correctionDetaillee) {
          texteCorr += `.<br><br>Ils devront faire $${facteur}$ passages et à chaque passage, ${prenom1} recevra $${quantite1}$ ${objet1}. <br>`
          texteCorr += `Au total, elle recevra $${quantite1} \\times ${facteur} = ${miseEnEvidence(quantite1 * facteur)}$ ${objet1}. <br>`
          texteCorr += `De la même façon, ${prenom2} recevra $${quantite2} \\times ${facteur} = ${miseEnEvidence(quantite2 * facteur)}$ ${objet1} et ${prenom3} recevra $${quantite3} \\times ${facteur} = ${miseEnEvidence(quantite3 * facteur)}$ ${objet1}. <br>`
        } else {
          texteCorr += `<br>$\\text{${prenom1}} : \\text{${prenom2}} : \\text{${prenom3}} = ${miseEnEvidence(quantite1 * facteur)} : ${miseEnEvidence(quantite2 * facteur)} : ${miseEnEvidence(quantite3 * facteur)} \\text{ (en multipliant par }${facteur}\\text{)} $ <br>`
        }
        texteCorr += `<br>${prenom1} recevra $${quantite1 * facteur}$ ${objet1}, ${prenom2} en recevra $${quantite2 * facteur}$ et ${prenom3} en recevra $${quantite3 * facteur}$.`
      }
      if (this.interactif) {
        if (this.sup.toString() === '1') {
          // Partage en deux parts
          texte +=
            '<BR>' +
            remplisLesBlancs(
              this,
              i,
              `\\text{${prenom1} recevra  }%{champ1}\\text{ ${objet1} et ${prenom2} en recevra  } %{champ2}.`,
              KeyboardType.clavierNumbers,
            )
          handleAnswers(
            this,
            i,
            {
              bareme: (listePoints: number[]) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ], // 0 ou 1 point
              champ1: { value: String(quantite1 * facteur) },
              champ2: { value: String(quantite2 * facteur) },
            },
            { formatInteractif: 'fillInTheBlank' },
          )
        } else {
          // Partage en trois parts
          texte +=
            '<BR>' +
            remplisLesBlancs(
              this,
              i,
              `\\text{${prenom1} recevra  }%{champ1}\\text{ ${objet1}, ${prenom2} en recevra }%{champ2}\\text{ et ${prenom3} en recevra }%{champ3}.`,
              KeyboardType.clavierNumbers,
            )
          handleAnswers(
            this,
            i,
            {
              bareme: (listePoints: number[]) => [
                Math.min(listePoints[0], listePoints[1], listePoints[2]),
                1,
              ], // 0 ou 1 point
              champ1: { value: String(quantite1 * facteur) },
              champ2: { value: String(quantite2 * facteur) },
              champ3: { value: String(quantite3 * facteur) },
            },
            { formatInteractif: 'fillInTheBlank' },
          )
        }
      }
      if (this.listeQuestions.indexOf(texte) === -1) {
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
