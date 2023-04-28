const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();
const port = 3000;

app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/datingDB");

let add = 0;
let title = "";
let sex = "";
let perfectMatch = [];
let interestedPartner = [];
let interestedName = "";

const day = new Date();
const options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

const date = day.toLocaleDateString("en-US", options);

const simultaneousSchema = new mongoose.Schema({
  phone: String,
  name: String,
  dateMatched: String,
});

const Simultaneous = mongoose.model("Simultaneous", simultaneousSchema);

const detailsSchema = new mongoose.Schema({
  education: String,
  profession: String,
  maritalStatus: String,
  religion: String,
  ethnicity: String,
  dateCreated: String,
});

const Detail = mongoose.model("Detail", detailsSchema);

const descriptionSchema = new mongoose.Schema({
  options: {
    type: String,
    dateCreated: String,
  },
});

const Description = mongoose.model("Description", descriptionSchema);

const userSchema = new mongoose.Schema({
  name: String,
  phone: String,
  age: Number,
  gender: String,
  county: String,
  town: String,
  dateCreated: String,
  details: detailsSchema,
  description: descriptionSchema,
});

const User = mongoose.model("User", userSchema);

app.post("/dating", (req, res) => {
  let message = req.body.message.toLowerCase();
  if (message === "") {
    res.send(
      "To register type penzi to see interested parties type suitable your phone number eg suitable 0745671868"
    );
  } else if (message === "penzi") {
    welcome();
  } else if (message.startsWith("start")) {
    registration(message);
  } else if (message.startsWith("skip")) {
    skip();
  } else if (message.startsWith("details")) {
    details(message);
  } else if (message.startsWith("myself")) {
    description(message);
  } else if (message.startsWith("match")) {
    match(message);
  } else if (message.startsWith("next")) {
    next();
  } else if (message.length === 10) {
    phone(message);
  } else if (message.startsWith("describe")) {
    describe(message);
  } else if (message.startsWith("suitable")) {
    suitable(message);
  } else if (message.startsWith("yes")) {
    more();
  }
});

// if penzi call this function
const welcome = () => {
  app.post((req, res) => {
    res.send(
      "Welcome to our dating app. To register text start#name#phonenumber#age#gender#county#town \n E.g. start#John Doe#0745671865#26#Male#Nakuru#Naivasha. To see interested parties text suitable your number eg suitable 0745671868."
    );
  });
};

// if message starts with start
const registration = (message) => {
  app.post((res) => {
    const feedback = message;
    const array = feedback.split("#");
    const array2 = array.map((word) => {
      return word[0].toUpperCase() + word.substring(1);
    });
    const name = array2[1];
    const phone = array2[2];
    const age = array2[3];
    const gender = array2[4];
    const county = array2[5];
    const town = array2[6];

    title = name;
    sex = gender;

    // res.redirect("/details");
    if (name && phone && age && gender && county && town) {
      User.find({ $or: [{ phone: phone }, { name: name }] })
        .then((foundItem) => {
          if (foundItem.length >= 1) {
            res.send(
              "The name or telephone number is already taken. Please try again  E.g. start#John Doe Amber #0745671865#26#Male#Nakuru#Naivasha"
            );
          } else {
            const user = new User({
              name: name,
              phone: phone,
              age: age,
              gender: gender,
              county: county,
              town: town,
              dateCreated: date,
            });
            user
              .save()
              .then(() => {
                res.send(`Your profile has been created successfully ${title}. To add additional details text details#levelOfEducation#profession#maritalStatus#religion#ethnicity 
                   \n E.g. details#diploma#driver#single#christian#mijikenda \n to skip type skip`);
              })
              .catch((error) => {
                res.send(
                  "Please input the correct format as displayed in the example E.g. start#John Doe Amber#0745671865#26#Male#Nakuru#Naivasha"
                );
              });
          }
        })
        .catch((error) => {
          res.send(
            "Please input the correct format as displayed in the example E.g. start#John Doe Amber#0745671865#26#Male#Nakuru#Naivasha"
          );
        });
    } else {
      res.send(
        "Please input the correct format as displayed in the example E.g. start#John Doe Amber#0745671865#26#Male#Nakuru#Naivasha"
      );
    }
  });
};

// if message startswith skip
const skip = () => {
  res.send(
    `You are now registered for dating . To search for a MPENZI, \n text match#age#town and meet the person of your dreams.\n E.g., match#23-25#Kisumu`
  );
};

