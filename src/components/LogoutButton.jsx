import { useNavigate } from "react-router-dom";
import Button from "./ui/Button.jsx";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("cid");
    localStorage.removeItem("customerId");
    navigate("/login", { replace: true });
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout}>
      Logout
    </Button>
  );
}
