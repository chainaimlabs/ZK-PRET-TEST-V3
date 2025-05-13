import { json } from 'stream/consumers';
import { Bool, Field, SmartContract, state, State, method, CircuitString, Struct, FlexibleProvablePure, ZkProgram, Provable, Poseidon, Signature, Bytes,UInt64, UInt8 } from 'o1js';
import { BusinessProcessIntegrityProof } from '../../zk-programs/with-sign/BusinessProcessIntegrityZKProgramWithSign.js';
import { BusinessProcessIntegrityZKProgram, BusinessProcessIntegrityData } from '../../zk-programs/with-sign/BusinessProcessIntegrityZKProgramWithSign.js';
import { getPublicKeyFor } from '../../core/OracleRegistry.js';
import { verifyProcessSCF,verifyProcessSTABLECOIN,verifyProcessDVP } from '../../contracts/bpmnCircuit.js';
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
   
    @method async verifyComplianceWithParamsSCF(input: BusinessProcessIntegrityData, oracleSignature: Signature) {
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
      console.log('actual ||||||||||||||| content |||||||||||||||||', actualContent.length());

         const out = verifyProcessSCF( actualContent.values.map((c) => UInt8.from(c.toField())));

         Provable.asProver(() => {
            console.log( 'out ', out.toJSON()
            );
          });

      out.assertTrue();
      // Update the state
      const updatedNum = currentNum.sub(10);
      this.risk.set(updatedNum);
    }

   // Method to verify BusinessProcessIntegrityDatacompliance passed in to the contract as a 
   // complianceData object which is verified thru the execution of the circuit on-chain and update state
   
   @method async verifyComplianceWithParamsSTABLECOIN(input: BusinessProcessIntegrityData, oracleSignature: Signature) {
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
      console.log('actual ||||||||||||||| content |||||||||||||||||', actualContent.length());

         const out = verifyProcessSCF( actualContent.values.map((c) => UInt8.from(c.toField())));

         Provable.asProver(() => {
            console.log( 'out ', out.toJSON()
            );
          });

      out.assertTrue();
      // Update the state
      const updatedNum = currentNum.sub(10);
      this.risk.set(updatedNum);
    }


    // Method to verify BusinessProcessIntegrityDatacompliance passed in to the contract as a 
   // complianceData object which is verified thru the execution of the circuit on-chain and update state
   
   @method async verifyComplianceWithParamsDVP(input: BusinessProcessIntegrityData, oracleSignature: Signature) {
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
      console.log('actual ||||||||||||||| content |||||||||||||||||', actualContent.length());

         const out = verifyProcessDVP( actualContent.values.map((c) => UInt8.from(c.toField())));

         Provable.asProver(() => {
            console.log( 'out ', out.toJSON()
            );
          });

      out.assertTrue();
      // Update the state
      const updatedNum = currentNum.sub(10);
      this.risk.set(updatedNum);
    }


   /* This method verifies the compliance based on the 
      Proof generated in the ZKProgram.
   */

   @method async verifyComplianceWithProof(proof: BusinessProcessIntegrityProof) { 
         // Ensure the state of `num` matches its current value
         this.risk.requireEquals(this.risk.get());
         const currentNum = this.risk.get();

         proof.verify();

         const out = proof.publicOutput.out;
         out.assertTrue();
         const updatedNum = currentNum.sub(10);

               // If this.risk is State<Field>, store newState.value
               this.risk.set(updatedNum);
               const finalNum = this.risk.get();
              
               Provable.asProver(() => {
                  console.log( 'final new state value  ',  finalNum.toJSON());
                });
      /*
         const newState = Provable.if(
               out, // out must be a Bool
               updatedNum,  // if out is true, use updatedNum
               currentNum   // if out is false, keep currentNum
          );
      */          
   }
}