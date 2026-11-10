import { traceBarre } from '../../lib/2d/diagrammes'
import { repere } from '../../lib/2d/reperes'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { texFractionSigne } from '../../lib/outils/deprecatedFractions'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import {
  numAlpha,
  premiereLettreEnMajuscule,
  sp,
} from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer des effectifs et des fréquences'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDePublication = '07/02/2021' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '30/01/2024'

/**
 * Calculer des effectifs et des fréquences.
 * @author Erwan DUPLESSY
 */

export const uuid = 'f4b95'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class CalculEffectifFrequence extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      "Nombre d'espèces différentes",
      3,
      ' choix 1 : 5 espèces\n choix 2 : 6 espèces\n choix 3 : 7 espèces',
    ]

    this.nbQuestions = 1
    this.video = 'https://youtu.be/GWDDay-mdVA' // Id YouTube ou url
    this.spacing = 2
    this.spacingCorr = 2
    this.sup = 1
  }

  nouvelleVersion() {
    const lstQuadri = [
      'girafes',
      'zèbres',
      'gnous',
      'buffles',
      'gazelles',
      'crocodiles',
      'rhinocéros',
      'léopards',
      'guépards',
      'hyènes',
      'lycaons',
      'servals',
      'phacochères',
    ]
    const lstOiseaux = [
      'hérons',
      'marabouts',
      'flamants roses',
      'cigognes',
      'grues',
      'vautours',
    ]
    const symbolePourCent = context.isHtml ? '%' : '$\\%$'
    for (let ee = 0, cpt = 0; ee < this.nbQuestions && cpt < 50;) {
      // Boucle principale où i+1 correspond au numéro de la question
      const nbAnimaux = 4 + parseInt(this.sup) // nombre d'animaux différents dans l'énoncé (entre 5 et 7)
      const nbQuadri = 3
      const lstAnimauxExo = [] // liste des animaux uniquement cités dans l'exercice
      const lstNombresAnimaux = [] // liste des effectifs de chaque animal
      let lstVal: number[] = [] // liste des valeurs à éviter pour les effectifs
      let N = 0
      let nom = ''
      let texte = ''
      let texteCorr = ''

      for (let i = 0; i < nbAnimaux; i++) {
        N = randint(2, 10, lstVal) // choisit un nombre entre 2 et 10 sauf dans les valeurs à éviter
        lstNombresAnimaux.push(N)
        lstVal = lstVal.concat([N]) // valeurs à supprimer pour éviter des valeurs égales
        if (i < nbQuadri) {
          nom = choice(lstQuadri, lstAnimauxExo) // choisit un animal au hasard sauf parmi ceux déjà utilisés
        } else {
          nom = choice(lstOiseaux, lstAnimauxExo) // choisit un animal au hasard sauf parmi ceux déjà utilisés
        }
        lstAnimauxExo.push(nom)
      }

      const lstNomParc = [
        'Dramve',
        'Fatenmin',
        'Batderfa',
        'Vihi',
        'Genser',
        'Barbetdou',
        'Dramrendu',
        'Secai',
        'Cipeudram',
        'Cigel',
        'Lisino',
        'Fohenlan',
        'Farnfoss',
        'Kinecardine',
        'Zeffari',
        'Barmwich',
        'Swadlincote',
        'Swordbreak',
        'Loshull',
        'Ruyron',
        'Fluasall',
        'Blueross',
        'Vlane',
      ]

      texte +=
        'Dans le parc naturel de ' +
        choice(lstNomParc) +
        ', il y a des animaux. '
      texte += 'Certains sont des quadrupèdes ('
      for (let i = 0; i < nbQuadri; i++) {
        texte += lstAnimauxExo[i] + ', '
      }
      texte = texte.substring(0, texte.length - 2)
      texte += "), et d'autres sont des oiseaux ("
      for (let i = nbQuadri; i < nbAnimaux; i++) {
        texte += lstAnimauxExo[i] + ', '
      }
      texte = texte.substring(0, texte.length - 2)
      texte += '). '

      texte +=
        "Voici un diagramme en barres qui donne le nombre d'individus pour chaque espèce.<br>"

      const coef = 1

      const r = repere({
        grilleX: false,
        grilleY: 'pointilles',
        xThickListe: false,
        xLabelListe: false,
        yUnite: 1 / coef,
        yThickDistance: 1 * coef,
        yMax: 11,
        xMin: 0,
        xMax: 10,
        yMin: 0,
        axeXStyle: '',
        yLegende: "Nombre d'individus",
      })

      const lstElementGraph = []
      for (let i = 0; i < nbAnimaux; i++) {
        lstElementGraph.push(
          traceBarre(
            ((r.xMax - r.xMin) / (nbAnimaux + 1)) * (i + 1),
            lstNombresAnimaux[i],
            premiereLettreEnMajuscule(lstAnimauxExo[i]),
            { unite: 1 / coef },
          ),
        )
      }
      texte +=
        '<br>' +
        mathalea2d(
          {
            xmin: -5,
            xmax: 11,
            ymin: -4,
            ymax: 12,
            pixelsParCm: 30,
            scale: context.isHtml ? 1 : 0.5,
          },
          r,
          lstElementGraph,
        )

      let texte0, texte1, texte2, texte3
      const texteAMC = texte
      texte0 =
        numAlpha(0) + " Quel est l'effectif des " + lstAnimauxExo[0] + ' ?'
      texte0 +=
        ajouteChampTexteMathLive(this, 4 * ee, KeyboardType.clavierNumbers) +
        '<br>'
      texte1 =
        numAlpha(1) +
        ' Calculer la fréquence des ' +
        lstAnimauxExo[1] +
        `. Donner le résultat sous la forme d'un pourcentage arrondi, si besoin, à $0{,}1\\,\\%$ près.`
      texte1 +=
        ajouteChampTexteMathLive(
          this,
          4 * ee + 1,
          KeyboardType.clavierNumbers,
          { texteApres: '%' },
        ) + '<br>'
      texte2 = numAlpha(2) + " Calculer l'effectif des quadrupèdes."
      texte2 +=
        ajouteChampTexteMathLive(
          this,
          4 * ee + 2,
          KeyboardType.clavierNumbers,
        ) + '<br>'
      texte3 =
        numAlpha(3) +
        ` Calculer la fréquence des oiseaux. Donner le résultat sous la forme d'un pourcentage arrondi, si besoin, à $0{,}1\\,\\%$ près.`
      texte3 +=
        ajouteChampTexteMathLive(
          this,
          4 * ee + 3,
          KeyboardType.clavierNumbers,
          { texteApres: '%' },
        ) + '<br>'
      texte += texte0 + texte1 + texte2 + texte3

      // début de la correction
      // question 1
      texteCorr +=
        numAlpha(0) +
        " D'après le graphique, il y a " +
        ('$' + miseEnEvidence(texNombre(lstNombresAnimaux[0])) + '$') +
        ' ' +
        lstAnimauxExo[0] +
        '. <br>'
      handleAnswers(
        this,
        4 * ee,
        { reponse: { value: lstNombresAnimaux[0] } },
        { formatInteractif: 'mathlive' },
      )
      // question 2
      let Ntotal = lstNombresAnimaux[0]
      texteCorr +=
        numAlpha(1) +
        " L'effectif total des animaux est : $" +
        lstNombresAnimaux[0]
      for (let i = 1; i < nbAnimaux; i++) {
        texteCorr += ' + ' + lstNombresAnimaux[i]
        Ntotal += lstNombresAnimaux[i]
      }

      texteCorr += ' = ' + Ntotal + '$. '
      texteCorr +=
        " D'après le graphique, il y a $" +
        lstNombresAnimaux[1] +
        '$ ' +
        lstAnimauxExo[1] +
        '. <br>'
      texteCorr +=
        ' La fréquence (ou la proportion) de  ' +
        lstAnimauxExo[1] +
        ' est : $ ' +
        texFractionSigne(lstNombresAnimaux[1], Ntotal) +
        ' '
      // test de l'arrondi
      if (
        arrondi(lstNombresAnimaux[1] / Ntotal, 4) ===
        arrondi(lstNombresAnimaux[1] / Ntotal, 3)
      ) {
        texteCorr += '= '
      } else {
        texteCorr += '\\approx '
      }
      texteCorr += texNombre(lstNombresAnimaux[1] / Ntotal, 3) + '$. <br>'
      texteCorr +=
        'La fréquence des ' +
        lstAnimauxExo[1] +
        ' est donc : ' +
        texteEnCouleurEtGras(
          `$\\mathbf{${texNombre((100 * lstNombresAnimaux[1]) / Ntotal, 1)}}$`,
        ) +
        sp(1) +
        symbolePourCent +
        '. <br>'
      handleAnswers(
        this,
        4 * ee + 1,
        {
          reponse: { value: arrondi((100 * lstNombresAnimaux[1]) / Ntotal, 1) },
        },
        { formatInteractif: 'mathlive' },
      )
      // question 3
      texteCorr +=
        numAlpha(2) +
        ' On fait la somme des effectifs de chaque espèce de quadrupèdes : $'
      let NTotalQuadri = lstNombresAnimaux[0]
      texteCorr += lstNombresAnimaux[0]
      for (let i = 1; i < nbQuadri; i++) {
        texteCorr += ' + ' + lstNombresAnimaux[i]
        NTotalQuadri += lstNombresAnimaux[i]
      }
      texteCorr += '$. <br>'
      texteCorr +=
        "L'effectif des quadrupèdes est donc : " +
        ('$' + miseEnEvidence(texNombre(NTotalQuadri)) + '$') +
        '.<br>'
      handleAnswers(
        this,
        4 * ee + 2,
        { reponse: { value: NTotalQuadri } },
        { formatInteractif: 'mathlive' },
      )
      // question 4
      let NTotalOiseaux = lstNombresAnimaux[3]
      texteCorr +=
        numAlpha(3) +
        " L'effectif total des oiseaux est : $" +
        lstNombresAnimaux[3]
      for (let i = 4; i < nbAnimaux; i++) {
        texteCorr += ' + ' + lstNombresAnimaux[i]
        NTotalOiseaux += lstNombresAnimaux[i]
      }
      texteCorr += ' = ' + NTotalOiseaux + '$. '
      texteCorr += " L'effectif total des animaux est : $" + Ntotal + '$. <br>'
      texteCorr +=
        " La fréquence (ou la proportion) d'oiseaux est : $ " +
        texFractionSigne(NTotalOiseaux, Ntotal) +
        ' '
      // test de l'arrondi
      if (
        arrondi(NTotalOiseaux / Ntotal, 4) ===
        arrondi(NTotalOiseaux / Ntotal, 3)
      ) {
        texteCorr += '= '
      } else {
        texteCorr += '\\approx '
      }
      texteCorr += texNombre(NTotalOiseaux / Ntotal, 3) + '$. <br>'
      texteCorr +=
        'La fréquence des oiseaux est donc : ' +
        texteEnCouleurEtGras(
          `$\\mathbf{${texNombre((100 * NTotalOiseaux) / Ntotal, 1)}}$`,
        ) +
        sp(1) +
        symbolePourCent +
        '. <br>'
      handleAnswers(
        this,
        4 * ee + 3,
        { reponse: { value: arrondi((100 * NTotalOiseaux) / Ntotal, 1) } },
        { formatInteractif: 'mathlive' },
      )

      if (context.isAmc) {
        this.autoCorrectionAMC[ee] = {
          enonce: texteAMC,
          enonceAvant: false,
          enonceApresNumQuestion: true,
          options: { barreseparation: true },
          propositions: [
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: texteCorr,
                  multicolsBegin: true,
                  reponse: {
                    texte: texte0,
                    valeur: lstNombresAnimaux[0],
                    param: {
                      signe: false,
                      digits: 2,
                      decimals: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  reponse: {
                    texte: texte1,
                    valeur: arrondi((100 * lstNombresAnimaux[1]) / Ntotal, 1),
                    param: {
                      signe: false,
                      digits: 3,
                      decimals: 1,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  reponse: {
                    texte: texte2,
                    valeur: NTotalQuadri,
                    param: {
                      signe: false,
                      digits: 2,
                      decimals: 0,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  multicolsEnd: true,
                  reponse: {
                    texte: texte3,
                    valeur: arrondi((100 * NTotalOiseaux) / Ntotal, 1),
                    param: {
                      signe: false,
                      digits: 3,
                      decimals: 1,
                    },
                  },
                },
              ],
            },
          ],
        }
        this.questionsAMC[ee] = amcConvert(this.autoCorrectionAMC[ee])
      }

      // Si la question n'a jamais été posée, on l'enregistre
      if (
        this.questionJamaisPosee(
          ee,
          lstAnimauxExo.join(''),
          lstNombresAnimaux.join(''),
          lstOiseaux.join(''),
          lstQuadri.join(''),
        )
      ) {
        this.listeQuestions[ee] = texte
        this.listeCorrections[ee] = texteCorr

        ee++
      }
      cpt++
    }

    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
} // Fin de l'exercice.
