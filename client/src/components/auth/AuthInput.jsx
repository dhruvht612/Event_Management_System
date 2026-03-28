import { forwardRef, useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'

const fieldClass =
  'w-full rounded-xl border border-white/10 bg-white/[0.06] py-2.5 pl-10 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none transition-all duration-200 focus:border-violet-500/50 focus:bg-white/[0.09] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.22)]'

export const AuthInput = forwardRef(function AuthInputField(
  {
    label,
    icon: Icon,
    type = 'text',
    className = '',
    id: idProp,
    error,
    ...props
  },
  ref
) {
  const genId = useId()
  const id = idProp || genId
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && show ? 'text' : type

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-400">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-zinc-500">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        )}
        <input
          ref={ref}
          id={id}
          type={inputType}
          className={`${fieldClass} ${isPassword ? 'pr-11' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 z-[1] -translate-y-1/2 rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/10 hover:text-zinc-300"
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
})

AuthInput.displayName = 'AuthInput'
