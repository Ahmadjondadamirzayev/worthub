import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  ExternalLink,
  Check,
  X,
  Layers,
} from 'lucide-react';
import {
  AssetItem,
  AssetCategory,
  CurrencyCode,
  LiquidityStatus,
  TaxTreatment,
} from '../types/worth';
import { formatCurrency, ASSET_CATEGORY_META } from '../utils/formatters';

interface AssetsViewProps {
  assets: AssetItem[];
  currency: CurrencyCode;
  initialCategory?: AssetCategory | 'all';
  onAddAsset: () => void;
  onEditAsset: (asset: AssetItem) => void;
  onDeleteAsset: (id: string) => void;
  onQuickUpdateValue: (id: string, newValue: number) => void;
}

export const AssetsView: React.FC<AssetsViewProps> = ({
  assets,
  currency,
  initialCategory = 'all',
  onAddAsset,
  onEditAsset,
  onDeleteAsset,
  onQuickUpdateValue,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'all'>(
    initialCategory
  );
  const [selectedLiquidity, setSelectedLiquidity] = useState<LiquidityStatus | 'all'>('all');
  const [selectedTax, setSelectedTax] = useState<TaxTreatment | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValueText, setEditValueText] = useState('');

  const totalAssetsSum = assets.reduce((sum, item) => sum + item.value, 0);

  const filteredAssets = assets.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedLiquidity !== 'all' && item.liquidity !== selectedLiquidity) return false;
    if (selectedTax !== 'all' && item.taxTreatment !== selectedTax) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchInst = item.institution.toLowerCase().includes(q);
      const matchNotes = item.notes?.toLowerCase().includes(q);
      if (!matchName && !matchInst && !matchNotes) return false;
    }
    return true;
  });

  const filteredSum = filteredAssets.reduce((sum, item) => sum + item.value, 0);

  const handleStartQuickEdit = (asset: AssetItem) => {
    setEditingId(asset.id);
    setEditValueText(asset.value.toString());
  };

  const handleSaveQuickEdit = (id: string) => {
    const parsed = parseFloat(editValueText);
    if (!isNaN(parsed) && parsed >= 0) {
      onQuickUpdateValue(id, parsed);
    }
    setEditingId(null);
  };

  const categories: Array<{ id: AssetCategory | 'all'; label: string }> = [
    { id: 'all', label: 'All Holdings' },
    { id: 'cash', label: 'Cash & Cash Eq.' },
    { id: 'investments', label: 'Stocks & Funds' },
    { id: 'real_estate', label: 'Real Estate' },
    { id: 'crypto', label: 'Crypto & Digital' },
    { id: 'alternatives', label: 'Private & Alts' },
    { id: 'vehicles', label: 'Vehicles' },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Assets & Capital Holdings
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>{assets.length} total holdings</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-emerald-400">
              Total {formatCurrency(totalAssetsSum, currency)}
            </span>
          </div>
        </div>

        <button
          onClick={onAddAsset}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Asset</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#111827]/70 backdrop-blur-md space-y-3">
        {/* Category segmented filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((c) => {
            const isActive = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Second row: Search & secondary filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-slate-800/80">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by asset name, ticker, or institution..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label="Filter by Liquidity"
              value={selectedLiquidity}
              onChange={(e) => setSelectedLiquidity(e.target.value as LiquidityStatus | 'all')}
              className="bg-slate-900 text-xs text-slate-300 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500/60 cursor-pointer"
            >
              <option value="all">All Liquidity</option>
              <option value="liquid">Liquid (&lt;7 days)</option>
              <option value="semi_liquid">Semi-Liquid</option>
              <option value="illiquid">Illiquid (Property/Equity)</option>
            </select>

            <select
              aria-label="Filter by Tax Treatment"
              value={selectedTax}
              onChange={(e) => setSelectedTax(e.target.value as TaxTreatment | 'all')}
              className="bg-slate-900 text-xs text-slate-300 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500/60 cursor-pointer"
            >
              <option value="all">All Tax Types</option>
              <option value="taxable">Taxable</option>
              <option value="tax_advantaged">Tax-Advantaged (401k/IRA)</option>
              <option value="tax_free">Tax-Free (Roth/HSA)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="rounded-xl border border-slate-800 bg-[#111827]/70 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono">
                <th className="py-3 px-4 font-medium">Asset & Details</th>
                <th className="py-3 px-4 font-medium">Institution / Custody</th>
                <th className="py-3 px-4 font-medium">Class & Tax</th>
                <th className="py-3 px-4 font-medium">Liquidity</th>
                <th className="py-3 px-4 font-medium text-right">Valuation</th>
                <th className="py-3 px-4 font-medium text-right">Weight</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => {
                  const meta = ASSET_CATEGORY_META[asset.category];
                  const weightPct =
                    totalAssetsSum > 0 ? (asset.value / totalAssetsSum) * 100 : 0;
                  const isEditingThis = editingId === asset.id;

                  return (
                    <tr
                      key={asset.id}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Asset Name and Notes */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
                          {asset.name}
                        </div>
                        {asset.notes && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                            {asset.notes}
                          </div>
                        )}
                      </td>

                      {/* Institution */}
                      <td className="py-3.5 px-4 text-slate-300">
                        {asset.institution}
                      </td>

                      {/* Class & Tax */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: meta.color }}
                          />
                          <span>{meta.label.split('&')[0].trim()}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 capitalize mt-0.5">
                          {asset.taxTreatment.replace('_', ' ')}
                        </div>
                      </td>

                      {/* Liquidity */}
                      <td className="py-3.5 px-4">
                        <span className="text-slate-400 capitalize">
                          {asset.liquidity.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Valuation with inline quick editing */}
                      <td className="py-3.5 px-4 text-right">
                        {isEditingThis ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <input
                              type="number"
                              value={editValueText}
                              onChange={(e) => setEditValueText(e.target.value)}
                              className="w-28 bg-slate-900 border border-emerald-500 rounded px-2 py-1 text-xs text-right text-white font-mono"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveQuickEdit(asset.id);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                            />
                            <button
                              onClick={() => handleSaveQuickEdit(asset.id)}
                              className="p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                              title="Save"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 text-slate-500 hover:text-slate-300 cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleStartQuickEdit(asset)}
                            title="Click to quick-update value"
                            className="font-mono font-bold text-slate-100 tabular-nums cursor-pointer hover:text-emerald-400 transition-colors inline-block"
                          >
                            {formatCurrency(asset.value, currency)}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          As of {asset.updatedDate}
                        </div>
                      </td>

                      {/* Weight % */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400 tabular-nums">
                        {weightPct.toFixed(1)}%
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditAsset(asset)}
                            className="p-1.5 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit Holding Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteAsset(asset.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Delete Holding"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <p className="text-sm">No assets match your current filter.</p>
                    <button
                      onClick={onAddAsset}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add an asset now
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer summary bar */}
        {filteredAssets.length > 0 && (
          <div className="py-3 px-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Showing {filteredAssets.length} of {assets.length} holdings</span>
            <div className="flex items-center gap-4">
              <span>
                Filtered Total: <strong className="text-white font-mono">{formatCurrency(filteredSum, currency)}</strong>
              </span>
              <span className="font-mono text-slate-500">
                ({totalAssetsSum > 0 ? ((filteredSum / totalAssetsSum) * 100).toFixed(1) : 0}% of portfolio)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
