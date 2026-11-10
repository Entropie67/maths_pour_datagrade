import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Découvrir la notion et le vocabulaire des fonctions'

/**
 * 3F1-act - Notion de fonction - vocabulaire
 * L'objectif de revenir sur l'introduction de la notion de fonction et son vocabulaire
 * On base l'exercice sur des calculs simples de type périmètres, aires, double, triple, nombre de diviseurs
 * ATTENTION BUG SVG DONC LES ANIMATIONS SONT FILMEES A PARTIR DE CELLES GENEREES PAR LA FONCTION SVG_machine_maths() SOUS FIREFOX
 * DE FACON A AVOIR UN RENDU UNIFORME QUEL QUE SOIT LE NAVIGATEUR ON REND LES ANIMATIONS PAR DES VIDEOS
 * ON LAISSE LA PIROUETTE DE DETECTION DU USERAGENT EN COMMENTAIRE EN ATTENDANT DE TROUVER UNE SOLUTION DE RENDU LATEX DANS SVG UNIVERSELLE
 * @author Sébastien Lozano
 */
export const uuid = '77d18'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * Crée un popup html avec un icon info, éventuellement avec du contenu LaTeX
 * @param {string} texte
 * @param {string} titrePopup
 * @param {string} textePopup
 */
/*export function katexPopup(
  texte: string,
  titrePopup: string,
  textePopup: string,
) {
  // ToDo afficher les dialog au survol sur le texte
  let contenu = ''
  if (context.isHtml) {
    // contenu = '<i class="info circle icon"></i> ' + texte
    contenu = texte
    contenu += '<dialog>'
    if (titrePopup !== '') {
      contenu += '<div class="header">' + titrePopup + '</div>'
    }
    contenu += '<div>' + textePopup + '</div>'
    contenu += '</dialog>'
    return contenu
  } else {
    return `\\textbf{${texte}} \\footnote{\\textbf{${titrePopup}} ${textePopup}}`
  }
}
*/
export default class FonctionNotionVocabulaire extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de fonction',
      5,
      "1 : Périmètre d'un carré\n2 : Aire d'un carré\n3 : Somme de 1 et du triple du nombre de départ\n4 : Nombre de diviseurs d'un entier positif\n5 : Les quatre",
    ]

    this.sup = 1

    // pas de différence entre la version html et la version latex pour la consigne
    this.consigne = 'Étudier différents procédés de calcul.'
    this.spacing = context.isHtml ? 3 : 1
    this.spacingCorr = context.isHtml ? 2 : 1
    this.nbQuestions = 1 // seul le message d'indisponibilité est affiché
    this.nbQuestionsModifiable = false
    // pas de réponse : seul le message d'indisponibilité est affiché
    this.reponseCourteDisponible = false
    // this.correctionDetailleeDisponible = true;

    this.sup = 5
  }

  nouvelleVersion(numeroExercice: number) {
    this.listeQuestions[0] =
      "Cet exercice n'a pas pu être conservé pour des raisons techniques. Vous trouverez dans la section 3F1 ne nombreux exercices de calcul d'image"

    /*     const numEx = '3F1-act' // pour rendre unique les id des SVG, en cas d'utilisation dans plusieurs exercices y faisant appel

    let typesDeQuestions
    let j, idDuDivDiag, idDuDivCorr

    let typesDeQuestionsDisponibles: number[] = []
    this.sup = Number(this.sup) // attention le formulaire renvoie un string, on a besoin d'un number pour le switch !
    switch (this.sup) {
      case 1:
        typesDeQuestionsDisponibles = [1]
        this.nbQuestions = 1
        break
      case 2:
        typesDeQuestionsDisponibles = [2]
        this.nbQuestions = 1
        break
      case 3:
        typesDeQuestionsDisponibles = [3]
        this.nbQuestions = 1
        break
      case 4:
        typesDeQuestionsDisponibles = [4]
        this.nbQuestions = 1
        break
      case 5:
        typesDeQuestionsDisponibles = [1, 2, 3, 4]
        this.nbQuestions = 4
        break
    }

    // let typesDeQuestionsDisponibles = [1];
    const listeTypeDeQuestions = combinaisonListesSansChangerOrdre(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    this.introduction =
      (!context.isHtml ? '\\definecolor{nombres}{RGB}{241, 89, 41}' : '') +
      lampeMessage({
        titre: 'Introduction',
        texte: `Lorsqu'un nombre $\\textit{x}$ entre dans une machine mathématique, celle-ci renvoie à la sortie un nombre appelé $\\textit{image de x}$.<br>
On dit que le nombre de départ est un $\\textit{antécédent}$ du nombre qu'on trouve à la sortie.<br>
Ces machines sont appelées $\\textit{fonctions}$, on a l'habitude de leur donner des noms $\\textit{f}$ ou $\\textit{g}$ ou $\\textit{h} \\ldots$
<br>`,
        couleur: 'nombres',
      })

    if (context.isHtml) {
      // les boutons d'aide uniquement pour la version html
    } else {
      // sortie LaTeX
      this.introduction += tikzMachineMaths(
        'maths',
        '---',
        'Proc\\acute{e}d\\acute{e}',
        'de\\,calcul',
        'ant\\acute{e}c\\acute{e}dent',
        '\\textit{x}',
        'image',
        '\\textit{y}',
      )
    }

    for (
      let i = 0, x, y, z, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      typesDeQuestions = listeTypeDeQuestions[i]
      idDuDivDiag = ''
      idDuDivCorr = ''
      texte = ''
      texteCorr = ''
      x = 0
      y = 0
      z = 0
      if (context.isHtml) {
        const idUnique = `${numEx}_${i}_${Date.now()}`
        idDuDivDiag = `div_svg_diag${numeroExercice}${idUnique}`
        idDuDivCorr = `div_svg_corr${numeroExercice}${idUnique}`
      }
      let txtInfo

      switch (typesDeQuestions) {
        case 1: // périmètre d'un carré de côté x
          j = 0 // pour la sous-numérotation

          // question
          if (context.isHtml) {
            texte =
              'La $\\mathbf{machine\\,f}$ renvoie le ' +
              katexPopup(
                'périmètre',
                'Rappel',
                "Le périmètre d'un polygone est égal à la somme des longueurs de ses côtés.",
              ) +
              " d'un carré de côté $x$."
          } else {
            texte =
              "La $\\mathbf{machine\\,f}$ renvoie le \\textbf{périmètre} \\footnote{\\textbf{Rappel :} Le périmètre d'un polygone est égal à la somme des longueurs de ses côtés} d'un carré de côté $x$."
          }
          texte += '<br>'
          // machine
          x = randint(2, 99) // augmenter les possibles pour éviter les questions déjà posées?
          if (context.isHtml) {
            texte += machineMathsVideo('videos/machineMaths-f.mp4')
          } else {
            // sortie Latex avec Tikz
            texte += tikzMachineMaths(
              'f',
              '---',
              'P\\acute{e}rim\\grave{e}tre',
              "d'un\\,carr\\acute{e}",
              'carr\\acute{e}\\,de',
              `c\\hat{o}t\\acute{e}\\,${x}\\,cm`,
              'P\\acute{e}rim\\grave{e}tre',
              '???\\,cm',
            )
          }

          // sous question a/
          if (context.isHtml) {
            texte +=
              numAlpha(j) +
              ` Que renvoie la machine si le côté vaut  $${x}\\text{ cm}$ ? Formuler la réponse `
            texte +=
              katexPopup(
                'avec le mot image',
                'Image',
                "La valeur du périmètre est l'image de la valeur du côté.",
              ) + '<br>'
            texteCorr =
              numAlpha(j) +
              ` Si le côté vaut $${x}\\text{ cm}$ alors la machine renvoie le périmètre d'un carré de côté $${x}\\text{ cm}$, c'est-à-dire $${x}+${x}+${x}+${x} = 4\\times ${x} = ${4 * x}\\text{ cm}$.<br>`
            texteCorr += `On dit que ${4 * x} est l'image de ${x} par la fonction $f$.<br>`
            j++ // incrémente la sous question
          } else {
            // sortie LaTeX
            texte += '\\begin{enumerate}[itemsep=1em]'
            texte += `\\item Que renvoie la machine si le côté vaut  $${x}\\text{ cm}$ ? Formuler la réponse avec le mot \\textbf{image} \\footnote{\\textbf{Image :} La valeur du périmètre est l'image de la valeur du côté}`
            texteCorr = '\\begin{enumerate}[itemsep=1em]'
            texteCorr += `\\item Si le côté vaut $${x}\\text{ cm}$ alors la machine renvoie le périmètre d'un carré de côté $${x}\\text{ cm}$, c'est-à-dire $${x}+${x}+${x}+${x} = 4\\times ${x} = ${4 * x}\\text{ cm}$.<br>`
            texteCorr += `On dit que ${4 * x} est l'image de ${x} par la fonction $f$.`
          }

          // sous question b/
          y = randint(2, 99, [x]) // augmenter les possibles pour éviter les questions déjà posées?
          if (context.isHtml) {
            texte +=
              numAlpha(j) +
              ` Combien vaut le côté si la machine renvoie  $${4 * y}\\text{ cm}$ ? Formuler la réponse `
            texte +=
              katexPopup(
                'avec le mot antécédent.',
                'Antécédent',
                "un antécédent de la valeur d'un périmètre est une valeur du côté qui a pour image ce périmètre",
              ) + '<br>'
            texteCorr +=
              numAlpha(j) +
              ` Si la machine renvoie un périmètre de $${4 * y}\\text{ cm}$ alors le côté du carré vaut $${4 * y}\\div 4 = ${y}\\text{ cm}$.<br>`
            texteCorr += `On dit que ${y} est <b>un</b> antécédent de ${4 * y} par la fonction $f$.<br>`
            j++ // incrémente la sous question
          } else {
            // sortie LaTeX
            texte += `\\item Combien vaut le côté si la machine renvoie  $${4 * y}\\text{ cm}$ ? Formuler la réponse avec le mot \\textbf{antécédent} \\footnote{\\textbf{Antécédent :} Un antécédent de la valeur d'un périmètre est une valeur du côté qui a pour image ce périmètre}`
            texteCorr += `\\item Si la machine renvoie un périmètre de $${4 * y}\\text{ cm}$ alors le côté du carré vaut $${4 * y}\\div 4 = ${y}\\text{ cm}$.<br>`
            texteCorr += `On dit que ${y} est \\textbf{un} antécédent de ${4 * y} par la fonction $f$.`
          }

          // sous question c/
          z = randint(2, 99, [x, y]) // augmenter les possibles pour éviter les questions déjà posées?
          if (context.isHtml) {
            texte += numAlpha(j) + ` Quelle est l'image de ${z} par la `
            texte += katexPopup(
              'fonction',
              'Vocabulaire',
              "<b>fonction</b> est le nom que l'on donne à ces machines mathématiques.",
            )
            texte += ' $\\mathbf{f}$ ? &Eacute;crire la réponse sous la forme '
            texte +=
              katexPopup(
                '$\\mathbf{f(' + z + ')=\\ldots}$',
                'Notation',
                "4 a pour image 16 par la fonction $f$ peut s'écrire <b>$f(4)=16$</b>",
              ) + '<br>'
            texteCorr +=
              numAlpha(j) +
              ` L'image de ${z} par la fonction $f$ vaut $f(${z})=4\\times ${z}=${4 * z}$.<br>`
            j++ // incrémente la sous question
          } else {
            // sortie LaTeX
            texte += `\\item Quelle est l'image de ${z} par la \\textbf{fonction f} \\footnote{\\textbf{Vocabulaire :} \\textit{fonction} est le nom que l'on donne à ces machines mathématiques}`
            texte += ` ? \\'{E}crire la réponse sous la forme $\\mathbf{f(${z})=\\ldots}$ \\footnote{\\textbf{Notation :} 4 a pour image 16 par la fonction $f$ peut s'écrire $\\mathbf{f(4)=16}$}`
            texteCorr += `\\item L'image de ${z} par la fonction $f$ vaut $f(${z})=4\\times ${z}=${4 * z}$.`
          }

          // sous question d/
          if (context.isHtml) {
            texte +=
              numAlpha(j) +
              ' Que renvoie la machine si le côté vaut $x\\text{ cm}$ ?'
            texte += ' &Eacute;crire la réponse sous la forme '
            texte +=
              katexPopup(
                '$\\mathbf{f(\\textbf{\\textit{x}})=\\ldots}$',
                'Notation',
                "4 a pour image 16 par la fonction $f$ peut s'écrire <b>$f(4)=16$</b>",
              ) + '<br>'
            texteCorr +=
              numAlpha(j) +
              ' Si le côté vaut $x$ la machine renvoie $x+x+x+x$ ce qui est équivalent à $4\\times x$ .<br>'
            texteCorr +=
              " L'image de $x$ par la fonction $f$ vaut $4\\times x$ donc $f(x)=4\\times x$.<br>"
            j++ // incrémente la sous question
          } else {
            // sortie LaTeX
            texte +=
              '\\item   Que renvoie la machine si le côté vaut $x\\text{ cm}$ ?'
            texteCorr +=
              '\\item  Si le côté vaut $x$ la machine renvoie $x+x+x+x$ ce qui est équivalent à $4\\times x$ .'
            texte +=
              " \\'{E}crire la réponse sous la forme $\\mathbf{f(\\textbf{\\textit{x}})=\\ldots}$ \\footnote{\\textbf{Notation :} 4 a pour image 16 par la fonction $f$ peut s'écrire $\\mathbf{f(4)=16}$}"
            texteCorr +=
              " L'image de $x$ par la fonction $f$ vaut $4\\times x$ donc $f(x)=4\\times x$."
          }

          // sous question e/
          txtInfo = "Voici le diagramme d'une machine qui triple "
          if (context.isHtml) {
            texte +=
              numAlpha(j) +
              " Comme dans l'exemple ci-dessous, écrire le diagramme de la fonction $\\mathbf{f}$.<br>"
            txtInfo += `<div id="${idDuDivDiag}" style="width: 100%; display: table;"> ${SvgMachineDiag3F1ActMono(idDuDivDiag, 600, 100, 't', 'x', [['3', '3x']])}</div>`
            texteCorr +=
              numAlpha(j) +
              " C'est une machine qui quadruple, donc sous forme de diagramme.<br>"
            texteCorr += `<div id="${idDuDivCorr}" style="width: 100%; display: table; ">${SvgMachineDiag3F1ActMono(idDuDivCorr, 600, 100, 'f', 'x', [['4', '4x']])}</div>`
            j++ // incrémente la sous question
          } else {
            // sortie LaTeX
            texte +=
              "\\item   Comme dans l'exemple ci-dessous, écrire le diagramme de la fonction $\\mathbf{f}$.<br>"
            txtInfo += '<br>' + tikzMachineDiag('t', 'x', [['\\times 3', '3x']])
            texteCorr +=
              "\\item  C'est une machine qui quadruple, donc sous forme de diagramme.<br>"
            texteCorr += tikzMachineDiag('f', 'x', [['\\times 4', '4x']])
          }

          if (context.isHtml) {
            // affichage tronqué avec width:66% par défaut
            // il faudrait mieux avoir une option dans infomessage pour le style
            const fonctionTriple = infoMessage({
              titre: 'Exemple',
              texte: txtInfo,
              couleur: 'nombres',
            })
            const pos = fonctionTriple.indexOf('">') + 1
            texte +=
              fonctionTriple.substring(0, pos) +
              " style='width:100%'" +
              fonctionTriple.substring(pos)
          } else {
            texte +=
              '\\setbox0\\box\\csname@mpfootins\\endcsname ' +
              infoMessage({
                titre: 'Exemple',
                texte: txtInfo,
                couleur: 'nombres',
              }) +
              '\\global\\setbox\\csname@mpfootins\\endcsname\\box0 '
          }

          // sous question f/
          if (context.isHtml) {
            texte +=
              numAlpha(j) +
              ' Écrire maintenant la fonction $f$ en utilisant la forme  '
            texte += katexPopup(
              '$\\mathbf{f:\\textbf{\\textit{x}}\\longmapsto \\ldots}$',
              'Notation',
              "4 a pour image 16 par la fonction $f$ peut s'écrire $\\mathbf{f:4\\longmapsto 16}$",
            )
            texteCorr +=
              numAlpha(j) +
              " L'image de $x$ par la fonction $f$ vaut $4\\times x$ donc $f:x\\longmapsto 4\\times x$.<br>"
            j++ // incrémente la sous question
          } else {
            // sortie LaTeX
            texte +=
              "\\item   Écrire maintenant la fonction $f$ en utilisant la forme $\\mathbf{f:\\textbf{\\textit{x}}\\longmapsto \\ldots}$ \\footnote{\\textbf{Notation :} 4 a pour image 16 par la fonction $f$ peut s'écrire $\\mathbf{f:4\\longmapsto 16}$},"
            // texte += ` écrire la réponse à la question d/`;
            texteCorr +=
              "\\item  L'image de $x$ par la fonction $f$ vaut $4\\times x$ donc $f:x\\longmapsto 4\\times x$."
            texte += '\\end{enumerate}'
            texteCorr += '\\end{enumerate}'
          }

          break
        case 2: // aire d'un carré de côté x
          j = 0 // pour la sous-numérotation
          if (context.isHtml) {
            texte =
              'La $\\textbf{machine\\,g}$ renvoie ' +
              katexPopup(
                "l'aire",
                'Rappel',
                "L'aire d'un carré est égale au produit de la longueur de son côté par lui-même.",
              ) +
              " d'un carré de côté $x$"
          } else {
            texte =
              "La $\\textbf{machine\\,g}$ renvoie \\textbf{l'aire} \\footnote{\\textbf{Rappel :} L'aire d'un carré est égale au produit de la longueur de son côté par lui-même.} d'un carré de côté $x$."
          }
          texte += '<br>'
          // machine
          x = randint(2, 99) // augmenter les possibles pour éviter les questions déjà posées?
          if (context.isHtml) {
            texte += machineMathsVideo('videos/machineMaths-g.mp4')
          } else {
            // sortie Latex avec Tikz
            texte += tikzMachineMaths(
              'g',
              '---',
              'Aire',
              "d'un\\,carr\\acute{e}",
              'carr\\acute{e}\\,de',
              `c\\hat{o}t\\acute{e}\\,${x}\\,cm`,
              'Aire',
              '???\\text{ cm}^2',
            )
          }

          // sous question a/
          if (context.isHtml) {
            texte +=
              numAlpha(j) +
              ` Que renvoie la machine si le côté vaut  $${x}\\text{ cm}$ ? Formuler la réponse `
            texte +=
              katexPopup(
                'avec le mot image.',
                'Image',
                "la valeur de l'aire est l'image de la valeur du côté",
              ) + '<br>'
            texteCorr =
              numAlpha(j) +
              ` Si le côté vaut $${x}\\text{ cm}$ alors la machine renvoie l'aire d'un carré de côté $${x}\\text{ cm}$, c'est-à-dire $${x}\\times ${x}=${texNombre(x * x)}\\text{ cm}^2$.<br>`
            texteCorr += `On dit que $${texNombre(x * x)}$ est l'image de $${x}$ par la fonction $g$.<br>`
            j++ // incrémente la sous question
          } else {
            // sortie LaTeX
            texte += '\\begin{enumerate}[itemsep=1em]'
            texte += `\\item  Que renvoie la machine si le côté vaut $${x}\\text{ cm}$ ? Formuler la réponse `
            texte +=
              "avec le mot \\textbf{image} \\footnote{\\textbf{Image :} La valeur de l'aire est l'image de la valeur du côté.}"
            texteCorr = '\\begin{enumerate}[itemsep=1em]'
            texteCorr += `\\item Si le côté vaut $${x}\\text{ cm}$ alors la machine renvoie l'aire d'un carré de côté $${x}\\text{ cm}$, c'est-à-dire $${x}\\times ${x}=${texNombre(x * x)}\\text{ cm}^2$.<br>`
            texteCorr += `On dit que $${texNombre(x * x)}$ est l'image de ${x} par la fonction $g$.`
          }

          // sous question b/
          y = randint(2, 99, [x]) // augmenter les possibles pour éviter les questions déjà posées?
          if (context.isHtml) {
            texte +=
              numAlpha(j) +
              ` Combien vaut le côté si la machine renvoie  $${texNombre(y * y)}\\text{ cm}^2$ ? Formuler la réponse `
            texte +=
              katexPopup(
                'avec le mot antécédent.',
                'Antécédent',
                "un antécédent de la valeur d'une aire est une valeur du côté qui a pour image cette aire",
              ) + '<br>'
            texteCorr +=
              numAlpha(j) +
              ` Si la machine renvoie une aire de $${texNombre(y * y)}\\text{ cm}^2$ alors le côté du carré vaut $\\sqrt{${texNombre(y * y)}}=${y}\\text{ cm}$.<br>`
            texteCorr += `On dit que ${y} est <b>un</b> antécédent de ${y * y} par la fonction $g$.<br>`
            j++ // incrémente la sous question
          } else {
            // sortie LaTeX
            texte += `\\item  Combien vaut la longueur du côté si la machine renvoie  $${texNombre(y * y)}\\text{ cm}^2$ ? Formuler la réponse `
            texte +=
              "avec le mot \\textbf{antécédent} \\footnote{\\textbf{Antécédent :} Un antécédent de la valeur d'une aire est une valeur du côté qui a pour image cette aire}"
            texteCorr += `\\item Si la machine renvoie une aire de $${texNombre(y * y)}\\text{ cm}^2$ alors le côté du carré vaut $\\sqrt{${texNombre(y * y)}}=${y}\\text{ cm}$.<br>`
            texteCorr += `On dit que ${y} est \\textbf{un} antécédent de $${texNombre(y * y)}$ par la fonction $g$.`
          }

          // sous question c/
          z = randint(2, 99, [x, y]) // augmenter les possibles pour éviter les questions déjà posées?
          if (context.isHtml) {
            texte += numAlpha(j) + ` Quelle est l'image de ${z} par la `
            texte += katexPopup(
              'fonction',
              'Vocabulaire',
              "<b>fonction</b> est le nom que l'on donne à ces machines mathématiques",
            )
            texte += ' $g$ ? &Eacute;crire la réponse sous la forme '
            texte +=
              katexPopup(
                '$\\mathbf{g(' + z + ')=\\ldots}$',
                'Notation',
                "4 a pour image 16 par la fonction $g$ peut s'écrire <b>g(4)=16</b>",
              ) + '<br>'
            texteCorr +=
              numAlpha(j) +
              ` L'image de ${z} par la fonction $g$ vaut $g(${z})=${z}\\times ${z}=${texNombre(z * z)}$.<br>`
            j++ // incrémente la sous question
          } else {
            // sortie LaTeX
            texte += `\\item  Quelle est l'image de ${z} par la `
            texte +=
              "\\textbf{fonction $g$} \\footnote{\\textbf{Vocabulaire :} \\textit{fonction} est le nom que l'on donne à ces machines mathématiques.}"
            texte += " ? \\'{E}crire la réponse sous la forme "
            texte += `$\\mathbf{g(${z})=\\ldots}$ \\footnote{\\textbf{Notation :} 4 a pour image 16 par la fonction $g$ peut s'écrire \\textbf{g(4)=16}}`
            texteCorr += `\\item L'image de ${z} par la fonction $g$ vaut $g(${z})=${z}\\times ${z}=${texNombre(z * z)}$.`
          }

          // sous question d/
          if (context.isHtml) {
            texte +=
              numAlpha(j) +
              ' Que renvoie la machine si le côté vaut $x\\text{ cm}$ ?'
            texte += ' &Eacute;crire la réponse sous la forme '
            texte +=
              katexPopup(
                '$\\mathbf{g(\\textbf{\\textit{x}})=\\ldots}$',
                'Notation',
                "4 a pour image 16 par la fonction $g$ peut s'écrire <b>g(4)=16</b>",
              ) + '<br>'
            texteCorr +=
              numAlpha(j) +
              ' Si le côté vaut $x$ la machine renvoie $x\\times x$ ce qui est équivalent à $x^2$ .<br>'
            texteCorr +=
              " L'image de $x$ par la fonction $g$ vaut $x^2$ donc $g(x)=x^2$.<br>"
            j++ // incrémente la sous question
          } else {
            texte +=
              '\\item  Que renvoie la machine si le côté vaut $x\\text{ cm}$ ?'
            texteCorr +=
              '\\item Si le côté vaut $x$ la machine renvoie $x\\times x$ ce qui est équivalent à $x^2$ .'
            texte +=
              " \\'{E}crire la réponse sous la forme $\\mathbf{g(\\textbf{\\textit{x}})=\\ldots}$ \\footnote{\\textbf{Notation :} 4 a pour image 16 par la fonction $g$ peut s'écrire $\\mathbf{g(4)=16}$}"
            texteCorr +=
              " L'image de $x$ par la fonction $g$ vaut $x^2$ donc $g(x)=x^2$."
          }

          // sous question e/
          txtInfo = "Voici le diagramme d'une machine qui double "
          if (context.isHtml) {
            texte +=
              numAlpha(j) +
              " Comme dans l'exemple ci-dessous, écrire le diagramme de la fonction $\\mathbf{g}$.<br>"
            txtInfo += `<div id="${idDuDivDiag}" style="width: 100%; display: table; ">${SvgMachineDiag3F1ActMono(idDuDivDiag, 600, 100, 'g', 'x', [['2', '2x']])}</div>`
            texteCorr +=
              numAlpha(j) +
              " C'est une machine qui multiplie un nombre par lui-même, donc sous forme de diagramme.<br>"
            texteCorr += `<div id="${idDuDivCorr}" style="width: 100%; display: table; ">${SvgMachineDiag3F1ActMono(idDuDivCorr, 600, 100, 'g', 'x', [['x', 'x²']])}</div>`
            j++ // incrémente la sous question
          } else {
            texte +=
              "\\item  Comme dans l'exemple ci-dessous, écrire le diagramme de la fonction $\\mathbf{g}$.<br>"
            txtInfo += '<br>' + tikzMachineDiag('g', 'x', [['\\times 2', '2x']])
            texteCorr +=
              "\\item C'est une machine qui multiplie un nombre par lui-même, donc sous forme de diagramme.<br>"
            texteCorr += tikzMachineDiag('g', 'x', [['\\times x', 'x^2']])
          }

          if (context.isHtml) {
            // affichage tronqué avec width:66% par défaut
            // il faudrait mieux avoir une option dans infomessage pour le style
            const fonctionDouble = infoMessage({
              titre: 'Exemple',
              texte: txtInfo,
              couleur: 'nombres',
            })
            const pos = fonctionDouble.indexOf('">') + 1
            texte +=
              fonctionDouble.substring(0, pos) +
              " style='width:100%'" +
              fonctionDouble.substring(pos)
          } else {
            texte +=
              '\\setbox0\\box\\csname@mpfootins\\endcsname ' +
              infoMessage({
                titre: 'Exemple',
                texte: txtInfo,
                couleur: 'nombres',
              }) +
              '\\global\\setbox\\csname@mpfootins\\endcsname\\box0 '
          }

          // sous question f/
          if (context.isHtml) {
            texte +=
              numAlpha(j) +
              ' Écrire maintenant la fonction $g$ en utilisant la forme '
            texte += katexPopup(
              '$\\mathbf{g:\\textbf{\\textit{x}} \\longmapsto \\ldots}$',
              'Notation',
              "4 a pour image 16 par la fonction $g$ peut s'écrire $\\mathbf{g:4\\longmapsto 16}$",
            )
            texteCorr +=
              numAlpha(j) +
              " L'image de $x$ par la fonction $g$ vaut $x\\times x=x^2$ donc $g:x\\longmapsto x\\times x=x^2$.<br>"
            j++ // incrémente la sous question
          } else {
            // sortie LaTeX
            texte +=
              '\\item  Écrire maintenant la fonction $g$ en utilisant la forme '
            texte +=
              "$\\mathbf{g:\\textbf{\\textit{x}} \\longmapsto \\ldots}$ \\footnote{\\textbf{Notation :} 4 a pour image 16 par la fonction $g$ peut s'écrire $\\mathbf{g:4\\longmapsto 16}$'}"
            texteCorr +=
              "\\item L'image de $x$ par la fonction $g$ vaut $x\\times x=x^2$ donc $g:x\\longmapsto x\\times x=x^2$."
            texte += '\\end{enumerate}'
            texteCorr += '\\end{enumerate}'
          }

          break
        case 3: // somme de 1 et du triple de x
          j = 0 // pour la sous-numérotation
          texte +=
            'La $\\mathbf{machine\\,h}$ renvoie la somme du triple du nombre de départ et de 1.'
          texte += '<br>'
          // machine
          x = randint(2, 99) // augmenter les possibles pour éviter les questions déjà posées?
          if (context.isHtml) {
            texte += machineMathsVideo('videos/machineMaths-h.mp4')
          } else {
            // sortie Latex avec Tikz
            texte += tikzMachineMaths(
              'h',
              '---',
              'Multiplier\\,par\\,3',
              'Ajouter\\,1',
              'nombre\\,de',
              `d\\acute{e}part\\,${x}`,
              'nombre\\,de',
              'sortie\\,?',
            )
          }

          // sous question a/
          if (context.isHtml) {
            texte +=
              numAlpha(j) +
              ` Que renvoie la machine si le nombre de départ vaut  ${x} ? Formuler la réponse `
            texte +=
              katexPopup(
                'avec le mot image',
                'Image',
                "l'image de la valeur à la sortie de la machine",
              ) + '<br>'
            texteCorr =
              numAlpha(j) +
              ` Si le nombre de départ vaut ${x} alors la machine renvoie $3\\times${x} + 1 = ${3 * x + 1}$<br>`
            texteCorr += `On dit que ${3 * x + 1} est l'image de ${x} par la fonction $g$.<br>`
            j++ // incrémente la sous question
          } else {
            // sortie LaTeX
            texte += '\\begin{enumerate}[itemsep=1em]'
            texte += `\\item  Que renvoie la machine si le nombre de départ vaut  ${x} ? Formuler la réponse `
            texte +=
              "avec le mot \\textbf{image} \\footnote{\\textbf{Image :} L'image de la valeur à la sortie de la machine.}"
            texteCorr = '\\begin{enumerate}[itemsep=1em]'
            texteCorr += `\\item Si le nombre de départ vaut ${x} alors la machine renvoie $3\\times${x} + 1 = ${3 * x + 1}$<br>`
            texteCorr += `On dit que ${3 * x + 1} est l'image de ${x} par la fonction $g$.`
          }

          // sous question b/
          y = randint(2, 99, [x]) // augmenter les possibles pour éviter les questions déjà posées?
          if (context.isHtml) {
            texte +=
              numAlpha(j) +
              ` Combien vaut le nombre de départ si la machine renvoie  ${3 * y + 1} ? Formuler la réponse `
            texte +=
              katexPopup(
                'avec le mot antécédent',
                'Antécédent',
                "un antécédent d'une valeur de sortie est une valeur du nombre de départ dont l'image est ce nombre de sortie",
              ) + '<br>'
            texteCorr +=
              numAlpha(j) +
              ` Si la machine renvoie $${3 * y + 1}$ alors le nombre de départ vaut $(${3 * y + 1}-1)\\div 3=${y}$<br>`
            texteCorr += `On dit que ${y} est <b>un</b> antécédent de ${3 * y + 1} par la fonction $g$.<br>`
            j++ // incrémente la sous question
          } else {
            // sortie LaTeX
            texte += `\\item  Combien vaut le nombre de départ si la machine renvoie  ${3 * y + 1} ? Formuler la réponse `
            texte +=
              "avec le mot \\textbf{antécédent} \\footnote{\\textbf{Antécédent :} Un antécédent d'une valeur de sortie est une valeur du nombre de départ dont l'image est ce nombre de sortie.}"
            texteCorr += `\\item Si la machine renvoie $${3 * y + 1}$ alors le nombre de départ vaut $(${3 * y + 1}-1)\\div 3=${y}$<br>`
            texteCorr += `On dit que ${y} est \\textbf{un} antécédent de ${3 * y + 1} par la fonction $g$.`
          }

          // sous question c/
          z = randint(2, 99, [x, y]) // augmenter les possibles pour éviter les questions déjà posées?
          if (context.isHtml) {
            texte += numAlpha(j) + ` Quelle est l'image de ${-z} par la `
            texte += katexPopup(
              'fonction',
              'Vocabulaire',
              "<b>fonction</b> est le nom que l'on donne à ces machines mathématiques",
            )
            texte += ' $h$ ? &Eacute;crire la réponse sous la forme '
            texte +=
              katexPopup(
                '$\\mathbf{h(' + -z + ')=\\ldots}$',
                'Notation',
                "4 a pour image 16 par la fonction h peut s'écrire <b>h(4)=16</b>",
              ) + '<br>'
            texteCorr +=
              numAlpha(j) +
              ` L'image de ${-z} par la fonction h vaut $h(${-z})=3\\times (${-z})+1=${-3 * z + 1}$.<br>`
            j++ // incrémente la sous question
          } else {
            // sortie LaTeX
            texte += `\\item  Quelle est l'image de ${-z} par la `
            texte +=
              "\\textbf{fonction h} \\footnote{\\textbf{Vocabulaire :} \\textit{fonction} est le nom que l'on donne à ces machines mathématiques}"
            texte += " ? \\'{E}crire la réponse sous la forme "
            texte += `$\\mathbf{h(${-z})=\\ldots}$ \\footnote{\\textbf{Notation : } 4 a pour image 16 par la fonction h peut s'écrire \\textbf{h(4)=16}}`
            texteCorr += `\\item L'image de ${-z} par la fonction h vaut $h(${-z})=3\\times (${-z})+1=${-3 * z + 1}$.`
          }

          // sous question d/
          if (context.isHtml) {
            texte +=
              numAlpha(j) + ' Que renvoie la machine si le côté vaut $x$ ?'
            texte += ' &Eacute;crire la réponse sous la forme '
            texte +=
              katexPopup(
                '$\\mathbf{h(\\textbf{\\textit{x}})=\\ldots}$',
                'Notation',
                "4 a pour image 16 par la fonction h peut s'écrire <b>h(4)=16</b>",
              ) + '<br>'
            texteCorr +=
              numAlpha(j) +
              ' Si le côté vaut $x$ la machine renvoie $3\\times x + 1$ ce qui est équivalent à $3x + 1$ .<br>'
            texteCorr +=
              " L'image de $x$ par la fonction h vaut $3\\times x + 1$ donc $f(x)=3\\times x + 1$.<br>"
            j++ // incrémente la sous question
          } else {
            // sortie LaTeX
            texte += '\\item  Que renvoie la machine si le côté vaut $x$ ?'
            texteCorr +=
              '\\item Si le côté vaut $x$ la machine renvoie $3\\times x + 1$ ce qui est équivalent à $3x + 1$ .'
            texte +=
              " \\'{E}crire la réponse sous la forme $\\mathbf{h(\\textbf{\\textit{x}})=\\ldots}$ \\footnote{\\textbf{Notation :} 4 a pour image 16 par la fonction h peut s'écrire $\\mathbf{h(4)=16}$}"
            texteCorr +=
              " L'image de $x$ par la fonction h vaut $3x + 1$ donc $h(x)=3x+1$."

            j++ // incrémente la sous question
          }

          // sous question e/
          txtInfo =
            "Voici le diagramme d'une machine qui double puis qui ajoute 5 "
          if (context.isHtml) {
            texte +=
              numAlpha(j) +
              " Comme dans l'exemple ci-dessous, écrire le diagramme de la fonction $\\mathbf{h}$.<br>"
            txtInfo += `<div id="${idDuDivDiag}" style="width: 100%; display: table;">${SvgMachineDiag3F12(
              idDuDivDiag,
              600,
              100,
              'h',
              'x',
              [
                ['2', '2x'],
                ['5', '2x+5'],
              ],
            )}</div>`
            texteCorr +=
              numAlpha(j) +
              " C'est une machine qui triple un nombre et ajoute 1, donc sous forme de diagramme.<br>"
            texteCorr += `<div id="${idDuDivCorr}" style="width: 100%; display: table;">${SvgMachineDiag3F12(
              idDuDivCorr,
              600,
              100,
              'h',
              'x',
              [
                ['3', '3x'],
                ['1', '3x+1'],
              ],
            )}</div>`
            j++ // incrémente la sous question
          } else {
            texte +=
              "\\item  Comme dans l'exemple ci-dessous, écrire le diagramme de la fonction $\\mathbf{h}$.<br>"
            txtInfo +=
              '<br>' +
              tikzMachineDiag('h', 'x', [
                ['\\times 2', '2x'],
                ['+5', '2x+5'],
              ])
            texteCorr +=
              "\\item C'est une machine qui triple un nombre et ajoute 1, donc sous forme de diagramme.<br>"
            texteCorr += tikzMachineDiag('h', 'x', [
              ['\\times 3', '3x'],
              ['+1', '3x+1'],
            ])
          }

          if (context.isHtml) {
            // affichage tronqué avec width:66% par défaut
            // il faudrait mieux avoir une option dans infomessage pour le style
            const fonctionDouble = infoMessage({
              titre: 'Exemple',
              texte: txtInfo,
              couleur: 'nombres',
            })
            const pos = fonctionDouble.indexOf('">') + 1
            texte +=
              fonctionDouble.substring(0, pos) +
              " style='width:100%'" +
              fonctionDouble.substring(pos)
          } else {
            texte +=
              '\\setbox0\\box\\csname@mpfootins\\endcsname ' +
              infoMessage({
                titre: 'Exemple',
                texte: txtInfo,
                couleur: 'nombres',
              }) +
              '\\global\\setbox\\csname@mpfootins\\endcsname\\box0 '
          }

          // sous question f/
          if (context.isHtml) {
            texte +=
              numAlpha(j) +
              ' Écrire maintenant la fonction h en utilisant la forme '
            texte += katexPopup(
              '$\\mathbf{h:\\textbf{\\textit{x}} \\longmapsto \\ldots}$',
              'Notation',
              "4 a pour image 16 par la fonction h peut s'écrire $\\mathbf{h:4\\longmapsto16}$",
            )
            texteCorr +=
              numAlpha(j) +
              " L'image de $x$ par la fonction h vaut $3\\times x +1= 3x + 1$ donc $h : x \\longmapsto 3\\times x + 1$ soit $h : x \\longmapsto 3x + 1$.<br>"
            j++ // incrémente la sous question
          } else {
            // sortie LaTeX
            texte +=
              '\\item  Écrire maintenant la fonction h en utilisant la forme '
            texte +=
              "$\\mathbf{h:\\textbf{\\textit{x}} \\longmapsto \\ldots}$ \\footnote{\\textbf{Notation :} 4 a pour image 16 par la fonction h peut s'écrire $\\mathbf{h:4\\longmapsto16}$}"
            texteCorr +=
              "\\item L'image de $x$ par la fonction h vaut $3\\times x +1= 3x + 1$ donc $h : x \\longmapsto 3\\times x + 1$ soit $h : x \\longmapsto 3x + 1$."
            texte += '\\end{enumerate}'
            texteCorr += '\\end{enumerate}'
          }

          break
        case 4: // nombre de diviseurs de x entier
          j = 0 // pour la sous-numérotation
          texte +=
            "La $\\mathbf{machine\\,d}$, qui n'accepte que des nombres entiers positifs, renvoie le nombre de diviseurs du nombre de départ."
          texte += '<br>'
          // machine
          x = randint(2, 51) // augmenter les possibles pour éviter les questions déjà posées?
          if (context.isHtml) {
            texte += machineMathsVideo('videos/machineMaths-d.mp4')
          } else {
            // sortie Latex avec Tikz
            texte += tikzMachineMaths(
              'd',
              '---',
              'nombre \\, total',
              'de \\, diviseurs',
              'nombre\\,de',
              `d\\acute{e}part\\,${x}`,
              'nombre \\, de',
              'diviseurs',
            )
          }

          // sous question a/
          if (context.isHtml) {
            texte +=
              numAlpha(j) +
              ` Que renvoie la machine si le nombre de départ vaut  ${x} ? Formuler la réponse `
            texte +=
              katexPopup(
                'avec le mot image',
                'Image',
                "l'image de la valeur à la sortie de la machine",
              ) + '<br>'
            texteCorr =
              numAlpha(j) +
              ` Pour trouver la liste des diviseurs de ${x} on cherche tous les produits de deux facteurs qui donnent ${x}<br>`
            j++ // incrémente la sous question
          } else {
            // sortie LaTeX
            texte += '\\begin{enumerate}[itemsep=1em]'
            texte += `\\item Que renvoie la machine si le nombre de départ vaut  ${x} ? Formuler la réponse `
            texte +=
              "avec le mot \\textbf{image} \\footnote{\\textbf{Image : } L'image de la valeur à la sortie de la machine}"
            texteCorr = '\\begin{enumerate}[itemsep=1em]'
            texteCorr += `\\item Pour trouver la liste des diviseurs de ${x} on cherche tous les produits de deux facteurs qui donnent ${x}<br>`
          }

          if (listeDesDiviseurs(x).length % 2 === 0) {
            // si il y a un nombre pair de diviseurs
            for (let m = 0; m < listeDesDiviseurs(x).length / 2; m++) {
              texteCorr +=
                '$' +
                listeDesDiviseurs(x)[m] +
                '\\times' +
                listeDesDiviseurs(x)[listeDesDiviseurs(x).length - m - 1] +
                '$<br>'
            }
          } else {
            for (let m = 0; m < (listeDesDiviseurs(x).length - 1) / 2; m++) {
              texteCorr +=
                '$' +
                listeDesDiviseurs(x)[m] +
                '\\times' +
                listeDesDiviseurs(x)[listeDesDiviseurs(x).length - m - 1] +
                '$<br>'
            }

            texteCorr +=
              '$' +
              listeDesDiviseurs(x)[(listeDesDiviseurs(x).length - 1) / 2] +
              '\\times' +
              listeDesDiviseurs(x)[(listeDesDiviseurs(x).length - 1) / 2] +
              '$<br>'
          }

          texteCorr += `Chacun des facteurs de la liste ci-dessus est un diviseur de ${x}<br>`
          texteCorr +=
            `La liste des diviseurs de ${x} est donc ` +
            listeDesDiviseurs(x) +
            '; Cette liste compte ' +
            listeDesDiviseurs(x).length +
            ' nombres. <br>'
          texteCorr +=
            'Donc ' +
            listeDesDiviseurs(x).length +
            ` est l'image de ${x} par la fonction d.`
          if (context.isHtml) {
            texteCorr += '<br>'
          }

          // sous question b/
          x = randint(1, 9) // augmenter les possibles pour éviter les questions déjà posées?
          if (context.isHtml) {
            // texte += numAlpha(j) + ` Quelle est une valeur possible du nombre de départ si la machine renvoie  2 ?<br>`;
            texte +=
              numAlpha(j) +
              ' Quelle est une valeur possible du nombre de départ si la machine renvoie  2 ? En existe-t-il plusieurs ?<br>'
            texteCorr +=
              numAlpha(j) +
              ' Si la machine renvoie 2 alors le nombre de départ  a exactement 2 diviseurs, tous les'
            texteCorr += katexPopup(
              'nombres premiers',
              'Nombre premier',
              'Un nombre entier est un <b>nombre premier</b> si il a exactement deux diviseurs, 1 et lui-même.',
            )
            texteCorr += 'conviennent.<br>'
            texteCorr +=
              '2 est premier donc 2 est <b>un</b> antécédent de 2 par la fonction d.<br>'
            texteCorr +=
              '7 est premier donc 7 est <b>un autre</b> antécédent de 2 par la fonction d.<br>'
            j++ // incrémente la sous question
          } else {
            // texte += `\\item Quelle est une valeur possible du nombre de départ si la machine renvoie  2 ?`;
            texte +=
              '\\item Quelle est une valeur possible du nombre de départ si la machine renvoie  2 ? En existe-til plusieurs ?'
            texteCorr +=
              ' \\item Si la machine renvoie 2 alors le nombre de départ  a exactement 2 diviseurs, tous les'
            texteCorr +=
              '\\textbf{nombres premiers} \\footnote{\\textbf{Nombre premier :} Un nombre entier est un \\textbf{nombre premier} si il a exactement deux diviseurs, 1 et lui-même.}'
            texteCorr += 'conviennent.<br>'
            texteCorr +=
              '2 est premier donc 2 est \\textbf{un} antécédent de 2 par la fonction d.<br>'
            texteCorr +=
              '7 est premier donc 7 est \\textbf{un autre} antécédent de 2 par la fonction d.'
          }

          // sous question c/
          x = randint(51, 99) // augmenter les possibles pour éviter les questions déjà posées?
          if (context.isHtml) {
            texte += numAlpha(j) + ` Quelle est l'image de ${x} par la `
            texte += katexPopup(
              'fonction',
              'Vocabulaire',
              "<b>fonction</b> est le nom que l'on donne à ces machines mathématiques",
            )
            texte += ' $d$ ? &Eacute;crire la réponse sous la forme '
            texte +=
              katexPopup(
                '$\\mathbf{d(' + x + ')=\\ldots}$',
                'Notation',
                "4 a pour image 16 par la fonction d peut s'écrire <b>d(4)=16</b>",
              ) + '<br>'
            texteCorr +=
              numAlpha(j) +
              ` Pour trouver l'image de ${x} on peut par exemple chercher tous ses diviseurs et les compter<br>`
            j++ // incrémente la sous question
          } else {
            // sortie LaTeX
            texte += `\\item Quelle est l'image de ${x} par la `
            texte +=
              "\\textbf{fonction d} \\footnote{\\textbf{Vocabulaire :} \\textit{fonction} est le nom que l'on donne à ces machines mathématiques.}"
            texte += " ? \\'{E}crire la réponse sous la forme "
            texte +=
              '$\\mathbf{d(' +
              x +
              ")=\\ldots}$ \\footnote{\\textbf{Notation :} 4 a pour image 16 par la fonction d peut s'écrire \\textbf{d(4)=16}}"
            texteCorr += `\\item Pour trouver l'image de ${x} on peut par exemple chercher tous ses diviseurs et les compter<br>`
          }

          if (listeDesDiviseurs(x).length % 2 === 0) {
            // si il y a un nombre pair de diviseurs
            for (let m = 0; m < listeDesDiviseurs(x).length / 2; m++) {
              texteCorr +=
                '$' +
                listeDesDiviseurs(x)[m] +
                '\\times' +
                listeDesDiviseurs(x)[listeDesDiviseurs(x).length - m - 1] +
                '$<br>'
            }
          } else {
            for (let m = 0; m < (listeDesDiviseurs(x).length - 1) / 2; m++) {
              texteCorr +=
                '$' +
                listeDesDiviseurs(x)[m] +
                '\\times' +
                listeDesDiviseurs(x)[listeDesDiviseurs(x).length - m - 1] +
                '$<br>'
            }

            texteCorr +=
              '$' +
              listeDesDiviseurs(x)[(listeDesDiviseurs(x).length - 1) / 2] +
              '\\times' +
              listeDesDiviseurs(x)[(listeDesDiviseurs(x).length - 1) / 2] +
              '$<br>'
          }

          texteCorr += `La liste des diviseurs de ${x} est donc `
          texteCorr += listeDesDiviseurs(x)[0]
          for (let k = 1; k < listeDesDiviseurs(x).length; k++) {
            texteCorr += ' ; ' + listeDesDiviseurs(x)[k]
          }

          texteCorr +=
            ' ; Cette liste compte ' +
            listeDesDiviseurs(x).length +
            ' nombres.<br> '
          texteCorr +=
            'Donc ' +
            listeDesDiviseurs(x).length +
            ` est l'image de ${x} par la fonction d.`
          if (context.isHtml) {
            texteCorr += '<br>'
          }

          // sous question d/
          if (context.isHtml) {
            // texte += numAlpha(j) + ` Peut-on trouver deux antécédents de 3 par la fonction d ?<br>`;
            texte +=
              numAlpha(j) +
              " Peut-on trouver plusieurs antécédents de 3 par la fonction d ? Qu'ont-ils de commun ?<br>"
            texteCorr +=
              numAlpha(j) +
              ' Il faut trouver des nombres qui ont exactement 3 diviseurs.<br>'
            j++ // incrémente la sous question
          } else {
            // texte += `\\item  Peut-on trouver deux antécédents de 3 par la fonction d ?`;
            texte +=
              "\\item  Peut-on trouver plusieurs antécédents de 3 par la fonction d ? Qu'ont-ils de commun ?"
            texteCorr +=
              '\\item Il faut trouver des nombres qui ont exactement 3 diviseurs.<br>'
          }
          texteCorr += 'La liste des diviseurs de 9 est '
          texteCorr += listeDesDiviseurs(9)[0]
          for (let k = 1; k < listeDesDiviseurs(9).length; k++) {
            texteCorr += ' ; ' + listeDesDiviseurs(9)[k]
          }

          texteCorr +=
            ' ; Cette liste compte ' +
            listeDesDiviseurs(9).length +
            ' nombres, '
          texteCorr += 'donc 9 est un antécédent de 3 par la fonction d.<br>'
          texteCorr += 'La liste des diviseurs de 25 est '
          texteCorr += listeDesDiviseurs(25)[0]
          for (let k = 1; k < listeDesDiviseurs(25).length; k++) {
            texteCorr += ' ; ' + listeDesDiviseurs(25)[k]
          }

          texteCorr +=
            ' ; Cette liste compte ' +
            listeDesDiviseurs(25).length +
            ' nombres, '
          texteCorr += 'donc 25 est un antécédent de 3 par la fonction d.<br>'
          texteCorr += "Il en existe d'autres, qu'ont ils de commun ?"
          if (!context.isHtml) {
            texte += '\\end{enumerate}'
            texteCorr += '\\end{enumerate}'
          }

          break
      }

      if (this.questionJamaisPosee(i, typesDeQuestions, x, y, z)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
      */
    listeQuestionsToContenu(this)
  }
}
