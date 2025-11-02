import * as d3 from "d3";

export function addSvgRoot(parentNode) {
  const viewBoxWidth = 1000;
  const viewBoxHeight = 1000;

  const root = d3
    .select(parentNode)
    .append("svg")
    .attr("id", "clock")
    .attr("viewBox", `-${viewBoxWidth / 2} -${viewBoxHeight / 2} ${viewBoxWidth} ${viewBoxHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  return {
    width: viewBoxWidth,
    height: viewBoxHeight,
    root,
    selection: root,
  };
}