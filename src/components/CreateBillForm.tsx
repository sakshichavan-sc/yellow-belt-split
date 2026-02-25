import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Receipt } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { Bill, Participant } from "@/hooks/useBillStore";

interface CreateBillFormProps {
  onCreateBill: (bill: Omit<Bill, "id" | "createdAt" | "status">) => Bill;
}

export function CreateBillForm({ onCreateBill }: CreateBillFormProps) {
  const { wallet } = useWallet();
  const [title, setTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [participants, setParticipants] = useState<{ name: string; address: string }[]>([
    { name: "", address: "" },
  ]);

  const addParticipant = () => {
    setParticipants((prev) => [...prev, { name: "", address: "" }]);
  };

  const removeParticipant = (index: number) => {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateParticipant = (index: number, field: "name" | "address", value: string) => {
    setParticipants((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet) {
      toast.error("Connect your wallet first");
      return;
    }

    if (!title.trim()) {
      toast.error("Enter a bill title");
      return;
    }

    const total = parseFloat(totalAmount);
    if (isNaN(total) || total <= 0) {
      toast.error("Enter a valid total amount");
      return;
    }

    const validParticipants = participants.filter(
      (p) => p.address.trim().length === 56 && p.name.trim()
    );

    if (validParticipants.length === 0) {
      toast.error("Add at least one participant with a valid Stellar address (56 chars)");
      return;
    }

    const splitAmount = (total / validParticipants.length).toFixed(7);

    const billParticipants: Participant[] = validParticipants.map((p) => ({
      address: p.address.trim(),
      name: p.name.trim(),
      amountOwed: splitAmount,
      paid: false,
    }));

    

    onCreateBill({
      title: title.trim(),
      description: "",
      totalAmount: total.toFixed(7),
      creatorAddress: wallet.publicKey,
      recipientAddress: wallet.publicKey,
      participants: billParticipants,
    });

    toast.success("Bill created successfully.");
    setTitle("");
    setTotalAmount("");
    setParticipants([{ name: "", address: "" }]);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="stellar-card rounded-xl p-6 space-y-5"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg stellar-gradient flex items-center justify-center">
          <Receipt className="w-5 h-5 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Create Bill</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Bill Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Dinner at Stellars"
            className="bg-muted border-border"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Total Amount (XLM)</label>
          <Input
            type="number"
            step="0.0000001"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            placeholder="100"
            className="bg-muted border-border"
          />
        </div>
      </div>


      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm text-muted-foreground">Participants</label>
          <Button type="button" variant="ghost" size="sm" onClick={addParticipant} className="text-primary hover:text-primary">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>

        <div className="space-y-3">
          {participants.map((p, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input
                value={p.name}
                onChange={(e) => updateParticipant(i, "name", e.target.value)}
                placeholder="Name"
                className="bg-muted border-border w-1/3"
              />
              <Input
                value={p.address}
                onChange={(e) => updateParticipant(i, "address", e.target.value)}
                placeholder="Stellar address (G...)"
                className="bg-muted border-border font-mono text-xs flex-1"
              />
              {participants.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeParticipant(i)}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {totalAmount && participants.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Each participant owes:{" "}
            <span className="text-primary font-mono">
              {(parseFloat(totalAmount || "0") / Math.max(participants.filter(p => p.address.trim()).length, 1)).toFixed(4)} XLM
            </span>
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={!wallet}
        className="w-full stellar-gradient border-0 text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
      >
        Create Bill
      </Button>
    </motion.form>
  );
}
