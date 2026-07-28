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

export { registerUser };
