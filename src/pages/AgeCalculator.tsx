import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";

export default function AgeCalculator() {
  const [dob, setDob] = useState("");
  const [age, setAge] = useState<string | null>(null);

  const calculateAge = () => {
    if (!dob) return setAge(null);
    const birth = dayjs(dob);
    const now = dayjs();
    if (!birth.isValid() || birth.isAfter(now)) return setAge(null);
    const years = now.diff(birth, "year");
    const months = now.diff(birth.add(years, "year"), "month");
    const days = now.diff(birth.add(years, "year").add(months, "month"), "day");
    setAge(`${years} years, ${months} months, ${days} days`);
  };

  // Handle Enter key for calculation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      calculateAge();
    }
  };

  return (
    <div className="pt-[90px] pb-10 min-h-screen bg-background flex items-center justify-center">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader>
          <CardTitle>Age Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={e => {
              e.preventDefault();
              calculateAge();
            }}
            autoComplete="off"
          >
            <Input
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
              onKeyDown={handleKeyDown}
              required
            />
            <Button className="w-full" type="submit">Calculate Age</Button>
            {age && (
              <div className="text-center mt-4 text-lg font-semibold">
                Age: {age}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
