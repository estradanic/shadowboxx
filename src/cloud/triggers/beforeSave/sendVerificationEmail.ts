import { createTransport } from "nodemailer";
import loggerWrapper from "../../loggerWrapper";
import { ParseUser, Strings } from "../../shared";

/** Function to send verification email when email changes */
const sendVerificationEmail = async (
  user: ParseUser
) => {
  const oldUser = await ParseUser.cloudQuery(Parse).get(user.id, {
    useMasterKey: true,
  });
  if (
    oldUser.email === user.email
  ) {
    return;
  }

  const config = await new Parse.Query("Config").first({ useMasterKey: true });
  if (!config?.get("zohoPassword")) {
    console.error("Failed to send verification email: no Zoho password");
    throw new Parse.Error(
      Parse.Error.INTERNAL_SERVER_ERROR,
      Strings.cloud.error.failedToSendVerificationEmail
    );
  }

  const transport = createTransport({
    host: "smtppro.zoho.com",
    port: 465,
    secure: true,
    auth: {
      user: "admin@shadowboxx.app",
      pass: config.get("zohoPassword"),
    },
  });

  const code = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  user.verificationCode = code;

  if (user.isNew()) {
    user.email = user.username;
  } else {
    user.oldEmail = oldUser.email;
  }

  const mailOptions = {
    from: '"Shadowboxx Admin" <admin@shadowboxx.app>',
    to: user.email,
    subject: "Shadowboxx Email Verification",
    text: `Hi ${user.firstName}, your verification code is ${code}`,
    html: `<p>Hi ${user.firstName}, your verification code is ${code}</p>`,
  };

  transport.sendMail(mailOptions, (e, i) => {
    if (e) {
      console.error("Failed to send verification email", e);
      throw new Parse.Error(
        Parse.Error.INTERNAL_SERVER_ERROR,
        Strings.cloud.error.failedToSendVerificationEmail
      );
    }
    console.log(
      "Verification email sent to user",
      user.email,
      i.messageId,
      i.response
    );
  });
};

export default loggerWrapper("sendVerificationEmail", sendVerificationEmail);
