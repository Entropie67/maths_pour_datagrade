#!/bin/bash
# Script pour tester les merge requests ouverts
# Usage: ./tasks/test-mr.sh

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================"
echo "  Testeur de Merge Requests - MathALÉA"
echo "========================================"
echo ""

# Vérifier que glab est installé
if ! command -v glab &> /dev/null; then
    echo -e "${RED}Erreur: glab n'est pas installé${NC}"
    echo "Installez-le avec: brew install glab"
    exit 1
fi

# Récupérer les MRs ouverts
echo "Récupération des merge requests ouverts..."
echo ""

# Sauvegarder les MRs dans un fichier temporaire (exclure les drafts)
TEMP_FILE=$(mktemp)
glab mr list --not-draft 2>&1 > "$TEMP_FILE"

# Stocker dans des tableaux
declare -a MR_NUMBERS
declare -a MR_BRANCHES
declare -a MR_TITLES

while IFS= read -r line; do
    if [[ $line =~ ^!([0-9]+) ]]; then
        MR_NUM="${BASH_REMATCH[1]}"
        # Extraire la branche source (entre parenthèses après la flèche)
        if [[ $line =~ \←\ \(([a-zA-Z0-9_-]+)\) ]]; then
            BRANCH="${BASH_REMATCH[1]}"
            # Extraire le titre (entre le numéro et (main))
            TITLE=$(echo "$line" | sed -E 's/![0-9]+[[:space:]]+//; s/\(main\).*//; s/^[[:space:]]*//; s/[[:space:]]*$//')
            
            MR_NUMBERS+=($MR_NUM)
            MR_BRANCHES+=($BRANCH)
            MR_TITLES+=("$TITLE")
        fi
    fi
done < "$TEMP_FILE"

rm "$TEMP_FILE"

