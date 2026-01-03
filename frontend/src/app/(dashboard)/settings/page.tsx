"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  User,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Globe,
  Clock,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Loader2,
  Check,
  ChevronRight,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Zap,
  Users,
  Key,
  LogOut,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    timezone?: string;
    currency?: string;
  };
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNewMember: true,
    emailPayment: true,
    emailExpiring: true,
    pushCheckIn: true,
    pushPayment: false,
    marketingEmails: false,
  });

  // Theme preferences
  const [theme, setTheme] = useState("dark");
  const [accentColor, setAccentColor] = useState("green");

  // Fetch user profile
  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await authApi.me();
      return res.data.data as UserProfile;
    },
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Gym form state
  const [gymForm, setGymForm] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    state: "",
    country: "",
    timezone: "Asia/Kolkata",
    currency: "INR",
  });

  // Initialize forms when user data loads
  useState(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      if (user.organization) {
        setGymForm({
          name: user.organization.name || "",
          email: user.organization.email || "",
          phone: user.organization.phone || "",
          website: user.organization.website || "",
          address: user.organization.address || "",
          city: user.organization.city || "",
          state: user.organization.state || "",
          country: user.organization.country || "",
          timezone: user.organization.timezone || "Asia/Kolkata",
          currency: user.organization.currency || "INR",
        });
      }
    }
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Profile updated successfully!");
    setIsSaving(false);
  };

  const handleSaveGym = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Gym settings updated successfully!");
    setIsSaving(false);
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Notification preferences saved!");
    setIsSaving(false);
  };

  const accentColors = [
    { name: "green", color: "#1db954", label: "Spotify Green" },
    { name: "blue", color: "#3b82f6", label: "Ocean Blue" },
    { name: "purple", color: "#8b5cf6", label: "Royal Purple" },
    { name: "orange", color: "#f97316", label: "Sunset Orange" },
    { name: "pink", color: "#ec4899", label: "Hot Pink" },
    { name: "cyan", color: "#06b6d4", label: "Cyber Cyan" },
  ];

  const SettingsNav = () => (
    <div className="space-y-1">
      {[
        { id: "profile", label: "Profile", icon: User, description: "Your personal info" },
        { id: "gym", label: "Gym Settings", icon: Building2, description: "Organization details" },
        { id: "notifications", label: "Notifications", icon: Bell, description: "Email & push alerts" },
        { id: "appearance", label: "Appearance", icon: Palette, description: "Theme & display" },
        { id: "security", label: "Security", icon: Shield, description: "Password & 2FA" },
        { id: "billing", label: "Billing", icon: CreditCard, description: "Plans & invoices" },
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`w-full flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-all ${
            activeTab === item.id
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <div
            className={`rounded-lg p-2 ${
              activeTab === item.id ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            <item.icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{item.label}</p>
            <p className="text-xs text-muted-foreground truncate">{item.description}</p>
          </div>
          <ChevronRight
            className={`h-4 w-4 transition-transform ${
              activeTab === item.id ? "text-primary" : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Settings</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Manage your account and preferences
        </p>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar Navigation - Desktop */}
        <div className="hidden lg:block">
          <Card className="bg-card sticky top-6">
            <CardContent className="p-4">
              <SettingsNav />
            </CardContent>
          </Card>
        </div>

        {/* Mobile Tabs */}
        <div className="lg:hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="profile" className="text-xs">
                <User className="h-4 w-4 mr-1" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="gym" className="text-xs">
                <Building2 className="h-4 w-4 mr-1" />
                Gym
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs">
                <Bell className="h-4 w-4 mr-1" />
                Alerts
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {/* Profile Settings */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Avatar Section */}
              <Card className="bg-card overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
                <CardContent className="relative pt-0 pb-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
                    <div className="relative">
                      <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                          {user?.firstName?.[0]}
                          {user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <button className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors">
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold">
                        {user?.firstName} {user?.lastName}
                      </h2>
                      <p className="text-muted-foreground">{user?.email}</p>
                      <Badge className="mt-2 bg-primary/10 text-primary hover:bg-primary/20">
                        {user?.role || "Admin"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Form */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input
                        value={profileForm.firstName || user?.firstName || ""}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, firstName: e.target.value })
                        }
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        value={profileForm.lastName || user?.lastName || ""}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, lastName: e.target.value })
                        }
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="email"
                        value={profileForm.email || user?.email || ""}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, email: e.target.value })
                        }
                        className="pl-10"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={profileForm.phone || user?.phone || ""}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, phone: e.target.value })
                        }
                        className="pl-10"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Gym Settings */}
          {activeTab === "gym" && (
            <div className="space-y-6">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Gym Information
                  </CardTitle>
                  <CardDescription>
                    Your gym&apos;s public profile and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Gym Name</Label>
                    <Input
                      value={gymForm.name || user?.organization?.name || ""}
                      onChange={(e) => setGymForm({ ...gymForm, name: e.target.value })}
                      placeholder="JERAI Fitness"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={gymForm.email}
                          onChange={(e) => setGymForm({ ...gymForm, email: e.target.value })}
                          className="pl-10"
                          placeholder="contact@gym.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={gymForm.phone}
                          onChange={(e) => setGymForm({ ...gymForm, phone: e.target.value })}
                          className="pl-10"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={gymForm.website}
                        onChange={(e) => setGymForm({ ...gymForm, website: e.target.value })}
                        className="pl-10"
                        placeholder="https://yourgym.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        value={gymForm.address}
                        onChange={(e) => setGymForm({ ...gymForm, address: e.target.value })}
                        className="pl-10 min-h-[80px]"
                        placeholder="123 Fitness Street, Gym Plaza"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        value={gymForm.city}
                        onChange={(e) => setGymForm({ ...gymForm, city: e.target.value })}
                        placeholder="Mumbai"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input
                        value={gymForm.state}
                        onChange={(e) => setGymForm({ ...gymForm, state: e.target.value })}
                        placeholder="Maharashtra"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Input
                        value={gymForm.country}
                        onChange={(e) => setGymForm({ ...gymForm, country: e.target.value })}
                        placeholder="India"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Regional Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select
                        value={gymForm.timezone}
                        onValueChange={(v) => setGymForm({ ...gymForm, timezone: v })}
                      >
                        <SelectTrigger>
                          <Clock className="mr-2 h-4 w-4" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Kolkata">India (IST)</SelectItem>
                          <SelectItem value="America/New_York">Eastern (EST)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific (PST)</SelectItem>
                          <SelectItem value="Europe/London">London (GMT)</SelectItem>
                          <SelectItem value="Asia/Dubai">Dubai (GST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select
                        value={gymForm.currency}
                        onValueChange={(v) => setGymForm({ ...gymForm, currency: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">₹ Indian Rupee (INR)</SelectItem>
                          <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                          <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                          <SelectItem value="GBP">£ British Pound (GBP)</SelectItem>
                          <SelectItem value="AED">د.إ Dirham (AED)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveGym} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div>
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
                    <Mail className="h-4 w-4" />
                    Email Notifications
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        key: "emailNewMember",
                        label: "New Member Registration",
                        description: "Get notified when a new member signs up",
                      },
                      {
                        key: "emailPayment",
                        label: "Payment Received",
                        description: "Receive alerts for successful payments",
                      },
                      {
                        key: "emailExpiring",
                        label: "Expiring Memberships",
                        description: "Daily digest of memberships expiring soon",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                        <Switch
                          checked={notifications[item.key as keyof typeof notifications]}
                          onCheckedChange={(checked) =>
                            setNotifications({ ...notifications, [item.key]: checked })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Push Notifications */}
                <div>
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
                    <Smartphone className="h-4 w-4" />
                    Push Notifications
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        key: "pushCheckIn",
                        label: "Member Check-ins",
                        description: "Real-time alerts when members check in",
                      },
                      {
                        key: "pushPayment",
                        label: "Payment Alerts",
                        description: "Instant notification for payments",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                        <Switch
                          checked={notifications[item.key as keyof typeof notifications]}
                          onCheckedChange={(checked) =>
                            setNotifications({ ...notifications, [item.key]: checked })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Marketing */}
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-sm">Marketing Emails</p>
                    <p className="text-xs text-muted-foreground">
                      Product updates, tips, and promotional content
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketingEmails}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, marketingEmails: checked })
                    }
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveNotifications} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appearance */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    Theme
                  </CardTitle>
                  <CardDescription>Customize the look and feel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme Selection */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: "light", label: "Light", icon: Sun },
                      { id: "dark", label: "Dark", icon: Moon },
                      { id: "system", label: "System", icon: Monitor },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                          theme === t.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div
                          className={`rounded-full p-3 ${
                            theme === t.id ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          <t.icon className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">{t.label}</span>
                        {theme === t.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>

                  <Separator />

                  {/* Accent Color */}
                  <div>
                    <h3 className="text-sm font-semibold mb-4">Accent Color</h3>
                    <div className="flex flex-wrap gap-3">
                      {accentColors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setAccentColor(color.name)}
                          className={`group relative rounded-full p-1 transition-transform hover:scale-110 ${
                            accentColor === color.name ? "ring-2 ring-offset-2 ring-offset-background" : ""
                          }`}
                          style={{
                            ringColor: color.color,
                          }}
                          title={color.label}
                        >
                          <div
                            className="h-8 w-8 rounded-full"
                            style={{ backgroundColor: color.color }}
                          />
                          {accentColor === color.name && (
                            <Check className="absolute inset-0 m-auto h-4 w-4 text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Security */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    Password
                  </CardTitle>
                  <CardDescription>Change your password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button>Update Password</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Two-Factor Authentication
                  </CardTitle>
                  <CardDescription>Add an extra layer of security</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-orange-500/10 p-3">
                        <Smartphone className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-medium">Authenticator App</p>
                        <p className="text-sm text-muted-foreground">
                          Use an app like Google Authenticator
                        </p>
                      </div>
                    </div>
                    <Button variant="outline">Enable</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-red-500/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-red-500">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-red-500/20 p-4">
                    <div>
                      <p className="font-medium">Sign out everywhere</p>
                      <p className="text-sm text-muted-foreground">
                        Sign out of all devices and sessions
                      </p>
                    </div>
                    <Button variant="outline" className="text-red-500 hover:bg-red-500/10">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out All
                    </Button>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-red-500/20 p-4">
                    <div>
                      <p className="font-medium">Delete Account</p>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Billing */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              {/* Current Plan */}
              <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-primary p-3">
                        <Zap className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold">Pro Plan</h3>
                          <Badge className="bg-primary/20 text-primary">Active</Badge>
                        </div>
                        <p className="text-muted-foreground">
                          ₹2,999/month • Renews on Feb 1, 2026
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">Change Plan</Button>
                      <Button variant="ghost" className="text-red-500 hover:bg-red-500/10">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Stats */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">Usage This Month</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Members", used: 245, limit: 500, icon: Users },
                    { label: "Staff Accounts", used: 8, limit: 15, icon: User },
                    { label: "SMS Credits", used: 150, limit: 500, icon: Mail },
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                          {item.label}
                        </span>
                        <span className="text-muted-foreground">
                          {item.used} / {item.limit}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${(item.used / item.limit) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 p-2">
                        <CreditCard className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">•••• •••• •••• 4242</p>
                        <p className="text-sm text-muted-foreground">Expires 12/27</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Update
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
