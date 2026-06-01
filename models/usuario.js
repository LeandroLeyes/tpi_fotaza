import { Model, DataTypes } from "sequelize";
import sequelize from "./config.js";
import bcrypt from "bcrypt";

export class Usuario extends Model {
  validatePassword(password) {
    return bcrypt.compare(password, this.password);
  }
}

Usuario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    bio: DataTypes.TEXT,

    avatar: DataTypes.BLOB,

    rol: {
      type: DataTypes.ENUM("usuario", "admin", "validador"),
      defaultValue: "usuario",
    },
  },
  {
    sequelize,
    tableName: "usuarios",
    timestamps: true,
    paranoid: true,
    hooks: {
      beforeSave: async (usuario) => {
        if (!usuario.password) return;
        if (!usuario.changed("password")) return;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(usuario.password, salt);
        usuario.password = hashedPassword;
      },
    },
  },
);
