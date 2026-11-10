import { lampeMessage } from '../../lib/format/message'
import {
  all,
  hasZeroMember,
  isEquation,
  isEquivalentEquation,
} from '../../lib/interactif/checks'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard.js'
import { handleAnswers } from '../../lib/interactif/gestionInteractif.js'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  ecritureAlgebriqueSauf0,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures.js'
import { miseEnEvidence } from '../../lib/outils/embellissements.js'
import { sp } from '../../lib/outils/outilString'
import { listeQuestionsToContenu, randint } from '../../modules/outils.js'
import Exercice from '../Exercice'

export const titre = "Déterminer une équation cartésienne d'un plan"
export const dateDePublication = '06/12/2024'
export const uuid = 'be5d4'
export const interactifReady = true

export const refs = {
  'fr-fr': ['TSG2-40'],
  'fr-ch': ['3G99-2'],
}

/**
 * Déterminer une équation cartésienne d'un plan
 * @author Claire Rousset modification de l'interactif par Nathan Scheinmann
 */
export default class EquationsLog extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.spacingCorr = 3

    this.correctionDetailleeDisponible = false
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      const xA = randint(-10, 10)
      const yA = randint(-10, 10)
      const zA = randint(-10, 10)
      const a = randint(-10, 10, 0)
      const b = randint(-10, 10, 0)
      const c = randint(-10, 10, 0)
      let equation = ''
      let ResEquation = ''
      let resultat = ''

      const valeurX = a * xA
      const valeurY = b * yA
      const valeurZ = c * zA
      const valeur = valeurX + valeurY + valeurZ

      equation = `$${rienSi1(a)}x ${ecritureAlgebriqueSauf1(b)}y ${ecritureAlgebriqueSauf1(c)}z+d=0$`
      ResEquation = `${rienSi1(valeurX)} ${ecritureAlgebriqueSauf1(valeurY)} ${ecritureAlgebriqueSauf1(valeurZ)}+d=0`

      texte = `Déterminer une équation cartésienne du plan $P$ passant par le point $A(${xA}~;~${yA}~;~${zA})$ et admettant pour vecteur normal le vecteur $\\overrightarrow{n} \\begin{pmatrix}${a} \\\\${b} \\\\${c} \\end{pmatrix}$.`
      texteCorr =
        'On utilise la formule issue de la définition d’un vecteur normal à un plan.<br>'
      texteCorr += lampeMessage({
        titre: 'Méthode :',
        texte:
          'Si le plan $P$ passe par $A(x_A;y_A;z_A)$ et admet $\\vec n\\begin{pmatrix}a\\\\b\\\\c\\end{pmatrix}$ comme vecteur normal, alors une équation cartésienne de $P$ est $ax+by+cz+d=0$ avec $d=-(ax_A+by_A+cz_A)$.',
        couleur: 'black',
      })
      texteCorr += `Le vecteur $\\overrightarrow{n} \\begin{pmatrix}${a} \\\\${b} \\\\${c} \\end{pmatrix}$ est normal à $P$, donc $P$ admet une équation cartésienne de la forme ${equation}.`
      texteCorr += '<br>Déterminons $d$ avec les coordonnées du point $A$.'
      texteCorr += `<br>Le point $A(${xA}~;~${yA}~;~${zA})$ est un point du plan $P$ donc ses coordonnées vérifient l'équation cartésienne de $P$. On a donc : `
      texteCorr += `<br>$\\begin{aligned}
      ${rienSi1(a)}x_A ${ecritureAlgebriqueSauf1(b)}y_A ${ecritureAlgebriqueSauf1(c)}z_A+d=0`
      if (a === 1 || a === -1) {
        texteCorr += `&\\iff ${rienSi1(a)}${ecritureParentheseSiNegatif(xA)}${ecritureAlgebriqueSauf1(b)}\\times ${ecritureParentheseSiNegatif(yA)}${ecritureAlgebriqueSauf1(c)}\\times ${ecritureParentheseSiNegatif(zA)}+d=0\\\\`
      } else if (b === -1 || b === 1) {
        texteCorr += `&\\iff ${rienSi1(a)} \\times ${ecritureParentheseSiNegatif(xA)} ${ecritureAlgebriqueSauf1(b)} ${ecritureParentheseSiNegatif(yA)} ${ecritureAlgebriqueSauf1(c)} \\times ${ecritureParentheseSiNegatif(zA)}+d=0\\\\`
      } else if (c === -1 || c === 1) {
        texteCorr += `&\\iff ${rienSi1(a)} \\times ${ecritureParentheseSiNegatif(xA)} ${ecritureAlgebriqueSauf1(b)} \\times ${ecritureParentheseSiNegatif(yA)} ${ecritureAlgebriqueSauf1(c)} ${ecritureParentheseSiNegatif(zA)} +d=0\\\\`
      } else {
        texteCorr += `&\\iff ${rienSi1(a)} \\times ${ecritureParentheseSiNegatif(xA)} ${ecritureAlgebriqueSauf1(b)} \\times ${ecritureParentheseSiNegatif(yA)} ${ecritureAlgebriqueSauf1(c)} \\times ${ecritureParentheseSiNegatif(zA)}+d=0\\\\`
      }
      texteCorr += `&\\iff ${ResEquation}\\\\`
      texteCorr += `&\\iff ${valeur}+d=0\\\\`

      texteCorr += `&\\iff d=${-valeur}\\\\
      \\end{aligned}$`
      resultat = `${rienSi1(a)}x ${ecritureAlgebriqueSauf1(b)}y ${ecritureAlgebriqueSauf1(c)}z ${ecritureAlgebriqueSauf0(-valeur)}=0`

      texteCorr +=
        '<br> Finalement, une équation cartésienne du plan $P$ est : ' + sp()
      texteCorr += `$${miseEnEvidence(resultat)}$.`

      if (this.interactif) {
        handleAnswers(this, i, {
          reponse: {
            value: resultat,
            compare: all([
              isEquation(),
              hasZeroMember(),
              isEquivalentEquation(),
            ]),
          },
        })
        texte += '<br> Équation cartésienne du plan $P$ :'
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.lycee)
      }

      if (this.questionJamaisPosee(i, a, b, c, xA, yA, zA)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
