// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid b0bd2 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '18/01/2026'
export const uuid = 'b0bd2'
// @Author Gilles Mora
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Déterminer une expression littérale'
export default class auto1AC8aOld extends ExerciceQcmA {
  private appliquerLesValeurs(cas: number): void {
    let enonce = ''
    let explication = ''
    let reponses: string[] = []

    switch (cas) {
      case 1:
        // Cas original : x + 3x + x²
        enonce = `On additionne un nombre réel $x$, avec son triple et son carré. <br>Le résultat est égal à :`
        reponses = ['$4x + x^2$', '$(x + 3x)^2$', '$x + (3x)^2$', '$1 + 3x^2$']
        explication = `On additionne un nombre réel $x$, avec son triple $3x$ et son carré $x^2$.<br>
        On obtient : $x + 3x + x^2 = ${miseEnEvidence('4x + x^2')}$.`
        break

      case 2:
        // x + 2x + x² (double au lieu de triple)
        enonce = `On additionne un nombre réel $x$, avec son double et son carré. <br>Le résultat est égal à :`
        reponses = ['$3x + x^2$', '$(x + 2x)^2$', '$x + (2x)^2$', '$1 + 2x^2$']
        explication = `On additionne un nombre réel $x$, avec son double $2x$ et son carré $x^2$.<br>
        On obtient : $x + 2x + x^2 = ${miseEnEvidence('3x + x^2')}$.`
        break

      case 3:
        // (x + 3x)² est la bonne réponse
        enonce = `On additionne un nombre réel $x$ avec son triple, puis on élève le résultat au carré. <br>On obtient :`
        reponses = ['$(4x)^2$', '$x + (3x)^2$', '$4x + x^2$', '$4x^2$']
        explication = `On additionne d'abord $x$ avec son triple $3x$ : $x + 3x = 4x$.<br>
        Puis on élève le résultat au carré : $${miseEnEvidence('(4x)^2')}$.`
        break

      case 4:
        // x + (3x)² est la bonne réponse
        enonce = `On additionne un nombre réel $x$ avec le carré de son triple. <br>Le résultat est égal à :`
        reponses = ['$x + (3x)^2$', '$(x + 3x)^2$', '$4x + x^2$', '$x + 3x^2$']
        explication = `Le triple de $x$ est $3x$.<br>
        Le carré du triple est $(3x)^2 = 9x^2$.<br>
        On additionne $x$ avec ce carré : $${miseEnEvidence('x + (3x)^2 ')}$.`
        break

      case 5:
        // (x + 2x)² est la bonne réponse
        enonce = `On additionne un nombre réel $x$ avec son double, puis on élève le résultat au carré. <br>On obtient :`
        reponses = [
          '$(x + 2x)^2$',
          '$x + (2x)^2$',
          '$3x + x^2$',
          '$x^2 + 4x^2$',
        ]
        explication = `On additionne d'abord $x$ avec son double $2x$ : $x + 2x$.<br>
        Puis on élève le résultat au carré : $${miseEnEvidence('(x + 2x)^2')}$.`
        break

      case 6:
        // x + (2x)² est la bonne réponse
        enonce = `On additionne un nombre réel $x$ avec le carré de son double. <br>Le résultat est égal à :`
        reponses = [
          '$x + (2x)^2$',
          '$(x + 2x)^2$',
          '$3x + x^2$',
          '$x^2 + 2x^2$',
        ]
        explication = `Le double de $x$ est $2x$.<br>
        Le carré du double est $(2x)^2$.<br>
        On additionne $x$ avec ce carré : $${miseEnEvidence('x + (2x)^2')}$.`
        break

      case 7:
        // x² + 3x (inversion de l'ordre)
        enonce = `On additionne le carré d'un nombre réel $x$ avec son triple. <br>Le résultat est égal à :`
        reponses = ['$x^2 + 3x$', '$x^2 + (3x)^2$', '$(x^2 + 3)x$', '$4x^2$']
        explication = `Le carré de $x$ est $x^2$.<br>
  Le triple de $x$ est $3x$.<br>
  On additionne les deux : $${miseEnEvidence('x^2 + 3x')}$.`
        break

      case 8:
        // x × 3x + x²
        enonce = `On multiplie un nombre réel $x$ par son triple, puis on ajoute son carré. <br>Le résultat est égal à :`
        reponses = ['$3x^2 + x^2$', '$4x + x^2$', '$(x + 3x)^2$', '$x + 3x^2$']
        explication = `On multiplie $x$ par son triple $3x$ : $x \\times 3x = 3x^2$.<br>
  On ajoute le carré $x^2$ : $3x^2 + x^2 = ${miseEnEvidence('4x^2')}$.`
        break

      case 9:
        // 2x + x²
        enonce = `On additionne le double d'un nombre réel $x$ avec son carré. <br>Le résultat est égal à :`
        reponses = ['$2x + x^2$', '$(2x)^2$', '$2(x + x^2)$', '$3x^2$']
        explication = `Le double de $x$ est $2x$.<br>
  Le carré de $x$ est $x^2$.<br>
  On additionne les deux : $${miseEnEvidence('2x + x^2')}$.`
        break
    }

    this.reponses = reponses
    this.enonce = enonce
    this.correction = explication
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(1)
  }

  versionAleatoire: () => void = () => {
    const cas = choice([1, 2, 3, 4, 5, 6, 7, 8, 9])
    this.appliquerLesValeurs(cas)
  }

  constructor() {
    super()
  }
}
