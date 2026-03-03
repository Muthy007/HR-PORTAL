import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"

function LoginHR() {

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    setAnimate(true)
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    setTimeout(() => {
      setLoading(false)
      const storedData = localStorage.getItem("hr_credentials")

      if (storedData) {
        const credentials = JSON.parse(storedData)
        if (credentials.email === formData.email && credentials.password === formData.password) {
          // Store token/flag to indicate active session if needed
          localStorage.setItem("hr_logged_in", "true")
          navigate("/hr/prejoining")
        } else {
          setError("Invalid email or password")
        }
      } else {
        setError("No HR account found. Please register first.")
      }
    }, 1000)
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
            HR Portal
          </h2>

          <p className="text-center text-gray-200 mb-6">
            Authorized access only
          </p>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-2 rounded-lg mb-4 text-sm text-center">
              {error}
            </div>
          )}

          <input
            type="email"
            name="email"
            placeholder="HR Email"
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
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center mt-5 text-sm text-gray-200">
            New HR?
            <Link
              to="/hr-register"
              className="text-[#5A725A] ml-1 font-medium hover:underline"
            >
              Register
            </Link>
          </p>

        </form>

      </div>

    </div>
  )
}

export default LoginHR
