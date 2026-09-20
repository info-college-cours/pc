# Plateforme Informatique — GitHub Pages

Site statique prêt à publier sur GitHub Pages.

## Contenu

- `index.html` : accueil avec 3 boutons — Cours, Exercices, Groupes.
- `lessons.html` : liste des cours.
- `lesson-01.html` : premier cours « Généralités informatiques ».
- `exercises.html` : exercices interactifs du premier cours.
- `groups.html` : programme du lundi au samedi.
- `css/style.css` : design responsive.
- `js/app.js` : petits scripts communs.
- `assets/images/` : les 3 images originales du cours.

## Groupes

Le site contient 11 classes nommées :

- الثالثة 1
- الثالثة 2
- ...
- الثالثة 11

Pour chaque jour de lundi à samedi, on choisit :

1. la classe ;
2. le Groupe 1 ou le Groupe 2.

Le bouton « Modifier » de la page Groupes enregistre les changements dans le navigateur avec `localStorage`. Cette première version n'a donc pas besoin de serveur ou de base de données.

## Publier sur GitHub Pages

1. Créer un nouveau repository GitHub, par exemple `informatique`.
2. Mettre tous les fichiers de ce dossier à la racine du repository.
3. Dans GitHub : **Settings → Pages**.
4. Choisir **Deploy from a branch**.
5. Sélectionner la branche `main` et le dossier `/ (root)`.
6. Enregistrer.
7. GitHub fournira l'adresse du site.

## Remarque

La programmation des groupes est stockée localement dans le navigateur dans cette version. Si plusieurs appareils doivent voir automatiquement les mêmes changements, une petite base de données ou un service externe sera nécessaire dans une future version.
