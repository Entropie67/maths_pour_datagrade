import { cercle } from '../../lib/2d/cercle'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polyline } from '../../lib/2d/Polyline'
import { tableauColonneLigne } from '../../lib/2d/tableau'
import { texteParPosition } from '../../lib/2d/textes'
import { createList } from '../../lib/format/lists'
import { deuxColonnesResp } from '../../lib/format/miseEnPage'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { texteGras, texteItalique } from '../../lib/outils/embellissements'
import { prenomF, prenomM } from '../../lib/outils/Personne'
import { premierAvec } from '../../lib/outils/primalite'
import { mathalea2d } from '../../modules/mathalea2d'
import ExerciceBrevetA from '../ExerciceBrevetA'
import { sp } from '../../lib/outils/outilString'

export const uuid = 'fc6ad'
export const refs = {
  'fr-fr': ['3Z1DNB-19'],
  'fr-ch': [],
}
export const titre =
  'Préparation DNB : Probabilités, arithmétique et nombres premiers'
export const dateDePublication = '14/04/2025'

/**
 * @Author Jean-claude Lhote
 * Cet exerice exploite la nouvelle classe d'exercice que j'ai conçue pour les sujets de brevet
 * Il s'agit d'un exercice de type Brevet Aléatoirisé
 * La méthode privée appliquerLesValeurs permet de générer les valeurs aléatoires et de construire l'énoncé et la correction
 * La méthode versionOriginale permet de générer les valeurs de l'exercice telles qu'elles sont dans le sujet original
 * La méthode versionAleatoire permet de générer des valeurs aléatoires pour l'exercice
 */
export default class ExercicePolynesie462024 extends ExerciceBrevetA {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false
    this.introduction = texteItalique(
      "D'après l'exercice 4 du brevet Polynésie Juin 2024.",
    ) + '<br>'

