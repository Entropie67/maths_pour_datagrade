import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { codageAngle } from '../../lib/2d/angles'
import { barycentre, nommePolygone, polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latexParPoint } from '../../lib/2d/textes'
import { homothetie, rotation, similitude } from '../../lib/2d/transformations'
import { angleOriente, longueur } from '../../lib/2d/utilitairesGeometriques'
import { milieu } from '../../lib/2d/utilitairesPoint'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const titre =
  'Calculer un angle dans un triangle rectangle en utilisant la trigonométrie'
export const dateDeModifImportante = '11/04/2023' // Modif consigne et passage à AMCHbride par EE.

/**
 * @author Jean-claude Lhote à partir de 3G30-1 de Rémi Angot
 * 3G31 Exercice remplaçant l'exercice initial utilisant MG32
 * Calculer un angle en utilisant l'un des trois rapport trigonométrique.
 * * Si this.level=4 alors seul le cosinus sera utilisé.
 * Mars 2021
 */
export const uuid = '0ac11'

export const refs = {
  'fr-fr': ['3G31'],
  'fr-ch': ['1mT-3'],
}

export default class CalculDAngle extends Exercice {
  level: number

  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Figure à main levée', false]
    this.nbQuestions = 2
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = false
    this.spacing = 2
    this.spacingCorr = context.isHtml ? 3 : 2
    this.level = 3
  }

  nouvelleVersion() {
    let listChoixRapportTrigo: string[] = []
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const nom = creerNomDePolygone(3, 'QD')
      let texte = ''
      let texteCorr = ''
      const objetsEnonce: NestedObjetMathalea2dArray = []
      const objetsCorrection: NestedObjetMathalea2dArray = []
      let choixRapportTrigo
      let ab, bc, ac, angleABC
      if (this.level === 4) {
        choixRapportTrigo = choice(['Acos'])
      } else {
        if (listChoixRapportTrigo.length === 0)
          listChoixRapportTrigo = ['Acos', 'Asin', 'Atan']
        listChoixRapportTrigo = shuffle(listChoixRapportTrigo)
        choixRapportTrigo = listChoixRapportTrigo.pop() ?? 'Acos'
      }
      switch (choixRapportTrigo) {
        case 'Acos': // AB=BCxcos(B)
          bc = arrondi(randint(100, 150) / 10, 1)
          ab = arrondi(randint(40, (bc - 2) * 10) / 10, 1)
          angleABC = Math.round((Math.acos(ab / bc) * 180) / Math.PI)
          ac = bc * Math.sin(Math.acos(ab / bc))
          if (this.level === 4 || this.sup) {
            ac = arrondi(ac, 1)
            texte += `Le triangle $${nom}$ est rectangle en $${nom[0]}$ tel que $${nom[1] + nom[2]}=${texNombre(bc)}\\text{ cm}$, $${nom[0] + nom[1]}=${texNombre(ab)}\\text{ cm}$ et $${nom[0] + nom[2]}=${texNombre(ac)}\\text{ cm}$.<br>`
          } else {
            texte += `Le triangle $${nom}$ est rectangle en $${nom[0]}$ tel que $${nom[1] + nom[2]}=${texNombre(bc)}\\text{ cm}$ et $${nom[0] + nom[1]}=${texNombre(ab)}\\text{ cm}$.<br>`
          }
          break
        case 'Asin':
          bc = randint(100, 150) / 10
          ac = randint(40, (bc - 2) * 10) / 10
          angleABC = Math.round((Math.asin(ac / bc) * 180) / Math.PI)
          ab = bc * Math.cos(Math.asin(ac / bc))
          texte += `Le triangle $${nom}$ est rectangle en $${nom[0]}$ tel que $${nom[1] + nom[2]}=${texNombre(bc)}\\text{ cm}$ et $${nom[0] + nom[2]}=${texNombre(ac)}\\text{ cm}$.<br>`
          break
        case 'Atan':
        default:
          ab = randint(40, 100) / 10
          ac = randint(40, 100) / 10
          angleABC = Math.round((Math.atan(ac / ab) * 180) / Math.PI)
          bc = ab / Math.cos(Math.atan(ac / ab))
          texte += `Le triangle $${nom}$ est rectangle en $${nom[0]}$ tel que $${nom[0] + nom[1]}=${texNombre(ab)}\\text{ cm}$ et  $${nom[0] + nom[2]}=${texNombre(ac)}\\text{ cm}$.<br>`
          break
      }

      const ratioerreur = randint(80, 120, 100) / 100
      const a = pointAbstrait(0, 0)
      const b = pointAbstrait(ab * ratioerreur, 0)
      const bb = pointAbstrait(ab, 0)
      const c = pointAbstrait(0, ac / ratioerreur)
      const cb = pointAbstrait(0, ac)
      const p1 = polygone(a, b, c)
      const p3 = polygone(a, bb, cb)
      const alpha = randint(0, 360)
      const p2 = rotation(p1, a, alpha)
      const p4 = rotation(p3, a, alpha)
      const A = p2.listePoints[0]
      const B = p2.listePoints[1]
      const C = p2.listePoints[2]
      const Bb = p4.listePoints[1]
      const Cb = p4.listePoints[2]

      const codage = codageAngleDroit(B, A, C)
      const codageb = codageAngleDroit(Bb, A, Cb)
      A.nom = nom[0]
      B.nom = nom[1]
      C.nom = nom[2]
      const nomme = nommePolygone(p2, nom)
      const nommeb = nommePolygone(p4, nom)

      const hypo = segment(Cb, Bb, bleuMathalea)
      hypo.epaisseur = 2
      const codageDeAngle = codageAngle(A, B, C, 2)
      const codageDeAngleB = codageAngle(A, Bb, Cb, 2)

      const mAB = milieu(A, B)
      const mAC = milieu(A, C)
      const mBC = milieu(B, C)
      const G = barycentre(p2)
      const mABb = milieu(A, Bb)
      const mACb = milieu(A, Cb)
      const mBbCb = milieu(Bb, Cb)
      const Gb = barycentre(p4)
      const pLabelBC = homothetie(mBC, G, 1 + 1.5 / longueur(G, mBC))
      pLabelBC.positionLabel = 'center'

      const pLabelAB = homothetie(mAB, mBC, 1 + 1.5 / longueur(mBC, mAB))
      pLabelAB.positionLabel = 'center'

      const pLabelAC = homothetie(mAC, mBC, 1 + 1.5 / longueur(mBC, mAC))
      pLabelAC.positionLabel = 'center'

      const m3b = homothetie(mBbCb, Gb, 1 + 1.5 / longueur(Gb, mBbCb))
      m3b.positionLabel = 'center'

      const m1b = homothetie(mABb, mBbCb, 1 + 1.5 / longueur(mBbCb, mABb))
      m1b.positionLabel = 'center'

      const m2b = homothetie(mACb, mBbCb, 1 + 1.5 / longueur(mBbCb, mACb))
      m2b.positionLabel = 'center'

      let m4b, pLabelAngle
      let texteAngle, texteAB, texteBC, texteAC, t1b, t2b, t3b
      switch (choixRapportTrigo) {
        case 'Acos': // AB=BCxcos(B)
          texteBC = latexParPoint(
            `${texNombre(bc)} \\text{ cm}`,
            pLabelBC,
            'black',
            120,
            12,
            '',
          )
          texteAB = latexParPoint(
            `${texNombre(ab)} \\text{ cm}`,
            pLabelAB,
            'black',
            120,
            12,
            '',
          )
          if (this.level === 4 && this.sup) {
            const pLabelAC = homothetie(mAC, mBC, 1 + 1.5 / longueur(mBC, mAC))
            pLabelAC.positionLabel = 'center'
            texteAC = latexParPoint(
              `${texNombre(ac)} \\text{ cm}`,
              pLabelAC,
              'black',
              120,
              12,
              '',
            )
          }

          pLabelAngle = similitude(
            A,
            B,
            angleOriente(A, B, C) / 2,
            2.7 / longueur(B, A),
          )
          pLabelAngle.positionLabel = 'center'
          texteAngle = latexParPoint('?', pLabelAngle, 'black', 50, 12, '')
          t3b = latexParPoint(
            `${texNombre(bc)} \\text{ cm}`,
            m3b,
            'black',
            120,
            12,
            '',
          )
          t2b = latexParPoint(
            `${texNombre(ab)} \\text{ cm}`,
            m1b,
            'black',
            120,
            12,
            '',
          )
          m4b = similitude(
            A,
            Bb,
            angleOriente(A, Bb, Cb) / 2,
            2.7 / longueur(Bb, A),
          )
          m4b.positionLabel = 'center'
          t1b = latexParPoint('?', m4b, 'black', 50, 12, '')
          if (texteAC) objetsEnonce.push(texteAC)
          break
        case 'Asin':
          texteBC = latexParPoint(
            `${texNombre(bc)} \\text{ cm}`,
            pLabelBC,
            'black',
            120,
            12,
            '',
          )
          texteAB = latexParPoint(
            `${texNombre(ac)} \\text{ cm}`,
            pLabelAC,
            'black',
            120,
            12,
            '',
          )
          pLabelAngle = similitude(
            A,
            B,
            angleOriente(A, B, C) / 2,
            2.7 / longueur(B, A),
          )
          pLabelAngle.positionLabel = 'center'
          texteAngle = latexParPoint('?', pLabelAngle, 'black', 100, 12, '')
          t3b = latexParPoint(
            `${texNombre(bc)} \\text{ cm}`,
            m3b,
            'black',
            120,
            12,
            '',
          )
          t2b = latexParPoint(
            `${texNombre(ac)} \\text{ cm}`,
            m2b,
            'black',
            120,
            12,
            '',
          )
          m4b = similitude(
            A,
            Bb,
            angleOriente(A, Bb, Cb) / 2,
            2.7 / longueur(Bb, A),
          )
          m4b.positionLabel = 'center'
          t1b = latexParPoint('?', m4b, 'black', 100, 12, '')
          break
        case 'Atan':
        default:
          texteAngle = latexParPoint(
            `${texNombre(ab)} \\text{ cm}`,
            pLabelAB,
            'black',
            120,
            12,
            '',
          )
          texteAB = latexParPoint(
            `${texNombre(ac)} \\text{ cm}`,
            pLabelAC,
            'black',
            120,
            12,
            '',
          )
          pLabelAngle = similitude(
            A,
            B,
            angleOriente(A, B, C) / 2,
            2.7 / longueur(B, A),
          )
          pLabelAngle.positionLabel = 'center'
          texteBC = latexParPoint('?', pLabelAngle, 'black', 100, 12, '')

          t1b = latexParPoint(
            `${texNombre(ab)} \\text{ cm}`,
            m1b,
            'black',
            120,
            12,
            '',
          )
          t2b = latexParPoint(
            `${texNombre(ac)} \\text{ cm}`,
            m2b,
            'black',
            120,
            12,
            '',
          )
          m4b = similitude(
            A,
            Bb,
            angleOriente(A, Bb, Cb) / 2,
            2.7 / longueur(Bb, A),
          )
          m4b.positionLabel = 'center'
          t3b = latexParPoint('?', m4b, 'black', 100, 12, '')
          break
      }

      objetsEnonce.push(
        p2,
        codage,
        nomme,
        texteAngle,
        texteAB,
        texteBC,
        codageDeAngle,
      )
      objetsCorrection.push(
        p4,
        codageb,
        nommeb,
        t1b,
        t2b,
        t3b,
        hypo,
        codageDeAngleB,
      )

      const paramsEnonce = {
        xmin: Math.min(A.x, B.x, C.x) - 2,
        ymin: Math.min(A.y, B.y, C.y) - 2,
        xmax: Math.max(A.x, B.x, C.x) + 2,
        ymax: Math.max(A.y, B.y, C.y) + 2,
        pixelsParCm: 20,
        scale: 0.4,
        mainlevee: true,
        amplitude: 0.4,
      }
      const paramsCorrection = {
        xmin: Math.min(A.x, B.x, C.x) - 4,
        ymin: Math.min(A.y, B.y, C.y) - 4,
        xmax: Math.max(A.x, B.x, C.x) + 3,
        ymax: Math.max(A.y, B.y, C.y) + 2,
        pixelsParCm: 20,
        scale: 0.5,
        mainlevee: false,
      }

      if (!context.isHtml && this.sup && !context.isAmc) {
        texte += '\\begin{minipage}{.4\\linewidth}\n'
      }
      if (this.sup) {
        texte += mathalea2d(paramsEnonce, objetsEnonce)
      }
      if (this.correctionDetaillee) {
        if (!context.isHtml && !context.isAmc)
          texteCorr += '\\begin{minipage}{.5\\linewidth}\n'
        texteCorr += mathalea2d(paramsCorrection, objetsCorrection)
        if (!context.isHtml && !context.isAmc)
          texteCorr += '\n\\end{minipage}\n'
      }
      if (!context.isHtml && this.sup && !context.isAmc) {
        texte += '\n\\end{minipage}\n'
      }
      if (this.correctionDetaillee && !context.isHtml)
        texteCorr += '\\begin{minipage}{.5\\linewidth}\n'
      switch (choixRapportTrigo) {
        case 'Acos': // AB=BCxcos(B)
          texteCorr += `Dans le triangle $${nom}$ rectangle en $${nom[0]}$, le cosinus de l'angle $\\widehat{${nom}}$ est défini par :<br>`
          texteCorr += `$\\cos\\left(\\widehat{${nom}}\\right)=\\dfrac{${nom[0] + nom[1]}}{${nom[1] + nom[2]}}$.<br>`
          texteCorr += 'Avec les données numériques :<br>'
          texteCorr += `$\\cos\\left(\\widehat{${nom}}\\right)=${texFractionFromString(texNombre(ab), texNombre(bc))}$<br>`
          texteCorr += `$\\widehat{${nom}}=\\arccos\\left(${texFractionFromString(texNombre(ab), texNombre(bc))}\\right)`
          break
        case 'Asin':
          texteCorr += `Dans le triangle $${nom}$ rectangle en $${nom[0]}$, le sinus de l'angle $\\widehat{${nom}}$ est défini par :<br>`
          texteCorr += `$\\sin \\left(\\widehat{${nom}}\\right)=${texFractionFromString(nom[0] + nom[2], nom[1] + nom[2])}$<br>`
          texteCorr += 'Avec les données numériques :<br>'
          texteCorr += `$\\sin\\left(\\widehat{${nom}}\\right)=${texFractionFromString(texNombre(ac), texNombre(bc))}$<br>`
          texteCorr += `$\\widehat{${nom}}=\\arcsin\\left(${texFractionFromString(texNombre(ac), texNombre(bc))}\\right)`

          break
        case 'Atan':
        default:
          texteCorr += `Dans le triangle $${nom}$ rectangle en $${nom[0]}$, la tangente de l'angle $\\widehat{${nom}}$ est défini par :<br>`
          texteCorr += `$\\tan \\left(\\widehat{${nom}}\\right)=${texFractionFromString(nom[0] + nom[2], nom[0] + nom[1])}$<br>`
          texteCorr += 'Avec les données numériques :<br>'
          texteCorr += `$\\tan\\left(\\widehat{${nom}}\\right)=${texFractionFromString(texNombre(ac), texNombre(ab))}$<br>`
          texteCorr += `$\\widehat{${nom}}=\\arctan\\left(${texFractionFromString(texNombre(ac), texNombre(ab))}\\right)`
          break
      }
      texteCorr += `\\approx ${miseEnEvidence(angleABC)}^\\circ$<br>`
      if (this.correctionDetaillee && !context.isHtml)
        texteCorr += '\n\\end{minipage}\n'

      texte += `Calculer $\\widehat{${nom}}$`

      // Pour AMC
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: '',
          enonceAvant: false,
          propositions: [
            {
              type: 'AMCOpen',
              propositions: [
                {
                  enonce: texte + '.',
                  texte: texteCorr,
                  statut: 4,
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
                    texte: `Valeur de l'angle $\\widehat{${nom}}$, arrondie à 1$^\\circ$ près : `,
                    valeur: [angleABC],
                    alignement: 'center',
                    param: {
                      digits: 2,
                      decimals: 0,
                      signe: false,
                      approx: 0,
                    },
                  },
                },
              ],
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      } else if (this.interactif && context.isHtml) {
        handleAnswers(this, i, { reponse: { value: angleABC } })
      }
      texte += ' à $1 ^\\circ$ près.'

      texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
        texteApres: ' °',
      })

      if (this.questionJamaisPosee(i, nom, choixRapportTrigo)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
