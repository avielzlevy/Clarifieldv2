"use client"

import { useState, useCallback, useEffect } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

const FADE_DURATION = 1000
const FADE_DELAY = 200

export default function ThemeSwitch() {
  const { setTheme, resolvedTheme } = useTheme()
  const [fade, setFade] = useState(false)
  const [overlayStyle, setOverlayStyle] = useState({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const changeTheme = useCallback(
    (newTheme: "light" | "dark") => {
      setOverlayStyle({
        backgroundColor: newTheme === "dark" ? "#ffffff" : "#191919",
        opacity: 1,
        transition: `opacity ${FADE_DURATION}ms ease-in`,
      })
      setFade(true)

      setTimeout(() => {
        setTheme(newTheme)
        setOverlayStyle((prev) => ({ ...prev, opacity: 0 }))
        setTimeout(() => setFade(false), FADE_DURATION)
      }, FADE_DELAY)
    },
    [setTheme]
  )

  const handleClick = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark"
    changeTheme(next)
  }

  const icon = !mounted
    ? null
    : resolvedTheme === "dark"
    ? <Sun className="text-yellow-400" size={20} />
    : <Moon className="text-black" size={20} />

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className="hover:bg-transparent"
        aria-label="Toggle theme"
      >
        {icon}
      </Button>

      {fade && (
        <div
          className="fixed inset-0 pointer-events-none z-50"
          style={overlayStyle}
        />
      )}
    </div>
  )
}
