import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function BmiCalculator() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);

  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (w > 0 && h > 0) setBmi(w / (h * h));
    else setBmi(null);
  };

  // Handle Enter key for calculation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      calculateBMI();
    }
  };

  return (
    <div className="pt-[90px] pb-10 min-h-screen bg-background flex items-center justify-center">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader>
          <CardTitle>BMI Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={e => {
              e.preventDefault();
              calculateBMI();
            }}
            autoComplete="off"
          >
            <Input
              type="number"
              placeholder="Weight (kg)"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              onKeyDown={handleKeyDown}
              min={0}
              step="any"
              required
            />
            <Input
              type="number"
              placeholder="Height (cm)"
              value={height}
              onChange={e => setHeight(e.target.value)}
              onKeyDown={handleKeyDown}
              min={0}
              step="any"
              required
            />
            <Button className="w-full" type="submit">Calculate BMI</Button>
            {bmi !== null && (
              <div className="text-center mt-4 text-lg font-semibold">
                Your BMI: {bmi.toFixed(2)}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
