const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

mongoose.connect("mongodb://127.0.0.1:27017/datingDB");

const simultaneousSchema = new mongoose.Schema({
  phone: String,
  name: String,
});

const Simultaneous = mongoose.model("Simultaneous", simultaneousSchema);

const detailsSchema = new mongoose.Schema({
  education: String,
  profession: String,
  maritalStatus: String,
  religion: String,
  ethnicity: String,
});

const Detail = mongoose.model("Detail", detailsSchema);

const descriptionSchema = new mongoose.Schema({
  options: {
    type: String,
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
  details: detailsSchema,
  description: descriptionSchema,
});

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  let text =
    "Text penzi for activation. Text suitable to see interested parties.";
  res.render("index", { text: text });
});

app.post("/", (req, res) => {
  const feedback = req.body.dating.toLowerCase();
  let text = "";
  if (feedback === "penzi") {
    res.redirect("/registration");
  } else if (feedback === "suitable") {
    res.redirect("/suitable");
  } else {
    text =
      "Text penzi for activation. Text suitable to see interested parties.";
    res.render("index", { text: text });
  }
});

app.get("/registration", (req, res) => {
  let text =
    "Welcome to our dating app. To register text start#name#phonenumber#age#gender#county#town \n E.g. start#John Doe#0745671865#26#Male#Nakuru#Naivasha.";
  res.render("registartion", { text: text });
});

app.post("/registration", (req, res) => {
  const feedback = req.body.dating.toLowerCase();
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

  res.app.set("names", name);
  res.app.set("sex", gender);

  // res.redirect("/details");
  if (name && phone && age && gender && county && town) {
    User.find({ $or: [{ phone: phone }, { name: name }] })
      .then((foundItem) => {
        if (foundItem.length >= 1) {
          let text =
            "The name or telephone number is already taken. Please try again  E.g. start#John Doe Amber #0745671865#26#Male#Nakuru#Naivasha";
          res.render("registartion", { text: text });
        } else {
          const user = new User({
            name: name,
            phone: phone,
            age: age,
            gender: gender,
            county: county,
            town: town,
          });
          user
            .save()
            .then(() => {
              res.redirect("/details");
            })
            .catch((error) => {
              let text =
                "Please input the correct format as displayed in the example E.g. start#John Doe Amber#0745671865#26#Male#Nakuru#Naivasha";
              res.render("registartion", { text: text });
            });
        }
      })
      .catch((error) => {
        let text =
          "Please input the correct format as displayed in the example E.g. start#John Doe Amber#0745671865#26#Male#Nakuru#Naivasha";
        res.render("registartion", { text: text });
      });
  } else {
    let text =
      "Please input the correct format as displayed in the example E.g. start#John Doe Amber#0745671865#26#Male#Nakuru#Naivasha";
    res.render("registartion", { text: text });
  }
});

app.get("/details", (req, res) => {
  names = res.app.get("names");
  if (!names) {
    res.redirect("/");
  } else {
    let text = `Your profile has been created successfully ${names}. To add additional details text details#levelOfEducation#profession#maritalStatus#religion#ethnicity 
    \n E.g. details#diploma#driver#single#christian#mijikenda \n to skip type skip`;
    res.render("details", { text: text });
  }
});

app.post("/details", (req, res) => {
  const feedback = req.body.dating.toLowerCase();
  names = res.app.get("names");
  if (feedback === "skip") {
    res.redirect("/match");
  } else if (feedback === "") {
    res.redirect("/details");
  } else {
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
      });

      detail.save().then(() => {
        console.log("details created successfully");
        User.updateOne({ name: names }, { details: detail })
          .then(() => {
            console.log("updated record sucessfully");
            res.redirect("/description");
          })
          .catch((error) => {
            console.log(
              "There was an error during update of details please check your code"
            );
            let text =
              "Please input the correct format as displayed in the example E.g. details#diploma#driver#single#christian#mijikenda";
            res.render("details", { text: text });
          });
      });
    } else {
      let text =
        "Please input the correct format as displayed in the example E.g. details#diploma#driver#single#christian#mijikenda";
      res.render("details", { text: text });
    }
  }
});

app.get("/description", (req, res) => {
  names = res.app.get("names");
  if (!names) {
    res.redirect("/");
  } else {
    let text = `This is the last stage of registration ${names}. TEXT a brief description of yourself \n starting with the word MYSELF eg MYSELF chocolate, lovely, sexy etc.`;
    res.render("description", { text: text });
  }
});

