import { useMemo, useState } from "react";

import AdministrationStats from "@/components/administration/AdministrationStats";
import AdministrationTabs, {
  type AdminTab,
} from "@/components/administration/AdministrationTabs";

import UsersTable from "@/components/administration/UsersTable";
import RolesTable from "@/components/administration/RolesTable";
import CompaniesTable from "@/components/administration/CompaniesTable";
import ActivityLogsTable from "@/components/administration/ActivityLogsTable";

import AddUserModal from "@/components/administration/AddUserModal";
import AddRoleModal from "@/components/administration/AddRoleModal";
import AddCompanyModal from "@/components/administration/AddCompanyModal";

import ViewModal from "@/components/administration/ViewModal";
import DeleteModal from "@/components/administration/DeleteModal";

import {
  adminStats,
  users as initialUsers,
  roles as initialRoles,
  companies as initialCompanies,
  activityLogs,
} from "@/data/administration";

import type {
  User,
  Role,
  Company,
  ActivityLog,
  AddUserForm,
  AddRoleForm,
  AddCompanyForm,
} from "@/types/administration";

const AdminPage = () => {

  /* ----------------------------- */
  /* Main Data                     */
  /* ----------------------------- */

  const [users, setUsers] =
    useState<User[]>(initialUsers);

  const [roles, setRoles] =
    useState<Role[]>(initialRoles);

  const [companies, setCompanies] =
    useState<Company[]>(initialCompanies);

  const [logs] =
    useState<ActivityLog[]>(activityLogs);

  /* ----------------------------- */
  /* Active Tab                    */
  /* ----------------------------- */

  const [activeTab, setActiveTab] =
    useState<AdminTab>("users");

  /* ----------------------------- */
  /* Search                        */
  /* ----------------------------- */

  const [userSearch, setUserSearch] =
    useState("");

  const [roleSearch, setRoleSearch] =
    useState("");

  const [companySearch, setCompanySearch] =
    useState("");

  const [activitySearch, setActivitySearch] =
    useState("");

  /* ----------------------------- */
  /* Add/Edit Modals               */
  /* ----------------------------- */

  const [showUserModal, setShowUserModal] =
    useState(false);

  const [showRoleModal, setShowRoleModal] =
    useState(false);

  const [showCompanyModal, setShowCompanyModal] =
    useState(false);

  const [userModalMode, setUserModalMode] =
    useState<"add" | "edit">("add");

  const [roleModalMode, setRoleModalMode] =
    useState<"add" | "edit">("add");

  const [companyModalMode, setCompanyModalMode] =
    useState<"add" | "edit">("add");

  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);

  const [selectedRole, setSelectedRole] =
    useState<Role | null>(null);

  const [selectedCompany, setSelectedCompany] =
    useState<Company | null>(null);

      /* ----------------------------- */
  /* View Modal                    */
  /* ----------------------------- */

  const [showViewModal, setShowViewModal] =
    useState(false);

  const [viewType, setViewType] =
    useState<"user" | "role" | "company">("user");

  const [viewData, setViewData] =
    useState<User | Role | Company | null>(null);

  /* ----------------------------- */
  /* Delete Modal                  */
  /* ----------------------------- */

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [deleteType, setDeleteType] =
    useState<"user" | "role" | "company">("user");

  const [deleteName, setDeleteName] =
    useState("");

  const [deleteId, setDeleteId] =
    useState<number | null>(null);

  /* ----------------------------- */
  /* Statistics                    */
  /* ----------------------------- */

  const stats = useMemo(() => {

    return adminStats.map((stat) => {

      switch (stat.title) {

        case "Total Users":
          return {
            ...stat,
            value: users.length,
          };

        case "Companies":
          return {
            ...stat,
            value: companies.length,
          };

        case "Roles":
          return {
            ...stat,
            value: roles.length,
          };

        case "Activity Logs":
          return {
            ...stat,
            value: logs.length,
          };

        default:
          return stat;

      }

    });

  }, [users, roles, companies, logs]);

  /* ----------------------------- */
  /* Add / Edit User               */
  /* ----------------------------- */

  const saveUser = (
    form: AddUserForm
  ) => {

    if (userModalMode === "add") {

      setUsers((previous) => [

        ...previous,

        {
          id: Date.now(),
          ...form,
          lastLogin: "Just Now",
        },

      ]);

      return;

    }

    if (!selectedUser) return;

    setUsers((previous) =>
      previous.map((user) =>
        user.id === selectedUser.id
          ? {
              ...user,
              ...form,
            }
          : user
      )
    );

  };

  /* ----------------------------- */
  /* Add / Edit Role               */
  /* ----------------------------- */

  const saveRole = (
    form: AddRoleForm
  ) => {

    if (roleModalMode === "add") {

      setRoles((previous) => [

        ...previous,

        {
          id: Date.now(),
          users: 0,
          ...form,
        },

      ]);

      return;

    }

    if (!selectedRole) return;

    setRoles((previous) =>
      previous.map((role) =>
        role.id === selectedRole.id
          ? {
              ...role,
              ...form,
            }
          : role
      )
    );

  };

    /* ----------------------------- */
  /* Add / Edit Company            */
  /* ----------------------------- */

  const saveCompany = (
    form: AddCompanyForm
  ) => {

    if (companyModalMode === "add") {

      setCompanies((previous) => [

        ...previous,

        {
          id: Date.now(),
          ...form,
        },

      ]);

      return;

    }

    if (!selectedCompany) return;

    setCompanies((previous) =>
      previous.map((company) =>
        company.id === selectedCompany.id
          ? {
              ...company,
              ...form,
            }
          : company
      )
    );

  };

  /* ----------------------------- */
  /* View Handlers                 */
  /* ----------------------------- */

  const openUserView = (
    user: User
  ) => {

    setViewType("user");
    setViewData(user);
    setShowViewModal(true);

  };

  const openRoleView = (
    role: Role
  ) => {

    setViewType("role");
    setViewData(role);
    setShowViewModal(true);

  };

  const openCompanyView = (
    company: Company
  ) => {

    setViewType("company");
    setViewData(company);
    setShowViewModal(true);

  };

  /* ----------------------------- */
  /* Edit Handlers                 */
  /* ----------------------------- */

  const editUser = (
    user: User
  ) => {

    setSelectedUser(user);
    setUserModalMode("edit");
    setShowUserModal(true);

  };

  const editRole = (
    role: Role
  ) => {

    setSelectedRole(role);
    setRoleModalMode("edit");
    setShowRoleModal(true);

  };

  const editCompany = (
    company: Company
  ) => {

    setSelectedCompany(company);
    setCompanyModalMode("edit");
    setShowCompanyModal(true);

  };

  /* ----------------------------- */
  /* Delete Handlers               */
  /* ----------------------------- */

  const askDeleteUser = (
    user: User
  ) => {

    setDeleteType("user");
    setDeleteId(user.id);
    setDeleteName(user.name);
    setShowDeleteModal(true);

  };

  const askDeleteRole = (
    role: Role
  ) => {

    setDeleteType("role");
    setDeleteId(role.id);
    setDeleteName(role.name);
    setShowDeleteModal(true);

  };

  const askDeleteCompany = (
    company: Company
  ) => {

    setDeleteType("company");
    setDeleteId(company.id);
    setDeleteName(company.name);
    setShowDeleteModal(true);

  };

    /* ----------------------------- */
  /* Confirm Delete                */
  /* ----------------------------- */

  const confirmDelete = () => {

    if (deleteId === null) return;

    switch (deleteType) {

      case "user":

        setUsers((previous) =>
          previous.filter(
            (user) => user.id !== deleteId
          )
        );

        break;

      case "role":

        setRoles((previous) =>
          previous.filter(
            (role) => role.id !== deleteId
          )
        );

        break;

      case "company":

        setCompanies((previous) =>
          previous.filter(
            (company) => company.id !== deleteId
          )
        );

        break;

    }

    setShowDeleteModal(false);
    setDeleteId(null);
    setDeleteName("");

  };

  /* ----------------------------- */
  /* Add Button Handlers           */
  /* ----------------------------- */

  const openAddUser = () => {

    setSelectedUser(null);
    setUserModalMode("add");
    setShowUserModal(true);

  };

  const openAddRole = () => {

    setSelectedRole(null);
    setRoleModalMode("add");
    setShowRoleModal(true);

  };

  const openAddCompany = () => {

    setSelectedCompany(null);
    setCompanyModalMode("add");
    setShowCompanyModal(true);

  };

  /* ----------------------------- */
  /* Page                          */
  /* ----------------------------- */

  return (

    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col gap-2">

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Administration
        </h1>

        <p className="text-slate-500 dark:text-slate-400">
          Manage users, roles, companies and activity logs.
        </p>

      </div>

      {/* Statistics */}

      <AdministrationStats
        stats={stats}
      />

      {/* Tabs */}

      <AdministrationTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        userCount={users.length}
        roleCount={roles.length}
        companyCount={companies.length}
        activityCount={logs.length}
      />

            {/* Users */}

      {activeTab === "users" && (

        <UsersTable
          users={users}
          searchTerm={userSearch}
          onSearchChange={setUserSearch}
          onAddUser={openAddUser}
          onView={openUserView}
          onEdit={editUser}
          onDelete={askDeleteUser}
        />

      )}

      {/* Roles */}

      {activeTab === "roles" && (

        <RolesTable
          roles={roles}
          searchTerm={roleSearch}
          onSearchChange={setRoleSearch}
          onAddRole={openAddRole}
          onView={openRoleView}
          onEdit={editRole}
          onDelete={askDeleteRole}
        />

      )}

      {/* Companies */}

      {activeTab === "companies" && (

        <CompaniesTable
          companies={companies}
          searchTerm={companySearch}
          onSearchChange={setCompanySearch}
          onAddCompany={openAddCompany}
          onView={openCompanyView}
          onEdit={editCompany}
          onDelete={askDeleteCompany}
        />

      )}

      {/* Activity Logs */}

      {activeTab === "activity" && (

        <ActivityLogsTable
          logs={logs}
          searchTerm={activitySearch}
          onSearchChange={setActivitySearch}
        />

      )}

            {/* Add User Modal */}

      <AddUserModal
        open={showUserModal}
        mode={userModalMode}
        user={selectedUser}
        onClose={() => setShowUserModal(false)}
        onSave={saveUser}
      />

      {/* Add Role Modal */}

      <AddRoleModal
        open={showRoleModal}
        mode={roleModalMode}
        role={selectedRole}
        onClose={() => setShowRoleModal(false)}
        onSave={saveRole}
      />

      {/* Add Company Modal */}

      <AddCompanyModal
        open={showCompanyModal}
        mode={companyModalMode}
        company={selectedCompany}
        onClose={() => setShowCompanyModal(false)}
        onSave={saveCompany}
      />

      {/* View Modal */}

      <ViewModal
        open={showViewModal}
        type={viewType}
        data={viewData}
        onClose={() => {
          setShowViewModal(false);
          setViewData(null);
        }}
      />

      {/* Delete Modal */}

      <DeleteModal
        open={showDeleteModal}
        type={deleteType}
        name={deleteName}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteId(null);
          setDeleteName("");
        }}
        onDelete={confirmDelete}
      />

    </div>

  );
};

export default AdminPage;