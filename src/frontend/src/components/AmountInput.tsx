import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";

interface AmountInputProps {
  label: string;
  currentValue: number | undefined;
  isLoading: boolean;
  isSaving: boolean;
  onSave: (value: number) => void;
  prefix?: string;
  className?: string;
  placeholder?: string;
}

export function AmountInput({
  label,
  currentValue,
  isLoading,
  isSaving,
  onSave,
  prefix = "$",
  className,
  placeholder,
}: AmountInputProps) {
  const [inputVal, setInputVal] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const parsed = Number.parseFloat(inputVal);
    if (Number.isNaN(parsed) || parsed < 0) return;
    onSave(parsed);
    setInputVal("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-semibold font-display text-foreground/80">
        {label}
      </Label>
      {isLoading ? (
        <div className="h-8 bg-muted animate-pulse rounded-md w-24" />
      ) : (
        <p className="text-2xl font-bold font-display text-foreground">
          {prefix}
          {currentValue?.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) ?? "—"}
        </p>
      )}
      <div className="flex gap-2">
        <Input
          type="number"
          min="0"
          step="0.01"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={placeholder ?? "Enter new amount"}
          className="max-w-[160px]"
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving || !inputVal}
          variant="secondary"
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : saved ? (
            <Check className="h-3.5 w-3.5 text-success" />
          ) : (
            "Update"
          )}
        </Button>
      </div>
    </div>
  );
}
