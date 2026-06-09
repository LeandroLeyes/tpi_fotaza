import "dotenv/config";
import { Sequelize } from "sequelize";

const enProduccion = process.env.NODE_ENV === "production";

// Render provee DATABASE_URL automáticamente cuando creás una BD PostgreSQL.
// En desarrollo usamos las variables individuales del .env.
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, // necesario para el certificado de Render
        },
      },
    })
  : new Sequelize({
      dialect: "postgres",
      host: process.env.DB_HOST,
      username: process.env.DB_USER,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      logging: false,
      dialectOptions: enProduccion
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : {},
    });

export default sequelize;
