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

const ReviewSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
    studentName: { type: String, required: true } // Denormalize for easy display
}, { timestamps: true });

const LessonSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    duration: { type: String, trim: true },
    description: { type: String, trim: true }
});

const ModuleSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    lessons: [LessonSchema]
});

const TeacherInfoSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    experience: { type: String },
    about: { type: String }
});

const CourseSchema = new mongoose.Schema({
    courseName: { type: String, required: true, trim: true },
    courseFee: { type: Number, required: true, default: 0 },
    courseDescription: { type: String, required: true, trim: true },
    duration: { type: String, required: true },
    level: { type: String, required: true },
    category: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teacherInfo: TeacherInfoSchema,
    modules: [ModuleSchema],
    status: { type: String, enum: ['Draft', 'Published'], default: 'Published' }, // Defaulting to published for students to see
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reviews: [ReviewSchema]
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Mongoose virtual to calculate average rating
CourseSchema.virtual('averageRating').get(function() {
    if (this.reviews && this.reviews.length > 0) {
        const total = this.reviews.reduce((acc, item) => item.rating + acc, 0);
        return (total / this.reviews.length);
    }
    return 0;
});


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
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }] // Added for enrolled courses
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
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


// --- Route Definitions ---
const authRouter = express.Router();
const courseRouter = express.Router();

// --- Auth Route Definitions ---
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


// --- Course Route Definitions ---
// Teacher: Get own courses
courseRouter.get('/', authMiddleware, async (req, res) => {
    try {
        const courses = await Course.find({ teacher: req.user.id }).sort({ createdAt: -1 });
        res.json(courses);
    } catch (error) { res.status(500).send('Server Error'); }
});
// Teacher: Create a course
courseRouter.post('/', authMiddleware, async (req, res) => {
    try {
        const newCourse = new Course({ ...req.body, teacher: req.user.id });
        const course = await newCourse.save();
        res.json(course);
    } catch (error) {
        console.error(error.message);
        res.status(400).json({ message: error.message });
    }
});

// Student: Get all available/published courses
courseRouter.get('/available', authMiddleware, async (req, res) => {
    try {
        const courses = await Course.find({ status: 'Published' })
            .populate('teacher', 'firstName lastName')
            .sort({ createdAt: -1 });
        res.json(courses);
    } catch (error) { res.status(500).send('Server Error'); }
});

// Student: Get enrolled courses
courseRouter.get('/enrolled', authMiddleware, async (req, res) => {
     try {
        const courses = await Course.find({ students: req.user.id });
        res.json(courses);
    } catch (error) { res.status(500).send('Server Error'); }
});


// Student: Get single course details
courseRouter.get('/:id', authMiddleware, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('reviews.student', 'firstName');
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (error) { res.status(500).send('Server Error'); }
});

// Student: Enroll in a course
courseRouter.post('/:id/enroll', authMiddleware, async (req, res) => {
    try {
        // Add student to course's student list
        await Course.findByIdAndUpdate(req.params.id, { $addToSet: { students: req.user.id } });
        // Add course to student's enrolled list
        await User.findByIdAndUpdate(req.user.id, { $addToSet: { enrolledCourses: req.params.id } });
        res.json({ message: 'Successfully enrolled!' });
    } catch (error) { res.status(500).send('Server Error'); }
});

// Student: Add a review to a course
courseRouter.post('/:id/reviews', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const course = await Course.findById(req.params.id);

        if (!course.students.includes(req.user.id)) {
            return res.status(403).json({ message: 'You must be enrolled to review this course.' });
        }
        
        const newReview = {
            ...req.body,
            student: req.user.id,
            studentName: `${user.firstName} ${user.lastName}`
        };

        course.reviews.unshift(newReview);
        await course.save();
        res.json(course.reviews[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// --- Use Routers ---
app.use('/api/auth', authRouter);
app.use('/api/courses', courseRouter);

// --- Start The Server ---
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

