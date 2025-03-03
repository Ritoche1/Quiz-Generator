export async function POST(request) {
    const { email, password, username } = await request.json();
    const isLogin = request.url.includes('login');
    
    try {
        const backendUrl = isLogin ? 
            `${process.env.BASE_URL}/auth/login` :
            `${process.env.BASE_URL}/auth/register`;
            
        const body = isLogin ? { username: email, password } : { email, password, username };
        
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return new Response(JSON.stringify({ error: data.detail }), {
                status: response.status
            });
        }
        
        return new Response(JSON.stringify({
            token: data.access_token
        }));
        
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Connection failed' }), {
            status: 500
        });
    }
}