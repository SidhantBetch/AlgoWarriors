// API Base URL
const API_URL = 'http://127.0.0.1:3000/api';

// Handle Registration for both Candidate and Recruiter
async function handleRegister(event, role) {
    event.preventDefault(); // Prevent page reload

    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const btn = document.getElementById('regBtn');
    const errorMsg = document.getElementById('errorMsg');

    errorMsg.style.display = 'none';
    btn.innerText = 'Creating Account...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, role })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        // Success! Save JWT and redirect
        localStorage.setItem('aw_token', data.token);
        localStorage.setItem('aw_user', JSON.stringify({ id: data.id, name: data.name, role: data.role }));
        
        // Redirect to dashboard
        window.location.href = 'Dashboard/index.html';

    } catch (error) {
        errorMsg.innerText = error.message;
        errorMsg.style.display = 'block';
    } finally {
        btn.innerText = 'Sign Up';
        btn.disabled = false;
    }
}

// Handle Login
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('logEmail').value;
    const password = document.getElementById('logPassword').value;
    const btn = document.getElementById('logBtn');
    const errorMsg = document.getElementById('errorMsg');

    errorMsg.style.display = 'none';
    btn.innerText = 'Logging in...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Success! Save JWT and redirect
        localStorage.setItem('aw_token', data.token);
        localStorage.setItem('aw_user', JSON.stringify({ id: data.id, name: data.name, role: data.role }));
        
        window.location.href = 'Dashboard/index.html';

    } catch (error) {
        errorMsg.innerText = error.message;
        errorMsg.style.display = 'block';
    } finally {
        btn.innerText = 'Log In';
        btn.disabled = false;
    }
}

function logout() {
    localStorage.removeItem('aw_token');
    localStorage.removeItem('aw_user');
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const currentDir = pathParts[pathParts.length - 2] || '';
    if (currentDir === 'AlgoWarriors' || currentDir === '') {
        window.location.href = 'index.html';
    } else {
        window.location.href = '../index.html';
    }
}

// Redirects
function startSimulation(){
    // Check if logged in 
    if(!localStorage.getItem('aw_token')){
        window.location.href = "register.html";
        return;
    }
    window.location.href = "Jobs/index.html";
}

function howItWorks(){
    alert("AlgoWarrior uses AI to generate custom technical questions based on the job requirements, and evaluates your answers instantly!");
}
