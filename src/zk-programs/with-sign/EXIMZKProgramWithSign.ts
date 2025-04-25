import {
   Field,
   Signature,
   SmartContract,
   Struct,
   ZkProgram,
   Proof,
   CircuitString,
   method,
   Poseidon,
} from 'o1js';
import { getPublicKeyFor } from '../../core/OracleRegistry.js';

// =================================== Compliance Data Definition ===================================
export class EXIMComplianceData extends Struct({
   iec: CircuitString,
   entityName: CircuitString,
   addressLine1: CircuitString,
   addressLine2: CircuitString,
   city: CircuitString,
   state: CircuitString,
   pin: Field,
   contactNo: Field,
   email: CircuitString,
   iecIssueDate: CircuitString,
   exporterType: Field,
   pan: CircuitString,
   iecStatus: Field,
   activeComplianceStatusCode: Field,
   starStatus: Field,
   iecModificationDate: CircuitString,
   dataAsOn: CircuitString,
   natureOfConcern: Field,
   branchCode: Field,
   badd1: CircuitString,
   badd2: CircuitString,
   branchCity: CircuitString,
   branchState: CircuitString,
   branchPin: Field,
   director1Name: CircuitString,
   director2Name: CircuitString,
}) { }

// ========================== Public Output Structure Definition ========================================
export class EXIMPublicOutput extends Struct({
   entityName: CircuitString,
   iec: CircuitString,
}) { }

// =================================== ZkProgram Definition ===================================
export const EXIM = ZkProgram({
   name: 'EXIM',
   publicInput: Field,
   publicOutput: EXIMPublicOutput,

   methods: {
      proveCompliance: {
         privateInputs: [EXIMComplianceData, Signature], // Include Signature for oracle verification
         async method(
            EXIMToProve: Field,
            EXIMData: EXIMComplianceData,
            oracleSignature: Signature // Oracle Signature
         ): Promise<EXIMPublicOutput> {

            //console.log('Data before compliance check - Company Name:', EXIMData.entityName.toString, 'IEC Status:', EXIMData.iecStatus.toString);

            // =================================== Oracle Signature Verification ===================================
            // Hash the compliance data
            const complianceDataHash = Poseidon.hash(EXIMComplianceData.toFields(EXIMData));

            // Get the oracle's public key
            const registryPublicKey = getPublicKeyFor('EXIM');

            // Verify the oracle's signature
            const isValidSignature = oracleSignature.verify(registryPublicKey, [complianceDataHash]);
            isValidSignature.assertTrue();
            // //---------------------------------------------------------------------------------------------------
            // // Compliance check: Verify that IEC status is active
            // // Define compliance statuses
            // const normalStatus = Field(0);
            // const clearFromBlackList = Field(4);
            // const revokeSuspension = Field(7);
            // const revokeCancellation = Field(8);

            // // Check for compliant IEC statuses
            // EXIMData.iecStatus
            //   .equals(normalStatus)
            //   .or(EXIMData.iecStatus.equals(clearFromBlackList))
            //   .or(EXIMData.iecStatus.equals(revokeSuspension))
            //   .or(EXIMData.iecStatus.equals(revokeCancellation))
            //   .assertTrue(); // Ensures the IEC status is compliant

            // // Check for non-compliant IEC statuses
            // EXIMData.iecStatus
            //   .equals(Field(1)) // BLACK LISTED
            //   .or(EXIMData.iecStatus.equals(Field(2))) // SUSPENDED
            //   .or(EXIMData.iecStatus.equals(Field(3))) // CANCELLED
            //   .assertFalse(); // Ensures the IEC status is compliant

            // //console.log('Data after compliance check - Company Name:', EXIMData.entityName.toString, 'IEC Status:', EXIMData.iecStatus.toString);
            //---------------------------------------------------------------------------------------------------

            const activeStatusCode = Field.from(1);
            const inactiveStatusCode = Field.from(0);

            EXIMData.activeComplianceStatusCode.assertEquals(activeStatusCode);
            EXIMData.activeComplianceStatusCode.assertNotEquals(inactiveStatusCode);


            return new EXIMPublicOutput({
               entityName: EXIMData.entityName,
               iec: EXIMData.iec,
            });
         },
      },
   },
});

export class EXIMProof extends ZkProgram.Proof(EXIM) { }
