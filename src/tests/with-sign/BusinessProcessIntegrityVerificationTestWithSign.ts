import { Field, Mina, PrivateKey, AccountUpdate, Poseidon, CircuitString, Signature } from 'o1js';
import { BusinessProcessIntegrityZKProgram, BusinessProcessIntegrityData } from '../../zk-programs/with-sign/BusinessProcessIntegrityZKProgramWithSign.js';
import { BusinessProcessIntegrityVerifierSmartContract } from '../../contracts/with-sign/BusinessProcessIntegrityVerifierSmartContractWithSign.js';
// import { BusinessProverdeployerAccount, BusinessProversenderAccount, BusinessProverdeployerKey, BusinessProversenderKey, getPrivateKeyFor, Local } from './OracleRegistry.js';
import { getPrivateKeyFor } from '../../core/OracleRegistry.js';

import axios from 'axios';
async function main() {

   /*const Local = Mina.LocalBlockchain({ proofsEnabled: true });
 
  // Mina.setActiveInstance(Local);
  const localInstance = await Local; // Await the promise before using it
 Mina.setActiveInstance(localInstance);
  const deployer = (await Local).testAccounts[0].key;
  const deployerPublicKey = deployer.toPublicKey();*/

   const expectedPath = process.argv[2];
   //const expectedPath = "a(cb|bc)d(ef|f)g";
   const actualPath = process.argv[3];
   //const actualPath = "abcdefg";

   // console.log("EXP:",expectedPath);
   //console.log("ACT:",actualPath);
   const useProof = false;

   const Local = await Mina.LocalBlockchain({ proofsEnabled: useProof });
   Mina.setActiveInstance(Local);

   const BusinessProverdeployerAccount = Local.testAccounts[0];
   const BusinessProverdeployerKey = BusinessProverdeployerAccount.key;
   const BusinessProversenderAccount = Local.testAccounts[1];
   const BusinessProversenderKey = BusinessProversenderAccount.key;

   /*const deployerKeypair = PrivateKey.random();
   const deployer = deployerKeypair;*/
   //const deployer = localInstance.testAccounts[0].keypair.privateKey; // If keypair exists

   // Compile artifacts
   console.log('Compiling...');

   await BusinessProcessIntegrityZKProgram.compile();
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

   console.log("Mina transaction is successful");

   const deployTxn = await Mina.transaction(
      BusinessProverdeployerAccount,
      async () => {
         AccountUpdate.fundNewAccount(BusinessProverdeployerAccount);
         await zkApp.deploy({ verificationKey });

      }
   );
   console.log("deployTxn is successful");
   await deployTxn.sign([BusinessProverdeployerKey, zkAppKey]).send();
   console.log("deployTxn signed successfully");


   //console.log("Fetching compliance data...");
   const response = await axios.get('https://0f4aef00-9db0-4057-949e-df6937e3449b.mock.pstmn.io/vernon_mca');
   const parsedData = response.data;

   //console.log(parsedData);

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
   const oracleSignature = Signature.create(registryPrivateKey, [complianceDataHash]);

   console.log("Before verification, Initial value of risk:", zkApp.risk.get().toJSON());

   //const exp=CircuitString.fromString("a(cb|bc)d(ef|f)g");
   // console.log(ActualContent****",complianceData.actualContent.toString())
   const proof = await BusinessProcessIntegrityZKProgram.proveCompliance(Field(0), complianceData, oracleSignature);

   console.log('generating proof ..', proof.toJSON());
   //console.log('...........proof public output...  ^^^^^^^^^^^^^^^^', proof.publicOutput.out.toJSON());

   // Verify proof
   const txn = await Mina.transaction(
      BusinessProversenderAccount,
      async () => {
         await zkApp.verifyComplianceWithProof(proof);
      }
   );
   // await txn.sign([zkAppKey]).send();

   const proof1 = await txn.prove();

   console.log("Proof generated successfully");
   console.log(BusinessProversenderAccount.toJSON());
   console.log(BusinessProversenderKey.toJSON(), BusinessProversenderKey.toPublicKey());
   console.log("Generated Proof:", proof1.toPretty());

   console.log("sending txn ");
   await txn.sign([BusinessProversenderKey]).send();
   console.log("sent txn ");

   console.log("$$$$$$$$$$$$$Final value of risk:$$$$$$$$$$$$$$$", zkApp.risk.get().toJSON());

   console.log('✅ Proof verified successfully!');

}

main().catch(err => {
   console.error('Error:', err);
});