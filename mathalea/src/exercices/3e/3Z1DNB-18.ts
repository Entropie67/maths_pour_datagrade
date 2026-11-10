import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { tableauColonneLigne } from '../../lib/2d/tableau'
import { labelPoint } from '../../lib/2d/textes'
import { createList } from '../../lib/format/lists'
import { choice } from '../../lib/outils/arrayOutils'
import { egalOuApprox } from '../../lib/outils/ecritures'
import { texteGras, texteItalique, miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre, texPrix } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceBrevetA from '../ExerciceBrevetA'
import { sp } from '../../lib/outils/outilString'

export const uuid = 'fb7ad'
export const refs = {
  'fr-fr': ['3Z1DNB-18'],
  'fr-ch': [],
}
export const titre =
  "Préparation DNB : Volumes, périmètres, proportionnalité, prise d'initiative"
export const dateDePublication = '13/04/2025'

function meilleurPrix(
  prixPotA: number,
  prixPotB: number,
  nbLitres: number,
): string {
  if (nbLitres <= 5) {
    return `Il faut donc un pot de peinture A de $5~\\mathrm{l}$ à $${texPrix(prixPotA)}$€.`
  } else if (nbLitres <= 10) {
    return prixPotA * 1.5 < prixPotB
      ? `Il est préférable de prendre deux pots de peinture A de $5~\\mathrm{l}$ dont le deuxième est à $50\\,\\%$ de réduction, soit un total de $${texPrix(prixPotA)}+\\dfrac{${texPrix(prixPotA)}}{2}=${texPrix(prixPotA * 1.5)}$€ plutôt qu'un pot de peinture B à $${texPrix(prixPotB)}$€.`
      : `Il est préférable de prendre un pot de peinture B de $10~\\mathrm{l}$ à $${texPrix(prixPotB)}$€ plutôt que deux pots de peinture A de $5~\\mathrm{l}$ dont le deuxième est à $50\\,\\%$ de réduction pour un total de $${texPrix(prixPotA)}+\\dfrac{${texPrix(prixPotA)}}{2}=${texPrix(prixPotA * 1.5)}$€.`
  } else if (nbLitres <= 15) {
    if (2.5 * prixPotA < 1.5 * prixPotB) {
      return `Il est préférable de prendre trois pots de peinture A de $5~\\mathrm{l}$ à $${texPrix(prixPotA)}$€ dont un à $50\\,\\%$ soit au total de $2,5\\times ${texPrix(prixPotA)}=${texPrix(2.5 * prixPotA)}$€ plutôt qu'un pot de peinture A de $5~\\mathrm{l}$ à $${texPrix(prixPotA)}$€ et un pot de peinture B de $10~\\mathrm{l}$ à $${texPrix(prixPotB)}$€, soit un total de $${texPrix(prixPotA + prixPotB)}$€.`
    }
    return prixPotA + prixPotB < prixPotB * 1.5
      ? `Il est préférable de prendre un pot de peinture A de $5~\\mathrm{l}$ à $${texPrix(prixPotA)}$€ et un pot de peinture B de $10~\\mathrm{l}$ à $${texPrix(prixPotB)}$€, soit un total de $${texPrix(prixPotA + prixPotB)}$€ plutôt que deux pots de peinture B de $10~\\mathrm{l}$ le deuxième étant à $50\\,\\%$ soit au total $${texPrix(prixPotB)}\\times 1,5=${texPrix(prixPotB * 1.5)}$€.<br>
      De plus, trois pots de peinture A seront au prix de $2,5\\times ${texPrix(prixPotA)}=${texPrix(2.5 * prixPotA)}$€, ce qui est moins intéressant.`
      : `Il est préférable de prendre deux pots de peinture B de $10~\\mathrm{l}$ le deuxième étant à $50\\,\\%$${sp()}: $${texPrix(prixPotB)}\\times 1,5=${texPrix(prixPotB * 1.5)}$€ plutôt qu'un pot de peinture A de $5~\\mathrm{l}$ à $${texPrix(prixPotA)}$€ et un pot de peinture B de $10~\\mathrm{l}$ à $${texPrix(prixPotB)}$€, soit un total de $${texPrix(prixPotA + prixPotB)}$€.<br>
      De plus, trois pots de peinture A seront au prix de $2,5\\times ${texPrix(prixPotA)}=${texPrix(2.5 * prixPotA)}$€, ce qui est aussi moins intéressant.`
  } else {
    return 3 * prixPotA < prixPotB * 1.5
      ? `Il est préférable de prendre quatre pots de peinture A de $5~\\mathrm{l}$ dont deux à $${texPrix(prixPotA)}$€ chacun et deux à $50\\,\\%$, soit un total de $2\\times ${texPrix(prixPotA)}+2\\times \\dfrac{${texPrix(prixPotA)}}{2}=${texPrix(prixPotA * 3)}$€ plutôt que deux pots de peinture B de $10~\\mathrm{l}$ le deuxième étant à $50\\,\\%$ pour un total de $${texPrix(prixPotB)}+\\dfrac{${texPrix(prixPotB)}}{2}=${texPrix(prixPotB * 1.5)}$€.`
      : `Il est préférable de prendre deux pots de peinture B de $10~\\mathrm{l}$ le deuxième étant à $50\\,\\%$${sp()}: $${texPrix(prixPotB)}+\\dfrac{${texPrix(prixPotB)}}{2}=${texPrix(prixPotB * 1.5)}$€ plutôt que quatre pots de peinture A de $5~\\mathrm{l}$ dont deux à $${texPrix(prixPotA)}$€ chacun et deux à $50\\,\\%$, soit un total de $2\\times ${texPrix(prixPotA)}+2\\times \\dfrac{${texPrix(prixPotA)}}{2}=${texPrix(prixPotA * 3)}$€.`
  }
}