// if message starts with details
const details = (message) => {
  if (!title) {
    res.send(
      "Please input the correct format as displayed in the example E.g. start#John Doe Amber#0745671865#26#Male#Nakuru#Naivasha"
    );
  } else {
    const feedback = message;
    const array = feedback.split("#");
    const array2 = array.map((word) => {
      return word[0].toUpperCase() + word.substring(1);
    });

    const education = array2[1];
    const profession = array2[2];
    const maritalStatus = array2[3];
    const religion = array2[4];
    const ethnicity = array2[5];
    if (education && profession && maritalStatus && religion && ethnicity) {
      const detail = new Detail({
        education: education,
        profession: profession,
        maritalStatus: maritalStatus,
        religion: religion,
        ethnicity: ethnicity,
        dateCreated: date,
      });

      detail.save().then(() => {
        User.updateOne({ name: names }, { details: detail })
          .then(() => {
            res.send(
              `This is the last stage of registration ${title}. TEXT a brief description of yourself \n starting with the word MYSELF eg MYSELF chocolate, lovely, sexy etc.`
            );
          })
          .catch((error) => {
            console.log(
              "There was an error during update of details please check your code"
            );
            res.send(
              "Please input the correct format as displayed in the example E.g. details#diploma#driver#single#christian#mijikenda"
            );
          });
      });
    } else {
      res.send(
        "Please input the correct format as displayed in the example E.g. details#diploma#driver#single#christian#mijikenda"
      );
    }
  }
};

// if message starts with MYSELF
const description = (message) => {
  if (!title) {
    res.send(
      "Welcome to our dating app. To register text start#name#phonenumber#age#gender#county#town \n E.g. start#John Doe#0745671865#26#Male#Nakuru#Naivasha."
    );
  } else {
    const feedback = message;
    const array = feedback.split(" ");
    const desc = array[1];
    if (desc) {
      const descriptions = new Description({
        options: desc,
        dateCreated: date,
      });
      descriptions.save().then(() => {
        User.updateOne({ name: names }, { description: descriptions })
          .then(() => {
            res.send(
              `You are now registered for dating . To search for a MPENZI, \n text match#age#town and meet the person of your dreams.\n E.g., match#23-25#Kisumu`
            );
          })
          .catch((error) => {
            console.log(
              "There was an error during update of description please check your code"
            );
          })
          .catch(() => {
            console.log(
              "There was an error during description record insertion please check your code"
            );
            res.send(
              "Please input the correct format as displayed in the example eg MYSELF chocolate, lovely, sexy etc."
            );
          });
      });
    } else {
      res.send(
        "Please input the correct format as displayed in the example E.g. MYSELF chocolate, lovely, sexy etc."
      );
    }
  }
};

