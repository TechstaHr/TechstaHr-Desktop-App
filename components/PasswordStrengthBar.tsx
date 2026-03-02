// Extracted helper to render password strength bars
const PasswordStrengthBar = ({ strength }: { strength: number }) => {
  const colors = [
    "bg-red-500",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-lime-400",
    "bg-green-500",
  ];

  return (
    <div className="mt-3">
      <div className="flex gap-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-[2px] flex-1 rounded-sm transition-all duration-300 ${
              i < strength ? colors[strength - 1] : "bg-gray-200"
            }`}
          ></div>
        ))}
      </div>
      <p className="mt-1 text-xs text-gray-500">
        {strength === 0
          ? ""
          : strength < 3
            ? "Weak"
            : strength < 5
              ? "Moderate"
              : "Strong"}
      </p>
    </div>
  );
};

export default PasswordStrengthBar;
