import { Model, DataTypes } from "sequelize";
import sequelize from "./config.js";

export class Rol extends Model {}

Rol.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "roles",
    timestamps: true,
    paranoid: true,
  },
);
