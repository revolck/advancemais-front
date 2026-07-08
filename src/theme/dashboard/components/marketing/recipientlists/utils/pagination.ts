export function getVisiblePages(currentPage: number, totalPages: number) {
  const pages: number[] = [];

  if (totalPages <= 5) {
    for (let page = 1; page <= totalPages; page += 1) pages.push(page);
    return pages;
  }

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const adjustedStart = Math.max(1, end - 4);

  for (let page = adjustedStart; page <= end; page += 1) pages.push(page);
  return pages;
}

export function toRangeStartIso(value: Date | null | undefined) {
  if (!value) return undefined;
  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
    0,
    0,
    0,
    0,
  ).toISOString();
}

export function toRangeEndIso(value: Date | null | undefined) {
  if (!value) return undefined;
  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
    23,
    59,
    59,
    999,
  ).toISOString();
}
