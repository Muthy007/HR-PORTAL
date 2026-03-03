import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

function HRProfile() {
    const navigate = useNavigate()
    const [hrUser, setHrUser] = useState({ name: 'ADMIN', phone: '', address: '', department: 'HR', hrId: 'HR-0001', manager1: '', manager2: '' })
    const [editForm, setEditForm] = useState({ name: '', phone: '', address: '', profileImage: '', hrId: '', manager1: '', manager2: '' })
    const [imagePreview, setImagePreview] = useState(null)

    useEffect(() => {
        const storedHr = localStorage.getItem('hr_credentials')
        let parsedUser = null
        if (storedHr) {
            parsedUser = JSON.parse(storedHr)
        }

        if (parsedUser) {
            setHrUser({ ...parsedUser, department: 'HR' })
            setEditForm({
                name: parsedUser.name || '',
                phone: parsedUser.phone || '',
                address: parsedUser.address || '',
                profileImage: parsedUser.profileImage || '',
                hrId: parsedUser.hrId || 'HR-0001',
                manager1: parsedUser.manager1 || '',
                manager2: parsedUser.manager2 || ''
            })
            setImagePreview(parsedUser.profileImage || null)
        } else {
            setEditForm({ name: 'ADMIN', phone: '', address: '', profileImage: '', hrId: 'HR-0001', manager1: '', manager2: '' })
        }
    }, [])

    const handleSaveProfile = (e) => {
        e.preventDefault()
        const updatedUser = { ...hrUser, ...editForm, department: 'HR' }
        setHrUser(updatedUser)
        localStorage.setItem('hr_credentials', JSON.stringify(updatedUser))

        // Dispatch custom event to notify other components (like topbar)
        window.dispatchEvent(new Event('hrProfileUpdated'))
        alert("Profile saved successfully!")
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024 * 2) { // 2MB limit
                alert("Image size should be less than 2MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setEditForm(prev => ({ ...prev, profileImage: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <svg className="w-6 h-6 text-[#5A725A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Edit HR Profile
                    </h2>
                </div>

                <form onSubmit={handleSaveProfile} className="p-8">
                    {/* Profile Image Upload */}
                    <div className="flex flex-col items-center justify-center mb-10">
                        <div className="relative w-32 h-32 rounded-full border-4 border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center mb-3 shadow-sm group">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-gray-300 text-5xl font-bold">{editForm.name.charAt(0) || 'M'}</span>
                            )}
                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Click image to upload new profile photo</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                HR ID
                                <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase">Required</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={editForm.hrId}
                                onChange={(e) => setEditForm({ ...editForm, hrId: e.target.value })}
                                className="w-full border border-gray-200 px-4 py-3 rounded-xl bg-gray-50 text-gray-700 text-base font-bold focus:ring-2 focus:ring-[#5A725A]/20 focus:border-[#5A725A] outline-none transition-all uppercase"
                                placeholder="e.g. HR-001"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                required
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#5A725A]/20 focus:border-[#5A725A] outline-none transition-all placeholder:text-gray-400 text-base"
                                placeholder="Enter HR Name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                            <input
                                type="tel"
                                value={editForm.phone}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#5A725A]/20 focus:border-[#5A725A] outline-none transition-all placeholder:text-gray-400 text-base"
                                placeholder="e.g. +1 234 567 8900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                Department
                                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase">Auto-Assigned</span>
                            </label>
                            <input
                                type="text"
                                readOnly
                                value="HR"
                                className="w-full border border-gray-200 px-4 py-3 rounded-xl bg-gray-50 text-gray-500 text-base font-semibold cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <h4 className="text-xs font-black tracking-widest text-[#5A725A] mb-6 uppercase">Reporting Hierarchy</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Reporting Manager 1</label>
                                <input
                                    type="text"
                                    value={editForm.manager1}
                                    onChange={(e) => setEditForm({ ...editForm, manager1: e.target.value })}
                                    className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#5A725A]/20 focus:border-[#5A725A] outline-none transition-all placeholder:text-gray-400 text-base"
                                    placeholder="Primary Manager Name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Reporting Manager 2</label>
                                <input
                                    type="text"
                                    value={editForm.manager2}
                                    onChange={(e) => setEditForm({ ...editForm, manager2: e.target.value })}
                                    className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#5A725A]/20 focus:border-[#5A725A] outline-none transition-all placeholder:text-gray-400 text-base"
                                    placeholder="Secondary Manager Name"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex justify-end">
                        <button
                            type="submit"
                            className="bg-[#5A725A] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#4a5f4a] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default HRProfile
