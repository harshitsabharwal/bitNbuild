import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TeacherDashboard from './pages/Teacherdashboard';
// We will create the StudentDashboard later
// import StudentDashboard from './pages/StudentDashboard';

function App() {
    const [user, setUser] = useState(null);
    const [authMode, setAuthMode] = useState('login'); 

    useEffect(() => {
        // Check local storage for user session
        const storedToken = localStorage.getItem('educonnect_token');
        const storedUser = localStorage.getItem('educonnect_user');
        if (storedToken && storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleAuthSuccess = (data) => {
        localStorage.setItem('educonnect_token', data.token);
        localStorage.setItem('educonnect_user', JSON.stringify(data.user));
        setUser(data.user);
    };
    
    const handleLogout = () => {
        localStorage.removeItem('educonnect_token');
        localStorage.removeItem('educonnect_user');
        setUser(null);
        setAuthMode('login'); 
    }

    // Render dashboard based on user role
    if (user) {
        if (user.role === 'teacher') {
            return <TeacherDashboard user={user} onLogout={handleLogout} />;
        }
        // Placeholder for student dashboard
        if (user.role === 'student') {
             return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">Student Dashboard Coming Soon!</h1>
                        <p>Welcome, {user.firstName}!</p>
                        <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg">
                            Logout
                        </button>
                    </div>
                </div>
            );
        }
    }

    // Render login/register pages if no user
    return authMode === 'login' 
        ? <LoginPage onLoginSuccess={handleAuthSuccess} onSwitchToRegister={() => setAuthMode('register')} /> 
        : <RegisterPage onAuthSuccess={handleAuthSuccess} onSwitchToLogin={() => setAuthMode('login')} />;
}

export default App;



