import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Personne } from '../../lib/outils/Personne'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  simplificationDeFractionAvecEtapes,
  texFractionFromString,
} from '../../lib/outils/deprecatedFractions'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { range } from '../../lib/outils/nombres'
import { numAlpha, sp } from '../../lib/outils/outilString'
import FractionEtendue from '../../modules/FractionEtendue'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Calculer des probabilités dans une expérience aléatoire à une épreuve'
export const interactifReady = true

/**
 * Calculs de probabilités sur une expérience aléatoire à une épreuve.
 * @author Jean-claude Lhote
 * Ajout de la partie vocabulaire (this.sup !== 1) par Guillaume Valmont le 03/04/2022
 * Remplacement des this.sup par des this.niveau par Guillaume Valmont le 07/05/2022
 */

export const uuid = '69e1f'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

export default class FonctionsProbabilite6e extends Exercice {
  niveau: number
  styleCorrection: string
  constructor() {
    super()
    this.nbQuestions = 4

    this.spacing = context.isHtml ? 2 : 1
    this.spacingCorr = context.isHtml ? 2 : 1
    this.niveau = 6
    this.styleCorrection = 'college'
  }

  nouvelleVersion() {
    const listeIndexDisponibles = [0, 1, 2, 3, 4, 5, 6]
    const listeIndex = combinaisonListes(
      listeIndexDisponibles,
      this.nbQuestions,
    )
    const listeDeLieuxChoses = [
      ['le frigo', 'yaourt', 'yaourts'],
      ['le frigo', 'dessert lacté', 'desserts lactés'],
      ['une urne', 'boule', 'boules'],
      ['une urne', 'jeton', 'jetons'],
      ['un paquet de bonbons', 'nounours', 'nounours'],
      ['un tiroir de la commode', 't-shirt', 't-shirts'],
      ['un tas de jetons de poker', 'jeton', 'jetons'],
    ]
    const qualites: string[][] = [[]]
    qualites[0] = [
      'à la fraise',
      'à la vanille',
      "à l'abricot",
      "à l'ananas",
      'à la cerise',
    ]
    qualites[1] = [
      'au chocolat',
      'à la vanille',
      'au café',
      'à la pistache',
      'au caramel',
    ]
    qualites[2] = ['rouges', 'vertes', 'bleues', 'noires', 'blanches']
    qualites[3] = ['oranges', 'cyans', 'roses', 'jaunes', 'violets']
    qualites[4] = ['rouges', 'verts', 'bleus', 'noirs', 'jaunes']
    qualites[5] = ['rouges', 'verts', 'bleus', 'noirs', 'blancs']
    qualites[6] = ['rouges', 'verts', 'bleus', 'noirs', 'jaunes']
    const natureDeLIssue = [
      'le parfum',
      'le parfum',
      'la couleur',
      'la couleur',
      'la couleur',
      'la couleur',
      'la couleur',
    ]
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      const index1 = listeIndex[i]
      let article, pronom, defini
      if (index1 === 2) {
        article = 'une'
        pronom = 'elles'
        defini = 'si elle'
      } else {
        article = 'un'
        pronom = 'eux'
        defini = "s'il"
      }
      const personne = new Personne()
      const quidam = personne.prenom
      const lieu = listeDeLieuxChoses[index1][0]
      const objet = listeDeLieuxChoses[index1][1]
      const objets = listeDeLieuxChoses[index1][2]
      const n = []
      n[0] = randint(2, 5)
      n[1] = randint(1, 6) + 1
      n[2] = randint(1, 3) * 2
      n[3] = randint(1, 4) + 2
      n[4] = randint(2, 5)

      const somme = n[0] + n[1] + n[2] + n[3] + n[4]
      const m = randint(0, 4)
      const p = randint(0, 4, [m])
      const q = randint(0, 4, [p, m])
      const indexEvenementContraire = range(4, [m, p])

      texte = `Dans ${lieu}, il y a ${somme} ${objets}. ${n[0]} sont ${qualites[index1][0]}, ${n[1]} sont ${qualites[index1][1]}, ${n[2]} sont ${qualites[index1][2]}, ${n[3]} sont ${qualites[index1][3]} et ${n[4]} sont ${qualites[index1][4]}.<br> `
      texte += `${quidam} choisit au hasard l'${article} d'entre ${pronom}.`
      if (this.niveau > 4) {
        texte += `<br> ${numAlpha(0)} Quelle est la probabilité que son choix tombe sur l'${article} des ${objets} ${qualites[index1][m]} ? `
        texte +=
          ajouteChampTexteMathLive(
            this,
            4 * i,
            KeyboardType.clavierDeBaseAvecFraction,
          ) + '<br>'
        texte +=
          numAlpha(1) +
          ` Quelle est la probabilité que son choix tombe sur l'${article} des ${objets} ${qualites[index1][p]} ?`
        texte +=
          ajouteChampTexteMathLive(
            this,
            4 * i + 1,
            KeyboardType.clavierDeBaseAvecFraction,
          ) + '<br>'
        texte +=
          numAlpha(2) +
          ` Quelle est la probabilité que son choix ne tombe pas sur l'${article} des ${objets} ${qualites[index1][q]} ?`
        texte +=
          ajouteChampTexteMathLive(
            this,
            4 * i + 2,
            KeyboardType.clavierDeBaseAvecFraction,
          ) + '<br>'
        texte +=
          numAlpha(3) +
          ` Quelle est la probabilité que son choix tombe sur l'${article} des ${objets} ${qualites[index1][m]} ou ${qualites[index1][p]} ?`
        texte +=
          ajouteChampTexteMathLive(
            this,
            4 * i + 3,
            KeyboardType.clavierDeBaseAvecFraction,
          ) + '<br>'
        texteCorr =
          this.niveau === 5
            ? "On est dans une situation d'équiprobabilité donc la probabilité est donnée par le quotient du nombre de cas favorables par le nombre de cas au total.<br>"
            : ''
        texteCorr +=
          numAlpha(0) +
          ` Il y a ${n[m]} ${objets} ${qualites[index1][m]} et il y a ${somme} ${objets} possibles.<br>
          La probabilité que son choix tombe sur l'${article} des ${objets} ${qualites[index1][m]} est `
        let reponseValue = new FractionEtendue(n[m], somme).texFSD
        texteCorr +=
          this.niveau === 5
            ? `: $${new FractionEtendue(n[m], somme).estIrreductible ? miseEnEvidence(reponseValue) : reponseValue}${simplificationDeFractionAvecEtapes(n[m], somme, { couleur1: bleuMathalea, couleur2: orangeMathalea })}$.<br>`
            : `donc de ${n[m]} chances sur ${somme}, ce qui s'écrit aussi : $${miseEnEvidence(reponseValue)}$.<br>`
        handleAnswers(this, 4 * i, {
          reponse: { value: reponseValue },
        })
        texteCorr +=
          numAlpha(1) +
          ` Il y a ${n[p]} ${objets} ${qualites[index1][p]} et il y a ${somme} ${objets} possibles.<br>
          La probabilité que son choix tombe sur l'${article} des ${objets} ${qualites[index1][p]} est `
        reponseValue = new FractionEtendue(n[p], somme).texFSD
        texteCorr +=
          this.niveau === 5
            ? `: $${new FractionEtendue(n[p], somme).estIrreductible ? miseEnEvidence(reponseValue) : reponseValue}${simplificationDeFractionAvecEtapes(n[p], somme, { couleur1: bleuMathalea, couleur2: orangeMathalea })}$.<br>`
            : `donc de ${n[p]} chances sur ${somme}, ce qui s'écrit aussi : $${miseEnEvidence(reponseValue)}$.<br>`
        handleAnswers(this, 4 * i + 1, {
          reponse: { value: reponseValue },
        })
        texteCorr +=
          numAlpha(2) +
          ` Il y a ${n[q]} ${objets} ${qualites[index1][q]}, donc il y a ${somme} $-$ ${n[q]} $=$ ${somme - n[q]} autres ${objets} et il y a ${somme} ${objets} possibles.<br>
          La probabilité que son choix ne tombe pas sur l'${article} des ${objets} ${qualites[index1][q]} est `
        reponseValue = new FractionEtendue(somme - n[q], somme).texFSD
        texteCorr +=
          this.niveau === 5
            ? `: $${new FractionEtendue(somme - n[q], somme).estIrreductible ? miseEnEvidence(reponseValue) : reponseValue}${simplificationDeFractionAvecEtapes(somme - n[q], somme, { couleur1: bleuMathalea, couleur2: orangeMathalea })}$.<br>`
            : `donc de ${somme - n[q]} chances sur ${somme}, ce qui s'écrit aussi : $${miseEnEvidence(reponseValue)}$.<br>`
        handleAnswers(this, 4 * i + 2, {
          reponse: { value: reponseValue },
        })
        reponseValue = new FractionEtendue(n[p] + n[m], somme).texFSD
        texteCorr +=
          numAlpha(3) +
          (this.styleCorrection === 'college'
            ? `Il y a ${n[m]} ${objets} ${qualites[index1][m]} et ${n[p]} ${objets} ${qualites[index1][p]}, soit ${n[p] + n[m]} ${objets} ${qualites[index1][m]} ou ${qualites[index1][p]} et il y a ${somme} ${objets} possibles.<br>
            La probabilité que son choix tombe sur l'${article} des ${objets} ${qualites[index1][m]} ou ${qualites[index1][p]} est ` +
              (this.niveau === 5
                ? `: $${new FractionEtendue(n[p] + n[m], somme).estIrreductible ? miseEnEvidence(reponseValue) : reponseValue}${simplificationDeFractionAvecEtapes(n[p] + n[m], somme, { couleur1: bleuMathalea, couleur2: orangeMathalea })}$.<br>`
                : `donc de ${n[p] + n[m]} chances sur ${somme}, ce qui s'écrit aussi : $${miseEnEvidence(reponseValue)}$.<br>`)
            : ` La probabilité d'un événement est la somme des probabilités des issues qui le composent. Donc la probabilité que son choix tombe sur l'${article} des ${objets} ${qualites[index1][m]} ou ${qualites[index1][p]} est :<br> $${texFractionFromString(n[m], somme)}+${texFractionFromString(n[p], somme)}=${texFractionFromString(n[p] + n[m], somme)}${simplificationDeFractionAvecEtapes(n[p] + n[m], somme, { couleur1: bleuMathalea, couleur2: orangeMathalea })}$.<br>`)
        handleAnswers(this, 4 * i + 3, {
          reponse: { value: reponseValue },
        })
      } else {
        texte += ` ${personne.Pronom} regarde ${natureDeLIssue[index1]}.<br>`

        texte +=
          numAlpha(0) +
          "Est-ce que c'est une expérience aléatoire ? Pourquoi ?<br>"
        texteCorr =
          numAlpha(0) +
          ` On sait qu'on tombera sur ${article} ${objet} mais on ne sait pas ${defini} sera ${singulier(qualites[index1][0], index1)}, ${singulier(qualites[index1][1], index1)}, ${singulier(qualites[index1][2], index1)}, ${singulier(qualites[index1][3], index1)} ou ${singulier(qualites[index1][4], index1)}.<br>On ne peut pas prévoir à l'avance le résultat, c'est donc une expérience aléatoire.<br>`
        texte += numAlpha(1) + ' Quelles sont les issues ?<br>'
        const issues = qualites[index1]
          .map((q, i) => `- ${texteEnCouleurEtGras(singulier(q, index1))}`)
          .join(' ;<br>\n')
        texteCorr += numAlpha(1) + `Les issues sont :<br>${issues}.<br>`
        texte +=
          numAlpha(2) +
          ` Quelles issues réalisent l'événement «${sp(1)}Tomber sur l'${article} des ${objets} ${qualites[index1][m]} ou ${qualites[index1][p]}${sp(1)}» ?<br>`
        texteCorr +=
          numAlpha(2) +
          `Les issues qui réalisent l'événement «${sp(1)}Tomber sur l'${article} des ${objets} ${qualites[index1][m]} ou ${qualites[index1][p]}${sp(1)}» sont :<br>
        - ${texteEnCouleurEtGras(singulier(qualites[index1][m], index1))} ;<br>
        - ${texteEnCouleurEtGras(singulier(qualites[index1][p], index1))}.<br>`
        if (this.niveau > 2) {
          texte +=
            numAlpha(3) +
            ` Quel est l'événement contraire de «${sp(1)}Tomber sur l'${article} des ${objets} ${qualites[index1][m]} ou ${qualites[index1][p]}${sp(1)}» ?<br>`
          texteCorr +=
            numAlpha(3) +
            ` L'événement contraire de «${sp(1)}Tomber sur l'${article} des ${objets} ${qualites[index1][m]} ou ${qualites[index1][p]}${sp(1)}» est l'événement «${texteEnCouleurEtGras(`${sp(1)}Tomber sur l'${article} des ${objets} ${qualites[index1][indexEvenementContraire[0]]}, ${qualites[index1][indexEvenementContraire[1]]} ou ${qualites[index1][indexEvenementContraire[2]]}${sp(1)}`)}».`
        } else {
          texte +=
            numAlpha(3) +
            ` Quelles issues ne réalisent pas l'événement «${sp(1)}Tomber sur l'${article} des ${objets} ${qualites[index1][q]} ou ${qualites[index1][m]}${sp(1)}» ?<br>`
          texteCorr +=
            numAlpha(3) +
            ` Les issues qui ne réalisent pas l'événement «${sp(1)}Tomber sur l'${article} des ${objets} ${qualites[index1][m]} ou ${qualites[index1][p]}${sp(1)}» sont :<br>
          - ${singulier(qualites[index1][indexEvenementContraire[0]], index1)} ;<br>
          - ${singulier(qualites[index1][indexEvenementContraire[1]], index1)} ;<br>
          - ${singulier(qualites[index1][indexEvenementContraire[2]], index1)}.`
        }
      }
      if (this.questionJamaisPosee(i, n[0], n[1], n[2], n[3], n[4], m, p, q)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // Espacement de 2 em entre chaque questions.
  }
}

function singulier(qualite: string, index1: number) {
  if (index1 > 1) {
    return qualite.slice(0, -1)
  } else {
    return qualite
  }
}
