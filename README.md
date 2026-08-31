# LëtzLies — Readle-first Luxembourgish learning PWA

Version 3.1 autonome, sans framework ni étape de build.

## Lancer

```bash
npm run serve
```

Puis ouvrir `http://localhost:4173`.

## Fonctionnalités principales

- 40 histoires graduées : 14 A1, 14 A2, 12 B1 ;
- 257 exercices de compréhension, vocabulaire et phrases à compléter ;
- dictionnaire local couvrant le corpus court, avec LOD en secours et cache local ;
- audio luxembourgeois Mia/Mil, lecture continue, 0,8×/1× et mode écoute ;
- répétition espacée adaptative mots + phrases ;
- carnet d’erreurs persistant et recommandations « À consolider » ;
- recherche universelle histoires, mots et livres ;
- progression, activité réelle, série quotidienne et export/import ;
- 3 classiques de Michel Rodange avec cache IndexedDB pour lecture hors ligne après téléchargement ;
- Sproochentest : 10 thèmes oral A2, 12 visuels d’entraînement, 3 modèles B1 de 16 questions (48 questions) et test blanc guidé.



## v2.6

- Gestion complète du stockage des livres : taille par livre, téléchargement individuel, suppression individuelle et purge de toutes les copies IndexedDB sans perdre la progression de lecture.
- L’état « hors ligne » est recalculé depuis le stockage réel du navigateur au lieu de faire confiance uniquement aux métadonnées sauvegardées.
- Réglages enrichis avec statistiques du cache dictionnaire, purge du cache et test de disponibilité de l’API publique LOD via l’endpoint documenté `spellchecker/suggestions/{word}`.
- Le dictionnaire local reste prioritaire et couvre toujours 100 % du corpus ; une panne de LOD ne bloque donc jamais la lecture.
- Nouveau flux de mise à jour PWA : une nouvelle version installée attend l’action de l’utilisateur, une carte « Nouvelle version disponible » apparaît, puis `SKIP_WAITING` et rechargement ne sont déclenchés qu’après confirmation.
- Les trois textes Michel Rodange ne sont toujours pas embarqués dans l’archive : le téléchargement direct depuis data.public.lu reste bloqué dans l’environnement de génération. L’application conserve donc son mécanisme de téléchargement/caching côté navigateur.
- Sauvegardes v2.5 et antérieures compatibles.

## v2.4

- Première passe d’**audit linguistique renforcé** sur les 40 histoires, les quiz, les 10 thèmes oraux, les 12 visuels et les 9 textes d’écoute B1.
- Corrections de tournures identifiées comme trop littérales ou incohérentes : construction existentielle `et gëtt`, `eng Mëschung aus…`, formulation de trajet, formulation d’un nouveau collègue, vocabulaire d’un nouvel `Awunner`, superlatif `am beschten` et quelques formulations d’écoute.
- La typologie officielle de l’écoute est maintenant explicite dans les données et l’interface : **message radio → conversation → présentation/échange** pour chacune des trois séries B1.
- Nouveau script `npm run linguistic:audit` : ponctuation, espaces, apostrophes, doublons internes, questions, structure oral/visuels, typologie B1 et régressions linguistiques connues.
- `npm test` exécute désormais l’audit structurel, l’audit linguistique puis le smoke test HTTP.
- Références de contrôle : LOD / Zenter fir d’Lëtzebuerger Sprooch et supports pédagogiques / structure Sproochentest de l’INLL. Cette passe améliore la fiabilité mais ne constitue pas une certification linguistique officielle mot à mot.
- Sauvegardes v2.3 et antérieures compatibles.

## v2.3

- Nouveau **modèle de fragilité** : erreurs actives, oublis SRS, difficulté, dictées faibles et auto-évaluations de prononciation sont combinés pour faire remonter les mots et phrases les plus instables.
- Nouveau parcours **Consolidation intelligente** d’environ 14 minutes : mémoire ciblée → écoute active / dictée → retour au contexte → oral 30 s.
- Les points fragiles apparaissent depuis l’Accueil, Aujourd’hui, Révisions et Progression.
- Le défi adaptatif utilise désormais aussi les éléments les plus fragiles, même lorsqu’ils ne sont pas encore classés comme erreurs récurrentes.
- L’audit Sproochentest est renforcé : unicité des identifiants et questions, structure exacte des modèles, réponses non dupliquées, corrections valides, visuels présents et thèmes oraux suffisamment fournis.
- Aucun nouveau texte d’histoire n’est ajouté dans cette version : priorité à la consolidation et à la cohérence du contenu existant.
- Sauvegardes v2.2 et antérieures compatibles.

