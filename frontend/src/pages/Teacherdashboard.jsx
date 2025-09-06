import React, { useState, useEffect } from 'react';
import { getCourses, createCourse } from '../services/api';
import { BookOpen, Plus, Search, Filter, MoreVertical, LogOut } from 'lucide-react';

const TeacherDashboard = ({ user, onLogout }) => {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Mock data based on the screenshot
    const mockCourses = [
        { _id: 1, title: 'Introduction to React', description: 'Learn the fundamentals of React development', status: 'Published', students: { length: 45 }, updatedAt: '2025-09-04T12:00:00.000Z' },
        { _id: 2, title: 'Advanced JavaScript', description: 'Deep dive into advanced JavaScript concepts', status: 'Published', students: { length: 32 }, updatedAt: '2025-08-30T12:00:00.000Z' },
        { _id: 3, title: 'Node.js Backend', description: 'Build scalable backend applications', status: 'Draft', students: { length: 28 }, updatedAt: '2025-09-03T12:00:00.000Z' },
        { _id: 4, title: 'Python for Beginners', description: 'Start your programming journey with Python', status: 'Published', students: { length: 67 }, updatedAt: '2025-09-01T12:00:00.000Z' },
        { _id: 5, title: 'Web Design Fundamentals', description: 'Learn the basics of modern web design', status: 'Draft', students: { length: 0 }, updatedAt: '2025-09-05T12:00:00.000Z' },
    ];

    useEffect(() => {
        // In a real app, you would fetch courses from your API
        // For now, we use mock data to build the UI
        setCourses(mockCourses);
        setIsLoading(false);
        /*
        const fetchCourses = async () => {
            try {
                const fetchedCourses = await getCourses();
                setCourses(fetchedCourses);
            } catch (err) {
                setError('Failed to fetch courses.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourses();
        */
    }, []);

    const CourseCard = ({ course }) => {
        const timeAgo = (date) => {
            // Simple time ago function
            const seconds = Math.floor((new Date() - new Date(date)) / 1000);
            let interval = seconds / 31536000;
            if (interval > 1) return Math.floor(interval) + " years ago";
            interval = seconds / 2592000;
            if (interval > 1) return Math.floor(interval) + " months ago";
            interval = seconds / 86400;
            if (interval > 1) return Math.floor(interval) + " days ago";
            interval = seconds / 3600;
            if (interval > 1) return Math.floor(interval) + " hours ago";
            interval = seconds / 60;
            if (interval > 1) return Math.floor(interval) + " minutes ago";
            return Math.floor(seconds) + " seconds ago";
        }

        return (
            <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                    <div className="flex justify-between items-start mb-3">
                        <div className="bg-orange-100 text-orange-600 p-2 rounded-lg">
                            <BookOpen size={24} />
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 mb-1">{course.title}</h3>
                    <p className="text-gray-500 text-sm mb-4">{course.description}</p>
                </div>
                <div>
                    <div className="flex items-center justify-between text-sm mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${course.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {course.status}
                        </span>
                        <span className="text-gray-600 font-medium">{course.students.length} students</span>
                    </div>
                     <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${Math.random() * 80 + 20}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>Updated {timeAgo(course.updatedAt)}</span>
                        <div>
                             <button className="font-semibold text-gray-500 hover:text-gray-800 mr-3">View</button>
                             <button className="font-semibold text-orange-500 hover:text-orange-700">Edit</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 text-2xl font-bold text-gray-800 border-b">TeachHub</div>
                <nav className="flex-1 p-4 space-y-2">
                    {['Dashboard', 'My Courses', 'Analytics', 'Student Interaction', 'Archived Courses'].map((item, index) => (
                        <a href="#" key={item} className={`flex items-center px-4 py-2 rounded-lg transition-colors ${index === 1 ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
                            {item}
                        </a>
                    ))}
                </nav>
                <div className="p-4 border-t">
                     <button onClick={onLogout} className="flex items-center w-full px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100">
                        <LogOut size={20} className="mr-3"/>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
                        <p className="text-gray-500 mt-1">Manage and track all your courses</p>
                    </div>
                    <button className="bg-orange-500 text-white font-semibold px-4 py-2 rounded-lg flex items-center hover:bg-orange-600 transition-colors">
                        <Plus size={20} className="mr-2" />
                        Create New Course
                    </button>
                </div>
                
                <div className="flex items-center justify-between mb-6">
                     <div className="relative w-full max-w-md">
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search courses..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50">
                            <Filter size={16} className="mr-2" />
                            Filter
                        </button>
                         <span className="text-sm text-gray-500">{courses.length} courses total</span>
                    </div>
                </div>

                {isLoading && <p>Loading courses...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {!isLoading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(course => <CourseCard key={course._id} course={course} />)}
                    </div>
                )}
            </main>
        </div>
    );
};

export default TeacherDashboard;

