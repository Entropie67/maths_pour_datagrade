import { graphiqueInterpole } from '../../lib/2d/GraphiqueInterpole'
import {
  antecedentInterpole,
  imageInterpolee,
} from '../../lib/2d/InterpolationCosinusoidale'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { vide2d } from '../../lib/2d/Vide2d'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  combinaisonListes,
  enleveDoublonNum,
} from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { arrondi, numTrie } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  inferieurouegal,
  listeQuestionsToContenu,
  randint,
  superieurouegal,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Déterminer graphiquement les extremums'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDePublication = '1/08/2021'
export const dateDeModifImportante = '24/03/2026'

/**
 * @author Jean-claude Lhote
 */

export const uuid = '573f2'

export const refs = {
  'fr-fr': ['2F30-3'],
  'fr-ch': [''],
}

function lesReponsesEnCouleur(x0: number): string {
  if (arrondi(x0, 1) === x0) return `$${miseEnEvidence(texNombre(x0, 1))}$`
  else {
    const minIntervalle = arrondi(Math.floor(x0 * 10) / 10, 1)
    const maxIntervalle = arrondi(0.1 + Math.floor(x0 * 10) / 10, 1)
    return `un nombre entre $${miseEnEvidence(texNombre(minIntervalle))}$ et $${miseEnEvidence(texNombre(maxIntervalle))}$`
  }
}
export default class LecturesGraphiques extends Exercice {
  constructor() {
    super()

    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
    this.nbQuestions = 6
    this.nbQuestionsModifiable = true
    this.nbCols = 2 // Uniquement pour la sortie LaTeX

    this.sup = 1 // Niveau de difficulté
  }

