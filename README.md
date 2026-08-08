# Sproochentest Lëtzebuergesch V19.1

Refonte pédagogique destinée à une personne qui part de zéro.

## Principes

- interface claire et beaucoup moins chargée ;
- un seul parcours principal avec bouton « Continuer » ;
- leçons déverrouillées progressivement ;
- vocabulaire très limité au départ, puis phrases, dialogues et compréhension ;
- seuil de 70 % pour débloquer la leçon suivante ;
- aucune synthèse vocale : les boutons audio ne doivent jouer que des enregistrements humains luxembourgeois vérifiés ;
- recherche automatique de fichiers de prononciation libres sur Wikimedia Commons ;
- module Journal verrouillé jusqu'à acquisition des bases ;
- endpoint serveur prévu pour générer 3 à 5 questions à partir d'une transcription luxembourgeoise, avec difficulté adaptée au niveau.

## Sources audio

La V19.1 privilégie les fichiers de prononciation luxembourgeoise de Wikimedia Commons, notamment ceux issus du Lëtzebuerger Online Dictionnaire et de Lingua Libre. Aucun son synthétique n'est utilisé comme secours.

## Questions automatiques

Le endpoint `/api/generate-questions` utilise la Responses API d'OpenAI uniquement côté serveur. Il nécessite une variable d'environnement `OPENAI_API_KEY` sur Vercel. La transcription peut provenir d'un contenu autorisé ou être fournie manuellement ; l'application ne copie ni n'héberge automatiquement les vidéos RTL.

## PWA

Les données d'apprentissage restent dans le stockage local du navigateur.