import { MapPin, Clock, Calendar } from "lucide-react"

export function LocationCard({ 
  title, 
  icon, 
  venue, 
  address, 
  time, 
  date, 
  mapUrl 
}: { 
  title: string
  icon: string
  venue: string
  address: string
  time: string
  date: string
  mapUrl: string
}) {
  return (
    <div className="location-card">
      <div className="card-content">
        <h3 className="location-title">
          <span className="icon">{icon}</span>
          {title}
        </h3>
        
        <div className="location-details">
          <div className="detail-item">
            <MapPin size={18} />
            <div>
              <p className="detail-label">Venue</p>
              <p className="detail-value">{venue}</p>
              <p className="detail-address">{address}</p>
            </div>
          </div>
          
          <div className="detail-row">
            <div className="detail-item">
              <Clock size={18} />
              <div>
                <p className="detail-label">Time</p>
                <p className="detail-value">{time}</p>
              </div>
            </div>
            
            <div className="detail-item">
              <Calendar size={18} />
              <div>
                <p className="detail-label">Date</p>
                <p className="detail-value">{date}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="map-container">
          <iframe 
            src={mapUrl}
            width="100%" 
            height="100%" 
            style={{ border: 0, borderRadius: '12px' }}
            allowFullScreen
            loading="lazy"
            title={`Map to ${venue}`}
          />
        </div>
      </div>
    </div>
  )
}