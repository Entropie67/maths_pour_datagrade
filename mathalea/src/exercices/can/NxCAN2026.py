import os
import re
import shutil
import random
import string

# Répertoires source et destination
src_dir = "canNY-2025"
dst_dir = "canNY-2026"

# S'assurer que le dossier destination existe
os.makedirs(dst_dir, exist_ok=True)

# Génère un code aléatoire de 5 à 10 caractères (lettres minuscules + chiffres)
def random_uuid(length=5):
    chars = string.ascii_lowercase + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

# Parcours de tous les fichiers .ts du répertoire source
for filename in os.listdir(src_dir):
    # Ignore les fichiers qui ne sont pas .ts ou qui commencent par can6NY
    if not filename.endswith('.ts') or filename.startswith('can6NY'):
        continue
    
    src_path = os.path.join(src_dir, filename)
    dst_path = os.path.join(dst_dir, filename.replace("2025", "2026"))

    if not os.path.isfile(src_path):
        print(f"⚠️ N'est pas un fichier : {src_path}")
        continue

    with open(src_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Remplacer la ligne export const uuid = 'xxxxx'
    new_uuid = random_uuid()
    new_content = re.sub(
        r"export const uuid\s*=\s*'[^']+'",
        f"export const uuid = '{new_uuid}'",
        content
    )

    with open(dst_path, "w", encoding="utf-8") as f:
        f.write(new_content)

    print(f"✅ Copié {src_path} → {dst_path} avec uuid = {new_uuid}")

print(f"\n✨ Traitement terminé !")