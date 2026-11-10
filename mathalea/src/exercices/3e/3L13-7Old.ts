import PaternNum04emeOld from '../4e/4L13-3Old'
export const titre = 'Résoudre une équation dans le thème des motifs itératifs'
export const dateDePublication = '25/05/2026'
export const interactifReady = true

/**
 * @author Éric Elter
 */

export const uuid = '679f2'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class PaternNum03emeOld extends PaternNum04emeOld {
  constructor() {
    super()
    this.niveau = '3e'
    this.sup2 = '2-3-4-5-6'
    this.besoinFormulaire4Numerique = ['Choisir un nombre pour Q6', 9999]
    this.sup4 = 2026

    this.besoinFormulaire5CaseACocher = ['Ordre aléatoire des questions']
    this.sup5 = true
    this.correctionDetaillee = true
    this.comment = `Étudier les premiers termes d'une série de motifs afin de donner le nombre de formes du motif suivant.\n
 Les patterns sont des motifs figuratifs qui évoluent selon des règles définies par des fonctions linéaires ou affines.\n
 <br>Cet exercice contient des motifs issus de l'excellent site :  <a href="https://www.visualpatterns.org/" target="_blank" style="color: blue">https://www.visualpatterns.org/</a>.<br><br>
Grâce au troisième paramètre, on peut imposer des motifs choisis dans cette <a href="https://coopmaths.fr/alea/?uuid=71ff5&s=6" target="_blank" style="color: blue">liste de patterns</a>.<br>
Si le nombre de questions est supérieur au nombre de patterns choisis, alors l'exercice sera complété par des motifs choisis au hasard.<br>
Les motifs linéaires ou affines correspondent aux motifs dont le motif n suit respectivement une fonction linéaire ou affine. Le choix de tels motifs prend le pas sur les autres choix.<br><br>
Grâce au qutrième paramètre, on peut imposer le nombre de formes afin de résoudre la question sur le numéro de motif (Q6).<br>
Si ce paramètre est inférieur à 10, alors ce nombre de formes est aléatoire ET le résultat de l'équation est entier.<br><br>
La correction détaillée (ou pas) n'est utile que si on choisit une résolution par équation.
Grâce au cinquième paramètre, on peut .......`
  }
}
