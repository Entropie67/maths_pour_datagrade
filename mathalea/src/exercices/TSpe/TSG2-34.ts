import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import Exercice from '../Exercice'
import {
  combinaisonListes,
  shuffle3tableaux,
} from '../../lib/outils/arrayOutils'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
export const titre = 'Déterminer si deux droites sont orthogonales'

export const dateDePublication = '29/01/2025' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

export const uuid = '34648'
export const refs = {
  'fr-fr': ['TSG2-34'],
  'fr-ch': ['3G98-4'],
}

// La fonction qui aléatoirise la situation en fonction de ortho true or false. Elle retourne toutes les variables dont a besoin l'exo.
// elle est récursive et ne retourne une valeur que si elle est en accord avec ortho (pour éviter un cas particulier qu'on n'aurait pas prévu.)
const situationAleatoire = function (choix: number) {
  let xA = randint(-10, 10, 0)
  let yA = randint(-10, 10, 0)
  let zA = randint(-10, 10, 0)
  let yB = randint(-10, 10, [0, yA])
  const deltaZ = randint(-3, 3, [0])
  let zB = zA + deltaZ // On s'arrange pour que zB-zA = -2, -1, 1 ou 2.
  const k = randint(-2, 2, [0]) // ce qui donne (xAB/zAB = k)
  let xB = xA + k * (zB - zA)

  // on doit trouver a, b et c tels que a*xAB+b*yAB+c*zAB=0
  // on prend b=0
  // on trouve c=-a*x/z=-a*k
  let a = randint(-3, 3, [0])
  let b = 0
  let c = -a * k // il faut que ce nombre soit entier... On définit xAB et zAB de manière à ce que ce soit le cas
  // Si on ne veut pas d'orthogonalité on modifie l'une des composante de u avant le mélange.
  const ortho = choix === 0
  if (!ortho) {
    if (choix === 1) a++
    else if (choix === 2) b++
    else c++
  }

  const x = randint(-10, 10, [0, xA, xB])
  const y = randint(-10, 10, [0, yA, yB])
  const z = randint(-10, 10, [0, zA])
  // On va mélanger les tableaux afin que ce ne soit pas toujours b qui soit nul
  const tab1 = [a, b, c].slice()
  const tab2 = [xA, yA, zA].slice()
  const tab3 = [xB, yB, zB].slice()
  shuffle3tableaux(tab1, tab2, tab3)
  a = tab1[0]
  b = tab1[1]
  c = tab1[2]
  xA = tab2[0]
  yA = tab2[1]
  zA = tab2[2]
  xB = tab3[0]
  yB = tab3[1]
  zB = tab3[2]
  const xAB = xB - xA
  const yAB = yB - yA
  const zAB = zB - zA
  if ((xAB * a + yAB * b + zAB * c === 0) !== ortho)
    return situationAleatoire(choix) // Si le produit scalaire n'est pas en accord avec ortho, on recommence.
  return { xA, yA, xB, yB, zA, zB, xAB, yAB, zAB, a, b, c, x, y, z }
}

