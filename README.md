[![Build and test status](https://github.com/conditor-project/co-formatter/actions/workflows/node.js.yml/badge.svg)](https://github.com/conditor-project/co-formatter/actions/workflows/node.js.yml)

# co-formatter

## Présentation ##
Le module **co-formatter** est un module qui permet d'extraire des informations des fichiers XML en format TEI.

### Fonctionnement ###
`co-formatter` effectue ses traitements dans une fonction `doTheJob()` dédiée.

#### Structure d'entrée
Les champs requis dans le JSON d'entrée sont les suivants :
```JSON
{
  "id": "unique_document_identifier",
  "metadata": [
    {
      "path": "path_to_document",
      "mime": "application/tei+xml",
      "original": false
    }
  ],
  "source": "source"
}
```
Le type mime du fichier de métadonnées **doit être** `application/tei+xml`, et le booléen `original` doit valoir `false`.

#### Structure de sortie
Les champs de sortie correspondent aux métadonnées de la notice utiles pour le dédoublonnage, formant ce qu'on appelle le "chapeau" Conditor. Les valeurs de ces champs sont reprises telles quelles, sans aucun post-traitement, mais leur emplacement dans le JSON de sortie reflète une structure bien définie, correspondant aux besoins métier de Corhal et d'ISTEX :
```JSON
{
  "title": {
    "default": "My Title",
    "fr": "Mon Titre",
    "en": "My Title"
  },
  "authors": [
    {
      "forename":"John",
      "surname": "Good"
    },
    // ...
  ],
  "doi": "DOI of document (article-level)",
  "host": {
    "issn": "ISSN of host document",
    "issue": "document number (in the issue for example)",
    "volume": "volume number of the document container",
    "pages": {
      "range": "single string pagination info",
      // ...
    },
    // ...
  },
  "business": {
    "first3AuthorNamesWithInitials": "J Good",
    // ...
  }
  // ...
}

```

## Utilisation ##

### Installation ###
Dépendances système :
  * NodeJS 12.0.0+

Commande d'Installation :
```
npm install
```

### Vérification du fonctionnement ###
Commande d'exécution des tests unitaires :
```
npm test
```

### Utilisation pour mise au point du fichier de configuration
La commande suivante traite automatiquement l'ensemble des fichiers contenus dans `test/dataset/in`, et écrit les fichiers résultats dans le répertoire `test/dataset/out` :
```
npm run preview
```

### Exécution ###
Comme pour tous les modules, la présente partie métier n'est pas destinée à être exécutée directement, puisqu'elle consiste uniquement à mettre à disposition une fonction `doTheJob`.

L'exécution se fera donc en appelant cette fonction depuis une instanciation de `li-canvas` ou indirectement depuis les tests unitaires.

## Annexes ##

### Arborescence ###
```
.
├── .github/
│  └── worfklows/
│      └── node.js.yml              // Description des GitHub Actions (intégration continue)
├── node_modules/                   // Modules NPM
│   └── ...
├── src/
│   ├── utils.js                    // Fonctions utilitaires utilisées à travers le module
│   └── xpathContextOptions.js      // Paramètres et logique d'extraction des données via XPath
├── test/                           // Fichiers nécessaires aux tests unitaires
│   ├── dataset/
│   │   └── in/
│   |       ├── docObjects.js       // Les objets d'entrée
│   │       └── *.xml               // Des exemples de fichiers TEI provenants de différentes sources
│   ├── preview.js                  // Script générant des fichiers JSON représentants les objets à la sortie du module
│   └── run.js                      // Point d'entrée des tests unitaires
├── .editorconfig                   // Configuration de l'éditeur pour l'indentation (entre autre)
├── .eslintrc.json                  // Configuration pour eslint
├── .gitignore
├── index.js                        // Point d'entrée, contenant la fonction doTheJob()
├── Licence.fr.txt                  // Licence CeCILL en Français
├── License.en.txt                  // Licence CeCILL en Anglais
├── package-lock.json
├── package.json                    // Description du module pour NPM
└── README.md
```
