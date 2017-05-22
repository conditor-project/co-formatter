[![Build Status](https://travis-ci.org/conditor-project/co-formatter.svg?branch=master)](https://travis-ci.org/conditor-project/co-formatter)

co-formatter
===============

## Présentation ##

Le module **co-formatter** est un module qui permet d'extraire des fichiers xml en format TEI les informations du chapeau Conditor.

### Fonctionnement ###

`co-formatter` effectue ses traitements dans une fonction `doTheJob()` dédiée.



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

Code | Signification | Note(s)
------ | ---------------- | ---------
0 | Tout s'est bien passé |
1 | J\'aime po cet ID là... |
