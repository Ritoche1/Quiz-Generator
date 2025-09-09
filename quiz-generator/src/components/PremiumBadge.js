'use client'

import React from 'react'

const PremiumBadge = ({ size = 'sm', className = '' }) => {
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  return (
    <span className={`
      inline-flex items-center rounded-full
      bg-gradient-to-r from-yellow-400 to-orange-500
      text-white font-semibold
      ${sizeClasses[size]}
      ${className}
    `}>
      ✨ Premium
    </span>
  )
}

export default PremiumBadge