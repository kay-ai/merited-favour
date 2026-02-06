"use client"
import { useState } from "react"
import { Copy, Check, Heart } from "lucide-react"

export default function DonationsPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const accountDetails = {
    accountNumber: "0088215418",
    bankName: "Access Bank",
    accountName: "Favour Kelechi Obasi"
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="main donations-page">
      <div className="page-header">
        <h1>Gift the Couple</h1>
        <p>Your presence is our present, but if you wish to bless us</p>
      </div>

      <div className="donations-container">
        {/* Main Card */}
        <div className="donation-card">
          <div className="card-icon">
            <Heart size={48} />
          </div>
          
          <h2 className="card-title">Send a Monetary Gift</h2>
          <p className="card-description">
            Your love and support mean the world to us. If you would like to give a monetary gift, 
            you can send it directly to our account below.
          </p>

          <div className="account-details">
            {/* Account Number */}
            <div className="detail-row">
              <div className="detail-content">
                <label className="detail-label">Account Number</label>
                <p className="detail-value">{accountDetails.accountNumber}</p>
              </div>
              <button 
                className="copy-btn"
                onClick={() => copyToClipboard(accountDetails.accountNumber, 'account')}
                title="Copy account number"
              >
                {copiedField === 'account' ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>

            {/* Bank Name */}
            <div className="detail-row">
              <div className="detail-content">
                <label className="detail-label">Bank Name</label>
                <p className="detail-value">{accountDetails.bankName}</p>
              </div>
              <button 
                className="copy-btn"
                onClick={() => copyToClipboard(accountDetails.bankName, 'bank')}
                title="Copy bank name"
              >
                {copiedField === 'bank' ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>

            {/* Account Name */}
            <div className="detail-row">
              <div className="detail-content">
                <label className="detail-label">Account Name</label>
                <p className="detail-value">{accountDetails.accountName}</p>
              </div>
              <button 
                className="copy-btn"
                onClick={() => copyToClipboard(accountDetails.accountName, 'name')}
                title="Copy account name"
              >
                {copiedField === 'name' ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>

          <div className="thank-you-note">
            <p>
              Thank you for celebrating with us and for your generous gift. 
              Your love and support mean everything as we begin this new chapter together.
            </p>
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="info-cards">
          <div className="info-card">
            <div className="info-icon">🎁</div>
            <h3>Physical Gifts</h3>
            <p>If you prefer to give a physical gift, please feel free to bring it to the reception.</p>
          </div>

          <div className="info-card">
            <div className="info-icon">💐</div>
            <h3>Your Presence</h3>
            <p>Remember, your presence at our wedding is the greatest gift we could receive.</p>
          </div>
        </div>
      </div>
    </div>
  )
}