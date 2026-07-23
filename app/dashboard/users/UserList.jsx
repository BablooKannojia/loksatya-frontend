'use client';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../../src/API";
import ChangePasswordModal from "../../../src/Components/AdminComponets/ChangePasswordModal";
import { 
  FiSearch, 
  FiTrash2, 
  FiKey, 
  FiCheckCircle, 
  FiShield, 
  FiX, 
  FiAlertTriangle 
} from "react-icons/fi";

const UserList = () => {
  const [userData, setUserData] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [value, setValue] = useState("");
  const [filterItem, setFilterItem] = useState("id");
  const [filterItemResponse, setFilterItemResponse] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch all users
  const getAllUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/user`);
      setUserData(response.data);
    } catch (error) {
      console.error("Error in getting all users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  // Modal Handlers
  const showModal = (user) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const showVerifyModal = (user) => {
    setCurrentUser(user);
    setIsVerifyModalOpen(true);
  };

  const showDeleteModal = (user) => {
    setCurrentUser(user);
    setIsModalDeleteOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setCurrentUser({});
    getAllUsers();
  };

  const handleVerifyCancel = () => {
    setIsVerifyModalOpen(false);
    setCurrentUser({});
    getAllUsers();
  };

  const handleDeleteCancel = () => {
    setIsModalDeleteOpen(false);
    setCurrentUser({});
    getAllUsers();
  };

  // Change Role API
  const changeRole = async () => {
    try {
      await axios.put(`${API_URL}/role`, {
        id: currentUser._id,
        role: value,
      });
      setIsModalOpen(false);
      setCurrentUser({});
      getAllUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // Verify User API
  const verifyUser = async () => {
    try {
      await axios.put(`${API_URL}/register`, {
        id: currentUser._id,
      });
      setIsVerifyModalOpen(false);
      setCurrentUser({});
      getAllUsers();
    } catch (err) {
      console.error("Error in verify user:", err);
    }
  };

  // Delete User API
  const onDelete = async () => {
    try {
      await axios.delete(`${API_URL}/user?id=${currentUser._id}`);
      setIsModalDeleteOpen(false);
      setCurrentUser({});
      getAllUsers();
    } catch (err) {
      console.error(err);
      setIsModalDeleteOpen(false);
      setCurrentUser({});
    }
  };

  // Filter Handler
  const onFilter = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/user?${filterItem}=${filterItemResponse}`
      );
      setUserData(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Password Modal Handlers
  const openChangePasswordModal = (user) => {
    setCurrentUser(user);
    setIsChangePasswordOpen(true);
  };

  const closeChangePasswordModal = () => {
    setIsChangePasswordOpen(false);
    setCurrentUser(null);
    getAllUsers();
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Users Management
        </h1>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        
        {/* Filter Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Filter By</label>
            <select
              value={filterItem}
              onChange={(e) => setFilterItem(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="id">By Id</option>
              <option value="registerd">By Registration</option>
              <option value="role">By Role</option>
              <option value="phone">By Phone Number</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Value</label>
            {filterItem === "id" || filterItem === "phone" ? (
              <input
                type="text"
                onChange={(e) => setFilterItemResponse(e.target.value)}
                placeholder={filterItem === "id" ? "Enter ID" : "Enter Phone Number"}
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <select
                onChange={(e) => setFilterItemResponse(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Value</option>
                {filterItem === "role" ? (
                  <>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                    <option value="author">Author</option>
                    <option value="journalist">Journalist</option>
                  </>
                ) : (
                  <>
                    <option value="yes">Verify</option>
                    <option value="no">UnVerify</option>
                  </>
                )}
              </select>
            )}
          </div>

          <div className="flex items-end">
            <button
              onClick={onFilter}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <FiSearch size={16} />
              Filter Results
            </button>
          </div>
        </div>

        {/* Custom Responsive Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse text-sm text-gray-700 dark:text-gray-300">
            <thead className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-400">Loading users...</td>
                </tr>
              ) : userData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-400">No users found.</td>
                </tr>
              ) : (
                userData.map((user, index) => (
                  <tr key={user._id || user.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{index+1 || "N/A"}</td>
                    <td className="py-3 px-4 font-medium">{user.phone || "N/A"}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4 capitalize">{user.role}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          user.registerd
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                        }`}
                      >
                        {user.registerd ? "Verify" : "UnVerify"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <button
                          onClick={() => showModal(user)}
                          className="px-2.5 py-1 text-xs font-medium border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
                        >
                          <FiShield size={13} />
                          Role
                        </button>
                        <button
                          onClick={() => openChangePasswordModal(user)}
                          className="px-2.5 py-1 text-xs font-medium border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
                        >
                          <FiKey size={13} />
                          Password
                        </button>
                        <button
                          disabled={user?.role === "admin"}
                          onClick={user?.role === "admin" ? undefined : () => showDeleteModal(user)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1 ${
                            user?.role === "admin"
                              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-slate-800 dark:border-slate-800"
                              : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400"
                          }`}
                        >
                          <FiTrash2 size={13} />
                          Delete
                        </button>
                        <button
                          onClick={() => showVerifyModal(user)}
                          className="px-2.5 py-1 text-xs font-medium border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
                        >
                          <FiCheckCircle size={13} />
                          Verify
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Custom Modal Components --- */}

      {/* 1. Change Role Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Change Role</h3>
              <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Select New Role</label>
              <select
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Role</option>
                <option value="admin" disabled={currentUser?.role === "admin"}>Admin</option>
                <option value="staff" disabled={currentUser?.role === "staff"}>Staff</option>
                <option value="journalist" disabled={currentUser?.role === "journalist"}>Journalist</option>
                <option value="author" disabled={currentUser?.role === "author"}>Author</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800">
                Cancel
              </button>
              <button onClick={changeRole} className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Verify User Modal */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Verify User</h3>
              <button onClick={handleVerifyCancel} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Are you sure you want to change registration state for this user?</p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={handleVerifyCancel} className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800">
                Cancel
              </button>
              <button onClick={verifyUser} className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                Confirm Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Delete Modal */}
      {isModalDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950/50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <FiAlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-extrabold text-red-600 dark:text-red-500">Are You Sure?</h3>
            <p className="text-xs text-gray-500">This action cannot be undone. This user will be permanently removed.</p>
            <div className="flex justify-center gap-3 pt-2">
              <button onClick={handleDeleteCancel} className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800">
                Cancel
              </button>
              <button onClick={onDelete} className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={closeChangePasswordModal}
          user={currentUser}
        />
      )}
    </div>
  );
};

export default UserList;