import styles from "./Button.module.css";

function Button(props) {
  const { type, disabled, onClick, children } = props;

  return (
    <button
      className={styles.buttonInner}
      type={type}
      disabled={false}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;
