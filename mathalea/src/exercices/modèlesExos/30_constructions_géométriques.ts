import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { tracePoint } from '../../lib/2d/TracePoint'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { carre } from '../../lib/2d/polygonesParticuliers'
import { segmentAvecExtremites } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { rotation } from '../../lib/2d/transformations'
import { triangle2points2longueurs } from '../../lib/2d/triangles'
import { pointAdistance } from '../../lib/2d/utilitairesPoint'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre = "Nom de l'exercice"

export const dateDePublication = '4/5/2024' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

export const uuid = '1eb36'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 *
 * @author NomAuteur(s)

 */
export default class NomExercice extends Exercice {
  constructor() {
    super()
    this.consigne = 'consigne'
    this.nbQuestions = 1 // Ici le nombre de questions
  }

  nouvelleVersion() {
    // la variable numeroExercice peut être récupérée pour permettre de différentier deux copies d'un même exo
    // Par exemple, pour être certain de ne pas avoir les mêmes noms de points en appelant 2 fois cet exo dans la même page

    const typesDeQuestionsDisponibles = [1] // tableau à compléter par valeurs possibles des types de questions
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    // let A, B, C, D, kare, triangle // c'est une mauvaise idée d'avoir des variables globales, il vaut mieux des constantes renouvelées à chaque tour de boucle et propres à chaque case : ça évite les valeurs résiduelles
    for (
      let i = 0, texte: string, texteCorr: string, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const objetsEnonce: NestedObjetMathalea2dArray = [] // on initialise le tableau des objets Mathalea2d de l'enoncé
      const objetsEnonceml: NestedObjetMathalea2dArray = [] // Idem pour l'enoncé à main levée si besoin
      const objetsCorrection: NestedObjetMathalea2dArray = [] // Idem pour la correction
      let signatureQuestion = String(listeTypeDeQuestions[i])

      texte = 'Construire le carré $ABCD$.<br>'
      texteCorr =
        "Pour cette construction on peut utiliser la règle et l'équerre.<br>"
      switch (
        listeTypeDeQuestions[i] // Chaque question peut être d'un type différent, ici 4 cas sont prévus...
      ) {
        case 1:
          {
            // ces accolades permettent de définir des variables et des constantes locales
            const A = pointAbstrait(0, 0, 'A', 'below') // 'below' indique l'étiquette avec son nom sera en dessous du point.
            // Laisse ta souris sur point pour savoir ce que fait cette fonction !
            // Garde en tête cette possibilité pour la suite et préviens sur le Slack si rien ne s'affiche pour une fonction alors que tu aurais bien aimé ;)

            // Les quatre lignes ci-dessous proposent une façon très efficace d'avoir des positions aléatoires des points de façon contrôlée
            const B = pointAdistance(
              A,
              randint(30, 60) / 10,
              randint(0, 40),
              'B',
            ) // Crée le point B à une distance comprise entre 3 et 6 unités du point A de façon à ce que le vecteur AB forme un angle entre 0 et 40° avec l'horizontale
            const triangle = triangle2points2longueurs(
              A,
              B,
              randint(40, 60) / 10,
              randint(30, 50) / 10,
            ) // Crée un triangle à partir des point A et B et dont le troisième est à une certaine distance de A et de B
            const C = triangle.listePoints[2] // On met le troisième point du triangle créé précédemment dans la variable C
            C.nom = 'C' // On nomme ce troisième point 'C'

            const D = rotation(B, A, -90, 'D', 'above') // Laisse ta souris sur carre pour voir ce que fait cette fonction !
            signatureQuestion = [
              listeTypeDeQuestions[i],
              A.x,
              A.y,
              B.x,
              B.y,
              C.x,
              C.y,
              D.x,
              D.y,
            ].join(';')
            objetsEnonce.push(triangle, segmentAvecExtremites(C, D)) // Quand on veut afficher des objets, on commence par les push dans la liste associée
            objetsEnonce.push(tracePoint(A, B)) // Place une croix à l'emplacement de A et de B
            objetsEnonce.push(labelPoint(A, C)) // Place une étiquette 'A' ou 'C' dans la position définie précédemment ('below' et 'above' par défaut)
            const kare = carre(C, D) // Laisse ta souris sur carre pour voir ce que fait cette fonction !
            kare.epaisseur = 2
            objetsEnonceml.push(kare)

            // On copie tout le contenu de objetsEnonce et de objetsEnonceml dans objetsCorrection
            objetsEnonce.forEach((objet) => {
              objetsCorrection.push(objet)
            })
            objetsEnonceml.forEach((objet) => {
              objetsCorrection.push(objet)
            })
            // ici sont créés les texte, tex_corr, objets mathalea2d divers entrant dans le contenu de l'exercice
          }
          break

        case 2:
          // Idem Cas1 mais avec d'autres texte, texteCorr...
          break

        case 3:
          break

        case 4:
          break
      }
      // Les lignes ci-dessous permettent d'avoir un affichage aux dimensions optimisées caduque !
      /*
      const xmin = Math.min(A.x, B.x, C.x, D.x, kare.listePoints[2].x, kare.listePoints[3].x) - 2
      const xmax = Math.max(A.x, B.x, C.x, D.x, kare.listePoints[2].x, kare.listePoints[3].x) + 2
      const ymin = Math.min(A.y, B.y, C.y, D.y, kare.listePoints[2].y, kare.listePoints[3].y) - 2
      const ymax = Math.max(A.y, B.y, C.y, D.y, kare.listePoints[2].y, kare.listePoints[3].y) + 2
      => remplacé par fixeBordures(objetsEnonce) ci dessous
       */
      // paramètres de la fenêtre Mathalea2d pour l'énoncé normal
      const paramsEnonce = Object.assign(fixeBordures(objetsEnonce), {
        pixelsParCm: 20,
        scale: 1,
      })
      // paramètres de la fenêtre Mathalea2d pour l'énoncé main levée
      const paramsEnonceml = Object.assign(fixeBordures(objetsEnonce), {
        pixelsParCm: 20,
        scale: 1,
        mainlevee: true,
        amplitude: 1,
      })
      // paramètres de la fenêtre Mathalea2d pour la correction
      // On ajoute au texte de l'énoncé, la figure à main levée et la figure de l'enoncé.
      texte +=
        mathalea2d(paramsEnonce, objetsEnonce) +
        mathalea2d(paramsEnonceml, objetsEnonceml)
      // On ajoute au texte de la correction, la figure de la correction
      texteCorr += mathalea2d(paramsEnonce, objetsCorrection)
      // Si la question n'a jamais été posée, on l'enregistre
      if (this.questionJamaisPosee(i, signatureQuestion)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        // Dans cet exercice, on n'utilise pas a, b, c et d mais A, B, C et D alors remplace-les !
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
