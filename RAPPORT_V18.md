# Rapport de stabilisation V18

## Corrections principales

- correction de l'erreur JavaScript fatale `Missing } in template expression` ;
- suppression des écrans et identifiants HTML dupliqués issus des versions précédentes ;
- restauration de l'ouverture du lexique et du parcours complet de 30 leçons ;
- restauration des quatre étapes d'une leçon et de leur sauvegarde ;
- enregistrement effectif des mauvaises réponses dans le carnet d'erreurs ;
- correction de la réécoute depuis le carnet d'erreurs ;
- fiabilisation des exports JSON et CSV avec confirmation visible ;
- arrêt des minuteries d'examen lorsqu'on quitte leur écran ;
- remplacement des alertes intrusives du profil et du microphone par des messages dans l'interface ;
- mise à jour du manifeste et du service worker V18, avec nettoyage des anciens caches.

## Tests effectués

- analyse syntaxique du JavaScript intégré et du service worker : réussie ;
- navigation réelle dans un navigateur local : réussie ;
- console navigateur après chargement final : aucune erreur ni alerte ;
- absence d'identifiants HTML dupliqués : confirmée ;
- lexique : 120 résultats affichés et 30 thèmes disponibles ;
- leçons : 30 leçons affichées, cycle complet testé et progression retrouvée après rechargement ;
- sauvegarde du profil dans le stockage local : retrouvée après rechargement ;
- exports `sproochentest-sauvegarde.json` et `Sproochentest_vocabulaire_Anki.csv` : génération déclenchée et confirmée ;
- écoute B1 et carnet d'erreurs : mauvaise réponse enregistrée et réécoute disponible ;
- SRS de phrases : révélation et quatre niveaux d'évaluation testés ;
- examen strict : démarrage, sujets sans aide et minuterie 05:00 vérifiés ;
- coach vocal : sujet, bouton d'enregistrement et gestion d'indisponibilité vérifiés sans capturer le microphone de l'utilisateur ;
- indice PRÊTE : calcul par six compétences et trois priorités affichés ;
- PWA : manifeste, service worker et icônes 192×192/512×512 servis avec succès en HTTP local.

La reconnaissance vocale `lb-LU` et sa précision restent dépendantes du navigateur et de l'appareil.
