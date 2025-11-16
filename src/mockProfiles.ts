export interface Profile {
  wallet: string;
  username: string;
  skills: string;
  interests: string;
  location: string;
}

export const mockProfiles: Profile[] = [
  { wallet: '0x1a2b3c...', username: 'DeFiBuilder', skills: 'solidity,react,defi', interests: 'rwa,africa,tokenization', location: 'kenya' },
  { wallet: '0x4d5e6f...', username: 'UXDesigner', skills: 'design,ux,figma', interests: 'web3,ui,community', location: 'nigeria' },
  { wallet: '0x7g8h9i...', username: 'AIMaster', skills: 'ai,python,machine-learning', interests: 'blockchain,defi,prediction', location: 'south-africa' },
  { wallet: '0xj0k1l2...', username: 'Layer2Dev', skills: 'solidity,hardhat,foundry', interests: 'layer2,scaling', location: 'ghana' },
  { wallet: '0xm3n4o5...', username: 'FrontendPro', skills: 'react,nextjs,web3js', interests: 'dapps,frontend', location: 'ethiopia' },
  { wallet: '0xp6q7r8...', username: 'SolanaDev', skills: 'rust,solana,anchor', interests: 'cross-chain,interoperability', location: 'tanzania' },
  { wallet: '0xs9t0u1...', username: 'BackendGuru', skills: 'nodejs,express,graphql', interests: 'backend,apis', location: 'uganda' },
  { wallet: '0xv2w3x4...', username: 'SecurityAuditor', skills: 'security,audits,slither', interests: 'smart-contracts,safety', location: 'morocco' },
  { wallet: '0xy5z6a7...', username: 'GrowthHacker', skills: 'marketing,growth,community', interests: 'web3,adoption', location: 'egypt' },
  { wallet: '0xb8c9d0...', username: 'DAOVoter', skills: 'governance,daos,snapshot', interests: 'decentralization,voting', location: 'rwanda' }
];