## v2.2

- Banque **Héierverstoen B1** étendue de 1 à **3 modèles complets** : chaque modèle conserve la structure 5 + 4 + 7, soit 16 questions, pour un total de **48 questions**.
- Le premier modèle conserve les identifiants historiques `hv1` / `hv2` / `hv3`, afin de garder les scores des sauvegardes v2.1 et antérieures.
- Nouveau sélecteur de modèle B1, progression et score séparés pour chaque modèle.
- Le diagnostic et les compétences utilisent un **modèle de référence** réellement travaillé, au lieu de pénaliser l’utilisateur parce que de nouveaux modèles optionnels ont été ajoutés.
- Banque de description A2 portée de 6 à **12 visuels d’entraînement**.
- Test blanc avec **rotation anti-répétition** : priorité aux thèmes oraux et visuels les moins travaillés.
- Le modèle d’écoute du test blanc tourne également selon l’historique ; les 5 derniers bilans indiquent le modèle utilisé.
- La révision express choisit automatiquement la partie B1 la moins solide, quel que soit le modèle.
- Reprise d’une écoute mémorisée avec **modèle + partie**, tout en conservant les réponses déjà cochées.
- Les seuils et scores restent des indicateurs internes d’entraînement, jamais des résultats officiels du Sproochentest.
- Sauvegardes v2.1 et antérieures compatibles.

## v2.1

- Nouveau **suivi historique des compétences** : un instantané quotidien pour lecture, vocabulaire, grammaire, oral A2 et écoute B1, conservé localement jusqu’à 60 jours.
- L’écran Progression affiche désormais la **tendance récente** de chaque compétence et un historique visuel sur 14 jours.
- Les objectifs du plan hebdomadaire deviennent **adaptatifs** : la compétence prioritaire reçoit un objectif renforcé, figé jusqu’au dimanche pour éviter que le plan change en cours de semaine.
- Nouveau mode **Révision avant examen** : session express d’environ 20 minutes réunissant priorité diagnostique, cartes faibles, oral flash, écoute B1 et consolidation.
- Le mode express est accessible depuis le diagnostic et le Sproochentest, sans être présenté comme une simulation officielle.
- Les sauvegardes v2.0 et antérieures restent compatibles ; l’historique des compétences commence naturellement à se constituer après mise à jour.

## v2.0

- Nouveau **diagnostic Sproochentest** centré sur 6 jalons : entretien A2, description A2, écoute B1, vocabulaire prioritaire, grammaire active et test blanc.
- Le diagnostic combine **couverture + performance** pour éviter qu’un seul bon essai donne une impression artificiellement élevée.
- Nouveau **parcours examen actionnable** : chaque jalon indique l’objectif interne et ouvre directement l’exercice pertinent.
- Nouvelle **carte de maîtrise** : histoires maîtrisées / en cours / à consolider, vocabulaire, grammaire, thèmes oraux et parties d’écoute.
- Accès au diagnostic depuis Accueil, Sproochentest et Progression.
- Les formulations restent explicites : les pourcentages sont des **indicateurs internes d’entraînement**, jamais une prédiction officielle de réussite ou un niveau CECR certifié.
- Import de sauvegarde corrigé : les **plans hebdomadaires** sont désormais restaurés.
- Normalisation des sauvegardes : favoris/histoires dédoublonnés, historiques exacts dédoublonnés et tailles d’historique bornées sans supprimer les données pédagogiques utiles.
- Sauvegardes v1.9 et antérieures compatibles.

## v1.9

