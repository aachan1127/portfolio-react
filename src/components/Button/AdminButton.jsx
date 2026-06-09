import "./AdminButton.css";

function AdminButton({ children, onClick, type = "button" }) {
  return (
    <button className="adminButton" type={type} onClick={onClick}>
      {children}
    </button>
  );
}

export default AdminButton;
