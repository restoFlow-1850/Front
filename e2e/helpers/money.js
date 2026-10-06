// formatSom() → toLocaleString('ru-RU'): minglar NBSP (U+00A0) bilan ajratiladi
// ("38 000 so'm"). \s NBSP'ni ham ushlaydi — regex shu farqqa bog'liq bo'lmaydi.
export function somPattern(amount) {
  const grouped = Number(amount)
    .toLocaleString('ru-RU')
    .replace(/\s/g, '\\s')
  return new RegExp(grouped)
}
