const { User, Class, Lecture } = require("../models");
const { compare } = require("../helpers/bcrypt");
const { encrypt } = require("../helpers/jwt");
const payment = require("../helpers/duitku");
const db = require("../firestore");
const dataPushNotif = db.collection("dataUserLogin");

class UserControllers {
  static async login(req, res, next) {
    const { email, password, pushToken } = req.body;
    try {
      const foundUser = await User.findOne({
        where: {
          email: email,
        },
        include: {
          model: Class,
          include: [Lecture],
        },
      });
      if (foundUser) {
        const comparePass = compare(password, foundUser.password);
        if (comparePass) {
          const access_token = encrypt({
            id: foundUser.id,
            email: foundUser.email,
          });
          await dataPushNotif.add({ pushToken, email });
          res
            .status(200)
            .json({ access_token, userId: foundUser.id, foundUser });
        } else {
          next({ name: "error_login", message: "email atau kata sandi salah" });
        }
      } else {
        next({ name: "error_login", message: "email atau kata sandi salah" });
      }
    } catch (err) {
      next(err);
    }
  }
  static async getAll(req, res, next) {
    try {
      const users = await User.findAll();
      res.status(200).json(users);
    } catch (err) {
      next(err);
    }
  }
  static async getById(req, res, next) {
    const id = +req.params.id;
    try {
      const user = await User.findByPk(id);
      if (user) {
        res.status(200).json(user);
      } else {
        next({ name: "error_user", message: "pengguna tidak ditemukan" });
      }
    } catch (err) {
      next(err);
    }
  }
  static async editUser(req, res, next) {
    const id = +req.query.id;
    try {
      await User.update(req.body, {
        where: {
          id: id,
        },
      });
      res.status(200).json({ message: "data pengguna telah diupdate" });
    } catch (err) {
      next(err);
    }
  }

  static async forwardToDuitku(req, res, next) {
    const id = req.loggedUser.id;
    try {
      const user = await User.findByPk(id);
      let pay = await payment(user.ukt, req.body.method);
      res.status(201).json(pay);
    } catch (err) {
      next(err);
    }
  }

  static async uktStatus(req, res, next) {
    const id = req.loggedUser.id;
    try {
      const foundUser = await User.findByPk(id);
      if (foundUser.uktStatus) {
        next({ name: "err_ukt", message: "Ukt sudah dibayar" });
      } else {
        await User.update(
          {
            uktStatus: true,
          },
          {
            where: {
              id: id,
            },
          }
        );
        res.status(200).json({ message: "Ukt telah dibayar" });
      }
    } catch (err) {
      next(err);
    }
  }

  static async logout(req, res) {
    const emailUser = req.loggedUser.email;
    try {
      let allDataUser = await dataPushNotif.get();
      allDataUser.forEach(async (dataUser) => {
        const id = dataUser.id;
        const { email } = dataUser.data();
        if (emailUser === email) {
          await dataPushNotif.doc(id).delete();
        }
      });
      res.status(200).json({ message: "Logout berhasil" });
    } catch (error) {
      next(err);
    }
  }
}

module.exports = UserControllers;
