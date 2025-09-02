import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoanEmiCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [tenure, setTenure] = useState("");
  const [emi, setEmi] = useState<number | null>(null);

  const calculateEMI = () => {
    const P = parseFloat(principal);
    const R = parseFloat(rate) / 12 / 100;
    const N = parseInt(tenure);
    if (P > 0 && R > 0 && N > 0) {
      const emiVal = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
      setEmi(emiVal);
    } else setEmi(null);
  };

  // Handle Enter key for calculation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      calculateEMI();
    }
  };

  return (
    <div className="pt-20 pb-10 min-h-screen bg-background flex items-start justify-center">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader>
          <CardTitle>Loan EMI Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={e => {
              e.preventDefault();
              calculateEMI();
            }}
            autoComplete="off"
          >
            <Input
              type="number"
              placeholder="Principal Amount"
              value={principal}
              onChange={e => setPrincipal(e.target.value)}
              onKeyDown={handleKeyDown}
              min={0}
              step="any"
              required
            />
            <Input
              type="number"
              placeholder="Annual Interest Rate (%)"
              value={rate}
              onChange={e => setRate(e.target.value)}
              onKeyDown={handleKeyDown}
              min={0}
              step="any"
              required
            />
            <Input
              type="number"
              placeholder="Tenure (months)"
              value={tenure}
              onChange={e => setTenure(e.target.value)}
              onKeyDown={handleKeyDown}
              min={1}
              step="1"
              required
            />
            <Button className="w-full" type="submit">Calculate EMI</Button>
            {emi !== null && (
              <div className="text-center mt-4 text-lg font-semibold">
                Monthly EMI: ₹{emi.toFixed(2)}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
