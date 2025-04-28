import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const Home = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="h-screen flex items-center justify-center text-xl font-semibold">
      <p>Welcome, {user?.name}!</p>
    </div>
  );
};

export default Home;
