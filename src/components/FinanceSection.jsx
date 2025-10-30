import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiTrendingUp, FiTrendingDown, FiPieChart, FiCalendar, FiFilter, FiDownload, FiFileText, FiHome, FiCreditCard, FiTarget, FiInfo, FiHelpCircle, FiMoon } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { financeService } from '../services/api';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { TransactionModal, BudgetModal } from './FinanceModals';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const FinanceSection = () => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [savings, setSavings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
  const [isSavingsFormOpen, setIsSavingsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);
  const [editingSaving, setEditingSaving] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('month');
  const [reportPeriod, setReportPeriod] = useState('week');

  const expenseCategories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
    'Bills & Utilities', 'Healthcare', 'Education', 'Other'
  ];

  const incomeCategories = [
    'Salary', 'Freelance', 'Investment', 'Business', 'Other'
  ];

  useEffect(() => {
    fetchData();
    loadSavings();
  }, [filterPeriod]);

  const loadSavings = () => {
    const storedSavings = localStorage.getItem('finance_savings');
    if (storedSavings) {
      setSavings(JSON.parse(storedSavings));
    }
  };

  const saveSavingsToStorage = (savingsData) => {
    localStorage.setItem('finance_savings', JSON.stringify(savingsData));
  };

  const generatePDFReport = (period = 'week') => {
    const doc = new jsPDF();
    const now = new Date();
    let startDate, endDate, periodText;

    if (period === 'week') {
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
      periodText = 'Weekly';
    } else {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      periodText = 'Monthly';
    }

    // Filter transactions for the period
    const periodTransactions = transactions.filter(t => {
      const transDate = new Date(t.date);
      return isWithinInterval(transDate, { start: startDate, end: endDate });
    });

    // Calculate totals
    const totalIncome = periodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = periodTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const netAmount = totalIncome - totalExpense;

    // Add header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`${periodText} Financial Report`, 105, 20, { align: 'center' });
    
    // Add period info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Period: ${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`, 105, 30, { align: 'center' });
    doc.text(`Generated: ${format(now, 'MMM dd, yyyy HH:mm')}`, 105, 37, { align: 'center' });

    // Add summary section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 20, 50);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Income: $${totalIncome.toFixed(2)}`, 20, 60);
    doc.text(`Total Expenses: $${totalExpense.toFixed(2)}`, 20, 67);
    doc.setFont('helvetica', 'bold');
    doc.text(`Net Amount: $${netAmount.toFixed(2)}`, 20, 74);
    doc.setFont('helvetica', 'normal');

    // Add transactions table
    if (periodTransactions.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Transaction Details', 20, 90);

      const tableData = periodTransactions.map(t => [
        format(new Date(t.date), 'MMM dd'),
        t.description,
        t.category,
        t.type === 'income' ? `+$${t.amount.toFixed(2)}` : `-$${t.amount.toFixed(2)}`,
        t.type
      ]);

      doc.autoTable({
        startY: 95,
        head: [['Date', 'Description', 'Category', 'Amount', 'Type']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 60 },
          2: { cellWidth: 40 },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 25 }
        }
      });

      // Add category breakdown
      const yPos = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Category Breakdown', 20, yPos);

      // Group by category
      const categoryTotals = {};
      periodTransactions.forEach(t => {
        if (!categoryTotals[t.category]) {
          categoryTotals[t.category] = { income: 0, expense: 0 };
        }
        if (t.type === 'income') {
          categoryTotals[t.category].income += t.amount;
        } else {
          categoryTotals[t.category].expense += t.amount;
        }
      });

      const categoryData = Object.entries(categoryTotals).map(([category, totals]) => [
        category,
        totals.income > 0 ? `$${totals.income.toFixed(2)}` : '-',
        totals.expense > 0 ? `$${totals.expense.toFixed(2)}` : '-'
      ]);

      doc.autoTable({
        startY: yPos + 5,
        head: [['Category', 'Income', 'Expenses']],
        body: categoryData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        styles: { fontSize: 10 }
      });
    } else {
      doc.setFontSize(12);
      doc.text('No transactions found for this period.', 20, 90);
    }

    // Save the PDF
    const filename = `Financial_Report_${periodText}_${format(now, 'yyyy-MM-dd')}.pdf`;
    doc.save(filename);
    toast.success(`${periodText} report downloaded successfully!`);
  };

  const fetchData = async () => {
    try {
      const [transactionsData, budgetsData, summaryData] = await Promise.all([
        financeService.getTransactions(),
        financeService.getBudgets(),
        financeService.getFinancialSummary(filterPeriod)
      ]);
      setTransactions(transactionsData);
      setBudgets(budgetsData);
      setSummary(summaryData);
    } catch (error) {
      toast.error('Failed to fetch financial data');
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const transactionData = {
      type: formData.get('type'),
      amount: parseFloat(formData.get('amount')),
      category: formData.get('category'),
      description: formData.get('description'),
      date: formData.get('date')
    };

    try {
      if (editingTransaction) {
        const updated = await financeService.updateTransaction(editingTransaction.id, transactionData);
        setTransactions(transactions.map(t => t.id === updated.id ? updated : t));
        toast.success('Transaction updated');
      } else {
        const newTransaction = await financeService.createTransaction(transactionData);
        setTransactions([newTransaction, ...transactions]);
        toast.success('Transaction added');
      }
      setIsTransactionFormOpen(false);
      setEditingTransaction(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to save transaction');
    }
  };

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const budgetData = {
      category: formData.get('category'),
      amount: parseFloat(formData.get('amount')),
      period: formData.get('period')
    };

    try {
      if (editingBudget) {
        const updated = await financeService.updateBudget(editingBudget.id, budgetData);
        setBudgets(budgets.map(b => b.id === updated.id ? updated : b));
        toast.success('Budget updated');
      } else {
        const newBudget = await financeService.createBudget(budgetData);
        setBudgets([...budgets, newBudget]);
        toast.success('Budget created');
      }
      setIsBudgetFormOpen(false);
      setEditingBudget(null);
    } catch (error) {
      toast.error('Failed to save budget');
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await financeService.deleteTransaction(id);
      setTransactions(transactions.filter(t => t.id !== id));
      toast.success('Transaction deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await financeService.deleteBudget(id);
      setBudgets(budgets.filter(b => b.id !== id));
      toast.success('Budget deleted');
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 overflow-x-auto">
        <button
          onClick={() => setActiveView('overview')}
          className={`flex-1 min-w-[80px] py-2 px-2 sm:px-4 rounded-lg font-medium text-xs sm:text-base transition-all duration-200 whitespace-nowrap ${
            activeView === 'overview'
              ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveView('transactions')}
          className={`flex-1 min-w-[80px] py-2 px-2 sm:px-4 rounded-lg font-medium text-xs sm:text-base transition-all duration-200 whitespace-nowrap ${
            activeView === 'transactions'
              ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <span className="hidden sm:inline">Transactions</span>
          <span className="sm:hidden">Trans.</span>
        </button>
        <button
          onClick={() => setActiveView('budgets')}
          className={`flex-1 min-w-[80px] py-2 px-2 sm:px-4 rounded-lg font-medium text-xs sm:text-base transition-all duration-200 whitespace-nowrap ${
            activeView === 'budgets'
              ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Budgets
        </button>
        <button
          onClick={() => setActiveView('savings')}
          className={`flex-1 min-w-[80px] py-2 px-2 sm:px-4 rounded-lg font-medium text-xs sm:text-base transition-all duration-200 whitespace-nowrap ${
            activeView === 'savings'
              ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Savings
        </button>
      </div>

      {/* Overview View */}
      {activeView === 'overview' && (
        <div>
          <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
            {/* PDF Download Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => generatePDFReport('week')}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm sm:text-base transition-colors"
              >
                <FiDownload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Weekly Report</span>
                <span className="sm:hidden">Weekly</span>
              </button>
              <button
                onClick={() => generatePDFReport('month')}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm sm:text-base transition-colors"
              >
                <FiDownload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Monthly Report</span>
                <span className="sm:hidden">Monthly</span>
              </button>
            </div>
            
            {/* Period Filter */}
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm sm:text-base text-gray-900 dark:text-white"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Income</p>
                <FiTrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(summary?.income || 0)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
                <FiTrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(summary?.expenses || 0)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Balance</p>
                <FiDollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <p className={`text-3xl font-bold ${
                summary?.balance >= 0 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(summary?.balance || 0)}
              </p>
            </motion.div>
          </div>

          {summary?.expensesByCategory && Object.keys(summary.expensesByCategory).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FiPieChart className="w-5 h-5 mr-2" />
                Expense Breakdown
              </h3>
              <div className="space-y-3">
                {Object.entries(summary.expensesByCategory).map(([category, amount]) => {
                  const percentage = (amount / summary.expenses) * 100;
                  return (
                    <div key={category}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {category}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatCurrency(amount)} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-primary-600 dark:bg-primary-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transactions View */}
      {activeView === 'transactions' && (
        <div>
          {/* Controls Section */}
          <div className="space-y-3 mb-6">
            {/* Filter and Add Button Row */}
            <div className="flex items-center gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-sm sm:text-base text-gray-900 dark:text-white font-medium"
              >
                <option value="all">All Transactions</option>
                <option value="income">Income Only</option>
                <option value="expense">Expenses Only</option>
              </select>
              <button
                onClick={() => {
                  setEditingTransaction(null);
                  setIsTransactionFormOpen(true);
                }}
                className="px-4 py-2 sm:px-6 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm sm:text-base font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <FiPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Transaction</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
            
            {/* PDF Download Buttons */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                onClick={() => generatePDFReport('week')}
                className="flex items-center justify-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm sm:text-base font-medium transition-colors"
              >
                <FiFileText className="w-4 h-4" />
                <span>Download Weekly</span>
              </button>
              <button
                onClick={() => generatePDFReport('month')}
                className="flex items-center justify-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm sm:text-base font-medium transition-colors"
              >
                <FiFileText className="w-4 h-4" />
                <span>Download Monthly</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No transactions yet. Add your first transaction!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 sm:p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Left side - Transaction details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                          {transaction.description}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
                          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {format(new Date(transaction.date), 'dd/MM/yyyy')}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-400">•</span>
                          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {transaction.category}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-400">•</span>
                          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {transaction.account || 'Jai'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Right side - Amount and actions */}
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-base sm:text-xl font-bold whitespace-nowrap ${
                          transaction.type === 'income'
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingTransaction(transaction);
                              setIsTransactionFormOpen(true);
                            }}
                            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all"
                            aria-label="Edit transaction"
                          >
                            <FiEdit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            aria-label="Delete transaction"
                          >
                            <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Budgets View */}
      {activeView === 'budgets' && (
        <div>
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => {
                setEditingBudget(null);
                setIsBudgetFormOpen(true);
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <FiPlus className="w-5 h-5" />
              <span>Create Budget</span>
            </button>
          </div>

          {budgets.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No budgets set. Create your first budget!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {budgets.map((budget) => {
                const spent = transactions
                  .filter(t => t.type === 'expense' && t.category === budget.category)
                  .reduce((sum, t) => sum + t.amount, 0);
                const percentage = (spent / budget.amount) * 100;
                const isOverBudget = spent > budget.amount;

                return (
                  <motion.div
                    key={budget.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {budget.category}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {budget.period} budget
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingBudget(budget);
                            setIsBudgetFormOpen(true);
                          }}
                          className="p-1 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBudget(budget.id)}
                          className="p-1 text-gray-500 hover:text-red-600"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Spent</span>
                        <span className={`font-medium ${
                          isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                        }`}>
                          {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            isOverBudget 
                              ? 'bg-red-500' 
                              : percentage > 80 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <p className={`text-sm text-right ${
                        isOverBudget 
                          ? 'text-red-600 dark:text-red-400 font-medium' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {isOverBudget 
                          ? `Over budget by ${formatCurrency(spent - budget.amount)}`
                          : `${formatCurrency(budget.amount - spent)} remaining`
                        }
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Savings View */}
      {activeView === 'savings' && (
        <div>
          {/* Overall Savings Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium opacity-90">Total Savings</p>
                <FiDollarSign className="w-5 h-5 opacity-80" />
              </div>
              <p className="text-3xl font-bold">
                ₹{savings.reduce((sum, s) => sum + s.amount, 0).toFixed(2)}
              </p>
              <p className="text-xs opacity-80 mt-1">All time</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
                <FiCalendar className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                ₹{savings
                  .filter(s => {
                    const saveDate = new Date(s.weekStart);
                    const now = new Date();
                    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
                    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
                    return saveDate >= weekStart && saveDate <= weekEnd;
                  })
                  .reduce((sum, s) => sum + s.amount, 0)
                  .toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'MMM dd')} - {format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'MMM dd')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
                <FiTrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                ₹{savings
                  .filter(s => {
                    const date = new Date(s.date);
                    const now = new Date();
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                  })
                  .reduce((sum, s) => sum + s.amount, 0)
                  .toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {format(new Date(), 'MMMM yyyy')}
              </p>
            </motion.div>
          </div>

          {/* Add/Edit Savings Button */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Weekly Savings</h3>
              <button
                onClick={() => {
                  setEditingSaving(null);
                  setIsSavingsFormOpen(true);
                }}
                className="w-full sm:w-auto px-3 py-2 sm:px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                <span>Add Savings</span>
              </button>
            </div>
          </div>

          {/* Savings List */}
          <div className="space-y-3">
            {savings.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No savings recorded yet. Start tracking your weekly savings!
                </p>
              </div>
            ) : (
              savings
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((saving) => (
                  <motion.div
                    key={saving.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-start sm:items-center gap-3">
                          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg flex-shrink-0">
                            <FiDollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white break-words">
                              Week of {format(new Date(saving.weekStart), 'MMM dd, yyyy')}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              Added on {format(new Date(saving.date), 'PP')}
                            </p>
                            {saving.note && (
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 break-words">
                                {saving.note}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                        <span className="text-xl sm:text-2xl font-bold text-green-600">
                          +₹{saving.amount.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingSaving(saving);
                              setIsSavingsFormOpen(true);
                            }}
                            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                          >
                            <FiEdit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this savings entry?')) {
                                const updatedSavings = savings.filter(s => s.id !== saving.id);
                                setSavings(updatedSavings);
                                saveSavingsToStorage(updatedSavings);
                                toast.success('Savings entry deleted');
                              }
                            }}
                            className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          >
                            <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
            )}
          </div>
        </div>
      )}

      {/* Savings Modal */}
      <AnimatePresence>
        {isSavingsFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsSavingsFormOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {editingSaving ? 'Edit Savings' : 'Add Weekly Savings'}
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const savingData = {
                    id: editingSaving?.id || Date.now().toString(),
                    amount: parseFloat(formData.get('amount')),
                    weekStart: formData.get('weekStart'),
                    date: new Date().toISOString(),
                    note: formData.get('note')
                  };

                  let updatedSavings;
                  if (editingSaving) {
                    updatedSavings = savings.map(s => 
                      s.id === editingSaving.id ? savingData : s
                    );
                    toast.success('Savings updated');
                  } else {
                    updatedSavings = [...savings, savingData];
                    toast.success('Savings added');
                  }
                  
                  setSavings(updatedSavings);
                  saveSavingsToStorage(updatedSavings);
                  setIsSavingsFormOpen(false);
                  setEditingSaving(null);
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      step="0.01"
                      required
                      defaultValue={editingSaving?.amount || ''}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter amount saved"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Week Starting Date
                    </label>
                    <input
                      type="date"
                      name="weekStart"
                      required
                      defaultValue={editingSaving?.weekStart || format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Note (Optional)
                    </label>
                    <textarea
                      name="note"
                      rows="3"
                      defaultValue={editingSaving?.note || ''}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Add any notes about this savings"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSavingsFormOpen(false);
                      setEditingSaving(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    {editingSaving ? 'Update' : 'Add'} Savings
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction Modal */}
      <AnimatePresence>
        {isTransactionFormOpen && (
          <TransactionModal
            isOpen={isTransactionFormOpen}
            onClose={() => {
              setIsTransactionFormOpen(false);
              setEditingTransaction(null);
            }}
            onSubmit={handleTransactionSubmit}
            editingTransaction={editingTransaction}
            incomeCategories={incomeCategories}
            expenseCategories={expenseCategories}
          />
        )}
      </AnimatePresence>

      {/* Budget Modal */}
      <AnimatePresence>
        {isBudgetFormOpen && (
          <BudgetModal
            isOpen={isBudgetFormOpen}
            onClose={() => {
              setIsBudgetFormOpen(false);
              setEditingBudget(null);
            }}
            onSubmit={handleBudgetSubmit}
            editingBudget={editingBudget}
            expenseCategories={expenseCategories}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FinanceSection;
