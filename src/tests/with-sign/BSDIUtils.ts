import { Field, CircuitString, Poseidon, Signature } from 'o1js';
import { BusinessProcessIntegrityData } from '../../zk-programs/with-sign/BusinessProcessIntegrityZKProgramWithSign.js';
import { getPrivateKeyFor } from '../../core/OracleRegistry.js';
import parseBpmn from '../../utils/parsebpmn.js';

export async function processBusinessData(
    businessProcessType: string,
    expectedBPMNFileName: string,
    actualBPMNFileName: string
): Promise<{
    bpComplianceData: BusinessProcessIntegrityData;
    oracleSignature: Signature;
}> {
    try {
        // Parse BPMN files
        const expectedPath = await parseBpmn(expectedBPMNFileName) || "";
        const actualPath = await parseBpmn(actualBPMNFileName) || "";

        console.log("EXP:", expectedPath);
        console.log("ACT:", actualPath);

        // Create compliance data
        const bpComplianceData = new BusinessProcessIntegrityData({
            businessProcessID: Field(0),
            businessProcessType: CircuitString.fromString(businessProcessType),
            expectedContent: CircuitString.fromString(expectedPath),
            actualContent: CircuitString.fromString(actualPath),
            str: "String to print"
        });

        // Generate signature
        const complianceDataHash = Poseidon.hash(BusinessProcessIntegrityData.toFields(bpComplianceData));
        const registryPrivateKey = getPrivateKeyFor('BPMN');
        const oracleSignature = Signature.create(registryPrivateKey, [complianceDataHash]);

        return { bpComplianceData, oracleSignature };
    } catch (error) {
        console.error('Error processing business data:', error);
        throw error;
    }
}