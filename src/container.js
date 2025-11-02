import { addSvgRoot } from "./draw/root";

export function renderUnder(containerId, callback) {
  window.addEventListener("load", () => {
    const svg = addSvg(containerId);
    callback(svg);
  });
}

function addSvg(containerId, dimensions) {
  const container = document.getElementById(containerId);
  return addSvgRoot(container, dimensions);
}
