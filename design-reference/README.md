# DealTargets design reference

Original export of the **DealTargets Shopify Storefront** design. This folder is
not part of the theme — Shopify ignores it (it is also listed in
`.shopifyignore`). Keep it here as the source of truth for the look and feel.

## Viewing

Start a local server in this folder and open any `.dc.html` file through it:

```
python -m http.server 8000
# then open http://localhost:8000/Main.dc.html
```

Keep the files together in one folder — each page loads `Header.dc.html`,
`Footer.dc.html`, `ProductCard.dc.html` and `_runtime/` from beside it.

## Status

### Built into the theme

| Design file | Theme files |
| --- | --- |
| `Header.dc.html` | `sections/header.liquid` (announcement bar, search, nav) |
| `MobileMenu.dc.html` | `sections/header.liquid` (`#MenuDrawer` dialog) |
| `Footer.dc.html` | `sections/footer.liquid` |
| `ProductCard.dc.html` | `snippets/product-card.liquid`, `snippets/product-badge.liquid` |
| `Main.dc.html` | `templates/index.json` → `hero`, `trust-strip`, `category-grid`, `promo-banner`, `featured-products`, `feature-cards`, `testimonials`, `blog-posts` |
| `Collection.dc.html` | `sections/collection.liquid`, `sections/search.liquid`, `snippets/facets-*.liquid` |
| `MobileFilters.dc.html` | `snippets/facets-sidebar.liquid` (drawer below 990px) |
| `Product.dc.html` | `sections/product.liquid`, `product-recommendations.liquid`, `product-reviews.liquid` |

### Not built yet — update manually

These pages are mostly static content and are not wired into the theme yet.
Until they are, the theme's generic **Page** template styles any Shopify page
you create (Online Store → Pages), so you can paste the copy in there.

| Design file | Suggested approach |
| --- | --- |
| `About.dc.html` — About & Contact | Create a page “About” + a `page.contact` template with Shopify's `{% form 'contact' %}` |
| `Help.dc.html` — FAQ & Blog | Create a page “Help”; the blog part is already covered by `sections/blog.liquid` |
| `Policies.dc.html` — Store policies | Policies are edited in Settings → Policies; Shopify renders them with the theme layout |
| `Campaign.dc.html` — Black Friday landing | Build a `page.campaign.json` template reusing `hero`, `promo-banner`, `featured-products` and `trust-strip` sections |

## Store setup checklist

Some design elements read real store data. Set these up in Shopify admin:

- **Menus** (Online Store → Navigation)
  - `main-menu`: Graphics Cards, Processors, Motherboards, Memory, Storage,
    Power Supplies, Cases, Cooling, Deals, Build help. A menu item titled
    **Deals** is shown in bold orange (configurable in the header section).
  - A utility menu (Track order, Help, Contact) → pick it in Header → Utility menu.
  - `footer` (Support column) and a Company menu → pick them in the Footer blocks.
  - Optional sub-category pills on a collection: create a menu whose handle
    equals the collection handle (e.g. `graphics-cards`).
- **Filters**: install/open the *Search & Discovery* app and enable filters
  (availability, price, vendor, product type, chipset, memory…).
- **Product badges**: tag products `best-seller` or `new` (tags are configurable
  in Theme settings → Products). “Sale” appears automatically when a
  compare-at price is set.
- **Product metafields** (Settings → Custom data → Products, namespace `custom`):
  - `specs_summary` (single line text) — spec line on product cards
  - `specs` (multi-line text) — Specifications tab, one `Key: Value` per line
  - `highlights` (list of single line text) — arrow bullets in the buy box
  - `mpn` (single line text) — shown next to the SKU
- **Collection metafield** `custom.buying_guide` (rich text) — guide box under
  the collection grid.
- **Reviews**: install a reviews app and add its block to *Testimonials* (home)
  and *Product reviews* (product page). Star ratings use the standard
  `reviews.rating` / `reviews.rating_count` metafields.
- **Home page**: in the theme editor, pick a collection for each *Category grid*
  card and each *Featured products* tab, a hero image, and a *Deal of the day*
  product.
