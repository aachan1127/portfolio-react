import "./AdminButton.css";

function AdminButton({ children, onClick, type = "button", ...props }) {
  return (
    <button
      className="adminButton"
      type={type}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export default AdminButton;
