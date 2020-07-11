require("dotenv").config();

const deta = require("deta")(process.env.DETA_SECRET);
const store = deta.Base("applications-1");

const express = require("express");
const app = express();

app.use(express.static("static"));
app.use(express.json());
app.set("json spaces", 2);

const xkcdPassword = require("xkcd-password");
const pw = new xkcdPassword();

app.get("/apply", (req, res) => {
  res.status(406);
  res.send({
    message: "We said POST!",
    status: "Failed.",
  });
});

app.post("/apply", async (req, res) => {
  if (!req.body.id) {
    const id = await pw.generate({ numWords: 4, minLength: 5, maxLength: 20 });
    res.send({
      instructions:
        "Fill the answer property of each question. Once you're done, copy this JSON and post it back to https://jam.deta.dev/apply. We don't expect any more than 30 words for any question.",
      email: {
        details: "This one is pretty self-explanatory.",
        answer: "",
      },
      whoAreYou: {
        details:
          "Tell us who you are! What sort of projects do you like to work on? Share any links you want!",
        answer: "",
      },
      yourIdea: {
        details:
          "What side project do you want to build during the Deta Jam? Why?",
        answer: "",
      },
      favoriteBook: {
        details: "What's your favorite book? Why?",
        answer: "",
      },
      key: id.join("-"),
    });
  } else {
    if (
      !req.body.email ||
      !req.body.whoAreYou ||
      !req.body.yourIdea ||
      req.body.favoriteBook
    ) {
      res.status(406);
      return res.send({
        message: "All questions need to be answered",
        status: "Failed.",
      });
    }

    const put = store.put(req.body);
    res.status(200);
    res.send({
      message: `Submitted application code #${put.key}.`,
      status: `Success.`,
    });
  }
});

if (!process.env.DETA_RUNTIME) app.listen(3000);

module.exports = app;
