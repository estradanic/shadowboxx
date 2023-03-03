import { createTransport } from "nodemailer";
import loggerWrapper from "../loggerWrapper";
import { ParseUser, Strings } from "../shared";

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
    throw new Parse.Error(
      500,
      Strings.cloud.error.failedToSendVerificationEmail
    );
  }

  const user = await ParseUser.cloudQuery(Parse)
    .equalTo(ParseUser.COLUMNS.email, email)
    .first({ useMasterKey: true });

  if (!user) {
    throw new Parse.Error(404, Strings.cloud.error.userNotFound);
  }

  if (user.get(ParseUser.COLUMNS.updatedAt)) {
    const diff =
      new Date().getTime() - user.get(ParseUser.COLUMNS.updatedAt).getTime();
    if (diff < 5 * 60 * 1000) {
      throw new Parse.Error(
        429,
        Strings.cloud.error.pleaseWaitSeconds(Math.round(300 - diff / 1000))
      );
    }
  }

  const code = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  user.set(ParseUser.COLUMNS.verificationCode, code);
  await user.save(null, { useMasterKey: true, context: { noTrigger: true } });

  const transport = createTransport({
    host: "smtppro.zoho.com",
    port: 465,
    secure: true,
    auth: {
      user: "admin@shadowboxx.app",
      pass: config.get("zohoPassword"),
    },
  });

  const firstName = user.get(ParseUser.COLUMNS.firstName);
  const mailOptions = {
    from: '"Shadowboxx Admin" <admin@shadowboxx.app>',
    to: user.get("email"),
    subject: "Shadowboxx Email Verification",
    text: `Hi ${firstName}, your verification code is ${code}`,
    html: `<p>Hi ${firstName}, your verification code is ${code}</p>`,
  };

  transport.sendMail(mailOptions, (e, i) => {
    if (e) {
      console.error("Failed to resend verification email", e);
      throw new Parse.Error(
        500,
        Strings.cloud.error.failedToSendVerificationEmail
      );
    }
    console.log(
      "Verification email resent to user",
      user.get(ParseUser.COLUMNS.email),
      i.messageId,
      i.response
    );
  });
};

export default loggerWrapper(
  "resendVerificationEmail",
  resendVerificationEmail
);
