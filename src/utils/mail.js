import Mailgen from "mailgen";
import nodemailer from "nodemailer";



const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Task Manager",
            link: "https//taskmanagelink.com"
        },
    });

    
    const emailTextual = mailGenerator.generatePlaintext(options.mailGenContent);

    const emailHtml = mailGenerator.generate(options.mailGenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth :{
        user: process.env.MAILTRAP_SMTP_USER,
        pass: process.env.MAILTRAP_SMTP_PASS
        },
    })

    const mail = {
    from: "mail.taskmanager@example.com",
    to: option.email,
    subject: option.subject,
    text: emailTextual,
    html: emailHtml
    };  
    
    try {
        await transporter.sendEmail(mail)
    } catch (error) {
        console.error("email service failed silently,make sure that have provided MAILTRAP")
        console.error("error:",error)
    };


};



const emailVerificationMailgenContent = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: "welcome to our app,we are excited to have youi on board",
            action: {
                instruction: "to verify your email please click on the following button",
                button: {
                    color: "#258948",
                    text: "verify your email",
                    link: verificationUrl,

                },
            },
            outro: "need help ot have question?just reply to thid email"
        }
    }
}

const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
    return {
        body: {
            name: username,
            intro: "we got a request to reset the password",

            action: {
                instruction: "to reset your password please click the button",

                button: {
                    color: "#097c3b",
                    text: "verify your email",
                    link: passwordResetUrl,

                },
            },
            outro: "need help ot have question?just reply to thid email"
            
        },

    }
}

export {
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
    sendEmail
};