import React, { useState, useEffect, useMemo } from 'react';
import { getAvailableCourses, getEnrolledCourses, enrollInCourse } from '../services/api';
import { Book, Search, Zap, LogOut } from 'lucide-react';
import SearchFilters from './SearchFilters'; // CORRECTED: Changed path from ../components/ to ./

// Main Dashboard Component
const StudentDashboard = ({ user, onLogout, onCourseClick }) => {
    const [activeTab, setActiveTab] = useState('available'); // Default to available courses

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Header user={user} onLogout={onLogout} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-left mb-10">
                    <h1 className="text-4xl font-bold text-gray-800">Welcome back, {user.firstName}!</h1>
                    <p className="text-lg text-gray-600 mt-1">Continue your learning journey with SkillForge.</p>
                </div>

                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <TabButton id="enrolled" label="My Courses" icon={Book} activeTab={activeTab} setActiveTab={setActiveTab} />
                        <TabButton id="available" label="Explore Courses" icon={Search} activeTab={activeTab} setActiveTab={setActiveTab} />
                        <TabButton id="playground" label="Playground" icon={Zap} activeTab={activeTab} setActiveTab={setActiveTab} />
                    </nav>
                </div>
                
                <div className="mt-8">
                    {activeTab === 'enrolled' && <EnrolledCoursesTab onCourseClick={onCourseClick} />}
                    {activeTab === 'available' && <AvailableCoursesTab onCourseClick={onCourseClick} />}
                    {activeTab === 'playground' && <PlaygroundTab />}
                </div>
            </main>
        </div>
    );
};

// --- Tab Content Components ---

const EnrolledCoursesTab = ({ onCourseClick }) => {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const data = await getEnrolledCourses();
                setCourses(data);
            } catch (error) {
                console.error("Failed to fetch enrolled courses", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadCourses();
    }, []);

    if (isLoading) return <p className="text-center text-gray-500">Loading your courses...</p>;
    if (courses.length === 0) return <p className="text-center text-gray-500 py-10">You haven't enrolled in any courses yet. Start exploring!</p>;
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(course => <CourseCard key={course._id} course={course} isEnrolled={true} onCourseClick={onCourseClick} />)}
        </div>
    );
};

const AvailableCoursesTab = ({ onCourseClick }) => {
    const [allCourses, setAllCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [priceFilter, setPriceFilter] = useState('all');
    const [sortBy, setSortBy] = useState('rating');

    const categories = useMemo(() => {
        const uniqueCategories = new Set(allCourses.map(c => c.category));
        return ['All Categories', ...uniqueCategories];
    }, [allCourses]);

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const data = await getAvailableCourses();
                setAllCourses(data);
            } catch (error) {
                console.error("Failed to fetch available courses", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadCourses();
    }, []);

    const filteredCourses = useMemo(() => {
        let coursesToFilter = [...allCourses];
        if (searchTerm) {
            coursesToFilter = coursesToFilter.filter(c => c.courseName.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (selectedCategory !== 'All Categories') {
            coursesToFilter = coursesToFilter.filter(c => c.category === selectedCategory);
        }
        if (priceFilter === 'free') {
            coursesToFilter = coursesToFilter.filter(c => !c.courseFee || c.courseFee === 0);
        } else if (priceFilter === 'paid') {
            coursesToFilter = coursesToFilter.filter(c => c.courseFee > 0);
        }
        return coursesToFilter;
    }, [searchTerm, selectedCategory, priceFilter, allCourses]);
    
    const handleEnroll = async (courseId, e) => {
        e.stopPropagation();
        try {
            await enrollInCourse(courseId);
            alert('Successfully enrolled!');
        } catch (error) {
            alert(error.message || 'Failed to enroll.');
        }
    };

    if (isLoading) return <p className="text-center text-gray-500">Loading available courses...</p>;

    return (
        <div>
            <SearchFilters 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                priceFilter={priceFilter}
                setPriceFilter={setPriceFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                categories={categories}
            />
            {filteredCourses.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map(course => <CourseCard key={course._id} course={course} onEnroll={handleEnroll} onCourseClick={onCourseClick} />)}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-10">No courses match your filters.</p>
            )}
        </div>
    );
};

const PlaygroundTab = () => (
    <div className="text-center py-16 bg-white rounded-lg shadow-sm">
        <Zap size={48} className="mx-auto text-orange-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">AI Playground</h2>
        <p className="text-gray-600 mt-2">This interactive feature is coming soon. Stay tuned!</p>
    </div>
);


// --- Reusable UI Sub-Components ---

const Header = ({ user, onLogout }) => (
    <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                    <img src="/logo1main.jpg" alt="SkillForge Logo" className="h-8 w-auto" />
                    <span className="font-bold text-xl text-gray-800">SkillForge</span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={onLogout} className="text-gray-500 hover:text-orange-600">
                        <LogOut size={24} />
                    </button>
                </div>
            </div>
        </div>
    </header>
);

const TabButton = ({ id, label, icon: Icon, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
            activeTab === id
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
    >
        <Icon size={16} />
        {label}
    </button>
);

const CourseCard = ({ course, isEnrolled = false, onEnroll, onCourseClick }) => (
    <div onClick={() => onCourseClick(course._id)} className="cursor-pointer bg-white rounded-lg shadow-md overflow-hidden flex flex-col transform hover:-translate-y-1 transition-transform duration-300">
        <div className="p-6 flex-grow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-semibold text-orange-600">{course.category}</p>
                    <h3 className="text-xl font-bold text-gray-800 mt-1">{course.courseName}</h3>
                </div>
                <div className="bg-orange-100 p-2 rounded-full">
                    <Book className="text-orange-500" />
                </div>
            </div>
            <p className="text-gray-600 mt-2 text-sm">{course.courseDescription.substring(0, 100)}...</p>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t">
            {isEnrolled ? (
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">Progress</span>
                        <span className="font-bold text-orange-600">25%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={(e) => onEnroll(course._id, e)}
                    className="w-full bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                >
                    Enroll Now
                </button>
            )}
        </div>
    </div>
);

export default StudentDashboard;