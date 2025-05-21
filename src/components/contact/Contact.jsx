/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import axios from 'axios';
import { Send, Mail, User, FileText, MessageSquare } from 'lucide-react';

const Contact = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        names: '',
        email: '',
        subject: '',
        description: ''
    });
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({
        names: '',
        email: '',
        subject: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        validateField(e.target.name, e.target.value);
    };

    const validateField = (name, value) => {
        let error = '';
        if (name === 'names' || name === 'subject') {
            if (/[^a-zA-Z\s]/.test(value)) {
                error = 'No numbers or special characters allowed';
            } else if (!value.trim()) {
                error = 'This field is required';
            }
        } else if (name === 'email') {
            if (!value.endsWith('@gmail.com')) {
                error = 'Email must end with @gmail.com';
            } else if (!value.trim()) {
                error = 'This field is required';
            }
        }
        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: error
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const hasErrors = Object.values(errors).some((error) => error);
        const hasEmptyFields = Object.values(formData).some((field) => !field.trim());
        
        if (hasErrors || hasEmptyFields) {
            setMessage('Please fix the errors and fill in all required fields.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://127.0.0.1:8000/contact/', formData);
            if (response.status === 200) {
                setMessage('Message sent successfully');
                setFormData({
                    names: '',
                    email: '',
                    subject: '',
                    description: ''
                });
            }
        } catch (error) {
            if (error.response) {
                setMessage(error.response.data.error || 'Failed to send message');
            } else {
                setMessage('Failed to send message');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className='bg-gray-800 py-16' id="contact">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className='text-3xl font-bold text-white mb-4'>
                        Contact Us Today
                    </h2>
                    <p className="text-gray-300 max-w-2xl mx-auto">
                        We are ready to assist you with your relocation needs. Fill out the form below and our team will get back to you within 24 hours.
                    </p>
                </div>
                
                <div className='max-w-2xl mx-auto'>
                    <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden">
                        <div className="p-6 bg-blue-600 text-white">
                            <h3 className="text-xl font-semibold">Get in touch</h3>
                            <p className="text-gray-100 mt-1">Send us a message and we'll contact you shortly</p>
                        </div>
                        
                        <form className='p-6' onSubmit={handleSubmit}>
                            {message && (
                                <div className={`mb-5 p-3 rounded ${message.includes('success') ? 'bg-green-900 text-green-100' : 'bg-blue-900 text-blue-100'}`}>
                                    {message}
                                </div>
                            )}
                            
                            <div className="mb-4">
                                <label className="block text-gray-300 mb-2 font-medium">Your Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="names"
                                        value={formData.names}
                                        onChange={handleChange}
                                        placeholder='Enter your full name'
                                        className='w-full p-3 pl-10 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600'
                                    />
                                </div>
                                {errors.names && <p className="text-blue-400 text-sm mt-1">{errors.names}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-300 mb-2 font-medium">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder='your email @gmail.com'
                                        className='w-full p-3 pl-10 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600'
                                    />
                                </div>
                                {errors.email && <p className="text-blue-400 text-sm mt-1">{errors.email}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-300 mb-2 font-medium">Subject</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FileText className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder='Inquiry about your services'
                                        className='w-full p-3 pl-10 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600'
                                    />
                                </div>
                                {errors.subject && <p className="text-blue-400 text-sm mt-1">{errors.subject}</p>}
                            </div>

                            <div className="mb-5">
                                <label className="block text-gray-300 mb-2 font-medium">Your Message</label>
                                <div className="relative">
                                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                                        <MessageSquare className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <textarea
                                        rows={4}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder='Tell us about your relocation needs'
                                        className='w-full p-3 pl-10 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600'
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className='w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center justify-center gap-2'
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <>
                                        <Send className="h-5 w-5" />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;