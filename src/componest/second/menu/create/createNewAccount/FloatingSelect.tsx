import React, { useState } from 'react';

export const FloatingSelect = ({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) => {
  const [hasValue, setHasValue] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHasValue(!!e.target.value);
  };

  return (
    <div className="relative z-0 w-full mb-5 group">
      <select
        name={name}
        id={name}
        defaultValue=""
        onChange={handleChange}
        className={`peer block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#FF6B35] ${
          hasValue ? 'has-value' : ''
        }`}
      >
        <option value="" disabled hidden></option>
        {options.map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </select>
      <label
        htmlFor={name}
        className={`absolute text-sm text-gray-500 duration-300 transform scale-75 top-3 -z-10 origin-[0] transition-all 
        peer-focus:scale-75 peer-focus:-translate-y-6 ${
          hasValue ? '-translate-y-6 scale-75' : ''
        }`}
      >
        {label}
      </label>
    </div>
  );
};