import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'

const triggerBase =
  'flex w-full items-center justify-between gap-2 rounded-xl border bg-white/[0.06] px-3 text-left text-sm text-zinc-100 shadow-sm outline-none transition ' +
  'border-white/10 hover:border-white/15 hover:bg-white/[0.08] ' +
  'focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/25 ' +
  'disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-white/10 disabled:hover:bg-white/[0.06]'

const triggerError =
  'border-red-500/40 focus:border-red-500/50 focus:ring-red-500/20 hover:border-red-500/35'

const listboxBase =
  'max-h-60 overflow-auto rounded-xl border border-white/10 bg-zinc-950/98 py-1 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur-xl'

/**
 * Custom accessible select (listbox) — consistent Nexus Events dark styling.
 *
 * @param {string} value — controlled value (must match an option value)
 * @param {(v: string) => void} onValueChange
 * @param {{ value: string, label: string, disabled?: boolean }[]} options
 */
export function Select({
  id: idProp,
  name,
  value,
  onValueChange,
  options = [],
  placeholder = 'Select…',
  disabled = false,
  error = false,
  className = '',
  triggerClassName = '',
  size = 'md',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}) {
  const autoId = useId()
  const id = idProp || autoId
  const listboxId = `${id}-listbox`
  const triggerRef = useRef(null)
  const listRef = useRef(null)
  const optionsRef = useRef(options)
  useEffect(() => {
    optionsRef.current = options
  }, [options])
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const [highlight, setHighlight] = useState(0)

  const selectedLabel = useMemo(() => {
    const o = options.find((x) => x.value === value)
    return o?.label ?? placeholder
  }, [options, value, placeholder])

  const valueIndex = useMemo(() => options.findIndex((x) => x.value === value), [options, value])
  const hasMatchingValue = valueIndex >= 0

  const updatePosition = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setPos({
      top: rect.bottom + 6,
      left: rect.left,
      width: rect.width,
    })
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    updatePosition()
  }, [open, updatePosition, value, options.length])

  useEffect(() => {
    if (!open) return
    const onScroll = () => updatePosition()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [open, updatePosition])

  useEffect(() => {
    if (!open) return
    function onDoc(e) {
      const t = e.target
      if (triggerRef.current?.contains(t)) return
      if (listRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => {
      const opts = optionsRef.current
      let idx = valueIndex >= 0 ? valueIndex : 0
      if (opts[idx]?.disabled) {
        const fi = opts.findIndex((o) => !o.disabled)
        idx = fi >= 0 ? fi : 0
      }
      setHighlight(idx)
      listRef.current?.focus()
    }, 0)
    return () => clearTimeout(t)
  }, [open, valueIndex])

  const py = size === 'sm' ? 'py-2' : 'py-2.5'

  const selectOption = useCallback(
    (v) => {
      if (disabled) return
      onValueChange?.(v)
      setOpen(false)
    },
    [disabled, onValueChange],
  )

  const onTriggerKeyDown = (e) => {
    if (disabled) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!open) {
        setOpen(true)
        return
      }
    }
    if (e.key === 'Escape' && open) {
      e.preventDefault()
      setOpen(false)
    }
  }

  const onListKeyDown = (e) => {
    if (!options.length) return
    const len = options.length
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      let n = highlight + 1
      while (n < len && options[n]?.disabled) n += 1
      if (n < len) setHighlight(n)
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      let n = highlight - 1
      while (n >= 0 && options[n]?.disabled) n -= 1
      if (n >= 0) setHighlight(n)
      return
    }
    if (e.key === 'Home') {
      e.preventDefault()
      const i = options.findIndex((o) => !o.disabled)
      if (i >= 0) setHighlight(i)
      return
    }
    if (e.key === 'End') {
      e.preventDefault()
      for (let i = len - 1; i >= 0; i--) {
        if (!options[i]?.disabled) {
          setHighlight(i)
          break
        }
      }
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const o = options[highlight]
      if (o && !o.disabled) selectOption(o.value)
    }
  }

  const dropdown = (
    <AnimatePresence>
      {open && (
        <motion.div
          key="select-dropdown"
          ref={listRef}
          id={listboxId}
          role="listbox"
          tabIndex={0}
          aria-labelledby={id}
          aria-activedescendant={`${id}-opt-${highlight}`}
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: pos.width,
            zIndex: 200,
          }}
          className={listboxBase}
          onKeyDown={onListKeyDown}
        >
          {options.map((opt, i) => {
            const selected = opt.value === value
            const hi = i === highlight
            return (
              <button
                key={`${id}-opt-${i}-${String(opt.value)}`}
                type="button"
                role="option"
                aria-selected={selected}
                disabled={opt.disabled}
                id={`${id}-opt-${i}`}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition ${
                  opt.disabled
                    ? 'cursor-not-allowed text-zinc-600'
                    : hi
                      ? 'bg-violet-600/25 text-white'
                      : 'text-zinc-200 hover:bg-white/[0.08]'
                } ${selected && !opt.disabled ? 'font-medium' : ''}`}
                onMouseEnter={() => !opt.disabled && setHighlight(i)}
                onClick={() => !opt.disabled && selectOption(opt.value)}
              >
                <span className="truncate">{opt.label}</span>
                {selected && <Check className="h-4 w-4 shrink-0 text-violet-300" aria-hidden />}
              </button>
            )
          })}
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className={`relative ${className}`}>
      {name != null && <input type="hidden" name={name} value={value ?? ''} />}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-invalid={error || undefined}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onTriggerKeyDown}
        className={`${triggerBase} ${error ? triggerError : ''} ${py} ${triggerClassName}`}
      >
        <span
          className={`min-w-0 flex-1 truncate ${hasMatchingValue ? 'text-zinc-100' : 'text-zinc-500'}`}
        >
          {selectedLabel}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {typeof document !== 'undefined' && createPortal(dropdown, document.body)}
    </div>
  )
}
