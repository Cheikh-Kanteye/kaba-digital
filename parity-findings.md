# Constats de parité intermédiaires

Le composant d’accueil full-stack affiche maintenant immédiatement le titre hero, sans animation GSAP qui le laisse invisible dans une capture ou à l’arrivée sur la page. Le hero utilise le poster clair officiel `villa-hero-poster_5d277896.jpg` et la vidéo persistante `villa-background_26114bab.mp4`, avec un voile sombre modéré pour préserver la lisibilité tout en laissant la piscine et les mouvements visibles.

Le header est contenu dans la largeur, fixé en haut et reprend le logo Kaba officiel. La recherche est conservée comme formulaire contrôlé et la section de sélection contient les onglets Biens/Terrains, l’introduction éditoriale et les cartes enrichies par les champs MongoDB (média, prix, métriques et professionnel). Le premier screenshot full-page montre la bonne hiérarchie générale mais la requête MongoDB était encore en état de chargement au moment de la capture, donc les cartes live restent à vérifier après résolution du chargement.

Les validations locales `pnpm check`, `pnpm test` et `pnpm build` passent après la réécriture de Home.tsx et l’ajout de la couche CSS de parité. Le build signale seulement l’avertissement connu de taille de bundle Vite.
