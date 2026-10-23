# Dar Lalla — Location de caftans

Template de site de **location de caftans, takchitas, tenues de mariée et djellabas** pour les événements
(mariage, fiançailles, henné, aqiqa, Aïd…), avec réservation en ligne et espace d'administration.

Couleurs : prune profonde (#2A0B28) et or (#BB8656). Le nom « Dar Lalla », les coordonnées, les tenues et les
prix sont **fictifs** : ils sont à remplacer par les informations de la boutique.

**Stack :** Next.js 15 (App Router) · Tailwind CSS · Framer Motion · Supabase (base de données, authentification,
stockage, temps réel) · Vercel.

## Comment fonctionne la location

1. La cliente choisit une tenue et la **date de son événement** : la fiche produit affiche aussitôt si la tenue
   est disponible à cette date.
2. Elle réserve (formulaire express, page de réservation ou WhatsApp). Le paiement se fait à la livraison :
   **prix de location** + **caution** rendue au retour de la tenue.
3. Chaque tenue réservée est **bloquée 2 jours avant et 2 jours après** l'événement (livraison, retour, pressing).
   Une tenue en plusieurs exemplaires peut être louée plusieurs fois pour la même date.
4. Dans l'admin, la réservation passe par les statuts : En attente → Confirmée → Chez la cliente → Rendue
   (ou Annulée, ce qui libère la date).

La disponibilité, les prix, la caution et les frais de livraison sont **recalculés dans la base**
(`place_order`) : une cliente ne peut ni modifier un montant ni réserver une tenue déjà prise.

## Pages

| URL | Contenu |
|---|---|
| `/` | Accueil : grand visuel animé, « comment ça marche », tenues les plus demandées, collections, nouveautés, essayage au showroom |
| `/boutique` | Toutes les tenues avec filtres (collection), tri, recherche (`?q=`) et petits prix (`?prix=petits-prix`) |
| `/collections`, `/collections/[slug]` | Collections (Caftans, Takchitas, Tenues de mariée, Djellabas) |
| `/produit/[slug]` | Fiche tenue : galerie, date de l'événement + disponibilité, taille, caution, réservation |
| `/panier` | Ma sélection + date et type d'événement + coordonnées |
| `/commande/[id]` | Confirmation de la réservation |
| `/inscription`, `/connexion`, `/compte` | Comptes clientes et suivi des réservations |
| `/maison` | Histoire, fonctionnement de la location, services, showroom, questions fréquentes |
| `/admin` | Tableau de bord : revenus, réservations, événements des 14 prochains jours, tenues les plus louées |
| `/admin/commandes` | Réservations : date de l'événement, statut, date de livraison |
| `/admin/calendrier` | Calendrier des événements + tenues à livrer dans les 48 h |
| `/admin/produits` | Tenues : prix de location, caution, nombre d'exemplaires, photos |
| `/admin/collections` | Collections, avec image et choix de la taille |
| `/admin/clients` | Clientes et abonnées à la newsletter |
| `/admin/notifications` | Alertes de nouvelles réservations (en temps réel, avec son) |

> Tant que Supabase n'est pas configuré, la vitrine fonctionne en **mode démo** avec `data/catalog.json`
> (la réservation affiche alors un message « Mode démo »).

## Installation

### 1. Créer la base Supabase (gratuite)
1. Créez un projet sur [supabase.com](https://supabase.com).
2. Dans `supabase/schema.sql`, remplacez `admin@darlalla.ma` (2 occurrences) par l'adresse du compte administrateur.
3. Dans **SQL Editor**, exécutez le contenu de `supabase/schema.sql`, puis celui de `supabase/seed.sql`
   (catalogue de démonstration).
4. Dans **Project Settings → API**, copiez l'URL du projet, la clé `anon` et la clé `service_role`.

### 2. Configurer le projet en local
Copiez `.env.example` en `.env.local` et complétez-le (ce fichier n'est jamais publié), puis :
```bash
npm install
npm run create-admin   # crée le compte admin (ADMIN_EMAIL / ADMIN_PASSWORD)
npm run dev            # http://localhost:3000
```
Espace admin : `http://localhost:3000/admin`

### 3. Authentification Supabase
Dans **Authentication → URL Configuration** :
- **Site URL** : l'adresse du site (par ex. `https://dar-lalla.vercel.app`)
- **Redirect URLs** : ajoutez `https://votre-domaine/auth/callback` et `http://localhost:3000/auth/callback`

Pour la confirmation de compte par code à 6 chiffres : **Authentication → Emails → Templates → Confirm signup**,
collez `supabase/email-templates/confirmation-code.html` (sujet : `Votre code de confirmation Dar Lalla : {{ .Token }}`).
Pour envoyer les e-mails depuis votre adresse Gmail, renseignez **SMTP Settings** avec un mot de passe
d'application Google (même valeur que `SMTP_PASS`).

### 4. Déployer sur Vercel
1. Importez ce dépôt sur [vercel.com/new](https://vercel.com/new).
2. Ajoutez les variables : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`,
   `NEXT_PUBLIC_CURRENCY` (`MAD`) et, pour l'e-mail de confirmation, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM_NAME`.
   La clé `service_role` et le mot de passe admin **ne doivent pas** être ajoutés sur Vercel.
3. Lancez le déploiement. Chaque modification poussée sur `main` met le site à jour.

## Personnaliser le template

| Quoi | Où |
|---|---|
| Nom, e-mail, adresse du showroom, horaires, téléphone, Instagram | `lib/constants.ts` (`BRAND`, `STORE`, `SOCIAL_LINKS`) |
| Numéro WhatsApp | `lib/whatsapp.ts` (`WHATSAPP_NUMBER`) |
| Couleurs | `tailwind.config.ts` (`prune`, `or`) |
| Logo | `public/logo-gold.png`, `public/logo.png`, `app/icon.png` et `components/ui/Logo.tsx` |
| Grands visuels de l'accueil et de la page Dar Lalla | `public/images/` (gardez les mêmes noms de fichier) |
| Tailles, types d'événement | `lib/constants.ts` (`SIZES`, `EVENT_TYPES`) — tailles aussi dans `place_order` |
| Jours bloqués autour de l'événement | `BUFFER_DAYS` dans `lib/constants.ts` **et** `reserved_quantity` dans `supabase/schema.sql` |
| Frais de livraison | `SHIPPING_FEE` dans `lib/pricing.ts` **et** `place_order` dans `supabase/schema.sql` |
| Tenues, prix, cautions, photos | Espace admin → Tenues (ou `data/catalog.json` + `npm run seed:generate` pour le catalogue de démo) |

## Photos de démonstration

Les photos de tenues sont dérivées de photos de Yafit Vaknin (Wikimedia Commons, licence CC BY-SA 4.0),
recadrées et recolorées. Le crédit est affiché en bas de page. Voir `public/images/CREDITS.md`.
Remplacez-les par vos propres photos avant la mise en ligne (et retirez alors le crédit dans
`components/site/Footer.tsx`).
