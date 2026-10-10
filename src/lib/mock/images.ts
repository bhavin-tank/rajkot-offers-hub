/** Unsplash image URL for mock content. */
export function img(id: string, width = 800) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;
}
