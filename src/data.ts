import { Product } from './types';

export const BRAND_LOGO = "https://lh3.googleusercontent.com/aida-public/AB6AXuBsnfv_9tHjv-t4iXJAuMKhvZXJ1UZVYA_7M3Kz5H6v2pYw58iHwClnFNPQOZ_9P6QGKd8X0GDIFf6YfqBj5whk1_QlzfrEitevsXZUDTXlRv6VXDOQdKQ5Gvv1--zwSWdTQAEQL_tbRJvqDRYPTL5DQiHlYfZ2E-p3SQUwsQePDRGQrYWgWmKxNVLvmf9awED7sX2C28Rl3-WB5NDh4QkcsNQX9vj830LAQhuehZmVoK3fz-paw9G9nE7zt9AMcXLyYppnLo85Iiw";

export const PRODUCTS: Product[] = [
  {
    id: "net-bra-lace-elegance",
    name: "Lace Elegance Net Bra",
    category: "Premium Bras",
    price: 899,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBrQUCd0MXB8mlOqFvUKLyeuL4ov8Cxrz1plRmTMB1aMehMS7EEHr4t1UcbM3xd0WicL4cem0q8w7-gGNsvaEZTebEpogmJRVdN8IdbrgrTt1Ugbtw_X-XTjDbTJPy0MeHDwAgH4HBBrUTFWPRhPtlGjv-0XjHgsX54lnlbiIA2Z6NRrCdozuLaMivryESOI6279b7mKHjUbIWZGVG5gXnmWcYSt4TWqoRyZqxp-dKo27qhNrNR65kbSaGYemOZR_oy_bYL41TwjjQ",
    description: "Delicate and alluring, the Lace Elegance Net Bra offers a premium feel with intricate floral lace and supportive sheer mesh. Designed for lightweight comfort and a natural silhouette, it feels completely weightless.",
    sizes: ["32B", "34B", "36B", "38B", "40B", "42B", "44B", "46B", "48B", "50B", "52B", "54B", "32C", "34C", "36C", "38C", "40C", "42C", "44C", "46C", "48C", "50C", "52C", "54C"],
    colors: [
      { name: "Blush Pink", hex: "#E8C5C8" },
      { name: "Nude Beige", hex: "#E6D3C8" },
      { name: "Classic Black", hex: "#1C1516" }
    ],
    rating: 4.8,
    reviewsCount: 124,
    features: [
      "Adjustable satin shoulder straps",
      "Premium floral embroidery detailing",
      "Underwired for the perfect lifting and shape",
      "Double-layered power mesh side wings"
    ],
    isNewArrival: true,
    isBestSeller: true
  },
  {
    id: "cotton-bra-everyday-comfort",
    name: "Everyday Comfort Cotton Bra",
    category: "Cotton Bras",
    price: 999,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDnZvReIDJQ0P3RYIYh7Xk52HjE2z7HkoNP_l9kx2W56VGkJZmPY3t30GleACrGIVIdWZFbtvsNkPC46ytMxxfdcWJQULwijTWIpLaEdttnktABJQU61Oweo_SSsP9Zj2jDz5v50QFYd0gMlvrpp50IHbuvOTa5KVzvujbElClR4A9N_4U7QoAYhx5Juf1lUw1rhdeuvbLH0TFS1eQyHQ3Glc1XogeXcUx3EJwUKlftKrYdooZms4tE5My636K7F41GvL_jcqCfBdY",
    description: "Experience breathable luxury with our Everyday Cotton Bra. Made from 100% long-staple organic cotton, it provides seamless wire-free support, making it perfect for day-long wear under any outfit.",
    sizes: ["32B", "34B", "36B", "38B", "40B", "42B", "44B", "46B", "48B", "50B", "52B", "54B", "32C", "34C", "36C", "38C", "40C", "42C", "44C", "46C", "48C", "50C", "52C", "54C", "32D", "34D", "36D", "38D", "40D", "42D", "44D", "46D", "48D", "50D", "52D", "54D"],
    colors: [
      { name: "Nude Beige", hex: "#E6D3C8" },
      { name: "Off-White", hex: "#FAF6F0" },
      { name: "Soft Grey", hex: "#B1A7A6" }
    ],
    rating: 4.9,
    reviewsCount: 248,
    features: [
      "100% Breathable Organic Long-staple Cotton",
      "Wire-free soft molded cups for ultimate comfort",
      "Wide side wings for smoothing support",
      "Three-row soft cushioned hook and eye clasp"
    ],
    isBestSeller: true
  },
  {
    id: "malai-cotton-bra",
    name: "Silken Comfort Malai Cotton Bra",
    category: "Malai Cotton Bras",
    price: 1099,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNd4MFpQntfmYoT8ongSW8_UdGJoX3T252upzPBChOkAShoCr7LH7n3W9Z42MtqC53jsZ4l7uNeNNbMds8MgZJJ42hY2w0wlZXBcCe3TtEqK4yqP92SGpKEl1bVdEN7Zxi8ieYyDZT4Y5de4SHw2urF6E6GFHIFdLT5ttoHdi00PlPdNHVRKt5CbBfi0-H5gn2szdEi2E841HsISAp2sqm9L0uRRMPPeG6b1cHLElru_gPG09A3IK2RPOrDWID5lL7QK3PzSn7b40",
    description: "Luxuriously soft and incredibly sleek, our Malai Cotton Bra features a proprietary cotton-modal blend fabric that feels like silk on the skin. It offers gentle seamless cups that remain fully invisible under tight garments.",
    sizes: ["32B", "34B", "36B", "38B", "40B", "42B", "44B", "46B", "48B", "50B", "52B", "54B", "32C", "34C", "36C", "38C", "40C", "42C", "44C", "46C", "48C", "50C", "52C", "54C"],
    colors: [
      { name: "Mocha Brown", hex: "#A38F85" },
      { name: "Nude Beige", hex: "#E6D3C8" },
      { name: "Dusty Rose", hex: "#C9A2A8" }
    ],
    rating: 4.7,
    reviewsCount: 89,
    features: [
      "Proprietary ultra-soft 'Malai' cotton-modal blend",
      "Seamless demi cups with light padding",
      "Invisible seams under lightweight clothing",
      "Removable breathable inserts"
    ]
  },
  {
    id: "midnight-teal-kaftan-abaya",
    name: "Midnight Teal Kaftan Abaya",
    category: "Kaftan Abayas",
    price: 6299,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCiP-b4YyudT11C_37CJH8t9GQkBaGT2_gkiw-WrrAKsOfwHt14RD9PCg9DC4Wf1mdgFbjLu19XcUfNnRYcxh0RbKbJiRN7avjTvZ1xPkgjPSGYGb_O65yOohFrMSUbbWp76WESnLs0fYFe-vFfIMv6D4NCkhaXppzjfbwsbIB6LXJ-gAceZS65lq0ulDKGlV5oJB8LZBqTMSLGw3dEnGUYAhobmr0F4ZEtvRMO9XmBWihFdPcYLBdEWfQk9BxucdLq0_LvNWLV6wM",
    description: "An exquisite statement of modest luxury, our Midnight Teal Kaftan Abaya is meticulously hand-tailored from premium Nidha Silk. Features premium geometric pattern embroidery along the lapels and loose flowy batwing sleeves.",
    sizes: ["S (52)", "M (54)", "L (56)", "XL (58)"],
    colors: [
      { name: "Midnight Teal", hex: "#114232" },
      { name: "Royal Blue", hex: "#1A365D" },
      { name: "Classic Black", hex: "#111111" }
    ],
    rating: 5.0,
    reviewsCount: 64,
    features: [
      "Premium imported Nidha silk fabric with a subtle sheen",
      "Intricate gold embroidery along margins",
      "Comes with a matching premium chiffon hijab",
      "Flowy batwing silhouette designed for grace and comfort"
    ],
    isNewArrival: true,
    isBestSeller: true
  },
  {
    id: "desert-rose-kaftan-abaya",
    name: "Desert Rose Kaftan Abaya",
    category: "Kaftan Abayas",
    price: 6499,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFtieTmUFTvBwnYW-6vEsp78vf74_KyOkeujItX3y50ZayXoNebqBGMp3XrchFZjoPVPy0Os2gSbRTSNHw8CFQQ8MjS52BiSBk2G-X2Kzl-bfFuqAky8Ij9Q1pPcSQ9Iuikjf-KeizZCuADx0KhPpXwxAyvAeee8sm3Algb8u1H6IhP-cCr6-ymyyBgHMqqmcFpEzBBEEla2AN7TvlcV5O6TwOh-jt3_9DWwf4x9UDcgY-h39nYohfJEmlhcg-i-uwa29ZxQIpRQk",
    description: "Infused with effortless elegance, the Desert Rose Kaftan features a beautiful, rich fuchsia-rose hue in soft Armani satin. The fluid draping of this premium garment is unmatched, providing high-fashion modest glamour.",
    sizes: ["S (52)", "M (54)", "L (56)", "XL (58)"],
    colors: [
      { name: "Desert Rose", hex: "#C75D7A" },
      { name: "Champagne", hex: "#E3C2B1" },
      { name: "Olive Green", hex: "#3A5040" }
    ],
    rating: 4.9,
    reviewsCount: 76,
    features: [
      "High-grade Armani satin fabric with lightweight density",
      "Minimalist chic design with subtle elegant drape",
      "Elasticated gather cuffs for active comfort",
      "Comes with a premium dusty rose satin hijab"
    ],
    isNewArrival: true
  },
  {
    id: "royal-kaftan-abaya",
    name: "Royal Kaftan Abaya",
    category: "Kaftan Abayas",
    price: 6299,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHmW51yko3PedY4tgR1bxO8rPKNq1F8MfElvuW0l_Q0chw7AvYSJH-NtbcspgnBW0Ua1OqwPaV-7Cak9B5Uf_fOymA59pgqB7t_CaD1lPdOvumZEDNZwd_jOfxBQQAh8tVeUEOYWJ2ngdVN3aIINIaHOCU2jQ1van_JqRCRSgGyYCK21JZ7HX6nFOEcC0kbeeXmwPc4cNOyVy4rMEwzdxRfPAOaUsMriWKQ3wMD_Yi9KFbAwDb_laGA_ts3VyOV7XEJwUa7DJsre8",
    description: "The Royal Kaftan Abaya represents absolute luxury in modestwear. It offers a majestic wide drape made from high-density Turkish Crepe, detailed with exquisite gold border patterns.",
    sizes: ["M (54)", "L (56)", "XL (58)"],
    colors: [
      { name: "Royal Teal", hex: "#1A365D" },
      { name: "Emerald Green", hex: "#114232" },
      { name: "Deep Maroon", hex: "#722F37" }
    ],
    rating: 4.8,
    reviewsCount: 42,
    features: [
      "High-density imported Turkish Crepe",
      "Gold embroidered borders along the main opening",
      "Lightweight, breathable, and wrinkle-free feel",
      "Includes premium coordinates"
    ]
  },
  {
    id: "silk-malai-abaya",
    name: "Luxury Silk Malai Abaya",
    category: "Kaftan Abayas",
    price: 6499,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDp83vB9Nib2dCR6CghWYk8HsBfjuuvsc2WFhcQJg75Cj5ZwFFBALYKrRuEEkYN7M-ibMNiczA33weHPgttyFAGoT1yP629Gf6lRKsFyM2LPyYtL_zea2LNWqXqoD8q-s1xVylCsWiSemuh-6sAy7LfkJ5BDXgnWEQPZhla_dAsE3JSUHZ4O_xPBkwjxF7ZUTk8VdF1KsY1X-3lQgD1jfnfEcXvyDf1rq0igUdwYUe2q4pmjfUpEm69RtEXUdKMFXx1EB92Y2orgJY",
    description: "An absolute masterpiece of design, this Silk Malai Abaya blends the rich touch of mulberry silk with the easy drape of cotton modal. Featuring a wide-hem cut that flows beautifully with every step.",
    sizes: ["S (52)", "M (54)", "L (56)"],
    colors: [
      { name: "Mulberry Pink", hex: "#C75D7A" },
      { name: "Desert Beige", hex: "#E6D3C8" },
      { name: "Onyx Black", hex: "#111111" }
    ],
    rating: 4.9,
    reviewsCount: 51,
    features: [
      "Premium Silk Malai blend with exceptional softness",
      "Wide bell sleeves with micro-pleat details",
      "Full floor-length drape with voluminous silhouette",
      "Includes silk-blend matching hijab"
    ],
    isNewArrival: true
  },
  {
    id: "soft-lace-net-bra",
    name: "Soft Lace Net Bra",
    category: "Premium Bras",
    price: 899,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBX66ECRWYYW860wxIgYFkCw0EHygxzHm76J6igyJSn9xEsSERlbO7D2ag7HUaO1FxvkkTRtlihwhwa524tLOvjhYtDFZ8LxLqG6WA8I_uMZvbl5o0JfmyVtFQEfNIDw4JKo3vveNQ89aEoCULAKEddnpUDRlA4-YAWI1Tk2sflAlivJKNrSwGMHZuD8ckzJoFBY20v-KSGvl0yT2Pf1YhTZ9njDKE5A6xca3Yuogvs_QRX527Rav9GxG8qhj5OCDyEHzBwocgu9pM",
    description: "The Soft Lace Net Bra features delicate rose-patterned lace over breathable elastane mesh. Designed without wires, it provides excellent custom support with its signature scalloped comfort underband.",
    sizes: ["32B", "34B", "36B", "38B", "40B", "42B", "44B", "46B", "48B", "50B", "52B", "54B", "32C", "34C", "36C", "38C", "40C", "42C", "44C", "46C", "48C", "50C", "52C", "54C"],
    colors: [
      { name: "Soft Lilac", hex: "#D6C7E8" },
      { name: "Blush Pink", hex: "#E8C5C8" },
      { name: "Nude Beige", hex: "#E6D3C8" }
    ],
    rating: 4.8,
    reviewsCount: 93,
    features: [
      "Wire-free scalloped stretch lace overlay",
      "Fully lined cups for support and comfort",
      "Three-way multiway adjustable satin straps",
      "Super breathable mesh side panels"
    ],
    isNewArrival: true
  }
];

