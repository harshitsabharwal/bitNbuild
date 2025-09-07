import React, { useState } from 'react';
import { loginUser } from '../services/api';
import AuthLayout from '../components/AuthLayout';

const LoginPage = ({ onAuthSuccess, onSwitchToRegister }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const data = await loginUser(formData);
            onAuthSuccess(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
            <p className="text-gray-600 mb-8">Please sign in to continue.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    />
                </div>
                {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-orange-600 text-white font-semibold py-3 rounded-lg hover:bg-orange-700 disabled:bg-orange-300 transition-colors mt-4"
                >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>
            <p className="mt-8 text-center text-gray-600">
                Don't have an account?{' '}
                <button onClick={onSwitchToRegister} className="font-semibold text-orange-600 hover:underline">
                    Sign Up
                </button>
            </p>
        </AuthLayout>
    );
};

export default LoginPage;







