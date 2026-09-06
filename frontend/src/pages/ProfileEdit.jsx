import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const emptyForm = {
    name: '',
    email: '',
    phone: '',
    bio: '',
    avatar: null,
    division: '',
    district: '',
    subDistrict: '',
    cityCorporation: '',
    union: '',
    wardNumber: '',
    roadNumber: '',
    houseNumber: '',
    privacy: {
      publicProfile: true,
      showAddressDetails: true,
      hideContactInfo: true,
      showActivityLeaderboard: true,
      anonymousReportingDefault: false,
    },
  };

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Edit Profile — নাগরিক";
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('nagorik_token');
    if (!token) {
      setError('You must be logged in to edit your profile.');
      setLoading(false);
      return;
    }

    const abortController = new AbortController();

    fetch('/api/profile', {
      headers: { Authorization: `Bearer ${token}` },
      signal: abortController.signal
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Failed to load profile');
        }
        return res.json();
      })
      .then((data) => {
        setForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          bio: data.bio || '',
          avatar: data.avatar || null,
          division: data.address?.division || '',
          district: data.address?.district || '',
          subDistrict: data.address?.subDistrict || '',
          cityCorporation: data.address?.cityCorporation || '',
          union: data.address?.union || '',
          wardNumber: data.address?.wardNumber || '',
          roadNumber: data.address?.roadNumber || '',
          houseNumber: data.address?.houseNumber || '',
          privacy: data.privacy || emptyForm.privacy,
        });
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => abortController.abort(); // Cleanup fetch on unmount
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const togglePrivacy = (key) => {
    setForm((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: !prev.privacy[key] },
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm((prev) => ({ ...prev, avatar: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  };

  const handleSaveClick = async (e) => {
    e.preventDefault();
    if (!window.confirm("Do you want to save changes?")) return;

    const token = localStorage.getItem('nagorik_token');
    if (!token) {
      alert('You must be logged in to save changes.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          bio: form.bio,
          avatar: form.avatar,
          address: {
            division: form.division,
            district: form.district,
            subDistrict: form.subDistrict,
            cityCorporation: form.cityCorporation,
            union: form.union,
            wardNumber: form.wardNumber,
            roadNumber: form.roadNumber,
            houseNumber: form.houseNumber,
          },
          privacy: form.privacy,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to save changes');
      }

      navigate(-1);
    } catch (err) {
      setError(err.message);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-nagorik-cream dark:bg-nagorik-cream">
        <p className="text-nagorik-muted font-semibold">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nagorik-cream text-nagorik-text">
      <div className="mx-auto max-w-[1160px] px-7 pt-10 pb-[60px] max-[760px]:px-4">

        <h1 className="mb-8 text-[35px] text-center font-extrabold text-nagorik-red">Edit Profile</h1>

        {error && (
          <div className="mb-6 rounded-xl border-2 border-nagorik-red bg-nagorik-soft-red px-4 py-3 text-[13px] font-semibold text-nagorik-red">
            {error}
          </div>
        )}

        <form onSubmit={handleSaveClick} onKeyDown={handleKeyDown} className="flex flex-col gap-8">

          {/* SECTION 1: PERSONAL INFO & PHOTO */}
          <section className="rounded-2xl border-2 border-nagorik-border bg-nagorik-paper p-6 shadow-md">
            <h2 className="mb-6 pb-2 text-[17px] font-extrabold text-nagorik-red">
              Personal Information & Photo
            </h2>

            <div className="flex items-center gap-6 mb-6 max-[600px]:flex-col max-[600px]:items-start">
              <div
                className="group relative flex h-[110px] w-[110px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 border-nagorik-red bg-nagorik-surface-2 shadow-lg"
                onClick={() => fileInputRef.current?.click()}
              >
                {form.avatar ? (
                  <img src={form.avatar} alt="Profile" className="h-full w-full object-cover transition-opacity group-hover:opacity-75" />
                ) : (
                  <svg className="h-12 w-12 text-nagorik-red" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </div>

              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full bg-nagorik-red px-5 py-2 text-[13px] font-bold text-white transition-transform hover:scale-105 hover:bg-nagorik-hover-red cursor-pointer shadow-sm"
              >
                Upload New Photo
              </button>
            </div>

            <div className="grid grid-cols-2 gap-5 max-[600px]:grid-cols-1">
              {[
                { label: 'Full Name', name: 'name', type: 'text' },
                { label: 'Email Address', name: 'email', type: 'email' },
                { label: 'Phone Number', name: 'phone', type: 'text' },
                { label: 'Bio', name: 'bio', type: 'text' },
              ].map((field) => (
                <div key={field.name}>
                  <label htmlFor={`input-${field.name}`} className="mb-1.5 block text-[13px] font-bold">{field.label}</label>
                  <input
                    id={`input-${field.name}`}
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-nagorik-border bg-nagorik-surface-2 px-4 py-2.5 text-[14px] font-semibold outline-none focus:border-nagorik-red"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 2: ADDRESS FIELDS */}
          <section className="rounded-2xl border-2 border-nagorik-border bg-nagorik-paper p-6 shadow-md">
            <h2 className="mb-2 text-[17px] font-extrabold border-b border-nagorik-line pb-2 text-nagorik-red">
              Home Area
            </h2>
            <p className="mb-5 text-[12.5px] font-medium text-nagorik-muted">Specify your location details for local civic routing.</p>

            <div className="grid grid-cols-2 gap-4 max-[760px]:grid-cols-1">
              {[
                { label: 'Division', name: 'division', placeholder: 'e.g. Dhaka' },
                { label: 'District', name: 'district', placeholder: 'e.g. Dhaka' },
                { label: 'Sub-District (Upazila)', name: 'subDistrict', placeholder: 'e.g. Dhanmondi' },
                { label: 'City-Corporation', name: 'cityCorporation', placeholder: 'e.g. Dhaka South City Corporation' },
                { label: 'Union', name: 'union', placeholder: 'e.g. N/A or Union Name' },
                { label: 'Ward Number', name: 'wardNumber', placeholder: 'e.g. 15' },
                { label: 'Road Number', name: 'roadNumber', placeholder: 'e.g. 27' },
                { label: 'House Number', name: 'houseNumber', placeholder: 'e.g. 42/A' },
              ].map((field) => (
                <div key={field.name}>
                  <label htmlFor={`input-${field.name}`} className="mb-1 block text-[12.5px] font-bold">{field.label}</label>
                  <input
                    id={`input-${field.name}`}
                    type="text"
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full rounded-xl border-2 border-nagorik-border bg-nagorik-surface-2 px-3.5 py-2 text-[13.5px] font-semibold outline-none focus:border-nagorik-red"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 3: PRIVACY FEATURES */}
          <section className="rounded-2xl border-2 border-nagorik-border bg-nagorik-paper p-6 shadow-md">
            <h2 className="mb-1 text-[17px] font-extrabold border-b border-nagorik-line pb-2 text-nagorik-red">
              Privacy & Visibility Features
            </h2>
            <p className="mb-4 text-[12.5px] font-medium text-nagorik-muted">Configure public visibility options for your profile.</p>

            <div className="flex flex-col divide-y divide-nagorik-line">
              {[
                { key: 'publicProfile', title: '1. Public Profile Visibility', desc: 'Allow other citizens to view your profile and contributions.' },
                { key: 'showAddressDetails', title: '2. Display Address Hierarchy', desc: 'Show Ward, District, and Sub-district details on public issue posts.' },
                { key: 'hideContactInfo', title: '3. Hide Contact Info', desc: 'Keep phone number and email hidden from standard users.' },
                { key: 'showActivityLeaderboard', title: '4. Leaderboard Ranking', desc: 'Include your account in community activity leaderboards.' },
                { key: 'anonymousReportingDefault', title: '5. Default Anonymous Submissions', desc: 'Automatically mark new civic reports as anonymous.' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3.5">
                  <div className="pr-4">
                    <h4 className="text-[14px] font-bold text-nagorik-heading">{item.title}</h4>
                    <p className="text-[12px] text-nagorik-muted">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePrivacy(item.key)}
                    className={`toggle ${form.privacy[item.key] ? 'active' : ''}`}
                    aria-pressed={form.privacy[item.key]}
                    aria-label={`Toggle ${item.title}`}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4: LIVE PREVIEW */}
          <section className="rounded-2xl border-2 border-nagorik-border bg-nagorik-paper p-6 shadow-md">
            <h2 className="mb-4 text-[17px] font-extrabold border-b border-nagorik-line pb-2 text-nagorik-red">
              Preview
            </h2>

            <div className="overflow-hidden rounded-2xl border-2 border-nagorik-red bg-nagorik-paper shadow-lg">
              <div className="p-6 text-white bg-nagorik-red">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center">
                    {form.avatar ? (
                      <img src={form.avatar} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <svg className="h-10 w-10 text-nagorik-red" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-[20px] font-black text-white">{form.name || "Citizen Name"}</h3>
                    <p className="text-[12.5px] font-bold text-gray-300">Member • Active Contributor</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-[14px] font-semibold text-nagorik-body-text italic">
                  "{form.bio || "No bio added yet."}"
                </p>
                <div className="grid grid-cols-2 gap-4 border-t-2 border-nagorik-line pt-3">
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-nagorik-muted">Contact Details</span>
                    <span className="text-[13px] font-bold text-nagorik-heading">
                      {form.privacy.hideContactInfo ? "Hidden by Privacy Setting" : `${form.email || 'No email'} | ${form.phone || 'No phone'}`}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-nagorik-muted">Address Line</span>
                    <span className="text-[13px] font-bold text-nagorik-heading">
                      House {form.houseNumber || '—'}, Road {form.roadNumber || '—'}, {form.subDistrict || '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-full border-2 border-nagorik-border px-6 py-2.5 text-[13px] font-bold text-nagorik-secondary hover:bg-nagorik-surface-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-nagorik-red px-8 py-2.5 text-[13px] font-bold text-white transition-all shadow-md hover:shadow-lg hover:bg-nagorik-hover-red disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}