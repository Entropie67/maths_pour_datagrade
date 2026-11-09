import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  rienSi0,
  rienSi1,
} from '../../lib/outils/ecritures'
import {
  texteEnCouleurEtGras,
  texteGras,
  texteItalique,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Déterminer la position relative de deux droites'

export const dateDePublication = '28/06/2025' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

export const uuid = '36144'
export const refs = {
  'fr-fr': ['TSG2-33'],
  'fr-ch': ['3G98-3'],
}

/**
 * @author Stéphane Guyon
 */

export default class NomExercice extends Exercice {
  constructor() {
    super()
    this.consigne = `${texteItalique("Préciser si l'affirmation suivante est vraie ou fausse, puis justifier la réponse donnée.")}<br>${texteItalique('Une réponse non argumentée ne sera pas prise en compte.')}<br>Dans un repère orthonormé de l'espace, on considère les représentations paramétriques des droites $(d)$ et $(d~')$.`
    this.nbQuestions = 1 // Nombre de questions à générer
    this.correctionDetaillee = false
    this.correctionDetailleeDisponible = true
    this.besoinFormulaireCaseACocher = [
      'Sujet original : Métropole Juin 2025 - J1',
      true,
    ]
    this.sup = false
  }

  nouvelleVersion() {
    const typeQuestionsDisponibles = [
      'secantes',
      'paralleles',
      'nonCoplanaires',
    ] // Liste des types de questions disponibles

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let xA = randint(-10, 10, 0) // abscisse du point A
      let yA = randint(-10, 10, 0) // ordonnée du point A
      let zA = randint(-10, 10, 0) // cote du point A
      // On choisit un vecteur directeur u de la droite (d)
      let ux = randint(-10, 10, 0) // composante x du vecteur directeur u
      let uy = randint(-10, 10, [yA, 0]) // composante y du vecteur directeur u
      let uz = randint(-10, 10, [zA, 0]) // composante z du vecteur directeur u
      // On choisit un vecteur directeur v de la droite (d')
      let xB = 0 // abscisse du point B
      let yB = 0 // ordonnée du point B
      let zB = 0
      let vx = 0 // composante x du vecteur directeur v
      let vy = 0 // composante y du vecteur directeur v
      let vz = 0 // composante z du vecteur directeur v

      let lambda = 0 // coefficient de colinéarité en cas de parallélisme
      const alpha = randint(-3, 3, 0) // Pour éviter les droites parallèles
      const beta = randint(-3, 3, 0) // Pour éviter les droites parallèles
      const affirmation = this.sup
        ? "Les droites $(d)$ et $(d~')$ sont non coplanaires."
        : choice([
            "Les droites $(d)$ et $(d~')$ sont parallèles.",
            "Les droites $(d)$ et $(d~')$ sont sécantes.",
            "Les droites $(d)$ et $(d~')$ sont non coplanaires.",
          ]) // On choisit une affirmation aléatoire parmi les trois possibles

      if (listeTypeQuestions[i] === 'paralleles') {
        lambda = randint(-4, 4, [0, 1, -1]) // Pour éviter les droites parallèles
        vx = lambda * ux // On choisit un vecteur directeur v de la droite (d') parallèle à u
        vy = lambda * uy // On choisit un vecteur directeur v de la droite (d') parallèle à u
        vz = lambda * uz // On choisit un vecteur directeur v de la droite (d') parallèle à u
        // On s'assure que le point B n'est pas confondu avec le point A
        xB = randint(-10, 10, [xA, 0]) // abscisse du point B
        yB = randint(-10, 10, [yA, 0]) // ordonnée du point B
        zB = randint(-10, 10, [zA, 0]) // ordonnée du point B
      }
      if (listeTypeQuestions[i] === 'secantes') {
        vx = randint(-10, 10, [ux, xA, 0])
        vy = randint(-10, 10, [uy, yA, 0])
        vz = randint(-10, 10, [uz, zA, 0])
        if (vx / ux === vy / uy && vy / uy === vz / uz) {
          vz = vz + 1
        } // On s'assure que les droites ne sont pas parallèles
        // vecteur AB = (xB-xA, yB-yA, zB-zA) ne soit pas coplanaire avec u et v
        xB = alpha * ux + beta * vx + xA //  xB pour que vect AB colinéaire avec u et v
        yB = alpha * uy + beta * vy + yA //  yB pour que vect AB colinéaire avec u et v
        zB = alpha * uz + beta * vz + zA //  zB pour que vect AB colinéaire avec u et v
      }
      if (listeTypeQuestions[i] === 'nonCoplanaires') {
        vx = randint(-10, 10, [ux, xA, 0])
        vy = randint(-10, 10, [uy, yA, 0])
        vz = randint(-10, 10, [uz, zA, 0])
        if (vx / ux === vy / uy && vy / uy === vz / uz) {
          vz = vz + 1
        } // On s'assure que les droites ne sont pas parallèles
        // vecteur AB = (xB-xA, yB-yA, zB-zA) ne soit pas coplanaire avec u et v
        xB = alpha * ux + beta * vx + xA // Choisir xB pour que AB non coplanaire avec u et v
        yB = alpha * uy + beta * vy + yA // Choisir yB pour que AB non coplanaire avec u et v
        zB = alpha * uz + beta * vz + zA - 1 // Choisir zB pour que AB non coplanaires avec u et v
      }
      if (this.sup === true) {
        xA = 15
        yA = 8
        zA = -6
        ux = 1
        uy = -1
        uz = 2
        xB = 1
        yB = 2
        zB = 1
        vx = 4
        vy = 4
        vz = -6
        listeTypeQuestions[i] = 'secantes'
      }
      // Pré-calculs numériques pour éviter divisions par zéro ou resultat2 == 0
      let num1 = ux * (yB - yA) - uy * (xB - xA)
      let den1 = uy * vx - ux * vy
      let num2 = ux * (zB - zA) - uz * (xB - xA)
      let den2 = uz * vx - ux * vz

      // Pour les cas non-parallèles, tenter une régénération partielle de (vx,vy,vz)
      if (listeTypeQuestions[i] !== 'paralleles') {
        // Régénération continue de vx,vy,vz jusqu'à obtenir des valeurs valides.
        // La sortie forcée est contrôlée uniquement par le compteur global `cpt`.
        while (den1 === 0 || den2 === 0 || num2 === 0) {
          // si on a tenté trop d'essais au total, on rejette ce tirage
          cpt++
          if (cpt >= 50) {
            break
          }
          // régénérer les composantes du vecteur directeur v
          vx = randint(-10, 10, [ux, xA, 0])
          vy = randint(-10, 10, [uy, yA, 0])
          vz = randint(-10, 10, [uz, zA, 0])
          if (vx / ux === vy / uy && vy / uy === vz / uz) {
            vz = vz + 1
          }
          // recalculer xB,yB,zB selon le type pour garder la construction souhaitée
          if (listeTypeQuestions[i] === 'secantes') {
            xB = alpha * ux + beta * vx + xA
            yB = alpha * uy + beta * vy + yA
            zB = alpha * uz + beta * vz + zA
          } else if (listeTypeQuestions[i] === 'nonCoplanaires') {
            xB = alpha * ux + beta * vx + xA
            yB = alpha * uy + beta * vy + yA
            zB = alpha * uz + beta * vz + zA - 1
          }
          // recomputer les numérateurs/dénominateurs
          num1 = ux * (yB - yA) - uy * (xB - xA)
          den1 = uy * vx - ux * vy
          num2 = ux * (zB - zA) - uz * (xB - xA)
          den2 = uz * vx - ux * vz
        }
        // si après avoir utilisé le budget global on n'a pas de solution sûre, rejeter le tirage entier
        if (den1 === 0 || den2 === 0 || num2 === 0) {
          continue
        }
      }

      const u1 = new FractionEtendue(vx, ux) // On crée les fractions étendues pour les vecteurs directeurs
      const u2 = new FractionEtendue(vy, uy) // On crée les fractions étendues pour les vecteurs directeurs
      const u3 = new FractionEtendue(vz, uz) // On crée les fractions étendues pour les vecteurs directeurs
      const u4 = new FractionEtendue(xB - xA, ux) // On crée les fractions étendues pour les vecteurs directeurs
      const u5 = new FractionEtendue(yB - yA, uy) // On crée les fractions étendues pour les vecteurs directeurs
      const u6 = new FractionEtendue(zB - zA, uz) // On crée les fractions étendues pour les vecteurs directeurs
      const resultat1 =
        den1 !== 0
          ? new FractionEtendue(num1, den1)
          : new FractionEtendue(num1, 1) // valeur factice si dénominateur nul (cas parallèle)
      const resultat2 =
        den2 !== 0
          ? new FractionEtendue(num2, den2)
          : new FractionEtendue(num2, 1) // valeur factice si dénominateur nul (cas parallèle)
      // Quotients utilisés uniquement dans les cas non parallèles.
      // On évite la création d'une fraction à dénominateur nul lorsque les droites sont parallèles.
      let quotient1: FractionEtendue
      let quotient2: FractionEtendue
      const bloc1 = ` <br>$\\begin{cases}
            ${reduireAxPlusB(ux, xA, 't', { ordreInverse: true })} = ${reduireAxPlusB(vx, xB, 's', { ordreInverse: true })} \\\\
            ${reduireAxPlusB(uy, yA, 't', { ordreInverse: true })} = ${reduireAxPlusB(vy, yB, 's', { ordreInverse: true })} \\\\
            ${reduireAxPlusB(uz, zA, 't', { ordreInverse: true })} = ${reduireAxPlusB(vz, zB, 's', { ordreInverse: true })}
            \\end{cases}
          \\quad \\iff \\begin{cases}
            ${rienSi1(ux)}t = ${rienSi1(vx)}s ${ecritureAlgebrique(xB - xA)} \\\\
            ${rienSi1(uy)}t = ${rienSi1(vy)}s ${ecritureAlgebrique(yB - yA)} \\\\
            ${rienSi1(uz)}t = ${rienSi1(vz)}s ${ecritureAlgebrique(zB - zA)}
            \\end{cases}
          \\quad\\iff\\begin{cases}
            t = ${rienSi1(u1.simplifie())}s ${u4.simplifie().ecritureAlgebrique} \\\\[7pt]
            t= ${rienSi1(u2.simplifie())}s ${u5.simplifie().ecritureAlgebrique} \\\\[7pt]
            t = ${rienSi1(u3.simplifie())}s ${u6.simplifie().ecritureAlgebrique}
            \\end{cases}$`
      const bloc2 = `On cherche si les coordonnées des vecteurs sont proportionnelles c'est à dire s'il existe un réel $\\lambda$ tel que $\\vec u=\\lambda \\vec v$.<br>
         $\\phantom{\\iff}\\vec u=\\lambda \\vec v$
          $\\quad\\iff \\begin{cases}${ux}= ${rienSi1(vx)}\\lambda\\\\${uy}= ${rienSi1(vy)}\\lambda\\\\${uz}=${rienSi1(vz)}\\lambda\\end{cases}$
          $\\quad\\iff \\begin{cases}\\lambda =${u1.inverse().texFractionSimplifiee}\\\\[7pt]\\lambda =${u2.inverse().texFractionSimplifiee}\\\\[7pt]
           \\lambda =${u3.inverse().texFractionSimplifiee}\\end{cases}$<br>`
      const t =
        (vx * (ux * (zB - zA) - uz * (xB - xA))) / (ux * (uz * vx - ux * vz)) +
        (xB - xA) / ux

      switch (listeTypeQuestions[i]) {
        //* ****************************************************************************
        // NON COPLANAIRES
        //* ****************************************************************************
        // */
        case 'nonCoplanaires': // Droites non-coplanaires
          quotient1 = new FractionEtendue(ux * uy, vx * uy - vy * ux)
          quotient2 = new FractionEtendue(ux * uz, vx * uz - vz * ux)
          texte += ` $(d):\\begin{cases}x=${reduireAxPlusB(ux, xA, 't', { ordreInverse: true })} \\\\y= ${rienSi0(yA)} ${ecritureAlgebriqueSauf1(uy)}t\\quad(t\\in\\mathbb{R})\\\\z= ${rienSi0(zA)} ${ecritureAlgebriqueSauf1(uz)}t\\end{cases}\\quad\\quad(d'):\\begin{cases}x=${rienSi0(xB)}${ecritureAlgebriqueSauf1(vx)}s\\\\y= ${rienSi0(yB)} ${ecritureAlgebriqueSauf1(vy)}s\\quad(s\\in\\mathbb{R})\\\\z= ${rienSi0(zB)} ${ecritureAlgebriqueSauf1(vz)}s\\end{cases}$`
          // On écrit les représentations paramétriques des droites (d) et (d')
          texte += `<br><br>${texteEnCouleurEtGras('Affirmation :')} ${affirmation}`

          texteCorr =
            texteEnCouleurEtGras('Étape $\\mathbf{1}$ : Droites parallèles ?') + '<br>'
          if (this.correctionDetaillee) {
            texteCorr +=
              "On sait que la représentation paramétrique d'une droite est de la forme "
            texteCorr +=
              '$(d):\\begin{cases}x=x_A+at \\\\y= y_A+bt\\quad(t\\in\\mathbb{R})\\\\z= z_A+ct\\end{cases}$<br>'
            texteCorr +=
              'où le point $A(x_A, y_A, z_A)$ est un point de la droite et $\\vec u\\begin{pmatrix}a\\\\b\\\\c\\end{pmatrix}$ est un vecteur directeur de la droite.<br>'
          }
          texteCorr += `On déduit de l'énoncé que le vecteur $\\vec u$ de coordonnées $\\vec u\\begin{pmatrix} ${ux}\\\\${uy}\\\\${uz}\\end{pmatrix}$ est un vecteur directeur de (d) `
          texteCorr += `et que $\\vec v$ de coordonnées $\\vec v\\begin{pmatrix} ${vx}\\\\${vy}\\\\${vz}\\end{pmatrix}$ est un vecteur directeur de (d'). <br>`
          // On teste la colinéarité des vecteurs directeurs
          texteCorr += bloc2
          texteCorr +=
            "<Le système n'admet pas de solutions donc les vecteurs ne sont donc pas colinéaires. <br>"
          texteCorr += `${texteGras("Les droites $(d)$ et $(d~')$ ne sont pas parallèles.")}<br>`
          // On teste si les droites sont sécantes ou non-coplanaires
          texteCorr += texteEnCouleurEtGras(
            'Étape $2$ : Droites sécantes ou non-coplanaires ?<br>',
          )
          texteCorr +=
            "Les droites $(d)$ et $(d')$ sont sécantes, si et seulement s'il existe un point d'intersection $M(x;y;z)$ tel que $M\\in(d)\\cap (d')$.<br>"
          texteCorr +=
            'Les coordonnées du point $M$ vérifient donc les deux représentations paramétriques. <br>Ce qui est équivalent à résoudre le système suivant :<br>'
          texteCorr += bloc1
          texteCorr += `En égalisant les lignes $1$ et $2$, et les lignes $1$ et $3$, cela ${texteGras('implique')} que $s$ doit vérifier le système :<br>`
          texteCorr += `$\\begin{cases}
            ${rienSi1(u1.simplifie())}s ${u4.simplifie().ecritureAlgebrique}=${rienSi1(u2.simplifie())}s ${u5.simplifie().ecritureAlgebrique} \\\\
            ${rienSi1(u1.simplifie())}s ${u4.simplifie().ecritureAlgebrique} = ${rienSi1(u3.simplifie())}s ${u6.simplifie().ecritureAlgebrique}
            \\end{cases}\\quad\\quad\\begin{cases}
            \\left(${u1.texFractionSimplifiee}${u2.oppose().simplifie().ecritureAlgebrique}\\right)s =${u5.texFractionSimplifiee}${u4.oppose().simplifie().ecritureAlgebrique} \\\\
            \\left(${u1.texFractionSimplifiee}${u3.oppose().simplifie().ecritureAlgebrique}\\right)s = ${u6.texFractionSimplifiee}${u4.oppose().simplifie().ecritureAlgebrique}
            \\end{cases}\\quad\\quad\\begin{cases}
            ${u1.differenceFraction(u2).simplifie().texFraction}s =${u5.differenceFraction(u4).simplifie().texFraction} \\\\
            ${u1.differenceFraction(u3).simplifie().texFraction}s = ${u6.differenceFraction(u4).simplifie().texFraction}
            \\end{cases}$`
          texteCorr += `<br><br>$\\begin{cases}
           s =${u5.differenceFraction(u4).simplifie().texFraction} \\times ${quotient1.simplifie().ecritureParentheseSiNegatif} \\\\
          s = ${u6.differenceFraction(u4).simplifie().texFraction} \\times ${quotient2.simplifie().ecritureParentheseSiNegatif} \\\\
            \\end{cases}\\quad\\quad\\begin{cases}
          s =${resultat1.simplifie().texFraction} \\\\
          s = ${resultat2.simplifie().texFraction}
            \\end{cases}$<br>`
          texteCorr +=
            "Les deux équations sont incompatibles donc le système n'admet pas de solution.<br>"
          texteCorr += texteEnCouleurEtGras('Conclusion :') + '<br>'
          texteCorr +=
            "Donc les droites $(d)$ et $(d')$ ont des vecteurs directeurs non colinéaires et ne sont pas sécantes, elles sont donc non-coplanaires.<br>"
          if (
            affirmation === "Les droites $(d)$ et $(d~')$ sont non coplanaires."
          ) {
            texteCorr += texteEnCouleurEtGras("L'affirmation est donc vraie.")
          } else {
            texteCorr += texteEnCouleurEtGras("L'affirmation est donc fausse.")
          }
          break
        //* ****************************************************************************
        // SECANTES
        //* ****************************************************************************
        // */
        case 'secantes': // Droites sécantes
          quotient1 = new FractionEtendue(ux * uy, vx * uy - vy * ux)
          quotient2 = new FractionEtendue(ux * uz, vx * uz - vz * ux)
          texte += `$(d):\\begin{cases}x=${reduireAxPlusB(ux, xA, 't', { ordreInverse: true })} \\\\y= ${rienSi0(yA)} ${ecritureAlgebriqueSauf1(uy)}t\\quad(t\\in\\mathbb{R})\\\\z= ${rienSi0(zA)} ${ecritureAlgebriqueSauf1(uz)}t\\end{cases}\\quad\\quad(d'):\\begin{cases}x=${rienSi0(xB)}${ecritureAlgebriqueSauf1(vx)}s\\\\y= ${rienSi0(yB)} ${ecritureAlgebriqueSauf1(vy)}s\\quad(s\\in\\mathbb{R})\\\\z= ${rienSi0(zB)} ${ecritureAlgebriqueSauf1(vz)}s\\end{cases}$<br><br>`
          // On écrit les représentations paramétriques des droites (d) et (d')
          texte += `${texteEnCouleurEtGras('Affirmation :')} ${affirmation}`

          texteCorr =
            texteEnCouleurEtGras('Étape $\\mathbf{1}$ : Droites parallèles ?') + '<br>'
          if (this.correctionDetaillee) {
            texteCorr +=
              "On sait que la représentation paramétrique d'une droite est de la forme "
            texteCorr +=
              '$(d):\\begin{cases}x=x_A+at \\\\y= y_A+bt\\quad(t\\in\\mathbb{R})\\\\z= z_A+ct\\end{cases}$<br>'
            texteCorr +=
              'où le point $A(x_A, y_A, z_A)$ est un point de la droite et $\\vec u\\begin{pmatrix}a\\\\b\\\\c\\end{pmatrix}$ est un vecteur directeur de la droite.<br>'
          }
          texteCorr += `On déduit de l'énoncé que le vecteur $\\vec u$ de coordonnées $\\vec u\\begin{pmatrix} ${ux}\\\\${uy}\\\\${uz}\\end{pmatrix}$ est un vecteur directeur de (d) `
          texteCorr += `et que $\\vec v$ de coordonnées $\\vec v\\begin{pmatrix} ${vx}\\\\${vy}\\\\${vz}\\end{pmatrix}$ est un vecteur directeur de (d'). <br>`
          // On teste la colinéarité des vecteurs directeurs
          texteCorr += bloc2
          texteCorr +=
            "Le système n'admet pas de solutions donc les vecteurs ne sont donc pas colinéaires. <br>"
          texteCorr += `${texteGras("Les droites $(d)$ et $(d~')$ ne sont pas parallèles.")}<br>`
          // On teste si les droites sont sécantes ou non-coplanaires
          texteCorr += texteEnCouleurEtGras(
            'Étape $2$ : Droites sécantes ou non-coplanaires ?<br>',
          )
          texteCorr +=
            'Un point M de coordonnées $M(x,y,z)$ appartient aux deux droites si, et seulement si, ses coordonnées vérifient les représentations paramétriques des deux droites.<br>'
          texteCorr +=
            'Ce qui est équivalent à résoudre le système suivant :<br>'
          texteCorr += bloc1
          texteCorr += `En égalisant les lignes $1$ et $2$, et les lignes $1$ et $3$, cela ${texteGras('implique')} que $s$ doit vérifier le système :<br>`
          texteCorr += `$\\begin{cases}
           ${rienSi1(u1.simplifie())}s ${u4.simplifie().ecritureAlgebrique}=${rienSi1(u2.simplifie())}s ${u5.simplifie().ecritureAlgebrique} \\\\
           ${rienSi1(u1.simplifie())}s ${u4.simplifie().ecritureAlgebrique} = ${rienSi1(u3.simplifie())}s ${u6.simplifie().ecritureAlgebrique}
            \\end{cases}\\quad\\quad\\begin{cases}
            \\left(${u1.texFractionSimplifiee}+${u2.oppose().ecritureParentheseSiNegatif}\\right)s =${u5.texFractionSimplifiee}${u4.oppose().simplifie().ecritureAlgebrique} \\\\
            \\left(${u1.texFractionSimplifiee}+${u3.oppose().ecritureParentheseSiNegatif}\\right)s = ${u6.texFractionSimplifiee}${u4.oppose().simplifie().ecritureAlgebrique}
            \\end{cases}\\quad\\quad\\begin{cases}
            ${u1.differenceFraction(u2).simplifie().texFraction}s =${u5.differenceFraction(u4).simplifie().texFraction} \\\\
            ${u1.differenceFraction(u3).simplifie().texFraction}s = ${u6.differenceFraction(u4).simplifie().texFraction}
            \\end{cases}$`
          texteCorr += `<br><br>$\\begin{cases}
           s =${u5.differenceFraction(u4).simplifie().texFraction} \\times ${quotient1.simplifie().ecritureParentheseSiNegatif} \\\\
          s = ${u6.differenceFraction(u4).simplifie().texFraction} \\times ${quotient2.simplifie().ecritureParentheseSiNegatif} \\\\
            \\end{cases}\\quad\\quad\\begin{cases}
          s =${resultat1.simplifie().texFraction} \\\\
          s = ${resultat2.simplifie().texFraction}
            \\end{cases}$<br>`
          texteCorr +=
            'En remplaçant la valeur de $s$ dans le sytème, on obtient :<br>'
          texteCorr += `$t =${u1.texFractionSimplifiee}\\times ${resultat2.simplifie().ecritureParentheseSiNegatif}${u4.simplifie().ecritureAlgebrique}~~$`
          texteCorr += `d'où $~~t =${texNombre(t)}$.<br>`

          texteCorr += `${texteGras('Réciproquement')}, on vérifie que pour $t=${texNombre(t)}~~$ et $~~s=${resultat2.simplifie().texFraction}$, les deux représentations donnent les coordonnées de leur point commun.<br>`
          texteCorr += `$(d):\\begin{cases}x=${ux}\\times ${ecritureParentheseSiNegatif(t)}${ecritureAlgebrique(xA)}\\\\[7pt] y=${uy}\\times ${ecritureParentheseSiNegatif(t)}${ecritureAlgebrique(yA)}\\\\[7pt] z=${uz}\\times ${ecritureParentheseSiNegatif(t)}${ecritureAlgebrique(zA)}\\end{cases}\\quad\\quad(d):\\begin{cases}x=${texNombre(ux * t + xA)}\\\\ y=${texNombre(uy * t + yA)}\\\\ z=${texNombre(uz * t + zA)}\\end{cases}$<br>`
          texteCorr += `$(d'):\\begin{cases}x=${vx}\\times ${ecritureParentheseSiNegatif(resultat2.simplifie())}${ecritureAlgebrique(xB)}\\\\[7pt] y=${vy}\\times ${resultat2.simplifie().ecritureParentheseSiNegatif}${ecritureAlgebrique(yB)}\\\\[7pt] z=${vz}\\times ${resultat2.simplifie().ecritureParentheseSiNegatif}${ecritureAlgebrique(zB)}\\end{cases}\\quad\\quad(d'):\\begin{cases}x=${texNombre(ux * t + xA)}\\\\ y=${texNombre(uy * t + yA)}\\\\ z=${texNombre(uz * t + zA)}\\end{cases}$<br>`
          texteCorr += `On a montré que les droites $(d)$ et $(d')$ étaient sécantes au point de coordonnées $(${texNombre(ux * t + xA)}; ${texNombre(uy * t + yA)};${texNombre(uz * t + zA)})$.<br>`

          texteCorr += texteEnCouleurEtGras('Conclusion :') + '<br>'
          texteCorr +=
            "Donc les droites $(d)$ et $(d')$ ont des vecteurs directeurs non colinéaires et un point en commun. Elles sont donc sécantes.<br>"
          if (affirmation === "Les droites $(d)$ et $(d~')$ sont sécantes.") {
            texteCorr += texteEnCouleurEtGras("L'affirmation est donc vraie.")
          } else {
            texteCorr += texteEnCouleurEtGras("L'affirmation est donc fausse.")
          }
          break
        //* ****************************************************************************
        // PARALLELES
        //* ****************************************************************************
        // */

        case 'paralleles': // Droites parallèles
          texte += `$(d):\\begin{cases}x=${reduireAxPlusB(ux, xA, 't', { ordreInverse: true })} \\\\y= ${rienSi0(yA)} ${ecritureAlgebriqueSauf1(uy)}t\\quad(t\\in\\mathbb{R})\\\\z= ${rienSi0(zA)} ${ecritureAlgebriqueSauf1(uz)}t\\end{cases}\\quad\\quad(d'):\\begin{cases}x=${rienSi0(xB)}${ecritureAlgebriqueSauf1(vx)}s\\\\y= ${rienSi0(yB)} ${ecritureAlgebriqueSauf1(vy)}s\\quad(s\\in\\mathbb{R})\\\\z= ${rienSi0(zB)} ${ecritureAlgebriqueSauf1(vz)}s\\end{cases}$<br><br>`
          // On écrit les représentations paramétriques des droites (d) et (d')
          texte += `${texteEnCouleurEtGras('Affirmation :')} ${affirmation}`

          texteCorr =
            texteEnCouleurEtGras('Étape $\\mathbf{1}$ : Droites parallèles ?') + '<br>'
          if (this.correctionDetaillee) {
            texteCorr +=
              "On sait que la représentation paramétrique d'une droite est de la forme "
            texteCorr +=
              '$(d):\\begin{cases}x=x_A+at \\\\y= y_A+bt\\quad(t\\in\\mathbb{R})\\\\z= z_A+ct\\end{cases}$<br>'
            texteCorr +=
              'où le point $A(x_A, y_A, z_A)$ est un point de la droite et $\\vec u\\begin{pmatrix}a\\\\b\\\\c\\end{pmatrix}$ est un vecteur directeur de la droite.<br>'
          }
          texteCorr += `On déduit de l'énoncé que le vecteur $\\vec u$ de coordonnées $\\vec u\\begin{pmatrix} ${ux}\\\\${uy}\\\\${uz}\\end{pmatrix}$ est un vecteur directeur de (d) `
          texteCorr += `et que $\\vec v$ de coordonnées $\\vec v\\begin{pmatrix} ${vx}\\\\${vy}\\\\${vz}\\end{pmatrix}$ est un vecteur directeur de (d'). <br>`
          // On teste la colinéarité des vecteurs directeurs
          texteCorr += bloc2
          texteCorr += `On peut conclure que $\\vec u = ${u3.inverse().texFractionSimplifiee} \\vec v$, les vecteurs sont alors colinéaires. <br>`
          texteCorr += `${texteGras("Les droites $(d)$ et $(d~')$ sont donc portées par des vecteurs de même direction.")}<br>`
          // On teste si les droites sont sécantes ou non-coplanaires
          texteCorr +=
            texteEnCouleurEtGras(
              'Étape $2$ : Droites parallèles ou confondues ?',
            ) + '<br>'
          texteCorr +=
            "Dans ces conditions, les droites $(d)$ et $(d')$ sont strictement parallèles, si et seulement si $(d)\\cap (d')=\\emptyset$.<br>"
          texteCorr +=
            'Un point M de coordonnées $M(x,y,z)$ appartient aux deux droites si, et seulement si, ses coordonnées vérifient les représentations paramétriques des deux droites.<br>'
          texteCorr +=
            'Ce qui est équivalent à résoudre le système suivant :<br>'
          texteCorr += bloc1
          texteCorr +=
            "Les équations sont incompatibles donc le système n'admet pas de solution.<br>"
          texteCorr += texteEnCouleurEtGras('Conclusion :') + '<br>'
          texteCorr +=
            "Donc les droites $(d)$ et $(d')$ sont portées par des vecteurs colinéaires et ne sont pas sécantes, elles sont donc strictement parallèles.<br>"
          if (affirmation === "Les droites $(d)$ et $(d~')$ sont parallèles.") {
            texteCorr += texteEnCouleurEtGras("L'affirmation est donc vraie.")
          } else {
            texteCorr += texteEnCouleurEtGras("L'affirmation est donc fausse.")
          }
          break
      }
      if (this.questionJamaisPosee(i, vx, vy, vz)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
