import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { Card } from '@/components/ui/card'

interface AuthShellProps {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <Card className="border-border/70 rounded-3xl border p-8 sm:p-10">
            <div className="mb-8 flex flex-col gap-2 text-center">
              <h1 className="text-foreground text-3xl font-bold text-balance">{title}</h1>
              <p className="text-muted-foreground text-base text-balance">{subtitle}</p>
            </div>
            {children}
          </Card>
          <div className="mt-6 text-center text-base">{footer}</div>
        </motion.div>
      </main>
    </div>
  )
}
