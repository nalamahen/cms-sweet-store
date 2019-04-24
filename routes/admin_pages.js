var express = require("express");
var router = express.Router();
var auth = require("../config/auth");
var isAdmin = auth.isAdmin;

// Get page model
var Page = require("../models/page");

/*
 * GET pages index/
 */
router.get("/", isAdmin, function(req, res) {
  Page.find({})
    .sort({ sorting: 1 })
    .exec(function(err, pages) {
      res.render("admin/pages", {
        pages: pages
      });
    });
});

/*
 * GET add page/
 */
router.get("/add-page", isAdmin, function(req, res) {
  var title = "";
  var slug = "";
  var content = "";

  res.render("admin/add_page", {
    title: title,
    slug: slug,
    content: content
  });
});

/*
 * POST pages index/
 */
router.post("/add-page", function(req, res) {
  req.checkBody("title", "Title must have a value.").notEmpty();
  req.checkBody("content", "Content must have a value.").notEmpty();

  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
  if (slug == "") slug = title.replace(/\s+/g, "-").toLowerCase();
  var content = req.body.content;

  var errors = req.validationErrors();

  if (errors) {
    console.log("errors");
    res.render("admin/add_page", {
      errors: errors,
      title: title,
      slug: slug,
      content: content
    });
  } else {
    Page.findOne({ slug: slug }, function(err, page) {
      if (page) {
        req.flash("danger", "Page slug exists, choose another.");
        res.render("admin/add_page", {
          title: title,
          slug: slug,
          content: content
        });
      } else {
        var page = new Page({
          title: title,
          slug: slug,
          content: content,
          sorting: 100
        });

        page.save(function(err) {
          if (err) return console.log(err);

          Page.find({})
            .sort({ sorting: 1 })
            .exec(function(err, pages) {
              if (err) {
                console.log(err);
              } else {
                req.app.locals.pages = pages;
              }
            });

          req.flash("success", "Page added!");
          res.redirect("/admin/pages");
        });
      }
    });
  }
});

// Sort pages function
function sortPages(ids, callback) {
  var count = 0;

  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    count++;

    (function(count) {
      Page.findById(id, function(err, page) {
        page.sorting = count;
        page.save(function(err) {
          if (err) return console.log(err);
          ++count;
          if (count >= ids.length) {
            callback();
          }
        });
      });
    })(count);
  }
}

/*
 * POST reorder pages
 */
router.post("/reorder-pages", function(req, res) {
  var ids = req.body["id[]"];

  sortPages(ids, function() {
    Page.find({})
      .sort({ sorting: 1 })
      .exec(function(err, pages) {
        if (err) {
          console.log(err);
        } else {
          req.app.locals.pages = pages;
        }
      });
  });
});

/*
 * GET edit page
 */
router.get("/edit-page/:id", isAdmin, function(req, res) {
  Page.findById(req.params.id, function(err, page) {
    if (err) return console.log(err);

    res.render("admin/edit_page", {
      title: page.title,
      slug: page.slug,
      content: page.content,
      id: page._id
    });
  });
});

/*
 * POST edit page
 */
router.post("/edit-page/:id", function(req, res) {
  req.checkBody("title", "Title must have a value.").notEmpty();
  req.checkBody("content", "Content must have a value.").notEmpty();

  var title = req.body.title;
  var slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
  if (slug == "") slug = title.replace(/\s+/g, "-").toLowerCase();
  var content = req.body.content;
  var id = req.params.id;

  var errors = req.validationErrors();

  if (errors) {
    res.render("admin/edit_page", {
      errors: errors,
      title: title,
      slug: slug,
      content: content,
      id: id
    });
  } else {
    Page.findOne({ slug: slug, _id: { $ne: id } }, function(err, page) {
      if (page) {
        req.flash("danger", "Page slug exists, choose another.");
        res.render("admin/edit_page", {
          title: title,
          slug: slug,
          content: content,
          id: id
        });
      } else {
        Page.findById(id, function(err, page) {
          if (err) return console.log(err);

          page.title = title;
          page.slug = slug;
          page.content = content;

          page.save(function(err) {
            if (err) return console.log(err);

            Page.find({})
              .sort({ sorting: 1 })
              .exec(function(err, pages) {
                if (err) {
                  console.log(err);
                } else {
                  req.app.locals.pages = pages;
                }
              });

            req.flash("success", "Page edited!");
            res.redirect("/admin/pages/edit-page/" + id);
          });
        });
      }
    });
  }
});

/*
 * GET delete page
 */
router.get("/delete-page/:id", isAdmin, function(req, res) {
  Page.findByIdAndRemove(req.params.id, function(err) {
    if (err) return console.log(err);

    Page.find({})
      .sort({ sorting: 1 })
      .exec(function(err, pages) {
        if (err) {
          console.log(err);
        } else {
          req.app.locals.pages = pages;
        }
      });

    req.flash("success", "Page deleted!");
    res.redirect("/admin/pages/");
  });
});

/* Test email */
router.get("/test-email", isAdmin, function(req, res) {
  var aws = require("aws-sdk");
  var keys = require("../config/keys");

  // Provide the full path to your config.json file.
  aws.config.loadFromPath("./config/config.json");
  //aws.config.credentials = keys;

  // Replace sender@example.com with your "From" address.
  // This address must be verified with Amazon SES.
  const sender = "bizzcandy@gmail.com";

  // Replace recipient@example.com with a "To" address. If your account
  // is still in the sandbox, this address must be verified.
  const recipient = "sujimahen@gmail.com";

  // Specify a configuration set. If you do not want to use a configuration
  // set, comment the following variable, and the
  // ConfigurationSetName : configuration_set argument below.
  //const configuration_set = "ConfigSet";

  // The subject line for the email.
  const subject = "Amazon SES Test (AWS SDK for JavaScript in Node.js)";

  // The email body for recipients with non-HTML email clients.
  const body_text =
    "Amazon SES Test (SDK for JavaScript in Node.js)\r\n" +
    "This email was sent with Amazon SES using the " +
    "AWS SDK for JavaScript in Node.js.";

  // The HTML body of the email.
  const body_html = `<html>
<head></head>
<body>
  <h1>Amazon SES Test (SDK for JavaScript in Node.js)</h1>
  <p>This email was sent with
    <a href='https://aws.amazon.com/ses/'>Amazon SES</a> using the
    <a href='https://aws.amazon.com/sdk-for-node-js/'>
      AWS SDK for JavaScript in Node.js</a>.</p>
</body>
</html>`;

  // The character encoding for the email.
  const charset = "UTF-8";

  // Create a new SES object.
  var ses = new aws.SES();

  // Specify the parameters to pass to the API.
  var params = {
    Source: sender,
    Destination: {
      ToAddresses: [recipient]
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: charset
      },
      Body: {
        Text: {
          Data: body_text,
          Charset: charset
        },
        Html: {
          Data: body_html,
          Charset: charset
        }
      }
    }
    //ConfigurationSetName: configuration_set
  };

  //Try to send the email.
  ses.sendEmail(params, function(err, data) {
    // If something goes wrong, print an error message.
    if (err) {
      console.log(err.message);
      res.render("admin/admin_error", {
        error: err
      });
    } else {
      console.log("Email sent! Message ID: ", data.MessageId);
      res.render("admin/admin_error", {
        error: "Email sent! Message ID: " + data.MessageId
      });
    }
  });
});

// Exports
module.exports = router;
