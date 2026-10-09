import React, { useState, useEffect } from 'react';
import { X, Plus, Check, DollarSign, Wallet, ShieldAlert } from 'lucide-react';
import {
  AssetItem,
  LiabilityItem,
  AssetCategory,
  LiabilityCategory,
  LiquidityStatus,
  TaxTreatment,
  CurrencyCode,
} from '../types/worth';

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyCode;
  editingItem: { type: 'asset'; item: AssetItem } | { type: 'liability'; item: LiabilityItem } | null;
  onSaveAsset: (asset: AssetItem) => void;
  onSaveLiability: (liability: LiabilityItem) => void;
}

export const AddEditModal: React.FC<AddEditModalProps> = ({
  isOpen,
  onClose,
  currency,
  editingItem,
  onSaveAsset,
  onSaveLiability,
}) => {
  const [mode, setMode] = useState<'asset' | 'liability'>('asset');

  // Asset Form State
  const [assetName, setAssetName] = useState('');
  const [assetCategory, setAssetCategory] = useState<AssetCategory>('investments');
  const [assetInstitution, setAssetInstitution] = useState('');
  const [assetValue, setAssetValue] = useState('');
  const [assetLiquidity, setAssetLiquidity] = useState<LiquidityStatus>('liquid');
  const [assetTax, setAssetTax] = useState<TaxTreatment>('taxable');
  const [assetNotes, setAssetNotes] = useState('');

  // Liability Form State
  const [liabilityName, setLiabilityName] = useState('');
  const [liabilityCategory, setLiabilityCategory] = useState<LiabilityCategory>('mortgage');
  const [liabilityLender, setLiabilityLender] = useState('');
  const [liabilityBalance, setLiabilityBalance] = useState('');
  const [liabilityApr, setLiabilityApr] = useState('');
  const [liabilityPayment, setLiabilityPayment] = useState('');
  const [liabilityPayoffDate, setLiabilityPayoffDate] = useState('');
  const [liabilityNotes, setLiabilityNotes] = useState('');

  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (editingItem) {
      if (editingItem.type === 'asset') {
        setMode('asset');
        const a = editingItem.item;
        setAssetName(a.name);
        setAssetCategory(a.category);
        setAssetInstitution(a.institution);
        setAssetValue(a.value.toString());
        setAssetLiquidity(a.liquidity);
        setAssetTax(a.taxTreatment);
        setAssetNotes(a.notes || '');
      } else {
        setMode('liability');
        const l = editingItem.item;
        setLiabilityName(l.name);
        setLiabilityCategory(l.category);
        setLiabilityLender(l.lender);
        setLiabilityBalance(l.balance.toString());
        setLiabilityApr(l.interestRate.toString());
        setLiabilityPayment(l.monthlyPayment.toString());
        setLiabilityPayoffDate(l.payoffTargetDate || '');
        setLiabilityNotes(l.notes || '');
      }
    } else {
      // reset form
      setAssetName('');
      setAssetCategory('investments');
      setAssetInstitution('');
      setAssetValue('');
      setAssetLiquidity('liquid');
      setAssetTax('taxable');
      setAssetNotes('');

      setLiabilityName('');
      setLiabilityCategory('mortgage');
      setLiabilityLender('');
      setLiabilityBalance('');
      setLiabilityApr('');
      setLiabilityPayment('');
      setLiabilityPayoffDate('');
      setLiabilityNotes('');
    }
    setFormError('');
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const todayStr = new Date().toISOString().slice(0, 10);

    if (mode === 'asset') {
      if (!assetName.trim()) {
        setFormError('Asset name is required.');
        return;
      }
      const val = parseFloat(assetValue);
      if (isNaN(val) || val < 0) {
        setFormError('Please enter a valid asset valuation amount.');
        return;
      }

      const assetPayload: AssetItem = {
        id: editingItem && editingItem.type === 'asset' ? editingItem.item.id : `ast-${Date.now()}`,
        name: assetName.trim(),
        category: assetCategory,
        institution: assetInstitution.trim() || 'Direct Holding',
        value: val,
        currency,
        liquidity: assetLiquidity,
        taxTreatment: assetTax,
        notes: assetNotes.trim() || undefined,
        updatedDate: todayStr,
      };

      onSaveAsset(assetPayload);
      onClose();
    } else {
      if (!liabilityName.trim()) {
        setFormError('Liability name is required.');
        return;
      }
      const bal = parseFloat(liabilityBalance);
      if (isNaN(bal) || bal < 0) {
        setFormError('Please enter a valid loan or debt balance.');
        return;
      }
      const apr = parseFloat(liabilityApr) || 0;
      const payment = parseFloat(liabilityPayment) || 0;

      const liabilityPayload: LiabilityItem = {
        id: editingItem && editingItem.type === 'liability' ? editingItem.item.id : `lia-${Date.now()}`,
        name: liabilityName.trim(),
        category: liabilityCategory,
        lender: liabilityLender.trim() || 'Direct Lender',
        balance: bal,
        currency,
        interestRate: apr,
        monthlyPayment: payment,
        payoffTargetDate: liabilityPayoffDate.trim() || undefined,
        notes: liabilityNotes.trim() || undefined,
        updatedDate: todayStr,
      };

      onSaveLiability(liabilityPayload);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg rounded-xl border border-slate-800 bg-[#0f172a] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 id="modal-title" className="text-base font-bold text-white tracking-tight">
              {editingItem
                ? `Edit ${editingItem.type === 'asset' ? 'Asset' : 'Liability'}`
                : 'Add Balance Sheet Position'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector (Asset vs Liability) - only if creating new */}
        {!editingItem && (
          <div className="p-3 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setMode('asset');
                setFormError('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'asset'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Asset (+Equity)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('liability');
                setFormError('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'liability'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Liability / Debt (-Equity)</span>
            </button>
          </div>
        )}

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {formError && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {formError}
            </div>
          )}

          {mode === 'asset' ? (
            /* ASSET FIELDS */
            <>
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Holding / Asset Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vanguard Total Stock Market (VTSAX)"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Asset Class
                  </label>
                  <select
                    value={assetCategory}
                    onChange={(e) => setAssetCategory(e.target.value as AssetCategory)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="investments">Stocks & Equities</option>
                    <option value="cash">Cash & Equivalents</option>
                    <option value="real_estate">Real Estate & Property</option>
                    <option value="crypto">Crypto & Digital Assets</option>
                    <option value="alternatives">Alternative & Private Equity</option>
                    <option value="vehicles">Vehicles & Physical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Current Valuation ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 50000"
                    value={assetValue}
                    onChange={(e) => setAssetValue(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Institution / Custody
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vanguard, Chase, Hardware Vault"
                    value={assetInstitution}
                    onChange={(e) => setAssetInstitution(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Liquidity Horizon
                  </label>
                  <select
                    value={assetLiquidity}
                    onChange={(e) => setAssetLiquidity(e.target.value as LiquidityStatus)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="liquid">Liquid (&lt;7 days cash/brokerage)</option>
                    <option value="semi_liquid">Semi-Liquid (Retirement/CD)</option>
                    <option value="illiquid">Illiquid (Real Estate/Venture)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Tax Treatment
                </label>
                <select
                  value={assetTax}
                  onChange={(e) => setAssetTax(e.target.value as TaxTreatment)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="taxable">Taxable (Standard Brokerage / Checking)</option>
                  <option value="tax_advantaged">Tax-Advantaged (Traditional 401k / Traditional IRA)</option>
                  <option value="tax_free">Tax-Free (Roth IRA / HSA)</option>
                  <option value="not_applicable">Not Applicable</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Notes & Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Low cost index portfolio, rebalanced semi-annually"
                  value={assetNotes}
                  onChange={(e) => setAssetNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </>
          ) : (
            /* LIABILITY FIELDS */
            <>
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Liability Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Primary Residence 30-Yr Mortgage"
                  value={liabilityName}
                  onChange={(e) => setLiabilityName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Debt Category
                  </label>
                  <select
                    value={liabilityCategory}
                    onChange={(e) => setLiabilityCategory(e.target.value as LiabilityCategory)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="mortgage">Mortgage</option>
                    <option value="auto_loan">Auto Financing</option>
                    <option value="student_loan">Student Loan</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="personal_loan">Personal Line of Credit</option>
                    <option value="other_debt">Other Liability</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Outstanding Balance ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 450000"
                    value={liabilityBalance}
                    onChange={(e) => setLiabilityBalance(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Lender / Creditor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Wells Fargo"
                    value={liabilityLender}
                    onChange={(e) => setLiabilityLender(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Interest Rate (% APR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 3.25"
                    value={liabilityApr}
                    onChange={(e) => setLiabilityApr(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Monthly Payment
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 2100"
                    value={liabilityPayment}
                    onChange={(e) => setLiabilityPayment(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Target Payoff Date (Optional)
                </label>
                <input
                  type="date"
                  value={liabilityPayoffDate}
                  onChange={(e) => setLiabilityPayoffDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 30-year fixed, refinanced in 2021"
                  value={liabilityNotes}
                  onChange={(e) => setLiabilityNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>
            </>
          )}

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-slate-950 ${
                mode === 'asset'
                  ? 'bg-emerald-400 hover:bg-emerald-300'
                  : 'bg-rose-400 hover:bg-rose-300'
              }`}
            >
              {editingItem ? 'Update Position' : `Add ${mode === 'asset' ? 'Asset' : 'Liability'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
