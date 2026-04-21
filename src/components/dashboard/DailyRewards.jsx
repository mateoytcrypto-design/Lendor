import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Clock } from 'lucide-react';
import { format, differenceInDays, startOfDay, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

function calculateDailyRewards(deposits) {
  const dailyRate = 0.05 / 365;
  const today = startOfDay(new Date());
  const rewards = [];

  // Get all confirmed deposits sorted by confirmed_date
  const confirmedDeposits = deposits
    .filter(d => d.status === 'confirmed' && d.confirmed_date)
    .sort((a, b) => new Date(a.confirmed_date) - new Date(b.confirmed_date));

  if (confirmedDeposits.length === 0) return rewards;

  const earliest = startOfDay(new Date(confirmedDeposits[0].confirmed_date));
  const totalDays = differenceInDays(today, earliest);

  // Calculate rewards for each day (last 30 days max for display)
  const startDay = Math.max(0, totalDays - 29);

  for (let i = startDay; i <= totalDays; i++) {
    const day = addDays(earliest, i);

    // Calculate base amount on this day (sum of all confirmed deposits up to this day)
    let baseOnDay = 0;
    confirmedDeposits.forEach(dep => {
      const depDate = startOfDay(new Date(dep.confirmed_date));
      if (depDate <= day) {
        // Calculate compounded amount for this deposit
            const daysActive = differenceInDays(day, depDate);
        if (daysActive >= 1) {
          baseOnDay += dep.amount * Math.pow(1 + dailyRate, daysActive);
        }
      }
    });

    const dailyReward = baseOnDay * dailyRate;

    if (dailyReward > 0) {
      rewards.push({
        date: day,
        reward: dailyReward,
        balance: baseOnDay + dailyReward,
      });
    }
  }

  return rewards.reverse(); // Most recent first
}

function useCountdown(deposits) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const confirmedDeposits = deposits.filter(d => d.status === 'confirmed' && d.confirmed_date);
    if (confirmedDeposits.length === 0) return;

    const earliest = confirmedDeposits.reduce((min, d) =>
      new Date(d.confirmed_date) < new Date(min.confirmed_date) ? d : min
    );

    const tick = () => {
      const now = new Date();
      const confirmedAt = new Date(earliest.confirmed_date);
      // Next reward = next midnight after the first full 24h
      const nextReward = startOfDay(addDays(confirmedAt, 1));
      // If already past first reward, next is the next upcoming midnight
      const todayMidnight = startOfDay(addDays(now, 1));
      const target = now < nextReward ? nextReward : todayMidnight;

      const diff = target - now;
      if (diff <= 0) { setTimeLeft('00h 00m'); return; }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`);
    };

    tick();
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, [deposits]);

  return timeLeft;
}

export default function DailyRewards({ deposits }) {
  const rewards = calculateDailyRewards(deposits);
  const countdown = useCountdown(deposits);
  const hasDeposits = deposits.some(d => d.status === 'confirmed' && d.confirmed_date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-border bg-card p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="font-heading font-semibold text-foreground">Recompensas Diarias</h2>
          <p className="text-xs text-muted-foreground">5% APY compuesto diario</p>
        </div>
      </div>

      {hasDeposits && countdown && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 mb-4">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground">Próxima acreditación en</span>
          <span className="text-sm font-bold text-primary">{countdown}</span>
        </div>
      )}

      {rewards.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Aún no hay recompensas</p>
          <p className="text-xs mt-1">Las recompensas se generan una vez que tu depósito es confirmado</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {rewards.map((r, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {format(r.date, "d 'de' MMMM", { locale: es })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Balance: {r.balance.toLocaleString('es-AR', { minimumFractionDigits: 2 })} USDT
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold text-accent">
                +{r.reward.toLocaleString('es-AR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} USDT
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}