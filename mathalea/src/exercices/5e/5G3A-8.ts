import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { papierPointe } from '../../lib/2d/reperes'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { rotation } from '../../lib/2d/transformations'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import {
  addPointsCliquables,
  type PointCliquableData,
} from '../../lib/customElements/PointsCliquablesElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Compléter un nuage de points symétriques'
export const dateDePublication = '18/12/2021'
export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * Symétrie centrale sur papier pointé
 * @author Jean-claude Lhote
 */
export const uuid = '2a611'

export const refs = {
  'fr-fr': ['5G3A-8'],
  'fr-2016': ['5G11-6'],
  'fr-ch': ['9R1ES4D-7', '9R2ES4D-7', '9R3ES4D-7'],
}
export default class CompleterParSymetrie5e extends Exercice {
  constructor() {
    super()
    this.besoinFormulaire2Numerique = [
      'Type de papier pointé',
      4,
      '1 : Carrés\n2 : Hexagones\n3 : Triangles équilatéraux\n4 : Mélange',
    ]

    this.nbQuestions = 1

    this.sup2 = 1
  }

  nouvelleVersion() {
    if (this.interactif)
      this.consigne = 'Placer les points en cliquant, puis vérifier la réponse.'
    const couples = []
    const pointsCliquables: PointCliquableData[][] = [[]]
    let pointsPossibles
    const pointsChoisis = []
    const pointsAffiches = []
    const pointsEnPlusCorr = []

    const typeDePapier = ['quad', 'quad', 'hexa', 'equi'] // l'élément 0 sera changé aléatoirement pour correspondre au type mélange (this.sup2 % 4)
    for (
      let i = 0,
        cpt = 0,
        papier,
        image,
        d,
        O,
        j,
        trouve,
        texte,
        texteCorr,
        objetsEnonce,
        nbCouplesComplets,
        objetsCorrection;
      i < this.nbQuestions && cpt < 50;
    ) {
      typeDePapier[0] = typeDePapier[1 + (i % 3)]
      // on remet à vide tous les tableaux utilisés pour la question suivante
      objetsEnonce = []
      objetsCorrection = []
      pointsChoisis.length = 0
      pointsAffiches.length = 0
      pointsEnPlusCorr.length = 0
      pointsCliquables[i] = []
      const pointsAttendus: PointCliquableData[] = []
      couples.length = 0

      papier = papierPointe({
        xmin: 0,
        ymin: 0,
        xmax: 10,
        ymax: 10,
        type: typeDePapier[this.sup2 === 4 ? 0 : this.sup2],
      })

      objetsEnonce.push(papier)

      if (typeDePapier[this.sup2 === 4 ? 0 : this.sup2] === 'quad') {
        O = pointAbstrait(5, 5, 'O')
      } else {
        O = pointAbstrait(4.33, 4.5, 'O')
      }
      d = tracePoint(O, context.isHtml ? bleuMathalea : 'black')
      d.epaisseur = 2
      d.style = '+'
      objetsEnonce.push(d)
      pointsPossibles = papier.listeCoords.slice()
      // on prépare les points cliquables pour la version interactive
      if (this.interactif && context.isHtml) {
        for (let p = 0; p < papier.listeCoords.length; p++) {
          pointsCliquables[i].push({
            x: papier.listeCoords[p][0],
            y: papier.listeCoords[p][1],
            id: `P${p}`,
            etat: false,
          })
        }
      }
      while (pointsPossibles.length > 1) {
        // si il n'en reste qu'un, on ne peut pas trouver de symétrique
        image = rotation(
          pointAbstrait(pointsPossibles[0][0], pointsPossibles[0][1]),
          O,
          180,
        )
        j = 1
        trouve = false
        while (j < pointsPossibles.length && !trouve) {
          // si l'image est proche d'un point, c'est qu'on a deux symétriques donc un couple potentiel.
          if (
            longueur(
              image,
              pointAbstrait(pointsPossibles[j][0], pointsPossibles[j][1]),
            ) < 0.5
          ) {
            trouve = true
          } else j++
        }
        if (trouve) {
          // on stocke le couple de symétrique en modifiant aléatoirement l'ordre.
          couples.push(
            choice([true, false])
              ? [pointsPossibles[0], pointsPossibles[j]]
              : [pointsPossibles[j], pointsPossibles[0]],
          )
          pointsPossibles.splice(j, 1) // on retire d'abord le points d'indice j
          pointsPossibles.splice(0, 1) // puis le point d'indice 0
        } else {
          pointsPossibles.splice(0, 1) // Le point d'indice 0 n'a pas de symétrique, on le retire
        }
      }
      // la liste des couples est prête, on va pouvoir choisir les points affichés et ceux qu'on n'affiche pas.
      const nbCouplesChoisis = randint(8, 12)
      const couplesChoisis = shuffle(couples).splice(0, nbCouplesChoisis)
      for (let p = 0; p < couplesChoisis.length; p++) {
        pointsChoisis.push(couplesChoisis[p][0], couplesChoisis[p][1])
      }
      nbCouplesComplets = randint(2, 5)
      for (let p = 0; p < pointsChoisis.length; p += 2) {
        if (p < nbCouplesComplets) {
          // On affiche un certains nombre de couples
          pointsAffiches.push(
            pointAbstrait(pointsChoisis[p][0], pointsChoisis[p][1]),
          )
          pointsAffiches.push(
            pointAbstrait(pointsChoisis[p + 1][0], pointsChoisis[p + 1][1]),
          )
        } else {
          // et on affiche un seul des points pour les couples restants
          pointsAffiches.push(
            pointAbstrait(pointsChoisis[p][0], pointsChoisis[p][1]),
          )
          pointsEnPlusCorr.push(
            pointAbstrait(pointsChoisis[p + 1][0], pointsChoisis[p + 1][1]),
          )
        }
      }
      for (let p = 0; p < pointsAffiches.length; p++) {
        objetsEnonce.push(tracePoint(pointsAffiches[p]))
      }
      for (let p = 0; p < pointsEnPlusCorr.length; p++) {
        objetsCorrection.push(tracePoint(pointsEnPlusCorr[p], 'red'))
      }
      for (let p = 0; p < pointsCliquables[i].length; p++) {
        trouve = false
        let q = 0
        while (q < pointsEnPlusCorr.length && !trouve) {
          if (
            longueur(
              pointsEnPlusCorr[q],
              pointAbstrait(pointsCliquables[i][p].x, pointsCliquables[i][p].y),
            ) < 0.1
          ) {
            trouve = true
            pointsAttendus.push({ ...pointsCliquables[i][p], etat: true })
          } else {
            q++
          }
        }
        if (!trouve) {
          pointsAttendus.push({ ...pointsCliquables[i][p], etat: false })
        }
      }
      texte = context.isAmc
        ? 'Voici une grille contenant des points et un centre de symétrie.<br>Ajouter un minimum de points afin que chacun des points ait son symétrique par rapport à O.<br>Écrire le nombre de points ajoutés dans le cadre. Coder ensuite ce nombre de points.<br>'
        : 'Voici une grille contenant des points et un centre de symétrie.<br>Ajouter un minimum de points afin que chacun des points ait son symétrique par rapport à O.<br>'
      texteCorr = ''
      // On prépare la figure...
      texte += mathalea2d(
        {
          xmin: -1,
          ymin: -1,
          xmax: 11,
          ymax: 11,
          scale: 0.5,
          id: `figEx${this.numeroExercice}Q${i}`,
        },
        ...objetsEnonce,
        labelPoint(O),
      )
      if (this.interactif && context.isHtml) {
        texte += addPointsCliquables({
          numeroExercice: this.numeroExercice ?? 0,
          questionIndex: i,
          figureId: `figEx${this.numeroExercice}Q${i}`,
          points: pointsCliquables[i],
          pixelsParCm: 20,
          radius: 0.2,
          width: 2,
          size: 3,
          color: 'red',
        })
        handleAnswers(
          this,
          i,
          { reponse: { value: JSON.stringify(pointsAttendus) } },
          { formatInteractif: 'points-cliquables' },
        )
      }
      texteCorr += mathalea2d(
        { xmin: -1, ymin: -1, xmax: 11, ymax: 11, scale: 0.5 },
        ...objetsEnonce,
        ...objetsCorrection,
        labelPoint(O),
      )

      if (
        this.questionJamaisPosee(
          i,
          nbCouplesChoisis,
          nbCouplesComplets,
          pointsChoisis[0][0],
          pointsChoisis[0][1],
        )
      ) {
        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: '',
            enonceAvant: false,
            propositions: [
              {
                type: 'AMCOpen',
                propositions: [
                  {
                    enonce: texte,
                    texte: texteCorr,
                    statut: 1,
                    pointilles: true,
                  },
                ],
              },
              {
                type: 'AMCNum',
                propositions: [
                  {
                    texte: '',
                    statut: '',
                    reponse: {
                      texte: 'Nombre de points ajoutés',
                      valeur: [pointsEnPlusCorr.length],
                      param: {
                        digits: 2,
                        signe: false,
                        decimals: 0,
                      },
                    },
                  },
                ],
              },
            ],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
