import { motion } from 'framer-motion'
import { useState } from 'react'
import { FiArrowRight, FiLock, FiMail } from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'
import { useSettings } from '../hooks/useSettings'
import { useToast } from '../hooks/useToast'

export default function LoginPage() {
  const { login } = useAuth()
  const { settings } = useSettings()
  const { notify } = useToast()
  const [email, setEmail] = useState('lopezalvarezjaqueline00@gmail.com')
  const [password, setPassword] = useState('Mossi2026!')
  const [submitting, setSubmitting] = useState(false)
  const logoSrc = `${import.meta.env.BASE_URL}logo-mossi.png`

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitting(true)

    window.setTimeout(async () => {
      const success = await login(email, password)
      setSubmitting(false)

      if (!success) {
        notify({
          title: 'Acceso no autorizado',
          message: 'Revisa el correo y la contrasena de administradora.',
          type: 'error',
        })
      }
    }, 350)
  }

  return (
    <main className="login-shell min-h-screen px-4 py-5 text-[color:var(--ink)] sm:px-6 lg:px-8">
      <div className="login-frame mx-auto grid min-h-[calc(100vh-2.5rem)] w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/55 bg-[color:var(--surface)]/72 shadow-[0_28px_90px_rgba(18,17,15,0.16)] backdrop-blur-xl lg:grid-cols-[0.96fr_1.04fr]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="login-editorial relative min-h-[300px] overflow-hidden px-6 py-7 text-white sm:px-8 lg:flex lg:min-h-full lg:flex-col lg:justify-between lg:p-10"
        >
          <div className="relative z-10 flex items-center justify-between gap-4">
            <span className="text-xs uppercase tracking-[0.28em] text-white/70">
              Private atelier
            </span>
            <span className="rounded-full border border-white/25 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/75">
              SS 2026
            </span>
          </div>

          <div className="relative z-10 mt-20 max-w-sm lg:mt-0">
            <img
              src={logoSrc}
              alt={settings.storeName}
              className="h-16 w-48 rounded-sm object-cover object-center invert sm:w-56"
            />
            <p className="mt-7 max-w-xs text-sm leading-6 text-white/74">
              Inventario privado para compras, pagos y piezas listas para
              entregar.
            </p>
          </div>

          <div className="relative z-10 mt-16 grid grid-cols-3 gap-2 text-[11px] uppercase tracking-[0.2em] text-white/68 lg:mt-0">
            <span>Stock</span>
            <span>Ventas</span>
            <span>Pagos</span>
          </div>
        </motion.section>

        <section className="flex items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="w-full max-w-[430px]"
          >
            <div className="mb-8">
              <img
                src={logoSrc}
                alt={settings.storeName}
                className="h-14 w-40 rounded-sm object-cover object-center sm:w-44"
              />
              <p className="mt-7 text-xs uppercase tracking-[0.26em] text-[color:var(--muted)]">
                Acceso privado
              </p>
              <h1 className="mt-3 text-4xl font-semibold leading-none text-[color:var(--ink)] sm:text-5xl">
                Bienvenida.
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[color:var(--muted)]">
                Entra al panel de Mossi Shop para continuar con el inventario.
              </p>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  Correo electronico
                </span>
                <div className="mt-2 flex items-center gap-3 rounded-lg border border-[color:var(--line)] bg-white/78 px-4 py-3.5 shadow-[0_12px_34px_rgba(23,21,18,0.06)] transition focus-within:border-[color:var(--ink)] focus-within:bg-white">
                  <FiMail className="h-4 w-4 shrink-0 text-[color:var(--muted)]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="focus-ring w-full min-w-0 bg-transparent text-xs text-[color:var(--ink)] outline-none sm:text-sm"
                    placeholder="admin@mossishop.com"
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  Contrasena
                </span>
                <div className="mt-2 flex items-center gap-3 rounded-lg border border-[color:var(--line)] bg-white/78 px-4 py-3.5 shadow-[0_12px_34px_rgba(23,21,18,0.06)] transition focus-within:border-[color:var(--ink)] focus-within:bg-white">
                  <FiLock className="h-4 w-4 shrink-0 text-[color:var(--muted)]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="focus-ring w-full min-w-0 bg-transparent text-xs text-[color:var(--ink)] outline-none sm:text-sm"
                    placeholder="********"
                    required
                  />
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="focus-ring mt-6 flex w-full items-center justify-between rounded-lg bg-[color:var(--ink)] px-5 py-4 text-sm font-semibold text-[color:var(--surface)] shadow-[0_18px_36px_rgba(22,21,19,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(22,21,19,0.28)] disabled:translate-y-0 disabled:opacity-60"
            >
              <span>{submitting ? 'Entrando...' : 'Entrar al dashboard'}</span>
              <FiArrowRight className="h-4 w-4" />
            </button>
          </motion.form>
        </section>
      </div>
    </main>
  )
}
