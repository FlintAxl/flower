const User = require('../models/user');


const crypto = require('crypto')
const cloudinary = require('cloudinary')


exports.registerUser = async (req, res, next) => {
    try {
        console.log(req.body)
        const { name, email, password, firebaseUid, isGoogleSignup, isGoogleLogin, avatarUrl } = req.body;

        // Check if user already exists (for Google login attempts)
        if (isGoogleLogin === 'true') {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                // User exists, return login data
                const token = existingUser.getJwtToken();
                return res.status(200).json({
                    success: true,
                    user: existingUser,
                    token,
                    message: 'User logged in successfully'
                });
            }
        }

        // Check if user already exists (for regular registration)
        const existingUser = await User.findOne({ email });
        if (existingUser && isGoogleSignup !== 'true' && isGoogleLogin !== 'true') {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        let avatarData = {
            public_id: 'default_avatar',
            url: '/images/default_avatar.jpg'
        };

        // Handle Google profile picture
        if (isGoogleSignup === 'true' || isGoogleLogin === 'true') {
            if (avatarUrl) {
                try {
                    // Upload Google profile picture to Cloudinary
                    const result = await cloudinary.v2.uploader.upload(avatarUrl, {
                        folder: 'avatars',
                        width: 150,
                        crop: "scale"
                    });
                    
                    avatarData = {
                        public_id: result.public_id,
                        url: result.secure_url
                    };
                } catch (cloudinaryError) {
                    console.log('Cloudinary upload failed for Google avatar, using default:', cloudinaryError);
                    // Keep default avatar if Cloudinary upload fails
                }
            }
        } else {
            // Handle regular avatar upload
            if (req.body.avatar && req.body.avatar !== '/images/default_avatar.jpg') {
                const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
                    folder: 'avatars',
                    width: 150,
                    crop: "scale"
                });
                
                avatarData = {
                    public_id: result.public_id,
                    url: result.secure_url
                };
            }
        }

        const user = await User.create({
            name,
            email,
            password,
            avatar: avatarData,
            firebaseUid: firebaseUid || null
        });

        const token = user.getJwtToken();

        return res.status(201).json({
            success: true,
            user,
            token,
            message: isGoogleSignup === 'true' ? 'Google registration successful' : 'Registration successful'
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Registration failed'
        });
    }
}

exports.loginUser = async (req, res, next) => {
    try {
        const { email, password, firebaseUid, isGoogleLogin } = req.body;

        // For Google login, we don't need password validation
        if (isGoogleLogin === 'true') {
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'User not found. Please register first.' });
            }

            const token = user.getJwtToken();
            return res.status(200).json({
                success: true,
                token,
                user,
                message: 'Google login successful'
            });
        }

        // Regular email/password login
        if (!email || !password) {
            return res.status(400).json({ error: 'Please enter email & password' });
        }

        // Finding user in database
        let user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid Email or Password' });
        }

        // Checks if password is correct or not
        const isPasswordMatched = await user.comparePassword(password);
        if (!isPasswordMatched) {
            return res.status(401).json({ message: 'Invalid Email or Password' });
        }

        const token = user.getJwtToken();

        res.status(200).json({
            success: true,
            token,
            user,
            message: 'Login successful'
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Login failed'
        });
    }
}

exports.forgotPassword = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(404).json({ error: 'User not found with this email' })

    }
    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    // Create reset password url
    const resetUrl = `${req.protocol}://localhost:5173/password/reset/${resetToken}`;
    const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`
    try {
        await sendEmail({
            email: user.email,
            subject: 'ShopIT Password Recovery',
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({ error: error.message })
      
    }
}

exports.resetPassword = async (req, res, next) => {
    console.log(req.params.token)
    // Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({
        // resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })
    console.log(user)

    if (!user) {
        return res.status(400).json({ message: 'Password reset token is invalid or has been expired' })
        
    }

    if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({ message: 'Password does not match' })

    }

    // Setup new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    const token = user.getJwtToken();
    return res.status(201).json({
        success: true,
        token,
        user
    });
   
}

exports.getUserProfile = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    console.log(user)

    return res.status(200).json({
        success: true,
        user
    })
}

exports.updateProfile = async (req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    // Update avatar
    if (req.body.avatar !== '') {
        let user = await User.findById(req.user.id)
        // console.log(user)
        const image_id = user.avatar.public_id;
        const res = await cloudinary.v2.uploader.destroy(image_id);
        // console.log("Res", res)
        const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'avatars',
            width: 150,
            crop: "scale"
        })

        newUserData.avatar = {
            public_id: result.public_id,
            url: result.secure_url
        }
    }
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
    })
    if (!user) {
        return res.status(401).json({ message: 'User Not Updated' })
    }

    return res.status(200).json({
        success: true,
        user
    })
}

exports.updatePassword = async (req, res, next) => {
    console.log(req.body.password)
    const user = await User.findById(req.user.id).select('+password');
    // Check previous user password
    const isMatched = await user.comparePassword(req.body.oldPassword)
    if (!isMatched) {
        return res.status(400).json({ message: 'Old password is incorrect' })
    }
    user.password = req.body.password;
    await user.save();
    const token = user.getJwtToken();

    return res.status(201).json({
        success: true,
        user,
        token
    });

}

exports.allUsers = async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        success: true,
        users
    })
}


exports.getUserDetails = async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(400).json({ message: `User does not found with id: ${req.params.id}` })
        // return next(new ErrorHandler(`User does not found with id: ${req.params.id}`))
    }

    res.status(200).json({
        success: true,
        user
    })
}

exports.updateUser = async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        // useFindAndModify: false
    })

    return res.status(200).json({
        success: true
    })
}

exports.createUserByAdmin = async (req, res, next) => {
    try {
        const { name, email, password, role, avatar, firebaseUid } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        let avatarData = {
            public_id: 'default_avatar',
            url: '/images/default_avatar.jpg'
        };

        // Handle avatar upload if provided
        if (avatar && avatar !== '/images/default_avatar.jpg') {
            const result = await cloudinary.v2.uploader.upload(avatar, {
                folder: 'avatars',
                width: 150,
                crop: "scale"
            });
            
            avatarData = {
                public_id: result.public_id,
                url: result.secure_url
            };
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'user',
            avatar: avatarData,
            firebaseUid: firebaseUid || null
        });

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Create user error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Error creating user'
        });
    }
}

exports.bulkDeleteUsers = async (req, res, next) => {
    try {
        const { userIds } = req.body;
        
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide valid user IDs'
            });
        }

        // Delete users from database
        const result = await User.deleteMany({ _id: { $in: userIds } });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'No users found to delete'
            });
        }

        return res.status(200).json({
            success: true,
            message: `${result.deletedCount} users deleted successfully`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Bulk delete users error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting users'
        });
    }
}