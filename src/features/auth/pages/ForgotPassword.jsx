import { Link } from 'react-router-dom'
import ForgotPasswordForm from '../components/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Parolni tiklash</h2>
        <ForgotPasswordForm />
        <div className="auth-actions">
          <Link to="/login">Kirish sahifasiga qaytish</Link>
        </div>
      </div>
    </div>
  )
}
