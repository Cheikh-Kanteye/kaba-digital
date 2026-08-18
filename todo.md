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
- [x] Documenter que le secret de test actuel est conservé temporairement ; rotation manuelle prévue avant production ou récupération publique du code.

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

## Passage full-stack complet

- [x] Définir les modèles MongoDB, rôles et règles d’accès.
- [x] Remplacer l’authentification de démonstration par une session réelle.
- [x] Connecter les utilisateurs et profils Agent immobilier / Courtier.
- [x] Implémenter le CRUD réel des biens et médias.
- [x] Persister les demandes de contact et leur statut.
- [x] Connecter le dashboard aux données MongoDB.
- [x] Connecter la sélection publique aux biens publiés.
- [x] Ajouter les tests backend et les états de chargement/erreur frontend.
- [x] Valider la sécurité, le build et créer les checkpoints finaux.

## Corrections full-stack détectées

- [x] Lire et afficher le profil Mongo complet Agent/Courtier dans le dashboard.
- [x] Ajouter modifier/supprimer un bien dans le dashboard.
- [x] Permettre plusieurs images par bien dans le formulaire dashboard.
- [x] Supprimer les fallbacks de biens hardcodés et afficher les vrais états chargement/vide/erreur.
- [x] Ajouter des tests Vitest ciblant les procédures Kaba principales.
- [x] Revalider la sécurité, le build et le checkpoint final.


- [x] Afficher les erreurs d’édition et de suppression dans le dashboard.
- [x] Conditionner l’état vide de la sélection à l’absence de chargement ou d’erreur.

- [x] Exécuter un build final de production.
- [x] Enregistrer le checkpoint final après validation.

## Seed administrateur

- [x] Promouvoir OWNER_OPEN_ID en administrateur dans MongoDB et vérifier le rôle persisté.

## Correction logo Auth

- [x] Utiliser le logo carré Kaba avec coins arrondis sur la page Auth et créer un checkpoint après validation.

## Google OAuth et profil obligatoire

- [x] Abandonner Google OAuth à la demande ; conserver l’authentification locale sécurisée.
- [x] Définir cheikhkanteye.contact@gmail.com comme admin côté serveur via l’authentification locale.
- [x] Remplacer la complétion Google par le formulaire de profil intégré à l’inscription locale.
- [x] Ajouter les tests et valider le parcours local, le build et le checkpoint.

## Authentification locale admin

- [x] Remplacer le login de démonstration/OAuth par une connexion locale avec hash de mot de passe et session sécurisée.
- [x] Créer cheikhkanteye.contact@gmail.com avec le rôle admin et le mot de passe temporaire confirmé.
- [x] Tester la connexion, le refus des identifiants invalides et le dashboard admin.
- [x] Construire et enregistrer un checkpoint après validation.

- [x] Créer la table SQL users manquante afin que les sessions locales puissent être hydratées par le middleware existant.
- [x] Rejouer le seed admin et vérifier le login local après migration.

- [x] Tester explicitement un mot de passe invalide et vérifier le refus utilisateur.
- [x] Vérifier une session authentifiée admin jusqu’au dashboard.
- [x] Enregistrer un checkpoint après validation finale de l’authentification locale.

- [x] Persister tous les champs métier du profil local affichés dans le formulaire.
- [x] Vérifier que la session locale admin ouvre bien le dashboard et que les champs métier sont récupérables.

- [x] Retirer le champ PDF non pris en charge du formulaire d’inscription locale.
- [x] Vérifier explicitement la récupération des champs métier via profile.me.

- [x] Vérifier explicitement phone, city, rcNumber, ninea et agencyAddress via profile.me sur un compte local complet.
- [x] Enregistrer le checkpoint final après cette vérification complète.

- [x] Exécuter un test d’intégration sur un vrai compte local complet, puis nettoyer ou conserver uniquement les données nécessaires.
- [x] Créer le checkpoint après cette validation d’intégration réelle.

## Dashboard administrateur séparé

- [x] Ajouter une route et une interface `/admin` distinctes de l’espace Agent/Courtier.
- [x] Rediriger l’admin vers `/admin` et refuser l’accès admin aux comptes standards côté serveur et frontend.
- [x] Tester la séparation des accès, le build et créer un checkpoint.

## Refonte design admin

