import { User } from "../models/user.model.js";
import  ApiResponse  from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendEmail } from "../utils/mail.js";


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

export { registerUser, login ,logoutUser};
    
    
