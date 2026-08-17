# Mise à jour média — Sélection Kaba

- [x] Définir les données média de chaque bien : images multiples et vidéo.
- [x] Ajouter la navigation de galerie image par image.
- [x] Ajouter un mode vidéo intégré avec contrôle lecture/pause.
- [x] Afficher les indicateurs de média et conserver les métadonnées éditoriales.
- [x] Vérifier l’expérience desktop et mobile.
- [x] Compiler, capturer un aperçu et enregistrer un checkpoint livrable.

## Correction des contrastes

- [x] Rendre le fond du menu déroulant clair et cohérent avec la recherche sombre.
- [x] Garantir un texte lisible pour les options, l’option active et le survol.
- [x] Vérifier la compilation et capturer un aperçu de la correction.

## Bandeau de transition Sénégal

- [x] Ajouter un bandeau fin vert, jaune et rouge entre le hero et la recherche.
- [x] Préserver une transition premium, discrète et responsive.
- [x] Vérifier le build, l’aperçu et enregistrer un checkpoint.

## Correction du symbole sénégalais

- [x] Remplacer le losange rouge par une étoile verte sur fond jaune.
- [x] Vérifier le build et l’aperçu final.

## Header sticky

- [x] Fixer le header en haut avec `position: sticky` et `top: 0`.
- [x] Vérifier le contraste et la superposition pendant le défilement.

## Page complète La sélection

- [x] Ajouter une route dédiée `/selection` et son en-tête éditorial.
- [x] Ajouter les filtres vente/location et catégories de biens.
- [x] Afficher les propriétés avec galerie images/vidéo et métadonnées.
- [x] Ajouter une vue détaillée accessible depuis chaque propriété.
- [x] Tester la navigation, le responsive et enregistrer un checkpoint.

## Accès membres Kaba

- [x] Ajouter les routes inscription et connexion.
- [x] Ajouter le choix Agent immobilier / Courtier.
- [x] Afficher les champs de vérification pour les agents.
- [x] Ajouter les états de formulaire et les messages de confirmation.
- [x] Vérifier le responsive et enregistrer un checkpoint.

## Responsivité du header

- [x] Regrouper les actions et éviter le débordement sur tablette.
- [x] Conserver un menu compact et lisible sur mobile.
- [x] Tester les breakpoints et enregistrer un checkpoint.

## Hauteur fixe et scroll du formulaire

- [x] Fixer la page d’accès à `100dvh` sur desktop.
- [x] Autoriser le scroll uniquement dans le panneau de droite.
- [x] Préserver un comportement naturel sur mobile.
- [x] Tester l’inscription et enregistrer un checkpoint.

## Refonte de La sélection

- [x] Auditer les problèmes de structure et de style sur `/selection`.
- [x] Rééquilibrer l’en-tête, les filtres et la grille des biens.
- [x] Harmoniser les médias et les fiches détaillées avec l’accueil.
- [x] Corriger le responsive et valider les états interactifs.
- [x] Enregistrer un checkpoint livrable.

## Vérification du CTA édité

- [x] Vérifier le bouton ciblé à la ligne 141 de `Home.tsx`.
- [x] Confirmer ou corriger manuellement sa destination.
- [x] Valider le build et créer un checkpoint.

## Six biens sur l’accueil

- [x] Étendre la sélection d’accueil à six biens.
- [x] Afficher trois cartes par ligne sur desktop, soit deux lignes.
- [x] Afficher deux cartes par ligne sur mobile.
- [x] Vérifier les médias, l’espacement et le CTA final.
- [x] Enregistrer un checkpoint.

## Dashboard professionnel Kaba

- [x] Ajouter une route `/dashboard` accessible depuis l’espace membre.
- [x] Créer la navigation latérale et la vue d’ensemble.
- [x] Ajouter la gestion des biens et des médias.
- [x] Ajouter les demandes reçues et le profil professionnel.
- [x] Adapter les informations selon Agent immobilier ou Courtier.
- [x] Tester le responsive et enregistrer un checkpoint.

## Accès de démonstration

- [x] Ajouter les identifiants de test visibles sur la page de connexion.
- [x] Valider email et mot de passe de démonstration.
- [x] Rediriger vers `/dashboard` après connexion réussie.
- [x] Afficher une erreur claire en cas d’identifiants incorrects.
- [x] Tester le parcours et enregistrer un checkpoint.

## Navigation simple et accessible

- [x] Remplacer les actions du header par Connexion et Inscription.
- [x] Simplifier les textes et les choix de profil.
- [x] Ajouter des étapes courtes, des boutons larges et des aides visuelles.
- [x] Préparer une aide audio ou une lecture des consignes.
- [x] Tester la lisibilité et enregistrer un checkpoint.

## Assets officiels Kaba

- [x] Préparer header-kaba, icon-kaba et logo-kaba pour le projet.
- [x] Remplacer les logos générés dans le header, l’authentification et le dashboard.
- [x] Ajouter l’icône Kaba comme favicon.
- [x] Vérifier les tailles, proportions et contrastes sur desktop/mobile.
- [x] Enregistrer un checkpoint.

## Correction du logo du header

- [x] Vérifier l’image ciblée à la ligne 111 de `Home.tsx`.
- [x] Supprimer le fond blanc et augmenter la taille du logo.
- [x] Valider le rendu et créer un checkpoint.

## Logo agrandi et headers fixes

- [x] Agrandir le logo officiel dans le header principal.
- [x] Passer les headers principaux en `position: fixed` avec `top: 0`.
- [x] Ajouter les offsets nécessaires pour éviter le chevauchement du contenu.
- [x] Vérifier desktop, mobile et le défilement.
- [x] Enregistrer un checkpoint.

## Vidéo hero depuis archive

- [x] Décompresser `villa-background.zip` et identifier le MP4.
- [x] Téléverser la vidéo dans les assets web.
- [x] L’utiliser en arrière-plan du hero avec fallback image et contraste.
- [x] Tester desktop/mobile et enregistrer un checkpoint.

## Intégration MongoDB sécurisée

- [x] Ajouter le support full-stack/backend au projet.
- [x] Stocker la chaîne MongoDB comme secret d’environnement, jamais dans le code.
- [x] Tester la connexion sans afficher le secret dans les logs.
- [x] Préparer les collections nécessaires pour les biens, utilisateurs et demandes.
- [ ] Révoquer ou renouveler manuellement le mot de passe MongoDB partagé avant production ou récupération publique du code.

## Secret MongoDB sécurisé

- [x] Configurer `MONGODB_URI` via les secrets du projet.
- [x] Éviter toute écriture de la chaîne en clair dans `.env` versionné.
- [x] Ajouter un test backend de connexion sans afficher le secret.
- [x] Documenter la procédure de révocation et de renouvellement avant production.

## Credentials Atlas reçus

- [x] Lire `atlas-credentials.env` fourni et migrer sa valeur vers le gestionnaire de secrets.
- [x] Mettre à jour `MONGODB_URI` avec la valeur Atlas fournie.
- [x] Rejouer le test de ping MongoDB et corriger les dépendances restantes.
- [x] Enregistrer un checkpoint après validation de test.

## Atlas IP Access List confirmée

- [x] Relancer le ping MongoDB après confirmation de `0.0.0.0/0` et de l’IP active.
- [x] Diagnostiquer une éventuelle erreur TLS persistante.
- [x] Documenter le résultat sans exposer les identifiants.
