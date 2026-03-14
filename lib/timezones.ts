export interface TimezoneOption {
  value: string
  label: string
  region: string
}

export const TIMEZONES: TimezoneOption[] = [
  // Americas
  { value: "America/New_York", label: "Eastern Time (ET) — New York, Miami", region: "Americas" },
  { value: "America/Chicago", label: "Central Time (CT) — Chicago, Dallas", region: "Americas" },
  { value: "America/Denver", label: "Mountain Time (MT) — Denver, Phoenix", region: "Americas" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT) — Los Angeles, Seattle", region: "Americas" },
  { value: "America/Anchorage", label: "Alaska Time — Anchorage", region: "Americas" },
  { value: "Pacific/Honolulu", label: "Hawaii Time — Honolulu", region: "Americas" },
  { value: "America/Toronto", label: "Eastern Time — Toronto", region: "Americas" },
  { value: "America/Vancouver", label: "Pacific Time — Vancouver", region: "Americas" },
  { value: "America/Mexico_City", label: "Central Time — Mexico City", region: "Americas" },
  { value: "America/Sao_Paulo", label: "Brasília Time — São Paulo", region: "Americas" },
  { value: "America/Argentina/Buenos_Aires", label: "Argentina Time — Buenos Aires", region: "Americas" },
  { value: "America/Bogota", label: "Colombia Time — Bogotá", region: "Americas" },
  { value: "America/Lima", label: "Peru Time — Lima", region: "Americas" },
  // Europe
  { value: "Europe/London", label: "GMT/BST — London, Dublin", region: "Europe" },
  { value: "Europe/Paris", label: "CET/CEST — Paris, Berlin, Rome", region: "Europe" },
  { value: "Europe/Amsterdam", label: "CET/CEST — Amsterdam, Brussels", region: "Europe" },
  { value: "Europe/Madrid", label: "CET/CEST — Madrid", region: "Europe" },
  { value: "Europe/Zurich", label: "CET/CEST — Zurich, Geneva", region: "Europe" },
  { value: "Europe/Warsaw", label: "CET/CEST — Warsaw, Prague", region: "Europe" },
  { value: "Europe/Stockholm", label: "CET/CEST — Stockholm, Oslo", region: "Europe" },
  { value: "Europe/Helsinki", label: "EET/EEST — Helsinki, Tallinn", region: "Europe" },
  { value: "Europe/Athens", label: "EET/EEST — Athens, Bucharest", region: "Europe" },
  { value: "Europe/Istanbul", label: "TRT — Istanbul", region: "Europe" },
  { value: "Europe/Moscow", label: "MSK — Moscow", region: "Europe" },
  // Middle East & Africa
  { value: "Asia/Dubai", label: "GST — Dubai, Abu Dhabi", region: "Middle East & Africa" },
  { value: "Asia/Riyadh", label: "AST — Riyadh, Kuwait", region: "Middle East & Africa" },
  { value: "Asia/Jerusalem", label: "IST — Jerusalem, Tel Aviv", region: "Middle East & Africa" },
  { value: "Africa/Cairo", label: "EET — Cairo", region: "Middle East & Africa" },
  { value: "Africa/Johannesburg", label: "SAST — Johannesburg, Cape Town", region: "Middle East & Africa" },
  { value: "Africa/Lagos", label: "WAT — Lagos, Nairobi", region: "Middle East & Africa" },
  // Asia & Pacific
  { value: "Asia/Karachi", label: "PKT — Karachi", region: "Asia & Pacific" },
  { value: "Asia/Kolkata", label: "IST — Mumbai, Delhi, Bangalore", region: "Asia & Pacific" },
  { value: "Asia/Dhaka", label: "BST — Dhaka", region: "Asia & Pacific" },
  { value: "Asia/Bangkok", label: "ICT — Bangkok, Jakarta", region: "Asia & Pacific" },
  { value: "Asia/Singapore", label: "SGT — Singapore, Kuala Lumpur", region: "Asia & Pacific" },
  { value: "Asia/Shanghai", label: "CST — Shanghai, Beijing", region: "Asia & Pacific" },
  { value: "Asia/Hong_Kong", label: "HKT — Hong Kong", region: "Asia & Pacific" },
  { value: "Asia/Tokyo", label: "JST — Tokyo, Osaka", region: "Asia & Pacific" },
  { value: "Asia/Seoul", label: "KST — Seoul", region: "Asia & Pacific" },
  { value: "Australia/Sydney", label: "AEST/AEDT — Sydney, Melbourne", region: "Asia & Pacific" },
  { value: "Australia/Brisbane", label: "AEST — Brisbane", region: "Asia & Pacific" },
  { value: "Australia/Perth", label: "AWST — Perth", region: "Asia & Pacific" },
  { value: "Pacific/Auckland", label: "NZST/NZDT — Auckland", region: "Asia & Pacific" },
  // UTC
  { value: "UTC", label: "UTC — Coordinated Universal Time", region: "UTC" },
]

export function getTimezoneLabel(value: string): string {
  return TIMEZONES.find((tz) => tz.value === value)?.label ?? value
}
