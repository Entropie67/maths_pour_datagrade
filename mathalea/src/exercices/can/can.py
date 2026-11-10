import csv
import os
import re
from pathlib import Path

def read_csv_data(csv_file):
    """
    Lit le fichier CSV et retourne un dictionnaire {colonne1: colonne2}
    """
    csv_data = {}
    try:
        with open(csv_file, 'r', encoding='utf-8') as file:
            csv_reader = csv.reader(file)
            for row in csv_reader:
                if len(row) >= 2:
                    csv_data[row[0]] = row[1]
        print(f"Données CSV lues: {len(csv_data)} entrées")
        return csv_data
    except FileNotFoundError:
        print(f"Erreur: Le fichier {csv_file} n'a pas été trouvé.")
        return {}
    except Exception as e:
        print(f"Erreur lors de la lecture du CSV: {e}")
        return {}

def find_js_ts_files(directory):
    """
    Trouve tous les fichiers .js et .ts dans le répertoire courant et ses sous-répertoires
    """
    js_ts_files = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.js', '.ts')):
                js_ts_files.append(os.path.join(root, file))
    return js_ts_files

def update_file_content(file_path, csv_data):
    """
    Met à jour le contenu d'un fichier JS/TS selon les données CSV
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        original_content = content
        modified = False
        
        # Pour chaque entrée du CSV
        for col1_value, col2_value in csv_data.items():
            # Pattern pour trouver les lignes avec 'fr-fr' et le nom du fichier (col1)
            # Recherche: 'fr-fr': ['canXXX'] ou 'fr-fr': ["canXXX"]
            pattern = rf"('fr-fr'\s*:\s*\[)(['\"])({re.escape(col1_value)})(\2)(\])"
            
            def replacement(match):
                nonlocal modified
                # match.group(1) = "'fr-fr': ["
                # match.group(2) = quote character (' or ")
                # match.group(3) = col1_value
                # match.group(4) = same quote character
                # match.group(5) = "]"
                
                quote = match.group(2)
                # Vérifier si col2_value n'est pas déjà présent
                existing_content = match.group(0)
                if col2_value not in existing_content:
                    modified = True
                    return f"{match.group(1)}{quote}{col1_value}{quote},{quote}{col2_value}{quote}{match.group(5)}"
                return match.group(0)
            
            content = re.sub(pattern, replacement, content)
            
            # Pattern alternatif pour des arrays multi-lignes ou avec espaces
            pattern2 = rf"('fr-fr'\s*:\s*\[\s*)(['\"])({re.escape(col1_value)})(\2)(\s*\])"
            content = re.sub(pattern2, replacement, content)
        
        # Écrire le fichier modifié seulement s'il y a eu des changements
        if modified:
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(content)
            print(f"✓ Modifié: {file_path}")
            return True
        else:
            return False
            
    except Exception as e:
        print(f"✗ Erreur lors du traitement de {file_path}: {e}")
        return False

def main():
    """
    Fonction principale
    """
    print("Script de mise à jour des fichiers JS/TS avec données CSV")
    print("=" * 60)
    
    # Vérifier que le fichier CSV existe
    csv_file = 'can.csv'
    if not os.path.exists(csv_file):
        print(f"Erreur: Le fichier {csv_file} n'existe pas dans le répertoire courant.")
        return
    
    # Lire les données CSV
    csv_data = read_csv_data(csv_file)
    if not csv_data:
        print("Aucune donnée CSV à traiter.")
        return
    
    print(f"Données CSV: {dict(list(csv_data.items())[:3])}{'...' if len(csv_data) > 3 else ''}")
    print()
    
    # Trouver tous les fichiers JS/TS
    current_directory = os.getcwd()
    js_ts_files = find_js_ts_files(current_directory)
    
    if not js_ts_files:
        print("Aucun fichier .js ou .ts trouvé.")
        return
    
    print(f"Fichiers JS/TS trouvés: {len(js_ts_files)}")
    for file in js_ts_files[:5]:  # Afficher les 5 premiers
        print(f"  - {file}")
    if len(js_ts_files) > 5:
        print(f"  ... et {len(js_ts_files) - 5} autres")
    print()
    
    # Demander confirmation
    response = input("Voulez-vous continuer avec la mise à jour ? (o/n): ")
    if response.lower() not in ['o', 'oui', 'y', 'yes']:
        print("Opération annulée.")
        return
    
    # Traiter chaque fichier
    modified_count = 0
    for file_path in js_ts_files:
        if update_file_content(file_path, csv_data):
            modified_count += 1
    
    print(f"\n🎉 Traitement terminé!")
    print(f"Fichiers modifiés: {modified_count}/{len(js_ts_files)}")

if __name__ == "__main__":
    main()
