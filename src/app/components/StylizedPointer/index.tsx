import React from 'react'

interface StylizedPointerProps {
  color?: string
  size?: 'sm' | 'md' | 'lg'
}

const StylizedPointer: React.FC<StylizedPointerProps> = ({
  color = '#e11d48',
  size = 'md',
}) => {
  // Configurações de tamanho baseadas na prop size
  const sizeConfig = {
    sm: {
      width: 'w-6',
      height: 'h-16',
      arrowWidth: 'w-10',
      arrowHeight: 'h-6',
      ringSize: 'w-5 h-5',
      ringBorder: 'border-2',
      shadowSize: 'shadow-md',
      offset: '-right-3',
    },
    md: {
      width: 'w-8',
      height: 'h-24',
      arrowWidth: 'w-14',
      arrowHeight: 'h-8',
      ringSize: 'w-8 h-8',
      ringBorder: 'border-3',
      shadowSize: 'shadow-lg',
      offset: '-right-4',
    },
    lg: {
      width: 'w-10',
      height: 'h-32',
      arrowWidth: 'w-20',
      arrowHeight: 'h-10',
      ringSize: 'w-9 h-9',
      ringBorder: 'border-4',
      shadowSize: 'shadow-xl',
      offset: '-right-5',
    },
  }

  const config = sizeConfig[size]

  return (
    <div className="absolute right-0 top-1/2 z-20 -translate-y-1/2 transform">
      <div className={`relative ${config.offset}`}>
        {/* Ponta triangular do ponteiro */}
        <div
          className={`${config.arrowWidth} ${config.arrowHeight} relative`}
          style={{
            clipPath: 'polygon(0% 50%, 100% 0%, 100% 100%)',
            backgroundColor: color,
            filter: 'drop-shadow(0px 3px 3px rgba(0, 0, 0, 0.25))',
          }}
        ></div>

        {/* Anel decorativo */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 transform">
          <div
            className={`${config.ringSize} rounded-full border-white ${config.ringBorder} ${config.shadowSize} flex items-center justify-center`}
            style={{ backgroundColor: color }}
          >
            <div className="h-2/3 w-2/3 rounded-full bg-white opacity-40"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StylizedPointer
