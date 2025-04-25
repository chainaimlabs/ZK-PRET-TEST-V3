import { Field, Mina, PrivateKey, AccountUpdate, CircuitString, Poseidon, Signature } from 'o1js';
//import { CorporateRegistrationProof, CorporateRegistration } from './CorporateRegistrationZKProgram.js';
import { BusinessProcessIntegrityZKProgram, BusinessProcessIntegrityData } from '../../zk-programs/with-sign/BusinessProcessIntegrityZKProgramWithSign.js'; //changed to with sign
import { BusinessProcessIntegrityVerifierSmartContract } from '../../contracts/with-sign/BusinessProcessIntegrityVerifierSmartContractWithSign.js'; //changed to with sign



import axios from 'axios';
import { ComplianceData } from '../../zk-programs/with-sign/CorporateRegistrationZKProgramWithSign.js'; //changed to with sign
//import {  } from './CorporateRegistrationVerifierSmartContract.js';
//import {  }  from './CorporateRegistrationZKProgram.js';
//import { SecretHash, SecretHashProof } from './SecretHash.js';

import { exec } from 'child_process';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { getPrivateKeyFor } from '../../core/OracleRegistry.js';
import parseBpmn from '../../utils/parsebpmn.js';

const [, , expectedBPMNFileName, actualBPMNFileName, outputFileName] = process.argv;

console.log('Expected BPMN File Name:', expectedBPMNFileName);
console.log('Actual BPMN File Name:', actualBPMNFileName);
console.log('Output File Name:', outputFileName);


/*
function runPythonScript(fileName: string): Promise<string> {
  return new Promise((resolve, reject) => {

    const pythonScriptPath = join(process.cwd(), './src/parse_bpmn.py');

    fileName = './src/'+fileName
    
    const fullPath = join(process.cwd(), fileName);

    console.log(' python script path ', ${pythonScriptPath})

    console.log(' full path ', ${fullPath})

    exec(`python "${pythonScriptPath}" "${fullPath}"`, (error, stdout, stderr) => {
      // ... rest of the function
    });
  });
}
*/

function runPythonScript(fileName: string): Promise<string> {
   return new Promise((resolve, reject) => {

      //console.log('Current working directory **************************:', process.cwd());

      //console.log('fileName', fileName)

      exec(`python3 src/utils/parse_bpmn.py ${fileName}`, (error, stdout, stderr) => {
         //exec(`python ./parse_bpmn.py ${fileName}`, (error, stdout, stderr) => {
         if (error) {
            reject(`Error: ${error.message}`);
            return;
         }
         if (stderr) {
            reject(`stderr: ${stderr}`);
            return;
         }
         resolve(stdout.trim());
      });
   });
}


