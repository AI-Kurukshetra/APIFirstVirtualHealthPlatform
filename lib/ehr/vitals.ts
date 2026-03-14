export function formatBP(
  systolic: number | null,
  diastolic: number | null
): string {
  if (systolic == null && diastolic == null) return "—"
  if (systolic == null) return `—/${diastolic}`
  if (diastolic == null) return `${systolic}/—`
  return `${systolic}/${diastolic}`
}

export function calcBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  const bmi = weightKg / (heightM * heightM)
  return Math.round(bmi * 10) / 10
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1_048_576) {
    return `${(bytes / 1_048_576).toFixed(1)} MB`
  }
  if (bytes >= 1_024) {
    return `${(bytes / 1_024).toFixed(0)} KB`
  }
  return `${bytes} B`
}
