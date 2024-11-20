import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
}

export function MultiSelect({ options, value, onChange }: MultiSelectProps) {
  const handleValueChange = (selectedValue: string) => {
    const newValue = value.includes(selectedValue)
      ? value.filter(v => v !== selectedValue)
      : [...value, selectedValue];
    onChange(newValue);
  };

  return (
    <Select onValueChange={handleValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecione os recursos" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={value.includes(option.value)}
                onChange={() => {}}
                className="mr-2"
              />
              {option.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
