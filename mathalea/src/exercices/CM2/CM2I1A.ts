/* eslint-disable camelcase */
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { texteParPositionEchelle } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import {
  choixDeroulant,
  listeDeroulanteToQcm,
} from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { ajouterLien } from '../../lib/outils/enrichissements'
import { stringNombre } from '../../lib/outils/texNombre'
import {
  allerA,
  angleScratchTo2d,
  attendre,
  baisseCrayon,
  clone,
  creerLutin,
  orienter,
} from '../../modules/2dLutin'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  noteLaCouleur,
  plateau2dNLC,
  testInstruction,
  testSequence,
  traducColor,
  traducNum,
  type CouleurNLC,
} from '../../modules/noteLaCouleur'
import {
  contraindreValeur,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import { scratchblock } from '../../modules/scratchblock'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Noter la couleur avec Scratch'
export const interactifReady = true

export const dateDeModifImportante = '14/09/2024'
export const dateDePublication = '11/04/2021'

/**
 * Note_la_couleur() Exercice inspiré de l'activité débranchée de Jean-Yves Labouche Note La Couleur
 * https://www.monclasseurdemaths.fr/profs/algorithmique-scratch/note-la-couleur/
 * variante de 6I11 avec des dalles de 20 x 20
 * @author Jean-claude Lhote
 */
export const uuid = 'e380b'

export const refs = {
  'fr-fr': ['CM2I1A'],
  'fr-2016': ['c3I11'],
  'fr-ch': [],
}
export default class NoteLaCouleurC3 extends Exercice {
  relatif = false
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de plateau',
      4,
      '1 : Plateau couleur sans numéro\n2 : Plateau couleur avec numéros\n3 : Plateau noir et blanc avec nom des couleurs\n4 : Plateau noir et blanc avec numéros',
    ]
    this.besoinFormulaire2CaseACocher = ['Graduations', true]
    this.besoinFormulaire3Numerique = ['Nombre de couleurs (Maximum 6)', 6]
    this.besoinFormulaire4CaseACocher = ['Plateau de jeu original', false]

    this.nbQuestions = 1

    this.sup = 1
    this.sup2 = true
    this.sup3 = 4
    this.sup4 = true
    this.relatif = false
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
  }

  nouvelleVersion() {
    const damier: CouleurNLC[][] = [
      [
        'Blanc',
        'Blanc',
        'Blanc',
        'Blanc',
        'Blanc',
        'Blanc',
        'Blanc',
        'Blanc',
        'Blanc',
        'Blanc',
      ],
      [
        'Blanc',
        'Noir',
        'Orange',
        'Rouge',
        'Orange',
        'Jaune',
        'Rouge',
        'Jaune',
        'Rose',
        'Blanc',
      ],
      [
        'Blanc',
        'Rose',
        'Gris',
        'Noir',
        'Bleu',
        'Vert',
        'Bleu',
        'Rouge',
        'Orange',
        'Blanc',
      ],
      [
        'Blanc',
        'Noir',
        'Rouge',
        'Rose',
        'Vert',
        'Orange',
        'Rose',
        'Noir',
        'Orange',
        'Blanc',
      ],
      [
        'Blanc',
        'Orange',
        'Gris',
        'Rouge',
        'Jaune',
        'Noir',
        'Vert',
        'Rouge',
        'Rose',
        'Blanc',
      ],
      [
        'Blanc',
        'Bleu',
        'Jaune',
        'Orange',
        'Vert',
        'Gris',
        'Jaune',
        'Gris',
        'Orange',
        'Blanc',
      ],
      [
        'Blanc',
        'Rose',
        'Bleu',
        'Jaune',
        'Rose',
        'Orange',
        'Rouge',
        'Bleu',
        'Noir',
        'Blanc',
      ],
      [
        'Blanc',
        'Blanc',
        'Blanc',
        'Blanc',
        'Blanc',
        'Blanc',
        'Blanc',
        'Blanc',
        'Blanc',
        'Blanc',
      ],
    ]
    const choixListeDeroulante: CouleurNLC[][] = [
      [
        'Blanc',
        'Noir',
        'Rouge',
        'Bleu',
        'Orange',
        'Rose',
        'Jaune',
        'Vert',
        'Gris',
      ],
      [
        '(0) Blanc',
        '(1) Noir',
        '(2) Rouge',
        '(3) Bleu',
        '(4) Orange',
        '(5) Rose',
        '(6) Jaune',
        '(7) Vert',
        '(8) Gris',
      ],
    ]
    this.sup = contraindreValeur(1, 4, this.sup, 1)
    const echelleDessin = 0.75

    let j, test
    let objetsEnonce: NestedObjetMathalea2dArray = []
    let objetsCorrection: NestedObjetMathalea2dArray = []
    // const paramsCorrection = { xmin: -1, ymin: -1, xmax: 16, ymax: 13, pixelsParCm: 30, scale: echelleDessin }
    const paramsCorrection = {
      xmin: -1,
      ymin: -1,
      xmax: 16,
      ymax: 13,
      pixelsParCm: 20,
      scale: echelleDessin,
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
    let xdepart = 10 + randint(1, 8) * 20
    let ydepart = 10 + randint(1, 6) * 20

    context.unitesLutinParCm = 13.33
    // context.pixelsParCm = 30
    context.pixelsParCm = 20

    const lePlateauEnonce = plateau2dNLC({
      type: this.sup,
      melange: !this.sup4,
      scale: echelleDessin,
      relatif: this.relatif,
      nx: 10,
      ny: 8,
      pas: 20,
      plateau: damier,
    })
    const lePlateauCorr = plateau2dNLC({
      type: this.sup,
      melange: !this.sup4,
      scale: echelleDessin,
      relatif: this.relatif,
      nx: 10,
      ny: 8,
      pas: 20,
      plateau: damier,
    })
    let pion = noteLaCouleur({
      x: xdepart,
      y: ydepart,
      orientation: angledepart,
      plateau: lePlateauCorr.plateauNLC,
      relatif: this.relatif,
      nx: 10,
      ny: 8,
      pas: 20,
    })
    for (let q = 0; q < this.nbQuestions;) {
      objetsCorrection = []
      objetsEnonce = []
      objetsEnonce.push(lePlateauEnonce.objets)
      objetsCorrection.push(lePlateauCorr.objets)
      let reponseCouleur = []
      let texte = ''
      let texteCorr = ''
      let compteur = 0
      let retour_a_la_case_depart
      let compteur_essais_sequence
      commandes_disponibles = [
        ['AV20', 'AV40', 'AV60', 'AV80', 'AV100'],
        ['TD90', 'TG90', 'TG180'],
      ]
      for (let m = 0, ins1; m < 5; m++) {
        for (let n = 0, ins2; n < 3; n++) {
          ins1 = commandes_disponibles[0][m]
          ins2 = commandes_disponibles[1][n]
          sequences_disponibles.push([ins1, ins2, 'NLC'], [ins2, ins1, 'NLC'])
        }
      }
      retour_a_la_case_depart = true
      do {
        objetsEnonce.length = 1
        lutin = creerLutin()
        angledepart = choice([90, 0, -90, 180])
        xdepart = 10 + randint(1, 8) * 20
        ydepart = 10 + randint(1, 6) * 20

        pion = noteLaCouleur({
          x: xdepart,
          y: ydepart,
          orientation: angledepart,
          plateau: lePlateauCorr.plateauNLC,
          relatif: this.relatif,
          nx: 10,
          ny: 8,
          pas: 20,
        })
        lutin.color = context.isHtml
          ? colorToLatexOrHTML('green')
          : colorToLatexOrHTML('black')
        lutin.epaisseur = 2
        lutin.pointilles = 2
        allerA(xdepart, ydepart, lutin)
        orienter(angleScratchTo2d(angledepart), lutin)
        lutindepart = clone(lutin)
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
          '\\begin{scratch}[print,fill,blocks,scale=0.7]\n \\blockinit{quand \\greenflag est cliqué}\n '
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
            xdepart = 10 + randint(1, 8) * 20
            ydepart = 10 + randint(1, 6) * 20
          }
        }
      } while (retour_a_la_case_depart)
      if (this.sup2) {
        objetsEnonce.push(
          tracePoint(pointAbstrait(xdepart * 0.075, ydepart * 0.075)),
        )
        for (let i = 1; i < 10; i++) {
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
        for (let i = 1; i < 12; i++) {
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
      if (context.isHtml) {
        texte = `Cet exercice est tiré de l'excellente activité débranchée ${ajouterLien('https://www.monclasseurdemaths.fr/profs/algorithmique-scratch/note-la-couleur/', 'Note la couleur')} de Jean-Yves Labouche.<br>`
        texte +=
          'Il a été conçu pour étendre les possibilités de fiches proposées.<br>'
        texte += `N'hésitez pas à vous rendre sur le site ${ajouterLien('https://www.monclasseurdemaths.fr', 'Mon classeur de Maths.fr')} de Jean-Yves pour y découvrir la multitude de ressources qu'il propose.<br>`
        texte += `Pour jouer, regarder les ${ajouterLien('https://coopmaths.fr/alea/assets/pdf/reglesnlc.pdf', 'Règles du jeu')} .<br>`
      } else {
        texte = ''
      }
      texte +=
        'Exécuter le programme et trouver la succession de couleur.<br><br>'
      if (context.isHtml) {
        texte +=
          '<table><tr><td>' +
          scratchblock(pion.codeScratch) +
          '</td><td>' +
          `${
            this.sup === 4 || this.sup === 2
              ? `Correspondance chiffre-couleur${sp()}: <br>$0$=Blanc ; $1$=Noir ; $2$=Rouge ; $3$=Bleu ; $4$=Orange ; $5$=Rose ; $6$=Jaune ; $7$=Vert ; $8$=Gris<br>`
              : ''
          }` +
          mathalea2d(paramsCorrection, objetsEnonce) +
          '</td></tr></table>'
      } else {
        texte += `\\begin{minipage}{.3 \\linewidth} \n\t ${scratchblock(pion.codeScratch)} \n \\end{minipage}
      \\begin{minipage}{.7 \\linewidth} \n\t ${
        this.sup === 4 || this.sup === 2
          ? `Correspondance chiffre-couleur${sp()}: \\\\\n0=Blanc, 1=Noir, 2=Rouge, 3=Bleu, 4=Orange, 5=Rose, 6=Jaune, 7=Vert, 8=Gris\\\\\n`
          : ''
      } ${mathalea2d(paramsCorrection, objetsEnonce)} \n\\end{minipage}`
        if (q < this.nbQuestions - 1 && !context.isHtml) {
          texte += '\n\\newpage'
        }
      }
      reponseCouleur = couleurs as string[]
      if (this.sup % 2 === 0)
        reponseCouleur[0] = '(' + traducNum(couleurs[0]) + ') ' + couleurs[0]
      texteCorr = `On obtient la série de couleurs suivante${sp()}:<br> `
      texteCorr += `${texteEnCouleurEtGras(reponseCouleur[0])} `
      if (this.interactif && context.isHtml) {
        texte +=
          `Couleur n°$1$${sp()}: ` +
          choixDeroulant(this, q * couleurs.length, {
            choices: [
              { label: 'Choisir une couleur', value: '' },
              ...choixListeDeroulante[(this.sup - 1) % 2].map(
                (item: CouleurNLC) =>
                  this.sup === 1
                    ? {
                        svg:
                          '<rect x="-10" y="-10" width="20" height="20" stroke="black" fill="' +
                          traducColor(item) +
                          '"/>',
                        value: item,
                      }
                    : { label: item, value: item },
              ),
            ],
          }) +
          '<br>'
        handleAnswers(
          this,
          q * couleurs.length,
          { reponse: { value: couleurs[0] } },
          { formatInteractif: 'liste-deroulante' },
        )
      } else if (context.isHtml) {
        listeDeroulanteToQcm(
          this,
          q * couleurs.length,
          [
            { label: 'Choisir une couleur', value: '' },
            ...choixListeDeroulante[(this.sup - 1) % 2].map((item) =>
              this.sup === 1
                ? {
                    svg:
                      '<rect x="-10" y="-10" width="20" height="20" stroke="black" fill="' +
                      traducColor(item) +
                      '"/>',
                    value: item,
                  }
                : { label: item, value: item },
            ),
          ],
          reponseCouleur[0],
          { ordered: false, vertical: false },
          '',
        )
        const leQcm = propositionsQcm(this, q * couleurs.length)

        texte += `Couleur n°$1$${sp()}: ` + leQcm.texte + '<br>'
      }
      /*
      texteCorr += `${texteGras(this.sup === 4 || this.sup === 2 ? '($\\mathbf{' + traducNum(couleurs[0]) + '}$)' + couleurs[0] : couleurs[0])} `
      for (let i = 1; i < couleurs.length; i++) {
        texteCorr += `- ${texteGras(this.sup === 4 || this.sup === 2 ? '($\\mathbf{' + traducNum(couleurs[i]) + '}$)' + couleurs[i] : couleurs[i])} `
      }
      texteCorr += '<br>'
      */
      for (let i = 1; i < couleurs.length; i++) {
        if (this.sup % 2 === 0)
          reponseCouleur[i] = '(' + traducNum(couleurs[i]) + ') ' + couleurs[i]
        texteCorr += `${texteEnCouleurEtGras(reponseCouleur[i])} `
        if (this.interactif && context.isHtml) {
          texte +=
            'Couleur n°$' +
            (i + 1) +
            `$${sp()}: ` +
            choixDeroulant(this, q * couleurs.length + i, {
              choices: [
                { label: 'Choisir une couleur', value: '' },
                ...choixListeDeroulante[(this.sup - 1) % 2].map((item) =>
                  this.sup === 1
                    ? {
                        svg:
                          '<rect x="-10" y="-10" width="20" height="20" fill="' +
                          traducColor(item) +
                          '"/>',
                        value: item,
                      }
                    : { label: item, value: item },
                ),
              ],
            }) +
            '<br>'
          handleAnswers(
            this,
            q * couleurs.length + i,
            { reponse: { value: couleurs[i] } },
            { formatInteractif: 'liste-deroulante' },
          )
        } else if (context.isHtml) {
          listeDeroulanteToQcm(
            this,
            q * couleurs.length + i,
            [
              { label: 'Choisir une couleur', value: '' },
              ...choixListeDeroulante[(this.sup - 1) % 2].map((item) =>
                this.sup === 1
                  ? {
                      svg:
                        '<rect x="-10" y="-10" width="20" height="20" stroke="black" fill="' +
                        traducColor(item) +
                        '"/>',
                      value: item,
                    }
                  : { label: item, value: item },
              ),
            ],
            couleurs[i],
            { ordered: false, vertical: false },
            '',
          )
          const leQcm = propositionsQcm(this, q * couleurs.length + i)
          texte += 'Couleur n°$' + (i + 1) + `$${sp()}: ` + leQcm.texte + '<br>'
        }
      }
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
        for (let i = 1; i < 10; i++) {
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
        for (let i = 1; i < 12; i++) {
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
        for (let i = 1; i < 10; i++) {
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
        for (let i = 1; i < 12; i++) {
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
        texteCorr += '\n\\newpage'
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
