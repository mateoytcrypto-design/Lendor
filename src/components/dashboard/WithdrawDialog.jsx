import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowUpCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function WithdrawDialog({ open, onOpenChange, userEmail, currentBalance, onWithdrawalCreated }) {
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0 || num > currentBalance || !walletAddress.trim()) return;
    setIsSubmitting(true);
    await base44.entities.Withdrawal.create({
      user_email: userEmail,
      amount: num,
      wallet_address: walletAddress.trim(),
      status: 'pending',
    });
    onWithdrawalCreated();
    setIsSubmitting(false);
    setAmount('');
    onOpenChange(false);
    toast.success('Solicitud de retiro enviada. Pendiente de aprobación.');
  };

  const handleClose = (open) => {
    if (!open) { setAmount(''); setWalletAddress(''); }
    onOpenChange(open);
  };

  const num = parseFloat(amount);
  const isValid = num > 0 && num <= currentBalance && walletAddress.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl flex items-center gap-2">
            <ArrowUpCircle className="w-5 h-5 text-primary" />
            Solicitar Retiro
          </DialogTitle>
          <DialogDescription>
            Tu solicitud quedará pendiente hasta que un administrador la apruebe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Dirección de billetera (USDT) (BSC)</Label>
            <Input
              type="text"
              placeholder="0x..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">Ingresá la dirección de tu wallet donde recibirás los fondos.</p>
          </div>

          <div className="space-y-2">
            <Label>Cantidad de USDT a retirar</Label>
            <Input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg font-semibold"
              min="1"
              max={currentBalance}
            />
            <p className="text-xs text-muted-foreground">
              Balance disponible: {currentBalance.toLocaleString('es-AR', { minimumFractionDigits: 2 })} USDT
            </p>
          </div>

          {num > currentBalance && (
            <p className="text-xs text-destructive">El monto supera tu balance disponible.</p>
          )}

          <Button
            className="w-full"
            disabled={!isValid || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Enviando...' : 'Solicitar Retiro'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}