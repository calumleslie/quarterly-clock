import { modelForDate, parseParameters } from "./model/model.js";
import { renderUnder } from "./container";
import { draw } from "./draw/draw";
import "@fortawesome/fontawesome-free/css/all.css";

console.log("Quarterly Clock");
const now = new Date();
//const now = new Date("11 Dec 2021 00:00:00 GMT");
// const now = new Date("01 Jan 2022 00:00:00 GMT");
// const now = new Date("01 Feb 2022 00:00:00 GMT");
// const now = new Date("31 Mar 2022 00:00:00 GMT");
// const now = new Date("01 Apr 2022 00:00:00 GMT");
// const now = new Date("01 May 2022 00:00:00 GMT");
// const now = new Date("30 Jun 2022 00:00:00 GMT");
// const now = new Date("01 Jul 2022 00:00:00 GMT");
// const now = new Date("01 Aug 2022 00:00:00 GMT");
// const now = new Date("30 Sep 2022 00:00:00 GMT");
// const now = new Date("01 Oct 2022 00:00:00 GMT");
// const now = new Date("01 Nov 2022 00:00:00 GMT");
// const now = new Date("31 Dec 2022 00:00:00 GMT");
console.log("Now:", now);
const params = parseParameters(new URLSearchParams(document.location.search));
console.log("Params", params);
const dataModel = modelForDate(now, params);
console.log("Data Model:", JSON.stringify(dataModel));
renderUnder("container", (svg) => {
  draw(dataModel, svg);
});
