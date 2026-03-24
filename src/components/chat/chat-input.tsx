"use client";

import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  disabled: boolean;
};

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  disabled
}: ChatInputProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!disabled) onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer or 'generate pdf'"
        disabled={isLoading}
      />
      <Button
        type="submit"
        disabled={disabled}
        className="bg-black text-white hover:bg-zinc-800"
      >
        {isLoading ? "..." : "Send"}
      </Button>
    </form>
  );
}
