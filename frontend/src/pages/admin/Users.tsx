import { useState, useEffect } from "react";
import { adminApi } from "../../services/api";
import Table from "../../components/common/Table";

export default function AdminUsers() {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [tab, setTab] = useState<"farmers" | "buyers">("farmers");
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([adminApi.getFarmers(), adminApi.getBuyers()])
      .then(([f, b]) => { setFarmers(f.data); setBuyers(b.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleVerify = async (id: string, status: string) => {
    try {
      await adminApi.verifyFarmer(id, status);
      setFarmers((prev) => prev.map((f) => (f.id === id ? { ...f, verificationStatus: status } : f)));
    } catch (err) {
      console.error(err);
    }
    setConfirmId(null);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Users</h1>
        <p className="text-sm text-navy-400 mt-1">{farmers.length + buyers.length} total users</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("farmers")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "farmers" ? "bg-navy-900 text-white dark:bg-white dark:text-navy-900" : "btn-secondary"
          }`}>
          Farmers ({farmers.length})
        </button>
        <button onClick={() => setTab("buyers")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "buyers" ? "bg-navy-900 text-white dark:bg-white dark:text-navy-900" : "btn-secondary"
          }`}>
          Buyers ({buyers.length})
        </button>
      </div>

      {tab === "farmers" && (
        <Table
          columns={[
            { key: "name", header: "Name", render: (f: any) => f.user.fullName },
            { key: "phone", header: "Phone", render: (f: any) => f.user.phone || "—" },
            { key: "email", header: "Email", render: (f: any) => f.user.email || "—" },
            { key: "location", header: "Location", render: (f: any) => f.farmLocation || f.region || "—" },
            { key: "mainCrop", header: "Main crop", render: (f: any) => f.mainCrop || "—" },
            { key: "verificationStatus", header: "Status", render: (f: any) => (
              <span className={`status-${
                f.verificationStatus === "VERIFIED" ? "green" :
                f.verificationStatus === "REJECTED" ? "red" : "yellow"
              }`}>{f.verificationStatus}</span>
            )},
            { key: "actions", header: "Actions", render: (f: any) => (
              confirmId === f.id ? (
                <div className="flex gap-1.5">
                  <button onClick={() => handleVerify(f.id, "VERIFIED")}
                    className="px-2.5 py-1 text-xs rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors">
                    Confirm
                  </button>
                  <button onClick={() => setConfirmId(null)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-navy-100 dark:bg-navy-700 text-navy-600 dark:text-navy-300 hover:bg-navy-200 transition-colors">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  {f.verificationStatus !== "VERIFIED" && (
                    <button onClick={() => setConfirmId(f.id)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500/20 transition-colors">
                      Verify
                    </button>
                  )}
                  {f.verificationStatus !== "REJECTED" && (
                    <button onClick={() => handleVerify(f.id, "REJECTED")}
                      className="px-2.5 py-1 text-xs rounded-lg bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                      Reject
                    </button>
                  )}
                </div>
              )
            )},
          ]}
          data={farmers}
        />
      )}

      {tab === "buyers" && (
        <Table
          columns={[
            { key: "name", header: "Name", render: (b: any) => b.user.fullName },
            { key: "business", header: "Business", render: (b: any) => b.businessName || "—" },
            { key: "type", header: "Type", render: (b: any) => b.buyerType || "—" },
            { key: "location", header: "Location", render: (b: any) => b.location || "—" },
            { key: "phone", header: "Phone", render: (b: any) => b.user.phone || "—" },
          ]}
          data={buyers}
        />
      )}
    </div>
  );
}
