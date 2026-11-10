/* eslint-disable camelcase */
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { texteParPositionEchelle } from '../../lib/2d/textes'
import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
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
  ObjetLutin,
  orienter,
} from '../../modules/2dLutin'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  noteLaCouleur,
  plateau2dNLC,
  testBoucle,
  testInstruction,
  testSequence,
  thePlateau,
  traducColor,
  traducNum,
  type CouleurNLC,
} from '../../modules/noteLaCouleur'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import { scratchblock } from '../../modules/scratchblock'
import Exercice from '../Exercice'

import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import type { ObjetMathalea2D } from '../../lib/2d/ObjetMathalea2D'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import { sp } from '../../lib/outils/outilString'

export const interactifReady = true

export const dateDeModifImportante = '14/05/2023'
export const dateDePublication = '11/04/2021'
export const titre = 'Noter la couleur avec Scratch'

/**
 * Note_la_couleur() Exercice inspiré de l'activité débranchée de Jean-Yves Labouche Note La Couleur
 * https://www.monclasseurdemaths.fr/profs/algorithmique-scratch/note-la-couleur/
 * @author Jean-claude Lhote
 * A faire : ajouter d'autres niveaux avec des instructions conditionnelles, des blocs définis...
 */
export const uuid = '0e016'

export const refs = {
  'fr-fr': ['6I1B-2'],
  'fr-2016': ['6I11'],
  'fr-ch': ['autres-6'],
}
export default class NoteLaCouleur6e extends Exercice {
  relatif: boolean
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de plateau',
      4,
      '1 : Plateau couleur sans numéro\n2 : Plateau couleur avec numéros\n3 : Plateau noir et blanc avec nom des couleurs\n4 : Plateau noir et blanc avec numéros',
    ]
    this.besoinFormulaire2Numerique = [
      'Type de programme',
      3,
      '1 : Avancer et tourner\n2 : Boucles\n3 : Mélange',
    ]
    this.besoinFormulaire3Numerique = ['Nombre de couleurs (Maximum 6)', 6]
    this.besoinFormulaire4CaseACocher = ['Plateau de jeu original', false]
    this.nbQuestions = 1

    this.sup = 1
    this.sup2 = 1
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
        'Jaune',
        'Bleu',
        'Vert',
        'Orange',
        'Rouge',
        'Orange',
        'Noir',
        'Jaune',
        'Gris',
        'Vert',
        'Rose',
        'Noir',
        'Jaune',
        'Blanc',
      ],
      [
        'Blanc',
        'Rouge',
        'Bleu',
        'Orange',
        'Jaune',
        'Rose',
        'Gris',
        'Jaune',
        'Rose',
        'Gris',
        'Jaune',
        'Bleu',
        'Rouge',
        'Gris',
        'Rouge',
        'Blanc',
      ],
      [
        'Blanc',
        'Rose',
        'Vert',
        'Gris',
        'Rouge',
        'Noir',
        'Bleu',
        'Vert',
        'Noir',
        'Vert',
        'Bleu',
        'Rose',
        'Gris',
        'Vert',
        'Orange',
        'Blanc',
      ],
      [
        'Blanc',
        'Vert',
        'Bleu',
        'Rose',
        'Vert',
        'Bleu',
        'Orange',
        'Gris',
        'Rouge',
        'Orange',
        'Jaune',
        'Gris',
        'Rouge',
        'Rose',
        'Bleu',
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
        'Blanc',
        'Blanc',
        'Noir',
        'Gris',
        'Orange',
        'Noir',
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
        'Blanc',
        'Blanc',
        'Rouge',
        'Bleu',
        'Gris',
        'Vert',
        'Rouge',
        'Noir',
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
        'Vert',
        'Jaune',
        'Rose',
        'Noir',
        'Rose',
        'Vert',
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
        'Noir',
        'Bleu',
        'Vert',
        'Jaune',
        'Orange',
        'Gris',
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
        'Gris',
        'Rose',
        'Bleu',
        'Rouge',
        'Bleu',
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
        'Jaune',
        'Gris',
        'Vert',
        'Jaune',
        'Noir',
        'Rouge',
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
        'Blanc',
        'Blanc',
        'Blanc',
        'Blanc',
        'Blanc',
        'Blanc',
      ],
    ]
    const choixListeDeroulante = [
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
    const echelleDessin = 0.5

    let j, test
    const paramsCorrection = this.relatif
      ? {
          xmin: -13,
          ymin: -10,
          xmax: 13,
          ymax: 10,
          pixelsParCm: 20,
          scale: echelleDessin,
        }
      : {
          xmin: -1,
          ymin: -1,
          xmax: 25,
          ymax: 19,
          pixelsParCm: 20,
          scale: echelleDessin,
        }
    let commandes_disponibles
    const sequences_disponibles = []
    let sequence
    let result
    let nb_couleurs
    let instruction
    let couleurs
    let liste_instructions

    let lutin = creerLutin()
    let lutindepart
    let angledepart
    let xdepart
    let ydepart
    context.unitesLutinParCm = 20
    context.pixelsParCm = 20
    let pion
    const typeDeQuestion =
      Number(this.sup2) === 1
        ? combinaisonListes([1], this.nbQuestions)
        : Number(this.sup2) === 2
          ? combinaisonListes([2], this.nbQuestions)
          : combinaisonListes([1, 2], this.nbQuestions)
    const lePlateau = plateau2dNLC({
      type: this.sup,
      melange: !this.sup4,
      scale: echelleDessin,
      relatif: this.relatif,
      nx: 16,
      ny: 12,
      pas: 30,
      plateau: damier,
    })
    for (let q = 0; q < this.nbQuestions;) {
      const objetsCorrection: NestedObjetMathalea2dArray = []
      const objetsEnonce: NestedObjetMathalea2dArray = []
      const objets = lePlateau.objets ?? []
      objetsEnonce.push(objets)
      objetsCorrection.push(objets)
      let reponseCouleur = []
      let texte = ''
      let texteCorr = ''
      let compteur = 0
      let retour_a_la_case_depart
      let compteur_essais_boucle
      let compteur_essais_sequence
      couleurs = []
      nb_couleurs = this.sup3
      liste_instructions = []
      switch (typeDeQuestion[q]) {
        case 1: {
          // Programme sans boucles
          commandes_disponibles = [
            ['AV30', 'AV60', 'AV90', 'AV120', 'AV150'],
            ['TD90', 'TG90', 'TG90', 'TG180'],
          ]
          for (let m = 0, ins1; m < 5; m++) {
            for (let n = 0, ins2; n < 4; n++) {
              ins1 = commandes_disponibles[0][m]
              ins2 = commandes_disponibles[1][n]
              sequences_disponibles.push(
                [ins1, ins2, 'NLC'],
                [ins2, ins1, 'NLC'],
              )
            }
          }
          retour_a_la_case_depart = true
          while (retour_a_la_case_depart) {
            objetsEnonce.length = 1
            lutin = creerLutin()
            angledepart = choice([90, 0, -90, 180])
            xdepart = -225 + randint(4, 11) * 30 + (this.relatif ? 0 : 240)
            ydepart = -165 + randint(3, 8) * 30 + (this.relatif ? 0 : 180)

            pion = noteLaCouleur({
              x: xdepart,
              y: ydepart,
              orientation: angledepart,
              plateau: thePlateau,
              relatif: this.relatif,
            })
            lutin.color = context.isHtml
              ? colorToLatexOrHTML('green')
              : colorToLatexOrHTML('black')
            lutin.epaisseur = 2
            lutin.pointilles = 2
            allerA(xdepart, ydepart, lutin)
            orienter(angleScratchTo2d(angledepart), lutin)
            lutindepart = clone(lutin) as ObjetLutin
            baisseCrayon(lutindepart)
            allerA(xdepart, ydepart, lutindepart)
            objetsEnonce.push(lutindepart)
            baisseCrayon(lutin)
            compteur++
            if (compteur > 5) break
            pion.codeScratch = ''
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
                xdepart = -225 + randint(4, 11) * 30 + (this.relatif ? 0 : 240)
                ydepart = -165 + randint(3, 8) * 30 + (this.relatif ? 0 : 180)
              }
            }
          }

          break
        }
        case 2: {
          // programmes à boucles
          commandes_disponibles = [
            ['AV30', 'AV60', 'AV90', 'AV120'],
            ['TD90', 'TG90', 'TD90', 'TG180'],
          ]
          for (let m = 0, ins1; m < 3; m++) {
            for (let n = 0, ins2; n < 3; n++) {
              for (let p = 0, ins3; p < 3; p++) {
                for (let q = 0, ins4; q < 3; q++) {
                  ins1 = commandes_disponibles[0][m]
                  ins2 = commandes_disponibles[1][n]
                  ins3 = commandes_disponibles[0][p]
                  ins4 = commandes_disponibles[1][q]
                  sequences_disponibles.push(
                    [ins1, ins2, 'NLC', ins3, ins4],
                    [ins2, ins1, 'NLC', ins3, ins4],
                    [ins1, ins2, 'NLC', ins4, ins3],
                    [ins2, ins1, 'NLC', ins4, ins3],
                    [ins1, ins2, ins3, 'NLC', ins4],
                    [ins2, ins1, ins4, ins3, 'NLC'],
                    [ins1, 'NLC', ins2, ins3, ins4],
                    [ins2, 'NLC', ins1, ins4, ins3],
                  )
                }
              }
            }
          }

          retour_a_la_case_depart = true
          const repetitions = nb_couleurs - 1
          while (retour_a_la_case_depart) {
            objetsEnonce.length = 1
            lutin = creerLutin()
            angledepart = choice([90, 0, -90, 180])
            xdepart = -225 + randint(4, 11) * 30 + (this.relatif ? 0 : 240)
            ydepart = -165 + randint(3, 8) * 30 + (this.relatif ? 0 : 180)

            pion = noteLaCouleur({
              x: xdepart,
              y: ydepart,
              orientation: angledepart,
              plateau: lePlateau.plateauNLC,
              relatif: this.relatif,
            })
            pion.codeScratch = ''
            lutin.color = context.isHtml
              ? colorToLatexOrHTML('green')
              : colorToLatexOrHTML('black')
            lutin.epaisseur = 2
            lutin.pointilles = 2
            allerA(xdepart, ydepart, lutin)
            orienter(angleScratchTo2d(angledepart), lutin)
            lutindepart = clone(lutin)
            objetsEnonce.push(lutindepart as ObjetMathalea2D)
            baisseCrayon(lutin)
            compteur++
            if (compteur > 5) break // 5 tentatives infructueuses -> On sort de la boucle.
            compteur_essais_boucle = 0
            pion.codeScratch =
              '\\begin{scratch}[print,fill,blocks,scale=0.7]\n \\blockinit{quand \\greenflag est cliqué}\n '
            pion.codeScratch += `\\blockmove{aller à x: \\ovalnum{${xdepart}} y: \\ovalnum{${ydepart}}}\n \\blockmove{s'orienter à \\ovalnum{${angledepart}}}\n`
            pion.currentIndex += pion.codeScratch.length
            // On choisit le code à l'intérieur de la boucle
            sequence = choice(sequences_disponibles)
            test = testBoucle(repetitions, sequence, pion) as unknown as [
              boolean,
              number,
              number,
              number,
              string,
              ObjetLutin,
            ]
            while (!test[0] && compteur_essais_boucle < 5) {
              // On tente 5 boucles à cette position, après on change de position.
              compteur_essais_boucle++
              sequence = choice(sequences_disponibles)
              test = testBoucle(repetitions, sequence, pion) as unknown as [
                boolean,
                number,
                number,
                number,
                string,
                ObjetLutin,
              ]
            }
            if (compteur_essais_boucle < 5) {
              retour_a_la_case_depart = false
              pion.codeScratch += `\\blockrepeat{répéter \\ovalnum{${repetitions}} fois}{\n`
              liste_instructions.push('début de boucle')
              for (let i = 0; i < sequence.length; i++) {
                instruction = sequence[i]
                result = testInstruction(instruction, lutin, pion)
                if (instruction === 'NLC' && result != null) {
                  liste_instructions.push(instruction)
                  couleurs.push(pion.nlc())
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
              liste_instructions.push('fin de boucle')
              pion.codeScratch += '} \n'
              // on recommence n-1 fois pour faire avancer le pion et le lutin
              for (let j = 1; j < repetitions; j++) {
                for (let i = 0; i < sequence.length; i++) {
                  instruction = sequence[i]
                  result = testInstruction(instruction, lutin, pion)
                  if (instruction === 'NLC') {
                    couleurs.push(pion.nlc())
                    lutin = result[5]
                    attendre(5, lutin)
                  } else {
                    pion.currentPos.x = result[1]
                    pion.currentPos.y = result[2]
                    pion.currentOrientation = result[3]
                    lutin = result[5]
                  }
                }
              }
              sequence = choice(sequences_disponibles)
              test = testSequence(sequence, pion)
              while (!test[0]) {
                sequence = choice(sequences_disponibles)
                test = testSequence(sequence, pion)
              }
              for (let i = 0; i < sequence.length; i++) {
                instruction = sequence[i]
                result = testInstruction(instruction, lutin, pion)
                if (instruction === 'NLC') {
                  liste_instructions.push(instruction)

                  couleurs.push(pion.nlc())
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
              xdepart = -225 + randint(4, 11) * 30 + (this.relatif ? 0 : 240)
              ydepart = -165 + randint(3, 8) * 30 + (this.relatif ? 0 : 180)
            }
          }
          break
        }
      }
      if (pion == null) {
        window.notify('pion est null', { pion })
        return
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
        'Exécuter le programme et trouver la succession de couleurs.<br><br>'
      if (context.isHtml) {
        texte +=
          '<table><tr><td>' +
          scratchblock(pion.codeScratch) +
          '</td><td>' +
          `${
            this.sup % 2 === 0
              ? `Correspondance chiffre-couleur${sp()}: <br>0=Blanc ; 1=Noir ; 2=Rouge ; 3=Bleu ; 4=Orange ; 5=Rose ; 6=Jaune ; 7=Vert ; 8=Gris<br>`
              : ''
          }` +
          mathalea2d(paramsCorrection, ...objetsEnonce) +
          '</td></tr></table>'
      } else {
        texte += `\\begin{minipage}{.3 \\linewidth} \n\t ${scratchblock(pion.codeScratch)} \n \\end{minipage}
      \\begin{minipage}{.7 \\linewidth} \n\t ${
        this.sup % 2 === 0
          ? `Correspondance chiffre-couleur${sp()}: \\\\\n0=Blanc, 1=Noir, 2=Rouge, 3=Bleu, 4=Orange, 5=Rose, 6=Jaune, 7=Vert, 8=Gris\\\\\n`
          : ''
      } ${mathalea2d(paramsCorrection, ...objetsEnonce)} \n \\end{minipage}`
        if (q < this.nbQuestions - 1 && !context.isHtml) {
          texte += '\n \\medskip'
        }
      }
      reponseCouleur = couleurs
      if (this.sup % 2 === 0)
        reponseCouleur[0] =
          '(' +
          traducNum(
            couleurs[0] as unknown as
              | 'Blanc'
              | 'Bleu'
              | 'Noir'
              | 'Rouge'
              | 'Jaune'
              | 'Rose'
              | 'Vert'
              | 'Orange'
              | 'Gris',
          ) +
          ') ' +
          couleurs[0]
      texteCorr = `On obtient la série de couleurs suivante${sp()}:<br> `
      texteCorr += `${texteEnCouleurEtGras(reponseCouleur[0])} `
      texte += !this.interactif
        ? ''
        : `Couleur n°1${sp()}: ` +
          choixDeroulant(this, q * couleurs.length, {
            choices: [
              { label: 'Choisir une couleur', value: '' },
              ...choixListeDeroulante[(this.sup - 1) % 2].map((item) =>
                this.sup === 1
                  ? {
                      svg:
                        '<rect x="-10" y="-10" width="20" height="20" stroke="black" fill="' +
                        traducColor(item as CouleurNLC) +
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
      for (let i = 1; i < couleurs.length; i++) {
        if (this.sup % 2 === 0)
          reponseCouleur[i] =
            '(' +
            traducNum(
              couleurs[i] as unknown as
                | 'Blanc'
                | 'Bleu'
                | 'Noir'
                | 'Rouge'
                | 'Jaune'
                | 'Rose'
                | 'Vert'
                | 'Orange'
                | 'Gris',
            ) +
            ') ' +
            couleurs[i]
        texteCorr += `${texteEnCouleurEtGras(reponseCouleur[i])} `
        texte += !this.interactif
          ? ''
          : 'Couleur n°' +
            (i + 1) +
            `${sp()}: ` +
            choixDeroulant(this, q * couleurs.length + i, {
              choices: [
                { label: 'Choisir une couleur', value: '' },
                ...choixListeDeroulante[(this.sup - 1) % 2].map((item) =>
                  this.sup === 1
                    ? {
                        svg:
                          '<rect x="-10" y="-10" width="20" height="20" stroke="black" fill="' +
                          traducColor(item as CouleurNLC) +
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
      if (this.correctionDetaillee) {
        for (let i = 1; i < 16; i++) {
          if (this.relatif) {
            if (i < 7 || i > 9) {
              objetsCorrection.push(
                texteParPositionEchelle(
                  stringNombre(-240 + 30 * i),
                  -12.1 + 1.5 * i,
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
          } else {
            if (i !== 1) {
              objetsCorrection.push(
                texteParPositionEchelle(
                  stringNombre(30 * i),
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
        }
        for (let i = 1; i < 12; i++) {
          if (this.relatif) {
            if (i < 5 || i > 7) {
              objetsCorrection.push(
                texteParPositionEchelle(
                  stringNombre(-180 + 30 * i),
                  -0.5,
                  -9 + 1.5 * i,
                  0,
                  'black',
                  1.2,
                  'milieu',
                  true,
                  echelleDessin,
                ),
              )
            }
          } else {
            if (i !== 1) {
              objetsCorrection.push(
                texteParPositionEchelle(
                  stringNombre(30 * i),
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
      }
      const objetsCorr = objetsCorrection.filter((obj) => obj != null).flat()
      texteCorr +=
        '<br><br>' + mathalea2d(paramsCorrection, ...objetsCorr, lutin)
      if (q < this.nbQuestions - 1 && !context.isHtml) {
        texteCorr += '\n\\newpage'
      }
      if (
        this.questionJamaisPosee(
          q,
          String(xdepart),
          String(ydepart),
          String(angledepart),
        )
      ) {
        this.listeQuestions[q] = texte
        this.listeCorrections[q] = texteCorr

        q++
      }
    }
    listeQuestionsToContenu(this)
  }
}
