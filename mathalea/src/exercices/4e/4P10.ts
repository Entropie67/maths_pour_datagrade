import { texPrix } from '../../lib/format/style'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  produitsEnCroix,
  quatriemeProportionnelle,
} from '../../lib/outils/calculs'
import { texFractionReduite } from '../../lib/outils/deprecatedFractions'
import { egalOuApprox } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { ajouterAide, ajouterImage } from '../../lib/outils/enrichissements'
import { arrondi } from '../../lib/outils/nombres'
import { deDevant, numAlpha, queDevant, sp } from '../../lib/outils/outilString'
import { prenom, prenomF } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre =
  "Résoudre des problèmes de grandeurs composées et de conversion d'unités complexes"

/**
 * problèmes de grandeurs composées
 * @author Jean-claude Lhote

 */
export const uuid = '72c5a'

export const refs = {
  'fr-fr': ['4P10', 'BP2AutoU4'],
  'fr-ch': ['11CTGM4A-3', '11LCGM4A-3', '11LSGM4A-3', 'PRQMG04E-2', 'PRQPF03C-2', 'PRQPF04C-1'],
}
const solutes: [string, string, number][] = [
  ['sel', "d'eau", 300],
  ['sucre', "d'eau", 2000],
  ['dioxyde de carbone', "d'eau", 3],
  ['bicarbonate de sodium', "d'eau", 9],
  ['carbonate de sodium', "d'eau", 300],
] // soluté, masse maximale en gramme pour saturer 1 L de solvant
const materiaux: [string, number, string, string][] = [
  ['palladium', 12000, 'du ', 'de '],
  ['acier', 7800, "de l'", "d'"],
  ['fonte', 7100, 'de la', 'de '],
  ['aluminium', 2700, "de l'", "d'"],
  ['argent', 10500, "de l'", "d'"],
  ['bronze', 8800, 'du ', 'de '],
  ['cuivre', 8960, 'du ', 'de '],
  ['fer', 7860, 'du ', 'de '],
  ['lithium', 530, 'du ', 'de '],
  ['mercure', 13545, 'du ', 'de '],
  ['nickel', 8900, 'du ', 'de '],
  ['or', 19300, "de l'", "d'"],
  ['platine', 21450, 'du ', 'de '],
  ['titane', 4500, 'du ', 'de '],
  ['zinc', 7150, 'du ', 'de '],
]
const villes: [string, number, number][] = [
  ['Nice', 342637, 71.9],
  ['Montpellier', 281613, 56.9],
  ['Rennes', 216268, 50.4],
  ['Dijon', 155090, 40.4],
  ['Orléans', 114782, 27.5],
  ['Clermont-Ferrand', 142686, 42.7],
  ['Nantes', 306694, 65.2],
  ['Paris', 2190327, 105.4],
  ['Lyon', 515695, 47.9],
  ['Marseille', 862211, 240.6],
  ['Bordeaux', 252040, 49.4],
  ['Nancy', 104592, 15],
  ['Toulouse', 475438, 118.3],
  ['Lille', 232440, 34.8],
  ['Strasbourg', 279284, 78.3],
] // [Ville, population, superfice en ha, année du recensement]
const locations: [string, number, number, number][] = [
  ['un vélo', 1.5, 2, 8],
  ['un canoé', 10, 2, 4],
  ['des rollers', 7, 2, 5],
  ['un char à voile', 12, 2, 4],
]
const cours: [string, number][] = [
  ['de piano', 20],
  ['de maths', 25],
  ['de yoga', 5],
  ['de dessin', 12],
  ['de voile', 15],
]
const fruits: [string, number, number, number][] = [
  ['pêches', 4, 10, 30],
  ['noix', 5.4, 4, 13],
  ['cerises', 5.6, 11, 20],
  ['pommes', 2.2, 20, 40],
  ['framboises', 15, 1, 5],
  ['fraises', 7.5, 5, 10],
  ['citrons', 1.5, 15, 30],
  ['bananes', 1.5, 15, 25],
]
const appareils: [string, number, number][] = [
  ['radiateur', 2300, 20],
  ['téléviseur', 46, 12],
  ['four électrique', 2960, 4],
  ['ordinateur', 460, 8],
] // [appareil,puissance,durée maxi de fonctionnement]
const liquides: [string, number][] = [
  ['de lait entier', 1.032],
  ["d'essence", 0.755],
  ['de diesel', 0.83],
  ["d'huile", 0.91],
  ['de bière', 0.9],
  ['de sable', 1.6],
] // [nom,densité]
const rivieres: [string, string, number, number, string, string, string][] = [
  ['Marne', 'Gournay-sur-Marne', 110, 550, 'avril 1983', 'la ', 'de la '],
  ['Seine', 'Alfortville', 218, 2100, 'janvier 1982', 'la ', 'de la '],
  ['Oise', 'Pont-Sainte-Maxence', 109, 665, 'février 1995', "l'", "de l'"],
  ['Loire', 'Saint-Nazaire', 931, 5350, 'décembre 1999', 'la ', 'de la'],
  ['Rhin', 'Strasbourg', 951, 3310, 'juin 2016', 'le ', 'du '],
  ['Rhône', 'Beaucaire', 1690, 11500, 'décembre 2003', 'le ', 'du '],
  ['Meuse', 'Chooz', 144, 1610, 'janvier 1995', 'la ', 'de la '],
]
// [Nom de rivière,Lieu de passage,débit moyen annuel, débitmax, date de la crue, article défini, article partitif]
const vitesses: [string, number, number, number][] = [
  ['sur un vélo', 4, 12, 8],
  ['dans un train', 50, 100, 5],
  ['dans une voiture', 15, 30, 5],
  ['en avion', 150, 250, 12],
  ['à pied', 2, 4, 5],
] // [moyen de transport, vitesse min,vitesse max en $\\text{m/s}$,durée max en h]
export default class ProblemesGrandeursComposees extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type des grandeurs',
      'Nombres séparés par des tirets :\n 1 : Energie consommée\n 2 : Volume\n 3 : Quantité de mouvement & Energie cinétique\n 4 : Moment de force\n 5 : Trafic de voyageurs\n 6 : Puissance électrique\n 7 : Vitesse\n 8 : Prix massique\n 9 : Prix horaire\n 10 : Densité de population\n 11 : Masse volumique\n 12 : Concentration massique\n 13 : Débits\n 14 : Transfert de fichiers',
    ] // Texte, tooltip

    this.nbQuestions = 3

    this.spacing = context.isHtml ? 3 : 1.5
    this.spacingCorr = 2
    this.sup = ''
  }

  nouvelleVersion() {
    // let listeIndex_disponibles=[1,2,3,4,5,6,7,8,9,10,11,12,13,14];
    // let listeIndex=combinaisonListes(listeIndex_disponibles,this.nbQuestions);
    const liste7 = combinaisonListes([0, 1, 2], this.nbQuestions)
    let flag7 = 0
    let flag2 = 0
    const liste2 = combinaisonListes([0, 1], this.nbQuestions)
    let appareil,
      puissance,
      dureeMax,
      nbQuartsDHeures,
      prixkWh,
      h1,
      h2,
      l,
      L,
      deltaT,
      r,
      h
    let concentration2, tailleFichier
    let d1,
      d2,
      k,
      n1,
      n2,
      I1,
      I2,
      allures,
      v1,
      v2,
      volume1,
      volume2,
      vMax,
      unites

    // const listeIndex = combinaisonListes(grandeurs, this.nbQuestions)
    const grandeurs = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 14,
      melange: 15,
      defaut: 15,
      nbQuestions: this.nbQuestions,
    })

    for (
      let i = 0,
        j,
        index,
        index1,
        index2,
        duree,
        quidam,
        nbheures,
        nbminutes,
        nbsecondes,
        vitesseMoy,
        distance,
        masse,
        masse2,
        masse3,
        prix1,
        prix2,
        prix3,
        texte,
        texteCorr,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (grandeurs[i]) {
        case 1: // problème de consommation éléctrique
          index = randint(0, 3)
          appareil = appareils[index][0]
          puissance = appareils[index][1]
          dureeMax = appareils[index][2]
          nbQuartsDHeures = randint(0, 3)
          nbheures = randint(dureeMax / 4, dureeMax, [1])
          duree = nbheures + nbQuartsDHeures * 0.25
          prixkWh = randint(0, 5) / 100 + 0.14
          texte = `L'étiquette apposée au dos d'un ${appareil} indique une puissance de $${texNombre(puissance)}$ Watts. On le fait fonctionner pendant $${Math.floor(
            duree,
          )}$ heures `
          if (nbQuartsDHeures !== 0) {
            texte += `et $${nbQuartsDHeures * 15}$ minutes`
          }
          texte += `.<br>Le prix d'un kWh est de $${texPrix(prixkWh)}$ €.<br>`
          if (context.isHtml) {
            // les boutons d'aide uniquement pour la version html
          }
          texte +=
            numAlpha(0) +
            " Exprimer en kWh l'" +
            ajouterAide(
              `C'est le produit de la puissance électrique (Watt) par le temps (s) et se mesure en Joules (J).<br>$1\\text{ J} = 1\\text{ W} \\times 1\\text{ s}$<br>Cependant, pour mesurer des énergies plus importantes, on utilise plutôt le kilowatt-heure (kWh).<br>$1\\text{ kWh} = ${texNombre(1000)}\\text{ W} \\times 1\\text{ h}$`,
              {
                texteAvant: 'énergie',
                titreAide: `Définition${sp()}: Énergie (grandeur physique)`,
              },
            ) +
            ' consommée.<br>'
          texte += numAlpha(1) + ' Calculer la dépense correspondante.'
          texteCorr =
            numAlpha(0) +
            ` Un ${appareil} d'une puissance de $${texNombre(puissance)}$ watts qui fonctionne pendant $${Math.floor(
              duree,
            )}$ heures `
          if (nbQuartsDHeures !== 0) {
            texteCorr += `et $${nbQuartsDHeures * 15}$ minutes`
          }
          texteCorr += ` consomme${sp()}: <br>`
          if (nbQuartsDHeures !== 0) {
            texteCorr += `$${nbheures}\\text{ h } ${
              nbQuartsDHeures * 15
            } = ${nbheures}\\text{ h} + ${texFractionReduite(
              nbQuartsDHeures,
              4,
            )}\\text{ h} =${texNombre(
              nbheures + nbQuartsDHeures * 0.25,
            )}\\text{ h}$<br>`
          }
          texteCorr += `$${texNombre(puissance)}\\text{ W}\\times${texNombre(
            duree,
          )}\\text{ h}=${texNombre(
            puissance / 1000,
          )}\\text{ kW}\\times${texNombre(duree)}\\text{ h}=${miseEnEvidence(
            texNombre(puissance * duree * 0.001, 3),
          )}\\text{ kWh}$<br>`
          texteCorr +=
            numAlpha(1) +
            ` Le prix de cette énergie consommée est${sp()}: $${texPrix(
              prixkWh,
            )}$ €$\\text{/kWh} \\times${texNombre(
              puissance * duree * 0.001,
              3,
            )}\\text{ kWh}`
          if (
            !(
              (prixkWh * puissance * duree) / 10 ===
              Math.round((prixkWh * puissance * duree) / 10)
            )
          ) {
            texteCorr += `\\approx${miseEnEvidence(texPrix(((prixkWh * puissance) / 1000) * duree))}$ €.`
          } else {
            texteCorr += `=${miseEnEvidence(
              texPrix(((prixkWh * puissance) / 1000) * duree),
            )}$ €.`
          }
          break
        case 2: // problèmes de volumes
          index1 = liste2[flag2]
          flag2++
          switch (index1) {
            case 0: // Volume d'une piscine
              h1 = 180 + randint(0, 10) * 10
              h2 = 80 + randint(0, 4) * 10
              l = 5 + randint(0, 5)
              L = l * 2 + randint(0, 4) * 2
              deltaT = randint(2, 5)
              texte = `Une piscine a la forme d'un prisme droit. La profondeur à son extrémité nord est de $${h1}\\text{ cm}$ et la profondeur à son extrémité sud est de $${h2}\\text{ cm}$.<br>`
              texte += `D'une extrémité à l'autre, la pente au fond de la piscine est régulière.<br>La largeur de la piscine (Est-Ouest) est de $${l}\\text{ m}$ et sa longueur (Nord-Sud) est de $${L}\\text{ m}$.<br>`
              texte +=
                numAlpha(0) +
                ' Calculer le ' +
                ajouterAide(
                  `C'est le produit de trois longueurs ou le produit d'une aire et d'une longueur.<br>L'unité de mesure du volume est le mètre-cube ($\\text{m}^3$) mais on peut aussi rencontrer le litre (L) avec comme correspondance $1\\text{dm}^3$ = $1$L.`,
                  {
                    texteAvant: 'volume',
                    titreAide: `Définition${sp()}: Volume (grandeur physique)`,
                  },
                ) +
                ` d'eau en $\\text{m}^3$ contenu dans cette piscine quand elle est pleine.<br>`
              texte +=
                numAlpha(1) +
                ` Sachant que pour élever la température d'un litre d'eau de $1$ degré, il faut une énergie de $${texNombre(1.162)}$ Wattheure, quelle est l'énergie consommée en kWh pour augmenter la température de la piscine de $${deltaT}$ degrés${sp()}?<br>`
              texteCorr =
                numAlpha(0) +
                ` La base de ce prisme droit est un trapèze rectangle de petite base $${h2}\\text{ cm}$, de grande base $${h1}\\text{ cm}$ et de hauteur $${L}\\text{ m}$.<br>`
              texteCorr += `$\\mathcal{A}=\\dfrac{\\left(${h1}\\text{ cm}+${h2}\\text{ cm}\\right)}{2}\\times${L}\\text{ m}$`
              texteCorr += ` $=\\dfrac{\\left(${texNombre(
                h1 / 100,
                2,
              )}\\text{ m}+${texNombre(
                h2 / 100,
                2,
              )}\\text{ m}\\right)}{2}\\times${L}\\text{ m}$`
              texteCorr += ` $=\\dfrac{${texNombre(
                (h1 + h2) / 100,
                2,
              )}\\text{ m}}{2}\\times${L}\\text{ m}$`
              texteCorr += ` $=${texNombre(
                (h1 + h2) / 200,
                2,
              )}\\text{ m}\\times${L}\\text{ m}$`
              texteCorr += ` $=${texNombre(
                ((h1 + h2) / 200) * L,
                2,
              )}\\text{ m}^2$<br>`
              texteCorr +=
                `Le volume de ce prisme, et donc, par extension, le volume d'eau contenu dans la piscine, est${sp()}:<br>`
              texteCorr += `$\\mathcal{A}\\times\\mathcal{h}=${texNombre(
                ((h1 + h2) / 200) * L,
                2,
              )}\\text{ m}^2\\times${l}\\text{ m}$`
              texteCorr += ` $=${miseEnEvidence(
                texNombre(((h1 + h2) / 200) * L * l, 2),
              )}\\text{ m}^3$.<br>`
              texteCorr +=
                numAlpha(1) +
                ` Convertissons le volume de la piscine en litres${sp()}: $${texNombre(
                  ((h1 + h2) / 200) * L * l,
                  2,
                )}\\text{ m}^3=${texNombre(
                  (h1 + h2) * L * l * 5,
                )}\\text{ dm}^3=${texNombre(
                  (h1 + h2) * L * l * 5,
                )}\\text{ L}$<br>`
              texteCorr += ` L'énergie consommée pour élever la température de l'eau de cette piscine de $${deltaT}$ degrés est${sp()}:<br>`
              texteCorr += `$\\mathcal{E}=${texNombre(
                (h1 + h2) * L * l * 5,
              )}\\text{ L}\\times${deltaT}\\text{ °C}\\times 1,162 \\dfrac{\\text{Wh}}{\\text{°C}\\times\\text{L}}=${texNombre(
                (h1 + h2) * L * l * 5 * deltaT * 1.162,
                3,
              )}\\text{ Wh}=${miseEnEvidence(
                texNombre((((h1 + h2) * L * l) / 200) * deltaT * 1.162, 7),
              )}\\text{ kWh}$<br>`
              break
            case 1: // Volume d'un tonneau cylindrique
            default:
              index2 = randint(0, 5)
              r = randint(10, 15) * 2
              h = randint(0, 10) + r * 4
              texte = `Un tonneau cylindrique a un rayon de $${r}\\text{ cm}$ et une hauteur de $${h}\\text{ cm}$.<br>`
              texte +=
                numAlpha(0) +
                ' Calculer le ' +
                ajouterAide(
                  "C'est le produit de trois longueurs ou le produit d'une aire et d'une longueur.<br>L'unité de mesure du volume est le mètre-cube ($\\text{m}^3$) mais on peut aussi rencontrer le litre (L) avec comme correspondance $\\text{1dm}^3 = \\text{1L}.$",
                  {
                    texteAvant: 'volume',
                    titreAide: `Définition${sp()}: Volume (grandeur physique)`,
                  },
                ) +
                ` en $\\text{dm}^3$ à $${texNombre(0.1)}$ près de ce tonneau.<br>`
              texte +=
                numAlpha(1) +
                ` Si on le remplit ${liquides[index2][0]} (dont la ` +
                ajouterAide(
                  "La densité d'une substance est égale à la masse volumique de la substance divisée par la masse volumique du corps de référence à la même température.<br>Pour les liquides et les solides, l'eau est utilisée comme référence (sa masse volumique est de $1 \\text{ kg/dm}^3$), pour les gaz, la mesure s'effectue par rapport à l'air.<br>Donc pour les liquides, la densité est égale à la masse volumique exprimée en $\\text{kg/dm}^3$.",
                  {
                    texteAvant: 'densité',
                    titreAide: `Définition${sp()}: Densité (grandeur physique)`,
                  },
                ) +
                ` est de $${texNombre(liquides[index2][1])}\\text{ kg/dm}^3$), quelle masse ${
                  liquides[index2][0]
                } en kg contiendra-t-il au gramme près${sp()}?<br>`
              texteCorr =
                numAlpha(0) +
                ` Le volume d'un cylindre est donné par la formule $\\mathcal{A}\\text{ire de base}\\times\\mathcal{h}$.<br> Ici, la base est un disque de rayon $${r}\\text{ cm}$.<br>`
              texteCorr += `$\\mathcal{A}\\text{ire de base}\\times\\mathcal{h}=\\pi\\times${r}^{2}\\text{ cm}^2\\times${h}\\text{ cm}=${texNombre(
                r * r * h,
              )}\\pi\\text{ cm}^3\\approx${texNombre(
                r * r * h * Math.PI,
                1,
              )}\\text{ cm}^3\\approx${miseEnEvidence(
                texNombre((r * r * h * Math.PI) / 1000, 1),
              )}\\text{ dm}^3$<br>`
              texteCorr +=
                numAlpha(1) +
                ` La masse ${liquides[index2][0]} contenue dans ce tonneau est${sp()}:<br>`
              texteCorr += `$${texNombre(
                (r * r * h * Math.PI) / 1000,
                1,
              )}\\text{ dm}^3\\times ${texNombre(
                liquides[index2][1],
              )} \\dfrac{\\text{kg}}{\\text{dm}^3}\\approx${miseEnEvidence(
                texNombre(
                  ((r * r * h * Math.PI) / 1000) * liquides[index2][1],
                  3,
                ),
              )}\\text{ kg}.$`
              break
          }
          break
        case 3: // Problème de quantité de mouvement et d'énergie cinétique
          quidam = prenomF()
          index1 = randint(0, 4)
          masse = randint(40, 70)
          vitesseMoy = randint(vitesses[index1][1], vitesses[index1][2]) // vitesse choisie pour l'exo
          texte =
            `${quidam} se déplace ${vitesses[index1][0]} à la ` +
            ajouterAide(
              "La vitesse est le quotient de la distance parcourue par le temps de parcours.<br>L'unité officielle est le mètre par seconde ($\\text{m/s}$ ou $\\text{m.s}^{-1}$) mais on utilise souvent le kilomètre par heure ($\\text{km/h}$ ou $\\text{km.h}^{-1}$).",
              {
                texteAvant: 'vitesse',
                titreAide: `Définition${sp()}: Vitesse (grandeur physique)`,
              },
            ) +
            ` de $${texNombre(vitesseMoy)}\\text{ m/s}$.<br>`
          texte += `Elle pèse $${masse}\\text{ kg}$.<br>`
          texte +=
            numAlpha(0) +
            ' Calculer sa ' +
            ajouterAide(
              "C'est le produit de la masse d'un corps par sa vitesse.<br>L'unité de mesure de la quantité de mouvement est le $\\text{kg.m.s}^{-1}$.",
              {
                texteAvant: 'quantité de mouvement',
                titreAide:
                  `Définition${sp()}: Quantité de mouvement (grandeur physique)`,
              },
            ) +
            ' en $\\text{kg.m.s}^{-1}$.<br>'
          texte +=
            numAlpha(1) +
            ' En déduire son ' +
            ajouterAide(
              "L'énergie cinétique d'un corps de masse $m$ (en $\\text{kg}$) assimilé à un point matériel se déplaçant à la vitesse $v$ (en $\\text{m/s}$) est donné par la formule <br>$E=\\dfrac{1}{2}\\times m\\times v^2$.<br>L'unité de mesure de l'énergie cinétique est le Joule ($J$).<br>$1J = 1\\text{ kg.m}^2\\text{s}^{-2}$",
              {
                texteAvant: 'énergie cinétique',
                titreAide: `Définition${sp()}: Énergie cinétique (grandeur physique)`,
              },
            ) +
            ' en Joules.'
          texteCorr =
            numAlpha(0) +
            ` La quantité de mouvement ${deDevant(quidam)} est${sp()}: $${masse} \\text{ kg}\\times ${vitesseMoy}\\text{ m/s}=${miseEnEvidence(
              texNombre(masse * vitesseMoy),
            )}\\text{ kg.m.s}^{-1}$.<br>`
          texteCorr +=
            numAlpha(1) +
            ` L'énergie cinétique ${deDevant(quidam)} est${sp()}: $\\dfrac{1}{2}\\times ${masse} \\text{ kg}\\times (${vitesseMoy}\\text{ m/s})^2=\\dfrac{${masse}\\times${vitesseMoy}^2}{2}\\text{ J}=${miseEnEvidence(
              texNombre((masse * vitesseMoy ** 2) / 2),
            )}\\text{ J}$.`
          break
        case 4: // problème de moment et de couple de forces qui s'annulent.
          quidam = prenom()
          index = randint(60, 90) // masse du père (recyclage de variable)
          masse = randint(20, 30) // masse de l'enfant
          distance = randint(25, 35) / 10
          texte =
            `${quidam} qui pèse $${masse}$ kg se trouve sur le siège d'une ` +
            ajouterAide(
              ajouterImage('balancoire_trebuchet-128.png', true), // Public Domain file : https://svgsilh.com/fr/image/43897.html
              {
                texteAvant: 'balançoire trébuchet',
                titreAide: 'Schéma explicatif',
              },
            ) +
            ` dans un jardin d'enfant. Le siège est situé à $${texNombre(
              distance,
              1,
            )}\\text{ m}$ du pivot central de la balançoire (bras de levier).<br>`
          texte +=
            numAlpha(0) +
            ' Calculer le ' +
            ajouterAide(
              "Le moment d'une force d'intensité $F$ (en Newton ou $\\text{kg.m.s}^{-2}$) en un point $M$ par rapport à un pivot $P$ est le produit de $F$ par la distance $d=PM$ (appelée bras de levier) exprimée en mètres, soit $F\\times d$ (lorsque cette force s'exerce perpendiculairement au bras de levier). Le moment est l'energie permettant de faire tourner l'objet autour du pivot.<br>L'unité de mesure du moment est le Joule ($J$).<br>$1J=1\\text{ kg.m}^2\\text{s}^{-2}$",
              {
                texteAvant: 'moment',
                titreAide: `Définition${sp()}: Moment (grandeur physique)`,
              },
            ) +
            ' du ' +
            ajouterAide(
              `Le poids est le produit de la masse $m$ d'un objet par l'accélération de la pesanteur terrestre ($g=9,81\\text{ m.s}^{-2}$).<br>L'unité du poids est le Newton ($N$)${sp()}: $1 N = 1 \\text{kg.m.s}^{-2}$`,
              {
                texteAvant: 'poids',
                titreAide: `Définition${sp()}: Poids (grandeur physique)`,
              },
            ) +
            ` ${deDevant(quidam)} sur son siège par rapport au pivot central du trébuchet en Joules (on admettra que le bras de levier est horizontal).<br>`
          texte +=
            numAlpha(1) +
            ` Le père ${deDevant(quidam)} vient s'installer de l'autre côté du pivot central. Il pèse $${index}\\text{ kg}$ et s'installe de façon à ce que son poids permette d'équilibrer la balançoire à l'horizontale. Quelle doit être la longueur du bras de levier de son côté${sp()}? Autrement dit, à quelle distance du pivot, le père ${deDevant(quidam)} est-il assis${sp()}?<br>`
          texteCorr =
            numAlpha(0) +
            ` Le moment du poids ${deDevant(quidam)} appliqué sur son siège par rapport au pivot central du trébuchet est${sp()}:<br>`
          index1 = masse * 9.81 * distance // pour éviter d'avoir trop de variable, je recycle #antipattern !
          texteCorr += `$${masse}\\text{ kg} \\times 9,81 \\text{m.s}^{-2} \\times ${texNombre(
            distance,
            1,
          )} \\text{ m} = ${texNombre(
            index1,
            3,
          )}\\text{ kg.m}^2\\text{.s}^{-2}=${miseEnEvidence(texNombre(index1))}\\text{ J}$.<br>`
          texteCorr +=
            numAlpha(1) +
            ` Afin d'équilibrer le trébuchet, le père ${deDevant(quidam)} doit se placer de façon que le moment de son poids sur son point d'assise par rapport au pivot central du trébuchet soit égal à celui ${deDevant(quidam)}, on obtient l'équation suivante où $${miseEnEvidence(
              'd',
              'black',
            )}$ représente sa distance par rapport au pivot central${sp()}:<br>`
          texteCorr += `$ ${index}\\text{ kg}\\times 9,81 \\text{m.s}^{-2} \\times ${miseEnEvidence(
            'd',
            'black',
          )} \\text{ m}=${texNombre(index1)}\\text{ J}$.<br>`
          texteCorr += `D'où, $${miseEnEvidence(
            'd',
            'black',
          )}\\text{ m} = \\dfrac{${texNombre(
            index1,
            3,
          )}\\text{ J}}{${index}\\text{ kg}\\times 9,81 \\text{m.s}^{-2}}\\approx${texNombre(
            index1 / (9.81 * index),
            2,
          )}\\text{ m}.$`
          break
        case 5: // problème de trafic de voyageurs.
          d1 = randint(3, 6)
          d2 = randint(3, 6, [d1])
          k = randint(5, 8)
          n1 = k * d2
          n2 = k * d1
          texte =
            numAlpha(0) +
            ` Un bus de ville transporte en moyenne $${n1}$ personnes à la fois.<br> La longueur moyenne de déplacement est de $${d1}\\text{ km}$.<br> Calculer le ` +
            ajouterAide(
              "Le trafic de voyageurs est le produit du nombre de voyageurs par la distance parcourue. L'unité est le $\\text{voyageur.km}$ qui correspond au déplacement d'un voyageur sur $1\\text{ km}$.",
              {
                texteAvant: 'trafic',
                titreAide: `Définition${sp()}: Trafic de voyageurs`,
              },
            ) +
            ' moyen de voyageurs en $\\text{voyageurs.km}$.<br> '
          texte +=
            numAlpha(1) +
            ` Un autre bus de ville transporte en moyenne $${n2}$ personnes à la fois.<br> La longueur moyenne de déplacement est de $${d2}\\text{ km}$.<br> Montrer que le trafic de voyageurs est le même qu'à la question ` +
            numAlpha(0) +
            '.'
          texteCorr =
            numAlpha(0) +
            ` Le trafic moyen de ce bus de ville est${sp()}: $${n1}\\text{ voyageurs}\\times${d1}\\text{ km}=${miseEnEvidence(
              n1 * d1,
            )}\\text{ voyageurs.km}$.<br>`
          texteCorr +=
            numAlpha(1) +
            ` Le trafic moyen de ce bus de ville est${sp()}: $${n2}\\text{ voyageurs}\\times${d2}\\text{ km}=${miseEnEvidence(
              n2 * d2,
            )}\\text{ voyageurs.km}$, donc ces deux bus ont le même trafic.`
          break
        case 6: // problème de puissance électrique.
          index = randint(0, 3)
          index1 = randint(0, 3, [index])
          I1 = Math.round(appareils[index][1] / 230) + 1
          texte =
            'Les appareils de cet exercices fonctionnent sur le secteur, soit à une tension de 230V<br>' +
            numAlpha(0) +
            ` Un ${appareils[index][0]} est protégé par un fusible de $${I1}$ ampères.<br>Quelle est la ` +
            ajouterAide(
              "C'est le produit de la force électromotrice (tension) exprimée en Volt (V) par l'intensité du courant électrique exprimée en ampères (A).<br>L'unité de mesure de la puissance est le Watt (W).",
              {
                texteAvant: 'puissance',
                titreAide: `Définition${sp()}: Puissance (grandeur physique)`,
              },
            ) +
            ` maximale de cet appareil${sp()}?<br>`
          texte +=
            numAlpha(1) +
            ` Un ${appareils[index1][0]} fonctionne à une puissance maximale de $${texNombre(appareils[index1][1], 0)}$ W.<br>Quel est l'ampérage (entier) minimum nécessaire pour le fusible qui protégera ${index1 === 3 ? 'cet' : 'ce'} ${appareils[index1][0]} des courts-circuits${sp()}?<br>`
          texteCorr =
            numAlpha(0) +
            ` La tension du secteur étant de $${texNombre(230)}$ V, la puissance maximale de ce ${appareils[index][0]} est de${sp()}:<br>`
          texteCorr += `$230\\text{ V}\\times${I1}\\text{ A}=${miseEnEvidence(
            texNombre(230 * I1),
          )}\\text{ W}$.<br>`
          I2 = Math.round(appareils[index1][1] / 230) + 1
          texteCorr +=
            numAlpha(1) +
            ` Pour fonctionner à la puissance maximum, cet appareil a besoin d'un courant d'une intensité de${sp()}:<br>`
          texteCorr += `$\\dfrac{${texNombre(
            appareils[index1][1],
            0,
          )}\\text{ W}}{230 \\text{ V}} = ${miseEnEvidence(
            texNombre(appareils[index1][1] / 230, 1),
          )}\\text{ A}$.<br>`
          texteCorr += `Le fusible nécessaire pour protéger cet appareil des courts-circuits devra avoir une intensité de rupture minimum de $${miseEnEvidence(I2)}$ ampères.`
          break
        case 7: // problème de vitesses
          index2 = liste7[flag7]
          flag7++
          quidam = prenom() // prenom choisi
          switch (index2) {
            case 0: // problème de déplacements
              index1 = randint(0, 4)
              vitesseMoy = randint(vitesses[index1][1], vitesses[index1][2]) // vitesse choisie pour l'exo
              distance =
                (vitesseMoy * 3.6 * vitesses[index1][3] * randint(5, 20)) / 10 // distance choisie pour question b
              // la duree en h pour la deuxième question est vitesses[index1][3] * randint(5, 20)) / 10, c'est donc un décimal avec au plus un chiffre après la virgule
              // la distance en $\\text{km}$ de la deuxième question a au plus 2 chiffres après la virgule
              duree = randint(2, vitesses[index1][3])
              texte =
                `${quidam} se déplace ${vitesses[index1][0]} à la ` +
                ajouterAide(
                  "La vitesse est le quotient de la distance parcourue par le temps de parcours.<br>L'unité officielle est le mètre par seconde ($\\text{m/s}$ ou $\\text{m.s}^{-1}$) mais on utilise souvent le kilomètre par heure ($\\text{km/h}$ ou $\\text{km.h}^{-1}$).",
                  {
                    texteAvant: 'vitesse',
                    titreAide: `Définition${sp()}: Vitesse (grandeur physique)`,
                  },
                ) +
                ` de $${vitesseMoy}\\text{ m/s}$.<br>`
              texte +=
                numAlpha(0) +
                ` En se déplaçant à cette vitesse pendant $${duree}\\text{ h}$, quelle est la distance parcourue par ${quidam}${sp()}?<br>`
              texte +=
                numAlpha(1) +
                ` Si ${quidam} veut parcourir $${texNombre(
                  distance,
                  2,
                )}\\text{ km}$ à cette vitesse, combien de temps durera le trajet${sp()}? Donner le résultat en heures, minutes et secondes.`
              texteCorr =
                numAlpha(0) +
                ` La distance parcourue par ${quidam} ${
                  vitesses[index1][0]
                } en $${duree}$ h à la vitesse de $${vitesseMoy}\\text{ m/s}$ est${sp()}:<br>`
              texteCorr += `$${texNombre(
                vitesseMoy,
                0,
              )}\\text{ m/s}\\times${duree}\\text{ h}=\\dfrac{${texNombre(
                vitesseMoy,
                0,
              )}\\text{ m}}{1 \\text{ s}}\\times ${duree}\\times ${texNombre(
                3600,
                0,
              )}\\text{ s}`
              texteCorr += `=${texNombre(
                vitesseMoy * 3600 * duree,
                0,
              )}\\text{ m}=${texNombre(
                vitesseMoy * 3.6 * duree,
              )}\\text{ km}$.<br>`
              texteCorr +=
                numAlpha(1) +
                ` Pour parcourir $${texNombre(
                  distance,
                )}\\text{ km}$ à cette vitesse, cherchons le temps ${queDevant(quidam)} mettra.<br>`
              texteCorr += ` Partons de la formule $\\mathcal{V}=\\dfrac{\\mathcal{d}}{\\mathcal{t}}$ et remplaçons${sp()}: $\\dfrac{${vitesseMoy}\\text{ m}}{1 \\text{ s}}=\\dfrac{${texNombre(
                distance,
              )}\\text{ km}}{\\mathcal{t}\\text{ h}}$.<br>`
              texteCorr += `Rendons les unités homogènes${sp()}: $\\dfrac{${vitesseMoy}\\text{ m}}{1 \\text{ s}}=\\dfrac{${texNombre(
                distance * 1000,
                0,
              )}\\text{ m}}{\\mathcal{t}\\text{ h}\\times ${texNombre(
                3600,
                0,
              )}\\text{ s/h}}$.<br>`
              texteCorr += `Appliquons l'égalité des produits en croix${sp()}: ${produitsEnCroix(
                [
                  [`${vitesseMoy}\\text{ m}`, '1 \\text{ s}'],
                  [
                    `${texNombre(distance * 1000, 0)}\\text{ m}`,
                    `\\mathcal{t}\\times ${texNombre(3600, 0)}\\text{ s/h}`,
                  ],
                ],
              )}.<br>`
              texteCorr += `D'où${sp()}: $\\mathcal{t}=\\dfrac{1 \\text{ s}\\times${texNombre(
                distance * 1000,
                0,
              )}\\text{ m}}{${vitesseMoy}\\text{ m}\\times${texNombre(
                3600,
              )}\\text{ s/h}}$ ($t$ est le nombre décimal d'heures${sp()}: les mètres et les secondes disparaissent car ils sont, tous deux, présents au numérateur et au dénominateur).<br>`
              texteCorr += `Soit${sp()}: $\\mathcal{t}=${texNombre(
                (distance * 1000) / vitesseMoy / 3600,
                1,
              )}\\times ${texNombre(3600, 0)}\\text{ s}=${texNombre(
                (distance * 1000) / vitesseMoy,
                0,
              )}\\text{ s}=`
              nbheures = Math.floor((distance * 1000) / vitesseMoy / 3600) // conversion en h min s
              nbminutes = Math.floor(
                (Math.floor((distance * 1000) / vitesseMoy) % 3600) / 60,
              )
              nbsecondes = Math.round(
                (distance * 1000) / vitesseMoy -
                  3600 * nbheures -
                  60 * nbminutes,
              )
              if (nbheures > 0) {
                texteCorr += `${nbheures}\\times ${texNombre(3600, 0)}+`
              }
              if (nbminutes > 0) texteCorr += `${nbminutes}\\times 60`
              if (nbsecondes > 0) {
                texteCorr += `+${nbsecondes}`
              }
              texteCorr = texteCorr.replace('++', '+') + '\\text{ s}=' // au cas ou nbminutes === 0 il y aurait ++
              // affichage de la réponse
              texteCorr += `${[
                nbheures !== 0
                  ? `${miseEnEvidence(texNombre(nbheures))}\\text{ h}`
                  : '',
                nbminutes !== 0
                  ? `${miseEnEvidence(texNombre(nbminutes))}\\text{ min}`
                  : '',
                nbsecondes !== 0
                  ? `${miseEnEvidence(nbsecondes)}\\text{ s}`
                  : '',
              ]
                .filter((morceau) => morceau !== '')
                .join('~')}$.`
              break
            case 1: // l'orage et la vitesse du son
              duree = randint(2, 15) // durée pour question a)
              distance = randint(5, 15, [duree]) * 340 // distance de l'orage en m pour question b
              texte =
                "Le son se déplace dans l'air à la " +
                ajouterAide(
                  "La vitesse est le quotient de la distance parcourue par le temps de parcours.<br>L'unité officielle est le mètre par seconde ($\\text{m/s}$ ou $\\text{m.s}^{-1}$) mais on utilise souvent le kilomètre par heure ($\\text{km/h}$ ou $\\text{km.h}^{-1}$).",
                  {
                    texteAvant: 'vitesse',
                    titreAide: `Définition${sp()}: Vitesse (grandeur physique)`,
                  },
                ) +
                ' de $340\\text{ m/s}$.<br>'
              texte +=
                numAlpha(0) +
                ` ${quidam} voit un éclair dans le ciel et compte dans sa tête $${duree}$ secondes avant d'entendre le tonnerre.<br>`
              texte += `À quelle distance ${deDevant(quidam)}, l'éclair est-il tombé${sp()}?<br>`
              texte +=
                numAlpha(1) +
                " L'éclair suivant tombe sur le paratonnerre situé sur le clocher de l'église du village voisin.<br>"
              texte += `${quidam} sait que le clocher est situé à $${texNombre(distance)}\\text{ m}$ de sa position. Combien de temps se passe-t-il avant ${queDevant(quidam)} n'entende le tonnerre${sp()}?`
              texteCorr =
                numAlpha(0) +
                ` Calculons la distance à laquelle le premier éclair est tombé en utilisant la vitesse du son (on considère que la vitesse de la lumière est telle que l'éclair est visible instantanément)${sp()}:<br>`
              texteCorr += `$340\\text{ m/s}=\\dfrac{340\\text{ m}}{1\\text{ s}}=\\dfrac{${miseEnEvidence(
                duree,
              )}\\times 340\\text{ m}}{${miseEnEvidence(
                duree,
              )}\\times 1\\text{ s}}=\\dfrac{${texNombre(
                duree * 340,
                0,
              )}\\text{ m}}{${duree}\\text{ s}}$<br>`
              texteCorr += `La distance à laquelle l'éclair est tombé est donc de $${texNombre(
                duree * 340,
                0,
              )}\\text{ m}$.<br>`
              texteCorr +=
                numAlpha(1) +
                ` Avec les données de l'énoncé, nous pouvons écrire${sp()}:<br>`
              texteCorr += `$\\dfrac{340\\text{ m}}{1\\text{ s}}=\\dfrac{${texNombre(
                distance,
                0,
              )}\\text{ m}}{\\mathcal{T}\\text{ s}}$.<br>`
              texteCorr += `Soit grâce à l'égalité des produits en croix${sp()}: $\\mathcal{T}\\text{ s}=${quatriemeProportionnelle(
                '340 \\text{ m}',
                '1 \\text{ s}',
                texNombre(distance, 0) + '\\text{ m}',
                0,
              )}=${miseEnEvidence(texNombre(distance / 340, 0))}\\text{ s}$.<br>`
              texteCorr += `${quidam} entendra le tonnerre $${texNombre(
                distance / 340,
                0,
              )}$ secondes après avoir vu l'éclair tomber sur le clocher.`
              break
            case 2: // Le coureur
            default:
              vitesseMoy = randint(vitesses[4][1] * 5, vitesses[4][2] * 5) / 5 // vitesseMoy aura un chiffre après la virgule 4 fois sur 5
              distance = randint(5, 12)
              quidam = prenomF()
              texte =
                `${quidam} vient de courir ${distance} kilomètres. Sa montre connectée a enregistré l'` +
                ajouterAide(
                  "L'allure est le temps exprimé en $\\text{h}$, $\\text{min}$, $\\text{s}$ pour parcourir un kilomètre.<br>L'unité est alors $\\text{h/km}$ ou $\\text{min/km}$.",
                  {
                    texteAvant: 'allure',
                    titreAide: `Définition${sp()}: Allure (grandeur physique)`,
                  },
                ) +
                `pour chaque kilomètre parcouru${sp()}:<br>`
              allures = []
              for (let j = 0; j < distance; j++) {
                duree = Math.round(
                  1000 / (vitesseMoy * (1 + randint(-10, 10) * 0.01)),
                )
                nbsecondes = duree % 60
                nbminutes = (duree - nbsecondes) / 60
                allures.push([nbminutes, nbsecondes])
              }
              texte += `
                $\\def\\arraystretch{1.5}${context.isHtml ? '' : '\\footnotesize'}\\begin{array}{|c` // On construit le tableau des allures
              texte += '|c'
              for (let j = 0; j < allures.length; j++) texte += '|c'
              texte += '}\\hline \\text{Kilomètres}'
              for (let j = 0; j < allures.length; j++) {
                texte += '&' + texNombre(j + 1)
              }
              texte +=
                '\\\\\\hline \\begin{array}{l} \\text{Allure en minutes} \\\\ \\text{et en secondes} \\end{array}'
              for (j = 0; j < allures.length; j++) {
                texte +=
                  '&\\begin{array}{l}' +
                  allures[j][0] +
                  '\\text{ min}\\\\' +
                  allures[j][1] +
                  '\\text{ s}\\end{array}'
              }
              texte += '\\\\\\hline\\end{array}$<br>'
              texte +=
                numAlpha(0) +
                ` Calculer la durée totale de la course ${deDevant(quidam)}.<br>`
              texte +=
                numAlpha(1) +
                ' En déduire sa ' +
                ajouterAide(
                  "La vitesse est le quotient de la distance parcourue par le temps de parcours.<br>L'unité officielle est le mètre par seconde ($\\text{m/s}$ ou $\\text{m.s}^{-1}$) mais on utilise souvent le kilomètre par heure ($\\text{km/h}$ ou $\\text{km.h}^{-1}$).",
                  {
                    texteAvant: 'vitesse',
                    titreAide: `Définition${sp()}: Vitesse (grandeur physique)`,
                  },
                ) +
                ' moyenne en $\\text{km/h}$ sur le trajet total.<br>'
              texte +=
                numAlpha(2) +
                ` ${quidam} s'entraîne pour un semi-marathon ($${texNombre(21.0975, 4)}\\text{ km}$). En courant à la même vitesse moyenne, combien de temps durerait son semi-marathon${sp()}?`
              texteCorr =
                numAlpha(0) +
                ` La durée totale de la course ${deDevant(quidam)} est${sp()}:<br>`
              allures.push([0, 0])
              duree = 0

              for (let j = 0; j < distance; j++) {
                allures[distance][1] += allures[j][1]
                if (allures[distance][1] > 59) {
                  allures[distance][0] += 1
                  allures[distance][1] = allures[distance][1] % 60
                }
                allures[distance][0] += allures[j][0]
                if (allures[distance][0] > 59) {
                  duree++
                  allures[distance][0] = allures[distance][0] % 60
                }
              }
              for (let j = 0; j < distance - 1; j++) {
                texteCorr += `$${allures[j][0]}\\text{ min }${allures[j][1]}\\text{ s }+${sp()}$`
              }
              texteCorr += `$${allures[distance - 1][0]}\\text{ min }${
                allures[distance - 1][1]
              }\\text{ s }= ${sp()}$`
              if (duree !== 0)
                texteCorr += `$${miseEnEvidence(duree)}\\text{ h}$`
              if (allures[distance][0] !== 0) {
                texteCorr += `$${sp()}${miseEnEvidence(allures[distance][0])}\\text{ min}$`
              }
              if (allures[distance][1] !== 0) {
                texteCorr += `$${sp()}${miseEnEvidence(allures[distance][1])}\\text{ s}$.`
              }
              texteCorr +=
                '<br>' +
                numAlpha(1) +
                ` ${quidam} a effectué $${distance}\\text{ km}$ en `
              if (duree !== 0) texteCorr += `$${duree}\\text{ h}$`
              if (allures[distance][0] !== 0) {
                texteCorr += `$${sp()}${allures[distance][0]}\\text{ min}$`
              }
              if (allures[distance][1] !== 0) {
                texteCorr += `$${sp()}${allures[distance][1]}\\text{ s}$.<br>Soit `
              }
              if (duree !== 0) texteCorr += `$${duree}\\text{ h}$`
              if (allures[distance][0] !== 0) {
                texteCorr += ` $\\dfrac{${allures[distance][0]}}{60}\\text{ h}$ `
              }
              if (allures[distance][1] !== 0) {
                texteCorr += ` $\\dfrac{${allures[distance][1]}}{${texNombre(
                  3600,
                )}}\\text{ h}$ = `
              }
              texteCorr += '$\\dfrac{'
              if (duree !== 0) {
                texteCorr += `${duree}\\times ${texNombre(3600)} + `
              }
              texteCorr += `${allures[distance][0]}\\times 60+${
                allures[distance][1]
              }}{${texNombre(3600)}}\\text{ h}$ = `
              texteCorr += '$\\dfrac{'
              if (duree !== 0) {
                duree =
                  duree * 3600 +
                  allures[distance][0] * 60 +
                  allures[distance][1]
                texteCorr += `${texNombre(duree)}}`
              } else {
                duree = allures[distance][0] * 60 + allures[distance][1]
                texteCorr += `${texNombre(duree)}}`
              }
              texteCorr += `{${texNombre(3600)}}\\text{ h}$.<br>`
              texteCorr += `Sa vitesse moyenne en $\\text{km/h}$ est par conséquent${sp()}:<br>$${distance} \\text{ km}\\div\\dfrac{${texNombre(duree)}}{${texNombre(
                3600,
              )}}\\text{ h}=`
              texteCorr += `${distance} \\text{ km}\\times\\dfrac{${texNombre(
                3600,
              )}}{${texNombre(duree)}}\\text{ h}^{-1}=\\dfrac{${distance}\\times${texNombre(
                3600,
              )}}{${texNombre(duree)}}\\text{km.h}^{-1}`
              vitesseMoy = Number(((distance * 3600) / duree).toFixed(1))
              texteCorr += `\\approx${miseEnEvidence(texNombre(vitesseMoy, 1))}\\text{ km/h}$.<br>`
              texteCorr +=
                numAlpha(2) +
                ` Si elle court $${texNombre(21.0975, 4)}\\text{ km}$ à cette vitesse moyenne de $${texNombre(
                  vitesseMoy,
                  1,
                )}\\text{ km/h}$, ${quidam} mettra${sp()}:<br>`
              duree = Number((21.0975 / vitesseMoy).toFixed(4))
              texteCorr += `$\\dfrac{${texNombre(
                21.0975,
              )} \\text{ km}}{${texNombre(
                vitesseMoy,
                1,
              )} \\text{ km.h}^{-1}}\\approx${texNombre(duree, 4)}\\text{ h}$, soit `
              nbheures = Math.floor(duree)
              texteCorr += `$${texNombre(duree, 4)}\\times ${texNombre(
                3600,
                0,
              )}\\text{ s}\\approx${texNombre(duree * 3600, 0)}\\text{ s}=`
              duree = (Number(duree.toFixed(4)) - nbheures) * 60
              nbminutes = Math.floor(duree)
              duree = Math.round((Number(duree.toFixed(3)) - nbminutes) * 60)
              nbsecondes = duree

              if (nbheures > 0) {
                texteCorr += `${nbheures}\\times ${texNombre(3600, 0)}+`
              }
              if (nbminutes > 0) texteCorr += `${nbminutes}\\times 60`
              if (nbsecondes > 0) {
                texteCorr += `+${nbsecondes}`
              }
              texteCorr = texteCorr.replace('++', '+') + '\\text{ s}=' // au cas ou nbminutes === 0 il y aurait ++
              // affichage de la réponse
              texteCorr += `${[
                nbheures !== 0
                  ? `${miseEnEvidence(texNombre(nbheures))}\\text{ h}`
                  : '',
                nbminutes !== 0
                  ? `${miseEnEvidence(texNombre(nbminutes))}\\text{ min}`
                  : '',
                nbsecondes !== 0
                  ? `${miseEnEvidence(nbsecondes)}\\text{ s}`
                  : '',
              ]
                .filter((morceau) => morceau !== '')
                .join('~')}$.`
              break
          }
          break
        case 8: // problème de prix massique
          index1 = randint(0, 7)
          index2 = randint(0, 5, [index1])
          index = randint(0, 5, [index1, index2])
          masse = randint(fruits[index1][2], fruits[index1][3]) / 10
          masse2 = randint(fruits[index2][2], fruits[index2][3]) / 10
          masse3 = randint(fruits[index][2], fruits[index][3]) / 10
          prix1 = masse * fruits[index1][1]
          prix2 = masse2 * fruits[index2][1]
          prix3 = masse3 * fruits[index][1]
          quidam = prenomF()
          texte = `${quidam} se rend à l'épicerie de son quartier. Elle y achète $${texNombre(
            masse,
          )}\\text{ kg}$ de ${fruits[index1][0]} à $${texPrix(
            fruits[index1][1],
          )}$ €$\\text{/kg }$ et pour $${texPrix(prix2)}$ € de ${
            fruits[index2][0]
          } à $${texPrix(fruits[index2][1])}$ €$\\text{/kg }$.<br>`
          texte += `Enfin, elle achète $${texNombre(masse3)}\\text{ kg}$ de ${
            fruits[index][0]
          } pour $${texPrix(prix3)}$ €.<br>`
          texte +=
            numAlpha(0) + ` Combien lui coûtent les ${fruits[index1][0]}${sp()}?<br>`
          texte +=
            numAlpha(1) +
            ` Quelle masse de ${fruits[index2][0]} a-t-elle acheté${fruits[index2][0] === 'citrons' ? 's' : 'es'}${sp()}?<br>`
          texte +=
            numAlpha(2) +
            ` Quel est le prix au kilogramme des ${fruits[index][0]}${sp()}?`
          texteCorr =
            numAlpha(0) +
            ` ${quidam} dépense pour les ${fruits[index1][0]}${sp()}: $${texNombre(
              masse,
            )}\\text{ kg}\\times ${texPrix(
              fruits[index1][1],
            )}$ €$\\text{/kg }=${texPrix(prix1)}$ €.<br>`
          texteCorr +=
            numAlpha(1) +
            ` La masse de ${
              fruits[index2][0]
            } qu'elle a acheté${fruits[index2][0] === 'citrons' ? 's' : 'es'} est${sp()}: $${texPrix(prix2)}$ € $~\\div~ ${texPrix(
              fruits[index2][1],
            )}$ €$\\text{/kg } = ${texNombre(masse2)}\\text{ kg}$.<br>`
          texteCorr +=
            numAlpha(2) +
            ` Enfin, ${quidam} a acheté des ${
              fruits[index][0]
            } au prix unitaire de${sp()}: $${texPrix(prix3)}$ € $~\\div~ ${texNombre(
              masse3,
            )}\\text{ kg } = ${miseEnEvidence(texPrix(fruits[index][1]))}$ €$\\text{/kg}$.`
          break
        case 9: // problème de prix horaire
          index1 = randint(0, 3)
          index2 = randint(0, 4)
          nbheures = randint(locations[index1][2], locations[index1][3])
          prix1 = locations[index1][1]
          prix2 = cours[index2][1] * randint(2, 6)
          quidam = prenomF()
          texte = `${quidam} a prévu de louer ${locations[index1][0]} pendant $${texNombre(nbheures)}$ heures. L'heure de location coûte $${texPrix(prix1)}$ €.<br>`
          texte += numAlpha(0) + ` Combien cette location va lui coûter${sp()}?<br>`
          texte +=
            numAlpha(1) +
            ` ${quidam} a pris des leçons particulières ${
              cours[index2][0]
            }. En tout, ce mois-ci, elle a eu $${texNombre(
              prix2 / cours[index2][1],
              0,
            )}$ heures de cours pour $${texPrix(
              prix2,
            )}$ €. Combien demande son professeur pour une heure de cours${sp()}?<br>`
          texteCorr =
            numAlpha(0) +
            ` ${quidam} va dépenser pour sa location d'${locations[index1][0]}${sp()}: $${texNombre(
              nbheures,
            )}\\text{ h} \\times ${texPrix(prix1)}$ €$\\text{/h} = ${miseEnEvidence(
              texPrix(nbheures * prix1),
            )}$ €.<br>`
          texteCorr +=
            numAlpha(1) +
            ` L'heure de cours ${cours[index2][0]} coûte${sp()}: $${texPrix(
              prix2,
            )}$ € $${sp()}\\div${sp()}${texNombre(
              prix2 / cours[index2][1],
            )}\\text{ h} = ${miseEnEvidence(texPrix(cours[index2][1]))}$ €$\\text{/h}$.<br>`
          break
        case 10: // problème de densité de population
          index1 = randint(0, 14)
          index2 = randint(0, 14, [index1])
          texte =
            numAlpha(0) +
            ` En 2016, à ${villes[index1][0]} il y avait $${texNombre(
              villes[index1][1],
            )}$ habitants pour une superficie de $${texNombre(
              villes[index1][2] * 100,
              0,
            )}\\text{ ha}$.<br> Calculer la densité de population en $\\text{hab/km}^2$ arrondi à l'unité.<br>`
          texte +=
            numAlpha(1) +
            ' La même année, la ' +
            ajouterAide(
              "C'est le quotient du nombre d'habitants par la superficie en $\\text{km}^2$.<br>L'unité de la densité de population est l'habitant par $\\text{km}^2$ ($\\text{hab/km}^2$).",
              {
                texteAvant: 'densité de population',
                titreAide: `Définition${sp()}: Densité de population`,
              },
            ) +
            ` de ${villes[index2][0]} était de $${texNombre(villes[index2][1] / villes[index2][2], 0)}\\text{ hab/km}^2$ pour une superficie de $${texNombre(
              villes[index2][2] * 100,
              0,
            )}\\text{ ha}$.<br> Calculer le nombre d'habitants de ${
              villes[index2][0]
            } à cette date.<br>`
          texteCorr =
            numAlpha(0) +
            ` En 2016, la densité de population à ${
              villes[index1][0]
            } était de${sp()}:<br> $\\dfrac{${texNombre(
              villes[index1][1],
              0,
            )}\\text{ hab}}{${texNombre(
              villes[index1][2] * 100,
              0,
            )}\\text{ ha}}=\\dfrac{${texNombre(
              villes[index1][1],
              0,
            )}\\text{ hab}}{${texNombre(
              villes[index1][2],
              2,
            )}\\text{ km}^2}\\approx${miseEnEvidence(
              texNombre(villes[index1][1] / villes[index1][2], 0),
            )}\\text{ hab/km}^{2}$.<br>`
          texteCorr +=
            numAlpha(1) +
            ` À cette date, le nombre d'habitants de ${
              villes[index2][0]
            } était de${sp()}:<br> $${texNombre(
              villes[index2][1] / villes[index2][2],
              0,
            )}\\text{ hab/km}^2\\times ${texNombre(
              villes[index2][2] * 100,
              0,
            )}\\text{ ha}=${texNombre(
              villes[index2][1] / villes[index2][2],
              0,
            )}\\text{ hab/km}^2\\times ${texNombre(
              villes[index2][2],
              1,
            )}\\text{ km}^{2}\\approx${miseEnEvidence(texNombre(villes[index2][1], 0))}\\text{ hab}$.`
          break
        case 11: // problème de masse volumique
          index1 = randint(0, 14)
          index2 = randint(0, 14, [index1])
          v1 = randint(50, 100)
          masse2 = randint(5, 30)
          masse = (materiaux[index1][1] * v1) / 1000000
          v2 = masse2 / materiaux[index2][1]
          texte =
            numAlpha(0) +
            ' La ' +
            ajouterAide(
              "La masse volumique d'un élément est le quotient de la masse de cet élément par le volume qu'il occupe.<br>L'unité de la masse volumique dépend de la nature de l'élément et peut s'exprimer en $\\text{kg/m}^3$ pour les solides ou en g/L pour les gaz, par exemple.",
              {
                texteAvant: 'masse volumique',
                titreAide: `Définition${sp()}: Masse volumique (grandeur physique)`,
              },
            ) +
            ` ${materiaux[index1][2]}${materiaux[index1][0]} est de $${texNombre(
              materiaux[index1][1],
            )}\\text{ kg/m}^3$.<br>`
          texte += `Quelle est la masse d'une pièce de ce métal de $${texNombre(
            v1,
          )}\\text{ cm}^3$${sp()}?<br>`
          texte +=
            numAlpha(1) +
            ` Quel est le volume d'une pièce ${materiaux[index2][3]}${materiaux[index2][0]} ayant une masse de `
          texte += `$${texNombre(masse2)}\\text{ kg}$ (la masse volumique ${materiaux[index2][2]}${
            materiaux[index2][0]
          } est de $${texNombre(materiaux[index2][1])}\\text{ kg/m}^3$)${sp()}?<br>`
          texteCorr =
            numAlpha(0) +
            ` La masse de cette pièce ${materiaux[index2][3]}${
              materiaux[index1][0]
            } est de${sp()}:<br>$${texNombre(
              materiaux[index1][1],
              0,
            )}\\text{ kg/m}^3\\times ${texNombre(
              v1,
              0,
            )}\\text{ cm}^3=${texNombre(
              materiaux[index1][1],
              0,
            )}\\text{ kg/m}^3\\times ${texNombre(
              v1 / 1000000,
              6,
            )}\\text{ m}^3=${texNombre(masse, 6)}\\text{ kg}${egalOuApprox(masse * 1000, 0)}${miseEnEvidence(texNombre(masse * 1000, 0))}$ g.<br>`
          texteCorr +=
            numAlpha(1) +
            ` Le volume de cette pièce ${materiaux[index2][3]}${
              materiaux[index2][0]
            } est de${sp()}:<br>$${texNombre(masse2, 0)}\\text{ kg}\\div ${texNombre(
              materiaux[index2][1],
              0,
            )}\\text{ kg/m}^3${egalOuApprox(v2, 6)}${texNombre(
              v2,
              6,
            )}\\text{ m}^3${egalOuApprox(arrondi(v2, 6) * 1000000, 0)}${miseEnEvidence(
              texNombre(v2 * 1000000, 0),
            )}\\text{ cm}^3$.<br>`
          break
        case 12: // problème de concentration massique
          index1 = randint(0, 4)
          index2 = randint(0, 4, [index1])
          volume1 = randint(2, 15, [10]) / 10
          volume2 = randint(2, 15, [10]) / 10
          if (solutes[index1][2] < 10) {
            masse = (randint(11, solutes[index1][2] * 10) * volume1) / 10 // nombre avec une décimale
          } else masse = randint(2, solutes[index1][2]) * volume1 // nombre avec une décimale
          if (solutes[index2][2] < 10) {
            // concentration en g/L soluté 2.
            concentration2 = randint(11, solutes[index2][2] * 10) / 10
          } else concentration2 = randint(2, solutes[index2][2])
          texte =
            "La concentration massique exprimée ici en $\\text{g/L}$ est la quantité de matière (masse) en $\\text{g}$ par unité de volume ($\\text{L}$).<br>On l'obtient donc en divisant la masse de produit dissous par le volume de la solution ($\\dfrac{m}{V}$).<br>" +
            numAlpha(0) +
            ` On a dissous $${texNombre(masse, 1)}\\text{ g}$ de ${
              solutes[index1][0]
            } dans $${texNombre(volume1, 1)}\\text{ litres}$ ${
              solutes[index1][1]
            }.<br>Calculer la concentration massique de cette solution.<br>`
          texte +=
            numAlpha(1) +
            ` On dispose de $${texNombre(
              volume2,
              1,
            )}$ litres de solution aqueuse de ${
              solutes[index2][0]
            } à $${texNombre(
              concentration2,
              1,
            )}\\text{ g/L}$.<br>Quelle masse de ${
              solutes[index2][0]
            } a été dissous dans l'eau${sp()}?`
          texteCorr =
            numAlpha(0) +
            ` La concentration en ${solutes[index1][0]} de cette solution aqueuse est de${sp()}:<br>`
          texteCorr += ` $\\dfrac{${texNombre(masse, 1)}\\text{ g}}{${texNombre(
            volume1,
            1,
          )}\\text{ L}}=${miseEnEvidence(texNombre(masse / volume1, 1))}\\text{ g/L}.$<br>`
          texteCorr +=
            numAlpha(1) +
            ` La masse de ${solutes[index2][0]} dissous est de${sp()}:<br>`
          texteCorr += `$${texNombre(volume2, 1)}\\text{ L}\\times ${texNombre(
            concentration2,
            1,
          )}\\text{ g/L}=${miseEnEvidence(texNombre(volume2 * concentration2, 2))}\\text{ g}.$`
          break

        case 13: // problème de débit
          index2 = randint(0, 6)
          duree = randint(2, 24)
          vMax = rivieres[index2][3] * 3600
          texte =
            'Le ' +
            ajouterAide(
              "Le débit est le quotient d'un volume d'eau écoulée dans une section de conduit par le temps d'écoulement.<br>L'unité officielle est le mètre cube par seconde ($\\text{m}^3/\\text{s}$) et dans certains cas, on peut utiliser le litre par minute (L/min).",
              {
                texteAvant: 'débit',
                titreAide: `Définition${sp()}: Débit (grandeur physique)`,
              },
            ) +
            ` annuel moyen ${rivieres[index2][6]}${
              rivieres[index2][0]
            } mesuré à ${rivieres[index2][1]} est de $${texNombre(
              rivieres[index2][2],
            )}\\text{ m}^3\\text{/s}$.<br>`
          texte +=
            numAlpha(0) +
            ` Calculer le volume d'eau en $\\text{m}^3$ écoulé en $${duree}$ heures à ce débit.<br>`
          texte +=
            numAlpha(1) +
            ` En ${rivieres[index2][4]} à ${rivieres[index2][1]}, ${
              rivieres[index2][5]
            }${rivieres[index2][0]} a débité $${texNombre(vMax)}\\text{ m}^3$
             en une heure. Quel a été alors son débit en $\\text{ m}^3\\text{/s}$${sp()}?`
          texteCorr =
            numAlpha(0) +
            ` En $${duree}$ heures, il s'écoule en moyenne dans ${rivieres[index2][5]}${rivieres[index2][0]} à ${rivieres[index2][1]}${sp()}:<br>`
          texteCorr += `$\\mathcal{V}=${duree}\\text{ h}\\times${texNombre(
            rivieres[index2][2],
          )}\\text{ m}^3\\text{/s}=${duree}\\times ${texNombre(3600)}\\text{ s}\\times${texNombre(
            rivieres[index2][2],
          )}\\text{ m}^3\\text{/s}=${miseEnEvidence(
            texNombre(duree * 3600 * rivieres[index2][2]),
          )}\\text{ m}^3$.<br>`
          texteCorr +=
            numAlpha(1) +
            ` En ${rivieres[index2][4]}, lors de la crue historique ${rivieres[index2][6]}${rivieres[index2][0]} à ${rivieres[index2][1]}, le débit a été de${sp()}:<br>`
          texteCorr += `$\\text{Débit} = ${texNombre(
            vMax,
          )}\\text{ m}^3\\text{/h}=\\dfrac{${texNombre(
            vMax,
          )}\\text{ m}^3}{1\\text{ h}}=\\dfrac{${texNombre(
            vMax,
          )}\\text{ m}^3}{${texNombre(3600)}\\text{ s}}=${miseEnEvidence(texNombre(vMax / 3600, 0))}\\text{ m}^3\\text{/s}$.<br>`

          break
        case 14: // problème de vitesse de téléchargement
        default:
          unites = ['ko', 'Mo', 'Go']
          index = randint(0, 1)
          if (index === 0) vitesseMoy = randint(200, 999)
          else vitesseMoy = randint(1, 20)
          quidam = prenom()
          nbminutes = randint(3, 10)
          nbsecondes = randint(2, 59)
          masse = randint(15, 35) / 10
          texte =
            numAlpha(0) +
            ` ${quidam} télécharge un fichier depuis un espace de stockage en ligne. Sa ` +
            ajouterAide(
              "La vitesse de téléchargement est le quotient de la quantité de données téléchargées (en ko, Mo ou Go) par la durée de téléchargement (en secondes).<br>L'unité de cette grandeur quotient est le ko/s (ou Mo/s)",
              {
                texteAvant: 'vitesse de téléchargement',
                titreAide: `Définition${sp()}: Vitesse de téléchargement`,
              },
            ) +
            ` est de $${vitesseMoy}$ $\\text{${unites[index]}/s}$.<br>`
          texte += `Le téléchargement dure $${nbminutes}$ minutes et $${nbsecondes}$ secondes. Quelle est la taille du fichier téléchargé en $\\text{${unites[index]}}$${sp()}?<br>`
          texte +=
            numAlpha(1) +
            ` ${quidam} veut télécharger un fichier de $${texNombre(
              masse,
              1,
            )}\\text{ Go}$. Quelle sera la durée du téléchargement si sa vitesse de téléchargement est de $${vitesseMoy}$ $\\text{${
              unites[index]
            }/s}$${sp()}?<br>`
          texteCorr = numAlpha(0) + ` La taille du fichier téléchargé est${sp()}:<br>`
          tailleFichier = (nbminutes * 60 + nbsecondes) * vitesseMoy
          texteCorr += `$(${nbminutes}\\times 60 +${nbsecondes})\\text{ s}\\times ${vitesseMoy} \\text{ ${
            unites[index]
          }/s} = ${
            nbminutes * 60 + nbsecondes
          }\\text{ s}\\times ${vitesseMoy} \\text{ ${
            unites[index]
          }/s} = ${miseEnEvidence(texNombre(tailleFichier, 0))} \\text{ ${unites[index]}}$`
          if (tailleFichier > 1000) {
            texteCorr += `$ =${miseEnEvidence(texNombre(tailleFichier / 1000, 3))} \\text{ ${
              unites[index + 1]
            }}$`
          }
          texteCorr += '.<br>'
          texteCorr += numAlpha(1) + ` La durée du téléchargement sera de${sp()}:<br>`
          if (index === 0) {
            texteCorr += `$${texNombre(masse, 1)}\\times ${texNombre(
              10 ** 6,
              0,
            )} \\text{ ko} \\div ${vitesseMoy} \\text{ ${unites[index]}/s}$ `
            tailleFichier = masse * 10 ** 6
          } else {
            texteCorr += `$${texNombre(masse, 1)}\\times ${texNombre(
              10 ** 3,
              0,
            )} \\text{ Mo} \\div ${vitesseMoy} \\text{ ${unites[index]}/s}$`
            tailleFichier = masse * 10 ** 3
          }
          texteCorr += `$${sp(2)}=\\dfrac{${texNombre(tailleFichier, 0)}}{${vitesseMoy}}\\text{ s}`
          nbheures = Math.floor(tailleFichier / vitesseMoy / 3600)
          nbminutes = Math.floor(
            (tailleFichier / vitesseMoy - 3600 * nbheures) / 60,
          )
          nbsecondes = Math.floor(
            tailleFichier / vitesseMoy - 3600 * nbheures - 60 * nbminutes,
          )
          if (
            tailleFichier / vitesseMoy ===
            nbsecondes + 60 * nbminutes + 3600 * nbheures
          ) {
            texteCorr += '='
          } else texteCorr += '\\approx'
          texteCorr += `${[
            nbheures !== 0 ? `${miseEnEvidence(nbheures)} \\text{ h }` : '',
            nbminutes !== 0 ? `${miseEnEvidence(nbminutes)} \\text{ min }` : '',
            nbsecondes !== 0 ? `${miseEnEvidence(nbsecondes)} \\text{ s}` : '',
          ].join('')}$.`

          break
      }
      if (this.questionJamaisPosee(i, texteCorr)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // Espacement de 2 em entre chaque question.
  }
}
