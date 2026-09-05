import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// 🎨 PRIMARY BRAND RED COLORS
const PRIMARY_RED = '#C8102E';
const PRIMARY_RED_HOVER = '#A60F28';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Lazy initialize state once on mount to prevent localStorage reading on every key press
  const [form, setForm] = useState(() => {
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem('nagorik_user') || '{}');
    } catch (e) {
      console.error(e);
    }
    return {
      name: saved.name || 'Nagorik User',
      email: saved.email || 'user@nagorik.gov.bd',
      phone: saved.phone || '+880 1700-000000',
      bio: saved.bio || 'Active citizen contributing towards community development.',
      avatar: saved.avatar || saved.image || null,
      division: saved.division || 'Dhaka',
      district: saved.district || 'Dhaka',
      subDistrict: saved.subDistrict || 'Dhanmondi',
      cityCorporation: saved.cityCorporation || 'Dhaka South City Corporation',
      union: saved.union || 'N/A',
      wardNumber: saved.wardNumber || '15',
      roadNumber: saved.roadNumber || '27',
      houseNumber: saved.houseNumber || '42/A',
      privacy: saved.privacy || {
        publicProfile: true,
        showAddressDetails: true,
        hideContactInfo: true,
        showActivityLeaderboard: true,
        anonymousReportingDefault: false,
      },
    };
  });

  useEffect(() => {
    document.title = "Edit Profile — নাগরিক";
  }, []);

  // Generic Field Handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle Privacy Switch
  const togglePrivacy = (key) => {
    setForm((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: !prev.privacy[key] },
    }));
  };

  // Image Upload Handler
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm((prev) => ({ ...prev, avatar: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  // Prevent Enter key from submitting form; unfocus input instead
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  };

  // Form Submission
  const handleSaveClick = (e) => {
    e.preventDefault();
    if (!window.confirm("Do you want to save changes?")) return;

    localStorage.setItem('nagorik_user', JSON.stringify(form));
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-[1160px] px-7 pt-10 pb-[60px] max-[760px]:px-4">
        
        <h1 className="mb-8 text-[26px] font-extrabold" style={{ color: PRIMARY_RED }}>Edit Profile</h1>

        <form onSubmit={handleSaveClick} onKeyDown={handleKeyDown} className="flex flex-col gap-8">
          
          {/* SECTION 1: PERSONAL INFO & PHOTO */}
          <section className="rounded-2xl border-2 border-gray-300 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-6 pb-2 text-[17px] font-extrabold" style={{ color: PRIMARY_RED }}>
              Personal Information & Photo
            </h2>
            
            <div className="flex items-center gap-6 mb-6 max-[600px]:flex-col max-[600px]:items-start">
              <div 
                className="group relative flex h-[110px] w-[110px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 bg-gray-100 dark:bg-gray-700 shadow-lg"
                style={{ borderColor: PRIMARY_RED }}
                onClick={() => fileInputRef.current?.click()}
              >
                {form.avatar ? (
                  <img src={form.avatar} alt="Profile" className="h-full w-full object-cover transition-opacity group-hover:opacity-75" />
                ) : (
                  <svg className="h-12 w-12" style={{ color: PRIMARY_RED }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </div>

              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full px-5 py-2 text-[13px] font-bold text-white transition-transform hover:scale-105 cursor-pointer shadow-sm"
                style={{ backgroundColor: PRIMARY_RED }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_RED_HOVER)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_RED)}
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
                  <label className="mb-1.5 block text-[13px] font-bold">{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-gray-300 bg-gray-50 px-4 py-2.5 text-[14px] font-semibold outline-none focus:border-[var(--brand-red)] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    style={{ '--brand-red': PRIMARY_RED }}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 2: ADDRESS FIELDS */}
          <section className="rounded-2xl border-2 border-gray-300 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-2 text-[17px] font-extrabold border-b border-gray-200 pb-2 dark:border-gray-700" style={{ color: PRIMARY_RED }}>
              Home Area
            </h2>
            <p className="mb-5 text-[12.5px] font-medium text-gray-500 dark:text-gray-400">Specify your location details for local civic routing.</p>

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
                  <label className="mb-1 block text-[12.5px] font-bold">{field.label}</label>
                  <input
                    type="text"
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full rounded-xl border-2 border-gray-300 bg-gray-50 px-3.5 py-2 text-[13.5px] font-semibold outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 3: PRIVACY FEATURES */}
          <section className="rounded-2xl border-2 border-gray-300 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-1 text-[17px] font-extrabold border-b border-gray-200 pb-2 dark:border-gray-700" style={{ color: PRIMARY_RED }}>
              Privacy & Visibility Features
            </h2>
            <p className="mb-4 text-[12.5px] font-medium text-gray-500 dark:text-gray-400">Configure public visibility options for your profile.</p>

            <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
              {[
                { key: 'publicProfile', title: '1. Public Profile Visibility', desc: 'Allow other citizens to view your profile and contributions.' },
                { key: 'showAddressDetails', title: '2. Display Address Hierarchy', desc: 'Show Ward, District, and Sub-district details on public issue posts.' },
                { key: 'hideContactInfo', title: '3. Hide Contact Info', desc: 'Keep phone number and email hidden from standard users.' },
                { key: 'showActivityLeaderboard', title: '4. Leaderboard Ranking', desc: 'Include your account in community activity leaderboards.' },
                { key: 'anonymousReportingDefault', title: '5. Default Anonymous Submissions', desc: 'Automatically mark new civic reports as anonymous.' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3.5">
                  <div className="pr-4">
                    <h4 className="text-[14px] font-bold text-gray-900 dark:text-white">{item.title}</h4>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePrivacy(item.key)}
                    style={{ backgroundColor: form.privacy[item.key] ? PRIMARY_RED : '' }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${!form.privacy[item.key] ? 'bg-gray-300 dark:bg-gray-600' : ''}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${form.privacy[item.key] ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4: LIVE PREVIEW */}
          <section className="rounded-2xl border-2 border-gray-300 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-[17px] font-extrabold border-b border-gray-200 pb-2 dark:border-gray-700" style={{ color: PRIMARY_RED }}>
              Preview
            </h2>
            
            <div className="overflow-hidden rounded-2xl border-2 bg-white shadow-lg dark:bg-gray-900" style={{ borderColor: PRIMARY_RED }}>
              <div className="p-6 text-white" style={{ backgroundColor: PRIMARY_RED }}>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center">
                    {form.avatar ? (
                      <img src={form.avatar} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <svg className="h-10 w-10" style={{ color: PRIMARY_RED }} fill="currentColor" viewBox="0 0 24 24">
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
                <p className="text-[14px] font-semibold text-gray-800 dark:text-gray-200 italic">"{form.bio}"</p>
                <div className="grid grid-cols-2 gap-4 border-t-2 border-gray-100 dark:border-gray-800 pt-3">
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">Contact Details</span>
                    <span className="text-[13px] font-bold text-gray-900 dark:text-white">
                      {form.privacy.hideContactInfo ? "Hidden by Privacy Setting" : `${form.email} | ${form.phone}`}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">Address Line</span>
                    <span className="text-[13px] font-bold text-gray-900 dark:text-white">
                      House {form.houseNumber}, Road {form.roadNumber}, {form.subDistrict}
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
              className="rounded-full border-2 border-gray-300 px-6 py-2.5 text-[13px] font-bold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full px-8 py-2.5 text-[13px] font-bold text-white transition-all shadow-md hover:shadow-lg"
              style={{ backgroundColor: PRIMARY_RED }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_RED_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_RED)}
            >
              Save
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}