const steps = [...document.querySelectorAll(".story-step")];
const stageImage = document.querySelector("#stage-image");
const stageLabel = document.querySelector("#stage-label");
const stageThumbnails = document.querySelector("#stage-thumbnails");
const storyProgress = document.querySelector("#story-progress");

// Image-like logos need breathing room rather than a photographic crop.
const containedImages = new Set([
  "./assets/amalgam-circle-logo.png",
  "./assets/open-jam-square.png",
  "./assets/sci-prov-logo.png",
  "./assets/femme-jam-square.png"
]);

let activeStep = 0;
let imageChangeTimer;

function parseStep(step) {
  return {
    images: step.dataset.images.split("|"),
    alts: step.dataset.alts.split("|"),
    labels: step.dataset.labels.split("|")
  };
}

function showImage(chapter, imageIndex = 0, immediate = false) {
  const image = chapter.images[imageIndex];
  const update = () => {
    stageImage.src = image;
    stageImage.alt = chapter.alts[imageIndex];
    stageImage.dataset.contain = containedImages.has(image) ? "true" : "false";
    stageLabel.textContent = chapter.labels[imageIndex];

    [...stageThumbnails.children].forEach((button, index) => {
      button.setAttribute("aria-current", String(index === imageIndex));
    });

    requestAnimationFrame(() => stageImage.classList.remove("is-changing"));
  };

  window.clearTimeout(imageChangeTimer);

  if (immediate) {
    update();
    return;
  }

  stageImage.classList.add("is-changing");
  imageChangeTimer = window.setTimeout(update, 180);
}

function buildThumbnails(chapter) {
  stageThumbnails.replaceChildren();

  if (chapter.images.length === 1) return;

  chapter.images.forEach((image, index) => {
    const button = document.createElement("button");
    const thumbnail = document.createElement("img");

    button.type = "button";
    button.setAttribute("aria-label", `Show image ${index + 1}: ${chapter.labels[index]}`);
    button.setAttribute("aria-current", String(index === 0));
    button.addEventListener("click", () => showImage(chapter, index));

    thumbnail.src = image;
    thumbnail.alt = "";
    button.append(thumbnail);
    stageThumbnails.append(button);
  });
}

function activateStep(index) {
  if (index === activeStep && stageImage.complete) return;

  activeStep = index;
  steps.forEach((step, stepIndex) => {
    step.classList.toggle("is-active", stepIndex === index);
  });

  const chapter = parseStep(steps[index]);
  buildThumbnails(chapter);
  showImage(chapter);
  storyProgress.textContent = `Chapter ${index + 1} of ${steps.length}`;
}

// The broad center band makes chapter changes feel deliberate on tall and short screens.
const observer = new IntersectionObserver(
  entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

    if (visible.length > 0) {
      activateStep(steps.indexOf(visible[0].target));
    }
  },
  {
    rootMargin: "-30% 0px -30% 0px",
    threshold: [0, 0.25, 0.5, 0.75]
  }
);

steps.forEach(step => observer.observe(step));

// Set the initial chapter and begin preloading the remaining local images.
const firstChapter = parseStep(steps[0]);
buildThumbnails(firstChapter);
showImage(firstChapter, 0, true);

steps.flatMap(step => parseStep(step).images).forEach(source => {
  const image = new Image();
  image.src = source;
});
