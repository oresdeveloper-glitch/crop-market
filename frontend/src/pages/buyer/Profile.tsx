import { useState, useEffect, FormEvent } from "react";
import { buyerApi } from "../../services/api";

export default function BuyerProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({ businessName: "", buyerType: "", location: "", fullName: "", phone: "", email: "" });
  const [msg, setMsg] = useState({ text: "", ok: false });

  useEffect(() => {
    buyerApi.getProfile().then((res) => {
      setProfile(res.data);
      setForm({
        businessName: res.data.businessName || "",
        buyerType: res.data.buyerType || "",
        location: res.data.location || "",
        fullName: res.data.user.fullName || "",
        phone: res.data.user.phone || "",
        email: res.data.user.email || "",
      });
    });
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await buyerApi.updateProfile(form);
      setMsg({ text: "Profile saved", ok: true });
    } catch { setMsg({ text: "Failed to save", ok: false }); }
  };

  if (!profile) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-navy-900 dark:text-white mb-6">Buyer Profile</h1>
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
            <label className="block text-xs font-medium text-navy-500 mb-1.5">Business name</label>
            <input type="text" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              className="input-field" placeholder="e.g. FreshPro Ltd" />
          </div>
          <div>
            <label className="block text-xs font-medium text-navy-500 mb-1.5">Buyer type</label>
            <input type="text" value={form.buyerType} onChange={(e) => setForm({ ...form, buyerType: e.target.value })}
              className="input-field" placeholder="e.g. Wholesaler" />
          </div>
          <div>
            <label className="block text-xs font-medium text-navy-500 mb-1.5">Location</label>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="input-field" placeholder="e.g. Dar es Salaam" />
          </div>
        </div>
        <button type="submit" className="btn-primary">Save changes</button>
      </form>
    </div>
  );
}
