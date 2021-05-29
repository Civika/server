"use strict";
const { Model } = require("sequelize");
const { hash } = require("../helpers/bcrypt");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsToMany(models.Lecture, { through: "Classes" });
    }
  }
  User.init(
    {
      fullName: DataTypes.STRING,
      address: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: "alamat tidak boleh kosong",
        },
      },
      birthdate: DataTypes.DATEONLY,
      phoneNumber: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: {
            msg: "nomor telephone tidak boleh",
          },
        },
      },
      ipk: DataTypes.DOUBLE,
      password: {
        type: DataTypes.STRING,
        validate: {
          is6More(value) {
            if (value.length < 8) {
              new Error("kata sandi minimal memiliki 8 karakter");
            }
          },
          notEmpty: { msg: "kata sandi tidak boleh kosong" },
        },
      },
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: {
            msg: "isian harus berupa email",
          },
          notEmpty: {
            msg: "harus berupa email",
          },
        },
      },
      sks: DataTypes.INTEGER,
      ukt: DataTypes.INTEGER,
      uktStatus: DataTypes.BOOLEAN,
      role: DataTypes.STRING,
      phoneNumber: DataTypes.INTEGER
    },
    {
      hooks: {
        beforeCreate: (instance, options) => {
          instance.password = hash(instance.password);
        },
      },
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
