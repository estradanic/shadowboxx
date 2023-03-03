import { createTransport } from "nodemailer";
import loggerWrapper from "../../loggerWrapper";
import { NativeAttributes, ParseUser, Strings } from "../../shared";

/** Function to send verification email when email changes */
const sendVerificationEmail = async (
  user: Parse.User<NativeAttributes<"_User">>
) => {
  const oldUser = await ParseUser.cloudQuery(Parse).get(user.id, {
    useMasterKey: true,
  });
  if (
    oldUser.get(ParseUser.COLUMNS.email) === user.get(ParseUser.COLUMNS.email)
  ) {
    return;
  }

  const config = await new Parse.Query("Config").first({ useMasterKey: true });
  if (!config?.get("zohoPassword")) {
    console.error("Failed to send verification email: no Zoho password");
    throw new Parse.Error(
      500,
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
  user.set("verificationCode", code);

  if (user.isNew()) {
    user.set(ParseUser.COLUMNS.email, user.getUsername()!);
  } else {
    user.set(ParseUser.COLUMNS.oldEmail, oldUser.get(ParseUser.COLUMNS.email));
  }

  const mailOptions = {
    from: '"Shadowboxx Admin" <admin@shadowboxx.app>',
    to: user.get(ParseUser.COLUMNS.email),
    subject: "Shadowboxx Email Verification",
    text: `Hi ${user.get(
      ParseUser.COLUMNS.firstName
    )}, your verification code is ${code}`,
    html: `<p>Hi ${user.get(
      ParseUser.COLUMNS.firstName
    )}, your verification code is ${code}</p>`,
  };

  transport.sendMail(mailOptions, (e, i) => {
    if (e) {
      console.error("Failed to send verification email", e);
      throw new Parse.Error(
        500,
        Strings.cloud.error.failedToSendVerificationEmail
      );
    }
    console.log(
      "Verification email sent to user",
      user.get(ParseUser.COLUMNS.email),
      i.messageId,
      i.response
    );
  });
};

export default loggerWrapper("sendVerificationEmail", sendVerificationEmail);
