import { Field, Mina, PrivateKey, AccountUpdate, CircuitString, Poseidon, Signature } from 'o1js';
import { BusinessProcessIntegrityZKProgram, BusinessProcessIntegrityData, BusinessProcessIntegrityProof } from '../../zk-programs/with-sign/BusinessProcessIntegrityZKProgramWithSign.js';
import { BusinessProcessIntegrityVerifierSmartContract } from '../../contracts/with-sign/BusinessProcessIntegrityVerifierSmartContractWithSign.js';
import { processBusinessData } from './BSDIUtils.js';

// Keep original imports as comments
/*
import axios from 'axios';
import { exec } from 'child_process';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import parseBpmn from '../../utils/parsebpmn.js';
*/

const [, , businessProcessType, expectedBPMNFileName, actualBPMNFileName, outputFileName] = process.argv;

// Keep original logging
console.log('Expected BPMN File Name:', expectedBPMNFileName);
console.log('Actual BPMN File Name:', actualBPMNFileName);
console.log('Output File Name:', outputFileName);

// Comment out original runPythonScript function but keep for reference
/*
function runPythonScript(fileName: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(`python3 src/utils/parse_bpmn.py ${fileName}`, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout.trim());
        });
    });
}
*/

async function main() {
    const useProof = false;
    const Local = await Mina.LocalBlockchain({ proofsEnabled: useProof });
    Mina.setActiveInstance(Local);

    // Setup accounts
    const deployerAccount = Local.testAccounts[0];
    const deployerKey = deployerAccount.key;
    const senderAccount = Local.testAccounts[1];
    const senderKey = senderAccount.key;

    // Compile and deploy
    await BusinessProcessIntegrityZKProgram.compile();
    const { verificationKey } = await BusinessProcessIntegrityVerifierSmartContract.compile();
    
    // Add zkApp deployment code
    const zkAppKey = PrivateKey.random();
    const zkAppAddress = zkAppKey.toPublicKey();
    const zkApp = new BusinessProcessIntegrityVerifierSmartContract(zkAppAddress);

    // Deploy contract
    const deployTxn = await Mina.transaction(deployerAccount, async () => {
        AccountUpdate.fundNewAccount(deployerAccount);
        await zkApp.deploy({ verificationKey });
    });
    await deployTxn.sign([deployerKey, zkAppKey]).send();
    console.log("Contract deployed successfully");

    // New implementation using utility function
    try {
        const { bpComplianceData, oracleSignature } = await processBusinessData(
            businessProcessType,
            expectedBPMNFileName,
            actualBPMNFileName
        );

        // Generate proof based on business process type
        let proof: BusinessProcessIntegrityProof;
        switch(businessProcessType) {
            case 'STABLECOIN':
                proof = await BusinessProcessIntegrityZKProgram.proveComplianceSTABLECOIN(
                    Field(0), bpComplianceData, oracleSignature
                );
                break;
            case 'SCF':
                proof = await BusinessProcessIntegrityZKProgram.proveComplianceSCF(
                    Field(0), bpComplianceData, oracleSignature
                );
                break;
            case 'DVP':
                proof = await BusinessProcessIntegrityZKProgram.proveComplianceDVP(
                    Field(0), bpComplianceData, oracleSignature
                );
                break;
            default:
                proof = await BusinessProcessIntegrityZKProgram.proveComplianceSCF(
                    Field(0), bpComplianceData, oracleSignature
                );
        }

        // Verify proof
        const txn = await Mina.transaction(senderAccount, async () => {
            await zkApp.verifyComplianceWithProof(proof);
        });

        await txn.prove();
        await txn.sign([senderKey]).send();

        console.log("Final value of risk:", zkApp.risk.get().toJSON());
        console.log('✅ Proof verified successfully!');

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Keep original error handling
main().catch(console.error);