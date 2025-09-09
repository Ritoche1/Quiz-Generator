'use client'

import React from 'react'
import { useSubscription } from '../contexts/SubscriptionContext'
import PremiumBadge from './PremiumBadge'

const SubscriptionLimits = ({ showUpgrade = true, className = '' }) => {
  const { 
    generationLimits, 
    subscriptionStatus, 
    canGenerateQuiz,
    getCurrentPlan,
    loading 
  } = useSubscription()

  if (loading) {
    return (
      <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300/30 rounded mb-2"></div>
          <div className="h-6 bg-gray-300/30 rounded"></div>
        </div>
      </div>
    )
  }

  const currentPlan = getCurrentPlan()
  const isPremium = subscriptionStatus.subscription_type === 'premium'
  const progressPercentage = Math.min((generationLimits.used / generationLimits.limit) * 100, 100)

  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white">Daily Quiz Generation</h3>
        {isPremium && <PremiumBadge size="xs" />}
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-white/70">
            {generationLimits.used} / {generationLimits.limit} used
          </span>
          <span className="text-white/70">
            {generationLimits.remaining} remaining
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              progressPercentage >= 90 
                ? 'bg-red-500' 
                : progressPercentage >= 70 
                  ? 'bg-yellow-500' 
                  : 'bg-green-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Status message */}
      {!canGenerateQuiz() && (
        <div className="mb-3 p-2 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-200">
            {isPremium 
              ? 'Daily limit reached. Try again tomorrow!'
              : 'Daily limit reached. Upgrade for more generations!'
            }
          </p>
        </div>
      )}

      {/* Plan info */}
      <div className="text-xs text-white/60">
        <div className="flex justify-between">
          <span>{currentPlan.name} Plan</span>
          {currentPlan.price > 0 && (
            <span>${currentPlan.price}/month</span>
          )}
        </div>
      </div>

      {/* Upgrade button for free users */}
      {showUpgrade && !isPremium && (
        <button 
          onClick={() => {
            // This will be handled by a subscription modal
            window.dispatchEvent(new CustomEvent('showSubscriptionModal'))
          }}
          className="mt-3 w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-medium py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          Upgrade to Premium
        </button>
      )}
    </div>
  )
}

export default SubscriptionLimits