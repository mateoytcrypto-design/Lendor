import { motion } from 'framer-motion';
import { Wallet, TrendingUp } from 'lucide-react';

export default function BalanceCard({ totalConfirmed, currentBalance, earned = 0, dailyRate }) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8"
    >
      {/* Decorative gradient */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Balance Total</p>
        </div>

        <p className="font-heading text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
          {currentBalance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          <span className="text-lg sm:text-xl text-muted-foreground ml-2">USDT</span>
        </p>

        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary">
            <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Depositado:</span>
            <span className="text-xs font-semibold text-foreground">
              {totalConfirmed.toLocaleString('es-AR', { minimumFractionDigits: 2 })} USDT
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10">
            <TrendingUp className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs text-accent">Ganancia:</span>
            <span className="text-xs font-semibold text-accent">
              +{earned.toLocaleString('es-AR', { minimumFractionDigits: 4 })} USDT
            </span>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          APY 5%
        </p>
      </div>
    </motion.div>
  );
}
