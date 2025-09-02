import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PercentageCalculator() {
  const [value, setValue] = useState("");
  const [total, setTotal] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculatePercentage = () => {
    const v = parseFloat(value);
    const t = parseFloat(total);
    if (v >= 0 && t > 0) setResult((v / t) * 100);
    else setResult(null);
  };

  // Handle Enter key for calculation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      calculatePercentage();
    }
  };

  return (
    <div className="pt-[90px] pb-10 min-h-screen bg-background flex items-center justify-center">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader>
          <CardTitle>Percentage Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={e => {
              e.preventDefault();
              calculatePercentage();
            }}
            autoComplete="off"
          >
            <Input
              type="number"
              placeholder="Value"
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              min={0}
              step="any"
              required
            />
            <Input
              type="number"
              placeholder="Total"
              value={total}
              onChange={e => setTotal(e.target.value)}
              onKeyDown={handleKeyDown}
              min={0}
              step="any"
              required
            />
            <Button className="w-full" type="submit">Calculate</Button>
            {result !== null && (
              <div className="text-center mt-4 text-lg font-semibold">
                Percentage: {result.toFixed(2)}%
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
