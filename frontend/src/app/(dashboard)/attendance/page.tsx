"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceApi, membersApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  QrCode,
  Search,
  UserCheck,
  UserMinus,
  Users,
  Clock,
  LogIn,
  LogOut,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Member {
  id: string;
  memberId: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  email: string;
  phone: string;
}

interface AttendanceRecord {
  id: string;
  memberId: string;
  checkInTime: string;
  checkOutTime?: string;
  duration?: number;
  checkInMethod: string;
  member: {
    id: string;
    memberId: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface TodayStats {
  totalCheckIns: number;
  currentlyIn: number;
  checkedOut: number;
}

export default function AttendancePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("check-in");
  const [searchQuery, setSearchQuery] = useState("");
  const [memberIdInput, setMemberIdInput] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState<{ member: Member; type: "in" | "out" } | null>(null);

  // Fetch today's attendance
  const { data: todayData, isLoading: loadingToday, refetch: refetchToday } = useQuery({
    queryKey: ["attendance", "today"],
    queryFn: async () => {
      const res = await attendanceApi.getToday();
      return res.data.data as { attendance: AttendanceRecord[]; stats: TodayStats };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Search members
  const { data: searchResults, isLoading: searching } = useQuery({
    queryKey: ["members", "search", searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return [];
      const res = await membersApi.getAll({ search: searchQuery, limit: 10 });
      return res.data.data.members as Member[];
    },
    enabled: searchQuery.length >= 2,
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: (data: { memberId: string }) => attendanceApi.checkIn(data),
    onSuccess: (res, variables) => {
      toast.success(res.data.message || "Check-in successful!");
      const member = todayData?.attendance.find(a => a.member.id === variables.memberId)?.member;
      if (member) {
        setCheckInSuccess({ member: member as any, type: "in" });
      }
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      setSelectedMember(null);
      setMemberIdInput("");
      setTimeout(() => setCheckInSuccess(null), 3000);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || "Check-in failed";
      toast.error(message);
    },
  });

  // Check-in by member ID mutation
  const checkInByIdMutation = useMutation({
    mutationFn: (data: { memberIdCode: string }) => attendanceApi.checkInByMemberId(data),
    onSuccess: (res) => {
      toast.success(res.data.message || "Check-in successful!");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      setMemberIdInput("");
      setTimeout(() => setCheckInSuccess(null), 3000);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || "Check-in failed";
      toast.error(message);
    },
  });

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: (data: { memberId?: string; attendanceId?: string }) => attendanceApi.checkOut(data),
    onSuccess: (res) => {
      toast.success(res.data.message || "Check-out successful!");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || "Check-out failed";
      toast.error(message);
    },
  });

  const handleMemberIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberIdInput.trim()) return;
    checkInByIdMutation.mutate({ memberIdCode: memberIdInput.trim() });
  };

  const handleCheckIn = (member: Member) => {
    setSelectedMember(member);
    checkInMutation.mutate({ memberId: member.id });
    setShowMemberSearch(false);
    setSearchQuery("");
  };

  const handleCheckOut = (attendanceId: string) => {
    checkOutMutation.mutate({ attendanceId });
  };

