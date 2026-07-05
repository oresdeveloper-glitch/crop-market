import { useState, useEffect, FormEvent } from "react";
import { farmerApi } from "../../services/api";

export default function FarmerProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({ farmLocation: "", region: "", mainCrop: "", fullName: "", phone: "", email: "" });
  const [msg, setMsg] = useState({ text: "", ok: false });

  useEffect(() => {
    farmerApi.getProfile().then((res) => {
      setProfile(res.data);
      setForm({
        farmLocation: res.data.farmLocation || "",
        region: res.data.region || "",
        mainCrop: res.data.mainCrop || "",
        fullName: res.data.user.fullName || "",
        phone: res.data.user.phone || "",
        email: res.data.user.email || "",
      });
    });
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await farmerApi.updateProfile(form);
      setMsg({ text: "Profile saved", ok: true });
    } catch { setMsg({ text: "Failed to save", ok: false }); }
  };

  if (!profile) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-navy-900 dark:text-white mb-6">Farmer Profile</h1>
      {msg.text && (
        <div className={`text-sm px-4 py-2 rounded-lg mb-4 ${msg.ok ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-50 text-red-600"}`}>
          {msg.text}
        </div>
      )}
      <form onSubmit={submit} className="card p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-navy-500 mb-1.5">Full name</label>
            <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-navy-500 mb-1.5">Phone</label>
            <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-navy-500 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-navy-500 mb-1.5">Farm location</label>
            <input type="text" value={form.farmLocation} onChange={(e) => setForm({ ...form, farmLocation: e.target.value })}
              className="input-field" placeholder="e.g. Arusha" />
          </div>
          <div>
            <label className="block text-xs font-medium text-navy-500 mb-1.5">Region</label>
            <input type="text" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}
              className="input-field" placeholder="e.g. Manyara" />
          </div>
          <div>
            <label className="block text-xs font-medium text-navy-500 mb-1.5">Main crop</label>
            <input type="text" value={form.mainCrop} onChange={(e) => setForm({ ...form, mainCrop: e.target.value })}
              className="input-field" placeholder="e.g. Tomatoes" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-navy-400 font-medium">Verification:</span>
          <span className={`status-${profile.verificationStatus === "VERIFIED" ? "green" : "yellow"}`}>
            {profile.verificationStatus}
          </span>
        </div>

        <button type="submit" className="btn-primary">Save changes</button>
      </form>
    </div>
  );
}
