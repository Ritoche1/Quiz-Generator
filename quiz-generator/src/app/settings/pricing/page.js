'use client';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started with quiz generation',
      features: [
        '5 quiz generations per day',
        'Basic quiz templates',
        'Multiple choice questions',
        'Score tracking',
        'Quiz history (last 30 days)'
      ],
      current: true,
      popular: false
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: 'per month',
      description: 'Ideal for regular learners and educators',
      features: [
        'Unlimited quiz generations',
        'Advanced quiz templates',
        'Multiple question types',
        'Detailed analytics',
        'Export quiz results',
        'Priority support',
        'Custom quiz themes'
      ],
      current: false,
      popular: true
    },
    {
      name: 'Premium',
      price: '$19.99',
      period: 'per month',
      description: 'For power users and educational institutions',
      features: [
        'Everything in Pro',
        'Bulk quiz generation',
        'Team collaboration',
        'Advanced reporting',
        'API access',
        'White-label options',
        'Dedicated support',
        'Custom integrations'
      ],
      current: false,
      popular: false
    }
  ];

  return (
    <div className="min-h-screen gradient-bg bg-default">
      <div className="main-container">
        <div className="w-full max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 pt-8">
            <button 
              onClick={() => router.back()}
              className="mb-6 btn-ghost-light px-4 py-2 text-sm flex items-center gap-2"
            >
              <span>←</span> Back to Settings
            </button>
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Choose Your Plan</h1>
              <p className="text-white/80 text-lg">Select the perfect plan for your learning needs</p>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => (
              <div 
                key={plan.name}
                className={`relative glass-card p-6 rounded-2xl ${plan.popular ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 text-sm font-medium rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                {plan.current && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 text-sm font-medium rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-1">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button 
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    plan.current 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                      : plan.popular
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }`}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : `Choose ${plan.name}`}
                </button>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Can I change my plan anytime?</h3>
                <p className="text-gray-600 text-sm">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades, 
                  and at the end of your billing cycle for downgrades.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600 text-sm">
                  We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. 
                  All payments are processed securely through Stripe.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Is there a free trial for paid plans?</h3>
                <p className="text-gray-600 text-sm">
                  Yes! All paid plans come with a 7-day free trial. You can cancel anytime during the trial period 
                  without being charged.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">What happens to my data if I cancel?</h3>
                <p className="text-gray-600 text-sm">
                  Your quiz history and data remain accessible for 30 days after cancellation. 
                  You can export your data anytime from the settings page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}