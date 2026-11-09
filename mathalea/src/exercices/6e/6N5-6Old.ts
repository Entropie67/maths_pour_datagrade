import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha, sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Résoudre des problèmes (impliquant diverses opérations)'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const dateDePublication = '24/05/2025'

/**
 * Résoudre des problèmes
 * @author Mickael Guironnet
 * 6C12-6
 */
export const uuid = '72e9d'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': [],
}

export default class ProblèmesBalance extends Exercice {
  constructor() {
    super()
    this.consigne = 'On a réalisé deux pesées comme indiqué sur les schémas.'
    this.nbQuestions = 4

    this.sup = 1
    this.sup2 = 1
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      3,
      '1 : Soustraction et division\n2 :Multiplication, soustraction et division\n3 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Précision de la masse',
      4,
      "1 : à la dizaine\n2 :à l'unité\n3 : au dixième\n4 : Mélange",
    ]
  }

  nouvelleVersion() {
    const typesDeQuestions = gestionnaireFormulaireTexte({
      max: 2,
      defaut: 1,
      melange: 3,
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
    })
    const precisions = gestionnaireFormulaireTexte({
      max: 3,
      defaut: 1,
      melange: 4,
      nbQuestions: this.nbQuestions,
      saisie: this.sup2,
    })

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const n = precisions[i] as number
      const masseEtoile =
        randint(2, 5) * 10 +
        randint(1, 9) * (n >= 2 ? 1 : 0) +
        randint(1, 9) * 0.1 * (n >= 3 ? 1 : 0)
      const masseBoule =
        randint(2, 5, [Math.floor(masseEtoile / 10)]) * 10 +
        randint(1, 9) * (n >= 2 ? 1 : 0) +
        randint(1, 9) * 0.1 * (n >= 3 ? 1 : 0)

      const nombreEtoile = randint(2, 5)
      const nombreBoule = randint(2, 5, [nombreEtoile])

      switch (typesDeQuestions[i]) {
        case 1: {
          const mult =
            randint(0, 1) === 0 ? [randint(2, 4), 1] : [1, randint(2, 4)]
          const gauche = this.generateBalance(
            nombreBoule,
            nombreEtoile,
            masseBoule * nombreBoule + masseEtoile * nombreEtoile,
          )
          const droite = this.generateBalance(
            nombreBoule * mult[0],
            nombreEtoile * mult[1],
            masseBoule * nombreBoule * mult[0] +
              masseEtoile * nombreEtoile * mult[1],
          )
          const inverse = randint(0, 1)
          texte =
            (inverse === 0
              ? gauche + (!context.isHtml ? '<br>' : '') + droite
              : droite + (!context.isHtml ? '<br>' : '') + gauche) + '<br>'
          texte += `${numAlpha(0)} Quelle est la masse d'une ${mult[0] === 1 ? 'étoile' : 'boule'} en grammes${sp()}?<br>`
          texte +=
            this.interactif && !context.isAmc
              ? ajouteChampTexteMathLive(
                  this,
                  i * 2,
                  KeyboardType.clavierDeBase,
                  { texteApres: ' g' },
                ) + '<br>'
              : ''
          texte += `${numAlpha(1)} Quelle est la masse d'une ${mult[0] === 1 ? 'boule' : 'étoile'} en grammes${sp()}?<br>`
          texte +=
            this.interactif && !context.isAmc
              ? ajouteChampTexteMathLive(
                  this,
                  i * 2 + 1,
                  KeyboardType.clavierDeBase,
                  { texteApres: ' g' },
                ) + '<br>'
              : ''
          texteCorr = `${numAlpha(0)} Si on fait la soustraction entre les deux balances, ${mult[0] === 1 ? 'les boules sont enlevées' : 'les étoiles sont enlevées'}.<br>`
          texteCorr +=
            this.generateBalance(
              nombreBoule * mult[0] - nombreBoule,
              nombreEtoile * mult[1] - nombreEtoile,
              masseBoule * (nombreBoule * mult[0] - nombreBoule) +
                masseEtoile * (nombreEtoile * mult[1] - nombreEtoile),
            ) + '<br>'
          texteCorr += `On divise ensuite par le nombre ${mult[0] === 1 ? "d'étoiles restantes" : 'de boules restantes'} pour trouver la masse d'une ${mult[0] === 1 ? 'étoile' : 'boule'}.<br>`
          texteCorr += `$ ${texNombre(masseBoule * (nombreBoule * mult[0] - nombreBoule) + masseEtoile * (nombreEtoile * mult[1] - nombreEtoile))} \\div ${mult[0] === 1 ? nombreEtoile * mult[1] - nombreEtoile : nombreBoule * mult[0] - nombreBoule} = ${texNombre(mult[0] === 1 ? masseEtoile : masseBoule)}$ g.<br>`
          texteCorr += `La masse d'une ${mult[0] === 1 ? 'étoile' : 'boule'} est de $${miseEnEvidence(texNombre(mult[0] === 1 ? masseEtoile : masseBoule))}$ g.<br>`
          texteCorr += `${numAlpha(1)} Si on reprend la ${inverse === 0 ? 'première' : 'deuxième'} balance<br>`
          texteCorr += gauche + '<br>'
          texteCorr += `On supprime les $${mult[0] === 1 ? nombreEtoile : nombreBoule}$ ${mult[0] === 1 ? 'étoiles' : 'boules'} à gauche et on supprime à droite $${mult[0] === 1 ? nombreEtoile : nombreBoule} \\times ${mult[0] === 1 ? texNombre(masseEtoile) : texNombre(masseBoule)} = ${mult[0] === 1 ? texNombre(nombreEtoile * masseEtoile) : texNombre(nombreBoule * masseBoule)}$ g.<br>`
          texteCorr +=
            this.generateBalance(
              mult[0] === 1 ? nombreBoule : 0,
              mult[0] === 1 ? 0 : nombreEtoile,
              mult[0] === 1
                ? nombreBoule * masseBoule
                : nombreEtoile * masseEtoile,
            ) + '<br>'
          texteCorr += `On en déduit que $${mult[0] === 1 ? nombreBoule : nombreEtoile}$ ${mult[0] === 1 ? 'boules' : 'étoiles'} pèsent $${texNombre(mult[0] === 1 ? masseBoule * nombreBoule : masseEtoile * nombreEtoile)}$ g.<br>`
          texteCorr += `On divise ensuite $${mult[0] === 1 ? nombreBoule : nombreEtoile}$ pour trouver la masse d'une ${mult[0] === 1 ? 'boule' : 'étoile'}.<br>`
          texteCorr += `$ ${texNombre(mult[0] === 1 ? masseBoule * nombreBoule : masseEtoile * nombreEtoile)} \\div ${mult[0] === 1 ? nombreBoule : nombreEtoile} = ${texNombre(mult[0] === 1 ? masseBoule : masseEtoile)}$ g.<br>`
          texteCorr += `La masse d'une ${mult[0] === 1 ? 'boule' : 'étoile'} est de $${miseEnEvidence(texNombre(mult[0] === 1 ? masseBoule : masseEtoile))}$ g.<br>`
          if (context.isAmc) {
            handleAnswers(
              this,
              i * 2,
              { reponse: { value: mult[0] === 1 ? masseEtoile : masseBoule } },
              { formatInteractif: 'mathlive' },
            )
            handleAnswers(
              this,
              i * 2 + 1,
              { reponse: { value: mult[0] === 1 ? masseBoule : masseEtoile } },
              { formatInteractif: 'mathlive' },
            )
          } else {
            handleAnswers(this, i * 2, {
              reponse: { value: mult[0] === 1 ? masseEtoile : masseBoule },
            })
            handleAnswers(this, i * 2 + 1, {
              reponse: { value: mult[0] === 1 ? masseBoule : masseEtoile },
            })
          }
          break
        }
        case 2: {
          const mutl1 = randint(2, 4)
          const mult2 = randint(2, 4, [mutl1])
          const mult = randint(0, 1) === 0 ? [mutl1, mult2] : [mult2, mutl1]
          const gaucheMinMult = mult[0] < mult[1] ? 1 : 0
          const gauche = this.generateBalance(
            nombreBoule,
            nombreEtoile,
            masseBoule * nombreBoule + masseEtoile * nombreEtoile,
          )
          const droite = this.generateBalance(
            nombreBoule * mult[0],
            nombreEtoile * mult[1],
            masseBoule * nombreBoule * mult[0] +
              masseEtoile * nombreEtoile * mult[1],
          )
          const inverse = randint(0, 1)
          texte =
            (inverse
              ? droite + (!context.isHtml ? '<br>' : '') + gauche
              : gauche + (!context.isHtml ? '<br>' : '') + droite) + '<br>'
          texte += `${numAlpha(0)} Quelle est la masse d'une ${gaucheMinMult === 1 ? 'étoile' : 'boule'} en grammes${sp()}?<br>`
          texte +=
            this.interactif && !context.isAmc
              ? ajouteChampTexteMathLive(
                  this,
                  i * 2,
                  KeyboardType.clavierDeBase,
                  { texteApres: ' g' },
                ) + '<br>'
              : ''
          texte += `${numAlpha(1)} Quelle est la masse d'une ${gaucheMinMult === 0 ? 'étoile' : 'boule'} en grammes${sp()}?<br>`
          texte +=
            this.interactif && !context.isAmc
              ? ajouteChampTexteMathLive(
                  this,
                  i * 2 + 1,
                  KeyboardType.clavierDeBase,
                  { texteApres: ' g' },
                ) + '<br>'
              : ''
          texteCorr = `${numAlpha(0)} Si on multiplie la ${inverse === 0 ? 'première' : 'deuxième'} par $${gaucheMinMult === 1 ? mult[0] : mult[1]}$ alors on obtient la même quantité ${gaucheMinMult === 1 ? 'de boules' : "d'étoiles"}.<br>`
          texteCorr +=
            this.generateBalance(
              nombreBoule * (gaucheMinMult === 1 ? mult[0] : mult[1]),
              nombreEtoile * (gaucheMinMult === 1 ? mult[0] : mult[1]),
              masseBoule *
                nombreBoule *
                (gaucheMinMult === 1 ? mult[0] : mult[1]) +
                masseEtoile *
                  nombreEtoile *
                  (gaucheMinMult === 1 ? mult[0] : mult[1]),
            ) + '<br>'
          texteCorr += `La ${inverse === 1 ? 'première' : 'deuxième'} étant${sp()}: <br>`
          texteCorr += droite + '<br>'
          texteCorr += `Si on fait la soustraction entre les deux balances, ${gaucheMinMult === 1 ? 'les boules sont enlevées' : 'les étoiles sont enlevées'}.<br>`
          texteCorr +=
            this.generateBalance(
              Math.abs(
                nombreBoule * (gaucheMinMult === 1 ? mult[0] : mult[1]) -
                  nombreBoule * mult[0],
              ),
              Math.abs(
                nombreEtoile * (gaucheMinMult === 1 ? mult[0] : mult[1]) -
                  nombreEtoile * mult[1],
              ),
              Math.abs(
                masseBoule *
                  (nombreBoule * (gaucheMinMult === 1 ? mult[0] : mult[1]) -
                    nombreBoule * mult[0]) +
                  masseEtoile *
                    (nombreEtoile * (gaucheMinMult === 1 ? mult[0] : mult[1]) -
                      nombreEtoile * mult[1]),
              ),
            ) + '<br>'
          texteCorr += `On divise ensuite par le nombre ${gaucheMinMult === 1 ? "d'étoiles restantes" : 'de boules restantes'} pour trouver la masse d'une ${gaucheMinMult === 1 ? 'étoile' : 'boule'}.<br>`
          texteCorr += `$ ${texNombre(Math.abs(masseBoule * (nombreBoule * (gaucheMinMult === 1 ? mult[0] : mult[1]) - nombreBoule * mult[0]) + masseEtoile * (nombreEtoile * (gaucheMinMult === 1 ? mult[0] : mult[1]) - nombreEtoile * mult[1])))} \\div ${gaucheMinMult === 1 ? Math.abs(nombreEtoile * mult[1] - nombreEtoile * mult[0]) : Math.abs(nombreBoule * mult[0] - nombreBoule * mult[1])} = ${gaucheMinMult === 1 ? texNombre(masseEtoile) : texNombre(masseBoule)}$ g.<br>`
          texteCorr += `La masse d'une ${gaucheMinMult === 1 ? 'étoile' : 'boule'} est de $${miseEnEvidence(texNombre(gaucheMinMult === 1 ? masseEtoile : masseBoule))}$ g.<br>`
          texteCorr += `${numAlpha(1)} Si on reprend la ${inverse === 0 ? 'première' : 'deuxième'} balance<br>`
          texteCorr += gauche + '<br>'
          texteCorr += `On supprime les $${gaucheMinMult === 0 ? nombreBoule : nombreEtoile}$ ${gaucheMinMult === 0 ? ' boules' : ' étoiles'} à gauche et on supprime à droite $${gaucheMinMult === 0 ? nombreBoule : nombreEtoile} \\times ${gaucheMinMult === 0 ? texNombre(masseBoule) : texNombre(masseEtoile)} = ${gaucheMinMult === 0 ? texNombre(nombreBoule * masseBoule) : texNombre(nombreEtoile * masseEtoile)}$ g.<br>`
          texteCorr +=
            this.generateBalance(
              gaucheMinMult === 1 ? nombreBoule : 0,
              gaucheMinMult === 1 ? 0 : nombreEtoile,
              gaucheMinMult === 1
                ? nombreBoule * masseBoule
                : nombreEtoile * masseEtoile,
            ) + '<br>'
          texteCorr += `On en déduit que $${gaucheMinMult === 1 ? nombreBoule : nombreEtoile}$ ${gaucheMinMult === 1 ? 'boules' : 'étoiles'} pèsent $${texNombre(gaucheMinMult === 1 ? masseBoule * nombreBoule : masseEtoile * nombreEtoile)}$ g.<br>`
          texteCorr += `On divise ensuite par $${gaucheMinMult === 1 ? nombreBoule : nombreEtoile}$ pour trouver la masse d'une ${gaucheMinMult === 1 ? 'boule' : 'étoile'}.<br>`
          texteCorr += `$ ${texNombre(gaucheMinMult === 1 ? masseBoule * nombreBoule : masseEtoile * nombreEtoile)} \\div ${gaucheMinMult === 1 ? nombreBoule : nombreEtoile} = ${gaucheMinMult === 1 ? texNombre(masseBoule) : texNombre(masseEtoile)}$ g.<br>`
          texteCorr += `La masse d'une ${gaucheMinMult === 1 ? 'boule' : 'étoile'} est de $${miseEnEvidence(texNombre(gaucheMinMult === 1 ? masseBoule : masseEtoile))}$ g.<br>`
          if (context.isAmc) {
            handleAnswers(
              this,
              i * 2,
              {
                reponse: {
                  value: gaucheMinMult === 1 ? masseEtoile : masseBoule,
                },
              },
              { formatInteractif: 'mathlive' },
            )
            handleAnswers(
              this,
              i * 2 + 1,
              {
                reponse: {
                  value: gaucheMinMult === 1 ? masseBoule : masseEtoile,
                },
              },
              { formatInteractif: 'mathlive' },
            )
          } else {
            handleAnswers(this, i * 2, {
              reponse: {
                value: gaucheMinMult === 1 ? masseEtoile : masseBoule,
              },
            })
            handleAnswers(this, i * 2 + 1, {
              reponse: {
                value: gaucheMinMult === 1 ? masseBoule : masseEtoile,
              },
            })
          }
        }
      }

      if (
        this.questionJamaisPosee(
          i,
          nombreEtoile,
          masseBoule,
          masseBoule,
          masseEtoile,
        )
      ) {
        this.listeQuestions[i] = texte ?? ''
        this.listeCorrections[i] = texteCorr ?? ''
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }

  generateBalance(boules: number, etoiles: number, masse: number): string {
    if (!context.isHtml) {
      return this.generateBalanceTikz(boules, etoiles, masse)
    } else {
      return this.generateBalanceSVG(boules, etoiles, masse)
    }
  }

  generateBalanceSVG(boules: number, etoiles: number, masse: number): string {
    const svgWidth = 400
    const svgHeight = 200
    const baseY = 50

    // Génère les symboles
    const bouleSVG = (x: number, y: number) =>
      `<circle cx="${x}" cy="${y}" r="10" fill="black" />`
    const etoileSVG = (x: number, y: number) =>
      `<text x="${x}" y="${y + 10}" font-size="30" text-anchor="middle" fill="gold">★</text>`
    const masseSVG = (x: number, y: number, value: number) =>
      `<rect x="${x - 25}" y="${y - 20}" width="50" height="40" rx="5" ry="5" fill="#666" />
       <text x="${x}" y="${y + 5}" font-size="14" text-anchor="middle" fill="white">${Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(masse).toString()} g</text>`
    // Positionnement des objets sur les plateaux
    const leftObjects = []
    const spacing = 20
    for (let i = 0; i < boules; i++) {
      if (boules < 11) {
        // forme triangulaire
        if (i < 4) {
          leftObjects.push(bouleSVG(30 + i * spacing, baseY + 40))
        } else if (i < 7) {
          leftObjects.push(
            bouleSVG(30 + (i - 4) * spacing + spacing / 2, baseY + 20),
          )
        } else if (i < 9) {
          leftObjects.push(
            bouleSVG(30 + (i - 7) * spacing + spacing, baseY + 0),
          )
        } else if (i < 10) {
          leftObjects.push(
            bouleSVG(
              30 + (i - 9) * spacing + spacing + spacing / 2,
              baseY - 20,
            ),
          )
        } else {
          leftObjects.push(bouleSVG(30 + (i - 10) * spacing, baseY + 0))
        }
      } else {
        // forme carré
        if (i < 4) {
          leftObjects.push(bouleSVG(30 + i * spacing, baseY + 40))
        } else if (i < 8) {
          leftObjects.push(bouleSVG(30 + (i - 4) * spacing, baseY + 20))
        } else if (i < 12) {
          leftObjects.push(bouleSVG(30 + (i - 8) * spacing, baseY + 0))
        } else if (i < 16) {
          leftObjects.push(bouleSVG(30 + (i - 12) * spacing, baseY - 20))
        } else {
          leftObjects.push(bouleSVG(30 + (i - 16) * spacing, baseY - 40))
        }
      }
    }
    for (let i = 0; i < etoiles; i++) {
      if (etoiles < 11) {
        // forme triangulaire
        if (i < 4) {
          leftObjects.push(etoileSVG(30 + (4 + i) * spacing, baseY + 40))
        } else if (i < 7) {
          leftObjects.push(
            etoileSVG(30 + (4 + i - 4) * spacing + spacing / 2, baseY + 20),
          )
        } else if (i < 9) {
          leftObjects.push(
            etoileSVG(30 + (4 + i - 7) * spacing + spacing, baseY + 0),
          )
        } else if (i < 10) {
          leftObjects.push(
            etoileSVG(
              30 + (4 + i - 9) * spacing + spacing + spacing / 2,
              baseY - 20,
            ),
          )
        } else if (i < 11) {
          leftObjects.push(etoileSVG(30 + (4 + i - 10) * spacing, baseY + 0))
        } else if (i < 12) {
          leftObjects.push(
            etoileSVG(
              30 + (4 + i - 11) * spacing + spacing + spacing + spacing,
              baseY + 0,
            ),
          )
        }
      } else {
        // forme carré
        if (i < 4) {
          leftObjects.push(etoileSVG(30 + (4 + i) * spacing, baseY + 40))
        } else if (i < 8) {
          leftObjects.push(etoileSVG(30 + (4 + i - 4) * spacing, baseY + 20))
        } else if (i < 12) {
          leftObjects.push(etoileSVG(30 + (4 + i - 8) * spacing, baseY + 0))
        } else if (i < 16) {
          leftObjects.push(etoileSVG(30 + (4 + i - 12) * spacing, baseY - 20))
        } else {
          leftObjects.push(etoileSVG(30 + (4 + i - 16) * spacing, baseY - 40))
        }
      }
    }

    const rightObject = masseSVG(svgWidth - 95, baseY + 30, masse)

    // Structure générale de la balance
    const balanceSVG = `<div class="svgContainer" style="display: inline-block">
    <svg class="mathalea2d" viewBox="0 0 ${svgWidth} ${svgHeight}" style="display: inline-block" width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
        
    
      <!-- Barre horizontale -->
      <!--<rect x="80" y="${baseY}" width="240" height="5" fill="#333" />-->
    
      <!-- Plateaux -->
      <rect x="20" y="${baseY + 50}" width="160" height="10" fill="#999" />
      <rect x="85" y="${baseY + 70}" width="230" height="10" fill="#999" />
      <rect x="85" y="${baseY + 50}" width="20" height="30" fill="#999" />
      <rect x="295" y="${baseY + 50}" width="20" height="30" fill="#999" />
      <rect x="${svgWidth - 180}" y="${baseY + 50}" width="160" height="10" fill="#999" />
      
      <!-- Socle -->
      <rect x="190" y="${baseY + 60}" width="20" height="40" fill="#444" />
      <polygon points="200,70 195,${baseY + 55} 205,${baseY + 55}" fill="#888" />
    
      <!-- Contenu plateau gauche -->
      ${leftObjects.join('\n')}
    
      <!-- Contenu plateau droit -->
      ${rightObject}
    </svg></div>
    `
    return balanceSVG
  }

  generateBalanceTikz = (
    boules: number,
    etoiles: number,
    masse: number,
  ): string => {
    return `
\\begin{tikzpicture}[baseline={(current bounding box.north)}, scale=1]

\\fill[gray!60] (2,-0.8) rectangle (8,-0.6); % barre horizontale
\\fill[gray!60] (1.9,-0.8) rectangle (2.1,-0.2); % barre horizontale
\\fill[gray!60] (7.9,-0.8) rectangle (8.1,-0.2); % barre horizontale

% Barres et socle
\\fill[gray!70] (0,-0.4) rectangle (4,-0.2); % plateau gauche
\\fill[gray!70] (6,-0.4) rectangle (10,-0.2); % plateau droit
\\fill[gray!70] (4.8,-1) rectangle (5.2,-0); % support central
\\fill[gray!50] (4.7,0.2) -- (5.3,0.2) -- (5,.9) -- cycle; % base triangle

% Définir une variable locale à tikzpicture
\\pgfmathsetmacro{\\boules}{${boules}}
\\pgfmathsetmacro{\\etoiles}{${etoiles}}
\\pgfmathsetmacro{\\masse}{${masse}}

% Objets sur plateau gauche
\\ifthenelse{\\boules>0}{
\\ifthenelse{\\boules<11}{
% forme triangulaire
\\foreach \\i in {0,...,\\numexpr\\boules-1\\relax} {
  \\ifthenelse{\\i<4}{
    \\fill (0.3+0.4*\\i,0) circle (0.2);
  }{
    \\ifthenelse{\\i<7}{
      \\fill (0.3+0.4*\\i-1.4,0.4) circle (0.2);
    }{
      \\ifthenelse{\\i<9}{
        \\fill (0.3+0.4*\\i-2.4,0.8) circle (0.2);
      }{
        \\fill (0.3+0.4*\\i-3,1.2) circle (0.2);
      }
    }
  }
} % fin de forme triangulaire forEach
}{
% forme carrée
\\foreach \\i in {0,...,\\numexpr\\boules-1\\relax} {
  \\ifthenelse{\\i<4}{
    \\fill (0.3+0.4*\\i,0) circle (0.2);
  }{
    \\ifthenelse{\\i<8}{
      \\fill (0.3+0.4*\\i-1.6,0.4) circle (0.2);
    }{
      \\ifthenelse{\\i<12}{
        \\fill (0.3+0.4*\\i-3.2,0.8) circle (0.2);
      }{
        \\ifthenelse{\\i<16}{
          \\fill (0.3+0.4*\\i-4.8,1.2) circle (0.2);
         }{
          \\fill (0.3+0.4*\\i-6.4,1.6) circle (0.2);
        }
      }
    }
  }
} % fin de forme carrée forEach
}
}{}

\\ifthenelse{\\etoiles>0}{
\\ifthenelse{\\etoiles<11}{
% forme triangulaire
\\foreach \\i in {0,...,\\numexpr\\etoiles-1\\relax} {
  \\ifthenelse{\\i<4}{
    \\node at (2.5+0.4*\\i,0) {\\textcolor{orange}{\\Large \\ding{72}}};
  }{
    \\ifthenelse{\\i<7}{
      \\node at (2.5+0.4*\\i-1.4,0.4) {\\textcolor{orange}{\\Large \\ding{72}}};
    }{
      \\ifthenelse{\\i<9}{
        \\node at (2.5+0.4*\\i-2.4,0.8) {\\textcolor{orange}{\\Large \\ding{72}}};
      }{
        \\node at (2.5+0.4*\\i-3,1.2) {\\textcolor{orange}{\\Large \\ding{72}}};
      }
    }
  }
} % fin de forme triangulaire
}{
% forme carrée
\\foreach \\i in {0,...,\\numexpr\\etoiles-1\\relax} {
  \\ifthenelse{\\i<4}{
    \\node at (2.5+0.4*\\i,0) {\\textcolor{orange}{\\Large \\ding{72}}};
  }{
    \\ifthenelse{\\i<8}{
      \\node at (2.5+0.4*\\i-1.6,0.4) {\\textcolor{orange}{\\Large \\ding{72}}};
    }{
      \\ifthenelse{\\i<12}{
        \\node at (2.5+0.4*\\i-3.2,0.8) {\\textcolor{orange}{\\Large \\ding{72}}};
      }{
        \\ifthenelse{\\i<16}{
          \\node at (2.5+0.4*\\i-4.8,1.2) {\\textcolor{orange}{\\Large \\ding{72}}};
         }{
          \\node at (2.5+0.4*\\i-6.4,1.6) {\\textcolor{orange}{\\Large \\ding{72}}};;
        }
      }
    }
  }
} % fin de forme carrée
}
}{}

% Masse à droite
\\fill[yellow] (7.4,-0.2) rectangle +(1.2,1);
\\pgfkeys{/pgf/number format/set decimal separator=,}
\\pgfkeys{/pgf/number format/set thousands separator={\\,}}
\\node[black, font={\\small},anchor=center] at (8,0.3) {\\pgfmathprintnumber{\\masse}\\,g};

\\end{tikzpicture}`
  }
}
