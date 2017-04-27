li-doTheJob
===============

## Présentation ##

Le module **li-dothejob** est un module minimal illustrant la partie fonctionnelle d'un `li-module`.

### Fonctionnement ###

`li-dothejob` effectue ses traitements dans une fonction `doTheJob()` dédiée.

Dans notre cas minimal, le module effectue les opérations suivantes :
  * récupération en entrée d'un `docObject` (objet JSON avec un champ `idIstex`), ainsi que d'une callback `cb`.
  * test sur la valeur du champ `idIstex`
  * renseigne un nouveau champ `canvasOK` avec la valeur `true`, sauf pour une valeur précise d'idIstex
  * Les éventuelles erreurs sont renvoyées en paramètre de la callback `cb`

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
