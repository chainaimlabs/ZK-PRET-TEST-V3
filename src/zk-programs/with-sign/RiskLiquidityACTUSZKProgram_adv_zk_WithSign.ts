import {
   Field,
   Signature,
   Struct,
   ZkProgram,
   CircuitString,
   Bool,
   Poseidon
} from 'o1js';


import { getPublicKeyFor } from '../../core/OracleRegistry.js';
// import axios from 'axios';
const MAX_LENGTH = 120; // Define a maximum length for cash flows

export class ACTUSData extends Struct({
   scenarioID: CircuitString,
   scenarioName: CircuitString,
   scenarioName_str: String,
   riskEvaluated: Field,
   cashInflows: Array(MAX_LENGTH).fill(Number),  // Fixed-size array
   cashOutflows: Array(MAX_LENGTH).fill(Number), // Fixed-size array
   newInvoiceAmount: Number,
   newInvoiceEvaluationMonth: Number,
   liquidityThreshold: Number,
   //liquidityThreshold: Field,
   inflowLength: Number,
   outflowLength: Number
}) {
   constructor(data: { scenarioID: CircuitString; scenarioName: CircuitString; scenarioName_str: string; riskEvaluated: Field; cashInflows: any[]; cashOutflows: any[]; newInvoiceAmount: number; newInvoiceEvaluationMonth: number; liquidityThreshold: number; inflowLength: number; outflowLength: number; }) {
      super(data);
      this.cashInflows = this.padArray(data.cashInflows, MAX_LENGTH);
      this.cashOutflows = this.padArray(data.cashOutflows, MAX_LENGTH);
   }

   private padArray(arr: number[], length: number): number[] {
      const paddedArray = [...arr];
      while (paddedArray.length < length) {
         paddedArray.push(0); // Pad with zeros or any other default value
      }
      return paddedArray.slice(0, length); // Ensure it does not exceed MAX_LENGTH
   }
}


//import { compileProgram } from 'o1js/dist/node/lib/proof-system/zkprogram.js';


// Define the Public Output Structure
export class liquidityratioDataPublicOutput extends Struct({
   out: Bool
   //corporateComplianceToProveHash: Field,
   //currCorporateComplianceStatusCodeHash: Field,
   //outputExpectedHash: Field,
   //outputActualHash: Field,
   //creatorPublicKey: PublicKey,
}) { }


class liquidityratioData extends Struct({
   companyID: CircuitString,
   companyName: CircuitString,
   mcaID: CircuitString,
   businessPANID: CircuitString,
   currCorporateComplianceStatusCode: Field,
   //currentDate: Field,
}) {
}



export const LiquidityRatio = ZkProgram({
   name: 'LiquidityRatio',
   publicInput: Field,
   publicOutput: liquidityratioDataPublicOutput,
   methods: {
      proveCompliance: { // Generates the public output
         privateInputs: [
            ACTUSData,
            Signature,
            //Signature,
            //PublicKey,
         ],
         async method(

            LiquidityRatioToProve: Field,
            //expectedActiveComplianceHash: CircuitString.fromString("Active").hash(),
            //corporateRegistrationData: CorporateRegistrationData,
            LiquidityRatioData: ACTUSData,
            oracleSignature: Signature,
            //oracleSignature: Signature,
            //creatorSignature: Signature,
            //creatorPublicKey: PublicKey
         ): Promise<liquidityratioDataPublicOutput> {

            //========================================================================================================


            const risk1DataHash = Poseidon.hash(ACTUSData.toFields(LiquidityRatioData));
            const registryPublicKey = getPublicKeyFor('RISK');
            const isValidSignature = oracleSignature.verify(
               //  Oracle_Private_key, // Replace with the actual oracle public key, from the registry hashmap.
               registryPublicKey,//registry.lookup keep one key mca value object:private,publickey
               [risk1DataHash]
            );
            isValidSignature.assertTrue();


            //========================================================================================================


            const scenarioName_str = CircuitString.fromString(LiquidityRatioData.scenarioName_str);
            // Apply Math.round before converting to Field
            const cashInfl = LiquidityRatioData.cashInflows.map(val => Field(Math.round(val)));
            const cashOutfl = LiquidityRatioData.cashOutflows.map(val => Field(Math.round(val)));

            const monthsCount = Field(LiquidityRatioData.inflowLength);
            const newInvoiceAmount = Field(Math.round(LiquidityRatioData.newInvoiceAmount));
            const newInvoiceEvaluationMonth = Field(LiquidityRatioData.newInvoiceEvaluationMonth);
            const liquidityThreshold = Field(Math.round(LiquidityRatioData.liquidityThreshold));

            console.log("******** Scenario Name:", scenarioName_str.toString());

            let cumulativeCashFlow = Field(1000000);
            let cumulativeOutflow = Field(0);  // Running total of outflows up to current month
            let out = Bool(true);
            let count = 1;
            // Iterate over each month
            for (let month = Field(1); month.lessThan(monthsCount).toBoolean(); month = month.add(1)) {
               let inflow = cashInfl[count];
               let outflow = cashOutfl[count - 1];
               const invoiceAddition = month.equals(newInvoiceEvaluationMonth).toBoolean() ? newInvoiceAmount : Field(0);
               const totalOutflow = outflow.add(invoiceAddition);
               cumulativeOutflow = cumulativeOutflow.add(totalOutflow);  // Update running total of outflows
               const netCashFlow = inflow.sub(totalOutflow);//inflow-outflow (total just accounts that newinvoice loan amount  most times it is 0 and for that particular time the value is added to netcashflow)
               cumulativeCashFlow = cumulativeCashFlow.add(netCashFlow);
               // Avoid division by checking:
               // liqratio = cumulativeCashFlow / cumulativeOutflow > threshold
               // Rewrite as:
               const thresholdMultiplied = liquidityThreshold.mul(cumulativeOutflow);
               out = cumulativeCashFlow.greaterThan(thresholdMultiplied);
               out.assertEquals(Bool(true));  // Ensure liquidity condition holds
               // Debugging logs
               console.log("Month:", month.toString());
               console.log("Inflow:", inflow.toString());
               console.log("Outflow:", outflow.toString());
               console.log("Total Outflow till Now:", cumulativeOutflow.toString());  // Shows total outflow up to this month
               console.log("Cumulative Cash Flow:", cumulativeCashFlow.toString());
               console.log("Threshold Multiplied:", thresholdMultiplied.toString());
               console.log("Out:", out.toString());

               count++;
            }
            console.log("Out ", out.toJSON());
            return new liquidityratioDataPublicOutput({
               out
            });
         },
      },
   }
});
export class LiquidityRatioProof extends ZkProgram.Proof(LiquidityRatio) { }
