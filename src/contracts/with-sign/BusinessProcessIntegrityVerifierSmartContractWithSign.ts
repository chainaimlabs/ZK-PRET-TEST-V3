import { json } from 'stream/consumers';
import { Bool, Field, SmartContract, state, State, method, CircuitString, Struct, FlexibleProvablePure, ZkProgram, Provable, Poseidon, Signature, Bytes,UInt64 } from 'o1js';
import { BusinessProcessIntegrityProof } from '../../zk-programs/with-sign/BusinessProcessIntegrityZKProgramWithSign.js';
import { BusinessProcessIntegrityZKProgram, BusinessProcessIntegrityData } from '../../zk-programs/with-sign/BusinessProcessIntegrityZKProgramWithSign.js';
import { getPublicKeyFor } from '../../core/OracleRegistry.js';
import { verifyProcess } from '../../contracts/bpmnCircuit.js';
class Bytes80 extends Bytes(20) { }

// Define the ComplianceData struct

// SmartContract definition

export class BusinessProcessIntegrityVerifierSmartContract extends SmartContract {
   @state(Field) risk = State<Field>(); // State variable to hold a variable called risk
   // Initialize the contract state
   init() {
      super.init(); // Call the parent class initializer
      this.risk.set(Field(100)); // Set initial value of `num` to 100
   }
   //console.log("risk  value intialized successfully");

   // Method to verify BusinessProcessIntegrityDatacompliance passed in to the contract as a 
   // complianceData object which is verified thru the execution of the circuit on-chain and update state

   /*
    @method async verifyComplianceWithParams(input: BusinessProcessIntegrityData, oracleSignature: Signature) {
      // Ensure the state of `risk` matches its current value
      this.risk.requireEquals(this.risk.get());
      const currentNum = this.risk.get();
      // =================================== Oracle Signature Verification ===================================
      const complianceDataHash = Poseidon.hash(BusinessProcessIntegrityData.toFields(input));
      const registryPublicKey = getPublicKeyFor('BPMN');
      const isValidSignature = oracleSignature.verify(
         registryPublicKey,
         [complianceDataHash]
      );
      isValidSignature.assertTrue();
      
      const actualContent = input.actualContent;
      console.log('actual ||||||||||||||| content |||||||||||||||||', actualContent);
   
      // ----------------------------------------------------
         //console.log( "expected path ",businessProcessIntegrityData.expectedContent.values.toString);
         const actualPath = CircuitString.fromString(actualContent);
         // console.log( "actual path ",businessProcessIntegrityData.actualContent.toString);
      
         // Provable.asProver(() => {
         //  console.log( "actual path ",businessProcessIntegrityData.actualContent.toString);
         //  const out =  verifyProcess(Bytes50.fromString(`${actualPath}`).bytes);
         //});
         //   Provable.log(businessProcessIntegrityData.actualContent);                 
               
         const out = verifyProcess(Bytes50.fromString(`${actualPath}`).bytes);
         console.log(' actual Path.. ', actualPath.toString(), " ############ Final Result...:", out.toJSON());
         out.assertTrue();

          // CHECK WITH MINA EXPERT Revision Notes..  Alternately, Change the impl to 

         //Provable.if(out.assertTrue()) {
         //Provable.if(verifyProcess(Bytes50.fromString(`${actualPath}`).bytes)) {
         //const updatedNum = currentNum.sub(10);
         //this.risk.set(updatedNum);
         //} 

      // Update the state
      const updatedNum = currentNum.sub(10);
      this.risk.set(updatedNum);
    }
*/

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
         //out.assertTrue(); -- removed the assert.

         // Update the state based on the assert of the public output available from the ZKprogram evaluation.
         // if the assertTrue passes - that means the Business Process Actual was as Expected, and hence num which
         // represents risk can be reduced.

         const updatedNum = currentNum.sub(10);
    
         // CHECK WITH MINA EXPERT Revision Notes..  Alternately, Change the impl to 

         /* correct way
           const newState = Provable.if(
           input.greaterThanOrEqual(UInt64.from(10)),
           UInt64.from(9),
           input
           );
          this.num.set(newState);
          */

         // new code., when run get errors saying some operations are not 
         // supported within Provable.if

         const newState = Provable.if(
            out, // out must be a Bool
            updatedNum,  // if out is true, use updatedNum
            currentNum   // if out is false, keep currentNum
          );

          Provable.asProver(() => {
            console.log( ' eval new state out   ' , out.toJSON(), ' curr ', currentNum.toJSON(), ' upd ', updatedNum.toJSON(),    '  new state '  ,newState.toJSON(), ' value  ',  this.risk.get().toJSON());
          });
          
          // If this.risk is State<Field>, store newState.value
          this.risk.set(newState);
         const finalNum = this.risk.get();
        
         Provable.asProver(() => {
            console.log( 'final new state ',newState.toJSON(), ' value  ',  finalNum.toJSON());
          });

      }
      catch (error) {
         console.log('catching error in SMART CONTRACT');
         console.log(' error ', error);
         //const finalNum = this.risk.get();
         //console.log( 'final num  err ', finalNum.toJSON())
      }

   }

}