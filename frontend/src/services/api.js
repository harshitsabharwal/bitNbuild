import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Your backend URL

// --- Axios Instance ---
// Create an instance to automatically add the auth token to headers
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Use an interceptor to add the token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('educonnect_token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});


// --- Auth Service ---
export const loginUser = async (credentials) => {
    try {
        const res = await api.post('/auth/login', credentials);
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Login failed. Please try again.');
    }
};

export const registerUser = async (userData) => {
     try {
        const res = await api.post('/auth/register', userData);
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Registration failed. Please try again.');
    }
};

export const verifyOtp = async (otpData) => {
     try {
        const res = await api.post('/auth/verify', otpData);
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'OTP verification failed.');
    }
};


// --- Course Service ---
export const getCourses = async () => {
    try {
        const res = await api.get('/courses');
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch courses.');
    }
};

export const createCourse = async (courseData) => {
    try {
        const res = await api.post('/courses', courseData);
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create course.');
    }
};

