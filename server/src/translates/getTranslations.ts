/* eslint-disable indent */
import { en } from "./en.js";
import { es } from "./es.js";

export const getTranslations = (lang: string) => {
  switch (lang) {
    case "en":
      return en;
    case "es":
      return es;
    default:
      return en;
  }
};
