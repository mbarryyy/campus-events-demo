function Footer() {
  return (
    <footer style={styles.footer}>
      <p style={styles.text}>CampusEvents &copy; 2026 &mdash; Built for CS732 Tech Tutorial</p>
    </footer>
  );
}

const styles = {
  footer: {
    textAlign: 'center',
    padding: '24px',
    marginTop: 'auto',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  text: {
    margin: 0,
    fontSize: '0.85rem',
    color: '#94a3b8',
    fontWeight: 400,
  },
};

export default Footer;
