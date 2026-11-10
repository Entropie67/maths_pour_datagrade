import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { tracePoint } from '../../lib/2d/TracePoint'
import { droite } from '../../lib/2d/droites'
import { labelPoint } from '../../lib/2d/textes'
import { pointAdistance, pointSurDroite } from '../../lib/2d/utilitairesPoint'
import { addMathaleaQcm } from '../../lib/customElements/MathaleaQcm'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Reconnaître des points alignés'

export const dateDePublication = '22/02/2023'
export const dateDeModifImportante = '15/09/2026'
// Ajout de l'interactivité par Rémi Angot
export const interactifReady = true

/**
 * Reconnaître si trois points sont alignés en traçant une droite qui passe par les deux premiers et en vérifiant qu'elle passe bien par le troisième.
 * @author Guillaume Valmont

*/
export const uuid = '02320'

export const refs = {
  'fr-fr': ['6G0-7'],
  'fr-2016': ['6G51-1'],
  'fr-ch': ['9R1ES1A-4', '9R2ES1A-4', '9R3ES1A-4'],
}
export default class ReconnaitreDesPointsAlignes extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 2
    this.demandeLaVue = true // Décrire la position des points donnerait la réponse.
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = ['oui', 'non']
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    let A, B, C, D, d
    let objetsEnonce, objetsCorrection, paramsEnonce, paramsCorrection
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      objetsEnonce = []
      objetsCorrection = []

      const lettres = choisitLettresDifferentes(4)
      const positionLabel = choice(['above', 'below'])
      d = droite(randint(-15, 15) / 10, -1, 0)
      A = pointSurDroite(d, 0, lettres[0], positionLabel)
      B = pointSurDroite(d, randint(10, 30) / 10, lettres[1], positionLabel)
      C = pointSurDroite(d, randint(40, 60) / 10, lettres[2], positionLabel)
      D = pointAdistance(
        C,
        0.5,
        positionLabel === 'above' ? 90 : -90,
        lettres[3],
        positionLabel,
      )
      const traceA = tracePoint(A)
      traceA.taille = context.isHtml ? 2 : 1
      const traceB = tracePoint(B)
      traceB.taille = context.isHtml ? 2 : 1
      objetsEnonce.push(traceA, traceB, labelPoint(A, B))
      texte = 'Graphiquement, les points suivants sont-ils alignés ?<br>'
      texteCorr = `Pour le savoir, on trace la droite qui passe par les points $${A.nom}$ et $${B.nom}$ et on vérifie si elle passe aussi par le point `
      switch (listeTypeDeQuestions[i]) {
        case 'oui': {
          const traceC = tracePoint(C)
          traceC.taille = context.isHtml ? 2 : 1
          objetsEnonce.push(traceC, labelPoint(C))
          texteCorr += `$${C.nom}$.<br>La droite $(${A.nom + B.nom})$ passe aussi par le point $${C.nom}$ donc graphiquement on observe que les points $${A.nom}$, $${B.nom}$ et $${C.nom}$ sont ${texteEnCouleurEtGras('alignés')}.<br>Réponse : ${texteEnCouleurEtGras('Oui')}.<br>`
          break
        }
        case 'non': {
          const traceD = tracePoint(D)
          traceD.taille = context.isHtml ? 2 : 1
          objetsEnonce.push(traceD, labelPoint(D))
          texteCorr += `$${D.nom}$.<br>La droite $(${A.nom + B.nom})$ ne passe pas par le point $${D.nom}$ donc graphiquement on observe que les points $${A.nom}$, $${B.nom}$ et $${D.nom}$ ${texteEnCouleurEtGras('ne sont pas alignés')}.<br>Réponse : ${texteEnCouleurEtGras('Non')}.<br>`
          break
        }
      }
      d.pointilles = 5
      objetsCorrection.push(d)
      objetsEnonce.forEach((objet) => {
        objetsCorrection.push(objet)
      })
      // Les lignes ci-dessous permettent d'avoir un affichage aux dimensions optimisées
      const xmin = Math.min(A.x, B.x, C.x, D.x) - 2
      const xmax = Math.max(A.x, B.x, C.x, D.x) + 2
      const ymin = Math.min(A.y, B.y, C.y, D.y) - 2
      const ymax = Math.max(A.y, B.y, C.y, D.y) + 2
      paramsEnonce = { xmin, ymin, xmax, ymax, pixelsParCm: 20, scale: 1 }
      paramsCorrection = paramsEnonce
      // On ajoute au texte de l'énoncé, la figure à main levée et la figure de l'enoncé.
      const troisiemePoint = listeTypeDeQuestions[i] === 'oui' ? C : D
      texte += mathalea2d(
        {
          ...paramsEnonce,
          description: `Trois points nommés ${A.nom}, ${B.nom} et ${troisiemePoint.nom}. Pour savoir s'ils sont alignés, il faut observer la figure.`,
        },
        objetsEnonce,
      )
      // On ajoute au texte de la correction, la figure de la correction
      texteCorr += mathalea2d(
        {
          ...paramsCorrection,
          description: `Droite (${A.nom}${B.nom}) tracée en pointillés. Elle ${listeTypeDeQuestions[i] === 'oui' ? 'passe' : 'ne passe pas'} par le point ${troisiemePoint.nom}.`,
        },
        objetsCorrection,
      )
      // Si la question n'a jamais été posée, on l'enregistre
      if (
        this.questionJamaisPosee(
          i,
          A.nom,
          B.nom,
          typesDeQuestionsDisponibles[i] === 'oui' ? C.nom : D.nom,
        )
      ) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        // Dans cet exercice, on n'utilise pas a, b, c et d mais A, B, C et D alors remplace-les !
        const estAligne = listeTypeDeQuestions[i] === 'oui'
        const propositions = [
          { texte: 'Oui', statut: estAligne },
          { texte: 'Non', statut: !estAligne },
        ]
        const qcmOptions = { radio: true, vertical: false }
        handleAnswers(
          this,
          i,
          {
            qcm: {
              enonce: texte,
              propositions,
              correction: texteCorr,
              options: qcmOptions,
            },
          },
          { formatInteractif: 'mathalea-qcm' },
        )
        if (context.isHtml) {
          texte += addMathaleaQcm(this, i, {
            ...qcmOptions,
            interactivityOn: this.interactif,
          })
        } else if (!context.isAmc) {
          const qcmLatex = propositionsQcm(this, i)
          texte += qcmLatex.texte
          texteCorr += qcmLatex.texteCorr
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
