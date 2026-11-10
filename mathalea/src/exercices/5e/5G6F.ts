import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { rotation, similitude } from '../../lib/2d/transformations'
import { bleuMathalea } from '../../lib/colors'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Déterminer la nature de parallélogrammes'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

/**
 *
 */
export const uuid = '8812e'

export const refs = {
  'fr-fr': ['5G6F', '3AutoG02-1'],
  'fr-2016': ['5G42', '3AutoG02-3'],
  'fr-ch': ['9R1ES2H-7', '9R2ES2H-7', '9R3ES2H-7', 'PRQES02B-9'],
}
/**
 * @author Rémi Angot
 */
export default class DemonstrationsParallelogrammes extends Exercice {
  /** Indique dans la consigne interactive que plusieurs propositions peuvent être justes. */
  plusieursChoix = false

  constructor() {
    super()

    this.nbQuestions = 7
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = [
      'type1',
      'type2',
      'type3',
      'type4',
      'type5',
      'type6',
      'type7',
    ] // On créé 3 types de questions
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"
    const lesNoms: string[][] = []
    let k = 0
    while (k < this.nbQuestions) {
      const nom = choisitLettresDifferentes(5, 'Q')
      if (!lesNoms.includes(nom)) {
        lesNoms.push(nom)
        k++
      }
    }
    for (
      let i = 0,
        objets,
        O,
        A,
        B,
        C,
        D,
        p,
        t1,
        t2,
        t3,
        t4,
        s1,
        s2,
        s3,
        s4,
        d1,
        d2,
        texte,
        texteCorr,
        nom,
        noms,
        prop1,
        prop2,
        type,
        def,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      noms = lesNoms[i]
      nom = `$${noms[0] + noms[1] + noms[2] + noms[3]}$`
      objets = []
      O = pointAbstrait(0, 0, noms[4], 'above left')
      A = rotation(pointAbstrait(3, 0), O, randint(0, 90), noms[0])
      B = similitude(
        A,
        O,
        80 + randint(0, 20),
        0.8 + randint(1, 40) / 100,
        noms[1],
      )
      C = similitude(A, O, 180, 0.9 + randint(1, 20) / 100, noms[2])
      D = similitude(B, O, 180, 0.9 + randint(1, 20) / 100, noms[3])
      p = polygoneAvecNom(A, B, C, D)
      s1 = segment(A, B, bleuMathalea)
      s2 = segment(B, C, 'red')
      s3 = segment(C, D, bleuMathalea)
      s4 = segment(D, A, 'red')
      d1 = segment(A, C)
      d2 = segment(B, D)
      objets.push(s1, s2, s3, s4, p[1])
      // Boucle principale où i+1 correspond au numéro de la question
      switch (
        listeTypeDeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'type1': // rectangle 1
          def = `ses diagonales $[${noms[0] + noms[2]}]$ et $[${noms[1] + noms[3]}]$ ont la même longueur`
          prop1 = 'a des diagonales de même longueur'
          prop2 = `$${noms[0] + noms[2]}=${noms[1] + noms[3]}$`
          type = 'rectangle'
          t2 = codageSegments('||', 'red', B, O, O, D)
          t1 = codageSegments('||', 'red', A, O, O, C)
          objets.push(t1, t2, d1, d2)
          break
        case 'type2': // losange 1
          def = `ses diagonales $[${noms[0] + noms[2]}]$ et $[${noms[1] + noms[3]}]$ sont perpendiculaires`
          prop1 = 'a des diagonales perpendiculaires'
          prop2 = `$[${noms[0] + noms[2]}]\\perp[${noms[1] + noms[3]}]$`
          type = 'losange'
          t1 = codageSegments('||', 'red', A, O, O, C)
          t2 = codageAngleDroit(A, O, D)
          t3 = codageSegments('|||', bleuMathalea, B, O, O, D)
          t4 = labelPoint(O)
          objets.push(t1, t2, t3, t4, d1, d2)
          break
        case 'type3': // carré 1
          prop2 = `$[${noms[0] + noms[2]}]\\perp[${noms[1] + noms[3]}]$ et $${noms[0] + noms[2]}=${noms[1] + noms[3]}$`
          def = `ses diagonales $[${noms[0] + noms[2]}]$ et $[${noms[1] + noms[3]}]$ ont la même longueur et sont perpendiculaires`
          prop1 = 'a des diagonales perpendiculaires et de même longueur'
          t1 = codageSegments('||', 'red', A, O, O, C)
          t2 = codageAngleDroit(A, O, D)
          t3 = codageSegments('||', 'red', B, O, O, D)
          t4 = labelPoint(O)
          objets.push(t1, t2, t3, t4, d1, d2)
          type = 'carré'
          break
        case 'type4': // losange 2
          prop2 = `$${noms[0] + noms[1]}=${noms[1] + noms[2]}$`
          def = `ses côtés $[${noms[0] + noms[1]}]$ et $[${noms[1] + noms[2]}]$ ont la même longueur`
          prop1 = 'a deux côtés consécutifs de même longueur'
          type = 'losange'
          t3 = codageSegments('O', 'green', A, B, B, C)
          objets.push(t3)
          break
        case 'type5': // rectangle 2
          prop2 = `$[${noms[0] + noms[1]}]\\perp[${noms[1] + noms[2]}]$`
          def = `ses côtés $[${noms[0] + noms[1]}]$ et $[${noms[1] + noms[2]}]$ sont perpendiculaires`
          prop1 = 'a deux côtés consécutifs perpendiculaires'
          t3 = codageAngleDroit(A, B, C)
          objets.push(t3)
          type = 'rectangle'
          break
        case 'type6': // carré 2
          prop2 = `$[${noms[0] + noms[1]}]\\perp[${noms[1] + noms[2]}]$ et $${noms[0] + noms[1]}=${noms[1] + noms[2]}$`
          def = `ses côtés $[${noms[0] + noms[1]}]$ et $[${noms[1] + noms[2]}]$ sont perpendiculaires et de même longueur`
          prop1 =
            'a deux côtés consécutifs perpendiculaires et de même longueur'
          t2 = codageSegments('O', 'green', A, B, B, C)
          t3 = codageAngleDroit(A, B, C)
          objets.push(t2, t3)
          type = 'carré'
          break
        case 'type7': // carré 3
          prop2 = `$[${noms[0] + noms[1]}]\\perp[${noms[1] + noms[2]}]$ et $[${noms[0] + noms[2]}]\\perp[${noms[1] + noms[3]}]$`
          def = `ses côtés $[${noms[0] + noms[1]}]$ et $[${noms[1] + noms[2]}]$ sont perpendiculaires et ses diagonales $[${noms[0] + noms[2]}]$ et $[${noms[1] + noms[3]}]$ aussi`
          prop1 =
            'a deux côtés consécutifs perpendiculaires et des diagonales perpendiculaires'
          type = 'carré'
          t1 = codageAngleDroit(A, O, B)
          t2 = codageAngleDroit(A, B, C)
          t4 = labelPoint(O)
          objets.push(t1, t2, t4, d1, d2)
          break
      }
      texte = `${nom} est un parallélogramme tel que ${def}.<br>`
      texte += `Déterminer la nature de ${nom}`
      texte += this.interactif
        ? this.plusieursChoix
          ? ' (parfois, plusieurs choix sont possibles).'
          : '.'
        : ' en justifiant la réponse.'
      texteCorr =
        'Les segments de même couleur sont parallèles sur le schéma suivant :<br>'
      texteCorr += mathalea2d(
        {
          xmin: -5,
          ymin: -4.5,
          xmax: 5,
          ymax: 4.5,
          pixelsParCm: 20,
          scale: 0.5,
          mainlevee: true,
          display: 'block',
        },
        objets,
      )
      texteCorr += `On sait que ${prop2}.<br>`
      texteCorr += `Si un parallélogramme ${prop1}, alors c'est un ${type}.<br>`
      texteCorr += `${nom} est donc un ${type}.`
      const propositionsDuQCM = [
        {
          texte: 'losange',
          statut: type === 'losange' || type === 'carré',
        },
        {
          texte: 'carré',
          statut: type === 'carré',
        },
        {
          texte: 'rectangle',
          statut: type === 'rectangle' || type === 'carré',
        },
        {
          texte: 'parallélogramme non particulier',
          statut: false,
        },
      ]
      const bonnes = propositionsDuQCM
        .filter((proposition) => proposition.statut)
        .map((proposition) => texteEnCouleurEtGras(proposition.texte))
      texteCorr += `<br>${bonnes.length > 1 ? 'Les propositions correctes sont' : 'La proposition correcte est'} : ${bonnes.join(' ; ')}.`
      this.autoCorrection[i] = {}
      this.autoCorrection[i].options = { ordered: false }
      this.autoCorrection[i].enonce = `${texte}\n`
      this.autoCorrection[i].propositions = propositionsDuQCM

      const props = propositionsQcm(this, i) // Il faut impérativement faire cela qu'on soit en interactif ou pas, sino cela décale le générateur aléatoire !
      if (this.interactif) texte += props.texte
      // if (this.interactif) texte += propositionsQcm(this, i).texte

      if (this.questionJamaisPosee(i, listeTypeDeQuestions[i], nom)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
