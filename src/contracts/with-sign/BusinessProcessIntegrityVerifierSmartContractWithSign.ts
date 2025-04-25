import { json } from 'stream/consumers';
import { Bool, Field, SmartContract, state, State, method, CircuitString, Struct, FlexibleProvablePure, ZkProgram, Provable } from 'o1js';
// import { BusinessProcessIntegrityProof } from '@/zk-program/with-sign/BusinessProcessIntegrityZKProgramWithSign.js';
import { BusinessProcessIntegrityProof } from '../../zk-programs/with-sign/BusinessProcessIntegrityZKProgramWithSign.js';

// Define the ComplianceData struct
/*export class ComplianceData extends Struct({
  companyID: CircuitString,          // CIN
  companyName: CircuitString,s        // Company Name
  roc: CircuitString,                // ROC
  registrationNumber: Field,         // Registration Number
  incorporationDate: CircuitString,  // Incorporation Date
  email: CircuitString,              // Email
  corporateAddress: CircuitString,   // Corporate Address
  listed: Field,                     // Listed (boolean as Field)
  companyType: CircuitString,        // Company Type
  companyCategory: CircuitString,    // Company Category
  companySubcategory: CircuitString, // Company Subcategory
  companyStatus: CircuitString,      // Company Status
  authorizedCapital: Field,          // Authorized Capital
  paidUpCapital: Field,              // Paid-up Capital
  lastAGMDate: CircuitString,        // Last AGM Date
  balanceSheetDate: CircuitString,   // Balance Sheet Date
  activeCompliance: CircuitString,   // Active Compliance
  companyActivity: CircuitString,    // Company Activity
  jurisdiction: CircuitString,       // Jurisdiction
  regionalDirector: CircuitString,   // Regional Director
  mcaID: Field,                      // MCA ID
}) {}
*/
// SmartContract definition


export class BusinessProcessIntegrityVerifierSmartContract extends SmartContract {
   @state(Field) num = State<Field>(); // State variable to hold a number
   // Initialize the contract state
   init() {
      super.init(); // Call the parent class initializer
      this.num.set(Field(100)); // Set initial value of `num` to 100
   }
   //console.log("num value set successfully");
   // Method to verify compliance and update state
   /* @method async verifyComplianceWithParams(input: ComplianceData) {
      // Ensure the state of `num` matches its current value
      this.num.requireEquals(this.num.get());
      const currentNum = this.num.get();
    
      // Convert CircuitString to Field using hash()
      const activeComplianceHash = input.activeCompliance.hash();
      const companyStatusHash = input.companyStatus.hash();
    
      // Define the expected hashes for "Active" and "ACTIVE Compliance"
      const expectedActiveComplianceHash = CircuitString.fromString("Active").hash();
      const expectedCompanyStatusHash = CircuitString.fromString("ACTIVE Compliant").hash();
    
      // Verification logic: check active compliance and company status
      activeComplianceHash.assertEquals(expectedActiveComplianceHash);
      companyStatusHash.assertEquals(expectedCompanyStatusHash);
      // Update the state
      const updatedNum = currentNum.sub(10);
      this.num.set(updatedNum);
    }
  await CorporateRegistration.compile();
  
  {*/
   //

   // Method to verify compliance and update state
   @method async verifyComplianceWithProof(proof: BusinessProcessIntegrityProof) {

      try {
         // Ensure the state of `num` matches its current value
         this.num.requireEquals(this.num.get());
         const currentNum = this.num.get();

         // Convert CircuitString to Field using hash()
         //const activeComplianceHash = input.activeCompliance.hash();
         //const companyStatusHash = input.companyStatus.hash();

         // Define the expected hashes for "Active" and "ACTIVE Compliance"
         //const expectedActiveComplianceHash = CircuitString.fromString("Active").hash();

         // Verification logic: check active compliance and company status
         //activeComplianceHash.assertEquals(expectedActiveComplianceHash);

         //const forceBool = Bool(true);
         //const forceBool = Bool(false);

         proof.verify();

         const out = proof.publicOutput.out;
         //proof.publicOutput.out.assertTrue();

         out.assertTrue();
         //console.log(' out from public output in smart contract', out.toBoolean());

         // Update the state
         //if(out){
         //Provable.if()
         //Provable.if(forceBool.assertFalse()) {
         const updatedNum = currentNum.sub(10);
         this.num.set(updatedNum);
         //} n

         //}
      }
      catch (error) {

         console.log('catching error in SMART CONTRACT');

         console.log(' error ', error);


      }

   }

}