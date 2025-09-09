'use client'

import React, { useEffect } from 'react'
import { useSubscription } from '../contexts/SubscriptionContext'
import { generateReportPDF, generateWorksheetPDF } from '../lib/pdf'
import PremiumBadge from './PremiumBadge'

const PDFExportButton = ({ quiz, selectedAnswers, type = 'report', className = '', children }) => {
  const { canExportPDF, subscriptionStatus } = useSubscription()

  // Inject subscription status into window for PDF functions
  useEffect(() => {
    window._subscriptionStatus = {
      canExportPDF: () => canExportPDF()
    }

    return () => {
      delete window._subscriptionStatus
    }
  }, [canExportPDF])

  const handleExport = async () => {
    try {
      if (type === 'worksheet') {
        await generateWorksheetPDF(quiz)
      } else {
        await generateReportPDF(quiz, selectedAnswers)
      }
    } catch (error) {
      console.error('PDF export failed:', error)
      // The PDF functions will handle showing the upgrade modal
    }
  }

  const isPremium = subscriptionStatus.subscription_type === 'premium' && subscriptionStatus.is_active

  return (
    <button
      onClick={handleExport}
      disabled={!canExportPDF()}
      className={`
        ${className}
        ${!canExportPDF() ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}
        transition-all duration-200 relative
      `}
      title={!canExportPDF() ? 'PDF export requires Premium subscription' : ''}
    >
      {children}
      {!isPremium && (
        <PremiumBadge 
          size="xs" 
          className="absolute -top-1 -right-1 transform scale-75" 
        />
      )}
    </button>
  )
}

export default PDFExportButton