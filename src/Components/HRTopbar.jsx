import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import logoImg from "../assets/Signboard.jpg.jpeg"

function HRTopbar() {
  const navigate = useNavigate()
  const [hrUser, setHrUser] = useState({ name: 'ADMIN', phone: '', address: '', department: 'HR', hrId: 'HR-0001', manager1: '', manager2: '' })
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', phone: '', address: '', profileImage: '', hrId: '', manager1: '', manager2: '' })
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    const loadProfile = () => {
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
    }

    loadProfile()
    window.addEventListener('hrProfileUpdated', loadProfile)
    return () => window.removeEventListener('hrProfileUpdated', loadProfile)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("hr_logged_in")
    navigate("/")
  }

  return (
    <>
      <div className="bg-[rgb(90,114,90)] backdrop-blur-md shadow px-6 py-4 flex justify-between items-center relative z-40">


        <div className="w-1/3 flex items-center ml-12">
          <div className="flex items-center">
            <img src={logoImg} alt="Elantris Technologies Logo" className="h-10 object-contain" />
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-6">



          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2 cursor-pointer group relative hover:opacity-80 transition-opacity"
              onClick={() => setIsEditModalOpen(true)}
            >
              <div className="w-9 h-9 bg-white text-[#5A725A] rounded-full flex items-center justify-center font-bold uppercase shadow-sm overflow-hidden border-2 border-white">
                {hrUser.profileImage ? (
                  <img src={hrUser.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  hrUser.name.charAt(0)
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white leading-tight uppercase">{hrUser.name}</span>
                <span className="text-[10px] font-medium text-gray-200 uppercase tracking-widest">HR Administrator</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Edit Profile Modal (Sidebar) */}
      {isEditModalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-transparent flex justify-end" onClick={() => setIsEditModalOpen(false)}>
            <div className="bg-white shadow-2xl w-[320px] h-full flex flex-col transform transition-transform duration-300 translate-x-0 border-l border-gray-100" onClick={(e) => e.stopPropagation()}>
              <div className="shrink-0 px-6 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 sticky top-0 z-10 backdrop-blur-md">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#5A725A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  HR Profile
                </h3>
                <button onClick={() => setIsEditModalOpen(false)} className="bg-white border border-gray-200 p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="flex flex-col flex-1 overflow-y-auto">
                <div className="p-6 space-y-4 flex-1">

                  {/* Profile Image Upload */}
                  <div className="flex flex-col items-center justify-center mb-5">
                    <div className="relative w-32 h-32 rounded-full border-4 border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center shadow-sm">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-300 text-5xl font-bold">{editForm.name.charAt(0) || 'M'}</span>
                      )}
                    </div>
                  </div>

                  {/* Details Layout */}
                  <div className="space-y-3">
                    <div className="flex border-b border-gray-200 pb-3">
                      <div className="w-1/3 text-[13px] font-semibold text-gray-700">HR ID</div>
                      <div className="w-4 text-center text-gray-700 font-semibold">:</div>
                      <div className="w-2/3 text-[13px] font-bold text-gray-800 uppercase">{editForm.hrId}</div>
                    </div>

                    <div className="flex border-b border-gray-200 pb-3">
                      <div className="w-1/3 text-[13px] font-semibold text-gray-700">Full Name</div>
                      <div className="w-4 text-center text-gray-700 font-semibold">:</div>
                      <div className="w-2/3 text-[13px] font-semibold text-gray-800">{editForm.name}</div>
                    </div>

                    <div className="flex border-b border-gray-200 pb-3 items-center">
                      <div className="w-1/3 text-[13px] font-semibold text-gray-700">Phone Number</div>
                      <div className="w-4 text-center text-gray-700 font-semibold">:</div>
                      <div className="w-2/3 text-[13px] font-semibold text-gray-800">{editForm.phone || '-'}</div>
                    </div>

                    <div className="flex border-b border-gray-200 pb-3">
                      <div className="w-1/3 text-[13px] font-semibold text-gray-700">Department</div>
                      <div className="w-4 text-center text-gray-700 font-semibold">:</div>
                      <div className="w-2/3 text-[13px] font-semibold text-gray-800">HR</div>
                    </div>

                    <div className="pt-1">
                      <h4 className="text-[11px] font-black tracking-widest text-[#5A725A] mb-3 uppercase">Reporting Hierarchy</h4>

                      <div className="space-y-3">
                        <div className="flex border-b border-gray-200 pb-3 items-center">
                          <div className="w-1/3 text-[13px] font-semibold text-gray-700">Reporting Manager 1</div>
                          <div className="w-4 text-center text-gray-700 font-semibold">:</div>
                          <div className="w-2/3 text-[13px] font-semibold text-gray-800">{editForm.manager1 || '-'}</div>
                        </div>

                        <div className="flex border-b border-gray-200 pb-3 items-center">
                          <div className="w-1/3 text-[13px] font-semibold text-gray-700">Reporting Manager 2</div>
                          <div className="w-4 text-center text-gray-700 font-semibold">:</div>
                          <div className="w-2/3 text-[13px] font-semibold text-gray-800">{editForm.manager2 || '-'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex sticky bottom-0 bg-white border-t border-gray-100 mt-auto shrink-0 z-10">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full bg-red-50 text-red-600 py-3 border border-red-200 rounded-xl hover:bg-red-100 hover:text-red-700 hover:border-red-300 transition-all flex items-center justify-center shadow-sm font-bold gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </>
  )
}

export default HRTopbar
