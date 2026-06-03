import { Model, DataTypes } from "sequelize";
import sequelize from "./config.js";

export class Valoracion extends Model {}

Valoracion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    puntaje: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
  },
  {
    sequelize,
    tableName: "valoraciones",
    timestamps: true,
    paranoid: true,
  },
);
