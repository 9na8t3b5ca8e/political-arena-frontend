// frontend/src/components/CandidateFinanceWidget.js
import React, { useState, useEffect, useCallback } from 'react';
import { getFinanceLedger, spendCampaignFunds, donateToCandidate } from '../api';
import { DollarSign, Send, Landmark, X, Loader, AlertTriangle } from 'lucide-react';

// Small Modal Component for Forms
const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
            <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white">
                <X size={20} />
            </button>
            {children}
        </div>
    </div>
);

// Spend Funds Form
const SpendForm = ({ candidate, currentUser, setCurrentUser, onClose, setSuccess, setError }) => {
    const [amount, setAmount] = useState('');
    const [purpose, setPurpose] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsProcessing(true);
        try {
            const res = await spendCampaignFunds({
                candidateId: candidate.election_candidate_id,
                amount: parseFloat(amount),
                purpose: purpose,
            });
            setCurrentUser(prev => ({ ...prev, campaign_funds: res.newCampaignFunds }));
            setSuccess('Expenditure recorded successfully!');
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-bold text-blue-300">Spend Campaign Funds</h3>
            <p className="text-green-400 font-mono">Cash on Hand: ${currentUser.campaign_funds?.toLocaleString()}</p>
            <div>
                <label className="block text-sm font-medium text-gray-300">Amount</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required min="1" className="w-full bg-gray-900 p-2 rounded mt-1" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300">Purpose (e.g., "TV Ad Buy", "Rally in Springfield")</label>
                <input type="text" value={purpose} onChange={e => setPurpose(e.target.value)} required maxLength="100" className="w-full bg-gray-900 p-2 rounded mt-1" />
            </div>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="bg-gray-600 px-4 py-2 rounded">Cancel</button>
                <button type="submit" disabled={isProcessing} className="bg-blue-600 px-4 py-2 rounded disabled:bg-gray-500">
                    {isProcessing ? 'Spending...' : 'Confirm Expenditure'}
                </button>
            </div>
        </form>
    );
};

// Donate Form
const DonateForm = ({ candidate, currentUser, setCurrentUser, onClose, setSuccess, setError }) => {
    const [amount, setAmount] = useState('');
    const [source, setSource] = useState('individual'); // Add PAC logic later
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsProcessing(true);
        try {
            const res = await donateToCandidate({
                candidateId: candidate.election_candidate_id,
                amount: parseFloat(amount),
                source,
            });
            if (candidate.user_id === currentUser.id) {
                setCurrentUser(prev => ({ ...prev, campaign_funds: res.newCampaignFunds }));
            }
            setSuccess(`Successfully donated $${amount} to ${candidate.first_name} ${candidate.last_name}.`);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-bold text-teal-300">Donate to {candidate.first_name} {candidate.last_name}</h3>
            <div>
                <label className="block text-sm font-medium text-gray-300">Amount</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required min="1" className="w-full bg-gray-900 p-2 rounded mt-1" />
            </div>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="bg-gray-600 px-4 py-2 rounded">Cancel</button>
                <button type="submit" disabled={isProcessing} className="bg-teal-600 px-4 py-2 rounded disabled:bg-gray-500">
                    {isProcessing ? 'Donating...' : 'Confirm Donation'}
                </button>
            </div>
        </form>
    );
}

