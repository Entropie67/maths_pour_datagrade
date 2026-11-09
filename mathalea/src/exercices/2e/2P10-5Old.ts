import { createList } from '../../lib/format/lists'
import { choice } from '../../lib/outils/arrayOutils'
import {
  simplificationDeFractionAvecEtapes,
  texFractionFromString,
  texFractionReduite,
} from '../../lib/outils/deprecatedFractions'
import { deDevant, numAlpha, queDevant, sp } from '../../lib/outils/outilString'
import { prenomF, prenomM } from '../../lib/outils/Personne'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'

import { handleAnswers } from '../../lib/interactif/gestionInteractif' // fonction qui va préparer l'analyse de la saisie
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive' // fonctions de mise en place des éléments interactifs

import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { fraction } from '../../modules/fractions'
import Exercice from '../Exercice'
export const dateDeModifImportante = '20/06/2024'

export const titre =
  'Résoudre un problème basé sur une expérience aléatoire à deux épreuves'
export const interactifReady = true

export const uuid = 'e1938'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * Calculs de probabilités sur une expérience aléatoire à deux épreuves
 * @author Jean-claude Lhote
 */
export default class FonctionsProbabilite2 extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de questions : ',
      'Nombres séparés par des tirets :\n1 : Yaourts\n2 : Cartes\n3 : Chaussettes\n4 : Dé\n5 : Mélange',
    ]
    this.nbQuestions = 2

    this.spacing = 2
    this.spacingCorr = context.isHtml ? 3 : 2
    this.sup = 1
  }

  nouvelleVersion() {
    // const indexDisponibles = [0, 1, 2, 3]
    // const listeIndex = combinaisonListes(indexDisponibles, this.nbQuestions)
    let listeIndex = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
    }).map(Number)
    if (this.interactif) {
      // Les questions de type 4 sont trop compliqués à rendre interactives: on les passe
      listeIndex = listeIndex.map((i) => (i === 4 ? randint(1, 3) : i))
    }
    const qualites: string[][] = []
    const Initiale = []
    const Couleurs = [
      'red',
      'green',
      bleuMathalea,
      'gray',
      'brown',
      'orange',
      'magenta',
      'pink',
      'black',
      'lightgray',
    ]
    qualites[0] = [
      'à la fraise',
      'à la vanille',
      "à l'abricot",
      'à la cerise',
      'à la banane',
    ]
    qualites[1] = ['trèfle', 'carreau', 'cœur', 'pique']
    qualites[2] = ['rouges', 'vertes', 'bleues', 'noires', 'blanches']
    qualites[3] = ['gris', 'cyans', 'roses', 'jaunes', 'violets']
    qualites[4] = ['rouges', 'verts', 'bleus', 'noirs', 'jaunes']
    qualites[5] = ['rouges', 'verts', 'bleus', 'noirs', 'blancs']
    qualites[6] = ['rouges', 'verts', 'bleus', 'noirs', 'jaunes']

    for (
      let i = 0, cpt = 0, iInteractif = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let quidame = prenomF()
      let quidam = prenomM()
      let p: number
      let q: number
      let r: number
      const n: number[] = []
      const m: number[] = []

      let somme1: number
      let somme2: number
      let texte = ''
      let texteCorr = ''
      switch (listeIndex[i] - 1) {
        case 0: {
          Initiale[0] = 'F'
          Initiale[1] = 'V'
          Initiale[2] = 'A'
          Initiale[3] = 'C'
          Initiale[4] = 'B'
          p = randint(0, 4)
          q = randint(0, 4, [p])
          r = randint(0, 4, [p, q])
          n[p] = randint(2, 5)
          n[q] = randint(1, 6) + 2
          n[r] = randint(1, 3) * 2

          somme1 = n[p] + n[q] + n[r]

          texte = `Dans le frigo, il y a $${somme1}$ yaourts. $${n[p]}$ sont ${qualites[0][p]}, $${n[q]}$ sont ${qualites[0][q]} et $${n[r]}$ sont ${qualites[0][r]}.<br>` //  ${n[3]} sont ${qualites[index1][3]} et ${n[4]} sont ${qualites[index1][4]}.<br> `;
          texte += `${quidame} en choisit un au hasard. Son frère ${quidam} en choisit un au hasard à son tour.<br>`
          texte += createList({
            items: [
              `Combien d'issues possède cette expérience aléatoire ?${
                this.interactif
                  ? ' ' +
                    ajouteChampTexteMathLive(
                      this,
                      iInteractif,
                      KeyboardType.clavierNumbers,
                    )
                  : ''
              } Donner un exemple d'issue.${
                this.interactif
                  ? ' ' +
                    ajouteChampTexteMathLive(
                      this,
                      iInteractif + 1,
                      KeyboardType.alphanumeric,
                      {
                        texteAvant: `<br>On donnera la réponse sous la forme $(X,Y)$ avec $X,Y$ deux lettres parmi $${Initiale[p]}$, $${Initiale[q]}$ et $${Initiale[r]}$ : `,
                      },
                    )
                  : ''
              }`,
              "Est-ce une expérience en situation d'équiprobabilité ?" +
                (!this.interactif
                  ? ' Justifier.'
                  : choixDeroulant(this, iInteractif + 2, {
                      choices: [
                        {
                          label: 'Choisir une des réponses suivantes',
                          value: '',
                        },
                        { label: 'oui', value: 'oui' },
                        { label: 'non', value: 'non' },
                        { label: 'je sais pas', value: 'je sais pas' },
                      ],
                    })),
              `Calculer la probabilité ${queDevant(quidame)} et ${quidam} aient choisi tous les deux un yaourt ${qualites[0][p]}.` +
                (this.interactif
                  ? ajouteChampTexteMathLive(
                      this,
                      iInteractif + 3,
                      KeyboardType.clavierDeBaseAvecFraction,
                    )
                  : ''),
              " Calculer la probabilité qu'ils aient choisi des yaourts aux parfums identiques." +
                (this.interactif
                  ? ajouteChampTexteMathLive(
                      this,
                      iInteractif + 4,
                      KeyboardType.clavierDeBaseAvecFraction,
                    )
                  : ''),
              " Calculer la probabilité qu'ils aient choisi des yaourts aux parfums différents." +
                (this.interactif
                  ? ajouteChampTexteMathLive(
                      this,
                      iInteractif + 5,
                      KeyboardType.clavierDeBaseAvecFraction,
                    )
                  : ''),
            ],
            style: 'alpha',
          })
          texteCorr = ''
          // Question a
          texteCorr +=
            numAlpha(0) +
            ` ${quidame} peut avoir choisi un yaourt ${qualites[0][p]}, ${qualites[0][q]} ou ${qualites[0][r]}. Une fois qu'elle a choisi, et comme il y a au moins $2$ yaourts de chaque sorte, ${quidam} a les mêmes $3$ possibilités. Il y a donc $3\\times3=9$ issues possibles.<br>`
          texteCorr += `Par exemple : ${quidame} a pris un yaourt ${qualites[0][p]} et ${quidam} un yaourt ${qualites[0][q]}. Ce qu'on peut noter (${Initiale[p]},${Initiale[q]}).<br>`
          texteCorr += 'Les $9$ issues sont : '
          let issues = ''
          for (const j of [p, q, r]) {
            for (const k of [p, q, r]) {
              issues += `(${Initiale[j]},${Initiale[k]}) `
            }
          }
          texteCorr += issues
          texteCorr += '.<br>'
          // Question b
          if (n[0] === n[1] && n[1] === n[2]) {
            texteCorr +=
              numAlpha(1) +
              ` Comme le nombre de yaourts de chaque sorte est le même, alors ${quidame} a la même probabilité de choisir n'importe quel parfum, mais ensuite son frère aura un yaourt de moins de l'un des parfums. Il est donc moins probable qu'il choisisse le même parfum que sa sœur que l'un des deux autres parfums.<br>`
            texteCorr += `l'issue (${Initiale[p]},${Initiale[p]}) est donc moins probable que l'issue (${Initiale[p]},${Initiale[q]}). Ce n'est donc pas une situation d'équiprobabilité.`
          } else {
            texteCorr +=
              numAlpha(1) +
              ` Comme le nombre de yaourts est différent d'un parfum à l'autre, ${quidame} n'a pas la même probabilité de choisir n'importe quel parfum. On en déduit qu'il est impossible que les issues (${Initiale[p]},${Initiale[p]}), (${Initiale[q]},${Initiale[q]}) et (${Initiale[r]},${Initiale[r]}) aient la même probabilité.<br>`
          }
          // Question c
          const probaTirage1 = fraction(n[p], somme1)
          const probaTirage2 = fraction(n[p] - 1, somme1 - 1)
          const probaMemeSaveurParticuliere =
            probaTirage1.produitFraction(probaTirage2)

          texteCorr +=
            numAlpha(2) +
            ` Il y a $${n[p]}$ yaourts ${qualites[0][p]}, et $${somme1}$ yaourts en tout, la probabilité ${queDevant(quidame)} choisisse un yaourt ${qualites[0][p]} est : $${probaTirage1.texFSD}${probaTirage1.texSimplificationAvecEtapes()}$.<br>`
          texteCorr += `Ensuite, il reste $${n[p] - 1}$ yaourts ${qualites[0][p]} pour ${quidam} sur un total de $${somme1 - 1}$ yaourts.<br>`
          texteCorr += `La probabilité qu'il choisisse à son tour et dans ces conditions ce parfum est : $${probaTirage2.texFSD}${probaTirage2.texSimplificationAvecEtapes()}$.<br>`
          texteCorr += `La probabilité de l'issue (${Initiale[p]},${Initiale[p]}) est le produit de ces deux probabilités, donc : $${probaTirage1.texFSD}\\times${probaTirage2.texFSD}${probaMemeSaveurParticuliere.texSimplificationAvecEtapes()}$.<br>`
          // Question d
          const tirages = []
          for (const x of [p, q, r]) {
            const tirage1 = fraction(n[x], somme1)
            const tirage2 = fraction(n[x] - 1, somme1 - 1)
            tirages.push([tirage1, tirage2])
          }
          const probas = tirages.map(([t1, t2]) => t1.produitFraction(t2))
          const probaMemeSaveur = fraction(0, 1).sommeFractions(...probas)
          texteCorr +=
            numAlpha(3) +
            ` Les probabilités des issues (${Initiale[q]},${Initiale[q]}) et (${Initiale[r]},${Initiale[r]}) peuvent être respectivement calculées de la même façon qu'à la question c) :<br>`
          texteCorr += `$${tirages[1][0].texFSD}\\times${tirages[1][1].texFSD}=${probas[1].texFSD}$,<br>`
          texteCorr += `$${tirages[2][0].texFSD}\\times${tirages[2][1].texFSD}=${probas[2].texFSD}$.<br>`
          texteCorr += `La probabilité qu'ils choisissent le même parfum est la somme des probabilités des issues (${Initiale[p]},${Initiale[p]}), (${Initiale[q]},${Initiale[q]}) et (${Initiale[r]},${Initiale[r]}), soit :<br>`
          texteCorr += `$${probas.map((p) => p.texFSD).join('+')}${probaMemeSaveur.texSimplificationAvecEtapes()}$.<br>`
          // Question e
          texteCorr +=
            numAlpha(4) +
            " Choisir des parfums différents est l'événement contraire de l'événement dont on a calculé la probabilité à la question d).<br>"
          const probaContraire = fraction(1, 1).sommeFraction(
            probaMemeSaveur.oppose(),
          )

          const num = probaMemeSaveur.num
          const den = probaMemeSaveur.den
          texteCorr += `La probabilité de cet événement est donc : $1-${probaMemeSaveur.texFraction}=${fraction(den, den).texFraction}-${probaMemeSaveur.texFraction}=${fraction(den - num, den).texFraction}${probaContraire.texSimplificationAvecEtapes()}$.`
          // question a
          handleAnswers(this, iInteractif, { reponse: { value: 9 } })
          handleAnswers(this, iInteractif + 1, {
            reponse: {
              value: issues.split(' '),
              options: { texteSansCasse: true },
            },
          })
          // questions b, c, d, e
          handleAnswers(this, iInteractif + 2, {
            reponse: { value: 'non', options: { texteSansCasse: true } },
          })
          handleAnswers(this, iInteractif + 3, {
            reponse: {
              value: probaMemeSaveurParticuliere.texFraction,
              options: { fractionEgale: true },
            },
          })
          handleAnswers(this, iInteractif + 4, {
            reponse: {
              value: probaMemeSaveur.texFraction,
              options: { fractionEgale: true },
            },
          })
          handleAnswers(this, iInteractif + 5, {
            reponse: {
              value: probaContraire.texFraction,
              options: { fractionEgale: true },
            },
          })
          break
        }
        case 1: {
          p = randint(0, 3)
          if (randint(0, 1) === 0) {
            q = 32
          } else {
            q = 52
          }
          r = Math.floor(q / 33)
          Initiale[0] = choice([
            'sept',
            'huit',
            'neuf',
            'dix',
            'valet',
            'roi',
            'as',
          ])
          Initiale[1] = choice([
            'deux',
            'trois',
            'quatre',
            'cinq',
            'six',
            'sept',
            'huit',
            'neuf',
            'dix',
            'valet',
            'roi',
            'as',
          ])
          texte = `On considère l'expérience consistant à tirer deux cartes dans un jeu de $${q}$ cartes.<br>`
          texte +=
            'Partie 1 : On effectue le tirage de la deuxième carte après remise de la première dans le jeu.<br>'
          texte += createList({
            items: [
              'Quelle est la probabilité de tirer $2$ cartes de la même couleur (Rouge/Rouge ou Noire/Noire) ?' +
                (this.interactif
                  ? ajouteChampTexteMathLive(
                      this,
                      iInteractif,
                      KeyboardType.clavierDeBaseAvecFraction,
                    )
                  : ''),
              ` Quelle est la probabilité de tirer $2$ ${Initiale[r]}${Initiale[r] === 'valet' || Initiale[r] === 'roi' ? 's' : ''} ?` +
                (this.interactif
                  ? ajouteChampTexteMathLive(
                      this,
                      iInteractif + 1,
                      KeyboardType.clavierDeBaseAvecFraction,
                    )
                  : ''),
              ` Quelle est la probabilité de tirer $2$ cartes de ${qualites[1][p]} ?` +
                (this.interactif
                  ? ajouteChampTexteMathLive(
                      this,
                      iInteractif + 2,
                      KeyboardType.clavierDeBaseAvecFraction,
                    )
                  : ''),
            ],
            style: 'alpha',
          })
          texte +=
            'Partie 2 : On effectue le tirage de la deuxième carte sans remise de la première dans le jeu.<br>'
          if (!this.interactif) {
            texte +=
              '    Reprendre les $3$ questions de la partie 1 dans cette nouvelle expérience.'
          } else {
            texte += createList({
              items: [
                'Quelle est la probabilité de tirer $2$ cartes de la même couleur (Rouge/Rouge ou Noire/Noire) ?' +
                  (this.interactif
                    ? ajouteChampTexteMathLive(
                        this,
                        iInteractif + 3,
                        KeyboardType.clavierDeBaseAvecFraction,
                      )
                    : ''),
                ` Quelle est la probabilité de tirer $2$ ${Initiale[r]}${Initiale[r] === 'valet' || Initiale[r] === 'roi' ? 's' : ''} ?` +
                  (this.interactif
                    ? ajouteChampTexteMathLive(
                        this,
                        iInteractif + 4,
                        KeyboardType.clavierDeBaseAvecFraction,
                      )
                    : ''),
                ` Quelle est la probabilité de tirer $2$ cartes de ${qualites[1][p]} ?` +
                  (this.interactif
                    ? ajouteChampTexteMathLive(
                        this,
                        iInteractif + 5,
                        KeyboardType.clavierDeBaseAvecFraction,
                      )
                    : ''),
              ],
              style: 'alpha',
            })
          }

          // PARTIE 1

          texteCorr = 'Partie 1.<br>    '
          // Question a)
          texteCorr +=
            numAlpha(0) +
            ` On ne s'intéresse ici qu'au tirage de la deuxième carte. En effet, pour réaliser l'événement, il faudra que cette carte soit de la même couleur que la première. Il y a deux couleurs (rouge et noire) et le nombre de cartes rouges est le même que le nombre de cartes noires : $${q / 2}$.<br>`
          texteCorr += `    La probabilité que la deuxième carte soit de la même couleur que la première est donc : $${fraction(q / 2, q).texFraction}=${fraction(1, 2).texFraction}$.<br>`
          // Question b)
          const quatreCartes = fraction(4, q)
          texteCorr += numAlpha(1) + ` Il y a $4$ ${Initiale[r]}`
          if (Initiale[r] === 'valet' || Initiale[r] === 'roi') {
            texteCorr += 's'
          }
          texteCorr += ` dans le jeu sur $${q}$ cartes possibles. La probabilité de tirer un ${Initiale[r]} est donc de $${quatreCartes.texFraction}=${quatreCartes.texFractionSimplifiee}$.<br>`
          texteCorr += `    Comme la deuxième carte est tirée dans le jeu complet (après remise de la première), la probabilité de tirer un ${Initiale[r]} est la même pour cette carte.<br>`
          texteCorr += `    La probabilité de tirer $2$ ${Initiale[r]}`
          if (Initiale[r] === 'valet' || Initiale[r] === 'roi') {
            texteCorr += 's'
          }
          texteCorr += ` est donc : $${quatreCartes.texFractionSimplifiee}\\times${quatreCartes.texFractionSimplifiee}=${quatreCartes.produitFraction(quatreCartes).texFractionSimplifiee}$.<br>`
          // Question c)
          const quart = fraction(1, 4)
          texteCorr +=
            numAlpha(2) +
            ` Il y a $${q / 4}$ cartes de ${qualites[1][p]} dans le jeu sur $${q}$ cartes possibles. La probabilité de tirer un ${qualites[1][p]} est donc de $${fraction(q / 4, q).texFraction}=${quart.texFraction}$.<br>`
          texteCorr += `    Comme la deuxième carte est tirée dans le jeu complet (après remise de la première) la probabilité de tirer un ${qualites[1][p]} est la même pour cette carte.<br>`
          texteCorr += `    La probabilité de tirer $2$ ${qualites[1][p]}${qualites[1][p] === 'carreau' ? 'x' : 's'} est donc $${quart.texFraction}\\times${quart.texFraction}=${quart.produitFraction(quart).texFraction}$.<br>`

          // PARTIE 2

          texteCorr += 'Partie 2.<br>'
          // Question a)
          texteCorr +=
            numAlpha(0) +
            ` On ne s'intéresse ici qu'au tirage de la deuxième carte. En effet, pour réaliser l'événement, il faudra que cette carte soit de la même couleur que la première. Il y a maintenant une carte en moins dans la couleur désirée, soit $${q / 2 - 1}$, et il y a une carte en moins dans le jeu, soit $${q - 1}$.<br>`
          const memeCouleur = fraction(q / 2 - 1, q - 1)
          texteCorr += `    La probabilité que la deuxième carte soit de la même couleur que la première est donc : $${memeCouleur.texFraction}$.<br>`
          // Question b)
          const troisCartes = fraction(3, q - 1)
          texteCorr += numAlpha(1) + ` Il y a $4$ ${Initiale[r]}`
          if (Initiale[r] === 'valet' || Initiale[r] === 'roi') {
            texteCorr += 's'
          }
          texteCorr += ` dans le jeu sur $${q}$ cartes possibles. La probabilité de tirer un ${Initiale[r]} est donc de $${quatreCartes.texFraction}=${quatreCartes.texFractionSimplifiee}$.<br>`
          texteCorr += `    Pour que l'événement se réalise la deuxième carte est tirée dans les $${q - 1}$ cartes restantes dans lesquelles il manque un ${Initiale[r]}.<br>`
          texteCorr += `    La probabilité de tirer un deuxième ${Initiale[r]} est donc : $${troisCartes.texFraction}$.`
          if (q === 52) {
            texteCorr += `$=${fraction(1, 17).texFraction}$.`
          }
          texteCorr += `<br> La probabilité de tirer $2$ ${Initiale[r]}`
          if (Initiale[r] === 'valet' || Initiale[r] === 'roi') {
            texteCorr += 's'
          }
          texteCorr += ` est donc : $${quatreCartes.texFractionSimplifiee}\\times${troisCartes.texFractionSimplifiee}=${quatreCartes.produitFraction(troisCartes).texFractionSimplifiee}$.<br>`
          // Question c)
          texteCorr +=
            numAlpha(2) +
            ` Il y a $${q / 4}$ cartes de ${qualites[1][p]} dans le jeu sur $${q}$ cartes possibles. La probabilité de tirer un ${qualites[1][p]} est donc de $${fraction(q / 4, q).texFraction}=${quart.texFraction}$.<br>`
          texteCorr += `    Pour que l'événement se réalise, la deuxième carte est tirée dans les $${q - 1}$ cartes restantes dans lesquelles il manque un ${qualites[1][p]}.<br>`
          texteCorr += `    La probabilité de tirer un deuxième ${qualites[1][p]} est donc : $${fraction(q / 4 - 1, q - 1).texFraction}$.`
          if (q === 52) {
            texteCorr += `$=${fraction(4, 17).texFraction}$<br>La probabilité de tirer $2$ ${qualites[1][p]}${qualites[1][p] === 'carreau' ? 'x' : 's'} est donc $${fraction(1, 4).texFraction}\\times${fraction(4, 17).texFraction}=${fraction(1, 17).texFraction}$.`
          } else {
            texteCorr += `<br>La probabilité de tirer $2$ ${qualites[1][p]}${qualites[1][p] === 'carreau' ? 'x' : 's'} est donc $${quart.texFraction}\\times${fraction(7, 31).texFractionSimplifiee}=${fraction(7, 124).texFraction}$.`
          }
          // Partie 1
          handleAnswers(this, iInteractif + 0, {
            reponse: {
              value: fraction(1, 2).texFraction,
              options: { fractionEgale: true },
            },
          })
          handleAnswers(this, iInteractif + 1, {
            reponse: {
              value: quatreCartes.produitFraction(quatreCartes).texFraction,
              options: { fractionEgale: true },
            },
          })
          handleAnswers(this, iInteractif + 2, {
            reponse: {
              value: quart.produitFraction(quart).texFraction,
              options: { fractionEgale: true },
            },
          })
          // Partie 2
          handleAnswers(this, iInteractif + 3, {
            reponse: {
              value: memeCouleur.texFraction,
              options: { fractionEgale: true },
            },
          })
          handleAnswers(this, iInteractif + 4, {
            reponse: {
              value:
                quatreCartes.produitFraction(troisCartes).texFractionSimplifiee,
              options: { fractionEgale: true },
            },
          })
          handleAnswers(this, iInteractif + 5, {
            reponse: {
              value: fraction(7, 124).texFraction,
              options: { fractionEgale: true },
            },
          })
          break
        }
        case 2:
          {
            n[0] = randint(2, 5)
            m[0] = randint(2, 5)
            n[1] = randint(1, 6) + 1
            m[1] = randint(1, 6) + 1
            n[2] = randint(1, 3) * 2
            m[2] = randint(1, 3) * 2
            somme1 = n[0] + n[1] + n[2]
            somme2 = m[0] + m[1] + m[2]
            r = randint(0, 2)
            p = randint(0, 2, [r])
            q = randint(0, 2, [p, r])
            texte = `Dans sa commode, ${quidam} a mis dans le premier tiroir des paires de chaussettes. Il y a `
            for (let j = 0; j < 3; j++) {
              texte += `$${n[j]}$ paires de chaussettes ${qualites[2][j]}${j === 2 ? '.<br>' : ', '}`
            }
            // texte += `${n[3]} paires de chaussettes ${qualites[2][3]} et ${n[4]} paires de chaussettes ${qualites[2][4]}.<br>`
            texte += `Dans le deuxième tiroir, ${quidam} a mis des T-shirt. Il y a `
            for (let j = 0; j < 3; j++) {
              texte += `$${m[j]}$ T-shirt ${qualites[5][j]}${j === 2 ? '.<br>' : ', '}`
            }
            // texte += `${m[3]} T-shirt ${qualites[5][3]} et ${m[4]} T-shirt ${qualites[5][4]}.<br>`
            texte += `Un matin, il y a une panne de courant et ${quidam} prend au hasard une paire de chaussettes dans le premier tiroir et un T-shirt dans le deuxième.<br>`
            texte += createList({
              items: [
                ` Quelle est la probabilité ${queDevant(quidam)} ait choisi des chaussettes et un T-shirt ${qualites[5][r]} ?` +
                  (this.interactif
                    ? ajouteChampTexteMathLive(
                        this,
                        iInteractif + 0,
                        KeyboardType.clavierDeBaseAvecFraction,
                      )
                    : ''),
                ` Quelle est la probabilité ${queDevant(quidam)} ait choisi des chaussettes et un T-shirt de la même couleur ?` +
                  (this.interactif
                    ? ajouteChampTexteMathLive(
                        this,
                        iInteractif + 1,
                        KeyboardType.clavierDeBaseAvecFraction,
                      )
                    : ''),
                ` Quelle est la probabilité ${queDevant(quidam)} ait choisi des chaussettes et un T-shirt de couleurs différentes ?` +
                  (this.interactif
                    ? ajouteChampTexteMathLive(
                        this,
                        iInteractif + 2,
                        KeyboardType.clavierDeBaseAvecFraction,
                      )
                    : ''),
              ],
              style: 'alpha',
            })
            // Question a)
            let fra1 = fraction(n[r], somme1)
            let fra2 = fraction(m[r], somme2)
            const produit1 = fra1.produitFraction(fra2)
            texteCorr =
              numAlpha(0) +
              ` Il y a $${n[r]}$ paires de chaussettes ${qualites[2][r]} et il y a $${somme1}$ paires de chaussettes possibles. `
            texteCorr += `La probabilité de choisir une paire de chaussettes ${qualites[2][r]} est : $${fra1.texFraction}${fra1.texSimplificationAvecEtapes()}$.<br>`
            texteCorr += `Il y a $${m[r]}$ T-shirt ${qualites[5][r]} et il y a $${somme2}$ T-shirt possibles. `
            texteCorr += `La probabilité de choisir un des T-shirt ${qualites[5][r]} est : $${fra2.texFraction}${fra2.texSimplificationAvecEtapes()}$.<br>`
            texteCorr += `${quidam} a donc $${fra2.texFraction}$ de `
            if (fra1.numIrred === 1) {
              texteCorr += 'une chance '
            } else {
              texteCorr += `$${fra1.numIrred}$ chances `
            }
            texteCorr += `sur $${fra1.denIrred}$ de choisir des chaussettes et un T-shirt ${qualites[5][r]}.<br>`
            texteCorr += `Soit $${fra1.texProduitFraction(fra2, 'none')}$.<br>`
            /// / Question b)
            fra1 = fraction(n[p], somme1)
            fra2 = fraction(m[p], somme2)
            const produit2 = fra1.produitFraction(fra2)
            texteCorr +=
              numAlpha(1) +
              ` La probabilité de choisir une paire de chaussettes ${qualites[2][p]} est : $${fra1.texFraction}${fra1.texSimplificationAvecEtapes()}$ et `
            texteCorr += `la probabilité de choisir l'un des T-shirt ${qualites[5][p]} est : $${fra2.texFraction}${fra2.texSimplificationAvecEtapes()}$.<br>`
            texteCorr += `Donc la probabilité de choisir des chaussettes et un T-shirt ${qualites[5][p]} est : $${fra1.texProduitFraction(fra2, 'none')}$.<br>`
            fra1 = fraction(n[q], somme1)
            fra2 = fraction(m[q], somme2)
            const produit3 = fra1.produitFraction(fra2)
            const produits = [produit1, produit2, produit3]

            // INFO: cela permet de ne pas réduire le résultat automatiquement comme le ferais fraction(0).sommeFractions(...produits)
            const probaTotale = fraction(
              produits.map((p) => p.num).reduce((prev, curr) => prev + curr),
              produit1.den,
            )
            texteCorr += `La probabilité de choisir une paire de chaussettes ${qualites[2][q]} est : $${fra1.texFraction}${fra1.texSimplificationAvecEtapes()}$ et `
            texteCorr += `la probabilité de choisir l'un des T-shirt ${qualites[5][q]} est : $${fra2.texFraction}${fra2.texSimplificationAvecEtapes()}$.<br>`
            texteCorr += `Donc la probabilité de choisir des chaussettes et un T-shirt ${qualites[5][q]} est : $${fra1.texProduitFraction(fra2, 'none')}$.<br>`
            texteCorr +=
              'On en déduit que la probabilité de choisir des chaussettes et un T-shirt de la même couleur est :<br>'
            texteCorr += `$${produits.map((p) => p.texFraction).join('+')}=\\dfrac{${produits.map((p) => p.num).join('+')}}{${produit1.den}}=${probaTotale.texFraction}${probaTotale.texSimplificationAvecEtapes()}$`
            texteCorr += '.<br>'
            // Question c)
            const probaContraire = fraction(1, 1).sommeFraction(
              probaTotale.oppose(),
            )
            texteCorr +=
              numAlpha(2) +
              " L'événement «\u00a0choisir des chaussettes et un T-shirt de couleurs différentes\u00a0» est l'événement contraire de l'événement «\u00a0choisir des chaussettes et un T-shirt de même couleur\u00a0».<br>"
            texteCorr += `Donc sa probabilité est : $1-${probaTotale.texFractionSimplifiee}=${fraction(1, 1).texSommeFraction(probaTotale.oppose())}$.<br>`

            handleAnswers(this, iInteractif + 0, {
              reponse: {
                value: produit1.texFraction,
                options: { fractionEgale: true },
              },
            })
            handleAnswers(this, iInteractif + 1, {
              reponse: {
                value: probaTotale.texFraction,
                options: { fractionEgale: true },
              },
            })
            handleAnswers(this, iInteractif + 2, {
              reponse: {
                value: probaContraire.texFraction,
                options: { fractionEgale: true },
              },
            })
          }
          break
        case 3:
          {
            quidam = prenomM()
            quidame = prenomF()
            const p1: number[] = []
            const p2: number[] = []
            const fra1: number[] = []
            const fra2: number[] = []
            do {
              p = choice([4, 6, 8, 10, 12])
              q = choice([4, 6, 8, 10, 12], p)
              n[0] = Math.min(p, q) // petit dé de quidam
              m[0] = Math.max(p, q) // grand dé de quidam
              p1[0] = n[0] * m[0] // nombre de couples pour quidam
              p = choice([4, 6, 8, 10, 12], [n[0], m[0]])
              q = choice([4, 6, 8, 10, 12], [n[0], m[0], p])
              n[1] = Math.min(p, q) // petit dé de quidame
              m[1] = Math.max(p, q) // grand dé de quidame
              p1[1] = n[1] * m[1] // nombre de couples pour quidame
              somme1 = n[0] + m[0] // maximum pour quidam
              somme2 = n[1] + m[1] // maximum pour quidame
              r = Math.min(somme1, somme2) // Plus grand résultat commun.
            } while (n[0] + 1 > somme2)
            for (let j = 0; j < n[0] + m[0] - 1; j++) {
              fra1[j] = 0
            }
            for (let j = 1; j <= n[0]; j++) {
              for (let k = 1; k <= m[0]; k++) {
                fra1[j + k - 2]++ // numérateurs de probas pour quidam = nombre d'occurences des différents résultats possibles
              }
            }
            for (let j = 0; j < n[1] + m[1] - 1; j++) {
              fra2[j] = 0
            }
            for (let j = 1; j <= n[1]; j++) {
              for (let k = 1; k <= m[1]; k++) {
                fra2[j + k - 2]++ // numérateurs de probas pour quidame = nombre d'occurences des différents résultats possibles
              }
            }
            for (let j = 0; j < r - 1; j++) {
              p2[j] = fra2[j] / p1[1] - fra1[j] / p1[0] // différence entre les probas de l'un et de l'autre (positif si Quidame a plus de chance...)
            }

            texte = `${quidam} dispose d'un dé à $${n[0]}$ faces numérotées de $1$ à $${n[0]}$ et d'un dé à $${m[0]}$ faces numérotées de $1$ à $${m[0]}$.<br>`
            texte += 'Il lance ses deux dés et en fait la somme.<br>'
            texte += createList({
              items: [
                ' Reporter dans un tableau les issues possibles de cette expérience aléatoire et leurs probabilités respectives.',
                ` ${quidame} dispose d'un dé à $${n[1]}$ faces numérotées de $1$ à $${n[1]}$ et d'un dé à $${m[1]}$ faces numérotées de $1$ à $${m[1]}$.`,
                `Elle décide de proposer un défi à ${quidam} : «${sp()}On choisit un nombre cible entre $2$ et $${r}$, on lance nos deux dés en même temps. Le premier dont la somme des dés est la cible a gagné.${sp()}»`,
                `${quidam} qui connaît les probabilités calculées à la question a. propose alors de choisir $${n[0] + 1}$ comme nombre cible. Il pense avoir plus de chances de gagner ${queDevant(quidame)}. A-t-il raison ?`,
                `Si oui, quel nombre doit choisir ${quidame} pour avoir un défi qui lui soit favorable et si non, y a-t-il un meilleur choix pour ${quidam} ?`,
                ' Y a-t-il un nombre cible qui donne un jeu équitable où chacun aura la même probabilité de gagner ?',
              ],
              style: 'alpha',
            })
            texte +=
              '$\\textit {Exercice inspiré des problèmes DuDu (mathix.org)}$'
            texteCorr =
              numAlpha(0) +
              ` Les différents résultats de l'expérience ${deDevant(quidam)} sont présentés dans cette table :<br>`
            // tableau d'addition des dé
            texteCorr += '$\\def\\arraystretch{1.5}\\begin{array}{|c'
            for (let j = 0; j <= m[0]; j++) {
              texteCorr += '|c'
            }
            texteCorr += '} \\hline \\text{Dé 1/Dé 2}'
            for (let j = 1; j <= m[0]; j++) {
              texteCorr += '&' + j
            }
            for (let k = 1; k <= n[0]; k++) {
              texteCorr += ' \\\\\\hline ' + k
              for (let j = 1; j <= m[0]; j++) {
                texteCorr += `& \\textcolor {${Couleurs[(j + k) % 10]}}{${j + k}}`
              }
            }
            texteCorr += '\\\\\\hline\\end{array}$<br>'
            // fin du tableau
            texteCorr +=
              'Les probabilités de chaque issue sont données par ce tableau :<br>'
            // tableau des probas
            texteCorr += '$\\def\\arraystretch{2.5}\\begin{array}{|c'
            for (let j = 1; j <= somme1; j++) {
              texteCorr += '|c'
            }
            texteCorr += '} \\hline \\text{Résultats}'
            for (let j = 2; j <= somme1; j++) {
              texteCorr += '&' + j
            }
            texteCorr += ' \\\\\\hline \\text{Probabilité}'
            for (let j = 2; j <= somme1; j++) {
              texteCorr +=
                `& \\textcolor {${Couleurs[j % 10]}}` +
                `{\\dfrac{${fra1[j - 2]}}{${p1[0]}}}`
            }

            texteCorr += '\\\\\\hline\\end{array}$<br>'
            // fin du tableau
            texteCorr +=
              numAlpha(1) +
              ` Les probabilités en ce qui concerne ${quidame} sont données par le tableau ci-dessous :<br>`
            // tableau des probas pour quidame
            texteCorr += '$\\def\\arraystretch{2.5}\\begin{array}{|c'
            for (let j = 1; j <= somme2; j++) {
              texteCorr += '|c'
            }
            texteCorr += '} \\hline \\text{Résultats}'
            for (let j = 2; j <= somme2; j++) {
              texteCorr += '&' + j
            }
            texteCorr += ' \\\\\\hline \\text{Probabilité}'
            for (let j = 2; j <= somme2; j++) {
              texteCorr +=
                `& \\textcolor {${Couleurs[j % 10]}}` +
                `{\\dfrac{${fra2[j - 2]}}{${p1[1]}}}`
            }
            texteCorr += '\\\\\\hline\\end{array}$<br>'

            texteCorr += `La probabilité qu'a ${quidame} de faire $${n[0] + 1}$ est : $\\textcolor {${Couleurs[(n[0] + 1) % 10]}}{${texFractionFromString(fra2[n[0] - 1], p1[1])}}${simplificationDeFractionAvecEtapes(fra2[n[0] - 1], p1[1])}$.<br>`
            texteCorr += `La probabilité qu'a ${quidam} de faire $${n[0] + 1}$ est : $\\textcolor {${Couleurs[(n[0] + 1) % 10]}}{${texFractionFromString(fra1[n[0] - 1], p1[0])}}${simplificationDeFractionAvecEtapes(fra1[n[0] - 1], p1[0])}$.<br>`
            if (p2[n[0] - 1] > 0) {
              // Si quidame a plus de chance de gagner avec le choix de quidam
              texteCorr += `${quidam} se trompe en croyant avoir plus de chances de gagner car $${texFractionReduite(fra2[n[0] - 1], p1[1])}>${texFractionReduite(fra1[n[0] - 1], p1[0])}$.<br>`
              // choix du nombre cible qui favorise quidam
              let trouve = false
              for (let j = r - 2; j >= 0; j--) {
                if (p2[j] < 0) {
                  texteCorr +=
                    numAlpha(2) +
                    ` ${quidam} aurait dû choisir $${j + 2}$ comme nombre cible.<br> Sa probabilité de réussir serait alors de $\\textcolor {${Couleurs[(j + 2) % 10]}}{${texFractionFromString(fra1[j], p1[0])}}${simplificationDeFractionAvecEtapes(fra1[j], p1[0])}$ et celle ${deDevant(quidame)} serait de $\\textcolor {${Couleurs[(j + 2) % 10]}}{${texFractionFromString(fra2[j], p1[1])}}${simplificationDeFractionAvecEtapes(fra2[j], p1[1])}$.<br>`
                  trouve = true
                }
                if (trouve) {
                  break
                }
              }
              if (trouve === false) {
                texteCorr +=
                  numAlpha(2) +
                  ` Il n'existe pas de choix qui permette à ${quidam} d'avoir plus de chances ${queDevant(quidame)} de gagner.`
              }
            } else if (p2[n[0] - 1] < 0) {
              // quidam a plus de chances de gagner
              texteCorr += `${quidam} a raison de penser avoir plus de chances de gagner car $${texFractionReduite(fra2[n[0] - 1], p1[1])}<${texFractionReduite(fra1[n[0] - 1], p1[0])}$.<br>`
              // choix du nombre cible qui favorise quidame
              let trouve = false
              for (let j = r - 2; j >= 0; j--) {
                if (p2[j] > 0) {
                  texteCorr +=
                    numAlpha(2) +
                    ` ${quidame} devrait choisir $${j + 2}$ comme nombre cible.<br>Sa probabilité de réussir serait alors de $\\textcolor {${Couleurs[(j + 2) % 10]}}{${texFractionFromString(fra2[j], p1[1])}}${simplificationDeFractionAvecEtapes(fra2[j], p1[1])}$.<br>Celle ${deDevant(quidam)} serait de $\\textcolor {${Couleurs[(j + 2) % 10]}}{${texFractionFromString(fra1[j], p1[0])}}${simplificationDeFractionAvecEtapes(fra1[j], p1[0])}$ et $${texFractionReduite(fra1[j], p1[0])}<${texFractionFromString(fra2[j], p1[1])}$.<br>`
                  trouve = true
                }
                if (trouve) {
                  break
                }
              }
              if (trouve === false) {
                texteCorr +=
                  numAlpha(2) +
                  ` Il n'existe pas de choix qui permette à ${quidame} d'avoir plus de chances ${queDevant(quidam)} de gagner.<br>`
              }
            } else {
              // Ils ont autant de chances de gagner l'un que l'autre
              texteCorr += `${quidam} et ${quidame} ont autant de chances de gagner car ils ont tous deux la même probabilité de faire $${n[0] + 1}$, ce qui répond à la question ${numAlpha(3)}.<br>`
              // choix du nombre cible qui favorise quidam
              let trouve = false
              for (let j = r - 2; j >= 0; j--) {
                if (p2[j] < 0) {
                  texteCorr +=
                    numAlpha(2) +
                    ` ${quidam} aurait dû choisir $${j + 2}$ comme nombre cible.<br> Sa probabilité de réussir serait alors de $\\textcolor {${Couleurs[(j + 2) % 10]}}{${texFractionFromString(fra1[j], p1[0])}}${simplificationDeFractionAvecEtapes(fra1[j], p1[0])}$ et celle ${deDevant(quidame)} serait de $\\textcolor {${Couleurs[(j + 2) % 10]}}{${texFractionFromString(fra2[j], p1[1])}}${simplificationDeFractionAvecEtapes(fra2[j], p1[1])}$.<br>`
                  trouve = true
                }
                if (trouve) {
                  break
                }
              }
              if (trouve === false) {
                texteCorr +=
                  numAlpha(2) +
                  ` Il n'existe pas de choix qui permette à ${quidam} d'avoir plus de chances ${queDevant(quidame)} de gagner.<br>`
              }
            }
            if (p2[n[0] - 1] === 0) {
              texteCorr +=
                numAlpha(3) +
                ` Il a été déjà répondu à cette question à la question ${numAlpha(1)}.<br>`
            } else {
              // choix de la cible pour un jeu équitable
              let trouve = false
              for (let j = r - 2; j >= 0; j--) {
                if (p2[j] === 0) {
                  texteCorr +=
                    numAlpha(3) +
                    ` En choisissant $${j + 2}$ comme cible, ${quidam} et ${quidame} ont la même probabilité de gagner.<br>
                                Pour ${quidam} la probabilité est : $\\textcolor {${Couleurs[(j + 2) % 10]}}{${texFractionFromString(fra1[j], p1[0])}}${simplificationDeFractionAvecEtapes(fra1[j], p1[0])}$ tout comme pour ${quidame} : $\\textcolor {${Couleurs[(j + 2) % 10]}}{${texFractionFromString(fra2[j], p1[1])}}${simplificationDeFractionAvecEtapes(fra2[j], p1[1])}$.<br>`
                  trouve = true
                }
                if (trouve) {
                  break
                }
              }
              if (trouve === false) {
                texteCorr +=
                  numAlpha(3) +
                  ` Il n'existe pas de choix qui permette à ${quidam} et à ${quidame} d'avoir la même probabilité de gagner car : <br>`
                for (let j = 2; j < r / 2; j++) {
                  texteCorr += `$\\textcolor {${Couleurs[j % 10]}}{${texFractionFromString(fra1[j - 2], p1[0])}}\\ne \\textcolor {${Couleurs[j % 10]}}{${texFractionFromString(fra2[j - 2], p1[1])}}$ ; `
                }
                texteCorr += `$\\textcolor {${Couleurs[(r / 2) % 10]}}{${texFractionFromString(fra1[r / 2], p1[0])}}\\ne \\textcolor {${Couleurs[(r / 2) % 10]}}{${texFractionFromString(fra2[r / 2], p1[1])}}$.`
              }
            }
          }
          break
      }
      if (this.questionJamaisPosee(i, p!, q!, r!)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        if (listeIndex[i] - 1 < 2) iInteractif = iInteractif + 6
        else if (listeIndex[i] - 1 === 2) iInteractif = iInteractif + 3
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // Espacement de 2 em entre chaque questions.
  }
}
