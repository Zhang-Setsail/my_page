const RESULT_ROOT = "static/results";

const scenes = ["Scene40", "Scene36", "Scene38", "Scene39", "Scene37"];
const angles = ["0", "45", "90", "135"];
const reconstructionMethods = [
  { value: "ours", label: "CPDDNet (Ours)", file: "ours" },
  { value: "igri2", label: "IGRI-2", file: "igri2" },
  { value: "tcpd", label: "TCPD", file: "tcpd" },
  { value: "pfcd_igri2", label: "PFCD->IGRI-2", file: "pfcd_igri2" },
  { value: "tcpd_unet", label: "TCPD->Unet", file: "tcpd_unet" },
  { value: "unet_tcpd", label: "Unet->TCPD", file: "unet_tcpd" },
  { value: "igri2_bm3d", label: "IGRI-2->BM3D", file: "igri2_bm3d" }
];
const leftChoices = [
  { value: "reference", label: "Reference", file: "reference", isReference: true },
  ...reconstructionMethods
];

const state = {
  scene: "Scene40",
  angle: "0",
  leftMethod: "igri2",
  slider: 50
};

function resultPath(scene, file, angle) {
  return `${RESULT_ROOT}/${scene}/${file}_${angle}.png`;
}

function getLeftChoice() {
  return leftChoices.find((choice) => choice.value === state.leftMethod) || leftChoices[0];
}

function button(label, isActive, attributes = {}) {
  const el = document.createElement("button");
  el.type = "button";
  el.textContent = label;
  if (isActive) el.classList.add("is-active");
  Object.entries(attributes).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
}

function renderTabs() {
  const sceneTabs = document.getElementById("scene-tabs");
  const angleTabs = document.getElementById("angle-tabs");
  const methodTabs = document.getElementById("method-tabs");

  sceneTabs.innerHTML = "";
  angleTabs.innerHTML = "";
  methodTabs.innerHTML = "";

  scenes.forEach((scene) => {
    const tab = button(scene.replace("Scene", "Scene "), scene === state.scene, { "data-scene": scene });
    tab.addEventListener("click", () => {
      state.scene = scene;
      updateView();
    });
    sceneTabs.appendChild(tab);
  });

  angles.forEach((angle) => {
    const tab = button(`${angle} deg`, angle === state.angle, { "data-angle": angle });
    tab.addEventListener("click", () => {
      state.angle = angle;
      updateView();
    });
    angleTabs.appendChild(tab);
  });

  leftChoices.forEach((choice) => {
    const tab = button(choice.label, choice.value === state.leftMethod, { "data-method": choice.value });
    tab.addEventListener("click", () => {
      state.leftMethod = choice.value;
      updateView();
    });
    methodTabs.appendChild(tab);
  });
}

function renderMethodMatrix() {
  const matrix = document.getElementById("method-matrix");
  matrix.innerHTML = "";

  const entries = [
    { label: "Ground Truth", file: "reference", isReference: true },
    ...reconstructionMethods
  ];

  entries.forEach((entry) => {
    const figure = document.createElement("figure");
    figure.className = `method-card${entry.value === "ours" ? " is-ours" : ""}`;

    const image = document.createElement("img");
    image.loading = "lazy";
    image.src = resultPath(state.scene, entry.file, state.angle);
    image.alt = `${entry.label} ${state.scene} ${state.angle} degree result`;

    const caption = document.createElement("figcaption");
    const name = document.createElement("span");
    name.textContent = entry.label;
    const meta = document.createElement("span");
    meta.textContent = entry.isReference ? "Reference" : `${state.angle} deg`;
    caption.append(name, meta);

    figure.append(image, caption);
    matrix.appendChild(figure);
  });
}

function updateComparisonImages() {
  const leftImage = document.getElementById("left-image");
  const rightImage = document.getElementById("right-image");
  const gtPreview = document.getElementById("gt-preview");
  const oursPreview = document.getElementById("ours-preview");
  const leftMethodLabel = document.getElementById("left-method-label");
  const selectionTitle = document.getElementById("selection-title");
  const leftChoice = getLeftChoice();

  leftImage.src = resultPath(state.scene, leftChoice.file, state.angle);
  leftImage.alt = `${leftChoice.label} ${state.scene} ${state.angle} degree image`;
  rightImage.src = resultPath(state.scene, "ours", state.angle);
  rightImage.alt = `CPDDNet ${state.scene} ${state.angle} degree reconstruction`;
  gtPreview.src = resultPath(state.scene, "reference", state.angle);
  gtPreview.alt = `Ground truth ${state.scene} ${state.angle} degree image`;
  oursPreview.src = resultPath(state.scene, "ours", state.angle);
  oursPreview.alt = `CPDDNet preview ${state.scene} ${state.angle} degree image`;

  leftMethodLabel.textContent = leftChoice.label;
  selectionTitle.textContent = `${state.scene.replace("Scene", "Scene ")} · ${state.angle} deg`;
}

function updateSlider(value = state.slider) {
  const viewer = document.querySelector(".compare-viewer");
  const overlay = document.getElementById("compare-overlay");
  const divider = document.getElementById("compare-divider");
  const leftImage = document.getElementById("left-image");

  state.slider = Number(value);
  const position = `${state.slider}%`;
  overlay.style.width = position;
  divider.style.left = position;
  leftImage.style.setProperty("--viewer-width", `${viewer.clientWidth}px`);
}

function updateView() {
  renderTabs();
  updateComparisonImages();
  updateSlider();
  renderMethodMatrix();
}

document.addEventListener("DOMContentLoaded", () => {
  const slider = document.getElementById("compare-slider");
  slider.addEventListener("input", (event) => updateSlider(event.target.value));
  window.addEventListener("resize", () => updateSlider());
  updateView();
});
