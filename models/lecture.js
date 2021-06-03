"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Lecture extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Lecture.belongsToMany(models.User, { through: models.Class });
      Lecture.hasMany(models.Class);
    }
  }
  Lecture.init(
    {
      name: DataTypes.STRING,
      quota: DataTypes.INTEGER,
      credits: DataTypes.INTEGER,
      schedule: DataTypes.STRING,
      teacher: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Lecture",
    }
  );
  return Lecture;
};
