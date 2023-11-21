// emailService.js
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

dotenv.config({ path: ".env" });

class EmailService {
  constructor() {
    const OAuth2 = google.auth.OAuth2;

    this.oauth2Client = new OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground" // Redirect URL
    );

    this.oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USERNAME,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: this.getAccessToken(), // We will create this function below
      },
    });
  }

  async getAccessToken() {
    try {
      const { token } = await this.oauth2Client.getAccessToken();
      return token;
    } catch (error) {
      console.error("Failed to retrieve access token", error);
      throw new Error("Failed to retrieve access token");
    }
  }

  async sendVerificationEmail(userEmail, verificationToken) {
    const verificationUrl = `http://localhost:5500/api/user/verify-email?token=${verificationToken}`;

    try {
      const mailOptions = {
        from: '"Rent-Wyse" <noreply@rentwyse.com>',
        to: userEmail,
        subject: "Rent-Wyse Email Verification",
        html: `Please click this link to confirm your email address: <a href="${verificationUrl}">${verificationUrl}</a>`,
      };

      // Before sending the mail, ensure that the accessToken is set
      const accessToken = await this.getAccessToken();
      this.transporter.set("oauth2_provision_cb", (user, renew, callback) => {
        return callback(null, accessToken);
      });

      await this.transporter.sendMail(mailOptions);
      console.log("Verification email sent successfully");
    } catch (error) {
      console.error("Failed to send verification email", error);
      throw error;
    }
  }
}

module.exports = new EmailService();
