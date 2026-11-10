#!/usr/bin/python3
# -*- coding: utf8 -*-

# @author Sébastien Lozano, Éric Elter

"""Permet de synchroniser/créer les différents dictionnaires utilisés par mathalea pour :

"""
pass

# On importe la librairie os pour gérer les fichiers
import os
import json
import re
from pathlib import Path
# Pour lancer Prettier sur le dictionnaire modifié
import subprocess

# Pour mesurer le temps de traitement du script
from datetime import datetime 

def locationName(text:str)->str:
    """Renvoie un nom de lieu ad hoc

    **Paramètres**

        * text -- Un string avec le nom récupéré par découpage d'un nom de fichier
    
    **Sorties**

        * Un texte tout beau !    
    
    """
    pass
    if text == 'metropole' :
        return 'Métropole'
    elif text == 'pondichery' :
        return 'Pondichéry'
    elif text == 'ameriquenord' :
        return 'Amérique du Nord'
    elif text == 'asie' :
        return 'Asie'
    elif text == 'etranger' or text == 'etrangers' :
        return 'Centres étrangers'
    elif text == 'wallis' or text == 'wallisfutuna' :
        return 'Wallis et Futuna'
    elif text == 'polynesie' :
        return 'Polynésie'
    elif text == 'ameriquesud' :
        return 'Amérique du sud'
    elif text == 'amsud' :
        return 'Amérique du sud'
    elif text == 'caledonie' :
        return 'Nouvelle Calédonie'
    elif text == 'grece' :
        return 'Grèce'
    elif text == 'antillesguyanne' :
        return 'Antilles - Guyane'
    elif text == 'Réunion' :
        return 'La Réunion'
    elif text == 'sujet0va' :
        return 'Sujet O Version B'
    elif text == 'sujet0vb' :
        return 'Sujet O Version A'
    else :
        return text[0].upper() + text[1:] if text else text

