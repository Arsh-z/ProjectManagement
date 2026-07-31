import { User } from "../models/user.model.js";
import  ApiResponse  from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { forgotPasswordMailgenContent, sendEmail } from "../utils/mail.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generaterefreshToken();

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(
            500,
            "something went wrong while generating access token",
        );
    }  
};

const registerUser = asyncHandler(async (req, res) => {
    
    const { email, username, password, role } = req.body;
    
    const excitedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (excitedUser) {
        throw new ApiError(409,"user with email or username already excited")
    }

    const user = await User.create({
        email,
        password,
        username,
        isEmailVerified: false
    });

    const { unHashedToken, hashedtoken, tokenExpiry } =
        user.generateTemporaryToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    await sendEmail(
        {
            email: user?.email,
            subject: "please verify your email",
            mailgenContent: emailVerificationMailgenContent(
                user.username,
                `${req.protoco}://${req.get("host")}/api/v1//user/verify-email/${unHashedToken}`
            ),
        }
    );

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",

    );

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering a user");
    }
    
    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                { user: createdUser },
                "user registered successfully and verification email has been sent to your email"
            )
        )
    

    
});


const login = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body
    if (!email) {
        throw new ApiError(404, "email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "user does not exist")
        
    }
     
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(404, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    const options = {
        httpOnly: true,
        secure : true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshtoken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "user Logged in successfully"
            )
        )

});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: ""
            }
        },
        {
            new: true,
        },

    );
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "user logged out")
        );
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "current user Fetched successfully"
            )
        );    
});
 

const verifyEmail = asyncHandler(async (req, res) => {
    const { verificationToken } = req.params
    
    if (!verificationToken) {
        throw new ApiError(400, "EMail verification token is missing")
    };

    let hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");
    
    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: Date.now() },
        
    });

    if (!user) {
        throw new ApiError(400, "EMail verification token is missing")
    };

    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(
        200,
        {
            isEmailVerified: true,
        },
        "email is verified",
    ));
});

const resendEmailVerification = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._iid);

    if (!user) {
        throw new ApiError(404, "user does not exist")
    }

    if (!user.isEmailVerified) {
        throw new ApiError(404, "Email is already verified")
    }

    const { unHashedToken, hashedtoken, tokenExpiry } =
        user.generateTemporaryToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    await sendEmail(
        {
            email: user?.email,
            subject: "please verify your email",
            mailgenContent: emailVerificationMailgenContent(
                user.username,
                `${req.protoco}://${req.get("host")}/api/v1//user/verify-email/${unHashedToken}`
            ),
        }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {

                },
                "mail has been sent to your email ID"
            )
        )

    
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshAccessToken || req.body.refreshToken
    
    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized access")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET,
        );

        const user = await User.findById(decodedToken?._ID);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired");
        }

        const options = {
            httpOnly: true,
            secure: true
            
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);
        user.refreshToken = newRefreshToken;
        await user.save();

        return res
            .status(200)
            .cookies("accessToken", accessToken, options)
            .cookies("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken
                    },
                    "Access token refreshed"
                ),
                
            );
        
    } catch {
        throw new ApiError(401,"unauthorized access")
    }

        
    
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError(404, "user does not exist", [])
    }
    
    const { unHashedToken, hashedtoken, tokenExpiry } =
        user.generateTemporaryToken();
        
    user.forgotPasswordToken = hashedtoken
    user.forgotPasswordExpiry = tokenExpiry
    await user.save({ validateBeforeSave: false })
    
    await sendEmail(
        {
            email: user?.email,
            subject: "password reset request",
            mailgenContent: forgotPasswordMailgenContent(
                user.username,
                `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`
            ),
        }
    );
        
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "password reset mail sent to your emailID"
            )
        );
});


const resetForgotPassword = asyncHandler(async (req, res) => {
    const { resetToken } = req.params
    const { newPassword } = req.body
    
    let hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")
         
    const user = await User.findOne({

        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    })
        
    if (!user) {
        throw new ApiError(489, "token is not valid or expired");
    }
        
    user.forgotPasswordExpiry = undefined
    user.forgotPasswordToken = undefined
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "password reset successdfully"
            )
        );
});



export {
    registerUser,
    login,
    logoutUser,
    getCurrentUser,
    verifyEmail,
    resendEmailVerification,
    refreshAccessToken
};
    
    
