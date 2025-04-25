import { Mina, PrivateKey, PublicKey, Field, Poseidon, Signature } from 'o1js';

export const AuthorityRegistry = new Map<string, { 
  publicKey: PublicKey,
  privateKey: PrivateKey 
}>();

// Initialize registry with test accounts
export function initializeRegistry(testAccounts: {key: PrivateKey}[]) {
  AuthorityRegistry.set('MCA', {
    publicKey: testAccounts[0].key.toPublicKey(),
    privateKey: testAccounts[0].key
  });
  
  AuthorityRegistry.set('GLEIF', {
    publicKey: testAccounts[1].key.toPublicKey(),
    privateKey: testAccounts[1].key
  });

  AuthorityRegistry.set('EXIM', {
    publicKey: testAccounts[2].key.toPublicKey(),
    privateKey: testAccounts[2].key
  });
}

export function getAuthorityKeys(authority: string) {
  const keys = AuthorityRegistry.get(authority);
  if (!keys) throw new Error(`Authority ${authority} not registered`);
  return keys;
}

