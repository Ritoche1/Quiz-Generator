'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

const SubscriptionContext = createContext()

export const useSubscription = () => {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}

export const SubscriptionProvider = ({ children }) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    subscription_type: 'free',
    is_active: false,
    stripe_customer_id: null,
    subscription_ends_at: null
  })
  
  const [generationLimits, setGenerationLimits] = useState({
    used: 0,
    limit: 5,
    remaining: 5,
    can_generate: true,
    subscription_type: 'free'
  })

  const [subscriptionConfig, setSubscriptionConfig] = useState({
    publishable_key: '',
    premium_price_id: '',
    plans: {
      free: {
        name: 'Free',
        price: 0,
        quiz_generations_per_day: 5,
        pdf_export: false,
        premium_content: false,
        features: []
      },
      premium: {
        name: 'Premium',
        price: 9.99,
        quiz_generations_per_day: 50,
        pdf_export: true,
        premium_content: true,
        features: []
      }
    }
  })

  const [loading, setLoading] = useState(true)

  // Fetch subscription status from backend
  const fetchSubscriptionStatus = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/subscription/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const status = await response.json()
        setSubscriptionStatus(status)
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error)
    }
  }

  // Fetch generation limits
  const fetchGenerationLimits = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/generate/remaining`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const limits = await response.json()
        setGenerationLimits(limits)
      }
    } catch (error) {
      console.error('Error fetching generation limits:', error)
    }
  }

  // Fetch subscription config
  const fetchSubscriptionConfig = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/subscription/config`)
      
      if (response.ok) {
        const config = await response.json()
        setSubscriptionConfig(config)
      }
    } catch (error) {
      console.error('Error fetching subscription config:', error)
    }
    
    setLoading(false)
  }

  // Refresh all subscription data
  const refreshSubscriptionData = async () => {
    setLoading(true)
    await Promise.all([
      fetchSubscriptionStatus(),
      fetchGenerationLimits(),
      fetchSubscriptionConfig()
    ])
    setLoading(false)
  }

  // Check if user can access premium content
  const canAccessPremiumContent = () => {
    return subscriptionStatus.subscription_type === 'premium' && subscriptionStatus.is_active
  }

  // Check if user can export PDFs
  const canExportPDF = () => {
    return canAccessPremiumContent()
  }

  // Check if user can generate more quizzes
  const canGenerateQuiz = () => {
    return generationLimits.can_generate
  }

  // Get current plan info
  const getCurrentPlan = () => {
    const planType = subscriptionStatus.subscription_type
    return subscriptionConfig.plans[planType] || subscriptionConfig.plans.free
  }

  // Check if upgrade is needed for a specific feature
  const needsUpgrade = (feature) => {
    const currentPlan = getCurrentPlan()
    switch (feature) {
      case 'pdf_export':
        return !currentPlan.pdf_export
      case 'premium_content':
        return !currentPlan.premium_content
      case 'unlimited_generations':
        return currentPlan.quiz_generations_per_day < 50
      default:
        return false
    }
  }

  useEffect(() => {
    refreshSubscriptionData()
  }, [])

  const value = {
    subscriptionStatus,
    generationLimits,
    subscriptionConfig,
    loading,
    canAccessPremiumContent,
    canExportPDF,
    canGenerateQuiz,
    getCurrentPlan,
    needsUpgrade,
    refreshSubscriptionData,
    fetchGenerationLimits,
    setGenerationLimits
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}