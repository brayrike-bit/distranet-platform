export type PublicRoute = "home" | "advantage" | "network" | "parts-gopher" | "distranet-direct" | "membership" | "about";
export type StoryStep = { title: string; copy: string; signal: string; outcome: string };
export type PublicStoryContent = {
  label: string; eyebrow: string; title: string; accent: string; intro: string;
  chapterLabels: readonly [string, string];
  diagramTitle: string; diagramNote: string; steps: readonly StoryStep[];
  statement: string; statementDetail: string;
  details: readonly { title: string; copy: string }[];
  nextTitle: string; nextCopy: string; nextHref: string; nextAction: string;
};

export const PUBLIC_STORIES: Record<PublicRoute, PublicStoryContent> = {
  home: {
    label: "Distranet", eyebrow: "Independent companies. Shared ambition.",
    title: "More connected.", accent: "Still completely you.",
    intro: "The best of being independent. The strength of working together. Distranet brings 21 fluid power companies into a network they own—connecting purchasing, inventory, and digital opportunity without taking away local control.",
    chapterLabels: ["How connection works", "What the network shares"],
    diagramTitle: "A network built around its members.", diagramNote: "An illustration of the operating model—not a live inventory or territory map.",
    steps: [
      { title: "Keep your identity", copy: "Your company, your people, your customer relationships. Independence is the starting point, not something you have to trade away.", signal: "Local expertise", outcome: "The connection starts with independent businesses—not a change in ownership." },
      { title: "Connect your capabilities", copy: "A stronger purchasing position, shared availability, and digital storefronts extend what one independent business can do alone.", signal: "Collective capability", outcome: "Purchasing, inventory visibility, and commerce become shared capabilities." },
      { title: "See your contribution", copy: "A company-branded workspace brings aggregate commerce, fulfillment, and member economics into one clear view. The current preview uses illustrative data; live reporting is not yet connected.", signal: "Member visibility", outcome: "A member-specific view makes contribution easier to understand. Current reporting is illustrative." },
    ],
    statement: "The network works for the companies that own it.", statementDetail: "Not the other way around.",
    details: [
      { title: "Collective purchasing", copy: "Combine buying power for a stronger supplier conversation while keeping operating decisions local." },
      { title: "Connected commerce", copy: "Parts Gopher serves Parker demand. Distranet Direct expands access to available brands and products." },
      { title: "Shared intelligence", copy: "Understand attributed opportunity through aggregate member reporting, with definitions governed by leadership and the board." },
    ],
    nextTitle: "Find your place in the network.", nextCopy: "Explore how membership can strengthen an independent business—or open your company's member workspace.", nextHref: "/membership", nextAction: "Explore membership",
  },
  advantage: {
    label: "Collective advantage", eyebrow: "A stronger position. Not a new owner.",
    title: "Scale where it helps.", accent: "Independence where it matters.",
    intro: "Distranet coordinates the things that become more powerful together, while preserving the local expertise that makes each member valuable. The advantage is practical: purchasing, availability, commerce, and clearer evidence of contribution.",
    chapterLabels: ["Where scale helps", "Where control stays local"],
    diagramTitle: "Separate businesses. A stronger shared position.", diagramNote: "The diagram explains coordination; it does not imply a savings rate or equal financial return.",
    steps: [
      { title: "Bring demand together", copy: "Independent member demand becomes a more coordinated supplier conversation.", signal: "Member demand", outcome: "Separate purchasing needs can inform one coordinated supplier conversation." },
      { title: "Build the collective position", copy: "Distranet works on shared purchasing and network programs under the applicable terms.", signal: "Shared leverage", outcome: "Shared programs connect the businesses without centralizing their operating decisions." },
      { title: "Return value to the member", copy: "Participation and results stay attributable to the independent businesses behind the network.", signal: "Independent outcomes", outcome: "Member participation stays distinct; no equal-return or savings-rate claim is implied." },
    ],
    statement: "Being independent should not mean working in isolation.", statementDetail: "Connect the right things. Keep control of the rest.",
    details: [
      { title: "Your business stays yours", copy: "Local leadership, relationships, and operating judgment remain with each member company." },
      { title: "Strength has several forms", copy: "Better coordination can matter in purchasing, stock availability, fulfillment, and digital demand—not just in one headline number." },
      { title: "Evidence over inflated claims", copy: "Purchasing-volume and performance claims will use approved sources, periods, and definitions. We do not invent savings percentages." },
    ],
    nextTitle: "See the businesses behind the strength.", nextCopy: "Get to know the independent companies that make the network possible.", nextHref: "/network", nextAction: "Meet the network",
  },
  network: {
    label: "The member network", eyebrow: "21 companies. Many kinds of expertise.",
    title: "Local knowledge.", accent: "Connected capability.",
    intro: "Fluid power is a local business built on expertise and trust. Distranet connects that expertise across its member companies through shared purchasing, inventory visibility, and digital commerce.",
    chapterLabels: ["How members connect", "The expertise behind it"],
    diagramTitle: "A connected response, without centralized ownership.", diagramNote: "Conceptual routing only. Public company locations are not a claim of exclusive service territory.",
    steps: [
      { title: "Make availability visible", copy: "Shared inventory gives the system a view of which member has the required product in stock.", signal: "Shared availability", outcome: "Inventory visibility connects a product need with participating member stock." },
      { title: "Match the right member", copy: "Parts Gopher considers customer geography and available inventory to identify a closest in-stock member.", signal: "Closest in stock", outcome: "For Parker demand, Parts Gopher considers both stock and customer geography." },
      { title: "Keep each seller distinct", copy: "More than one member can participate in a checkout. Each remains seller of record for its allocated lines.", signal: "Accountable fulfillment", outcome: "A connected checkout does not erase the member responsible for each fulfilled line." },
    ],
    statement: "Every name here represents an independent business.", statementDetail: "And an owner of the network.",
    details: [
      { title: "Hydraulics + pneumatics", copy: "Deep product knowledge, component expertise, repair capabilities, and complete fluid power solutions." },
      { title: "Automation + control", copy: "Member capabilities span motion, controls, system engineering, and industrial automation." },
      { title: "Hose + connection", copy: "Local teams support fluid conveyance, fittings, assemblies, and the details that keep customers operating." },
    ],
    nextTitle: "Connect this network to digital demand.", nextCopy: "See how Parts Gopher routes Parker product opportunity to participating members.", nextHref: "/parts-gopher", nextAction: "Explore Parts Gopher",
  },
  "parts-gopher": {
    label: "Parts Gopher", eyebrow: "The Parker-only storefront",
    title: "Parker demand.", accent: "Member opportunity.",
    intro: "Parts Gopher is Distranet's Parker-only online storefront. Shared inventory and customer geography help route orders to the closest member with stock, while the supplying member remains the seller.",
    chapterLabels: ["From Parker demand to fulfillment", "The seller behind the sale"],
    diagramTitle: "One checkout. Clearly attributed member fulfillment.", diagramNote: "An explanation of the confirmed operating principle—not a live order or certified settlement statement.",
    steps: [
      { title: "Find a Parker product", copy: "The customer shops Parker products through the Parts Gopher storefront.", signal: "Parker-only demand", outcome: "The product scope is Parker only. Broader brand sourcing belongs to Distranet Direct." },
      { title: "Resolve availability", copy: "The system considers location and stock. A checkout can split across members when availability requires it.", signal: "Inventory + geography", outcome: "Stock and geography inform the match; one checkout can involve several members." },
      { title: "Attribute the outcome", copy: "The member supplies its allocated lines. The reporting model separates product reimbursement and the member's 50% gross-margin share.", signal: "Member economics", outcome: "Each supplying member remains seller of record for its allocated lines." },
    ],
    statement: "The storefront is digital. The expertise is local.", statementDetail: "The member stays visible behind the sale.",
    details: [
      { title: "Parker only", copy: "Parts Gopher focuses on Parker products. Multi-brand sourcing belongs to Distranet Direct." },
      { title: "Member as seller", copy: "Participating members remain sellers of record for the order lines they fulfill." },
      { title: "Aggregate member reporting", copy: "The member workspace is designed to show contribution without exposing customer identities. Live feeds and certified definitions are not connected yet." },
    ],
    nextTitle: "Need a broader sourcing path?", nextCopy: "Distranet Direct connects product needs to the brands and sources available through Distranet.", nextHref: "/distranet-direct", nextAction: "Explore Distranet Direct",
  },
  "distranet-direct": {
    label: "Distranet Direct", eyebrow: "Multi-brand sourcing access",
    title: "One product need.", accent: "More ways to source it.",
    intro: "Distranet Direct reaches beyond a single brand. It connects customers to the products and brands Distranet can access through supplier and network relationships—with a focused path from a product need to a sourcing response.",
    chapterLabels: ["From requirement to sourcing path", "What multi-brand access means"],
    diagramTitle: "A wider lens on industrial product sourcing.", diagramNote: "Brand and product availability depends on the specific supplier and network relationships involved.",
    steps: [
      { title: "Understand the requirement", copy: "Start with the part, application, or product requirement—not an assumption that one brand is the only answer.", signal: "Product need", outcome: "The requirement leads the search—not a single-brand catalog boundary." },
      { title: "Explore available paths", copy: "Consider product matches and the brands accessible through Distranet's sourcing relationships.", signal: "Multi-brand access", outcome: "Product matches depend on the brands and sources the network can access." },
      { title: "Move toward fulfillment", copy: "Resolve the available supply path and coordinate the appropriate order and fulfillment process.", signal: "Sourcing response", outcome: "The next step is a sourcing response, not a blanket promise of availability." },
    ],
    statement: "Broader sourcing. A more focused experience.", statementDetail: "Distinct from Parts Gopher's Parker-only storefront.",
    details: [
      { title: "Not limited to Parker", copy: "Distranet Direct is the multi-brand storefront, covering brands and products the organization can source." },
      { title: "One network relationship", copy: "Supplier and member-network access support the sourcing path behind the storefront." },
      { title: "Clear storefront roles", copy: "Parts Gopher and Distranet Direct serve different product scopes, under the same Distranet organization." },
    ],
    nextTitle: "Two storefronts. One member-owned network.", nextCopy: "Explore the membership model behind Distranet's shared purchasing and commerce capabilities.", nextHref: "/membership", nextAction: "Explore membership",
  },
  membership: {
    label: "Membership", eyebrow: "For independent businesses building forward",
    title: "Join the network.", accent: "Keep what makes you different.",
    intro: "Distranet is opening a new chapter. Membership brings independent fluid power companies into a member-owned organization built around collective purchasing, connected capability, and a clearer view of shared opportunity.",
    chapterLabels: ["The path to membership", "Expectations and approvals"],
    diagramTitle: "A considered relationship, not a one-click enrollment.", diagramNote: "Membership eligibility, commercial terms, and approvals are evaluated by Distranet leadership and the board.",
    steps: [
      { title: "Start a conversation", copy: "Discuss your company, capabilities, and what you want to achieve through participation.", signal: "Mutual fit", outcome: "A conversation establishes the fit before any enrollment or commitment." },
      { title: "Understand the model", copy: "Review ownership, programs, responsibilities, and the terms of membership with leadership.", signal: "Clear expectations", outcome: "Leadership review makes the terms and responsibilities explicit." },
      { title: "Build the connection", copy: "Following approval, plan the operational and reporting connections appropriate to your member company.", signal: "Practical onboarding", outcome: "Approval comes before onboarding. The website does not grant membership." },
    ],
    statement: "Built for members who want to stay independent—and go further.", statementDetail: "Your identity is an asset, not an obstacle.",
    details: [
      { title: "What does membership change?", copy: "It creates a relationship with the member-owned network. Specific participation, obligations, and commercial terms are discussed during review." },
      { title: "Who makes membership decisions?", copy: "Distranet leadership and its board guide approvals. This website is not an automatic acceptance or enrollment process." },
      { title: "Already a member?", copy: "Your branded workspace is available in the same website. The current preview uses demonstration data while authenticated reporting is prepared." },
    ],
    nextTitle: "Let's talk about what's next.", nextCopy: "Learn who owns Distranet, how it works, and why the organization is investing in a more connected future.", nextHref: "/about", nextAction: "Get to know Distranet",
  },
  about: {
    label: "About Distranet", eyebrow: "Owned by the people it is built to serve",
    title: "A shared idea.", accent: "An independent future.",
    intro: "Distranet was created by independent fluid power companies to combine their purchasing power. The member companies own the organization. Today that original idea is expanding into more connected commerce, inventory visibility, and member intelligence.",
    chapterLabels: ["The idea behind Distranet", "Ownership and governance"],
    diagramTitle: "From combined buying power to connected opportunity.", diagramNote: "The diagram describes the operating direction; it is not a dated company-history or production-integration claim.",
    steps: [
      { title: "The founding principle", copy: "Combine buying power without giving up the independence that makes each business valuable.", signal: "Member ownership", outcome: "The member companies own the organization built to serve them." },
      { title: "The connected opportunity", copy: "Extend that shared position through inventory visibility, Parts Gopher, and Distranet Direct.", signal: "Connected operations", outcome: "Shared commerce extends the original idea while keeping the storefront roles distinct." },
      { title: "The next chapter", copy: "Make contribution clearer through member-branded reporting and definitions governed by Dave Rike and the board.", signal: "Governed visibility", outcome: "Reporting definitions stay governed. The current workspace is a demonstration, not a live integration." },
    ],
    statement: "Independent strength is the point. Connection is how we amplify it.", statementDetail: "A member-owned organization, building forward.",
    details: [
      { title: "Member owned", copy: "The member companies own Distranet. Joining the network does not make a company a subsidiary of Distranet." },
      { title: "Locally operated", copy: "Each member brings its own identity, expertise, people, and customer relationships." },
      { title: "Leadership + governance", copy: "Dave Rike and the Distranet board approve metric definitions and resolve disputes. New reporting remains a build in progress." },
    ],
    nextTitle: "Meet the companies behind the idea.", nextCopy: "Explore the member network and the breadth of capabilities it brings together.", nextHref: "/network", nextAction: "Explore the network",
  },
};
