export function parseDelimitedList(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function stringifyDelimitedList(values: string[] | null | undefined) {
  return values?.join(", ") ?? ""
}

export function getProviderProfileCompleteness(input: {
  bio: string | null | undefined
  education: string | null | undefined
  languages: string[] | null | undefined
  licenseNumber: string | null | undefined
  npiNumber: string | null | undefined
  specialty: string[] | null | undefined
  title: string | null | undefined
}) {
  const checkpoints = [
    Boolean(input.title),
    Boolean(input.licenseNumber),
    Boolean(input.npiNumber),
    (input.specialty?.length ?? 0) > 0,
    Boolean(input.bio),
    (input.languages?.length ?? 0) > 0,
    Boolean(input.education),
  ]

  const completed = checkpoints.filter(Boolean).length

  return Math.round((completed / checkpoints.length) * 100)
}
