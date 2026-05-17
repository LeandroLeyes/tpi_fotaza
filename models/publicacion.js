import { Model, DataTypes } from "sequelize";
import sequelize from "./config.js";

export class Publicacion extends Model {}

Publicacion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    descripcion: DataTypes.TEXT,

    comentariosActivo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "publicaciones",

    timestamps: true,
    paranoid: true,
  },
);
