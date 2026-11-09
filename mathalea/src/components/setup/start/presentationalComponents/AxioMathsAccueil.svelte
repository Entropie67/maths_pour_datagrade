<!--
  @component
  Accueil AxioMaths (DataGrade) : remplace la vitrine de l'association sur la
  page de composition tant qu'aucun exercice n'est choisi. Fichier propre à
  l'habillage DataGrade, absent du dépôt MathALÉA amont.
-->
<div class="flex-1 flex flex-col gap-6">
  <div
    class="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl
      bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
      border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
  >
    <img
      src="assets/images/axiomaths/liu-tableau.png"
      alt="Liu, la mascotte d'AxioMaths, devant un tableau"
      class="w-40 md:w-52 shrink-0"
    />
    <div class="flex-1">
      <div
        class="font-logo9 tracking-tighter font-black text-4xl md:text-5xl
          text-coopmaths-struct dark:text-coopmathsdark-struct"
      >
        AxioMaths
      </div>
      <p class="mt-2 text-lg text-coopmaths-corpus dark:text-coopmathsdark-corpus">
        Les exercices de maths de DataGrade : des milliers d'exercices à données
        aléatoires, du CM1 à la terminale, avec leurs corrections, et les annales
        du brevet et du bac.
      </p>
      <p class="mt-3 text-sm text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light">
        Choisis un niveau dans la colonne de gauche pour composer une feuille.
        Depuis DataGrade, compose ta liste puis clique <strong>Valider</strong> :
        la séance est créée pour tes classes et les scores de tes élèves remontent
        automatiquement.
      </p>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div
      class="flex flex-col items-center text-center gap-2 p-4 rounded-xl
        bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
        border-2 border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
    >
      <img src="assets/images/axiomaths/liu-compas.png" alt="" aria-hidden="true" class="w-24" />
      <div class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Énoncés aléatoires</div>
      <div class="text-sm text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light">
        Chaque élève a ses propres valeurs, et les retrouve s'il revient. Idéal pour s'entraîner sans recopier.
      </div>
    </div>
    <div
      class="flex flex-col items-center text-center gap-2 p-4 rounded-xl
        bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
        border-2 border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
    >
      <img src="assets/images/axiomaths/liu-reflechit.png" alt="" aria-hidden="true" class="w-24" />
      <div class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Correction immédiate</div>
      <div class="text-sm text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light">
        L'élève valide, voit sa correction détaillée et peut recommencer : seul son meilleur essai compte.
      </div>
    </div>
    <div
      class="flex flex-col items-center text-center gap-2 p-4 rounded-xl
        bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
        border-2 border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
    >
      <img src="assets/images/axiomaths/liu-aplus.png" alt="" aria-hidden="true" class="w-24" />
      <div class="font-bold text-coopmaths-struct dark:text-coopmathsdark-struct">Scores dans DataGrade</div>
      <div class="text-sm text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light">
        Le prof suit la grille élèves × exercices de chaque classe, sans rien saisir.
      </div>
    </div>
  </div>

  <p class="text-xs text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest">
    AxioMaths est propulsé par
    <a href="https://coopmaths.fr/alea/" target="_blank" rel="noreferrer" class="underline">MathALÉA</a>,
    logiciel libre de l'association
    <a href="https://coopmaths.fr" target="_blank" rel="noreferrer" class="underline">CoopMaths</a>
    (licence AGPL-3.0). Les sources de la version déployée sont indiquées dans
    <a href="deploiement.json" target="_blank" rel="noreferrer" class="underline">deploiement.json</a>.
    Retour à <a href="https://datagrade.fr/prof/maths.php" class="underline">DataGrade</a>.
  </p>
</div>
