import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Users, CheckCircle, XCircle, FileText, Building2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
 import {
  getAllUsers,
  updateUserStatus,
  getCareRequests,
  getOrphanRequests,
  updateCareRequest,
  updateOrphanRequest,
  getUserById
} from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/contexts/AuthContext";
import type { CareRequest, OrphanRequest } from "@/lib/mockData";
import DashboardHeader from "@/components/DashboardHeader";
import { Info, X } from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
const priorityConfig: Record<string, { color: string; icon: string }> = {
  LOW: { color: "text-green-600", icon: "🟢" },
  MEDIUM: { color: "text-yellow-600", icon: "🟡" },
  HIGH: { color: "text-orange-600", icon: "🟠" },
  SEVERE: { color: "text-red-600", icon: "🔴" },
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [careReqs, setCareReqs] = useState<CareRequest[]>([]);
  const [orphanReqs, setOrphanReqs] = useState<OrphanRequest[]>([]);
  const [tab, setTab] = useState<"priority" | "users" | "care" | "orphan">("priority");
  const [profileModal, setProfileModal] = useState<any | null>(null);
  const [rejectedUsers, setRejectedUsers] = useState<any[]>([]);

const load = () => {

  const waitingCare = getCareRequests().filter(r => r.status === "waiting");
  const waitingOrphan = getOrphanRequests().filter(r => r.status === "waiting");

  const rejectedCare = getCareRequests().filter(r => r.status === "rejected");
  const rejectedOrphan = getOrphanRequests().filter(r => r.status === "rejected");

  setPendingUsers([...waitingCare, ...waitingOrphan]);
  setRejectedUsers([...rejectedCare, ...rejectedOrphan]);

  setCareReqs(getCareRequests().filter(r => r.status === "approved"));
  setOrphanReqs(getOrphanRequests().filter(r => r.status === "approved"));

};

  useEffect(() => { load(); }, []);

  const handleUserAction = (userId: string, status: "approved" | "rejected") => {
    updateUserStatus(userId, status);
    toast({ title: `User ${status}` });
    load();
  };

  const handleCareApprove = (id: string) => {
    updateCareRequest(id, { status: "approved" });
    toast({ title: "Care request approved" });
    load();
  };

  const handleOrphanApprove = (id: string) => {
    updateOrphanRequest(id, { status: "approved" });
    toast({ title: "Orphan request approved" });
    load();
  };
  const handleCareReject = (id: string) => {
  updateCareRequest(id, { status: "waiting" });
  toast({ title: "Care request rejected" });
  load();
};

const handleOrphanReject = (id: string) => {
  updateOrphanRequest(id, { status: "waiting" });
  toast({ title: "Orphan request rejected" });
  load();
};

  const tabs = [
  { id: "priority" as const, label: "Priority", count: careReqs.length + orphanReqs.length, icon: AlertTriangle },
  { id: "users" as const, label: "Pending Users", count: pendingUsers.length, icon: Users },
  { id: "care" as const, label: "Care Requests", count: careReqs.length, icon: Heart },
  { id: "orphan" as const, label: "Orphan Requests", count: orphanReqs.length, icon: Building2 },
  ];
  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />
      <div className="container mx-auto p-4 md:p-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold font-display text-foreground mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mb-6">Manage users, care requests, and orphan support.</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`p-5 rounded-2xl border-2 text-left transition-all ${tab === t.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"}`}>
                <t.icon className={`w-6 h-6 mb-2 ${tab === t.id ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-2xl font-bold font-display text-card-foreground">{t.count}</p>
                <p className="text-sm text-muted-foreground">{t.label}</p>
              </button>
            ))}
          </div>
          {tab === "priority" && (
  <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
    <h2 className="text-lg font-bold font-display mb-4 text-foreground">Priority Requests</h2>

    {[...careReqs, ...orphanReqs].map((r: any) => {
      const p = priorityConfig[r.priority || "LOW"];
      

      return (
        <motion.div key={r.id} variants={item} className="bg-card rounded-2xl border border-border p-5 shadow-card">
          <div className="flex justify-between">
            <div>
              <h3 className="font-bold text-card-foreground flex items-center gap-2">
                <span>{p.icon}</span>
                {r.elderName || r.name}
              </h3>

              <p className="text-sm text-muted-foreground mt-1">
                {r.description}
              </p>

              <p className={`text-xs font-bold mt-1 ${p.color}`}>
                Priority: {r.priority || "LOW"}
              </p>
            </div>

            
<Button
  size="sm"
  variant="ghost"
  onClick={() => setProfileModal(r)}
  className="gap-1"
>
  <Info className="w-4 h-4" />
  Info
</Button>
          </div>
        </motion.div>
      );
    })}
  </motion.div>
)}
          {tab === "users" && (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              <h2 className="text-lg font-bold font-display mb-4 text-foreground">Pending User Approvals</h2>
              {pendingUsers.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                  <p className="text-muted-foreground">All users have been reviewed.</p>
                </div>
              ) : (
                pendingUsers.map((u) => (
                  <motion.div key={u.id} variants={item} className="bg-card rounded-2xl border border-border p-5 shadow-card">
                    <div className="flex items-center justify-between">
                      <div>
                       <div>

<h3 className="font-bold text-card-foreground">
  {u.elderName || u.name} {u.helpType ? `— ${u.helpType}` : ""}
</h3>

<p className="text-sm text-muted-foreground mt-1">
  {u.description}
</p>

<p className="text-xs text-muted-foreground mt-2">
  {u.location || "Location not provided"} · Status: 
  <span className="capitalize font-medium ml-1">
    {u.status}
  </span>
</p>

</div>
                      </div>
                      <div className="flex gap-2">

<Button
  size="sm"
  variant="ghost"
  onClick={() => setProfileModal(u)}
  className="gap-1"
>
  <Info className="w-4 h-4" />
  Info
</Button>

<Button
  size="sm"
  variant="hero"
  onClick={() => {
    if (u.elderName) {
      updateCareRequest(u.id, { status: "approved" });
    } else {
      updateOrphanRequest(u.id, { status: "approved" });
    }
    load();
  }}
>
  Approve
</Button>

{u.status !== "rejected" && (
<Button
size="sm"
variant="destructive"
onClick={()=>{
if(u.elderName){
updateCareRequest(u.id,{status:"rejected"})
}else{
updateOrphanRequest(u.id,{status:"rejected"})
}
load()
}}
>
Reject
</Button>
)}

                      </div>
                    </div>
                  </motion.div>
                ))
              )}
              {/* Rejected Users Section */}

{rejectedUsers.length > 0 && (
  <div className="mt-10 space-y-3">

    <h2 className="text-lg font-bold font-display text-red-600">
      Rejected Users
    </h2>

    {rejectedUsers.map((u:any) => (

      <motion.div
        key={u.id}
        variants={item}
        className="bg-card rounded-2xl border border-border p-5 shadow-card"
      >

        <div className="flex items-center justify-between">

          <div>

            <h3 className="font-bold text-card-foreground">
              {u.elderName || u.name} {u.helpType ? `— ${u.helpType}` : ""}
            </h3>

            <p className="text-sm text-muted-foreground mt-1">
              {u.description}
            </p>

            <p className="text-xs text-muted-foreground mt-2">
              {u.location || "Location not provided"} · Status:
              <span className="text-red-600 font-medium ml-1">
                Rejected
              </span>
            </p>

          </div>

          <div className="flex gap-2">

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setProfileModal(u)}
              className="gap-1"
            >
              <Info className="w-4 h-4"/>
              Info
            </Button>

            <Button
              size="sm"
              variant="hero"
              onClick={() => {
                if (u.elderName) {
                  updateCareRequest(u.id,{status:"approved"});
                } else {
                  updateOrphanRequest(u.id,{status:"approved"});
                }
                load();
              }}
            >
              Accept
            </Button>

          </div>

        </div>

      </motion.div>

    ))}

  </div>
)}
            </motion.div>
          )}

          {tab === "care" && (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              <h2 className="text-lg font-bold font-display mb-4 text-foreground">All Care Requests</h2>
              {careReqs.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No care requests submitted yet.</p>
                </div>
              ) : (
                careReqs.map((r) => (
                  <motion.div key={r.id} variants={item} className="bg-card rounded-2xl border border-border p-5 shadow-card">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-card-foreground">{r.elderName} — {r.helpType}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">{r.location} · Status: <span className="capitalize font-medium">{r.status}</span></p>
                      </div>
                      <div className="flex gap-2">

  <Button
    size="sm"
    variant="ghost"
    onClick={() => setProfileModal(r)}
  >
    <Info className="w-4 h-4"/>
    Info
  </Button>

  {r.status === "pending" && (
    <>
      <Button
        size="sm"
        variant="hero"
        onClick={() => handleCareApprove(r.id)}
      >
        Approve
      </Button>

      <Button
        size="sm"
        variant="destructive"
        onClick={() => handleCareReject(r.id)}
      >
        Reject
      </Button>
    </>
  )}

  {r.status === "approved" && (
    <Button
      size="sm"
      variant="destructive"
      onClick={() => handleCareReject(r.id)}
    >
      Reject
    </Button>
  )}

  {r.status === "rejected" && (
    <Button
      size="sm"
      variant="hero"
      onClick={() => handleCareApprove(r.id)}
    >
      Approve
    </Button>
  )}

</div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {tab === "orphan" && (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              <h2 className="text-lg font-bold font-display mb-4 text-foreground">All Orphan Support Requests</h2>
              {orphanReqs.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No orphan support requests submitted yet.</p>
                </div>
              ) : (
                orphanReqs.map((r) => (
                  <motion.div key={r.id} variants={item} className="bg-card rounded-2xl border border-border p-5 shadow-card">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-card-foreground">{r.name}, age {r.age}</h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {r.supportTypes.map((t) => (
                            <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{r.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">Status: <span className="capitalize font-medium">{r.status}</span></p>
                      </div>
                     <div className="flex gap-2">

  <Button
    size="sm"
    variant="ghost"
    onClick={() => setProfileModal(r)}
  >
    <Info className="w-4 h-4"/>
    Info
  </Button>

  {r.status === "pending" && (
    <>
      <Button
        size="sm"
        variant="hero"
        onClick={() => handleOrphanApprove(r.id)}
      >
        Approve
      </Button>

      <Button
        size="sm"
        variant="destructive"
        onClick={() => handleOrphanReject(r.id)}
      >
        Reject
      </Button>
    </>
  )}

  {r.status === "approved" && (
    <Button
      size="sm"
      variant="destructive"
      onClick={() => handleOrphanReject(r.id)}
    >
      Reject
    </Button>
  )}

  {r.status === "rejected" && (
    <Button
      size="sm"
      variant="hero"
      onClick={() => handleOrphanApprove(r.id)}
    >
      Approve
    </Button>
  )}

</div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </motion.div>
        {profileModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-card rounded-xl p-6 w-[420px] border shadow-lg">

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Request Details</h2>

        <button onClick={() => setProfileModal(null)}>
          <X className="w-5 h-5"/>
        </button>
      </div>

      {(() => {
        const req = profileModal;
        const user = req.userId ? getUserById(req.userId) : null;

        return (
          <div className="space-y-2 text-sm">

            <p><b>Name:</b> {req.elderName || req.name}</p>

            {req.age && (
              <p><b>Age:</b> {req.age}</p>
            )}

            <p><b>Description:</b> {req.description}</p>

            {req.location && (
              <p><b>Location:</b> {req.location}</p>
            )}

            {req.helpType && (
              <p><b>Help Type:</b> {req.helpType}</p>
            )}

            <p><b>Priority:</b> {req.priority}</p>

            <p><b>Status:</b> {req.status}</p>

            {user && (
              <>
                <hr className="my-2"/>

                <p className="font-semibold">User Info</p>

                <p><b>Email:</b> {user.email}</p>
                <p><b>Role:</b> {user.role}</p>
                <p><b>Registered:</b> {new Date(user.createdAt).toLocaleDateString()}</p>
              </>
            )}

          </div>
        );
      })()}

    </div>
  </div>
)}
      </div>
    </div>
  );
}
