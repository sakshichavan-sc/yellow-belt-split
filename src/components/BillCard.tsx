import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, ExternalLink, Send, ChevronDown, ChevronUp, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { sendPayment, shortenAddress, getExplorerUrl } from "@/lib/stellar";
import { toast } from "sonner";
import type { Bill } from "@/hooks/useBillStore";

interface BillCardProps {
  bill: Bill;
  onPaymentComplete: (billId: string, participantAddress: string, txHash: string) => void;
}

export function BillCard({ bill, onPaymentComplete }: BillCardProps) {
  const { wallet, refreshBalance, connect, isConnecting, error } = useWallet();
  const [expanded, setExpanded] = useState(false);
  const [paying, setPaying] = useState<string | null>(null);

  const paidCount = bill.participants.filter((p) => p.paid).length;
  const totalParticipants = bill.participants.length;
  const progress = totalParticipants > 0 ? (paidCount / totalParticipants) * 100 : 0;

  const handlePay = async (participantAddress: string, amount: string) => {
    const executePayment = async (payerPublicKey: string) => {
      if (payerPublicKey !== participantAddress) {
        toast.error(`Please connect the participant wallet ${shortenAddress(participantAddress)} to pay this share.`);
        return;
      }

      setPaying(participantAddress);
      try {
        toast.info(`Sending ${parseFloat(amount).toFixed(4)} XLM to ${shortenAddress(bill.recipientAddress)}...`);
        const result = await sendPayment(payerPublicKey, bill.recipientAddress, amount);
        if (result.success) {
          onPaymentComplete(bill.id, participantAddress, result.hash);
          toast.success(
            <div>
              ✅ Payment successful! {parseFloat(amount).toFixed(4)} XLM sent.{" "}
              <a href={getExplorerUrl(result.hash)} target="_blank" rel="noopener noreferrer" className="underline font-medium">
                View on Stellar Expert →
              </a>
            </div>
          );
          await refreshBalance();
        }
      } catch (e: any) {
        toast.error(`❌ Transaction failed: ${e.message || "Unknown error. Please try again."}`);
      } finally {
        setPaying(null);
      }
    };

    if (wallet) {
      await executePayment(wallet.publicKey);
      return;
    }

    const connectedWallet = await connect();
    if (!connectedWallet) {
      toast.error(error || "Please connect Freighter wallet to continue.");
      return;
    }

    await executePayment(connectedWallet.publicKey);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="stellar-card rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              bill.status === "settled" ? "bg-stellar-green/20" : "stellar-gradient"
            }`}
          >
            {bill.status === "settled" ? (
              <CheckCircle2 className="w-5 h-5 text-stellar-green" />
            ) : (
              <Clock className="w-5 h-5 text-primary-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground truncate">{bill.title}</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span className="font-mono">{parseFloat(bill.totalAmount).toFixed(2)} XLM</span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {paidCount}/{totalParticipants} paid
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 stellar-gradient"
              style={{ width: `${progress}%` }}
            />
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-3 border-t border-border pt-4">
              <div className="text-xs text-muted-foreground">
                <span>Payments to: </span>
                <span className="font-mono text-foreground">{shortenAddress(bill.recipientAddress)}</span>
              </div>

              <div className="space-y-2">
                {bill.participants.map((p) => (
                  <div
                    key={p.address}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      p.paid ? "bg-stellar-green/10 border border-stellar-green/20" : "bg-muted/50"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{shortenAddress(p.address)}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-sm text-primary">
                        {parseFloat(p.amountOwed).toFixed(4)} XLM
                      </span>

                      {p.paid ? (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-stellar-green" />
                          <span className="text-xs text-stellar-green font-medium">Paid</span>
                          {p.txHash && (
                            <a
                              href={getExplorerUrl(p.txHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handlePay(p.address, p.amountOwed)}
                          disabled={paying === p.address || isConnecting}
                          className="stellar-gradient border-0 text-primary-foreground text-xs hover:opacity-90"
                        >
                          {wallet ? <Send className="w-3 h-3 mr-1" /> : <Wallet className="w-3 h-3 mr-1" />}
                          {paying === p.address
                            ? "Signing in Freighter..."
                            : isConnecting
                            ? "Connecting..."
                            : wallet
                            ? "Pay Now"
                            : "Connect Wallet to Pay"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