/**
 * @Author Jean-claude Lhote
 * Cet exerice exploite la nouvelle classe d'exercice que j'ai conçue pour les sujets de brevet
 * Il s'agit d'un exercice de type Brevet Aléatoirisé
 * La méthode privée appliquerLesValeurs permet de générer les valeurs aléatoires et de construire l'énoncé et la correction
 * La méthode versionOriginale permet de générer les valeurs de l'exercice telles qu'elles sont dans le sujet original
 * La méthode versionAleatoire permet de générer des valeurs aléatoires pour l'exercice
 */
export default class ExerciceAmeriqueNord392024 extends ExerciceBrevetA {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false
    this.introduction = texteItalique(
      "D'après l'exercice $4$ du brevet Amérique du Nord 2024.",
    )

    this.versionAleatoire()
  }

  private appliquerLesValeurs(
    nomFamille: string,
    hauteur: number,
    grandeBase: number,
    petiteBase: number,
    epaisseur: number,
    prixPotA: number,
    prixPotB: number,
  ): void {
    const surfaceTerrasse = ((petiteBase + grandeBase) * hauteur) / 2
    const volumeTerrasse = (surfaceTerrasse * epaisseur) / 100
    const volumeBeton = Math.ceil(volumeTerrasse)
    const masseCiment = volumeBeton * 250
    const masseGravier = (masseCiment * 7) / 2
    const masseSable = (masseCiment * 5) / 2
    const surfacePeinture = surfaceTerrasse * 2
    const AP = pointAbstrait(0, 0, 'A', 'below')
    const BP = pointAbstrait(-1, 5, 'B', 'left')
    const HP = pointAbstrait(-1, 6.5, 'H', 'above left')
    const CP = pointAbstrait(8, 5.5, 'C', 'below left')
    const GP = pointAbstrait(8, 7, 'G', 'above')
    const EP = pointAbstrait(0, 1.5, 'E', 'above right')
    const DP = pointAbstrait(9, 0.5, 'D', 'below')
    const FP = pointAbstrait(9, 2, 'F', 'above right')
    const IP = pointAbstrait(13.5, 0.75, 'I', 'below')
    const JP = pointAbstrait(13.5, 2.25, 'J', 'above')
    const flecheP = segment(
      pointAbstrait(13.7, 0.75),
      pointAbstrait(13.7, 2.25),
    )
    flecheP.styleExtremites = '<->'
    const epP = placeLatexSurSegment(
      `${epaisseur}~\\mathrm{cm}`,
      pointAbstrait(13.7, 2.25),
      pointAbstrait(13.7, 0.75),
      { distance: 0.5, letterSize: 'small' },
    )
    const labelsP = labelPoint(AP, BP, HP, CP, GP, EP, DP, FP, IP, JP)
    const poly1P = polygone([AP, BP, HP, GP, JP, IP, DP, FP, EP])
    const aretesPointillees = [
      segment(BP, CP),
      segment(CP, GP),
      segment(CP, IP),
      segment(CP, DP),
    ]
    aretesPointillees.forEach((arete) => {
      arete.pointilles = 2
    })
    const segmentsP = [
      segment(FP, JP),
      segment(AP, DP),
      segment(GP, FP),
      segment(HP, EP),
    ]
    const objetsP = [
      ...aretesPointillees,
      ...segmentsP,
      poly1P,
      labelsP,
      flecheP,
      epP,
    ]
    const figurePersp = mathalea2d(
      Object.assign({ pixelsParCm: 25, scale: 0.5 }, fixeBordures(objetsP)),
      objetsP,
    )
    const ED = pointAbstrait(0, 0, 'E', 'below')
    const HD = pointAbstrait(0, 5, 'H', 'above')
    const JD = pointAbstrait(14, 0, 'J', 'below right')
    const GD = pointAbstrait(9.5, 5, 'G', 'above')
    const FD = pointAbstrait(9.5, 0, 'F', 'below')
    const poly1D = polygone([ED, JD, GD, HD])
    const GFPointilles = segment(GD, FD)
    GFPointilles.pointilles = 2
    const labelsD = labelPoint(ED, JD, GD, HD, FD)
    const angDroitD = codageAngleDroit(JD, FD, GD)
    const pbD = placeLatexSurSegment(
      `${texNombre(petiteBase, 1)}~\\mathrm{m}`,
      HD,
      GD,
      {},
    )
    const gbD = placeLatexSurSegment(
      `${texNombre(grandeBase, 1)}~\\mathrm{m}`,
      JD,
      ED,
      { distance: 1 },
    )
    const hD = placeLatexSurSegment(
      `${texNombre(hauteur, 1)}~\\mathrm{m}`,
      ED,
      HD,
      { distance: 0.5 },
    )
    const flecheD = segment(pointAbstrait(0, -1.5), pointAbstrait(14, -1.5))
    flecheD.styleExtremites = '<->'
    const objetsD = [
      poly1D,
      GFPointilles,
      labelsD,
      angDroitD,
      flecheD,
      pbD,
      gbD,
      hD,
    ]

    const fj = grandeBase - petiteBase
    const gj = Math.sqrt(hauteur * hauteur + fj * fj)
    const perimetre = gj + grandeBase + petiteBase + hauteur
    const figureDessus = mathalea2d(
      Object.assign({ pixelsParCm: 25, scale: 0.5 }, fixeBordures(objetsD)),
      objetsD,
    )
    const question1 = `Montrer que $FJ= ${texNombre(fj, 1)}~\\mathrm{m}$.`
    const correction1 = `EFGH est un rectangle, donc $HG = EF = ${texNombre(petiteBase, 1)}~\\mathrm{m}$, puis $FJ = EI - EF = ${texNombre(grandeBase, 1)} - ${texNombre(petiteBase, 1)} = ${miseEnEvidence(`${texNombre(fj, 1)}~\\mathrm{m}`)}$.`

    const correction2 = `Dans le triangle GJF rectangle en $F$, le théorème de Pythagore permet d'écrire${sp()}:<br>
$GJ^2 = GF^2 + FJ^2 = ${texNombre(hauteur, 1)}^2 + ${texNombre(fj, 1)}^2 = ${texNombre(hauteur * hauteur, 2)} + ${texNombre(fj * fj, 2)} = ${texNombre(hauteur * hauteur + fj * fj, 1)}$, d'où $GJ = \\sqrt{${texNombre(hauteur * hauteur + fj * fj, 1)}}${egalOuApprox(gj, 1)}${texNombre(gj, 1)}~\\mathrm{m}$.<br>
On a donc $EJ + JG + GH + HE = ${texNombre(grandeBase, 1)} + ${texNombre(gj, 1)} + ${texNombre(petiteBase, 1)} + ${texNombre(hauteur, 1)} = ${miseEnEvidence(`${texNombre(perimetre, 1)}~\\mathrm{m}`)}$.<br>
${
  Number.isInteger(perimetre)
    ? `Il leur faudra au minimum $${texNombre(perimetre, 0)}~\\mathrm{m}$`
    : `Il leur faudra au minimum $${texNombre(perimetre, 1)}~\\mathrm{m}$`
} de longueur de planches, mais en général on prévoit plus à cause des découpes.`
    const correction3a = `La base du prisme a une aire${sp()}:<br>
$\\mathcal{A}(EJGH) = \\mathcal{A}(EFGH) + \\mathcal{A}(FJG) = ${texNombre(hauteur, 1)} \\times ${texNombre(petiteBase, 1)} + \\dfrac{${texNombre(hauteur, 1)} \\times ${texNombre(fj, 1)}}{2} = ${texNombre(hauteur * petiteBase, 2)}+${texNombre((hauteur * fj) / 2, 3)}=${texNombre(hauteur * petiteBase + (hauteur * fj) / 2, 3)}~\\mathrm{m}^2$.<br>
Le volume de la terrasse est égal à${sp()}:<br>
$\\mathcal{V} = \\mathcal{A}(EFJGH) \\times ${texNombre(epaisseur / 100, 2)} = ${texNombre(surfaceTerrasse, 2)} \\times ${texNombre(epaisseur / 100, 2)} = ${texNombre((surfaceTerrasse * epaisseur) / 100, 4)}~\\mathrm{m}^3$ soit moins de $${volumeBeton}~\\mathrm{m}^3$.`
    const correction3b = `Comme il faut $250~\\mathrm{kg}$ de ciment pour faire $1~\\mathrm{m}^3$ de béton, il faut donc $${volumeBeton}\\times 250 = ${texNombre(250 * volumeBeton, 0)}~\\mathrm{kg}$ de ciment pour $${volumeBeton}~\\mathrm{m}^3$ de béton.`
    const correction3c = `Le ratio, peut également s'écrire par proportionnalité $1~;~3,5~;~2,5$, d'où pour faire $${volumeBeton}~\\mathrm{m}^3$ de béton${sp()}:<br>
-- quantité de gravier nécessaire $${texNombre(masseCiment, 0)}\\times ${texNombre(3.5, 1)}= ${texNombre(masseGravier, 1)}~\\mathrm{kg}$ ;<br>
-- quantité de sable nécessaire $${texNombre(masseCiment, 0)}\\times ${texNombre(2.5, 1)}= ${miseEnEvidence(`${texNombre(masseSable, 1)}~\\mathrm{kg}`)}$.`
    const correction3 = createList({
      items: [correction3a, correction3b, correction3c],
      style: 'alpha',
    })
    const nbLitres = Math.ceil(surfacePeinture / 5)
    const correction4 = `Nous avons la surface de la terrasse, soit $${texNombre(surfaceTerrasse, 3)}~\\mathrm{m}^2$.<br>
    Passer $2$ couches revient à peindre $${texNombre(surfacePeinture, 3)}~\\mathrm{m}^2$.<br>
    Il faut donc${sp()}: $\\dfrac{${texNombre(surfacePeinture, 3)}}{5}=\\dfrac{${texNombre(surfacePeinture * 2, 3)}}{10}=${miseEnEvidence(`${texNombre(surfacePeinture / 5, 4)}~\\mathrm{l}`)}$.<br>
    ${meilleurPrix(prixPotA, prixPotB, nbLitres)}`

    const question2 = `Afin de pouvoir couler le béton, M. et M$^\\text{me}$ ${nomFamille} doivent délimiter la terrasse en installant des planches tout autour. Quelle longueur de planches doivent-ils acheter au minimum${sp()}?`
    const question3a = `Montrer que le volume de la terrasse est bien inférieur à $${volumeBeton}~\\mathrm{m}^{3}$.`
    const question3b = `Sachant que pour faire $1~\\mathrm{m}^{3}$ de béton, il faut $250~\\mathrm{kg}$ de ciment, quelle masse de ciment (en $\\text{kg}$) doivent-ils acheter pour réaliser $${volumeBeton}~\\mathrm{m}^{3}$ de béton${sp()}?`
    const question3c = `Pour faire du béton, on ajoute de l'eau à un mélange de ciment, de gravier et de sable. Dans ce mélange, les masses de ciment - gravier - sable sont dans le ratio $2~:~7~:~5$. Déterminer (en $\\text{kg}$), la masse de gravier et la masse de sable nécessaires pour réaliser les $${volumeBeton}~\\mathrm{m}^{3}$ de béton.`
    const question3 = createList({
      items: [question3a, question3b, question3c],
      style: 'alpha',
    })
    const entetesCols = ['', '\\text{Pot A}', '\\text{Pot B}']
    const entetesLignes = [
      '\\text{Contenance (en litres)}',
      '\\text{Prix (en euros)}',
    ]
    const contenu = [5, 10, texPrix(prixPotA), texPrix(prixPotB)]
    const tableau = tableauColonneLigne(entetesCols, entetesLignes, contenu)
    const document1 = `${texteGras(`Document $\\mathbf{1}$${sp()}: `)} Pots de peinture proposés${sp()}:
    ${tableau}<br>`
    const document2 = `${texteGras(`Document $\\mathbf{2}$${sp()}: `)} L'offre du mois${sp()}: Moins $50\\,\\%$ sur le deuxième article identique.<br>`
    const document3 = `${texteGras(`Document $\\mathbf{3}$${sp()}: `)} Deux couches de peinture sont nécessaires. $1~\\mathrm{l}$ de peinture permet de réaliser une couche de $5~\\mathrm{m}^{2}$.<br>`
    const listeDocs = document1 + document2 + document3
    const question4 = `M. et M$^\\text{me}$ ${nomFamille} souhaitent peindre la surface supérieure de leur terrasse.<br>
À l'aide des documents $1$, $2$ et $3$, déterminer le type et le nombre de pots nécessaires pour effectuer ces travaux avec un coût minimum.<br>
${listeDocs}`
    const listeQuestions = createList({
      items: [question1, question2, question3, question4],
      style: 'nombres',
    })
    this.enonce = `M. et M$^\\text{me}$ ${nomFamille} veulent construire une terrasse en béton dans leur jardin.<br>
    Ils souhaitent que leur terrasse ait une hauteur de $${epaisseur}\\mathrm{~cm}$.<br>
    Les représentations ci-dessous ne sont pas à l'échelle.<br>
    ${texteGras('Vue en perspective de la terrasse')}
    ${figurePersp}
    ${texteGras('Vue de dessus de la terrasse')}
    ${figureDessus}
    ${texteGras(`Rappel${sp()}:`)} Le volume d'un prisme est donné par la formule${sp()}: $V=\\text{Aire de la base} \\times \\text{Hauteur}$<br>
    ${listeQuestions}`
    this.correction = createList({
      items: [correction1, correction2, correction3, correction4],
      style: 'nombres',
    })
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs('Martin', 3, 10, 6, 15, 79.9, 129.9)
  }

  versionAleatoire: () => void = () => {
    const nomFamille = choice([
      'Martin',
      'Dupont',
      'Leroy',
      'Bernard',
      'Moreau',
      'Lemoine',
      'Garnier',
      'Roussel',
      'Bourgeois',
    ])
    let hauteur: number
    let grandeBase: number
    let petiteBase: number
    let epaisseur: number
    let prixPotA: number
    let prixPotB: number
    let surfacePeinture: number
    do {
      hauteur = randint(5, 7) / 2
      grandeBase = randint(10, 14)
      petiteBase = randint(grandeBase * 2 - 12, grandeBase * 2 - 6) / 2
      epaisseur = randint(12, 16)
      prixPotA = randint(1, 9) / 10 + randint(70, 80)
      prixPotB =
        randint(Math.ceil(prixPotA * 15.5), Math.floor(prixPotA * 17)) / 10
      const surfaceTerrasse = ((petiteBase + grandeBase) * hauteur) / 2
      surfacePeinture = surfaceTerrasse * 2
    } while (surfacePeinture / 5 > 20)
    this.appliquerLesValeurs(
      nomFamille,
      hauteur,
      grandeBase,
      petiteBase,
      epaisseur,
      prixPotA,
      prixPotB,
    )
  }
}