- Nouveau **plan hebdomadaire** stable du lundi au dimanche.
- Cinq compétences suivies séparément : lecture, vocabulaire, grammaire, oral A2 et écoute B1.
- L’app identifie la compétence dominante à renforcer et adapte les recommandations d’histoires.
- Objectifs hebdomadaires concrets : 3 histoires, 15 cartes revues, 2 règles maîtrisées, 3 entraînements oraux et 2 parties d’écoute corrigées.
- Une histoire ciblée est choisie pour le focus de la semaine et reste stable jusqu’au dimanche.
- Nouvel écran **Plan de la semaine** avec progression de chaque objectif.
- L’écran Progression affiche désormais les cinq scores de compétence.
- La session Aujourd’hui rappelle le focus hebdomadaire.
- Les scores sont des indicateurs internes d’entraînement, jamais une estimation officielle du niveau CECR ou de réussite au Sproochentest.
- Sauvegardes v1.8 et antérieures compatibles.

## v1.8

- Nouveau mode **Répondre en 30 s** pour transformer les histoires en entraînement oral A2.
- Chaque histoire propose une question orale liée à son thème, avec réécoute et auto-évaluation vocabulaire / fluidité / grammaire.
- En cas d’auto-évaluation faible, l’app remet automatiquement jusqu’à 2 mots de l’histoire dans les révisions et ajoute une règle de grammaire au carnet si nécessaire.
- Suivi oral par thème : travail, famille, loisirs, logement, voyages, alimentation, transport, langues, vie au Luxembourg et quotidien.
- Le thème oral le plus faible remonte comme priorité dans l’écran Sproochentest.
- Réponses flash accessibles aussi directement depuis Sproochentest, avec historique des 20 derniers essais.
- Reprise d’un oral 30 s interrompu depuis la carte « Exercice en cours » de l’accueil.
- Progression enrichie avec moyenne des réponses 30 s et scores par thème oral.
- Sauvegardes v1.7 et antérieures compatibles.

## Audio luxembourgeois Mia / Mil

Le premier chargement utilise RHVoice Luxembourgish. Pour préparer une copie locale/offline :

```bash
npm run audio:offline
```

## Livres libres de droit

```bash
npm run books:import
```

Le script importe les trois textes de Michel Rodange publiés comme **Public Domain** sur data.public.lu. Dans l’application, un premier téléchargement peut aussi être conservé dans IndexedDB pour les lectures suivantes hors ligne.

## Tests

```bash
npm test
```

Le test exécute l’audit du corpus, l’audit linguistique puis un smoke test HTTP et vérifie la présence des fonctions critiques de la version courante.

## v2.5 — examen blanc strict

- Simulation séquentielle persistante : choix de 1 thème parmi 2, entretien 5 min, choix de 1 visuel parmi 3, description 5 min, puis 3 parties B1 / 16 questions.
- Les choix sont verrouillés après confirmation.
- Aucun score ni corrigé n’est affiché pendant la simulation.
- Reprise après fermeture au bon stade via l’état local.
- Bilan final avec auto-évaluation orale et correction B1, enregistré dans l’historique interne.
- Le résultat reste un indice d’entraînement LëtzLies et non une note officielle INLL.


## v2.8

- Les 3 livres Michel Rodange ont désormais une **empreinte SHA-1 officielle** directement associée à leur métadonnée.
- Toute source de livre (fichier embarqué, IndexedDB, téléchargement data.public.lu, import local) est vérifiée avant lecture et stockage.
- Import direct de fichiers `.txt` : le livre est reconnu **par son SHA-1**, jamais par son nom de fichier. Un fichier modifié ou inconnu est refusé.
- Nouvelle sauvegarde séparée de la **bibliothèque hors ligne** : les octets exacts des livres vérifiés sont exportés en JSON/base64 puis revalidés au moment de la restauration.
- Migration automatique des anciens caches IndexedDB texte vers le nouveau format vérifié lorsque leur empreinte est correcte.
- Nouveau `npm run books:audit` : cohérence des 3 empreintes, URLs data.public.lu, script d'import et intégrité de tout texte éventuellement embarqué.
- Les textes complets ne sont toujours pas inclus dans cette archive lorsque le téléchargement serveur est inaccessible ; l'utilisateur peut les télécharger dans l'app ou importer les `.txt` officiels.
- Sauvegardes de progression v2.7 et antérieures compatibles.

## v2.7 — Android / PWA

