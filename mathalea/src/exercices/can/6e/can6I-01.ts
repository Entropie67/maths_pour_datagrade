import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { texteParPositionEchelle } from '../../../lib/2d/textes'
import { tracePoint } from '../../../lib/2d/TracePoint'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import { ajouterLien } from '../../../lib/outils/enrichissements'
import { stringNombre } from '../../../lib/outils/texNombre'
import {
  allerA,
  angleScratchTo2d,
  attendre,
  baisseCrayon,
  clone,
  creerLutin,
  ObjetLutin,
  orienter,
} from '../../../modules/2dLutin'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import {
  noteLaCouleur,
  Plateau2dNLC,
  testInstruction,
  testSequence,
  traducNum,
  type CouleurNLC,
} from '../../../modules/noteLaCouleur'
import {
  contraindreValeur,
  listeQuestionsToContenu,
  randint,
} from '../../../modules/outils'
import { roseDesVents, scratchblock } from '../../../modules/scratchblock'
import type { NestedObjetMathalea2dArray } from '../../../types/2d'
import Exercice from '../../Exercice'
import { sp } from '../../../lib/outils/outilString'

export const dateDePublication = '11/04/2021'
export const titre = 'Noter la couleur (scratch)'

export const interactifReady = true
export type NoteLaCouleurParams = {
  x: number
  y: number
  orientation: number
  plateau: string[][]
  relatif: boolean
  nx: number
  ny: number
  pas: number
}

/**
 * Note_la_couleur() Exercice inspiré de l'activité débranchée de Jean-Yves Labouche Note La Couleur
 * https://www.monclasseurdemaths.fr/profs/algorithmique-scratch/note-la-couleur/
 * @author Jean-claude Lhote
 */
export const uuid = '667d1'