- [x] Recomposer le dashboard admin avec une direction éditoriale plus distinctive.
- [x] Améliorer les cartes statistiques, la navigation et les blocs d’activité.
- [x] Vérifier le responsive, les états de chargement et le build puis créer un checkpoint.

## Finalisation des autres pages

- [x] Auditer et harmoniser l’accueil et la sélection après la refonte admin.
- [x] Harmoniser l’authentification et l’espace Agent/Courtier avec la nouvelle direction premium.
- [x] Vérifier tous les états dynamiques, le responsive, les tests et créer un checkpoint.

- [x] Corriger le débordement horizontal du dashboard Agent/Courtier sur mobile après l’harmonisation visuelle.

## Séparation des rubriques dashboard

- [x] Garder la Vue d’ensemble limitée aux indicateurs et raccourcis essentiels.
- [x] Déplacer les listes détaillées de biens vers Mes biens, les médias vers Médias et les demandes vers Demandes reçues.
- [x] Vérifier les boutons de navigation, le responsive, les tests et créer un checkpoint.

## Pages admin manquantes

- [x] Créer une vue Utilisateurs dédiée avec données MongoDB et rôles.
- [x] Créer une vue Biens publiés dédiée avec données MongoDB et statuts.
- [x] Créer une vue Demandes dédiée avec données MongoDB et traitement des statuts.
- [x] Brancher la navigation, les états responsive, les tests et créer un checkpoint.

- [x] Vérifier visuellement les pages admin Utilisateurs, Biens publiés et Demandes en mobile et tablette.
- [x] Enregistrer le checkpoint après validation finale des nouvelles pages admin dédiées.

- [x] Vérifier les trois pages admin sur une largeur tablette 768 px.
- [x] Enregistrer le checkpoint final des pages admin dédiées après la vérification tablette.

## Audit parcours et polish final

- [x] Cartographier les routes, CTA et destinations des parcours publics, Auth, professionnel et admin.
- [x] Repérer les CTA sans destination, liens morts, états incomplets et actions sans feedback.
- [x] Corriger les problèmes de contraste, hiérarchie, espacements et responsive détectés.
- [x] Revalider tous les parcours, tests, build et créer un checkpoint.

- [x] Donner une destination au bouton Paramètres et au bouton Notifications du dashboard professionnel.
- [x] Ajouter un feedback clair après la synchronisation du profil et polir les états interactifs concernés.

- [x] Renforcer le contraste et les états focus/disabled des CTA et des messages d’état.
- [x] Stabiliser les espacements et la lisibilité mobile des actions dashboard/admin.
- [x] Enregistrer le checkpoint après ces corrections de polish documentées.

## Docker, Nginx et kaba.digital

- [x] Ajouter un Dockerfile de production compatible avec le serveur Express et le build Vite.
- [x] Ajouter Docker Compose, Nginx, HTTPS Certbot et les variables d’environnement documentées.
- [x] Ajouter les fichiers de configuration DNS et les instructions de déploiement pour `kaba.digital`.
- [x] Valider les fichiers, le build et créer un checkpoint.

- [x] Ajouter une validation CI qui exécute `docker compose config`, `docker build` et `nginx -t` pour les fichiers de production.
- [x] Enregistrer un checkpoint Docker/Nginx après ajout de cette validation reproductible.

## Migration stockage Cloudinary

- [x] Auditer les uploads et références `/manus-storage/` utilisés par les biens.
- [x] Configurer les secrets Cloudinary côté serveur et documenter les variables Docker.
- [x] Remplacer l’upload média par Cloudinary et enregistrer les URLs/métadonnées dans MongoDB.
- [x] Tester images, vidéos, erreurs et build, puis créer un checkpoint.

## Migration legacy MONGO_URI2 et Cloudinary

- [x] Tenter l’audit MONGO_URI2 en lecture seule ; l’inventaire reste impossible car l’URI fournie demeure invalide après normalisation, sans accès ni modification de la source.
- [x] Reporter le mapping legacy jusqu’à la récupération des accès MONGO_URI2, sans modifier la source.
- [x] Reporter le script de migration legacy jusqu’à la récupération des accès MONGO_URI2.
- [x] Utiliser Cloudinary pour les nouveaux uploads et documenter la stratégie des médias legacy ; les médias legacy restent inchangés.
- [x] Tester le stockage média Cloudinary ; migration legacy reportée sans accès source.

