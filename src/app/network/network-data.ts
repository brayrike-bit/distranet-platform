export type NetworkMember = {
  id: number;
  name: string;
  shortName: string;
  city: string;
  region: string;
  website: string;
  mapX: number;
  mapY: number;
};

// Dave Rike directly confirmed the current network count of 21 companies on Aug. 7, 2026.
// The identities, headquarters, and websites below remain a working roster pending
// leadership reconciliation after member consolidation; they are not a verified roster.
// Coordinates are intentionally approximate and exist only to drive the illustrative map.
export const networkMembers: NetworkMember[] = [
  { id: 1, name: "Aberdeen Dynamics LLC", shortName: "Aberdeen Dynamics", city: "Tulsa", region: "OK", website: "https://aberdeendynamics.com", mapX: 452, mapY: 355 },
  { id: 2, name: "AFP Industries Inc.", shortName: "AFP Industries", city: "Richmond", region: "VA", website: "https://www.afpind.com", mapX: 735, mapY: 306 },
  { id: 3, name: "Air Hydro Power", shortName: "Air Hydro Power", city: "Louisville", region: "KY", website: "https://airhydropower.com", mapX: 614, mapY: 310 },
  { id: 4, name: "Connector Specialists", shortName: "Connector Specialists", city: "St. Rose", region: "LA", website: "https://www.connectorspecialists.com", mapX: 555, mapY: 438 },
  { id: 5, name: "Depatie Fluid Power Company", shortName: "Depatie Fluid Power", city: "Portage", region: "MI", website: "https://www.depatie.com", mapX: 594, mapY: 234 },
  { id: 6, name: "Exotic Automation & Supply", shortName: "Exotic Automation", city: "New Hudson", region: "MI", website: "https://www.exoticautomation.com", mapX: 620, mapY: 219 },
  { id: 7, name: "Hope Group", shortName: "Hope Group", city: "Northborough", region: "MA", website: "https://hopedirect.com", mapX: 836, mapY: 206 },
  { id: 8, name: "Hydradyne LLC", shortName: "Hydradyne", city: "Fort Worth", region: "TX", website: "https://www.hydradynellc.com", mapX: 446, mapY: 442 },
  { id: 9, name: "Hyspeco Inc.", shortName: "Hyspeco", city: "Springfield", region: "MO", website: "https://www.hyspeco.com", mapX: 488, mapY: 326 },
  { id: 10, name: "IFP Automation", shortName: "IFP Automation", city: "Fort Wayne", region: "IN", website: "https://ifp1.com", mapX: 615, mapY: 264 },
  { id: 11, name: "Kundinger Fluid Power Inc.", shortName: "Kundinger Fluid Power", city: "Neenah", region: "WI", website: "https://kundinger.com", mapX: 550, mapY: 203 },
  { id: 12, name: "MFP Automation Engineering", shortName: "MFP Automation", city: "Hudsonville", region: "MI", website: "https://www.mifp.com", mapX: 596, mapY: 218 },
  { id: 13, name: "Motion & Flow Control Products", shortName: "MFCP", city: "Littleton", region: "CO", website: "https://www.mfcpinc.com", mapX: 330, mapY: 314 },
  { id: 14, name: "Ozark Fluid Power Inc.", shortName: "Ozark Fluid Power", city: "Mabelvale", region: "AR", website: "https://www.ozarkfluidpower.com", mapX: 500, mapY: 382 },
  { id: 15, name: "Progressive Hydraulics Inc.", shortName: "Progressive Hydraulics", city: "Saddle Brook", region: "NJ", website: "https://www.phionline.com", mapX: 801, mapY: 257 },
  { id: 16, name: "RG Group", shortName: "RG Group", city: "York", region: "PA", website: "https://www.rg-group.com", mapX: 753, mapY: 259 },
  { id: 17, name: "Southern Fluid Power", shortName: "Southern Fluid Power", city: "Chattanooga", region: "TN", website: "https://www.southernfp.com", mapX: 620, mapY: 361 },
  { id: 18, name: "Triad Technologies LLC", shortName: "Triad Technologies", city: "Vandalia", region: "OH", website: "https://www.triadtechnologies.com", mapX: 660, mapY: 274 },
  { id: 19, name: "Wainbee Limited", shortName: "Wainbee", city: "Mississauga", region: "ON", website: "https://www.wainbee.com", mapX: 667, mapY: 160 },
  { id: 20, name: "Western Integrated Technologies", shortName: "Western Integrated", city: "Kent", region: "WA", website: "https://www.westernintech.com", mapX: 144, mapY: 190 },
  { id: 21, name: "Wilson Company", shortName: "Wilson Company", city: "Addison", region: "TX", website: "https://www.wilson-company.com", mapX: 451, mapY: 423 },
];