# Vérifier qu'il y a des MRs
if [ ${#MR_NUMBERS[@]} -eq 0 ]; then
    echo -e "${YELLOW}Aucun merge request ouvert trouvé (hors drafts).${NC}"
    exit 0
fi

echo -e "${BLUE}Merge requests ouverts (du plus ancien au plus récent):${NC}"
echo ""

# Afficher la liste avec des numéros (ordre inversé : ancien -> récent)
# Les MRs sont récupérés du plus récent au plus ancien, donc on affiche dans l'ordre inverse
i=1
declare -a DISPLAY_INDICES
for ((idx=${#MR_NUMBERS[@]}-1; idx>=0; idx--)); do
    DISPLAY_INDICES+=($idx)
    printf "%2d. !%-5s %-50s → %s\n" $i "${MR_NUMBERS[$idx]}" "${MR_TITLES[$idx]:0:50}" "${MR_BRANCHES[$idx]}"
    ((i++))
done

echo ""
echo -e "${BLUE}0.  all${NC} - Tester toutes les branches"
echo ""

# Demander le choix de branche
read -p "Entrez le numéro de la branche à tester (ou 0 pour 'all', ou 'q' pour quitter): " CHOICE

if [ "$CHOICE" = "q" ] || [ "$CHOICE" = "Q" ]; then
    echo "Abandon."
    exit 0
fi

# Demander tout de suite pour les tests E2E
echo ""
read -p "Lancer aussi les tests E2E (views, consistency, interactivity) ? (O/N) [recommandé]: " RUN_E2E
if [ "$RUN_E2E" = "O" ] || [ "$RUN_E2E" = "o" ] || [ "$RUN_E2E" = "Y" ] || [ "$RUN_E2E" = "y" ] || [ -z "$RUN_E2E" ]; then
    RUN_E2E_TESTS=true
else
    RUN_E2E_TESTS=false
fi

# Demander pour le test des exercices modifiés (testExosModified)
echo ""
read -p "Lancer le test des exercices modifiés (testExosModified) ? (O/N) [recommandé]: " RUN_EXOS
if [ "$RUN_EXOS" = "O" ] || [ "$RUN_EXOS" = "o" ] || [ "$RUN_EXOS" = "Y" ] || [ "$RUN_EXOS" = "y" ] || [ -z "$RUN_EXOS" ]; then
    RUN_EXOS_TESTS=true
else
    RUN_EXOS_TESTS=false
fi

# Fonction pour tester une branche
test_branch() {
    local branch=$1
    local mr_num=$2
    local title=$3
    
    echo ""
    echo "========================================"
    echo -e "${BLUE}Testing: !${mr_num} - ${title}${NC}"
    echo -e "${BLUE}Branch: ${branch}${NC}"
    echo "========================================"
    echo ""
    
    # Vérifier si la branche existe en local
    if ! git show-ref --verify --quiet "refs/remotes/origin/${branch}"; then
        echo -e "${YELLOW}Branche ${branch} non trouvée en local, fetch...${NC}"
        git fetch origin "$branch" || {
            echo -e "${RED}Erreur: Impossible de fetch la branche ${branch}${NC}"
            return 1
        }
    fi
    
    # Stash les changements actuels s'il y en a
    local STASHED=false
    if ! git diff --quiet HEAD 2>/dev/null; then
        echo "Changements locaux détectés, stash..."
        git stash push -m "Auto-stash before testing MR !${mr_num}"
        STASHED=true
    fi
    
    # Checkout la branche
    echo "Checkout de la branche ${branch}..."
    git checkout "$branch" || {
        echo -e "${RED}Erreur: Impossible de checkout ${branch}${NC}"
        if [ "$STASHED" = true ]; then
            git stash pop
        fi
        return 1
    }
    
    # Merge main dans la branche pour simuler ce que ferait le MR
    echo "Merge de main dans ${branch}..."
    git pull origin main --no-rebase --no-edit 2>/dev/null || echo "(main déjà à jour ou pas de changements)"
    
    echo ""
    echo "Installation des dépendances..."
    pnpm install 2>&1 | tail -5
    
    # Tests unitaires
    echo ""
    echo -e "${BLUE}=== Tests unitaires ===${NC}"
    if pnpm test:unit 2>&1; then
        echo -e "${GREEN}✓ Tests unitaires: OK${NC}"
        UNIT_TESTS_PASSED=true
    else
        echo -e "${RED}✗ Tests unitaires: ÉCHEC${NC}"
        UNIT_TESTS_PASSED=false
    fi
    
    echo ""
    echo -e "${BLUE}=== Tests src ===${NC}"
    if pnpm test:src 2>&1; then
        echo -e "${GREEN}✓ Tests src: OK${NC}"
        SRC_TESTS_PASSED=true
    else
        echo -e "${RED}✗ Tests src: ÉCHEC${NC}"
        SRC_TESTS_PASSED=false
    fi
    
    # Build
    echo ""
    echo -e "${BLUE}=== Build ===${NC}"
    if NODE_OPTIONS=--max-old-space-size=4096 pnpm run makeJson && pnpm vite build 2>&1 | tail -20; then
        echo -e "${GREEN}✓ Build: OK${NC}"
        BUILD_PASSED=true
    else
        echo -e "${RED}✗ Build: ÉCHEC${NC}"
        BUILD_PASSED=false
    fi
    
    # Tests E2E si demandés
    E2E_VIEWS_PASSED=true
    E2E_CONSISTENCY_PASSED=true
    E2E_INTERACTIVITY_PASSED=true
    
    if [ "$RUN_E2E_TESTS" = true ]; then
        echo ""
        echo -e "${BLUE}=== Tests E2E (comme sur GitLab) ===${NC}"
        
        # Test Views (playwright-testCanEleve)
        echo ""
        echo -e "${BLUE}--- Test Views (playwright-testCanEleve) ---${NC}"
        ./tasks/run-e2e-test.sh views 8 2>&1 | tail -100
        VIEWS_EXIT_CODE=${PIPESTATUS[0]}
        if [ "$VIEWS_EXIT_CODE" -eq 0 ]; then
            echo -e "${GREEN}✓ Views: OK${NC}"
            E2E_VIEWS_PASSED=true
        else
            echo -e "${RED}✗ Views: ÉCHEC (code: $VIEWS_EXIT_CODE)${NC}"
            E2E_VIEWS_PASSED=false
        fi
        
        # Test Consistency (playwright-testCanEleve)
        echo ""
        echo -e "${BLUE}--- Test Consistency (playwright-testCanEleve) ---${NC}"
        ./tasks/run-e2e-test.sh consistency 8 2>&1 | tail -100
        CONSISTENCY_EXIT_CODE=${PIPESTATUS[0]}
        if [ "$CONSISTENCY_EXIT_CODE" -eq 0 ]; then
            echo -e "${GREEN}✓ Consistency: OK${NC}"
            E2E_CONSISTENCY_PASSED=true
        else
            echo -e "${RED}✗ Consistency: ÉCHEC (code: $CONSISTENCY_EXIT_CODE)${NC}"
            E2E_CONSISTENCY_PASSED=false
        fi
        
        # Test Interactivity (playwright-testInteractivity)
        echo ""
        echo -e "${BLUE}--- Test Interactivity (playwright-testInteractivity) ---${NC}"
        ./tasks/run-e2e-test.sh interactivity 10 2>&1 | tail -100
        INTERACTIVITY_EXIT_CODE=${PIPESTATUS[0]}
        if [ "$INTERACTIVITY_EXIT_CODE" -eq 0 ]; then
            echo -e "${GREEN}✓ Interactivity: OK${NC}"
            E2E_INTERACTIVITY_PASSED=true
        else
            echo -e "${RED}✗ Interactivity: ÉCHEC (code: $INTERACTIVITY_EXIT_CODE)${NC}"
            E2E_INTERACTIVITY_PASSED=false
        fi
    fi
    
    # Test des exercices modifiés (testExosModified)
    EXOS_MODIFIED_PASSED=true
    if [ "$RUN_EXOS_TESTS" = true ]; then
        echo ""
        echo -e "${BLUE}=== Test des exercices modifiés (testExosModified) ===${NC}"
        
        # Récupérer les fichiers modifiés (comme sur GitLab)
        echo "Récupération des fichiers modifiés..."
        git fetch origin "$branch" --depth=10 2>/dev/null || true
        
        # Comparer avec main pour trouver les fichiers modifiés
        CHANGED_FILES=$(git diff --name-only origin/main..HEAD 2>/dev/null || git diff --name-only main..HEAD 2>/dev/null || echo "")
        
        if [ -z "$CHANGED_FILES" ]; then
            echo -e "${YELLOW}Aucun fichier modifié détecté${NC}"
        else
            echo "Fichiers modifiés:"
            echo "$CHANGED_FILES" | head -20
            echo ""
            
            # Lancer le test sur les exercices modifiés
            echo "Lancement des tests sur les exercices modifiés..."
            CHANGED_FILES="$CHANGED_FILES" pnpm test:e2e:console_errors 2>&1 | tail -100
            EXOS_EXIT_CODE=${PIPESTATUS[0]}
            
            if [ "$EXOS_EXIT_CODE" -eq 0 ]; then
                echo -e "${GREEN}✓ Exercices modifiés: OK${NC}"
                EXOS_MODIFIED_PASSED=true
            else
                echo -e "${RED}✗ Exercices modifiés: ÉCHEC (code: $EXOS_EXIT_CODE)${NC}"
                EXOS_MODIFIED_PASSED=false
            fi
        fi
    fi
    
    # Retour sur la branche principale
    echo ""
    echo "Retour sur la branche principale..."
    git checkout main 2>/dev/null || git checkout - 2>/dev/null || true
    
    # Pop le stash si nécessaire
    if [ "$STASHED" = true ]; then
        git stash pop
    fi
    
    # Résumé
    echo ""
    echo "========================================"
    echo -e "${BLUE}RÉSULTATS pour !${mr_num}:${NC}"
    echo "========================================"
    
    ALL_PASSED=true
    [ "$UNIT_TESTS_PASSED" = false ] && ALL_PASSED=false
    [ "$SRC_TESTS_PASSED" = false ] && ALL_PASSED=false
    [ "$BUILD_PASSED" = false ] && ALL_PASSED=false
    [ "$E2E_VIEWS_PASSED" = false ] && ALL_PASSED=false
    [ "$E2E_CONSISTENCY_PASSED" = false ] && ALL_PASSED=false
    [ "$E2E_INTERACTIVITY_PASSED" = false ] && ALL_PASSED=false
    [ "$EXOS_MODIFIED_PASSED" = false ] && ALL_PASSED=false
    
    if [ "$ALL_PASSED" = true ]; then
        echo -e "${GREEN}✓ PRÊT POUR MERGE${NC}"
        return 0
    else
        echo -e "${RED}✗ CONTIENT DES ERREURS${NC}"
        [ "$UNIT_TESTS_PASSED" = false ] && echo "  - Tests unitaires"
        [ "$SRC_TESTS_PASSED" = false ] && echo "  - Tests src"
        [ "$BUILD_PASSED" = false ] && echo "  - Build"
        [ "$E2E_VIEWS_PASSED" = false ] && echo "  - E2E Views"
        [ "$E2E_CONSISTENCY_PASSED" = false ] && echo "  - E2E Consistency"
        [ "$E2E_INTERACTIVITY_PASSED" = false ] && echo "  - E2E Interactivity"
        [ "$EXOS_MODIFIED_PASSED" = false ] && echo "  - Exercices modifiés"
        return 1
    fi
}

# Tester une seule branche ou toutes
if [ "$CHOICE" = "0" ] || [ "$CHOICE" = "all" ]; then
    echo ""
    echo "Lancement des tests sur toutes les branches..."
    # Calculer le temps estimé
    TIME_PER_BRANCH=5  # Tests unitaires + build
    if [ "$RUN_E2E_TESTS" = true ]; then
        TIME_PER_BRANCH=$((TIME_PER_BRANCH + 25))  # +25 min pour E2E
    fi
    if [ "$RUN_EXOS_TESTS" = true ]; then
        TIME_PER_BRANCH=$((TIME_PER_BRANCH + 10))  # +10 min pour testExosModified
    fi
    TOTAL_TIME=$((${#MR_NUMBERS[@]} * TIME_PER_BRANCH))
    echo "⚠️  Temps estimé: ~${TOTAL_TIME} minutes (${TIME_PER_BRANCH} min par branche × ${#MR_NUMBERS[@]} branches)"
    echo ""
    
    PASSED=0
    FAILED=0
    
    # Tester dans l'ordre : ancien -> récent
    for ((i=${#DISPLAY_INDICES[@]}-1; i>=0; i--)); do
        idx=${DISPLAY_INDICES[$i]}
        if test_branch "${MR_BRANCHES[$idx]}" "${MR_NUMBERS[$idx]}" "${MR_TITLES[$idx]}"; then
            ((PASSED++))
        else
            ((FAILED++))
        fi
        echo ""
    done
    
    # Résumé final
    echo ""
    echo "========================================"
    echo "  RÉSUMÉ FINAL"
    echo "========================================"
    echo -e "${GREEN}Branches OK: ${PASSED}${NC}"
    echo -e "${RED}Branches avec erreurs: ${FAILED}${NC}"
    echo ""
    
else
    # Convertir le choix en index réel (inversé)
    CHOICE_IDX=$((CHOICE - 1))
    
    if [ "$CHOICE_IDX" -lt "0" ] || [ "$CHOICE_IDX" -ge "${#DISPLAY_INDICES[@]}" ]; then
        echo -e "${RED}Choix invalide.${NC}"
        exit 1
    fi
    
    # Récupérer l'index réel dans le tableau original
    REAL_IDX=${DISPLAY_INDICES[$CHOICE_IDX]}
    test_branch "${MR_BRANCHES[$REAL_IDX]}" "${MR_NUMBERS[$REAL_IDX]}" "${MR_TITLES[$REAL_IDX]}"
fi
