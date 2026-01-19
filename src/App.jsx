import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

// --- CONFIGURATION ---

// 1. SET THIS TO FALSE to connect to your Local MongoDB
const USE_MOCK_DATA = false; 

// 2. NOTE THE PORT 5001 (Fix for Mac users)
const API_URL = "https://finance-app-backend-vmt5.onrender.com/api/transactions";

// --- MOCK DATA ---
const INITIAL_MOCK_DATA = [
  { _id: '1', description: 'Freelance Work', amount: 1200, type: 'income', category: 'Salary', date: '2023-10-01' },
  { _id: '2', description: 'Grocery Run', amount: 85.50, type: 'expense', category: 'Food', date: '2023-10-02' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff7373'];

export default function BudgetBuddy() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: 'Food'
  });

  // --- API HANDLERS ---
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      if (USE_MOCK_DATA) {
        setTimeout(() => {
          setTransactions(INITIAL_MOCK_DATA);
          setLoading(false);
        }, 800);
      } else {
        const res = await fetch(API_URL);
        const data = await res.json();
        setTransactions(data);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    const newTransaction = {
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date().toISOString()
    };

    try {
      if (USE_MOCK_DATA) {
        const mockEntry = { ...newTransaction, _id: Date.now().toString() };
        setTransactions(prev => [mockEntry, ...prev]);
      } else {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTransaction)
        });
        const savedTransaction = await res.json();
        setTransactions(prev => [savedTransaction, ...prev]);
      }
      setFormData({ description: '', amount: '', type: 'expense', category: 'Food' });
    } catch (error) {
      console.error("Error adding:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (USE_MOCK_DATA) {
        setTransactions(prev => prev.filter(t => t._id !== id));
      } else {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        setTransactions(prev => prev.filter(t => t._id !== id));
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // --- CALCULATIONS ---
  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expenses;

  const categoryData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const existing = acc.find(item => item.name === t.category);
      if (existing) {
        existing.value += t.amount;
      } else {
        acc.push({ name: t.category, value: t.amount });
      }
      return acc;
    }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-indigo-900 flex items-center gap-2">
              <Wallet className="w-8 h-8 text-indigo-600" />
              BudgetBuddy
            </h1>
            <p className="text-gray-500">Track your financial health</p>
          </div>
          {USE_MOCK_DATA && (
            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium border border-yellow-200">
              ⚠️ Mock Mode (Set USE_MOCK_DATA = false to connect DB)
            </div>
          )}
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Balance</p>
                <h3 className={`text-2xl font-bold ${balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                  ${balance.toFixed(2)}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full text-green-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Income</p>
                <h3 className="text-2xl font-bold text-gray-900">${income.toFixed(2)}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full text-red-600">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Expenses</p>
                <h3 className="text-2xl font-bold text-gray-900">${expenses.toFixed(2)}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Form & List */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Input Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Add Transaction</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <input
                    type="text"
                    placeholder="Description (e.g. Rent, Coffee)"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Amount"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <div>
                  <select
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <select
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Food">Food & Dining</option>
                    <option value="Transport">Transportation</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Salary">Salary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <Plus className="w-5 h-5" /> Add Transaction
                </button>
              </form>
            </div>

            {/* Transaction List */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Transactions</h3>
              {loading ? (
                <div className="text-center py-10 text-gray-400">Loading data...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-10 text-gray-400">No transactions yet.</div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((t) => (
                    <div key={t._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {t.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{t.description}</p>
                          <p className="text-xs text-gray-500">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-gray-800'}`}>
                          {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                        </span>
                        <button 
                          onClick={() => handleDelete(t._id)}
                          className="text-gray-400 hover:text-red-500 transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Chart */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Spending Breakdown</h3>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  Add expenses to see analysis
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
