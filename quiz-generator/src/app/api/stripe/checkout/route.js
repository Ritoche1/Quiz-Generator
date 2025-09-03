import Stripe from 'stripe';

// Check if Stripe secret key is available
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe functionality will not work.');
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function POST(request) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return new Response(JSON.stringify({ 
        error: 'Stripe is not configured',
        details: 'Please set STRIPE_SECRET_KEY environment variable'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const { items } = await request.json();

    // Create line items for Stripe checkout
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.title,
          description: `${item.difficulty} difficulty quiz with ${item.questionsCount} questions in ${item.language}`,
          images: [], // You could add quiz preview images here
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cart`,
      metadata: {
        // Store quiz IDs for later processing
        quiz_ids: JSON.stringify(items.map(item => ({ id: item.id, quantity: item.quantity })))
      },
      // Enable customer creation
      customer_creation: 'always',
      // Add billing address collection
      billing_address_collection: 'required',
      // Add shipping address collection if needed
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE'],
      },
    });

    return new Response(JSON.stringify({ 
      sessionId: session.id,
      url: session.url 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to create checkout session',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}