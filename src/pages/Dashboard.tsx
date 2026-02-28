import { AppLayout } from "@/components/AppLayout";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Droplets, Heart, Scale, Utensils, User } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const quickLinks = [
  { to: "/chatbot", label: "Chat with AI", icon: Activity, color: "bg-primary/10 text-primary" },
  { to: "/analyser", label: "Analyse Food", icon: Utensils, color: "bg-accent/10 text-accent-foreground" },
  { to: "/predictor", label: "Predictions", icon: Heart, color: "bg-success/10 text-success" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const { profile, updateProfile, loading } = useProfile();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    age: "",
    weight: "",
    diabetes_type: "",
    daily_carb_limit: "",
    recent_glucose_level: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        age: profile.age?.toString() || "",
        weight: profile.weight?.toString() || "",
        diabetes_type: profile.diabetes_type || "",
        daily_carb_limit: profile.daily_carb_limit?.toString() || "",
        recent_glucose_level: profile.recent_glucose_level?.toString() || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    const error = await updateProfile({
      full_name: form.full_name || null,
      age: form.age ? parseInt(form.age) : null,
      weight: form.weight ? parseFloat(form.weight) : null,
      diabetes_type: form.diabetes_type || null,
      daily_carb_limit: form.daily_carb_limit ? parseInt(form.daily_carb_limit) : null,
      recent_glucose_level: form.recent_glucose_level ? parseFloat(form.recent_glucose_level) : null,
    } as any);
    if (error) toast.error("Failed to update profile");
    else { toast.success("Profile updated!"); setEditing(false); }
  };

  const needsProfile = !profile?.age || !profile?.diabetes_type;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">
            Hello, {profile?.full_name || user?.email?.split("@")[0]} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">Here's your diabetes health overview</p>
        </div>

        {needsProfile && (
          <Card className="mb-8 border-warning/30 bg-warning/5">
            <CardContent className="flex items-center gap-4 p-6">
              <User className="h-8 w-8 text-warning" />
              <div className="flex-1">
                <p className="font-semibold">Complete your health profile</p>
                <p className="text-sm text-muted-foreground">Add your age, weight, and diabetes type for personalized advice.</p>
              </div>
              <Button onClick={() => setEditing(true)}>Complete Profile</Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {quickLinks.map(({ to, label, icon: Icon, color }) => (
            <Link key={to} to={to}>
              <Card className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-display text-lg font-semibold">{label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Health Stats */}
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Droplets className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="text-2xl font-bold">{profile?.recent_glucose_level || "—"}</p>
              <p className="text-sm text-muted-foreground">Glucose (mg/dL)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Utensils className="mx-auto mb-2 h-6 w-6 text-accent-foreground" />
              <p className="text-2xl font-bold">{profile?.daily_carb_limit || "—"}</p>
              <p className="text-sm text-muted-foreground">Carb Limit (g)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Scale className="mx-auto mb-2 h-6 w-6 text-success" />
              <p className="text-2xl font-bold">{profile?.weight || "—"}</p>
              <p className="text-sm text-muted-foreground">Weight (kg)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Heart className="mx-auto mb-2 h-6 w-6 text-destructive" />
              <p className="text-2xl font-bold">{profile?.diabetes_type || "—"}</p>
              <p className="text-sm text-muted-foreground">Diabetes Type</p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Editor */}
        <Card className="mt-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display">Health Profile</CardTitle>
            <Button variant={editing ? "default" : "outline"} onClick={() => editing ? handleSave() : setEditing(true)}>
              {editing ? "Save Changes" : "Edit Profile"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} disabled={!editing} />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} disabled={!editing} />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} disabled={!editing} />
              </div>
              <div className="space-y-2">
                <Label>Diabetes Type</Label>
                <Select value={form.diabetes_type} onValueChange={(v) => setForm({ ...form, diabetes_type: v })} disabled={!editing}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Type 1">Type 1</SelectItem>
                    <SelectItem value="Type 2">Type 2</SelectItem>
                    <SelectItem value="Gestational">Gestational</SelectItem>
                    <SelectItem value="Pre-diabetes">Pre-diabetes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Daily Carb Limit (g)</Label>
                <Input type="number" value={form.daily_carb_limit} onChange={(e) => setForm({ ...form, daily_carb_limit: e.target.value })} disabled={!editing} />
              </div>
              <div className="space-y-2">
                <Label>Recent Glucose (mg/dL)</Label>
                <Input type="number" value={form.recent_glucose_level} onChange={(e) => setForm({ ...form, recent_glucose_level: e.target.value })} disabled={!editing} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