app.post("/description", (req, res) => {
  const feedback = req.body.dating.toLowerCase();
  if (feedback === "") {
    res.redirect("/description");
  } else {
    names = res.app.get("names");
    const array = feedback.split(" ");
    const desc = array[1];
    if (desc) {
      const descriptions = new Description({
        options: desc,
      });
      descriptions.save().then(() => {
        console.log("sucessfully inserted descriptions");
        User.updateOne({ name: names }, { description: descriptions })
          .then(() => {
            console.log("updated record sucessfully");
            res.redirect("/match");
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
            let text =
              "Please input the correct format as displayed in the example eg MYSELF chocolate, lovely, sexy etc.";
            res.render("description", { text: text });
          });
      });
    } else {
      let text =
        "Please input the correct format as displayed in the example E.g. MYSELF chocolate, lovely, sexy etc.";
      res.render("description", { text: text });
    }
  }
});

app.get("/match", (req, res) => {
  let text = `You are now registered for dating . To search for a MPENZI, \n text match#age#town and meet the person of your dreams.\n E.g., match#23-25#Kisumu`;
  res.render("match", { text: text, foundItem: [], sex: "", next: "" });
});

app.post("/match", (req, res) => {
  const feedback = req.body.dating.toLowerCase();
  res.app.set("phone", feedback);
  gender = res.app.get("sex");
  if (!gender) {
    res.redirect("/");
  } else if (feedback === "next") {
    res.redirect("/next");
  } else if (feedback.length === 10) {
    res.redirect("/phone");
  } else {
    let sex = "";
    let single = "";
    if (gender === "Male") {
      sex = "ladies";
      single = "lady";
    }
    if (gender === "Female") {
      sex = "gentle mens";
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
          let text = "";
          let next = "";
          if (foundItem.length === 0) {
            text = `We have ${foundItem.length} ${sex} who match your choice! Please try again E.g., match#23-25#Kisumu.`;
            next = `Text NEXT to receive details of the remaining ${sex}`;
            res.render("match", {
              text: text,
              foundItem: foundItem,
              sex: sex,
              next: next,
            });
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
            res.app.set("output", output);
            text = `We have ${foundItem.length} ${sex} who match your choice! We will send you details of ${output[0].length} of them shortly.\n
          To get more details about a ${single} text the number e.g 0720222284`;
            next = `Text NEXT to receive details of the remaining ${sex}`;
            res.render("match", {
              text: text,
              foundItem: output[0],
              sex: sex,
              next: next,
            });
          }
        })
        .catch((error) => {
          console.log(
            "there was an error during match ouput request from database please check your code"
          );
          let text =
            "Please input the correct format as displayed in the example E.g., match#23-25#Kisumu";
          res.render("match", { text: text, foundItem: [], sex: "", next: "" });
        });
    } else {
      let text =
        "Please input the correct format as displayed in the example E.g., match#23-25#Kisumu";
      res.render("match", { text: text, foundItem: [], sex: "", next: "" });
    }
  }
});

app.get("/next", (req, res) => {
  gender = res.app.get("sex");
  output = res.app.get("output");
  if (output === undefined) {
    res.redirect("/match");
  } else {
    let number = 0;
    let add = ++number;
    let sex = "";
    let single = "";
    if (gender === "Male") {
      sex = "ladies";
      single = "lady";
    }
    if (gender === "Female") {
      sex = "gentle mens";
      single = "gentle man";
    }
    if (add > output.length - 1) {
      let text = `No more matches found. Thank you.`;
      let next = `Text match#age#town and meet the person of your dreams.\n E.g., match#23-25#Kisumu`;
      res.render("next", {
        text: text,
        foundItem: [],
        add: 0,
        noOutput: next,
      });
    } else {
      let text = `To get more details about a ${single}, text the  number e.g., 0722010203. \n The remaining ${sex} are`;
      let next = `Text NEXT to receive details of the remaining ${sex}`;
      res.render("next", {
        text: text,
        foundItem: output[add],
        add: add,
        next: next,
      });
    }
  }
});