  nouvelleVersion() {
    const typeFonctionsDisponibles = [
      'minimum',
      'maximum',
      'image',
      'plusPetitAntécédent',
      'plusGrandAntécédent',
      'nombreAntécédents',
    ] // On créé 3 types de questions
    const listeTypeQuestions = combinaisonListes(
      typeFonctionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"
    let mini = 4
    let maxi = -4
    let antecedentTrouve
    let enonceAMC = ''
    const reponses = []
    const origine = texteParPosition(
      'O',
      -0.5,
      -0.5,
      0,
      'black',
      1,
      'milieu',
      true,
    )
    let antecedents = []
    let s = []
    const r = repere({
      xMin: -4.1,
      yMin: -4.1,
      xMax: 4.1,
      yMax: 4.1,
      yUnite: 2,
      xUnite: 2,
      grilleSecondaire: true,
      grilleSecondaireYDistance: 0.2,
      grilleSecondaireXDistance: 0.2,
      grilleSecondaireXMin: -4,
      grilleSecondaireXMax: 4,
      grilleSecondaireYMin: -4,
      grilleSecondaireYMax: 4,
      xThickMax: 4,
      yThickMax: 4,
      xThickMin: -4,
      yThickMin: -4,
    })
    let noeuds = []
    let minima
    let maxima
    let minimum
    let maximum
    let cptBoucleInf = 0
    const doubleYPrec = 0
    do {
      noeuds = []
      for (let x = -4, y = -5; x < 5; x += 2) {
        const doubleY = randint(-8, 8, doubleYPrec)
        y = doubleY / 2
        noeuds.push([x, y])
        mini = Math.min(y, mini)
        maxi = Math.max(y, maxi)
      }
      minimum = [-15, 5]
      maximum = [-15, -5]
      for (let i = 0; i < noeuds.length; i++) {
        if (minimum[1] > noeuds[i][1]) {
          minimum[0] = noeuds[i][0]
          minimum[1] = noeuds[i][1]
        }
        if (maximum[1] < noeuds[i][1]) {
          maximum[0] = noeuds[i][0]
          maximum[1] = noeuds[i][1]
        }
      }
      minima = noeuds.filter((n) => n[1] === mini)
      maxima = noeuds.filter((n) => n[1] === maxi)
      cptBoucleInf++
    } while ((minima.length > 1 || maxima.length > 1) && cptBoucleInf < 1000)

    const graph = graphiqueInterpole(noeuds, { repere: r, step: 0.1 })
    this.introduction =
      'Voici la représentation graphique de la fonction $f$ définie sur $[-4;4]$.<br>' +
      mathalea2d(
        {
          xmin: -13.5,
          ymin: -9,
          xmax: 13.5,
          ymax: 9,
          scale: 0.5,
          pixelsParCm: 30,
          display: 'block',
        },
        r,
        graph,
        origine,
      )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let x0 = 0
      let y0 = 0
      let k = 0
      switch (
        listeTypeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'minimum':
          texte =
            "Lire graphiquement le minimum de la fonction $f$ sur l'intervalle $[-4;4]$.<br>"
          if (!context.isAmc)
            handleAnswers(this, i, {
              reponse: {
                value: minimum[1],
                options: { nombreDecimalSeulement: true },
              },
            })
          reponses[i] = minimum[1]
          texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase)
          texteCorr = `Le minimum de $f$ est $${miseEnEvidence(texNombre(minimum[1], 1))}$ et il est atteint en $x=${minimum[0]}$.<br>`
          if (this.correctionDetaillee) {
            s[0] =
              minimum[1] !== 0
                ? segment(
                    minimum[0] * 2,
                    0,
                    minimum[0] * 2,
                    minimum[1] * 2,
                    bleuMathalea,
                  )
                : vide2d()
            s[0].pointilles = 5
            s[1] =
              minimum[0] !== 0
                ? segment(
                    minimum[0] * 2,
                    minimum[1] * 2,
                    0,
                    minimum[1] * 2,
                    'red',
                  )
                : vide2d()
            s[1].pointilles = 5
            s[2] = tracePoint(
              pointAbstrait(minimum[0] * 2, minimum[1] * 2),
              'red',
            )
            texteCorr += mathalea2d(
              {
                xmin: -13.5,
                ymin: -9,
                xmax: 13.5,
                ymax: 9,
                scale: 0.5,
                pixelsParCm: 30,
                display: 'block',
              },
              r,
              graph,
              s,
              origine,
            )
          }
          break
        case 'maximum':
          texte =
            "Lire graphiquement le maximum de la fonction $f$ sur l'intervalle $[-4;4]$.<br>"
          if (!context.isAmc)
            handleAnswers(this, i, {
              reponse: {
                value: maximum[1],
                options: { nombreDecimalSeulement: true },
              },
            })
          reponses[i] = maximum[1]
          texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase)
          texteCorr = `Le maximum de $f$ est $${miseEnEvidence(texNombre(maximum[1], 1))}$ et il est atteint en $x=${maximum[0]}$.<br>`
          if (this.correctionDetaillee) {
            s[0] =
              maximum[1] !== 0
                ? segment(
                    maximum[0] * 2,
                    0,
                    maximum[0] * 2,
                    maximum[1] * 2,
                    bleuMathalea,
                  )
                : vide2d()
            s[0].pointilles = 5
            s[1] =
              maximum[0] !== 0
                ? segment(
                    maximum[0] * 2,
                    maximum[1] * 2,
                    0,
                    maximum[1] * 2,
                    'red',
                  )
                : vide2d()
            s[1].pointilles = 5
            s[2] = tracePoint(
              pointAbstrait(maximum[0] * 2, maximum[1] * 2),
              'red',
            )
            texteCorr += mathalea2d(
              {
                xmin: -13.5,
                ymin: -9,
                xmax: 13.5,
                ymax: 9,
                scale: 0.5,
                pixelsParCm: 30,
                display: 'block',
              },
              r,
              graph,
              s,
              origine,
            )
          }
          break

        case 'image':
          s = []
          x0 = randint(-4, 4)
          k = 0
          while (x0 > noeuds[k + 1][0]) {
            k++
          }
          y0 = arrondi(
            imageInterpolee(
              [
                [noeuds[k][0], noeuds[k][1]],
                [noeuds[k + 1][0], noeuds[k + 1][1]],
              ],
              x0,
            ),
            2,
          )
          texte = `Lire graphiquement l'image de $${texNombre(x0, 1)}$ par la fonction $f$.<br>Donner la réponse avec la précision permise par le graphique.<br>`

          if (!context.isAmc)
            if (arrondi(y0, 1) === y0) handleAnswers(this, i, {
                  reponse: {
                    value: y0,
                    options: { nombreDecimalSeulement: true },
                  },
                })
            else handleAnswers(this, i, {
                  reponse: {
                    value: `[${arrondi(Math.floor(y0 * 10) / 10, 1)};${arrondi(0.1 + Math.floor(y0 * 10) / 10, 1)}]`,
                    options: { estDansIntervalle: true },
                  },
                })
          reponses[i] = y0
          texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase)
          texteCorr =
            arrondi(y0, 1) === y0
              ? `$f(${texNombre(x0, 1)})=$${lesReponsesEnCouleur(y0)}.<br>`
              : `L'image de $${texNombre(x0, 1)}$ par la fonction $f$ est ${lesReponsesEnCouleur(y0)}.<br>`
          if (this.correctionDetaillee) {
            s[0] =
              x0 !== 0
                ? segment(0, y0 * 2, x0 * 2, y0 * 2, bleuMathalea)
                : vide2d()
            s[0].pointilles = 5
            s[1] =
              y0 !== 0 ? segment(x0 * 2, y0 * 2, x0 * 2, 0, 'red') : vide2d()
            s[1].pointilles = 5
            s[2] = tracePoint(pointAbstrait(x0 * 2, y0 * 2), 'red')
            texteCorr += mathalea2d(
              {
                xmin: -13.5,
                ymin: -9,
                xmax: 13.5,
                ymax: 9,
                scale: 0.5,
                pixelsParCm: 30,
                display: 'block',
              },
              r,
              graph,
              s,
              origine,
            )
          }
          break
        case 'plusPetitAntécédent':
          {
            s = []
            antecedentTrouve = false
            do {
              y0 = randint(mini * 10 + 2, maxi * 10 - 2) / 10
              k = 0
              while (
                k + 1 < noeuds.length &&
                (y0 > Math.max(noeuds[k][1], noeuds[k + 1][1]) ||
                  y0 < Math.min(noeuds[k][1], noeuds[k + 1][1]))
              ) {
                k++
              }
              if (k + 1 < noeuds.length) antecedentTrouve = true
            } while (!antecedentTrouve)
            const candidatX0 = antecedentInterpole(
              [
                [noeuds[k][0], noeuds[k][1]],
                [noeuds[k + 1][0], noeuds[k + 1][1]],
              ],
              y0,
            )
            if (candidatX0) x0 = candidatX0
            texte = `Lire graphiquement le plus petit antécédent de $${texNombre(y0, 1)}$ par la fonction $f$.<br>Donner la réponse avec la précision permise par le graphique.<br>`
            if (!context.isAmc)
              handleAnswers(this, i, {
                reponse: {
                  value: `[${arrondi(Math.floor(x0 * 10) / 10, 1)};${arrondi(0.1 + Math.floor(x0 * 10) / 10, 1)}]`,
                  options: { estDansIntervalle: true },
                },
              })
            reponses[i] = arrondi(x0, 1)
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBase,
            )
            texteCorr = `Le plus petit antécédent avec la précision permise par le graphique de $${texNombre(y0, 1)}$ est ${lesReponsesEnCouleur(x0)}.<br>`
            if (this.correctionDetaillee) {
              s[0] = segment(-15, y0 * 2, 15, y0 * 2, bleuMathalea)
              s[0].pointilles = 5
              s[1] =
                y0 !== 0 ? segment(x0 * 2, y0 * 2, x0 * 2, 0, 'red') : vide2d()
              s[1].pointilles = 5
              texteCorr += mathalea2d(
                {
                  xmin: -13.5,
                  ymin: -9,
                  xmax: 13.5,
                  ymax: 9,
                  scale: 0.5,
                  pixelsParCm: 30,
                  display: 'block',
                },
                r,
                graph,
                s,
                origine,
              )
            }
          }
          break
        case 'plusGrandAntécédent':
          {
            s = []
            antecedentTrouve = false
            while (!antecedentTrouve) {
              y0 = randint(mini * 10 + 2, maxi * 10 - 2) / 10
              k = noeuds.length - 1
              while (
                k > 0 &&
                (y0 > Math.max(noeuds[k - 1][1], noeuds[k][1]) ||
                  y0 < Math.min(noeuds[k - 1][1], noeuds[k][1]))
              ) {
                k--
              }
              if (k > 0) antecedentTrouve = true
            }
            const candidatX0 = antecedentInterpole(
              [
                [noeuds[k - 1][0], noeuds[k - 1][1]],
                [noeuds[k][0], noeuds[k][1]],
              ],
              y0,
            )
            if (candidatX0) x0 = candidatX0
            texte = `Lire graphiquement le plus grand antécédent de $${texNombre(y0, 1)}$ par la fonction $f$.<br>Donner la réponse avec la précision permise par le graphique.<br>`
            if (!context.isAmc)
              handleAnswers(this, i, {
                reponse: {
                  value: `[${arrondi(Math.floor(x0 * 10) / 10, 1)};${arrondi(0.1 + Math.floor(x0 * 10) / 10, 1)}]`,
                  options: { estDansIntervalle: true },
                },
              })
            reponses[i] = arrondi(x0, 1)
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBase,
            )
            texteCorr = `Le plus grand antécédent de $${texNombre(y0, 1)}$ avec la précision permise par le graphique est ${lesReponsesEnCouleur(x0)}.<br>`
            if (this.correctionDetaillee) {
              s[0] = segment(-15, y0 * 2, 15, y0 * 2, bleuMathalea)
              s[0].pointilles = 5
              s[1] =
                y0 !== 0 ? segment(x0 * 2, y0 * 2, x0 * 2, 0, 'red') : vide2d()
              s[1].pointilles = 5
              texteCorr += mathalea2d(
                {
                  xmin: -13.5,
                  ymin: -9,
                  xmax: 13.5,
                  ymax: 9,
                  scale: 0.5,
                  pixelsParCm: 30,
                  display: 'block',
                },
                r,
                graph,
                s,
                origine,
              )
            }
          }
          break
        case 'nombreAntécédents':
        default:
          antecedents = []
          s = []
          antecedentTrouve = 0
          y0 = randint(mini * 10 + 2, maxi * 10 - 2) / 10
          k = 0
          while (k < noeuds.length - 1) {
            if (
              inferieurouegal(y0, Math.max(noeuds[k][1], noeuds[k + 1][1])) &&
              superieurouegal(y0, Math.min(noeuds[k][1], noeuds[k + 1][1]))
            ) {
              // il y a un antécédent sur l'intervalle [ymini,ymaxi]
              const candidatX0 = antecedentInterpole(
                [
                  [noeuds[k][0], noeuds[k][1]],
                  [noeuds[k + 1][0], noeuds[k + 1][1]],
                ],
                y0,
              )
              if (candidatX0) x0 = candidatX0
              antecedents.push(x0)
            }
            k++
          }
          antecedents = numTrie(enleveDoublonNum(antecedents, 0.1))
          antecedentTrouve = antecedents.length
          texte = `Lire graphiquement le nombre d'antécédents de $${texNombre(y0, 1)}$ par la fonction $f$.<br>`
          texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase)
          switch (antecedentTrouve) {
            case 0:
              texteCorr = `$${texNombre(y0, 1)}$ ${texteEnCouleurEtGras("ne possède pas d'antécédent")} sur $[-4;4]$.<br>`
              break
            case 1:
              texteCorr = `$${texNombre(y0, 1)}$ ${texteEnCouleurEtGras('possède un unique antécédent')} sur $[-4;4]$.<br>`
              texteCorr = `L'antécédent de $${texNombre(y0, 1)}$ est aux environs de $${miseEnEvidence(texNombre(antecedents[0], 1))}$.<br>`
              break
            default:
              texteCorr = `$${texNombre(y0, 1)}$ possède $${miseEnEvidence(antecedentTrouve)}$ antécédents sur $[-4;4]$.<br>`
              texteCorr += `Les antécédents de $${texNombre(y0, 1)}$ sont aux environs des nombres suivants : `
              for (let l = 0; l < antecedentTrouve - 1; l++) {
                texteCorr += `$${miseEnEvidence(texNombre(antecedents[l], 1))}$ ; `
              }
              texteCorr += `$${miseEnEvidence(texNombre(antecedents[antecedentTrouve - 1], 1))}$.<br>`
              break
          }
          if (!context.isAmc)
            handleAnswers(this, i, {
              reponse: {
                value: antecedentTrouve,
                options: { nombreDecimalSeulement: true },
              },
            })
          reponses[i] = antecedentTrouve
          if (this.correctionDetaillee) {
            s[0] = segment(-15, y0 * 2, 15, y0 * 2, bleuMathalea)
            s[0].pointilles = 5
            for (let l = 0; l < antecedentTrouve; l++) {
              s[l * 2 + 1] = tracePoint(
                pointAbstrait(antecedents[l] * 2, y0 * 2),
                'red',
              )
              s[l * 2 + 1].epaisseur = 2
              s[l * 2 + 2] =
                y0 !== 0
                  ? segment(
                      antecedents[l] * 2,
                      0,
                      antecedents[l] * 2,
                      y0 * 2,
                      'red',
                    )
                  : vide2d()
              s[l * 2 + 2].pointilles = 5
            }
            texteCorr += mathalea2d(
              {
                xmin: -13.5,
                ymin: -9,
                xmax: 13.5,
                ymax: 9,
                scale: 0.5,
                pixelsParCm: 30,
                display: 'block',
              },
              r,
              graph,
              s,
              origine,
            )
          }
          break
      }
      graph.epaisseur = 2
      if (this.questionJamaisPosee(i, listeTypeQuestions[i], x0, y0, k)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }

    if (context.isAmc) {
      enonceAMC = this.introduction
      for (let i = 0; i < this.nbQuestions; i++) {
        enonceAMC += `${i + 1}) ${this.listeQuestions[i]}<br>`
      }
      this.autoCorrectionAMC[0] = {
        enonce: enonceAMC,
        propositions: [],
      }
      this.questionsAMC[0] = amcConvert(this.autoCorrectionAMC[0])
      for (let i = 0; i < this.nbQuestions; i++) {
        if (listeTypeQuestions[i] === 'nombreAntécédents') {
          this.autoCorrectionAMC[0].propositions![i] = {
            type: 'AMCNum',
            propositions: [
              {
                texte: this.listeCorrections[i],
                statut: '',
                reponse: {
                  texte: '',
                  valeur: [reponses[i]],
                  param: {
                    digits: 1,
                    decimals: 0,
                    signe: false,
                    approx: 0,
                  },
                },
              },
            ],
          }
        } else {
          this.autoCorrectionAMC[0].propositions![i] = {
            type: 'AMCNum',
            propositions: [
              {
                texte: this.listeCorrections[i],
                statut: '',
                reponse: {
                  texte: '',
                  valeur: [reponses[i]],
                  param: {
                    digits: 2,
                    decimals: 1,
                    signe: true,
                    approx: 1,
                  },
                },
              },
            ],
          }
        }
      }
    } else listeQuestionsToContenu(this)
  }
  // this.besoinFormulaireNumerique = ['Niveau de difficulté', 2,'1 : Facile\n2 : Difficile'];
}
