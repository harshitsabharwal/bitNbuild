import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TeacherDashboard from './pages/TeacherDash';
import CreateCoursePage from './pages/CreateCoursePage';
import StudentDashboard from './pages/StudentDashboard'; // Import the new dashboard

function App() {
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login'); 
  const [teacherView, setTeacherView] = useState('dashboard');
  const [refreshCourses, setRefreshCourses] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleAuthSuccess = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    if (data.user.role === 'teacher') {
      setTeacherView('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setAuthView('login');
  };

  const handleCourseCreated = () => {
    setTeacherView('dashboard');
    setRefreshCourses(prevKey => prevKey + 1);
  };

  // --- Render Logic ---

  if (user) {
    if (user.role === 'teacher') {
      switch (teacherView) {
        case 'createCourse':
          return (
            <CreateCoursePage
              user={user}
              onCourseCreated={handleCourseCreated}
              onBack={() => setTeacherView('dashboard')}
            />
          );
        default: // 'dashboard'
          return (
            <TeacherDashboard
              user={user}
              onLogout={handleLogout}
              onCreateCourseClick={() => setTeacherView('createCourse')}
              key={refreshCourses}
            />
          );
      }
    }

    if (user.role === 'student') {
      // RENDER THE NEW STUDENT DASHBOARD
      return <StudentDashboard user={user} onLogout={handleLogout} />;
    }
  }

  // If no user is logged in, show authentication pages
  switch (authView) {
    case 'register':
      return <RegisterPage onAuthSuccess={handleAuthSuccess} onSwitchToLogin={() => setAuthView('login')} />;
    default: // 'login'
      return <LoginPage onAuthSuccess={handleAuthSuccess} onSwitchToRegister={() => setAuthView('register')} />;
  }
}

export default App;

