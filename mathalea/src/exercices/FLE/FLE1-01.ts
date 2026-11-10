import { emoji } from '../../lib/2d/figures2d/Emojis'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { texteParPosition } from '../../lib/2d/textes'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer avec des prix (apprentissage du français)'
export const interactifReady = true
export const dateDePublication = '06/11/2026'
export const uuid = 'c41d8'
export const refs = {
  'fr-fr': ['FLE1-01'],
  'fr-ch': [],
}

/**
 * Panier de courses : vocabulaire de base (fruits, prix, monnaie) et
 * opérations élémentaires, pour des élèves apprenant le français.
 * @author Stéphane Guyon
 */

type Categorie = 'fruit' | 'legume' | 'epicerie' | 'boulangerie'

type Produit = {
  cle: string // identifiant (sans accent ni espace) de l'emoji
  unicode: string // code Twemoji
  nom: string // étiquette sous l'image
  un: string // « une pomme », « une bouteille de lait »
  pluriel: string // « pommes », « bouteilles de lait »
  categorie: Categorie
  min: number // prix minimal en euros
  max: number // prix maximal en euros
}

const produits: Produit[] = [
  {
    cle: 'pomme',
    unicode: '1f34e',
    nom: 'pomme',
    un: 'une pomme',
    pluriel: 'pommes',
    categorie: 'fruit',
    min: 1,
    max: 3,
  },
  {
    cle: 'banane',
    unicode: '1f34c',
    nom: 'banane',
    un: 'une banane',
    pluriel: 'bananes',
    categorie: 'fruit',
    min: 1,
    max: 3,
  },
  {
    cle: 'orange',
    unicode: '1f34a',
    nom: 'orange',
    un: 'une orange',
    pluriel: 'oranges',
    categorie: 'fruit',
    min: 1,
    max: 3,
  },
  {
    cle: 'poire',
    unicode: '1f350',
    nom: 'poire',
    un: 'une poire',
    pluriel: 'poires',
    categorie: 'fruit',
    min: 1,
    max: 3,
  },
  {
    cle: 'fraise',
    unicode: '1f353',
    nom: 'fraises',
    un: 'une barquette de fraises',
    pluriel: 'barquettes de fraises',
    categorie: 'fruit',
    min: 2,
    max: 5,
  },
  {
    cle: 'ananas',
    unicode: '1f34d',
    nom: 'ananas',
    un: 'un ananas',
    pluriel: 'ananas',
    categorie: 'fruit',
    min: 2,
    max: 5,
  },
  {
    cle: 'citron',
    unicode: '1f34b',
    nom: 'citron',
    un: 'un citron',
    pluriel: 'citrons',
    categorie: 'fruit',
    min: 1,
    max: 2,
  },
  {
    cle: 'kiwi',
    unicode: '1f95d',
    nom: 'kiwi',
    un: 'un kiwi',
    pluriel: 'kiwis',
    categorie: 'fruit',
    min: 1,
    max: 2,
  },
  {
    cle: 'peche',
    unicode: '1f351',
    nom: 'pêche',
    un: 'une pêche',
    pluriel: 'pêches',
    categorie: 'fruit',
    min: 1,
    max: 3,
  },
  {
    cle: 'pasteque',
    unicode: '1f349',
    nom: 'pastèque',
    un: 'une pastèque',
    pluriel: 'pastèques',
    categorie: 'fruit',
    min: 3,
    max: 6,
  },
  {
    cle: 'melon',
    unicode: '1f348',
    nom: 'melon',
    un: 'un melon',
    pluriel: 'melons',
    categorie: 'fruit',
    min: 2,
    max: 4,
  },
  {
    cle: 'carotte',
    unicode: '1f955',
    nom: 'carottes',
    un: 'un sachet de carottes',
    pluriel: 'sachets de carottes',
    categorie: 'legume',
    min: 1,
    max: 3,
  },
  {
    cle: 'brocoli',
    unicode: '1f966',
    nom: 'brocoli',
    un: 'un brocoli',
    pluriel: 'brocolis',
    categorie: 'legume',
    min: 1,
    max: 3,
  },
  {
    cle: 'tomate',
    unicode: '1f345',
    nom: 'tomates',
    un: 'une barquette de tomates',
    pluriel: 'barquettes de tomates',
    categorie: 'legume',
    min: 2,
    max: 4,
  },
  {
    cle: 'pommeDeTerre',
    unicode: '1f954',
    nom: 'pommes de terre',
    un: 'un sac de pommes de terre',
    pluriel: 'sacs de pommes de terre',
    categorie: 'legume',
    min: 2,
    max: 5,
  },
  {
    cle: 'mais',
    unicode: '1f33d',
    nom: 'maïs',
    un: 'un épi de maïs',
    pluriel: 'épis de maïs',
    categorie: 'legume',
    min: 1,
    max: 2,
  },
  {
    cle: 'concombre',
    unicode: '1f952',
    nom: 'concombre',
    un: 'un concombre',
    pluriel: 'concombres',
    categorie: 'legume',
    min: 1,
    max: 2,
  },
  {
    cle: 'oignon',
    unicode: '1f9c5',
    nom: 'oignons',
    un: "un filet d'oignons",
    pluriel: "filets d'oignons",
    categorie: 'legume',
    min: 1,
    max: 3,
  },
  {
    cle: 'aubergine',
    unicode: '1f346',
    nom: 'aubergine',
    un: 'une aubergine',
    pluriel: 'aubergines',
    categorie: 'legume',
    min: 1,
    max: 3,
  },
  {
    cle: 'salade',
    unicode: '1f96c',
    nom: 'salade',
    un: 'une salade',
    pluriel: 'salades',
    categorie: 'legume',
    min: 1,
    max: 2,
  },
  {
    cle: 'champignon',
    unicode: '1f344',
    nom: 'champignons',
    un: 'une barquette de champignons',
    pluriel: 'barquettes de champignons',
    categorie: 'legume',
    min: 2,
    max: 4,
  },
  {
    cle: 'avocat',
    unicode: '1f951',
    nom: 'avocat',
    un: 'un avocat',
    pluriel: 'avocats',
    categorie: 'legume',
    min: 1,
    max: 2,
  },
  {
    cle: 'pain',
    unicode: '1f35e',
    nom: 'pain',
    un: 'un pain',
    pluriel: 'pains',
    categorie: 'boulangerie',
    min: 2,
    max: 4,
  },
  {
    cle: 'baguette',
    unicode: '1f956',
    nom: 'baguette',
    un: 'une baguette',
    pluriel: 'baguettes',
    categorie: 'boulangerie',
    min: 1,
    max: 2,
  },
  {
    cle: 'lait',
    unicode: '1f95b',
    nom: 'lait',
    un: 'une bouteille de lait',
    pluriel: 'bouteilles de lait',
    categorie: 'epicerie',
    min: 1,
    max: 2,
  },
  {
    cle: 'fromage',
    unicode: '1f9c0',
    nom: 'fromage',
    un: 'un fromage',
    pluriel: 'fromages',
    categorie: 'epicerie',
    min: 3,
    max: 6,
  },
  {
    cle: 'oeuf',
    unicode: '1f95a',
    nom: 'œufs',
    un: "une boîte d'œufs",
    pluriel: "boîtes d'œufs",
    categorie: 'epicerie',
    min: 2,
    max: 4,
  },
  {
    cle: 'riz',
    unicode: '1f35a',
    nom: 'riz',
    un: 'un paquet de riz',
    pluriel: 'paquets de riz',
    categorie: 'epicerie',
    min: 1,
    max: 3,
  },
  {
    cle: 'sel',
    unicode: '1f9c2',
    nom: 'sel',
    un: 'un paquet de sel',
    pluriel: 'paquets de sel',
    categorie: 'epicerie',
    min: 1,
    max: 2,
  },
  {
    cle: 'pates',
    unicode: '1f35d',
    nom: 'pâtes',
    un: 'un paquet de pâtes',
    pluriel: 'paquets de pâtes',
    categorie: 'epicerie',
    min: 1,
    max: 3,
  },
  {
    cle: 'miel',
    unicode: '1f36f',
    nom: 'miel',
    un: 'un pot de miel',
    pluriel: 'pots de miel',
    categorie: 'epicerie',
    min: 3,
    max: 6,
  },
  {
    cle: 'croissant',
    unicode: '1f950',
    nom: 'croissant',
    un: 'un croissant',
    pluriel: 'croissants',
    categorie: 'boulangerie',
    min: 1,
    max: 2,
  },
  {
    cle: 'bretzel',
    unicode: '1f968',
    nom: 'bretzel',
    un: 'un bretzel',
    pluriel: 'bretzels',
    categorie: 'boulangerie',
    min: 1,
    max: 2,
  },
  {
    cle: 'bagel',
    unicode: '1f96f',
    nom: 'bagel',
    un: 'un bagel',
    pluriel: 'bagels',
    categorie: 'boulangerie',
    min: 1,
    max: 3,
  },
  {
    cle: 'gateau',
    unicode: '1f370',
    nom: 'gâteau',
    un: 'une part de gâteau',
    pluriel: 'parts de gâteau',
    categorie: 'boulangerie',
    min: 2,
    max: 4,
  },
  {
    cle: 'cookie',
    unicode: '1f36a',
    nom: 'cookie',
    un: 'un cookie',
    pluriel: 'cookies',
    categorie: 'boulangerie',
    min: 1,
    max: 2,
  },
  {
    cle: 'beignet',
    unicode: '1f369',
    nom: 'beignet',
    un: 'un beignet',
    pluriel: 'beignets',
    categorie: 'boulangerie',
    min: 1,
    max: 2,
  },
]

