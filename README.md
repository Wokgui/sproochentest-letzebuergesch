# Sproochentest Lëtzebuergesch V18

Version de stabilisation de l'application de préparation au Sproochentest.

## Vérifications V18

- correction de l'erreur JavaScript qui empêchait l'initialisation complète ;
- suppression des écrans et identifiants HTML dupliqués ;
- restauration de l'explorateur de vocabulaire et du parcours de 30 leçons ;
- sauvegarde locale, export JSON et export CSV Anki vérifiés ;
- modules SRS vocabulaire et phrases, carnet d'erreurs, coach vocal, examens stricts, progression et indice de préparation contrôlés ;
- manifeste, icônes et service worker remis en cohérence avec la V18 ;
- navigation et console vérifiées dans un navigateur réel via un serveur local.

## Utilisation

Servir ce dossier par HTTP(S) afin que l'installation PWA, le service worker et le microphone puissent fonctionner. Les données d'apprentissage restent dans le stockage local du navigateur. Les liens officiels INLL, LLO et LOD nécessitent une connexion Internet.

La reconnaissance vocale en luxembourgeois dépend toujours du navigateur et de l'appareil. L'analyse locale ne remplace pas l'évaluation d'un examinateur.
