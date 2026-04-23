import { NavLink } from "react-router-dom";

const NAV_LINKS = [
  { label: "Todos", to: "/" },
  { label: "Admin", to: "/admin" },
];

function NavBar() {
  return (
    <nav aria-label="Primary" className="flex flex-wrap gap-3">
      {NAV_LINKS.map((link) => (
        <NavLink
          className={({ isActive }) =>
            `inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] transition ${
              isActive
                ? "border-cyan-300 bg-cyan-300 text-slate-950"
                : "border-slate-700 bg-slate-950/60 text-slate-300 hover:border-slate-500 hover:text-slate-100"
            }`
          }
          end={link.to === "/"}
          key={link.to}
          to={link.to}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default NavBar;
