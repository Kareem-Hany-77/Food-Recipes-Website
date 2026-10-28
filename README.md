# Step by Step

A home-cooking recipe website built with plain HTML, CSS and a little JavaScript. No framework, no build step, no backend.

**Live site:** https://kareem-hany-77.github.io/Food-Recipes-Website/

## Features

- 36 recipes across Main Dishes, Snacks, Desserts and Drinks
- Every recipe has an **ingredient checklist** and a **step-by-step method** you can tick off
- A sticky **progress bar** and a highlighted "up next" step
- Progress is **saved in your browser**, so you can come back to where you stopped
- **Cook mode**: bigger text, and the screen stays awake (on supported browsers)
- **Search by recipe or ingredient**, plus course filters
- Print-friendly recipe pages
- Responsive layout for phones, tablets and desktops
- Recipe structured data (schema.org) for search engines

## Project structure

```
index.html            Home page
recipes.html          All recipes, with search and filters
main.html             Main dishes
snacks.html           Snacks
dessert.html          Desserts
drinks.html           Drinks
advices.html          Cooking advice
vid.html              Videos
<recipe>.html         One page per recipe (koshari.html, tacos.html, ...)
style.css             All styles
app.js                Checklists, progress, search, cook mode
img/                  Optimized photos (WebP)
favicon.svg           Site icon
sitemap.xml, robots.txt
```

## Run locally

1. Download or clone the repository.
2. Open `index.html` in any browser.

(Fonts load from Google Fonts, so they need an internet connection.)

## Notes

- Front-end only, built as a learning project.
- Developed by Kareem Hany.
