"use client"
import { useState } from "react"

interface CeremonyEvent {
  id: number
  title: string
  subItems?: string[]
}

interface CeremonySection {
  section: string
  title: string
  events: CeremonyEvent[]
  color: string
  fruitEmoji: string
}

export default function CeremonyPage() {
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null)

  const ceremonyData: CeremonySection[] = [
    {
      section: "A",
      title: "Opening",
      color: "#8b957b",
      fruitEmoji: "🌸",
      events: [
        { id: 1, title: "Arrival of Guests" },
        { id: 2, title: "Opening Prayer" },
        { id: 3, title: "Introduction of Guests" },
        { id: 4, title: "Groom's Parents Entrance" },
        { id: 5, title: "Bride's Parents Entrance" },
        { id: 6, title: "Groom's Entrance" },
        { id: 7, title: "Bride's Entrance", subItems: ["Greets guests", "Changes outfit"] },
        { id: 8, title: "Chairman's Opening Speech" },
        { 
          id: 9, 
          title: "Breaking of Kola", 
          subItems: ["Presentation of kola", "Blessing and sharing"] 
        },
      ]
    },
    {
      section: "B",
      title: "Wine Carrying",
      color: "#c4a574",
      fruitEmoji: "🍇",
      events: [
        { 
          id: 10, 
          title: "Bride's 2nd Entrance", 
          subItems: [
            "Maidens and bride dance in together",
            "Bride dances to her father",
            "Her father gives her the wine cup with wine",
            "Groom is already seated"
          ] 
        },
        { 
          id: 11, 
          title: "Wine Carrying & Acceptance", 
          subItems: [
            "Bride searches for groom",
            "Bride presents wine",
            "Groom drinks and replaces with money",
            "Couple dances to Elders",
            "Elders confirm marriage"
          ] 
        },
      ]
    },
    {
      section: "C",
      title: "Celebration Program",
      color: "#d4a5a5",
      fruitEmoji: "🎉",
      events: [
        { id: 12, title: "Cutting of Cake" },
        { id: 13, title: "Toast by Best Man" },
        { id: 14, title: "Couple First Dance" },
        { id: 15, title: "Mother & Son Dance" },
        { id: 16, title: "Father & Daughter Dance" },
        { id: 17, title: "Bouquet Toss" },
        { id: 18, title: "Couple Games" },
        { id: 19, title: "Gift Presentation" },
      ]
    },
    {
      section: "D",
      title: "Closing",
      color: "#a0ab8f",
      fruitEmoji: "🌿",
      events: [
        { id: 20, title: "Vote of Thanks" },
        { id: 21, title: "Closing Prayer" },
      ]
    }
  ]

  const toggleEvent = (id: number) => {
    setExpandedEvent(expandedEvent === id ? null : id)
  }

  return (
    <div className="main ceremony-page">
      <div className="page-header">
        <h1>Order of Ceremony</h1>
        <p>Follow the journey of our special day</p>
      </div>

      <div className="tree-container">
        {/* Branches with fruits */}
        <div className="branches-container">
          {ceremonyData.map((section) => (
            <div key={section.section} className="branch-section">
              <div className="branch">
                <div className="branch-line">
                  <div 
                    className="section-badge"
                    style={{ color: section.color }}
                  >
                    {section.title}
                  </div>
                </div>
                <div className="fruits-container">
                  {section.events.map((event) => (
                    <div
                      key={event.id}
                      className="fruit"
                      onClick={() => event.subItems && toggleEvent(event.id)}
                    >
                      <div
                        className="fruit-item"
                        data-emoji={section.fruitEmoji}
                        style={{ borderTopColor: section.color }}
                      >
                        <div className="fruit-title">
                          <span className="fruit-number">{event.id}</span>
                          {event.title}
                        </div>
                        {event.subItems && expandedEvent === event.id && (
                          <div className="fruit-details">
                            <ul>
                              {event.subItems.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tree Trunk */}
        <div className="tree-trunk"></div>
      </div>
    </div>
  )
}