    this.versionAleatoire()
  }

  private appliquerLesValeurs(
    u1B1: number,
    u1B2: number,
    u1B3: number,
    u2B1: number,
    u2B2: number,
    u3B1: number,
    u3B2: number,
    prenom1: string,
    prenom2: string,
    resultat2: number,
    facteur: number,
  ): void {
    const urne1 = polyline(pointAbstrait(0, 3), pointAbstrait(0, 0), pointAbstrait(6, 0), pointAbstrait(6, 3))
    urne1.epaisseur = 2
    const urne2 = polyline(pointAbstrait(7, 3), pointAbstrait(7, 0), pointAbstrait(13, 0), pointAbstrait(13, 3))
    urne2.epaisseur = 2
    const b2U1 = cercle(pointAbstrait(3, 1), 0.5)
    const b1U1 = cercle(pointAbstrait(1.5, 1), 0.5)
    const b3U1 = cercle(pointAbstrait(4.5, 1), 0.5)
    const b1U2 = cercle(pointAbstrait(9, 1), 0.5)
    const b2U2 = cercle(pointAbstrait(11, 1), 0.5)
    const n1U1 = texteParPosition(String(u1B1), 1.5, 1)
    const n2U1 = texteParPosition(String(u1B2), 3, 1)
    const n3U1 = texteParPosition(String(u1B3), 4.5, 1)
    const n1U2 = texteParPosition(String(u2B1), 9, 1)
    const n2U2 = texteParPosition(String(u2B2), 11, 1)
    const objets = [
      urne1,
      urne2,
      b1U1,
      b2U1,
      b3U1,
      b1U2,
      b2U2,
      n1U1,
      n2U1,
      n3U1,
      n1U2,
      n2U2,
    ]
    const figure = mathalea2d(
      Object.assign(
        { pixelsParCm: 20, scale: 0.5, display: 'inline' } as const,
        fixeBordures(objets),
      ),
      objets,
    )

    this.enonce = `On dispose de deux boîtes contenant des boules numérotées, indiscernables au toucher.<br>
    ${deuxColonnesResp(
      ` La première contient trois boules numérotées ${u1B1}, ${u1B2} et ${u1B3}.<br>
  La deuxième contient deux boules numérotées ${u2B1} et ${u2B2}.`,
      figure,
      { largeur1: 60, widthmincol1: '400px', widthmincol2: '200px' },
    )}
    On tire au hasard une boule dans la première boîte puis une boule dans la deuxième boîte.<br>
    On s'intéresse au produit des nombres inscrits sur ces deux boules.<br>
    Par exemple, si on tire la boule numérotée ${u1B2} dans la première boîte puis la boule numérotée ${u2B2} dans la deuxième boîte, on obtient comme résultat${sp()}: $${u1B2} \\times ${u2B2} = ${u1B2 * u2B2}$.<br>`
    const entetesCols = [
      '_{\\text{boite 1}}\\backslash ^{\\text{boite 2}}',
      `~${u2B1}~`,
      `~${u2B2}~`,
    ]
    const entetesLignes = [`${u1B1}`, `${u1B2}`, `${u1B3}`]
    const lignes = ['', '', '', `${String(u2B2 * u1B2)}`, '', '']
    const tableau = tableauColonneLigne(entetesCols, entetesLignes, lignes)
    const question1 = `Compléter le tableau à double entrée afin de faire apparaître tous les résultats possibles de cette expérience.<br>
    ${tableau}`
    const lignesCorr = [
      String(u1B1 * u2B1),
      String(u1B1 * u2B2),
      String(u1B2 * u2B1),
      String(u1B2 * u2B2),
      String(u1B3 * u2B1),
      String(u1B3 * u2B2),
    ]
    const tableauCorr = tableauColonneLigne(
      entetesCols,
      entetesLignes,
      lignesCorr,
    )
    const correction1 = `Voici le tableau complété${sp()}:<br>
    ${tableauCorr}`
    const issues = lignesCorr.map((el) => Number(el))
    const issuesFav2 = issues.filter((el) => el === resultat2).length
    const issuesTot = issues.length
    const proba2Tex = `\\dfrac{${issuesFav2}}{${issuesTot}}`
    const question2 = `Quelle est la probabilité d'obtenir ${resultat2} comme résultat${sp()}?`
    const correction2 = `Il y a $${issuesFav2}$ façon${issuesFav2 > 1 ? 's' : ''} d'obtenir $${resultat2}$ comme produit sur $6$ issues possibles.<br>
    La probabilité d'obtenir $${resultat2}$ est de $${proba2Tex}$${issuesFav2 % 2 === 0 ? ` soit $\\dfrac{${issuesFav2 / 2}}{3}$` : ''}.`
    const question3 = `L'affirmation suivante est-elle vraie${sp()}?<br>
    ${texteGras(`Affirmation${sp()}:`)} Il y a 2 chances sur 3 d'obtenir un multiple de ${facteur}.`
    const issuesFav3 = issues.filter((el) => el % facteur === 0).length
    const proba3Tex = `\\dfrac{${issuesFav3}}{${issuesTot}}`
    const correction3 = `Il y a $${issuesFav3}$ façon${issuesFav3 > 1 ? 's' : ''} d'obtenir un multiple de $${facteur}$ sur $6$ issues possibles.<br>
    La probabilité d'obtenir un multiple de $${facteur}$ est de $${proba3Tex}$${issuesFav3 % 2 === 0 ? ` soit $\\dfrac{${issuesFav3 / 2}}{3}$` : ''}.<br>
    Donc l'affirmation est ${issuesFav3 / issuesTot !== 2 / 3 ? texteGras('FAUSSE') : texteGras('VRAIE')}.`
    const question4 = `On ajoute une troisième boîte contenant deux boules numérotées avec des nombres entiers.<br>
    On tire au hasard une boule dans la première boîte, puis une boule dans la deuxième boîte, puis une boule dans la troisième boîte.<br>
    On multiplie les nombres inscrits sur ces boules et on s'intéresse au produit de ces trois nombres.<br>
    ${prenom1} a obtenu comme résultat ${u3B1 * u1B1 * u2B1} et ${prenom2} a obtenu ${u3B2 * u1B2 * u2B1}.<br>
    Quels sont les nombres inscrits sur les boules de la troisième boîte${sp()}?`
    const correction4 = `La décomposition de $${u3B1 * u1B1 * u2B1}$ en produit de facteurs premiers est${sp()}: $${u3B1} \\times ${u1B1} \\times ${u2B1}$.<br>
    La décomposition de $${u3B2 * u1B2 * u2B1}$ en produit de facteurs premiers est${sp()}: $${u3B2} \\times ${u1B2} \\times ${u2B1}$.<br>
    On voit donc que pour obtenir $${u3B1 * u1B1 * u2B1}$, il faut que $${u3B1}$ soit dans la troisième boite et pour obtention $${u3B2 * u1B2 * u2B1}$, il faut que $${u3B2}$ soit aussi dans la troisième boite.<br>
    Donc les boules de la troisième boîte sont numérotées $${u3B1}$ et $${u3B2}$.`
    this.correction = createList({
      items: [correction1, correction2, correction3, correction4],
      style: 'nombres',
    })
    this.enonce += createList({
      items: [question1, question2, question3, question4],
      style: 'nombres',
    })
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(5, 2, 3, 3, 5, 11, 13, 'Anissa', 'Bilel', 15, 3)
  }

  versionAleatoire: () => void = () => {
    const liste = shuffle([2, 3, 5, 7])
    const u1B1 = choice(liste)
    const u1B2 = choice(liste, [u1B1])
    const u1B3 = choice(liste, [u1B1, u1B2])
    const u2B1 = choice(liste)
    const u2B2 = choice(liste, [u2B1])
    const u3B1 = premierAvec(u1B1 * u1B2 * u1B3 * u2B1 * u2B2)
    const u3B2 = premierAvec(u1B1 * u1B2 * u1B3 * u2B1 * u2B2 * u3B1)
    const facteur = choice([u1B1, u1B2, u1B3])
    const resultat2 = facteur * choice([u2B1, u2B2], [facteur])
    const prenom1 = prenomF()
    const prenom2 = prenomM()
    this.appliquerLesValeurs(
      u1B1,
      u1B2,
      u1B3,
      u2B1,
      u2B2,
      u3B1,
      u3B2,
      Array.isArray(prenom1) ? prenom1[0] : prenom1,
      Array.isArray(prenom2) ? prenom2[0] : prenom2,
      resultat2,
      facteur,
    )
  }
}
