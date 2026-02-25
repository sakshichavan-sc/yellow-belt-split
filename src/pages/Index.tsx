import { motion } from "framer-motion";
import { Zap, Receipt, Users, Clock, CheckCircle2 } from "lucide-react";
import { WalletConnect } from "@/components/WalletConnect";
import { CreateBillForm } from "@/components/CreateBillForm";
import { BillCard } from "@/components/BillCard";
import { useWallet } from "@/hooks/useWallet";
import { useBillStore } from "@/hooks/useBillStore";

const Index = () => {
  const { wallet } = useWallet();
  const { bills, addBill, markParticipantPaid } = useBillStore();

  const openBills = bills.filter((b) => b.status === "open");
  const settledBills = bills.filter((b) => b.status === "settled");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border glass sticky top-0 z-50">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg stellar-gradient flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold stellar-gradient-text">Stellar Split</h1>
          </div>
          <WalletConnect />
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Hero - shown when no wallet connected */}
        {!wallet && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold stellar-gradient-text">
              Split Bills on Stellar
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Create bills, add participants, and settle payments with XLM on the Stellar testnet.
            </p>
            <p className="text-sm text-muted-foreground">
              Connect your <strong>Freighter wallet</strong> using the button above to create bills or pay your share.
            </p>
            <div className="flex items-center justify-center gap-8 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" />
                <span>Create Bills</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-stellar-purple" />
                <span>Multi-Wallet</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-stellar-green" />
                <span>Instant XLM</span>
              </div>
            </div>
          </motion.section>
        )}

        {/* Create Bill Form - only when connected */}
        {wallet && <CreateBillForm onCreateBill={addBill} />}

        {/* Open Bills */}
        {openBills.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-stellar-orange" />
              Open Bills
            </h2>
            <div className="space-y-3">
              {openBills.map((bill) => (
                <BillCard key={bill.id} bill={bill} onPaymentComplete={markParticipantPaid} />
              ))}
            </div>
          </section>
        )}

        {/* Settled Bills */}
        {settledBills.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-stellar-green" />
              Settled
            </h2>
            <div className="space-y-3">
              {settledBills.map((bill) => (
                <BillCard key={bill.id} bill={bill} onPaymentComplete={markParticipantPaid} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {wallet && bills.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-muted-foreground"
          >
            <Receipt className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No bills yet. Create your first bill above!</p>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Index;
