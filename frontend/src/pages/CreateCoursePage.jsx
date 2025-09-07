import React, { useState, memo, useCallback } from 'react';
import { createCourse } from '../services/api';
import { ArrowLeft, Book, Plus, Trash2 } from 'lucide-react';

// --- Reusable, Memoized Form Components ---
// By defining these OUTSIDE the main component, we prevent them from being
// recreated on every render. This is the key to fixing the input focus issue.

const Input = memo(({ label, name, value, onChange, placeholder, type = "text", required = true, ...props }) => {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-1">{label} {required && '*'}</label>
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                {...props}
            />
        </div>
    );
});

const TextArea = memo(({ label, name, value, onChange, placeholder, required = true }) => {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-1">{label} {required && '*'}</label>
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
        </div>
    );
});

const Select = memo(({ label, name, value, onChange, children }) => {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
            >
                {children}
            </select>
        </div>
    );
});


// --- Main Page Component ---
const CreateCoursePage = ({ user, onCourseCreated, onBack }) => {
    const [formData, setFormData] = useState({
        courseName: '', courseFee: '', courseDescription: '', duration: '', level: 'Beginner', category: 'Technology',
        teacherInfo: {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            experience: '',
            about: '',
        },
        modules: [{ title: '', description: '', lessons: [{ title: '', duration: '', description: '' }] }]
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = useCallback((e, path, index, subIndex) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newForm = JSON.parse(JSON.stringify(prev)); // Deep copy for nested state
            if (path === 'teacherInfo') {
                newForm.teacherInfo[name] = value;
            } else if (path === 'modules') {
                newForm.modules[index][name] = value;
            } else if (path === 'lessons') {
                newForm.modules[index].lessons[subIndex][name] = value;
            } else {
                newForm[name] = value;
            }
            return newForm;
        });
    }, []);
    
    // --- Module & Lesson Handlers ---
    const addModule = () => {
        setFormData(prev => ({
            ...prev,
            modules: [...prev.modules, { title: '', description: '', lessons: [{ title: '', duration: '', description: '' }] }]
        }));
    };
    const removeModule = (index) => setFormData(prev => ({ ...prev, modules: prev.modules.filter((_, i) => i !== index) }));
    const addLesson = (moduleIndex) => {
        setFormData(prev => {
            const newModules = JSON.parse(JSON.stringify(prev.modules));
            newModules[moduleIndex].lessons.push({ title: '', duration: '', description: '' });
            return { ...prev, modules: newModules };
        });
    };
    const removeLesson = (moduleIndex, lessonIndex) => {
        setFormData(prev => {
            const newModules = JSON.parse(JSON.stringify(prev.modules));
            newModules[moduleIndex].lessons = newModules[moduleIndex].lessons.filter((_, i) => i !== lessonIndex);
            return { ...prev, modules: newModules };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await createCourse(formData);
            onCourseCreated(); // Navigate back to the dashboard
        } catch (err) {
            setError(err.message || 'An error occurred while creating the course.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <div className="max-w-4xl mx-auto p-4 md:p-8">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 font-semibold hover:text-orange-600 mb-6">
                    <ArrowLeft size={20} /> Back to Courses
                </button>

                <header className="flex items-center gap-3 mb-8">
                    <div className="bg-orange-100 p-2 rounded-lg">
                        <Book className="text-orange-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Create New Course</h1>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Course Information */}
                    <Section title="Course Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Course Name" name="courseName" value={formData.courseName} onChange={handleInputChange} placeholder="e.g., Introduction to Python" />
                            <Input label="Course Fee (₹)" name="courseFee" value={formData.courseFee} onChange={handleInputChange} placeholder="Enter course fee" type="number" />
                            <div className="md:col-span-2">
                                <TextArea label="Course Description" name="courseDescription" value={formData.courseDescription} onChange={handleInputChange} placeholder="Describe what students will learn in this course" />
                            </div>
                            <Input label="Duration" name="duration" value={formData.duration} onChange={handleInputChange} placeholder="e.g., 8 weeks" />
                            <Select label="Level" name="level" value={formData.level} onChange={handleInputChange}>
                                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                            </Select>
                            <Select label="Category" name="category" value={formData.category} onChange={handleInputChange}>
                                <option>Technology</option><option>Business</option><option>Creative</option><option>Lifestyle</option>
                            </Select>
                        </div>
                    </Section>

                    {/* Teacher Information */}
                    <Section title="Teacher Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <Input label="Teacher Name" name="name" value={formData.teacherInfo.name} onChange={(e) => handleInputChange(e, 'teacherInfo')} placeholder="Enter teacher name" />
                           <Input label="Teacher Email" name="email" value={formData.teacherInfo.email} onChange={(e) => handleInputChange(e, 'teacherInfo')} placeholder="Enter teacher email" type="email" />
                           <div className="md:col-span-2">
                             <Input label="Experience" name="experience" value={formData.teacherInfo.experience} onChange={(e) => handleInputChange(e, 'teacherInfo')} placeholder="e.g., 5 years in web development" />
                           </div>
                           <div className="md:col-span-2">
                             <TextArea label="About Teacher" name="about" value={formData.teacherInfo.about} onChange={(e) => handleInputChange(e, 'teacherInfo')} placeholder="Tell students about the teacher's background and expertise" />
                           </div>
                        </div>
                    </Section>

                    {/* Course Modules */}
                    <Section title="Course Modules" action={<button type="button" onClick={addModule} className="flex items-center gap-2 bg-orange-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-orange-600 transition-colors"><Plus size={18} /> Add Module</button>}>
                        <div className="space-y-6">
                            {formData.modules.map((module, modIndex) => (
                                <div key={modIndex} className="bg-gray-50 border border-orange-200 p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-lg text-gray-700">Module {modIndex + 1}</h4>
                                        <button type="button" onClick={() => removeModule(modIndex)} className="text-red-500 hover:text-red-700"><Trash2 size={20}/></button>
                                    </div>
                                    <div className="space-y-4">
                                        <Input label="Module Title" name="title" value={module.title} onChange={(e) => handleInputChange(e, 'modules', modIndex)} placeholder="e.g., Basics of HTML" />
                                        <TextArea label="Module Description" name="description" value={module.description} onChange={(e) => handleInputChange(e, 'modules', modIndex)} placeholder="Describe the module content" />
                                        
                                        {/* Lessons */}
                                        <div className="pl-4 border-l-2 border-gray-200 space-y-3">
                                            <h5 className="font-semibold text-gray-600">Lessons</h5>
                                            {module.lessons.map((lesson, lessonIndex) => (
                                                 <div key={lessonIndex} className="bg-white p-3 rounded-md border">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <p className="font-semibold text-gray-600">Lesson {lessonIndex + 1}</p>
                                                        <button type="button" onClick={() => removeLesson(modIndex, lessonIndex)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                       <div className="sm:col-span-3">
                                                         <Input label="Lesson title" name="title" value={lesson.title} onChange={(e) => handleInputChange(e, 'lessons', modIndex, lessonIndex)} placeholder="Lesson title" />
                                                       </div>
                                                       <Input label="Duration" name="duration" value={lesson.duration} onChange={(e) => handleInputChange(e, 'lessons', modIndex, lessonIndex)} placeholder="e.g., 30 min" />
                                                       <div className="sm:col-span-2">
                                                        <Input label="Brief description" name="description" value={lesson.description} onChange={(e) => handleInputChange(e, 'lessons', modIndex, lessonIndex)} placeholder="Brief description" required={false} />
                                                       </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => addLesson(modIndex)} className="flex items-center gap-1 text-sm text-orange-600 font-semibold hover:text-orange-800 mt-2"><Plus size={16}/> Add Lesson</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {error && <p className="text-red-500 text-center font-semibold">{error}</p>}
                    
                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <button type="button" onClick={onBack} className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:bg-orange-300">
                            {isLoading ? 'Creating...' : 'Create Course'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// A reusable component for section styling
const Section = ({ title, children, action = null }) => (
    <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            {action}
        </div>
        {children}
    </div>
);

export default CreateCoursePage;


