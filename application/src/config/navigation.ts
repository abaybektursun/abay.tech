/**
 * Navigation configuration
 */
export const navigationConfig = {
  main: [
    { 
      title: "About", 
      href: "/",
    },
    { 
      title: "Posts", 
      href: "/posts",
    },
    { 
      title: "Portfolio", 
      href: "/portfolio",
      highlight: true, // Used for the special animation effect
    },
    { 
      title: "Testimonials", 
      href: "/testimonials",
      isHidden: true, // This link is conditionally shown when hovering over Portfolio
    },
    { 
      title: "Bucket List", 
      href: "/bucket-list",
      isExternal: false,
    },
    {
      title: "Voice Journal",
      href: "/voice-journal",
      isExternal: false,
    }
  ],
  // Can add additional navigation groups here (footer, social, etc.)
}