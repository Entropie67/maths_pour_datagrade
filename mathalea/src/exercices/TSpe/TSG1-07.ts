import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { prenoms } from '../../lib/outils/Personne'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { numAlpha } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import {
  factorielle,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Effectuer un dénombrement'
export const interactifReady = true

export const dateDePublication = '21/04/2025' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

export const uuid = '3a385'
export const refs = {
  'fr-fr': ['TSG1-07'],
  'fr-ch': [],
}

/**
 * Ce model est prévu pour les exercice où le nombre de questions est fixe
 * et où on ne demande pas la même chose à toutes les questions
 * @author Stéphane Guyon

*/
export default class denombrement extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // membre association
      const n = randint(20, 40) // nombre d'adhérents
      const ca = randint(5, 8) // nombre membres au CA
      const partieEntiere = Math.floor(n / 2) // partie entière de n/2;
      const garcons = randint(partieEntiere, n - 5) // nombre de garcons
      const filles = n - garcons // nombre de filles
      const assos = ['Coopmaths']
      const nomAsso = choice(assos)
      const prenomGarcons =
        nomAsso === 'Coopmaths'
          ? [
              'Jean-Claude',
              'Rémi',
              'Éric',
              'Gilles',
              'Stéphane',
              'Mickaël',
              'Sylvain',
              'Guillaume',
              'Liouba',
              'Nathan',
              'Mathieu',
              'Cyril',
              'Maxime',
              'Olivier',
              'Pierre',
            ]
          : prenoms.map((p) => p.prenom)
      const numerogarcon1 = randint(0, 14)
      const prenomFilles = [
        'Sophie',
        'Aude',
        'Mireille',
        'Lydie',
        'Claire',
        'Ève',
        'Julie',
      ]
      const numerofille1 = randint(0, 6)
      const factorielleN = factorielle(n)
      const factorielleCA = factorielle(ca)
      const factorielleNmoinsCA = factorielle(n - ca)
      const reponse1 = arrondi(
        factorielleN / (factorielleCA * factorielleNmoinsCA),
        0,
      )

      const NombreCAGarcons = arrondi(
        factorielle(garcons) / (factorielle(ca) * factorielle(garcons - ca)),
        0,
      )
      const reponse2 = arrondi(reponse1 - NombreCAGarcons, 0)
      const reponse3 = arrondi(factorielleCA / factorielle(ca - 3), 0)
      let texte = `L'association ${nomAsso} organise son assemblée générale annuelle pour élire son nouveau Conseil d'Administration (CA) composé de $${ca}$ membres, qui élira ensuite en son sein, un bureau.<br> `
      texte += `Il y a $${n}$ adhérents à jour de cotisations, qui peuvent donc voter et candidater au CA. <br><br>`
      texte += addMultiMathfield(this, i, {
        dataTemplate: `a) ${prenomGarcons[numerogarcon1]} souhaite déterminer combien de CA différents il est possible de constituer avec tous les adhérents.\nDéterminer ce nombre.${this.interactif ? '\n$n=$' : ''}%{champ1}\n
      b) ${prenomGarcons[numerogarcon1]} intervient fièrement pour annoncer le résultat de son calcul. Mais ${prenomFilles[numerofille1]} prend la parole pour lui rappeler que les statuts de l'association imposent la présence d'au moins une femme dans le CA et que son calcul est donc faux.\n Sachant qu'il y a $${garcons}$ garçons et $${filles}$ filles parmi les adhérents, en déduire le nombre exact de CA possibles.${this.interactif ? '\n$n=$' : ''}%{champ2}\n
      c) Le CA étant élu, il se réunit pour élire en son sein le bureau, composé d'un président ou d'une présidente, d'un secrétaire ou d'une secrétaire et d'un trésorier ou d'une trésorière.\n Combien de bureaux différents peut-on constituer ?${this.interactif ? '\n$n=$' : ''}%{champ3}`,
        dataOptions: {},
      })

      handleAnswers(
        this,
        i,
        {
          bareme: toutAUnPoint,
          champ1: { value: reponse1 },
          champ2: { value: reponse2 },
          champ3: { value: reponse3 },
        },
        { formatInteractif: 'multi-mathfield' },
      )
      let correction1 = `On doit choisir $${ca}$ adhérents parmi $${n}$. <br>`
      correction1 += `L'ordre des candidats ne compte pas dans ce choix. Il s'agit donc de déterminer le nombre de combinaisons de $${ca}$ membres parmi $${n}$.<br>`
      correction1 += `On calcule donc <br>$\\begin{aligned}\\dbinom{${n}}{${ca}} &= \\dfrac{${n}~!}{${ca}~!\\times ${n - ca}~!}\\\\&=${texNombre(reponse1)}\\end{aligned}$<br>`
      correction1 += `Il y a donc $${miseEnEvidence(texNombre(reponse1))}$ CA possibles.<br>`
      let correction2 = `Dans les $${texNombre(reponse1)}$ CA possibles, il faut retirer ceux qui ne contiennent que des garçons.`
      correction2 +=
        '<br>On calcule donc le nombre de CA possibles avec uniquement des garçons :<br>'
      correction2 += `$\\begin{aligned}\\dbinom{${garcons}}{${ca}} &= \\dfrac{${garcons}~!}{${ca}~!\\times ${garcons - ca}~!}\\\\&=${texNombre(arrondi(factorielle(garcons) / (factorielle(ca) * factorielle(garcons - ca)), 0))}\\end{aligned}$<br>`
      correction2 +=
        'Il faut donc soustraire ce résultat du nombre total de CA possibles.<br>'
      correction2 += `On a donc $${texNombre(reponse1)} - ${texNombre(NombreCAGarcons)} = ${miseEnEvidence(texNombre(reponse2))}$ CA possibles avec au moins une fille.`
      let correction3 =
        "Pour constituer le bureau, l'ordre compte, puisqu'il y a trois postes différents à pourvoir.<br>"
      correction3 += `Il faut donc déterminer le nombre de triplets d'éléments distincts que l'on peut constituer dans une liste à $${ca}$ éléments.<br>`
      correction3 += `On calcule donc <br>$\\begin{aligned}\\dfrac{${ca}~!}{(${ca} - 3)~!}&=\\dfrac{${ca}~!}{${ca - 3} ~! }\\\\&=${texNombre(arrondi(factorielle(ca) / factorielle(ca - 3), 0))}\\end{aligned}$<br>`
      correction3 += `Il y a donc $${miseEnEvidence(texNombre(arrondi(factorielle(ca) / factorielle(ca - 3), 0)))}$ bureaux possibles.`
      listeQuestionsToContenu(this)
      if (this.questionJamaisPosee(i, reponse1, reponse2, reponse3)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] =
          `${numAlpha(0)} ${correction1}<br><br>${numAlpha(1)} ${correction2}<br><br>${numAlpha(2)} ${correction3}`
        i++
      }
      cpt++
    }
  }
}
