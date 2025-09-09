'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

export default function SubscriptionCancelled() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">
          Subscription Cancelled
        </h1>
        
        <p className="text-white/80 mb-6">
          No worries! You can still enjoy our free plan and upgrade anytime you're ready.
        </p>

        <div className="bg-white/10 rounded-lg p-4 mb-6">
          <h3 className="text-white font-semibold mb-2">Free Plan Includes:</h3>
          <ul className="text-sm text-white/80 space-y-1 text-left">
            <li>📝 5 quiz generations per day</li>
            <li>🎯 Basic quiz features</li>
            <li>🌐 Public quiz browsing</li>
            <li>👥 Social features</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300"
          >
            Continue with Free Plan
          </button>
          
          <button
            onClick={() => {
              // Show subscription modal
              window.dispatchEvent(new CustomEvent('showSubscriptionModal'))
              router.push('/')
            }}
            className="w-full border border-white/30 hover:bg-white/10 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300"
          >
            View Plans Again
          </button>
        </div>
      </div>
    </div>
  )
}