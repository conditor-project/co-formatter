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
  path: "path_to_document"
}
```

#### Structure de sortie 

Les champs de sortie correspondent aux métadonnées de la notice utiles pour le dédoublonnage, formant ce qu'on appelle le Conditor. Les valeurs de ces champs sont reprises telles quelles, sans aucun post-traitement :

```
{
  ...,
  title: {
    value: "My Title"  
  },
  author: {
    value: "Single field with full author names (ex : Jean BON)"
  },
  first3AuthorNamesWithInitials: {
    value: "Single field with full lastnames and initials (ex J. BON)"
  },
  doi: {
    value: "DOI of document (article-level)"
  },
  issn: {
    value: "ISSN of document host"
  },
  issue: {
    value: "document number (in the issue for example)"
  },
  pageRange: {
    value: "document pagination"
  },
  volume: {
    value: "volume number of the document container"
  }
}
  
```



## Utilisation ##

### Installation ###

Dépendances système :
  * NodeJS 4.0.0+

Commande d'Installation :
```bash
npm install
```

### Vérification du fonctionnement ###
Commande d'exécution des tests unitaires :
```bash
npm test
```

### Exécution ###

Comme pour tous les modules, la présente partie métier n'est pas destinée à être exécutée directement, puisqu'elle consiste uniquement à mettre à disposition une fonction `doTheJob`.

L'exécution se fera donc en appelant cette fonction depuis une instanciation d`li-canvas` ou indirectement depuis les tests unitaires.

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
    ├── run.js                      // point d'entrée des TU
    └──
```

### Codes d'erreur ###

Plage de codes : 0~99

| Code | Signification           | Note(s) |
| ---- | ----------------------- | ------- |
| 0    | Tout s'est bien passé   |         |
| 1    | J\'aime po cet ID là... |         |
