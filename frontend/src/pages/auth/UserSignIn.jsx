import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

export default function UserSignin() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post("http://localhost:3000/api/auth/user/login", {
        email: e.target.email.value,
        password: e.target.password.value,
      }, { withCredentials: true });

      console.log(response.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">User Login</h2>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="email" type="email" placeholder="Email" required className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-200" />
          <input name="password" type="password" placeholder="Password" required className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-200" />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Login</button>
        </form>
        <p className="text-center text-sm mt-4">
          New User? <a href="/user/register" className="text-blue-600 font-medium">Register</a>
        </p>
      </div>
    </div>
  );
}