async function main() {
   /*const Local = Mina.LocalBlockchain({ proofsEnabled: true });
 
  // Mina.setActiveInstance(Local);
  const localInstance = await Local; // Await the promise before using it
 Mina.setActiveInstance(localInstance);
   const deployer = (await Local).testAccounts[0].key;
   const deployerPublicKey = deployer.toPublicKey();*/
   //const expectedPath: string | null=prompt();
   //const actualPath: string | null=prompt();
   /*if (process.argv.length !== 8) {
     console.log(process.argv[0]);
     console.log(process.argv[1]);
     console.log(process.argv[2]);
     console.log(process.argv[3]);
     console.error('Usage: node BusinessProcessIntegrityVerificationTest.js <expected_file> <actual_file>');
     process.exit(1);
 }*/

   //console.log('Current working directory **************************:', process.cwd());


   const expectedPath = await parseBpmn(expectedBPMNFileName) || "";
   const actualPath = await parseBpmn(actualBPMNFileName) || "";

   const outputData = {
      businessProcessIntegrityCheckID: 1,
      timestamp: new Date().toISOString(),
      expectedPath,
      actualPath
   };


   //const expectedPath = process.argv[2];
   //const expectedPath = "a(cb|bc)d(ef|f)g";
   //const actualPath = process.argv[3];
   //const actualPath = "abcdefg";

   console.log("EXP:", expectedPath);
   console.log("ACT:", actualPath);
   const useProof = false;

   const Local = await Mina.LocalBlockchain({ proofsEnabled: useProof });
   Mina.setActiveInstance(Local);

   const deployerAccount = Local.testAccounts[0];
   const deployerKey = deployerAccount.key;
   const senderAccount = Local.testAccounts[1];
   const senderKey = senderAccount.key;

   /*const deployerKeypair = PrivateKey.random();
   const deployer = deployerKeypair;*/

   //const deployer = localInstance.testAccounts[0].keypair.privateKey; // If keypair exists

   // Compile artifacts
   // console.log('Compiling...');
   //await SecretHash.compile();
   // await CorporateRegistration.compile();

   await BusinessProcessIntegrityZKProgram.compile();

   //const { verificationKey } = await HashVerifier.compile();

   const { verificationKey } = await BusinessProcessIntegrityVerifierSmartContract.compile();

   console.log("verification key is successful");
   // Deploy contract
   const zkAppKey = PrivateKey.random();
   const zkAppAddress = zkAppKey.toPublicKey();


   /*await Mina.transaction(deployerKeypair, async () => {
     await Mina.fundAccount({ address: zkAppAddress, initialBalance: 10 });
   }).send();*/

   const zkApp = new BusinessProcessIntegrityVerifierSmartContract(zkAppAddress);

   /*await Mina.transaction(deployerPublicKey, async () => {
     AccountUpdate.fundNewAccount(deployerPublicKey); // Ensure deployer has funds
     AccountUpdate.fundNewAccount(zkAppAddress); // Fund the zkApp address
 
   }).send();*/

   //console.log("Mina transaction is successful");

   const deployTxn = await Mina.transaction(
      deployerAccount,
      async () => {
         AccountUpdate.fundNewAccount(deployerAccount);
         await zkApp.deploy({ verificationKey });

         //zkApp.storedHash.set(Field(42));


      }
   );
   console.log("deployTxn is successful");
   await deployTxn.sign([deployerKey, zkAppKey]).send();
   console.log("deployTxn signed successfully");

   // Generate test proof

   //const secret = Field(42);
   //const correctHash = Poseidon.hash([secret]);
   //const proof = await SecretHash.generate(correctHash, secret);

   // const proof = await CorporateRegistration.proveCompliance();
   //

   //console.log("Fetching compliance data...");
   const response = await axios.get('https://0f4aef00-9db0-4057-949e-df6937e3449b.mock.pstmn.io/vernon_mca');
   const parsedData = response.data;

   //console.log(parsedData);

   //console.log(parsedData["CIN"]);
   //console.log(parsedData["Active Compliance"]);

   const complianceData = new BusinessProcessIntegrityData({
      /*companyID: CircuitString.fromString(parsedData["CIN"] || ''),
      companyName: CircuitString.fromString(parsedData["Company Name"] || ''),
      roc: CircuitString.fromString(parsedData["ROC"] || ''),
      registrationNumber: Field(parsedData["Registration Number"] ?? 0),
      incorporationDate: CircuitString.fromString(parsedData["Incorporation Date"] || ''),
      email: CircuitString.fromString(parsedData["Email"] || ''),
      corporateAddress: CircuitString.fromString(parsedData["Corporate Address"] || ''),
      listed: Field(parsedData["Listed"] ? 1 : 0),
      companyType: CircuitString.fromString(parsedData["Company Type"] || ''),
      companyCategory: CircuitString.fromString(parsedData["Company Category"] || ''),
      companySubcategory: CircuitString.fromString(parsedData["Company Subcategory"] || ''),
      //companyStatus: CircuitString.fromString(parsedData["Company Status"] || ''),
      companyStatus: CircuitString.fromString(parsedData["Company Status"]),
      authorizedCapital: Field(parsedData["Authorized Capital"] ?? 0),
      paidUpCapital: Field(parsedData["Paid-up Capital"] ?? 0),
      lastAGMDate: CircuitString.fromString(parsedData["Last AGM Date"] || ''),
      balanceSheetDate: CircuitString.fromString(parsedData["Balance Sheet Date"] || ''),
      //activeCompliance: CircuitString.fromString(parsedData["Active Compliance"] || ''),
      activeCompliance: CircuitString.fromString(parsedData["Active Compliance"]),
      companyActivity: CircuitString.fromString(parsedData["Company Activity"] || ''),
      jurisdiction: CircuitString.fromString(parsedData["Jurisdiction"] || ''),
      regionalDirector: CircuitString.fromString(parsedData["Regional Director"] || ''),*/
      businessProcessID: Field(parsedData["BusinessProcess ID"] ?? 0),
      expectedContent: CircuitString.fromString(expectedPath),
      // expectedContent: "ABC",
      actualContent: actualPath,
      str: "String to print"
      //actualContent: "ABC",u[]'


   });

   // =================================== Oracle Signature Generation ===================================
   // Create message hash
   const complianceDataHash = Poseidon.hash(BusinessProcessIntegrityData.toFields(complianceData));

   //const sameKey = getDeployerPrivateKey();
   const registryPrivateKey = getPrivateKeyFor('BPMN');
   // Sign the message hash with the oracle's private key
   // const oracleSignature = Signature.create(Oracle_Private_key.key, [complianceDataHash]);
   const oracleSignature = Signature.create(registryPrivateKey, [complianceDataHash]);

   //const exp=CircuitString.fromString("a(cb|bc)d(ef|f)g");
   //console.log("ActualContent****",complianceData.actualContent.toString())
   const proof = await BusinessProcessIntegrityZKProgram.proveCompliance(Field(0), complianceData, oracleSignature);

   //console.log( 'Public Output', proof.publicOutput.businessProcessID.toJSON(), '  out ' , proof.publicOutput.out.toBoolean());

   //console.log("Before verification, Initial value of num:",zkApp.num.get().toJSON());
   // Verify proof
   const txn = await Mina.transaction(
      senderAccount,
      async () => {
         await zkApp.verifyComplianceWithProof(proof);
      }
   );
   // await txn.sign([zkAppKey]).send();

   const proof1 = await txn.prove();
   //await txn.prove();


   console.log("Proof generated successfully");
   console.log(senderAccount.toJSON());
   console.log(senderKey.toJSON(), senderKey.toPublicKey());
   console.log("Generated Proof:", proof1.toPretty());
   await txn.sign([senderKey]).send();
   //console.log("Final value of num:",zkApp.num.get().toJSON());

   console.log('✅ Proof verified successfully!');
}

main().catch(err => {
   console.error('Error:', err);
});