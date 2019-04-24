exports.getParams = function(
  sender,
  recipient,
  carbonCopy,
  subject,
  body_html
) {
  const charset = "UTF-8";
  const params = {
    Source: sender,
    Destination: {
      ToAddresses: [recipient],
      CcAddresses: [carbonCopy]
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: charset
      },
      Body: {
        Html: {
          Data: body_html,
          Charset: charset
        }
      }
    }
  };

  return params;
};

exports.fromAddress = "bizzcandy@gmail.com";
exports.carbonCopy = "thiruganesh@gmail.com";
