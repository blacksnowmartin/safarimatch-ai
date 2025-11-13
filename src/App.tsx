import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Web3Modal from 'web3modal';
import { BrowserProvider } from 'ethers';
import { dot, norm } from 'mathjs';
import { mockProfiles } from './mockProfiles';

interface Profile {
  skills: string;
  interests: string;
  location: string;
}

interface MatchProfile extends Profile {
  wallet: string;
  score: number;
}

const getVector = (text: string): number[] => {
  return text.split(',').map(s => s.trim().length);
};

const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  const dotProduct = dot(vecA, vecB) as number;
  const normA = norm(vecA) as number;
  const normB = norm(vecB) as number;
  return dotProduct / (normA * normB);
};

const findMatches = (userProfile: Profile): MatchProfile[] => {
  const userVec = getVector(userProfile.skills + ',' + userProfile.interests);
  return mockProfiles
    .map((p: Profile & { wallet: string }) => ({
      ...p,
      score: cosineSimilarity(userVec, getVector(p.skills + ',' + p.interests))
    }))
    .sort((a: MatchProfile, b: MatchProfile) => b.score - a.score)
    .slice(0, 3);
};

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>({
    skills: '',
    interests: '',
    location: ''
  });
  const [matches, setMatches] = useState<MatchProfile[]>([]);

  const connectWallet = async () => {
    try {
      const web3Modal = new Web3Modal({ network: 'mainnet', cacheProvider: true });
      const instance = await web3Modal.connect();
      const provider = new BrowserProvider(instance);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleSubmit = () => {
    const foundMatches = findMatches(profile);
    setMatches(foundMatches);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>SafariMatch AI</h1>
        
        {!account ? (
          <button onClick={connectWallet}>Connect Wallet</button>
        ) : (
          <div>
            <p>Connected: {account.slice(0, 6)}...</p>
            
            <div style={{ marginTop: '20px' }}>
              <input
                placeholder="Skills (comma-separated)"
                value={profile.skills}
                onChange={e => setProfile({...profile, skills: e.target.value})}
                style={{ margin: '5px', padding: '8px' }}
              />
              <input
                placeholder="Interests"
                value={profile.interests}
                onChange={e => setProfile({...profile, interests: e.target.value})}
                style={{ margin: '5px', padding: '8px' }}
              />
              <input
                placeholder="Location"
                value={profile.location}
                onChange={e => setProfile({...profile, location: e.target.value})}
                style={{ margin: '5px', padding: '8px' }}
              />
              <button onClick={handleSubmit} style={{ margin: '5px', padding: '8px' }}>
                Submit Profile & Find Matches
              </button>
            </div>

            {matches.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h2>Top Matches:</h2>
                <ul style={{ textAlign: 'left' }}>
                  {matches.map((m: MatchProfile) => (
                    <li key={m.wallet}>
                      Match: {m.wallet} (Score: {m.score.toFixed(2)})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
