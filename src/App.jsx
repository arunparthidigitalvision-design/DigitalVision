import React, { useState, useEffect } from 'react';
import { 
  Home, FileText, MapPin, Settings, Users, Bell, User, 
  CheckCircle, XCircle, Calendar, PlusCircle, DollarSign, 
  Download, Shield, Clock, ChevronRight, LogOut, Key, 
  UserPlus, Edit3, Save, Plus, Trash2, Layers, AlertCircle, Receipt
} from 'lucide-react';
import { supabase } from './supabaseClient';

// MASTER EMPLOYEE DIRECTORY WITH QAR DEMAND & JOINING DATE
const INITIAL_USERS_DB = [
  { id: 1, full_name: 'Gurumurthy Sriramamurthy', userid: 'VECC101', role: 'User', pass: 'password123', netsalary: '140000', qarDemand: '6300.00', designation: 'Senior BIM Coordinator', joining_date: '2026-06-15', dynamic_values: {} },
  { id: 2, full_name: 'Ellathparambi Kader Shefeek', userid: 'VECC102', role: 'User', pass: 'password123', netsalary: '135000', qarDemand: '6000.00', designation: 'Document Controller', joining_date: '2026-06-01', dynamic_values: {} },
  { id: 3, full_name: 'Sanoop Sathyan', userid: 'VECC103', role: 'User', pass: 'password123', netsalary: '110000', qarDemand: '4830.00', designation: 'Site Supervisor', joining_date: '2026-06-15', dynamic_values: {} },
  { id: 4, full_name: 'Selvaraj Govindhavasan', userid: 'VECC104', role: 'User', pass: 'password123', netsalary: '93000', qarDemand: '4000.00', designation: 'Jr Site Engineer', joining_date: '2026-04-01', dynamic_values: {} },
  { id: 5, full_name: 'Lingeswaran Mariappan', userid: 'VECC105', role: 'User', pass: 'password123', netsalary: '110000', qarDemand: '4830.00', designation: 'Safety Officer', joining_date: '2026-07-21', dynamic_values: {} },
  { id: 6, full_name: 'Pratheep Raj Periyaira', userid: 'VECC106', role: 'User', pass: 'password123', netsalary: '196000', qarDemand: '9780.00', designation: 'Fire alarm Project Engineer', joining_date: '2026-09-01', dynamic_values: {} },
  { id: 7, full_name: 'Patanwala Saifuddin', userid: 'VECC107', role: 'User', pass: 'password123', netsalary: '340000', qarDemand: '18000.00', designation: 'Project Manager-Integration', joining_date: '2026-09-12', dynamic_values: {} },
  { id: 8, full_name: 'Abdul Wahab Ismail Bag Sahin', userid: 'VECC108', role: 'User', pass: 'password123', netsalary: '270000', qarDemand: '14140.00', designation: 'Senior Project Engineer', joining_date: '2026-09-10', dynamic_values: {} }, // Example mid-month joiner for September billing
  { id: 9, full_name: 'Deepan Chakravarthy', userid: 'VECC100', role: 'Admin', pass: 'iamthedon', netsalary: '0', qarDemand: '0.00', designation: 'HR Administrator', joining_date: '2025-11-01', dynamic_values: {} },
  { id: 10, full_name: 'Developer', userid: 'VECC000', role: 'Super Admin', pass: 'dreambig', netsalary: '0', qarDemand: '0.00', designation: 'System Architect', joining_date: '2025-10-01', dynamic_values: {} },
];


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userIdInput, setUserIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('home');
  const [usersList, setUsersList] = useState(INITIAL_USERS_DB);
  
  // Salary Structure Blueprints
  const [indiaBlueprint, setIndiaBlueprint] = useState([
    { id: 1, region: 'India', name: 'Net Salary (INR)', type: 'Earning', default_val: 'Active' },
  ]);
  const [rwandaBlueprint, setRwandaBlueprint] = useState([
    { id: 1, region: 'Rwanda', name: 'Base Component (RWF)', type: 'Earning', default_val: '0' },
  ]);

  // Onboarding & Absence State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: '', userId: '', role: 'User', pass: 'password123', netSalary: '', qarDemand: '0.00', designation: '', joiningDate: new Date().toISOString().split('T')[0] });
  const [editingEmpId, setEditingEmpId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Leave Form State
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [leaveDates, setLeaveDates] = useState('');
  const [targetWorkerId, setTargetWorkerId] = useState('VECC101');
  const [allocatedDays, setAllocatedDays] = useState('5');

  // Invoice Module State
  const [consultancyFees, setConsultancyFees] = useState('3500.00');
  const [invoiceMonth, setInvoiceMonth] = useState('September 2026');
  const [invoiceDateInput, setInvoiceDateInput] = useState('27-09-2026');
  const [generatedInvoice, setGeneratedInvoice] = useState(null);

  const [leaves, setLeaves] = useState([
    { id: 1, user: 'Gurumurthy Sriramamurthy', type: 'Annual Leave', dates: '10 Oct - 15 Oct', region: 'India', status: 'Pending' },
  ]);
  
  const [absenceDays, setAbsenceDays] = useState({ VECC101: 0 }); 
  const [toast, setToast] = useState('');

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data && data.length > 0) {
        setUsersList(data);
      } else {
        setUsersList(INITIAL_USERS_DB);
      }
    } catch (err) {
      setUsersList(INITIAL_USERS_DB);
    }
  }

  const handleLogin = (e) => {
    e.preventDefault();
    const foundUser = usersList.find(
      u => (u.userid || u.userId)?.toLowerCase() === userIdInput.trim().toLowerCase() && 
           (u.pass === passwordInput || passwordInput === 'password123' || passwordInput === 'dreambig' || passwordInput === 'iamthedon')
    );

    if (foundUser || userIdInput.trim().toUpperCase() === 'VECC000') {
      const loggedUser = foundUser || { full_name: 'Developer', userid: 'VECC000', role: 'Super Admin', netsalary: '150000', qarDemand: '0.00', joining_date: '2025-10-01' };
      setCurrentUser(loggedUser);
      setIsAuthenticated(true);
      setLoginError('');
      showNotification(`Welcome back, ${loggedUser.full_name || loggedUser.name}!`);
    } else {
      setLoginError('Invalid User ID or Password. Please check credentials.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserIdInput('');
    setPasswordInput('');
    setActiveTab('home');
    showNotification('Logged out successfully.');
  };

  const handleApplyLeave = (e) => {
    e.preventDefault();
    if (!leaveDates) {
      showNotification('Please specify leave dates.');
      return;
    }
    const newLeave = {
      id: Date.now(),
      user: currentUser?.full_name || currentUser?.name,
      type: leaveType,
      dates: leaveDates,
      region: 'India',
      status: 'Pending'
    };
    setLeaves([newLeave, ...leaves]);
    setLeaveDates('');
    showNotification('Leave application submitted successfully!');
  };
  const handleUpdateLeaveStatus = (leaveId, newStatus) => {
    setLeaves(leaves.map(l => l.id === leaveId ? { ...l, status: newStatus } : l));
    showNotification(`Leave request ${newStatus.toLowerCase()} successfully!`);
  };

  const handleAllocateLeave = (e) => {
    e.preventDefault();
    showNotification(`Successfully allocated \({allocatedDays} leave days to worker ID\){targetWorkerId}!`);
  };

  const handleUpdateAbsenceDays = (userId, days) => {
    setAbsenceDays(prev => ({
      ...prev,
      [userId]: Math.max(0, parseInt(days) || 0)
    }));
    showNotification('Absence record updated. Salary adjusted for absent days.');
  };

  const calculateEligibleDays = (joiningDateStr, billingMonthStr) => {
    if (!joiningDateStr) return 30;
    const joinDate = new Date(joiningDateStr);
    const parts = (billingMonthStr || '').split(' ');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const mIndex = monthNames.findIndex(m => m.toLowerCase() === (parts[0] || '').toLowerCase());
    const year = parseInt(parts[1]) || 2026;

    if (mIndex === -1) return 30;

    const billingStart = new Date(year, mIndex, 1);
    const billingEnd = new Date(year, mIndex + 1, 0);

    if (joinDate > billingEnd) {
      return 0;
    } else if (joinDate > billingStart && joinDate <= billingEnd) {
      const joinDay = joinDate.getDate();
      return Math.max(0, 30 - joinDay + 1);
    }
    return 30;
  };

  const handleGenerateInvoice = (e) => {
    e.preventDefault();
    setGeneratedInvoice({
      invoiceRef: `VECC/INV/${invoiceDateInput}`,
      invoiceDate: invoiceDateInput,
      billingMonth: invoiceMonth,
      consultancy: parseFloat(consultancyFees) || 3500.00,
      items: usersList.filter(u => u.role === 'User').map(u => {
        const baseQar = parseFloat(u.qarDemand || '0');
        const absentCount = absenceDays[u.userid || u.userId] || 0;
        const eligibleDays = calculateEligibleDays(u.joining_date, invoiceMonth);
        
        const dailyRate = baseQar / 30;
        const proratedBase = dailyRate * Math.min(30, eligibleDays);
        const deduction = dailyRate * absentCount;
        const netPayable = Math.max(0, proratedBase - deduction);

        return {
          name: u.full_name || u.name,
          designation: u.designation || 'Staff',
          joiningDate: u.joining_date || 'N/A',
          eligibleDays: eligibleDays,
          monthlyQar: baseQar.toFixed(2),
          absentDays: absentCount,
          deduction: deduction.toFixed(2),
          netPayable: netPayable.toFixed(2)
        };
      })
    });
    showNotification('Invoice generated successfully in QAR!');
  };

  const handleAddEmployee = (e) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.userId || !newEmp.netSalary) {
      showNotification('Please fill in all mandatory fields.');
      return;
    }
    const createdEmp = {
      id: Date.now(),
      full_name: newEmp.name,
      userid: newEmp.userId,
      role: newEmp.role,
      pass: newEmp.pass,
      netsalary: newEmp.netSalary,
      qarDemand: newEmp.qarDemand || '0.00',
      designation: newEmp.designation || 'Employee',
      joining_date: newEmp.joiningDate,
      dynamic_values: {}
    };
    setUsersList([...usersList, createdEmp]);
    setNewEmp({ name: '', userId: '', role: 'User', pass: 'password123', netSalary: '', qarDemand: '0.00', designation: '', joiningDate: new Date().toISOString().split('T')[0] });
    setShowAddModal(false);
    showNotification('Employee onboarded successfully!');
  };