- Icônes PNG 192×192 et 512×512, plus variantes maskable pour l’installation Android.
- Apple touch icon et métadonnées standalone.
- Gestion des safe areas en haut et en bas, y compris lecteur, navigation et barre audio.
- Cibles tactiles principales de 44 px minimum et mise en page renforcée à 430 px / 360 px.
- Service worker avec fallback de navigation hors ligne et cache runtime limité aux réponses valides.
- Audit mobile/PWA automatique intégré à `npm test`.

La validation visuelle Android réelle reste à faire sur un navigateur capable de rendre l’interface ; Chromium headless du conteneur reste bloqué par DBus/UPower.


## v2.9 — intégrité des sauvegardes et migrations

- Le moteur d’état est isolé dans `src/state.js` et peut être testé sans navigateur.
- Nouveau format d’export `letzlies-progress-v2` avec version de schéma, version de l’app et date d’export.
- Les anciens exports JSON bruts restent importables.
- L’import normalise les anciennes structures et conserve les livres réellement présents sur l’appareil au lieu de recopier des métadonnées hors ligne d’un autre appareil.
- Avant chaque écriture valide, l’état local précédent est conservé dans une copie de secours.
- Si l’état principal devient illisible, LëtzLies tente automatiquement la dernière copie locale valide et le signale dans l’interface.
- Les Réglages permettent de restaurer manuellement la copie locale précédente.
- Nouveau `npm run state:test` : migrations d’anciens états, doublons, identifiants obsolètes, types corrompus, session d’examen strict, priorité au stockage local des livres et round-trip du nouveau format.




## v3.2 — boucle lecture → consolidation → lecture suivante

- Une leçon terminée ouvre désormais un bilan dédié au lieu de revenir directement à l’accueil.
- Le bilan montre le score du quiz, la maîtrise des mots prioritaires, les éléments fragiles et les erreurs encore actives de l’histoire.
- Les mots prioritaires restent cliquables pour ouvrir immédiatement le dictionnaire et les ajouter aux révisions.
- Accès direct à la consolidation intelligente et à un oral de 30 secondes lié à l’histoire.
- La prochaine histoire est choisie par le moteur de recommandation après prise en compte de la leçon qui vient d’être terminée.
- Les histoires déjà terminées proposent un bouton pour rouvrir leur bilan.
- Nouveau `journey:test` pour empêcher la disparition de cette boucle de progression.

## v3.1 — session quotidienne réellement adaptative

- L’objectif 5/10/15/20 min devient un budget de session total.
- La lecture reste le noyau du plan ; les autres tâches ne sont ajoutées que si elles tiennent dans le temps choisi.
- À 10 min, un oral flash peut remplacer une séquence Sproochentest complète.
- Nouveau filtre « Bientôt » : cartes fragiles prévues dans les 3 prochains jours.
- La révision anticipée ne modifie jamais `nextReview`.
- « À renforcer » ajoute seulement un marqueur de fragilité utilisé par la consolidation intelligente.
- Nouveau `reinforcementHistory`, schéma d’état 11 et test pur `planner:test`.

## v3.0 — mesures pédagogiques plus fiables

- La description A2 utilise désormais 5 critères : détails, cohérence, vocabulaire, fluidité et clarté.
- Les anciennes auto-évaluations à un seul critère restent compatibles.
- Chaque correction d'écoute B1 est conservée dans un historique de tentatives au lieu d'écraser la précédente.
- Les simulations strictes alimentent elles aussi cet historique.
- Le diagnostic combine résultat du modèle courant et résultats récents pour éviter qu'une tentative isolée ne masque une faiblesse persistante.
- La progression affiche une tendance récente d'écoute B1.


## v3.3 — remédiation ciblée après erreur
- Les erreurs d’écoute B1 sont désormais conservées question par question dans le carnet d’erreurs.
- Chaque question B1 possède un index de preuve vers la phrase exacte du support qui justifie la réponse.
- Nouvelle vue « Comprendre l’erreur » : réponse donnée, réponse attendue, indice, réécoute du support complet ou du seul indice, puis nouvel essai ciblé.
- Les erreurs de quiz conservent le passage de l’histoire et peuvent y revenir directement.
- Deux réponses correctes ultérieures consolident automatiquement le même point ; la résolution manuelle reste possible.
- Les erreurs du test blanc strict ne sont enregistrées qu’au bilan final, jamais pendant la simulation.
- Historique local des actions de remédiation, sans modifier les échéances du SRS.