  const currentlyInGym = todayData?.attendance.filter(a => !a.checkOutTime) || [];
  const checkedOutToday = todayData?.attendance.filter(a => a.checkOutTime) || [];

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "-";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Attendance</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Check-in/out members and track attendance
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchToday()}
          className="w-full md:w-auto"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Card className="bg-card">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2 md:p-3">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground md:text-sm">Currently In</p>
                <p className="text-xl font-bold md:text-2xl">
                  {loadingToday ? "-" : todayData?.stats.currentlyIn || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-500/10 p-2 md:p-3">
                <LogIn className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground md:text-sm">Total Check-ins</p>
                <p className="text-xl font-bold md:text-2xl">
                  {loadingToday ? "-" : todayData?.stats.totalCheckIns || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-orange-500/10 p-2 md:p-3">
                <LogOut className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground md:text-sm">Checked Out</p>
                <p className="text-xl font-bold md:text-2xl">
                  {loadingToday ? "-" : todayData?.stats.checkedOut || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-500/10 p-2 md:p-3">
                <Clock className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground md:text-sm">Time</p>
                <p className="text-lg font-bold md:text-xl">
                  {format(new Date(), "hh:mm a")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Check-in Section */}
        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCheck className="h-5 w-5 text-primary" />
              Quick Check-in
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="check-in" className="text-sm">
                  <QrCode className="mr-2 h-4 w-4" />
                  Member ID
                </TabsTrigger>
                <TabsTrigger value="search" className="text-sm">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </TabsTrigger>
              </TabsList>

              <TabsContent value="check-in" className="mt-4 space-y-4">
                <form onSubmit={handleMemberIdSubmit} className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Enter Member ID
                    </label>
                    <Input
                      placeholder="e.g., GYM001"
                      value={memberIdInput}
                      onChange={(e) => setMemberIdInput(e.target.value.toUpperCase())}
                      className="mt-1 text-lg font-mono"
                      autoFocus
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!memberIdInput.trim() || checkInByIdMutation.isPending}
                  >
                    {checkInByIdMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogIn className="mr-2 h-4 w-4" />
                    )}
                    Check In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="search" className="mt-4 space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">
                    Search by name, email, or phone
                  </label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Search Results */}
                {searchQuery.length >= 2 && (
                  <div className="max-h-[300px] overflow-y-auto rounded-lg border border-border">
                    {searching ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : searchResults && searchResults.length > 0 ? (
                      <div className="divide-y divide-border">
                        {searchResults.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {member.firstName[0]}
                                  {member.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {member.firstName} {member.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {member.memberId}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleCheckIn(member)}
                              disabled={checkInMutation.isPending}
                            >
                              {checkInMutation.isPending && selectedMember?.id === member.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <LogIn className="mr-1 h-4 w-4" />
                                  Check In
                                </>
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        No members found
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Success Animation */}
            {checkInSuccess && (
              <div className="mt-4 rounded-lg bg-green-500/10 p-4 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                <p className="mt-2 text-lg font-semibold text-green-500">
                  {checkInSuccess.type === "in" ? "Welcome!" : "Goodbye!"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Currently In Gym */}
        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Currently In Gym
              </span>
              <Badge variant="secondary" className="text-sm">
                {currentlyInGym.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-y-auto">
              {loadingToday ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : currentlyInGym.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-muted-foreground">No one in the gym right now</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentlyInGym.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={record.member.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {record.member.firstName[0]}
                            {record.member.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm md:text-base">
                            {record.member.firstName} {record.member.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            In since {format(new Date(record.checkInTime), "hh:mm a")}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCheckOut(record.id)}
                        disabled={checkOutMutation.isPending}
                      >
                        {checkOutMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <LogOut className="mr-1 h-4 w-4" />
                            <span className="hidden sm:inline">Check Out</span>
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Activity */}
      <Card className="bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Today&apos;s Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Member</th>
                  <th className="pb-3 font-medium hidden sm:table-cell">Member ID</th>
                  <th className="pb-3 font-medium">Check In</th>
                  <th className="pb-3 font-medium hidden md:table-cell">Check Out</th>
                  <th className="pb-3 font-medium hidden lg:table-cell">Duration</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loadingToday ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </td>
                  </tr>
                ) : todayData?.attendance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No attendance records today
                    </td>
                  </tr>
                ) : (
                  todayData?.attendance.map((record) => (
                    <tr key={record.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={record.member.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {record.member.firstName[0]}
                              {record.member.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">
                            {record.member.firstName} {record.member.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground font-mono">
                          {record.member.memberId}
                        </span>
                      </td>
                      <td className="py-3 text-sm">
                        {format(new Date(record.checkInTime), "hh:mm a")}
                      </td>
                      <td className="py-3 text-sm hidden md:table-cell">
                        {record.checkOutTime
                          ? format(new Date(record.checkOutTime), "hh:mm a")
                          : "-"}
                      </td>
                      <td className="py-3 text-sm hidden lg:table-cell">
                        {formatDuration(record.duration)}
                      </td>
                      <td className="py-3">
                        {record.checkOutTime ? (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Done
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 text-xs">
                            <Users className="mr-1 h-3 w-3" />
                            In Gym
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
