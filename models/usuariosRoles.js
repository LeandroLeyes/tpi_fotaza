import { Model, DataTypes } from "sequelize";
import sequelize from "./config.js";

export class UsuariosRoles extends Model {}

UsuariosRoles.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    idUsuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    idRol: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "usuariosRoles",
    timestamps: true,
    paranoid: true,
  },
);
