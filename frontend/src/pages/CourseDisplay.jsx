import React, { useState, useEffect } from 'react';
import { getCourseDetails, addReview } from '../services/api';
import { ArrowLeft, Clock, BarChart, Book, Star } from 'lucide-react';
import ReviewDisplay from './ReviewsDisplay';

const CourseDetailPage = ({ courseId, onBack, user }) => {
    const [course, setCourse] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [userReview, setUserReview] = useState({ rating: 0, comment: '' });
    const [reviewError, setReviewError] = useState('');

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const data = await getCourseDetails(courseId);
                setCourse(data);
            } catch (err) {
                setError('Failed to load course details.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (userReview.rating === 0) {
            setReviewError('Please select a rating.');
            return;
        }
        setReviewError('');
        try {
            const newReview = await addReview(courseId, userReview);
            setCourse(prev => ({ ...prev, reviews: [newReview, ...prev.reviews] }));
            setUserReview({ rating: 0, comment: '' });
        } catch (err) {
            setReviewError(err.message || 'Failed to submit review.');
        }
    };

    if (isLoading) return <p className="text-center p-10">Loading course...</p>;
    if (error) return <p className="text-center p-10 text-red-500">{error}</p>;
    if (!course) return <p className="text-center p-10">Course not found.</p>;

    const isEnrolled = course.students.includes(user.id);
    const hasReviewed = course.reviews.some(review => review.student === user.id);

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 font-semibold hover:text-orange-600 mb-6">
                    <ArrowLeft size={20} /> Back to Courses
                </button>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-3xl font-bold text-gray-800">{course.courseName}</h1>
                    <p className="text-gray-600 mt-2">{course.courseDescription}</p>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-500 mt-4">
                        <InfoPill icon={Book} text={course.category} />
                        <InfoPill icon={Clock} text={course.duration} />
                        <InfoPill icon={BarChart} text={course.level} />
                    </div>
                </div>

                {isEnrolled && !hasReviewed && (
                     <div className="bg-white rounded-lg shadow-md p-6 mt-8">
                        <h3 className="text-xl font-bold mb-4">Write a Review</h3>
                        <form onSubmit={handleReviewSubmit}>
                            <div className="mb-4">
                                <label className="block font-semibold mb-2">Your Rating *</label>
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={28}
                                            className={`cursor-pointer ${i < userReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                            onClick={() => setUserReview({ ...userReview, rating: i + 1 })}
                                        />
                                    ))}
                                </div>
                            </div>
                             <div className="mb-4">
                                <label htmlFor="comment" className="block font-semibold mb-2">Your Comment</label>
                                <textarea
                                    id="comment"
                                    value={userReview.comment}
                                    onChange={(e) => setUserReview({ ...userReview, comment: e.target.value })}
                                    rows="4"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="Tell us about your experience with this course..."
                                ></textarea>
                            </div>
                            {reviewError && <p className="text-red-500 text-sm mb-2">{reviewError}</p>}
                            <button type="submit" className="bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-orange-700">
                                Submit Review
                            </button>
                        </form>
                    </div>
                )}

                <ReviewsDisplay reviews={course.reviews} courseRating={course.averageRating} totalReviews={course.reviews.length} />
            </div>
        </div>
    );
};

const InfoPill = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-2">
        <Icon size={16} />
        <span>{text}</span>
    </div>
);

export default CourseDetailPage;