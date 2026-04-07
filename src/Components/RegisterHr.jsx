import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { API_BASE_URL } from "../assets/connection"

function RegisterHR() {

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    setAnimate(true)
  }, [])

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'phone') {
        value = value.replace(/[^0-9]/g, '');
    }
    setFormData({
      ...formData,
      [e.target.name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE_URL}/api/EmployeeMaster/HRRegister`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "*/*"
        },
        body: JSON.stringify({
          hrName: formData.name,
          email: formData.email,
          phoneNumber: formData.phone,
          password: formData.password
        })
      });

      if (response.ok) {
        setLoading(false)
        navigate("/")
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.message || "Registration failed")
        setLoading(false)
      }
    } catch (err) {
      console.error(err)
      setError("Network error. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center 
    bg-gradient-to-br from-[#5A725A] via-green-900 to-black px-4">

      <div
        className={`bg-white/10 backdrop-blur-lg border border-white/20
        rounded-2xl shadow-2xl w-full max-w-md
        transition-all duration-700 ease-out
        ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >

        <form
          onSubmit={handleSubmit}
          className="p-8 flex flex-col justify-center"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-1">
            Create HR Account
          </h2>

          <p className="text-center text-gray-200 mb-6">
            HR access registration
          </p>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-2 rounded-lg mb-4 text-sm text-center">
              {error}
            </div>
          )}

          <input
            type="text"
            name="name"
            placeholder="HR Name"
            onChange={handleChange}
            required
            className="w-full mb-3 px-4 py-2 bg-white/20 text-white placeholder-gray-200
            border border-white/30 rounded-lg
            focus:ring-2 focus:ring-[#5A725A] focus:outline-none transition"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            onChange={handleChange}
            required
            className="w-full mb-3 px-4 py-2 bg-white/20 text-white placeholder-gray-200
            border border-white/30 rounded-lg
            focus:ring-2 focus:ring-[#5A725A] focus:outline-none transition"
          />

          <input
            type="tel"
            name="phone"
            value={formData.phone}
            placeholder="Phone Number"
            onChange={handleChange}
            required
            className="w-full mb-3 px-4 py-2 bg-white/20 text-white placeholder-gray-200
            border border-white/30 rounded-lg
            focus:ring-2 focus:ring-[#5A725A] focus:outline-none transition"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full mb-4 px-4 py-2 bg-white/20 text-white placeholder-gray-200
            border border-white/30 rounded-lg
            focus:ring-2 focus:ring-[#5A725A] focus:outline-none transition"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#488f48] text-white py-2 rounded-lg font-semibold
              hover:bg-[#4a5f4a] hover:shadow-lg hover:-translate-y-0.5
              transition-all duration-300 disabled:opacity-60"
          >
            {loading ? "Registering..." : "Register"}
          </button>

          <p className="text-center mt-5 text-sm text-gray-200">
            Already HR?
            <Link
              to="/"
              className="text-[#5A725A] ml-1 font-medium hover:underline"
            >
              Login
            </Link>
          </p>

        </form>

      </div>

    </div>
  )
}

export default RegisterHR
