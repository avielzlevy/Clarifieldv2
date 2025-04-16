"use client"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Boxes, Book, FileJson, ChevronDown, ChevronUp, Search as LucideSearch } from "lucide-react"
import { useSearch } from "../contexts/SearchContext"
import { useRtl } from "../contexts/RtlContext"
import { useTranslation } from "react-i18next"
import { useCallback, useEffect, useMemo, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import '../i18n';

interface SearchableItem {
  type: "Entity" | "Definition" | "Format"
  name: string
}


export function SearchBar() {
  const { setSearch, refreshSearchables } = useSearch()
  const { t } = useTranslation()
  const { rtl } = useRtl()
  const [searchables, setSearchables] = useState<SearchableItem[]>([])
  const [inputValue, setInputValue] = useState("")
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const groupIconMap = useMemo(
    () => ({
      Entity: <Boxes className="mr-2 h-4 w-4" />,
      Definition: <Book className="mr-2 h-4 w-4" />,
      Format: <FileJson className="mr-2 h-4 w-4" />,
    }),
    []
  )

  useEffect(() => {
    const fetchSearchables = async () => {
      try {
        const [entities, definitions, formats] = await Promise.all([
          axios.get("/api/entities"),
          axios.get("/api/definitions"),
          axios.get("/api/formats"),
        ])

        const mapped: SearchableItem[] = [
          ...Object.values(entities.data as { label: string }[]).map((e) => ({ type: "Entity", name: e.label } as SearchableItem)),
          ...Object.keys(definitions.data).map((d) => ({ type: "Definition", name: d } as SearchableItem)),
          ...Object.keys(formats.data).map((f) => ({ type: "Format", name: f } as SearchableItem)),
        ]

        setSearchables(mapped)
      } catch (e) {
        console.error("Search fetch failed:", e)
      }
    }

    fetchSearchables()
  }, [refreshSearchables])

  const handleSelect = useCallback(
    (item: SearchableItem) => {
      setSearch(true)

      if (item.type === "Entity") {
        const index = searchables.findIndex((s) => s.name === item.name)
        localStorage.setItem("reactFlowCenter", JSON.stringify({ x: index * 150, y: -200, zoom: 2 }))
        router.push("/entities")
      } else if (item.type === "Definition") {
        router.push("/definitions")
      } else if (item.type === "Format") {
        router.push("/formats")
      }

      setInputValue("")
      setOpen(false)
    },
    [searchables, setSearch,router]
  )

  const grouped = useMemo(() => {
    const groups = { Entity: [], Definition: [], Format: [] } as Record<
      string,
      SearchableItem[]
    >
    for (const item of searchables) {
      groups[item.type].push(item)
    }
    return groups
  }, [searchables])

  const filtered = useMemo(() => {
    return searchables.filter((item) =>
      item.name.toLowerCase().includes(inputValue.toLowerCase())
    )
  }, [inputValue, searchables])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[300px] justify-start text-muted-foreground">
          <LucideSearch className="mr-2 h-4 w-4" />
          {inputValue ? inputValue : t("navbar.search")}
          {open ? <ChevronUp className="ml-auto h-4 w-4" /> : <ChevronDown className="ml-auto h-4 w-4" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[300px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t("navbar.search")}
            value={inputValue}
            onValueChange={setInputValue}
            className="h-9"
          />
          <CommandList dir={rtl ? "rtl" : "ltr"}>
            {filtered.length === 0 && <CommandEmpty>{t("common.noResults")}</CommandEmpty>}
            {Object.entries(grouped).map(([type, items]) => {
              const visibleItems = items.filter((item) =>
                item.name.toLowerCase().includes(inputValue.toLowerCase())
              )
              if (!visibleItems.length) return null

              return (
                <CommandGroup
                  key={type}
                  heading={
                    <div className="flex items-center px-2 py-1 text-sm font-bold bg-muted">
                      {groupIconMap[type as keyof typeof groupIconMap]}
                      {t(`common.${type.toLowerCase()}`)}
                    </div>
                  }
                >
                  {visibleItems.map((item) => (
                    <CommandItem key={item.name} onSelect={() => handleSelect(item)}>
                      {item.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
