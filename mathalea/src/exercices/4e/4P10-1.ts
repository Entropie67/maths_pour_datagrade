import { courbe } from '../../lib/2d/Courbe'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { bleuMathalea } from '../../lib/colors'
import { texPrix, texteGras } from '../../lib/format/style'
import { choice } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { numAlpha } from '../../lib/outils/outilString'
import { prenom } from '../../lib/outils/Personne'
import { premierMultipleSuperieur } from '../../lib/outils/primalite'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'
export const titre =
  "Résoudre un problème de proportionnalité à l'aide d'un graphique"

/**
 * fork de 4P10-1 par Jean-claude Lhote
 * @author Sébastien LOZANO
 */

export const uuid = 'c668a'

export const refs = {
  'fr-fr': ['4P10-1', 'BP2AutoL2'],
  'fr-ch': ['9R1FA1A-6', '9R2FA1A-6', '9R3FA1A-6', 'PRQPF03A-7'],
}
export default class GraphiquesEtProportionnalite2 extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacingCorr = 2
    this.spacing = context.isHtml ? 2 : 1
  }

  nouvelleVersion() {
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // on prévoit un peu d'aléatoire pour les prix unitaires
      const prixUnitaireOranges = choice([0.8, 1.2, 1.4])
      const prixUnitaireBaguettes = choice([0.6, 0.8, 1.2])
      // on prévoit un tableau avec des situations
      const situations = [
        {
          lieu: "l'épicerie",
          prenom: prenom(),
          articles: 'oranges',
          art_articles: "d'oranges",
          prix_unitaire: prixUnitaireOranges,
          qte: 'poids',
          qte_max: 10,
          qte2: randint(2, 7),
          unite: "kg d'",
          legendeX: 'poids en kg',
          legendeY: 'prix en €',
          fig: {},
          figureCorr: {},
        },
        {
          lieu: 'la boulangerie',
          prenom: prenom(),
          articles: 'baguettes',
          art_articles: 'de baguettes',
          prix_unitaire: prixUnitaireBaguettes,
          qte: 'nombre',
          qte_max: 10,
          qte2: randint(2, 7),
          unite: '',
          legendeX: 'quantité',
          legendeY: 'prix en €',
          fig: {},
          figureCorr: {},
        },
      ]
      // on en choisit une
      const situation = choice(situations)
      let r
      const xscale = 1
      const yscale = 1
      // pour aléatoiriser un peu le pas sur l'axe des prix
      const stepAxeSecondaire = 0.2
      // on finit les appels
      const mesAppels: NestedObjetMathalea2dArray = [
        (r = repere({
          xMin: 0,
          yMin: 0,
          yMax: premierMultipleSuperieur(
            yscale,
            (situation.qte_max + 1) * situation.prix_unitaire + yscale,
          ),
          xMax: situation.qte_max + 1,
          xUnite: 1,
          yUnite: 1 / yscale,
          yThickDistance: yscale,
          xLegende: situation.legendeX,
          yLegende: situation.legendeY,
          grille: true,
          grilleOpacite: 0.5,
          grilleXDistance: 1,
          grilleYDistance: yscale,
          grilleXMin: 0,
          grilleYMin: 0,
          grilleSecondaire: true,
          grilleSecondaireXDistance: 0.2,
          grilleSecondaireYDistance: yscale / 5,
          grilleSecondaireXMin: 0,
          grilleSecondaireYMin: 0,
          grilleSecondaireXMax: situation.qte_max + 1,
          grilleSecondaireYMax: premierMultipleSuperieur(
            yscale,
            (situation.qte_max + 1) * situation.prix_unitaire + yscale,
          ),
          yLegendePosition: [
            0.2,
            premierMultipleSuperieur(
              yscale,
              (situation.qte_max + 1) * situation.prix_unitaire + yscale,
            ) /
              yscale +
              0.5,
          ],
          xLegendePosition: [situation.qte_max + 0.7, -0.5],
        })),
      ]
      const f = (x: number) => situation.prix_unitaire * x
      mesAppels.push(
        r,
        courbe(f, {
          repere: r,
          xMin: 0,
          xMax: situation.qte_max + 1,
          color: 'black',
          epaisseur: 1.5,
        }),
      )
      // on prépare l'objet figure
      const fig = mathalea2d(
        {
          xmin: -xscale,
          ymin: -1.5,
          xmax: situation.qte_max / xscale + 3,
          ymax:
            ((situation.qte_max + 1) * situation.prix_unitaire + yscale) /
              yscale +
            2,
          pixelsParCm: 30,
        },
        mesAppels,
      )
      situation.fig = fig

      // on prépare les appels supplémentaires pour la correction
      const mesAppelsCorr = mesAppels
      const A = pointAbstrait(situation.qte_max, 0)
      const B = pointAbstrait(
        situation.qte_max,
        arrondi((situation.qte_max * situation.prix_unitaire) / yscale),
      )
      const s1 = segment(A, B, 'red')
      s1.epaisseur = 2
      s1.pointilles = 5
      s1.styleExtremites = '->'
      const C = pointAbstrait(
        0,
        arrondi((situation.qte_max * situation.prix_unitaire) / yscale),
      )
      const s2 = segment(B, C, 'red')
      s2.epaisseur = 2
      s2.pointilles = 5
      s2.styleExtremites = '->'

      const D = pointAbstrait(situation.qte2, 0)
      const E = pointAbstrait(
        situation.qte2,
        arrondi((situation.qte2 * situation.prix_unitaire) / yscale),
      )
      const s3 = segment(D, E, bleuMathalea)
      s3.epaisseur = 2
      s3.pointilles = 5
      s3.styleExtremites = '->'
      const F = pointAbstrait(
        0,
        arrondi((situation.qte2 * situation.prix_unitaire) / yscale),
      )
      const s4 = segment(E, F, bleuMathalea)
      s4.epaisseur = 2
      s4.pointilles = 5
      s4.styleExtremites = '->'

      // on ajoute les appels pour la correction
      mesAppelsCorr.push(s1, s2, s3, s4)

      // on prépare l'objet figure correction
      const figureCorr = mathalea2d(
        {
          xmin: -xscale,
          ymin: -1,
          xmax: situation.qte_max / xscale + 3,
          ymax: (situation.qte_max * situation.prix_unitaire + 4) / yscale + 1,
          pixelsParCm: 30,
        },
        mesAppelsCorr,
      )
      situation.figureCorr = figureCorr

      // un compteur pour les sous-questions
      let k = 0
      let kCorr = 0

      const enonces = []
      enonces.push({
        enonce: `
          À ${situation.lieu}, ${situation.prenom} utilise le graphique ci-dessous pour indiquer le prix de ses ${situation.articles} en fonction du ${situation.qte} ${situation.art_articles}.<br>
          ${situation.fig}
          ${numAlpha(k++)} Justifier que c'est une situation de proportionnalité à l'aide du graphique.<br>
           ${numAlpha(k++)} Quel est le prix de $${situation.qte_max}$ ${situation.unite} ${situation.articles} ?<br>
            ${numAlpha(k++)} Quel est le prix de $${situation.qte2}$ ${situation.unite} ${situation.articles} ?`,
        // question:``,
        correction: `
         ${numAlpha(kCorr++)} Ce graphique est une droite qui passe par l'origine.<br>
          ${texteEnCouleurEtGras("C'est donc bien le graphique d'une situation de proportionnalité.")}<br>
          ${numAlpha(kCorr++)} Par lecture graphique, en utilisant les pointillés rouges du graphe ci-dessous, ${texteEnCouleurEtGras(`$\\mathbf{${situation.qte_max}}$ ${situation.unite} ${situation.articles} coûtent $\\mathbf{${texPrix(arrondi(situation.qte_max * situation.prix_unitaire))}}$ €.`)}<br>
          ${situation.figureCorr}
        ${numAlpha(kCorr++)} Pour $${situation.qte2}$ ${situation.unite} ${situation.articles}, la lecture graphique est moins facile, nous allons détailler deux méthodes.<br><br>
         ${texteGras('Première méthode par lecture graphique :')}<br>
          Il faut prendre en compte que chaque petit carreau représente $${texPrix(stepAxeSecondaire * yscale)}$ € et utiliser les pointillés bleus.<br><br>
           ${texteGras('Seconde méthode en calculant une quatrième proportionnelle :')}<br>
         $${situation.qte_max}$ ${situation.unite} ${situation.articles} coûtent $${texPrix(arrondi(situation.qte_max * situation.prix_unitaire))}$ €
        donc $${situation.qte2}$ ${situation.unite} ${situation.articles} coûtent : <br> $(${texPrix(arrondi(situation.qte_max * situation.prix_unitaire))}$ € $\\div ${situation.qte_max}$ ${situation.articles} $)\\times (${situation.qte2}$ ${situation.articles}) $= ${texPrix(arrondi(situation.qte2 * situation.prix_unitaire))}$ €<br><br>
        ${texteEnCouleurEtGras(`Quelle que soit la méthode utilisée, $\\mathbf{${situation.qte2}}$ ${situation.unite} ${situation.articles} coûtent $\\mathbf{${texPrix(arrondi(situation.qte2 * situation.prix_unitaire))}}$ €.`)}
        `,
      })
      texte = `${enonces[0].enonce}`
      texteCorr = `${enonces[0].correction}`

      if (
        this.questionJamaisPosee(i, prixUnitaireBaguettes, prixUnitaireOranges)
      ) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
