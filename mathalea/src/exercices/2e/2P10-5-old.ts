// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 92022 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { createList } from '../../lib/format/lists'
import { choice } from '../../lib/outils/arrayOutils'
import {
  simplificationDeFractionAvecEtapes,
  texFractionFromString,
  texFractionReduite,
} from '../../lib/outils/deprecatedFractions'
import { deDevant, numAlpha, queDevant } from '../../lib/outils/outilString'
import { prenomF, prenomM } from '../../lib/outils/Personne'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'

import { handleAnswers } from '../../lib/interactif/gestionInteractif' // fonction qui va préparer l'analyse de la saisie

import { orangeMathalea } from 'apigeom/src/elements/defaultValues'
import { bleuMathalea } from '../../lib/colors'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { enumeration } from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { rangeMinMax } from '../../lib/outils/nombres'
import { fraction } from '../../modules/fractions'
import Exercice from '../Exercice'
export const dateDeModifImportante = '20/06/2024'

export const titre =
  'Résoudre un problème basé sur une expérience aléatoire à deux épreuves'
export const interactifReady = true

export const uuid = '92022'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

/**
 * Calculs de probabilités sur une expérience aléatoire à deux épreuves
 * @author Jean-claude Lhote
 */
export default class FonctionsProbabilite2Old extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de problèmes : ',
      'Nombres séparés par des tirets :\n1 : Yaourts (6 points)\n2 : Cartes (6points) \n3 : Chaussettes (3 points)\n4 : Dés (5 points)\n5 : Mélange',
    ]
    this.nbQuestions = 2

    this.spacing = 2
    this.spacingCorr = context.isHtml ? 3 : 2
    this.sup = 1
    this.comment = `Selon le type de problème, le nombre de questions peut être différent. Si vous donnez cet exercice sur Capytale, vous devriez choisir les problèmes donnant 6 questions et donc 6 points et éviter le problème des chaussettes qui n'en donne que 3 et celui des dés qui n'en donne que 5.`
  }

  nouvelleVersion() {
    // const indexDisponibles = [0, 1, 2, 3]
    // const listeIndex = combinaisonListes(indexDisponibles, this.nbQuestions)
    const listeIndex = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
    }).map(Number)

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
      const choix = listeIndex[i] - 1
      switch (choix) {
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
          const tirages = []
          for (const x of [p, q, r]) {
            const tirage1 = fraction(n[x], somme1)
            const tirage2 = fraction(n[x] - 1, somme1 - 1)
            tirages.push([tirage1, tirage2])
          }
          let issues = ''
          for (const j of [p, q, r]) {
            for (const k of [p, q, r]) {
              issues += `(${Initiale[j]},${Initiale[k]}) `
            }
          }

          texte = `Dans le frigo, il y a ${somme1} yaourts. ${n[p]} sont ${qualites[0][p]}, ${n[q]} sont ${qualites[0][q]} et ${n[r]} sont ${qualites[0][r]}.<br>` //  ${n[3]} sont ${qualites[index1][3]} et ${n[4]} sont ${qualites[index1][4]}.<br> `;
          texte += `${quidame} en choisit un au hasard. Son frère ${quidam} en choisit un au hasard à son tour.<br>`
          texte += addMultiMathfield(this, i, {
            dataTemplate: `a) Combien d'issues possède cette experience aléatoire ? %{champ1}\n
            b) Donner un exemple d'issue.\nOn donnera la réponse sous la forme $(X,Y)$ avec $X,Y$ deux lettres parmi $${Initiale[p]}$, $${Initiale[q]}$ et $${Initiale[r]}$. %{champ2}\n
            c) Est-ce une expérience en situation d'équiprobabilité ? %{champ3}\n
            d) Calculer la probabilité ${queDevant(quidame)} et ${quidam} aient choisi tous les deux un yaourt ${qualites[0][p]}. %{champ4}\n
            e) Calculer la probabilité qu'ils aient choisi des yaourts aux parfums identiques. %{champ5}\n
            f) Calculer la probabilité qu'ils aient choisi des yaourts aux parfums différents. %{champ6}`,
            dataOptions: {
              champ1: { keyboard: KeyboardType.clavierNumbers },
              champ2: { keyboard: KeyboardType.alphanumeric },
              champ3: { keyboard: KeyboardType.vFON },
              champ4: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
              champ5: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
              champ6: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
            },
          })
          const probaTirage1 = fraction(n[p], somme1)
          const probaTirage2 = fraction(n[p] - 1, somme1 - 1)
          const probaMemeSaveurParticuliere =
            probaTirage1.produitFraction(probaTirage2)
          const probas = tirages.map(([t1, t2]) => t1.produitFraction(t2))
          const probaMemeSaveur = fraction(0, 1).sommeFractions(...probas)

          const probaContraire = fraction(1, 1).sommeFraction(
            probaMemeSaveur.oppose(),
          )

          handleAnswers(
            this,
            i,
            {
              bareme: toutAUnPoint,
              champ1: { value: 9 },
              champ2: {
                value: [
                  '(F,F)',
                  '(F,V)',
                  '(F,A)',
                  '(V,F)',
                  '(V,V)',
                  '(V,A)',
                  '(A,F)',
                  '(A,V)',
                  '(A,A)',
                ],
                options: { texteSansCasse: true },
              },
              champ3: {
                value: ['N', 'non'],
                options: { texteSansCasse: true },
              },
              champ4: {
                value: probaMemeSaveurParticuliere.texFraction,
                options: { fractionEgale: true },
              },
              champ5: {
                value: probaMemeSaveur.texFraction,
                options: { fractionEgale: true },
              },
              champ6: {
                value: probaContraire.texFraction,
                options: { fractionEgale: true },
              },
            },
            { formatInteractif: 'multi-mathfield' },
          )

          texteCorr = ''
          // Question a
          texteCorr +=
            numAlpha(0) +
            ` ${quidame} peut avoir choisi un yaourt ${qualites[0][p]}, ${qualites[0][q]} ou ${qualites[0][r]}. Une fois qu'elle a choisi, et comme il y a au moins 2 yaourts de chaque sorte, ${quidam} a les mêmes 3 possibilités. Il y a donc $3\\times3=${miseEnEvidence('9')}$ issues possibles.<br>`
          texteCorr += `Par exemple : ${quidame} a pris un yaourt ${qualites[0][p]} et ${quidam} un yaourt ${qualites[0][q]}. Ce qu'on peut noter (${Initiale[p]},${Initiale[q]}).<br>`
          texteCorr += 'Les 9 issues sont : '

          texteCorr += issues
          texteCorr += '.<br>'

          // question b
          texteCorr +=
            numAlpha(1) +
            `Les $9$ issues ont été listées à la question a). Par exemple, l'issue ${texteEnCouleurEtGras(`(${Initiale[p]},${Initiale[q]})`)} correspond à la situation où ${quidame} a choisi un yaourt ${qualites[0][p]} et ${quidam} un yaourt ${qualites[0][q]}.<br>`

          // Question c
          if (n[0] === n[1] && n[1] === n[2]) {
            texteCorr +=
              numAlpha(2) +
              ` Comme le nombre de yaourts de chaque sorte est le même, alors ${quidame} a la même probabilité de choisir n'importe quel parfum, mais ensuite son frère aura un yaourt de moins de l'un des parfums. Il est donc moins probable qu'il choisisse le même parfum que sa sœur que l'un des deux autres parfums.<br>`
            texteCorr += `l'issue (${Initiale[p]},${Initiale[p]}) est donc moins probable que l'issue (${Initiale[p]},${Initiale[q]}). ${texteEnCouleurEtGras("Ce n'est donc pas une situation d'équiprobabilité.")}<br>`
          } else {
            texteCorr +=
              numAlpha(2) +
              ` Comme le nombre de yaourts est différent d'un parfum à l'autre, ${quidame} n'a pas la même probabilité de choisir n'importe quel parfum. On en déduit qu'il est impossible que les issues (${Initiale[p]},${Initiale[p]}), (${Initiale[q]},${Initiale[q]}) et (${Initiale[r]},${Initiale[r]}) aient la même probabilité.<br>
              ${texteEnCouleurEtGras("Ce n'est donc pas une situation d'équiprobabilité.")}<br>`
          }

          // Question d

          texteCorr +=
            numAlpha(3) +
            ` Il y a ${n[p]} yaourts ${qualites[0][p]}, et ${somme1} yaourts en tout, la probabilité ${queDevant(quidame)} choisisse un yaourt ${qualites[0][p]} est : $${probaTirage1.texFSD}${probaTirage1.texSimplificationAvecEtapes()}$.<br>`
          texteCorr += `Ensuite, il reste ${n[p] - 1} yaourts ${qualites[0][p]} pour ${quidam} sur un total de ${somme1 - 1} yaourts.<br>`
          texteCorr += `La probabilité qu'il choisisse à son tour et dans ces conditions ce parfum est : $${probaTirage2.texFSD}${probaTirage2.texSimplificationAvecEtapes()}$.<br>`
          texteCorr += `La probabilité de l'issue (${Initiale[p]},${Initiale[p]}) est le produit de ces deux probabilités, donc : $${probaTirage1.texFSD}\\times${probaTirage2.texFSD}${probaMemeSaveurParticuliere.texSimplificationAvecEtapes('none', orangeMathalea)}$.<br>`
          // Question e

          texteCorr +=
            numAlpha(4) +
            ` Les probabilités des issues (${Initiale[q]},${Initiale[q]}) et (${Initiale[r]},${Initiale[r]}) peuvent être respectivement calculées de la même façon qu'à la question c) :<br>`
          texteCorr += `$${tirages[1][0].texFSD}\\times${tirages[1][1].texFSD}=${probas[1].texFSD}$,<br>`
          texteCorr += `$${tirages[2][0].texFSD}\\times${tirages[2][1].texFSD}=${probas[2].texFSD}$.<br>`
          texteCorr += `La probabilité qu'ils choisissent le même parfum est la somme des probabilités des issues (${Initiale[p]},${Initiale[p]}), (${Initiale[q]},${Initiale[q]}) et (${Initiale[r]},${Initiale[r]}), soit :<br>`
          texteCorr += `$${probas.map((p) => p.texFSD).join('+')}${probaMemeSaveur.texSimplificationAvecEtapes('none', orangeMathalea)}$.<br>`
          // Question f
          texteCorr +=
            numAlpha(5) +
            " Choisir des parfums différents est l'événement contraire de l'événement dont on a calculé la probabilité à la question d).<br>"

          const num = probaMemeSaveur.num
          const den = probaMemeSaveur.den
          texteCorr += `La probabilité de cet événement est donc : $1-${probaMemeSaveur.texFraction}=${fraction(den, den).texFraction}-${probaMemeSaveur.texFraction}=${fraction(den - num, den).texFraction}${probaContraire.texSimplificationAvecEtapes('none', orangeMathalea)}$.`

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
          texte = `On considère l'expérience consistant à tirer deux cartes dans un jeu de ${q} cartes.<br>`
          texte += addMultiMathfield(this, i, {
            dataTemplate: `Partie 1 : On effectue le tirage de la deuxième carte après remise de la première dans le jeu.
            a) Quelle est la probabilité de tirer 2 cartes de la même couleur (Rouge/Rouge ou Noire/Noire) ? %{champ1}\nb) Quelle est la probabilité de tirer 2 ${Initiale[r]}${Initiale[r] === 'valet' || Initiale[r] === 'roi' ? 's' : ''} ? %{champ2}\nc) Quelle est la probabilité de tirer 2 cartes de ${qualites[1][p]} ? %{champ3}\nPartie 2 : On effectue le tirage de la deuxième carte sans remise de la première dans le jeu.
            a) Quelle est la probabilité de tirer 2 cartes de la même couleur (Rouge/Rouge ou Noire/Noire) ? %{champ4}\nb) Quelle est la probabilité de tirer 2 ${Initiale[r]}${Initiale[r] === 'valet' || Initiale[r] === 'roi' ? 's' : ''} ? %{champ5}\nc) Quelle est la probabilité de tirer 2 cartes de ${qualites[1][p]} ? %{champ6}\n`,
            dataOptions: {
              champ1: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
              champ2: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
              champ3: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
              champ4: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
              champ5: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
              champ6: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
            },
          })

          // PARTIE 1

          texteCorr = 'Partie 1.<br>    '
          // Question a)
          texteCorr +=
            numAlpha(0) +
            ` On ne s'intéresse ici qu'au tirage de la deuxième carte. En effet, pour réaliser l'événement, il faudra que cette carte soit de la même couleur que la première. Il y a deux couleurs (rouge et noire) et le nombre de cartes rouges est le même que le nombre de cartes noires : ${q / 2}.<br>`
          texteCorr += `    La probabilité que la deuxième carte soit de la même couleur que la première est donc : $${fraction(q / 2, q).texFraction}=${fraction(1, 2).texFraction}$.<br>`
          // Question b)
          const quatreCartes = fraction(4, q)
          texteCorr += numAlpha(1) + ` Il y a 4 ${Initiale[r]}`
          if (Initiale[r] === 'valet' || Initiale[r] === 'roi') {
            texteCorr += 's'
          }
          texteCorr += ` dans le jeu sur ${q} cartes possibles. La probabilité de tirer un ${Initiale[r]} est donc de $${quatreCartes.texFraction}=${quatreCartes.texFractionSimplifiee}$.<br>`
          texteCorr += `    Comme la deuxième carte est tirée dans le jeu complet (après remise de la première), la probabilité de tirer un ${Initiale[r]} est la même pour cette carte.<br>`
          texteCorr += `    La probabilité de tirer 2 ${Initiale[r]}`
          if (Initiale[r] === 'valet' || Initiale[r] === 'roi') {
            texteCorr += 's'
          }
          texteCorr += ` est donc : $${quatreCartes.texFractionSimplifiee}\\times${quatreCartes.texFractionSimplifiee}=${quatreCartes.produitFraction(quatreCartes).texFractionSimplifiee}$.<br>`
          // Question c)
          const quart = fraction(1, 4)
          texteCorr +=
            numAlpha(2) +
            ` Il y a ${q / 4} cartes de ${qualites[1][p]} dans le jeu sur ${q} cartes possibles. La probabilité de tirer un ${qualites[1][p]} est donc de $${fraction(q / 4, q).texFraction}=${quart.texFraction}$.<br>`
          texteCorr += `    Comme la deuxième carte est tirée dans le jeu complet (après remise de la première) la probabilité de tirer un ${qualites[1][p]} est la même pour cette carte.<br>`
          texteCorr += `    La probabilité de tirer 2 ${qualites[1][p]}${qualites[1][p] === 'carreau' ? 'x' : 's'} est donc $${quart.texFraction}\\times${quart.texFraction}=${quart.produitFraction(quart).texFraction}$.<br>`

          // PARTIE 2

          texteCorr += 'Partie 2.<br>'
          // Question a)
          texteCorr +=
            numAlpha(0) +
            ` On ne s'intéresse ici qu'au tirage de la deuxième carte. En effet, pour réaliser l'événement, il faudra que cette carte soit de la même couleur que la première. Il y a maintenant une carte en moins dans la couleur désirée, soit  ${q / 2 - 1}, et il y a une carte en moins dans le jeu, soit ${q - 1}.<br>`
          const memeCouleur = fraction(q / 2 - 1, q - 1)
          texteCorr += `    La probabilité que la deuxième carte soit de la même couleur que la première est donc : $${memeCouleur.texFraction}$.<br>`
          // Question b)
          const troisCartes = fraction(3, q - 1)
          texteCorr += numAlpha(1) + ` Il y a 4 ${Initiale[r]}`
          if (Initiale[r] === 'valet' || Initiale[r] === 'roi') {
            texteCorr += 's'
          }
          texteCorr += ` dans le jeu sur ${q} cartes possibles. La probabilité de tirer un ${Initiale[r]} est donc de $${quatreCartes.texFraction}=${quatreCartes.texFractionSimplifiee}$.<br>`
          texteCorr += `    Pour que l'événement se réalise la deuxième carte est tirée dans les ${q - 1} cartes restantes dans lesquelles il manque un ${Initiale[r]}.<br>`
          texteCorr += `    La probabilité de tirer un deuxième ${Initiale[r]} est donc : $${troisCartes.texFraction}$.`
          if (q === 52) {
            texteCorr += `$=${fraction(1, 17).texFraction}$.`
          }
          texteCorr += `<br> La probabilité de tirer 2 ${Initiale[r]}`
          if (Initiale[r] === 'valet' || Initiale[r] === 'roi') {
            texteCorr += 's'
          }
          texteCorr += ` est donc : $${quatreCartes.texFractionSimplifiee}\\times${troisCartes.texFractionSimplifiee}=${quatreCartes.produitFraction(troisCartes).texFractionSimplifiee}$.<br>`
          // Question c)
          texteCorr +=
            numAlpha(2) +
            ` Il y a ${q / 4} cartes de ${qualites[1][p]} dans le jeu sur ${q} cartes possibles. La probabilité de tirer un ${qualites[1][p]} est donc de $${fraction(q / 4, q).texFraction}=${quart.texFraction}$.<br>`
          texteCorr += `    Pour que l'événement se réalise, la deuxième carte est tirée dans les ${q - 1} cartes restantes dans lesquelles il manque un ${qualites[1][p]}.<br>`
          texteCorr += `    La probabilité de tirer un deuxième ${qualites[1][p]} est donc : $${fraction(q / 4 - 1, q - 1).texFraction}$.`
          if (q === 52) {
            texteCorr += `$=${fraction(4, 17).texFraction}$<br>La probabilité de tirer 2 ${qualites[1][p]}${qualites[1][p] === 'carreau' ? 'x' : 's'} est donc $${fraction(1, 4).texFraction}\\times${fraction(4, 17).texFraction}=${fraction(1, 17).texFraction}$.`
          } else {
            texteCorr += `<br>La probabilité de tirer 2 ${qualites[1][p]}${qualites[1][p] === 'carreau' ? 'x' : 's'} est donc $${quart.texFraction}\\times${fraction(7, 31).texFractionSimplifiee}=${fraction(7, 124).texFraction}$.`
          }
          handleAnswers(
            this,
            i,
            {
              bareme: toutAUnPoint,
              champ1: {
                value: fraction(1, 2).texFraction,
                options: { fractionEgale: true },
              },
              champ2: {
                value:
                  quatreCartes.produitFraction(quatreCartes)
                    .texFractionSimplifiee,
                options: { fractionEgale: true },
              },
              champ3: {
                value: quart.produitFraction(quart).texFraction,
                options: { fractionEgale: true },
              },
              champ4: {
                value: memeCouleur.texFraction,
                options: { fractionEgale: true },
              },
              champ5: {
                value:
                  quatreCartes.produitFraction(troisCartes)
                    .texFractionSimplifiee,
                options: { fractionEgale: true },
              },
              champ6: {
                value: fraction(7, 124).texFraction,
                options: { fractionEgale: true },
              },
            },
            { formatInteractif: 'multi-mathfield' },
          )

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
              texte += `${n[j]} paires de chaussettes ${qualites[2][j]}${j === 2 ? '.<br>' : ', '}`
            }
            // texte += `${n[3]} paires de chaussettes ${qualites[2][3]} et ${n[4]} paires de chaussettes ${qualites[2][4]}.<br>`
            texte += `Dans le deuxième tiroir, ${quidam} a mis des T-shirt. Il y a `
            for (let j = 0; j < 3; j++) {
              texte += `${m[j]} T-shirt ${qualites[5][j]}${j === 2 ? '.<br>' : ', '}`
            }
            // texte += `${m[3]} T-shirt ${qualites[5][3]} et ${m[4]} T-shirt ${qualites[5][4]}.<br>`
            texte += `Un matin, il y a une panne de courant et ${quidam} prend au hasard une paire de chaussettes dans le premier tiroir et un T-shirt dans le deuxième.<br>`
            texte += addMultiMathfield(this, i, {
              dataTemplate: `a) Quelle est la probabilité ${queDevant(quidam)} ait choisi des chaussettes et un T-shirt ${qualites[5][r]} ? %{champ1}\nb) Quelle est la probabilité ${queDevant(quidam)} ait choisi des chaussettes et un T-shirt de la même couleur ? %{champ2}\nc) Quelle est la probabilité ${queDevant(quidam)} ait choisi des chaussettes et un T-shirt de couleurs différentes ? %{champ3}\n`,
              dataOptions: {
                champ1: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
                champ2: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
                champ3: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
              },
            })

            // Question a)
            let fra1 = fraction(n[r], somme1)
            let fra2 = fraction(m[r], somme2)
            const produit1 = fra1.produitFraction(fra2)
            texteCorr =
              numAlpha(0) +
              ` Il y a ${n[r]} paires de chaussettes ${qualites[2][r]} et il y a ${somme1} paires de chaussettes possibles. `
            texteCorr += `La probabilité de choisir une paire de chaussettes ${qualites[2][r]} est : $${fra1.texFraction}${fra1.texSimplificationAvecEtapes()}$.<br>`
            texteCorr += `Il y a ${m[r]} T-shirt ${qualites[5][r]} et il y a ${somme2} T-shirt possibles. `
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
              ' L\'événement "choisir des chaussettes et un T-shirt de couleurs différentes" est l\'événement contraire de l\'événement "choisir des chaussettes et un T-shirt de même couleur".<br>'
            texteCorr += `Donc sa probabilité est : $1-${probaTotale.texFractionSimplifiee}=${fraction(1, 1).texSommeFraction(probaTotale.oppose())}$.<br>`

            handleAnswers(
              this,
              i,
              {
                bareme: toutAUnPoint,
                champ1: {
                  value: produit1.texFraction,
                  options: { fractionEgale: true },
                },
                champ2: {
                  value: probaTotale.texFraction,
                  options: { fractionEgale: true },
                },
                champ3: {
                  value: probaContraire.texFraction,
                  options: { fractionEgale: true },
                },
              },
              { formatInteractif: 'multi-mathfield' },
            )
          }
          break
        case 3:
          {
            quidam = prenomM()
            quidame = prenomF()
            const probaDiffs: number[] = [] // Les différences entre les probas de l'un et de l'autre pour chaque résultat possible (positif si Quidame a plus de chance...)
            const fra1: number[] = [] // Les numérateurs de probas pour quidam = nombre d'occurences des différents résultats possibles
            const fra2: number[] = [] // Les numérateurs de probas pour quidame = nombre d'occurences des différents résultats possibles
            const probaDecimale1: number[] = [] // Les probabilités décimales pour quidam pour chaque résultat possible commun
            const probaDecimale2: number[] = [] // Les probabilités décimales pour quidame pour chaque résultat possible commun
            const desQuidam: number[] = [0, 0] // Les dés choisis par quidam [petit dé, grand dé]
            const desQuidame: number[] = [0, 0] // Les dés choisis par quidame [petit dé, grand dé]
            let nbCouplesQuidam: number // nombre de couples possibles pour quidam
            let nbCouplesQuidame: number // nombre de couples possibles pour quidame
            do {
              p = choice([4, 6, 8, 10, 12])
              q = choice([4, 6, 8, 10, 12], p)
              desQuidam[0] = Math.min(p, q) // petit dé de quidam
              desQuidam[1] = Math.max(p, q) // grand dé de quidam
              nbCouplesQuidam = desQuidam[0] * desQuidam[1] // nombre de couples pour quidam
              p = choice([4, 6, 8, 10, 12])
              q = choice([4, 6, 8, 10, 12], p)
              desQuidame[0] = Math.min(p, q) // petit dé de quidame
              desQuidame[1] = Math.max(p, q) // grand dé de quidame
              nbCouplesQuidame = desQuidame[0] * desQuidame[1] // nombre de couples pour quidame
              nbCouplesQuidam = desQuidam[0] * desQuidam[1] // nombre de couples pour quidam
              nbCouplesQuidame = desQuidame[0] * desQuidame[1] // nombre de couples pour quidame
              somme1 = desQuidam[0] + desQuidam[1] // maximum pour quidam
              somme2 = desQuidame[0] + desQuidame[1] // maximum pour quidame
              r = Math.min(somme1, somme2) // Plus grand résultat commun.
            } while (desQuidam[0] + 1 > somme2)
            for (let j = 0; j < desQuidam[0] + desQuidam[1] - 1; j++) {
              fra1[j] = 0
            }
            for (let j = 1; j <= desQuidam[0]; j++) {
              for (let k = 1; k <= desQuidam[1]; k++) {
                fra1[j + k - 2]++ // numérateurs de probas pour quidam = nombre d'occurences des différents résultats possibles
              }
            }
            for (let j = 0; j < desQuidame[0] + desQuidame[1] - 1; j++) {
              fra2[j] = 0
            }
            for (let j = 1; j <= desQuidame[0]; j++) {
              for (let k = 1; k <= desQuidame[1]; k++) {
                fra2[j + k - 2]++ // numérateurs de probas pour quidame = nombre d'occurences des différents résultats possibles
              }
            }
            for (let j = 0; j < r - 1; j++) {
              probaDecimale1[j] = fra1[j] / nbCouplesQuidam // probabilités décimales pour quidam pour chaque résultat possible commun
              probaDecimale2[j] = fra2[j] / nbCouplesQuidame // probabilités décimales pour quidame pour chaque résultat possible commun
              probaDiffs[j] = probaDecimale2[j] - probaDecimale1[j] // différence entre les probas de l'un et de l'autre (positif si Quidame a plus de chance...)
            }
            // Définition des ensembles de nombres correspondant à chaque cas de figure
            const ciblesEquitables = probaDiffs
              .map((p, i) => (p === 0 ? i + 2 : null))
              .filter((x) => x !== null) as number[]
            const ciblesPourQuidameGagne = probaDiffs
              .map((p, i) => (p > 0 ? i + 2 : null))
              .filter((x) => x !== null)
              .filter((x) => !ciblesEquitables.includes(x)) as number[]
            const ciblesPourQuidamGagne = probaDiffs
              .map((p, i) => (p < 0 ? i + 2 : null))
              .filter((x) => x !== null)
              .filter((x) => !ciblesEquitables.includes(x)) as number[]

            texteCorr =
              numAlpha(0) +
              ` Les différents résultats de l'expérience ${deDevant(quidam)} sont présentés dans cette table :<br>`
            // tableau d'addition des dé
            texteCorr += '$\\def\\arraystretch{1.5}\\begin{array}{|c'
            for (let j = 0; j <= desQuidam[1]; j++) {
              texteCorr += '|c'
            }
            texteCorr += '} \\hline  \\text{Dé 1/Dé 2}'
            for (let j = 1; j <= desQuidam[1]; j++) {
              texteCorr += '&' + j
            }
            for (let k = 1; k <= desQuidam[0]; k++) {
              texteCorr += ' \\\\\\hline ' + k
              for (let j = 1; j <= desQuidam[1]; j++) {
                texteCorr += `& \\textcolor {${Couleurs[(j + k) % 10]}}{${j + k}}`
              }
            }
            texteCorr += '\\\\\\hline\\end{array}$<br>'
            if (this.interactif) {
              texteCorr += `Les issues de l'expérience ${deDevant(quidame)} sont les résultats possibles de l'addition des deux dés, soit les nombres de 2 à ${somme1}.<br>
              soit : $${miseEnEvidence(
                rangeMinMax(2, somme1)
                  .map((i) => i.toString())
                  .join(';'),
              )}$ <br>`
            }
            // fin du tableau
            if (this.interactif) {
              texteCorr += `${numAlpha(1)} `
            }
            texteCorr +=
              'Les probabilités de chaque issue sont données par ce tableau :<br>'
            // tableau des probas
            texteCorr += '$\\def\\arraystretch{2.5}\\begin{array}{|c'
            for (let j = 1; j <= somme1; j++) {
              texteCorr += '|c'
            }
            texteCorr += '} \\hline  \\text{Résultats}'
            for (let j = 2; j <= somme1; j++) {
              texteCorr += '&' + j
            }
            texteCorr += ' \\\\\\hline \\text{Probabilité}'
            for (let j = 2; j <= somme1; j++) {
              texteCorr +=
                `& \\textcolor {${Couleurs[j % 10]}}` +
                `{\\dfrac{${fra1[j - 2]}}{${nbCouplesQuidam}}}`
            }

            texteCorr += '\\\\\\hline\\end{array}$<br>'
            if (this.interactif) {
              texteCorr += `La probabilité ${queDevant(quidam)} fasse ${desQuidam[0] + 1} est : $${miseEnEvidence(fraction(fra1[desQuidam[0] - 1], nbCouplesQuidam).texFraction)}$.<br>`
            }
            // fin du tableau
            texteCorr +=
              numAlpha(this.interactif ? 2 : 1) +
              ` Les probabilités en ce qui concerne ${quidame} sont données par le tableau ci-dessous :<br>`
            // tableau des probas pour quidame
            texteCorr += '$\\def\\arraystretch{2.5}\\begin{array}{|c'
            for (let j = 1; j <= somme2; j++) {
              texteCorr += '|c'
            }
            texteCorr += '} \\hline  \\text{Résultats}'
            for (let j = 2; j <= somme2; j++) {
              texteCorr += '&' + j
            }
            texteCorr += ' \\\\\\hline \\text{Probabilité}'
            for (let j = 2; j <= somme2; j++) {
              texteCorr +=
                `& \\textcolor {${Couleurs[j % 10]}}` +
                `{\\dfrac{${fra2[j - 2]}}{${nbCouplesQuidame}}}`
            }
            texteCorr += '\\\\\\hline\\end{array}$<br>'

            texteCorr += `La probabilité qu'a ${quidame} de faire ${desQuidam[0] + 1} est : $\\textcolor {${Couleurs[(desQuidam[0] + 1) % 10]}}{${texFractionFromString(fra2[desQuidam[0] - 1], nbCouplesQuidame)}}${simplificationDeFractionAvecEtapes(fra2[desQuidam[0] - 1], nbCouplesQuidame)}$.<br>`
            texteCorr += `La probabilité qu'a ${quidam} de faire ${desQuidam[0] + 1} est : $\\textcolor {${Couleurs[(desQuidam[0] + 1) % 10]}}{${texFractionFromString(fra1[desQuidam[0] - 1], nbCouplesQuidam)}}${simplificationDeFractionAvecEtapes(fra1[desQuidam[0] - 1], nbCouplesQuidam)}$.<br>`
            if (probaDiffs[desQuidam[0] - 1] > 0) {
              // Si quidame a plus de chance de gagner avec le choix de quidam
              texteCorr += `${texteEnCouleurEtGras(`${quidam} se trompe`)} en croyant avoir plus de chances de gagner car $${texFractionReduite(fra2[desQuidam[0] - 1], nbCouplesQuidame)}>${texFractionReduite(fra1[desQuidam[0] - 1], nbCouplesQuidam)}$.<br>`
              // choix du nombre cible qui favorise quidam
              let trouve = false
              for (let j = r - 2; j >= 0; j--) {
                if (probaDiffs[j] < 0) {
                  texteCorr +=
                    numAlpha(this.interactif ? 3 : 2) +
                    ` ${quidam} aurait dû choisir ${j + 2} ${ciblesPourQuidameGagne.length > 1 ? `(ou n'importe quel nombre de la liste ${enumeration(ciblesPourQuidamGagne.map(String)).replace('et', '\\text{ et }')}$)` : ''} comme nombre cible.<br> Sa probabilité de réussir serait alors de $\\textcolor {${Couleurs[(j + 2) % 10]}}{${texFractionFromString(fra1[j], nbCouplesQuidam)}}${simplificationDeFractionAvecEtapes(fra1[j], nbCouplesQuidam)}$ et celle ${deDevant(quidame)} serait de $\\textcolor {${Couleurs[(j + 2) % 10]}}{${texFractionFromString(fra2[j], nbCouplesQuidame)}}${simplificationDeFractionAvecEtapes(fra2[j], nbCouplesQuidame)}$.<br>`
                  trouve = true
                }
                if (trouve) {
                  break
                }
              }
              if (trouve === false) {
                texteCorr +=
                  numAlpha(this.interactif ? 3 : 2) +
                  ` Il n'existe pas de choix qui permette à ${quidam} d'avoir plus de chances ${queDevant(quidame)} de gagner, donc ${texteEnCouleurEtGras(`${quidam} se trompe`)}.<br>`
              }
            } else if (probaDiffs[desQuidam[0] - 1] < 0) {
              // quidam a plus de chances de gagner
              texteCorr += `${texteEnCouleurEtGras(`${quidam} a raison`)} de penser avoir plus de chances de gagner car $${texFractionReduite(fra2[desQuidam[0] - 1], nbCouplesQuidame)}<${texFractionReduite(fra1[desQuidam[0] - 1], nbCouplesQuidam)}$.<br>`
              // choix du nombre cible qui favorise quidame
              let trouve = false
              for (let j = r - 2; j >= 0; j--) {
                if (probaDiffs[j] > 0 && ciblesPourQuidameGagne.length > 0) {
                  texteCorr +=
                    numAlpha(this.interactif ? 3 : 2) +
                    ` ${quidame} devrait choisir $${miseEnEvidence(ciblesPourQuidameGagne[0].toString())}$ ${ciblesPourQuidameGagne.length > 1 ? `(ou n'importe quel nombre de la liste : $${enumeration(ciblesPourQuidameGagne.map(String)).replace('et', '\\text{ et }')}$)` : ''} comme nombre cible.<br>Sa probabilité de réussir serait alors de $\\textcolor {${Couleurs[(j + 2) % 10]}}{${texFractionFromString(fra2[j], nbCouplesQuidame)}}${simplificationDeFractionAvecEtapes(fra2[j], nbCouplesQuidame)}$.<br>Celle ${deDevant(quidam)} serait de $\\textcolor {${Couleurs[(j + 2) % 10]}}{${texFractionFromString(fra1[j], nbCouplesQuidam)}}${simplificationDeFractionAvecEtapes(fra1[j], nbCouplesQuidam)}$ et $${texFractionReduite(fra1[j], nbCouplesQuidam)}<${texFractionFromString(fra2[j], nbCouplesQuidame)}$.<br>`
                  trouve = true
                }
                if (trouve) {
                  break
                }
              }
              if (trouve === false) {
                texteCorr +=
                  numAlpha(this.interactif ? 3 : 2) +
                  ` Il n'existe pas de choix qui permette à ${quidame} d'avoir plus de chances ${queDevant(quidam)} de gagner.<br>`
              }
            } else {
              // Ils ont autant de chances de gagner l'un que l'autre
              texteCorr += `${quidam} et ${quidame} ont autant de chances de gagner car ils ont tous deux la même probabilité de faire ${desQuidam[0] + 1}, ce qui répond à la question ${numAlpha(this.interactif ? 4 : 3)}.<br>`
              // choix du nombre cible qui favorise quidam
              let trouve = false
              for (let j = r - 2; j >= 0; j--) {
                if (probaDiffs[j] < 0) {
                  texteCorr +=
                    numAlpha(this.interactif ? 3 : 2) +
                    ` ${quidam} aurait dû choisir $${miseEnEvidence(String(j + 2))}$ ${ciblesPourQuidamGagne.length > 1 ? `(ou n'importe quel nombre de la liste : $${enumeration(ciblesPourQuidamGagne.map(String)).replace('et', '\\text{ et }')}$)` : ''} comme nombre cible.<br> Sa probabilité de réussir serait alors de $\\textcolor {${Couleurs[(j + 2) % 10]}}{${texFractionFromString(fra1[j], nbCouplesQuidam)}}${simplificationDeFractionAvecEtapes(fra1[j], nbCouplesQuidam)}$ et celle ${deDevant(quidame)} serait de $\\textcolor {${Couleurs[(j + 2) % 10]}}{${texFractionFromString(fra2[j], nbCouplesQuidame)}}${simplificationDeFractionAvecEtapes(fra2[j], nbCouplesQuidame)}$.<br>`
                  trouve = true
                }
                if (trouve) {
                  break
                }
              }
              if (trouve === false) {
                texteCorr +=
                  numAlpha(this.interactif ? 3 : 2) +
                  ` Il n'existe pas de choix qui permette à ${quidam} d'avoir plus de chances ${queDevant(quidame)} de gagner.<br>`
              }
            }
            if (probaDiffs[desQuidam[0] - 1] === 0) {
              texteCorr +=
                numAlpha(this.interactif ? 4 : 3) +
                ` Il a été déjà répondu à cette question à la question ${numAlpha(this.interactif ? 2 : 1)}.<br>`
            } else {
              // choix de la cible pour un jeu équitable
              let trouve = false
              for (let j = r - 2; j >= 0; j--) {
                if (probaDiffs[j] === 0) {
                  texteCorr +=
                    numAlpha(this.interactif ? 4 : 3) +
                    ` En choisissant $${miseEnEvidence(String(j + 2))}$ comme cible, ${quidam} et ${quidame} ont la même probabilité de gagner.<br>
                                Pour ${quidam} la probabilité est : $\\textcolor {${Couleurs[(j + 2) % 10]}}{${texFractionFromString(fra1[j], nbCouplesQuidam)}}${simplificationDeFractionAvecEtapes(fra1[j], nbCouplesQuidam)}$ tout comme pour ${quidame} : $\\textcolor {${Couleurs[(j + 2) % 10]}}{${texFractionFromString(fra2[j], nbCouplesQuidame)}}${simplificationDeFractionAvecEtapes(fra2[j], nbCouplesQuidame)}$.<br>`
                  trouve = true
                }
                if (trouve) {
                  break
                }
              }
              if (trouve === false) {
                texteCorr +=
                  numAlpha(this.interactif ? 4 : 3) +
                  ` Il n'existe pas de choix qui permette à ${quidam} et à ${quidame} d'avoir la même probabilité de gagner car : <br>`
                for (let j = 2; j < r / 2; j++) {
                  texteCorr += `$\\textcolor {${Couleurs[j % 10]}}{${texFractionFromString(fra1[j - 2], nbCouplesQuidam)}}\\ne \\textcolor {${Couleurs[j % 10]}}{${texFractionFromString(fra2[j - 2], nbCouplesQuidame)}}$ ; `
                }
                texteCorr += `$\\textcolor {${Couleurs[(r / 2) % 10]}}{${texFractionFromString(fra1[r / 2], nbCouplesQuidam)}}\\ne \\textcolor {${Couleurs[(r / 2) % 10]}}{${texFractionFromString(fra2[r / 2], nbCouplesQuidame)}}$.`
              }
            }
            if (!this.interactif) {
              texte = `${quidam} dispose d'un dé à ${desQuidam[0]} faces numérotées de 1 à ${desQuidam[0]} et d'un dé à ${desQuidam[1]} faces numérotées de 1 à ${desQuidam[1]}.<br>`
              texte += 'Il lance ses deux dés et en fait la somme.<br>'
              texte += createList({
                items: [
                  ' Reporter dans un tableau les issues possibles de cette expérience aléatoire et leurs probabilités respectives.',
                  ` ${quidame} dispose d'un dé à ${desQuidame[0]} faces numérotées de 1 à ${desQuidame[0]} et d'un dé à ${desQuidame[1]} faces numérotées de 1 à ${desQuidame[1]}.<br>
                  Elle décide de proposer un défi à ${quidam} :<br>"On choisit un nombre cible entre 2 et ${r}, on lance nos deux dés en même temps. Le premier dont la somme des dés est la cible a gagné."<br>
                  ${quidam} qui connaît les probabilités calculées à la question ${numAlpha(0)} propose alors de choisir ${desQuidam[0] + 1} comme nombre cible.<br>Il pense avoir plus de chances de gagner ${queDevant(quidame)}.<br>A-t-il raison ?`,
                  `Si oui, quel nombre doit choisir ${quidame} pour avoir un défi qui lui soit favorable et si non, y a-t-il un meilleur choix pour ${quidam} ?`,
                  ' Y a-t-il un nombre cible qui donne un jeu équitable où chacun aura la même probabilité de gagner ?',
                ],
                style: 'alpha',
              })
              texte +=
                '$\\textit {Exercice inspiré des problèmes DuDu (mathix.org)}$'
            } else {
              const QuidamGagne = probaDiffs[desQuidam[0] - 1] < 0

              texte = `${quidam} dispose d'un dé à ${desQuidam[0]} faces numérotées de 1 à ${desQuidam[0]} et d'un dé à ${desQuidam[1]} faces numérotées de 1 à ${desQuidam[1]}.
              Il lance ses deux dés et en fait la somme.<br>${addMultiMathfield(
                this,
                i,
                {
                  dataTemplate: `a) Quelles sont les différentes issues de l'expérience ${deDevant(quidam)} ? %{champ1}\nb) Quelle est la probabilité de l'issue ${desQuidam[0] + 1} ? %{champ2}\n${quidame} dispose d'un dé à ${desQuidame[0]} faces numérotées de 1 à ${desQuidame[0]} et d'un dé à ${desQuidame[1]} faces numérotées de 1 à ${desQuidame[1]}.
              Elle décide de proposer un défi à ${quidam} : "On choisit un nombre cible entre 2 et ${r}. On lance nos deux dés en même temps. Le premier dont la somme des dés est la cible a gagné."
              c) ${quidam}, qui connaît les probabilités des différentes issues avec son jeu de dés, propose alors de choisir ${desQuidam[0] + 1} comme nombre cible. A-t-il raison (O ou N)? %{champ3}\nd) Si oui, quel nombre doit choisir ${quidame} pour avoir un défi qui lui soit favorable ? Et si non, donner un meilleur choix pour ${quidam} (sachant que le nombre cible doit être faisable par chacun). S'il n'y en a pas, répondre $\\emptyset$. %{champ4}\ne) Y a-t-il un nombre cible qui donne un jeu équitable où chacun aura la même probabilité de gagner ? Si oui, quel est ce nombre ? Si non, répondre $\\emptyset$. %{champ5}\n`,
                  dataOptions: {
                    champ1: { keyboard: KeyboardType.clavierDeBase },
                    champ2: {
                      keyboard: KeyboardType.clavierDeBaseAvecFraction,
                    },
                    champ3: { keyboard: KeyboardType.vFON },
                    champ4: { keyboard: KeyboardType.clavierEnsemble },
                    champ5: { keyboard: KeyboardType.clavierEnsemble },
                  },
                },
              )}`
              handleAnswers(
                this,
                i,
                {
                  bareme: toutAUnPoint,
                  champ1: {
                    value: `${rangeMinMax(2, somme1)
                      .map((i) => i.toString())
                      .join(';')}`,
                    options: { suiteDeNombres: true },
                  },
                  champ2: {
                    value: fraction(fra1[desQuidam[0]], nbCouplesQuidam)
                      .texFraction,
                    options: { fractionEgale: true },
                  },
                  champ3: {
                    value:
                      probaDiffs[desQuidam[0] - 1] < 0
                        ? ['oui', 'o']
                        : ['non', 'n'],
                    options: { texteSansCasse: true },
                  },
                  champ4: {
                    value: QuidamGagne
                      ? ciblesPourQuidameGagne.length > 0
                        ? ciblesPourQuidameGagne
                        : '\\emptyset'
                      : ciblesPourQuidamGagne.length > 0
                        ? ciblesPourQuidamGagne
                        : '\\emptyset',
                  },
                  champ5: {
                    value:
                      ciblesEquitables.length > 0
                        ? ciblesEquitables
                        : '\\emptyset',
                  },
                },
                { formatInteractif: 'multi-mathfield' },
              )
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