export const WHY_CHOOSE_US = [
  {
    id: "premium-quality",
    title: "Premium Quality",
    description: "We use only the finest Egyptian cotton, Armani satin, and premium imported Nidha silk to craft our collections, ensuring a luxurious feel that lasts.",
    icon: "Sparkles"
  },
  {
    id: "comfort-style",
    title: "Comfortable & Stylish",
    description: "Our designs are carefully engineered for maximum comfort, offering wire-free flexibility and lightweight modest drapes that celebrate your style.",
    icon: "Heart"
  },
  {
    id: "multiple-colors",
    title: "Multiple Colors Available",
    description: "Express your unique personality with our rich, diverse color palette inspired by nature—from soft desert nude and blush to royal emerald and classic midnight teal.",
    icon: "Palette"
  },
  {
    id: "every-woman",
    title: "Made For Every Woman",
    description: "We embrace diversity in all shapes, sizes, and backgrounds, providing an inclusive range of sizes to ensure a perfect fit for every single woman.",
    icon: "Users"
  }
];

export const TESTIMONIALS = [
  {
    id: "test-1",
    name: "Alia R.",
    role: "Verified Buyer",
    rating: 5,
    text: "The Midnight Teal Kaftan Abaya is absolutely stunning! The fabric is incredibly soft and drapes beautifully. I wore it to an family Eid gathering and received endless compliments. The gold embroidery is pure perfection.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "test-2",
    name: "Sara K.",
    role: "Verified Buyer",
    rating: 5,
    text: "I was highly skeptical about buying bras online, but the Everyday Comfort Cotton Bra exceeded all my expectations. It is so breathable and soft, it feels like I'm wearing nothing at all! I have already ordered three more colors.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "test-3",
    name: "Zara M.",
    role: "Verified Buyer",
    rating: 4.9,
    text: "The Desert Rose Kaftan has the most elegant satin finish. It has that high-end boutique quality that you usually only find in designer wear at double the price. It washes wonderfully too! Highly recommend Women's Wardrobe.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "test-4",
    name: "Amna F.",
    role: "Verified Buyer",
    rating: 5,
    text: "The Malai Cotton Bra is an absolute lifesaver under t-shirts and fitted dresses. No seams, no lines, and no wires digging into my ribs. The nude shade matches my skin perfectly. Truly made with love and care.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
  }
];

export const FAQS = [
  {
    question: "How do I determine my size for bras and abayas?",
    answer: "We offer detailed sizing on each product. Our bras follow standard international sizing (32B - 40D). For Kaftan Abayas, size is based on length in inches (e.g., Size 54 is 54 inches from shoulder to floor). Please refer to our digital Size Guide in the Quick View for measurement steps."
  },
  {
    question: "What is your return and exchange policy?",
    answer: "We offer a hassle-free 14-day exchange or return policy for all unworn, tag-attached items. Please note that for hygiene reasons, intimate wear (bras) can only be exchanged if they are completely untried and in their original sealed packaging."
  },
  {
    question: "Is international shipping available?",
    answer: "Yes, we ship to selected destinations worldwide. Standard domestic delivery takes 2-4 business days, while international shipping usually takes 5-10 business days depending on customs and shipping options."
  },
  {
    question: "How should I care for my Kaftan Abayas?",
    answer: "Our Armani Satin and Nidha Silk Abayas are extremely delicate. We highly recommend gentle hand washing in cold water or professional dry cleaning. Always iron on the reverse side on the lowest silk setting."
  }
];
