'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [orderNumber] = useState(`QZ-${Date.now()}`);

  return (
    <div className="min-h-screen gradient-bg pt-20 pb-16 md:pb-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="glass-card p-8 rounded-2xl text-center">
          {/* Success Icon */}
          <div className="text-6xl mb-6">🎉</div>
          
          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Thank you for your purchase! Your quizzes are now available in your account.
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Order Number</div>
            <div className="font-mono text-lg font-medium text-gray-800 dark:text-gray-100">
              {orderNumber}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => router.push('/profile')}
              className="btn-primary w-full"
            >
              View My Quizzes
            </button>
            
            <button
              onClick={() => router.push('/browse')}
              className="btn-secondary w-full"
            >
              Browse More Quizzes
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              📧 A confirmation email has been sent to your email address.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Need help? Contact our support team anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}