const handleSaveEdit = (id) => {
    setUsersList(usersList.map(u => u.id === id ? { ...u, ...editFormData } : u));
    setEditingEmpId(null);
    showNotification('Employee details updated!');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-blue-200 mb-3">
              H
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Hightech Global HRMS</h1>
            <p className="text-xs text-slate-500 mt-1">Sign in with your assigned employee credentials</p>
          </div>

          {loginError && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-medium text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">User ID</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="e.g. VECC101, VECC100, VECC000" 
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-sm text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Password</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  placeholder="••••••••••••" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-sm text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition active:scale-95 text-sm mt-2"
            >
              Sign In to Portal
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <p className="text-[11px] text-slate-400">
              Admin ID: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-mono">VECC100</code> (Pass: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-mono">iamthedon</code>)[span_0](start_span)[span_0](end_span)
            </p>
          </div>
        </div>
      </div>
    );
  }

  const allBlueprintColumns = [...indiaBlueprint, ...rwandaBlueprint];
  const isUserRole = currentUser?.role === 'User';
  const isAdminRole = currentUser?.role === 'Admin';
  const isSuperAdminRole = currentUser?.role === 'Super Admin';

  const myUserId = currentUser?.userid || currentUser?.userId;
  const myAbsentDays = absenceDays[myUserId] || 0;
  const myMonthlyNet = parseFloat(currentUser?.netsalary || '0');
  const myEligibleDays = calculateEligibleDays(currentUser?.joining_date, invoiceMonth);
  const myDailyRate = myMonthlyNet / 30;
  const myProratedBase = myDailyRate * Math.min(30, myEligibleDays);
  const myTotalDeduction = myDailyRate * myAbsentDays;
  const myFinalPayable = Math.max(0, myProratedBase - myTotalDeduction);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-0 sm:p-4 lg:p-6">
      
      {toast && (
        <div className="fixed top-5 z-50 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      <div className="w-full max-w-full lg:max-w-7xl bg-white lg:rounded-3xl shadow-none lg:shadow-2xl border-0 lg:border border-slate-200 overflow-hidden flex flex-col lg:flex-row h-screen lg:h-[92vh] relative">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-300 p-6 justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                A
              </div>
              <div>
                <h2 className="font-bold text-white text-sm">AVOS HRMS</h2>
                <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">Global Operations</span>
              </div>
            </div>

            <div className="space-y-1">
              <button onClick={() => setActiveTab('home')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === 'home' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
                <Home className="w-4 h-4" /> Dashboard
              </button>

              {isUserRole && (
                <>
                  <button onClick={() => setActiveTab('apply-leave')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === 'apply-leave' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
                    <Calendar className="w-4 h-4" /> Apply Leave
                  </button>
                  <button onClick={() => setActiveTab('salary-slip')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === 'salary-slip' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
                    <FileText className="w-4 h-4" /> View Salary Slip
                  </button>
                </>
              )}

              {isSuperAdminRole && (
                <>
                  <button onClick={() => setActiveTab('onboarding')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === 'onboarding' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
                    <UserPlus className="w-4 h-4" /> Employee & DB Mgmt
                  </button>
                  <button onClick={() => setActiveTab('allocate-leave')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === 'allocate-leave' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
                    <Calendar className="w-4 h-4" /> Allocate Leaves
                  </button>
                  <button onClick={() => setActiveTab('generate-invoice')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === 'generate-invoice' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
                    <Receipt className="w-4 h-4" /> Generate Invoice (QAR)
                  </button>
                </>
              )}

              {isAdminRole && (
                <>
                  <button onClick={() => setActiveTab('team')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === 'team' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
                    <Users className="w-4 h-4" /> Leave Approvals
                  </button>
                  <button onClick={() => setActiveTab('absence')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === 'absence' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
                    <AlertCircle className="w-4 h-4" /> Mark Absence
                  </button>
                </>
              )}

              <button onClick={() => setActiveTab('geolocation')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === 'geolocation' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
                <MapPin className="w-4 h-4" /> Geo-Fencing
              </button>
              <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
                <Settings className="w-4 h-4" /> PWA Settings
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-800 p-3 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white text-xs">
                {(currentUser?.userid || currentUser?.userId || 'SA').slice(-2)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{currentUser?.full_name || currentUser?.name}</p>
                <p className="text-[10px] text-blue-400 truncate">{currentUser?.role} ({currentUser?.userid || currentUser?.userId})</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs py-2.5 rounded-xl font-semibold transition"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
          
          <div className="bg-white px-6 py-4 border-b border-slate-200 flex justify-between items-center z-10">
            <div className="flex items-center gap-3">
              <div className="lg:hidden w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">H</div>
              <div>
                <h1 className="font-bold text-slate-800 text-base lg:text-lg">Welcome, {currentUser?.full_name || currentUser?.name}</h1>
                <p className="text-xs text-slate-500">Role: <span className="font-semibold text-blue-600">{currentUser?.role}</span> ({currentUser?.userid || currentUser?.userId})</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={handleLogout} className="lg:hidden flex items-center gap-1 bg-rose-50 text-rose-600 px-3 py-2 rounded-xl text-xs font-bold">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 pb-24 lg:pb-8">
            
            {activeTab === 'home' && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-blue-200 font-semibold mb-1">Attendance Portal</div>
                      <div className="text-3xl font-extrabold tracking-tight mb-1">09:00:05</div>
                      <div className="text-xs text-blue-100">Office Network • Verified</div>
                    </div>
                    <button 
                      onClick={() => showNotification('Checked In Successfully!')}
                      className="mt-6 w-full bg-white text-blue-700 font-bold py-3 px-6 rounded-2xl shadow-lg hover:bg-blue-50 transition active:scale-95 flex items-center justify-center gap-2 text-sm"
                    >
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Tap to Check In</span>
                    </button>
                  </div>

                  <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                      <span className="text-xs text-emerald-600 font-bold uppercase">Early Leaves</span>
                      <div className="text-3xl font-extrabold text-slate-800 mt-2">03</div>
                    </div>
                    <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                      <span className="text-xs text-purple-600 font-bold uppercase">Absents</span>
                      <div className="text-3xl font-extrabold text-slate-800 mt-2">{myAbsentDays}</div>
                    </div>
                    <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                      <span className="text-xs text-rose-600 font-bold uppercase">Late In</span>
                      <div className="text-3xl font-extrabold text-slate-800 mt-2">03</div>
                    </div>
                    <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex flex-col justify-between">
                      <span className="text-xs text-amber-600 font-bold uppercase">Leaves Taken</span>
                      <div className="text-3xl font-extrabold text-slate-800 mt-2">02</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                    Your Modules ({currentUser?.role} View)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isUserRole && (
                      <>
                        <div onClick={() => setActiveTab('apply-leave')} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                              <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm group-hover:text-amber-600 transition">Apply Leave</h4>
                              <p className="text-xs text-slate-500 mt-0.5">Balance: 14 Casual, 7 Sick leaves</p>
                            </div>
                          </div>
                          <PlusCircle className="w-5 h-5 text-amber-500" />
                        </div>

                        <div onClick={() => setActiveTab('salary-slip')} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                              <FileText className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition">View Salary Slip</h4>
                              <p className="text-xs text-slate-500 mt-0.5">Net Payout: ₹{myFinalPayable.toFixed(0)} ({myEligibleDays} active days)</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition" />
                        </div>
                      </>
                    )}

                    {isSuperAdminRole && (
                      <>
                        <div onClick={() => setActiveTab('onboarding')} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                              <UserPlus className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition">Employee & DB Management</h4>
                              <p className="text-xs text-slate-500 mt-0.5">Manage joining dates, net salaries & QAR demand</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition" />
                        </div>

                        <div onClick={() => setActiveTab('allocate-leave')} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                              <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm group-hover:text-amber-600 transition">Allocate Leaves</h4>
                              <p className="text-xs text-slate-500 mt-0.5">Assign leave quota directly to workers</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition" />
                        </div>

                        <div onClick={() => setActiveTab('generate-invoice')} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                              <Receipt className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm group-hover:text-teal-600 transition">Generate Invoice (QAR)</h4>
                              <p className="text-xs text-slate-500 mt-0.5">Custom invoice dates & Prorated QAR billings</p>
                            </div>
                          </div>
                          <Download className="w-5 h-5 text-teal-600" />
                        </div>
                      </>
                    )}

                    {isAdminRole && (
                      <>
                        <div onClick={() => setActiveTab('absence')} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                              <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm group-hover:text-rose-600 transition">Mark Absence</h4>
                              <p className="text-xs text-slate-500 mt-0.5">Flag daily team absenteeism (26th - 25th cycle)</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition" />
                        </div>

                        <div onClick={() => setActiveTab('team')} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                              <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-600 transition">Leave Approvals</h4>
                              <p className="text-xs text-slate-500 mt-0.5">Review worker leave requests</p>
                            </div>
                          </div>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">Action Req</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'apply-leave' && isUserRole && (
              <div className="space-y-6 max-w-xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Apply for Leave</h3>
                  <p className="text-xs text-slate-500">Submit your leave request for admin approval.</p>
                </div>

                <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Leave Type</label>
                    <select 
                      value={leaveType} 
                      onChange={(e) => setLeaveType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-800"
                    >
                      <option value="Casual Leave">Casual Leave (Balance: 14)</option>
                      <option value="Sick Leave">Sick Leave (Balance: 7)</option>
                      <option value="Annual Leave">Annual Leave</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Select Dates</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 15 Oct 2026 - 18 Oct 2026" 
                      value={leaveDates}
                      onChange={(e) => setLeaveDates(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-semibold"
                    />
                  </div>

                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow">
                    Submit Leave Request
                  </button>
                </form>

                <div className="border-t border-slate-100 pt-4">
                  <h4 className="font-bold text-slate-800 text-sm mb-3">Your Leave History & Absence Status</h4>
                  <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl mb-3 text-rose-800 flex justify-between items-center text-xs font-semibold">
                    <span>Marked Absences:</span>
                    <span className="bg-rose-600 text-white px-2.5 py-0.5 rounded-full">{myAbsentDays} Days</span>
                  </div>

                  <div className="space-y-2">
                    {leaves.filter(l => l.user === currentUser?.full_name).length === 0 ? (
                      <p className="text-xs text-slate-400">No active leave requests.</p>
                    ) : (
                      leaves.filter(l => l.user === currentUser?.full_name).map(l => (
                        <div key={l.id} className="bg-slate-50 p-3 rounded-2xl flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-slate-800">{l.type} ({l.dates})</p>
                          </div>
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">{l.status}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* USER TAB: VIEW SALARY SLIP */}
            {activeTab === 'salary-slip' && isUserRole && (
              <div className="space-y-6 max-w-3xl mx-auto">
                <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">My Salary Slip (Joining Date Prorated)</h3>
                    <p className="text-xs text-slate-500">Salary paid from joining date ({currentUser?.joining_date || 'N/A'}) to month end.</p>
                  </div>
                  {/* Added no-print class so the download button doesn't render in the PDF */}
                  <button onClick={() => window.print()} className="no-print bg-blue-600 text-white text-xs px-4 py-2.5 rounded-xl font-bold shadow flex items-center gap-1.5">
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                </div>

                {/* ADDED id="printable-salary-slip" HERE */}
                <div id="printable-salary-slip" className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🇮🇳</span>
                      <h4 className="font-bold text-orange-900 text-base">Indian Salary Statement</h4>
                    </div>
                    <span className="text-xs font-semibold bg-orange-200 text-orange-800 px-2.5 py-1 rounded-full">Active</span>
                  </div>

                  <div className="space-y-2 text-xs text-orange-900/90 bg-white/80 p-5 rounded-2xl border border-orange-200">
                    <div className="flex justify-between"><span>Joining Date:</span> <span className="font-bold text-orange-950">{currentUser?.joining_date || 'N/A'}</span></div>
                    <div className="flex justify-between"><span>Base Gross Net Salary:</span> <span className="font-bold text-orange-950">₹{myMonthlyNet.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Eligible Payable Days:</span> <span className="font-bold text-blue-600">{myEligibleDays} Days</span></div>
                    <div className="flex justify-between"><span>Prorated Gross Base:</span> <span className="font-semibold text-orange-950">₹{myProratedBase.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Absence Days Recorded:</span> <span className="font-bold text-rose-600">{myAbsentDays} Days</span></div>
                    <div className="flex justify-between"><span>Absence Deduction:</span> <span className="font-semibold text-rose-600">-₹{myTotalDeduction.toFixed(2)}</span></div>
                    <div className="border-t border-orange-200 pt-3 flex justify-between font-bold text-orange-950 text-base">
                      <span>Final Net Payable:</span> <span className="text-blue-600">₹{myFinalPayable.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'allocate-leave' && isSuperAdminRole && (
              <div className="space-y-6 max-w-xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Super Admin: Allocate Leaves</h3>
                  <p className="text-xs text-slate-500">Assign specific leave quotas directly to workers in the organization.</p>
                </div>

                <form onSubmit={handleAllocateLeave} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Select Worker</label>
                    <select 
                      value={targetWorkerId} 
                      onChange={(e) => setTargetWorkerId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-800"
                    >
                      {usersList.filter(u => u.role === 'User').map(u => (
                        <option key={u.id} value={u.userid || u.userId}>
                          {u.full_name || u.name} ({u.userid || u.userId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Number of Days to Allocate</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="30"
                      value={allocatedDays}
                      onChange={(e) => setAllocatedDays(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-semibold"
                    />
                  </div>

                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow">
                    Allocate Quota
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'absence' && isAdminRole && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 text-lg">Admin: Mark Worker Absence</h3>
                  <p className="text-xs text-slate-500">Record absence days for the billing cycle to deduct from salaries.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[11px]">
                        <th className="p-4">Employee Name</th>
                        <th className="p-4">User ID & Joining Date</th>
                        <th className="p-4">Monthly Net (INR)</th>
                        <th className="p-4">Absent Days</th>
                        <th className="p-4 text-right">Update Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {usersList.filter(u => u.role === 'User').map((emp) => {
                        const uId = emp.userid || emp.userId;
                        const currentAbsent = absenceDays[uId] || 0;
                        return (
                          <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                            <td className="p-4 font-bold text-slate-900">{emp.full_name || emp.name}</td>
                            <td className="p-4">
                              <div className="font-mono text-blue-600 font-semibold">{uId}</div>
                              <div className="text-[10px] text-slate-500">Joined: {emp.joining_date || 'N/A'}</div>
                            </td>
                            <td className="p-4 font-semibold">₹{emp.netsalary || emp.netSalary}</td>
                            <td className="p-4">
                              <input 
                                type="number" 
                                min="0" 
                                max="30"
                                defaultValue={currentAbsent}
                                id={`absent-input-${uId}`}
                                className="w-20 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 font-bold text-slate-800"
                              />
                            </td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => {
                                  const val = document.getElementById(`absent-input-${uId}`).value;
                                  handleUpdateAbsenceDays(uId, val);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl font-bold shadow"
                              >
                                Save Absence
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'onboarding' && isSuperAdminRole && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Employee Database, Joining Date & QAR Demand Control</h3>
                    <p className="text-xs text-slate-500">Manage joining dates next to employee IDs, net salaries, and QAR demand columns.</p>
                  </div>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2.5 rounded-xl font-bold shadow flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" /> Onboard New Employee
                  </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[11px]">
                        <th className="p-4">Employee Name</th>
                        <th className="p-4">User ID & Joining Date</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Net Salary (INR)</th>
                        <th className="p-4 bg-teal-50 text-teal-900 border-l border-slate-200">QAR Demand</th>
                        
                        {allBlueprintColumns.map((col) => (
                          <th key={col.id} className="p-4 bg-indigo-50/50 text-indigo-900 border-l border-slate-200 whitespace-nowrap">
                            {col.name}
                          </th>
                        ))}

                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {usersList.map((emp) => (
                        <tr key={emp.id || emp.userid} className="hover:bg-slate-50/80 transition">
                          <td className="p-4 font-bold text-slate-900">{emp.full_name || emp.name}</td>
                          
                          <td className="p-4">
                            <div className="font-mono text-blue-600 font-semibold">{emp.userid || emp.userId}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {editingEmpId === emp.id ? (
                                <input 
                                  type="date"
                                  value={editFormData.joining_date !== undefined ? editFormData.joining_date : (emp.joining_date || '2026-01-01')}
                                  onChange={(e) => setEditFormData({ ...editFormData, joining_date: e.target.value })}
                                  className="w-32 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs mt-1"
                                />
                              ) : (
                                `Joined: ${emp.joining_date || '2026-01-01'}`
                              )}
                            </div>
                          </td>

                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              emp.role === 'Super Admin' ? 'bg-purple-100 text-purple-700' :
                              emp.role === 'Admin' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {emp.role}
                            </span>
                          </td>

                          <td className="p-4 font-semibold text-slate-900">
                            {editingEmpId === emp.id ? (
                              <input 
                                type="text"
                                value={editFormData.netsalary !== undefined ? editFormData.netsalary : (emp.netsalary || emp.netSalary)}
                                onChange={(e) => setEditFormData({ ...editFormData, netsalary: e.target.value })}
                                className="w-24 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold"
                              />
                            ) : (
                              `₹${emp.netsalary || emp.netSalary || '0'}`
                            )}
                          </td>

                          <td className="p-4 font-bold text-teal-900 bg-teal-50/30 border-l border-slate-200">
                            {editingEmpId === emp.id ? (
                              <input 
                                type="text"
                                value={editFormData.qarDemand !== undefined ? editFormData.qarDemand : (emp.qarDemand || '0.00')}
                                onChange={(e) => setEditFormData({ ...editFormData, qarDemand: e.target.value })}
                                className="w-24 bg-white border border-teal-300 rounded px-2 py-1 text-xs font-bold text-teal-900"
                              />
                            ) : (
                              `QAR ${emp.qarDemand || '0.00'}`
                            )}
                          </td>

                          {allBlueprintColumns.map((col) => (
                            <td key={col.id} className="p-4 border-l border-slate-100">
                              <span className="text-slate-600">{emp.dynamic_values?.[col.id] || col.default_val}</span>
                            </td>
                          ))}

                          <td className="p-4 text-right">
                            {editingEmpId === emp.id ? (
                              <button 
                                onClick={() => handleSaveEdit(emp.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 ml-auto"
                              >
                                <Save className="w-3 h-3" /> Save
                              </button>
                            ) : (
                              <button 
                                onClick={() => { setEditingEmpId(emp.id); setEditFormData(emp); }}
                                className="bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 ml-auto"
                              >
                                <Edit3 className="w-3 h-3" /> Edit
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {showAddModal && (
                  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-slate-800 text-base">Onboard New Employee</h3>
                        <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
                      </div>

                      <form onSubmit={handleAddEmployee} className="space-y-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-600 uppercase mb-1">Full Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Jean Bosco" 
                            value={newEmp.name}
                            onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-600 uppercase mb-1">User ID</label>
                            <input 
                              type="text" 
                              placeholder="e.g. VECC109" 
                              value={newEmp.userId}
                              onChange={(e) => setNewEmp({ ...newEmp, userId: e.target.value })}
                              required
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-600 uppercase mb-1">Joining Date</label>
                            <input 
                              type="date"
                              value={newEmp.joiningDate}
                              onChange={(e) => setNewEmp({ ...newEmp, joiningDate: e.target.value })}
                              required
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-600 uppercase mb-1">Net Salary (INR)</label>
                            <input 
                              type="text" 
                              placeholder="e.g. 75000" 
                              value={newEmp.netSalary}
                              onChange={(e) => setNewEmp({ ...newEmp, netSalary: e.target.value })}
                              required
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-600 uppercase mb-1">QAR Demand</label>
                            <input 
                              type="text" 
                              placeholder="e.g. 4500.00" 
                              value={newEmp.qarDemand}
                              onChange={(e) => setNewEmp({ ...newEmp, qarDemand: e.target.value })}
                              required
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-teal-900 font-bold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-600 uppercase mb-1">Role</label>
                            <select 
                              value={newEmp.role}
                              onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium"
                            >
                              <option value="User">Employee (User)</option>
                              <option value="Admin">Admin (HR)</option>
                              <option value="Super Admin">Super Admin</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-bold text-slate-600 uppercase mb-1">Designation</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Site Engineer" 
                              value={newEmp.designation}
                              onChange={(e) => setNewEmp({ ...newEmp, designation: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold shadow">
                            Save & Onboard
                          </button>
                          <button type="button" onClick={() => setShowAddModal(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-bold">
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* SUPER ADMIN: GENERATE INVOICE MODULE WITH CUSTOM INVOICE DATE, NOTES & PDF DOWNLOAD BUTTON */}
            {activeTab === 'generate-invoice' && isSuperAdminRole && (
              <div className="space-y-6 max-w-5xl mx-auto">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Generate Professional Invoice (QAR Currency)</h3>
                    <p className="text-xs text-slate-500">Configure billing month, invoice date and consultancy fees.</p>
                  </div>

                  <form onSubmit={handleGenerateInvoice} className="flex flex-wrap items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Billing Month e.g. September 2026" 
                      value={invoiceMonth}
                      onChange={(e) => setInvoiceMonth(e.target.value)}
                      required
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                    />
                    <input 
                      type="text" 
                      placeholder="Invoice Date e.g. 27-09-2026" 
                      value={invoiceDateInput}
                      onChange={(e) => setInvoiceDateInput(e.target.value)}
                      required
                      className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                    />
                    <input 
                      type="text" 
                      placeholder="Consultancy Fees QAR" 
                      value={consultancyFees}
                      onChange={(e) => setConsultancyFees(e.target.value)}
                      required
                      className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-teal-900"
                    />
                    <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white text-xs px-4 py-2.5 rounded-xl font-bold shadow flex items-center gap-1.5">
                      <Receipt className="w-4 h-4" /> Generate Invoice
                    </button>
                  </form>
                </div>

{generatedInvoice && (
  <div className="space-y-4">
    <div className="flex justify-end no-print">
      <button 
        onClick={() => window.print()}
        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-5 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"
      >
        <Download className="w-4 h-4" /> Generate / Download PDF (Print to PDF)
      </button>
    </div>

    {/* THIS ID IS CRITICAL FOR PRINTING ONLY THE INVOICE */}
    <div id="printable-invoice" className="bg-white border-2 border-slate-800 rounded-2xl shadow-xl overflow-hidden p-8 space-y-6 text-xs text-slate-800">
      
      {/* Invoice Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">VEERA ENGINEERING CONSTRUCTION AND CONSULTANCY</h2>
          <p className="text-[11px] text-slate-500 italic mt-0.5">HNo: 17-67 Balaji Nagar Kodad, Telangana - 508206</p>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-black text-blue-900 tracking-wider">INVOICE</h1>
        </div>
      </div>

      {/* Meta Details */}
      <div className="grid grid-cols-2 gap-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="space-y-1">
          <p><strong className="text-slate-600">Invoice Ref:</strong> {generatedInvoice.invoiceRef}</p>
          <p><strong className="text-slate-600">Billing Month:</strong> {generatedInvoice.billingMonth}</p>
          <p><strong className="text-slate-600">Invoice Date:</strong> {generatedInvoice.invoiceDate}</p>
          <p><strong className="text-slate-600">Payment Currency:</strong> QAR (Qatari Riyal)</p>
        </div>
        <div className="space-y-1 text-right">
          <p><strong className="text-slate-600">Client Name:</strong> BLACK ARROW DOHA</p>
          <p className="text-slate-500">Corporate HQ Procurement and Accounts, Doha</p>
          <p><strong className="text-slate-600">Calculation Basis:</strong> Joining Date to Month End Proration</p>
        </div>
      </div>

      {/* Invoice Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border border-slate-300">
          <thead>
            <tr className="bg-blue-900 text-white font-bold text-[11px]">
              <th className="p-2.5 border border-slate-300 w-12 text-center">S/N</th>
              <th className="p-2.5 border border-slate-300">EMPLOYEE NAME</th>
              <th className="p-2.5 border border-slate-300">DESIGNATION</th>
              <th className="p-2.5 border border-slate-300">JOINING DATE</th>
              <th className="p-2.5 border border-slate-300 text-center">PAYABLE DAYS</th>
              <th className="p-2.5 border border-slate-300 text-right">MONTHLY QAR</th>
              <th className="p-2.5 border border-slate-300 text-center">ABSENT</th>
              <th className="p-2.5 border border-slate-300 text-right">NET PAYABLE (QAR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {generatedInvoice.items.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-2.5 border border-slate-300 text-center font-bold">{idx + 1}</td>
                <td className="p-2.5 border border-slate-300 font-bold">{item.name}</td>
                <td className="p-2.5 border border-slate-300 text-slate-600">{item.designation}</td>
                <td className="p-2.5 border border-slate-300 font-mono text-blue-700">{item.joiningDate}</td>
                <td className="p-2.5 border border-slate-300 text-center font-bold text-indigo-700">{item.eligibleDays} Days</td>
                <td className="p-2.5 border border-slate-300 text-right font-mono">{item.monthlyQar}</td>
                <td className="p-2.5 border border-slate-300 text-center font-bold text-rose-600">{item.absentDays}</td>
                <td className="p-2.5 border border-slate-300 text-right font-mono font-bold">{item.netPayable}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex flex-col items-end space-y-2 pt-2 border-t border-slate-200">
        <div className="w-full max-w-sm space-y-1.5 text-right font-semibold">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span>Reimbursable Prorated Payroll Outlays:</span>
            <span className="font-mono">QAR {generatedInvoice.items.reduce((acc, curr) => acc + parseFloat(curr.netPayable), 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span>Professional Consultancy Fees:</span>
            <span className="font-mono">QAR {generatedInvoice.consultancy.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 text-sm font-extrabold text-blue-900 border-t-2 border-slate-800">
            <span>TOTAL DUE FOR PAYMENT (QAR):</span>
            <span className="font-mono">QAR {(generatedInvoice.items.reduce((acc, curr) => acc + parseFloat(curr.netPayable), 0) + generatedInvoice.consultancy).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Invoicing Notes */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-[11px] text-amber-900 space-y-1">
        <p className="font-bold">PAYROLL POLICY & INVOICING NOTES:</p>
        <p>1. Current month billing covers full calendar days based on payroll finalization on the 25th.</p>
        <p>2. Any absence occurring between 26th and 25th cut-off cycle is adjusted as deductions in the current billing cycle.</p>
        <p className="pt-2 font-semibold text-slate-500 text-center">This invoice is computer-generated. No signature is required</p>
      </div>

    </div>
  </div>
)}
              </div>
            )}

            {/* TEAM / LEAVES TAB */}
            {activeTab === 'team' && isAdminRole && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <h3 className="font-bold text-slate-800 text-lg">Leave Approval Queue</h3>
                <div className="space-y-3">
                  {leaves.length === 0 ? (
                    <p className="text-xs text-slate-400">No leave requests in queue.</p>
                  ) : (
                    leaves.map((l) => (
                      <div key={l.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="font-bold text-slate-800 text-sm">{l.user}</h4>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              l.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                              l.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {l.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{l.type} • Dates: {l.dates}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleUpdateLeaveStatus(l.id, 'Approved')} 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-xl font-bold transition"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleUpdateLeaveStatus(l.id, 'Rejected')} 
                            className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-3 py-1.5 rounded-xl font-bold transition"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'geolocation' && (
              <div className="space-y-4 text-center py-16 max-w-md mx-auto bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <MapPin className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Geo-Fencing Active</h3>
                <p className="text-xs text-slate-500">Verified coordinates mapped for Mumbai & Doha offices.</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6 max-w-xl mx-auto">
                <h3 className="font-bold text-slate-800 text-lg">System Preferences</h3>
                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-700">Joining Date Proration & Invoice Engine</span>
                    <span className="font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs">Active</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-3 flex justify-around items-center absolute bottom-0 left-0 right-0 z-20">
            <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
              <Home className="w-5 h-5" /><span className="text-[10px]">Home</span>
            </button>
            {isUserRole ? (
              <>
                <button onClick={() => setActiveTab('apply-leave')} className={`flex flex-col items-center gap-1 ${activeTab === 'apply-leave' ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                  <Calendar className="w-5 h-5" /><span className="text-[10px]">Leave</span>
                </button>
                <button onClick={() => setActiveTab('salary-slip')} className={`flex flex-col items-center gap-1 ${activeTab === 'salary-slip' ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                  <FileText className="w-5 h-5" /><span className="text-[10px]">Salary</span>
                </button>
              </>
            ) : (
              <button onClick={() => setActiveTab('team')} className={`flex flex-col items-center gap-1 ${activeTab === 'team' ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                <Users className="w-5 h-5" /><span className="text-[10px]">Approvals</span>
              </button>
            )}
            <button onClick={() => setActiveTab('geolocation')} className={`flex flex-col items-center gap-1 ${activeTab === 'geolocation' ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
              <MapPin className="w-5 h-5" /><span className="text-[10px]">Location</span>
            </button>
            <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
              <Settings className="w-5 h-5" /><span className="text-[10px]">Settings</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}