"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Plus, TrashIcon } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import {
  fetchUsers,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
  addAdmin,
} from "@/lib/api";
import { exportToPDF } from "@/lib/pdf-export";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// You should get this from auth context or props in real app
const CURRENT_USER_ROLE = "SUPERADMIN"; // or "ADMIN"

export default function UsersPage() {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "ADMIN",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Filter states
  const [roleFilter, setRoleFilter] = useState(""); // ADMIN, SUPERADMIN, USER, ""
  const [isActiveFilter, setIsActiveFilter] = useState(""); // "active", "blocked", ""
  const [balanceFilter, setBalanceFilter] = useState(""); // "asc", "desc", ""
  const [createdAtFilter, setCreatedAtFilter] = useState(""); // "asc", "desc", ""

  // Fetch all users
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      toast({
        title: t("error"),
        description: t("errorOccurred"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadUsers();
    // eslint-disable-next-line
  }, []);

  // Filtering and sorting
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Role filter
    if (roleFilter && roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    // isActive filter
    if (isActiveFilter && isActiveFilter !== "all") {
      filtered = filtered.filter((u) =>
        isActiveFilter === "active" ? u.isActive : !u.isActive
      );
    }

    // Balance sort
    if (balanceFilter && balanceFilter !== "none") {
      filtered = filtered.sort((a, b) =>
        balanceFilter === "asc" ? a.balance - b.balance : b.balance - a.balance
      );
    }

    // CreatedAt sort
    if (createdAtFilter && createdAtFilter !== "none") {
      filtered = filtered.sort((a, b) =>
        createdAtFilter === "asc"
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    return filtered;
  }, [users, roleFilter, isActiveFilter, balanceFilter, createdAtFilter]);

  // Export users to PDF
  const handleExportPDF = () => {
    const columns = [
      { header: t("id"), accessor: "id" },
      { header: t("name"), accessor: "name" },
      { header: t("email"), accessor: "email" },
      { header: t("role"), accessor: "role" },
      { header: t("balance"), accessor: "balance" },
      { header: t("createdAt"), accessor: "createdAt" },
      { header: t("isActive"), accessor: "isActive" },
    ];
    exportToPDF(users, columns, t("users"), "users-export");
  };

  // Update user
  const handleUpdateUser = async (id, data) => {
    try {
      await updateUser(id, data);
      toast({ title: t("success"), description: t("userUpdated") });
      loadUsers();
    } catch {
      toast({
        title: t("error"),
        description: t("errorOccurred"),
        variant: "destructive",
      });
    }
  };

  // Delete user
  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id);
      toast({ title: t("success"), description: t("userDeleted") });
      loadUsers();
    } catch {
      toast({
        title: t("error"),
        description: t("errorOccurred"),
        variant: "destructive",
      });
    }
  };

  // Block user
  const handleBlockUser = async (id) => {
    try {
      await blockUser(id);
      toast({ title: t("success"), description: t("userBlocked") });
      loadUsers();
    } catch {
      toast({
        title: t("error"),
        description: t("errorOccurred"),
        variant: "destructive",
      });
    }
  };

  // Unblock user
  const handleUnblockUser = async (id) => {
    try {
      await unblockUser(id);
      toast({ title: t("success"), description: t("userUnblocked") });
      loadUsers();
    } catch {
      toast({
        title: t("error"),
        description: t("errorOccurred"),
        variant: "destructive",
      });
    }
  };

  // Admin qo'shish uchun validatsiya
  const validateAdmin = (user) => {
    const errs = {};
    if (!user.name || user.name.trim().length < 3) {
      errs.name = t("nameRequired");
    }
    if (!user.email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(user.email)) {
      errs.email = t("emailInvalid");
    }
    if (
      !user.password ||
      user.password.length < 8 ||
      user.password.length > 22
    ) {
      errs.password = t("passwordLength");
    }
    if (!user.role || !["ADMIN", "SUPERADMIN"].includes(user.role)) {
      errs.role = t("roleRequired");
    }
    if (user.role && user.role !== user.role.toUpperCase()) {
      errs.role = t("roleUppercase");
    }
    // SUPERADMIN qo'shish bloklangan (lekin kodi bor, faqat izohda)
    // if (user.role === "SUPERADMIN") {
    //   errs.role = t("superadminAddNotAllowed");
    // }
    return errs;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Role har doim katta harflarda bo'lishi kerak
    const userToAdd = {
      ...newUser,
      role: newUser.role.toUpperCase(),
    };

    const validationErrors = validateAdmin(userToAdd);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setIsSubmitting(false);
      return;
    }

    try {
      if (CURRENT_USER_ROLE === "SUPERADMIN") {
        // SUPERADMIN qo'shishni bloklash (lekin kodi bor)
        if (userToAdd.role === "SUPERADMIN") {
          // Kod bor, lekin ishlamaydi:
          // await addAdmin(userToAdd);
          // toast({ title: t("success"), description: t("adminAdded") });
          toast({
            title: t("error"),
            description:
              t("superadminAddNotAllowed") ||
              "SUPERADMIN qo'shish mumkin emas.",
            variant: "destructive",
          });
        } else {
          await addAdmin(userToAdd);
          toast({ title: t("success"), description: t("adminAdded") });
        }
      } else {
        toast({
          title: t("info"),
          description: t("userAddNotSupported") || "User add is not supported.",
        });
      }
      setNewUser({
        name: "",
        email: "",
        role: "ADMIN",
        password: "",
      });
      setIsAddDialogOpen(false);
      loadUsers();
      setErrors({});
    } catch (error) {
      toast({
        title: t("error"),
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Split users by role
  const admins = useMemo(
    () => users.filter((u) => u.role === "ADMIN" || u.role === "SUPERADMIN"),
    [users]
  );
  const regularUsers = useMemo(
    () => users.filter((u) => u.role === "USER"),
    [users]
  );

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">{t("users")}</h2>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                {t("export")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPDF}>
                {t("downloadPDF")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Only SUPERADMIN can add ADMIN */}
          {CURRENT_USER_ROLE === "SUPERADMIN" && (
            <Button
              size="sm"
              className="bg-button-bg hover:bg-button-hover"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("addAdmin")}
            </Button>
          )}
          {/* All admins can add USER */}
          {CURRENT_USER_ROLE === "ADMIN" && (
            <Button
              size="sm"
              className="bg-button-bg hover:bg-button-hover"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("addUser")}
            </Button>
          )}
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Role filter */}
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[140px] shadow-xl dark:shadow-slate-800 ">
            <SelectValue placeholder={t("allRoles")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allRoles")}</SelectItem>
            <SelectItem value="SUPERADMIN">{t("superadmin")}</SelectItem>
            <SelectItem value="ADMIN">{t("admin")}</SelectItem>
            <SelectItem value="USER">{t("user")}</SelectItem>
          </SelectContent>
        </Select>
        {/* isActive filter */}
        <Select value={isActiveFilter} onValueChange={setIsActiveFilter}>
          <SelectTrigger className="w-[140px] shadow-xl dark:shadow-slate-800">
            <SelectValue placeholder={t("allStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatus")}</SelectItem>
            <SelectItem value="active">{t("active")}</SelectItem>
            <SelectItem value="blocked">{t("blocked")}</SelectItem>
          </SelectContent>
        </Select>
        {/* Balance sort */}
        <Select value={balanceFilter} onValueChange={setBalanceFilter}>
          <SelectTrigger className="w-[140px] shadow-xl dark:shadow-slate-800">
            <SelectValue placeholder={t("balanceSort")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t("balanceSort")}</SelectItem>
            <SelectItem value="asc">{t("balanceAsc")}</SelectItem>
            <SelectItem value="desc">{t("balanceDesc")}</SelectItem>
          </SelectContent>
        </Select>
        {/* CreatedAt sort */}
        <Select value={createdAtFilter} onValueChange={setCreatedAtFilter}>
          <SelectTrigger className="w-[160px] shadow-xl dark:shadow-slate-800">
            <SelectValue placeholder={t("createdAtSort")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t("createdAtSort")}</SelectItem>
            <SelectItem value="asc">{t("createdAtAsc")}</SelectItem>
            <SelectItem value="desc">{t("createdAtDesc")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table (filtered) */}
      <div>
        <h3 className="text-lg font-semibold mb-2">{t("users")}</h3>
        <div className="overflow-auto rounded-md border p-2 bg-background  dark:shadow-slate-800">
          <table className="min-w-full text-xs sm:text-sm md:text-base">
            <thead className="sticky top-0 bg-background z-10">
              <tr>
                <th className="px-2 py-2 text-left">{t("id")}</th>
                <th className="px-2 py-2 text-left">{t("name")}</th>
                <th className="px-2 py-2 text-left">{t("email")}</th>
                <th className="px-2 py-2 text-left">{t("role")}</th>
                <th className="px-2 py-2 text-left">{t("balance")}</th>
                <th className="px-2 py-2 text-left">{t("createdAt")}</th>
                <th className="px-2 py-2 text-left">{t("isActive")}</th>
                <th className="px-2 py-2 text-left">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    {t("loading")}
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {t("noUsers")}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b hover:bg-muted/30 transition"
                  >
                    <td className="px-2 py-2">{user.id}</td>
                    <td className="px-2 py-2">{user.name}</td>
                    <td className="px-2 py-2">{user.email}</td>
                    <td className="px-2 py-2">{user.role}</td>
                    <td className="px-2 py-2">{user.balance}</td>
                    <td className="px-2 py-2">
                      {new Date(user.createdAt).toLocaleString()}
                    </td>
                    <td className="px-2 py-2">
                      {user.isActive ? (
                        <span className="text-green-600 font-semibold">
                          {t("active")}
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold">
                          {t("blocked")}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          user.isActive
                            ? handleBlockUser(user.id)
                            : handleUnblockUser(user.id)
                        }
                      >
                        {user.isActive ? t("block") : t("unblock")}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Dialog: Only for SUPERADMIN */}
      {CURRENT_USER_ROLE === "SUPERADMIN" && (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("addAdmin")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddUser}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    {t("name")}
                  </Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    className="col-span-3"
                    required
                  />
                </div>
                {errors.name && (
                  <div className="col-span-4 text-red-500 text-xs ml-2">
                    {errors.name}
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    {t("email")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="col-span-3"
                    required
                  />
                </div>
                {errors.email && (
                  <div className="col-span-4 text-red-500 text-xs ml-2">
                    {errors.email}
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    {t("role")}
                  </Label>
                  <select
                    id="role"
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        role: e.target.value.toUpperCase(),
                      })
                    }
                    className="col-span-3 rounded-md border px-3 py-2 text-sm"
                    required
                  >
                    <option value="ADMIN">{t("admin")}</option>
                    {/* <option value="SUPERADMIN">{t("superadmin")}</option> */}
                  </select>
                </div>
                {errors.role && (
                  <div className="col-span-4 text-red-500 text-xs ml-2">
                    {errors.role}
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    {t("password")}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    minLength={8}
                    maxLength={22}
                    value={newUser.password || ""}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    className="col-span-3"
                    required
                  />
                </div>
                {errors.password && (
                  <div className="col-span-4 text-red-500 text-xs ml-2">
                    {errors.password}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t("loading") : t("save")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
