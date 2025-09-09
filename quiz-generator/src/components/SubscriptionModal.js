'use client'

import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { useSubscription } from '../contexts/SubscriptionContext'
import PremiumBadge from './PremiumBadge'

const SubscriptionModal = ({ isOpen, onClose }) => {
  const { subscriptionConfig, subscriptionStatus, refreshSubscriptionData } = useSubscription()
  const [loading, setLoading] = useState(false)
  const [stripePromise, setStripePromise] = useState(null)

  useEffect(() => {
    if (subscriptionConfig.publishable_key) {
      setStripePromise(loadStripe(subscriptionConfig.publishable_key))
    }
  }, [subscriptionConfig.publishable_key])

  const handleUpgrade = async () => {
    if (!stripePromise) {
      alert('Stripe is not configured. Please check your environment settings.')
      return
    }

    setLoading(true)
    const token = localStorage.getItem('token')

    try {
      // Create checkout session
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/subscription/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          price_id: subscriptionConfig.premium_price_id,
          success_url: `${window.location.origin}/subscription/success`,
          cancel_url: `${window.location.origin}/subscription/cancelled`
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to create checkout session')
      }

      const { checkout_url } = await response.json()
      
      // Redirect to Stripe Checkout
      window.location.href = checkout_url

    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Failed to start checkout process. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? It will remain active until the end of your current billing period.')) {
      return
    }

    setLoading(true)
    const token = localStorage.getItem('token')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/subscription/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        alert('Your subscription has been cancelled and will not renew at the end of the current period.')
        await refreshSubscriptionData()
        onClose()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to cancel subscription')
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      alert('Failed to cancel subscription. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const isPremium = subscriptionStatus.subscription_type === 'premium' && subscriptionStatus.is_active
  const freePlan = subscriptionConfig.plans.free
  const premiumPlan = subscriptionConfig.plans.premium

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          <p className="text-gray-600 mt-1">Unlock the full potential of Quiz Generator</p>
        </div>

        {/* Plans comparison */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <div className="border-2 border-gray-200 rounded-xl p-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{freePlan.name}</h3>
                <div className="text-3xl font-bold text-gray-900 mb-4">
                  ${freePlan.price}
                  <span className="text-base font-normal text-gray-600">/month</span>
                </div>
                
                <ul className="space-y-3 text-sm text-gray-600 text-left">
                  {freePlan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  disabled
                  className="w-full mt-6 py-2 px-4 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                >
                  Current Plan
                </button>
              </div>
            </div>

            {/* Premium Plan */}
            <div className={`border-2 rounded-xl p-6 relative ${
              isPremium ? 'border-green-500' : 'border-purple-500'
            }`}>
              {!isPremium && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <PremiumBadge size="md" />
                </div>
              )}
              
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{premiumPlan.name}</h3>
                <div className="text-3xl font-bold text-gray-900 mb-4">
                  ${premiumPlan.price}
                  <span className="text-base font-normal text-gray-600">/month</span>
                </div>

                <ul className="space-y-3 text-sm text-gray-600 text-left">
                  {premiumPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {isPremium ? (
                  <div className="mt-6 space-y-2">
                    <button
                      disabled
                      className="w-full py-2 px-4 bg-green-500 text-white rounded-lg cursor-not-allowed"
                    >
                      ✓ Active Plan
                    </button>
                    <button
                      onClick={handleCancelSubscription}
                      disabled={loading}
                      className="w-full py-2 px-4 text-red-600 border border-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Cancel Subscription'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="w-full mt-6 py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                  >
                    {loading ? 'Processing...' : 'Upgrade Now'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Features comparison */}
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Features</th>
                  <th className="text-center py-2">Free</th>
                  <th className="text-center py-2">Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Daily Quiz Generations</td>
                  <td className="text-center py-2">{freePlan.quiz_generations_per_day}</td>
                  <td className="text-center py-2">{premiumPlan.quiz_generations_per_day}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">PDF Export</td>
                  <td className="text-center py-2">{freePlan.pdf_export ? '✓' : '✗'}</td>
                  <td className="text-center py-2">{premiumPlan.pdf_export ? '✓' : '✗'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Premium Content Access</td>
                  <td className="text-center py-2">{freePlan.premium_content ? '✓' : '✗'}</td>
                  <td className="text-center py-2">{premiumPlan.premium_content ? '✓' : '✗'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Priority Support</td>
                  <td className="text-center py-2">✗</td>
                  <td className="text-center py-2">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionModal