"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { TIMEZONES, type TimezoneOption } from "@/lib/timezones"

interface TimezoneComboboxProps {
  defaultValue?: string
  name: string
}

function groupByRegion(
  zones: TimezoneOption[]
): Record<string, TimezoneOption[]> {
  return zones.reduce<Record<string, TimezoneOption[]>>((acc, tz) => {
    if (!acc[tz.region]) acc[tz.region] = []
    acc[tz.region].push(tz)
    return acc
  }, {})
}

export function TimezoneCombobox({
  defaultValue = "UTC",
  name,
}: TimezoneComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(defaultValue)

  const selected = TIMEZONES.find((tz) => tz.value === value)
  const grouped = groupByRegion(TIMEZONES)

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-11 w-full justify-between rounded-2xl font-normal"
          >
            <span className="truncate">
              {selected ? selected.label : "Select timezone…"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[420px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search timezone…" />
            <CommandList className="max-h-72">
              <CommandEmpty>No timezone found.</CommandEmpty>
              {Object.entries(grouped).map(([region, zones]) => (
                <CommandGroup key={region} heading={region}>
                  {zones.map((tz) => (
                    <CommandItem
                      key={tz.value}
                      value={`${tz.label} ${tz.value}`}
                      onSelect={() => {
                        setValue(tz.value)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 shrink-0",
                          value === tz.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {tz.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  )
}
