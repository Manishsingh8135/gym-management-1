"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  UserPlus,
  Users,
  TrendingUp,
  Phone,
  Mail,
  Plus,
  Search,
  Filter,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  PhoneCall,
  Calendar,
  ArrowRight,
  MoreHorizontal,
  Star,
  Target,
  Zap,
  Globe,
  Instagram,
  Facebook,
  MapPin,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const LEAD_STATUSES = [
  { value: "NEW", label: "New", color: "bg-blue-500", icon: Star },
  { value: "CONTACTED", label: "Contacted", color: "bg-yellow-500", icon: PhoneCall },
  { value: "QUALIFIED", label: "Qualified", color: "bg-purple-500", icon: Target },
  { value: "NEGOTIATION", label: "Negotiation", color: "bg-orange-500", icon: MessageSquare },
  { value: "CONVERTED", label: "Converted", color: "bg-green-500", icon: CheckCircle2 },
  { value: "LOST", label: "Lost", color: "bg-red-500", icon: XCircle },
];

const LEAD_SOURCES = [
  { value: "WALK_IN", label: "Walk-in", icon: MapPin },
  { value: "WEBSITE", label: "Website", icon: Globe },
  { value: "REFERRAL", label: "Referral", icon: Users },
  { value: "SOCIAL_MEDIA", label: "Social Media", icon: Instagram },
  { value: "FACEBOOK", label: "Facebook", icon: Facebook },
  { value: "INSTAGRAM", label: "Instagram", icon: Instagram },
  { value: "GOOGLE", label: "Google", icon: Globe },
  { value: "OTHER", label: "Other", icon: Zap },
];

interface Lead {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone: string;
  source: string;
  status: string;
  interestedIn?: string;
  notes?: string;
  createdAt: string;
  lastContactedAt?: string;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _count?: {
    activities: number;
  };
}

