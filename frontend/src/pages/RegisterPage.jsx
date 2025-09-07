import React, { useState } from 'react';
import { registerUser, verifyOtp } from '../services/api';
import AuthLayout from '../components/AuthLayout';

const RegisterPage = ({ onAuthSuccess, onSwitchToLogin }) => {
    const [step, setStep] = useState('details');
    const [role, setRole] = useState('student');
    const [formData, setFormData] = useState({
        email: '', password: '', firstName: '', lastName: '',
        age: '', location: '', phone: '', qualification: '', otp: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRegistrationRequest = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await registerUser({ ...formData, role });
            setStep('otp');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const data = await verifyOtp({ phone: formData.phone, otp: formData.otp });
            onAuthSuccess(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <AuthLayout>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600 mb-6">Create an account to begin.</p>
            
            {step === 'details' ? (
                <form onSubmit={handleRegistrationRequest} className="space-y-4">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button type="button" onClick={() => setRole('student')} className={`flex-1 py-2 rounded-md font-semibold transition-colors ${role === 'student' ? 'bg-white shadow text-orange-600' : 'text-gray-600'}`}>I am a Student</button>
                        <button type="button" onClick={() => setRole('teacher')} className={`flex-1 py-2 rounded-md font-semibold transition-colors ${role === 'teacher' ? 'bg-white shadow text-orange-600' : 'text-gray-600'}`}>I am a Teacher</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">First Name</label><input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label><input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" /></div>
                        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" /></div>
                        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Age</label><input type="number" name="age" value={formData.age} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" /></div>
                        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Location</label><input type="text" name="location" value={formData.location} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" /></div>
                        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">{role === 'student' ? 'Current Academic Status' : 'Highest Qualification'}</label><input type="text" name="qualification" value={formData.qualification} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" /></div>
                    </div>
                    {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full bg-orange-600 text-white font-semibold py-3 rounded-lg hover:bg-orange-700 disabled:bg-orange-300 transition-colors mt-2">
                        {isLoading ? 'Processing...' : 'Continue'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                     <p className="text-gray-600 text-center">We've sent a 4-digit code to your phone. Please enter it below.</p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                        <input type="text" name="otp" value={formData.otp} onChange={handleChange} placeholder="_ _ _ _" maxLength="4" required className="w-full text-center tracking-[1em] font-semibold text-xl px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
                    </div>
                    {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full bg-orange-600 text-white font-semibold py-3 rounded-lg hover:bg-orange-700 disabled:bg-orange-300 transition-colors">
                        {isLoading ? 'Verifying...' : 'Verify Account'}
                    </button>
                </form>
            )}

            <p className="mt-6 text-center text-gray-600">
                Already have an account?{' '}
                <button onClick={onSwitchToLogin} className="font-semibold text-orange-600 hover:underline">Sign In</button>
            </p>
        </AuthLayout>
    );
};

export default RegisterPage;



