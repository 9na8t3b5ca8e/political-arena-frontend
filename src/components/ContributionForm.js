// frontend/src/components/ContributionForm.js
import React, { useState } from 'react';
import { donateToCandidate } from '../api';
import { XCircle } from 'lucide-react';

export default function ContributionForm({ candidate, currentUser, setCurrentUser, onClose, setSuccessMessage, setErrorMessage }) {
    const [amount, setAmount] = useState('');
    const [source, setSource] = useState('individual');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setIsProcessing(true);

        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setErrorMessage('Please enter a valid, positive amount.');
            setIsProcessing(false);
            return;
        }

        try {
            const res = await donateToCandidate({
                candidateId: candidate.election_candidate_id,
                amount: numericAmount,
                source,
            });
            setSuccessMessage(res.message);
            // If the donor is the current user, update their funds (e.g. self-funding)
            // This assumes self-funding is tracked like any other donation source
            if (candidate.user_id === currentUser.id) {
               setCurrentUser(prev => ({ ...prev, campaign_funds: res.newCampaignFunds }));
            }
            onClose();
        } catch (err) {
            setErrorMessage(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-700 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-100">
                Donate to {candidate.first_name} {candidate.last_name}
            </h4>
            
            {/* TODO: Add a check here for whether the current user has a PAC */}
            {/* <div className="text-sm">
                <label className="mr-4">
                    <input type="radio" name="source" value="individual" checked={source === 'individual'} onChange={() => setSource('individual')} className="mr-2"/>
                    Individual
                </label>
                <label>
                    <input type="radio" name="source" value="pac" checked={source === 'pac'} onChange={() => setSource('pac')} className="mr-2"/>
                    PAC
                </label>
            </div> */}

            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">Amount ($)</label>
                <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="25"
                    min="1"
                    step="any"
                    required
                />
            </div>
            <div className="flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-md bg-gray-600 hover:bg-gray-500">Cancel</button>
                <button type="submit" disabled={isProcessing} className="px-4 py-2 text-sm rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800">
                    {isProcessing ? 'Processing...' : 'Confirm Donation'}
                </button>
            </div>
        </form>
    );
}