import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus, ArrowUpCircle } from 'lucide-react';
import { differenceInDays, startOfDay } from 'date-fns';

import BalanceCard from '@/components/dashboard/BalanceCard';
import DailyRewards from '@/components/dashboard/DailyRewards';
import DepositsHistory from '@/components/dashboard/DepositsHistory';
import DepositDialog from '@/components/dashboard/DepositDialog';
import WithdrawDialog from '@/components/dashboard/WithdrawDialog';

function calculateCurrentBalance(deposits) {
  const dailyRate = 0.05 / 365;
  const now = new Date();
  let totalBalance = 0;
  let totalConfirmed = 0;

  deposits
    .filter(d => d.status === 'confirmed' && d.confirmed_date)
    .forEach(dep => {
      const confirmedDate = startOfDay(new Date(dep.confirmed_date));
      const today = startOfDay(now);
      const daysActive = differenceInDays(today, confirmedDate);
      // Rendimiento empieza desde el día 2 (daysActive >= 1)
      const effectiveDays = Math.max(0, daysActive - 1);
      const compoundedAmount = dep.amount * Math.pow(1 + dailyRate, effectiveDays);
      totalBalance += compoundedAmount;
      totalConfirmed += dep.amount;
    });

  return { totalBalance, totalConfirmed };
}

export default function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const { data: deposits = [], isLoading } = useQuery({
    queryKey: ['my-deposits', user?.email],
    queryFn: () => base44.entities.Deposit.filter({ user_email: user?.email }, '-created_date'),
    enabled: !!user?.email,
  });

  const { data: withdrawals = [] } = useQuery({
    queryKey: ['my-withdrawals', user?.email],
    queryFn: () => base44.entities.Withdrawal.filter({ user_email: user?.email }, '-created_date'),
    enabled: !!user?.email,
  });

  const { totalBalance: rawBalance, totalConfirmed } = calculateCurrentBalance(deposits);
  const approvedWithdrawals = withdrawals.filter(w => w.status === 'approved').reduce((sum, w) => sum + w.amount, 0);
  const totalBalance = Math.max(0, rawBalance - approvedWithdrawals);
  const earned = Math.max(0, rawBalance - totalConfirmed);
  const dailyRate = 0.05 / 365;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
            Bienvenido a LENDOR
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tu plataforma de rendimientos en USDT
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setWithdrawOpen(true)} className="gap-2">
            <ArrowUpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Retirar</span>
          </Button>
          <Button onClick={() => setDepositOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Depositar</span>
          </Button>
        </div>
      </div>

      <BalanceCard
        totalConfirmed={totalConfirmed}
        currentBalance={totalBalance}
        earned={earned}
        dailyRate={dailyRate * 100}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyRewards deposits={deposits} />
        <DepositsHistory deposits={deposits} />
      </div>

      <DepositDialog
        open={depositOpen}
        onOpenChange={setDepositOpen}
        userEmail={user?.email}
        onDepositCreated={() => queryClient.invalidateQueries({ queryKey: ['my-deposits'] })}
      />
      <WithdrawDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        userEmail={user?.email}
        currentBalance={totalBalance}
        onWithdrawalCreated={() => queryClient.invalidateQueries({ queryKey: ['my-deposits'] })}
      />
    </div>
  );
}