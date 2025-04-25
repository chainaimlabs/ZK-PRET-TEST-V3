import { SmartContract, method, State, state, Field, } from 'o1js';
import { ComposedProof } from '../../zk-programs/with-sign/Composed3levelZKProgramWithSign.js';

export class ComplianceVerifierSC extends SmartContract {
   @state(Field) verificationState = State<Field>();

   init() {
      super.init();
      this.verificationState.set(Field(100)); // Initial valid state
   }
   //
   @method async verifyMaster(proof: ComposedProof) {
      proof.verify();
      const currentState = this.verificationState.get();
      this.verificationState.requireEquals(currentState);

      //const output = proof.publicOutput;
      // output.complianceStatus.assertEquals(Field(1));
      // output.authorityChain.assertEquals(Field(6)); // MCA(1) + GLEIF(2) + EXIM(3)

      // Update state with new composite hash
      const newState = currentState.sub(10);
      this.verificationState.set(newState);
   }
}
