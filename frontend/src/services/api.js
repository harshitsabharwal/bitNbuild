import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
});

// --- Auth ---
export const loginUser = async (credentials) => {
    try {
        const res = await api.post('/auth/login', credentials);
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Login failed');
    }
};

export const registerUser = async (userData) => {
    try {
        const res = await api.post('/auth/register', userData);
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Registration failed');
    }
};

export const verifyOtp = async (otpData) => {
    try {
        const res = await api.post('/auth/verify', otpData);
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'OTP verification failed');
    }
};

// --- Teacher Courses ---
export const getCourses = async () => {
    try {
        const res = await api.get('/courses');
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch courses');
    }
};

export const createCourse = async (courseData) => {
    try {
        const res = await api.post('/courses', courseData);
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create course');
    }
};

// --- NEW: Student Courses ---
export const getAvailableCourses = async () => {
    try {
        const res = await api.get('/student/courses/available');
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch available courses');
    }
};

export const getEnrolledCourses = async () => {
    try {
        const res = await api.get('/student/courses/enrolled');
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch enrolled courses');
    }
};

export const enrollInCourse = async (courseId) => {
    try {
        const res = await api.post(`/student/courses/${courseId}/enroll`);
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to enroll in course');
    }
};

export const getCourseDetails = async (courseId) => {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
};

// Add a review to a course
export const addReview = async (courseId, reviewData) => {
    const response = await api.post(`/courses/${courseId}/reviews`, reviewData);
    return response.data;
};