def monthName(mm:str)->str:
    """Une fonction pour transformer le numéro du mois en texte

    **Paramètres**

        * mm -- Un string avec les chiffres correspondant au mois récupéré par découpage d'un nom de fichier
    
    **Sorties**

        * Un nom de mois tout beau !    
    
    """
    pass
    month = ['','Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
    return month[int(mm)]

def newEntry(file:str,dicoType:str)->list:
    """Une fonction pour créer une entrée dans un dico

    **Paramètres**

        * file -- Un string avec le nom du fichier à traiter
        * dicoType -- Un string avec dnb, bac ou e3c
    
    **Sorties**

        * Un tableau avec deux strings [un objet pour le dico, le nom du fichier traité]   
    
    """
    pass  
    # On récupère le nom du fichier sans l'extension
    filename = os.path.splitext(file)[0]
    filename = filename.lower()
    # On récupère l'extension
    extension = os.path.splitext(file)[1]
    # Pour les lignes à ajouter
    newLines = ''
    # print(filename)
    # On traite les fichiers tex qui ne sont pas les fichiers de correction 
    if filename[-4:] != '_cor' and  extension == ".tex" :
        if 'mathalea' in filename: # EE : Pas encore trouvé à quelle occasion cela l'était
            numeroInitial = filename.split('_')[5]
        else: # EE : Ici, on considère que c'est le cas général
            numeroInitial = filename.split('_')[4]
        if ('sti2d' in filename or 'stl' in filename) :
            if ('j1' in filename or 'j2' in filename) :
                # numeroInitial = filename.split('_')[5]
                numeroInitial = filename.split('_')[4].upper()+' - '+filename.split('_')[5]+' ' # Pour avoir J1 ou J2 en plus du numeroInitial de Base
            else :
                numeroInitial = filename.split('_')[4]
            lieu = locationName(filename.split('_')[3])
            annee = filename.split('_')[1]
            mois = monthName(filename.split('_')[2])
            if ('sti2d' in filename) : 
                dicoType = 'sti2d'
            else :
                dicoType = 'stl'
            newLines = f'''  {filename}: {{                
                annee: '{annee}',                
                lieu: '{lieu}',                
                mois: '{mois}',                
                numeroInitial: '{numeroInitial}',
                typeExercice: '{dicoType}',                               
                tags: ['']            
            }},\n'''
        
        elif ('eam' in filename): # EE : Ici, on considère que c'est les EAM
            # print(filename.split('_'))
            numeroInitial = filename.split('_')[5]
            annee = filename.split('_')[2]
            mois = monthName(filename.split('_')[3])
            filiere = filename.split('_')[1]
            prefix_map = {
                'specialite': 'Spécialité ',
                'specifique': 'Spécifique '
            }
            prefix = prefix_map.get(filiere, '')
            lieu = prefix + locationName(filename.split('_')[4])
            dicoType = 'eam'
            newLines = f'''  {filename}: {{                
                annee: '{annee}',                
                lieu: '{lieu}',                
                mois: '{mois}',                
                numeroInitial: '{numeroInitial}',
                typeExercice: '{dicoType}',  
                filiere: '{filiere.capitalize()}',           
                tags: ['']            
            }},\n'''
        
        elif ((('sujet1' in filename) or ('sujet2' in filename)) and ('bac' in filename)): # EE : Ici, on considère que c'est le BAC ....
            isQCM = filename.startswith('qcm') # EE : Est-ce que c'est un QCM (FlashBac) ?
            if isQCM:
                filename=filename[4:]  # EE : Enlève 'QCM_' (4 caractères)
            lieu = locationName(filename.split('_')[4])
            if (('groupe1' in filename) or ('groupe2' in filename)):
                if ('groupe1' in filename) :
                    lieu = lieu + ' G1'
                else :
                    lieu = lieu + ' G2'
                numeroInitial = filename.split('_')[6] 
                if isQCM:
                    questionQCM = filename.split('_')[7] 
            else :
                numeroInitial = filename.split('_')[5] 
                if isQCM:
                    questionQCM = filename.split('_')[6] 
            if ('sujet1' in filename):
                sujet='J1'
            else: 
                sujet='J2'
            annee=filename[4:8]
            mois=monthName(filename[9:11])
            if isQCM:
                filename='QCM_'+filename  # EE : Rajoute 'QCM_' (4 caractères)
            
            newLines = f'''  {filename}: {{                
                annee: '{annee}',                
                lieu: '{lieu}',                
                mois: '{mois}',                
                jour: '{sujet}',                
                numeroInitial: '{numeroInitial}','''

# Ajouter une ligne conditionnelle
            if isQCM:
                newLines += f'''
                    questionQCM: '{questionQCM}','''  # Assurez-vous que les guillemets sont corrects

# Compléter la chaîne
            newLines += f'''                              
                typeExercice: '{dicoType}',                               
                tags: ['']            
            }},\n'''
        elif ('crpe' in filename): # EE : Ici, on considère que c'est les CRPE
            newLines = f'''  {filename}: {{
                annee: '{filename[8:12]}',
                lieu: '{locationName(filename.split('_')[3])}',
                numeroInitial: '{numeroInitial}',
                png: 'static/{dicoType}/{filename[8:12]}/tex/png/{filename}.png',
                pngCor: 'static/{dicoType}/{filename[8:12]}/tex/png/{filename}_cor.png',
                typeExercice: '{dicoType}',
                url: 'static/{dicoType}/{filename[8:12]}/tex/{filename}.tex',
                urlcor: 'static/{dicoType}/{filename[8:12]}/tex/{filename}_cor.tex',
                tags: ['']
            }},\n'''    
        elif ('dnbpro' in filename): # EE : Ici, on considère que c'est les DNBPRO
            newLines = f'''  {filename}: {{
                annee: '{filename[7:11]}',
                lieu: '{locationName(filename.split('_')[3])}',
                mois: '{monthName(filename[12:14])}',
                numeroInitial: '{numeroInitial}',
                typeExercice: '{dicoType}',
                tags: ['']
            }},\n'''    
        else: # Cette partie concerne le DNB et le bac avant 2022
            newLines = f'''  {filename}: {{
                annee: '{filename[4:8]}',
                lieu: '{locationName(filename.split('_')[3])}',
                mois: '{monthName(filename[9:11])}',
                numeroInitial: '{numeroInitial}',
                typeExercice: '{dicoType}',
                tags: ['']
            }},\n'''    
    
    return [newLines,filename]

def currentRef(dicoPath:str)->list:
    """Une fonction pour récupérer tous les fichiers déjà référencés dans le dico

    **Paramètres**

        * dicoPath -- Un string avec le chemin vers le dico
    
    **Sorties**

        * out -- Un tableau avec tous les noms des fichiers déjà dans le dico   
    
    """
    pass     
    # On ouvre le dico et on récupère les lignes
    content = open(dicoPath,'r',encoding='utf8')
    lines = content.readlines()
    content.close()
    # Un tableau pour récupérer les noms des fichiers déjà dans le dico
    out = []
    for line in lines:
        if ": {" in line:            
            out.append(line.replace(" ","")[:-3])
    return out
 
def insertNewEntries(pathName:str,dicoPath:str,dicoType:str):
    """Une procédure pour insérer les nouvelles entrées au dico

    **Paramètres**

        * pathName -- Un string avec le chemin du répertoire à scanner
        * dicoPath -- Un string avec le chemin vers le dico
        * dicoType -- Un string avec dnb, bac ou e3c        
    
    """
    pass
    # On lit les lignes du dico
    content = open(dicoPath,'r',encoding='utf8')
    lines = content.readlines()
    content.close()
    # On supprime les lignes vides finales puis la dernière ligne, qui doit être
    # l'accolade fermante de l'objet exporté
    while lines and lines[-1].strip() == '':
        del lines[-1]
    if not lines or lines[-1].strip() != '}':
        raise SystemExit(f"{dicoPath} doit se terminer par une ligne '}}' : fichier non modifié.")
    del lines[-1]
    while lines and lines[-1].strip() == '':
        del lines[-1]
    # On ouvre le fichier en écriture
    # On le réécrit complètement sans l'accolade fermante
    content = open(dicoPath,'w',encoding='utf8')
    content.writelines(lines)
    content.close()

    # On récupère les entrées actuelles du dico
    currentEntries = currentRef(dicoPath)

    # On ouvre le dico en ajout
    content = open(dicoPath, 'a', encoding='utf8')
    
    # On ajoute les nouvelles entrées
    for (dirpath, dirnames, filenames) in os.walk(pathName):
        # Parcourt tout le répertoire
        for file in sorted(filenames):
            new = newEntry(file,dicoType)
            # On ajoute l'entrée s'il elle n'existe pas déjà
            if (new[0]!='') :
                if (new[1] not in currentEntries):
                    if (new[1][-3:]!='cor') : # Pour éviter d'afficher ici les corrections. Seuls les sujets nous intéressent.
                        print('Prise en compte de',new[1])
                    content.writelines(new[0])    
    # On referme la dernière accolade
    lastAcc = '''
}\n'''
    content.writelines(lastAcc)
    content.close()

def syncSessions(dicoPath:str, sessionsPath=None):
    """Complète la table depuis le dictionnaire, sans écraser les corrections manuelles."""
    if sessionsPath is None:
        sessionsPath = Path(__file__).resolve().parents[2] / 'src/json/referentielStaticFRSessions.json'
    sessionsPath = Path(sessionsPath)
    # Node lit l'objet TypeScript : les étiquettes et métadonnées existantes
    # restent la source de vérité, plutôt que les seuls noms de fichiers.
    result = subprocess.run([
        'node', '--experimental-strip-types', '--input-type=module', '-e',
        '''import { pathToFileURL } from 'node:url';
const module = await import(pathToFileURL(process.argv[1]).href);
const key = Object.keys(module).find(key => key.startsWith('dictionnaire'));
if (!key) throw new Error('Aucun dictionnaire exporté.');
console.log(JSON.stringify(module[key]));''',
        str(Path(dicoPath).resolve()),
    ], check=True, capture_output=True, text=True)
    dictionary = json.loads(result.stdout)
    original = sessionsPath.read_text(encoding='utf8')
    table = json.loads(original)
    existingSessions = set(table['sessions'])
    fields = ['typeExercice', 'annee', 'lieu', 'numeroInitial', 'mois', 'jour', 'filiere']
    for uuid, entry in dictionary.items():
        # FlashBAC n'est pas consommé par le référentiel statique FR.
        if entry['typeExercice'] == 'flashbac':
            continue
        infos = {field: entry[field] for field in fields if field in entry}
        for field in fields[:4]:
            if field not in infos or not isinstance(infos[field], str):
                raise ValueError(f'{uuid} : métadonnée {field} absente ou invalide.')
        if uuid in table['entryOverrides']:
            if table['entryOverrides'][uuid] != infos:
                raise ValueError(f'{uuid} : conflit avec entryOverrides. Vérifier les métadonnées.')
            continue
        sessionKey, numeroCode = uuid.rsplit('_', 1)
        session = {key: value for key, value in infos.items() if key != 'numeroInitial'}
        if sessionKey not in table['sessions']:
            table['sessions'][sessionKey] = session
        elif table['sessions'][sessionKey] != session:
            if sessionKey in existingSessions:
                raise ValueError(f'{uuid} : conflit avec la session {sessionKey}. Vérifier les métadonnées.')
            # Certaines annales partagent une clé mais ont des lieux distincts.
            table['entryOverrides'][uuid] = infos
            continue
        numero = numeroCode
        if entry['typeExercice'] == 'crpe':
            match = re.fullmatch(r'ex0*(\d+)', numeroCode)
            if match:
                numero = match[1]
            elif numeroCode == 'pb':
                numero = 'Problème'
        if uuid in table['numeroOverrides']:
            if table['numeroOverrides'][uuid] != infos['numeroInitial']:
                raise ValueError(f'{uuid} : conflit avec numeroOverrides. Vérifier la numérotation.')
        elif numero != infos['numeroInitial']:
            table['numeroOverrides'][uuid] = infos['numeroInitial']
    if table != json.loads(original):
        sessionsPath.write_text(json.dumps(table, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
        print('Table des sessions mise à jour :', sessionsPath)

def manageDico(dicoPath:str,dicoType:str, sessionsPath=None):
    """Une procedure pour la gestion du dico

    **Paramètres**

        * dicoPath -- Un string avec le chemin vers le dico
        * dicoType -- Un string avec dnb, bac, e3c ou autres
    
    """
    pass
    # On crée le dico s'il n'existe pas
    fichier = open(dicoPath, "a+", encoding="utf8")
    fichier.close()
    
    # Si le dico est vide on ajoute les première lignes
    if (os.path.getsize(dicoPath) == 0):
        fichier = open(dicoPath, "w", encoding="utf8")
        #firstLine = "/* eslint-disable no-multiple-empty-lines */\n"
        #secondLine = "/* eslint-disable comma-dangle */\n"
        thirdLine = f'export const dictionnaire{dicoType.upper()} = {{\n'
        lastLine = "}"    
        #fichier.writelines(firstLine)
        #fichier.writelines(secondLine)
        fichier.writelines(thirdLine)
        fichier.writelines(lastLine)
        fichier.close()
    
    folderToScan = f'./{dicoType}/'
    # print(folderToScan)
    # On crée le repertoire s'il n'existe pas
    if (not os.path.exists(folderToScan)):
        os.makedirs(folderToScan)    
    # On récupère et range toutes les années présentes dans le repertoire à scanner
    getAllYears = sorted(os.listdir(folderToScan)) 
    
    # On traite toutes les années
    for year in getAllYears:
        insertNewEntries(f'./{dicoType}/{year}/tex/',dicoPath,dicoType)

    # Les entrées ajoutées ne sont pas indentées comme le reste du fichier :
    # on reformate le dictionnaire avec le Prettier du dépôt s'il est installé
    prettier = '../../node_modules/.bin/prettier'
    if os.path.exists(prettier):
        subprocess.run([prettier, '--write', dicoPath], check=False)
    else:
        print(f'Penser à formater {dicoPath} avec "pnpm exec prettier --write".')

    syncSessions(dicoPath, sessionsPath)

# Script principal
def main():
    """Procédure principale"""
    # On récupère la date au début du traitement
    start_time = datetime.now()
      
    # On nettoie le terminal
    os.system("clear")

    # EE : Ne fonctionne pas. Je l'enlève. On verra plus tard
    # On génère la documentation
    # print("=============================================================================")
    # print("  Création de la documentation en cours ...  ")    
    # print(" ")    
    # os.system('sh ./src/js/modules/dicosDnbBacE3c/generateDoc.sh')
    # print("=============================================================================")
    # print("  Synchronisation/Génération du dictionnaire en cours ...  ")    
    # print(" ")    

    # On choisit le type de dico à synchroniser/générer
    choiceDico = ''
    while choiceDico not in ['1','2','3','4','5','6','7','8','9']:
        choiceDico = input("""Quel dictionnaire faut-il synchroniser/générer ?
        ---> 1 : DNB
        ---> 2 : DNB PRO
        ---> 3 : BAC
        ---> 4 : E3C
        ---> 5 : EAM (1ère)
        ---> 6 : CRPE
        ---> 7 : FlashBAC
        ---> 8 : STI2D  
        ---> 9 : STL  
Taper 1, 2, 3, 4, 5, 6, 7, 8 ou 9 pour lancer le script --> """)
    # Une variable pour le chemin vers le dico à synchroniser/générer        
    dicoPath = ''
    # Une variable pour le type de dico à synchroniser/générer        
    dicoType = ''

    if (choiceDico == '1'):
        dicoPath = '../../src/json/dictionnaireDNB.ts'
        dicoType = 'dnb'
    elif (choiceDico == '2'):
        dicoPath = '../../src/json/dictionnaireDNBPRO.ts'
        dicoType = 'dnbpro'
    elif (choiceDico == '3'):
        dicoPath = '../../src/json/dictionnaireBAC.ts'
        dicoType = 'bac'
    elif (choiceDico == '4'):
        dicoPath = '../../src/json/dictionnaireE3C.ts'
        dicoType = 'e3c'
    elif (choiceDico == '5'):
        dicoPath = '../../src/json/dictionnaireEAM.ts'
        dicoType = 'eam'
    elif (choiceDico == '6'):
        dicoPath = '../../src/json/dictionnaireCrpeCoop.ts'
        dicoType = 'crpe'
    elif (choiceDico == '7'):
        dicoPath = '../../src/json/dictionnaireFlashBac.ts'
        dicoType = 'flashbac'
    elif (choiceDico == '8'):
        dicoPath = '../../src/json/dictionnaireSTI2D.ts'
        dicoType = 'sti2d'
    elif (choiceDico == '9'):
        dicoPath = '../../src/json/dictionnaireSTL.ts'
        dicoType = 'stl'

    manageDico(dicoPath,dicoType)

    if __name__ == "__main__":
        print(" ")
        print("=============================================================================")
        print("                   Remplissage Dictionnaire Achevé")
        print("=============================================================================")
        print(" ")
        
    # On évalue le temps de traitement
    end_time = datetime.now()
    print("=============================================================================")
    print("  Durée de traitement : ",end_time-start_time)        
    print("=============================================================================")
 
if __name__ == "__main__":
    main()
