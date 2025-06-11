import { FaGear, FaHospitalUser, FaHouse } from "react-icons/fa6";
import { Link, useLocation } from "react-router";

const Footer = () => {
  const location = useLocation();
  const isActive = (href: string) =>
    location.pathname === href ? "bg-gray-200" : "";

  return (
    <footer className="h-16 bottom-0 w-full flex bg-white dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700 shadow-xl z-30">
      <Link
        to="/home"
        className={`flex-1 flex flex-col items-center justify-center py-2 transition hover:bg-indigo-50 dark:hover:bg-gray-800 ${
          isActive("/home")
            ? "bg-indigo-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        <FaHouse size={24} />
        <span className="text-sm mt-1 font-semibold">ホーム</span>
      </Link>

      <Link
        to="/simulation"
        className={`flex-1 flex flex-col items-center justify-center py-2 transition hover:bg-indigo-50 dark:hover:bg-gray-800 ${
          isActive("/simulation")
            ? "bg-indigo-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        <FaHospitalUser size={24} />
        <span className="text-sm mt-1 font-semibold">診察シミュ</span>
      </Link>

      <Link
        to="/settings"
        className={`flex-1 flex flex-col items-center justify-center py-2 transition hover:bg-indigo-50 dark:hover:bg-gray-800 ${
          isActive("/settings")
            ? "bg-indigo-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        <FaGear size={24} />
        <span className="text-sm mt-1 font-semibold">設定</span>
      </Link>
    </footer>
  );
};

export default Footer;
