import { Model, DataTypes } from "sequelize";
import sequelize from "./config.js";

export class Mensaje extends Model {}

Mensaje.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    contenido: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "mensajes",

    timestamps: true,
    paranoid: true,
  },
);
