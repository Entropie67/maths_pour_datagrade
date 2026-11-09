import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { range1 } from '../../../lib/outils/nombres'
import { prenomF, prenomM } from '../../../lib/outils/Personne'
import SchemaEnBoite from '../../../lib/outils/SchemaEnBoite'
import ExerciceSimple from '../../ExerciceSimple'
import { queDevant } from '../../../lib/outils/outilString'
export const titre = 'Résoudre un problème avec «\u00a0fois plus\u00a0», «\u00a0fois moins\u00a0»'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '23/07/2022'

/**
 * @author Gilles Mora
 *
 */
export const uuid = 'a8e75'

export const refs = {
  'fr-fr': ['canc3C09', '6P3autoB-flash1', '6AutoP2-1'],
  'fr-ch': [],
}
const listeObjets = ['biscuits', 'billes', 'bonbons', 'ballons', 'vis', 'clous']
const listeClubs = [
  'judo',
  'tennis',
  'tennis de table',
  'musique',
  'théâtre',
  'danse',
]
function schema(
  entete1: string,
  entete2: string,
  valeur1: number,
  valeur2: number,
  facteur: number,
) {
  return new SchemaEnBoite({
    lignes: [
      {
        entete: {
          content: entete1,
          longueur: 3,
        },
        barres:
          valeur1 === facteur * valeur2
            ? [
                {
                  content: `${valeur1}`,
                  length: 2 * facteur,
                  color: 'lightgray',
                },
              ]
            : range1(facteur).map((index) =>
                Object.assign(
                  { color: index === 1 ? 'lightgray' : 'white', length: 2 },
                  { content: `${valeur1}` },
                ),
              ),
      },
      {
        entete: {
          content: entete2,
          longueur: 3,
        },
        barres:
          valeur1 === facteur * valeur2
            ? range1(facteur).map((index) =>
                Object.assign(
                  { color: index === 1 ? 'lightgray' : 'white', length: 2 },
                  {
                    content: `${valeur2}`,
                  },
                ),
              )
            : [
                {
                  content: `${valeur2}`,
                  length: 2 * facteur,
                  color: 'lightgray',
                },
              ],
      },
    ],
  })
}
export default class FoisPlusFoisMoins extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = false
  }

  nouvelleVersion() {
    const plusOuMoins = this.quotaChoice('plusOuMoins', ['plus', 'moins'])
    const [sexe1, sexe2] = shuffle(['filles', 'garçons'])
    const objet = choice(listeObjets)
    const club = choice(listeClubs)
    const prenom1 = prenomM() as string
    const prenom2 = prenomF() as string
    const quantité1 = this.quotaRandint('quantité1', 3, 12)
    const facteur = this.quotaChoice('facteur', [3, 4, 5, 6])
    const quantité2 = quantité1 * facteur
    this.optionsChampTexte = { texteAvant: `<br>`, texteApres: ` ${objet}` }
    switch (
      this.quotaChoice('typeProbleme', [1, 2, 3]) // 1, 2
    ) {
      case 1:
        this.reponse = plusOuMoins === 'plus' ? quantité2 : quantité1
        this.question = choice([true, false])
          ? `${prenom1} a $${facteur}$ fois ${plusOuMoins} de ${objet} ${queDevant(prenom2)} qui en a ${plusOuMoins === 'plus' ? `$${quantité1}$` : ` $${quantité2}$`}.<br>`
          : `${prenom2} a ${plusOuMoins === 'plus' ? `$${quantité1}$` : ` $${quantité2}$ `} ${objet}. ${prenom1} en a $${facteur}$ fois ${plusOuMoins}.<br>`
        this.question += `Combien de ${objet} a ${prenom1} ? `
        this.correction = `${prenom2} a ${plusOuMoins === 'plus' ? `$${quantité1}$` : ` $${quantité2}$ `} ${objet}.<br>
        ${prenom1} en a $${facteur}$ fois ${plusOuMoins} ; il en a donc ${plusOuMoins === 'plus' ? `$${facteur}\\times ${quantité1}$` : ` $${quantité2}\\div ${facteur}$ `}, soit ${plusOuMoins === 'plus' ? `$${miseEnEvidence(quantité2)}$` : ` $${miseEnEvidence(quantité1)}$`}.<br>`
        if (this.correctionDetaillee) {
          this.correction += schema(
            prenom1,
            prenom2,
            plusOuMoins === 'plus' ? quantité2 : quantité1,
            plusOuMoins === 'plus' ? quantité1 : quantité2,
            facteur,
          ).display()
        }

        this.canReponseACompleter = `$\\ldots$ ${objet}`
        break
      case 2:
        this.reponse = plusOuMoins === 'plus' ? quantité1 : quantité2
        this.question = choice([true, false])
          ? `${prenom1} a ${plusOuMoins === 'plus' ? `$${quantité2}$` : ` $${quantité1}$`} ${objet}. Il en a $${facteur}$ fois ${plusOuMoins} ${queDevant(prenom2)}.<br>C`
          : `${prenom1} a $${facteur}$ fois ${plusOuMoins} de ${objet} ${queDevant(prenom2)}.<br>Sachant qu'il a ${plusOuMoins === 'plus' ? `$${quantité2}$` : ` $${quantité1}$`} ${objet}, c`
        this.question += `ombien de ${objet} a ${prenom2} ? `
        this.correction = `Puisque ${prenom1} a ${plusOuMoins === 'plus' ? `$${quantité2}$` : ` $${quantité1}$ `} ${objet} et qu'il en a $${facteur}$ fois ${plusOuMoins} ${queDevant(prenom2)}, ${prenom2} en a $${facteur}$ fois ${plusOuMoins === 'plus' ? 'moins' : 'plus'}.<br>
          Elle en a donc ${plusOuMoins === 'plus' ? `$${quantité2}\\div ${facteur}$` : ` $${facteur}\\times ${quantité1}$ `}, soit ${plusOuMoins === 'plus' ? `$${miseEnEvidence(quantité1)}$` : ` $${miseEnEvidence(quantité2)}$ `} ${objet}.<br>`
        if (this.correctionDetaillee) {
          this.correction += schema(
            prenom1,
            prenom2,
            plusOuMoins === 'plus' ? quantité2 : quantité1,
            plusOuMoins === 'plus' ? quantité1 : quantité2,
            facteur,
          ).display()
        }

        this.canReponseACompleter = `$\\ldots$ ${objet}`
        break

      case 3:
        this.reponse = plusOuMoins === 'plus' ? quantité2 : quantité1
        this.question = choice([true, false])
          ? `Dans un club de ${club}, il y a ${plusOuMoins === 'plus' ? `$${quantité1}$` : ` $${quantité2}$ `} ${sexe1} et
          $${facteur}$ fois ${plusOuMoins} de ${sexe2}.<br>C`
          : `Dans un club de ${club}, il y a $${facteur}$ fois ${plusOuMoins} de ${sexe2} que de ${sexe1}. <br>
          Sachant qu'il y a ${plusOuMoins === 'plus' ? `$${quantité1}$` : ` $${quantité2}$ `} ${sexe1}, c`
        this.question += `ombien y a-t-il de ${sexe2} ? `
        this.correction = `Puisqu'il y a $${facteur}$ fois ${plusOuMoins} de ${sexe2} que de ${sexe1},
          le nombre de ${sexe2} est : ${plusOuMoins === 'plus' ? `$${facteur}\\times ${quantité1}$` : ` $${quantité2}\\div ${facteur}$`}, soit ${plusOuMoins === 'plus' ? `$${miseEnEvidence(quantité2)}$` : ` $${miseEnEvidence(quantité1)}$`}.<br>`
        if (this.correctionDetaillee) {
          this.correction += schema(
            sexe1,
            sexe2,
            plusOuMoins === 'plus' ? quantité1 : quantité2,
            plusOuMoins === 'plus' ? quantité2 : quantité1,
            facteur,
          ).display()
        }
        // On écrase les options par défaut
        this.optionsChampTexte = { texteAvant: `<br>`, texteApres: ` ${sexe2}` }

        this.canReponseACompleter = `$\\ldots$ ${sexe2}`
        break
    }
  }
}
