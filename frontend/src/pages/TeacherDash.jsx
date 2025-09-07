import React, { useState, useEffect } from 'react';
import { getCourses } from '../services/api';
import { LayoutDashboard, BookCopy, BarChart3, User, Archive, LogOut, Plus, Search, Filter, MoreVertical, BookOpen } from 'lucide-react';

const TeacherDashboard = ({ user, onLogout, onCreateCourseClick }) => {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // This useEffect will now re-run whenever the component is re-mounted
    useEffect(() => {
        const fetchCourses = async () => {
            setIsLoading(true);
            try {
                const fetchedCourses = await getCourses();
                setCourses(fetchedCourses);
            } catch (err) {
                setError('Failed to fetch courses. Please try again later.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, []); // Dependency array is still empty, but the key prop in App.jsx forces re-mount

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar onLogout={onLogout} user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header user={user} setSidebarOpen={setSidebarOpen} />
                
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">My Courses</h1>
                            <p className="text-gray-600">Manage and track all your courses</p>
                        </div>
                        <button onClick={onCreateCourseClick} className="flex items-center bg-orange-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-orange-600 transition-colors">
                            <Plus size={20} className="mr-2" /> Create New Course
                        </button>
                    </div>

                    <div className="mb-6 flex items-center gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input type="text" placeholder="Search courses..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50">
                            <Filter size={18} /> Filter
                        </button>
                    </div>
                    
                    {isLoading ? (
                        <p className="text-center text-gray-500">Loading courses...</p>
                    ) : error ? (
                        <p className="text-center text-red-500">{error}</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.length > 0 ? (
                                courses.map(course => (
                                    <CourseCard key={course._id} course={course} />
                                ))
                            ) : (
                                <p className="col-span-full text-center text-gray-500 mt-8">You haven't created any courses yet. Click "Create New Course" to get started!</p>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

// --- Child Components (Sidebar, Header, CourseCard) ---
// These remain unchanged from the previous version.
const Sidebar = ({ onLogout, user, sidebarOpen, setSidebarOpen }) => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard' },
        { icon: BookCopy, label: 'My Courses', active: true },
        { icon: BarChart3, label: 'Analytics' },
        { icon: User, label: 'Student Interaction' },
        { icon: Archive, label: 'Archived Courses' },
    ];

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
            <aside className={`fixed lg:static inset-y-0 left-0 bg-white w-64 p-6 flex-col z-30 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out flex`}>
                <div className="flex items-center gap-3 mb-10">
                    <div className="bg-orange-500 p-2 rounded-lg">
                        <BookOpen className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">SkillForge</h1>
                </div>
                <nav className="flex-grow">
                    <ul className="space-y-2">
                        {navItems.map(item => (
                            <li key={item.label}>
                                <a href="#" className={`flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition-colors ${item.active ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:bg-gray-100'}`}>
                                    <item.icon size={20} />
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
                 <div className="mt-auto">
                     <button onClick={onLogout} className="flex items-center w-full gap-3 px-4 py-2 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

const Header = ({ user, setSidebarOpen }) => (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
        <div className="text-lg font-semibold text-gray-800 hidden lg:block">Welcome back, {user?.firstName || 'Teacher'}!</div>
        <div className="flex items-center gap-4">
             <div className="relative">
                <img src={`https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=fb923c&color=fff`} alt="User Avatar" className="w-10 h-10 rounded-full cursor-pointer" />
            </div>
        </div>
    </header>
);

const CourseCard = ({ course }) => (
    <div className="bg-white rounded-lg shadow p-5 flex flex-col">
        <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                    <BookOpen className="text-orange-500" size={20}/>
                </div>
                <div>
                    <h3 className="font-bold text-lg text-gray-800">{course.courseName}</h3>
                    <p className="text-sm text-gray-500 truncate">{course.courseDescription}</p>
                </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={20}/></button>
        </div>
        <div className="mt-auto">
            <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${course.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{course.status || 'Draft'}</span>
                <span>{course.students?.length || 0} students</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '30%' }}></div>
            </div>
            <div className="flex justify-between items-center mt-4 text-sm">
                <p className="text-gray-500">Updated now</p>
                <div className="flex gap-4">
                    <a href="#" className="font-semibold text-gray-600 hover:text-orange-600">View</a>
                    <a href="#" className="font-semibold text-orange-600 hover:text-orange-800">Edit</a>
                </div>
            </div>
        </div>
    </div>
);

export default TeacherDashboard;

