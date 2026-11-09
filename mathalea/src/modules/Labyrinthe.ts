import { pointAbstrait } from '../lib/2d/PointAbstrait'
import { Segment, segment } from '../lib/2d/segmentsVecteurs'
import {
  Latex2d,
  latex2d,
  TexteParPoint,
  texteParPoint,
  TexteParPointEchelle,
  texteParPointEchelle,
  texteParPositionEchelle,
} from '../lib/2d/textes'
import { bleuMathalea } from '../lib/colors'
import { combinaisonListesSansChangerOrdre } from '../lib/outils/arrayOutils'
import { nombreAvecEspace } from '../lib/outils/texNombre'
import { runAStar } from './findPath'
import type FractionEtendue from './FractionEtendue'
import { randint } from './outils'

export type LabyrintheChemin = [number, number][] // Un chemin est un tableau de points [x, y] où x et y sont des entiers

/**  Crée un ensemble de chemins possibles dans un labyrinthe. Cette fonction est à associer aux méthodes conçues pour.
 * @param {Object} parametres À saisir entre accolades
 * @param {number} [parametres.nbLignes = 3]
 * @param {number} [parametres.nbColonnes = 6]
 * @param {number} [parametres.scaleFigure = 1]
 * @author Jean-claude Lhote & Éric Elter (améliorée par EE pour choisir le nombre de lignes et de colonnes)
 * @author MGu (pour la fonction runAStar) car si le tableau est trop grand, le cout de calcul est exponentiel donc remplacer par reunAStar qui est un algorithme de recherche de chemin
 * Publié le 6/12/2020 (Modifié le 05/10/2022)
 * @class
 */
// JSDOC Validee par EE Septembre 2022
export class Labyrinthe {
  niveau: number
  murs2d: (Segment | TexteParPoint)[]
  chemin2d: Segment[]
  nombres2d: (Latex2d | TexteParPointEchelle)[]
  choisitChemin: (niveau: number) => LabyrintheChemin
  construitMurs: (
    chemin: LabyrintheChemin,
    taille?: number,
  ) => (Segment | TexteParPoint)[]

  traceChemin: (monchemin: LabyrintheChemin, color?: string) => Segment[]
  placeNombres: (
    monChemin: LabyrintheChemin,
    bonnesReponses: (number | string | FractionEtendue)[],
    mauvaisesReponses: (number | string | FractionEtendue)[],
    taille: number,
  ) => (TexteParPointEchelle | Latex2d)[]

