const { Client } = require("pg");
const { MongoClient } = require("mongodb");
import { json } from "body-parser";
import { log } from "../../commons/utils/logger";
import { apiError, apiResponse } from "../http-helpers/api-response";

export async function getSchemaList(dbType, config) {
  try {
    log.debug(`Starting getSchemaList with dbType: ${dbType}`);
    log.debug(`Config: ${JSON.stringify(config)}`);

    if (dbType === "POSTGRESS") {
      log.debug("Connecting to PostgreSQL database...");
      const client = new Client(config);

      try {
        await client.connect();
        log.debug("Connected to PostgreSQL successfully.");

        // const res = await client.query(`
        //   SELECT table_name
        //   FROM information_schema.tables
        //   WHERE table_schema='datahub'
        // `);

        const schemaName=config?.schemaName|| 'public'
        const res = await client.query(`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema='${schemaName}'
        `);
        
        log.debug(
          `Query executed successfully, retrieved tables: ${JSON.stringify(
            res.rows
          )}`
        );

        const tableNames = res.rows.map((row) => row.table_name);
        const totalSchemas = tableNames.length;
        log.debug(`Total schemas: ${totalSchemas}`);

        return { tableNames, totalSchemas };
      } catch (err) {
        log.error("Error querying PostgreSQL database:", err);
        throw new Error("Failed to retrieve schema list from PostgreSQL.");
      } finally {
        await client.end();
        log.debug("PostgreSQL connection closed.");
      }
    } else if (dbType === "MONGO_DB") {
      const { url, database } = config;
      log.debug(
        `Connecting to MongoDB with URL: ${url} and Database: ${database}`
      );

      const client = new MongoClient(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      try {
        await client.connect();
        log.debug("Connected to MongoDB successfully.");

        const db = client.db(database);
        const collections = await db.listCollections().toArray();
        log.debug(`Retrieved collections: ${JSON.stringify(collections)}`);

        const collectionNames = collections.map((collection) => collection.name);
        const totalSchemas = collectionNames.length;
        log.debug(`Total schemas: ${totalSchemas}`);

        return { collectionNames, totalSchemas };
      } catch (err) {
        log.error("Error querying MongoDB:", err);
        throw new Error("Failed to retrieve schema list from MongoDB.");
      } finally {
        await client.close();
        log.debug("MongoDB connection closed.");
      }
    } else {
      log.error("Unsupported database type:", dbType);
      throw new Error("Unsupported database type!");
    }
  } catch (err) {
    log.error("Error in getSchemaList function:", err);
    throw err; // Re-throw the error to be handled by the calling function
  }
}


export async function getSchemaDetails(dbType, config, name) {
  try {
    log.debug(`Starting getSchemaDetails with dbType: ${dbType}`);
    log.debug(`Config: ${JSON.stringify(config)}`);
    log.debug(`Table/Collection name: ${name}`);

    if (dbType === "POSTGRESS") {
      log.debug("Connecting to PostgreSQL database...");
      const client = new Client(config);

      try {
        await client.connect();
        log.debug("Connected to PostgreSQL successfully.");

        // const res = await client.query(
        //   `
        //     SELECT column_name, data_type, is_nullable
        //     FROM information_schema.columns
        //     WHERE table_name = $1
        //   `,
        //   [name]
        // );
        const schemaName = config?.schemaName || "public"; 
        const tableName = name; 

        const res = await client.query(
          `
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = $1 AND table_schema = $2`,
            [tableName, schemaName]
        );
        log.debug(
          `Query executed successfully for table ${name}: ${JSON.stringify(
            res.rows
          )}`
        );

        return res.rows;
      } catch (err) {
        log.error("Error querying PostgreSQL database:", err);
        throw new Error(
          `Failed to retrieve schema details for table ${name} from PostgreSQL.`
        );
      } finally {
        await client.end();
        log.debug("PostgreSQL connection closed.");
      }
    } else if (dbType === "MONGO_DB") {
      const { url, database } = config;
      log.debug(
        `Connecting to MongoDB with URL: ${url} and Database: ${database}`
      );

      const client = new MongoClient(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      try {
        await client.connect();
        log.debug("Connected to MongoDB successfully.");

        const db = client.db(database);
        const collection = db.collection(name);

        log.debug(`Fetching indexes for collection ${name}...`);
        const indexes = await collection.indexes();
        const indexSchemas = indexes.map((index) => ({
          column_name: Object.keys(index.key).join(", "),
          data_type: "Index",
          is_nullable: index.background ? "Yes" : "No",
        }));
        log.debug(`Indexes retrieved: ${JSON.stringify(indexSchemas)}`);

        log.debug(
          `Fetching the most recent document from collection ${name}...`
        );
        const recentDocs = await collection
          .find({})
          .sort({ $natural: -1 })
          .limit(1)
          .toArray();
        log.debug(`Most recent document: ${JSON.stringify(recentDocs)}`);

        const sampleDocument = recentDocs[0] || {};

        const documentSchema = Object.keys(sampleDocument).map((field) => ({
          column_name: field,
          data_type: typeof sampleDocument[field],
          is_nullable:
            sampleDocument[field] === null ||
            sampleDocument[field] === undefined
              ? "Yes"
              : "No",
        }));
        log.debug(`Document schema: ${JSON.stringify(documentSchema)}`);

        return { documentSchema, indexSchemas };
      } catch (err) {
        log.error("Error querying MongoDB:", err);
        throw new Error(
          `Failed to retrieve schema details for collection ${name} from MongoDB.`
        );
      } finally {
        await client.close();
        log.debug("MongoDB connection closed.");
      }
    } else {
      log.error("Unsupported database type:", dbType);
      throw new Error("Unsupported database type!");
    }
  } catch (err) {
    log.error("Error in getSchemaDetails function:", err);
    throw err; // Re-throw the error to be handled by the calling function
  }
}



export const testDbConnection = async (record) => {
  try {
    log.debug("record", record);
    let recordObj = JSON.parse(record['body']);
    log.debug(`recordObj${JSON.stringify(recordObj)}`);


    const { dbType, config } = recordObj;

    if (!dbType || !config) {
      throw new Error("Database type and config must be provided.");
    }

    log.debug("dbType", dbType);
    log.debug("config", config);

    if (dbType === "POSTGRESS") {
      const client = new Client(config);
      await client.connect();
      await client.end();
      log.debug("Postgres connection successful");
      return apiResponse({ message: "Postgres connection successful" });
    } else if (dbType === "MONGO_DB") {
      const { url, database } = config;
      const client = new MongoClient(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      await client.connect();
      const db = client.db(database);
      await db.command({ ping: 1 });
      await client.close();
      log.debug("MongoDB connection successful");
      return apiResponse({ message: "MongoDB connection successful" });
    } else {
      return apiError(400,"Unsupported database type!");
    }
  } catch (error) {
    log.debug(`error - ${error}`);
    return apiError(500, error);
  }
};
