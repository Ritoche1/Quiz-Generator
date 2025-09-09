'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSubscription } from '../../../contexts/SubscriptionContext'

export default function SubscriptionSuccess() {
  const router = useRouter()
  const { refreshSubscriptionData } = useSubscription()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleSuccess = async () => {
      // Wait a moment for webhook to process
      setTimeout(async () => {
        await refreshSubscriptionData()
        setLoading(false)
      }, 2000)
    }

    handleSuccess()
  }, [refreshSubscriptionData])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center">
        {loading ? (
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-green-500/30 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-white/20 rounded mb-2"></div>
            <div className="h-4 bg-white/20 rounded"></div>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">
              🎉 Welcome to Premium!
            </h1>
            
            <p className="text-white/80 mb-6">
              Your subscription has been activated successfully. You now have access to all premium features!
            </p>

            <div className="bg-white/10 rounded-lg p-4 mb-6">
              <h3 className="text-white font-semibold mb-2">Premium Benefits:</h3>
              <ul className="text-sm text-white/80 space-y-1 text-left">
                <li>✨ 50 quiz generations per day</li>
                <li>📄 PDF export for quizzes and results</li>
                <li>🔓 Access to premium content</li>
                <li>🎯 Priority support</li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300"
              >
                Start Creating Quizzes
              </button>
              
              <button
                onClick={() => router.push('/profile')}
                className="w-full border border-white/30 hover:bg-white/10 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300"
              >
                View Profile
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}