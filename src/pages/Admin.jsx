import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, Users, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const statusConfig = {
  pending: { label: 'Pendiente', icon: Clock, className: 'bg-primary/10 text-primary border-primary/20' },
  confirmed: { label: 'Confirmado', icon: CheckCircle2, className: 'bg-accent/10 text-accent border-accent/20' },
  rejected: { label: 'Rechazado', icon: XCircle, className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export default function Admin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('pending');
  const [activeTab, setActiveTab] = useState('deposits');

  const { data: deposits = [], isLoading } = useQuery({
    queryKey: ['all-deposits'],
    queryFn: () => base44.entities.Deposit.list('-created_date'),
  });

  const { data: withdrawals = [], isLoading: isLoadingWithdrawals } = useQuery({
    queryKey: ['all-withdrawals'],
    queryFn: () => base44.entities.Withdrawal.list('-created_date'),
  });

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-32">
        <p className="text-muted-foreground">No tenés permisos para acceder a esta página.</p>
      </div>
    );
  }

  const filteredDeposits = filter === 'all'
    ? deposits
    : deposits.filter(d => d.status === filter);

  const handleConfirm = async (deposit) => {
    await base44.entities.Deposit.update(deposit.id, {
      status: 'confirmed',
      confirmed_date: new Date().toISOString(),
    });
    queryClient.invalidateQueries({ queryKey: ['all-deposits'] });
    toast.success(`Depósito de ${deposit.amount} USDT confirmado para ${deposit.user_email}`);
  };

  const handleReject = async (deposit) => {
    await base44.entities.Deposit.update(deposit.id, { status: 'rejected' });
    queryClient.invalidateQueries({ queryKey: ['all-deposits'] });
    toast.success('Depósito rechazado');
  };

  const handleApproveWithdrawal = async (w) => {
    await base44.entities.Withdrawal.update(w.id, {
      status: 'approved',
      approved_date: new Date().toISOString(),
    });
    queryClient.invalidateQueries({ queryKey: ['all-withdrawals'] });
    toast.success(`Retiro de ${w.amount} USDT aprobado para ${w.user_email}`);
  };

  const handleRejectWithdrawal = async (w) => {
    await base44.entities.Withdrawal.update(w.id, { status: 'rejected' });
    queryClient.invalidateQueries({ queryKey: ['all-withdrawals'] });
    toast.success('Retiro rechazado');
  };

  const pendingCount = deposits.filter(d => d.status === 'pending').length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
  const totalConfirmed = deposits
    .filter(d => d.status === 'confirmed')
    .reduce((sum, d) => sum + d.amount, 0);

  const withdrawalStatusConfig = {
    pending: { label: 'Pendiente', icon: Clock, className: 'bg-primary/10 text-primary border-primary/20' },
    approved: { label: 'Aprobado', icon: CheckCircle2, className: 'bg-accent/10 text-accent border-accent/20' },
    rejected: { label: 'Rechazado', icon: XCircle, className: 'bg-destructive/10 text-destructive border-destructive/20' },
  };

  const filteredWithdrawals = filter === 'all'
    ? withdrawals
    : withdrawals.filter(w => w.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
          Panel de Administración
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestionar depósitos y retiros de usuarios
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Depósitos pendientes</span>
          </div>
          <p className="font-heading text-2xl font-bold text-primary">{pendingCount}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-muted-foreground">Retiros pendientes</span>
          </div>
          <p className="font-heading text-2xl font-bold text-yellow-400">{pendingWithdrawals}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownCircle className="w-4 h-4 text-accent" />
            <span className="text-sm text-muted-foreground">Total Confirmado</span>
          </div>
          <p className="font-heading text-2xl font-bold text-foreground">
            {totalConfirmed.toLocaleString('es-AR')} <span className="text-sm text-muted-foreground">USDT</span>
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total Depósitos</span>
          </div>
          <p className="font-heading text-2xl font-bold text-foreground">{deposits.length}</p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('deposits')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'deposits' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Depósitos
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-1 ${activeTab === 'withdrawals' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Retiros
          {pendingWithdrawals > 0 && (
            <span className="bg-yellow-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{pendingWithdrawals}</span>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['pending', activeTab === 'deposits' ? 'confirmed' : 'approved', 'rejected', 'all'].map((f) => (
          <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
            {f === 'pending' ? 'Pendientes' : f === 'confirmed' ? 'Confirmados' : f === 'approved' ? 'Aprobados' : f === 'rejected' ? 'Rechazados' : 'Todos'}
          </Button>
        ))}
      </div>

      {/* Deposits list */}
      {activeTab === 'deposits' && (
        isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredDeposits.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No hay depósitos en esta categoría.</div>
        ) : (
          <div className="space-y-3">
            {filteredDeposits.map((dep) => {
              const config = statusConfig[dep.status] || statusConfig.pending;
              const Icon = config.icon;
              return (
                <motion.div key={dep.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{dep.user_email}</p>
                        <p className="font-heading text-lg font-bold text-foreground">{dep.amount.toLocaleString('es-AR')} USDT</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(dep.created_date), "d MMM yyyy, HH:mm", { locale: es })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={config.className}>{config.label}</Badge>
                      {dep.status === 'pending' && (
                        <>
                          <Button size="sm" variant="outline" className="text-accent border-accent/20 hover:bg-accent/10" onClick={() => handleConfirm(dep)}>
                            <CheckCircle2 className="w-4 h-4 mr-1" />Confirmar
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => handleReject(dep)}>
                            <XCircle className="w-4 h-4 mr-1" />Rechazar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )
      )}

      {/* Withdrawals list */}
      {activeTab === 'withdrawals' && (
        isLoadingWithdrawals ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredWithdrawals.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No hay retiros en esta categoría.</div>
        ) : (
          <div className="space-y-3">
            {filteredWithdrawals.map((w) => {
              const config = withdrawalStatusConfig[w.status] || withdrawalStatusConfig.pending;
              const Icon = config.icon;
              return (
                <motion.div key={w.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <ArrowUpCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{w.user_email}</p>
                        <p className="font-heading text-lg font-bold text-foreground">{w.amount.toLocaleString('es-AR')} USDT</p>
                        {w.wallet_address && (
                          <p className="text-xs font-mono text-muted-foreground mt-0.5 break-all">→ {w.wallet_address}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{format(new Date(w.created_date), "d MMM yyyy, HH:mm", { locale: es })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={config.className}>{config.label}</Badge>
                      {w.status === 'pending' && (
                        <>
                          <Button size="sm" variant="outline" className="text-accent border-accent/20 hover:bg-accent/10" onClick={() => handleApproveWithdrawal(w)}>
                            <CheckCircle2 className="w-4 h-4 mr-1" />Aprobar
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => handleRejectWithdrawal(w)}>
                            <XCircle className="w-4 h-4 mr-1" />Rechazar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}