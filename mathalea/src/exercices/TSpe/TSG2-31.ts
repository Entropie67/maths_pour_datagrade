import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../lib/outils/ecritures'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre =
  "Déterminer si un point appartient à une droite de l'espace"

export const dateDePublication = '26/01/2025' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

export const uuid = 'f0619'
export const refs = {
  'fr-fr': ['TSG2-31'],
  'fr-ch': [],
}

/**
 *
 * @author Stéphane Guyon

*/
export default class PointAppartientDroite extends Exercice {
  constructor() {
    super()
    this.consigne = ''
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const typeQuestionsDisponibles = ['type1', 'type2'] // On créé 3 types de questions

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Boucle principale où i+1 correspond au numéro de la question
      const xA = randint(-10, 10, 0)
      const yA = randint(-10, 10, 0)
      const zA = randint(-10, 10, 0)
      const a = randint(-10, 10, 0)
      const b = randint(-10, 10, 0)
      const c = randint(-10, 10, 0)
      const t = randint(-4, 4, 0) // coeff de proportionnalité en cas d'appartennance
      const alea = randint(1, 3) // aléatoirisation pour non appartenance, déterminer quelle cooronnée est modifiée pour planter
      let xM = 0
      let yM = 0
      let zM = 0
      switch (
        listeTypeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'type1': // M appartient à la droite
          xM = xA + t * a
          yM = yA + t * b
          zM = zA + t * c
          texteCorr =
            "Il suffit de vérifier s'il existe un réel $t$ qui valide le système pour les coordonnées du point $M$.<br>"
          texteCorr += `Résolvons le système :<br><br>$ \\phantom{\\iff }\\begin{cases}${xM}=${xA}${ecritureAlgebriqueSauf1(a)} t\\\\${yM}=${yA}${ecritureAlgebriqueSauf1(b)} t\\\\${zM}=${zA}${ecritureAlgebriqueSauf1(c)} t\\end{cases}$<br>`
          texteCorr += `<br>$\\iff \\begin{cases}${rienSi1(a)} t=${xM}${ecritureAlgebrique(-xA)}\\\\${rienSi1(b)} t=${yM}${ecritureAlgebrique(-yA)}\\\\${rienSi1(c)} t=${zM}${ecritureAlgebrique(-zA)}\\end{cases}$<br>`
          texteCorr += `<br>$\\iff \\begin{cases}${rienSi1(a)} t=${xM - xA}\\\\${rienSi1(b)} t=${yM - yA}\\\\${rienSi1(c)} t=${zM - zA}\\end{cases}$<br>`
          texteCorr += `<br>$\\iff \\begin{cases} t=${t}\\\\ t=${t}\\\\t=${t}\\end{cases}$`
          texteCorr += `<br>Le système a pour solution $t=${t}$ donc le point M ${texteEnCouleurEtGras('appartient')} à la droite $(\\Delta)$.`
          break
        case 'type2': // défavorable
        default:
          xM = xA + t * a
          yM = yA + t * b
          zM = zA + t * c
          if (alea === 1) {
            xM = xM + randint(-1, 1, 0)
          } // on détermine quelle coordonnée est affectée d'un +/- 1
          if (alea === 2) {
            yM = yM + randint(-1, 1, 0)
          }
          if (alea === 3) {
            zM = zM + randint(-1, 1, 0)
          }

          texteCorr =
            "Il suffit de vérifier s'il existe un réel $t$ qui valide le système pour les coordonnées du point $M$.<br>"
          texteCorr += `Résolvons le système :<br><br>$ \\phantom{\\iff } \\begin{cases}${xM}=${xA}${ecritureAlgebriqueSauf1(a)} t\\\\${yM}=${yA}${ecritureAlgebriqueSauf1(b)} t\\\\${zM}=${zA}${ecritureAlgebriqueSauf1(c)} t\\end{cases}$<br>`
          texteCorr += `<br>$\\iff \\begin{cases}${rienSi1(a)} t=${xM}${ecritureAlgebriqueSauf1(-xA)}\\\\${rienSi1(b)} t=${yM}${ecritureAlgebriqueSauf1(-yA)}\\\\${rienSi1(c)} t=${zM}${ecritureAlgebriqueSauf1(-zA)}\\end{cases}$<br>`
          texteCorr += `<br>$\\iff \\begin{cases}${rienSi1(a)} t=${xM - xA}\\\\${rienSi1(b)} t=${yM - yA}\\\\${rienSi1(c)} t=${zM - zA}\\end{cases}$<br><br>`
          if (alea === 1) {
            texteCorr += `$\\iff \\begin{cases} t=\\dfrac{${texNombre(xM - xA)}}{${texNombre(a)}}\\\\ t=${t}\\\\t=${t}\\end{cases}$<br>`
          }
          if (alea === 2) {
            texteCorr += `$\\iff \\begin{cases} t=${t}\\\\t=\\dfrac{${texNombre(yM - yA)}}{${texNombre(b)}}\\\\ t=${t}\\end{cases}$<br>`
          }
          if (alea === 3) {
            texteCorr += `$\\iff \\begin{cases} t=${t}\\\\t=${t}\\\\t=\\dfrac{${texNombre(zM - zA)}}{${texNombre(c)}}\\end{cases}$<br>`
          }

          texteCorr += `<br>Le système n'admet pas de solution. Le point M ${texteEnCouleurEtGras("n'appartient pas")} à la droite $(\\Delta)$.`

          break
      }
      texte = `Déterminer si le point $M(${xM}~;~${yM}~;~${zM})$ appartient à la droite $(\\Delta)$ dont on donne la représentation paramétrique ci-dessous :<br>`
      texte += `$(\\Delta) \\begin{cases}x=${xA}${ecritureAlgebriqueSauf1(a)} t\\\\y=${yA}${ecritureAlgebriqueSauf1(b)} t\\quad (t\\in\\mathbb{R})\\\\z=${zA}${ecritureAlgebriqueSauf1(c)} t\\end{cases}$`

      if (this.questionJamaisPosee(i, a, b, c, xA, yA, zA, t, texte)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
