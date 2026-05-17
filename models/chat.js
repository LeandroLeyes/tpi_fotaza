import { Model, DataTypes } from "sequelize";
import sequelize from "./config.js";

export class Chat extends Model {}

Chat.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  {
    tableName: "chats",

    timestamps: true,
    paranoid: true,
  },
);
