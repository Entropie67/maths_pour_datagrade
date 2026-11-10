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

import { orangeMathalea } from 'apigeom/src/elements/defaultValues'
import { bleuMathalea } from '../../lib/colors'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { troisPointsProportionnels } from '../../lib/interactif/fonctionsBaremes'
import { enumeration } from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { rangeMinMax } from '../../lib/outils/nombres'
import { fraction } from '../../modules/fractions'
import Exercice from '../Exercice'
export const dateDeModifImportante = '03/10/2026'

export const titre =
  'Résoudre un problème basé sur une expérience aléatoire à deux épreuves'
export const interactifReady = true

export const uuid = '7315c'

export const refs = {
  'fr-fr': ['2P10-5'],
  'fr-ch': ['NR'],
}

/**
 * Calculs de probabilités sur une expérience aléatoire à deux épreuves
 * @author Jean-claude Lhote
 */
export default class FonctionsProbabilite2 extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de problèmes : ',
      'Nombres séparés par des tirets :\n1 : Yaourts\n2 : Cartes (avec remise)\n3 : Cartes (sans remise)\n4 : Chaussettes\n5 : Dés\n6 : Mélange',
    ]
    this.nbQuestions = 1

    this.spacing = 2
    this.spacingCorr = context.isHtml ? 2 : 2
    this.sup = 1
    this.comment = `Selon le type de problème, le nombre de questions peut être différent. En interactif, chaque problème est noté sur 3 points, en proportion des réponses justes.`
  }

  nouvelleVersion() {
    // const indexDisponibles = [0, 1, 2, 3]
    // const listeIndex = combinaisonListes(indexDisponibles, this.nbQuestions)
    const listeIndex = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 5,
      melange: 6,
      defaut: 6,
    }).map(Number)

    const qualites: string[][] = []
    const Initiale: string[] = []
    const Couleurs = [
      'red',
      'green',
      bleuMathalea,
      'gray',
      'brown',
      'orange',
      'magenta',
      'purple',
      'black',
      'teal',
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
      // Les deux problèmes de cartes (avec ou sans remise) partagent le même cas
      const choix = [0, 1, 1, 2, 3][listeIndex[i] - 1]
      const avecRemise = listeIndex[i] === 2
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
          // Les trois parfums ne doivent pas avoir le même nombre de yaourts
          if (n[p] === n[q] && n[q] === n[r]) n[r] = choice([2, 6])

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

          texte = `Dans le frigo, il y a $${somme1}$ yaourts : $${n[p]}$ sont ${qualites[0][p]}, $${n[q]}$ sont ${qualites[0][q]} et $${n[r]}$ sont ${qualites[0][r]}.<br>`
          texte += `${quidame} en choisit un au hasard. Son frère ${quidam} en choisit ensuite un au hasard parmi ceux qui restent.<br>`
          texte += `On s'intéresse aux parfums des deux yaourts choisis.<br>`
          texte += addMultiMathfield(this, i, {
            dataTemplate: `a) Combien d'issues possède cette expérience aléatoire ? %{champ1}
            b) Est-ce une expérience en situation d'équiprobabilité ? %{champ2}
            c) Calculer la probabilité ${queDevant(quidame)} et ${quidam} aient choisi tous les deux un yaourt ${qualites[0][p]}. %{champ3}
            d) Calculer la probabilité qu'ils aient choisi des yaourts aux parfums identiques. %{champ4}
            e) Calculer la probabilité qu'ils aient choisi des yaourts aux parfums différents. %{champ5}`,
            dataOptions: {
              champ1: { keyboard: KeyboardType.clavierNumbers },
              champ2: {
                choices: [
                  { label: 'Choisir…', value: '' },
                  { label: 'Oui', value: 'oui' },
                  { label: 'Non', value: 'non' },
                ],
              },
              champ3: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
              champ4: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
              champ5: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
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
              bareme: troisPointsProportionnels,
              champ1: { value: 9 },
              champ2: { value: 'non' },
              champ3: {
                value: probaMemeSaveurParticuliere.texFraction,
                options: { fractionEgale: true },
              },
              champ4: {
                value: probaMemeSaveur.texFraction,
                options: { fractionEgale: true },
              },
              champ5: {
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
            ` ${quidame} peut avoir choisi un yaourt ${qualites[0][p]}, ${qualites[0][q]} ou ${qualites[0][r]}. Une fois qu'elle a choisi, et comme il y a au moins $2$ yaourts de chaque sorte, ${quidam} a les mêmes $3$ possibilités. Il y a donc $3\\times3=${miseEnEvidence('9')}$ issues possibles.<br>`
          texteCorr += `Par exemple : ${quidame} a pris un yaourt ${qualites[0][p]} et ${quidam} un yaourt ${qualites[0][q]}. Ce qu'on peut noter (${Initiale[p]},${Initiale[q]}).<br>`
          texteCorr += 'Les $9$ issues sont : '

          texteCorr += issues
          texteCorr += '.<br>'

          // Question b : le parfum le plus fréquent et le moins fréquent donnent deux issues de probabilités différentes
          const [plusNombreux, moinsNombreux] = [
            [p, q, r].reduce((a, b) => (n[b] > n[a] ? b : a)),
            [p, q, r].reduce((a, b) => (n[b] < n[a] ? b : a)),
          ]
          texteCorr +=
            numAlpha(1) +
            ` Il y a plus de yaourts ${qualites[0][plusNombreux]} que de yaourts ${qualites[0][moinsNombreux]}, donc il est plus probable qu'ils choisissent tous les deux un yaourt ${qualites[0][plusNombreux]} que tous les deux un yaourt ${qualites[0][moinsNombreux]} : les issues (${Initiale[plusNombreux]},${Initiale[plusNombreux]}) et (${Initiale[moinsNombreux]},${Initiale[moinsNombreux]}) n'ont pas la même probabilité.<br>`
          texteCorr += `${texteEnCouleurEtGras("Ce n'est donc pas une situation d'équiprobabilité.")}<br>`

          // Question c
          texteCorr +=
            numAlpha(2) +
            ` Il y a $${n[p]}$ yaourts ${qualites[0][p]} et $${somme1}$ yaourts en tout, donc la probabilité ${queDevant(quidame)} choisisse un yaourt ${qualites[0][p]} est : $${probaTirage1.texFSD}${probaTirage1.texSimplificationAvecEtapes()}$.<br>`
          texteCorr += `Ensuite, il reste $${n[p] - 1}$ yaourt${n[p] - 1 > 1 ? 's' : ''} ${qualites[0][p]} pour ${quidam} sur un total de $${somme1 - 1}$ yaourts.<br>`
          texteCorr += `La probabilité qu'il choisisse à son tour et dans ces conditions ce parfum est : $${probaTirage2.texFSD}${probaTirage2.texSimplificationAvecEtapes()}$.<br>`
          texteCorr += `La probabilité de l'issue (${Initiale[p]},${Initiale[p]}) est le produit de ces deux probabilités, donc : $${probaTirage1.texFSD}\\times${probaTirage2.texFSD}${probaMemeSaveurParticuliere.texSimplificationAvecEtapes('none', orangeMathalea)}$.<br>`
          // Question d
          texteCorr +=
            numAlpha(3) +
            ` Les probabilités des issues (${Initiale[q]},${Initiale[q]}) et (${Initiale[r]},${Initiale[r]}) peuvent être respectivement calculées de la même façon qu'à la question c) :<br>`
          texteCorr += `$${tirages[1][0].texFSD}\\times${tirages[1][1].texFSD}=${probas[1].texFSD}$ et $${tirages[2][0].texFSD}\\times${tirages[2][1].texFSD}=${probas[2].texFSD}$.<br>`
          texteCorr += `La probabilité qu'ils choisissent le même parfum est la somme des probabilités des issues (${Initiale[p]},${Initiale[p]}), (${Initiale[q]},${Initiale[q]}) et (${Initiale[r]},${Initiale[r]}), soit :<br>`
          // Somme non simplifiée, puis simplification jusqu'au résultat mis en évidence
          const sommeProbas = fraction(
            [p, q, r].reduce((acc, x) => acc + n[x] * (n[x] - 1), 0),
            somme1 * (somme1 - 1),
          )
          texteCorr += `$${probas.map((p) => p.texFSD).join('+')}=${
            sommeProbas.estIrreductible
              ? miseEnEvidence(sommeProbas.texFSD)
              : sommeProbas.texFSD +
                sommeProbas.texSimplificationAvecEtapes('none', orangeMathalea)
          }$.<br>`
          // Question e
          texteCorr +=
            numAlpha(4) +
            " Choisir des parfums différents est l'événement contraire de l'événement dont on a calculé la probabilité à la question d).<br>"

          const num = probaMemeSaveur.num
          const den = probaMemeSaveur.den
          texteCorr += `La probabilité de cet événement est donc : $1-${probaMemeSaveur.texFraction}=${fraction(den, den).texFraction}-${probaMemeSaveur.texFraction}=${miseEnEvidence(fraction(den - num, den).texFraction)}$.`

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
          const carte = Initiale[r]
          const cartes =
            carte + (carte === 'valet' || carte === 'roi' ? 's' : '')
          const couleur = qualites[1][p]
          const couleurs = couleur + (couleur === 'carreau' ? 'x' : 's')
          // Fraction a/b, suivie de sa forme simplifiée si elle existe
          const texFractionEtSimplifiee = (a: number, b: number) => {
            const f = fraction(a, b)
            return f.estIrreductible
              ? f.texFraction
              : `${f.texFraction}=${f.texFractionSimplifiee}`
          }
          const unQuart = fraction(1, 4)
          const quatreCartes = fraction(4, q)
          const troisCartes = fraction(3, q - 1)
          const memeCouleur = fraction(q / 2 - 1, q - 1)
          const deuxiemeCouleur = fraction(q / 4 - 1, q - 1)
          const deuxCartesAvecRemise =
            quatreCartes.produitFraction(quatreCartes)
          const deuxCouleursAvecRemise = unQuart.produitFraction(unQuart)
          const deuxCartesSansRemise = quatreCartes.produitFraction(troisCartes)
          const deuxCouleursSansRemise =
            unQuart.produitFraction(deuxiemeCouleur)

          texte = avecRemise
            ? `On tire au hasard une carte dans un jeu de $${q}$ cartes, on la remet dans le jeu, puis on tire au hasard une deuxième carte.<br>`
            : `On tire au hasard une carte dans un jeu de $${q}$ cartes puis, sans la remettre dans le jeu, on tire au hasard une deuxième carte.<br>`
          texte += addMultiMathfield(this, i, {
            dataTemplate: `a) Quelle est la probabilité de tirer $2$ cartes de la même couleur (deux rouges ou deux noires) ? %{champ1}
            b) Quelle est la probabilité de tirer $2$ ${cartes} ? %{champ2}
            c) Quelle est la probabilité de tirer $2$ cartes de ${couleur} ? %{champ3}`,
            dataOptions: {
              champ1: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
              champ2: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
              champ3: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
            },
          })

          if (avecRemise) {
            texteCorr =
              numAlpha(0) +
              ` Quelle que soit la première carte, il faut que la deuxième soit de la même couleur. Comme la première carte est remise, il y a toujours $${q / 2}$ cartes de cette couleur sur $${q}$, donc la probabilité est : $${fraction(q / 2, q).texFraction}=${miseEnEvidence(fraction(1, 2).texFraction)}$.<br>`
            texteCorr +=
              numAlpha(1) +
              ` Il y a $4$ ${cartes} sur $${q}$ cartes, donc la probabilité de tirer un ${carte} est $${texFractionEtSimplifiee(4, q)}$. Comme la première carte est remise, c'est aussi la probabilité de tirer un ${carte} au deuxième tirage.<br>`
            texteCorr += `La probabilité de tirer $2$ ${cartes} est donc : $${quatreCartes.texFractionSimplifiee}\\times${quatreCartes.texFractionSimplifiee}=${miseEnEvidence(deuxCartesAvecRemise.texFractionSimplifiee)}$.<br>`
            texteCorr +=
              numAlpha(2) +
              ` Il y a $${q / 4}$ cartes de ${couleur} sur $${q}$ cartes, donc la probabilité de tirer un ${couleur} est $${texFractionEtSimplifiee(q / 4, q)}$. Comme la première carte est remise, c'est aussi la probabilité de tirer un ${couleur} au deuxième tirage.<br>`
            texteCorr += `La probabilité de tirer $2$ ${couleurs} est donc : $${unQuart.texFraction}\\times${unQuart.texFraction}=${miseEnEvidence(deuxCouleursAvecRemise.texFractionSimplifiee)}$.`
          } else {
            texteCorr =
              numAlpha(0) +
              ` Quelle que soit la première carte, il faut que la deuxième soit de la même couleur. Il reste $${q - 1}$ cartes, dont $${q / 2 - 1}$ de cette couleur, donc la probabilité est : $${miseEnEvidence(memeCouleur.texFractionSimplifiee)}$.<br>`
            texteCorr +=
              numAlpha(1) +
              ` La probabilité que la première carte soit un ${carte} est $${texFractionEtSimplifiee(4, q)}$. Il reste alors $3$ ${cartes} parmi les $${q - 1}$ cartes restantes, donc la probabilité que la deuxième carte soit aussi un ${carte} est $${texFractionEtSimplifiee(3, q - 1)}$.<br>`
            texteCorr += `La probabilité de tirer $2$ ${cartes} est donc : $${quatreCartes.texFractionSimplifiee}\\times${troisCartes.texFractionSimplifiee}=${miseEnEvidence(deuxCartesSansRemise.texFractionSimplifiee)}$.<br>`
            texteCorr +=
              numAlpha(2) +
              ` Il y a $${q / 4}$ cartes de ${couleur} sur $${q}$ cartes, donc la probabilité que la première carte soit un ${couleur} est $${texFractionEtSimplifiee(q / 4, q)}$. Il reste alors $${q / 4 - 1}$ cartes de ${couleur} parmi les $${q - 1}$ cartes restantes, donc la probabilité que la deuxième carte soit aussi un ${couleur} est $${texFractionEtSimplifiee(q / 4 - 1, q - 1)}$.<br>`
            texteCorr += `La probabilité de tirer $2$ ${couleurs} est donc : $${unQuart.texFraction}\\times${deuxiemeCouleur.texFractionSimplifiee}=${miseEnEvidence(deuxCouleursSansRemise.texFractionSimplifiee)}$.`
          }
          handleAnswers(
            this,
            i,
            {
              bareme: troisPointsProportionnels,
              champ1: {
                value: (avecRemise ? fraction(1, 2) : memeCouleur).texFraction,
                options: { fractionEgale: true },
              },
              champ2: {
                value: (avecRemise
                  ? deuxCartesAvecRemise
                  : deuxCartesSansRemise
                ).texFractionSimplifiee,
                options: { fractionEgale: true },
              },
              champ3: {
                value: (avecRemise
                  ? deuxCouleursAvecRemise
                  : deuxCouleursSansRemise
                ).texFractionSimplifiee,
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
            texte = `Dans sa commode, ${quidam} a rangé des paires de chaussettes dans le premier tiroir : $${n[0]}$ paires ${qualites[2][0]}, $${n[1]}$ paires ${qualites[2][1]} et $${n[2]}$ paires ${qualites[2][2]}.<br>`
            texte += `Dans le deuxième tiroir, il a rangé des T-shirts : $${m[0]}$ ${qualites[5][0]}, $${m[1]}$ ${qualites[5][1]} et $${m[2]}$ ${qualites[5][2]}.<br>`
            texte += `Un matin, il y a une panne de courant : ${quidam} prend au hasard une paire de chaussettes dans le premier tiroir et un T-shirt dans le deuxième.<br>`
            texte += addMultiMathfield(this, i, {
              dataTemplate: `a) Quelle est la probabilité que les chaussettes et le T-shirt soient tous les deux ${qualites[5][r]} ? %{champ1}
              b) Quelle est la probabilité que les chaussettes et le T-shirt soient de la même couleur ? %{champ2}
              c) Quelle est la probabilité que les chaussettes et le T-shirt soient de couleurs différentes ? %{champ3}`,
              dataOptions: {
                champ1: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
                champ2: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
                champ3: { keyboard: KeyboardType.clavierDeBaseAvecFraction },
              },
            })

            const denominateur = somme1 * somme2
            // Fraction a/b non simplifiée, suivie de sa forme simplifiée mise en évidence
            const resultat = (a: number, b: number) => {
              const f = fraction(a, b)
              return f.estIrreductible
                ? miseEnEvidence(f.texFraction)
                : `${f.texFraction}=${miseEnEvidence(f.texFractionSimplifiee)}`
            }
            const produitCouleur = (j: number) =>
              `\\dfrac{${n[j]}}{${somme1}}\\times\\dfrac{${m[j]}}{${somme2}}`
            const memeCouleur = [0, 1, 2].reduce(
              (acc, j) => acc + n[j] * m[j],
              0,
            )

            // Question a)
            texteCorr =
              numAlpha(0) +
              ` La probabilité de prendre une paire de chaussettes ${qualites[2][r]} est $\\dfrac{${n[r]}}{${somme1}}$ et celle de prendre un T-shirt ${qualites[5][r].replace(/s$/, '')} est $\\dfrac{${m[r]}}{${somme2}}$.<br>`
            texteCorr += `La probabilité que les chaussettes et le T-shirt soient tous les deux ${qualites[5][r]} est donc : $${produitCouleur(r)}=${resultat(n[r] * m[r], denominateur)}$.<br>`
            // Question b)
            texteCorr +=
              numAlpha(1) +
              ` On calcule de la même façon la probabilité que les chaussettes et le T-shirt soient tous les deux ${qualites[5][0]}, tous les deux ${qualites[5][1]} ou tous les deux ${qualites[5][2]}, puis on additionne ces trois probabilités :<br>`
            texteCorr += `$${[0, 1, 2].map(produitCouleur).join('+')}=${resultat(memeCouleur, denominateur)}$.<br>`
            // Question c)
            const probaMemeCouleur = fraction(memeCouleur, denominateur)
            texteCorr +=
              numAlpha(2) +
              " L'événement «\u00a0les chaussettes et le T-shirt sont de couleurs différentes\u00a0» est l'événement contraire de l'événement «\u00a0les chaussettes et le T-shirt sont de la même couleur\u00a0».<br>"
            texteCorr += `Sa probabilité est donc : $1-${probaMemeCouleur.texFractionSimplifiee}=${resultat(probaMemeCouleur.denIrred - probaMemeCouleur.numIrred, probaMemeCouleur.denIrred)}$.<br>`

            handleAnswers(
              this,
              i,
              {
                bareme: troisPointsProportionnels,
                champ1: {
                  value: fraction(n[r] * m[r], denominateur).texFraction,
                  options: { fractionEgale: true },
                },
                champ2: {
                  value: probaMemeCouleur.texFraction,
                  options: { fractionEgale: true },
                },
                champ3: {
                  value: fraction(denominateur - memeCouleur, denominateur)
                    .texFraction,
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
              // Les deux enfants ne doivent pas avoir les mêmes dés
            } while (
              desQuidam[0] + 1 > somme2 ||
              (desQuidam[0] === desQuidame[0] && desQuidam[1] === desQuidame[1])
            )
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
              texteCorr += `Les issues de l'expérience ${deDevant(quidam)} sont les sommes possibles des deux dés, c'est-à-dire les nombres entiers de $2$ à $${somme1}$ : $${miseEnEvidence(
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
              texteCorr += `La probabilité ${queDevant(quidam)} obtienne $${desQuidam[0] + 1}$ est : $${miseEnEvidence(fraction(fra1[desQuidam[0] - 1], nbCouplesQuidam).texFraction)}$.<br>`
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

            // Probabilité (colorée comme dans les tableaux, puis simplifiée) d'obtenir la somme cible
            const probaCible = (cible: number, deQuidam: boolean) =>
              `\\textcolor {${Couleurs[cible % 10]}}{${texFractionFromString(deQuidam ? fra1[cible - 2] : fra2[cible - 2], deQuidam ? nbCouplesQuidam : nbCouplesQuidame)}}${simplificationDeFractionAvecEtapes(deQuidam ? fra1[cible - 2] : fra2[cible - 2], deQuidam ? nbCouplesQuidam : nbCouplesQuidame)}`
            const liste = (cibles: number[]) =>
              cibles.length > 1
                ? ` (ou n'importe quel nombre parmi $${enumeration(cibles.map(String)).replace('et', '\\text{ et }')}$)`
                : ''
            const cibleQuidam = desQuidam[0] + 1
            const lettreD = numAlpha(this.interactif ? 3 : 2)
            const lettreE = numAlpha(this.interactif ? 4 : 3)
            texteCorr += `La probabilité qu'a ${quidame} d'obtenir $${cibleQuidam}$ est : $${probaCible(cibleQuidam, false)}$.<br>`
            texteCorr += `La probabilité qu'a ${quidam} d'obtenir $${cibleQuidam}$ est : $${probaCible(cibleQuidam, true)}$.<br>`
            if (probaDiffs[cibleQuidam - 2] > 0) {
              // quidame a plus de chances de gagner avec le choix de quidam
              texteCorr += `${texteEnCouleurEtGras(`${quidam} se trompe`)} : il a moins de chances de gagner ${queDevant(quidame)}, car $${texFractionReduite(fra1[cibleQuidam - 2], nbCouplesQuidam)}<${texFractionReduite(fra2[cibleQuidam - 2], nbCouplesQuidame)}$.<br>`
              const meilleure = ciblesPourQuidamGagne.at(-1)
              texteCorr +=
                meilleure === undefined
                  ? `${lettreD} Aucun nombre cible ne donne à ${quidam} plus de chances de gagner qu'à ${quidame} : la réponse est $${miseEnEvidence('\\emptyset')}$.<br>`
                  : `${lettreD} ${quidam} aurait dû choisir $${miseEnEvidence(String(meilleure))}$${liste(ciblesPourQuidamGagne)} comme nombre cible.<br>Sa probabilité de gagner serait alors de $${probaCible(meilleure, true)}$ et celle ${deDevant(quidame)} de $${probaCible(meilleure, false)}$.<br>`
            } else if (probaDiffs[cibleQuidam - 2] < 0) {
              // quidam a plus de chances de gagner
              texteCorr += `${texteEnCouleurEtGras(`${quidam} a raison`)} : il a plus de chances de gagner ${queDevant(quidame)}, car $${texFractionReduite(fra1[cibleQuidam - 2], nbCouplesQuidam)}>${texFractionReduite(fra2[cibleQuidam - 2], nbCouplesQuidame)}$.<br>`
              const meilleure = ciblesPourQuidameGagne.at(-1)
              texteCorr +=
                meilleure === undefined
                  ? `${lettreD} Aucun nombre cible ne donne à ${quidame} plus de chances de gagner qu'à ${quidam} : la réponse est $${miseEnEvidence('\\emptyset')}$.<br>`
                  : `${lettreD} ${quidame} devrait choisir $${miseEnEvidence(String(meilleure))}$${liste(ciblesPourQuidameGagne)} comme nombre cible.<br>Sa probabilité de gagner serait alors de $${probaCible(meilleure, false)}$ et celle ${deDevant(quidam)} de $${probaCible(meilleure, true)}$.<br>`
            } else {
              // Ils ont autant de chances de gagner l'un que l'autre
              texteCorr += `${texteEnCouleurEtGras(`${quidam} se trompe`)} : ${quidam} et ${quidame} ont autant de chances de gagner, car ils ont la même probabilité d'obtenir $${cibleQuidam}$.<br>`
              const meilleure = ciblesPourQuidamGagne.at(-1)
              texteCorr +=
                meilleure === undefined
                  ? `${lettreD} Aucun nombre cible ne donne à ${quidam} plus de chances de gagner qu'à ${quidame} : la réponse est $${miseEnEvidence('\\emptyset')}$.<br>`
                  : `${lettreD} ${quidam} aurait dû choisir $${miseEnEvidence(String(meilleure))}$${liste(ciblesPourQuidamGagne)} comme nombre cible.<br>Sa probabilité de gagner serait alors de $${probaCible(meilleure, true)}$ et celle ${deDevant(quidame)} de $${probaCible(meilleure, false)}$.<br>`
            }
            // Question e) : jeu équitable
            const equitable = ciblesEquitables.at(-1)
            texteCorr +=
              equitable === undefined
                ? `${lettreE} Pour chaque nombre cible de $2$ à $${r}$, les probabilités des deux tableaux sont différentes : aucun nombre cible ne donne un jeu équitable. La réponse est $${miseEnEvidence('\\emptyset')}$.<br>`
                : `${lettreE} En choisissant $${miseEnEvidence(String(equitable))}$${liste(ciblesEquitables)} comme nombre cible, ${quidam} et ${quidame} ont la même probabilité de gagner : $${probaCible(equitable, true)}$ pour ${quidam}, tout comme pour ${quidame} : $${probaCible(equitable, false)}$.<br>`
            const desDe = (des: number[]) =>
              `d'un dé à $${des[0]}$ faces numérotées de $1$ à $${des[0]}$ et d'un dé à $${des[1]}$ faces numérotées de $1$ à $${des[1]}$`
            const presentationQuidam = `${quidam} dispose ${desDe(desQuidam)}. Il lance ses deux dés et en fait la somme.<br>`
            const presentationDefi = `${quidame} dispose ${desDe(desQuidame)}. Elle propose un défi à ${quidam} : «${sp()}On choisit un nombre cible entre $2$ et $${r}$, puis on lance nos deux dés en même temps. Le premier dont la somme des dés est égale à la cible a gagné.${sp()}»`
            const choixQuidam = `${quidam}, qui connaît les probabilités des différentes issues avec ses dés, propose de choisir $${desQuidam[0] + 1}$ comme nombre cible. Il pense avoir plus de chances de gagner ${queDevant(quidame)}. A-t-il raison ?`
            if (!this.interactif) {
              texte = presentationQuidam
              texte += createList({
                items: [
                  'Reporter dans un tableau les issues possibles de cette expérience aléatoire et leurs probabilités respectives.',
                  `${presentationDefi}<br>${choixQuidam}`,
                  `Si oui, quel nombre doit choisir ${quidame} pour avoir un défi qui lui soit favorable ? Si non, y a-t-il un meilleur choix pour ${quidam} ?`,
                  'Y a-t-il un nombre cible qui donne un jeu équitable, où chacun a la même probabilité de gagner ?',
                ],
                style: 'alpha',
              })
              texte +=
                '$\\textit {Exercice inspiré des problèmes DuDu (mathix.org)}$'
            } else {
              const QuidamGagne = probaDiffs[desQuidam[0] - 1] < 0
              // N'importe quel nombre cible convenable est accepté, ou l'ensemble vide s'il n'y en a pas
              const reponseCibles = (cibles: number[]) =>
                cibles.length > 0
                  ? { value: cibles }
                  : {
                      value: '\\emptyset',
                      options: { ensembleDeNombres: true },
                    }

              texte = `${presentationQuidam}${addMultiMathfield(this, i, {
                dataTemplate: `a) Quelles sont les différentes issues de l'expérience ${deDevant(quidam)} ? %{champ1}
              b) Quelle est la probabilité de l'issue $${desQuidam[0] + 1}$ ? %{champ2}
              ${presentationDefi}
              c) ${choixQuidam} %{champ3}
              d) Si oui, quel nombre doit choisir ${quidame} pour avoir un défi qui lui soit favorable ? Si non, donner un meilleur choix pour ${quidam}. S'il n'y en a pas, répondre $\\emptyset$. %{champ4}
              e) Y a-t-il un nombre cible qui donne un jeu équitable, où chacun a la même probabilité de gagner ? Si oui, quel est ce nombre ? Si non, répondre $\\emptyset$. %{champ5}`,
                dataOptions: {
                  champ1: { keyboard: KeyboardType.clavierDeBase },
                  champ2: {
                    keyboard: KeyboardType.clavierDeBaseAvecFraction,
                  },
                  champ3: {
                    choices: [
                      { label: 'Choisir…', value: '' },
                      { label: 'Oui', value: 'oui' },
                      { label: 'Non', value: 'non' },
                    ],
                  },
                  champ4: { keyboard: KeyboardType.clavierEnsemble },
                  champ5: { keyboard: KeyboardType.clavierEnsemble },
                },
              })}`
              handleAnswers(
                this,
                i,
                {
                  bareme: troisPointsProportionnels,
                  champ1: {
                    value: `${rangeMinMax(2, somme1)
                      .map((i) => i.toString())
                      .join(';')}`,
                    options: { suiteDeNombres: true },
                  },
                  champ2: {
                    value: fraction(fra1[desQuidam[0] - 1], nbCouplesQuidam)
                      .texFraction,
                    options: { fractionEgale: true },
                  },
                  champ3: {
                    value: probaDiffs[desQuidam[0] - 1] < 0 ? 'oui' : 'non',
                  },
                  champ4: reponseCibles(
                    QuidamGagne
                      ? ciblesPourQuidameGagne
                      : ciblesPourQuidamGagne,
                  ),
                  champ5: reponseCibles(ciblesEquitables),
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