  constructor({ nbLignes = 3, nbColonnes = 6, scaleFigure = 1 } = {}) {
    this.niveau = 1
    this.murs2d = []
    this.chemin2d = []
    this.nombres2d = []

    const paths = []
    for (let i = 0; i < nbLignes; i++) {
      for (let j = 0; j < nbLignes; j++) {
        const path = runAStar(nbLignes, nbColonnes, i, 0, j, nbColonnes - 1)
        paths.push(...path)
      }
    }

    paths.sort((a, b) => b.length - a.length) // On trie les chemins du plus court au plus long...

    // // Fonction qui permet de copier des tableaux
    // function arrayCopy (arr) {
    //   return JSON.parse(JSON.stringify(arr))
    // }

    // // Permet de tester si un tableau est contenu dans un autre.
    // // tableauDansTableau([0, 1, 0, 0, 1, 1, 1, 0],[1, 1]) Permet de tester si [1, 1] est contenu dans [[0, 1], [0, 0], [1, 1], [1, 0]]
    // function tableauDansTableau (gdTableau, petitTableau) {
    //   let test = false
    //   let k = 0
    //   do {
    //     if (gdTableau[k] === petitTableau[0] && gdTableau[k + 1] === petitTableau[1]) test = true
    //     k++
    //     k++
    //   } while (!test && k < gdTableau.length)
    //   return test
    // }

    // let cheminsEE = [[1, 0]] // [[colonne,ligne]]
    // const casesVoisinesTableau = [[-1, 0], [0, 1], [1, 0], [0, -1]] // Nord ; Est ; Sud ; Ouest

    // // Fonction récursive qui recherche tous les chemins possibles à partir du point de départ caseActuelle, des points déjà parcourus et avec l'indice du chemin actuel dans le tableau actuel
    // function rechercheCheminsPossibles (caseActuelle, indiceCheminActuel, dejaParcourus) {
    //   const casesPossibles = []
    //   let prochaineCasePossible = []

    //   for (const element of Visitables) {
    //     prochaineCasePossible = [caseActuelle[0] + element[0], caseActuelle[1] + element[1]] // Test de l'ouest
    //     if (prochaineCasePossible[0] === nbColonnes) { // On est arrivé
    //       return [nbColonnes, prochaineCasePossible[1]]
    //     } else if (!tableauDansTableau(dejaParcourus, prochaineCasePossible)) {
    //       if (prochaineCasePossible[0] < nbColonnes + 1 && prochaineCasePossible[0] > 0 && prochaineCasePossible[1] < nbLignes && prochaineCasePossible[1] > -1) {
    //         const casesVoisines = []
    //         const elementPrecedent = [-1 * element[0], -1 * element[1]] // D'où vient la case actuelle ?
    //         for (let k = 0; k < 4; k++) {
    //           if (!(casesVoisinesTableau[k][0] === elementPrecedent[0] && casesVoisinesTableau[k][1] === elementPrecedent[1])) casesVoisines.push(casesVoisinesTableau[k])
    //         }

    //         let nonVoisin = true // Les cases voisines sont accessibles
    //         for (const element2 of casesVoisines) { // Recherche si les cases voisines à la prochaine case possible n'ont pas déjà été parcourues.
    //           nonVoisin = nonVoisin && !tableauDansTableau(dejaParcourus, [prochaineCasePossible[0] + element2[0], prochaineCasePossible[1] + element2[1]])
    //         }
    //         if (nonVoisin) casesPossibles.push(prochaineCasePossible) // Cette prochaine case possible est validée.
    //       }
    //     }
    //   }
    //   if (casesPossibles.length === 0) {
    //     return [0, 0] // Case impossible, retour en arriere
    //   } else {
    //     let cheminAVenir
    //     const tableauIndiceFuturChemin = []
    //     for (let ee = casesPossibles.length - 1; ee > 0; ee--) { // Préparation à la création d'un nouveau chemin
    //       cheminsEE.push([])
    //       tableauIndiceFuturChemin[ee] = cheminsEE.length - 1
    //     }
    //     for (let ee = casesPossibles.length - 1; ee > 0; ee--) {
    //       cheminsEE[tableauIndiceFuturChemin[ee]] = cheminsEE[indiceCheminActuel].concat(casesPossibles[ee]) // Le début du nouveau chemin correspond au chemin déjà en cours
    //       cheminAVenir = rechercheCheminsPossibles(casesPossibles[ee], tableauIndiceFuturChemin[ee], dejaParcourus.concat(casesPossibles[ee]))
    //       if (cheminAVenir !== undefined) {
    //         cheminsEE[tableauIndiceFuturChemin[ee]].push(cheminAVenir[0])
    //         cheminsEE[tableauIndiceFuturChemin[ee]].push(cheminAVenir[1])
    //       }
    //     }
    //     cheminsEE[indiceCheminActuel].push(casesPossibles[0][0])
    //     cheminsEE[indiceCheminActuel].push(casesPossibles[0][1])
    //     const prochainChemin = rechercheCheminsPossibles(casesPossibles[0], indiceCheminActuel, dejaParcourus.concat(casesPossibles[0]))
    //     if (prochainChemin !== undefined) {
    //       cheminsEE[indiceCheminActuel].push(prochainChemin[0])
    //       cheminsEE[indiceCheminActuel].push(prochainChemin[1])
    //     }
    //   }
    // }

    // // Fin de construction récursive de chemin

    // let cheminDejaParcouru = [1, 0]
    // const Visitables = [[1, 0], [0, -1], [-1, 0], [0, 1]] // Nord ; Est ; Sud ; Ouest
    // cheminsEE[0].push(rechercheCheminsPossibles([1, 0], 0, cheminDejaParcouru))
    // enleveElement(cheminsEE[0], undefined) // Obligé d'enlever un undefined qui traine sans savoir pourquoi.
    // const cheminTableauSimple = [[]]
    // cheminTableauSimple = arrayCopy(cheminsEE)

    // for (let k = 1; k < nbLignes; k++) {
    //   cheminsEE = [[1, k]]
    //   cheminDejaParcouru = [1, k]
    //   cheminsEE[0].push(rechercheCheminsPossibles([1, k], 0, cheminDejaParcouru))
    //   enleveElement(cheminsEE[0], undefined) // Obligé d'enlever un undefined qui traine sans savoir pourquoi.
    //   cheminTableauSimple = cheminTableauSimple.concat(cheminsEE)
    // }

    // for (let k = cheminTableauSimple.length - 1; k >= 0; k--) { // On élimine les voies sans issues, celles se terminant par 0, 0
    //   if (cheminTableauSimple[k][cheminTableauSimple[k].length - 2] === 0) cheminTableauSimple.splice(k, 1)
    // }
    // cheminTableauSimple.sort((a, b) => b.length - a.length) // On trie les chemins du plus court au plus long...

    // const chemins = []
    // let elementchemin = []

    // // Le passage ci-dessous est obligatoire pour passer d'un tableau 2d à un tableau 3d
    // // afin d'être en adéquation avec la fonction Labyrinthe() Version 1

    // for (let i = 0; i < cheminTableauSimple.length; i++) { // on double le nombre de chemins par Symétrie.
    //   elementchemin = []
    //   for (let j = 0; j < cheminTableauSimple[i].length / 2; j++) {
    //     elementchemin.push([cheminTableauSimple[i][2 * j], cheminTableauSimple[i][2 * j + 1]])
    //   }
    //   chemins.push(elementchemin)
    // }
    // // Fin de construction de chemin (qui contient tous les chemins du labyrinthe)

    // MGu on change de repère
    const cheminsPaths: LabyrintheChemin[] = []
    paths.forEach((path) => {
      const che: LabyrintheChemin = []
      path.forEach((point) => {
        che.push([point.x + 1, nbLignes - point.y - 1])
      })
      cheminsPaths.push(che)
    })
    const chemins = cheminsPaths
    // console.log('chemins', chemins)
    const cheminTableauSimple = paths

    // Gestion des vitesses : Escargot, ..., Guépard
    let tableauDeVitesses = [] // Plus la vitesse est grande, moins le trajet est long
    const vitessePetite = cheminTableauSimple[0].length
    const vitesseGrande =
      cheminTableauSimple[cheminTableauSimple.length - 1].length
    const ecartVitesse = (vitessePetite - vitesseGrande) / 4
    for (let k = 0; k < 4; k++) {
      tableauDeVitesses.push(
        cheminTableauSimple.findIndex(
          (element) => element.length < vitessePetite - k * ecartVitesse,
        ),
      )
    }
    tableauDeVitesses[4] = cheminTableauSimple.length
    tableauDeVitesses = tableauDeVitesses.map((element) => element - 1)

    // Fin de la fonction Labytinthe()

    // Mise en place des méthodes de cette fonction

    /**
     * Retourne un chemin en fonction du niveau de rapidité
     * @memberof Labyrinthe
     * @param {number} niveau Niveau de résolution du labyrinthe entre 1 (le plus lent) et 6 (le plus rapide).
     * @example monCheminChoisi = laby.traceChemin(3) // Renvoie un chemin parmi tous ceux possibles, du labyrinthe laby, dont le niveau de rapidité est 3
     * @author Jean-claude Lhote (et EE pour la partie "choix du nombre de lignes et de colonnes")
     * @return {Array.number[]}
     */
    // JSDOC Validee par EE Octobre 2022
    this.choisitChemin = function (niveau: number): LabyrintheChemin {
      let choixchemin
      switch (niveau) {
        case 1:
          choixchemin = randint(0, tableauDeVitesses[0])
          break
        case 2:
        case 3:
        case 4:
        case 5:
          choixchemin = randint(
            tableauDeVitesses[niveau - 2] + 1,
            tableauDeVitesses[niveau - 1],
          )
          break
        case 6:
          choixchemin = randint(0, cheminTableauSimple.length - 1)
          break
      }
      if (typeof choixchemin === 'undefined') {
        window.notify(
          'choisitChemin(niveau) doit être appelé avec un niveau entre 1 et 6.',
          { niveau },
        )
        return chemins[0] // On renvoie le premier chemin par défaut
      }
      return chemins[choixchemin]
    }

    /**
     * Retourne un ensemble d'objets correspondant aux murs du labyrinthe, par rapport à un chemin choisi
     * @memberof Labyrinthe
     * @param {Array.number[]} chemin Un chemin choisi parmi tous les chemins possibles.
     * @param {number} [taille = 1] Taille des éléments de départ et de sortie
     * @example lesMursDeMonLabyrinthe = laby.construitMurs(monCheminChoisi)
     * // Renvoie les murs du labyrinthe laby correspondants au chemin monCheminChoisi.
     * // Penser à faire mathalea2d(param, lesMursDeMonLabyrinthe) ensuite
     * @author Jean-claude Lhote (et EE pour la partie "choix du nombre de lignes et de colonnes")
     * @return {ObjecMathalea2d[]}
     */
    // JSDOC Validee par EE Octobre 2022
    this.construitMurs = function (
      chemin: LabyrintheChemin,
      taille?: number,
    ): (Segment | TexteParPoint)[] {
      const objets = []
      let s1
      let s2
      const choix = chemin[0][1]
      for (let i = 0; i < nbColonnes; i++) {
        // Construction des T supérieurs et inférieurs
        // T inférieurs
        s1 = segment(pointAbstrait(i * 3, 1), pointAbstrait(i * 3, 2))
        s1.epaisseur = 2
        objets.push(s1)
        // T supérieurs
        s2 = segment(
          pointAbstrait(i * 3, 1 + 3 * nbLignes),
          pointAbstrait(i * 3, 3 * nbLignes),
        )
        s2.epaisseur = 2
        objets.push(s2)
      }

      // Construction du bord gauche entre le départ et le labyrinthe
      s1 = segment(
        pointAbstrait(0, 1 + 3 * nbLignes),
        pointAbstrait(0, 3 + choix * 3),
      )
      s1.epaisseur = 3
      objets.push(s1)
      s1 = segment(pointAbstrait(0, 1), pointAbstrait(0, 2 + choix * 3))
      s1.epaisseur = 3
      objets.push(s1)

      // Construction case départ
      s1 = segment(
        pointAbstrait(-3, 1 + choix * 3),
        pointAbstrait(0, 1 + choix * 3),
        'green',
      )
      s1.epaisseur = 3
      objets.push(s1)
      s1 = segment(
        pointAbstrait(-3, 1 + choix * 3),
        pointAbstrait(-3, 4 + choix * 3),
        'green',
      )
      s1.epaisseur = 3
      objets.push(s1)
      s1 = segment(
        pointAbstrait(-3, 4 + choix * 3),
        pointAbstrait(0, 4 + choix * 3),
        'green',
      )
      s1.epaisseur = 3
      objets.push(s1)
      objets.push(
        texteParPoint(
          'Départ',
          pointAbstrait(-1.5, 2.5 + choix * 3),
          0,
          bleuMathalea,
          taille,
          'milieu',
          false,
        ),
      )

      // les croix centrales communes à A et B
      for (let i = 1; i < nbColonnes; i++) {
        for (let k = 0; k < nbLignes - 1; k++) {
          s1 = segment(
            pointAbstrait(i * 3, 5 + 3 * k),
            pointAbstrait(i * 3, 3 + 3 * k),
            'black',
          )
          s1.epaisseur = 2
          s2 = segment(
            pointAbstrait(i * 3 - 0.5, 4 + 3 * k),
            pointAbstrait(i * 3 + 0.5, 4 + 3 * k),
            'black',
          )
          s2.epaisseur = 2
          objets.push(s2, s1)
        }
      }
      // le pourtour commun
      s1 = segment(
        pointAbstrait(0, 1 + 3 * nbLignes),
        pointAbstrait(3 * nbColonnes, 1 + 3 * nbLignes),
      )
      s1.epaisseur = 3
      objets.push(s1)
      s1 = segment(
        pointAbstrait(3 * nbColonnes, 1 + 3 * nbLignes - 1),
        pointAbstrait(3 * nbColonnes, 1 + 3 * nbLignes),
      )
      s1.epaisseur = 3
      objets.push(s1)
      s1 = segment(
        pointAbstrait(3 * nbColonnes, 1),
        pointAbstrait(3 * nbColonnes, 2),
      )
      s1.epaisseur = 3
      objets.push(s1)
      s1 = segment(pointAbstrait(0, 1), pointAbstrait(3 * nbColonnes, 1))
      s1.epaisseur = 3
      objets.push(s1)

      // les sorties
      // La partie verticale
      for (let i = 0; i < nbLignes - 1; i++) {
        s1 = segment(
          pointAbstrait(3 * nbColonnes, 3 + i * 3),
          pointAbstrait(3 * nbColonnes, 5 + i * 3),
        )
        s1.epaisseur = 3
        objets.push(s1)
      }
      // La partie horizontale
      for (let i = 0; i < nbLignes; i++) {
        s1 = segment(
          pointAbstrait(3 * nbColonnes, 2 + i * 3),
          pointAbstrait(3 * nbColonnes + 2, 2 + i * 3),
        )
        s1.epaisseur = 3
        s2 = segment(
          pointAbstrait(3 * nbColonnes, 3 + i * 3),
          pointAbstrait(3 * nbColonnes + 2, 3 + i * 3),
        )
        s2.epaisseur = 3
        objets.push(s1, s2)
      }
      // Le texte
      for (let i = 1; i <= nbLignes; i++) {
        objets.push(
          texteParPoint(
            `Sortie ${i}`,
            pointAbstrait(3 * nbColonnes + 1.5, 2.5 + 3 * nbLignes - 3 * i),
            0,
            bleuMathalea,
            taille,
            'milieu',
            false,
          ),
        )
      }
      return objets
    }

    /**
     * Retourne les traits signifiant le chemin correction
     * @memberof Labyrinthe
     * @param {Array.number[]} monchemin Un chemin choisi parmi tous les chemins possibles.
     * @param {string} [color = 'brown'] Couleur du tracé de la correction : du type 'red', bleuMathalea ou du type '#f15929'
     * @example laCorrectionDeMonLabyrinthe = laby.traceChemin(monCheminChoisi) // Renvoie les traits signifiant le chemin correction du labyrinthe laby correspondant au chemin monCheminChoisi
     * @author Jean-claude Lhote (et EE pour la partie "choix du nombre de lignes et de colonnes")
     * @return {ObjecMathalea2d[]}
     */
    // JSDOC Validee par EE Octobre 2022
    this.traceChemin = function (monchemin: LabyrintheChemin, color = 'brown') {
      let y = monchemin[0][1]
      let x = 0
      const chemin2d = []
      let s1
      for (let j = 0; j < monchemin.length; j++) {
        s1 = segment(
          pointAbstrait(x * 3 - 1.5, y * 3 + 2.5),
          pointAbstrait(monchemin[j][0] * 3 - 1.5, monchemin[j][1] * 3 + 2.5),
          color,
        )
        s1.pointilles = 5
        s1.stylePointilles = 2
        s1.epaisseur = 5
        s1.opacite = 0.3
        chemin2d.push(s1)
        x = monchemin[j][0]
        y = monchemin[j][1]
      }
      s1 = segment(
        pointAbstrait(x * 3 - 1.5, y * 3 + 2.5),
        pointAbstrait(x * 3 + 1.5, y * 3 + 2.5),
        color,
      )
      s1.pointilles = 5
      s1.stylePointilles = 2
      s1.epaisseur = 5
      s1.opacite = 0.3
      chemin2d.push(s1)
      return chemin2d
    }

    /**
     * Retourne la position convenable de tous les éléments (bons ou faux) du labyrinthe (nombre, texte, fraction)
     * @memberof Labyrinthe
     * @param {Array.number[]} monchemin Un chemin choisi parmi tous les chemins possibles.
     * @param {number[]|string[]|Fraction[]} bonnesReponses Tableau de bonnes réponses
     * @param {number[]|string[]|Fraction[]} mauvaisesReponses Tableau de mauvaises réponses
     * @param {number} taille Taille des écritures dans les cases du labyrinthe
     * @example aVotrePlace = laby.placeNombres(monCheminChoisi,reponsesOK,reponsesPasOK,1)
     * // Place les bonnes (reponsesOK) et les mauvaises (reponsesPasOK) réponses dans les cases adéquates du labyrinthe laby correspondant au chemin monCheminChoisi
     * @author Jean-claude Lhote (et EE pour la partie "choix du nombre de lignes et de colonnes")
     * @return {ObjecMathalea2d[]}
     */
    // JSDOC Validee par EE Octobre 2022
    this.placeNombres = function (
      monChemin: LabyrintheChemin,
      bonnesReponses: (number | string | FractionEtendue)[],
      mauvaisesReponses: (number | string | FractionEtendue)[],
      taille: number,
    ) {
      bonnesReponses = combinaisonListesSansChangerOrdre(
        bonnesReponses,
        monChemin.length,
      )
      mauvaisesReponses = combinaisonListesSansChangerOrdre(
        mauvaisesReponses,
        nbColonnes * nbLignes - monChemin.length,
      )
      const objets = []
      const nombres: [
        number | string | FractionEtendue,
        number | string | FractionEtendue,
      ][] = []
      let trouve
      let indexBonnesRep = 0
      let indexMauvaisesRep = 0

      for (let a = 0; a < nbColonnes; a++) {
        nombres.push([0, 0])
      }
      for (let a = 1; a < nbColonnes + 1; a++) {
        for (let b = 0; b < nbLignes; b++) {
          trouve = false
          for (let k = 0; k < monChemin.length; k++) {
            if (monChemin[k][0] === a && monChemin[k][1] === b) trouve = true
          }
          if (!trouve) {
            nombres[a - 1][b] = mauvaisesReponses[indexMauvaisesRep]
            indexMauvaisesRep++
          } else {
            nombres[a - 1][b] = bonnesReponses[indexBonnesRep]
            indexBonnesRep++
          }
        }
      }
      for (let a = 1; a < nbColonnes + 1; a++) {
        for (let b = 0; b < nbLignes; b++) {
          const nombre = nombres[a - 1][b]
          if (typeof nombre === 'number') {
            objets.push(
              texteParPointEchelle(
                nombreAvecEspace(nombre),
                pointAbstrait(-1.5 + a * 3, 2.5 + b * 3),
                0,
                'black',
                taille,
                'milieu',
                true,
                scaleFigure,
              ),
            )
          } else if (typeof nombre === 'string') {
            // écriture mode Maths
            objets.push(
              texteParPositionEchelle(
                nombre,
                -1.5 + a * 3,
                2.5 + b * 3,
                0,
                'black',
                taille,
                'milieu',
                true,
                scaleFigure,
              ),
            )
          } else {
            objets.push(
              latex2d(nombre.texFraction, -1.5 + a * 3, 2.5 + b * 3, {
                color: 'black',
                backgroundColor: 'white',
                letterSize: 'scriptsize',
              }),
            )
          }
        }
      }
      return objets
    }
  }
}

/**  Crée un ensemble de chemins possibles dans un labyrinthe. Cette fonction est à associer aux méthodes conçues pour.
 * @param {Object} parametres À saisir entre accolades
 * @param {number} [parametres.nbLignes = 3]
 * @param {number} [parametres.nbColonnes = 6]
 * @param {number} [parametres.scaleFigure = 1]
 * @example laby = labyrinthe ({ nbLignes: 4, nbColonnes: 5 })
 * // Crée l'ensemble de chemins possibles dans un labyrinthe à 4 lignes et 5 colonnes
 * @author Jean-claude Lhote & Éric Elter (améliorée par EE pour choisir le nombre de lignes et de colonnes)
 * @return {Labyrinthe}
 */
// JSDOC Validee par EE Septembre 2022
export function labyrinthe({
  nbLignes = 3,
  nbColonnes = 6,
  scaleFigure = 1,
} = {}) {
  return new Labyrinthe({ nbLignes, nbColonnes, scaleFigure })
}
