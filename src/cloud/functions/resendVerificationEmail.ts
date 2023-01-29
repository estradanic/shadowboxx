import { createTransport } from "nodemailer";

export type ResendVerificationEmailParams = {
  email: string;
};

/** Function to resend verification email */
const resendVerificationEmail = async ({
  email,
}: ResendVerificationEmailParams) => {
  const config = await new Parse.Query("Config").first({ useMasterKey: true });
  if (!config?.get("zohoPassword")) {
    console.error("Failed to send verification email: no Zoho password");
    throw new Parse.Error(500, "Failed to send verification email");
  }

  const user = await new Parse.Query(Parse.User)
    .equalTo("email", email)
    .first({ useMasterKey: true });

  if (!user) {
    throw new Parse.Error(404, "User not found");
  }

  if (user.get("updatedAt")) {
    const updatedAt = user.get("updatedAt");
    const diff = new Date().getTime() - updatedAt.getTime();
    if (diff < 5 * 60 * 1000) {
      throw new Parse.Error(
        429,
        `Please wait ${Math.round(
          300 - diff / 1000
        )} seconds before trying again`
      );
    }
  }

  const code = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  user.set("verificationCode", code);
  user.save(null, { useMasterKey: true, context: { noTrigger: true } });

  const transport = createTransport({
    host: "smtppro.zoho.com",
    port: 465,
    secure: true,
    auth: {
      user: "admin@shadowboxx.app",
      pass: config.get("zohoPassword"),
    },
  });

  const mailOptions = {
    from: '"Shadowboxx Admin" <admin@shadowboxx.app>',
    to: user.get("email"),
    subject: "Shadowboxx Email Verification",
    text: `Hi ${user.get("firstName")}, your verification code is ${code}`,
    html: `<p>Hi ${user.get(
      "firstName"
    )}, your verification code is ${code}</p>`,
  };

  transport.sendMail(mailOptions, (e, i) => {
    if (e) {
      console.error("Failed to resend verification email", e);
      throw new Parse.Error(500, "Failed to resend verification email");
    }
    console.log(
      "Verification email resent to user",
      user.get("email"),
      i.messageId,
      i.response
    );
  });
};

export default resendVerificationEmail;