interface LeadStats {
  totalLeads: number;
  byStatus: {
    new: number;
    contacted: number;
    qualified: number;
    converted: number;
    lost: number;
  };
  conversionRate: string;
}

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Lead form state
  const [leadForm, setLeadForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    source: "WALK_IN",
    interestedIn: "",
    notes: "",
  });

  // Fetch leads
  const { data: leadsData, isLoading: loadingLeads } = useQuery({
    queryKey: ["leads", filterStatus, filterSource],
    queryFn: async () => {
      const params: any = {};
      if (filterStatus !== "all") params.status = filterStatus;
      if (filterSource !== "all") params.source = filterSource;
      const res = await leadsApi.getAll(params);
      return res.data.data as Lead[];
    },
  });

  // Fetch stats
  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ["leads", "stats"],
    queryFn: async () => {
      const res = await leadsApi.getStats();
      return res.data.data as LeadStats;
    },
  });

  // Create lead mutation
  const createLeadMutation = useMutation({
    mutationFn: (data: any) => leadsApi.create(data),
    onSuccess: () => {
      toast.success("Lead added successfully!");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setShowAddModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || "Failed to add lead");
    },
  });

  // Update lead status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      leadsApi.update(id, { status }),
    onSuccess: () => {
      toast.success("Status updated!");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || "Failed to update status");
    },
  });

  // Convert to member mutation
  const convertMutation = useMutation({
    mutationFn: (id: string) => leadsApi.convert(id),
    onSuccess: () => {
      toast.success("Lead converted to member!");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setSelectedLead(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || "Failed to convert lead");
    },
  });

  const resetForm = () => {
    setLeadForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      source: "WALK_IN",
      interestedIn: "",
      notes: "",
    });
  };

  const handleCreateLead = () => {
    if (!leadForm.firstName || !leadForm.phone) {
      toast.error("Please fill in required fields");
      return;
    }
    createLeadMutation.mutate(leadForm);
  };

  const getStatusInfo = (status: string) => {
    return LEAD_STATUSES.find((s) => s.value === status) || LEAD_STATUSES[0];
  };

  const getSourceInfo = (source: string) => {
    return LEAD_SOURCES.find((s) => s.value === source) || LEAD_SOURCES[LEAD_SOURCES.length - 1];
  };

  const filteredLeads = leadsData?.filter(
    (lead) =>
      lead.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group leads by status for Kanban view
  const leadsByStatus = LEAD_STATUSES.reduce((acc, status) => {
    acc[status.value] = filteredLeads?.filter((l) => l.status === status.value) || [];
    return acc;
  }, {} as Record<string, Lead[]>);

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Leads & CRM</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage your sales pipeline and convert leads
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold">
                  {loadingStats ? "-" : statsData?.totalLeads || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-500/10 p-2">
                <Star className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">New</p>
                <p className="text-xl font-bold text-blue-500">
                  {loadingStats ? "-" : statsData?.byStatus?.new || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-500/10 p-2">
                <Target className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Qualified</p>
                <p className="text-xl font-bold text-purple-500">
                  {loadingStats ? "-" : statsData?.byStatus?.qualified || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-500/10 p-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Converted</p>
                <p className="text-xl font-bold text-green-500">
                  {loadingStats ? "-" : statsData?.byStatus?.converted || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card col-span-2 md:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-orange-500/10 p-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Conversion</p>
                <p className="text-xl font-bold text-orange-500">
                  {loadingStats ? "-" : `${statsData?.conversionRate || 0}%`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {LEAD_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {LEAD_SOURCES.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card className="bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">All Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Lead</th>
                  <th className="pb-3 font-medium hidden sm:table-cell">Contact</th>
                  <th className="pb-3 font-medium hidden md:table-cell">Source</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium hidden lg:table-cell">Added</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loadingLeads ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </td>
                  </tr>
                ) : filteredLeads?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center">
                      <UserPlus className="mx-auto h-12 w-12 text-muted-foreground/30" />
                      <p className="mt-2 text-muted-foreground">No leads found</p>
                      <Button className="mt-4" onClick={() => setShowAddModal(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Lead
                      </Button>
                    </td>
                  </tr>
                ) : (
                  filteredLeads?.map((lead) => {
                    const statusInfo = getStatusInfo(lead.status);
                    const sourceInfo = getSourceInfo(lead.source);
                    const StatusIcon = statusInfo.icon;
                    const SourceIcon = sourceInfo.icon;

                    return (
                      <tr
                        key={lead.id}
                        className="hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {lead.firstName[0]}
                                {lead.lastName?.[0] || ""}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {lead.firstName} {lead.lastName}
                              </p>
                              {lead.interestedIn && (
                                <p className="text-xs text-muted-foreground">
                                  Interested in: {lead.interestedIn}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 hidden sm:table-cell">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {lead.phone}
                            </div>
                            {lead.email && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span className="truncate max-w-[150px]">{lead.email}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 hidden md:table-cell">
                          <Badge variant="outline" className="text-xs">
                            <SourceIcon className="mr-1 h-3 w-3" />
                            {sourceInfo.label}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Badge className={`${statusInfo.color} text-white text-xs`}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                        </td>
                        <td className="py-3 hidden lg:table-cell text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {lead.status !== "CONVERTED" && lead.status !== "LOST" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  convertMutation.mutate(lead.id);
                                }}
                                disabled={convertMutation.isPending}
                              >
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Lead Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Add New Lead
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input
                  value={leadForm.firstName}
                  onChange={(e) => setLeadForm({ ...leadForm, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={leadForm.lastName}
                  onChange={(e) => setLeadForm({ ...leadForm, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Phone *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                  className="pl-10"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                  className="pl-10"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source</Label>
                <Select
                  value={leadForm.source}
                  onValueChange={(v) => setLeadForm({ ...leadForm, source: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_SOURCES.map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Interested In</Label>
                <Input
                  value={leadForm.interestedIn}
                  onChange={(e) => setLeadForm({ ...leadForm, interestedIn: e.target.value })}
                  placeholder="Gym membership"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={leadForm.notes}
                onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                placeholder="Add any notes about this lead..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLead} disabled={createLeadMutation.isPending}>
              {createLeadMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lead Details Modal */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-6 py-4">
              {/* Profile */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-offset-2 ring-offset-background ring-primary/20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                    {selectedLead.firstName[0]}
                    {selectedLead.lastName?.[0] || ""}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedLead.firstName} {selectedLead.lastName}
                  </h2>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge className={`${getStatusInfo(selectedLead.status).color} text-white`}>
                      {getStatusInfo(selectedLead.status).label}
                    </Badge>
                    <Badge variant="outline">{getSourceInfo(selectedLead.source).label}</Badge>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <Card className="bg-muted/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedLead.phone}</p>
                    </div>
                  </div>
                  {selectedLead.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedLead.email}</p>
                      </div>
                    </div>
                  )}
                  {selectedLead.interestedIn && (
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Interested In</p>
                        <p className="font-medium">{selectedLead.interestedIn}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Added</p>
                      <p className="font-medium">
                        {format(new Date(selectedLead.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Update Status */}
              {selectedLead.status !== "CONVERTED" && selectedLead.status !== "LOST" && (
                <div className="space-y-2">
                  <Label>Update Status</Label>
                  <div className="flex flex-wrap gap-2">
                    {LEAD_STATUSES.filter(
                      (s) => s.value !== selectedLead.status && s.value !== "CONVERTED"
                    ).map((status) => {
                      const StatusIcon = status.icon;
                      return (
                        <Button
                          key={status.value}
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: selectedLead.id,
                              status: status.value,
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedLead.notes && (
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <p className="text-sm text-muted-foreground rounded-lg bg-muted p-3">
                    {selectedLead.notes}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLead(null)}>
              Close
            </Button>
            {selectedLead?.status !== "CONVERTED" && selectedLead?.status !== "LOST" && (
              <Button
                onClick={() => selectedLead && convertMutation.mutate(selectedLead.id)}
                disabled={convertMutation.isPending}
              >
                {convertMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Convert to Member
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
