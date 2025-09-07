import React, { useState } from 'react';
import { Star } from 'lucide-react';

const ReviewsDisplay = ({ reviews = [], courseRating = 0, totalReviews = 0 }) => {
    const [sortBy, setSortBy] = useState("newest");

    const sortedReviews = [...reviews].sort((a, b) => {
        switch (sortBy) {
            case "highest": return b.rating - a.rating;
            case "lowest": return a.rating - b.rating;
            case "oldest": return new Date(a.createdAt) - new Date(b.createdAt);
            default: return new Date(b.createdAt) - new Date(a.createdAt); // newest
        }
    });

    const getRatingDistribution = () => {
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach((review) => {
            distribution[review.rating] = (distribution[review.rating] || 0) + 1;
        });
        return distribution;
    };

    const ratingDistribution = getRatingDistribution();

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Side: Overall Rating */}
                <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r pb-6 md:pb-0 md:pr-8">
                    <p className="text-sm text-gray-600 mb-1">Overall Rating</p>
                    <p className="text-5xl font-bold text-gray-800">{courseRating.toFixed(1)}</p>
                    <div className="flex text-yellow-400 my-2">
                        {[...Array(5)].map((_, i) => <Star key={i} size={24} fill={i < Math.round(courseRating) ? 'currentColor' : 'none'} stroke={i < Math.round(courseRating) ? 'currentColor' : 'gray'} />)}
                    </div>
                    <p className="text-gray-500">Based on {totalReviews} reviews</p>
                </div>

                {/* Middle: Rating Breakdown */}
                <div className="md:col-span-2">
                    <h3 className="font-semibold text-lg mb-3">Rating Breakdown</h3>
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((stars) => (
                            <div key={stars} className="flex items-center gap-4 text-sm">
                                <span className="font-medium text-gray-600">{stars} stars</span>
                                <div className="flex-grow bg-gray-200 rounded-full h-2">
                                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${totalReviews > 0 ? (ratingDistribution[stars] / totalReviews) * 100 : 0}%` }} />
                                </div>
                                <span className="w-10 text-right text-gray-500">{ratingDistribution[stars]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="border-t mt-8 pt-6">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Reviews ({totalReviews})</h3>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-orange-500 focus:border-orange-500">
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="highest">Highest Rating</option>
                        <option value="lowest">Lowest Rating</option>
                    </select>
                </div>
                
                <div className="space-y-6">
                    {sortedReviews.length > 0 ? sortedReviews.map(review => (
                        <div key={review._id} className="border-b pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                     <img src={`https://ui-avatars.com/api/?name=${review.studentName}&background=random`} alt={review.studentName} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <p className="font-semibold text-gray-800">{review.studentName}</p>
                                        <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < review.rating ? 'currentColor' : 'none'} stroke={i < review.rating ? 'currentColor' : 'gray'} />)}
                                </div>
                            </div>
                            <p className="text-gray-700 mt-3">{review.comment}</p>
                        </div>
                    )) : <p className="text-center text-gray-500 py-8">No reviews yet for this course.</p>}
                </div>
            </div>
        </div>
    );
};

export default ReviewsDisplay;
