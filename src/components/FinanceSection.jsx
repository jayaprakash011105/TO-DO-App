import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiTrendingUp, FiTrendingDown, FiPieChart, FiCalendar, FiFilter, FiDownload, FiFileText } from 'react-icons/fi';
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
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);
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
  }, [filterPeriod]);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const generatePDFReport = async (period = 'week', includeAll = false) => {
    // Always fetch latest transactions for the report
    let currentTransactions = transactions;
    
    try {
      const transactionsData = await financeService.getTransactions();
      if (transactionsData && transactionsData.length > 0) {
        currentTransactions = transactionsData;
        setTransactions(transactionsData);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Continue with existing transactions if fetch fails
    }

    if (!currentTransactions || currentTransactions.length === 0) {
      toast.error('No transactions available to generate report');
      return;
    }

    const doc = new jsPDF();
    const now = new Date();
    let startDate, endDate, periodText;
    let periodTransactions;

    if (includeAll) {
      periodText = 'All';
      periodTransactions = currentTransactions;
      startDate = new Date(Math.min(...currentTransactions.map(t => new Date(t.date))));
      endDate = new Date(Math.max(...currentTransactions.map(t => new Date(t.date))));
    } else {
      if (period === 'week') {
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        periodText = 'Weekly';
      } else {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        periodText = 'Monthly';
      }

      console.log('Report period:', { 
        startDate: format(startDate, 'yyyy-MM-dd'), 
        endDate: format(endDate, 'yyyy-MM-dd') 
      });
      console.log('Available transactions:', currentTransactions);

      // Filter transactions for the period
      periodTransactions = currentTransactions.filter(t => {
        if (!t.date) return false;
        const transDate = new Date(t.date);
        // Check if date is valid
        if (isNaN(transDate.getTime())) return false;
        
        // Compare dates without time component
        const transDateOnly = new Date(format(transDate, 'yyyy-MM-dd'));
        const startDateOnly = new Date(format(startDate, 'yyyy-MM-dd'));
        const endDateOnly = new Date(format(endDate, 'yyyy-MM-dd'));
        
        return transDateOnly >= startDateOnly && transDateOnly <= endDateOnly;
      });
    }

    console.log('Filtered transactions:', periodTransactions);

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
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        <button
          onClick={() => setActiveView('overview')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
            activeView === 'overview'
              ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveView('transactions')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
            activeView === 'transactions'
              ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveView('budgets')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
            activeView === 'budgets'
              ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Budgets
        </button>
      </div>

      {/* Overview View */}
      {activeView === 'overview' && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            {/* PDF Download Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => generatePDFReport('week')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                <span>Weekly Report</span>
              </button>
              <button
                onClick={() => generatePDFReport('month')}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                <span>Monthly Report</span>
              </button>
              <button
                onClick={() => generatePDFReport('all', true)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                <span>All Transactions</span>
              </button>
            </div>
            
            {/* Period Filter */}
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="btn-primary flex items-center space-x-2"
              >
                <FiPlus className="w-5 h-5" />
                <span>Add Transaction</span>
              </button>
            </div>
            
            {/* PDF Download Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => generatePDFReport('week')}
                className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              >
                <FiFileText className="w-4 h-4" />
                <span>Download Weekly</span>
              </button>
              <button
                onClick={() => generatePDFReport('month')}
                className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
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
              <AnimatePresence>
                {filteredTransactions.map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 dark:bg-green-900/30' 
                            : 'bg-red-100 dark:bg-red-900/30'
                        }`}>
                          {transaction.type === 'income' ? (
                            <FiTrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <FiTrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {transaction.description || transaction.category}
                          </p>
                          <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                            <span>{transaction.category}</span>
                            <span>•</span>
                            <span className="flex items-center">
                              <FiCalendar className="w-3 h-3 mr-1" />
                              {format(new Date(transaction.date), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-xl font-bold ${
                          transaction.type === 'income'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => {
                              setEditingTransaction(transaction);
                              setIsTransactionFormOpen(true);
                            }}
                            className="p-1 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="p-1 text-gray-500 hover:text-red-600"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
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
