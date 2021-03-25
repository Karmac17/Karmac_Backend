const express = require("express");
const { check, validationResult, body } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("../middleware/auth");
const axios = require("axios");

const User = require("../models/User");

/**
 * @method - POST
 * @param - /signup
 * @description - User SignUp
 */

router.post(
  "/signup",
  [
    check("phoneNumber", "Please Enter a Valid PhoneNumber")
      .optional()
      .isMobilePhone(),
    check("username", "Please Enter a Valid Username")
      .optional()
      .not()
      .isEmpty(),
    check("email", "Please enter a valid email").optional().isEmail(),
    check("password", "Please enter a valid password").optional().isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const { username, email, password, phonenumber } = req.body;

    if (phonenumber === null) {
      if (username == null || email == null || password == null) {
        console.log("error");
        return res.status(400).json({
          errors: ["Please Enter valid Values"],
        });
      }
    }

    console.log(phonenumber);
    if (!phonenumber) {
      console.log("yeahhh");
      console.log(req);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("error");
        return res.status(400).json({
          errors: errors.array(),
        });
      }

      console.log(req.body);
      try {
        let user = await User.findOne({
          email,
        });
        if (user) {
          return res.status(400).json({
            msg: "User Already Exists",
          });
        }

        user = new User({
          username,
          email,
          password,
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
          user: {
            id: user.id,
          },
        };

        jwt.sign(
          payload,
          "randomString",
          {
            expiresIn: 10000,
          },
          (err, token) => {
            if (err) throw err;
            res.status(200).json({
              token,
            });
          }
        );
      } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
      }
    } else {
      try {
        let user = await User.findOne({
          phonenumber,
        });
        if (user) {
          return res.status(400).json({
            msg: "User Already Exists",
          });
        }
        var sessionId = "1234567890sanchit";

        // await axios
        //   .get(
        //     `https://2factor.in/API/V1/74f372bd-8d53-11eb-a9bc-0200cd936042/SMS/+91${phonenumber}/AUTOGEN/Karmac`
        //   )
        //   .then((res) => {
        //     console.log(JSON.stringify(res.data));
        //     if (res.status === 200) {
        //       console.log("Success");
        //       sessionId = res.data.Details;
        //       console.log(sessionId);
        //     }
        //   })
        //   .catch((err) => {
        //     console.log(err);
        //   });

        user = new User({
          phonenumber,
        });

        // const salt = await bcrypt.genSalt(10);
        // user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
          user: {
            id: user.id,
          },
        };

        res.status(200).json({
          sessionId,
        });
      } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
      }
    }
  }
);

router.post(
  "/login",
  [
    check("phoneNumber", "Please Enter a Valid PhoneNumber")
      .optional()
      .isMobilePhone(),
    check("email", "Please enter a valid email").optional().isEmail(),
    check("password", "Please enter a valid password").optional().isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { email, password, phonenumber } = req.body;
    if (!phonenumber) {
      try {
        let user = await User.findOne({
          email,
        });
        if (!user)
          return res.status(400).json({
            message: "User Not Exist",
          });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
          return res.status(400).json({
            message: "Incorrect Password !",
          });

        const payload = {
          user: {
            id: user.id,
          },
        };

        jwt.sign(
          payload,
          "randomString",
          {
            expiresIn: 3600,
          },
          (err, token) => {
            if (err) throw err;
            res.status(200).json({
              token,
            });
          }
        );
      } catch (e) {
        console.error(e);
        res.status(500).json({
          message: "Server Error",
        });
      }
    } else {
      try {
        let user = await User.findOne({
          phonenumber,
        });
        if (!user)
          return res.status(400).json({
            message: "User Not Exist",
          });

        const sessionId = "1234567890sanchit";
        const otp = "1234";
        // await axios
        //   .get(
        //     `https://2factor.in/API/V1/74f372bd-8d53-11eb-a9bc-0200cd936042/SMS/+91${phonenumber}/AUTOGEN/Karmac`
        //   )
        //   .then((res) => {
        //     console.log(JSON.stringify(res.data));
        //     if (res.status === 200) {
        //       console.log("Success");
        //       sessionId = res.data.Details;
        //       console.log(sessionId);
        //     }
        //   })
        //   .catch((err) => {
        //     console.log(err);
        //   });

        res.status(200).json({
          sessionId,
        });

        const payload = {
          user: {
            id: user.id,
          },
        };
      } catch (e) {
        console.error(e);
        res.status(500).json({
          message: "Server Error",
        });
      }
    }
  }
);

router.get("/me", auth, async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    console.log(req);
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (e) {
    res.send({ message: "Error in Fetching user" });
  }
});

router.post("/verify", async (req, res) => {
  console.log(req.body);
  const { otp, sessionId, phonenumber } = req.body;
  try {
    let user = await User.findOne({
      phonenumber,
    });
    if (!user)
      return res.status(400).json({
        message: "User Not Exist",
      });

    const payload = {
      user: {
        id: user.id,
      },
    };

    await user.updateOne({ isVerified: true });

    // await axios
    //   .get(
    //     `https://2factor.in/API/V1/74f372bd-8d53-11eb-a9bc-0200cd936042/SMS/VERIFY/${sessionId}/${otp}`
    //   )
    //   .then((result) => {
    //     if (result.status === 200 && result.data.Status === "Success") {
    //       console.log("Success");
    //       jwt.sign(
    //         payload,
    //         "randomString",
    //         {
    //           expiresIn: 3600,
    //         },
    //         (err, token) => {
    //           if (err) throw err;
    //           res.status(200).json({
    //             token,
    //           });
    //         }
    //       );
    //     } else {
    //       console.error(e);
    //       res.status(500).json({
    //         message: "Server Error",
    //       });
    //     }
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });

    if (otp === "1234" && sessionId === "1234567890sanchit") {
      jwt.sign(
        payload,
        "randomString",
        {
          expiresIn: 3600,
        },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            token,
          });
        }
      );
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

module.exports = router;
