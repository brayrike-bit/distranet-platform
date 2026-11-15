/** Original marks and observed website colors, reviewed 3 Nov 2026.
 * These are website observations, not a claim of a formal brand guideline.
 * Member inclusion follows https://www.distranet.com/member-directory.php.
 */
export type MemberIdentity = {
  slug: string;
  name: string;
  shortName: string;
  website: string;
  headquarters: string;
  capabilities: readonly string[];
  primary: string;
  secondary: string;
  logo: string;
  logoSource: string;
  logoBackground: string;
  colorSource: string;
};

export const MEMBER_DIRECTORY = [
  {
    slug: "aberdeen-dynamics", name: "Aberdeen Dynamics", shortName: "Aberdeen",
    website: "https://www.aberdeendynamics.com/", headquarters: "Tulsa, Oklahoma",
    capabilities: ["Hydraulics", "Pneumatics", "Electromechanical systems"],
    primary: "#0359B2", secondary: "#003265", logo: "/brands/aberdeen-dynamics/logo.svg",
    logoSource: "https://www.aberdeendynamics.com/wp-content/uploads/2019/05/AD-Logo-white.svg",
    logoBackground: "#003265", colorSource: "https://www.aberdeendynamics.com/wp-content/themes/fire-up/css/main.css",
  },
  {
    slug: "afp-industries", name: "AFP Industries", shortName: "AFP",
    website: "https://afpind.com/", headquarters: "Richmond, Virginia",
    capabilities: ["Hydraulics", "Pneumatics", "Fabrication + repair"],
    primary: "#0762C8", secondary: "#091E3F", logo: "/brands/afp-industries/logo.png",
    logoSource: "https://afpind.com/wp-content/themes/afp-26-02-03/dist/images/logo.png?v=0.0.0.2",
    logoBackground: "#ffffff", colorSource: "https://afpind.com/",
  },
  {
    slug: "air-hydro-power", name: "Air Hydro Power", shortName: "AHP",
    website: "https://www.airhydropower.com/", headquarters: "Louisville, Kentucky",
    capabilities: ["Fluid power", "Automation", "Hose + connectors"],
    primary: "#0068AD", secondary: "#FFB94D", logo: "/brands/air-hydro-power/air-hydro-power.png",
    logoSource: "https://www.airhydropower.com/", logoBackground: "#ffffff", colorSource: "https://www.airhydropower.com/",
  },
  {
    slug: "connector-specialists", name: "Connector Specialists", shortName: "CSI",
    website: "https://www.connectorspecialists.com/", headquarters: "Mandeville, Louisiana",
    capabilities: ["Hose assemblies", "Hydraulic systems", "Pneumatics"],
    primary: "#F9C42B", secondary: "#3F3E3E", logo: "/brands/connector-specialists/logo.png",
    logoSource: "https://connectorspecialists.com/Themes/CSI/Content/images/logo.png",
    logoBackground: "#3F3E3E", colorSource: "https://www.connectorspecialists.com/",
  },
  {
    slug: "depatie-fluid-power", name: "Depatie Fluid Power", shortName: "Depatie",
    website: "https://www.depatie.com/", headquarters: "Portage, Michigan",
    capabilities: ["Fluid power", "System design", "Component repair"],
    primary: "#FCB813", secondary: "#565962", logo: "/brands/depatie-fluid-power/logo.svg",
    logoSource: "https://www.depatie.com/site/assets/new-logo-horizontal.svg",
    logoBackground: "#ffffff", colorSource: "https://www.depatie.com/site/assets/new-logo-horizontal.svg",
  },
  {
    slug: "exotic-automation", name: "Exotic Automation & Supply", shortName: "Exotic",
    website: "https://exoticautomation.com/", headquarters: "New Hudson, Michigan",
    capabilities: ["Fluid power", "Automation", "Compressed air"],
    primary: "#184894", secondary: "#FFAB14", logo: "/brands/exotic-automation/logo.png",
    logoSource: "https://exoticautomation.com/wp-content/uploads/2026/08/Exotic-Automation-Logo-Full-Color-White-Outline.png",
    logoBackground: "#ffffff", colorSource: "https://exoticautomation.com/wp-content/uploads/elementor/css/post-15.css",
  },
  {
    slug: "the-hope-group", name: "The Hope Group", shortName: "Hope Group",
    website: "https://www.thehopegroup.com/", headquarters: "Northborough, Massachusetts",
    capabilities: ["Hydraulic systems", "Automation + controls", "Compressed air service"],
    primary: "#069A76", secondary: "#8B9A92", logo: "/brands/the-hope-group/logo.webp",
    logoSource: "https://www.thehopegroup.com/wp-content/uploads/2022/07/Hope-Group-Logo_horizontal.png.webp",
    logoBackground: "#ffffff", colorSource: "https://www.thehopegroup.com/",
  },
  {
    slug: "hydradyne", name: "Hydradyne", shortName: "Hydradyne",
    website: "https://www.hydradynellc.com/", headquarters: "Fort Worth, Texas",
    capabilities: ["Motion control", "Service + repair", "Custom fabrication"],
    primary: "#FFDD16", secondary: "#000000", logo: "/brands/hydradyne/logo.png",
    logoSource: "https://www.hydradynellc.com/Skins/Default/Images/logo.png",
    logoBackground: "#ffffff", colorSource: "https://www.hydradynellc.com/",
  },
  {
    slug: "hyspeco", name: "Hyspeco", shortName: "Hyspeco",
    website: "https://www.hyspeco.com/", headquarters: "Wichita, Kansas",
    capabilities: ["Fluid power", "Fabrication + assembly", "Field service"],
    primary: "#005CB9", secondary: "#FFFFFF", logo: "/brands/hyspeco/logo.png",
    logoSource: "https://www.hyspeco.com/images/thumbs/0000003_logo.png",
    logoBackground: "#ffffff", colorSource: "https://www.hyspeco.com/images/thumbs/0000003_logo.png",
  },
  {
    slug: "ifp-automation", name: "IFP Automation", shortName: "IFP",
    website: "https://ifp1.com/", headquarters: "Fishers, Indiana",
    capabilities: ["Hydraulic systems", "Control panels", "Robotics + conveyors"],
    primary: "#231F20", secondary: "#FFFFFF", logo: "/brands/ifp-automation/logo.png",
    logoSource: "https://ifp1.com/wp-content/uploads/2024/08/IFP-Logo-Inverted-removebg-preview.png",
    logoBackground: "#231F20", colorSource: "https://ifp1.com/wp-content/uploads/2024/08/IFP-Logo-Inverted-removebg-preview.png",
  },
  {
    slug: "kundinger", name: "Kundinger", shortName: "Kundinger",
    website: "https://kundinger.com/", headquarters: "Neenah, Wisconsin",
    capabilities: ["Industrial automation", "Fluid power", "Process control"],
    primary: "#00AB4E", secondary: "#231F20", logo: "/brands/kundinger/logo.svg",
    logoSource: "https://kundinger.com/wp-content/themes/kundinger/images/logo.svg",
    logoBackground: "#ffffff", colorSource: "https://kundinger.com/wp-content/themes/kundinger/images/logo.svg",
  },
  {
    slug: "mfp-automation-engineering", name: "MFP Automation Engineering", shortName: "MFP",
    website: "https://www.mifp.com/", headquarters: "Hudsonville, Michigan",
    capabilities: ["Custom manifolds", "Power units", "Automation systems"],
    primary: "#1B3B73", secondary: "#FC7C3B", logo: "/brands/mfp-automation-engineering/logo.png",
    logoSource: "https://www.mifp.com/wp-content/uploads/2024/03/hudsonville-mi-mfp-automation-engineering.png",
    logoBackground: "#1B3B73", colorSource: "https://www.mifp.com/wp-content/themes/betheme-child/style.css",
  },
  {
    slug: "mfcp", name: "Motion & Flow Control Products", shortName: "MFCP",
    website: "https://www.mfcp.com/", headquarters: "Littleton, Colorado",
    capabilities: ["Motion control", "Hose + fittings", "Filtration"],
    primary: "#134F5C", secondary: "#F18B1D", logo: "/brands/mfcp/logo.png",
    logoSource: "https://www.mfcp.com/hubfs/MFCP/Graphic%20Components/MFCP-logo-white-960.png",
    logoBackground: "#134F5C", colorSource: "https://www.mfcp.com/",
  },
  {
    slug: "ozark-fluid-power", name: "Ozark Fluid Power", shortName: "Ozark",
    website: "https://www.ozarkfluidpower.com/", headquarters: "Mabelvale, Arkansas",
    capabilities: ["Hydraulics", "Pneumatics", "Fluid power products"],
    primary: "#4D6B48", secondary: "#B2B6B7", logo: "/brands/ozark-fluid-power/logo.png",
    logoSource: "https://www.ozarkfluidpower.com/OzarkLogo.png",
    logoBackground: "#ffffff", colorSource: "https://www.ozarkfluidpower.com/OzarkLogo.png",
  },
  {
    slug: "progressive-hydraulics", name: "Progressive Hydraulics", shortName: "PHI",
    website: "https://www.phionline.com/", headquarters: "Saddle Brook, New Jersey",
    capabilities: ["Hydraulics", "Pneumatics", "Hose + fittings"],
    primary: "#FFDE00", secondary: "#231F20", logo: "/brands/progressive-hydraulics/logo.png",
    logoSource: "https://www.phionline.com/skins/mainstore/images/logo.png",
    logoBackground: "#ffffff", colorSource: "https://www.phionline.com/skins/mainstore/images/logo.png",
  },
  {
    slug: "rg-group", name: "RG Group", shortName: "RG Group",
    website: "https://www.rg-group.com/", headquarters: "York, Pennsylvania",
    capabilities: ["Motion control", "Fluid handling", "Automation + robotics"],
    primary: "#0E9761", secondary: "#231F20", logo: "/brands/rg-group/logo.png",
    logoSource: "https://www.rg-group.com/wp-content/uploads/2022/10/RG-Group_logo_with-tagline.png",
    logoBackground: "#ffffff", colorSource: "https://www.rg-group.com/wp-content/uploads/2022/10/RG-Group_logo_with-tagline.png",
  },
  {
    slug: "southern-fluid-power", name: "Southern Fluid Power", shortName: "SFP",
    website: "https://site.shopsfp.com/", headquarters: "Chattanooga, Tennessee",
    capabilities: ["Automation", "Fluid connectors", "Condition monitoring"],
    primary: "#FAA21A", secondary: "#080605", logo: "/brands/southern-fluid-power/logo.png",
    logoSource: "https://site.shopsfp.com/media/pictures/layout/sfp-logo.png",
    logoBackground: "#ffffff", colorSource: "https://site.shopsfp.com/media/pictures/layout/sfp-logo.png",
  },
  {
    slug: "triad-technologies", name: "Triad Technologies", shortName: "Triad",
    website: "https://www.triadtechnologies.com/", headquarters: "Vandalia, Ohio",
    capabilities: ["Fluid power", "Automation", "Fluid conveyance"],
    primary: "#E06F26", secondary: "#323232", logo: "/brands/triad-technologies/logo.png",
    logoSource: "https://www.triadtechnologies.com/media/logo/stores/1/traidlogo.png",
    logoBackground: "#ffffff", colorSource: "https://www.triadtechnologies.com/",
  },
  {
    slug: "wainbee", name: "Wainbee", shortName: "Wainbee",
    website: "https://www.wainbee.com/", headquarters: "Mississauga, Ontario",
    capabilities: ["Motion + control", "Filtration", "Industrial automation"],
    primary: "#FF671D", secondary: "#231F20", logo: "/brands/wainbee/logo.svg",
    logoSource: "https://www.wainbee.com/static/frontend/Wainbee/default/en_CA/images/theme/logo-wainbee.svg",
    logoBackground: "#ffffff", colorSource: "https://www.wainbee.com/static/frontend/Wainbee/default/en_CA/images/theme/logo-wainbee.svg",
  },
  {
    slug: "western-integrated-technologies", name: "Western Integrated Technologies", shortName: "WIT",
    website: "https://www.westernintech.com/", headquarters: "Kent, Washington",
    capabilities: ["System engineering", "Hydraulic repairs", "Hose assemblies"],
    primary: "#0F79BF", secondary: "#1963AB", logo: "/brands/western-integrated-technologies/logo.png",
    logoSource: "https://www.westernintech.com/wp-content/uploads/2025/02/WIT-Full-Logo-Transparent-1-1024x260.png",
    logoBackground: "#ffffff", colorSource: "https://www.westernintech.com/",
  },
  {
    slug: "wilson-company", name: "Wilson Company", shortName: "Wilson",
    website: "https://www.wilson-company.com/", headquarters: "Addison, Texas",
    capabilities: ["Hydraulics", "Pneumatics", "Fluid connectors"],
    primary: "#336FB4", secondary: "#002B5C", logo: "/brands/wilson-company/logo.png",
    logoSource: "https://www.wilson-company.com/Skins/wilson/Images/Wilson_Company_Logo.png",
    logoBackground: "#002B5C", colorSource: "https://www.wilson-company.com/skins/wilson/css/wilson.css",
  },
] as const satisfies readonly MemberIdentity[];

export type VerifiedMemberSlug = typeof MEMBER_DIRECTORY[number]["slug"];
