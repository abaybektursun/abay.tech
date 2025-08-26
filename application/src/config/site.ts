/**
 * Site configuration
 */
export const siteConfig = {
  name: "Abay Bektursun",
  description: "Portfolio and Blog",
  url: "https://abay.tech",
  ogImage: "/DSC07673.jpg",
  gaId: "G-Z50F6SX483",
  defaultLocale: "en",
}

/**
 * Color and animation configurations
 */
export const themeConfig = {
  colors: {
    background: "bg-white",
    text: "text-gray-700",
    primary: "text-gray-900",
    secondary: "text-gray-600",
    accent: "linear-gradient(to right, #000000, #434343)",
  },
  animations: {
    underline: {
      type: "spring",
      stiffness: 400,
      damping: 40
    },
    hover: {
      duration: 0.2,
    },
    logoEffect: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}