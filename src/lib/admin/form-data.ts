/** Reading admin form fields into the shapes the zod schemas expect. */

export function str(data: FormData, name: string) {
  const value = data.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function bool(data: FormData, name: string) {
  return data.get(name) === "on";
}

/** `<name>.en` / `<name>.gu` inputs → `{ en, gu }`. */
export function i18n(data: FormData, name: string) {
  return { en: str(data, `${name}.en`), gu: str(data, `${name}.gu`) };
}

/** A textarea with one item per line. */
export function lines(data: FormData, name: string) {
  return str(data, name)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Two textareas (`<name>.en`, `<name>.gu`) whose lines pair up. */
export function i18nLines(data: FormData, name: string) {
  const gu = lines(data, `${name}.gu`);
  return lines(data, `${name}.en`).map((en, i) => ({ en, gu: gu[i] ?? "" }));
}

/** Seven `hours.<day>.opens|closes|closed` rows. */
export function hours(data: FormData) {
  return [0, 1, 2, 3, 4, 5, 6].map((day) => {
    const closed = bool(data, `hours.${day}.closed`);
    return {
      day,
      opens: closed ? null : str(data, `hours.${day}.opens`) || null,
      closes: closed ? null : str(data, `hours.${day}.closes`) || null,
    };
  });
}