/** Montant en centimes, écrit à la française avec deux décimales : `1,90` */
function montant(centimes: number): string {
  return (centimes / 100).toFixed(2).replace('.', ',')
}

/** Montant dans une formule mathématique : `1{,}90` */
function montantTex(centimes: number): string {
  return (centimes / 100).toFixed(2).replace('.', '{,}')
}

type Article = { produit: Produit; prix: number }

/** Figure : chaque produit avec son nom et son prix (en centimes). */
function figureProduits(articles: Article[]) {
  const ecart = 3.2
  const objets = articles.flatMap(({ produit, prix }, k) => {
    const x = k * ecart
    const forme = emoji(produit.cle, produit.unicode)
      .clone()
      .dilate(2)
      .translate(x, 0)
    return [
      forme,
      texteParPosition(produit.nom, x, -1.5, 0, 'black', 1.2),
      texteParPosition(`${montant(prix)} €`, x, -2.4, 0, 'black', 1.2),
    ]
  })
  // Les définitions (<defs>) des emojis, une seule fois par produit
  const definitions = [
    ...new Map(
      articles.map(({ produit }) => [
        produit.cle,
        emoji(produit.cle, produit.unicode).shapeDef,
      ]),
    ).values(),
  ]
  return mathalea2d(
    Object.assign(
      fixeBordures(objets, { rxmin: -1, rxmax: 1, rymin: -0.5, rymax: 0.5 }),
      { pixelsParCm: 30, scale: 0.7 },
    ),
    [...definitions, ...objets],
  )
}

