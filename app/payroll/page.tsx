'use client';

import React, { useState } from 'react';
import { MOCK_EMPLOYEES, Employee } from '@/lib/payrollEngine';
import { Users, DollarSign, Download, Plus, CheckCircle2, RefreshCw, Send, ShieldCheck, FileSpreadsheet } from 'lucide-react';

export default function PayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchExecuted, setBatchExecuted] = useState(false);

  // New employee form
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [wallet, setWallet] = useState('');
  const [salary, setSalary] = useState('');

  const totalPayrollUsd = employees.reduce((acc, curr) => acc + curr.salaryUsd, 0);

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !wallet || !salary) return;

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name,
      role: role || 'Contributor',
      walletAddress: wallet,
      salaryUsd: Number(salary),
      paymentToken: 'USDC',
      status: 'ACTIVE',
    };

    setEmployees([...employees, newEmp]);
    setName('');
    setRole('');
    setWallet('');
    setSalary('');
  };

  const handleExecuteBatchPayroll = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setBatchExecuted(true);
      setTimeout(() => setBatchExecuted(false), 4000);
    }, 2500);
  };

  const exportTaxCsv = () => {
    const headers = 'ID,Name,Role,WalletAddress,SalaryUSD,Token,Status\n';
    const rows = employees.map((e) => `${e.id},"${e.name}","${e.role}",${e.walletAddress},${e.salaryUsd},${e.paymentToken},${e.status}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chainguard_payroll_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0e1626] via-[#090d16] to-[#07090e] border border-cyan-500/20 p-8 space-y-4 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <Users className="w-4 h-4 text-cyan-400" />
          <span>Corporate Crypto Payroll Infrastructure</span>
        </div>

        <h1 className="text-3xl font-black text-white tracking-tight">
          Batch Crypto Payroll & Employee Payouts
        </h1>

        <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
          Disburse salaries to global contractors and employees in 1 single smart contract transaction. Zero manual transfers, zero high gas fees, and automated CSV tax export.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={handleExecuteBatchPayroll}
            disabled={isProcessing}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            <Send className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            {isProcessing ? 'Processing Batch Disbursal...' : `PAY ALL EMPLOYEES ($${totalPayrollUsd.toLocaleString()} USDC)`}
          </button>

          <button
            onClick={exportTaxCsv}
            className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-xs text-gray-300 border border-white/10 transition-all flex items-center gap-2 font-mono"
          >
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            Export Tax CSV Report
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {batchExecuted && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-300 font-mono">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Success! Batch payout of ${totalPayrollUsd.toLocaleString()} USDC disbursed to {employees.length} employees on Base Mainnet. Tx Hash: 0x9f82...14a0</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="p-5 rounded-2xl bg-card border border-cardBorder backdrop-blur-xl space-y-1">
          <span className="text-[11px] text-gray-400 font-sans uppercase font-bold">Total Active Employees</span>
          <p className="text-2xl font-black text-white">{employees.length}</p>
          <span className="text-[10px] text-gray-500 block">Verified wallet addresses</span>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-cardBorder backdrop-blur-xl space-y-1">
          <span className="text-[11px] text-gray-400 font-sans uppercase font-bold">Monthly Disbursal Volume</span>
          <p className="text-2xl font-black text-cyan-300">${totalPayrollUsd.toLocaleString()} USDC</p>
          <span className="text-[10px] text-gray-500 block">Single-tx batch cost ~ $0.08 gas</span>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-cardBorder backdrop-blur-xl space-y-1">
          <span className="text-[11px] text-gray-400 font-sans uppercase font-bold">Settlement Asset</span>
          <p className="text-2xl font-black text-emerald-400">USDC (Base)</p>
          <span className="text-[10px] text-gray-500 block">Instant finality</span>
        </div>
      </div>

      {/* Employee List Table */}
      <div className="rounded-2xl bg-card border border-cardBorder backdrop-blur-xl overflow-hidden shadow-xl space-y-4 p-6">
        <h3 className="text-sm font-bold text-white border-b border-white/10 pb-3 flex items-center justify-between">
          <span>Employee Roster & Salary Allocation</span>
          <span className="text-xs font-mono text-gray-400">Auto Batch Transfer</span>
        </h3>

        <div className="divide-y divide-white/10 overflow-x-auto">
          {employees.map((emp) => (
            <div key={emp.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs hover:bg-white/[0.02] transition-colors">
              <div className="space-y-0.5">
                <span className="font-bold text-white text-sm block">{emp.name}</span>
                <span className="text-gray-400 text-[11px] font-sans">{emp.role}</span>
              </div>

              <div className="text-gray-400">
                Wallet: <span className="text-cyan-300 font-semibold">{emp.walletAddress.slice(0, 10)}...{emp.walletAddress.slice(-6)}</span>
              </div>

              <div className="font-bold text-emerald-400 text-sm">
                ${emp.salaryUsd.toLocaleString()} {emp.paymentToken}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Employee Form */}
      <form onSubmit={handleAddEmployee} className="rounded-2xl bg-card border border-cardBorder p-6 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-cyan-400" /> Add New Employee to Payroll
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1 font-mono">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. David Kim"
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1 font-mono">Role / Position</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. DevOps Engineer"
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1 font-mono">Wallet Address</label>
            <input
              type="text"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="0x..."
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1 font-mono">Monthly Salary ($USD)</label>
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="5000"
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-emerald-300 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </form>
    </div>
  );
}