// if message starts with match
const match = (message) => {
  const feedback = message;
  if (!sex) {
    res.send(
      "Text penzi for activation. Text suitable to see interested parties."
    );
  } else {
    let gender = "";
    let single = "";
    if (sex === "Male") {
      gender = "ladies";
      single = "lady";
    }
    if (sex === "Female") {
      gender = "gentle mens";
      single = "gentle man";
    }
    const arr = feedback.split(/[#-]/);

    const array2 = arr.map((word) => {
      return word[0].toUpperCase() + word.substring(1);
    });

    const startAge = parseInt(array2[1]);
    const endAge = parseInt(array2[2]);
    const county = array2[3];

    if (startAge && endAge && county) {
      User.find({
        $and: [{ age: { $gte: startAge, $lte: endAge } }, { county: county }],
        gender: { $ne: gender },
      })
        .then((foundItem) => {
          if (foundItem.length === 0) {
            res.send(
              `We have ${foundItem.length} ${gender} who match your choice! Please try again E.g., match#23-25#Kisumu.`
            );
          } else {
            const paginate = (foundItem) => {
              itemsPerDisplay = 3;
              const pages = Math.ceil(foundItem.length / itemsPerDisplay);
              const newFoundItems = Array.from(
                { length: pages },
                (_, index) => {
                  const start = index * itemsPerDisplay;
                  return foundItem.slice(start, start + itemsPerDisplay);
                }
              );
              return newFoundItems;
            };
            const output = paginate(foundItem);
            perfectMatch = output;
            let text = `We have ${foundItem.length} ${gender} who match your choice! We will send you details of ${perfectMatch[0].length} of them shortly.\n
                          To get more details about a ${gender} text the number e.g 0720222284. Text NEXT to receive details of the remaining ${gender}`;
            res.send({ text, output: perfectMatch[0] });
          }
        })
        .catch((error) => {
          console.log(
            "there was an error during match ouput request from database please check your code"
          );
          res.send(
            "Please input the correct format as displayed in the example E.g., match#23-25#Kisumu"
          );
        });
    } else {
      res.send(
        "Please input the correct format as displayed in the example E.g., match#23-25#Kisumu"
      );
    }
  }
};

// if message starts with next
const next = () => {
  if (perfectMatch === undefined) {
    res.send("Please try again E.g., match#23-25#Kisumu.");
  } else if (add === undefined) {
    res.send("Please try again E.g., match#23-25#Kisumu.");
  } else {
    add = add + 1;

    let gender = "";
    let single = "";
    if (sex === "Male") {
      gender = "ladies";
      single = "lady";
    }
    if (sex === "Female") {
      gender = "gentle mens";
      single = "gentle man";
    }
    if (add > output.length - 1) {
      res.send(
        `No more matches found. Thank you. Text match#age#town and meet the person of your dreams. E.g., match#23-25#Kisumu`
      );
    } else {
      let text = `To get more details about a ${single}, text the  number e.g., 0722010203. The remaining ${gender} are:  .Text NEXT to receive details of the remaining ${gender}`;
      res.send({ text, output: perfectMatch[add] });
    }
  }
};

// if message.length === 10
const phone = (message) => {
  if (perfectMatch === undefined) {
    res.send("Please try again E.g., match#23-25#Kisumu.");
  } else {
    User.find({ phone: message })
      .then((foundItem) => {
        interestedName = foundItem.name;
        Simultaneous.find({
          $and: [{ phone: message }, { name: interestedName }],
        }).then((found) => {
          if (found.length >= 1) {
            console.log("already exists");
          } else {
            const sim = new Simultaneous({
              phone: message,
              name: interestedName,
            });
            sim
              .save()
              .then(() => {
                console.log("saved simultaneous sucessfully");
              })
              .catch((error) => {
                console.log(error);
              });
          }
        });
        let text =
          "The requested match is: Send describe the persons phone number to get more details about ${interestedName}. eg describe 0745671868";
        res.send({ text, foundItem: foundItem });
      })
      .catch((error) => {
        console.log(error);
        res.send("No found user. Thank you");
      });
  }
};

// if message starts with describe
const describe = (message) => {
  if (perfectMatch === undefined) {
    res.send("Please try again E.g., match#23-25#Kisumu.");
  } else {
    const arr = message.split(" ");
    const desc = arr[1];
    if (!desc) {
      res.send("please input the correct format eg describe 0745671868");
    } else {
      User.find({ phone: desc })
        .then((foundItem) => {
          res.send(foundItem);
        })
        .catch((error) => {
          console.log(error);
          res.send(
            `Please enter the correct format please eg DESCRIBE 0702556677`
          );
        });
    }
  }
};

// if message starts with suitable
const suitable = (message) => {
  const arr = message.split(" ");
  const phoneInputed = arr[1];
  User.find({ phone: phoneInputed })
    .then((foundItem) => {
      let suitableName = foundItem[0].name;
      if (foundItem.length < 1) {
        res.send(
          "No phone record found. Please try again e.g suitable 0745671868"
        );
      } else {
        Simultaneous.find({ phone: phoneInputed })
          .then((found) => {
            if (found.length < 1) {
              res.send(
                "No interested parties found. Thank you. you try again eg suitable 0745671868"
              );
            } else {
              User.find({ name: found[0].name })
                .then((f) => {
                  if (f.length < 1) {
                    res.send(
                      "No interested parties found. Thank you. Please try again e.g suitable 0745671868"
                    );
                  } else {
                    let text =
                      "The interested parties are : .Type yes to see more about the user";
                    interestedPartner = f;
                    res.send({
                      text,
                      interestedPartner: interestedPartner,
                      suitableName,
                    });
                  }
                })
                .catch((error) => {
                  console.log(error);
                });
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }
    })
    .catch(() => {
      res.send(
        "Please input a correct number. Thank you. e.g suitable 0745671868"
      );
    });
};

// if message starts with yes
const more = () => {
  moreName = interestedPartner;
  if (moreName === undefined) {
    res.send("Please try again e.g suitable 0745671868");
  } else {
    res.send(moreName);
  }
};

app.listen(port, () => {
  console.log(`i am listening at port ${port}`);
});
