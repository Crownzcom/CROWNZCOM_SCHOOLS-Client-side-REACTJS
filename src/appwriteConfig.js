// appwriteConfig.js
import { Client, Account, Databases, Permission, Role, Query, ID } from "appwrite";

const client = new Client()
  .setEndpoint('https://appwrite.exampreptutor.com/v1')
  .setProject('66ac7d33000764b5f66b')

const account = new Account(client);
const databases = new Databases(client);

const database_id = '66ac7df700135437eb68';
const transactionTable_id = "66ac8599001ad7a6dddc"
const adminTable_id = "66ac84b1003b7326404e"
const couponTable_id = '66ac80290022c8a516f1'
const couponUsagesTable_id = '66ac7fde000d34b22a42'
const packagesTable_id = '66ac7f2d0010c476629b'
const schoolsTable_id = '66ac7e0300055afae1ac'
const subscriptionCodeTable_id = '6695128a0022535ea06c'

// Export the required parts
export {
  client,
  account,
  databases,
  database_id,
  transactionTable_id,
  adminTable_id,
  couponTable_id,
  couponUsagesTable_id,
  packagesTable_id,
  schoolsTable_id,
  subscriptionCodeTable_id,
  Permission,
  Role,
  Query,
  ID
};
