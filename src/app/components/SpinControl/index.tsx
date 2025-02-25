import React from 'react';

interface SpinControlProps {
  spinTime: number;
  setSpinTime: (time: number) => void;
  spinRoulette: () => void;
  isSpinning: boolean;
  hasOptions: boolean;
}

const SpinControl: React.FC<SpinControlProps> = ({
  spinTime,
  setSpinTime,
  spinRoulette,
  isSpinning,
  hasOptions
}) => {
  return (
    <div className="w-full mt-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <label htmlFor="spinTime" className="text-sm font-medium">
          Tempo de Giro (segundos): {spinTime}
        </label>
        <input
          type="range"
          id="spinTime"
          min="1"
          max="15"
          value={spinTime}
          onChange={(e) => setSpinTime(parseInt(e.target.value))}
          className="w-2/3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      
      <button
        onClick={spinRoulette}
        disabled={isSpinning || !hasOptions}
        className={`w-full py-3 rounded-lg text-white font-bold transition-colors 
                  ${isSpinning || !hasOptions 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {isSpinning ? 'Girando...' : 'Girar Roleta'}
      </button>
    </div>
  );
};

export default SpinControl;