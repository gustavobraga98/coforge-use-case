const monthNames: Record<string, number> = {
  janeiro: 1, fevereiro: 2, marco: 3, abril: 4, maio: 5, junho: 6, julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
}
const currentYear = new Date().getFullYear()
const pad = (value: number) => String(value).padStart(2, '0')

export function toIsoDate(value: string): string | null {
  const normalized = value.trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return normalized
  const numeric = normalized.match(/^(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?$/)
  if (numeric) {
    const day = Number(numeric[1]); const month = Number(numeric[2]); const year = numeric[3] ? Number(numeric[3].length === 2 ? `20${numeric[3]}` : numeric[3]) : currentYear
    return day > 0 && day <= 31 && month > 0 && month <= 12 ? `${year}-${pad(month)}-${pad(day)}` : null
  }
  const pt = normalized.match(/(?:dia\s+)?(\d{1,2})(?:\s+de)?\s+([a-z]+)(?:\s+de)?\s*(\d{4})?/)
  const en = normalized.match(/([a-z]+)\s+(\d{1,2})(?:,)?\s*(\d{4})?/)
  const day = pt ? Number(pt[1]) : en ? Number(en[2]) : 0
  const month = pt ? monthNames[pt[2]] : en ? monthNames[en[1]] : undefined
  const yearText = pt?.[3] ?? en?.[3]
  const year = yearText ? Number(yearText) : currentYear
  return month && day > 0 && day <= 31 ? `${year}-${pad(month)}-${pad(day)}` : null
}

export function formatDate(value: string): string {
  const date = toIsoDate(value)
  if (!date) return value
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

export function formatDateRange(departureDate: string, returnDate: string): string {
  return `${formatDate(departureDate)} a ${formatDate(returnDate)}`
}
