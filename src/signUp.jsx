import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

//   const handleSignUp = async (e) => {
//     e.preventDefault();
//     setIsLoading(true); // Set loading to true when the signup process starts
//     try {
//       const response = await axios.post("http://127.0.0.1:5001/api/auth/user", formData);
//       localStorage.setItem("token", response.data.token);
//       navigate("/user-dashboard");
//     } catch (error) {
//       console.error("Signup failed", error);
//     } finally {
//       setIsLoading(false); // Set loading to false when the signup process ends
//     }
//   };

const handleSignUp = async (e) => {
  e.preventDefault();
  setIsLoading(true); // Set loading to true when the signup process starts
  try {
    const response = await axios.post("http://127.0.0.1:5001/api/auth/user", formData);

    // Store token and user info in localStorage after successful signup
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    // Redirect to user dashboard after successful signup
    navigate("/user-dashboard");
  } catch (error) {
    console.error("Signup failed", error);
  } finally {
    setIsLoading(false); // Set loading to false when the signup process ends
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-700">Sign Up</h2>
        <form className="mt-4" onSubmit={handleSignUp}>
          <div className="mb-4">
            <label className="block text-gray-600">Full Name</label>
            <input
              type="text"
              name="fullname"
              className="w-full p-2 border rounded"
              value={formData.fullname}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-600">Username</label>
            <input
              type="text"
              name="username"
              className="w-full p-2 border rounded"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              className="w-full p-2 border rounded"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-600">Password</label>
            <input
              type="password"
              name="password"
              className="w-full p-2 border rounded"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-600">Phone</label>
            <input
              type="text"
              name="phone"
              className="w-full p-2 border rounded"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-600">Address</label>
            <input
              type="text"
              name="address"
              className="w-full p-2 border rounded"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            className="w-full p-2 text-white bg-green-500 rounded hover:bg-green-600"
            disabled={isLoading} // Disable button while loading
          >
            {isLoading ? (
              <span className="flex justify-center">
                <div className="w-5 h-5 border-4 border-t-transparent border-green-600 rounded-full animate-spin"></div> {/* Loading spinner */}
              </span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-blue-500 hover:text-blue-600">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
