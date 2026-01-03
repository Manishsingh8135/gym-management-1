"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trainersApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Dumbbell,
  Users,
  Calendar,
  Clock,
  Plus,
  Search,
  Mail,
  Phone,
  Star,
  Award,
  TrendingUp,
  Loader2,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Trainer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    classSchedules: number;
    ptSessions: number;
  };
}

interface TrainerStats {
  totalTrainers: number;
  activeTrainers: number;
  totalClasses: number;
  upcomingPTSessions: number;
}

const SPECIALIZATIONS = [
  { value: "strength", label: "Strength Training", color: "bg-red-500" },
  { value: "cardio", label: "Cardio", color: "bg-blue-500" },
  { value: "yoga", label: "Yoga", color: "bg-purple-500" },
  { value: "hiit", label: "HIIT", color: "bg-orange-500" },
  { value: "crossfit", label: "CrossFit", color: "bg-yellow-500" },
  { value: "pilates", label: "Pilates", color: "bg-pink-500" },
  { value: "boxing", label: "Boxing", color: "bg-gray-500" },
  { value: "nutrition", label: "Nutrition", color: "bg-green-500" },
];

export default function TrainersPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);

  // Trainer form state
  const [trainerForm, setTrainerForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Fetch trainers
  const { data: trainersData, isLoading: loadingTrainers } = useQuery({
    queryKey: ["trainers"],
    queryFn: async () => {
      const res = await trainersApi.getAll();
      return res.data.data as Trainer[];
    },
  });

  // Fetch stats
  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ["trainers", "stats"],
    queryFn: async () => {
      const res = await trainersApi.getStats();
      return res.data.data as TrainerStats;
    },
  });

  // Create trainer mutation
  const createTrainerMutation = useMutation({
    mutationFn: (data: any) => trainersApi.create(data),
    onSuccess: () => {
      toast.success("Trainer added successfully!");
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
      setShowAddModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || "Failed to add trainer");
    },
  });

  // Delete trainer mutation
  const deleteTrainerMutation = useMutation({
    mutationFn: (id: string) => trainersApi.delete(id),
    onSuccess: () => {
      toast.success("Trainer deactivated successfully!");
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || "Failed to deactivate trainer");
    },
  });

  const resetForm = () => {
    setTrainerForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    });
  };

  const handleCreateTrainer = () => {
    if (!trainerForm.firstName || !trainerForm.lastName || !trainerForm.email) {
      toast.error("Please fill in all required fields");
      return;
    }
    createTrainerMutation.mutate(trainerForm);
  };

  const filteredTrainers = trainersData?.filter(
    (trainer) =>
      trainer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Trainers</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage your gym trainers and instructors
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Trainer
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
                <p className="text-xs text-muted-foreground md:text-sm">Total Trainers</p>
                <p className="text-xl font-bold md:text-2xl">
                  {loadingStats ? "-" : statsData?.totalTrainers || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-500/10 p-2 md:p-3">
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground md:text-sm">Active</p>
                <p className="text-xl font-bold md:text-2xl">
                  {loadingStats ? "-" : statsData?.activeTrainers || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-500/10 p-2 md:p-3">
                <Calendar className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground md:text-sm">Classes</p>
                <p className="text-xl font-bold md:text-2xl">
                  {loadingStats ? "-" : statsData?.totalClasses || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-500/10 p-2 md:p-3">
                <Dumbbell className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground md:text-sm">PT Sessions</p>
                <p className="text-xl font-bold md:text-2xl">
                  {loadingStats ? "-" : statsData?.upcomingPTSessions || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search trainers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Trainers Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loadingTrainers ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="bg-card animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-muted" />
                  <div className="flex-1">
                    <div className="h-5 w-3/4 rounded bg-muted" />
                    <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredTrainers?.length === 0 ? (
          <Card className="col-span-full bg-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Dumbbell className="h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-lg font-medium">No trainers found</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Try a different search" : "Add your first trainer to get started"}
              </p>
              {!searchQuery && (
                <Button className="mt-4" onClick={() => setShowAddModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Trainer
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredTrainers?.map((trainer) => (
            <Card
              key={trainer.id}
              className="bg-card group hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              {/* Status indicator */}
              <div className={`h-1 ${trainer.isActive ? "bg-green-500" : "bg-gray-400"}`} />
              
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 ring-2 ring-offset-2 ring-offset-background ring-primary/20">
                    <AvatarImage src={trainer.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                      {trainer.firstName[0]}
                      {trainer.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold truncate">
                        {trainer.firstName} {trainer.lastName}
                      </h3>
                      {trainer.isActive ? (
                        <Badge className="bg-green-500/10 text-green-500 text-xs">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {trainer.role}
                    </Badge>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{trainer.email}</span>
                  </div>
                  {trainer.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{trainer.phone}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{trainer._count?.classSchedules || 0} classes</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Dumbbell className="h-4 w-4" />
                    <span>{trainer._count?.ptSessions || 0} PT</span>
                  </div>
                </div>

                {/* Hover Actions */}
                <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedTrainer(trainer)}
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-red-500 hover:bg-red-500/10"
                    onClick={() => {
                      if (confirm("Are you sure you want to deactivate this trainer?")) {
                        deleteTrainerMutation.mutate(trainer.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Trainer Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              Add New Trainer
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input
                  value={trainerForm.firstName}
                  onChange={(e) => setTrainerForm({ ...trainerForm, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input
                  value={trainerForm.lastName}
                  onChange={(e) => setTrainerForm({ ...trainerForm, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={trainerForm.email}
                  onChange={(e) => setTrainerForm({ ...trainerForm, email: e.target.value })}
                  className="pl-10"
                  placeholder="trainer@gym.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={trainerForm.phone}
                  onChange={(e) => setTrainerForm({ ...trainerForm, phone: e.target.value })}
                  className="pl-10"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* Info note */}
            <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              <p>
                The trainer will receive an email to set up their account password and complete their profile.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTrainer} disabled={createTrainerMutation.isPending}>
              {createTrainerMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add Trainer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trainer Details Modal */}
      <Dialog open={!!selectedTrainer} onOpenChange={() => setSelectedTrainer(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Trainer Profile</DialogTitle>
          </DialogHeader>
          {selectedTrainer && (
            <div className="space-y-6 py-4">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 ring-4 ring-offset-2 ring-offset-background ring-primary/20">
                  <AvatarImage src={selectedTrainer.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                    {selectedTrainer.firstName[0]}
                    {selectedTrainer.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedTrainer.firstName} {selectedTrainer.lastName}
                  </h2>
                  <Badge variant="outline" className="mt-1">
                    {selectedTrainer.role}
                  </Badge>
                  <div className="mt-2">
                    {selectedTrainer.isActive ? (
                      <Badge className="bg-green-500/10 text-green-500">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="mr-1 h-3 w-3" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <Card className="bg-muted/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedTrainer.email}</p>
                    </div>
                  </div>
                  {selectedTrainer.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{selectedTrainer.phone}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Joined</p>
                      <p className="font-medium">
                        {format(new Date(selectedTrainer.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-blue-500/10 border-blue-500/20">
                  <CardContent className="p-4 text-center">
                    <Calendar className="h-8 w-8 mx-auto text-blue-500" />
                    <p className="mt-2 text-2xl font-bold">
                      {selectedTrainer._count?.classSchedules || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Classes</p>
                  </CardContent>
                </Card>
                <Card className="bg-purple-500/10 border-purple-500/20">
                  <CardContent className="p-4 text-center">
                    <Dumbbell className="h-8 w-8 mx-auto text-purple-500" />
                    <p className="mt-2 text-2xl font-bold">
                      {selectedTrainer._count?.ptSessions || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">PT Sessions</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTrainer(null)}>
              Close
            </Button>
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              View Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
