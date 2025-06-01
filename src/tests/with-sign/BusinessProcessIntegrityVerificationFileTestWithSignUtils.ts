import { Field, Mina, PrivateKey, AccountUpdate, CircuitString, Poseidon, Signature } from 'o1js';
import { BusinessProcessIntegrityZKProgram, BusinessProcessIntegrityData, BusinessProcessIntegrityProof } from '../../zk-programs/with-sign/BusinessProcessIntegrityZKProgramWithSign.js'; //changed to with sign
import { BusinessProcessIntegrityVerifierSmartContract } from '../../contracts/with-sign/BusinessProcessIntegrityVerifierSmartContractWithSign.js'; //changed to with sign

import axios from 'axios';
//import { ComplianceData } from '../../zk-programs/with-sign/CorporateRegistrationZKProgramWithSign.js'; //changed to with sign

import { exec } from 'child_process';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { getPrivateKeyFor } from '../../core/OracleRegistry.js';
import parseBpmn from '../../utils/parsebpmn.js';

// const [, , businessProcessType,expectedBPMNFileName, actualBPMNFileName, outputFileName] = process.argv;

// console.log('Expected BPMN File Name:', expectedBPMNFileName);
// console.log('Actual BPMN File Name:', actualBPMNFileName);
// console.log('Output File Name:', outputFileName);


// function runPythonScript(fileName: string): Promise<string> {
//    return new Promise((resolve, reject) => {

//       //console.log('Current working directory **************************:', process.cwd());
//       //console.log('fileName', fileName)

//       exec(`python3 src/utils/parse_bpmn.py ${fileName}`, (error, stdout, stderr) => {
//          //exec(`python ./parse_bpmn.py ${fileName}`, (error, stdout, stderr) => {
//          if (error) {
//             reject(`Error: ${error.message}`);
//             return;
//          }
//          if (stderr) {
//             reject(`stderr: ${stderr}`);
//             return;
//          }
//          resolve(stdout.trim());
//       });
//    });
// }


export async function getBPIVerificationFileTestWithSign(businessProcessType:string,expectedBPMNFileName: string, actualBPMNFileName: string) {
   /*
   const outputData = {
      businessProcessIntegrityCheckID: 1,
      timestamp: new Date().toISOString(),
      expectedPath,
      actualPath
   };
   */

   //const expectedPath = process.argv[2];
   //const expectedPath = "a(cb|bc)d(ef|f)g";
   //const actualPath = process.argv[3];
   //const actualPath = "abcdefg";
 
   const expectedPath = await parseBpmn(expectedBPMNFileName) || "";
   const actualPath = await parseBpmn(actualBPMNFileName) || "";

   console.log("/////////////////////////////////Business Process Type:////////////////////////////", businessProcessType);
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

   // Can this call also be taken out of this program, to a independent compile...?
   await BusinessProcessIntegrityZKProgram.compile();

   // This CALL will be done as a CLI eventually, so that this smart contract is compiled
   // and deployed independently, outside of this file. But for , now we are using this 
   // to surfacce a problem we are seeing and to discuss. 

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
      }
   );
   console.log("deployTxn is successful");
   await deployTxn.sign([deployerKey, zkAppKey]).send();
   console.log("deployTxn signed successfully");

   try{  

   // Generate test proof
   //console.log("Fetching compliance data...");
   const response = await axios.get('https://0f4aef00-9db0-4057-949e-df6937e3449b.mock.pstmn.io/vernon_mca');
   const parsedData = response.data;

   //console.log(parsedData);

   //console.log(parsedData["CIN"]);
   //console.log(parsedData["Active Compliance"]);

   const bpComplianceData = new BusinessProcessIntegrityData({
      /*companyID: CircuitString.fromString(parsedData["CIN"] || ''),
      companyName: CircuitString.fromString(parsedData["Company Name"] || ''),
      companyStatus: CircuitString.fromString(parsedData["Company Status"]),
      activeCompliance: CircuitString.fromString(parsedData["Active Compliance"]),
      */
      businessProcessID: Field(parsedData["BusinessProcess ID"] ?? 0),
      businessProcessType: CircuitString.fromString(businessProcessType),
      expectedContent: CircuitString.fromString(expectedPath),
      // expectedContent: "ABC",
      actualContent: CircuitString.fromString(actualPath),
      str: "String to print"
   });

   // =================================== Oracle Signature Generation ===================================
   // Create message hash
   const complianceDataHash = Poseidon.hash(BusinessProcessIntegrityData.toFields(bpComplianceData));

   //const sameKey = getDeployerPrivateKey();
   const registryPrivateKey = getPrivateKeyFor('BPMN');
   // Sign the message hash with the oracle's private key
   const oracleSignature = Signature.create(registryPrivateKey, [complianceDataHash]);

   //const exp=CircuitString.fromString("a(cb|bc)d(ef|f)g");
   //console.log("ActualContent****",complianceData.actualContent.toString())

   //let proof = await BusinessProcessIntegrityZKProgram.proveComplianceSCF(Field(0), bpComplianceData, oracleSignature);
   
   let proof : BusinessProcessIntegrityProof;
   //let BusinessProcessIntegrityProof proof = BusinessProcessIntegrityProof ;

   if(businessProcessType === 'STABLECOIN'){
      proof = await BusinessProcessIntegrityZKProgram.proveComplianceSTABLECOIN(Field(0), bpComplianceData, oracleSignature);
 
   }
   else if (businessProcessType === 'SCF'){
      console.log("/************************Business Process Type is SCF********************************************/");
      proof = await BusinessProcessIntegrityZKProgram.proveComplianceSCF(Field(0), bpComplianceData, oracleSignature);
   }
   else if (businessProcessType === 'DVP'){
      proof = await BusinessProcessIntegrityZKProgram.proveComplianceDVP(Field(0), bpComplianceData, oracleSignature);
   }
   else{
      proof = await BusinessProcessIntegrityZKProgram.proveComplianceSCF(Field(0), bpComplianceData, oracleSignature);
   }

      //console.log( 'Public Output', proof.publicOutput.businessProcessID.toJSON(), '  out ' , proof.publicOutput.out.toBoolean());
   //console.log("Before verification, Initial value of risk:",zkApp.risk.get().toJSON());

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

   console.log("$$$$$$$$$$$Final value of risk from client...$$$$$$$$$$$$$.:",zkApp.risk.get().toJSON());
   console.log('✅ Proof verified successfully!');
   return proof1;
  } 

  catch(error){
   console.log("$$$$$$$$$$$Final value of risk from client...$$$$$$$$$$$$$.:",zkApp.risk.get().toJSON());
   console.error('Error:', error);
  }
}
// async function main() {
//    const expectedPath = await parseBpmn(expectedBPMNFileName) || "";
//    const actualPath = await parseBpmn(actualBPMNFileName) || "";
//    const proof = await getBPIVerificationFileTestWithSign(expectedPath, actualPath);

// }
// main().catch(err => {
//    console.error('Error:', err);
// });