export default class PanierDeCourses extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.sup = 4
    this.sup2 = 3
    this.sup3 = 4
    this.sup4 = 5
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Montant total du panier',
        '2 : Monnaie à rendre',
        '3 : Plusieurs articles identiques',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2Numerique = [
      'Prix',
      3,
      "1 : Prix entiers\n2 : Prix au dixième d'euro (1,90 €)\n3 : Prix au centime (0,95 €)",
    ]
    this.besoinFormulaire3Numerique = ["Nombre d'articles du panier", 5]
    this.besoinFormulaire4Numerique = [
      'Produits',
      5,
      '1 : Fruits\n2 : Légumes\n3 : Épicerie\n4 : Boulangerie\n5 : Mélange',
    ]
  }

  nouvelleVersion() {
    const types = combinaisonListes(
      gestionnaireFormulaireTexte({
        saisie: this.sup,
        max: 3,
        melange: 4,
        defaut: 4,
        nbQuestions: this.nbQuestions,
      }),
      this.nbQuestions,
    )
    const nbArticles = Math.min(5, Math.max(2, this.sup3))
    const categorie = (['fruit', 'legume', 'epicerie', 'boulangerie'] as const)[
      this.sup4 - 1
    ]
    const catalogue = categorie
      ? produits.filter((p) => p.categorie === categorie)
      : produits

    // Prix en centimes : euros entiers, multiples de 10 ou de 5 centimes
    const tirePrix = (p: Produit) =>
      this.sup2 === 1
        ? randint(p.min, p.max) * 100
        : this.sup2 === 2
          ? randint(p.min * 10, p.max * 10 - 1) * 10
          : randint(p.min * 20, p.max * 20 - 1) * 5

    for (let i = 0; i < this.nbQuestions; i++) {
      let texte: string
      let texteCorr: string
      let reponse: number
      let finEnonce: string // consigne (non interactif)
      let debutReponse: string // phrase à compléter (interactif)

      if (types[i] === 3) {
        const produit = shuffle(catalogue)[0]
        const prix = tirePrix(produit)
        const quantite = randint(2, 5)
        const total = prix * quantite
        reponse = total / 100
        texte =
          `${produit.un.charAt(0).toUpperCase()}${produit.un.slice(1)} coûte ${montant(prix)}${sp()}€.<br>` +
          `${figureProduits([{ produit, prix }])}<br>` +
          `Je prends ${quantite} ${produit.pluriel}.<br>`
        finEnonce = 'Calculer le prix à payer.'
        debutReponse = 'Le prix à payer est'
        texteCorr = `$${quantite}\\times ${montantTex(prix)}=${miseEnEvidence(montantTex(total))}$ €.`
      } else {
        const articles: Article[] = shuffle(catalogue)
          .slice(0, nbArticles)
          .map((produit) => ({ produit, prix: tirePrix(produit) }))
        const total = articles.reduce((s, a) => s + a.prix, 0)
        const somme = articles.map((a) => montantTex(a.prix)).join('+')
        texte = `Voici mon panier de courses :<br>${figureProduits(articles)}<br>`
        if (types[i] === 1) {
          reponse = total / 100
          finEnonce = 'Calculer le montant total du panier.'
          debutReponse = 'Le montant total du panier est'
          texteCorr = `$${somme}=${miseEnEvidence(montantTex(total))}$ €.`
        } else {
          const billet = [10, 20, 50].find((b) => b * 100 > total) ?? 100
          reponse = (billet * 100 - total) / 100
          texte += `Je paie avec un billet de ${billet}${sp()}€.<br>`
          finEnonce = 'Combien le vendeur me rend-il ?'
          debutReponse = 'Le vendeur me rend'
          texteCorr =
            `Montant total : $${somme}=${montantTex(total)}$ €.<br>` +
            `Monnaie : $${billet}-${montantTex(total)}=${miseEnEvidence(montantTex(billet * 100 - total))}$ €.`
        }
      }

      if (this.interactif) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
          texteAvant: `${debutReponse}${sp()}`,
          texteApres: `${sp()}€`,
        })
      }
      if (!this.interactif) texte += finEnonce
      handleAnswers(this, i, { reponse: { value: reponse } })
      this.listeQuestions[i] = texte
      this.listeCorrections[i] = texteCorr
    }
    listeQuestionsToContenu(this)
  }
}
