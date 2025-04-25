import { Field, SmartContract, state, State, method } from 'o1js';
import { LiquidityRatioProof } from '../../zk-programs/with-sign/RiskLiquidityACTUSZKProgram_basel3_Withsign.js';


export class LiquidityRatioVerifierSmartContract extends SmartContract {
   @state(Field) num = State<Field>(); // State variable to hold a number
   // Initialize the contract state
   init() {
      super.init(); // Call the parent class initializer
      this.num.set(Field(100)); // Set initial value of `num` to 100
   }



   // Method to verify compliance and update state
   @method async verifyComplianceWithProof(proof: LiquidityRatioProof) {


      // Ensure the state of `num` matches its current value
      this.num.requireEquals(this.num.get());
      const currentNum = this.num.get();

      proof.verify();
      const out = proof.publicOutput.out;
      //console.log("out from smart contract",out);                        
      out.assertTrue();

      // Update the state
      const updatedNum = currentNum.sub(10);
      this.num.set(updatedNum);

   }
}


