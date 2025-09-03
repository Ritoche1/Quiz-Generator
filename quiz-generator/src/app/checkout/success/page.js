'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [orderNumber] = useState(`QZ-${Date.now()}`);
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If we have a Stripe session ID, we could fetch session details
    // For demo purposes, we'll just show the success message
    if (sessionId) {
      console.log('Stripe session ID:', sessionId);
      // In a real app, you might want to verify the session with your backend
      // fetchSessionDetails(sessionId);
    }
  }, [sessionId]);

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
            {sessionId && (
              <>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 mt-2">Stripe Session ID</div>
                <div className="font-mono text-xs text-gray-600 dark:text-gray-300 break-all">
                  {sessionId}
                </div>
              </>
            )}
          </div>

          {/* Payment Method Info */}
          {sessionId ? (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-600 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-800 dark:text-green-300 font-medium">Processed by Stripe</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-400">
                Your payment was securely processed through Stripe's payment platform.
              </p>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-600 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <span className="text-blue-800 dark:text-blue-300 font-medium">🎮 Demo Mode</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                This was a demo transaction. No real payment was processed.
              </p>
            </div>
          )}

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

function LoadingFallback() {
  return (
    <div className="min-h-screen gradient-bg pt-20 pb-16 md:pb-24 flex items-center justify-center">
      <div className="glass-card p-8 rounded-2xl text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}