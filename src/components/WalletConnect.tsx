import { motion } from "framer-motion";
import { Wallet, LogOut, Copy, RefreshCw } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { shortenAddress } from "@/lib/stellar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function WalletConnect() {
  const { wallet, balance, isConnecting, error, connect, disconnect, refreshBalance } = useWallet();

  const copyAddress = () => {
    if (wallet) {
      navigator.clipboard.writeText(wallet.publicKey);
      toast.success("Address copied!");
    }
  };

  if (!wallet) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          onClick={connect}
          disabled={isConnecting}
          className="stellar-gradient border-0 font-semibold px-6 py-2.5 text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Wallet className="w-4 h-4 mr-2" />
          {isConnecting ? "Connecting..." : "Connect Freighter"}
        </Button>
        {error && (
          <p className="text-destructive text-sm mt-2">{error}</p>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3"
    >
      <div className="stellar-card rounded-lg px-4 py-2 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-stellar-green animate-pulse" />
        <div>
          <button
            onClick={copyAddress}
            className="font-mono text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
          >
            {shortenAddress(wallet.publicKey)}
            <Copy className="w-3 h-3" />
          </button>
          <p className="text-xs text-muted-foreground">
            {parseFloat(balance).toFixed(2)} XLM
          </p>
        </div>
        <button onClick={refreshBalance} className="text-muted-foreground hover:text-primary transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={disconnect}
        className="text-muted-foreground hover:text-destructive"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}