- [x] Corriger le Dockerfile : conserver les dépendances nécessaires au runtime (`vite` est encore importé par le serveur bundlé).
- [x] Revalider le démarrage de production et la configuration Cloudinary après correction de l’image.

- [x] Reporter la migration MONGO_URI2 après échec d’authentification Atlas, sans modifier la source legacy.
- [x] Continuer Cloudinary et Docker indépendamment des données legacy.

## Correction déploiement Docker

- [x] Conserver les dépendances nécessaires au runtime dans l’image Docker et supprimer le `prune --prod` fautif.
- [x] Vérifier le build et le démarrage production, puis créer un checkpoint corrigé.

## Compléments Cloudinary requis

- [x] Persister les métadonnées Cloudinary dans chaque média MongoDB.
- [x] Rendre l’upload Cloudinary prioritaire et limiter les URLs manuelles à une compatibilité explicitement documentée.
- [x] Ajouter un test d’intégration du flux upload, bien et relecture MongoDB.
- [x] Créer un checkpoint après validation du code, des tests et du build ; le smoke test fournisseur reste séparé car la clé active est refusée.

## Blocage fournisseur Cloudinary

- [x] Corriger la configuration Cloudinary active : la nouvelle paire et les permissions sont validées par un smoke test réel avec nettoyage du média temporaire.

## Résultat audit legacy

- [x] Tenter l’inventaire MONGO_URI2 en lecture seule ; l’accès est bloqué avant connexion par un paramètre `tls/ssl` invalide dans la chaîne fournie, sans lecture ni modification de la base source.

## Animations GSAP premium

- [x] Installer GSAP et définir un système d’animation cohérent avec la direction éditoriale Kaba.
- [x] Animer le hero, les transitions de sections, les cartes de sélection et les interactions principales.
- [x] Respecter `prefers-reduced-motion`, le responsive et les performances.
- [x] Ajouter ou mettre à jour les tests, vérifier le rendu et publier un checkpoint GSAP.

## Lisibilité typographique

- [x] Augmenter les textes secondaires et micro-libellés trop petits sur l’accueil et la sélection.
- [x] Renforcer les contrastes et la lisibilité mobile sans dégrader la hiérarchie éditoriale.
- [x] Vérifier les captures desktop/mobile, les tests et publier un checkpoint.

## Lisibilité globale de l’application

- [x] Auditer les tailles de texte et contrastes sur Auth, dashboard professionnel et console admin.
- [x] Harmoniser l’échelle typographique et les labels sur toutes les interfaces responsive.
- [x] Vérifier desktop/mobile, tests, captures et publier un checkpoint global de lisibilité.

## Paragraphes plus lisibles

- [x] Auditer les paragraphes et textes descriptifs trop petits dans toute l’application.
- [x] Augmenter leur taille et leur interligne sur desktop et mobile.
- [x] Vérifier les pages clés, les tests et publier un checkpoint.

## Assets absents après déploiement

- [x] Auditer les références d’images, logos et vidéos qui ne survivent pas au déploiement Docker.
- [x] Remplacer les chemins non persistants par des URLs d’assets déployables et conserver des fallbacks fiables.
- [x] Vérifier le build de production, les réponses des assets et publier un checkpoint de correction.

## Assets critiques dans le build public

- [x] Copier les logos, images hero et vidéo critique dans `client/public/assets`.
- [x] Remplacer les références par des chemins racine `/assets/...` et vérifier le fallback image.
- [x] Tester les URLs dans le build de production et republier la correction.

## Dashboard pleine largeur

- [x] Auditer les max-width, marges et grilles qui limitent le dashboard professionnel.
- [x] Étendre le contenu principal et les composants sur la largeur disponible sans créer de débordement.
- [x] Vérifier desktop/mobile, tests et publier un checkpoint.

## Upload média unifié

- [x] Remplacer les champs URL image et vidéo par une zone unique drag-and-drop.
- [x] Gérer plusieurs images et vidéos, aperçus, progression et suppression avant sauvegarde.
- [x] Vérifier le flux Cloudinary, le responsive, les tests et publier un checkpoint.

## Données enrichies issues de l’ancien site

- [x] Comparer les champs legacy visibles avec les modèles Mongo et les composants actuels.
- [x] Ajouter les métadonnées de bien, statistiques d’annonce et profil courtier dans le flux de création.
- [x] Afficher ces informations dans la sélection et les espaces professionnels.
- [x] Vérifier compatibilité, tests, responsive et publier un checkpoint.
