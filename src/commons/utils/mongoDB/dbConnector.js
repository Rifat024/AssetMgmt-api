import mongoose from 'mongoose'
import { AppConfig } from '../../environment/appconfig'
import { log } from '../logger'

let connection = null

export const connectMongoDB = async () => {
  try {
    if (connection == null) {
      log.debug(` MongoDB Url---> ${JSON.stringify(AppConfig.MONGO_DB)}`)
      connection = await mongoose.connect(AppConfig.MONGO_DB);
      console.log(`Connection Response---> ${(connection)}`);
      return connection;
    }
    console.log('Connection already established, resusing the connection');
  } catch (error) {
    console.log('connection Error', error);
  }
};

export const disconnectDatabase = async () => {
  if (connection) {
    connection.disconnect().then(() => { console.log('Disconnected from database'); }).catch((error) => { console.error('Error disconnecting from database:', error); });
    connection = null
  }
};
