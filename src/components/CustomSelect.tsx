import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from 'lucide-react';

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  formatLabel?: (val: string) => string;
}

const CUSTOM_KEY = '__add_custom__';

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, placeholder, formatLabel }) => {
  const [customMode, setCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const isCustom = value && !options.includes(value);

  if (customMode) {
    return (
      <div className="flex gap-2">
        <Input
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          placeholder="Enter custom value"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (customValue.trim()) {
                onChange(customValue.trim());
                setCustomMode(false);
              }
            }
          }}
          autoFocus
        />
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={() => {
            if (customValue.trim()) {
              onChange(customValue.trim());
              setCustomMode(false);
            }
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => {
            setCustomMode(false);
            setCustomValue('');
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (v === CUSTOM_KEY) {
          setCustomValue(isCustom ? value : '');
          setCustomMode(true);
        } else {
          onChange(v);
        }
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder}>
          {value ? (formatLabel ? formatLabel(value) : value) : null}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map(opt => (
          <SelectItem key={opt} value={opt}>{formatLabel ? formatLabel(opt) : opt}</SelectItem>
        ))}
        {isCustom && (
          <SelectItem key={value} value={value}>{formatLabel ? formatLabel(value) : value} (custom)</SelectItem>
        )}
        <SelectItem value={CUSTOM_KEY} className="text-primary font-medium">
          + Add Custom...
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default CustomSelect;
