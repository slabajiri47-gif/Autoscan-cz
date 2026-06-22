export const money = (value: number) => `${Math.round(value).toLocaleString('cs-CZ')} Kč`
export const number = (value: number) => value.toLocaleString('cs-CZ')
export const shortDate = (iso: string) => new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))

export const riskMeta = (score: number) => score >= 75
  ? { label: 'Nízké riziko', tone: 'good' as const }
  : score >= 55
    ? { label: 'Střední riziko', tone: 'warn' as const }
    : { label: 'Vysoké riziko', tone: 'danger' as const }
