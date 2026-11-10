import { arcenciel } from '../../lib/format/style'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { signe } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'

export const titre = "Calculer un terme d'une suite définie par récurrence"
export const interactifReady = true

export const dateDeModifImportante = '11/10/2024'
/**
 * 1N11
 * @author Gaelle Morvan et Gilles Mora pour MAJ (interactif, nouveau cas)
 */
export const uuid = 'b8c14'

export const refs = {
  'fr-fr': ['1AL10-3', '1Gen-A103', '1Tec-S103'],
  'fr-ch': [],
}
export default class TermeDUneSuiteDefinieParRecurrence extends Exercice {
  constructor() {
    super()
    this.besoinFormulaire2Numerique = [
      'Niveau de difficulté',
      3,
      '1 : Calcul de u(1)\n2 : Calcul de u(k)\n3 : Mélange',
    ]
    this.nbQuestions = 1
    this.sup = 6
    this.sup2 = 3
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Suite arithmétique',
        '2 : Suite géométrique',
        '3 : Suite arithmético-géométrique',
        '4 : Suite de la forme u(n+1) = a+/-u(n)²',
        '5 : Suite de la forme u(n+1)=au(n)+/-bn',
        '6 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 5,
      melange: 6,
      defaut: 6,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (
      let i = 0, texte, texteCorr, cpt = 0, u, a, b, reponse, k;
      i < this.nbQuestions && cpt < 50;
    ) {
      const nomSuite = ['u', 'v', 'w']
      const s = choice(nomSuite)
      k =
        this.sup2 === 1
          ? 1
          : this.sup2 === 2
            ? randint(2, 4)
            : choice([1, 1, 2, 3, 4])
      switch (listeTypeDeQuestions[i]) {
        case 1: // suite arithmétique
          a = randint(1, 15) * choice([-1, 1])
          u = randint(0, 12) * choice([-1, 1])
          texte = `Soit $(${s}_n)$ une suite définie par $${s}_0=${u}$ et pour tout entier $n\\in\\mathbb{N}$ par $${s}_{n+1} = ${s}_n ${ecritureAlgebrique(a)}$.`

          texte += `<br>Calculer $${s}_{${k}}$.`

          texteCorr = `${k === 1 ? `On calcule $${s}_1$ :` : `On calcule successivement les termes jusqu'à obtenir $${s}_{${k}}$ :`}`
          for (let indice = 0; indice < k; indice++) {
            texteCorr += `<br> $${s}_{${indice + 1}} = ${miseEnEvidence(`${s}_{` + indice + '}', arcenciel(indice, true))} ${ecritureAlgebrique(a)} =
              ${miseEnEvidence(u, arcenciel(indice, true))} ${ecritureAlgebrique(a)} = ${miseEnEvidence(u + a, arcenciel(indice + 1, true))}$`
            u = u + a
          }
          reponse = u
          texteCorr += `<br> Ainsi, $${s}_{${k}}= ${miseEnEvidence(u)}$.`
          break

        case 2: // suite géométrique
          a = randint(2, 5) * choice([-1, 1])
          u = randint(1, 9) * choice([-1, 1])

          texte = `Soit $(${s}_n)$ une suite définie par $${s}_0=${u}$ et pour tout entier $n\\in\\mathbb{N}$ par $${s}_{n+1} = ${a}${s}_n$.`

          texte += `<br>Calculer $${s}_{${k}}$.`

          texteCorr = `${k === 1 ? `On calcule $${s}_1$ :` : `On calcule successivement les termes jusqu'à obtenir $${s}_{${k}}$ :`}`
          for (let indice = 0; indice < k; indice++) {
            texteCorr += `<br> $${s}_{${indice + 1}} = ${a}\\times${miseEnEvidence(`${s}_{` + indice + '}', arcenciel(indice, true))} =
              ${a}\\times${miseEnEvidence(ecritureParentheseSiNegatif(u), arcenciel(indice, true))}  = ${miseEnEvidence(texNombre(u * a, 1), arcenciel(indice + 1, true))}$`
            u = u * a
          }
          reponse = u
          texteCorr += `<br> Ainsi, $${s}_{${k}}= ${miseEnEvidence(texNombre(u, 1))}$.`
          break

        case 3: // suite arithmético-géométrique
          a = randint(2, 5) * choice([-1, 1])
          b = randint(1, 5) * choice([-1, 1])
          u = randint(1, 5) * choice([-1, 1])

          texte = `Soit $(${s}_n)$ une suite définie par $${s}_0=${u}$ et pour tout entier $n\\in\\mathbb{N}$ par $${s}_{n+1} = ${a} ${s}_n ${ecritureAlgebrique(b)}$.`

          texte += `<br>Calculer $${s}_{${k}}$.`

          texteCorr = `${k === 1 ? `On calcule $${s}_1$ :` : `On calcule successivement les termes jusqu'à obtenir $${s}_{${k}}$ :`}`
          for (let indice = 0; indice < k; indice++) {
            texteCorr += `<br> $${s}_{${indice + 1}} = ${a}\\times ${miseEnEvidence(`${s}_{` + indice + '}', arcenciel(indice, true))} ${ecritureAlgebrique(b)}=`
            texteCorr += `${a} \\times ${miseEnEvidence(ecritureParentheseSiNegatif(u), arcenciel(indice, true))} ${ecritureAlgebrique(b)} =
            ${miseEnEvidence(a * u + b, arcenciel(indice + 1, true))}$`
            u = u * a + b
          }
          reponse = u
          texteCorr += `<br> Ainsi, $${s}_{${k}}= ${miseEnEvidence(u)}$.`
          break

        case 4: // suite de la forme u(n+1) = a +- u(n)^2
          a = randint(1, 5) * choice([-1, 1])
          b = choice([-1, 1])
          u = randint(1, 4) * choice([-1, 1])

          texte = `Soit $(${s}_n)$ une suite définie par $${s}_0=${u}$ et pour tout entier $n\\in\\mathbb{N}$ par $${s}_{n+1} = ${a} ${signe(b)} ${s}_n^2$.`

          texte += `<br>Calculer $${s}_{${k}}$.`

          texteCorr = `${k === 1 ? `On calcule $${s}_1$ :` : `On calcule successivement les termes jusqu'à obtenir $${s}_{${k}}$ :`}`
          for (let indice = 0; indice < k; indice++) {
            texteCorr += `<br> $${s}_{${indice + 1}} = ${a} ${signe(b)} ${miseEnEvidence(`${s}_{` + indice + '}', arcenciel(indice, true))}^2=`
            texteCorr += `${a} ${signe(b)} ${miseEnEvidence(ecritureParentheseSiNegatif(u), arcenciel(indice, true))}^2 =
              ${miseEnEvidence(texNombre(a + b * u * u), arcenciel(indice + 1, true))}$`
            u = a + b * u * u
          }
          reponse = u
          texteCorr += `<br> Ainsi, $${s}_{${k}}= ${miseEnEvidence(texNombre(u, 0))}$.`
          break

        case 5: // suite u(n+1)=au(n)+bn
        default:
          a = randint(1, 4) * choice([-1, 1])
          b = randint(1, 10) * choice([-1, 1])
          u = randint(0, 10) * choice([-1, 1])

          texte = `Soit $(${s}_n)$ une suite définie par $${s}_0=${u}$ et pour tout entier $n\\in\\mathbb{N}$ par $${s}_{n+1} = ${rienSi1(a)}${s}_n ${ecritureAlgebriqueSauf1(b)}n$.`

          texte += `<br>Calculer $${s}_{${k}}$.`
          texteCorr = `${k === 1 ? `On calcule $${s}_1$ :` : `On calcule successivement les termes jusqu'à obtenir $${s}_{${k}}$ :`}`
          for (let indice = 0; indice < k; indice++) {
            texteCorr += `<br> $${s}_{${indice + 1}} = ${a === 1 ? '' : a === -1 ? '-' : `${a} \\times`} ${miseEnEvidence(`${s}_{` + indice + '}', arcenciel(indice, true))}${ecritureAlgebrique(b)}\\times ${miseEnEvidence(indice, arcenciel(indice, true))}=`
            texteCorr += `${a === 1 ? '' : a === -1 ? '-' : `${a} \\times`} ${miseEnEvidence(ecritureParentheseSiNegatif(u), arcenciel(indice, true))}${ecritureAlgebrique(b * indice)} =
              ${miseEnEvidence(texNombre(a * u + b * indice), arcenciel(indice + 1, true))}$`
            u = a * u + b * indice
          }
          reponse = u
          texteCorr += `<br> Ainsi, $${s}_{${k}}= ${miseEnEvidence(texNombre(u, 0))}$.`
          break
      }
      handleAnswers(this, i, { reponse: { value: reponse } })

      texte +=
        '<br>' +
        ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
          texteAvant: `$${s}_{${k}}=$`,
        })
      if (this.questionJamaisPosee(i, a, u, k)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++ // On passe à la question suivante
      }
      cpt++ // Sinon on incrémente le compteur d'essai pour avoir une question nouvelle
    }
    listeQuestionsToContenu(this) // La liste de question et la liste de la correction
  }
}
