// --- Dependencies ---
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// --- Basic Setup ---
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your-super-secret-key-that-should-be-in-a-env-file'; 

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
const MONGO_URI = 'mongodb+srv://vanshish:vansh2006@clusteros.fvqrsk8.mongodb.net/EduConnectDB?retryWrites=true&w=majority&appName=ClusterOS';

mongoose.connect(MONGO_URI).then(() => {
    console.log('Successfully connected to MongoDB!');
}).catch(err => {
    console.error('Connection error', err);
    process.exit(1);
});

// --- Mongoose Schemas ---

// User Schema
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher'], required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number, required: true },
    location: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    qualification: { type: String, required: true, trim: true },
    phoneOtp: { type: String },
    phoneOtpExpires: { type: Date },
    isPhoneVerified: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

// Course Schema
const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Draft', 'Published'], default: 'Draft' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const Course = mongoose.model('Course', CourseSchema);


// --- Authentication Middleware ---
const authMiddleware = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied.' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ message: 'Token is not valid.' });
    }
};


// --- API Routes ---

// Auth Routes
const authRouter = express.Router();
app.use('/api/auth', authRouter);

// @route   POST /api/auth/register
// @desc    Step 1 of Registration
authRouter.post('/register', async (req, res) => {
    try {
        const { email, password, role, firstName, lastName, age, location, phone, qualification } = req.body;

        if (!email || !password || !role || !firstName || !lastName || !age || !location || !phone || !qualification) {
            return res.status(400).json({ message: 'Please enter all required fields.' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser && existingUser.isPhoneVerified) {
            return res.status(400).json({ message: 'An account with this email or phone number already exists.' });
        }
        
        if (existingUser) {
            await User.deleteOne({ _id: existingUser._id });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        console.log(`--- OTP for ${phone}: ${otp} ---`);

        const newUser = new User({
            ...req.body,
            password: hashedPassword,
            phoneOtp: otp,
            phoneOtpExpires: Date.now() + 3600000, // 1 hour
            isPhoneVerified: false,
        });

        await newUser.save();
        res.status(201).json({ message: 'OTP sent successfully! Please check your console to verify.' });

    } catch (error) {
        console.error("Registration Step 1 Error:", error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// @route   POST /api/auth/verify
// @desc    Step 2 of Registration
authRouter.post('/verify', async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ message: 'Phone number and OTP are required.' });
        }

        const user = await User.findOne({
            phone,
            phoneOtp: otp,
            phoneOtpExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid OTP or OTP has expired.' });
        }

        user.isPhoneVerified = true;
        user.phoneOtp = undefined;
        user.phoneOtpExpires = undefined;
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '3h' });

        res.status(200).json({
            token,
            user: { id: user._id, email: user.email, role: user.role, firstName: user.firstName },
            message: "Phone verified and registration complete!"
        });

    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ message: 'Server error during verification.' });
    }
});

// @route   POST /api/auth/login
// @desc    Log in an existing user
authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter both email and password.' });
        }

        const user = await User.findOne({ email });

        if (!user || !user.isPhoneVerified) {
            return res.status(400).json({ message: 'Invalid credentials or user not verified.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials. Password incorrect.' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '3h' });

        res.status(200).json({
            token,
            user: { id: user._id, email: user.email, role: user.role, firstName: user.firstName },
            message: "Login successful!"
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});


// --- Course Routes ---
const courseRouter = express.Router();
app.use('/api/courses', authMiddleware, courseRouter);

// @route   GET /api/courses
// @desc    Get all courses for the logged-in teacher
courseRouter.get('/', async (req, res) => {
    try {
        const courses = await Course.find({ teacher: req.user.id }).sort({ createdAt: -1 });
        res.json(courses);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/courses
// @desc    Create a new course
courseRouter.post('/', async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required.' });
    }
    try {
        const newCourse = new Course({
            title,
            description,
            teacher: req.user.id
        });
        const course = await newCourse.save();
        res.json(course);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});


// --- Start The Server ---
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

