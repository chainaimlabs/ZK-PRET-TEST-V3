import { json } from 'stream/consumers';
import { Bool, Field, SmartContract, state, State, method, CircuitString, Struct, FlexibleProvablePure, ZkProgram, Provable } from 'o1js';
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
   @state(Field) risk = State<Field>(); // State variable to hold a number
   // Initialize the contract state
   init() {
      super.init(); // Call the parent class initializer
      this.risk.set(Field(100)); // Set initial value of `num` to 100
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

   /* This method verifies the compliance based on the 
      Proof generated in the ZKProgram.
   */
   @method async verifyComplianceWithProof(proof: BusinessProcessIntegrityProof) {

      try {
         // Ensure the state of `num` matches its current value
         this.risk.requireEquals(this.risk.get());
         const currentNum = this.risk.get();

         proof.verify();

         const out = proof.publicOutput.out;
          //console.log(' out from public output in smart contract', out.toBoolean());

         out.assertTrue();

         // Update the state based on the assert of the public output available from the ZKprogram evaluation.
         // if the assertTrue passes - that means the Business Process Actual was as Expected, and hence num which
         // represents risk can be reduced.
        
         const updatedNum = currentNum.sub(10);
         this.risk.set(updatedNum);

         //  Revision Notes..  Alternately, move the logic to.. 

         //Provable.if(out.assertTrue()) {
         //const updatedNum = currentNum.sub(10);
         //this.num.set(updatedNum);
         //} 

      }
      catch (error) {
         console.log('catching error in SMART CONTRACT');
         console.log(' error ', error);
      }

   }

}