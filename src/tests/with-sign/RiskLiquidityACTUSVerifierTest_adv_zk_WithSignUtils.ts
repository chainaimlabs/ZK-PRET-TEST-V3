import { Field, Mina, PrivateKey, AccountUpdate, CircuitString, Poseidon, Signature } from 'o1js';
import { loadAndProcessJsonData } from '../../core/map_with_zk_adv.js';
import { LiquidityRatio, ACTUSData } from '../../zk-programs/with-sign/RiskLiquidityACTUSZKProgram_adv_zk_WithSign.js';
import { LiquidityRatioVerifierSmartContract } from '../../contracts/with-sign/RiskLiquidityVerifierACTUSSmartContract_adv_zk_WithSign.js';
import { getPrivateKeyFor } from '../../core/OracleRegistry.js';
import { fetchActusData } from './RiskUtilsADV.js';

export async function getRiskADVZKWithSign(userLiquidityThreshold: number) {
   /*const Local = Mina.LocalBlockchain({ proofsEnabled: true });
 
  // Mina.setActiveInstance(Local);
  const localInstance = await Local; // Await the promise before using it
 Mina.setActiveInstance(localInstance);
   const deployer = (await Local).testAccounts[0].key;
   const deployerPublicKey = deployer.toPublicKey();*/
   const useProof = false;
  // const userLiquidityThreshold = parseFloat(process.argv[2]);
   const Local = await Mina.LocalBlockchain({ proofsEnabled: useProof });
   Mina.setActiveInstance(Local);

   const RiskProverdeployerAccount = Local.testAccounts[0];
   const RiskProverdeployerKey = RiskProverdeployerAccount.key;
   const RiskProversenderAccount = Local.testAccounts[1];
   const RiskProversenderKey = RiskProversenderAccount.key;

   /*const deployerKeypair = PrivateKey.random();
   const deployer = deployerKeypair;*/

   //const deployer = localInstance.testAccounts[0].keypair.privateKey; // If keypair exists

   //await SecretHash.compile();
   // await CorporateRegistration.compile();

   await LiquidityRatio.compile();

   //const { verificationKey } = await HashVerifier.compile();

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
      RiskProverdeployerAccount,
      async () => {
         AccountUpdate.fundNewAccount(RiskProverdeployerAccount);
         await zkApp.deploy({ verificationKey });

         //zkApp.storedHash.set(Field(42));


      }
   );
   console.log("deployTxn is successful");
   await deployTxn.sign([RiskProverdeployerKey, zkAppKey]).send();
   console.log("deployTxn signed successfully");

   // Generate test proof

   //const secret = Field(42);
   //const correctHash = Poseidon.hash([secret]);
   //const proof = await SecretHash.generate(correctHash, secret);

   // const proof = await CorporateRegistration.proveCompliance();


   // URL of the server
   const url = 'http://localhost:8083/eventsBatch';

   // Data to send in the POST request
   const data = {
      "contracts": [
         {
            "contractType": "ANN",
            "contractID": "ann01",
            "contractRole": "RPA",
            "contractDealDate": "2012-12-28T00:00:00",
            "initialExchangeDate": "2013-01-01T00:00:00",
            "statusDate": "2012-12-30T00:00:00",
            "notionalPrincipal": "5000",
            "cycleAnchorDateOfPrincipalRedemption": "2013-02-01T00:00:00",
            "nextPrincipalRedemptionPayment": "434.866594118346",
            "dayCountConvention": "A365",
            "nominalInterestRate": "0.08",
            "currency": "USD",
            "cycleOfPrincipalRedemption": "P1ML0",
            "maturityDate": "2014-01-01T00:00:00",
            "rateMultiplier": "1.0",
            "rateSpread": "0.0",
            "fixingDays": "P0D",
            "cycleAnchorDateOfInterestPayment": "2013-02-01T00:00:00",
            "cycleOfInterestPayment": "P1ML0"
         },
         {
            "contractType": "ANN",
            "contractID": "ann02",
            "contractRole": "RPA",
            "contractDealDate": "2013-03-28T00:00:00",
            "initialExchangeDate": "2013-04-01T00:00:00",
            "statusDate": "2013-03-30T00:00:00",
            "notionalPrincipal": "100000",
            "cycleAnchorDateOfPrincipalRedemption": "2013-05-01T00:00:00",
            "nextPrincipalRedemptionPayment": "1161.08479218624",
            "dayCountConvention": "30E360",
            "nominalInterestRate": "0.07",
            "currency": "USD",
            "cycleOfPrincipalRedemption": "P1ML0",
            "maturityDate": "2014-03-01T00:00:00",
            "rateMultiplier": "1.0",
            "rateSpread": "0.0",
            "fixingDays": "P0D",
            "cycleAnchorDateOfInterestPayment": "2013-05-01T00:00:00",
            "cycleOfInterestPayment": "P1ML0"
         }
      ],
      "riskFactors": []
   };

   let jsondata: string | undefined;
   // Send POST request using axios
   // await axios.post(url, data)
   //    .then(response => {
   //       console.log('Response Code:', response.status);
   //       console.log('Response Body:', response.data);


   //       jsondata = JSON.stringify(response.data, null, 2);
   //    })
   //    .catch(error => {
   //       console.error('Error:', error.response ? error.response.data : error.message);
   //    });

   // if (!jsondata) {
   //    throw new Error('Failed to fetch JSON data');
   // }

   console.log("Fetching compliance data...");
   const actusData = await fetchActusData();
    
   const { inflow: cashInfl, outflow: cashOutfl, monthsCount } = actusData;
   const Inf: number[] = cashInfl.map(block => block.reduce((sum, value) => sum + value, 0));
   const Outf: number[] = cashOutfl.map(block => block.reduce((sum, value) => sum + value, 0));


   //deposits - inflow,represented as contracts (cash contract)
   //existing loans
   //newly evaluated loans 
   //accounts recievable
   //accounts payable
   console.log(cashInfl)
   const riskScenario1Data = {
      companyID: 'Financier 10001',
      companyName: 'Financier 1 - CashFlows RiskFree',
      mcaID: '201',
      businessPANID: '1001',
      riskEvaluated: Field(1),
      cashInflow: Inf,
      cashOutflow: Outf,
      newInvoiceAmount: 5000,
      newInvoiceEvaluationMonth: 11,
      liquidityThreshold: Math.round(userLiquidityThreshold),
      inflowLength: monthsCount,  // Pass inflowLength
      outflowLength: monthsCount // Pass outflowLength
   };

   const risk1Data = new ACTUSData({
      scenarioID: CircuitString.fromString(riskScenario1Data.companyID),
      scenarioName: CircuitString.fromString(riskScenario1Data.companyName),
      scenarioName_str: "scenario_1",
      riskEvaluated: Field(riskScenario1Data.riskEvaluated),
      cashInflows: riskScenario1Data.cashInflow,
      cashOutflows: riskScenario1Data.cashOutflow,
      newInvoiceAmount: riskScenario1Data.newInvoiceAmount,
      newInvoiceEvaluationMonth: riskScenario1Data.newInvoiceEvaluationMonth,
      //liquidityThreshold: riskScenario1Data.liquidityThreshold,
      liquidityThreshold: (riskScenario1Data.liquidityThreshold),
      inflowLength: riskScenario1Data.inflowLength,  // Pass inflowLength
      outflowLength: riskScenario1Data.outflowLength // Pass outflowLength
   });




   //===============================================================================================================

   const risk1DataHash = Poseidon.hash(ACTUSData.toFields(risk1Data));
   const registryPrivateKey = getPrivateKeyFor('RISK');
   const oracleSignature = Signature.create(registryPrivateKey, [risk1DataHash]);

   //===============================================================================================================




   const proof = await LiquidityRatio.proveCompliance(Field(0), risk1Data, oracleSignature)

   console.log("Before verification, Initial value of num:", zkApp.num.get().toJSON());
   // Verify proof
   const txn = await Mina.transaction(
      RiskProversenderAccount,
      async () => {
         await zkApp.verifyComplianceWithProof(proof);
      }
   );
   // await txn.sign([zkAppKey]).send();

   const proof1 = await txn.prove();
   //await txn.prove();


   console.log("Proof generated successfully");
   console.log(RiskProversenderAccount.toJSON());
   console.log(RiskProversenderKey.toJSON(), RiskProversenderKey.toPublicKey());
   console.log("Generated Proof:", proof1.toPretty());
   await txn.sign([RiskProversenderKey]).send();
   console.log("After verification, Final value of num:", zkApp.num.get().toJSON());
   console.log('✅ Proof verified successfully!');
   return proof1;
}
// async function main() {
//    const userLiquidityThreshold = parseFloat(process.argv[2]);
//    const proof = await getRiskADVZKWithSign(userLiquidityThreshold);
//    console.log('Proof:', proof);
// }
// main().catch(err => {
//    console.error('Error:', err);
// });

// //export { ComplianceData };
