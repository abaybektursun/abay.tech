import Image from 'next/image'

const CompanyLogos = () => {
  const logos = [
    { src: '/logos/Hewlett_Packard_Enterprise_logo.svg.png', alt: 'HPE Logo' },
    { src: '/logos/Apple_logo_black.svg.png', alt: 'Apple Logo' },
    { src: '/logos/university-of-cambridge.png', alt: 'Cambridge University Logo' },
    { src: '/logos/colombia_logo.png', alt: 'Colombia Logo' }
  ]

  return (
    <div className="flex gap-4 mt-6">
      {logos.map((logo) => (
        <Image
          key={logo.alt}
          src={logo.src}
          alt={logo.alt}
          height={40}
          width={160}
          className="h-8 w-auto"
        />
      ))}
    </div>
  )
}

export default CompanyLogos;