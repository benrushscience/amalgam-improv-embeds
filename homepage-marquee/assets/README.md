# Marquee image assets

Put the marquee's public images in this folder and commit them to the repository.

For example, a file named `summer-jam.jpg` is published at:

`https://benrushscience.github.io/amalgam-improv-embeds/homepage-marquee/assets/summer-jam.jpg`

In `../index.html`, point the card to it with:

```js
image: "./assets/summer-jam.jpg"
```

Use optimized JPG, WebP, or PNG files. A landscape image around 1600 × 1000 pixels works well for the card shape. GitHub Pages serves files committed to a public repository, but it is not an image-management service: do not put private, rights-restricted, or unusually large files here.
