import NavbarTop from "./Navbar/NavbarTop";
import NavbarMain from "./Navbar/NavbarMain";

export default function Navbar() {
  return (
    <header className="w-full flex flex-col">
      <NavbarTop />
      <NavbarMain />
    </header>
  );
}
