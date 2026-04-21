import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, CheckCircle2, ArrowRight, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const WALLET_ADDRESS = "0x830fC06ABBb24F919121CB329fb9ED268Cae33bA";

export default function DepositDialog({ open, onOpenChange, userEmail, onDepositCreated }) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(WALLET_ADDRESS);
    setCopied(true);
    toast.success('Dirección copiada');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmSent = async () => {
    setIsSubmitting(true);
    await base44.entities.Deposit.create({
      user_email: userEmail,
      amount: parseFloat(amount),
      status: 'pending',
    });
    onDepositCreated();
    setIsSubmitting(false);
    setStep(1);
    setAmount('');
    onOpenChange(false);
    toast.success('¡Transferencia enviada! Tu depósito está pendiente de acreditación.');
  };

  const handleClose = (open) => {
    if (!open) {
      setStep(1);
      setAmount('');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {step === 1 ? 'Nuevo Depósito' : 'Enviar USDT'}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Ingresá la cantidad de USDT que querés depositar'
              : 'Enviá los USDT a la siguiente dirección'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Cantidad de USDT</Label>
              <Input
                type="number"
                placeholder="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg font-semibold"
                min="1"
              />
            </div>
            <Button
              className="w-full"
              disabled={!amount || parseFloat(amount) <= 0}
              onClick={() => setStep(2)}
            >
              Continuar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="rounded-xl bg-secondary p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Dirección de depósito</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-background rounded-lg px-3 py-2 text-muted-foreground break-all">
                  {WALLET_ADDRESS}
                </code>
                <Button size="icon" variant="ghost" onClick={handleCopy}>
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
              <p className="text-sm text-foreground">
                Enviá exactamente <span className="font-bold text-primary">{parseFloat(amount).toLocaleString('es-AR')} USDT</span> a la dirección de arriba.
              </p>
            </div>

            <Button
              className="w-full"
              onClick={handleConfirmSent}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registrando...' : 'Ya envié los USDT'}
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}