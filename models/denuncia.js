import { Model, DataTypes } from "sequelize";
import sequelize from "./config.js";

export class Denuncia extends Model {}

Denuncia.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    motivo: DataTypes.STRING,

    descripcion: DataTypes.TEXT,

    tipo: DataTypes.ENUM("comentario", "publicacion"),
  },
  {
    sequelize,
    tableName: "denuncias",
    timestamps: true,
    paranoid: true,
  },
);