export const refs = {
  'fr-fr': ['can6I-01', '6I1B-flash1'],
  'fr-ch': [],
}
export default class CanNoteLaCouleur6 extends Exercice {
  relatif: boolean
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de plateau',
      4,
      '1 : Plateau couleur sans numéro\n2 : Plateau couleur avec numéros\n3 : Plateau noir et blanc avec nom des couleurs\n4 : Plateau noir et blanc avec numéros',
    ]
    this.besoinFormulaire2CaseACocher = ['Graduations', true]
    // this.besoinFormulaire3Numerique = ['Nombre de couleurs (Maximum 6)', 6]
    this.besoinFormulaire4CaseACocher = ['Plateau de jeu original', false]

    this.sup = 1
    this.sup2 = true
    this.sup3 = 1
    this.sup4 = true
    this.relatif = false
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
    this.nbQuestions = 6
  }

  nouvelleVersion() {
    const damier: CouleurNLC[][] = [
      ['Vert', 'Orange', 'Rose', 'Noir', 'Orange', 'Blanc'],
      ['Noir', 'Rouge', 'Rose', 'Vert', 'Orange', 'Rose'],
      ['Orange', 'Gris', 'Rouge', 'Jaune', 'Noir', 'Vert'],
      ['Bleu', 'Jaune', 'Orange', 'Vert', 'Gris', 'Jaune'],
      ['Rose', 'Bleu', 'Rouge', 'Bleu', 'Noir', 'Blanc'],
    ]
    this.sup = contraindreValeur(1, 4, this.sup, 1)
    const echelleDessin = 0.4
    const rose = roseDesVents()

    let j, test
    const paramsCorrection = {
      xmin: -1,
      ymin: -1,
      xmax: 11,
      ymax: 9,
      pixelsParCm: 20,
      scale: echelleDessin,
      optionsTikz: ['baseline=3.5 cm'],
    }
    let commandes_disponibles
    const sequences_disponibles = []
    let sequence
    let result
    let nb_couleurs
    let instruction
    let couleurs: CouleurNLC[] = []
    let liste_instructions

    let lutin, lutindepart
    let angledepart
    let xdepart = 0
    let ydepart = 0
    context.unitesLutinParCm = 13.33
    context.pixelsParCm = 20
    let pion
    const lePlateau = new Plateau2dNLC({
      type: this.sup,
      melange: !this.sup4,
      scale: echelleDessin,
      relatif: this.relatif,
      nx: 6,
      ny: 5,
      pas: 20,
      plateau: damier,
    })
    for (let q = 0; q < this.nbQuestions;) {
      const objetsCorrection: NestedObjetMathalea2dArray = []
      const objetsEnonce: NestedObjetMathalea2dArray = []
      objetsEnonce.push(lePlateau.objets ?? [])
      objetsCorrection.push(lePlateau.objets ?? [])
      let texte = ''
      let texteCorr = ''
      let compteur = 0
      let retour_a_la_case_depart
      let compteur_essais_sequence
      commandes_disponibles = [
        ['AV20', 'AV40'],
        ['TD90', 'TG90'],
      ]
      for (let m = 0; m < 2; m++) {
        for (let n = 0, ins1, ins2, ins3, ins4; n < 2; n++) {
          ins1 = commandes_disponibles[0][m]
          ins2 = commandes_disponibles[1][n]
          ins3 = commandes_disponibles[0][1 - m]
          ins4 = commandes_disponibles[1][1 - n]
          sequences_disponibles.push(
            [ins1, ins2, ins3, 'NLC'],
            [ins3, ins2, ins1, 'NLC'],
            [ins1, ins4, ins3, 'NLC'],
            [ins3, ins4, ins1, 'NLC'],
          )
        }
      }
      retour_a_la_case_depart = true
      angledepart = choice([90, 0, -90, 180]) as number
      xdepart = 10 + randint(1, 5) * 20
      ydepart = 10 + randint(1, 4) * 20
      pion = noteLaCouleur({
        x: xdepart,
        y: ydepart,
        orientation: angledepart,
        plateau: lePlateau.plateauNLC,
        relatif: this.relatif,
        nx: 6,
        ny: 5,
        pas: 20,
      })
      do {
        objetsEnonce.length = 1
        lutin = creerLutin()
        angledepart = choice([90, 0, -90, 180]) as number
        xdepart = 10 + randint(1, 5) * 20
        ydepart = 10 + randint(1, 4) * 20
        pion = noteLaCouleur({
          x: xdepart,
          y: ydepart,
          orientation: angledepart,
          plateau: lePlateau.plateauNLC,
          relatif: this.relatif,
          nx: 6,
          ny: 5,
          pas: 20,
        })
        lutin.color = context.isHtml
          ? colorToLatexOrHTML('green')
          : colorToLatexOrHTML('black')
        lutin.epaisseur = 2
        lutin.pointilles = 2
        allerA(xdepart, ydepart, lutin)
        const alpha: number = angleScratchTo2d(angledepart)
        orienter(alpha, lutin)
        lutindepart = clone(lutin) as ObjetLutin
        baisseCrayon(lutindepart)
        allerA(xdepart, ydepart, lutindepart)
        objetsEnonce.push(lutindepart)
        baisseCrayon(lutin)
        compteur++
        if (compteur > 5) break
        pion.codeScratch = ''
        couleurs = []
        nb_couleurs = parseInt(this.sup3)
        liste_instructions = []
        j = 0
        compteur_essais_sequence = 0
        pion.codeScratch =
          '\\begin{scratch}[print,fill,blocks,scale=0.5]\n \\blockinit{quand \\greenflag est cliqué}\n '
        pion.codeScratch += `\\blockmove{aller à x: \\ovalnum{${xdepart}} y: \\ovalnum{${ydepart}}}\n \\blockmove{s'orienter à \\ovalnum{${angledepart}}}\n`
        pion.currentIndex += pion.codeScratch.length
        while (nb_couleurs > j && compteur_essais_sequence < 10) {
          compteur_essais_sequence = 0
          sequence = choice(sequences_disponibles)
          test = testSequence(sequence, pion)
          while (!test[0] && compteur_essais_sequence < 10) {
            compteur_essais_sequence++
            sequence = choice(sequences_disponibles)
            test = testSequence(sequence, pion)
          }
          if (compteur_essais_sequence < 10) {
            retour_a_la_case_depart = false
            for (let i = 0; i < sequence.length; i++) {
              instruction = sequence[i]
              result = testInstruction(instruction, lutin, pion)
              if (instruction === 'NLC') {
                liste_instructions.push(instruction)
                couleurs.push(pion.nlc())
                j++
                pion.codeScratch += result[4] + '\n'
                pion.currentIndex += result[4].length + 1
                lutin = result[5]
                attendre(5, lutin)
              } else {
                liste_instructions.push(instruction)
                pion.currentPos.x = result[1]
                pion.currentPos.y = result[2]
                pion.currentOrientation = result[3]
                pion.codeScratch += result[4] + '\n'
                pion.currentIndex += result[4].length + 1
                lutin = result[5]
              }
            }
          } else {
            angledepart = choice([90, 0, -90, 180])
            xdepart = 10 + randint(1, 5) * 20
            ydepart = 10 + randint(1, 4) * 20
          }
        }
      } while (retour_a_la_case_depart)
      if (this.sup2) {
        objetsEnonce.push(
          tracePoint(pointAbstrait(xdepart * 0.075, ydepart * 0.075)),
        )
        for (let i = 1; i < 5; i++) {
          if (i !== 1) {
            objetsEnonce.push(
              texteParPositionEchelle(
                stringNombre(20 * i),
                1.5 * i,
                -0.3,
                0,
                'black',
                1.2,
                'milieu',
                true,
                echelleDessin,
              ),
            )
          }
        }
        for (let i = 1; i < 4; i++) {
          if (i !== 1) {
            objetsEnonce.push(
              texteParPositionEchelle(
                stringNombre(20 * i),
                -0.5,
                1.5 * i,
                0,
                'black',
                1.2,
                'milieu',
                true,
                echelleDessin,
              ),
            )
          }
        }
      }
      pion.codeScratch += '\\end{scratch}'
      if (context.isHtml && context.vue !== 'diap') {
        this.consigne = `Cet exercice est tiré de l'excellente activité débranchée ${ajouterLien('https://www.monclasseurdemaths.fr/profs/algorithmique-scratch/note-la-couleur/', 'Note la couleur')} de Jean-Yves Labouche.<br>
        Il a été conçu pour étendre les possibilités de fiches proposées.<br>
    N'hésitez pas à vous rendre sur le site ${ajouterLien('https://www.monclasseurdemaths.fr', 'Mon classeur de Maths.fr')} de Jean-Yves pour y découvrir les nombreuses ressources qu'il propose.<br>
    Pour jouer, regarder les ${ajouterLien('https://coopmaths.fr/alea/assets/pdf/reglesnlc.pdf', 'Règles du jeu')} .<br>`
      } else {
        this.consigne = ''
      }
      texte += `Exécuter le programme et trouver la couleur à noter. ${ajouteChampTexteMathLive(this, q, KeyboardType.alphanumeric)}<br><br>`
      if (context.isHtml) {
        texte +=
          '<table><tr><td>' +
          scratchblock(pion.codeScratch) +
          '</td><td>' +
          mathalea2d(Object.assign({}, fixeBordures([rose])), rose) +
          '</td><td>' +
          `${
            this.sup === 4 || this.sup === 2
              ? `Correspondance chiffre-couleur${sp()}: <br>$0$=Blanc ; $1$=Noir ; $2$=Rouge ; $3$=Bleu ; $4$=Orange ; $5$=Rose ; $6$=Jaune ; $7$=Vert ; $8$=Gris<br>`
              : ''
          }` +
          mathalea2d(paramsCorrection, objetsEnonce) +
          '</td></tr></table>'
      } else {
        texte += `\\begin{minipage}{0.1\\textwidth} ${scratchblock(pion.codeScratch)} \n \\end{minipage}
        \\begin{minipage}{0.4\\textwidth} \n\t ${mathalea2d(Object.assign({}, fixeBordures([rose]), { scale: 0.5 }), rose)} \n \\end{minipage}
      \\begin{minipage}{0.3\\textwidth} \n\t ${
        this.sup === 4 || this.sup === 2
          ? `Correspondance chiffre-couleur${sp()}: \\\\\n0=Blanc, 1=Noir, 2=Rouge, 3=Bleu, 4=Orange, 5=Rose, 6=Jaune, 7=Vert, 8=Gris\\\\\n`
          : ''
      } ${mathalea2d(paramsCorrection, objetsEnonce)} \n \\end{minipage}`
        if (q < this.nbQuestions - 1 && !context.isHtml) {
          texte += '\n \\medskip'
        }
        this.canEnonce =
          "Sur quelle case le lutin s'arrête pour noter la couleur ?\\\\" +
          `\\begin{minipage}{0.1\\textwidth}\n${scratchblock(pion.codeScratch)}\n \\end{minipage}\n\\begin{minipage}{0.3\\textwidth}\n ${mathalea2d(Object.assign({}, fixeBordures([rose]), { scale: 0.5 }), rose)}\n \\end{minipage}`
        this.canReponseACompleter = `${
          this.sup === 4 || this.sup === 2
            ? `Correspondance chiffre-couleur${sp()}: \\\\\n0=Blanc, 1=Noir, 2=Rouge, 3=Bleu, 4=Orange, 5=Rose, 6=Jaune, 7=Vert, 8=Gris\\\\\n`
            : ''
        } ${mathalea2d(paramsCorrection, objetsEnonce)}`
      }
      texteCorr = `On obtient la couleur suivante${sp()}:<br> `
      texteCorr += `${texteEnCouleurEtGras(this.sup === 4 || this.sup === 2 ? '($\\mathbf{' + traducNum(couleurs[0] as 'Blanc' | 'Noir' | 'Jaune' | 'Bleu' | 'Vert' | 'Orange' | 'Rouge' | 'Gris' | 'Rose') + '}$)' + couleurs[0] : couleurs[0])} `
      handleAnswers(this, q, {
        reponse: {
          value: [couleurs[0], couleurs[0].toLowerCase()],
          options: { texteAvecCasse: true },
        },
      })
      lutin.animation = `<radialGradient id="Ball" cx="8" cy="-3" r="20" gradientUnits="userSpaceOnUse">
    <stop offset="0" style="stop-color:#FFFF99"/>
    <stop offset="1" style="stop-color:#FF9400"/>
  </radialGradient> <circle fill="url(#Ball)" r="12" stroke-width="1"
   x="${lutin.listeTraces[0][0] * context.pixelsParCm}"
    y="${-lutin.listeTraces[0][1] * context.pixelsParCm}">\n
    <animateMotion path="M ${lutin.listeTraces[0][0] * context.pixelsParCm} ${-lutin.listeTraces[0][1] * context.pixelsParCm} L`

      for (let i = 0; i < lutin.listeTraces.length; i++) {
        const B = pointAbstrait(
          lutin.listeTraces[i][2],
          lutin.listeTraces[i][3],
        )
        lutin.animation += ` ${B.xSVG(context.pixelsParCm)} ${B.ySVG(context.pixelsParCm)} `
      }
      lutin.animation +=
        '" begin="10s" dur="10s" repeatCount="indefinite" />; </circle>'
      objetsCorrection.push(
        tracePoint(pointAbstrait(xdepart * 0.075, ydepart * 0.075)),
      )
      if (this.sup2) {
        for (let i = 1; i < 5; i++) {
          if (i !== 1) {
            objetsEnonce.push(
              texteParPositionEchelle(
                stringNombre(20 * i),
                1.5 * i,
                -0.3,
                0,
                'black',
                1.2,
                'milieu',
                true,
                echelleDessin,
              ),
            )
          }
        }
        for (let i = 1; i < 4; i++) {
          if (i !== 1) {
            objetsEnonce.push(
              texteParPositionEchelle(
                stringNombre(20 * i),
                -0.5,
                1.5 * i,
                0,
                'black',
                1.2,
                'milieu',
                true,
                echelleDessin,
              ),
            )
          }
        }
      }

      if (this.correctionDetaillee) {
        for (let i = 1; i < 5; i++) {
          if (i !== 1) {
            objetsCorrection.push(
              texteParPositionEchelle(
                stringNombre(20 * i),
                1.5 * i,
                -0.3,
                0,
                'black',
                1.2,
                'milieu',
                true,
                echelleDessin,
              ),
            )
          }
        }
        for (let i = 1; i < 4; i++) {
          if (i !== 1) {
            objetsCorrection.push(
              texteParPositionEchelle(
                stringNombre(20 * i),
                -0.5,
                1.5 * i,
                0,
                'black',
                1.2,
                'milieu',
                true,
                echelleDessin,
              ),
            )
          }
        }
      }
      texteCorr +=
        '<br><br>' + mathalea2d(paramsCorrection, objetsCorrection, lutin)
      if (q < this.nbQuestions - 1 && !context.isHtml) {
        texteCorr += '\n \\medskip'
      }
      if (this.questionJamaisPosee(q, xdepart, ydepart, angledepart)) {
        this.listeQuestions[q] = texte
        this.listeCorrections[q] = texteCorr

        q++
      }
    }
    listeQuestionsToContenu(this)
  }
}