app.post("/next", (req, res) => {
  let number = req.body.number.toLowerCase();
  let dating = req.body.dating.toLowerCase();
  res.app.set("phone", dating);
  output = res.app.get("output");
  gender = res.app.get("sex");
  if (output === undefined) {
    res.redirect("/match");
  } else if (dating.length === 10) {
    res.redirect("/phone");
  } else if (dating !== "next") {
    res.redirect("/match");
  } else {
    let add = ++number;
    let sex = "";
    let single = "";
    if (gender === "Male") {
      sex = "ladies";
      single = "lady";
    }
    if (gender === "Female") {
      sex = "gentle mens";
      single = "gentle man";
    }
    if (add > output.length - 1) {
      let text = `No more matches found Thank you.`;
      let next = `Text match#age#town and meet the person of your dreams.\n E.g., match#23-25#Kisumu`;
      res.render("next", {
        text: text,
        foundItem: [],
        add: 0,
        noOutput: next,
      });
    } else {
      let text = `To get more details about a ${single}, text the  number e.g., 0722010203. \n The remaining ${sex} are`;
      let next = `Text NEXT to receive details of the remaining ${sex}`;
      res.render("next", {
        text: text,
        foundItem: output[add],
        add: add,
        next: next,
      });
    }
  }
});

app.get("/phone", (req, res) => {
  phone = res.app.get("phone");
  output = res.app.get("output");
  names = res.app.get("names");
  if (output === undefined) {
    res.redirect("/match");
  } else {
    User.find({ phone: phone })
      .then((foundItem) => {
        let text = "The requested match is: ";
        Simultaneous.find({ $and: [{ phone: phone }, { name: names }] }).then(
          (found) => {
            if (found.length >= 1) {
              console.log("already exists");
            } else {
              const sim = new Simultaneous({
                phone: phone,
                name: names,
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
          }
        );
        res.render("phone", { foundItem: foundItem, text: text });
      })
      .catch((error) => {
        console.log(error);
        let text = "No found user. Thank you";
        res.render("phone", { foundItem: [], text: text });
      });
  }
});

app.post("/phone", (req, res) => {
  const feedback = req.body.dating.toLowerCase();
  res.app.set("describe", feedback);
  res.redirect("/describe");
});

app.get("/describe", (req, res) => {
  output = res.app.get("output");
  if (output === undefined) {
    res.redirect("/match");
  } else {
    describe = res.app.get("describe");
    const arr = describe.split(" ");
    const desc = arr[1];
    if (!desc) {
      res.redirect("/");
    } else {
      User.find({ phone: desc })
        .then((foundItem) => {
          res.render("describe", { foundItem: foundItem, text: "" });
        })
        .catch((error) => {
          console.log(error);
          let text = `Please enter the correct format please eg DESCRIBE 0702556677`;
          res.render("describe", { foundItem: [], text: text });
        });
    }
  }
});

app.post("/describe", (req, res) => {
  res.redirect("/");
});

app.get("/suitable", (req, res) => {
  let text = "Please text your telephone number";
  res.render("suitable", { text: text, suitableName: "", foundItem: [] });
});

app.post("/suitable", (req, res) => {
  const phoneInputed = req.body.dating;
  if (phoneInputed === "yes") {
    res.redirect("/more");
  } else {
    User.find({ phone: phoneInputed })
      .then((foundItem) => {
        let suitableName = foundItem[0].name;
        if (foundItem.length < 1) {
          let text = "No phone records found";
          res.render("suitable", {
            text: text,
            foundItem: [],
            suitableName: "",
          });
        } else {
          Simultaneous.find({ phone: phoneInputed })
            .then((found) => {
              if (found.length < 1) {
                let text = "No interested parties found. Thank you.";
                res.render("suitable", {
                  text: text,
                  foundItem: [],
                  suitableName: "",
                });
              } else {
                User.find({ name: found[0].name })
                  .then((f) => {
                    if (f.length < 1) {
                      let text = "No interested parties found. Thank you.";
                      res.render("suitable", {
                        text: text,
                        foundItem: [],
                        suitableName: "",
                      });
                    } else {
                      let text = "The interested parties are : ";
                      res.app.set("f", f);
                      res.render("suitable", {
                        text: text,
                        foundItem: f,
                        suitableName: suitableName,
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
        let text = "Please input a correct number. Thank you";
        res.render("suitable", { text: text, foundItem: [], suitableName: "" });
      });
  }
});

app.get("/more", (req, res) => {
  moreName = res.app.get("f");
  if (moreName === undefined) {
    res.redirect("/suitable");
  } else {
    res.render("more", { foundItem: moreName });
  }
});

app.post("/more", (req, res) => {
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`i am listening at port ${port}`);
});