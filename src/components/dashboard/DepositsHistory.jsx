import { motion } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, ArrowDownCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

const statusConfig = {
  pending: { label: 'Pendiente', icon: Clock, className: 'bg-primary/10 text-primary border-primary/20' },
  confirmed: { label: 'Confirmado', icon: CheckCircle2, className: 'bg-accent/10 text-accent border-accent/20' },
  rejected: { label: 'Rechazado', icon: XCircle, className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export default function DepositsHistory({ deposits }) {
  if (deposits.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-border bg-card p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ArrowDownCircle className="w-5 h-5 text-primary" />
        </div>
        <h2 className="font-heading font-semibold text-foreground">Historial de Depósitos</h2>
      </div>

      <div className="space-y-2">
        {deposits.map((dep) => {
          const config = statusConfig[dep.status] || statusConfig.pending;
          const Icon = config.icon;
          return (
            <div
              key={dep.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-secondary/50"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {dep.amount.toLocaleString('es-AR')} USDT
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(dep.created_date), "d MMM yyyy, HH:mm", { locale: es })}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={config.className}>
                {config.label}
              </Badge>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}