export default function CandidateFinanceWidget({ candidate, currentUser, setCurrentUser, onClose }) {
    const [ledger, setLedger] = useState({ contributions: [], expenditures: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showSpendModal, setShowSpendModal] = useState(false);
    const [showDonateModal, setShowDonateModal] = useState(false);
    
    const isOwner = currentUser.id === candidate.user_id;

    const fetchLedger = useCallback(async () => {
        if (!candidate?.election_candidate_id) {
            setError("Candidate ID is missing.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const data = await getFinanceLedger(candidate.election_candidate_id);
            setLedger(data);
        } catch (err) {
            console.error("Failed to fetch finance ledger:", err);
            setError(`Failed to load financial data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [candidate?.election_candidate_id]);

    useEffect(() => {
        fetchLedger();
    }, [fetchLedger]);

    const clearMessages = () => {
        setError('');
        setSuccess('');
    };

    if (loading) {
        return <div className="p-4 bg-gray-700/50 rounded-lg mt-2 text-center text-gray-400"><Loader className="animate-spin inline-block mr-2" />Loading financial data...</div>;
    }

    if (error) {
         return <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg mt-2 text-center text-red-300">
            <AlertTriangle className="inline-block mr-2" /> {error}
        </div>;
    }

    return (
        <div className="p-4 bg-gray-700/50 rounded-lg mt-2 space-y-4 relative">
            <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-white"><X size={18}/></button>
            <h3 className="text-lg font-bold text-gray-100 border-b border-gray-600 pb-2">
                Financials for {candidate.first_name} {candidate.last_name}
            </h3>
            
            {success && <div className="bg-green-500/20 text-green-300 p-2 rounded text-sm">{success}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                 <div className="bg-gray-800 p-3 rounded-lg text-center">
                    <p className="text-sm text-gray-400">Cash on Hand</p>
                    <p className="text-2xl font-bold text-green-400">${candidate.campaign_funds?.toLocaleString()}</p>
                </div>
                <div className="md:col-span-2 flex justify-center md:justify-end gap-2">
                    <button onClick={() => { clearMessages(); setShowDonateModal(true); }} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded-lg text-sm font-semibold">
                        <Landmark size={16} /> Donate
                    </button>
                    {isOwner && (
                         <button onClick={() => { clearMessages(); setShowSpendModal(true); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-semibold">
                            <Send size={16} /> Spend Funds
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contributions */}
                <div className="space-y-2">
                    <h4 className="font-semibold text-gray-200">Recent Contributions</h4>
                    <div className="bg-gray-800 p-3 rounded-lg max-h-48 overflow-y-auto text-sm space-y-2">
                        {ledger.contributions.length > 0 ? ledger.contributions.map(c => (
                            <div key={c.id} className="flex justify-between items-center text-gray-300">
                                <div>
                                    <span className="font-medium">{c.source === 'pac' ? c.pac_name : c.donor_name}</span>
                                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${c.source === 'pac' ? 'bg-purple-500/50' : 'bg-blue-500/50'}`}>
                                        {c.source}
                                    </span>
                                </div>
                                <span className="font-mono text-green-400">+${parseFloat(c.amount).toLocaleString()}</span>
                            </div>
                        )) : <p className="text-gray-500">No contributions yet.</p>}
                    </div>
                </div>
                {/* Expenditures */}
                <div className="space-y-2">
                    <h4 className="font-semibold text-gray-200">Recent Expenditures</h4>
                     <div className="bg-gray-800 p-3 rounded-lg max-h-48 overflow-y-auto text-sm space-y-2">
                        {ledger.expenditures.length > 0 ? ledger.expenditures.map(e => (
                             <div key={e.id} className="flex justify-between items-center text-gray-300">
                                <span className="flex-1 pr-2 truncate" title={e.purpose}>{e.purpose}</span>
                                <span className="font-mono text-red-400">-${parseFloat(e.amount).toLocaleString()}</span>
                            </div>
                        )) : <p className="text-gray-500">No expenditures yet.</p>}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showSpendModal && isOwner && <Modal onClose={() => setShowSpendModal(false)}><SpendForm {...{ candidate, currentUser, setCurrentUser, setSuccess, setError }} onClose={() => setShowSpendModal(false)} /></Modal>}
            {showDonateModal && <Modal onClose={() => setShowDonateModal(false)}><DonateForm {...{ candidate, currentUser, setCurrentUser, setSuccess, setError }} onClose={() => setShowDonateModal(false)} /></Modal>}
        </div>
    );
}