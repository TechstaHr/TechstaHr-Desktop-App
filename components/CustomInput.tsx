"use client";

import {
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";

interface CustomInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function CustomInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  onChange,
}: CustomInputProps<TFieldValues>) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = name === "password" || name === "confirmPassword";
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <div className="form-item">
          <FormLabel className="font-medium text-[#71717A]">{label}</FormLabel>
          <div className="flex w-full flex-col">
            <FormControl>
              <div className="relative">
                <Input
                  placeholder={placeholder}
                  className="h-11 w-full rounded-sm border-[#AAAAAA] p-3 pr-10 text-sm"
                  type={
                    isPasswordField
                      ? showPassword
                        ? "text"
                        : "password"
                      : "text"
                  }
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onChange?.(e);
                  }}
                />
                {isPasswordField && (
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
            </FormControl>
            <FormMessage className="form-message mt-2" />
          </div>
        </div>
      )}
    />
  );
}

export default CustomInput;
