import { Model, DataTypes } from "sequelize";
import sequelize from "./config.js";

export class Notificacion extends Model {}

Notificacion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    tipo: DataTypes.STRING,

    mensaje: DataTypes.TEXT,

    leida: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    idReferencia: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "notificaciones",
    timestamps: true,
    paranoid: true,
  },
);
