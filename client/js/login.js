document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Login successful
            document.getElementById('message').textContent = 'Login successful!';
            document.getElementById('message').style.color = 'green';
            // Redirect or do something with the successful login
            // window.location.href = '/dashboard.html';
        } else {
            // Login failed
            document.getElementById('message').textContent = data.message || 'Login failed';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('message').textContent = 'An error occurred during login';
    }
});