"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  CreditCard,
  Trash2,
  Download,
  Upload,
  Filter,
} from "lucide-react";
import { membersApi } from "@/lib/api";
import { format } from "date-fns";

interface Member {
  id: string;
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  status: "ACTIVE" | "INACTIVE" | "FROZEN" | "EXPIRED" | "BLOCKED";
  joinDate: string;
  currentMembership?: {
    plan: { name: string };
    endDate: string;
  } | null;
}

interface MembersResponse {
  data: Member[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const statusConfig = {
  ACTIVE: { label: "Active", className: "bg-emerald-500/20 text-emerald-400" },
  INACTIVE: { label: "Inactive", className: "bg-gray-500/20 text-gray-400" },
  EXPIRED: { label: "Expired", className: "bg-red-500/20 text-red-400" },
  FROZEN: { label: "Frozen", className: "bg-blue-500/20 text-blue-400" },
  BLOCKED: { label: "Blocked", className: "bg-red-500/20 text-red-400" },
};

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["members", page, statusFilter, searchQuery],
    queryFn: async () => {
      const params: any = { page, limit: 20 };
      if (statusFilter !== "all") params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;
      const response = await membersApi.getAll(params);
      return response.data as MembersResponse;
    },
  });

  const members = data?.data || [];
  const meta = data?.meta;

  // Calculate stats from the data
  const totalMembers = meta?.total || 0;
  const activeCount = members.filter(m => m.status === "ACTIVE").length;
  const expiredCount = members.filter(m => m.status === "EXPIRED").length;
  const frozenCount = members.filter(m => m.status === "FROZEN").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Members</h1>
          <p className="text-[#b3b3b3]">
            Manage your gym members and their memberships
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-[#282828] bg-transparent text-white hover:bg-[#282828]">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm" className="border-[#282828] bg-transparent text-white hover:bg-[#282828]">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button asChild className="bg-[#1db954] text-black hover:bg-[#1ed760]">
            <Link href="/members/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#181818] border-none">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{isLoading ? <Skeleton className="h-8 w-16 bg-[#282828]" /> : totalMembers}</div>
            <p className="text-sm text-[#b3b3b3]">Total Members</p>
          </CardContent>
        </Card>
        <Card className="bg-[#181818] border-none">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-400">{isLoading ? <Skeleton className="h-8 w-16 bg-[#282828]" /> : activeCount}</div>
            <p className="text-sm text-[#b3b3b3]">Active</p>
          </CardContent>
        </Card>
        <Card className="bg-[#181818] border-none">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-400">{isLoading ? <Skeleton className="h-8 w-16 bg-[#282828]" /> : frozenCount}</div>
            <p className="text-sm text-[#b3b3b3]">Frozen</p>
          </CardContent>
        </Card>
        <Card className="bg-[#181818] border-none">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-400">{isLoading ? <Skeleton className="h-8 w-16 bg-[#282828]" /> : expiredCount}</div>
            <p className="text-sm text-[#b3b3b3]">Expired</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expiring">Expiring</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="frozen">Frozen</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <Card className="bg-[#181818] border-none">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full bg-[#282828]" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4 bg-[#282828]" />
                  <Skeleton className="h-3 w-1/6 bg-[#282828]" />
                </div>
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-[#b3b3b3]">
            No members found. Add your first member to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-[#282828] hover:bg-transparent">
                <TableHead className="text-[#b3b3b3]">Member</TableHead>
                <TableHead className="text-[#b3b3b3]">Plan</TableHead>
                <TableHead className="text-[#b3b3b3]">Status</TableHead>
                <TableHead className="text-[#b3b3b3]">Expiry Date</TableHead>
                <TableHead className="text-[#b3b3b3]">Phone</TableHead>
                <TableHead className="text-right text-[#b3b3b3]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const fullName = `${member.firstName} ${member.lastName}`;
                const initials = `${member.firstName[0]}${member.lastName[0]}`;
                const planName = member.currentMembership?.plan?.name || "No Plan";
                const expiryDate = member.currentMembership?.endDate 
                  ? format(new Date(member.currentMembership.endDate), "MMM dd, yyyy")
                  : "-";
                const statusInfo = statusConfig[member.status] || statusConfig.INACTIVE;

                return (
                  <TableRow key={member.id} className="border-[#282828] hover:bg-[#282828]">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={member.avatar || ""} />
                          <AvatarFallback className="bg-[#1db954]/20 text-[#1db954] text-sm">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-white">{fullName}</p>
                          <p className="text-sm text-[#b3b3b3]">
                            {member.memberId}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-[#282828] text-white">{planName}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusInfo.className}>
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#b3b3b3]">{expiryDate}</TableCell>
                    <TableCell className="text-[#b3b3b3]">{member.phone}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-[#b3b3b3] hover:text-white hover:bg-[#282828]">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#282828] border-[#404040]">
                          <DropdownMenuItem asChild className="text-white hover:bg-[#404040] cursor-pointer">
                            <Link href={`/members/${member.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-white hover:bg-[#404040] cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-white hover:bg-[#404040] cursor-pointer">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Collect Payment
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400 hover:bg-[#404040] cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#b3b3b3]">
            Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} members
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="border-[#282828] bg-transparent text-white hover:bg-[#282828]"
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setPage(p => p + 1)}
              className="border-[#282828] bg-transparent text-white hover:bg-[#282828]"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
