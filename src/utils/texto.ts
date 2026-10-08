/** Minúsculas y sin tildes, para búsquedas: "lujan" encuentra "Luján". */
export function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}
