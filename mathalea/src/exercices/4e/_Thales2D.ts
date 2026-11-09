import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { symboleParallele } from '../../lib/outils/notationsGeometrie'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { texteParPoint } from '../../lib/2d/textes'
import { homothetie, similitude } from '../../lib/2d/transformations'
import { triangle2points2longueurs } from '../../lib/2d/triangles'
import { angleOriente, longueur } from '../../lib/2d/utilitairesGeometriques'
import { pointAdistance, pointSurSegment } from '../../lib/2d/utilitairesPoint'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { texteGras } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouterBoutonMathalea2d } from '../../lib/outils/enrichissements'
import { nombreDeChiffresDansLaPartieEntiere } from '../../lib/outils/nombres'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import Grandeur from '../../modules/Grandeur'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const titre = 'Calculer des longueurs avec le théorème de Thalès'

/**
 * Calcul de longueurs avec le théorème de Thalès
 * @author Rémi Angot
 * Utilisée dans 4G30 et 3G20
 */
export default class Thales2D extends Exercice {
  vspace: number // je ne sais pas pourquoi maintenir cette propriété qui est assignée mais jamais utilisée ???
  level: number
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Configuration',
      3,
      '1 : Triangles imbriqués\n2 : Papillon\n3 : Mélange',
    ]

    this.nbQuestions = 1

    this.sup = 1 // Triangles imbriqués / configuration papillon / les 2
    this.sup2 = 1 // correction Triangles imbriqués / correction droites sécantes
    this.vspace = -0.5 // Monter un peu l'énoncé pour gagner de la place dans la sortie PDF

    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = false
    this.level = 4
  }

  nouvelleVersion(numeroExercice: number) {
    if (this.level === 3) {
      this.besoinFormulaire2Numerique = [
        'Correction',
        2,
        '1 : Triangles imbriqués\n2 : Droites sécantes',
      ]
    }
    let listeDeNomsDePolygones: string[] = []

    if (this.level === 4) {
      this.sup = 1
      this.sup2 = 1
    }
    const premiereQuestionPapillon = randint(0, 1) // Pour alterner les configurations et savoir par laquelle on commence
    let reponse, reponse2

    for (
      let i = 0, texte = '', texteCorr = '', cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // this.autoCorrection[i] = {}
      if (i % 3 === 0) {
        // Toutes les 3 questions, on repart à zéro sur les noms des polygones
        listeDeNomsDePolygones = ['QD']
      }
      const nomDesPoints = creerNomDePolygone(5, listeDeNomsDePolygones)
      listeDeNomsDePolygones.push(nomDesPoints)
      const nomA = nomDesPoints[0]
      const nomB = nomDesPoints[1]
      const nomC = nomDesPoints[2]
      const nomM = nomDesPoints[3]
      const nomN = nomDesPoints[4]
      const ab = randint(5, 10)
      const ac = randint(5, 10, ab)
      const bc = randint(Math.max(ab - ac, ac - ab) + 1, ab + ac - 1, [ab, ac]) // Pas de triangle isocèle ou équilatéral
      const A = pointAbstrait(0, 0, nomA)
      const B = pointAdistance(A, ab, nomB)
      const ABC = triangle2points2longueurs(A, B, ac, bc)
      ABC.id = `M2D_${numeroExercice}_${i}_1`
      const C = ABC.listePoints[2]
      C.nom = nomC
      let k = randint(3, 8, 5) / 10
      if (parseInt(this.sup) === 2) {
        k *= -1
        this.vspace = -0.5 // Monter un peu l'énoncé pour gagner de la place dans la sortie PDF
      }
      if (
        parseInt(this.sup) === 3 &&
        (i + premiereQuestionPapillon) % 2 === 0
      ) {
        k *= -1
        this.vspace = -0.5 // Monter un peu l'énoncé pour gagner de la place dans la sortie PDF
      }
      const M = homothetie(A, C, k)
      const N = homothetie(B, C, k)
      const MNC = polygone(M, N, C)
      MNC.id = `M2D_${numeroExercice}_${i}_2`

      let posM
      if (k > 0) {
        if (angleOriente(M, C, N) > 0) {
          posM = similitude(C, M, 90, (1 / longueur(C, M)) * 0.5)
        } else {
          posM = similitude(C, M, -90, (1 / longueur(C, M)) * 0.5)
        }
      } else {
        posM = pointSurSegment(M, N, -0.5)
      }
      const marqueNomM = texteParPoint(
        nomM,
        posM,
        0,
        'black',
        1,
        'milieu',
        true,
      )

      let posN
      if (k > 0) {
        if (angleOriente(M, C, N) > 0) {
          posN = similitude(C, N, -90, (1 / longueur(C, N)) * 0.5)
        } else {
          posN = similitude(C, N, 90, (1 / longueur(C, N)) * 0.5)
        }
      } else {
        posN = pointSurSegment(N, M, -0.5)
      }
      const marqueNomN = texteParPoint(
        nomN,
        posN,
        0,
        'black',
        1,
        'milieu',
        true,
      )

      const a = pointSurSegment(A, B, -0.5)
      const b = pointSurSegment(B, A, -0.5)
      const marqueNomA = texteParPoint(nomA, a, 0, 'black', 1, 'milieu', true)
      const marqueNomB = texteParPoint(nomB, b, 0, 'black', 1, 'milieu', true)
      let posC
      if (k < 0) {
        posC = similitude(
          A,
          C,
          -angleOriente(N, C, A) / 2,
          (1 / longueur(A, C)) * 0.5,
        )
      } else {
        posC = similitude(
          A,
          C,
          -180 + angleOriente(A, C, B) / 2,
          (1 / longueur(A, C)) * 0.5,
        )
      }
      const marqueNomC = texteParPoint(
        nomC,
        posC,
        0,
        'black',
        1,
        'milieu',
        true,
      )

      texte = `Sur la figure suivante, $${nomA + nomC}=${ac}\\text{ cm}$, $${nomA + nomB}=${ab}\\text{ cm}$, $${nomC + nomM}=${texNombre(Math.abs(k) * ac)}\\text{ cm}$, $${nomC + nomN}=${texNombre(Math.abs(k) * bc)}\\text{ cm}$ et $(${nomA + nomB})//(${nomM + nomN})$.<br>`
      if (!this.interactif) {
        texte += `Calculer $${nomM + nomN}$ et $${nomC + nomB}$.<br><br>`
      }

      texte += mathalea2d(
        {
          xmin: Math.min(A.x, B.x, C.x, M.x, N.x) - 1.5,
          ymin: Math.min(A.y, B.y, C.y, M.y, N.y) - 0.8,
          xmax: Math.max(A.x, B.x, C.x, M.x, N.x) + 1.5,
          ymax: Math.max(A.y, B.y, C.y, M.y, N.y) + 0.8,
          scale: 0.5,
        },
        ABC,
        MNC,
        marqueNomA,
        marqueNomB,
        marqueNomC,
        marqueNomM,
        marqueNomN,
      )

      const epaisseurTriangle = k < 0 ? 2 : 6 // En cas de configuration papillon il est inutile de changer l'épaisseur
      const boutonAideMathalea2d = ajouterBoutonMathalea2d(
        numeroExercice + '_' + i,
        `if (!document.getElementById('M2D_${numeroExercice}_${i}_1').dataset.colorie == true || (document.getElementById('M2D_${numeroExercice}_${i}_1').dataset.colorie == 'false')){
          document.getElementById('M2D_${numeroExercice}_${i}_1').style.stroke = '${bleuMathalea}';
          document.getElementById('M2D_${numeroExercice}_${i}_2').style.stroke = 'red';
          document.getElementById('M2D_${numeroExercice}_${i}_1').style.opacity = .5;
          document.getElementById('M2D_${numeroExercice}_${i}_1').style.strokeWidth = ${epaisseurTriangle};
          document.getElementById('M2D_${numeroExercice}_${i}_2').style.opacity = 1;
          document.getElementById('M2D_${numeroExercice}_${i}_2').style.strokeWidth = 2;
          document.getElementById('M2D_${numeroExercice}_${i}_1').dataset.colorie = true;
          document.getElementById('btnMathALEA2d_${numeroExercice}_${i}').classList.add('active');
        } else {
          document.getElementById('M2D_${numeroExercice}_${i}_1').style.stroke = 'black';
          document.getElementById('M2D_${numeroExercice}_${i}_2').style.stroke = 'black';
          document.getElementById('M2D_${numeroExercice}_${i}_1').style.opacity = 1;
          document.getElementById('M2D_${numeroExercice}_${i}_1').style.strokeWidth = 1;
          document.getElementById('M2D_${numeroExercice}_${i}_2').style.opacity = 1;
          document.getElementById('M2D_${numeroExercice}_${i}_2').style.strokeWidth = 1;
          document.getElementById('M2D_${numeroExercice}_${i}_1').dataset.colorie = false;
          document.getElementById('btnMathALEA2d_${numeroExercice}_${i}').classList.remove('active');
  
        }
        `,
        'Mettre en couleur les $2$ triangles',
      )

      if (k > 0 && this.sup2 === 1) {
        texteCorr = `Dans le triangle $${nomA + nomB + nomC}$ :<br>
 $\\leadsto$ $${nomM}\\in${'[' + nomC + nomA + ']'}$,<br>
 $\\leadsto$ $${nomN}\\in${'[' + nomC + nomB + ']'}$,<br>
 $\\leadsto$  $(${nomA + nomB})${symboleParallele()}(${nomM + nomN})$,<br>
       donc d'après le théorème de Thalès, `
        texteCorr += this.correctionDetaillee
          ? `les triangles $${nomA + nomB + nomC}$ et $${nomM + nomN + nomC}$ ont des longueurs proportionnelles.`
          : 'on a:'
      } else {
        texteCorr = `Les droites $(${nomA + nomM})$ et $(${nomB + nomN})$ sont sécantes en $${nomC}$ et $(${nomA + nomB})${symboleParallele()}(${nomM + nomN})$ <br> 
        donc d'après le théorème de Thalès, `
        texteCorr += this.correctionDetaillee
          ? `les triangles $${nomA + nomB + nomC}$ et $${nomM + nomN + nomC}$ ont des longueurs proportionnelles.`
          : 'on a:'
      }
      texteCorr += '<br><br>'
      if (context.isHtml) {
        texteCorr += `$\\dfrac{\\color{red}${nomC + nomM}}{\\color{blue}${nomC + nomA}}=\\dfrac{\\color{red}${nomC + nomN}}{\\color{blue}${nomC + nomB}}=\\dfrac{\\color{red}${nomM + nomN}}{\\color{blue}${nomA + nomB}}$`
      } else {
        texteCorr += `$\\dfrac{${nomC + nomM}}{${nomC + nomA}}=\\dfrac{${nomC + nomN}}{${nomC + nomB}}=\\dfrac{${nomM + nomN}}{${nomA + nomB}}$`
      }
      texteCorr += '<br><br>'
      texteCorr += `$\\dfrac{${texNombre(Math.abs(k) * ac)}}{${texNombre(ac)}}=\\dfrac{${texNombre(Math.abs(k) * bc)}}{${nomC + nomB}}=\\dfrac{${nomM + nomN}}{${texNombre(ab)}}$`
      texteCorr += '<br><br>'
      if (this.correctionDetaillee) {
        texteCorr += texteGras(`Calcul de ${nomM + nomN} : `)
        texteCorr += '<br><br>'
        texteCorr += `On utilise l'égalité $\\dfrac{${texNombre(Math.abs(k) * ac)}}{${texNombre(ac)}}=\\dfrac{${nomM + nomN}}{${texNombre(ab)}}$.`
        texteCorr += '<br><br>'
        texteCorr += 'Les produits en croix sont égaux,'
        texteCorr += '<br><br>'
        texteCorr += `donc $${texNombre(Math.abs(k) * ac)}\\times ${texNombre(ab)}=${nomM + nomN}\\times ${texNombre(ac)}$.`
        texteCorr += '<br><br>'
        texteCorr += `On divise les deux membres par $${texNombre(ac)}$.`
        texteCorr += '<br><br>'
      }
      texteCorr += `$${nomM + nomN}=\\dfrac{${texNombre(Math.abs(k) * ac)}\\times${texNombre(ab)}}{${texNombre(ac)}}=${miseEnEvidence(texNombre(Math.abs(k) * ab))}$ ${texteEnCouleurEtGras('cm')}`
      reponse = Math.abs(k) * ab
      texteCorr += '<br><br>'
      if (this.correctionDetaillee) {
        texteCorr += texteGras(`Calcul de ${nomC + nomB} : `)
        texteCorr += '<br><br>'
        texteCorr += `On utilise l'égalité $\\dfrac{${texNombre(Math.abs(k) * bc)}}{${nomC + nomB}}=\\dfrac{${texNombre(Math.abs(k) * ac)}}{${texNombre(ac)}}$.`
        texteCorr += '<br><br>'
        texteCorr += 'Les produits en croix sont égaux,'
        texteCorr += '<br><br>'
        texteCorr += `donc $${texNombre(Math.abs(k) * ac)}\\times ${nomC + nomB}=${texNombre(ac)}\\times ${texNombre(Math.abs(k) * bc)}$.`
        texteCorr += '<br><br>'
        texteCorr += `On divise les deux membres par $${texNombre(Math.abs(k) * ac)}$.`
        texteCorr += '<br><br>'
      }
      texteCorr += `$${nomC + nomB}=\\dfrac{${texNombre(Math.abs(k) * bc)}\\times${texNombre(ac)}}{${texNombre(Math.abs(k) * ac)}}=${miseEnEvidence(texNombre(bc))}$ ${texteEnCouleurEtGras('cm')}`
      reponse2 = bc
      if (context.isHtml && !context.isTypst) {
        texte += `<br><div style="display: inline-block;margin-top:20px;">${boutonAideMathalea2d}</div>`
      }

      if (this.interactif && context.isHtml) {
        // Une seule question interactive (multi-mathfield) avec deux champs
        const optionsChamp = {
          keyboard: KeyboardType.longueur,
          texteApres: '<em class="ml-2">(Une unité est attendue.)</em>',
        }
        texte += addMultiMathfield(this, i, {
          dataTemplate: `<br><br>$${nomM + nomN} = $ %{field0}<br>$${nomC + nomB} = $ %{field1}`,
          dataOptions: {
            field0: {
              ...optionsChamp,
              legacyAnswerId: `Ex${this.numeroExercice}Q${2 * i}`,
            },
            field1: {
              ...optionsChamp,
              legacyAnswerId: `Ex${this.numeroExercice}Q${2 * i + 1}`,
            },
          },
        })
        handleAnswers(
          this,
          i,
          {
            field0: {
              value: new Grandeur(Math.abs(k) * ab, 'cm'),
              options: { unite: true },
            },
            field1: {
              value: new Grandeur(bc, 'cm'),
              options: { unite: true },
            },
            bareme: toutAUnPoint,
          },
          { formatInteractif: 'multi-mathfield' },
        )
      }

      if (this.listeQuestions.indexOf(texte) === -1) {
        // Il n'y a qu'une seule question donc test inutile...
        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: '',
            enonceAvant: false,
            options: { multicolsAll: true },
            propositions: [
              {
                type: 'AMCOpen',
                propositions: [
                  {
                    enonce: texte,
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
                      texte: `$\\hspace{21pt}${nomM + nomN}$`,
                      valeur: [Number(reponse.toFixed(1))],
                      param: {
                        digits:
                          Math.max(
                            2,
                            nombreDeChiffresDansLaPartieEntiere(
                              Math.round(reponse),
                            ),
                          ) + 1,
                        decimals: 1,
                        approx: 0,
                        signe: false,
                        exposantNbChiffres: 0,
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
                    statut: '',
                    reponse: {
                      texte: `$\\hspace{21pt}${nomC + nomB}$`,
                      valeur: [Number(reponse2.toFixed(1))],
                      param: {
                        digits:
                          Math.max(
                            2,
                            nombreDeChiffresDansLaPartieEntiere(reponse2),
                          ) + 1,
                        decimals: 1,
                        approx: 0,
                        signe: false,
                        exposantNbChiffres: 0,
                      },
                    },
                  },
                ],
              },
            ],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
