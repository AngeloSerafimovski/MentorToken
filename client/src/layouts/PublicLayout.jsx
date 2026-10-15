import { Outlet } from "react-router-dom";
import Header from "../components/landing/Header/Header";
import Footer from "../components/landing/Footer/Footer";

const PublicLayout = () => {
  return (
    <>
      <Header />

      <main>
        <Outlet />
      </main>

      <Footer />
    </>
  );
};

export default PublicLayout;
