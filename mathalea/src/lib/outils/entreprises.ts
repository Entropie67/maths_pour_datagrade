import { choice, shuffle } from './arrayOutils'

export const entreprises: {
  entreprise: string
  determinant: string
  pronom: string
}[] = [
  {
    entreprise: 'le magasin de matériaux Brique-à-Brac',
    determinant: 'le',
    pronom: 'il',
  },
  {
    entreprise: 'la librairie Jeux-de-mots',
    determinant: 'la',
    pronom: 'elle',
  },
  {
    entreprise: 'le cabinet dentaire Dent-pour-dent',
    determinant: 'le',
    pronom: 'il',
  },
  {
    entreprise: "l'entreprise Vert-le-Futur",
    determinant: "l'",
    pronom: 'elle',
  },
  {
    entreprise: 'la menuiserie Clou-du-Spectacle',
    determinant: 'la',
    pronom: 'elle',
  },
  {
    entreprise: 'le cabinet juridique Droit-au-But',
    determinant: 'le',
    pronom: 'il',
  },
  { entreprise: 'la boutique Belle-de-Mai', determinant: 'la', pronom: 'elle' },
  {
    entreprise: "l'atelier de couture Cousu-Main",
    determinant: "l'",
    pronom: 'il',
  },
  {
    entreprise: 'le salon de coiffure Cheveux-Cher',
    determinant: 'le',
    pronom: 'il',
  },
  {
    entreprise: 'le magasin de chaussures Pied-à-Terre',
    determinant: 'le',
    pronom: 'il',
  },
  {
    entreprise: "l'agence de voyages Comptoir-des-Rêves",
    determinant: "l'",
    pronom: 'elle',
  },
  {
    entreprise: "l'école de programmation Code-et-Confiture",
    determinant: "l'",
    pronom: 'elle',
  },
  { entreprise: "l'agence Hashtag-et-Cie", determinant: "l'", pronom: 'elle' },
  {
    entreprise: 'la pâtisserie Ctrl-Alt-Délices',
    determinant: 'la',
    pronom: 'elle',
  },
  {
    entreprise: 'le restaurant Bouillon-de-Culture',
    determinant: 'le',
    pronom: 'il',
  },
  {
    entreprise: 'la pension féline Chat-Pitre',
    determinant: 'la',
    pronom: 'elle',
  },
  {
    entreprise: 'la recyclerie Tri-Logis',
    determinant: 'la',
    pronom: 'elle',
  },
]

/**
 * Renvoie un nom d'entrepise au hasard ou une liste de noms d'entreprise
 * @author Mireille Gain
 */
export function entreprise(n = 1) {
  const entreprisesArray = entreprises.map((element) => element.entreprise) // Conversion de Set en tableau
  if (n === 1) {
    return choice(entreprisesArray)
  } else {
    return shuffle(entreprisesArray).slice(0, n)
  }
}
