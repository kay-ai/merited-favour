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
          title="Wedding Ceremony"
          icon="⛪"
          venue="All Christian Fellowship Mission"
          address="Mission Maitama, Abuja, FCT"
          time="10:00 AM"
          date="Sunday, February 14, 2026"
          mapUrl="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3939.5739388899673!2d7.4892!3d9.0819!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMDQnNTQuOCJOIDfCsDI5JzIxLjEiRQ!5e0!3m2!1sen!2sng!4v1234567890"
        />{" "}
        <LocationCard
          title="Wedding Reception"
          icon="🎉"
          venue="Centrepoint Event Centre"
          address="Maitama, Abuja, FCT"
          time="2:00 PM"
          date="Sunday, February 14, 2026"
          mapUrl="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3939.5739388899673!2d7.4892!3d9.0819!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMDQnNTQuOCJOIDfCsDI5JzIxLjEiRQ!5e0!3m2!1sen!2sng!4v1234567890"
        />{" "}
      </div>{" "}
      <div className="transportation-card">
        {" "}
        <h3>Parking & Transportation</h3>{" "}
        <p>
          {" "}
          Ample parking is available at both venues. For those requiring
          transportation, shuttle services will be available between the
          ceremony and reception venues.{" "}
        </p>{" "}
      </div>{" "}
    </div>
  );
}
