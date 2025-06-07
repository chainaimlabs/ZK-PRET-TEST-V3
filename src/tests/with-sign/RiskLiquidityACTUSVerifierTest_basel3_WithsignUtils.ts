import { Field, Mina, PrivateKey, AccountUpdate, CircuitString, Poseidon, Signature } from 'o1js';
import { loadAndProcessJsonData } from '../../core/map_basel3.js';
import { LiquidityRatioZkprogram, ACTUSDatao1 } from '../../zk-programs/with-sign/RiskLiquidityACTUSZKProgram_basel3_Withsign.js';
import { LiquidityRatioVerifierSmartContract } from '../../contracts/with-sign/RiskLiquidityVerifierACTUSSmartContract_basel3_Withsign.js';
import { getPrivateKeyFor } from '../../core/OracleRegistry.js';
import { fetchActusBasel3Data } from './RiskUtilsBasel3.js';

interface ClassifiedContract {
    L1: number;
    L2A: number;
    L2B: number;
    NonHQLA: number;
}

interface ProcessedData {
    inflow: number[][];
    outflow: number[][];
    monthsCount: number;
    results: { [key: string]: ClassifiedContract };
}



export async function getACTUSRiskSimulationData(userLiquidityThreshold_LCR: number,url : string) {

     console.log("Fetching ACTUS risk simulation data...");
   
   // Replace axios call with service function
   const jsondata = await fetchActusBasel3Data(url);
   
   // Call the function to process cash flow data
   const { inflow: cashInflow, outflow: cashOutflow, monthsCount, results: classifiedContracts } = 
    loadAndProcessJsonData(jsondata) as ProcessedData;

   const cinflow = cashInflow.map(arr => arr.reduce((sum, num) => sum + num, 0));
   const coutflow = cashOutflow.map(arr => arr.reduce((sum, num) => sum + num, 0));

   const totalHQLA_L1 = Object.values(classifiedContracts).map((month: ClassifiedContract) => month.L1);
   const totalHQLA_L2A = Object.values(classifiedContracts).map((month: ClassifiedContract) => month.L2A);
   const totalHQLA_L2B = Object.values(classifiedContracts).map((month: ClassifiedContract) => month.L2B);
   const totalNonHQLA = Object.values(classifiedContracts).map((month: ClassifiedContract) => month.NonHQLA);


   const riskScenario1Data = {
      companyID: 'Financier 10001',
      companyName: 'Financier 1 - CashFlows RiskFree',
      mcaID: '201',
      businessPANID: '1001',
      riskEvaluated: Field(1),
      cashInflow: cinflow,
      cashOutflow: coutflow,
      newInvoiceAmount: 5000,
      newInvoiceEvaluationMonth: 11,
      liquidityThreshold: Math.round(10),
      liquidityThreshold_lcr: Math.round(userLiquidityThreshold_LCR),
      inflowLength: monthsCount,  // Pass inflowLength
   };

   const risk1Data = new ACTUSDatao1({
      // Scenario Identifiers

      
      scenarioID: CircuitString.fromString(riskScenario1Data.companyID),
      scenarioName: CircuitString.fromString(riskScenario1Data.companyName),
      scenarioName_str: "scenario_1",
      riskEvaluated: Field(riskScenario1Data.riskEvaluated),

      // Cash Flow Data
      cashInflows: riskScenario1Data.cashInflow.flat(),  // Flatten to match expected format
      cashOutflows: riskScenario1Data.cashOutflow.flat(), // Flatten to match expected format
      inflowLength: riskScenario1Data.cashInflow.flat().length,
      outflowLength: riskScenario1Data.cashOutflow.flat().length,

      //  LCR Calculation Data
      newInvoiceAmount: riskScenario1Data.newInvoiceAmount,
      newInvoiceEvaluationMonth: riskScenario1Data.newInvoiceEvaluationMonth,
      liquidityThreshold: riskScenario1Data.liquidityThreshold,
      liquidityThreshold_LCR: riskScenario1Data.liquidityThreshold_lcr,

      // Classified Contracts (For HQLA Computation)
      classifiedContracts: Object.entries(classifiedContracts).map(([id, { L1, L2A, L2B, NonHQLA }]) => ({
         id,
         type: 'someType', 
         hqlaCategory: 'someCategory',
         inflowTotal: L1 + L2A + L2B, 
         outflowTotal: NonHQLA 
      })),

      // Aggregated HQLA Values for LCR Calculation
      totalHQLA_L1: totalHQLA_L1,
      totalHQLA_L2A: totalHQLA_L2A,
      totalHQLA_L2B: totalHQLA_L2B,
      totalNonHQLA: totalNonHQLA,
   });

   return risk1Data;
}





export async function getRiskBasel3WithSign(userLiquidityThreshold_LCR: number,url : string) {
   /*const Local = Mina.LocalBlockchain({ proofsEnabled: true });
 
  //Mina.setActiveInstance(Local);
   const localInstance = await Local; // Await the promise before using it
   Mina.setActiveInstance(localInstance);
   const deployer = (await Local).testAccounts[0].key;
   const deployerPublicKey = deployer.toPublicKey();*/

   const useProof = false;
   //const userLiquidityThreshold_LCR = parseFloat(process.argv[2]);
   //const url = process.argv[3];
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
   console.log('Compiling...');

   await LiquidityRatioZkprogram.compile();
   const { verificationKey } = await LiquidityRatioVerifierSmartContract.compile();

   console.log("verification key is successful");
   // Deploy contract
   const zkAppKey = PrivateKey.random();
   const zkAppAddress = zkAppKey.toPublicKey();


   /*await Mina.transaction(deployerKeypair, async () => {
     await Mina.fundAccount({ address: zkAppAddress, initialBalance: 10 });
   }).send();*/
   console.log("ZKAppAddress is successful");
   //const zkApp = new HashVerifier(zkAppAddress);

   const zkApp = new LiquidityRatioVerifierSmartContract(zkAppAddress);

   console.log("zkApp is successful");

   /*await Mina.transaction(deployerPublicKey, async () => {
     AccountUpdate.fundNewAccount(deployerPublicKey); // Ensure deployer has funds
     AccountUpdate.fundNewAccount(zkAppAddress); // Fund the zkApp address
 
   }).send();*/

   console.log("Mina transaction is successful");

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
   // URL of the server
   //const url = 'http://localhost:8083/eventsBatch';
   //const url = 'http://98.84.165.146:8083/eventsBatch';
    
   const risk1Data =  await getACTUSRiskSimulationData(userLiquidityThreshold_LCR,url);

   //===============================================================================================================

   const risk1DataHash = Poseidon.hash(ACTUSDatao1.toFields(risk1Data));
   const registryPrivateKey = getPrivateKeyFor('RISK');
   const oracleSignature = Signature.create(registryPrivateKey, [risk1DataHash]);

   //===============================================================================================================

   const proof = await LiquidityRatioZkprogram.proveCompliance(Field(0), risk1Data, oracleSignature)

   console.log("Before verification, Initial value of num:", zkApp.num.get().toJSON());
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
   console.log("After verification, Final value of num:", zkApp.num.get().toJSON());
   console.log('✅ Proof verified successfully!');
   return proof1;
}

// async function main() {
//    const userLiquidityThreshold_LCR = parseFloat(process.argv[2]);   
//    const proof = await getRiskBasel3WithSign(userLiquidityThreshold_LCR);
//    console.log('Proof:', proof);
// }
// main().catch(err => {
//    console.error('Error:', err);
// });

//export { ComplianceData };