/**
 *
 * @author Stéphane Guyon

*/
export default class nomExercice extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.consigne = ''
  }

  nouvelleVersion() {
    const typeQuestionsDisponibles = ['type1'] // On créé 3 types de questions

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Boucle principale où i+1 correspond au numéro de la question
      // Modifier a, b ou c pour que le produit scalaire soit non nul (et donc que les droites ne soient pas orthogonales)
      // On doit trouver un vecteur directeur de la droite (AB) qui soit non orthogonal à (Delta)
      const produitScalaire = randint(0, 3)
      const { xA, yA, xB, yB, zA, zB, a, b, c, x, y, z } =
        situationAleatoire(produitScalaire)
      // Il n'y a pas besoin de switch... on peut directement écrire le texte
      switch (
        listeTypeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'type1': // orthogonal
          break
        case 'type2': // défavorable
        default:
          break
      }
      texte =
        "Dans un repère orthonormé de l'espace, on donne les coordonnées des points $A$ et $B$ et la représentation paramétrique d'une droite $(\\Delta)$ :<br>"
      texte += `$ A(${xA}~;~${yA}~;~${zA})$ ; $B(${xB}~;~${yB}~;~${zB})$ et `
      texte += `$(\\Delta) : \\begin{cases}x=${x}${a !== 0 ? `${ecritureAlgebriqueSauf1(a)}t` : ''}\\\\y=${y}${b !== 0 ? `${ecritureAlgebriqueSauf1(b)}t` : ''} \\quad (t\\in\\mathbb{R})\\\\z=${z}${c !== 0 ? `${ecritureAlgebriqueSauf1(c)}t` : ''}\\end{cases}$`
      texte +=
        '<br>Déterminer si les droites $(AB)$ et $(\\Delta)$ sont orthogonales.'
      texteCorr =
        "Pour prouver l'orthogonalité de deux droites, il suffit de vérifier si le produit scalaire de deux de leurs vecteurs directeurs respectifs est nul.<br>"
      texteCorr +=
        "Un vecteur directeur de la droite $(\\Delta)$ est, d'après le cours, directement donné par sa représentation paramétrique :<br>"
      texteCorr +=
        'Si $(\\Delta) : \\begin{cases}x=x_A+at\\\\y=y_A+bt\\quad (t\\in\\mathbb{R})\\\\z=z_A+ct\\end{cases}$<br>'
      texteCorr +=
        'alors un vecteur directeur de la droite $(\\Delta)$ est $\\overrightarrow{u}\\begin{pmatrix} a\\\\b\\\\c\\end{pmatrix}$<br>'
      texteCorr += `On en déduit que dans notre situation, un vecteur directeur de la droite $(\\Delta)$ est $\\overrightarrow{u}\\begin{pmatrix} ${a}\\\\${b}\\\\${c}\\end{pmatrix}$<br>`
      texteCorr +=
        'On calcule les coordonnées du vecteur $\\overrightarrow{AB}$ vecteur directeur de la droite $(AB)$ :<br>'
      texteCorr += `$\\overrightarrow{AB}\\begin{pmatrix} ${xB}${ecritureAlgebrique(-xA)}\\\\${yB}${ecritureAlgebrique(-yA)}\\\\${zB}${ecritureAlgebrique(-zA)}\\end{pmatrix}\\iff\\overrightarrow{AB}\\begin{pmatrix} ${xB - xA}\\\\${yB - yA}\\\\${zB - zA}\\end{pmatrix}$<br>`
      texteCorr += 'On calcule le produit scalaire de ces deux vecteurs : <br>'
      texteCorr += `$\\overrightarrow{u}\\cdot\\overrightarrow{AB} = ${a}\\times ${ecritureParentheseSiNegatif(xB - xA)}+${ecritureParentheseSiNegatif(b)}\\times ${ecritureParentheseSiNegatif(yB - yA)}+${ecritureParentheseSiNegatif(c)}\\times ${ecritureParentheseSiNegatif(zB - zA)}=${a * (xB - xA) + b * (yB - yA) + c * (zB - zA)}$<br>`
      texteCorr += 'Le produit scalaire des deux vecteurs directeurs étant'
      if (produitScalaire === 0) {
        texteCorr += ' nul, ils sont orthogonaux.<br>'
        texteCorr += `Les droites $(\\Delta)$ et $(AB)$ ${texteEnCouleurEtGras('sont donc orthogonales')}.<br>`
      } else {
        texteCorr += ' non nul, ils ne sont pas orthogonaux.<br>'
        texteCorr += `Les droites $(\\Delta)$ et $(AB)$ ${texteEnCouleurEtGras('ne sont donc pas orthogonales')}.`
      }

      // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
      this.listeQuestions[i] = texte
      this.listeCorrections[i] = texteCorr
      i++

      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
