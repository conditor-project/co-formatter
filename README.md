[![Build Status](https://travis-ci.org/conditor-project/co-formatter.svg?branch=master)](https://travis-ci.org/conditor-project/co-formatter)

co-formatter
===============

## Présentation ##

Le module **co-formatter** est un module qui permet d'extraire des fichiers XML en format TEI les informations du chapeau Conditor.

### Fonctionnement ###

`co-formatter` effectue ses traitements dans une fonction `doTheJob()` dédiée.

#### Structure d'entrée

Les champs requis dans le JSON d'entrée sont les suivants :

```
{
  id: "unique_document_identifier",
  "metadata":[
      {
        "path":"path_to_document",
        "mime": "application/tei+xml",
        "original": false
      }
    ],
}
```

Le type mime du fichier de métadonnées **doit être** `application/tei+xml`, et le booléen `original` doit valoir `false`.

#### Structure de sortie 

Les champs de sortie correspondent aux métadonnées de la notice utiles pour le dédoublonnage, formant ce qu'on appelle le "chapeau" Conditor. Les valeurs de ces champs sont reprises telles quelles, sans aucun post-traitement, mais leur emplacement dans le JSON de sortie reflète une structure bien définie, correspondant aux besoins métier de Corhal et d'ISTEX :

```
{
  ...,
  title: {
    default: "My Title"  
    fr: "mon titre"  
    en: "My Title"  
  },
  authors: [{
    forename:"John",
    surname: "Good"
  }],
  first3AuthorNamesWithInitials: {
    value: "J Good"
  },
  doi: {
    value: "DOI of document (article-level)"
  },
  host: {
    issn: "ISSN of document host",
    issue: "document number (in the issue for example)"
    volume: "volume number of the document container"
  },
  _business: {
    pageRange: "single string pagination info"
  }
  ...
}
  
```



## Utilisation ##

### Installation ###

Dépendances système :
  * NodeJS 12.0.0+

Commande d'Installation :
```bash
npm install
```

### Vérification du fonctionnement ###
Commande d'exécution des tests unitaires :
```bash
npm test
```

### Utilisation pour mise au point du fichier de configuration

La commande suivante traite automatiquement l'ensemble des fichiers contenus dans `test/dataset/in`, et écrit les fichiers résultats dans le répertoire `test/dataset/out`

```bash
npm run preview
```

### Exécution ###

Comme pour tous les modules, la présente partie métier n'est pas destinée à être exécutée directement, puisqu'elle consiste uniquement à mettre à disposition une fonction `doTheJob`.

L'exécution se fera donc en appelant cette fonction depuis une instanciation de `li-canvas` ou indirectement depuis les tests unitaires.

## Annexes ##

### Arborescence ###

```
.
├── index.js                        // Point d'entrée, contenant la fonction doTheJob()
├── node_modules                    // Modules NPM
│   ├── ...
├── package.json                    // No comment
├── README.md
└── test                            // Fichiers nécessaires aux TU
    ├── dataset                     // rép de données de tests
    │   └── in
    |       └── test.json          // contient 2 docObjects pris en entrée des TU
    ├── preview.js                  
    ├── run.js                      // point d'entrée des TU
    └──
```

