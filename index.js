const { MongoClient } = require('mongodb');
const { ClientEncryption } = require('mongodb-client-encryption');
const MUUID = require('uuid-mongodb');
const fs = require('fs');


const connectionString = 'mongodb://localhost:27017';
const keyVaultNamespace = 'encryption.__keyVault';
const keyVaultDb = 'encryption';
const keyVaultCollection = '__keyVault';

const client = new MongoClient(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


// read locally managed key
const path = './master-key.txt';
const localMasterKey = fs.readFileSync(path);


const kmsProviders = {
  local: {
    key: localMasterKey,
  },
};

async function main() {
  try {
    await client.connect();
    const encryption = new ClientEncryption(client, {
      keyVaultNamespace,
      kmsProviders,
    });
    const key = await encryption.createDataKey('local');

    const keyDB = client.db(keyVaultDb);
    const keyColl = keyDB.collection(keyVaultCollection);

    // alternative method:
    // const query = {
    //   _id: MUUID.from(key)
    // };
    // const dataKey = await keyColl.findOne(query);
    // console.log("dataKey",dataKey);
    // end alternative method: ^

    //  CSFLE Guide snippet:
    // const base64DataKeyId = key.toString('base64');
    // console.log('DataKeyId [base64]: ', base64DataKeyId);
    // const query = {
    //   _id: " 5H/HbJ9nSDWxhQac97GkSw==", // replace with base64DataKeyId value
    // };
    // const dataKey = await keyColl.findOne(query);
    // console.log('dataKey',dataKey)
    // CSFLE Guide snippet ^

  } finally {
    await client.close();
  }
}
main();