"use client";

import { LocationCard } from "@/components/LocationCard";

export default function LocationsPage() {
  return (
    <div className="main">
      <div className="page-header">
        <h1>Venue Locations</h1>
        <p>Join us in celebrating our special day</p>
      </div>
      <div className="locations-container">
        <LocationCard
          title="Holy Matrimony"
          icon="⛪"
          venue="All Christian Fellowship Mission"
          address="Mission Maitama, Abuja, FCT"
          time="10:00 AM"
          date="Sunday, February 14, 2026"
          mapUrl="https://www.google.com/maps?q=9.0939627,7.4834106&output=embed"
        />{" "}
        <LocationCard
          title="Wedding Reception"
          icon="🎉"
          venue="Centrepoint Event Centre"
          address="Maitama, Abuja, FCT"
          time="2:00 PM"
          date="Sunday, February 14, 2026"
          mapUrl="https://www.google.com/maps?q=9.0898737,7.4816242&output=embed"
        />{" "}
      </div>{" "}
      <div className="transportation-card">
        {" "}
        <h3>Parking & Transportation</h3>{" "}
        <p>
          {" "}
          Ample parking is available at both venues. The reception venue is a 5mins drive from the church venue.{" "}
        </p>{" "}
      </div>{" "}
    </div>
  );
}
