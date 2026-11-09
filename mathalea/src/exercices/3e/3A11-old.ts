// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid a6667 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { combinaisonListesSansChangerOrdre } from '../../lib/outils/arrayOutils'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { numAlpha } from '../../lib/outils/outilString'
import {
  decompositionFacteursPremiersArray,
  premiersEntreBornes,
} from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Rendre irréductible une fraction'

/**
 * Fractions irréductibles
 * @author Sébastien Lozano
 * Rémi Angot pour l'ajout du multimathfield et l'interactivité
 */
export const uuid = 'a6667'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class FractionsIrreductiblesOld extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Décomposition « simple »']
    // pas de différence entre la version html et la version latex pour la consigne
    this.consigne =
      'Rendre irréductible une fraction et son inverse à partir des décompositions en produit de facteurs premiers.'
    this.spacing = context.isHtml ? 4 : 2
    this.spacingCorr = context.isHtml ? 4 : 2
    this.nbQuestions = 1

    this.sup = true
  }

  nouvelleVersion() {
    let typesDeQuestions

    const typesDeQuestionsDisponibles = [1]
    const listeTypeDeQuestions = combinaisonListesSansChangerOrdre(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      typesDeQuestions = listeTypeDeQuestions[i]
      texte = ''
      texteCorr = ''
      let nb1 // nbre 1
      let nb2 // nbre 2

      // on fixe le tableau de choix
      const candidatsPremiersCommuns = this.sup
        ? [2, 3, 5]
        : premiersEntreBornes(2, 13) // tableau des candidats premiers communs
      // on fixe le nombre de divisuers premiers communs
      const nbDivPremCommuns = this.sup ? 3 : 4 // nombre de diviseurs premiers communs
      // on initialise le tableau des diviseurs premiers communs
      const premiersCommuns = [] // tableau des diviseurs premiers communs
      // on initialise le tableau des rangs
      const r = [] // tableau pour le choix des rangs des diviseurs premiers communs
      // on initialise le tableau des rangs déjà choisis
      const rExclus: number[] = [] // tableau pour la boucle de creation de r
      // on complète le tableau des rangs des rangs des diviseurs premiers choisis
      for (let k = 0; k < nbDivPremCommuns; k++) {
        for (let m = 0; m < k; m++) {
          rExclus.push(r[m])
        }
        r[k] = randint(0, candidatsPremiersCommuns.length - 1, rExclus)
      }
      // on complète le tableau des diviseurs premiers communs
      for (let k = 0; k < nbDivPremCommuns; k++) {
        premiersCommuns.push(candidatsPremiersCommuns[r[k]])
      }
      // on initialise et on complète le tableau des multiplicités des diviseurs premiers communs
      const multiplicitesPremiersCommuns = [] // tableau des multiplicités des diviseurs premiers communs
      let zeroDejaDonne = false
      for (let k = 0; k < nbDivPremCommuns; k++) {
        const multipliciteHAsard = zeroDejaDonne ? randint(1, 2) : randint(0, 2)
        if (multipliciteHAsard === 0) zeroDejaDonne = true
        multiplicitesPremiersCommuns.push(multipliciteHAsard)
      }
      // on supprime les diviseurs premiers de multiplicité 0 et leur multiplicité
      let idx = multiplicitesPremiersCommuns.indexOf(0)
      while (idx !== -1) {
        premiersCommuns.splice(idx, 1)
        multiplicitesPremiersCommuns.splice(idx, 1)
        idx = multiplicitesPremiersCommuns.indexOf(0)
      }
      // on initialise le tableau des diviseurs du premier et du second nombre avec les diviseurs premiers communs
      const tabNb1 = [] // tableau pour les diviseurs de nb1
      const tabNb2 = [] // tableau pour les diviseurs de nb2
      for (let k = 0; k < premiersCommuns.length; k++) {
        tabNb1[k] = premiersCommuns[k]
        tabNb2[k] = premiersCommuns[k]
      }
      // on initialise les tableaux de multiplicité, ils sont les mêmes mais on pourrait vouloir qu'ils soient différents
      const multiplicitesNb1 = []
      const multiplicitesNb2 = []
      for (let k = 0; k < premiersCommuns.length; k++) {
        multiplicitesNb1[k] = multiplicitesPremiersCommuns[k]
        multiplicitesNb2[k] = multiplicitesPremiersCommuns[k]
      }
      // on ajoute un facteur premier distinct pour chaque nombre plus petit que maBorne
      const maBorne = this.sup ? 13 : 30
      const rEx = randint(0, premiersEntreBornes(2, maBorne).length - 1) // pour exlcure le rang de nb1
      const nb1Dist = premiersEntreBornes(2, maBorne)[rEx] // diviseur unique du premier nombre
      const nb2Dist = premiersEntreBornes(2, maBorne)[
        randint(0, premiersEntreBornes(2, maBorne).length - 1, rEx)
      ] // diviseur unique du deuxième nombre
      // on ajoute nb1_dist, nb2_dist dans les tableaux des diviseurs premiers du premier et du second nombre
      // nb1
      let bool = false
      let n = 0
      while (n < tabNb1.length && bool !== true) {
        if (nb1Dist === tabNb1[n]) {
          // si le diviseur premier est déjà présent on incrémente sa multiplicité
          multiplicitesNb1[n]++
          bool = true
        }
        n++
      }
      // on teste la valeur de sortie de bool et on ajoute la nouvelle valeur si nécessaire
      if (!bool) {
        // il n'est pas présent on l'ajoute avec la multipplicité 1
        tabNb1.push(nb1Dist)
        multiplicitesNb1.push(1)
        bool = true
      }
      // nb2
      bool = false
      n = 0
      while (n < tabNb2.length && !bool) {
        if (nb2Dist === tabNb2[n]) {
          // si le diviseur premier est déjà présent on incrémente sa multiplicité
          multiplicitesNb2[n]++
          bool = true
        }
        n++
      }
      // on teste la valeur de sortie de bool et on ajoute la nouvelle valeur si nécessaire
      if (!bool) {
        // il n'est pas présent on l'ajoute avec la multipplicité 1
        tabNb2.push(nb2Dist)
        multiplicitesNb2.push(1)
        bool = true
      }
      // on crée un tableau associatif à partir des deux tableaux tab_ni et multiplicites_ni
      const tabPremMultNb1 = []
      for (let k = 0; k < tabNb1.length; k++) {
        tabPremMultNb1[k] = { prem: tabNb1[k], mult: multiplicitesNb1[k] }
      }
      const tabPremMultNb2 = []
      for (let k = 0; k < tabNb2.length; k++) {
        tabPremMultNb2[k] = { prem: tabNb2[k], mult: multiplicitesNb2[k] }
      }
      // on range selon prem croissant
      tabPremMultNb1.sort(function (a, b) {
        return a.prem - b.prem
      })
      tabPremMultNb2.sort(function (a, b) {
        return a.prem - b.prem
      })
      // on initialise nb1 et nb2 et on les calcule à partir des tableaux
      nb1 = 1
      for (let k = 0; k < tabNb1.length; k++) {
        nb1 = nb1 * tabPremMultNb1[k].prem ** tabPremMultNb1[k].mult
      }
      nb2 = 1
      for (let k = 0; k < tabNb2.length; k++) {
        nb2 = nb2 * tabPremMultNb2[k].prem ** tabPremMultNb2[k].mult
      }

      // Décomposition en produit de facteurs premiers au format LaTeX (2^{2}\times3\times5)
      const decompoEnLatex = (
        tab: { prem: number; mult: number }[],
      ): string =>
        tab
          .map(({ prem, mult }) =>
            mult === 1 ? `${prem}` : `${prem}^{${mult}}`,
          )
          .join('\\times')
      const reponseA = decompoEnLatex(tabPremMultNb1)
      const reponseB = decompoEnLatex(tabPremMultNb2)

      switch (typesDeQuestions) {
        case 1: // décomposition de A
          texte =
            numAlpha(0) +
            ` Décomposer $A = ${texNombre(nb1)}$ en produit de facteurs premiers.`
          texteCorr =
            numAlpha(0) +
            ' La décomposition en produit de facteurs premier de $A = '
          texteCorr += `${miseEnEvidence(reponseA)}$.`
          // break;
          // case 2 : // décomposition de B
          texte +=
            '<br>' +
            numAlpha(1) +
            ` Décomposer $B = ${texNombre(nb2)}$ en produit de facteurs premiers.`
          texteCorr +=
            '<br>' +
            numAlpha(1) +
            ' La décomposition en produit de facteurs premier de $B = '
          texteCorr += `${miseEnEvidence(reponseB)}$.`
          // break;
          // case 3 : // reduction de A sur B
          texte +=
            '<br>' +
            numAlpha(2) +
            ` Rendre la fraction $\\dfrac{A}{B} = \\dfrac{${texNombre(nb1)}}{${texNombre(nb2)}}$ irréductible `
          if (context.isHtml) {
            texte +=
              " à l'aide des décompositions obtenues au " +
              numAlpha(0) +
              'et au ' +
              numAlpha(1, true) +
              '.'
          } else {
            texte +=
              " à l'aide des questions " +
              numAlpha(0) +
              'et ' +
              numAlpha(1, true) +
              '.'
          }
          texteCorr +=
            '<br>' +
            numAlpha(2) +
            ` $\\dfrac{A}{B} = \\dfrac{${texNombre(nb1)}}{${texNombre(nb2)}} = `
          texteCorr += '\\dfrac{'
          texteCorr +=
            '\\cancel{' +
            decompositionFacteursPremiersArray(nb1 / nb1Dist)[0] +
            '}'
          for (
            let k = 1;
            k < decompositionFacteursPremiersArray(nb1 / nb1Dist).length;
            k++
          ) {
            texteCorr +=
              '\\times \\cancel{' +
              decompositionFacteursPremiersArray(nb1 / nb1Dist)[k] +
              '}'
          }
          texteCorr += `\\times ${nb1Dist}}{`
          texteCorr +=
            '\\cancel{' +
            decompositionFacteursPremiersArray(nb1 / nb1Dist)[0] +
            '}'
          for (
            let k = 1;
            k < decompositionFacteursPremiersArray(nb1 / nb1Dist).length;
            k++
          ) {
            texteCorr +=
              '\\times \\cancel{' +
              decompositionFacteursPremiersArray(nb1 / nb1Dist)[k] +
              '}'
          }
          texteCorr += `\\times ${nb2Dist}} = `
          texteCorr += `${miseEnEvidence(`\\dfrac{${nb1Dist}}{${nb2Dist}}`)}$`
          // break;
          // case 4 : // reduction de B sur A
          texte +=
            '<br>' +
            numAlpha(3) +
            ` Rendre la fraction $\\dfrac{B}{A} = \\dfrac{${texNombre(nb2)}}{${texNombre(nb1)}}$ irréductible`
          if (context.isHtml) {
            texte +=
              " à l'aide des décompositions obtenues au " +
              numAlpha(0) +
              'et au ' +
              numAlpha(1, true) +
              '.'
          } else {
            texte +=
              " à l'aide des questions " +
              numAlpha(0) +
              'et ' +
              numAlpha(1, true) +
              '.'
          }
          texteCorr +=
            '<br>' +
            numAlpha(3) +
            ` $\\dfrac{B}{A}$ est l'inverse de $\\dfrac{A}{B}$ donc $\\dfrac{B}{A} = \\dfrac{${texNombre(nb2)}}{${texNombre(nb1)}} = `
          texteCorr += '\\dfrac{'
          texteCorr +=
            '\\cancel{' +
            decompositionFacteursPremiersArray(nb1 / nb1Dist)[0] +
            '}'
          for (
            let k = 1;
            k < decompositionFacteursPremiersArray(nb1 / nb1Dist).length;
            k++
          ) {
            texteCorr +=
              '\\times \\cancel{' +
              decompositionFacteursPremiersArray(nb1 / nb1Dist)[k] +
              '}'
          }
          texteCorr += `\\times ${nb2Dist}}{`
          texteCorr +=
            '\\cancel{' +
            decompositionFacteursPremiersArray(nb1 / nb1Dist)[0] +
            '}'
          for (
            let k = 1;
            k < decompositionFacteursPremiersArray(nb1 / nb1Dist).length;
            k++
          ) {
            texteCorr +=
              '\\times \\cancel{' +
              decompositionFacteursPremiersArray(nb1 / nb1Dist)[k] +
              '}'
          }
          texteCorr += `\\times ${nb1Dist}} = `
          texteCorr += `${miseEnEvidence(`\\dfrac{${nb2Dist}}{${nb1Dist}}`)}$.`
          if (context.isHtml) texteCorr += '<hr>'
          else texteCorr += '\\par \\hrulefill \\par'
          texteCorr += ` On peut judicieusement remarquer que $\\dfrac{B}{A}$ est l'inverse de $\\dfrac{A}{B}$
          donc que rendre la fraction $\\dfrac{B}{A}$ irréductible revient à inverser la fraction irréductible
          obtenue pour $\\dfrac{A}{B}$ au ${numAlpha(2, true)}.`
          if (context.isHtml) texteCorr += '<hr>'
          else texteCorr += '\\par \\hrulefill \\par'
          // break;
          // case 5 : // calculer le produit A/B x B/A et réduire. Remarque?
          // texte += `<br>`+numAlpha(4)+` Combien alculer le produit de $\\dfrac{A}{B} = \\dfrac{${texNombre(nb1)}}{${texNombre(nb2)}}$ et de $\\dfrac{B}{A} = \\dfrac{${texNombre(nb2)}}{${texNombre(nb1)}}$.`;
          // texte += `<br>Donner le résultat sous forme de fraction irréductible.`
          // texte += `<br>`+numAlpha(4)+` Remarque ?`
          // texteCorr += `<br>`+numAlpha(4)+' corr type 5';
          break
      }

      if (this.interactif) {
        const clavier =
          KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets
        const aide = ` à l'aide des décompositions obtenues au ${numAlpha(0)}et au ${numAlpha(1, true)}.`
        // Tout l'énoncé est porté par le multi-mathfield : une seule numérotation.
        texte = addMultiMathfield(this, i, {
          dataTemplate:
            `${numAlpha(0)} Décomposer $A = ${texNombre(nb1)}$ en produit de facteurs premiers.<br>` +
            `$A =$ %{field0}<br>` +
            `${numAlpha(1)} Décomposer $B = ${texNombre(nb2)}$ en produit de facteurs premiers.<br>` +
            `$B =$ %{field1}<br>` +
            `${numAlpha(2)} Rendre la fraction $\\dfrac{A}{B} = \\dfrac{${texNombre(nb1)}}{${texNombre(nb2)}}$ irréductible${aide}<br>` +
            `$\\dfrac{A}{B} =$ %{field2}<br>` +
            `${numAlpha(3)} Rendre la fraction $\\dfrac{B}{A} = \\dfrac{${texNombre(nb2)}}{${texNombre(nb1)}}$ irréductible${aide}<br>` +
            `$\\dfrac{B}{A} =$ %{field3}`,
          dataOptions: {
            field0: { keyboard: clavier },
            field1: { keyboard: clavier },
            field2: { keyboard: clavier },
            field3: { keyboard: clavier },
          },
        })
        handleAnswers(
          this,
          i,
          {
            field0: { value: reponseA },
            field1: { value: reponseB },
            field2: {
              value: `\\dfrac{${nb1Dist}}{${nb2Dist}}`,
              options: { fractionIrreductible: true },
            },
            field3: {
              value: `\\dfrac{${nb2Dist}}{${nb1Dist}}`,
              options: { fractionIrreductible: true },
            },
          },
          { formatInteractif: 'multi-mathfield' },
        )
      }

      if (this.questionJamaisPosee(i, typesDeQuestions, nb1, nb2)) {
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
