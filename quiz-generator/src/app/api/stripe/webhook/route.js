import Stripe from 'stripe';

// Check if Stripe is configured
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  // Check if Stripe is configured
  if (!stripe || !webhookSecret) {
    console.warn('Stripe webhook not configured properly');
    return new Response('Webhook not configured', { status: 400 });
  }

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, {
      status: 400,
    });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      console.log('Payment successful for session:', session.id);
      
      // Here you would typically:
      // 1. Grant access to the purchased quizzes
      // 2. Send confirmation email
      // 3. Update user's purchase history
      // 4. Log the transaction
      
      try {
        // Parse the quiz IDs from metadata
        const quizIds = JSON.parse(session.metadata.quiz_ids || '[]');
        
        // In a real app, you would:
        // - Grant user access to these quizzes
        // - Store the purchase in your database
        // - Send confirmation email
        
        console.log('Processing purchase for quizzes:', quizIds);
        console.log('Customer:', session.customer);
        console.log('Amount paid:', session.amount_total);
        
        // For demo purposes, just log the successful payment
        await logSuccessfulPayment(session, quizIds);
        
      } catch (error) {
        console.error('Error processing successful payment:', error);
      }
      
      break;
      
    case 'payment_intent.payment_failed':
      const paymentIntent = event.data.object;
      console.log('Payment failed:', paymentIntent.id);
      
      // Handle failed payment
      // - Send notification to user
      // - Log the failure
      
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Helper function to log successful payment
async function logSuccessfulPayment(session, quizIds) {
  // In a real application, you would save this to your database
  const paymentRecord = {
    stripeSessionId: session.id,
    customerId: session.customer,
    amountTotal: session.amount_total,
    currency: session.currency,
    paymentStatus: session.payment_status,
    quizIds: quizIds,
    timestamp: new Date().toISOString(),
    customerEmail: session.customer_details?.email,
    customerName: session.customer_details?.name,
  };
  
  console.log('Payment record to be saved:', paymentRecord);
  
  // TODO: Save to database
  // await db.payments.create(paymentRecord);
  
  return paymentRecord;
}